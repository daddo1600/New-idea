import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { ICloudBackup } from '../../modules/icloud-backup';
import { loadBackupFailure, loadBackupState } from './backup';
import { backupWarning, type BackupWarning } from './warning';

/**
 * Home's backup warning, checked when Home comes into view and when the app
 * comes back (say, from turning on iCloud Drive in iPhone Settings).
 */
export function useBackupWarning(enabled: boolean): BackupWarning | null {
  const db = useSQLiteContext();
  const [warning, setWarning] = useState<BackupWarning | null>(null);

  const check = useCallback(async () => {
    if (!enabled || !ICloudBackup.supported) return setWarning(null);
    const [available, state, failure, trips] = await Promise.all([
      ICloudBackup.isAvailable(),
      loadBackupState(),
      loadBackupFailure(),
      db.getFirstAsync<{ count: number; oldest: string | null }>(
        'SELECT COUNT(*) AS count, MIN(started_at) AS oldest FROM trips;',
      ),
    ]);
    setWarning(
      backupWarning({
        supported: true,
        available,
        lastAt: state ? new Date(state.at) : null,
        failure,
        trips: trips?.count ?? 0,
        oldestTripAt: trips?.oldest ?? null,
        now: new Date(),
      }),
    );
  }, [db, enabled]);

  useFocusEffect(
    useCallback(() => {
      check().catch(() => {});
    }, [check]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check().catch(() => {});
    });
    return () => subscription.remove();
  }, [check]);

  return warning;
}
