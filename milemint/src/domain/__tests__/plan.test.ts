import { describe, expect, it } from '@jest/globals';

import { FOUNDING_BOOST_ENDS } from '@/constants/rewards';

import { canUse, earnedPerks, foundingBoost, friendGiftOpen, nextPerk, PERK_LADDER, type ProFeature } from '../plan';

/** Noon on a local date, so the time zone the tests run in doesn't move the day. */
const on = (date: string) => new Date(`${date}T12:00:00`);
const BOOST = on('2026-11-01');
const AFTER = on('2027-02-01');

describe('the founding boost', () => {
  it('runs to the end of its last day, then stops', () => {
    expect(FOUNDING_BOOST_ENDS).toBe('2027-01-31');
    expect(foundingBoost(on('2026-10-02'))).toBe(true);
    expect(foundingBoost(new Date('2027-01-31T23:59:00'))).toBe(true);
    expect(foundingBoost(new Date('2027-02-01T00:00:00'))).toBe(false);
  });

  it('takes its end date as a setting', () => {
    expect(foundingBoost(on('2026-12-01'), '2026-11-30')).toBe(false);
  });
});

describe('the perk ladder', () => {
  it('is tax set-aside, then earnings by platform, then the founding driver badge', () => {
    expect(PERK_LADDER.map((step) => step.perk)).toEqual(['tax-set-aside', 'platform-earnings', 'founding-badge']);
    expect(PERK_LADDER.map((step) => step.friends)).toEqual([1, 3, 5]);
    expect(PERK_LADDER.map((step) => step.boosted)).toEqual([1, 2, 3]);
  });

  it('unlocks at 1, 2 and 3 friends during the founding boost', () => {
    expect(earnedPerks(0, BOOST)).toEqual([]);
    expect(earnedPerks(1, BOOST)).toEqual(['tax-set-aside']);
    expect(earnedPerks(2, BOOST)).toEqual(['tax-set-aside', 'platform-earnings']);
    expect(earnedPerks(3, BOOST)).toEqual(['tax-set-aside', 'platform-earnings', 'founding-badge']);
  });

  it('unlocks at 1, 3 and 5 friends after it', () => {
    expect(earnedPerks(1, AFTER)).toEqual(['tax-set-aside']);
    expect(earnedPerks(2, AFTER)).toEqual(['tax-set-aside']);
    expect(earnedPerks(3, AFTER)).toEqual(['tax-set-aside', 'platform-earnings']);
    expect(earnedPerks(4, AFTER)).toEqual(['tax-set-aside', 'platform-earnings']);
    expect(earnedPerks(5, AFTER)).toEqual(['tax-set-aside', 'platform-earnings', 'founding-badge']);
  });

  it('keeps perks earned during the boost for good', () => {
    const kept = earnedPerks(3, BOOST);
    expect(earnedPerks(3, AFTER, kept)).toEqual(['tax-set-aside', 'platform-earnings', 'founding-badge']);
  });

  it('treats odd friend counts as none', () => {
    expect(earnedPerks(-2, BOOST)).toEqual([]);
    expect(earnedPerks(Number.NaN, BOOST)).toEqual([]);
    expect(earnedPerks(1.7, AFTER)).toEqual(['tax-set-aside']);
  });

  it('names the next perk and how many more friends it needs', () => {
    expect(nextPerk(0, BOOST, [])).toEqual({ perk: 'tax-set-aside', more: 1 });
    expect(nextPerk(1, BOOST, earnedPerks(1, BOOST))).toEqual({ perk: 'platform-earnings', more: 1 });
    expect(nextPerk(1, AFTER, earnedPerks(1, AFTER))).toEqual({ perk: 'platform-earnings', more: 2 });
    expect(nextPerk(3, AFTER, earnedPerks(3, AFTER))).toEqual({ perk: 'founding-badge', more: 2 });
    expect(nextPerk(3, BOOST, earnedPerks(3, BOOST))).toBeNull();
  });

  it('never asks for fewer than one more friend, even for a perk kept out of order', () => {
    expect(nextPerk(5, AFTER, ['platform-earnings', 'founding-badge'])).toEqual({ perk: 'tax-set-aside', more: 1 });
  });
});

describe('what each plan can use', () => {
  const ALL: ProFeature[] = ['reports', 'accountant', 'quarterly', 'platform-earnings', 'tax-set-aside', 'import'];

  it('gives Pro everything', () => {
    for (const feature of ALL) expect(canUse(feature, { isPro: true, perks: [] })).toBe(true);
  });

  it('gives the free plan none of the Pro features', () => {
    for (const feature of ALL) expect(canUse(feature, { isPro: false, perks: [] })).toBe(false);
  });

  it('lets perks unlock tax set-aside and earnings by platform', () => {
    const perks = earnedPerks(1, BOOST);
    expect(canUse('tax-set-aside', { isPro: false, perks })).toBe(true);
    expect(canUse('platform-earnings', { isPro: false, perks })).toBe(false);
    const more = earnedPerks(2, BOOST);
    expect(canUse('platform-earnings', { isPro: false, perks: more })).toBe(true);
  });

  it('never unlocks reports or exports through referrals, however many friends join', () => {
    const perks = earnedPerks(10_000, AFTER);
    expect(perks).toHaveLength(PERK_LADDER.length);
    for (const feature of ['reports', 'accountant', 'quarterly', 'import'] as const) {
      expect(canUse(feature, { isPro: false, perks })).toBe(false);
    }
  });
});

describe("the friend's gift", () => {
  const redeemedAt = '2026-10-02T09:00:00.000Z';

  it('is hidden while no offer code is set', () => {
    expect(friendGiftOpen({ offerCode: '', redeemedAt, now: on('2026-10-03') })).toBe(false);
  });

  it('needs a friend’s code to have been entered', () => {
    expect(friendGiftOpen({ offerCode: 'SPROUTFRIEND', redeemedAt: null, now: on('2026-10-03') })).toBe(false);
    expect(friendGiftOpen({ offerCode: 'SPROUTFRIEND', redeemedAt: 'not a date', now: on('2026-10-03') })).toBe(false);
  });

  it('is offered for 12 months after the code was entered', () => {
    const open = (now: Date) => friendGiftOpen({ offerCode: 'SPROUTFRIEND', redeemedAt, now });
    expect(open(on('2026-10-03'))).toBe(true);
    expect(open(on('2027-09-30'))).toBe(true);
    expect(open(on('2027-10-03'))).toBe(false);
  });
});
