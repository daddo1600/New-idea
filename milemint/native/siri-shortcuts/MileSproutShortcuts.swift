import AppIntents
import Foundation
import SwiftUI

/*
 * Siri & Shortcuts (Pro): "Start my shift", "End my shift", "Miles today"
 * and "Miles this week", as App Shortcuts, so they work by voice with no
 * set-up, and in the Shortcuts app.
 *
 * Compiled into the app target (not a pod): plugins/with-siri-shortcuts.js
 * copies this file into ios/MileSprout/ at prebuild and adds it to the app's
 * sources, so Xcode's App Intents metadata extraction, which only runs on
 * the app's (or an extension's) own Swift, finds the intents and the
 * App Shortcuts. The phrases and titles are translated in
 * AppShortcuts.xcstrings and Localizable.xcstrings, next to this file.
 *
 * Nothing here opens the encrypted database or runs JavaScript:
 * - Start and end open the app and queue the request in the App Group, the
 *   same queue the Live Activity's buttons use (targets/shift-activity/
 *   _shared/ShiftActivityIntents.swift); the app acts on it at once
 *   (src/live-activity/actions.ts), with the time it was asked.
 * - Miles today / this week answer, without opening the app, from a summary
 *   the app keeps in the App Group (src/domain/shortcuts-snapshot.ts, written
 *   by modules/siri-shortcuts), already in the app's language.
 * Without Pro (the summary says), each says it's a Pro feature and does
 * nothing else.
 */

/** Keep in step with modules/siri-shortcuts/ios/SiriShortcutsModule.swift and src/domain/shortcuts-snapshot.ts. */
enum MileSproutShortcutsStore {
  static let appGroup = "group.com.milemint.app"
  static let snapshotKey = "milesprout.shortcuts.snapshot"
  static let snapshotVersion = 1

  /** As the Live Activity's queue (ShiftActivityTap and modules/live-activity): keep these in step. */
  static let pendingKey = "milesprout.liveActivity.pending"
  static let actionNotification = Notification.Name("MileSproutLiveActivityAction")

  static let openFirst: LocalizedStringResource = "Open MileSprout once, then ask again."

  static var defaults: UserDefaults {
    UserDefaults(suiteName: appGroup) ?? UserDefaults.standard
  }

  /** The summary the app wrote last; nil before the app has set up, or from a version this doesn't know. */
  static func snapshot() -> ShortcutsSnapshot? {
    guard
      let json = defaults.string(forKey: snapshotKey),
      let data = json.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(ShortcutsSnapshot.self, from: data),
      snapshot.version == snapshotVersion
    else { return nil }
    return snapshot
  }

  /** Queues "start" or "end" for the app, with the time it was asked, and tells it if it's running. */
  static func queue(_ action: String) {
    var pending = defaults.array(forKey: pendingKey) as? [[String: Any]] ?? []
    pending.append(["action": action, "at": Date().timeIntervalSince1970 * 1000])
    defaults.set(Array(pending.suffix(10)), forKey: pendingKey)
    NotificationCenter.default.post(name: actionNotification, object: nil)
  }

  /** A line the app already translated, as something Siri says. */
  static func dialog(_ text: String) -> IntentDialog {
    let resource: LocalizedStringResource = "\(text)"
    return IntentDialog(resource)
  }

  /** The phone's date, as JavaScript's toLocalIsoDate writes it (YYYY-MM-DD, local time). */
  static func isoDate(_ date: Date) -> String {
    let calendar = Calendar(identifier: .gregorian)
    let parts = calendar.dateComponents([.year, .month, .day], from: date)
    return String(format: "%04d-%02d-%02d", parts.year ?? 0, parts.month ?? 0, parts.day ?? 0)
  }

  /** The Monday of the week `date` is in, as src/domain/set-aside.ts weekStartOf. */
  static func mondayOf(_ date: Date) -> String {
    let calendar = Calendar(identifier: .gregorian)
    // 1 is Sunday: back 6 days, Monday 0, Tuesday 1…
    let back = (calendar.component(.weekday, from: date) + 5) % 7
    return isoDate(calendar.date(byAdding: .day, value: -back, to: date) ?? date)
  }
}

/** src/domain/shortcuts-snapshot.ts (fields the intents use; the rest are ignored). */
struct ShortcutsSnapshot: Decodable {
  struct Figures: Decodable {
    let drives: Int
    let distance: String
    let value: String
    let spoken: String
    let worth: String
  }

  struct Lines: Decodable {
    let today: String
    let thisWeek: String
    let proOnly: String
    let starting: String
    let ending: String
  }

  let version: Int
  let isPro: Bool
  let today: String
  let weekStart: String
  let todayFigures: Figures
  let weekFigures: Figures
  let todayEmpty: Figures
  let weekEmpty: Figures
  let text: Lines

  /** Today's figures; none yet if the summary is from an earlier day (nothing has been saved since). */
  func todayNow(_ now: Date = Date()) -> Figures {
    today == MileSproutShortcutsStore.isoDate(now) ? todayFigures : todayEmpty
  }

  /** This week's; none yet if the summary is from an earlier week. */
  func weekNow(_ now: Date = Date()) -> Figures {
    weekStart == MileSproutShortcutsStore.mondayOf(now) ? weekFigures : weekEmpty
  }
}

