import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { legsOf, SHIFT_END_LABEL, SHIFT_START_LABEL, workSpans, type ShiftPause } from '@/domain/shift-split';

import { inWriteTransaction } from './transaction';
import { setTripShiftUnlocked, splitTripUnlocked } from './trips-repo';

/** A working shift in shift mode (couriers, gig drivers). */
export type Shift = { id: string; startedAt: string; endedAt: string | null };
export type { ShiftPause };

type ShiftRow = { id: string; started_at: string; ended_at: string | null };
type PauseRow = { id: string; shift_id: string; started_at: string; ended_at: string | null };

const fromRow = (row: ShiftRow): Shift => ({ id: row.id, startedAt: row.started_at, endedAt: row.ended_at });
const pauseFromRow = (row: PauseRow): ShiftPause => ({
  id: row.id,
  shiftId: row.shift_id,
  startedAt: row.started_at,
  endedAt: row.ended_at,
});

/**
 * A drive still counts towards a shift if it started up to this long after the
 * shift was ended: the last drive home is often only saved once parked.
 */
export const SHIFT_GRACE_MS = 10 * 60_000;

/** A shift left running ends by itself after this long (nobody works a 16-hour delivery shift). */
export const MAX_SHIFT_MS = 16 * 60 * 60_000;

/** When a shift ends: when it was ended, or its 16-hour mark while it's running. */
export function shiftEndMs(shift: Shift): number {
  return shift.endedAt ? Date.parse(shift.endedAt) : Date.parse(shift.startedAt) + MAX_SHIFT_MS;
}

/** The open shift, closing a forgotten one first. Doesn't take the write lock (callers hold it). */
async function openShift(db: SQLiteDatabase, now: Date): Promise<Shift | null> {
  const row = await db.getFirstAsync<ShiftRow>(
    'SELECT * FROM shifts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1;',
  );
  if (!row) return null;
  const shift = fromRow(row);
  const cutoff = Date.parse(shift.startedAt) + MAX_SHIFT_MS;
  if (now.getTime() <= cutoff) return shift;
  // Forgotten: close it at its 16-hour mark, so later drives aren't counted as work.
  await closeUnlocked(db, shift, new Date(cutoff));
  return null;
}

/** Ends a shift at `at`, ending a pause with it and cutting a drive that ran past the end. */
async function closeUnlocked(db: SQLiteDatabase, shift: Shift, at: Date): Promise<Shift> {
  const endedAt = at.toISOString();
  await db.runAsync('UPDATE shifts SET ended_at = ? WHERE id = ?;', endedAt, shift.id);
  await db.runAsync('UPDATE shift_pauses SET ended_at = ? WHERE shift_id = ? AND ended_at IS NULL;', endedAt, shift.id);
  const closed = { ...shift, endedAt };
  await cutUnlocked(db, closed);
  return closed;
}

export async function currentShift(db: SQLiteDatabase, now = new Date()): Promise<Shift | null> {
  const row = await db.getFirstAsync<ShiftRow>(
    'SELECT * FROM shifts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1;',
  );
  if (!row || now.getTime() <= Date.parse(row.started_at) + MAX_SHIFT_MS) return row ? fromRow(row) : null;
  let open: Shift | null = null;
  await inWriteTransaction(db, async () => {
    open = await openShift(db, now);
  });
  return open;
}

/**
 * Starts a shift, or returns the one already open. Checked and inserted in one
 * transaction, so a double tap (or two screens) can't open two.
 */
export async function startShift(db: SQLiteDatabase, now = new Date()): Promise<Shift> {
  let result: Shift | null = null;
  await inWriteTransaction(db, async () => {
    result = await openShift(db, now);
    if (result) return;
    const shift: Shift = { id: Crypto.randomUUID(), startedAt: now.toISOString(), endedAt: null };
    await db.runAsync(
      'INSERT INTO shifts (id, started_at, ended_at) VALUES (?, ?, NULL);',
      shift.id,
      shift.startedAt,
    );
    result = shift;
  });
  return result!;
}

/**
 * "Start shift from 10:40?": starts a shift that began at `from` (or moves
 * the open one's start back to it), and files the drives since then under it.
 * Never reaches back into the previous shift.
 */
