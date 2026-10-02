import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { listPlaces } from '@/db/places-repo';
import { DEMO_GAP_PLACES, DEMO_MODE, demoTrackingHealth } from '@/dev/demo';
import type { LatLng } from '@/domain/geo';
import { matchPlace } from '@/domain/places';
import type { TrackingGap } from '@/domain/tracker-policy';
import { alertWorthy, type TrackingHealth } from '@/domain/tracking-health';

import {
  dismissTrackingGap,
  getTrackingHealth,
  labelFor,
  startTracking,
  TRACKING_SUPPORTED,
  updateTrackerRecord,
} from './background';
import { cancelHealthAlerts, queueHealthAlert } from './health-alerts';
import { onTrackingChecked, trackingChecked } from './use-tracking';

/** The demo's gap, once added or dismissed, stays gone for the session. */
let demoGapDismissed = false;

/** The missed trip was added by hand (or it wasn't a drive): stop offering it. */
export async function markGapFilled(db: SQLiteDatabase, id: string): Promise<void> {
  if (DEMO_MODE) demoGapDismissed = true;
  else await dismissTrackingGap(db, id);
}

/**
 * Leaving the app with a problem showing: tell the driver later if it's still
 * there (they may be on their way to Settings to fix it). Coming back cancels
 * whatever hasn't gone off yet: the home card says it instead.
 */
const LEAVE_ALERT_DELAY_MS = 15 * 60_000;

/**
 * Whether tracking is really working, for the home card and Settings. Read
 * again on focus and whenever tracking has been caught up on returning to the
 * app (after the reconcile, so a geofence being re-armed isn't reported as gone).
 */
export function useTrackingHealth() {
  const db = useSQLiteContext();
  /** The health, and when it was read (for "3 minutes ago"). */
  const [checked, setChecked] = useState<{ health: TrackingHealth | null; at: number }>({ health: null, at: 0 });

  const refresh = useCallback(async () => {
    const health = DEMO_MODE
      ? demoTrackingHealth(Date.now(), demoGapDismissed)
      : await getTrackingHealth(db).catch(() => null);
    setChecked({ health, at: Date.now() });
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  useEffect(() => onTrackingChecked(() => refresh()), [refresh]);

  /** "Turn tracking back on": re-arms from where the phone is now. */
  const restart = useCallback(async () => {
    if (!DEMO_MODE) await startTracking(db);
    trackingChecked();
  }, [db]);

  /** Added by hand, or not a drive: the card stops offering it. */
  const dismissGap = useCallback(
    async (gap: TrackingGap) => {
      await markGapFilled(db, gap.id);
      await refresh();
    },
    [db, refresh],
  );

  /** Names for the gap's two ends: the user's own places first, then the street. */
  const labelGap = useCallback(
    async (gap: TrackingGap): Promise<{ from: string; to: string }> => {
      if (DEMO_MODE) return { from: DEMO_GAP_PLACES.from.label, to: DEMO_GAP_PLACES.to.label };
      const places = await listPlaces(db).catch(() => []);
      const name = async (at: LatLng) => matchPlace(at, places)?.name ?? (await labelFor(at));
      const [from, to] = await Promise.all([name(gap.from), name(gap.to)]);
      return { from, to };
    },
    [db],
  );

  return { health: checked.health, checkedAt: checked.at, refresh, restart, dismissGap, labelGap };
}

/** Notifies about tracking problems found as the app goes into the background. Mount once (the tabs' layout). */
export function useTrackingAlerts() {
  const db = useSQLiteContext();
  useEffect(() => {
    if (DEMO_MODE || !TRACKING_SUPPORTED) return;
    const subscription = AppState.addEventListener('change', (state) => {
      const now = Date.now();
      if (state === 'active') {
        updateTrackerRecord(db, (record) => cancelHealthAlerts(record, now)).catch(() => {});
      } else if (state === 'background') {
        getTrackingHealth(db)
          .then((health) =>
            updateTrackerRecord(db, (record) =>
              health && alertWorthy(health.issue, record) && health.issue !== 'stale'
                ? queueHealthAlert(record, health.issue, now + LEAVE_ALERT_DELAY_MS, now)
                : record,
            ),
          )
          .catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [db]);
}
