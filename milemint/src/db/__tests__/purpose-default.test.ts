import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { buildReport } from '@/domain/report';
import { REGIONS } from '@/domain/regions';

import { migrate } from '../migrations';
import { DEFAULT_SETTINGS, parseSettings, updateSettings } from '../settings-repo';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';
import { getTrip, insertTrip, listTrips, setClassification, updateTripDetails, type NewTrip } from '../trips-repo';

jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

/*
 * The usual business purpose: checked when read from settings, filled in when
 * the user taps Business on a drive without one, logged as filled in by the
 * app, and marked so the trip list can offer to check it. Real SQLite
 * (node:sqlite); skipped on a Node without it.
 */
const describeSqlite = available ? describe : describe.skip;

async function database(): Promise<TestDatabase & SQLiteDatabase> {
  const db = openTestDatabase() as unknown as TestDatabase & SQLiteDatabase;
  await migrate(db);
  return db;
}

let seconds = 0;
const newTrip = (extra: Partial<NewTrip> = {}): NewTrip => {
  const startedAt = new Date(Date.UTC(2026, 4, 1, 8, 0, seconds++)).toISOString();
  return {
    startedAt,
    localDate: '2026-05-01',
    endedAt: startedAt,
    startLabel: 'Home',
    endLabel: 'Client',
    distanceMeters: 10_000,
    classification: 'unclassified',
    purpose: '',
    source: 'auto',
    ...extra,
  };
};

const purposeEdits = (db: TestDatabase, tripId: string) =>
  db
    .rows<{ action: string; old_value: string | null; new_value: string | null }>(
      "SELECT action, old_value, new_value FROM trip_edits WHERE trip_id = ? AND field = 'purpose' ORDER BY id;",
      tripId,
    )
    .map((edit) => [edit.action, edit.old_value, edit.new_value]);

describe('defaultPurpose setting', () => {
  it('is none by default', () => {
    expect(DEFAULT_SETTINGS.defaultPurpose).toBeNull();
  });

  it('keeps a purpose, trimmed', () => {
    expect(parseSettings(JSON.stringify({ defaultPurpose: '  Client meeting ' })).defaultPurpose).toBe('Client meeting');
  });

  it('reads blank as none, and cuts an over-long one short', () => {
    expect(parseSettings(JSON.stringify({ defaultPurpose: '   ' })).defaultPurpose).toBeNull();
    expect(parseSettings(JSON.stringify({ defaultPurpose: 'x'.repeat(500) })).defaultPurpose).toHaveLength(80);
  });

  it.each([5, true, ['Client meeting'], { text: 'Site visit' }])('falls back to none for %p', (value) => {
    expect(parseSettings(JSON.stringify({ defaultPurpose: value, onboarded: true }))).toEqual({
      ...DEFAULT_SETTINGS,
      onboarded: true,
    });
  });
});

describeSqlite('tapping Business on a drive without a purpose', () => {
  it('fills in the usual purpose, logged as filled in by the app, and marked to check', async () => {
    const db = await database();
    await updateSettings(db, { defaultPurpose: 'Client meeting' });
    const trip = await insertTrip(db, newTrip());
    await setClassification(db, trip, 'business');
    expect(await getTrip(db, trip.id)).toMatchObject({ classification: 'business', purpose: 'Client meeting' });
    expect(purposeEdits(db, trip.id)).toEqual([['auto', '', 'Client meeting']]);
    expect((await listTrips(db)).find((t) => t.id === trip.id)?.purposeFilled).toBe(true);
  });

  it('uses Deliveries in shift mode when no usual purpose is chosen', async () => {
    const db = await database();
    await updateSettings(db, { shiftMode: true });
    const trip = await insertTrip(db, newTrip());
    await setClassification(db, trip, 'business');
    expect((await getTrip(db, trip.id))?.purpose).toBe('Deliveries');
  });

  it('leaves a purpose the drive already has, and fills nothing without a usual one', async () => {
    const db = await database();
    const bare = await insertTrip(db, newTrip());
    await setClassification(db, bare, 'business');
    expect((await getTrip(db, bare.id))?.purpose).toBe('');

    await updateSettings(db, { defaultPurpose: 'Client meeting' });
    const named = await insertTrip(db, newTrip({ purpose: 'Site visit' }));
    await setClassification(db, named, 'business');
    expect((await getTrip(db, named.id))?.purpose).toBe('Site visit');
    expect(purposeEdits(db, named.id)).toEqual([]);
  });

  it('fills nothing in when the drive is marked personal', async () => {
    const db = await database();
    await updateSettings(db, { defaultPurpose: 'Client meeting' });
    const trip = await insertTrip(db, newTrip());
    await setClassification(db, trip, 'personal');
    expect((await getTrip(db, trip.id))?.purpose).toBe('');
  });

  it('bulk sort fills each drive in', async () => {
    const db = await database();
    await updateSettings(db, { defaultPurpose: 'Site visit' });
    const trips = [await insertTrip(db, newTrip()), await insertTrip(db, newTrip())];
    for (const trip of trips) await setClassification(db, trip, 'business');
    for (const trip of trips) expect((await getTrip(db, trip.id))?.purpose).toBe('Site visit');
  });

  it('a purpose the user then picks, or saves unchanged, is theirs: no longer marked', async () => {
    const db = await database();
    await updateSettings(db, { defaultPurpose: 'Client meeting' });
    const changed = await insertTrip(db, newTrip());
    const kept = await insertTrip(db, newTrip());
    await setClassification(db, changed, 'business');
    await setClassification(db, kept, 'business');
    await updateTripDetails(db, changed, { purpose: 'Buying supplies' });
    await updateTripDetails(db, kept, { purpose: 'Client meeting' });
    const listed = await listTrips(db);
    expect(listed.find((t) => t.id === changed.id)?.purposeFilled).toBeUndefined();
    expect(listed.find((t) => t.id === kept.id)?.purposeFilled).toBeUndefined();
    expect(purposeEdits(db, kept.id)).toEqual([
      ['auto', '', 'Client meeting'],
      ['update', 'Client meeting', 'Client meeting'],
    ]);
  });
});

describe('report', () => {
  it('counts business drives with no purpose', () => {
    const trip = (id: string, extra: object) => ({
      ...newTrip(),
      id,
      createdAt: '2026-05-01T08:00:00Z',
      startPlaceId: null,
      endPlaceId: null,
      autoReason: null,
      vehicle: 'car' as const,
      vehicleId: null,
      shiftId: null,
      ...extra,
    });
    const report = buildReport(
      [
        trip('a', { classification: 'business', purpose: '' }),
        trip('b', { classification: 'business', purpose: 'Client meeting' }),
        trip('c', { classification: 'personal', purpose: '' }),
        trip('d', { classification: 'business', purpose: '  ' }),
      ],
      REGIONS.GB,
      2026,
      {},
    );
    expect(report.missingPurposeCount).toBe(2);
  });
});
