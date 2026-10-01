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

/** Told whenever tracking has just been caught up or changed, so the health check reads again. */
const checkListeners = new Set<() => void>();
export function trackingChecked(): void {
  for (const listener of checkListeners) listener();
}
/** Calls `listener` after each check; returns the unsubscribe. */
export function onTrackingChecked(listener: () => void): () => void {
  checkListeners.add(listener);
  return () => {
    checkListeners.delete(listener);
  };
}

/**
 * Tracking status for the UI. Re-checked on focus and whenever the app returns
 * to the foreground (the user may have changed permissions in Settings).
 *
 * `watch` re-checks every second while the app is open, for screens waiting
 * on a permission: coming back from Settings, iOS can report the new
 * "Always" a moment after the app is active again, so one check isn't enough.
 */
export function useTracking(onForeground?: () => void, { watch = false }: { watch?: boolean } = {}) {
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
      // The status must still update if catching up fails (e.g. no GPS fix indoors).
      await reconcileTracking(db).catch(() => {});
      await refresh();
      trackingChecked();
      onForeground?.();
    };
    // On launch too: iOS may have dropped the geofence (e.g. after a restart).
    catchUp();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') catchUp();
    });
    return () => subscription.remove();
  }, [db, refresh, onForeground]);

  useEffect(() => {
    if (!watch || DEMO_MODE) return;
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') refresh().catch(() => {});
    }, 1000);
    return () => clearInterval(timer);
  }, [watch, refresh]);

  /** Requests permissions and, if granted "Always", switches tracking on. */
  const enable = useCallback(
    async (onAsking?: (question: 1 | 2) => void): Promise<TrackingStatus> => {
      const next = await requestTrackingPermissions(db, onAsking);
      if (next === 'off') {
        await startTracking(db);
        setStatus('on');
        trackingChecked();
        return 'on';
      }
      setStatus(next);
      trackingChecked();
      return next;
    },
    [db],
  );

  return { status, refresh, enable };
}