export async function startShiftFrom(db: SQLiteDatabase, from: Date, now = new Date()): Promise<Shift> {
  let result: Shift | null = null;
  await inWriteTransaction(db, async () => {
    const open = await openShift(db, now);
    const previous = await db.getFirstAsync<ShiftRow>(
      'SELECT * FROM shifts WHERE ended_at IS NOT NULL ORDER BY ended_at DESC LIMIT 1;',
    );
    const floor = previous?.ended_at ? Date.parse(previous.ended_at) : -Infinity;
    const start = Math.min(now.getTime(), Math.max(from.getTime(), floor, now.getTime() - MAX_SHIFT_MS + 60_000));
    let shift: Shift;
    if (open) {
      shift = { ...open, startedAt: new Date(Math.min(start, Date.parse(open.startedAt))).toISOString() };
      await db.runAsync('UPDATE shifts SET started_at = ? WHERE id = ?;', shift.startedAt, shift.id);
    } else {
      shift = { id: Crypto.randomUUID(), startedAt: new Date(start).toISOString(), endedAt: null };
      await db.runAsync('INSERT INTO shifts (id, started_at, ended_at) VALUES (?, ?, NULL);', shift.id, shift.startedAt);
    }
    await rederiveUnlocked(db, shift, now);
    result = shift;
  });
  return result!;
}

/**
 * Ends the open shift at `now`. A drive still being logged then is cut when
 * it's saved (tracking/background); one already saved that ran past `now`
 * (the end was set in the past) is cut here. Returns the shift as ended, and
 * whether a pause was running, so the end can be undone.
 */
export async function endShift(
  db: SQLiteDatabase,
  now = new Date(),
): Promise<{ shift: Shift; pauseEnded: boolean } | null> {
  let result: { shift: Shift; pauseEnded: boolean } | null = null;
  await inWriteTransaction(db, async () => {
    const open = await openShift(db, now);
    if (!open) return;
    const pause = await db.getFirstAsync<PauseRow>(
      'SELECT * FROM shift_pauses WHERE shift_id = ? AND ended_at IS NULL LIMIT 1;',
      open.id,
    );
    result = { shift: await closeUnlocked(db, open, now), pauseEnded: pause !== null };
  });
  return result;
}

/**
 * Undo for a shift swiped off by mistake: opens it again (and its pause, if
 * one was running), unless another shift has started since.
 */
export async function reopenShift(
  db: SQLiteDatabase,
  ended: { shift: Shift; pauseEnded: boolean },
): Promise<Shift | null> {
  let result: Shift | null = null;
  await inWriteTransaction(db, async () => {
    const later = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM shifts WHERE id != ? AND (ended_at IS NULL OR started_at >= ?) LIMIT 1;',
      ended.shift.id,
      ended.shift.startedAt,
    );
    if (later || !ended.shift.endedAt) return;
    await db.runAsync('UPDATE shifts SET ended_at = NULL WHERE id = ?;', ended.shift.id);
    if (ended.pauseEnded) {
      await db.runAsync(
        'UPDATE shift_pauses SET ended_at = NULL WHERE shift_id = ? AND ended_at = ?;',
        ended.shift.id,
        ended.shift.endedAt,
      );
    }
    result = { ...ended.shift, endedAt: null };
  });
  return result;
}

/** Pauses the open shift (a personal errand): drives from now until it's resumed aren't work. */
export async function pauseShift(db: SQLiteDatabase, now = new Date()): Promise<ShiftPause | null> {
  let result: ShiftPause | null = null;
  await inWriteTransaction(db, async () => {
    const open = await openShift(db, now);
    if (!open) return;
    const running = await db.getFirstAsync<PauseRow>(
      'SELECT * FROM shift_pauses WHERE shift_id = ? AND ended_at IS NULL LIMIT 1;',
      open.id,
    );
    if (running) {
      result = pauseFromRow(running);
      return;
    }
    const pause: ShiftPause = { id: Crypto.randomUUID(), shiftId: open.id, startedAt: now.toISOString(), endedAt: null };
    await db.runAsync(
      'INSERT INTO shift_pauses (id, shift_id, started_at, ended_at) VALUES (?, ?, ?, NULL);',
      pause.id,
      pause.shiftId,
      pause.startedAt,
    );
    result = pause;
  });
  return result;
}

/** Back to work after a pause. A drive that ran across the pause is cut where it began and ended. */
export async function resumeShift(db: SQLiteDatabase, now = new Date()): Promise<void> {
  await inWriteTransaction(db, async () => {
    const open = await openShift(db, now);
    if (!open) return;
    await db.runAsync(
      'UPDATE shift_pauses SET ended_at = ? WHERE shift_id = ? AND ended_at IS NULL;',
      now.toISOString(),
      open.id,
    );
    await cutUnlocked(db, open);
  });
}

