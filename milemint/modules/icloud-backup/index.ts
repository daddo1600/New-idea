import { requireOptionalNativeModule } from 'expo';

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
  /** This build can back up to iCloud at all (an iPhone build with the module). */
  supported: native !== null,
  isAvailable: (): Promise<boolean> => (native ? native.isAvailable().catch(() => false) : Promise.resolve(false)),
  keyInfo: (): Promise<BackupKeyInfo> =>
    native ? native.keyInfo() : Promise.resolve({ exists: false, synchronizable: false }),
  write: (name: string, base64: string, keep: number): Promise<void> =>
    native ? native.write(name, base64, keep) : missing(),
  list: (): Promise<BackupFile[]> => (native ? native.list() : Promise.resolve([])),
  read: (name: string): Promise<string> => (native ? native.read(name) : missing()),
  seal: (base64: string): Promise<string> => (native ? native.seal(base64) : missing()),
  open: (base64: string): Promise<string> => (native ? native.open(base64) : missing()),
};
