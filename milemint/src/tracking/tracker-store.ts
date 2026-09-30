import type { SQLiteDatabase } from 'expo-sqlite';

import { INITIAL_TRACKER_RECORD, type TrackerRecord } from '@/domain/tracker-policy';

export async function loadTrackerRecord(db: SQLiteDatabase): Promise<TrackerRecord> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM tracker_state WHERE id = 1;');
  if (!row) return INITIAL_TRACKER_RECORD;
  try {
    return { ...INITIAL_TRACKER_RECORD, ...(JSON.parse(row.json) as TrackerRecord) };
  } catch {
    return INITIAL_TRACKER_RECORD;
  }
}

export async function saveTrackerRecord(db: SQLiteDatabase, record: TrackerRecord): Promise<void> {
  await db.runAsync(
    'INSERT INTO tracker_state (id, json) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET json = excluded.json;',
    JSON.stringify(record),
  );
}
