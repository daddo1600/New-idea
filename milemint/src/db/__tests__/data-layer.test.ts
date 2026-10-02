import { describe, expect, it, jest } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { migrate } from '../migrations';
import { insertPlace, deletePlace } from '../places-repo';
import { DEFAULT_SETTINGS, loadSettings, parseSettings, saveSettings, updateSettings } from '../settings-repo';
import { startShift } from '../shifts-repo';
import { available, openTestDatabase, type TestDatabase } from '../testing/node-sqlite';
import { inWriteTransaction, lockWait, NestedWriteLockError, withWriteLock } from '../transaction';
import { deleteTrip, getTrip, insertTrip, setClassification, setTripPlace, updateTripDetails, type NewTrip } from '../trips-repo';
import { addVehicle, ensureVehicles, removeVehicle, updateVehicle } from '../vehicles-repo';

jest.mock('expo-crypto', () => ({ randomUUID: () => jest.requireActual<typeof import('node:crypto')>('node:crypto').randomUUID() }));
// jest-expo's own mock keeps nothing.
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

/*
 * The data layer against real SQLite (node:sqlite): constraints, foreign keys
 * and transactions as on a phone, with every call yielding a turn so
 * concurrent work interleaves. Skipped on a Node without node:sqlite.
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

const edits = (db: TestDatabase, tripId: string) =>
  db
    .rows<{ action: string; field: string | null; old_value: string | null; new_value: string | null }>(
      'SELECT action, field, old_value, new_value FROM trip_edits WHERE trip_id = ? ORDER BY id;',
      tripId,
    )
    .map((edit) => [edit.action, edit.field, edit.old_value, edit.new_value]);

describeSqlite('every write takes its turn in the write queue', () => {
  it("a write made during another's transaction isn't swept into it (and rolled back with it)", async () => {
    const db = await database();
    const failing = inWriteTransaction(db, async () => {
      await db.runAsync("INSERT INTO places (id, name, latitude, longitude, radius_m, kind, created_at) VALUES ('x', 'X', 0, 0, 100, 'other', 'now');");
      await new Promise((resolve) => setTimeout(resolve, 5));
      throw new Error('the trip failed');
    });
    const place = insertPlace(db, { name: 'Client', kind: 'client', at: { latitude: 51, longitude: 0 } });
    await expect(failing).rejects.toThrow('the trip failed');
    const saved = await place;
    expect(db.rows('SELECT id FROM places;')).toEqual([{ id: saved.id }]);
  });

  it('settings saved during a restore-like transaction come after it, not inside it', async () => {
    const db = await database();
    const restore = inWriteTransaction(db, async () => {
      await db.runAsync('DELETE FROM settings;');
      await new Promise((resolve) => setTimeout(resolve, 5));
      await db.runAsync('INSERT INTO settings (id, json) VALUES (1, ?);', '{"region":"GB"}');
    });
    const save = updateSettings(db, { onboarded: true });
    await expect(restore).resolves.toBeUndefined();
    await save;
    expect(await loadSettings(db)).toMatchObject({ region: 'GB', onboarded: true });
  });

  it('a lock asked for from inside a locked task fails with a clear error instead of waiting forever', async () => {
    const db = await database();
    // Before the task's first await: told apart on any engine.
    await expect(withWriteLock(() => saveSettings(db, DEFAULT_SETTINGS))).rejects.toBeInstanceOf(NestedWriteLockError);
    // After an await: in development the nested write gives up after a while, so the outer task ends too.
    const usual = lockWait.ms;
    lockWait.ms = 200;
    try {
      await expect(
        inWriteTransaction(db, async () => {
          await db.getFirstAsync('SELECT 1;');
          await insertPlace(db, { name: 'Nested', kind: 'other', at: { latitude: 0, longitude: 0 } });
        }),
      ).rejects.toBeInstanceOf(NestedWriteLockError);
    } finally {
      lockWait.ms = usual;
    }
    // And the queue carries on.
    await expect(updateSettings(db, { onboarded: true })).resolves.toMatchObject({ onboarded: true });
    expect(db.rows('SELECT id FROM places;')).toEqual([]);
  });

  it('concurrent writes from outside any lock are not mistaken for nested ones', async () => {
    const db = await database();
    const slow = withWriteLock(() => new Promise((resolve) => setTimeout(resolve, 20)));
    await Promise.all([slow, updateSettings(db, { onboarded: true }), insertPlace(db, { name: 'A', kind: 'home', at: { latitude: 0, longitude: 0 } })]);
    expect((await loadSettings(db)).onboarded).toBe(true);
  });
});

describeSqlite('settings', () => {
  it('two changes made at once both stick', async () => {
    const db = await database();
    await Promise.all([
      updateSettings(db, (saved) => ({ celebrated: [...saved.celebrated, 'first-trip'] })),
      updateSettings(db, { region: 'GB' }),
      updateSettings(db, (saved) => ({ celebrated: [...saved.celebrated, 'tenth-trip'] })),
    ]);
    expect(await loadSettings(db)).toMatchObject({ region: 'GB', celebrated: ['first-trip', 'tenth-trip'] });
  });
});

describe('parseSettings', () => {
  it('falls back to the default for each field that is the wrong type or not an allowed value', () => {
    const settings = parseSettings(
      JSON.stringify({
        region: 'toString',
        vehicle: 'van',
        celebrated: 5,
        workWeek: [null, null, null, null, null, null, null],
        defaultBusiness: 'false',
        employerRate: 'lots',
        taxBand: 'bogus',
        exportFormat: null,
        friendsJoined: -1,
        currentVehicleId: 7,
        onboarded: true,
      }),
    );
    expect(settings).toEqual({ ...DEFAULT_SETTINGS, onboarded: true });
  });

  it('keeps valid values and drops bad entries inside lists', () => {
    const week = [[], [{ start: '08:00', end: '16:00' }, { start: 'soon' }], [], [], [], [], []];
    const settings = parseSettings(
      JSON.stringify({ region: 'GB', vehicle: 'motorbike', celebrated: ['a', 3, 'b'], claimedReliefYears: [2024, '2025'], workWeek: week }),
    );
    expect(settings.region).toBe('GB');
    expect(settings.vehicle).toBe('motorbike');
    expect(settings.celebrated).toEqual(['a', 'b']);
    expect(settings.claimedReliefYears).toEqual([2024]);
    expect(settings.workWeek[1]).toEqual([{ start: '08:00', end: '16:00' }]);
  });

  it('keeps whether the practice tutorial is done, not done by default or when damaged', () => {
    expect(DEFAULT_SETTINGS.tutorialDone).toBe(false);
    expect(parseSettings(JSON.stringify({ tutorialDone: true })).tutorialDone).toBe(true);
    expect(parseSettings(JSON.stringify({ tutorialDone: false, onboarded: true })).tutorialDone).toBe(false);
    for (const value of ['true', 1, null, {}]) {
      expect(parseSettings(JSON.stringify({ tutorialDone: value })).tutorialDone).toBe(false);
    }
  });

  it.each(['null', '[1,2]', '"text"', '5', 'not json', ''])('gives the defaults for %p', (json) => {
    expect(parseSettings(json)).toEqual(DEFAULT_SETTINGS);
  });
});

describeSqlite('trips', () => {
  it('saves a drive whose place or vehicle was deleted meanwhile, unlinked, instead of failing', async () => {
    const db = await database();
    const place = await insertPlace(db, { name: 'Client', kind: 'client', at: { latitude: 51, longitude: 0 } });
    const { current } = await ensureVehicles(db);
    await deletePlace(db, place.id);
    db.raw.exec('PRAGMA foreign_keys = OFF;');
    db.raw.exec('DELETE FROM vehicles;');
    db.raw.exec('PRAGMA foreign_keys = ON;');
    const trip = await insertTrip(db, newTrip({ startPlaceId: place.id, endPlaceId: place.id, vehicleId: current.id }));
    expect(trip).toMatchObject({ startPlaceId: null, endPlaceId: null, vehicleId: null });
    expect(await getTrip(db, trip.id)).toMatchObject({ startPlaceId: null, endPlaceId: null, vehicleId: null });
  });

  it('stores routes to five decimal places', async () => {
    const db = await database();
    const trip = await insertTrip(db, newTrip(), [
      { latitude: 51.123456789, longitude: -0.000004 },
      { latitude: 51.2, longitude: -0.1 },
    ]);
    expect(db.rows('SELECT points FROM trip_routes WHERE trip_id = ?;', trip.id)).toEqual([
      { points: '[{"latitude":51.12346,"longitude":0},{"latitude":51.2,"longitude":-0.1}]' },
    ]);
  });

  it('edits compare against (and log) the saved trip, not the caller’s stale copy', async () => {
    const db = await database();
    const stale = await insertTrip(db, newTrip({ purpose: 'A' }));
    await updateTripDetails(db, stale, { purpose: 'B' });
    await updateTripDetails(db, stale, { purpose: 'A' });
    expect((await getTrip(db, stale.id))?.purpose).toBe('A');
    await setClassification(db, stale, 'business');
    await setClassification(db, stale, 'personal');
    expect((await getTrip(db, stale.id))?.classification).toBe('personal');
    expect(edits(db, stale.id).slice(1)).toEqual([
      ['update', 'purpose', 'A', 'B'],
      ['update', 'purpose', 'B', 'A'],
      ['update', 'classification', 'unclassified', 'business'],
      ['update', 'classification', 'business', 'personal'],
    ]);
  });

  it('leaves a deleted trip alone: no audit rows for edits, and deleting twice logs once', async () => {
    const db = await database();
    const trip = await insertTrip(db, newTrip());
    await deleteTrip(db, trip);
    await updateTripDetails(db, trip, { purpose: 'after delete' });
    await setClassification(db, trip, 'personal');
    await setTripPlace(db, trip.id, 'end', 'nowhere');
    await deleteTrip(db, trip);
    expect(edits(db, trip.id).map(([action]) => action)).toEqual(['create', 'delete']);
  });

  it('links a trip to a place only while the place exists', async () => {
    const db = await database();
    const trip = await insertTrip(db, newTrip());
    await setTripPlace(db, trip.id, 'end', 'gone');
    expect((await getTrip(db, trip.id))?.endPlaceId).toBeNull();
  });
});

describeSqlite('vehicles and shifts', () => {
  it('two screens asking for the garage at once make one vehicle', async () => {
    const db = await database();
    const [a, b] = await Promise.all([ensureVehicles(db), ensureVehicles(db)]);
    expect(db.rows('SELECT id FROM vehicles;')).toHaveLength(1);
    expect(a.current.id).toBe(b.current.id);
    expect((await loadSettings(db)).currentVehicleId).toBe(a.current.id);
  });

  it('files trips from before the garage under a vehicle of their own type', async () => {
    const db = await database();
    await updateSettings(db, { vehicle: 'motorbike' });
    const moped = await insertTrip(db, newTrip({ vehicle: 'motorbike' }));
    const car = await insertTrip(db, newTrip({ vehicle: 'car' }));
    const { vehicles, current } = await ensureVehicles(db);
    expect(vehicles.map((vehicle) => vehicle.type)).toEqual(['motorbike', 'car']);
    expect(current.type).toBe('motorbike');
    expect((await getTrip(db, moped.id))?.vehicleId).toBe(vehicles[0].id);
    expect((await getTrip(db, car.id))?.vehicleId).toBe(vehicles[1].id);
  });

  it("changing a vehicle's type changes its trips' type too", async () => {
    const db = await database();
    const { current } = await ensureVehicles(db);
    const other = await addVehicle(db, { type: 'car', name: 'Van' });
    const mine = await insertTrip(db, newTrip({ vehicle: 'car', vehicleId: current.id }));
    const theirs = await insertTrip(db, newTrip({ vehicle: 'car', vehicleId: other.id }));
    await updateVehicle(db, { ...current, type: 'bicycle' });
    expect((await getTrip(db, mine.id))?.vehicle).toBe('bicycle');
    expect((await getTrip(db, theirs.id))?.vehicle).toBe('car');
    expect((await loadSettings(db)).vehicle).toBe('bicycle');
  });

  it('removing the current vehicle moves on to the next, reading settings inside its transaction', async () => {
    const db = await database();
    const { current } = await ensureVehicles(db);
    const next = await addVehicle(db, { type: 'motorbike' });
    await Promise.all([removeVehicle(db, current.id), updateSettings(db, { region: 'GB' })]);
    expect(await loadSettings(db)).toMatchObject({ currentVehicleId: next.id, vehicle: 'motorbike', region: 'GB' });
  });

  it('a double tap on Start shift opens one shift', async () => {
    const db = await database();
    const now = new Date();
    const [a, b] = await Promise.all([startShift(db, now), startShift(db, now)]);
    expect(a.id).toBe(b.id);
    expect(db.rows('SELECT id FROM shifts WHERE ended_at IS NULL;')).toHaveLength(1);
  });
});
