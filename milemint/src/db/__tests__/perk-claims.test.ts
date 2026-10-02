import { describe, expect, it, jest } from '@jest/globals';

import { newClaim } from '@/perks/claims';
import { findOffer } from '@/perks/offers';

import { migrate, SCHEMA_VERSION } from '../migrations';
import { clearPerkClaims, getPerkClaim, insertPerkClaim, listPerkClaims, markPerkRedeemed } from '../perks-repo';
import { available, openTestDatabase } from '../testing/node-sqlite';

// Hoisted above the import by babel-jest: migrate() sees an iPhone.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  getItemAsync: async () => null,
  setItemAsync: async () => {},
}));

const describeSqlite = available ? describe : describe.skip;

const fuel = findOffer('kerbside-fuel')!;
const coffee = findOffer('daybreak-coffee')!;

describeSqlite('migration 14: perk claims', () => {
  it('upgrades a version 13 database with an empty table', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    db.raw.exec('DROP TABLE perk_claims; PRAGMA user_version = 13;');
    await migrate(db as never);
    expect(db.rows<{ user_version: number }>('PRAGMA user_version;')[0].user_version).toBe(SCHEMA_VERSION);
    expect(await listPerkClaims(db as never)).toEqual([]);
  });

  it('saves claims newest first, marks one used once, and the demo reset clears them', async () => {
    const db = openTestDatabase();
    await migrate(db as never);
    const first = newClaim(fuel, 'MS-KRB-BCDF-11', new Date('2026-10-05T09:00:00Z'));
    const second = newClaim(coffee, 'MS-DBK-GHJK-22', new Date('2026-10-05T10:00:00Z'));
    await insertPerkClaim(db as never, first);
    await insertPerkClaim(db as never, second);
    expect(await listPerkClaims(db as never)).toEqual([second, first]);

    await markPerkRedeemed(db as never, first.code, new Date('2026-10-05T12:00:00Z'));
    await markPerkRedeemed(db as never, first.code, new Date('2026-10-06T12:00:00Z'));
    expect((await getPerkClaim(db as never, first.code))?.redeemedAt).toBe('2026-10-05T12:00:00.000Z');
    expect(await getPerkClaim(db as never, 'MS-XXX-0000-00')).toBeNull();

    // A code is unique: the same one can't be saved twice.
    await expect(insertPerkClaim(db as never, first)).rejects.toThrow();

    await clearPerkClaims(db as never);
    expect(await listPerkClaims(db as never)).toEqual([]);
  });
});
