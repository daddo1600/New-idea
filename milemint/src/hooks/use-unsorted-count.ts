import { usePathname } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { countUnsorted } from '@/db/trips-repo';
import { onTripsChanged } from '@/db/use-trips';

/**
 * How many drives are still to sort, for the Home tab's badge. Counted again
 * on every screen change, whenever a list reloads its trips (a drive sorted,
 * added or deleted) and on coming back to the app (a drive logged meanwhile).
 */
export function useUnsortedCount(): number {
  const db = useSQLiteContext();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    countUnsorted(db).then(setCount, () => {});
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);
  useEffect(() => onTripsChanged(refresh), [refresh]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return count;
}
