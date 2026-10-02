import { describe, expect, it } from '@jest/globals';

import { claimStatus, myClaimsThisWeek, newClaim, offerState, timeLeft, weeklyLeft, type PerkClaim } from '../claims';
import { DEMO_OFFERS, findOffer, type PerkOffer } from '../offers';

// Local times, so the Monday reset is checked in whatever time zone the tests run.
const at = (day: number, hour = 12, minute = 0) => new Date(2026, 9, day, hour, minute);
// 5 October 2026 is a Monday.
const MONDAY = 5;

const fuel: PerkOffer = { ...findOffer('kerbside-fuel')!, weeklyCap: 50, claimedByOthers: 16, validDays: 7 };
const claim = (when: Date, extra: Partial<PerkClaim> = {}): PerkClaim => ({
  ...newClaim(fuel, `MS-KRB-${when.getTime()}`, when),
  ...extra,
});

describe('weekly cap', () => {
  it('shows the cap less others’ claims and the driver’s own: “34 of 50 left”', () => {
    expect(weeklyLeft(fuel, 0)).toBe(34);
    expect(weeklyLeft(fuel, 1)).toBe(33);
  });

  it('never goes below none left, or above the cap', () => {
    expect(weeklyLeft(fuel, 40)).toBe(0);
    expect(weeklyLeft({ ...fuel, claimedByOthers: 60 }, 0)).toBe(0);
    expect(weeklyLeft({ ...fuel, claimedByOthers: -5 }, 0)).toBe(50);
  });

  it('counts only this week’s claims on that offer, from Monday 00:00 local time', () => {
    const claims = [
      claim(at(MONDAY - 1, 23, 59)), // Sunday night: last week
      claim(at(MONDAY, 0, 0)),
      claim(at(MONDAY + 3)),
      { ...claim(at(MONDAY + 2)), offerId: 'daybreak-coffee' },
    ];
    expect(myClaimsThisWeek('kerbside-fuel', claims, at(MONDAY + 4))).toBe(2);
    // On the Sunday night itself, that claim was in the week then.
    expect(myClaimsThisWeek('kerbside-fuel', claims.slice(0, 1), at(MONDAY - 1, 23, 59))).toBe(1);
    // A new week resets the count.
    expect(myClaimsThisWeek('kerbside-fuel', claims, at(MONDAY + 7, 0, 1))).toBe(0);
  });

  it('used codes still count: each claim used up one of the week’s codes', () => {
    const used = claim(at(MONDAY + 1), { redeemedAt: at(MONDAY + 1, 13).toISOString() });
    expect(offerState(fuel, [used], at(MONDAY + 2)).left).toBe(33);
  });

  it('every demo offer starts the week with some left, and a cap of at least one', () => {
    for (const offer of DEMO_OFFERS) {
      expect(offer.weeklyCap).toBeGreaterThan(0);
      expect(weeklyLeft(offer, 0)).toBeGreaterThan(0);
    }
  });
});

describe('expiry', () => {
  it('expires validDays after claiming, to the minute', () => {
    const c = claim(at(MONDAY, 9, 30));
    expect(Date.parse(c.expiresAt) - Date.parse(c.claimedAt)).toBe(7 * 24 * 60 * 60 * 1000);
    expect(claimStatus(c, at(MONDAY + 7, 9, 29))).toBe('active');
    expect(claimStatus(c, at(MONDAY + 7, 9, 30))).toBe('expired');
  });

  it('a used code stays used, even after its expiry', () => {
    const c = claim(at(MONDAY), { redeemedAt: at(MONDAY, 13).toISOString() });
    expect(claimStatus(c, at(MONDAY, 14))).toBe('redeemed');
    expect(claimStatus(c, at(MONDAY + 30))).toBe('redeemed');
  });

  it('counts down in days, hours and minutes, then stops', () => {
    const c = claim(at(MONDAY, 9, 0));
    expect(timeLeft(c, at(MONDAY, 9, 0))).toEqual({ days: 7, hours: 0, minutes: 0 });
    expect(timeLeft(c, at(MONDAY + 5, 6, 45))).toEqual({ days: 2, hours: 2, minutes: 15 });
    expect(timeLeft(c, new Date(Date.parse(c.expiresAt) - 30_000))).toEqual({ days: 0, hours: 0, minutes: 0 });
    expect(timeLeft(c, at(MONDAY + 7, 9, 0))).toBeNull();
  });

  it('uses each offer’s own length', () => {
    const tax = findOffer('ledgerlite-tax')!;
    const c = newClaim(tax, 'MS-LDG-BCDF-00', at(MONDAY));
    expect(Date.parse(c.expiresAt) - Date.parse(c.claimedAt)).toBe(tax.validDays * 24 * 60 * 60 * 1000);
  });
});

describe('offerState', () => {
  it('can be claimed when there’s nothing waiting to be used', () => {
    expect(offerState(fuel, [], at(MONDAY))).toEqual({ left: 34, latest: null, status: null, canClaim: true });
  });

  it('shows the claimed code instead of Claim while it’s still to use', () => {
    const c = claim(at(MONDAY, 10));
    const state = offerState(fuel, [c], at(MONDAY, 11));
    expect(state).toMatchObject({ left: 33, status: 'active', canClaim: false });
    expect(state.latest?.code).toBe(c.code);
  });

  it('after a code is used or expires, it can be claimed again', () => {
    const used = claim(at(MONDAY, 10), { redeemedAt: at(MONDAY, 12).toISOString() });
    expect(offerState(fuel, [used], at(MONDAY, 13))).toMatchObject({ status: 'redeemed', canClaim: true });
    const old = claim(at(MONDAY - 8));
    expect(offerState(fuel, [old], at(MONDAY))).toMatchObject({ status: 'expired', canClaim: true, left: 34 });
  });

  it('picks the newest claim, whatever order they come in', () => {
    const older = claim(at(MONDAY, 8), { redeemedAt: at(MONDAY, 9).toISOString() });
    const newer = claim(at(MONDAY, 10));
    expect(offerState(fuel, [older, newer], at(MONDAY, 11)).latest?.code).toBe(newer.code);
    expect(offerState(fuel, [newer, older], at(MONDAY, 11)).latest?.code).toBe(newer.code);
  });

  it('can’t be claimed once none are left this week', () => {
    const full = { ...fuel, claimedByOthers: 49 };
    const used = claim(at(MONDAY, 10), { redeemedAt: at(MONDAY, 12).toISOString() });
    expect(offerState(full, [used], at(MONDAY, 13))).toMatchObject({ left: 0, canClaim: false });
    // Next Monday the cap resets.
    expect(offerState(full, [used], at(MONDAY + 7))).toMatchObject({ left: 1, canClaim: true });
  });
});
