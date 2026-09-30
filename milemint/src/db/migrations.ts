import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Ordered schema migrations; the array index + 1 is the schema version stored
 * in PRAGMA user_version. Never edit a shipped migration — append a new one.
 */
const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE trips (
    id TEXT PRIMARY KEY NOT NULL,
    started_at TEXT NOT NULL,
    local_date TEXT NOT NULL,
    ended_at TEXT,
    start_label TEXT NOT NULL,
    end_label TEXT NOT NULL,
    distance_meters INTEGER NOT NULL CHECK (distance_meters >= 0),
    classification TEXT NOT NULL CHECK (classification IN ('unclassified', 'business', 'personal')),
    purpose TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL CHECK (source IN ('manual', 'auto')),
    created_at TEXT NOT NULL
  );
  CREATE INDEX trips_local_date ON trips (local_date);

  -- Append-only history of every change, so an auditor can see which trips
  -- were recorded at the time and what was edited later (IRS Pub 463).
  CREATE TABLE trip_edits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id TEXT NOT NULL,
    at TEXT NOT NULL,
    action TEXT NOT NULL,
    field TEXT,
    old_value TEXT,
    new_value TEXT
  );
  CREATE INDEX trip_edits_trip ON trip_edits (trip_id);
  `,
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const current = row?.user_version ?? 0;
  for (let version = current; version < MIGRATIONS.length; version++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1};`);
    });
  }
}
