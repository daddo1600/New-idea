import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { migrate, SCHEMA_VERSION } from '@/db/migrations';
import { available, openTestDatabase, type TestDatabase } from '@/db/testing/node-sqlite';
import { insertTrip, listTrips } from '@/db/trips-repo';

import { restoreSnapshot } from '../backup';
import { BACKUP_TABLES, BackupError, emptyTables, makeSnapshot, parseSnapshot, type Row, type Tables } from '../snapshot';

jest.mock('expo-crypto', () => {
  const crypto = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    randomUUID: () => crypto.randomUUID(),
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: async (_algorithm: string, text: string) => crypto.createHash('sha256').update(text).digest('hex'),
  };
});
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
  deleteItemAsync: async () => {},
}));
jest.mock('../../../modules/icloud-backup', () => ({ ICloudBackup: { supported: false } }));

/*
 * Parking and tolls in iCloud backups: they survive a backup and restore,
 * and a backup made before they existed (schema 10) restores with 0 for both.
 */
const describeSqlite = available ? describe : describe.skip;

async function database(): Promise<TestDatabase & SQLiteDatabase> {
  const db = openTestDatabase() as unknown as TestDatabase & SQLiteDatabase;
  await migrate(db);
  return db;
}

/** Every backed-up table as stored, as backUp reads it. */
function readTables(db: TestDatabase): Tables {
  const tables = emptyTables();
  for (const table of BACKUP_TABLES) tables[table] = db.rows<Row>(`SELECT * FROM ${table} ORDER BY rowid;`);
  return tables;
}

const oldTrip: Row = {
  id: 'old',
  started_at: '2026-04-01T08:00:00.000Z',
  local_date: '2026-04-01',
  ended_at: '2026-04-01T08:30:00.000Z',
  start_label: 'Home',
  end_label: 'Client',
  distance_meters: 12_000,
  classification: 'business',
  purpose: 'Visit',
  source: 'auto',
  created_at: '2026-04-01T08:31:00.000Z',
};

describeSqlite('parking and tolls in backups', () => {
  it('survive a backup and restore', async () => {
    const db = await database();
    await insertTrip(db, {
      startedAt: '2026-09-30T08:00:00.000Z',
      localDate: '2026-09-30',
      endedAt: '2026-09-30T08:30:00.000Z',
      startLabel: 'Depot',
      endLabel: 'Client',
      distanceMeters: 8_000,
      classification: 'business',
      purpose: 'Delivery',
      source: 'manual',
      parkingMinor: 350,
      tollsMinor: 1500,
    });
    const snapshot = makeSnapshot(readTables(db), { appVersion: '1.0.0', createdAt: new Date('2026-10-01T09:00:00Z') });
    expect(snapshot.schemaVersion).toBe(SCHEMA_VERSION);
    expect(snapshot.tables.trips[0]).toMatchObject({ parking_minor: 350, tolls_minor: 1500 });

    const restored = await database();
    await restoreSnapshot(restored, parseSnapshot(JSON.stringify(snapshot)));
    const [trip] = await listTrips(restored);
    expect(trip.parkingMinor).toBe(350);
    expect(trip.tollsMinor).toBe(1500);
  });

  it('a backup from before them (schema 10) restores with 0 for both', async () => {
    const old = makeSnapshot(
      { ...emptyTables(), trips: [oldTrip] },
      { appVersion: '0.9.0', createdAt: new Date('2026-09-01T09:00:00Z'), schemaVersion: 10 },
    );
    const parsed = parseSnapshot(JSON.stringify(old));
    expect(parsed.schemaVersion).toBe(SCHEMA_VERSION);
    expect(parsed.tables.trips[0]).toMatchObject({ id: 'old', parking_minor: 0, tolls_minor: 0 });

    const db = await database();
    await restoreSnapshot(db, parsed);
    const [trip] = await listTrips(db);
    expect(trip.id).toBe('old');
    expect(trip.parkingMinor).toBe(0);
    expect(trip.tollsMinor).toBe(0);
  });

  it('a damaged amount is refused rather than restored', () => {
    for (const bad of [-1, 'lots', null]) {
      const snapshot = makeSnapshot(
        { ...emptyTables(), trips: [{ ...oldTrip, parking_minor: bad, tolls_minor: 0 }] },
        { appVersion: '1.0.0', createdAt: new Date('2026-10-01T09:00:00Z') },
      );
      expect(() => parseSnapshot(JSON.stringify(snapshot))).toThrow(BackupError);
    }
  });
});
