import { describe, expect, it, jest } from '@jest/globals';

import {
  addPlatformEarning,
  deletePlatformEarning,
  listPlatformEarnings,
  listWeeklyEarnings,
  saveWeeklyEarnings,
} from '../earnings-repo';
import { DatabaseTooNewError, migrate, SCHEMA_VERSION } from '../migrations';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';

// Hoisted above the import by babel-jest: migrate() sees an iPhone.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

/** A fake connection recording every statement, like the keyed SQLCipher connection. */
function fakeDb(userVersion: number) {
  const statements: string[] = [];
  const db = {
    statements,
    getFirstAsync: async () => ({ user_version: userVersion }),
    execAsync: async (sql: string) => {
      statements.push(sql.trim().split('\n')[0]);
    },
    withExclusiveTransactionAsync: async () => {
      throw new Error('opens an unkeyed second connection');
    },
    withTransactionAsync: async () => {
      throw new Error('not used on devices');
    },
  };
  return db;
}

describe('migrate on a device', () => {
  it('migrates on the same (keyed) connection inside BEGIN IMMEDIATE', async () => {
    const db = fakeDb(0);
    await migrate(db as never);
    expect(db.statements[0]).toBe('BEGIN IMMEDIATE;');
    expect(db.statements.at(-1)).toBe('COMMIT;');
    expect(db.statements.some((s) => s.startsWith('PRAGMA user_version ='))).toBe(true);
  });

  it('does nothing but begin and commit when already up to date', async () => {
    const db = fakeDb(SCHEMA_VERSION);
    await migrate(db as never);
    expect(db.statements).toEqual(['BEGIN IMMEDIATE;', 'COMMIT;']);
  });

  it('refuses a database from a newer build: nothing migrated or written, a clear error', async () => {
    const db = fakeDb(SCHEMA_VERSION + 1);
    const result = migrate(db as never);
    await expect(result).rejects.toBeInstanceOf(DatabaseTooNewError);
    await expect(result).rejects.toMatchObject({ code: 'newer-app', databaseVersion: SCHEMA_VERSION + 1 });
    expect(db.statements).toEqual(['BEGIN IMMEDIATE;', 'ROLLBACK;']);
  });

  it('rolls back and reports a failed migration', async () => {
    const db = fakeDb(0);
    db.execAsync = async (sql: string) => {
      db.statements.push(sql.trim().split('\n')[0]);
      if (sql.includes('CREATE TABLE trips')) throw new Error('disk full');
    };
    await expect(migrate(db as never)).rejects.toThrow('disk full');
    expect(db.statements.at(-1)).toBe('ROLLBACK;');
  });
});

const describeSqlite = available ? describe : describe.skip;

describeSqlite('migration 10: indexes and the drive-in-progress route', () => {
  const plan = (db: TestDatabase, sql: string, ...params: unknown[]) =>
    db
      .rows<{ detail: string }>(`EXPLAIN QUERY PLAN ${sql}`, ...params)
      .map((row) => row.detail)
      .join(' | ');

  it('upgrades a version 9 database, keeping its trips, and the frequent lookups use the indexes', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    // Back to how version 9 left it.
    db.raw.exec(`
      ALTER TABLE trips DROP COLUMN parking_minor;
      ALTER TABLE trips DROP COLUMN tolls_minor;
      DROP TABLE tracker_route;
      DROP TABLE weekly_earnings;
      DROP TABLE platform_earnings;
      DROP TABLE perk_claims;
      DROP INDEX trips_started_at;
      DROP INDEX trips_local_date_started_at;
      DROP INDEX trips_shift;
      DROP INDEX trip_edits_updates;
      CREATE INDEX trips_local_date ON trips (local_date);
      PRAGMA user_version = 9;
      INSERT INTO trips (id, started_at, local_date, start_label, end_label, distance_meters, classification, source, created_at)
        VALUES ('t1', '2026-05-01T08:00:00.000Z', '2026-05-01', 'A', 'B', 1000, 'business', 'auto', '2026-05-01T08:30:00.000Z');
    `);
    await migrate(db as never);
    expect(db.rows<{ user_version: number }>('PRAGMA user_version;')[0].user_version).toBe(SCHEMA_VERSION);
    expect(db.rows('SELECT id FROM trips;')).toEqual([{ id: 't1' }]);
    expect(db.rows('SELECT * FROM tracker_route;')).toEqual([]);

    expect(plan(db, 'SELECT * FROM trips ORDER BY local_date DESC, started_at DESC;')).not.toContain('TEMP B-TREE');
    expect(plan(db, "SELECT 1 FROM trips WHERE source = 'auto' AND started_at = ? LIMIT 1;", 'x')).toContain(
      'trips_started_at',
    );
    expect(plan(db, 'SELECT id FROM trips WHERE shift_id = ? AND ended_at IS NOT NULL;', 's')).toContain('trips_shift');
    expect(
      plan(
        db,
        `SELECT trip_id, MAX(at) AS at FROM trip_edits
          WHERE action = 'update' AND field = 'classification' AND old_value = 'personal' GROUP BY trip_id;`,
      ),
    ).toContain('trip_edits_updates');
    expect(plan(db, "SELECT DISTINCT trip_id FROM trip_edits WHERE action = 'update';")).toContain('trip_edits_updates');
  });
});

