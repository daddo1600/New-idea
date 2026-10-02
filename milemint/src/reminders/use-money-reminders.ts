import { type SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import { listWeeklyEarnings } from '@/db/earnings-repo';
import { loadSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { marApplies } from '@/domain/mar';
import { computeDeductions, type Region } from '@/domain/regions';
import { amountBeforeMonday, deductionsByWeek, setAsidePercent } from '@/domain/set-aside';
import { useCanUse } from '@/hooks/use-feature';
import { useLanguage } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';

import {
  cancelQuarterlyReminders,
  cancelSetAsideReminder,
  scheduleQuarterlyReminders,
  scheduleSetAsideReminder,
} from './money';
import { REMINDERS_SUPPORTED } from './weekly';

/**
 * Queues next Monday's set-aside reminder with the amount for the week before
 * it, worked out from the saved drives and earnings. Asks for permission only
 * when `ask`; resolves to whether it's queued.
 */
export async function queueSetAsideReminder(db: SQLiteDatabase, region: Region, ask = false): Promise<boolean> {
  const [settings, trips, earnings] = await Promise.all([loadSettings(db), listTrips(db), listWeeklyEarnings(db)]);
  const employee = settings.employment === 'employee' && marApplies(region);
  const byWeek = deductionsByWeek(trips, computeDeductions(trips, region), region, employee);
  const percent = setAsidePercent(settings.setAsidePercent, region);
  return scheduleSetAsideReminder(region, amountBeforeMonday(earnings, byWeek, percent), ask);
}

/**
 * Mounted once, by the tabs' layout: keeps the Monday set-aside reminder (Pro
 * or the 1-friend perk) and the quarterly deadline reminders (Pro) queued, in
 * the current language, or cancels them when they're switched off or the
 * plan no longer includes them. Never asks for permission.
 */
export function useMoneyReminders(region: Region) {
  const db = useSQLiteContext();
  const language = useLanguage();
  const { isPro } = usePro();
  const setAsideOpen = useCanUse('tax-set-aside');

  useEffect(() => {
    if (!REMINDERS_SUPPORTED) return;
    (async () => {
      const settings = await loadSettings(db);
      // UK employees claim relief through PAYE: no set-aside or quarterly updates, so no reminders.
      const employee = settings.employment === 'employee' && marApplies(region);
      if (!employee && setAsideOpen && settings.setAsideReminder) await queueSetAsideReminder(db, region);
      else await cancelSetAsideReminder();
      if (!employee && isPro && settings.quarterlyReminder) await scheduleQuarterlyReminders(region);
      else await cancelQuarterlyReminders();
    })().catch(() => {});
  }, [db, region, language, isPro, setAsideOpen]);
}
