# icloud-backup

Encrypted backups of the trip database in the user's own iCloud. No MileMint account and no MileMint server.

- `ios/ICloudBackupModule.swift`: files in the app's iCloud container (`Documents/Backups/`, not shown in the Files app), the key in iCloud Keychain, AES-256-GCM sealing (CryptoKit) with zlib compression.
- `index.ts`: the JS shim. Without the native module (web, Android, older builds) it reports "unavailable" and writes nothing.
- The snapshot, scheduling and restore live in `src/backup/`.

## How it works

1. `src/backup/backup.ts` reads every table into a versioned JSON snapshot.
2. `sealText()` takes the snapshot as text (UTF-8 encoding happens in Swift, off the JS thread; `openText()` is its inverse). Builds from before it only have `seal()`/`open()`, which take base64; `ICloudBackup.sealsText` says which, and `src/backup/backup.ts` falls back to base64 made a slice at a time. Either way it compresses and encrypts it in Swift with a 256-bit key kept in the Keychain as a **synchronizable** item (iCloud Keychain, accessible after first unlock), so the key follows the user to a new iPhone. Plaintext never touches the iCloud file.
3. `write()` puts the sealed file in iCloud atomically and keeps the newest 4.
4. On a new iPhone, `list()` finds the backups (iCloud's index knows about files not downloaded yet), `read()` downloads one, `open()` decrypts it with the synced key, and the app restores it in one database transaction.

Each key is its own Keychain item named by its id, and every backup names the key it was sealed with. If two phones each made a key before iCloud Keychain synced, both keys end up on both phones and every backup stays readable.

iOS has no API to ask whether iCloud Keychain is on. A synchronizable item saved while it's off stays on the phone until it's switched on. If iOS refuses a synchronizable item, the module falls back to a key that never leaves the phone, and Settings → Backup warns that those backups can't be restored on a new iPhone.

## Setup (once, before the first build with this module)

`app.json` declares the entitlements:

```json
"com.apple.developer.icloud-container-identifiers": ["iCloud.com.milemint.app"],
"com.apple.developer.icloud-services": ["CloudDocuments"],
"com.apple.developer.ubiquity-container-identifiers": ["iCloud.com.milemint.app"]
```

EAS Build's capability sync should turn on iCloud for the App ID `com.milemint.app`, create the container `iCloud.com.milemint.app`, link it and regenerate the provisioning profile. Check the build log for "Synced capabilities".

If it doesn't, set it up in the Apple Developer portal:

1. **Identifiers → +  → iCloud Containers**: create `iCloud.com.milemint.app`.
2. **Identifiers → com.milemint.app**: tick **iCloud** ("Include CloudKit support"), click **Configure** / **Edit** next to it and select the container `iCloud.com.milemint.app`. Save.
3. Make a new build (`npx eas-cli@latest build -p ios`). EAS regenerates the provisioning profile. If it reuses a stale one, run `npx eas-cli@latest credentials` and remove the old profile.

The synchronizable Keychain item needs no Keychain Sharing entitlement: it uses the app's default access group.

## Testing on a device

- Sign in to iCloud with iCloud Drive and iCloud Keychain on. Open Settings → Backup → **Back up now**.
- Delete the app, reinstall it, and the welcome screen offers **Restore your trips from iCloud**.
- Try a second iPhone on the same Apple Account to check the key syncs. The first restore can say the key hasn't arrived yet. That's iCloud Keychain catching up, which can take a minute.
- Simulators: iCloud Drive works when signed in, but iCloud Keychain sync isn't reliable there.
