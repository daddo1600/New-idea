import ExpoModulesCore

/**
 * Where this copy of the app came from, for the founding testers' badge
 * (src/referral/founding-tester.ts). It only reads the app's own bundle:
 * nothing leaves the phone. Works on iOS 16.4.
 */
public class InstallSourceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("InstallSource")

    /**
     * `receiptName`: the App Store receipt's file name, "sandboxReceipt" for
     * TestFlight (and development builds), "receipt" from the App Store, ""
     * if there's none. `provisioned`: the app carries a provisioning profile,
     * as development and ad hoc builds do; Apple re-signs TestFlight and App
     * Store builds without one. `simulator`: running in the Simulator.
     */
    Function("signals") { () -> [String: Any] in
      #if targetEnvironment(simulator)
      let simulator = true
      #else
      let simulator = false
      #endif
      return [
        "receiptName": Bundle.main.appStoreReceiptURL?.lastPathComponent ?? "",
        "provisioned": Bundle.main.path(forResource: "embedded", ofType: "mobileprovision") != nil,
        "simulator": simulator,
      ]
    }
  }
}
