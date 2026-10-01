import CoreMotion
import ExpoModulesCore
import Foundation

/**
 * iOS's motion activity (Motion & Fitness): what the phone's motion
 * coprocessor thought it was doing (driving, walking, cycling, still) and
 * when. MileMint reads it back for a detected drive's time window, to tell a
 * real drive from a walk the GPS mistook for one. iOS keeps about seven days
 * of history, and reading it works in the background. Nothing leaves the phone.
 *
 * Every CoreMotion callback runs on `queue` (our own, not the main queue) and
 * settles its promise there.
 */
public class MotionActivityModule: Module {
  private let manager = CMMotionActivityManager()
  private let queue: OperationQueue = {
    let queue = OperationQueue()
    queue.name = "MileMint.MotionActivity"
    queue.maxConcurrentOperationCount = 1
    return queue
  }()

  public func definition() -> ModuleDefinition {
    Name("MotionActivity")

    /** The phone has a motion coprocessor (every iPhone since the 5s). */
    Function("isAvailable") { () -> Bool in
      return CMMotionActivityManager.isActivityAvailable()
    }

    /** "notDetermined", "restricted", "denied" or "authorized". */
    Function("authorizationStatus") { () -> String in
      return statusName(CMMotionActivityManager.authorizationStatus())
    }

    /**
     * iOS shows its Motion & Fitness question the first time activity is
     * queried, so this queries the last minute and resolves with the status
     * once the question has been answered.
     */
    AsyncFunction("requestPermission") { (promise: Promise) in
      guard CMMotionActivityManager.isActivityAvailable(),
        CMMotionActivityManager.authorizationStatus() == .notDetermined
      else {
        promise.resolve(statusName(CMMotionActivityManager.authorizationStatus()))
        return
      }
      let now = Date()
      self.manager.queryActivityStarting(from: now.addingTimeInterval(-60), to: now, to: self.queue) { _, error in
        var status = statusName(CMMotionActivityManager.authorizationStatus())
        // 105 is CMErrorMotionActivityNotAuthorized: the answer was "Don't Allow".
        if status == "notDetermined", let nsError = error as NSError?, nsError.domain == CMErrorDomain, nsError.code == 105 {
          status = "denied"
        }
        promise.resolve(status)
      }
    }

    /**
     * The activity changes between two times (milliseconds since 1970), oldest
     * first. Each lasts until the next one starts.
     */
    AsyncFunction("queryActivities") { (fromMs: Double, toMs: Double, promise: Promise) in
      guard CMMotionActivityManager.isActivityAvailable(), toMs > fromMs else {
        promise.resolve([[String: Any]]())
        return
      }
      let from = Date(timeIntervalSince1970: fromMs / 1000)
      let to = Date(timeIntervalSince1970: toMs / 1000)
      self.manager.queryActivityStarting(from: from, to: to, to: self.queue) { activities, error in
        if let error = error {
          promise.reject(Exception(name: "ERR_MOTION_QUERY", description: error.localizedDescription, code: "ERR_MOTION_QUERY"))
          return
        }
        var rows: [[String: Any]] = []
        for activity in activities ?? [] {
          rows.append([
            "at": activity.startDate.timeIntervalSince1970 * 1000,
            "confidence": confidenceLevel(activity.confidence),
            "automotive": activity.automotive,
            "cycling": activity.cycling,
            "walking": activity.walking,
            "running": activity.running,
            "stationary": activity.stationary,
            "unknown": activity.unknown,
          ])
        }
        promise.resolve(rows)
      }
    }
  }
}

private func statusName(_ status: CMAuthorizationStatus) -> String {
  switch status {
  case .notDetermined:
    return "notDetermined"
  case .restricted:
    return "restricted"
  case .denied:
    return "denied"
  case .authorized:
    return "authorized"
  @unknown default:
    return "notDetermined"
  }
}

/** 0 low, 1 medium, 2 high. */
private func confidenceLevel(_ confidence: CMMotionActivityConfidence) -> Int {
  switch confidence {
  case .low:
    return 0
  case .medium:
    return 1
  case .high:
    return 2
  @unknown default:
    return 0
  }
}
