import CryptoKit
import ExpoModulesCore
import Foundation
import Security

/**
 * Encrypted backups in the user's own iCloud, so a lost or replaced iPhone
 * doesn't take the mileage log with it. There's no MileMint account and no
 * MileMint server: files go to the app's iCloud container (Documents/Backups,
 * not shown in the Files app), and the key that encrypts them lives in iCloud
 * Keychain, which Apple end-to-end encrypts and syncs to the user's new phone.
 *
 * JavaScript only ever hands plaintext to `seal` and gets plaintext back from
 * `open`; what's written to iCloud is always the sealed envelope.
 *
 * Envelope (version 1):
 *   "MMBK" | 0x01 | key id (8 bytes) | AES-GCM nonce (12) + ciphertext + tag (16)
 * The plaintext inside is the snapshot, zlib-compressed. The header is
 * authenticated too, so it can't be swapped onto another file. The key id
 * (first 8 bytes of the key's SHA-256) picks the key to open it with.
 */
public class ICloudBackupModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ICloudBackup")

    /** Signed in to iCloud (iCloud Drive on for MileMint) and the app's container is reachable. */
    AsyncFunction("isAvailable") { () -> Bool in
      return BackupFiles.containerURL() != nil
    }

    /** Whether a backup key exists here yet, and whether it's in iCloud Keychain (so it reaches a new iPhone). */
    AsyncFunction("keyInfo") { () -> [String: Bool] in
      return BackupKey.info()
    }

    /** Writes a sealed backup atomically, then keeps only the newest `keep` (names sort by date). */
    AsyncFunction("write") { (name: String, base64: String, keep: Int) async throws -> Void in
      guard let data = Data(base64Encoded: base64) else { throw failure("ERR_BACKUP_INPUT", "Not base64.") }
      try await BackupFiles.write(name: name, data: data, keep: keep)
    }

    /** Backups in iCloud, newest first, including ones from another iPhone not downloaded here yet. */
    AsyncFunction("list") { () async throws -> [[String: Any]] in
      return try await BackupFiles.entries().map { entry in
        [
          "name": entry.name,
          "modified": (entry.modified?.timeIntervalSince1970 ?? 0) * 1000,
          "size": entry.size,
        ]
      }
    }

    /** One backup's (sealed) contents, downloading it from iCloud first if needed. */
    AsyncFunction("read") { (name: String) async throws -> String in
      return try await BackupFiles.read(name: name).base64EncodedString()
    }

    /** Compresses and encrypts with the backup key (made on first use). */
    AsyncFunction("seal") { (base64: String) throws -> String in
      guard let plaintext = Data(base64Encoded: base64) else { throw failure("ERR_BACKUP_INPUT", "Not base64.") }
      return try Envelope.seal(plaintext).base64EncodedString()
    }

    /** Decrypts and decompresses a sealed backup. */
    AsyncFunction("open") { (base64: String) throws -> String in
      guard let envelope = Data(base64Encoded: base64) else { throw failure("ERR_BACKUP_DAMAGED", "Not base64.") }
      return try Envelope.open(envelope).base64EncodedString()
    }
  }
}

/** An error JavaScript sees with this `code` (see src/backup/backup.ts). */
private func failure(_ code: String, _ description: String) -> Exception {
  return Exception(name: code, description: description, code: code)
}

// MARK: - Files in iCloud

struct BackupEntry {
  let name: String
  /** Where the file is (or will be, once downloaded). */
  let url: URL
  let modified: Date?
  let size: Int
}

enum BackupFiles {
  /** Must match `com.apple.developer.ubiquity-container-identifiers` in app.json. */
  static let container = "iCloud.com.milemint.app"
  static let suffix = ".mmbk"
  /** How iOS shows a file from another device that isn't downloaded yet: ".name.icloud". */
  private static let placeholderSuffix = ".icloud"

  /**
   * The app's iCloud container, or nil when iCloud is signed out or iCloud Drive
   * is off for MileMint. The first call can take a while (iOS sets the container
   * up), so this never runs on the main thread: Expo runs these functions on a
   * background queue.
   */
  static func containerURL() -> URL? {
    guard FileManager.default.ubiquityIdentityToken != nil else { return nil }
    return FileManager.default.url(forUbiquityContainerIdentifier: container)
  }

  static func directory() throws -> URL {
    guard let root = containerURL() else {
      throw failure("ERR_ICLOUD_UNAVAILABLE", "iCloud is not available. Sign in to iCloud and turn on iCloud Drive.")
    }
    let directory = root
      .appendingPathComponent("Documents", isDirectory: true)
      .appendingPathComponent("Backups", isDirectory: true)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    return directory
  }

