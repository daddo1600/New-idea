import type { SQLiteDatabase } from 'expo-sqlite';

import { loadSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { marApplies, marForYear } from '@/domain/mar';
import { currentTaxYear, REGIONS, summarizeTaxYear } from '@/domain/regions';

import { rememberTotal } from './remembered-region';

/**
 * Recomputes this tax year's total for the opening animation. Called when the
 * background tracker saves a trip, so the next launch shows the latest figure
 * even if the app wasn't opened in between.
 */
export async function refreshLaunchTotal(db: SQLiteDatabase): Promise<void> {
  const settings = await loadSettings(db);
  if (!settings.onboarded || !settings.region) return;
  const region = REGIONS[settings.region];
  const visible = await listTrips(db);
  const year = currentTaxYear(region);
  // As home's hero total: parking and tolls included where they count.
  const summary = summarizeTaxYear(visible, region, year);
  // UK employees see their Mileage Allowance Relief on home, so the opening counts that up.
  if (settings.employment === 'employee' && marApplies(region)) {
    const relief = marForYear(visible, region, year, { employerRate: settings.employerRate, band: settings.taxBand });
    return rememberTotal(relief.relief, summary.businessMeters);
  }
  await rememberTotal(summary.total, summary.businessMeters);
}
