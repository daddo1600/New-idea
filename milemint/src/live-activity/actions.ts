import type { SQLiteDatabase } from 'expo-sqlite';

import { endShift } from '@/db/shifts-repo';
import { cancelShiftAutoEnd } from '@/tracking/shift-notifications';

import { ShiftActivity, type ShiftActivityAction } from '../../modules/live-activity';
import { markNotWorking } from './not-working';

/** A tap older than this (the phone was off, the app never opened) is acted on as of now instead. */
const MAX_ACTION_AGE_MS = 12 * 60 * 60_000;

/**
 * When a tap counts from: when it was made (the shift ends when "End shift"
 * was tapped, not when the phone was unlocked), unless that time is
 * implausible (in the future, or very old).
 */
export function actionTime(at: number, now: number): number {
  return Number.isFinite(at) && at <= now && now - at <= MAX_ACTION_AGE_MS ? at : now;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** Called when a button on the lock screen changed the shift or its drives, so open screens reload. */
export function onShiftChangedElsewhere(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Acts on the buttons tapped on the lock-screen card since last time: "End
 * shift" ends the shift as of the tap, "Not working" takes the current drive
 * off it (see not-working). Returns whether anything changed.
 */
export async function handleShiftActivityActions(db: SQLiteDatabase, now = Date.now()): Promise<boolean> {
  return applyActions(db, ShiftActivity.consumeActions(), now);
}

export async function applyActions(
  db: SQLiteDatabase,
  actions: readonly ShiftActivityAction[],
  now = Date.now(),
): Promise<boolean> {
  let changed = false;
  for (const { action, at } of actions) {
    const when = actionTime(at, now);
    if (action === 'end') {
      const ended = await endShift(db, new Date(when));
      if (ended) {
        await cancelShiftAutoEnd().catch(() => {});
        changed = true;
      }
    } else if (action === 'notWorking') {
      await markNotWorking(db, when);
      changed = true;
    }
  }
  if (changed) for (const listener of listeners) listener();
  return changed;
}
