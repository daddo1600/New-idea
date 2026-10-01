import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

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
  `
  -- Route polyline for the trip map, as a JSON array of {latitude, longitude}.
  CREATE TABLE trip_routes (
    trip_id TEXT PRIMARY KEY NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
    points TEXT NOT NULL
  );

  -- Single-row store for the background tracker, which may be killed between wake-ups.
  CREATE TABLE tracker_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    json TEXT NOT NULL
  );
  `,
  `
  -- Named places (home, work, clients) for labels, learned routes and commutes.
  CREATE TABLE places (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius_m REAL NOT NULL CHECK (radius_m > 0),
    kind TEXT NOT NULL CHECK (kind IN ('home', 'work', 'client', 'other')),
    created_at TEXT NOT NULL
  );

  -- Single-row store for user preferences such as work hours.
  CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    json TEXT NOT NULL
  );

  -- Deleting a place only unlinks trips; their labels and history stay.
  ALTER TABLE trips ADD COLUMN start_place_id TEXT REFERENCES places (id) ON DELETE SET NULL;
  ALTER TABLE trips ADD COLUMN end_place_id TEXT REFERENCES places (id) ON DELETE SET NULL;
  -- Set when a rule classified the trip, cleared when the user classifies it.
  ALTER TABLE trips ADD COLUMN auto_reason TEXT
    CHECK (auto_reason IN ('learned-route', 'work-hours', 'commute'));
  `,
  `
  -- Odometer at the start and end of each tax year, in the region's unit.
  -- CRA needs them for the business-use share; any report can show them.
  CREATE TABLE odometer_readings (
    region TEXT NOT NULL,
    tax_year INTEGER NOT NULL,
    start_reading REAL CHECK (start_reading IS NULL OR start_reading >= 0),
    end_reading REAL CHECK (end_reading IS NULL OR end_reading >= 0),
    PRIMARY KEY (region, tax_year)
  );
  `,
  `
  -- What each trip was driven in: tax offices price cars, motorbikes and bicycles differently.
  ALTER TABLE trips ADD COLUMN vehicle TEXT NOT NULL DEFAULT 'car'
    CHECK (vehicle IN ('car', 'motorbike', 'bicycle'));
  -- Shift mode (couriers): the shift a drive belongs to. Drives in one shift
  -- are marked business and count as one drive towards the free plan.
  ALTER TABLE trips ADD COLUMN shift_id TEXT;
  CREATE TABLE shifts (
    id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    ended_at TEXT
  );
  `,
  `
  -- Marked business only because new drives start as business (no rule
  -- applied). Kept apart from auto_reason, whose CHECK predates it; cleared
  -- like auto_reason when the user classifies the trip.
  ALTER TABLE trips ADD COLUMN auto_default INTEGER NOT NULL DEFAULT 0;
  `,
  `
  -- The user's vehicles; each trip records the one it was driven in (couriers
  -- often have a car and a moped). Removing a vehicle hides it, trips keep it.
  CREATE TABLE vehicles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('car', 'motorbike', 'bicycle')),
    registration TEXT,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  ALTER TABLE trips ADD COLUMN vehicle_id TEXT REFERENCES vehicles (id) ON DELETE SET NULL;
  `,
  `
  -- ATO logbook method (Australia): a 12-week period per car that gives its
  -- business-use percentage. end_date is planned 12 weeks after start_date and
  -- only moves earlier if the user closes it early (then it isn't valid).
  -- Odometer readings are in km, null until entered.
  CREATE TABLE logbooks (
    id TEXT PRIMARY KEY NOT NULL,
    vehicle_id TEXT NOT NULL REFERENCES vehicles (id),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL CHECK (end_date >= start_date),
    odometer_start REAL CHECK (odometer_start IS NULL OR odometer_start >= 0),
    odometer_end REAL CHECK (odometer_end IS NULL OR odometer_end >= 0),
    created_at TEXT NOT NULL
  );
  CREATE INDEX logbooks_vehicle ON logbooks (vehicle_id);

  -- A car's running costs for an income year (JSON of cents per category),
  -- for the logbook method's deduction estimate.
  CREATE TABLE car_expenses (
    vehicle_id TEXT NOT NULL REFERENCES vehicles (id),
    tax_year INTEGER NOT NULL,
    json TEXT NOT NULL,
    PRIMARY KEY (vehicle_id, tax_year)
  );
  `,
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const run = async (txn: Pick<SQLiteDatabase, 'getFirstAsync' | 'execAsync'>) => {
    const row = await txn.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    const current = row?.user_version ?? 0;
    for (let version = current; version < MIGRATIONS.length; version++) {
      await txn.execAsync(MIGRATIONS[version]);
    }
    if (current < MIGRATIONS.length) {
      await txn.execAsync(`PRAGMA user_version = ${MIGRATIONS.length};`);
    }
  };
  // The web preview has a single connection and no locking to worry about.
  if (Platform.OS === 'web') return db.withTransactionAsync(() => run(db));
  // On devices the app and a background location wake-up can open the database
  // at the same moment. BEGIN IMMEDIATE takes the write lock up front (waiting
  // out the other side via busy_timeout), and the version is re-read inside.
  // Not withExclusiveTransactionAsync: that opens a second connection which
  // never received the SQLCipher key, so it can't read the encrypted file
  // ("file is not a database") and the app failed on launch.
  await db.execAsync('BEGIN IMMEDIATE;');
  try {
    await run(db);
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;').catch(() => {});
    throw error;
  }
}
