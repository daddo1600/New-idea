import { requireOptionalNativeModule } from 'expo';

/** What the card shows, every string ready to display (see src/live-activity/model.ts). */
export type ShiftActivityContentNative = {
  title: string;
  distance: string;
  money: string;
  status: string;
  elapsed: string;
  endLabel: string;
  notWorkingLabel: string;
  driving: boolean;
  paused: boolean;
  ended: boolean;
  /** ms since 1970. */
  startedAt: number;
};

/**
 * A button tapped on the card: "end" (End shift) or "notWorking", and when
 * (ms since 1970). Siri & Shortcuts queue "start" and "end" here too
 * (native/siri-shortcuts).
 */
export type ShiftActivityAction = { action: string; at: number };

type Subscription = { remove(): void };

type ShiftActivityNative = {
  isAvailable(): boolean;
  currentShiftId(): string | null;
  start(shiftId: string, content: ShiftActivityContentNative): Promise<boolean>;
  update(content: ShiftActivityContentNative): Promise<boolean>;
  end(content: ShiftActivityContentNative | null, lingerSeconds: number): Promise<void>;
  consumeActions(): ShiftActivityAction[];
  addListener(event: 'onAction', listener: () => void): Subscription;
};

/** ios/ShiftActivityModule.swift. Missing on the web, on Android, in Jest and in builds from before it was added. */
const native = requireOptionalNativeModule<ShiftActivityNative>('ShiftActivity');

/**
 * The shift's Live Activity. Everywhere without the native module (web,
 * Android, Jest, older builds) it is unavailable and every call does
 * nothing, so callers need no platform checks.
 */
export const ShiftActivity = {
  isAvailable: (): boolean => {
    try {
      return native ? native.isAvailable() : false;
    } catch {
      return false;
    }
  },
  currentShiftId: (): string | null => {
    try {
      return native ? native.currentShiftId() : null;
    } catch {
      return null;
    }
  },
  start: (shiftId: string, content: ShiftActivityContentNative): Promise<boolean> =>
    native ? native.start(shiftId, content) : Promise.resolve(false),
  update: (content: ShiftActivityContentNative): Promise<boolean> =>
    native ? native.update(content) : Promise.resolve(false),
  end: (content: ShiftActivityContentNative | null, lingerSeconds = 0): Promise<void> =>
    native ? native.end(content, lingerSeconds) : Promise.resolve(),
  consumeActions: (): ShiftActivityAction[] => {
    try {
      return native ? native.consumeActions() : [];
    } catch {
      return [];
    }
  },
  /** A button on the card was tapped while the app is running. */
  onAction: (listener: () => void): Subscription => (native ? native.addListener('onAction', listener) : { remove() {} }),
};
