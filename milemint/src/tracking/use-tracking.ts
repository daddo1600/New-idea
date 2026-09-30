import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { DEMO_MODE, DEMO_TRACKING_STATUS } from '@/dev/demo';

import {
  getTrackingStatus,
  reconcileTracking,
  requestTrackingPermissions,
  startTracking,
  type TrackingStatus,
} from './background';

/**
 * Tracking status for the UI. Re-checked on focus and whenever the app returns
 * to the foreground (the user may have changed permissions in Settings).
 */
export function useTracking(onForeground?: () => void) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<TrackingStatus | null>(null);

  const refresh = useCallback(async () => {
    setStatus(DEMO_MODE ? DEMO_TRACKING_STATUS : await getTrackingStatus(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const catchUp = async () => {
      await reconcileTracking(db);
      await refresh();
      onForeground?.();
    };
    // On launch too: iOS may have dropped the geofence (e.g. after a restart).
    catchUp();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') catchUp();
    });
    return () => subscription.remove();
  }, [db, refresh, onForeground]);

  /** Requests permissions and, if granted "Always", switches tracking on. */
  const enable = useCallback(async (): Promise<TrackingStatus> => {
    const next = await requestTrackingPermissions(db);
    if (next === 'off') {
      await startTracking(db);
      setStatus('on');
      return 'on';
    }
    setStatus(next);
    return next;
  }, [db]);

  return { status, refresh, enable };
}
