import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';

import { insertPlace } from '@/db/places-repo';
import { loadSettings, updateSettings, type AppSettings } from '@/db/settings-repo';
import { listRouteEnds, setTripPlace, updateTripDetails } from '@/db/trips-repo';
import type { LatLng } from '@/domain/geo';
import {
  overnightHomeAsk,
  rememberDismissed,
  WORK_LOOKBACK_DAYS,
  workSpotAsk,
  type ParkedDrive,
  type SpotAsk,
} from '@/domain/place-asks';
import type { Place } from '@/domain/places';
import type { Trip } from '@/domain/trip';
import { useT } from '@/i18n/i18n';

type AskSettings = Pick<AppSettings, 'dismissedHomeSpots' | 'dismissedWorkSpots' | 'workHoursEnabled' | 'workWeek'>;

/**
 * "Is this home?" / "Is this work?" on the home screen, at most one at a time:
 * home first, then work (set-hours users only). Yes saves the place, as
 * Settings does, and names the recent drives ending and starting there after
 * it, as naming a trip's end does; No remembers the spot so it isn't asked again.
 */
export function usePlaceAsk(trips: Trip[] | null, places: Place[], now: number, reload: () => Promise<void>) {
  const db = useSQLiteContext();
  const t = useT();
  const [settings, setSettings] = useState<AskSettings | null>(null);
  const [ends, setEnds] = useState<Map<string, { start: LatLng; end: LatLng }> | null>(null);
  const [busy, setBusy] = useState(false);

  // Re-read with the trips: a new drive may be the one that answers the question.
  useEffect(() => {
    if (!trips) return;
    let current = true;
    const since = new Date(Date.now() - WORK_LOOKBACK_DAYS * 86_400_000).toISOString();
    Promise.all([loadSettings(db), listRouteEnds(db, since)]).then(
      ([nextSettings, nextEnds]) => {
        if (!current) return;
        setSettings(nextSettings);
        setEnds(nextEnds);
      },
      () => {},
    );
    return () => {
      current = false;
    };
  }, [db, trips]);

  const ask = useMemo<SpotAsk | null>(() => {
    if (!trips || !settings || !ends) return null;
    const drives: ParkedDrive[] = trips.map((trip) => ({
      id: trip.id,
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
      endLabel: trip.endLabel,
      endPlaceId: trip.endPlaceId,
      start: ends.get(trip.id)?.start ?? null,
      end: ends.get(trip.id)?.end ?? null,
    }));
    const home = overnightHomeAsk(drives, { places, dismissed: settings.dismissedHomeSpots, now });
    if (home) return home;
    if (!settings.workHoursEnabled) return null;
    return workSpotAsk(drives, { places, dismissed: settings.dismissedWorkSpots, now, workWeek: settings.workWeek });
  }, [trips, places, settings, ends, now]);

  const confirm = async () => {
    if (!ask || busy) return;
    setBusy(true);
    try {
      const name = ask.kind === 'home' ? t('Home') : t('Work');
      const place = await insertPlace(db, { name, kind: ask.kind, at: ask.at });
      for (const id of ask.endingIds) {
        await updateTripDetails(db, { id }, { endLabel: name });
        await setTripPlace(db, id, 'end', place.id);
      }
      for (const id of ask.startingIds) {
        await updateTripDetails(db, { id }, { startLabel: name });
        await setTripPlace(db, id, 'start', place.id);
      }
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    if (!ask || busy) return;
    const key = ask.kind === 'home' ? 'dismissedHomeSpots' : 'dismissedWorkSpots';
    setBusy(true);
    try {
      const saved = await updateSettings(db, (stored) => ({ [key]: rememberDismissed(stored[key], ask.at) }));
      setSettings(saved);
    } finally {
      setBusy(false);
    }
  };

  return { ask, busy, confirm, decline };
}
