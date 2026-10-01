import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { SHIFT_START_LABEL } from '@/domain/shift-split';

import { migrate } from '../migrations';
import { currentShift, editShiftTimes, endShift, MAX_SHIFT_MS, startShift, startShiftFrom } from '../shifts-repo';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';
import { getTrip, insertTrip, listTrips, type NewTrip } from '../trips-repo';

jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

/*
 * Fixing a shift's times afterwards, and starting one late, against real
 * SQLite: the pre-release review's cases. Skipped on a Node without node:sqlite.
 */
const describeSqlite = available ? describe : describe.skip;

async function database(): Promise<TestDatabase & SQLiteDatabase> {
  const db = openTestDatabase() as unknown as TestDatabase & SQLiteDatabase;
  await migrate(db);
  return db;
}

const T0 = Date.UTC(2026, 8, 30, 16, 0);
const at = (minutes: number) => new Date(T0 + minutes * 60_000);
const ROUTE = Array.from({ length: 11 }, (_, i) => ({ latitude: 53.8 + i * 0.004, longitude: -1.55 }));

function drive(start: number, minutes: number, extra: Partial<NewTrip> = {}): NewTrip {
  return {
    startedAt: at(start).toISOString(),
    localDate: '2026-09-30',
    endedAt: at(start + minutes).toISOString(),
    startLabel: 'Nando’s',
    endLabel: 'Cardigan Rd',
    distanceMeters: 10_000,
    classification: 'unclassified',
    purpose: '',
    source: 'auto',
    ...extra,
  };
}
const work = { classification: 'business', purpose: 'Deliveries', autoReason: 'work-hours' } as const;

describeSqlite('shift edits', () => {
  it('starting a shift late never takes in the last shift’s drive home', async () => {
    const db = await database();
    const first = await startShift(db, at(0));
    await insertTrip(db, drive(50, 20, { shiftId: first.id, ...work }), ROUTE);
    await endShift(db, at(60)); // the 60–70 part is cut off, left to sort
    const home = (await listTrips(db)).find((trip) => trip.offShiftId === first.id)!;
    await insertTrip(db, drive(110, 20));
    await startShiftFrom(db, at(60), at(135));
    const after = await getTrip(db, home.id);
    expect(after?.shiftId).toBeNull();
    expect(after?.offShiftId).toBe(first.id);
    expect(after?.classification).toBe('unclassified');
  });

  it('moving the start later cuts a drive across it: the part after stays work', async () => {
    const db = await database();
    const shift = await startShift(db, at(0));
    await insertTrip(db, drive(5, 20, { shiftId: shift.id, ...work }), ROUTE);
    await endShift(db, at(120));
    await editShiftTimes(db, shift.id, { startedAt: at(15) }, at(200));
    const trips = (await listTrips(db)).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    expect(trips).toHaveLength(2);
    expect(trips[0]).toMatchObject({ shiftId: null, classification: 'unclassified', endedAt: at(15).toISOString() });
    expect(trips[1]).toMatchObject({ shiftId: shift.id, classification: 'business', startLabel: SHIFT_START_LABEL });
    expect(trips[0].distanceMeters + trips[1].distanceMeters).toBe(10_000);
  });

  it('moving the start earlier takes in the part of a drive after it', async () => {
    const db = await database();
    const shift = await startShift(db, at(30));
    await insertTrip(db, drive(10, 20), ROUTE);
    await endShift(db, at(120));
    await editShiftTimes(db, shift.id, { startedAt: at(20) }, at(200));
    const trips = (await listTrips(db)).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    expect(trips).toHaveLength(2);
    expect(trips[0]).toMatchObject({ shiftId: null, classification: 'unclassified' });
    expect(trips[1]).toMatchObject({ shiftId: shift.id, classification: 'business', startedAt: at(20).toISOString() });
  });

  it('an open shift’s start can’t be moved back past 16 hours', async () => {
    const db = await database();
    const shift = await startShift(db, at(0));
    const now = new Date(T0 + MAX_SHIFT_MS - 5 * 60_000);
    const saved = await editShiftTimes(db, shift.id, { startedAt: at(-15) }, now);
    expect(Date.parse(saved!.startedAt)).toBeGreaterThan(now.getTime() - MAX_SHIFT_MS);
    expect((await currentShift(db, now))?.id).toBe(shift.id);
  });
});