describeSqlite('migration 12: weekly earnings for the tax set-aside', () => {
  it('upgrades a version 11 database with an empty table, and a week saves, replaces and clears', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    db.raw.exec(`
      DROP TABLE weekly_earnings;
      DROP TABLE platform_earnings;
      DROP TABLE perk_claims;
      PRAGMA user_version = 11;
    `);
    await migrate(db as never);
    expect(db.rows<{ user_version: number }>('PRAGMA user_version;')[0].user_version).toBe(SCHEMA_VERSION);
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map());

    await saveWeeklyEarnings(db as never, '2026-09-28', 45_000);
    await saveWeeklyEarnings(db as never, '2026-09-21', 30_000);
    await saveWeeklyEarnings(db as never, '2026-09-28', 47_550);
    expect(await listWeeklyEarnings(db as never)).toEqual(
      new Map([
        ['2026-09-21', 30_000],
        ['2026-09-28', 47_550],
      ]),
    );
    await saveWeeklyEarnings(db as never, '2026-09-21', null);
    expect([...(await listWeeklyEarnings(db as never)).keys()]).toEqual(['2026-09-28']);
  });
});

describeSqlite('migration 13: earnings by platform', () => {
  const uberWeek = {
    platform: 'uber-eats' as const,
    start: '2026-09-21',
    end: '2026-09-27',
    amountMinor: 41_235,
    trips: 18,
    distanceMeters: 229_008.6,
  };

  it('upgrades a version 12 database, keeping its weekly earnings', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    db.raw.exec(`
      DROP TABLE platform_earnings;
      DROP TABLE perk_claims;
      PRAGMA user_version = 12;
    `);
    await saveWeeklyEarnings(db as never, '2026-09-21', 30_000);
    expect(SCHEMA_VERSION).toBeGreaterThanOrEqual(13);
    await migrate(db as never);
    expect(db.rows<{ user_version: number }>('PRAGMA user_version;')[0].user_version).toBe(SCHEMA_VERSION);
    expect(await listPlatformEarnings(db as never)).toEqual([]);
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map([['2026-09-21', 30_000]]));
  });

  it('saves an entry, adding it to the week’s earnings, and deleting takes it back off', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    await saveWeeklyEarnings(db as never, '2026-09-21', 10_000);

    const added = await addPlatformEarning(db as never, uberWeek, '2026-09-21');
    expect(added.distanceMeters).toBe(229_009);
    const kept = await addPlatformEarning(db as never, { ...uberWeek, platform: 'deliveroo', amountMinor: 5_000, trips: null, distanceMeters: null }, null);
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map([['2026-09-21', 51_235]]));
    expect(await listPlatformEarnings(db as never)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...uberWeek, distanceMeters: 229_009, addedToWeek: '2026-09-21' }),
        expect.objectContaining({ id: kept.id, platform: 'deliveroo', trips: null, distanceMeters: null, addedToWeek: null }),
      ]),
    );

    await deletePlatformEarning(db as never, added.id);
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map([['2026-09-21', 10_000]]));
    await deletePlatformEarning(db as never, kept.id);
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map([['2026-09-21', 10_000]]));
    expect(await listPlatformEarnings(db as never)).toEqual([]);
  });

  it('starts a week that had no earnings, and clears it again when the entry goes', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    const added = await addPlatformEarning(db as never, uberWeek, '2026-09-21');
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map([['2026-09-21', 41_235]]));
    // The week was changed by hand in the meantime: never taken below nothing.
    await saveWeeklyEarnings(db as never, '2026-09-21', 20_000);
    await deletePlatformEarning(db as never, added.id);
    expect(await listWeeklyEarnings(db as never)).toEqual(new Map());
  });

  it('reads an app this build doesn’t know as another app', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    db.raw.exec(`
      INSERT INTO platform_earnings (id, platform, period_start, period_end, amount_minor, created_at)
        VALUES ('x', 'bolt-food', '2026-09-21', '2026-09-21', 1000, '2026-09-22T00:00:00.000Z');
    `);
    expect((await listPlatformEarnings(db as never))[0]).toMatchObject({ platform: 'other', trips: null, addedToWeek: null });
  });
});
