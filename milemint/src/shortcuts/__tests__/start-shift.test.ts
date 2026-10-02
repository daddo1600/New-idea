import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { migrate } from '@/db/migrations';
import { loadSettings, updateSettings } from '@/db/settings-repo';
import { currentShift, startShift } from '@/db/shifts-repo';
import { available, openTestDatabase, type TestDatabase } from '@/db/testing/node-sqlite';
import { insertTrip, listTrips } from '@/db/trips-repo';
import { applyActions } from '@/live-activity/actions';

jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));
jest.mock('@/tracking/shift-notifications', () => ({
  scheduleShiftAutoEnd: async () => {},
  cancelShiftAutoEnd: async () => {},
}));

/*
 * "Start my shift" and "End my shift" from Siri, as the app acts on them
 * from the App Group queue. Skipped on a Node without node:sqlite.
 */
const describeSqlite = available ? describe : describe.skip;

async function database({ shiftMode = true, onboarded = true } = {}): Promise<TestDatabase & SQLiteDatabase> {
  const db = openTestDatabase() as unknown as TestDatabase & SQLiteDatabase;
  await migrate(db);
  await updateSettings(db, { region: 'GB', onboarded, shiftMode });
  return db;
}

const NOW = Date.UTC(2026, 9, 2, 11, 0);

describeSqlite('Siri: start and end a shift', () => {
  it('starts a shift at once when the app hears it straight away', async () => {
    const db = await database();
    expect(await applyActions(db, [{ action: 'start', at: NOW - 5_000 }], NOW)).toBe(true);
    const shift = await currentShift(db, new Date(NOW));
    expect(shift).not.toBeNull();
    expect(Date.parse(shift!.startedAt)).toBe(NOW);
  });

  it('turns shift mode on first', async () => {
    const db = await database({ shiftMode: false });
    expect(await applyActions(db, [{ action: 'start', at: NOW }], NOW)).toBe(true);
    expect((await loadSettings(db)).shiftMode).toBe(true);
    expect(await currentShift(db, new Date(NOW))).not.toBeNull();
  });

  it('leaves a shift that is already on as it is', async () => {
    const db = await database();
    const open = await startShift(db, new Date(NOW - 3_600_000));
    expect(await applyActions(db, [{ action: 'start', at: NOW }], NOW)).toBe(false);
    expect((await currentShift(db, new Date(NOW)))?.id).toBe(open.id);
  });

  it('does nothing before the app is set up', async () => {
    const db = await database({ onboarded: false });
    expect(await applyActions(db, [{ action: 'start', at: NOW }], NOW)).toBe(false);
    expect(await currentShift(db, new Date(NOW))).toBeNull();
  });

  it('backdates a start the app heard late, pulling in the drives since', async () => {
    const db = await database();
    const asked = NOW - 20 * 60_000;
    await insertTrip(db, {
      startedAt: new Date(NOW - 15 * 60_000).toISOString(),
      localDate: '2026-10-02',
      endedAt: new Date(NOW - 5 * 60_000).toISOString(),
      startLabel: 'Nando’s',
      endLabel: 'Cardigan Rd',
      distanceMeters: 5_000,
      classification: 'unclassified',
      purpose: '',
      source: 'auto',
    });
    expect(await applyActions(db, [{ action: 'start', at: asked }], NOW)).toBe(true);
    const shift = await currentShift(db, new Date(NOW));
    expect(Date.parse(shift!.startedAt)).toBe(asked);
    const [trip] = await listTrips(db);
    expect(trip.shiftId).toBe(shift!.id);
  });

  it('ends the shift with "end", as the lock screen button does', async () => {
    const db = await database();
    await applyActions(db, [{ action: 'start', at: NOW - 3_600_000 }], NOW - 3_600_000);
    expect(await applyActions(db, [{ action: 'end', at: NOW }], NOW)).toBe(true);
    expect(await currentShift(db, new Date(NOW))).toBeNull();
  });
});
