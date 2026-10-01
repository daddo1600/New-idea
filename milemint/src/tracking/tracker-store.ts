import type { SQLiteDatabase } from 'expo-sqlite';

import { inWriteTransaction } from '@/db/transaction';
import type { LatLng } from '@/domain/geo';
import { INITIAL_TRACKER_RECORD, type TrackerRecord } from '@/domain/tracker-policy';
import { sanitizeDetectorState } from '@/domain/trip-detector';

/*
 * The drive in progress is saved after every GPS wake-up (about once a
 * second). Its route can run to thousands of points, so it isn't in the
 * record's JSON: rewriting all of it every time cost seconds of CPU and
 * hundreds of megabytes of writes over a long drive. The points live in
 * tracker_route, a row each, and a save writes the small record plus only
 * the points that changed (usually one new one, or none).
 *
 * `stored` is what tracker_route holds, as far as this process knows: every
 * write goes through here (the app and background wake-ups share one
 * JavaScript runtime and one connection per file), so it lets a save skip
 * the points already there and a load skip reading them back. Unknown (a
 * fresh launch, a failed write) means read or rewrite them all.
 */

/** In the saved JSON, in place of a drive's route: how many tracker_route rows are its points, and whether they have times. */
type RouteRef = { routeRows: number; routeTimed: boolean };

type StoredRoute = { route: readonly LatLng[]; times: readonly (number | null)[] | null };

const stored = new Map<unknown, StoredRoute>();
/** Bumped as each save starts; with `writing`, keeps a slower load or save from leaving `stored` out of date. */
let generation = 0;
let writing = 0;

/** One entry per database file (the app and background tasks open the same file as different objects). */
const keyOf = (db: SQLiteDatabase): unknown => db.databasePath ?? db;

type RouteRow = { latitude: number | null; longitude: number | null; at: number | null };

async function readRoute(db: SQLiteDatabase, rows: number): Promise<StoredRoute> {
  const known = stored.get(keyOf(db));
  if (known && known.route.length === rows) return known;
  // Only remembered if no save was under way at any point while reading.
  const started = writing === 0 ? generation : -1;
  const all = await db.getAllAsync<RouteRow>('SELECT latitude, longitude, at FROM tracker_route ORDER BY idx;');
  const read: StoredRoute = {
    route: all.map((row) => ({ latitude: row.latitude, longitude: row.longitude }) as LatLng),
    times: all.map((row) => row.at),
  };
  if (started === generation && writing === 0) stored.set(keyOf(db), read);
  return read;
}

export async function loadTrackerRecord(db: SQLiteDatabase): Promise<TrackerRecord> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM tracker_state WHERE id = 1;');
  if (!row) return INITIAL_TRACKER_RECORD;
  let record: TrackerRecord;
  try {
    record = { ...INITIAL_TRACKER_RECORD, ...(JSON.parse(row.json) as TrackerRecord) };
  } catch {
    return INITIAL_TRACKER_RECORD;
  }
  let detector: unknown = record.detector;
  const ref = detector as Partial<RouteRef> | null | undefined;
  if (ref && typeof ref === 'object' && typeof ref.routeRows === 'number') {
    // Saved by this version: the route's points are rows of their own.
    const { routeRows, routeTimed, ...rest } = ref;
    const points = await readRoute(db, routeRows);
    const count = Math.max(0, Math.min(routeRows, points.route.length));
    detector = {
      ...rest,
      route: points.route.slice(0, count),
      routeTimes: routeTimed && points.times ? points.times.slice(0, count) : undefined,
    };
  }
  try {
    // JSON turns NaN into null: never let a poisoned fix break every later trip.
    return { ...record, detector: sanitizeDetectorState(detector) };
  } catch {
    return INITIAL_TRACKER_RECORD;
  }
}

const same = (a: number | null | undefined, b: number | null | undefined) => a === b;

/** How many leading points `next` shares with what's stored. */
function sharedPoints(before: StoredRoute, next: StoredRoute): number {
  const max = Math.min(before.route.length, next.route.length);
  let index = 0;
  while (
    index < max &&
    same(before.route[index].latitude, next.route[index].latitude) &&
    same(before.route[index].longitude, next.route[index].longitude) &&
    same(before.times?.[index] ?? null, next.times?.[index] ?? null)
  ) {
    index++;
  }
  return index;
}

/** Rows per INSERT: four values each, well under SQLite's limit on parameters. */
const INSERT_CHUNK = 200;

/** Saved in its turn in the write queue, so it can't land inside another transaction (a restore, a scrub). */
export async function saveTrackerRecord(db: SQLiteDatabase, record: TrackerRecord): Promise<void> {
  const detector = record.detector;
  let next: StoredRoute = { route: [], times: null };
  let json: string;
  if (detector.mode === 'driving') {
    const { route, routeTimes, ...rest } = detector;
    // Times that don't line up with the points would be dropped on loading anyway.
    const times = routeTimes && routeTimes.length === route.length ? routeTimes : null;
    // Copies: what's stored mustn't change if the caller's arrays ever do.
    next = { route: route.slice(), times: times && times.slice() };
    const ref: RouteRef = { routeRows: route.length, routeTimed: times !== null };
    json = JSON.stringify({ ...record, detector: { ...rest, ...ref } });
  } else {
    json = JSON.stringify(record);
  }
  const key = keyOf(db);
  let mine = 0;
  try {
    await inWriteTransaction(db, async () => {
      mine = ++generation;
      writing++;
      const before = stored.get(key) ?? null;
      // Unknown until this commits: a load or save meanwhile reads or rewrites every point.
      stored.delete(key);
      const from = before ? sharedPoints(before, next) : 0;
      if (!before || before.route.length > from) {
        await db.runAsync('DELETE FROM tracker_route WHERE idx >= ?;', from);
      }
      for (let start = from; start < next.route.length; start += INSERT_CHUNK) {
        const end = Math.min(next.route.length, start + INSERT_CHUNK);
        const values: (number | null)[] = [];
        for (let index = start; index < end; index++) {
          const point = next.route[index];
          values.push(index, point.latitude, point.longitude, next.times?.[index] ?? null);
        }
        const rows = Array.from({ length: end - start }, () => '(?, ?, ?, ?)').join(', ');
        await db.runAsync(`INSERT OR REPLACE INTO tracker_route (idx, latitude, longitude, at) VALUES ${rows};`, values);
      }
      await db.runAsync(
        'INSERT INTO tracker_state (id, json) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET json = excluded.json;',
        json,
      );
    });
    // Committed: unless another save has started since, the rows are exactly `next`.
    if (mine === generation) stored.set(key, next);
  } finally {
    if (mine !== 0) writing--;
  }
}
