import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

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
  };
}

export type NewTrip = Omit<Trip, 'id' | 'createdAt'>;

export async function listTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const rows = await db.getAllAsync<TripRow>(
    'SELECT * FROM trips ORDER BY local_date DESC, started_at DESC;',
  );
  return rows.map(fromRow);
}

export async function insertTrip(db: SQLiteDatabase, input: NewTrip): Promise<Trip> {
  const trip: Trip = { ...input, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO trips (id, started_at, local_date, ended_at, start_label, end_label,
         distance_meters, classification, purpose, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
    );
    await logEdit(db, trip.id, 'create', null, null, trip.source);
  });
  return trip;
}

export async function setClassification(
  db: SQLiteDatabase,
  trip: Trip,
  classification: Classification,
): Promise<void> {
  if (trip.classification === classification) return;
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE trips SET classification = ? WHERE id = ?;', classification, trip.id);
    await logEdit(db, trip.id, 'update', 'classification', trip.classification, classification);
  });
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
  action: 'create' | 'update' | 'delete',
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
