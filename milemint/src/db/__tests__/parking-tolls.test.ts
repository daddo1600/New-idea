import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { MAX_COST_MINOR } from '@/domain/trip';

import { migrate, SCHEMA_VERSION } from '../migrations';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';
import { inWriteTransaction } from '../transaction';
import {
  deleteTrip,
  getTrip,
  insertTrip,
  listEditedTripIds,
  listTrips,
  splitTripUnlocked,
  updateTripDetails,
  type NewTrip,
} from '../trips-repo';

jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

/*
 * Parking and tolls against real SQLite: the migration, saving and reading
 * them back, the edit log, and a split drive keeping them on its first part.
 * Skipped on a Node without node:sqlite.
 */
const describeSqlite = available ? describe : describe.skip;

async function database(): Promise<TestDatabase & SQLiteDatabase> {
  const db = openTestDatabase() as unknown as TestDatabase & SQLiteDatabase;
  await migrate(db);
  return db;
}

let seconds = 0;
const newTrip = (extra: Partial<NewTrip> = {}): NewTrip => {
  const startedAt = new Date(Date.UTC(2026, 8, 30, 16, 0, seconds++)).toISOString();
  return {
    startedAt,
    localDate: '2026-09-30',
    endedAt: new Date(Date.parse(startedAt) + 30 * 60_000).toISOString(),
    startLabel: 'Depot',
    endLabel: 'Client',
    distanceMeters: 10_000,
    classification: 'business',
    purpose: 'Delivery',
    source: 'auto',
    ...extra,
  };
};

const costEdits = (db: TestDatabase, tripId: string) =>
  db
    .rows<{ action: string; field: string; old_value: string | null; new_value: string | null }>(
      "SELECT action, field, old_value, new_value FROM trip_edits WHERE trip_id = ? AND field IN ('parking_minor', 'tolls_minor') ORDER BY id;",
      tripId,
    )
    .map((edit) => [edit.action, edit.field, edit.old_value, edit.new_value]);

describeSqlite('migration 11: parking and tolls', () => {
  it('upgrades a version 10 database: existing trips get 0 for both', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    // Back to how version 10 left it.
    db.raw.exec(`
      ALTER TABLE trips DROP COLUMN parking_minor;
      ALTER TABLE trips DROP COLUMN tolls_minor;
      DROP TABLE weekly_earnings;
      PRAGMA user_version = 10;
      INSERT INTO trips (id, started_at, local_date, start_label, end_label, distance_meters, classification, source, created_at)
        VALUES ('t1', '2026-05-01T08:00:00.000Z', '2026-05-01', 'A', 'B', 1000, 'business', 'auto', '2026-05-01T08:30:00.000Z');
    `);
    await migrate(db as never);
    expect(db.rows<{ user_version: number }>('PRAGMA user_version;')[0].user_version).toBe(SCHEMA_VERSION);
    expect(db.rows('SELECT id, parking_minor, tolls_minor FROM trips;')).toEqual([
      { id: 't1', parking_minor: 0, tolls_minor: 0 },
    ]);
    const [trip] = await listTrips(db as never);
    expect(trip.parkingMinor).toBe(0);
    expect(trip.tollsMinor).toBe(0);
  });
});

