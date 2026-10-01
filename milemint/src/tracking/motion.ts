import { AppState } from 'react-native';

import { DEMO_MOTION } from '@/dev/demo';
import { judgeTrip, type DetectedTripWindow, type MotionVerdict } from '@/domain/motion';

import { MotionActivity, type MotionStatus } from '../../modules/motion-activity';
import { waitForPromptAnswer } from './prompt-answer';

/**
 * Motion & Fitness for tracking: the verdict on a detected drive (is it a
 * walk?), and asking for access. Without the native module (web, Android,
 * Jest, older builds), without access, or when iOS is slow to answer, every
 * drive gets 'unknown' and is saved exactly as before.
 */

/** The query never holds up saving a drive for longer than this. */
export const MOTION_QUERY_TIMEOUT_MS = 3000;
/** Read from a little before the drive, so the activity already under way when it started is included. */
const LOOKBACK_MS = 10 * 60_000;

type MotionSource = Pick<typeof MotionActivity, 'isAvailable' | 'authorizationStatus' | 'queryActivities'>;

/** What the phone was doing during a detected drive. Never throws; 'unknown' whenever it can't tell. */
export async function motionVerdictFor(
  trip: DetectedTripWindow,
  { source = MotionActivity, timeoutMs = MOTION_QUERY_TIMEOUT_MS }: { source?: MotionSource; timeoutMs?: number } = {},
): Promise<MotionVerdict> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (!source.isAvailable() || source.authorizationStatus() !== 'authorized') return 'unknown';
    const samples = await Promise.race([
      source.queryActivities(trip.startedAt - LOOKBACK_MS, trip.endedAt),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
    return Array.isArray(samples) ? judgeTrip(samples, trip) : 'unknown';
  } catch {
    return 'unknown';
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Splits detected drives into the ones to save and the walks to drop. Only a
 * clear 'walk' is dropped: 'drive', 'cycle' and 'unknown' are saved as today.
 */
export async function screenDetectedTrips<T extends DetectedTripWindow>(
  trips: readonly T[],
  verdictFor: (trip: T) => Promise<MotionVerdict> = motionVerdictFor,
): Promise<{ keep: T[]; walks: T[] }> {
  const keep: T[] = [];
  const walks: T[] = [];
  for (const trip of trips) {
    const verdict = await verdictFor(trip).catch((): MotionVerdict => 'unknown');
    if (verdict === 'walk') walks.push(trip);
    else keep.push(trip);
  }
  return { keep, walks };
}

/** iOS's answer so far; null where there's no Motion & Fitness (web, Android, older builds). */
export function motionStatus(): MotionStatus | null {
  if (DEMO_MOTION) return 'notDetermined';
  return MotionActivity.isAvailable() ? MotionActivity.authorizationStatus() : null;
}

/** Motion & Fitness can still be asked for: there is some, and iOS hasn't asked yet. */
export function motionAskable(): boolean {
  return motionStatus() === 'notDetermined';
}

/**
 * Asks iOS for Motion & Fitness and waits until the question is answered
 * (the coaching behind it stays up until then). Resolves with the answer.
 */
export async function askForMotion(): Promise<MotionStatus> {
  // The web demo has no question to answer: the coaching stays for screenshots.
  if (DEMO_MOTION) return new Promise((resolve) => setTimeout(() => resolve('notDetermined'), 120_000));
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.all([
    // Capped like the wait below, so set-up can never hang on it.
    Promise.race([
      MotionActivity.requestPermission().catch(() => null),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 120_000);
      }),
    ]).finally(() => clearTimeout(timer)),
    waitForPromptAnswer({
      appState: AppState,
      answered: async () => MotionActivity.authorizationStatus() !== 'notDetermined',
    }),
  ]);
  return MotionActivity.authorizationStatus();
}
