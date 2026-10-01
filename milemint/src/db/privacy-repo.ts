import type { SQLiteDatabase } from 'expo-sqlite';

import { noteScrubbed } from '@/backup/after-scrub';
import { isAreaOnly, placeNameSet, redactLabel } from '@/domain/privacy';
import type { RegionCode } from '@/domain/regions';

import { inWriteTransaction } from './transaction';

type Db = Pick<SQLiteDatabase, 'getAllAsync' | 'getFirstAsync' | 'runAsync' | 'execAsync' | 'withTransactionAsync'>;

type TripLabels = {
  id: string;
  start_label: string;
  end_label: string;
};

type LabelEdit = { id: number; action: string; field: string | null; old_value: string | null; new_value: string | null };

async function savedPlaceNames(db: Db): Promise<Set<string>> {
  return placeNameSet(await db.getAllAsync<{ name: string }>('SELECT name FROM places;'));
}

/**
 * How many trips there are to tidy up when client privacy is switched on:
 * those with a GPS route or a label that is more than a saved place's name or
 * the area (trips already reduced aren't counted again).
 */
export async function countPastTrips(db: Db): Promise<number> {
  const [placeNames, trips] = await Promise.all([
    savedPlaceNames(db),
    db.getAllAsync<TripLabels & { has_route: number }>(
      `SELECT id, start_label, end_label,
         EXISTS (SELECT 1 FROM trip_routes WHERE trip_routes.trip_id = trips.id) AS has_route
       FROM trips;`,
    ),
  ]);
  return trips.filter(
    (trip) =>
      Boolean(trip.has_route) || !isAreaOnly(trip.start_label, placeNames) || !isAreaOnly(trip.end_label, placeNames),
  ).length;
}

/**
 * Client privacy, applied to the past: every trip label that isn't the name
 * of a place the user saved becomes "Client visit · area", every stored GPS
 * route is deleted, and addresses in the edit history (old labels, deleted
 * trips) are reduced the same way. Dates, distances and purposes stay as they
 * are, so the claim doesn't change. Can't be undone: the addresses are gone
 * from the phone, and the next iCloud backup replaces the older ones that
 * still have them (see backup/after-scrub.ts).
 *
 * A trip linked to a saved place keeps its label only when the label is that
 * name: the link and the label can disagree (a label edited after the trip
 * was linked, a typed address linked to a saved place nearby).
 *
 * Each change is logged as 'redact' with no old value: an auditor can see the
 * destination was reduced for privacy, and it doesn't count as "Edited later"
 * (that flag is about changes to what a trip claims). Returns how many trips
 * had a label changed.
 */
export async function scrubPastTrips(db: Db, region: RegionCode | null): Promise<number> {
  let changed = 0;
  // One write transaction, waiting its turn with the others on this connection (a restore, a backup's read).
  await inWriteTransaction(db, async () => {
    // Read inside the transaction, so a trip saved meanwhile isn't missed or overwritten.
    const [placeNames, trips, edits] = await Promise.all([
      savedPlaceNames(db),
      db.getAllAsync<TripLabels>('SELECT id, start_label, end_label FROM trips;'),
      db.getAllAsync<LabelEdit>(
        `SELECT id, action, field, old_value, new_value FROM trip_edits
         WHERE field IN ('start_label', 'end_label') OR action = 'delete';`,
      ),
    ]);
    const redactText = (text: string | null) => (text === null ? null : redactLabel(text, placeNames, region));

    const now = new Date().toISOString();
    for (const trip of trips) {
      const start = redactLabel(trip.start_label, placeNames, region);
      const end = redactLabel(trip.end_label, placeNames, region);
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
  // The older iCloud backups still have the addresses: replace them with a fresh one now.
  await noteScrubbed().catch(() => {});
  return changed;
}

/** A deleted trip is kept whole in the edit history, as JSON; reduce its labels too. */
function redactDeletedTrip(json: string | null, placeNames: ReadonlySet<string>, region: RegionCode | null) {
  if (!json) return json;
  try {
    const trip = JSON.parse(json) as Record<string, unknown>;
    for (const label of ['startLabel', 'endLabel'] as const) {
      if (typeof trip[label] !== 'string') continue;
      trip[label] = redactLabel(trip[label], placeNames, region);
    }
    return JSON.stringify(trip);
  } catch {
    // Not readable as a trip: drop it rather than keep an address.
    return null;
  }
}
