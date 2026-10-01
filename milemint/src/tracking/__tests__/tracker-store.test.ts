import { describe, expect, it } from '@jest/globals';
import type { SQLiteDatabase } from 'expo-sqlite';

import { migrate } from '@/db/migrations';
import { available, openTestDatabase, type TestDatabase } from '@/db/testing/node-sqlite';
import {
  INITIAL_TRACKER_RECORD,
  onGeofenceExit,
  onLocations,
  parkedAt,
  type TrackerRecord,
} from '@/domain/tracker-policy';
import { sanitizeDetectorState, type LocationSample } from '@/domain/trip-detector';

import { loadTrackerRecord, saveTrackerRecord } from '../tracker-store';

/*
 * The tracker record against real SQLite (node:sqlite). The drive's route is
 * stored a row per point, but what comes back must be exactly what the
 * single JSON blob used to give.
 */
const describeSqlite = available ? describe : describe.skip;

type Db = TestDatabase & SQLiteDatabase;

async function database(): Promise<Db> {
  const db = openTestDatabase() as unknown as Db;
  await migrate(db);
  return db;
}

/** The same file seen by a new process (the app relaunched): nothing remembered about it. */
const relaunched = (db: Db): Db => ({ ...db }) as Db;

/** What loading a saved record gave when it was one JSON blob. */
function asBlob(record: TrackerRecord): TrackerRecord {
  const parsed = { ...INITIAL_TRACKER_RECORD, ...(JSON.parse(JSON.stringify(record)) as TrackerRecord) };
  return { ...parsed, detector: sanitizeDetectorState(parsed.detector) };
}

/** A drive: one fix a second at ~15 m/s, a stop at the lights every few minutes, then `parked` seconds parked. */
function drive(count: number, parked = 0, t0 = Date.UTC(2026, 3, 1, 8)): LocationSample[] {
  const samples: LocationSample[] = [];
  let latitude = 51.5;
  for (let i = 0; i < count; i++) {
    const moving = i < count - parked && i % 200 < 170;
    if (moving) latitude += 15 / 111_000;
    samples.push({
      latitude: latitude + (i % 3) * 0.000005,
      longitude: -0.12 + (i % 2) * 0.000005,
      accuracy: 8,
      speed: moving ? 15 : 0,
      timestamp: t0 + i * 1000,
      utcOffsetMin: -60,
    });
  }
  return samples;
}

const routeRows = (db: Db) => db.rows<{ n: number }>('SELECT COUNT(*) AS n FROM tracker_route;')[0].n;

