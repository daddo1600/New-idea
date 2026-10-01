import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { AutoReason, ClassifiedTrip } from '@/domain/classify-rules';
import type { LatLng } from '@/domain/geo';
import { roundRoute } from '@/domain/polyline';
import type { Classification, Trip, TripSource, VehicleType } from '@/domain/trip';

import { inWriteTransaction, withWriteLock } from './transaction';

type TripRow = {
  id: string;
  started_at: string;
  local_date: string;
  ended_at: string | null;
  start_label: string;
  end_label: string;
  distance_meters: number;
  classification: Classification;
  purpose: string;
  source: TripSource;
  created_at: string;
  start_place_id: string | null;
  end_place_id: string | null;
  auto_reason: Exclude<AutoReason, 'default'> | null;
  auto_default: number | null;
  vehicle: VehicleType | null;
  vehicle_id: string | null;
  shift_id: string | null;
};

function fromRow(row: TripRow): Trip {
  return {
    id: row.id,
    startedAt: row.started_at,
    localDate: row.local_date,
    endedAt: row.ended_at,
    startLabel: row.start_label,
    endLabel: row.end_label,
    distanceMeters: row.distance_meters,
    classification: row.classification,
    purpose: row.purpose,
    source: row.source,
    createdAt: row.created_at,
    startPlaceId: row.start_place_id,
    endPlaceId: row.end_place_id,
    autoReason: row.auto_reason ?? (row.auto_default ? 'default' : null),
    vehicle: row.vehicle ?? 'car',
    vehicleId: row.vehicle_id ?? null,
    shiftId: row.shift_id ?? null,
  };
}

type AutoFields = 'startPlaceId' | 'endPlaceId' | 'autoReason' | 'vehicle' | 'vehicleId' | 'shiftId';
export type NewTrip = Omit<Trip, 'id' | 'createdAt' | AutoFields> & Partial<Pick<Trip, AutoFields>>;

export async function listTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const [rows, rejoined] = await Promise.all([
    db.getAllAsync<TripRow>('SELECT * FROM trips ORDER BY local_date DESC, started_at DESC;'),
    listRejoinedAt(db),
  ]);
  return rows.map((row) => {
    const trip = fromRow(row);
    const at = rejoined.get(trip.id);
    return at ? { ...trip, rejoinedAt: at } : trip;
  });
}

/**
 * When each trip was last sorted back from personal by the user, from the
 * edit log: the free plan queues such a drive from then (domain/plan).
 */
async function listRejoinedAt(db: SQLiteDatabase): Promise<Map<string, string>> {
  const rows = await db.getAllAsync<{ trip_id: string; at: string }>(
    `SELECT trip_id, MAX(at) AS at FROM trip_edits
      WHERE action = 'update' AND field = 'classification' AND old_value = 'personal'
      GROUP BY trip_id;`,
  );
  return new Map(rows.map((row) => [row.trip_id, row.at]));
}

/** Trips changed after they were recorded, for the "Edited later" column of reports. */
export async function listEditedTripIds(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ trip_id: string }>(
    "SELECT DISTINCT trip_id FROM trip_edits WHERE action = 'update';",
  );
  return new Set(rows.map((row) => row.trip_id));
}

/** Whether an automatically logged trip with this start time is already saved. */
export async function autoTripExists(db: SQLiteDatabase, startedAt: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ found: number }>(
    "SELECT 1 AS found FROM trips WHERE source = 'auto' AND started_at = ? LIMIT 1;",
    startedAt,
  );
  return row !== null;
}

/** Whether a row with this id is (still) in `table`. */
async function exists(db: SQLiteDatabase, table: 'places' | 'vehicles', id: string | null): Promise<boolean> {
  if (id === null) return false;
  return (await db.getFirstAsync(`SELECT 1 AS found FROM ${table} WHERE id = ?;`, id)) !== null;
}

export async function getTrip(db: SQLiteDatabase, id: string): Promise<Trip | null> {
  const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?;', id);
  return row ? fromRow(row) : null;
}

/** The recorded GPS route; empty for manual trips. */
export async function getRoute(db: SQLiteDatabase, tripId: string): Promise<LatLng[]> {
  const row = await db.getFirstAsync<{ points: string }>(
    'SELECT points FROM trip_routes WHERE trip_id = ?;',
    tripId,
  );
  if (!row) return [];
  try {
    return JSON.parse(row.points) as LatLng[];
  } catch {
    return [];
  }
}

