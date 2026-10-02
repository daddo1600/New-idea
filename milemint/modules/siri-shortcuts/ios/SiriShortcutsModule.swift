import ExpoModulesCore
import Foundation

/*
 * Where the app leaves the summary its Siri & Shortcuts intents read
 * (native/siri-shortcuts/MileSproutShortcuts.swift, compiled into the app
 * target by plugins/with-siri-shortcuts.js). Keep the group and key in step
 * with that file.
 */
private let appGroup = "group.com.milemint.app"
private let snapshotKey = "milesprout.shortcuts.snapshot"

/**
 * Siri & Shortcuts. The intents can't open the encrypted database or run
 * JavaScript, so the app keeps a small JSON summary
 * (src/domain/shortcuts-snapshot.ts) in the App Group's shared
 * UserDefaults, written whenever drives, the shift or Pro change, and the
 * intents answer from it. There is no App Intent in this module: intents in
 * a pod (a static framework) aren't found by iOS, so they live in the app
 * target.
 */
public class SiriShortcutsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SiriShortcuts")

    /** Replaces the summary (a JSON string). */
    Function("setSnapshot") { (json: String) -> Void in
      let defaults = UserDefaults(suiteName: appGroup) ?? UserDefaults.standard
      defaults.set(json, forKey: snapshotKey)
    }

    /** The summary written last, if any. */
    Function("getSnapshot") { () -> String? in
      let defaults = UserDefaults(suiteName: appGroup) ?? UserDefaults.standard
      return defaults.string(forKey: snapshotKey)
    }

    /** Removes it: the intents then say to open the app first. */
    Function("clearSnapshot") { () -> Void in
      let defaults = UserDefaults(suiteName: appGroup) ?? UserDefaults.standard
      defaults.removeObject(forKey: snapshotKey)
    }
  }
}