/** The running pause of the open shift, if any. */
export async function currentPause(db: SQLiteDatabase): Promise<ShiftPause | null> {
  const row = await db.getFirstAsync<PauseRow>(
    `SELECT p.* FROM shift_pauses p JOIN shifts s ON s.id = p.shift_id
     WHERE p.ended_at IS NULL AND s.ended_at IS NULL ORDER BY p.started_at DESC LIMIT 1;`,
  );
  return row ? pauseFromRow(row) : null;
}

export async function listShifts(db: SQLiteDatabase): Promise<Shift[]> {
  return (await db.getAllAsync<ShiftRow>('SELECT * FROM shifts ORDER BY started_at DESC;')).map(fromRow);
}

export async function listPauses(db: SQLiteDatabase, shiftId?: string): Promise<ShiftPause[]> {
  const rows = shiftId
    ? await db.getAllAsync<PauseRow>('SELECT * FROM shift_pauses WHERE shift_id = ? ORDER BY started_at;', shiftId)
    : await db.getAllAsync<PauseRow>('SELECT * FROM shift_pauses ORDER BY started_at;');
  return rows.map(pauseFromRow);
}

/**
 * Corrects a shift's start or end afterwards ("I started at 10:40, not 11:15").
 * Times are kept in order and clear of the shifts before and after it, an
 * end can't be in the future, and a shift can't run past 16 hours. Drives
 * then join or leave the shift by when they started, and a drive that now
 * runs past the end is cut there. Returns the shift as saved.
 */
export async function editShiftTimes(
  db: SQLiteDatabase,
  id: string,
  changes: { startedAt?: Date; endedAt?: Date },
  now = new Date(),
): Promise<Shift | null> {
  let result: Shift | null = null;
  await inWriteTransaction(db, async () => {
    const row = await db.getFirstAsync<ShiftRow>('SELECT * FROM shifts WHERE id = ?;', id);
    if (!row) return;
    const shift = fromRow(row);
    const before = await db.getFirstAsync<ShiftRow>(
      'SELECT * FROM shifts WHERE started_at < ? AND id != ? ORDER BY started_at DESC LIMIT 1;',
      shift.startedAt,
      id,
    );
    const after = await db.getFirstAsync<ShiftRow>(
      'SELECT * FROM shifts WHERE started_at > ? AND id != ? ORDER BY started_at LIMIT 1;',
      shift.startedAt,
      id,
    );
    const minute = 60_000;
    const floor = before ? Date.parse(before.ended_at ?? before.started_at) : -Infinity;
    const ceiling = Math.min(now.getTime(), after ? Date.parse(after.started_at) : Infinity);
    let end = shift.endedAt ? Date.parse(changes.endedAt?.toISOString() ?? shift.endedAt) : null;
    let start = (changes.startedAt ?? new Date(shift.startedAt)).getTime();
    start = Math.max(start, floor);
    if (end !== null) {
      end = Math.min(end, ceiling);
      start = Math.min(start, end - minute);
      end = Math.min(Math.max(end, start + minute), start + MAX_SHIFT_MS);
    } else {
      // An open shift can't be moved back past 16 hours: it would end itself, in the past, unannounced.
      start = Math.min(Math.max(start, now.getTime() - MAX_SHIFT_MS + minute), now.getTime());
    }
    const saved: Shift = {
      id,
      startedAt: new Date(start).toISOString(),
      endedAt: end === null ? null : new Date(end).toISOString(),
    };
    await db.runAsync('UPDATE shifts SET started_at = ?, ended_at = ? WHERE id = ?;', saved.startedAt, saved.endedAt, id);
    // Pauses stay inside the shift.
    if (saved.endedAt) {
      await db.runAsync(
        'UPDATE shift_pauses SET ended_at = ? WHERE shift_id = ? AND (ended_at IS NULL OR ended_at > ?);',
        saved.endedAt,
        id,
        saved.endedAt,
      );
      await db.runAsync('DELETE FROM shift_pauses WHERE shift_id = ? AND started_at >= ?;', id, saved.endedAt);
    }
    await rederiveUnlocked(db, saved, now);
    result = saved;
  });
  return result;
}

/**
 * Re-files automatic drives after a shift's times changed: those that start
 * in its working time join it, those that no longer do leave it. A drive
 * that started in the grace after the end keeps what it had. Then any drive
 * running across the end or a pause is cut.
 */
