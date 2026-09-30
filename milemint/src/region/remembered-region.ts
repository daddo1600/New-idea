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
