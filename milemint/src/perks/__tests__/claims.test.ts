import { describe, expect, it } from '@jest/globals';

import {
  claimStatus,
  holdsCode,
  myClaimsThisPeriod,
  myClaimsThisWeek,
  newClaim,
  nextPeriodStart,
  offerState,
  periodStart,
  secondsLeft,
  weeklyLeft,
  type PerkClaim,
} from '../claims';
import { countdown, daysUntil } from '../format';
import { DEMO_OFFERS, findOffer, type PerkOffer } from '../offers';

// Local times, so the Monday reset is checked in whatever time zone the tests run.
const at = (day: number, hour = 12, minute = 0, second = 0) => new Date(2026, 9, day, hour, minute, second);
// 5 October 2026 is a Monday.
const MONDAY = 5;
const MINUTE = 60 * 1000;

// Many a week, so the tests of the weekly cap aren't stopped by the per-person limit.
const fuel: PerkOffer = {
  ...findOffer('kerbside-fuel')!,
  weeklyCap: 50,
  claimedByOthers: 16,
  useWithinMinutes: 30,
  perPerson: { count: 99, period: 'week' },
};
const claim = (when: Date, extra: Partial<PerkClaim> = {}, offer: PerkOffer = fuel): PerkClaim => ({
  ...newClaim(offer, `MS-${offer.codePrefix}-${when.getTime()}-${Math.random()}`, when),
  ...extra,
});
const used = (when: Date, offer: PerkOffer = fuel) =>
  claim(when, { redeemedAt: new Date(when.getTime() + 5 * MINUTE).toISOString() }, offer);

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

  it('counts only this week’s codes on that offer, from Monday 00:00 local time', () => {
    const claims = [
      used(at(MONDAY - 1, 23, 50)), // Sunday night: last week
      used(at(MONDAY, 0, 0)),
      used(at(MONDAY + 3)),
      used(at(MONDAY + 2), { ...fuel, id: 'daybreak-coffee' }),
    ];
    expect(myClaimsThisWeek('kerbside-fuel', claims, at(MONDAY + 4))).toBe(2);
    // On the Sunday night itself, that claim was in the week then.
    expect(myClaimsThisWeek('kerbside-fuel', claims.slice(0, 1), at(MONDAY - 1, 23, 59))).toBe(1);
    // A new week resets the count.
    expect(myClaimsThisWeek('kerbside-fuel', claims, at(MONDAY + 7, 0, 1))).toBe(0);
  });

  it('used and still-live codes count against the cap', () => {
    expect(offerState(fuel, [used(at(MONDAY + 1))], at(MONDAY + 2)).left).toBe(33);
    expect(offerState(fuel, [claim(at(MONDAY + 1, 10))], at(MONDAY + 1, 10, 29)).left).toBe(33);
  });

  it('a code not used in time goes back in the pool', () => {
    const c = claim(at(MONDAY + 1, 10));
    expect(offerState(fuel, [c], at(MONDAY + 1, 10, 29)).left).toBe(33);
    expect(offerState(fuel, [c], at(MONDAY + 1, 10, 30)).left).toBe(34);
    // A full week: the expired code frees one up again.
    const full = { ...fuel, claimedByOthers: 49 };
    expect(offerState(full, [c], at(MONDAY + 1, 10, 15))).toMatchObject({ left: 0, status: 'active' });
    expect(offerState(full, [c], at(MONDAY + 1, 10, 31))).toMatchObject({ left: 1, status: 'expired', canClaim: true });
  });

  it('every demo offer starts the week with some left, and a cap of at least one', () => {
    for (const offer of DEMO_OFFERS) {
      expect(offer.weeklyCap).toBeGreaterThan(0);
      expect(weeklyLeft(offer, 0)).toBeGreaterThan(0);
    }
  });
});

