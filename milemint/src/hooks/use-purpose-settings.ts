import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { loadSettings, type AppSettings } from '@/db/settings-repo';
import { usualPurpose } from '@/domain/auto-classify';

type PurposeSettings = Pick<
  AppSettings,
  'defaultPurpose' | 'workPurposes' | 'shiftMode' | 'clientPrivacy' | 'workHoursEnabled' | 'workWeek'
>;

/**
 * What the trip list needs to offer business purposes: the usual purpose
 * (settings, else "Deliveries" in shift mode) and how the user works. Re-read
 * whenever the screen comes into view (they're changed in Settings).
 */
export function usePurposeSettings() {
  const db = useSQLiteContext();
  const [stored, setStored] = useState<PurposeSettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      let current = true;
      loadSettings(db).then(
        (settings) => current && setStored(settings),
        () => {},
      );
      return () => {
        current = false;
      };
    }, [db]),
  );

  return {
    usual: stored ? usualPurpose(stored) : null,
    chosen: stored?.workPurposes ?? [],
    shiftMode: stored?.shiftMode ?? false,
    clientPrivacy: stored?.clientPrivacy ?? false,
    /** Work hours, when switched on: for Home's live status and the week's work days. */
    workWeek: stored?.workHoursEnabled ? stored.workWeek : null,
  };
}
