import { describe, expect, it } from '@jest/globals';

import { computeDeductions, fromUnits, REGIONS, type Region } from '../regions';
import {
  addDays,
  amountBeforeMonday,
  DEFAULT_SET_ASIDE_PERCENT,
  deductionsByWeek,
  isValidSetAsidePercent,
  nextMondayAt,
  previousEntry,
  recentWeekStarts,
  reminderWeek,
  setAsideAmount,
  setAsidePercent,
  setAsideWeeks,
  taxYearSetAside,
  weekStartOf,
} from '../set-aside';
import type { Trip } from '../trip';

const { US, GB, CA, AU } = REGIONS;

let next = 0;
function trip(region: Region, localDate: string, units: number, overrides: Partial<Trip> = {}): Trip {
  next += 1;
  return {
    id: `t${next}`,
    startedAt: `${localDate}T09:00:00.000Z`,
    localDate,
    endedAt: `${localDate}T09:30:00.000Z`,
    startLabel: 'Home',
    endLabel: 'Client',
    distanceMeters: fromUnits(units, region),
    classification: 'business',
    purpose: 'Deliveries',
    source: 'auto',
    createdAt: `${localDate}T09:31:00.000Z`,
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
    ...overrides,
  };
}

describe('setAsideAmount', () => {
  it('is the rate on earnings after the mileage deduction', () => {
    // £500 earned, £120 of mileage, 25%: £95.
    expect(setAsideAmount(50_000, 12_000, 25)).toBe(9_500);
    expect(setAsideAmount(110_000, 22_800, 30)).toBe(26_160);
  });

  it('is nothing when the deduction is bigger than the earnings', () => {
    expect(setAsideAmount(10_000, 15_000, 25)).toBe(0);
    expect(setAsideAmount(10_000, 10_000, 25)).toBe(0);
    expect(setAsideAmount(0, 0, 25)).toBe(0);
  });

  it('rounds to the penny', () => {
    expect(setAsideAmount(10_001, 0, 25)).toBe(2_500);
    expect(setAsideAmount(10_002, 0, 25)).toBe(2_501);
  });
});

describe('the rate', () => {
  it('starts at each region’s default', () => {
    expect(DEFAULT_SET_ASIDE_PERCENT).toEqual({ GB: 25, US: 30, CA: 25, AU: 25 });
    expect(setAsidePercent(null, GB)).toBe(25);
    expect(setAsidePercent(null, US)).toBe(30);
    expect(setAsidePercent(null, CA)).toBe(25);
    expect(setAsidePercent(null, AU)).toBe(25);
  });

  it('uses the user’s own when it’s a whole percent in range', () => {
    expect(setAsidePercent(20, GB)).toBe(20);
    expect(setAsidePercent(0, GB)).toBe(25);
    expect(setAsidePercent(12.5, GB)).toBe(25);
    expect(setAsidePercent(91, US)).toBe(30);
    expect(isValidSetAsidePercent(1)).toBe(true);
    expect(isValidSetAsidePercent(90)).toBe(true);
    expect(isValidSetAsidePercent('25')).toBe(false);
  });
});

describe('weeks', () => {
  it('run Monday to Sunday, keyed by the Monday', () => {
    expect(weekStartOf('2026-10-02')).toBe('2026-09-28'); // Friday
    expect(weekStartOf('2026-09-28')).toBe('2026-09-28'); // Monday
    expect(weekStartOf('2026-10-04')).toBe('2026-09-28'); // Sunday
    expect(weekStartOf('2027-01-01')).toBe('2026-12-28'); // across the year end
    expect(addDays('2026-02-26', 3)).toBe('2026-03-01');
  });

  it('lists the last few, oldest first, ending with this one', () => {
    expect(recentWeekStarts('2026-10-02', 3)).toEqual(['2026-09-14', '2026-09-21', '2026-09-28']);
  });
});

describe('deductionsByWeek', () => {
  it('adds up each week’s business drives at the region’s rates, with parking and tolls where they count', () => {
    const trips = [
      trip(GB, '2026-09-28', 10, { parkingMinor: 300 }),
      trip(GB, '2026-10-04', 10),
      trip(GB, '2026-10-05', 20),
      trip(GB, '2026-09-30', 50, { classification: 'personal' }),
      trip(GB, '2026-09-30', 50, { classification: 'unclassified' }),
    ];
    const byWeek = deductionsByWeek(trips, computeDeductions(trips, GB), GB);
    // 20 miles at 55p, plus £3 parking; then 20 miles the next week.
    expect(byWeek.get('2026-09-28')).toBe(1_100 + 300);
    expect(byWeek.get('2026-10-05')).toBe(1_100);
    // UK employees: parking isn't part of Mileage Allowance Relief.
    expect(deductionsByWeek(trips, computeDeductions(trips, GB), GB, true).get('2026-09-28')).toBe(1_100);
  });

  it('prices a week past the UK’s 10,000 miles at 25p, as the year total does', () => {
    const trips = [trip(GB, '2026-04-07', 10_000), trip(GB, '2026-09-29', 100)];
    const byWeek = deductionsByWeek(trips, computeDeductions(trips, GB), GB);
    expect(byWeek.get('2026-09-28')).toBe(2_500);
  });

  it('leaves Canada’s parking out, as it’s recorded apart', () => {
    const trips = [trip(CA, '2026-09-29', 10, { parkingMinor: 500 })];
    expect(deductionsByWeek(trips, computeDeductions(trips, CA), CA).get('2026-09-28')).toBe(730);
  });
});