  /** Our own names only ("milemint-backup-….mmbk"): no paths, no hidden files. */
  static func isValidName(_ name: String) -> Bool {
    return name.hasSuffix(suffix) && !name.hasPrefix(".") && name.count <= 128
      && name.allSatisfy { $0.isASCII && ($0.isLetter || $0.isNumber || $0 == "-" || $0 == "_" || $0 == ".") }
  }

  static func write(name: String, data: Data, keep: Int) async throws {
    guard isValidName(name) else { throw failure("ERR_BACKUP_INPUT", "Bad backup name.") }
    let url = try directory().appendingPathComponent(name)
    // Atomic: a temporary file renamed into place, so iCloud never uploads half a backup.
    try coordinate(writing: url, options: .forReplacing) { target in
      try data.write(to: target, options: .atomic)
    }
    // Rolling: keep the newest few, never fewer than two, and never the one just written.
    let stale = try await entries().dropFirst(max(keep, 2))
    for entry in stale where entry.name != name {
      remove(entry)
    }
  }

  /** Every backup, newest first by name (names carry the UTC time they were made). */
  static func entries() async throws -> [BackupEntry] {
    let directory = try directory()
    var found: [String: BackupEntry] = [:]
    // iCloud's own index knows about files from other iPhones, with sizes, before they're downloaded.
    let indexed = await MetadataSearch.run(timeout: 5)
    for entry in indexed where entry.url.deletingLastPathComponent().lastPathComponent == directory.lastPathComponent {
      found[entry.name] = entry
    }
    // What's on disk covers anything written moments ago, before the index catches up.
    for entry in local(in: directory) where found[entry.name] == nil {
      found[entry.name] = entry
    }
    return found.values.sorted { $0.name > $1.name }
  }

  static func read(name: String) async throws -> Data {
    guard isValidName(name) else { throw failure("ERR_BACKUP_INPUT", "Bad backup name.") }
    let directory = try directory()
    let url = directory.appendingPathComponent(name)
    let fileManager = FileManager.default
    let placeholder = directory.appendingPathComponent(".\(name)\(placeholderSuffix)")
    if !fileManager.fileExists(atPath: url.path) && !fileManager.fileExists(atPath: placeholder.path) {
      guard try await entries().contains(where: { $0.name == name }) else {
        throw failure("ERR_BACKUP_NOT_FOUND", "That backup is no longer in iCloud.")
      }
    }
    // Made on another iPhone: ask iCloud for it and wait (up to a minute) until it's here.
    try? fileManager.startDownloadingUbiquitousItem(at: url)
    for _ in 0..<120 {
      if isDownloaded(url) { break }
      try await Task.sleep(nanoseconds: 500_000_000)
    }
    var data: Data?
    // A coordinated read also waits for iCloud to finish bringing the file down.
    try coordinate(reading: url) { target in
      data = try Data(contentsOf: target)
    }
    guard let data else { throw failure("ERR_BACKUP_NOT_FOUND", "The backup hasn't downloaded from iCloud yet.") }
    return data
  }

  private static func isDownloaded(_ url: URL) -> Bool {
    let values = try? url.resourceValues(forKeys: [.ubiquitousItemDownloadingStatusKey])
    if let status = values?.ubiquitousItemDownloadingStatus {
      // Backups are never rewritten, so any local copy is the whole file.
      return status == .current || status == .downloaded
    }
    return FileManager.default.fileExists(atPath: url.path)
  }

  private static func local(in directory: URL) -> [BackupEntry] {
    let keys: Set<URLResourceKey> = [.contentModificationDateKey, .fileSizeKey]
    // Not skipping hidden files: the ".name.icloud" placeholders are hidden.
    let urls = (try? FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: Array(keys))) ?? []
    return urls.compactMap { url in
      var name = url.lastPathComponent
      let isPlaceholder = name.hasPrefix(".") && name.hasSuffix(placeholderSuffix)
      if isPlaceholder { name = String(name.dropFirst().dropLast(placeholderSuffix.count)) }
      guard isValidName(name) else { return nil }
      let values = isPlaceholder ? nil : try? url.resourceValues(forKeys: keys)
      return BackupEntry(
        name: name,
        url: directory.appendingPathComponent(name),
        modified: values?.contentModificationDate,
        size: values?.fileSize ?? 0
      )
    }
  }

  /** Best effort: a backup that can't be deleted now is tried again after the next one. */
  private static func remove(_ entry: BackupEntry) {
    let placeholder = entry.url.deletingLastPathComponent()
      .appendingPathComponent(".\(entry.name)\(placeholderSuffix)")
    for url in [entry.url, placeholder] where FileManager.default.fileExists(atPath: url.path) {
      try? coordinate(writing: url, options: .forDeleting) { target in
        try FileManager.default.removeItem(at: target)
      }
    }
  }

  /** iCloud files must be read and written through a file coordinator, so the sync daemon sees it. */
  private static func coordinate(
    writing url: URL,
    options: NSFileCoordinator.WritingOptions,
    _ body: (URL) throws -> Void
  ) throws {
    var coordinationError: NSError?
    var bodyError: Error?
    NSFileCoordinator(filePresenter: nil).coordinate(writingItemAt: url, options: options, error: &coordinationError) {
      target in
      do { try body(target) } catch { bodyError = error }
    }
    if let error = coordinationError ?? bodyError { throw error }
  }

  private static func coordinate(reading url: URL, _ body: (URL) throws -> Void) throws {
    var coordinationError: NSError?
    var bodyError: Error?
    NSFileCoordinator(filePresenter: nil).coordinate(readingItemAt: url, options: [], error: &coordinationError) {
      target in
      do { try body(target) } catch { bodyError = error }
    }
    if let error = coordinationError ?? bodyError { throw error }
  }
}