/** The card under Siri's answer: "This week", "38.2 mi", "Worth about £21.01". */
struct MilesSnippetView: View {
  let title: String
  let distance: String?
  let detail: String

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(title)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.secondary)
      if let distance = distance {
        Text(distance)
          .font(.system(size: 34, weight: .bold, design: .rounded))
          .monospacedDigit()
          .lineLimit(1)
          .minimumScaleFactor(0.6)
      }
      Text(detail)
        .font(distance == nil ? .body : .headline)
        .foregroundColor(distance == nil ? .primary : Color(red: 0.04, green: 0.48, blue: 0.33))
        .fixedSize(horizontal: false, vertical: true)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding()
  }
}

/** Answers for "Miles today" and "Miles this week": said, and shown as a card. */
private func milesAnswer(
  _ pick: (ShortcutsSnapshot) -> (title: String, figures: ShortcutsSnapshot.Figures)
) -> (dialog: IntentDialog, view: MilesSnippetView) {
  guard let snapshot = MileSproutShortcutsStore.snapshot() else {
    let text = String(localized: MileSproutShortcutsStore.openFirst)
    return (IntentDialog(MileSproutShortcutsStore.openFirst), MilesSnippetView(title: "MileSprout", distance: nil, detail: text))
  }
  guard snapshot.isPro else {
    return (
      MileSproutShortcutsStore.dialog(snapshot.text.proOnly),
      MilesSnippetView(title: "MileSprout Pro", distance: nil, detail: snapshot.text.proOnly)
    )
  }
  let (title, figures) = pick(snapshot)
  return (MileSproutShortcutsStore.dialog(figures.spoken), MilesSnippetView(title: title, distance: figures.distance, detail: figures.worth))
}

/** "How many miles this week in MileSprout": work distance since Monday and roughly what it's worth. */
struct MilesThisWeekIntent: AppIntent {
  static let title: LocalizedStringResource = "Miles this week"

  init() {}

  func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
    let answer = milesAnswer { snapshot in (snapshot.text.thisWeek, snapshot.weekNow()) }
    return .result(dialog: answer.dialog, view: answer.view)
  }
}

/** "How many miles today in MileSprout". */
struct MilesTodayIntent: AppIntent {
  static let title: LocalizedStringResource = "Miles today"

  init() {}

  func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
    let answer = milesAnswer { snapshot in (snapshot.text.today, snapshot.todayNow()) }
    return .result(dialog: answer.dialog, view: answer.view)
  }
}

/** "Start my shift in MileSprout": opens the app, which starts the shift as of now (and turns shift mode on). */
struct SiriStartShiftIntent: AppIntent {
  static let title: LocalizedStringResource = "Start shift"
  static let openAppWhenRun: Bool = true

  init() {}

  func perform() async throws -> some IntentResult & ProvidesDialog {
    guard let snapshot = MileSproutShortcutsStore.snapshot() else {
      return .result(dialog: IntentDialog(MileSproutShortcutsStore.openFirst))
    }
    guard snapshot.isPro else { return .result(dialog: MileSproutShortcutsStore.dialog(snapshot.text.proOnly)) }
    MileSproutShortcutsStore.queue("start")
    return .result(dialog: MileSproutShortcutsStore.dialog(snapshot.text.starting))
  }
}

/** "End my shift in MileSprout": opens the app, which ends the shift as of when it was asked. */
struct SiriEndShiftIntent: AppIntent {
  static let title: LocalizedStringResource = "End shift"
  static let openAppWhenRun: Bool = true

  init() {}

  func perform() async throws -> some IntentResult & ProvidesDialog {
    guard let snapshot = MileSproutShortcutsStore.snapshot() else {
      return .result(dialog: IntentDialog(MileSproutShortcutsStore.openFirst))
    }
    guard snapshot.isPro else { return .result(dialog: MileSproutShortcutsStore.dialog(snapshot.text.proOnly)) }
    MileSproutShortcutsStore.queue("end")
    return .result(dialog: MileSproutShortcutsStore.dialog(snapshot.text.ending))
  }
}

/**
 * The phrases Siri knows with no set-up. Every phrase names the app
 * (Apple's rule); their translations are in AppShortcuts.xcstrings, keyed by
 * the English with ${applicationName}. Settings › Siri & Shortcuts lists the
 * first of each (src/app/(tabs)/settings.tsx): keep them in step.
 */
struct MileSproutShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: SiriStartShiftIntent(),
      phrases: [
        "Start my shift in \(.applicationName)",
        "Start a shift in \(.applicationName)",
        "Start shift in \(.applicationName)",
        "\(.applicationName) start shift",
      ]
    )
    AppShortcut(
      intent: SiriEndShiftIntent(),
      phrases: [
        "End my shift in \(.applicationName)",
        "End shift in \(.applicationName)",
        "Finish my shift in \(.applicationName)",
        "\(.applicationName) end shift",
      ]
    )
    AppShortcut(
      intent: MilesThisWeekIntent(),
      phrases: [
        "How many miles this week in \(.applicationName)",
        "Miles this week in \(.applicationName)",
        "How far have I driven this week in \(.applicationName)",
        "Kilometres this week in \(.applicationName)",
      ]
    )
    AppShortcut(
      intent: MilesTodayIntent(),
      phrases: [
        "How many miles today in \(.applicationName)",
        "Miles today in \(.applicationName)",
        "How far have I driven today in \(.applicationName)",
        "Kilometres today in \(.applicationName)",
      ]
    )
  }
}
