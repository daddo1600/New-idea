import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { loadSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { marApplies, marForYear } from '@/domain/mar';
import { lockedTripIds, monthlyAllowance } from '@/domain/plan';
import { currentTaxYear, REGIONS, summarizeTaxYear } from '@/domain/regions';

import { rememberTotal } from './remembered-region';

/** Same key the Pro provider caches the App Store status under. */
const PRO_CACHE_KEY = 'milemint.pro-active';

/**
 * Recomputes this tax year's total for the opening animation. Called when the
 * background tracker saves a trip, so the next launch shows the latest figure
 * even if the app wasn't opened in between.
 */
export async function refreshLaunchTotal(db: SQLiteDatabase): Promise<void> {
  const settings = await loadSettings(db);
  if (!settings.onboarded || !settings.region) return;
  const region = REGIONS[settings.region];
  const isPro = Platform.OS !== 'web' && (await SecureStore.getItemAsync(PRO_CACHE_KEY).catch(() => null)) === '1';
  const trips = await listTrips(db);
  const allowance = monthlyAllowance({ redeemed: settings.redeemedCode !== null, friendsJoined: settings.friendsJoined });
  const locked = lockedTripIds(trips, isPro, allowance);
  const visible = trips.filter((trip) => !locked.has(trip.id));
  const year = currentTaxYear(region);
  // UK employees see their Mileage Allowance Relief on home, so the opening counts that up.
  if (settings.employment === 'employee' && marApplies(region)) {
    const relief = marForYear(visible, region, year, { employerRate: settings.employerRate, band: settings.taxBand });
    return rememberTotal(relief.relief);
  }
  await rememberTotal(summarizeTaxYear(visible, region, year).deduction);
}