describeSqlite('saving parking and tolls', () => {
  it('a drive saved with them reads them back, logged with the drive (not as an edit)', async () => {
    const db = await database();
    const saved = await insertTrip(db, newTrip({ source: 'manual', parkingMinor: 350, tollsMinor: 1500 }));
    expect(saved.parkingMinor).toBe(350);
    const [listed] = await listTrips(db);
    expect(listed.parkingMinor).toBe(350);
    expect(listed.tollsMinor).toBe(1500);
    expect((await getTrip(db, saved.id))?.tollsMinor).toBe(1500);
    expect(costEdits(db, saved.id)).toEqual([
      ['create', 'parking_minor', null, '350'],
      ['create', 'tolls_minor', null, '1500'],
    ]);
    expect((await listEditedTripIds(db)).has(saved.id)).toBe(false);
  });

  it('a drive saved without them has 0, and no entries for them', async () => {
    const db = await database();
    const saved = await insertTrip(db, newTrip());
    expect(saved.parkingMinor).toBe(0);
    expect(saved.tollsMinor).toBe(0);
    expect(costEdits(db, saved.id)).toEqual([]);
  });

  it('changes are logged like any other field, and only when they change', async () => {
    const db = await database();
    const saved = await insertTrip(db, newTrip());
    await updateTripDetails(db, saved, { parkingMinor: 420, tollsMinor: 0 });
    await updateTripDetails(db, saved, { parkingMinor: 420 });
    await updateTripDetails(db, saved, { parkingMinor: 0, tollsMinor: 250 });
    const trip = await getTrip(db, saved.id);
    expect(trip?.parkingMinor).toBe(0);
    expect(trip?.tollsMinor).toBe(250);
    expect(costEdits(db, saved.id)).toEqual([
      ['update', 'parking_minor', '0', '420'],
      ['update', 'parking_minor', '420', '0'],
      ['update', 'tolls_minor', '0', '250'],
    ]);
    // Added afterwards: the report marks the drive as edited later.
    expect((await listEditedTripIds(db)).has(saved.id)).toBe(true);
  });

  it.each([-1, MAX_COST_MINOR + 1, 3.5, Number.NaN])('refuses %p, saving nothing', async (bad) => {
    const db = await database();
    await expect(insertTrip(db, newTrip({ parkingMinor: bad }))).rejects.toThrow(RangeError);
    expect(await listTrips(db)).toEqual([]);
    const saved = await insertTrip(db, newTrip({ parkingMinor: 100 }));
    await expect(updateTripDetails(db, saved, { purpose: 'Changed', tollsMinor: bad })).rejects.toThrow(RangeError);
    const trip = await getTrip(db, saved.id);
    expect(trip?.purpose).toBe('Delivery');
    expect(trip?.tollsMinor).toBe(0);
  });

  it('takes the largest amount allowed', async () => {
    const db = await database();
    const saved = await insertTrip(db, newTrip({ tollsMinor: MAX_COST_MINOR }));
    expect((await getTrip(db, saved.id))?.tollsMinor).toBe(MAX_COST_MINOR);
  });

  it('a deleted drive keeps them in its history', async () => {
    const db = await database();
    const saved = await insertTrip(db, newTrip({ parkingMinor: 350 }));
    await deleteTrip(db, saved);
    const [entry] = db.rows<{ old_value: string }>(
      "SELECT old_value FROM trip_edits WHERE trip_id = ? AND action = 'delete';",
      saved.id,
    );
    expect(JSON.parse(entry.old_value)).toMatchObject({ parkingMinor: 350, tollsMinor: 0 });
  });
});

describeSqlite('a split drive', () => {
  it('keeps parking and tolls on the first part; the new part has none', async () => {
    const db = await database();
    const saved = await insertTrip(db, newTrip({ parkingMinor: 600, tollsMinor: 250 }));
    const cutAt = new Date(Date.parse(saved.startedAt) + 10 * 60_000);
    let after = null as Awaited<ReturnType<typeof splitTripUnlocked>>;
    await inWriteTransaction(db, async () => {
      after = await splitTripUnlocked(db, saved.id, cutAt, 'Shift ended', { offShiftId: 'shift-1' });
    });
    expect(after).not.toBeNull();
    const first = await getTrip(db, saved.id);
    const second = await getTrip(db, after!.id);
    expect(first?.parkingMinor).toBe(600);
    expect(first?.tollsMinor).toBe(250);
    expect(second?.parkingMinor).toBe(0);
    expect(second?.tollsMinor).toBe(0);
    expect(costEdits(db, saved.id)).toEqual([
      ['create', 'parking_minor', null, '600'],
      ['create', 'tolls_minor', null, '250'],
    ]);
  });
});
