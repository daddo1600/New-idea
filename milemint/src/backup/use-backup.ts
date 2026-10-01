import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ICloudBackup } from '../../modules/icloud-backup';
import { onScrubbed } from './after-scrub';
import { backUp } from './backup';

/** Opening the app: wait for the home screen to settle before reading the whole database. */
const OPEN_DELAY_MS = 3000;

/**
 * For the home screen: backs up to iCloud when the app opens and when it
 * goes to the background, whenever one is due (changes and a day since the
 * last, or a week regardless). Most calls end after one cheap check.
 */
export function useAutoBackup(enabled: boolean) {
  const db = useSQLiteContext();

  useEffect(() => {
    if (!enabled || !ICloudBackup.supported) return;
    const attempt = () => {
      // Silent: Settings shows when the last backup was, and the next attempt retries.
      backUp(db).catch(() => {});
    };
    const opening = setTimeout(attempt, OPEN_DELAY_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'active') attempt();
    });
    // Addresses just removed from past trips: replace the older backups that still have them, now.
    const stopWatching = onScrubbed(attempt);
    return () => {
      clearTimeout(opening);
      subscription.remove();
      stopWatching();
    };
  }, [db, enabled]);
}
