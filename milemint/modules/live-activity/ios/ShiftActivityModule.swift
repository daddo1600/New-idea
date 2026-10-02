import ActivityKit
import ExpoModulesCore
import Foundation

/**
 * What the card shows, as sent from JavaScript (src/live-activity/model.ts,
 * ShiftActivityContent). Every string is already translated.
 */
struct ShiftContentRecord: Record {
  @Field var title: String = ""
  @Field var distance: String = ""
  @Field var money: String = ""
  @Field var status: String = ""
  @Field var elapsed: String = ""
  @Field var endLabel: String = ""
  @Field var notWorkingLabel: String = ""
  @Field var driving: Bool = false
  @Field var paused: Bool = false
  @Field var ended: Bool = false
  /** Milliseconds since 1970, as JavaScript keeps time. */
  @Field var startedAt: Double = 0
}

/*
 * Shared with the "End shift" / "Not working" buttons' App Intents
 * (targets/shift-activity/_shared/ShiftActivityIntents.swift): the App Group
 * both can read, where a tapped button is queued, and the in-process
 * notification posted when one is.
 */
private let appGroup = "group.com.milemint.app"
private let pendingKey = "milesprout.liveActivity.pending"
private let actionNotification = Notification.Name("MileSproutLiveActivityAction")

/** A shift can't run past 16 hours (src/db/shifts-repo.ts, MAX_SHIFT_MS): the card goes stale then. */
private let maxShiftSeconds: TimeInterval = 16 * 60 * 60

/**
 * The shift's Live Activity: on the lock screen and in the Dynamic Island
 * while a shift is on. The app starts it (iOS only allows that while the app
 * is in the foreground), updates it as drives are saved, also from the
 * background tracker, and ends it with the shift. No push server: every
 * update comes from the app on the phone.
 *
 * The buttons on the card (iOS 17+) queue what was tapped in the App Group
 * and open the app; `consumeActions` hands the queue to JavaScript, which
 * ends the shift or takes the drive off it, then updates the card.
 */
public class ShiftActivityModule: Module {
  private var observer: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ShiftActivity")

    Events("onAction")

    OnStartObserving {
      self.observer = NotificationCenter.default.addObserver(forName: actionNotification, object: nil, queue: .main) {
        [weak self] _ in
        self?.sendEvent("onAction", [:])
      }
    }

    OnStopObserving {
      if let observer = self.observer {
        NotificationCenter.default.removeObserver(observer)
        self.observer = nil
      }
    }

    /** Live Activities exist on this iPhone (iOS 16.2+) and the user hasn't turned them off for the app. */
    Function("isAvailable") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    /** The shift id of the card on screen now, if there is one. */
    Function("currentShiftId") { () -> String? in
      if #available(iOS 16.2, *) {
        return liveActivities().first?.attributes.shiftId
      }
      return nil
    }

    /**
     * Shows the card for a shift, or updates it if that shift's card is
     * already up. Cards for any other shift are ended. Resolves false when
     * iOS refuses (Live Activities off, or the app isn't in the foreground).
     */
    AsyncFunction("start") { (shiftId: String, content: ShiftContentRecord) async -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      let state = contentState(content)
      var shown = false
      let live = liveActivities()
      for activity in Activity<ShiftActivityAttributes>.activities {
        if activity.attributes.shiftId == shiftId && !shown && live.contains(where: { $0.id == activity.id }) {
          await activity.update(activityContent(state))
          shown = true
        } else {
          // Other shifts' cards go, including an earlier shift's "Shift ended"
          // summary still lingering on the lock screen.
          await activity.end(nil, dismissalPolicy: .immediate)
        }
      }
      if shown { return true }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
      do {
        _ = try Activity<ShiftActivityAttributes>.request(
          attributes: ShiftActivityAttributes(shiftId: shiftId),
          content: activityContent(state),
          pushType: nil
        )
        return true
      } catch {
        return false
      }
    }

    /** Updates the card on screen, if any. Works in the background too (while the tracker runs). */
    AsyncFunction("update") { (content: ShiftContentRecord) async -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      let activities = liveActivities()
      let state = contentState(content)
      for activity in activities {
        await activity.update(activityContent(state))
      }
      return !activities.isEmpty
    }

    /**
     * Ends every card. With a final `content` (the shift's summary) one card
     * stays on the lock screen for `lingerSeconds`; without, they go at once.
     * Only one summary is ever left: summaries of earlier shifts, and any
     * other card, go at once, so ending shifts never stacks up cards.
     */
    AsyncFunction("end") { (content: ShiftContentRecord?, lingerSeconds: Double) async in
      guard #available(iOS 16.2, *) else { return }
      let keep = liveActivities().last
      for activity in Activity<ShiftActivityAttributes>.activities {
        if let content = content, lingerSeconds > 0, activity.id == keep?.id {
          let state = contentState(content)
          await activity.end(
            ActivityContent(state: state, staleDate: nil),
            dismissalPolicy: .after(Date().addingTimeInterval(lingerSeconds))
          )
        } else {
          await activity.end(nil, dismissalPolicy: .immediate)
        }
      }
    }

    /**
     * The buttons tapped on the card since last asked, oldest first, as
     * { action: "end" | "notWorking", at: ms since 1970 }. Clears the queue.
     */
    Function("consumeActions") { () -> [[String: Any]] in
      let defaults = UserDefaults(suiteName: appGroup) ?? UserDefaults.standard
      let pending = defaults.array(forKey: pendingKey) as? [[String: Any]] ?? []
      defaults.removeObject(forKey: pendingKey)
      return pending.compactMap { entry in
        guard let action = entry["action"] as? String, let at = entry["at"] as? Double else { return nil }
        return ["action": action, "at": at]
      }
    }
  }
}

/** The shift cards still showing (not ended or dismissed). */
@available(iOS 16.2, *)
private func liveActivities() -> [Activity<ShiftActivityAttributes>] {
  return Activity<ShiftActivityAttributes>.activities.filter { activity in
    activity.activityState == .active || activity.activityState == .stale
  }
}

@available(iOS 16.2, *)
private func contentState(_ content: ShiftContentRecord) -> ShiftActivityAttributes.ContentState {
  return ShiftActivityAttributes.ContentState(
    title: content.title,
    distance: content.distance,
    money: content.money,
    status: content.status,
    elapsed: content.elapsed,
    endLabel: content.endLabel,
    notWorkingLabel: content.notWorkingLabel,
    driving: content.driving,
    paused: content.paused,
    ended: content.ended,
    startedAt: content.startedAt / 1000
  )
}

/** Goes stale at the shift's 16-hour mark, when the app would have ended it anyway. */
@available(iOS 16.2, *)
private func activityContent(
  _ state: ShiftActivityAttributes.ContentState
) -> ActivityContent<ShiftActivityAttributes.ContentState> {
  let staleDate = Date(timeIntervalSince1970: state.startedAt + maxShiftSeconds)
  return ActivityContent(state: state, staleDate: staleDate)
}
