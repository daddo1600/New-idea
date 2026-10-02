import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { isPlatformId, type EarningDraft, type PlatformEarning } from '@/domain/earnings-scan';

import { inWriteTransaction, withWriteLock } from './transaction';

/** Tax set-aside: every week's earnings (all platforms together), keyed by the week's Monday, minor units. */
export async function listWeeklyEarnings(db: Pick<SQLiteDatabase, 'getAllAsync'>): Promise<Map<string, number>> {
  const rows = await db.getAllAsync<{ week_start: string; amount_minor: number }>(
    'SELECT week_start, amount_minor FROM weekly_earnings ORDER BY week_start;',
  );
  return new Map(rows.map((row) => [row.week_start, row.amount_minor]));
}

/** Saves a week's earnings; null clears the week. */
export async function saveWeeklyEarnings(db: SQLiteDatabase, weekStart: string, amountMinor: number | null): Promise<void> {
  await withWriteLock(() =>
    amountMinor === null
      ? db.runAsync('DELETE FROM weekly_earnings WHERE week_start = ?;', weekStart)
      : db.runAsync(
          `INSERT INTO weekly_earnings (week_start, amount_minor, updated_at) VALUES (?, ?, ?)
           ON CONFLICT (week_start) DO UPDATE SET amount_minor = excluded.amount_minor, updated_at = excluded.updated_at;`,
          weekStart,
          amountMinor,
          new Date().toISOString(),
        ),
  );
}

type PlatformEarningRow = {
  id: string;
  platform: string;
  period_start: string;
  period_end: string;
  amount_minor: number;
  trip_count: number | null;
  distance_meters: number | null;
  added_to_week: string | null;
  created_at: string;
};

/** Earnings by platform, newest days first. A platform this build doesn't know reads as "other". */
export async function listPlatformEarnings(db: Pick<SQLiteDatabase, 'getAllAsync'>): Promise<PlatformEarning[]> {
  const rows = await db.getAllAsync<PlatformEarningRow>(
    'SELECT * FROM platform_earnings ORDER BY period_end DESC, period_start DESC, created_at DESC;',
  );
  return rows.map((row) => ({
    id: row.id,
    platform: isPlatformId(row.platform) ? row.platform : 'other',
    start: row.period_start,
    end: row.period_end,
    amountMinor: row.amount_minor,
    trips: row.trip_count,
    distanceMeters: row.distance_meters,
    addedToWeek: row.added_to_week,
    createdAt: row.created_at,
  }));
}

/**
 * Saves one app's earnings. With `addToWeek` (the Monday of the week the days
 * fall in), the amount is also added to that week's earnings for the tax
 * set-aside, in the same transaction, and remembered so deleting takes it off.
 */
export async function addPlatformEarning(
  db: SQLiteDatabase,
  draft: EarningDraft,
  addToWeek: string | null,
): Promise<PlatformEarning> {
  const entry: PlatformEarning = {
    ...draft,
    distanceMeters: draft.distanceMeters === null ? null : Math.round(draft.distanceMeters),
    id: Crypto.randomUUID(),
    addedToWeek: addToWeek,
    createdAt: new Date().toISOString(),
  };
  await inWriteTransaction(db, async () => {
    await db.runAsync(
      `INSERT INTO platform_earnings
         (id, platform, period_start, period_end, amount_minor, trip_count, distance_meters, added_to_week, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      entry.id,
      entry.platform,
      entry.start,
      entry.end,
      entry.amountMinor,
      entry.trips,
      entry.distanceMeters,
      entry.addedToWeek,
      entry.createdAt,
    );
    if (addToWeek !== null) {
      await db.runAsync(
        `INSERT INTO weekly_earnings (week_start, amount_minor, updated_at) VALUES (?, ?, ?)
         ON CONFLICT (week_start) DO UPDATE SET amount_minor = amount_minor + excluded.amount_minor, updated_at = excluded.updated_at;`,
        addToWeek,
        entry.amountMinor,
        entry.createdAt,
      );
    }
  });
  return entry;
}

/** Deletes an entry; if it was added to a week's earnings, it comes off them again (a week left at nothing is cleared). */
export async function deletePlatformEarning(db: SQLiteDatabase, id: string): Promise<void> {
  await inWriteTransaction(db, async () => {
    // Read inside the transaction: what's stored, not what the screen last showed.
    const row = await db.getFirstAsync<Pick<PlatformEarningRow, 'amount_minor' | 'added_to_week'>>(
      'SELECT amount_minor, added_to_week FROM platform_earnings WHERE id = ?;',
      id,
    );
    if (!row) return;
    await db.runAsync('DELETE FROM platform_earnings WHERE id = ?;', id);
    if (row.added_to_week === null) return;
    await db.runAsync(
      'UPDATE weekly_earnings SET amount_minor = MAX(0, amount_minor - ?), updated_at = ? WHERE week_start = ?;',
      row.amount_minor,
      new Date().toISOString(),
      row.added_to_week,
    );
    await db.runAsync('DELETE FROM weekly_earnings WHERE week_start = ? AND amount_minor = 0;', row.added_to_week);
  });
}
