import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { listWeeklyEarnings, saveWeeklyEarnings } from '@/db/earnings-repo';
import { loadSettings, updateSettings } from '@/db/settings-repo';
import { currentTaxYear, type DeductionTrip } from '@/domain/regions';
import {
  amountBeforeMonday,
  deductionsByWeek,
  recentWeekStarts,
  setAsidePercent,
  setAsideWeeks,
  taxYearSetAside,
  weekStartOf,
} from '@/domain/set-aside';
import { toLocalIsoDate } from '@/domain/trip';
import { useCanUse } from '@/hooks/use-feature';
import { useRegion } from '@/region/region';
import { cancelSetAsideReminder, scheduleSetAsideReminder } from '@/reminders/money';

/** Weeks in the bar chart on the Money tab. */
export const WEEKS_SHOWN = 8;

/**
 * The tax set-aside for the Money tab: each week's earnings (re-read when the
 * tab comes into view), the rate, the last few weeks' figures and the tax
 * year's total. Saving keeps the Monday reminder's amount up to date, and the
 * first time earnings are entered switches the reminder on (once).
 */
export function useSetAside(trips: readonly DeductionTrip[], deductions: ReadonlyMap<string, number>, employee: boolean) {
  const db = useSQLiteContext();
  const { region } = useRegion();
  const unlocked = useCanUse('tax-set-aside');
  const [earnings, setEarnings] = useState<Map<string, number> | null>(null);
  const [saved, setSaved] = useState<{ percent: number | null; reminder: boolean } | null>(null);

  const load = useCallback(async () => {
    const [weeks, settings] = await Promise.all([listWeeklyEarnings(db), loadSettings(db)]);
    setEarnings(weeks);
    setSaved({ percent: settings.setAsidePercent, reminder: settings.setAsideReminder });
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  const percent = setAsidePercent(saved?.percent ?? null, region);
  const byWeek = useMemo(() => deductionsByWeek(trips, deductions, region, employee), [trips, deductions, region, employee]);
  const today = toLocalIsoDate(new Date());
  const thisWeek = weekStartOf(today);
  const weeks = useMemo(
    () => setAsideWeeks(recentWeekStarts(today, WEEKS_SHOWN), earnings ?? new Map(), byWeek, percent),
    [today, earnings, byWeek, percent],
  );
  const taxYear = currentTaxYear(region);
  const yearTotal = useMemo(
    () => taxYearSetAside(earnings ?? new Map(), byWeek, percent, region, taxYear),
    [earnings, byWeek, percent, region, taxYear],
  );

  // The Monday reminder carries an amount: queued again whenever the figures change. Never asks here.
  const reminderOn = unlocked && saved?.reminder === true;
  useEffect(() => {
    if (!earnings) return;
    if (reminderOn) scheduleSetAsideReminder(region, amountBeforeMonday(earnings, byWeek, percent)).catch(() => {});
    else if (saved && !unlocked) cancelSetAsideReminder().catch(() => {});
  }, [reminderOn, unlocked, saved, earnings, byWeek, percent, region]);

  /** Saves a week's earnings (null clears it) and, if given, the rate. */
  const save = useCallback(
    async (weekStart: string, amount: number | null, nextPercent?: number | null) => {
      await saveWeeklyEarnings(db, weekStart, amount);
      const next = await updateSettings(db, nextPercent !== undefined ? { setAsidePercent: nextPercent } : {});
      const weeks = await listWeeklyEarnings(db);
      setEarnings(weeks);
      setSaved({ percent: next.setAsidePercent, reminder: next.setAsideReminder });
      // On by default once earnings are entered: switched on once, here, where it's plainly useful.
      if (amount !== null && !next.setAsideReminderDefaulted) {
        const usedPercent = setAsidePercent(next.setAsidePercent, region);
        const scheduled = await scheduleSetAsideReminder(region, amountBeforeMonday(weeks, byWeek, usedPercent), true).catch(
          () => false,
        );
        const after = await updateSettings(db, { setAsideReminder: scheduled, setAsideReminderDefaulted: true });
        setSaved({ percent: after.setAsidePercent, reminder: after.setAsideReminder });
      }
    },
    [db, region, byWeek],
  );

  return {
    unlocked,
    loaded: earnings !== null && saved !== null,
    earnings: earnings ?? new Map<string, number>(),
    percent,
    customPercent: saved?.percent ?? null,
    weeks,
    thisWeek,
    yearTotal,
    save,
  };
}
