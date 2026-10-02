import ActivityKit
import Foundation

/*
 * KEEP IN SYNC with modules/live-activity/ios/ShiftActivityAttributes.swift.
 *
 * The app (this pod) starts the Live Activity and the widget extension draws
 * it. They are separate binaries, so each compiles its own copy of this
 * type; ActivityKit pairs them by the type's name and its Codable shape. The
 * two copies must have the same name, the same fields and the same types, or
 * the lock screen shows nothing.
 *
 * Every string is ready to show: the app sends it already translated and in
 * the user's currency and distance unit (src/live-activity/model.ts).
 */
@available(iOS 16.1, *)
struct ShiftActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /** "Shift on", "Shift paused" or "Shift ended". */
    var title: String
    /** Business distance so far, e.g. "38.2 mi". */
    var distance: String
    /** Money so far, e.g. "£20.90". */
    var money: String
    /** "Waiting for your next drive", "Driving · 3.1 mi", "Paused", or the summary once ended. */
    var status: String
    /** "2h 14m", shown in place of the timer once the shift has ended. */
    var elapsed: String
    var endLabel: String
    var notWorkingLabel: String
    /** A drive is being recorded: the "Not working" button is shown. */
    var driving: Bool
    var paused: Bool
    var ended: Bool
    /** When the shift started, seconds since 1970: the timer counts up from here. */
    var startedAt: Double
  }

  /** The shift (its id in the app's database) this activity is for. */
  var shiftId: String
}
