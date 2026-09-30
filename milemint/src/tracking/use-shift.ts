import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { loadSettings } from '@/db/settings-repo';
import { currentShift, endShift, startShift, type Shift } from '@/db/shifts-repo';

/** Shift mode for the home screen: whether it's on, the open shift, and start/end. */
export function useShift() {
  const db = useSQLiteContext();
  const [enabled, setEnabled] = useState(false);
  const [shift, setShift] = useState<Shift | null>(null);

  useFocusEffect(
    useCallback(() => {
      let current = true;
      Promise.all([loadSettings(db), currentShift(db)]).then(
        ([settings, open]) => {
          if (!current) return;
          setEnabled(settings.shiftMode);
          setShift(open);
        },
        () => {},
      );
      return () => {
        current = false;
      };
    }, [db]),
  );

  const start = useCallback(async () => setShift(await startShift(db)), [db]);
  const end = useCallback(async () => {
    await endShift(db);
    setShift(null);
  }, [db]);

  return { enabled, shift, start, end };
}
