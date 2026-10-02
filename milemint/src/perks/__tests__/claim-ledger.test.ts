import { describe, expect, it } from '@jest/globals';

import { claimsToRestore, decodeLedger, encodeLedger, LEDGER_KEEP_DAYS, mergeClaims } from '../claim-ledger';
import { myClaimsThisPeriod, newClaim, type PerkClaim } from '../claims';
import { findOffer } from '../offers';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-10-14T12:00:00Z');
const coffee = findOffer('daybreak-coffee')!;

const claim = (code: string, daysAgo: number, redeemedAt: string | null = null): PerkClaim => ({
  ...newClaim(coffee, code, new Date(now.getTime() - daysAgo * DAY)),
  redeemedAt,
});

describe('perk claim ledger (Keychain copy)', () => {
  it('round-trips claims, to the second', () => {
    const claims = [claim('MS-DBK-BCDF-01', 1, '2026-10-13T12:05:00.000Z'), claim('MS-DBK-GHJK-02', 3)];
    const back = decodeLedger(encodeLedger(claims));
    expect(back.map((c) => c.code)).toEqual(claims.map((c) => c.code));
    expect(back[0].redeemedAt).toBe('2026-10-13T12:05:00.000Z');
    expect(back[1].redeemedAt).toBeNull();
    expect(Date.parse(back[1].expiresAt) - Date.parse(back[1].claimedAt)).toBe(coffee.useWithinMinutes * 60 * 1000);
  });

  it('reads a missing or damaged copy as empty, and skips bad entries', () => {
    expect(decodeLedger(null)).toEqual([]);
    expect(decodeLedger('not json')).toEqual([]);
    expect(decodeLedger('{"a":1}')).toEqual([]);
    expect(decodeLedger('[["MS-X",  "o", 1, 2, null], ["bad"], [1, 2, 3, 4, 5], ["c", "o", "x", 2, null]]')).toHaveLength(1);
  });

  it('after a reinstall, brings back the claims the database lost', () => {
    const ledger = [claim('MS-DBK-BCDF-01', 0, now.toISOString())];
    const merged = mergeClaims([], ledger, now);
    expect(claimsToRestore([], merged).map((c) => c.code)).toEqual(['MS-DBK-BCDF-01']);
    // So the partner's limit still counts it.
    expect(myClaimsThisPeriod(coffee, merged, now)).toBe(1);
  });

  it('keeps a code used if either copy says so, at the earlier time', () => {
    const saved = [claim('MS-DBK-BCDF-01', 0)];
    const ledger = [claim('MS-DBK-BCDF-01', 0, '2026-10-14T12:10:00.000Z')];
    const merged = mergeClaims(saved, ledger, now);
    expect(merged).toHaveLength(1);
    expect(merged[0].redeemedAt).toBe('2026-10-14T12:10:00.000Z');
    expect(claimsToRestore(saved, merged)).toHaveLength(1);
    expect(mergeClaims(merged, [{ ...merged[0], redeemedAt: '2026-10-14T12:20:00.000Z' }], now)[0].redeemedAt).toBe(
      '2026-10-14T12:10:00.000Z',
    );
  });

  it('restores nothing when the database already has everything', () => {
    const saved = [claim('MS-DBK-BCDF-01', 1, now.toISOString()), claim('MS-DBK-GHJK-02', 2)];
    expect(claimsToRestore(saved, mergeClaims(saved, saved, now))).toEqual([]);
  });

  it('drops claims older than the longest limit, newest first', () => {
    const merged = mergeClaims([claim('OLD', LEDGER_KEEP_DAYS + 1), claim('NEW', 1), claim('MID', 10)], [], now);
    expect(merged.map((c) => c.code)).toEqual(['NEW', 'MID']);
  });
});