/**
 * Asks iCloud's index which backups exist, including ones uploaded by another
 * iPhone and not downloaded here yet. NSMetadataQuery needs the main run loop.
 */
@MainActor
private final class MetadataSearch {
  private let query = NSMetadataQuery()
  private var observer: NSObjectProtocol?
  private var continuation: CheckedContinuation<[BackupEntry], Never>?

  static func run(timeout seconds: Double) async -> [BackupEntry] {
    return await MetadataSearch().gather(timeout: seconds)
  }

  private func gather(timeout seconds: Double) async -> [BackupEntry] {
    query.searchScopes = [NSMetadataQueryUbiquitousDocumentsScope]
    query.predicate = NSPredicate(format: "%K LIKE %@", NSMetadataItemFSNameKey, "*\(BackupFiles.suffix)")
    return await withCheckedContinuation { continuation in
      self.continuation = continuation
      observer = NotificationCenter.default.addObserver(
        forName: .NSMetadataQueryDidFinishGathering,
        object: query,
        queue: .main
      ) { _ in
        MainActor.assumeIsolated { self.finish() }
      }
      guard query.start() else { return finish() }
      // Offline or iCloud slow to answer: go with what's on disk.
      Task { @MainActor in
        try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
        self.finish()
      }
    }
  }

  private func finish() {
    guard let continuation else { return }
    self.continuation = nil
    query.disableUpdates()
    let entries: [BackupEntry] = query.results.compactMap { result in
      guard let item = result as? NSMetadataItem,
        let name = item.value(forAttribute: NSMetadataItemFSNameKey) as? String,
        let url = item.value(forAttribute: NSMetadataItemURLKey) as? URL,
        BackupFiles.isValidName(name)
      else { return nil }
      return BackupEntry(
        name: name,
        url: url,
        modified: item.value(forAttribute: NSMetadataItemFSContentChangeDateKey) as? Date,
        size: (item.value(forAttribute: NSMetadataItemFSSizeKey) as? NSNumber)?.intValue ?? 0
      )
    }
    query.stop()
    if let observer { NotificationCenter.default.removeObserver(observer) }
    observer = nil
    continuation.resume(returning: entries)
  }
}

// MARK: - The key, in iCloud Keychain

/**
 * 256-bit AES keys kept in the Keychain, one item per key (account = key id),
 * so two iPhones that each made a key before iCloud Keychain synced never
 * overwrite each other: every backup stays readable wherever its key is.
 *
 * Synchronizable + accessible after first unlock: iCloud Keychain carries it
 * to the user's new iPhone (end-to-end encrypted by Apple), and it's readable
 * while the phone is locked in a car mount. iOS has no API to ask whether
 * iCloud Keychain is switched on; a synchronizable item is simply kept on
 * this phone until it is. Only if iOS refuses a synchronizable item do we
 * fall back to a key that never leaves this iPhone, and say so (`keyInfo`).
 */
enum BackupKey {
  static let service = "com.milemint.backup"
  static let idLength = 8

  struct Current {
    let id: Data
    let key: SymmetricKey
    let synchronizable: Bool
  }

  private struct Stored {
    let account: String
    let synchronizable: Bool
    let created: Date
  }

  static func info() -> [String: Bool] {
    guard let best = preferred() else { return ["exists": false, "synchronizable": false] }
    return ["exists": true, "synchronizable": best.synchronizable]
  }

  /** The key new backups are sealed with; made on first use. */
  static func current() throws -> Current {
    // The oldest key in iCloud Keychain: the same one on every iPhone once synced.
    if let best = preferred(), best.synchronizable, let current = load(best) { return current }
    if let made = try? create(synchronizable: true) { return made }
    // iCloud Keychain refused it: keep a key on this iPhone only (restoring to a new one won't work).
    if let best = preferred(), let current = load(best) { return current }
    return try create(synchronizable: false)
  }

