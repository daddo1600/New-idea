import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { Place } from '@/domain/places';
import type { Classification, Trip } from '@/domain/trip';

import { listPlaces } from './places-repo';
import { deleteTrip, listTrips, setClassification } from './trips-repo';

/**
 * Trips (and the named places they refer to) from the encrypted database,
 * reloaded whenever the screen regains focus.
 */
export function useTrips() {
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);

  const reload = useCallback(async () => {
    const [nextTrips, nextPlaces] = await Promise.all([listTrips(db), listPlaces(db)]);
    setPlaces(nextPlaces);
    setTrips(nextTrips);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const classify = useCallback(
    async (trip: Trip, classification: Classification) => {
      await setClassification(db, trip, classification);
      await reload();
    },
    [db, reload],
  );

  /** Bulk sort: one reload at the end instead of one per trip. */
  const classifyMany = useCallback(
    async (many: readonly Trip[], classification: Classification) => {
      // Sequential: each change is its own transaction with its own audit entry.
      for (const trip of many) await setClassification(db, trip, classification);
      await reload();
    },
    [db, reload],
  );

  const remove = useCallback(
    async (trip: Trip) => {
      await deleteTrip(db, trip);
      await reload();
    },
    [db, reload],
  );

  return { trips, places, classify, classifyMany, remove, reload };
}
