import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';

import type { CelebrationContent } from '@/components/celebration';
import { loadSettings, updateSettings } from '@/db/settings-repo';
import { DEMO_CELEBRATE, DEMO_MODE } from '@/dev/demo';
import {
  hasSortedWeek,
  type HabitId,
  milestoneToCelebrate,
  type Progress,
  reachedMilestones,
} from '@/domain/milestones';
import { marApplies } from '@/domain/mar';
import { toUnits, type Region } from '@/domain/regions';
import { toLocalIsoDate, type Trip } from '@/domain/trip';

import { celebrationFor } from './copy';

/** Progress towards milestones from every business trip so far (all tax years). */
export function milestoneProgress(
  trips: readonly Trip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  exportedReport: boolean,
): Progress {
  const business = trips.filter((trip) => trip.classification === 'business');
  const habits = new Set<HabitId>();
  if (trips.length > 0) habits.add('first-trip');
  if (trips.some((trip) => trip.shiftId)) habits.add('first-shift');
  if (hasSortedWeek(trips, toLocalIsoDate(new Date()))) habits.add('sorted-week');
  if (exportedReport) habits.add('first-report');
  return {
    moneyMinor: business.reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0),
    distance: business.reduce((sum, trip) => sum + toUnits(trip.distanceMeters, region), 0),
    habits,
  };
}

/**
 * Watches the trips for a newly reached milestone and returns the
 * celebration to show (once per milestone, remembered in settings).
 */
export function useMilestoneCelebration(
  trips: readonly Trip[] | null,
  deductions: ReadonlyMap<string, number>,
  region: Region,
) {
  const db = useSQLiteContext();
  const [content, setContent] = useState<CelebrationContent | null>(null);
  const tripsKey = useMemo(
    () => (trips ? `${trips.length}:${trips.filter((t) => t.classification === 'business').length}` : ''),
    [trips],
  );

  useEffect(() => {
    if (!trips || (DEMO_MODE && !DEMO_CELEBRATE)) return;
    let current = true;
    (async () => {
      const settings = await loadSettings(db);
      if (!settings.onboarded && !DEMO_CELEBRATE) return;
      const reached = reachedMilestones(milestoneProgress(trips, deductions, region, settings.exportedReport));
      const milestone = milestoneToCelebrate(reached, new Set(settings.celebrated));
      if (!milestone || !current) return;
      // Added to what's saved now (another screen may have celebrated something meanwhile).
      await updateSettings(db, (saved) => ({
        celebrated: [...new Set([...saved.celebrated, ...reached.map((m) => m.id)])],
      }));
      const employee = settings.employment === 'employee' && marApplies(region);
      if (current) setContent(celebrationFor(milestone, region, employee));
    })().catch(() => {});
    return () => {
      current = false;
    };
    // Re-checked when trips are added or sorted, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, tripsKey, region]);

  return { content, close: () => setContent(null) };
}
