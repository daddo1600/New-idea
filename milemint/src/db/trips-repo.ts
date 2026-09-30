import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { AutoReason, ClassifiedTrip } from '@/domain/classify-rules';
import type { LatLng } from '@/domain/geo';
import type { Classification, Trip, TripSource } from '@/domain/trip';

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
  auto_reason: AutoReason | null;
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
    autoReason: row.auto_reason,
  };
}

type AutoFields = 'startPlaceId' | 'endPlaceId' | 'autoReason';
export type NewTrip = Omit<Trip, 'id' | 'createdAt' | AutoFields> & Partial<Pick<Trip, AutoFields>>;

export async function listTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const rows = await db.getAllAsync<TripRow>(
    'SELECT * FROM trips ORDER BY local_date DESC, started_at DESC;',
  );
  return rows.map(fromRow);
}

/** Whether an automatically logged trip with this start time is already saved. */
export async function autoTripExists(db: SQLiteDatabase, startedAt: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ found: number }>(
    "SELECT 1 AS found FROM trips WHERE source = 'auto' AND started_at = ? LIMIT 1;",
    startedAt,
  );
  return row !== null;
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
     WHERE t.classification IN ('business', 'personal') AND t.auto_reason IS NULL
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
    ...input,
    id: Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO trips (id, started_at, local_date, ended_at, start_label, end_label,
         distance_meters, classification, purpose, source, created_at,
         start_place_id, end_place_id, auto_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
      trip.autoReason,
    );
    if (route.length > 1) {
      await db.runAsync(
        'INSERT INTO trip_routes (trip_id, points) VALUES (?, ?);',
        trip.id,
        JSON.stringify(route),
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

export async function setClassification(
  db: SQLiteDatabase,
  trip: Trip,
  classification: Classification,
): Promise<void> {
  if (trip.classification === classification && !trip.autoReason) return;
  // Any choice by the user, even re-tapping an automatic one, makes it theirs:
  // the auto note disappears and the trip starts counting towards learned routes.
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE trips SET classification = ?, auto_reason = NULL WHERE id = ?;',
      classification,
      trip.id,
    );
    if (trip.classification !== classification) {
      await logEdit(db, trip.id, 'update', 'classification', trip.classification, classification);
    }
    if (trip.autoReason) {
      await logEdit(db, trip.id, 'update', 'auto_reason', trip.autoReason, null);
    }
  });
}

/** Updates purpose and place names, logging each changed field. */
export async function updateTripDetails(
  db: SQLiteDatabase,
  trip: Trip,
  changes: Partial<Pick<Trip, 'purpose' | 'startLabel' | 'endLabel'>>,
): Promise<void> {
  const columns = { purpose: 'purpose', startLabel: 'start_label', endLabel: 'end_label' } as const;
  const changed = (Object.keys(columns) as (keyof typeof columns)[]).filter(
    (key) => changes[key] !== undefined && changes[key] !== trip[key],
  );
  if (changed.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const key of changed) {
      const value = changes[key] as string;
      await db.runAsync(`UPDATE trips SET ${columns[key]} = ? WHERE id = ?;`, value, trip.id);
      await logEdit(db, trip.id, 'update', columns[key], trip[key], value);
    }
  });
}

/**
 * Links a trip end to a named place. Not logged: it only affects how future
 * trips are suggested, not what this trip claims.
 */
export async function setTripPlace(
  db: SQLiteDatabase,
  tripId: string,
  end: 'start' | 'end',
  placeId: string,
): Promise<void> {
  const column = end === 'start' ? 'start_place_id' : 'end_place_id';
  await db.runAsync(`UPDATE trips SET ${column} = ? WHERE id = ?;`, placeId, tripId);
}

export async function deleteTrip(db: SQLiteDatabase, trip: Trip): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM trips WHERE id = ?;', trip.id);
    await logEdit(db, trip.id, 'delete', null, JSON.stringify(trip), null);
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
