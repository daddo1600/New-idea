import type { SQLiteDatabase } from 'expo-sqlite';

import { withWriteLock } from './transaction';

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