describe('use window', () => {
  it('expires useWithinMinutes after claiming, to the second', () => {
    const c = claim(at(MONDAY, 9, 30));
    expect(Date.parse(c.expiresAt) - Date.parse(c.claimedAt)).toBe(30 * MINUTE);
    expect(claimStatus(c, at(MONDAY, 9, 59, 59))).toBe('active');
    expect(claimStatus(c, at(MONDAY, 10, 0))).toBe('expired');
    expect(holdsCode(c, at(MONDAY, 9, 59, 59))).toBe(true);
    expect(holdsCode(c, at(MONDAY, 10, 0))).toBe(false);
  });

  it('a used code stays used, even after its window', () => {
    const c = used(at(MONDAY));
    expect(claimStatus(c, at(MONDAY, 12, 6))).toBe('redeemed');
    expect(claimStatus(c, at(MONDAY + 30))).toBe('redeemed');
    expect(holdsCode(c, at(MONDAY + 30))).toBe(true);
  });

  it('counts down to the second, then stops: “Use within 28:41”', () => {
    const c = claim(at(MONDAY, 9, 0));
    expect(secondsLeft(c, at(MONDAY, 9, 0))).toBe(30 * 60);
    expect(countdown(secondsLeft(c, at(MONDAY, 9, 1, 19))!)).toBe('28:41');
    expect(secondsLeft(c, new Date(Date.parse(c.expiresAt) - 500))).toBe(0);
    expect(secondsLeft(c, at(MONDAY, 9, 30))).toBeNull();
  });

  it('shows hours in the countdown for long online windows', () => {
    expect(countdown(24 * 3600)).toBe('24:00:00');
    expect(countdown(3600 + 61)).toBe('1:01:01');
    expect(countdown(59)).toBe('0:59');
    expect(countdown(-3)).toBe('0:00');
  });

  it('uses each offer’s own window: short in store, longer online', () => {
    for (const offer of DEMO_OFFERS) {
      const c = newClaim(offer, 'MS-XXX-BCDF-00', at(MONDAY));
      expect(Date.parse(c.expiresAt) - Date.parse(c.claimedAt)).toBe(offer.useWithinMinutes * MINUTE);
      if (offer.kind === 'in-store') expect(offer.useWithinMinutes).toBeLessThanOrEqual(60);
      else expect(offer.useWithinMinutes % 60).toBe(0); // shown in whole hours
    }
    expect(findOffer('kerbside-fuel')!.useWithinMinutes).toBe(30);
    expect(findOffer('daybreak-coffee')!.useWithinMinutes).toBe(30);
    expect(findOffer('gripmount')!.useWithinMinutes).toBe(24 * 60);
  });
});

describe('periods', () => {
  it('a day starts at local midnight', () => {
    expect(periodStart('day', at(MONDAY + 2, 15, 30))).toEqual(at(MONDAY + 2, 0, 0));
    expect(nextPeriodStart('day', at(MONDAY + 2, 23, 59))).toEqual(at(MONDAY + 3, 0, 0));
  });

  it('a week starts on Monday, Sunday included in the week before', () => {
    expect(periodStart('week', at(MONDAY, 0, 0))).toEqual(at(MONDAY, 0, 0));
    expect(periodStart('week', at(MONDAY + 6, 23, 59))).toEqual(at(MONDAY, 0, 0));
    expect(periodStart('week', at(MONDAY - 1, 23, 59))).toEqual(at(MONDAY - 7, 0, 0));
    expect(nextPeriodStart('week', at(MONDAY + 3))).toEqual(at(MONDAY + 7, 0, 0));
  });

  it('a month starts on the 1st, across the year end too', () => {
    expect(periodStart('month', at(31, 23, 59))).toEqual(new Date(2026, 9, 1));
    expect(nextPeriodStart('month', at(31, 23, 59))).toEqual(new Date(2026, 10, 1));
    expect(nextPeriodStart('month', new Date(2026, 11, 31, 22))).toEqual(new Date(2027, 0, 1));
  });

  it('days to go are counted in local days, across a clock change', () => {
    // 25 October 2026: the clocks go back in the UK and EU.
    expect(daysUntil(at(26, 0, 0), at(25, 23, 59))).toBe(1);
    expect(daysUntil(at(26, 0, 0), at(24, 0, 1))).toBe(2);
  });
});

