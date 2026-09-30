import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { Classification, Trip } from '@/domain/trip';

import { deleteTrip, listTrips, setClassification } from './trips-repo';

/** Trips from the encrypted database, reloaded whenever the screen regains focus. */
export function useTrips() {
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<Trip[] | null>(null);

  const reload = useCallback(async () => {
    setTrips(await listTrips(db));
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

  const remove = useCallback(
    async (trip: Trip) => {
      await deleteTrip(db, trip);
      await reload();
    },
    [db, reload],
  );

  return { trips, classify, remove };
}
