import { requireOptionalNativeModule } from 'expo';

type SiriShortcutsNative = {
  setSnapshot(json: string): void;
  getSnapshot(): string | null;
  clearSnapshot(): void;
};

/** ios/SiriShortcutsModule.swift. Missing on the web, on Android, in Jest and in builds from before it was added. */
const native = requireOptionalNativeModule<SiriShortcutsNative>('SiriShortcuts');

/**
 * The summary Siri & Shortcuts answer from (src/domain/shortcuts-snapshot.ts),
 * kept in the App Group. Everywhere without the native module every call
 * does nothing, so callers need no platform checks.
 */
export const SiriShortcuts = {
  supported: native !== null,
  setSnapshot: (json: string): void => {
    try {
      native?.setSnapshot(json);
    } catch {
      // Siri answers from the last summary written.
    }
  },
  getSnapshot: (): string | null => {
    try {
      return native ? native.getSnapshot() : null;
    } catch {
      return null;
    }
  },
  clearSnapshot: (): void => {
    try {
      native?.clearSnapshot();
    } catch {
      // Nothing to clear.
    }
  },
};
