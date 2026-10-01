import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { SHIFT_END_LABEL } from '@/domain/shift-split';

import { migrate } from '../migrations';
import {
  currentPause,
  currentShift,
  editShiftTimes,
  endShift,
  listPauses,
  MAX_SHIFT_MS,
  pauseShift,
  reopenShift,
  resumeShift,
  shiftAt,
  startShift,
  startShiftFrom,
} from '../shifts-repo';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';
import { getRoute, getTrip, insertTrip, listTrips, type NewTrip } from '../trips-repo';

jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

/*
 * Shifts against real SQLite: a drive that ran past the end of a shift is
 * cut there, pauses keep errands out of work, and a shift's times can be
 * fixed afterwards. Skipped on a Node without node:sqlite.
 */
const describeSqlite = available ? describe : describe.skip;

async function database(): Promise<TestDatabase & SQLiteDatabase> {
  const db = openTestDatabase() as unknown as TestDatabase & SQLiteDatabase;
  await migrate(db);
  return db;
}

const T0 = Date.UTC(2026, 8, 30, 16, 0);
const min = (n: number) => new Date(T0 + n * 60_000);

const drive = (start: number, minutes: number, extra: Partial<NewTrip> = {}): NewTrip => ({
  startedAt: min(start).toISOString(),
  localDate: '2026-09-30',
  endedAt: min(start + minutes).toISOString(),
  startLabel: 'Five Guys, The Headrow',
  endLabel: 'Home',
  distanceMeters: 7_777,
  classification: 'unclassified',
  purpose: '',
  source: 'auto',
  ...extra,
});

const ROUTE = Array.from({ length: 11 }, (_, i) => ({ latitude: 53.8 + i * 0.004, longitude: -1.55 }));

describeSqlite('the end of a shift cuts the drive running past it', () => {
  it('a saved drive across the end: the in-shift part stays work, the rest is its own drive, to sort', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    const last = await insertTrip(
      db,
      drive(50, 20, { shiftId: shift.id, classification: 'business', purpose: 'Deliveries', autoReason: 'work-hours' }),
      ROUTE,
    );
    // Ended at minute 60 (the time it was set to), while the drive went on to minute 70.
    const ended = await endShift(db, min(60));
    expect(ended?.shift.endedAt).toBe(min(60).toISOString());

    const kept = await getTrip(db, last.id);
    const trips = await listTrips(db);
    const after = trips.find((trip) => trip.id !== last.id)!;
    expect(trips).toHaveLength(2);
    expect(kept).toMatchObject({
      classification: 'business',
      purpose: 'Deliveries',
      shiftId: shift.id,
      endedAt: min(60).toISOString(),
      endLabel: SHIFT_END_LABEL,
    });
    expect(after).toMatchObject({
      startedAt: min(60).toISOString(),
      endedAt: min(70).toISOString(),
      startLabel: SHIFT_END_LABEL,
      endLabel: 'Home',
      classification: 'unclassified',
      autoReason: null,
      purpose: '',
      shiftId: null,
      offShiftId: shift.id,
    });
    // Distances exact: the two parts add up to what was logged.
    expect(kept!.distanceMeters + after.distanceMeters).toBe(7_777);
    expect(kept!.distanceMeters).toBe(Math.round(7_777 / 2));
    // The route is cut with it.
    const [before, rest] = [await getRoute(db, last.id), await getRoute(db, after.id)];
    expect(before.at(-1)).toEqual(rest[0]);
    expect(before[0]).toEqual(ROUTE[0]);
    expect(rest.at(-1)?.latitude).toBeCloseTo(ROUTE[10].latitude, 5);
    // The audit trail says the drive was split by the app, not edited by the user.
    expect(
      db.rows<{ action: string; field: string }>("SELECT action, field FROM trip_edits WHERE trip_id = ? AND field = 'ended_at';", last.id),
    ).toEqual([{ action: 'auto', field: 'ended_at' }]);
  });

  it('a shift left running ends at its 16-hour mark and cuts the drive across it', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    const sixteen = MAX_SHIFT_MS / 60_000;
    await insertTrip(db, drive(sixteen - 10, 30, { shiftId: shift.id, classification: 'business', autoReason: 'work-hours' }));
    expect(await currentShift(db, min(sixteen + 60))).toBeNull();
    const trips = await listTrips(db);
    expect(trips.map((trip) => [trip.startedAt, trip.shiftId, trip.offShiftId, trip.classification])).toEqual([
      [min(sixteen).toISOString(), null, shift.id, 'unclassified'],
      [min(sixteen - 10).toISOString(), shift.id, null, 'business'],
    ]);
    expect(trips.reduce((sum, trip) => sum + trip.distanceMeters, 0)).toBe(7_777);
  });

  it('a drive wholly inside the shift isn’t touched', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    const inside = await insertTrip(db, drive(10, 20, { shiftId: shift.id, classification: 'business' }));
    await endShift(db, min(60));
    expect(await listTrips(db)).toEqual([await getTrip(db, inside.id)]);
    expect((await getTrip(db, inside.id))?.distanceMeters).toBe(7_777);
  });
});

