import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

/** A working shift in shift mode (couriers, gig drivers). */
export type Shift = { id: string; startedAt: string; endedAt: string | null };

type ShiftRow = { id: string; started_at: string; ended_at: string | null };

const fromRow = (row: ShiftRow): Shift => ({ id: row.id, startedAt: row.started_at, endedAt: row.ended_at });

/**
 * A drive still counts towards a shift if it started up to this long after the
 * shift was ended: the last drive home is often only saved once parked.
 */
export const SHIFT_GRACE_MS = 10 * 60_000;

/** A shift left running ends by itself after this long (nobody works a 16-hour delivery shift). */
export const MAX_SHIFT_MS = 16 * 60 * 60_000;

export async function currentShift(db: SQLiteDatabase, now = new Date()): Promise<Shift | null> {
  const row = await db.getFirstAsync<ShiftRow>(
    'SELECT * FROM shifts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1;',
  );
  if (!row) return null;
  const shift = fromRow(row);
  const cutoff = Date.parse(shift.startedAt) + MAX_SHIFT_MS;
  if (now.getTime() <= cutoff) return shift;
  // Forgotten: close it at its 16-hour mark, so later drives aren't counted as work.
  await db.runAsync('UPDATE shifts SET ended_at = ? WHERE id = ?;', new Date(cutoff).toISOString(), shift.id);
  return null;
}

export async function startShift(db: SQLiteDatabase, now = new Date()): Promise<Shift> {
  const open = await currentShift(db);
  if (open) return open;
  const shift: Shift = { id: Crypto.randomUUID(), startedAt: now.toISOString(), endedAt: null };
  await db.runAsync(
    'INSERT INTO shifts (id, started_at, ended_at) VALUES (?, ?, NULL);',
    shift.id,
    shift.startedAt,
  );
  return shift;
}

export async function endShift(db: SQLiteDatabase, now = new Date()): Promise<void> {
  await db.runAsync('UPDATE shifts SET ended_at = ? WHERE ended_at IS NULL;', now.toISOString());
}

/** The shift a drive that started at `startedAt` belongs to, if any. */
export async function shiftAt(db: SQLiteDatabase, startedAt: string): Promise<Shift | null> {
  const rows = await db.getAllAsync<ShiftRow>(
    'SELECT * FROM shifts WHERE started_at <= ? ORDER BY started_at DESC LIMIT 1;',
    startedAt,
  );
  const shift = rows[0] ? fromRow(rows[0]) : null;
  if (!shift) return null;
  const ends = shift.endedAt === null ? Date.parse(shift.startedAt) + MAX_SHIFT_MS : Date.parse(shift.endedAt) + SHIFT_GRACE_MS;
  return Date.parse(startedAt) <= ends ? shift : null;
}