describeSqlite('tracker store', () => {
  it('loads back exactly what the JSON blob gave, wake-up after wake-up, through a whole drive', async () => {
    const db = await database();
    const samples = drive(700, 360);
    const t0 = samples[0].timestamp;
    let record = onGeofenceExit(parkedAt(samples[0], t0 - 10), t0);
    let completed = 0;
    for (const [index, sample] of samples.entries()) {
      await saveTrackerRecord(db, record);
      const loaded = await loadTrackerRecord(db);
      expect(loaded).toStrictEqual(asBlob(record));
      if (index % 150 === 0) expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(record));
      const decision = onLocations(loaded, [sample], sample.timestamp + 500);
      completed += decision.completed.length;
      record = decision.record;
    }
    expect(completed).toBe(1);
    await saveTrackerRecord(db, record);
    expect(record.detector.mode).toBe('idle');
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(record));
    // Parked: no route kept.
    expect(routeRows(db)).toBe(0);
  }, 60_000);

  it('writes only the points that changed', async () => {
    const db = await database();
    const samples = drive(300);
    const t0 = samples[0].timestamp;
    let record = onGeofenceExit(parkedAt(samples[0], t0 - 10), t0);
    record = onLocations(record, samples.slice(0, 200), samples[199].timestamp).record;
    await saveTrackerRecord(db, record);
    const before = record.detector.mode === 'driving' ? record.detector.route.length : 0;
    expect(before).toBeGreaterThan(50);
    expect(routeRows(db)).toBe(before);

    const written: unknown[][] = [];
    const runAsync = db.runAsync;
    db.runAsync = (async (sql: string, ...params: unknown[]) => {
      if (sql.includes('tracker_route')) written.push(params.flat());
      return runAsync(sql, ...params);
    }) as typeof db.runAsync;
    // A few seconds more driving: a new point or two.
    record = onLocations(record, samples.slice(200, 206), samples[205].timestamp).record;
    await saveTrackerRecord(db, record);
    const after = record.detector.mode === 'driving' ? record.detector.route.length : 0;
    expect(after).toBeGreaterThan(before);
    expect(written).toHaveLength(1);
    expect(written[0]).toHaveLength(4 * (after - before));
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(record));
  });

  it('rewrites a point the detector replaced (a GPS spike) and drops points cut off the end', async () => {
    const db = await database();
    const samples = drive(90);
    const t0 = samples[0].timestamp;
    const record = onLocations(onGeofenceExit(parkedAt(samples[0], t0 - 10), t0), samples, samples[89].timestamp).record;
    if (record.detector.mode !== 'driving') throw new Error('expected a drive');
    const { route, routeTimes = [] } = record.detector;
    await saveTrackerRecord(db, record);
    const spiked: TrackerRecord = {
      ...record,
      detector: {
        ...record.detector,
        route: [...route.slice(0, -1), { latitude: 51.6, longitude: -0.1 }],
        routeTimes: [...routeTimes.slice(0, -1), routeTimes[routeTimes.length - 1] + 1],
      },
    };
    await saveTrackerRecord(db, spiked);
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(spiked));
    const shorter: TrackerRecord = {
      ...record,
      detector: { ...record.detector, route: route.slice(0, 3), routeTimes: routeTimes.slice(0, 3) },
    };
    await saveTrackerRecord(db, shorter);
    expect(routeRows(db)).toBe(3);
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(shorter));
  });

  it('reads a record saved by an older version, route and all, and moves its route out on the next save', async () => {
    const db = await database();
    const samples = drive(120);
    const t0 = samples[0].timestamp;
    const record = onLocations(onGeofenceExit(parkedAt(samples[0], t0 - 10), t0), samples, samples[119].timestamp).record;
    expect(record.detector.mode).toBe('driving');
    await db.runAsync('INSERT INTO tracker_state (id, json) VALUES (1, ?);', JSON.stringify(record));
    expect(await loadTrackerRecord(db)).toStrictEqual(asBlob(record));
    await saveTrackerRecord(db, record);
    const saved = JSON.parse(db.rows<{ json: string }>('SELECT json FROM tracker_state;')[0].json);
    expect(saved.detector.route).toBeUndefined();
    expect(routeRows(db)).toBe(record.detector.mode === 'driving' ? record.detector.route.length : -1);
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(record));
  });

  it('drops broken points and times as the JSON blob did', async () => {
    const db = await database();
    const samples = drive(60);
    const t0 = samples[0].timestamp;
    const record = onLocations(onGeofenceExit(parkedAt(samples[0], t0 - 10), t0), samples, samples[59].timestamp).record;
    if (record.detector.mode !== 'driving') throw new Error('expected a drive');
    const route = [...record.detector.route];
    route[2] = { latitude: Number.NaN, longitude: route[2].longitude };
    const routeTimes = [...(record.detector.routeTimes ?? [])];
    routeTimes[1] = Number.NaN;
    const poisoned: TrackerRecord = { ...record, detector: { ...record.detector, route, routeTimes } };
    await saveTrackerRecord(db, poisoned);
    expect(await loadTrackerRecord(db)).toStrictEqual(asBlob(poisoned));
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(poisoned));
    // Times that don't match the points are dropped, as before.
    const mismatched: TrackerRecord = { ...record, detector: { ...record.detector, routeTimes: [1, 2] } };
    await saveTrackerRecord(db, mismatched);
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(mismatched));
  });

  it('a new drive replaces the last one’s points, and reads alongside saves stay consistent', async () => {
    const db = await database();
    const first = drive(400, 360);
    let record = onGeofenceExit(parkedAt(first[0], first[0].timestamp - 10), first[0].timestamp);
    const pending: Promise<TrackerRecord>[] = [];
    for (const sample of first) {
      record = onLocations(record, [sample], sample.timestamp + 500).record;
      // The home screen polls while background wake-ups save.
      pending.push(loadTrackerRecord(db));
      await saveTrackerRecord(db, record);
    }
    await Promise.all(pending);
    expect(await loadTrackerRecord(db)).toStrictEqual(asBlob(record));
    const second = drive(80, 0, first[first.length - 1].timestamp + 3_600_000);
    record = onGeofenceExit({ ...record, enabled: true, mode: 'geofence' }, second[0].timestamp);
    for (const sample of second) {
      record = onLocations(record, [sample], sample.timestamp + 500).record;
      void loadTrackerRecord(db);
      await saveTrackerRecord(db, record);
      expect(await loadTrackerRecord(db)).toStrictEqual(asBlob(record));
    }
    expect(record.detector.mode).toBe('driving');
    expect(routeRows(db)).toBe(record.detector.mode === 'driving' ? record.detector.route.length : -1);
    expect(await loadTrackerRecord(relaunched(db))).toStrictEqual(asBlob(record));
  }, 60_000);
});
