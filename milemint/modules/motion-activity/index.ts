import { requireOptionalNativeModule } from 'expo';

/** iOS's answer to "access your Motion & Fitness activity". */
export type MotionStatus = 'notDetermined' | 'restricted' | 'denied' | 'authorized';

/**
 * One change of activity, lasting until the next one starts. `at` is
 * milliseconds since 1970; confidence is 0 low, 1 medium, 2 high. Several
 * flags can be true at once (e.g. automotive and stationary at a red light),
 * and all can be false (iOS couldn't tell).
 */
export type MotionActivitySample = {
  at: number;
  confidence: 0 | 1 | 2;
  automotive: boolean;
  cycling: boolean;
  walking: boolean;
  running: boolean;
  stationary: boolean;
  unknown: boolean;
};

type MotionActivityNative = {
  isAvailable(): boolean;
  authorizationStatus(): MotionStatus;
  requestPermission(): Promise<MotionStatus>;
  queryActivities(fromMs: number, toMs: number): Promise<MotionActivitySample[]>;
};

/** ios/MotionActivityModule.swift. Missing on the web, on Android, in Jest and in builds from before it was added. */
const native = requireOptionalNativeModule<MotionActivityNative>('MotionActivity');

/**
 * Motion activity from the phone's motion coprocessor. Everywhere without the
 * native module it is "unavailable" and returns no activity, so callers need
 * no platform checks.
 */
export const MotionActivity = {
  isAvailable: (): boolean => {
    try {
      return native ? native.isAvailable() : false;
    } catch {
      return false;
    }
  },
  authorizationStatus: (): MotionStatus => {
    try {
      return native ? native.authorizationStatus() : 'notDetermined';
    } catch {
      return 'notDetermined';
    }
  },
  requestPermission: (): Promise<MotionStatus> =>
    native ? native.requestPermission() : Promise.resolve<MotionStatus>('notDetermined'),
  queryActivities: (fromMs: number, toMs: number): Promise<MotionActivitySample[]> =>
    native ? native.queryActivities(fromMs, toMs) : Promise.resolve([]),
};
