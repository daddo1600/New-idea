import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { LatLng } from '@/domain/geo';
import { DEFAULT_PLACE_RADIUS_M, type Place, type PlaceKind } from '@/domain/places';

import { withWriteLock } from './transaction';

type PlaceRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  kind: PlaceKind;
};

function fromRow(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusM: row.radius_m,
    kind: row.kind,
  };
}

export async function listPlaces(db: SQLiteDatabase): Promise<Place[]> {
  const rows = await db.getAllAsync<PlaceRow>('SELECT * FROM places ORDER BY name COLLATE NOCASE;');
  return rows.map(fromRow);
}

export async function insertPlace(
  db: SQLiteDatabase,
  input: { name: string; kind: PlaceKind; at: LatLng; radiusM?: number },
): Promise<Place> {
  const place: Place = {
    id: Crypto.randomUUID(),
    name: input.name,
    kind: input.kind,
    latitude: input.at.latitude,
    longitude: input.at.longitude,
    radiusM: input.radiusM ?? DEFAULT_PLACE_RADIUS_M,
  };
  await withWriteLock(() =>
    db.runAsync(
      `INSERT INTO places (id, name, latitude, longitude, radius_m, kind, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      place.id,
      place.name,
      place.latitude,
      place.longitude,
      place.radiusM,
      place.kind,
      new Date().toISOString(),
    ),
  );
  return place;
}

/** Trips keep their labels; their link to the place is cleared by the foreign key. */
export async function deletePlace(db: SQLiteDatabase, id: string): Promise<void> {
  await withWriteLock(() => db.runAsync('DELETE FROM places WHERE id = ?;', id));
}
