import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';

/** A backup file in iCloud. `modified` is milliseconds since 1970 (0 when iCloud hasn't said). */
export type BackupFile = { name: string; modified: number; size: number };

/** Whether a backup key exists yet, and whether it's in iCloud Keychain (so a new iPhone gets it). */
export type BackupKeyInfo = { exists: boolean; synchronizable: boolean };

type ICloudBackupNative = {
  isAvailable(): Promise<boolean>;
  keyInfo(): Promise<BackupKeyInfo>;
  write(name: string, base64: string, keep: number): Promise<void>;
  list(): Promise<BackupFile[]>;
  read(name: string): Promise<string>;
  seal(base64: string): Promise<string>;
  open(base64: string): Promise<string>;
  /** Builds from after backups grew past what base64 on the JavaScript thread can handle; see `sealsText`. */
  sealText?(text: string): Promise<string>;
  openText?(base64: string): Promise<string>;
};

/** ios/ICloudBackupModule.swift. Missing on the web, on Android and in builds from before it was added. */
const native = requireOptionalNativeModule<ICloudBackupNative>('ICloudBackup');

function missing(): Promise<never> {
  const error = new Error('iCloud backup is only available in the iPhone app.') as Error & { code: string };
  error.code = 'ERR_ICLOUD_UNAVAILABLE';
  return Promise.reject(error);
}

/**
 * Encrypted backups in the user's own iCloud. Everywhere without the native
 * module this reports "unavailable" and never writes anything, so callers
 * need no platform checks.
 */
export const ICloudBackup = {
  /**
   * This build can back up to iCloud at all: an iPhone build with the module,
   * signed with the iCloud entitlements (`extra.icloudBackup` in app.json).
   */
  supported: native !== null && Constants.expoConfig?.extra?.icloudBackup === true,
  isAvailable: (): Promise<boolean> => (native ? native.isAvailable().catch(() => false) : Promise.resolve(false)),
  keyInfo: (): Promise<BackupKeyInfo> =>
    native ? native.keyInfo() : Promise.resolve({ exists: false, synchronizable: false }),
  write: (name: string, base64: string, keep: number): Promise<void> =>
    native ? native.write(name, base64, keep) : missing(),
  list: (): Promise<BackupFile[]> => (native ? native.list() : Promise.resolve([])),
  read: (name: string): Promise<string> => (native ? native.read(name) : missing()),
  seal: (base64: string): Promise<string> => (native ? native.seal(base64) : missing()),
  open: (base64: string): Promise<string> => (native ? native.open(base64) : missing()),
  /**
   * This build's native module takes the snapshot as text (`sealText`) and
   * gives it back as text (`openText`), converting to and from UTF-8 in Swift.
   * Older builds (an over-the-air update can run on one) only have the base64
   * `seal`/`open`, so callers check this first.
   */
  sealsText: typeof native?.sealText === 'function' && typeof native?.openText === 'function',
  /** Compresses and encrypts text; the sealed backup comes back as base64, ready for `write`. */
  sealText: (text: string): Promise<string> => (native?.sealText ? native.sealText(text) : missing()),
  /** A sealed backup (base64, from `read`) opened back into its text. */
  openText: (base64: string): Promise<string> => (native?.openText ? native.openText(base64) : missing()),
};