async function rederiveUnlocked(db: SQLiteDatabase, shift: Shift, now: Date): Promise<void> {
  const start = Date.parse(shift.startedAt);
  const end = shift.endedAt ? Date.parse(shift.endedAt) : now.getTime();
  const pauses = await listPauses(db, shift.id);
  const spans = workSpans(shift, pauses, end);
  const working = (at: number) => spans.some((span) => at >= span.start && at < span.end);
  // A drive running across the start (it was moved into it) is cut there: the part after is work.
  const across = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM trips
     WHERE source = 'auto' AND off_shift_id IS NULL AND (shift_id IS NULL OR shift_id = ?)
       AND started_at < ? AND ended_at > ?;`,
    shift.id,
    shift.startedAt,
    shift.startedAt,
  );
  for (const row of across) {
    await splitTripUnlocked(db, row.id, new Date(start), SHIFT_START_LABEL, { shiftId: shift.id });
  }
  const rows = await db.getAllAsync<{ id: string; started_at: string; shift_id: string | null }>(
    `SELECT id, started_at, shift_id FROM trips
     WHERE source = 'auto' AND (shift_id = ? OR off_shift_id = ? OR (shift_id IS NULL AND off_shift_id IS NULL AND started_at >= ? AND started_at < ?));`,
    shift.id,
    shift.id,
    shift.startedAt,
    new Date(end).toISOString(),
  );
  for (const row of rows) {
    const at = Date.parse(row.started_at);
    if (at >= end && at <= end + SHIFT_GRACE_MS && row.shift_id === shift.id) continue;
    const member = at >= start && working(at);
    if (member && row.shift_id !== shift.id) await setTripShiftUnlocked(db, row.id, shift.id);
    if (!member && row.shift_id === shift.id) await setTripShiftUnlocked(db, row.id, null);
  }
  await cutUnlocked(db, shift, now);
}

/**
 * Cuts the shift's drives where work stopped or started while they went on
 * (its end, a pause): the part outside working time leaves the shift,
 * unsorted; a part back in it after a pause is work again.
 */
async function cutUnlocked(db: SQLiteDatabase, shift: Shift, now = new Date()): Promise<void> {
  const pauses = await listPauses(db, shift.id);
  const end = shift.endedAt ? Date.parse(shift.endedAt) : now.getTime();
  const spans = workSpans(shift, pauses, end);
  const rows = await db.getAllAsync<{ id: string; started_at: string; ended_at: string }>(
    `SELECT id, started_at, ended_at FROM trips
     WHERE shift_id = ? AND ended_at IS NOT NULL AND started_at < ? AND ended_at > started_at;`,
    shift.id,
    new Date(end).toISOString(),
  );
  for (const row of rows) {
    const legs = legsOf(Date.parse(row.started_at), Date.parse(row.ended_at), spans);
    let current = row.id;
    for (const leg of legs.slice(1)) {
      const part = await splitTripUnlocked(
        db,
        current,
        new Date(leg.start),
        SHIFT_END_LABEL,
        leg.working ? { shiftId: shift.id } : { offShiftId: shift.id },
      );
      if (!part) break;
      current = part.id;
    }
  }
}

/** The shift a drive that started at `startedAt` belongs to, if any (none while it was paused). */
export async function shiftAt(db: SQLiteDatabase, startedAt: string): Promise<Shift | null> {
  const around = await shiftAround(db, startedAt);
  if (!around) return null;
  const at = Date.parse(startedAt);
  const paused = around.pauses.some(
    (pause) => at >= Date.parse(pause.startedAt) && (pause.endedAt === null || at < Date.parse(pause.endedAt)),
  );
  return paused ? null : around.shift;
}

/**
 * The shift whose time (plus the grace after its end) a drive starting at
 * `startedAt` falls in, with its pauses: what's needed to cut the drive into
 * working and non-working legs.
 */
export async function shiftAround(
  db: SQLiteDatabase,
  startedAt: string,
): Promise<{ shift: Shift; pauses: ShiftPause[] } | null> {
  const rows = await db.getAllAsync<ShiftRow>(
    'SELECT * FROM shifts WHERE started_at <= ? ORDER BY started_at DESC LIMIT 1;',
    startedAt,
  );
  const shift = rows[0] ? fromRow(rows[0]) : null;
  if (!shift) return null;
  const ends = shift.endedAt === null ? Date.parse(shift.startedAt) + MAX_SHIFT_MS : Date.parse(shift.endedAt) + SHIFT_GRACE_MS;
  if (Date.parse(startedAt) > ends) return null;
  return { shift, pauses: await listPauses(db, shift.id) };
}
