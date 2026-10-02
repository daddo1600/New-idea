import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';

import { listPerkClaims, restorePerkClaim } from '@/db/perks-repo';

import { claimsToRestore, decodeLedger, encodeLedger, mergeClaims } from './claim-ledger';

const KEY = 'perk-claims-v1';
// This iPhone only: not in iCloud Keychain or a backup restored to another phone.
const OPTIONS: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

/**
 * Brings the database and the Keychain copy of perk claims together: claims
 * the database lost (the app was deleted and reinstalled) come back, so they
 * still count against each partner's per-person limit, and the copy is
 * refreshed. Where there's no Keychain (the web preview), the database is
 * used as it is.
 */
export async function syncPerkLedger(db: SQLiteDatabase): Promise<void> {
  const saved = await listPerkClaims(db);
  const raw = await SecureStore.getItemAsync(KEY, OPTIONS).catch(() => null);
  const merged = mergeClaims(saved, decodeLedger(raw), new Date());
  for (const claim of claimsToRestore(saved, merged)) await restorePerkClaim(db, claim);
  await SecureStore.setItemAsync(KEY, encodeLedger(merged), OPTIONS).catch(() => {});
}

/** Demo reset only: forgets the Keychain copy too. */
export async function clearPerkLedger(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY, OPTIONS).catch(() => {});
}
