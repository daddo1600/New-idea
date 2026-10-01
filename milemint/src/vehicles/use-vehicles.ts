import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { ensureVehicles, setCurrentVehicle } from '@/db/vehicles-repo';
import type { Vehicle } from '@/domain/vehicles';

/** The garage and the vehicle being driven now, re-read whenever the screen comes into view. */
export function useVehicles() {
  const db = useSQLiteContext();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [current, setCurrent] = useState<Vehicle | null>(null);

  const reload = useCallback(async () => {
    const garage = await ensureVehicles(db);
    setVehicles(garage.vehicles);
    setCurrent(garage.current);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload().catch(() => {});
    }, [reload]),
  );

  const choose = useCallback(
    async (vehicle: Vehicle) => {
      setCurrent(vehicle);
      await setCurrentVehicle(db, vehicle);
    },
    [db],
  );

  return { vehicles, current, choose, reload };
}