type HistoryRow = {
  classification: 'business' | 'personal';
  purpose: string;
  started_at: string;
  start_place_id: string | null;
  end_place_id: string | null;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
};

/**
 * Trips the user classified themselves, newest first, for learning routes.
 * Rule-classified trips (auto_reason set) are left out so a guess never
 * reinforces itself. Only the route's first and last points are read, in SQL,
 * rather than parsing every polyline.
 */
export async function listClassificationHistory(
  db: SQLiteDatabase,
  limit = 1000,
): Promise<ClassifiedTrip[]> {
  const rows = await db.getAllAsync<HistoryRow>(
    `SELECT t.classification, t.purpose, t.started_at, t.start_place_id, t.end_place_id,
       json_extract(r.points, '$[0].latitude') AS start_lat,
       json_extract(r.points, '$[0].longitude') AS start_lng,
       json_extract(r.points, '$[' || (json_array_length(r.points) - 1) || '].latitude') AS end_lat,
       json_extract(r.points, '$[' || (json_array_length(r.points) - 1) || '].longitude') AS end_lng
     FROM trips t LEFT JOIN trip_routes r ON r.trip_id = t.id
     WHERE t.classification IN ('business', 'personal') AND t.auto_reason IS NULL AND t.auto_default = 0
       AND (r.trip_id IS NOT NULL OR t.start_place_id IS NOT NULL OR t.end_place_id IS NOT NULL)
     ORDER BY t.started_at DESC
     LIMIT ?;`,
    limit,
  );
  const point = (latitude: number | null, longitude: number | null) =>
    latitude === null || longitude === null ? null : { latitude, longitude };
  return rows.map((row) => ({
    classification: row.classification,
    purpose: row.purpose,
    startedAt: row.started_at,
    start: { placeId: row.start_place_id, point: point(row.start_lat, row.start_lng) },
    end: { placeId: row.end_place_id, point: point(row.end_lat, row.end_lng) },
  }));
}