describeSqlite('forgiving shifts', () => {
  it('"Start shift from 10:40": drives since then join the shift as business; earlier ones stay as they were', async () => {
    const db = await database();
    const before = await insertTrip(db, drive(-120, 10));
    const a = await insertTrip(db, drive(-40, 10));
    const sorted = await insertTrip(db, drive(-20, 10, { classification: 'personal' }));
    const shift = await startShiftFrom(db, min(-40), min(0));
    expect(shift.startedAt).toBe(min(-40).toISOString());
    expect(await getTrip(db, a.id)).toMatchObject({
      shiftId: shift.id,
      classification: 'business',
      purpose: 'Deliveries',
      autoReason: 'work-hours',
    });
    // The user's own choice stays theirs; the drive is still filed under the shift.
    expect(await getTrip(db, sorted.id)).toMatchObject({ shiftId: shift.id, classification: 'personal' });
    expect(await getTrip(db, before.id)).toMatchObject({ shiftId: null, classification: 'unclassified' });
    // A late start of a running shift moves it back instead of opening another.
    const again = await startShiftFrom(db, min(-130), min(1));
    expect(again.id).toBe(shift.id);
    expect((await getTrip(db, before.id))?.shiftId).toBe(shift.id);
  });

  it('never reaches back into the previous shift', async () => {
    const db = await database();
    await startShift(db, min(-300));
    await endShift(db, min(-100));
    const shift = await startShiftFrom(db, min(-200), min(0));
    expect(shift.startedAt).toBe(min(-100).toISOString());
  });

  it('editing a shift’s times re-files its drives and cuts one now past the end', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    const early = await insertTrip(db, drive(5, 10, { shiftId: shift.id, classification: 'business', purpose: 'Deliveries', autoReason: 'work-hours' }));
    const late = await insertTrip(db, drive(100, 30, { shiftId: shift.id, classification: 'business', purpose: 'Deliveries', autoReason: 'work-hours' }));
    await endShift(db, min(200));
    // Actually started at 0:15 and finished at 1:50.
    await editShiftTimes(db, shift.id, { startedAt: min(15) }, min(300));
    const saved = await editShiftTimes(db, shift.id, { endedAt: min(110) }, min(300));
    expect(saved).toMatchObject({ startedAt: min(15).toISOString(), endedAt: min(110).toISOString() });
    expect(await getTrip(db, early.id)).toMatchObject({ shiftId: null, classification: 'unclassified', purpose: '' });
    expect(await getTrip(db, late.id)).toMatchObject({ shiftId: shift.id, endedAt: min(110).toISOString() });
    const cut = (await listTrips(db)).find((trip) => trip.offShiftId === shift.id)!;
    expect(cut).toMatchObject({ startedAt: min(110).toISOString(), classification: 'unclassified' });
    // Moving the end later again brings the cut part back into the shift.
    await editShiftTimes(db, shift.id, { endedAt: min(140) }, min(300));
    expect(await getTrip(db, cut.id)).toMatchObject({ shiftId: shift.id, offShiftId: null, classification: 'business' });
  });

  it('keeps edited times in order, in the past and clear of the next shift', async () => {
    const db = await database();
    const first = await startShift(db, min(0));
    await endShift(db, min(60));
    await startShift(db, min(90));
    await endShift(db, min(120));
    const saved = await editShiftTimes(db, first.id, { endedAt: min(100) }, min(200));
    expect(saved?.endedAt).toBe(min(90).toISOString());
    const reversed = await editShiftTimes(db, first.id, { startedAt: min(95) }, min(200));
    expect(Date.parse(reversed!.startedAt)).toBeLessThan(Date.parse(reversed!.endedAt!));
  });

  it('a pause keeps the errand out of the shift; a drive across it is cut', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    await pauseShift(db, min(30));
    expect(await currentPause(db)).toMatchObject({ shiftId: shift.id, startedAt: min(30).toISOString() });
    expect(await shiftAt(db, min(35).toISOString())).toBeNull();
    // Saved during the shift, then the pause began while it was still going.
    const across = await insertTrip(db, drive(25, 10, { shiftId: shift.id, classification: 'business', autoReason: 'work-hours' }));
    await resumeShift(db, min(50));
    expect(await currentPause(db)).toBeNull();
    expect((await shiftAt(db, min(55).toISOString()))?.id).toBe(shift.id);
    const trips = await listTrips(db);
    expect(trips).toHaveLength(2);
    expect(await getTrip(db, across.id)).toMatchObject({ shiftId: shift.id, endedAt: min(30).toISOString() });
    expect(trips.find((trip) => trip.id !== across.id)).toMatchObject({ offShiftId: shift.id, classification: 'unclassified' });
  });

  it('ending a shift ends its pause; undo opens both again', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    await pauseShift(db, min(30));
    const ended = await endShift(db, min(40));
    expect(ended?.pauseEnded).toBe(true);
    expect(await currentShift(db, min(41))).toBeNull();
    const reopened = await reopenShift(db, ended!);
    expect(reopened).toMatchObject({ id: shift.id, endedAt: null });
    expect(await currentShift(db, min(42))).toMatchObject({ id: shift.id });
    expect(await currentPause(db)).toMatchObject({ shiftId: shift.id });
  });

  it('undo does nothing once another shift has started', async () => {
    const db = await database();
    await startShift(db, min(0));
    const ended = await endShift(db, min(40));
    const next = await startShift(db, min(41));
    expect(await reopenShift(db, ended!)).toBeNull();
    expect((await currentShift(db, min(42)))?.id).toBe(next.id);
  });

  it('pauses are deleted with their shift', async () => {
    const db = await database();
    const shift = await startShift(db, min(0));
    await pauseShift(db, min(10));
    await db.runAsync('DELETE FROM shifts WHERE id = ?;', shift.id);
    expect(await listPauses(db)).toEqual([]);
  });
});
