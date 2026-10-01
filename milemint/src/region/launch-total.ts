import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { loadSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { lockedTripIds } from '@/domain/plan';
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
  const locked = lockedTripIds(trips, isPro);
  const summary = summarizeTaxYear(
    trips.filter((trip) => !locked.has(trip.id)),
    region,
    currentTaxYear(region),
  );
  await rememberTotal(summary.deduction);
}
