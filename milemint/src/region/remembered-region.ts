import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { REGIONS, type RegionCode } from '@/domain/regions';

/**
 * A copy of the chosen country outside the encrypted database, for the launch
 * animation: it plays before the database has opened, and should count up in
 * the user's own currency. Only the two-letter code is kept here.
 */
const KEY = 'milemint.region';

export async function recallRegion(): Promise<RegionCode | null> {
  try {
    const stored =
      Platform.OS === 'web' ? globalThis.localStorage?.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    return stored && stored in REGIONS ? (stored as RegionCode) : null;
  } catch {
    return null;
  }
}

export function rememberRegion(code: RegionCode): void {
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(KEY, code);
    else SecureStore.setItemAsync(KEY, code).catch(() => {});
  } catch {
    // Only the animation's currency depends on it.
  }
}

/**
 * The tax-year total for the quick opening shown after set-up: the latest
 * total (kept up to date by the home screen) and the one the user last saw on
 * launch, so it can count up "+£12.40 since you last looked".
 */
const TOTALS_KEY = 'milemint.launch-totals';

export type LaunchTotals = { total: number; seen: number };

async function read(key: string): Promise<string | null> {
  return Platform.OS === 'web' ? (globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key);
}

function write(key: string, value: string): void {
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(key, value);
    else SecureStore.setItemAsync(key, value).catch(() => {});
  } catch {
    // Only the opening animation depends on it.
  }
}

export async function recallTotals(): Promise<LaunchTotals | null> {
  try {
    const stored = await read(TOTALS_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<LaunchTotals>;
    return typeof parsed.total === 'number' ? { total: parsed.total, seen: parsed.seen ?? parsed.total } : null;
  } catch {
    return null;
  }
}

/** The home screen's current tax-year total, in minor units (pence, cents). */
export async function rememberTotal(total: number): Promise<void> {
  const previous = await recallTotals();
  if (previous?.total === total) return;
  write(TOTALS_KEY, JSON.stringify({ total, seen: previous?.seen ?? total }));
}

/** The opening has shown this total; next time it counts up from here. */
export function markTotalSeen(totals: LaunchTotals): void {
  write(TOTALS_KEY, JSON.stringify({ total: totals.total, seen: totals.total }));
}
