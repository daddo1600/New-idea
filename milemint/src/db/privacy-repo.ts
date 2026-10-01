import type { SQLiteDatabase } from 'expo-sqlite';

import { redactLabel } from '@/domain/privacy';
import type { RegionCode } from '@/domain/regions';

type Db = Pick<SQLiteDatabase, 'getAllAsync' | 'getFirstAsync' | 'runAsync' | 'execAsync' | 'withTransactionAsync'>;

type TripLabels = {
  id: string;
  start_label: string;
  end_label: string;
  start_place_id: string | null;
  end_place_id: string | null;
};

type LabelEdit = { id: number; action: string; field: string | null; old_value: string | null; new_value: string | null };

/** How many trips there are to tidy up when client privacy is switched on. */
export async function countPastTrips(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM trips;');
  return row?.count ?? 0;
}

/**
 * Client privacy, applied to the past: every trip label that isn't a place the
 * user saved becomes "Client visit · area", every stored GPS route is deleted,
 * and addresses in the edit history (old labels, deleted trips) are reduced
 * the same way. Dates, distances and purposes stay as they are, so the claim
 * doesn't change. Can't be undone: the addresses are gone from the phone.
 *
 * Each change is logged as 'redact' with no old value: an auditor can see the
 * destination was reduced for privacy, and it doesn't count as "Edited later"
 * (that flag is about changes to what a trip claims). Returns how many trips
 * had a label changed.
 */
export async function scrubPastTrips(db: Db, region: RegionCode | null): Promise<number> {
  const [places, trips, edits] = await Promise.all([
    db.getAllAsync<{ name: string }>('SELECT name FROM places;'),
    db.getAllAsync<TripLabels>('SELECT id, start_label, end_label, start_place_id, end_place_id FROM trips;'),
    db.getAllAsync<LabelEdit>(
      `SELECT id, action, field, old_value, new_value FROM trip_edits
       WHERE field IN ('start_label', 'end_label') OR action = 'delete';`,
    ),
  ]);
  const placeNames = new Set(places.map((place) => place.name.trim().toLowerCase()));
  // Edit history doesn't say whether a label was a saved place; a saved place's name still is.
  const redactText = (text: string | null) => (text === null ? null : redactLabel(text, null, placeNames, region));

  let changed = 0;
  await db.withTransactionAsync(async () => {
    const now = new Date().toISOString();
    for (const trip of trips) {
      const start = redactLabel(trip.start_label, trip.start_place_id, placeNames, region);
      const end = redactLabel(trip.end_label, trip.end_place_id, placeNames, region);
      if (start === trip.start_label && end === trip.end_label) continue;
      changed++;
      await db.runAsync('UPDATE trips SET start_label = ?, end_label = ? WHERE id = ?;', start, end, trip.id);
      for (const [field, before, after] of [
        ['start_label', trip.start_label, start],
        ['end_label', trip.end_label, end],
      ] as const) {
        if (before === after) continue;
        await db.runAsync(
          'INSERT INTO trip_edits (trip_id, at, action, field, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?);',
          trip.id,
          now,
          'redact',
          field,
          null,
          after,
        );
      }
    }

    for (const edit of edits) {
      const [oldValue, newValue] =
        edit.action === 'delete'
          ? [redactDeletedTrip(edit.old_value, placeNames, region), edit.new_value]
          : [redactText(edit.old_value), redactText(edit.new_value)];
      if (oldValue === edit.old_value && newValue === edit.new_value) continue;
      await db.runAsync('UPDATE trip_edits SET old_value = ?, new_value = ? WHERE id = ?;', oldValue, newValue, edit.id);
    }

    await db.runAsync('DELETE FROM trip_routes;');
  });
  // Rewrites the file so the old pages (with the addresses) don't linger. Best effort:
  // it can't run while a background wake-up holds the database, and the data is already gone.
  await db.execAsync('VACUUM;').catch(() => {});
  return changed;
}

/** A deleted trip is kept whole in the edit history, as JSON; reduce its labels too. */
function redactDeletedTrip(json: string | null, placeNames: ReadonlySet<string>, region: RegionCode | null) {
  if (!json) return json;
  try {
    const trip = JSON.parse(json) as Record<string, unknown>;
    for (const [label, placeId] of [
      ['startLabel', 'startPlaceId'],
      ['endLabel', 'endPlaceId'],
    ] as const) {
      if (typeof trip[label] !== 'string') continue;
      trip[label] = redactLabel(trip[label], (trip[placeId] as string | null) ?? null, placeNames, region);
    }
    return JSON.stringify(trip);
  } catch {
    // Not readable as a trip: drop it rather than keep an address.
    return null;
  }
}
