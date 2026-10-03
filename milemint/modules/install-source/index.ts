import { requireOptionalNativeModule } from 'expo';

/** What ios/InstallSourceModule.swift reads from the app's own bundle. */
export type InstallSignals = {
  /** The App Store receipt's file name: "sandboxReceipt" (TestFlight, development), "receipt" (App Store), or "". */
  receiptName: string;
  /** The app carries a provisioning profile (development and ad hoc builds; never TestFlight or the App Store). */
  provisioned: boolean;
  /** Running in the Simulator. */
  simulator: boolean;
};

type InstallSourceNative = {
  signals(): InstallSignals;
};

/** Missing on the web, on Android, in Jest and in builds from before it was added. */
const native = requireOptionalNativeModule<InstallSourceNative>('InstallSource');

/** This install's signals, or null where the native module is missing. */
export function installSignals(): InstallSignals | null {
  if (!native) return null;
  try {
    return native.signals();
  } catch {
    return null;
  }
}
