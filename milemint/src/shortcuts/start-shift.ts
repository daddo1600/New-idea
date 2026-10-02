import type { SQLiteDatabase } from 'expo-sqlite';

import { loadSettings, updateSettings } from '@/db/settings-repo';
import { currentShift, startShift, startShiftFrom } from '@/db/shifts-repo';
import { scheduleShiftAutoEnd } from '@/tracking/shift-notifications';

/** A start older than this is backdated with startShiftFrom, so drives saved since are pulled in. */
const BACKDATE_AFTER_MS = 60_000;

/**
 * "Start my shift" from Siri or Shortcuts, said at `at`: starts a shift as
 * the home screen's button does, turning shift mode on first if it's off
 * (asking for a shift is asking for it). Nothing if the app isn't set up yet
 * or a shift is already on. Resolves to whether anything changed.
 */
export async function startShiftFromShortcut(db: SQLiteDatabase, at: number, now = Date.now()): Promise<boolean> {
  const settings = await loadSettings(db);
  if (!settings.onboarded || !settings.region) return false;
  let changed = false;
  if (!settings.shiftMode) {
    await updateSettings(db, { shiftMode: true });
    changed = true;
  }
  if (await currentShift(db, new Date(now))) return changed;
  const started =
    at < now - BACKDATE_AFTER_MS
      ? await startShiftFrom(db, new Date(at), new Date(now))
      : await startShift(db, new Date(now));
  await scheduleShiftAutoEnd(started).catch(() => {});
  return true;
}
