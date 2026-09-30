import { describe, expect, it } from '@jest/globals';

import { isValidIsoDate, parseMiles } from '../format';
import { rateForDate } from '../rates';
import { milesToMeters, summarizeYear, tripDeductionCents, type Trip } from '../trip';

function trip(overrides: Partial<Trip>): Trip {
  return {
    id: 't',
    startedAt: '2026-03-10T09:00:00.000Z',
    localDate: '2026-03-10',
    endedAt: null,
    startLabel: 'Home',
    endLabel: 'Client',
    distanceMeters: milesToMeters(100),
    classification: 'business',
    purpose: 'Client visit',
    source: 'manual',
    createdAt: '2026-03-10T09:00:00.000Z',
    ...overrides,
  };
}

describe('rateForDate', () => {
  it('uses the first-half 2026 rate through 30 June', () => {
    expect(rateForDate('2026-06-30')?.tenthsOfCentPerMile).toBe(725);
  });

  it('switches to the mid-year rate on 1 July 2026', () => {
    expect(rateForDate('2026-07-01T00:00:00Z')?.tenthsOfCentPerMile).toBe(760);
  });

  it('returns null before the first known period', () => {
    expect(rateForDate('2023-12-31')).toBeNull();
  });
});

describe('tripDeductionCents', () => {
  it('prices 100 business miles at 72.5¢', () => {
    expect(tripDeductionCents(trip({}))).toBe(7250);
  });

  it('prices a July trip at the new rate', () => {
    expect(tripDeductionCents(trip({ localDate: '2026-07-15' }))).toBe(7600);
  });

  it('uses the local date, not UTC, at the rate boundary', () => {
    // 8pm on 30 June in California is 03:00 on 1 July UTC.
    expect(
      tripDeductionCents(trip({ startedAt: '2026-07-01T03:00:00Z', localDate: '2026-06-30' })),
    ).toBe(7250);
  });

  it('gives nothing for personal or unclassified trips', () => {
    expect(tripDeductionCents(trip({ classification: 'personal' }))).toBe(0);
    expect(tripDeductionCents(trip({ classification: 'unclassified' }))).toBe(0);
  });
});

describe('summarizeYear', () => {
  it('totals business miles across a split-rate year and counts unclassified', () => {
    const summary = summarizeYear(
      [
        trip({ id: 'a' }),
        trip({ id: 'b', localDate: '2026-08-01' }),
        trip({ id: 'c', classification: 'unclassified' }),
        trip({ id: 'd', localDate: '2025-12-31' }),
      ],
      2026,
    );
    expect(summary.tripCount).toBe(3);
    expect(summary.unclassifiedCount).toBe(1);
    expect(summary.businessMiles).toBeCloseTo(200, 3);
    expect(summary.deductionCents).toBe(7250 + 7600);
  });
});

describe('input parsing', () => {
  it('accepts positive decimal miles only', () => {
    expect(parseMiles(' 12.5 ')).toBe(12.5);
    expect(parseMiles('0')).toBeNull();
    expect(parseMiles('-3')).toBeNull();
    expect(parseMiles('abc')).toBeNull();
  });

  it('rejects impossible dates', () => {
    expect(isValidIsoDate('2026-02-28')).toBe(true);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('26-2-3')).toBe(false);
  });
});
