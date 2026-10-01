import { describe, expect, it, jest } from '@jest/globals';

import { DatabaseTooNewError, migrate, SCHEMA_VERSION } from '../migrations';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';

// Hoisted above the import by babel-jest: migrate() sees an iPhone.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

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
      DROP TABLE tracker_route;
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
