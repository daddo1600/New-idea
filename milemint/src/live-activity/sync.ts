import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';
import { AppState, Platform } from 'react-native';

import { loadSettings } from '@/db/settings-repo';
import { currentPause, currentShift } from '@/db/shifts-repo';
import { listTrips } from '@/db/trips-repo';
import { lockedTripIds } from '@/domain/plan';
import { computeDeductions, type Region, REGIONS } from '@/domain/regions';
import { currentDistanceM } from '@/domain/trip-detector';
import { t } from '@/i18n/i18n';
import { referralAllowance } from '@/referral/invites';
import { loadTrackerRecord } from '@/tracking/tracker-store';

import { ShiftActivity } from '../../modules/live-activity';
import { shiftActivityContent, shouldPush, type ShiftActivityContent, type ShiftActivityInput } from './model';

/** Same key the Pro provider caches the App Store status under (as region/launch-total). */
const PRO_CACHE_KEY = 'milemint.pro-active';

/** How long the "Shift ended" summary stays on the lock screen. */
const ENDED_LINGER_S = 15 * 60;

export const LIVE_ACTIVITY_SUPPORTED = Platform.OS === 'ios';

/** The shift's saved drives, as last read: reused while only the live drive moves. */
let drives: { shiftId: string; list: ShiftActivityInput['drives'] } | null = null;
/** What the card shows now, and when it was sent. */
let shown: { shiftId: string; content: ShiftActivityContent; at: number } | null = null;

/** One sync at a time: the tracker and the screen can both ask at once. */
let queue: Promise<void> = Promise.resolve();

/**
 * The saved drives of a shift with what each is worth, as home's shift bar
 * counts them: drives past the free plan's allowance add no money until Pro.
 */
async function shiftDrives(db: SQLiteDatabase, shiftId: string, region: Region): Promise<ShiftActivityInput['drives']> {
  const settings = await loadSettings(db);
  const isPro = (await SecureStore.getItemAsync(PRO_CACHE_KEY).catch(() => null)) === '1';
  const trips = await listTrips(db);
  const locked = lockedTripIds(trips, isPro, referralAllowance(settings));
  const visible = trips.filter((trip) => !locked.has(trip.id));
  const deductions = computeDeductions(visible, region);
  return trips
    .filter((trip) => trip.shiftId === shiftId)
    .map((trip) => ({
      distanceMeters: trip.distanceMeters,
      value: deductions.get(trip.id) ?? 0,
      business: trip.classification === 'business',
    }));
}

async function run(db: SQLiteDatabase, { drivesChanged }: { drivesChanged: boolean }): Promise<void> {
  const settings = await loadSettings(db);
  const shift = settings.shiftMode && settings.region ? await currentShift(db) : null;
  if (!shift || !settings.region || !settings.shiftLiveActivity || !ShiftActivity.isAvailable()) {
    if (ShiftActivity.currentShiftId() !== null) {
      // The shift ended (here, from the card, or by itself at 16 hours): its summary stays a while.
      // Switched off in Settings, or shift mode turned off: it goes at once.
      const last = shown;
      const ended = !shift && settings.shiftMode && last ? await endedContent(db, last) : null;
      await ShiftActivity.end(ended, ended ? ENDED_LINGER_S : 0);
    }
    shown = null;
    return;
  }
  const region = REGIONS[settings.region];
  if (drivesChanged || drives?.shiftId !== shift.id) {
    drives = { shiftId: shift.id, list: await shiftDrives(db, shift.id, region) };
  }
  const [pause, record] = await Promise.all([currentPause(db), loadTrackerRecord(db)]);
  const detector = record.enabled ? record.detector : null;
  const now = Date.now();
  const content = shiftActivityContent(
    {
      startedAt: Date.parse(shift.startedAt),
      endedAt: null,
      now,
      paused: pause !== null,
      drives: drives.list,
      liveDrive: detector?.mode === 'driving' ? { distanceMeters: currentDistanceM(detector) } : null,
      region,
    },
    t,
  );
  const onScreen = ShiftActivity.currentShiftId();
  if (onScreen === shift.id && shown?.shiftId === shift.id && !shouldPush(shown.content, shown.at, content, now)) return;
  let ok: boolean;
  if (onScreen === shift.id) {
    ok = await ShiftActivity.update(content);
  } else if (AppState.currentState === 'active') {
    // iOS only lets an app start a Live Activity from the foreground.
    ok = await ShiftActivity.start(shift.id, content);
  } else {
    ok = false;
  }
  shown = ok ? { shiftId: shift.id, content, at: now } : null;
}

/** The last card's figures, marked ended: what stays on the lock screen for a while. */
async function endedContent(
  db: SQLiteDatabase,
  last: NonNullable<typeof shown>,
): Promise<ShiftActivityContent> {
  const settings = await loadSettings(db);
  const row = await db.getFirstAsync<{ ended_at: string | null }>('SELECT ended_at FROM shifts WHERE id = ?;', last.shiftId);
  const endedAt = row?.ended_at ? Date.parse(row.ended_at) : Date.now();
  if (!settings.region) return { ...last.content, ended: true, driving: false };
  const region = REGIONS[settings.region];
  const list = await shiftDrives(db, last.shiftId, region);
  return shiftActivityContent(
    { startedAt: last.content.startedAt, endedAt, now: Date.now(), paused: false, drives: list, liveDrive: null, region },
    t,
  );
}

/**
 * Brings the lock-screen card in line with the shift: starts it (app in the
 * foreground only), updates it, or ends it. Safe to call often: it sends
 * nothing when nothing visible changed, and the live drive's distance at most
 * every 45 seconds. `drivesChanged`: a drive was saved or re-sorted, so the
 * money and distance are read again. Never throws.
 */
export function syncShiftActivity(db: SQLiteDatabase, { drivesChanged = true } = {}): Promise<void> {
  if (!LIVE_ACTIVITY_SUPPORTED) return Promise.resolve();
  queue = queue
    .then(() => run(db, { drivesChanged }))
    .catch((error) => console.warn('[live-activity]', error));
  return queue;
}

/** Background GPS arrives about once a second: the card is checked at most this often while driving. */
const TRACKER_CHECK_MS = 30_000;
let lastTrackerCheck = 0;

/**
 * From the background tracker after each wake-up. A saved drive or the end
 * of one updates the card straight away; otherwise it's looked at every
 * 30 seconds (and only sent if the distance shown should move).
 */
export function noteTrackerProgress(db: SQLiteDatabase, { saved, changed }: { saved: boolean; changed: boolean }): Promise<void> {
  if (!LIVE_ACTIVITY_SUPPORTED) return Promise.resolve();
  const now = Date.now();
  if (!saved && !changed && now - lastTrackerCheck < TRACKER_CHECK_MS) return Promise.resolve();
  lastTrackerCheck = now;
  return syncShiftActivity(db, { drivesChanged: saved });
}