  /** The key a backup was sealed with, if this iPhone has it (yet). */
  static func find(id: Data) -> SymmetricKey? {
    guard let data = data(account: hex(id)), data.count == 32 else { return nil }
    return SymmetricKey(data: data)
  }

  private static func preferred() -> Stored? {
    return all().sorted { a, b in
      a.synchronizable != b.synchronizable ? a.synchronizable : a.created < b.created
    }.first
  }

  /** Every backup key on this iPhone, synced or not (attributes only, no key bytes). */
  private static func all() -> [Stored] {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrSynchronizable as String: kSecAttrSynchronizableAny,
      kSecMatchLimit as String: kSecMatchLimitAll,
      kSecReturnAttributes as String: true,
    ]
    var result: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
      let items = result as? [[String: Any]]
    else { return [] }
    return items.compactMap { item in
      guard let account = item[kSecAttrAccount as String] as? String else { return nil }
      return Stored(
        account: account,
        synchronizable: (item[kSecAttrSynchronizable as String] as? NSNumber)?.boolValue ?? false,
        created: item[kSecAttrCreationDate as String] as? Date ?? .distantFuture
      )
    }
  }

  private static func data(account: String) -> Data? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecAttrSynchronizable as String: kSecAttrSynchronizableAny,
      kSecMatchLimit as String: kSecMatchLimitOne,
      kSecReturnData as String: true,
    ]
    var result: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess else { return nil }
    return result as? Data
  }

  private static func load(_ stored: Stored) -> Current? {
    guard let bytes = data(account: stored.account), bytes.count == 32 else { return nil }
    return Current(id: identifier(of: bytes), key: SymmetricKey(data: bytes), synchronizable: stored.synchronizable)
  }

  private static func create(synchronizable: Bool) throws -> Current {
    let key = SymmetricKey(size: .bits256)
    let bytes = key.withUnsafeBytes { Data($0) }
    let id = identifier(of: bytes)
    let attributes: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: hex(id),
      kSecAttrLabel as String: "MileMint backup key",
      kSecValueData as String: bytes,
      kSecAttrSynchronizable as String: synchronizable,
      // Synchronizable items can't be "this device only"; both stay readable while locked.
      kSecAttrAccessible as String: synchronizable
        ? kSecAttrAccessibleAfterFirstUnlock : kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
    ]
    let status = SecItemAdd(attributes as CFDictionary, nil)
    guard status == errSecSuccess else {
      throw failure("ERR_BACKUP_KEY", "Couldn't save the backup key in the Keychain (\(status)).")
    }
    return Current(id: id, key: key, synchronizable: synchronizable)
  }

  /** First 8 bytes of the key's SHA-256: names the key without revealing it. */
  private static func identifier(of bytes: Data) -> Data {
    return Data(SHA256.hash(data: bytes).prefix(idLength))
  }

  private static func hex(_ data: Data) -> String {
    return data.map { String(format: "%02x", $0) }.joined()
  }
}

// MARK: - Sealing

enum Envelope {
  private static let magic = Data("MMBK".utf8)
  private static let version: UInt8 = 1
  private static var headerLength: Int { magic.count + 1 + BackupKey.idLength }

  static func seal(_ plaintext: Data) throws -> Data {
    let key = try BackupKey.current()
    var header = magic
    header.append(version)
    header.append(key.id)
    let compressed = try (plaintext as NSData).compressed(using: .zlib) as Data
    let box = try AES.GCM.seal(compressed, using: key.key, authenticating: header)
    guard let combined = box.combined else { throw failure("ERR_BACKUP_SEAL", "Couldn't encrypt the backup.") }
    return header + combined
  }

  static func open(_ input: Data) throws -> Data {
    let envelope = Data(input)
    // Nonce (12) and tag (16) at the least.
    guard envelope.count > headerLength + 28,
      envelope.subdata(in: 0..<magic.count) == magic,
      envelope[magic.count] == version
    else { throw failure("ERR_BACKUP_DAMAGED", "This isn't a MileMint backup, or it's damaged.") }
    let header = envelope.subdata(in: 0..<headerLength)
    let id = envelope.subdata(in: (magic.count + 1)..<headerLength)
    guard let key = BackupKey.find(id: id) else {
      throw failure(
        "ERR_BACKUP_KEY_MISSING",
        "This backup's key isn't in this iPhone's Keychain (iCloud Keychain off, or not synced yet)."
      )
    }
    do {
      let box = try AES.GCM.SealedBox(combined: envelope.subdata(in: headerLength..<envelope.count))
      let compressed = try AES.GCM.open(box, using: key, authenticating: header)
      return try (compressed as NSData).decompressed(using: .zlib) as Data
    } catch {
      throw failure("ERR_BACKUP_DAMAGED", "The backup couldn't be decrypted; it may be damaged.")
    }
  }
}