export async function insertTrip(
  db: SQLiteDatabase,
  input: NewTrip,
  route: readonly LatLng[] = [],
): Promise<Trip> {
  const trip: Trip = {
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
    ...input,
    id: Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await inWriteTransaction(db, async () => {
    // A place or vehicle deleted since the caller looked it up (the background
    // tracker reverse-geocodes for a while) only unlinks the trip: the drive is still saved.
    if (!(await exists(db, 'places', trip.startPlaceId))) trip.startPlaceId = null;
    if (!(await exists(db, 'places', trip.endPlaceId))) trip.endPlaceId = null;
    if (!(await exists(db, 'vehicles', trip.vehicleId))) trip.vehicleId = null;
    await db.runAsync(
      `INSERT INTO trips (id, started_at, local_date, ended_at, start_label, end_label,
         distance_meters, classification, purpose, source, created_at,
         start_place_id, end_place_id, auto_reason, auto_default, vehicle, vehicle_id, shift_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      trip.id,
      trip.startedAt,
      trip.localDate,
      trip.endedAt,
      trip.startLabel,
      trip.endLabel,
      trip.distanceMeters,
      trip.classification,
      trip.purpose,
      trip.source,
      trip.createdAt,
      trip.startPlaceId,
      trip.endPlaceId,
      trip.autoReason === 'default' ? null : trip.autoReason,
      trip.autoReason === 'default' ? 1 : 0,
      trip.vehicle,
      trip.vehicleId,
      trip.shiftId,
    );
    if (route.length > 1) {
      await db.runAsync(
        'INSERT INTO trip_routes (trip_id, points) VALUES (?, ?);',
        trip.id,
        JSON.stringify(roundRoute(route)),
      );
    }
    await logEdit(db, trip.id, 'create', null, null, trip.source);
    // Separate 'auto' entries so an auditor can tell a rule's guess from the user's choice.
    if (trip.autoReason && trip.classification !== 'unclassified') {
      await logEdit(db, trip.id, 'auto', 'classification', 'unclassified', trip.classification);
      await logEdit(db, trip.id, 'auto', 'auto_reason', null, trip.autoReason);
      if (trip.purpose) await logEdit(db, trip.id, 'auto', 'purpose', '', trip.purpose);
    }
  });
  return trip;
}

/*
 * Edits take the trip for its id only. What they compare against and log is
 * the trip as saved, read inside their transaction: the caller's copy may be
 * stale (edited on another screen), or of a trip deleted meanwhile, which
 * edits then leave alone (no audit rows for a trip that doesn't exist).
 */

/** Sets a trip's classification. */
export async function setClassification(
  db: SQLiteDatabase,
  trip: Pick<Trip, 'id'>,
  classification: Classification,
): Promise<void> {
  await inWriteTransaction(db, async () => {
    const saved = await getTrip(db, trip.id);
    if (!saved) return;
    // Any choice by the user, even re-tapping an automatic one, makes it theirs:
    // the auto note disappears and the trip starts counting towards learned routes.
    if (saved.classification === classification && !saved.autoReason) return;
    await db.runAsync(
      'UPDATE trips SET classification = ?, auto_reason = NULL, auto_default = 0 WHERE id = ?;',
      classification,
      saved.id,
    );
    if (saved.classification !== classification) {
      await logEdit(db, saved.id, 'update', 'classification', saved.classification, classification);
    }
    if (saved.autoReason) {
      await logEdit(db, saved.id, 'update', 'auto_reason', saved.autoReason, null);
    }
  });
}

/** Updates purpose and place names, logging each field that differs from the saved trip. */
export async function updateTripDetails(
  db: SQLiteDatabase,
  trip: Pick<Trip, 'id'>,
  changes: Partial<Pick<Trip, 'purpose' | 'startLabel' | 'endLabel' | 'vehicle' | 'vehicleId'>>,
): Promise<void> {
  const columns = {
    purpose: 'purpose',
    startLabel: 'start_label',
    endLabel: 'end_label',
    vehicle: 'vehicle',
    vehicleId: 'vehicle_id',
  } as const;
  const keys = (Object.keys(columns) as (keyof typeof columns)[]).filter((key) => changes[key] !== undefined);
  if (keys.length === 0) return;
  await inWriteTransaction(db, async () => {
    const saved = await getTrip(db, trip.id);
    if (!saved) return;
    for (const key of keys) {
      const value = changes[key] as string;
      if (value === saved[key]) continue;
      await db.runAsync(`UPDATE trips SET ${columns[key]} = ? WHERE id = ?;`, value, saved.id);
      await logEdit(db, saved.id, 'update', columns[key], saved[key], value);
    }
  });
}

/**
 * Links a trip end to a named place. Not logged: it only affects how future
 * trips are suggested, not what this trip claims. Nothing happens if either
 * the trip or the place is gone.
 */
export async function setTripPlace(
  db: SQLiteDatabase,
  tripId: string,
  end: 'start' | 'end',
  placeId: string,
): Promise<void> {
  const column = end === 'start' ? 'start_place_id' : 'end_place_id';
  await withWriteLock(() =>
    db.runAsync(
      `UPDATE trips SET ${column} = ? WHERE id = ? AND EXISTS (SELECT 1 FROM places WHERE id = ?);`,
      placeId,
      tripId,
      placeId,
    ),
  );
}

/** Deletes a trip, keeping it whole (as saved) in the edit history. Deleting it again does nothing. */
export async function deleteTrip(db: SQLiteDatabase, trip: Pick<Trip, 'id'>): Promise<void> {
  await inWriteTransaction(db, async () => {
    const saved = await getTrip(db, trip.id);
    if (!saved) return;
    await db.runAsync('DELETE FROM trips WHERE id = ?;', saved.id);
    await logEdit(db, saved.id, 'delete', null, JSON.stringify(saved), null);
  });
}

function logEdit(
  db: SQLiteDatabase,
  tripId: string,
  action: 'create' | 'update' | 'delete' | 'auto',
  field: string | null,
  oldValue: string | null,
  newValue: string | null,
) {
  return db.runAsync(
    'INSERT INTO trip_edits (trip_id, at, action, field, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?);',
    tripId,
    new Date().toISOString(),
    action,
    field,
    oldValue,
    newValue,
  );
}