describe('one per person', () => {
  const daily: PerkOffer = { ...fuel, perPerson: { count: 1, period: 'day' } };
  const weekly: PerkOffer = { ...fuel, perPerson: { count: 1, period: 'week' } };
  const monthly: PerkOffer = { ...fuel, perPerson: { count: 1, period: 'month' } };

  it('one a day: used today, the next one is tomorrow at midnight', () => {
    const c = used(at(MONDAY + 2, 8));
    expect(offerState(daily, [c], at(MONDAY + 2, 23, 59))).toMatchObject({
      status: 'redeemed',
      canClaim: false,
      nextAt: at(MONDAY + 3, 0, 0),
    });
    expect(offerState(daily, [c], at(MONDAY + 3, 0, 0))).toMatchObject({ canClaim: true, nextAt: null });
  });

  it('a still-live code uses up the allowance too', () => {
    const c = claim(at(MONDAY, 23, 45));
    expect(myClaimsThisPeriod(daily, [c], at(MONDAY, 23, 50))).toBe(1);
    expect(offerState(daily, [c], at(MONDAY, 23, 50))).toMatchObject({ status: 'active', canClaim: false });
  });

  it('a code left to run out doesn’t: they can claim again the same day', () => {
    const c = claim(at(MONDAY, 9));
    expect(myClaimsThisPeriod(daily, [c], at(MONDAY, 9, 30))).toBe(0);
    expect(offerState(daily, [c], at(MONDAY, 9, 30))).toMatchObject({ status: 'expired', canClaim: true, nextAt: null });
    // Claimed again and used: now that's today's one.
    const again = used(at(MONDAY, 10));
    expect(offerState(daily, [c, again], at(MONDAY, 11))).toMatchObject({ canClaim: false, nextAt: at(MONDAY + 1, 0, 0) });
  });

  it('one a week: used on Sunday night, the next one is Monday', () => {
    const c = used(at(MONDAY + 6, 23, 0));
    expect(offerState(weekly, [c], at(MONDAY + 6, 23, 59))).toMatchObject({
      canClaim: false,
      nextAt: at(MONDAY + 7, 0, 0),
    });
    expect(offerState(weekly, [c], at(MONDAY + 7, 0, 0))).toMatchObject({ canClaim: true, nextAt: null });
    // Used last Sunday doesn't stop this Monday.
    expect(offerState(weekly, [used(at(MONDAY - 1, 22))], at(MONDAY, 0, 1)).canClaim).toBe(true);
  });

  it('one a month: used on the 3rd, the next one is the 1st', () => {
    const c = used(at(3, 10));
    expect(offerState(monthly, [c], at(31, 23, 59))).toMatchObject({ canClaim: false, nextAt: new Date(2026, 10, 1) });
    expect(offerState(monthly, [c], new Date(2026, 10, 1, 0, 0))).toMatchObject({ canClaim: true, nextAt: null });
  });

  it('counts only that offer', () => {
    const coffee = used(at(MONDAY, 8), { ...daily, id: 'daybreak-coffee' });
    expect(offerState(daily, [coffee], at(MONDAY, 9)).canClaim).toBe(true);
  });

  it('honours a limit of more than one', () => {
    const two: PerkOffer = { ...fuel, perPerson: { count: 2, period: 'week' } };
    const first = used(at(MONDAY, 8));
    expect(offerState(two, [first], at(MONDAY, 9)).canClaim).toBe(true);
    expect(offerState(two, [first, used(at(MONDAY, 10))], at(MONDAY, 11)).canClaim).toBe(false);
  });

  it('every demo offer has a limit the partner set', () => {
    for (const offer of DEMO_OFFERS) {
      expect(offer.perPerson.count).toBeGreaterThanOrEqual(1);
      expect(['day', 'week', 'month']).toContain(offer.perPerson.period);
    }
    expect(findOffer('kerbside-fuel')!.perPerson).toEqual({ count: 1, period: 'day' });
    expect(findOffer('treadright-tyres')!.perPerson).toEqual({ count: 1, period: 'month' });
    expect(findOffer('sparkle-car-wash')!.perPerson).toEqual({ count: 1, period: 'week' });
  });
});

describe('offerState', () => {
  it('can be claimed when there’s nothing waiting to be used', () => {
    expect(offerState(fuel, [], at(MONDAY))).toEqual({
      left: 34,
      latest: null,
      status: null,
      nextAt: null,
      canClaim: true,
    });
  });

  it('shows the claimed code instead of Claim while it’s still to use', () => {
    const c = claim(at(MONDAY, 10));
    const state = offerState(fuel, [c], at(MONDAY, 10, 10));
    expect(state).toMatchObject({ left: 33, status: 'active', canClaim: false });
    expect(state.latest?.code).toBe(c.code);
  });

  it('after a code is used or runs out, it can be claimed again (limit allowing)', () => {
    expect(offerState(fuel, [used(at(MONDAY, 10))], at(MONDAY, 13))).toMatchObject({
      status: 'redeemed',
      canClaim: true,
    });
    expect(offerState(fuel, [claim(at(MONDAY - 8))], at(MONDAY))).toMatchObject({
      status: 'expired',
      canClaim: true,
      left: 34,
    });
  });

  it('picks the newest claim, whatever order they come in', () => {
    const older = used(at(MONDAY, 8));
    const newer = claim(at(MONDAY, 10));
    expect(offerState(fuel, [older, newer], at(MONDAY, 10, 5)).latest?.code).toBe(newer.code);
    expect(offerState(fuel, [newer, older], at(MONDAY, 10, 5)).latest?.code).toBe(newer.code);
  });

  it('can’t be claimed once none are left this week', () => {
    const full = { ...fuel, claimedByOthers: 49 };
    const c = used(at(MONDAY, 10));
    expect(offerState(full, [c], at(MONDAY, 13))).toMatchObject({ left: 0, canClaim: false, nextAt: null });
    // Next Monday the cap resets.
    expect(offerState(full, [c], at(MONDAY + 7))).toMatchObject({ left: 1, canClaim: true });
  });
});
