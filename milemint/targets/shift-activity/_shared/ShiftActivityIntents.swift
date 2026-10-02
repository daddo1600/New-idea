import AppIntents
import Foundation

/*
 * The buttons on the shift's Live Activity (iOS 17+). This file is compiled
 * into both the widget extension (which draws the buttons) and the app
 * (which runs them: a LiveActivityIntent runs in the app's process, and
 * `openAppWhenRun` needs the intent in the app too).
 *
 * A button can't reach the app's JavaScript or its encrypted database
 * directly, so it only notes what was tapped, and when, in the App Group
 * the app shares with the extension, then opens the app. The app picks the
 * note up (modules/live-activity, consumeActions) as soon as it runs: at
 * once if it's already running, else as it opens. Ending a shift is then
 * the same code path as swiping the shift bar, and the end time is the
 * moment of the tap, not of unlocking the phone.
 *
 * Keep the group, key and notification name in step with
 * modules/live-activity/ios/ShiftActivityModule.swift.
 */
enum ShiftActivityTap {
  static let appGroup = "group.com.milemint.app"
  static let pendingKey = "milesprout.liveActivity.pending"
  static let notification = Notification.Name("MileSproutLiveActivityAction")

  /** Queues `action` ("end" or "notWorking") for the app, and tells it if it's running in this process. */
  static func record(_ action: String) {
    let defaults = UserDefaults(suiteName: appGroup) ?? UserDefaults.standard
    var pending = defaults.array(forKey: pendingKey) as? [[String: Any]] ?? []
    pending.append(["action": action, "at": Date().timeIntervalSince1970 * 1000])
    // A handful at most: a phone left locked all day doesn't pile up taps.
    defaults.set(Array(pending.suffix(10)), forKey: pendingKey)
    NotificationCenter.default.post(name: notification, object: nil)
  }
}

/** "End shift": ends the shift as of the tap. */
@available(iOS 17.0, *)
struct EndShiftIntent: LiveActivityIntent {
  static let title: LocalizedStringResource = "End shift"
  static let isDiscoverable: Bool = false
  static let openAppWhenRun: Bool = true

  init() {}

  func perform() async throws -> some IntentResult {
    ShiftActivityTap.record("end")
    return .result()
  }
}

/** "Not working": the drive under way isn't work; it's saved as personal, outside the shift. */
@available(iOS 17.0, *)
struct NotWorkingIntent: LiveActivityIntent {
  static let title: LocalizedStringResource = "Not working"
  static let isDiscoverable: Bool = false
  static let openAppWhenRun: Bool = true

  init() {}

  func perform() async throws -> some IntentResult {
    ShiftActivityTap.record("notWorking")
    return .result()
  }
}
