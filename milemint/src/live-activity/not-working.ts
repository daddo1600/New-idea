import type { SQLiteDatabase } from 'expo-sqlite';

import { updateSettings } from '@/db/settings-repo';
import { currentShift } from '@/db/shifts-repo';
import { inWriteTransaction } from '@/db/transaction';
import { listTrips, setClassification, setTripShiftUnlocked } from '@/db/trips-repo';
import type { Trip } from '@/domain/trip';
import { loadTrackerRecord } from '@/tracking/tracker-store';

/** "Not working" tapped just after a drive was saved still applies to that drive, up to this long after it ended. */
export const NOT_WORKING_GRACE_MS = 10 * 60_000;

/** How close a saved drive's start must be to the marked one's to be the same drive (the same GPS fix, in practice). */
const SAME_DRIVE_MS = 2_000;

/**
 * The saved shift drive a "Not working" tapped at `at` is about: one that was
 * under way then (saved since), or that ended at most 10 minutes before. The
 * latest if several. Automatic drives only.
 */
export function notWorkingTarget<T extends Pick<Trip, 'id' | 'startedAt' | 'endedAt' | 'source' | 'shiftId'>>(
  trips: readonly T[],
  shiftId: string,
  at: number,
): T | null {
  let found: T | null = null;
  for (const trip of trips) {
    if (trip.shiftId !== shiftId || trip.source !== 'auto' || !trip.endedAt) continue;
    const start = Date.parse(trip.startedAt);
    const end = Date.parse(trip.endedAt);
    if (start > at || end < at - NOT_WORKING_GRACE_MS) continue;
    if (!found || start > Date.parse(found.startedAt)) found = trip;
  }
  return found;
}

/** Whether a drive detected as starting at `startedAt` (ms) is the one marked "Not working" (an ISO time, or null). */
export function isNotWorkingDrive(marked: string | null, startedAt: number): boolean {
  return marked !== null && Math.abs(Date.parse(marked) - startedAt) <= SAME_DRIVE_MS;
}

/**
 * "Not working" from the lock screen, tapped at `at`: this drive isn't work.
 * A drive still being recorded is marked, and filed as personal, outside the
 * shift, when it's saved (tracking/background). One already saved is taken
 * out of the shift and sorted personal now. The shift itself carries on.
 */
export async function markNotWorking(db: SQLiteDatabase, at: number): Promise<void> {
  const record = await loadTrackerRecord(db);
  const detector = record.enabled ? record.detector : null;
  if (detector?.mode === 'driving' && detector.start.timestamp <= at) {
    await updateSettings(db, { notWorkingDriveAt: new Date(detector.start.timestamp).toISOString() });
    return;
  }
  const shift = await currentShift(db);
  if (!shift) return;
  const target = notWorkingTarget(await listTrips(db), shift.id, at);
  if (!target) return;
  await inWriteTransaction(db, () => setTripShiftUnlocked(db, target.id, null));
  await setClassification(db, target, 'personal');
}
