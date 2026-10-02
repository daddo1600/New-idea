import { describe, expect, it, jest } from '@jest/globals';

import { newClaim } from '@/perks/claims';
import { clearPerkLedger, syncPerkLedger } from '@/perks/ledger-store';
import { findOffer } from '@/perks/offers';

import { migrate } from '../migrations';
import { insertPerkClaim, listPerkClaims, markPerkRedeemed } from '../perks-repo';
import { available, openTestDatabase } from '../testing/node-sqlite';

// Hoisted above the import by babel-jest: migrate() sees an iPhone, and the Keychain is a map.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('expo-secure-store', () => {
  const keychain = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK: 0,
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
    getItemAsync: async (key: string) => keychain.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => void keychain.set(key, value),
    deleteItemAsync: async (key: string) => void keychain.delete(key),
  };
});

const describeSqlite = available ? describe : describe.skip;
const coffee = findOffer('daybreak-coffee')!;

describeSqlite('perk claims survive reinstalling the app', () => {
  it('brings back claims (used or not) from the Keychain into a fresh database', async () => {
    const now = new Date();
    const used = newClaim(coffee, 'MS-DBK-BCDF-11', new Date(now.getTime() - 60 * 60 * 1000));
    const live = newClaim(coffee, 'MS-DBK-GHJK-22', now);

    const before = openTestDatabase();
    await migrate(before as never);
    await insertPerkClaim(before as never, used);
    await markPerkRedeemed(before as never, used.code, new Date(now.getTime() - 50 * 60 * 1000));
    await insertPerkClaim(before as never, live);
    await syncPerkLedger(before as never);

    // Deleted and reinstalled: a new, empty database; the Keychain is still there.
    const after = openTestDatabase();
    await migrate(after as never);
    await syncPerkLedger(after as never);
    const restored = await listPerkClaims(after as never);
    expect(restored.map((claim) => claim.code)).toEqual([live.code, used.code]);
    expect(restored[1].redeemedAt).not.toBeNull();
    expect(restored[0].redeemedAt).toBeNull();

    // Syncing again changes nothing.
    await syncPerkLedger(after as never);
    expect(await listPerkClaims(after as never)).toEqual(restored);

    // The demo reset forgets the copy too.
    await clearPerkLedger();
    const fresh = openTestDatabase();
    await migrate(fresh as never);
    await syncPerkLedger(fresh as never);
    expect(await listPerkClaims(fresh as never)).toEqual([]);
  });
});
