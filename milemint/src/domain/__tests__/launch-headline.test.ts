import { describe, expect, it } from '@jest/globals';

import { EARLY_DAYS, launchHeadline, PACE_AFTER_DAYS } from '../launch-headline';

const now = new Date('2026-10-20T12:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const typicalMonth = 22_000; // £220

describe('launchHeadline', () => {
  it('leads with a typical month while the real total is tiny', () => {
    expect(launchHeadline({ total: 109, since: daysAgo(1), typicalMonth, now })).toEqual({
      kind: 'typical',
      amount: typicalMonth,
    });
    // Totals kept before the start date was recorded count as new.
    expect(launchHeadline({ total: 109, since: null, typicalMonth, now }).kind).toBe('typical');
  });

  it('switches to their own pace after a week, when it beats a typical month', () => {
    // £100 in 10 days is about £304 a month.
    expect(launchHeadline({ total: 10_000, since: daysAgo(10), typicalMonth, now })).toEqual({ kind: 'pace', amount: 30_438 });
    // Not before a week of driving.
    expect(launchHeadline({ total: 10_000, since: daysAgo(PACE_AFTER_DAYS - 1), typicalMonth, now }).kind).toBe('typical');
    // A slow pace never shows below a typical month.
    expect(launchHeadline({ total: 2_000, since: daysAgo(10), typicalMonth, now }).kind).toBe('typical');
  });

  it('shows the real total after the first month, or once it is worth more than a month', () => {
    expect(launchHeadline({ total: 500, since: daysAgo(EARLY_DAYS), typicalMonth, now })).toEqual({ kind: 'year', amount: 500 });
    expect(launchHeadline({ total: 25_000, since: daysAgo(3), typicalMonth, now })).toEqual({ kind: 'year', amount: 25_000 });
  });
});
