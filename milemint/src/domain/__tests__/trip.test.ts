import { describe, expect, it } from '@jest/globals';

import { isValidIsoDate, parseMiles } from '../format';
import { computeDeductions, ratePeriodFor, REGIONS, summarizeTaxYear } from '../regions';
import { milesToMeters, type Trip } from '../trip';

const US = REGIONS.US;
const deductionOf = (t: Trip) => computeDeductions([t], US).get(t.id) ?? 0;

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
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
    ...overrides,
  };
}

describe('US rate periods', () => {
  it('uses the first-half 2026 rate through 30 June', () => {
    expect(ratePeriodFor('2026-06-30', US)?.tiers[0].rate).toBe(725);
  });

  it('switches to the mid-year rate on 1 July 2026', () => {
    expect(ratePeriodFor('2026-07-01', US)?.tiers[0].rate).toBe(760);
  });

  it('returns null before the first known period', () => {
    expect(ratePeriodFor('2023-12-31', US)).toBeNull();
  });
});

describe('US deduction per trip', () => {
  it('prices 100 business miles at 72.5¢', () => {
    expect(deductionOf(trip({}))).toBe(7250);
  });

  it('prices a July trip at the new rate', () => {
    expect(deductionOf(trip({ localDate: '2026-07-15' }))).toBe(7600);
  });

  it('uses the local date, not UTC, at the rate boundary', () => {
    // 8pm on 30 June in California is 03:00 on 1 July UTC.
    expect(deductionOf(trip({ startedAt: '2026-07-01T03:00:00Z', localDate: '2026-06-30' }))).toBe(7250);
  });

  it('gives nothing for personal or unclassified trips', () => {
    expect(deductionOf(trip({ classification: 'personal' }))).toBe(0);
    expect(deductionOf(trip({ classification: 'unclassified' }))).toBe(0);
  });
});

describe('US tax-year summary', () => {
  it('totals business miles across a split-rate year and counts unclassified', () => {
    const summary = summarizeTaxYear(
      [
        trip({ id: 'a' }),
        trip({ id: 'b', localDate: '2026-08-01', startedAt: '2026-08-01T09:00:00.000Z' }),
        trip({ id: 'c', classification: 'unclassified' }),
        trip({ id: 'd', localDate: '2025-12-31', startedAt: '2025-12-31T09:00:00.000Z' }),
      ],
      US,
      2026,
    );
    expect(summary.tripCount).toBe(3);
    expect(summary.unclassifiedCount).toBe(1);
    expect(summary.businessMeters).toBe(2 * milesToMeters(100));
    expect(summary.deduction).toBe(7250 + 7600);
  });
});

describe('input parsing', () => {
  it('accepts positive decimal miles only', () => {
    expect(parseMiles(' 12.5 ')).toBe(12.5);
    expect(parseMiles('12,5')).toBe(12.5);
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

describe('vehicles', () => {
  const GB = REGIONS.GB;
  const inGB = (overrides: Partial<Trip>) =>
    trip({ localDate: '2026-05-01', startedAt: '2026-05-01T09:00:00.000Z', ...overrides });

  it('prices UK motorbikes at 24p and bicycles at 20p a mile, flat', () => {
    const bike = inGB({ id: 'b', vehicle: 'bicycle' });
    const moto = inGB({ id: 'm', vehicle: 'motorbike' });
    const values = computeDeductions([bike, moto], GB);
    expect(values.get('b')).toBe(2000); // 100 miles × 20p
    expect(values.get('m')).toBe(2400); // 100 miles × 24p
  });

  it("keeps two-wheeler miles out of the car's 10,000-mile threshold", () => {
    const scooter = inGB({ id: 's', vehicle: 'motorbike', distanceMeters: milesToMeters(12_000) });
    const car = inGB({ id: 'c', startedAt: '2026-05-02T09:00:00.000Z', localDate: '2026-05-02' });
    expect(computeDeductions([scooter, car], GB).get('c')).toBe(5500); // still 55p
  });

  it('values two-wheelers at nothing where the rate is for cars only', () => {
    const bike = trip({ id: 'b', vehicle: 'bicycle' });
    expect(computeDeductions([bike], US).get('b')).toBe(0);
    expect(US.vehicleNote).toMatch(/cars/);
  });
});

describe('limits per vehicle', () => {
  const AU = REGIONS.AU;
  const km = (n: number) => n * 1000;
  const inAU = (id: string, vehicleId: string, kms: number, day: string) =>
    trip({ id, vehicleId, distanceMeters: km(kms), localDate: day, startedAt: `${day}T09:00:00.000Z` });

  it("gives each Australian car its own 5,000 km", () => {
    const values = computeDeductions(
      [inAU('a', 'ute', 5000, '2026-08-01'), inAU('b', 'hatch', 1000, '2026-08-02')],
      AU,
    );
    expect(values.get('b')).toBeGreaterThan(0);
  });

  it('still caps one car at 5,000 km', () => {
    const values = computeDeductions(
      [inAU('a', 'ute', 5000, '2026-08-01'), inAU('b', 'ute', 1000, '2026-08-02')],
      AU,
    );
    expect(values.get('b')).toBe(0);
  });
});