describe('setAsideWeeks', () => {
  it('gives each week its earnings, deduction and set-aside; weeks without earnings have none', () => {
    const earnings = new Map([
      ['2026-09-21', 40_000],
      ['2026-09-28', 5_000],
    ]);
    const byWeek = new Map([
      ['2026-09-21', 8_000],
      ['2026-09-28', 9_000],
      ['2026-09-14', 2_000],
    ]);
    expect(setAsideWeeks(['2026-09-14', '2026-09-21', '2026-09-28'], earnings, byWeek, 25)).toEqual([
      { weekStart: '2026-09-14', earnings: null, deduction: 2_000, setAside: null },
      { weekStart: '2026-09-21', earnings: 40_000, deduction: 8_000, setAside: 8_000 },
      // A week where the mileage is more than was earned: nothing to put aside.
      { weekStart: '2026-09-28', earnings: 5_000, deduction: 9_000, setAside: 0 },
    ]);
  });
});

describe('taxYearSetAside', () => {
  it('adds up the weeks whose Monday is in the tax year', () => {
    const earnings = new Map([
      ['2026-03-30', 40_000], // 2025/26 (its Sunday is 5 April)
      ['2026-04-06', 40_000], // 2026/27
      ['2026-09-28', 20_000],
    ]);
    const byWeek = new Map([['2026-09-28', 30_000]]);
    expect(taxYearSetAside(earnings, byWeek, 25, GB, 2026)).toBe(10_000);
    expect(taxYearSetAside(earnings, byWeek, 25, GB, 2025)).toBe(10_000);
  });
});

describe('previousEntry', () => {
  it('is the latest week before, for "Same as last week"', () => {
    const earnings = new Map([
      ['2026-09-07', 1],
      ['2026-09-21', 2],
      ['2026-09-28', 3],
    ]);
    expect(previousEntry(earnings, '2026-09-28')).toEqual({ weekStart: '2026-09-21', amount: 2 });
    expect(previousEntry(earnings, '2026-09-21')).toEqual({ weekStart: '2026-09-07', amount: 1 });
    expect(previousEntry(earnings, '2026-09-07')).toBeNull();
  });
});

describe('the Monday reminder', () => {
  it('is about the week just ended', () => {
    const earnings = new Map([['2026-09-28', 60_000]]);
    const byWeek = new Map([['2026-09-28', 20_000]]);
    expect(reminderWeek('2026-10-05', earnings, byWeek, 25)).toEqual({ weekStart: '2026-09-28', amount: 10_000 });
    expect(reminderWeek('2026-10-12', earnings, byWeek, 25)).toEqual({ weekStart: '2026-10-05', amount: null });
    expect(amountBeforeMonday(earnings, byWeek, 30)(new Date(2026, 9, 5, 9))).toBe(12_000);
  });

  it('goes out next Monday at 9, or today if it’s Monday before 9', () => {
    expect(nextMondayAt(new Date(2026, 9, 2, 10), 9)).toEqual(new Date(2026, 9, 5, 9));
    expect(nextMondayAt(new Date(2026, 9, 5, 8), 9)).toEqual(new Date(2026, 9, 5, 9));
    expect(nextMondayAt(new Date(2026, 9, 5, 9), 9)).toEqual(new Date(2026, 9, 12, 9));
    expect(nextMondayAt(new Date(2026, 9, 4, 23), 9)).toEqual(new Date(2026, 9, 5, 9));
  });
});

it('works in the US too', () => {
  const trips = [trip(US, '2026-09-29', 100)];
  const byWeek = deductionsByWeek(trips, computeDeductions(trips, US), US);
  // 100 miles at 76¢ = $76; $1,000 earned at 30% → $277.20.
  expect(byWeek.get('2026-09-28')).toBe(7_600);
  expect(setAsideAmount(100_000, byWeek.get('2026-09-28') ?? 0, setAsidePercent(null, US))).toBe(27_720);
});
