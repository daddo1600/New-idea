import { describe, expect, it } from '@jest/globals';

import {
  daysUntil,
  formatQuarterRange,
  mlkDay,
  QUARTER_RULES,
  quarterOf,
  quarterReminderDate,
  quartersOf,
  quartersToShow,
  summarizeQuarter,
  upcomingQuarterReminders,
} from '../quarters';
import { computeDeductions, fromUnits, REGIONS, type Region } from '../regions';
import { buildReport } from '../report';
import type { Trip } from '../trip';

const { US, GB, CA, AU } = REGIONS;

const spans = (taxYear: number, region: Region) =>
  quartersOf(taxYear, region).map((quarter) => [quarter.start, quarter.end, quarter.due]);

describe('quarters and deadlines', () => {
  it('UK: the MTD standard update periods, due on the 7th, never moved', () => {
    expect(spans(2026, GB)).toEqual([
      ['2026-04-06', '2026-07-05', '2026-08-07'],
      ['2026-07-06', '2026-10-05', '2026-11-07'], // a Saturday: still the 7th
      ['2026-10-06', '2027-01-05', '2027-02-07'],
      ['2027-01-06', '2027-04-05', '2027-05-07'],
    ]);
  });

  it('UK: 5 January is the third quarter, 6 January the fourth, of the same tax year', () => {
    expect(quarterOf('2027-01-05', GB)).toMatchObject({ number: 3, taxYear: 2026 });
    expect(quarterOf('2027-01-06', GB)).toMatchObject({ number: 4, taxYear: 2026 });
    expect(quarterOf('2027-04-05', GB)).toMatchObject({ number: 4, taxYear: 2026 });
    expect(quarterOf('2027-04-06', GB)).toMatchObject({ number: 1, taxYear: 2027 });
  });

  it('US: the uneven estimated tax periods', () => {
    expect(spans(2026, US)).toEqual([
      ['2026-01-01', '2026-03-31', '2026-04-15'],
      ['2026-04-01', '2026-05-31', '2026-06-15'],
      ['2026-06-01', '2026-08-31', '2026-09-15'],
      ['2026-09-01', '2026-12-31', '2027-01-15'],
    ]);
    expect(quarterOf('2026-05-31', US).number).toBe(2);
    expect(quarterOf('2026-06-01', US).number).toBe(3);
    expect(quarterOf('2026-08-31', US).number).toBe(3);
    expect(quarterOf('2026-09-01', US).number).toBe(4);
  });

  it('US: a deadline at a weekend or on a holiday moves to the next business day', () => {
    // 15 April 2028 is a Saturday, and Monday the 17th is Emancipation Day.
    expect(quartersOf(2028, US)[0].due).toBe('2028-04-18');
    // 15 January 2024 was Martin Luther King Jr. Day: the IRS took the payment on the 16th.
    expect(quartersOf(2023, US)[3].due).toBe('2024-01-16');
    // 15 January 2028 is a Saturday, and Monday the 17th is MLK Day.
    expect(quartersOf(2027, US)[3].due).toBe('2028-01-18');
    expect(mlkDay(2026)).toBe('2026-01-19');
  });

  it('Canada: instalments in each calendar quarter, moved off a weekend', () => {
    expect(spans(2026, CA)).toEqual([
      ['2026-01-01', '2026-03-31', '2026-03-16'], // 15 March 2026 is a Sunday
      ['2026-04-01', '2026-06-30', '2026-06-15'],
      ['2026-07-01', '2026-09-30', '2026-09-15'],
      ['2026-10-01', '2026-12-31', '2026-12-15'],
    ]);
  });

  it('Australia: BAS quarters of the income year, the second due in February', () => {
    expect(spans(2026, AU)).toEqual([
      ['2026-07-01', '2026-09-30', '2026-10-28'],
      ['2026-10-01', '2026-12-31', '2027-03-01'], // 28 February 2027 is a Sunday
      ['2027-01-01', '2027-03-31', '2027-04-28'],
      ['2027-04-01', '2027-06-30', '2027-07-28'],
    ]);
    expect(quarterOf('2027-06-30', AU)).toMatchObject({ number: 4, taxYear: 2026 });
  });

  it('covers every day of a tax year once, in every region', () => {
    for (const region of [US, GB, CA, AU]) {
      expect(QUARTER_RULES[region.code].quarters).toHaveLength(4);
      const quarters = quartersOf(2026, region);
      for (let i = 1; i < quarters.length; i++) {
        const [y, m, d] = quarters[i - 1].end.split('-').map(Number);
        expect(new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)).toBe(quarters[i].start);
      }
    }
  });

  it('shows last year’s quarters while they’re still due', () => {
    expect(quartersToShow(GB, '2026-04-20').map((q) => `${q.taxYear}Q${q.number}`)).toEqual([
      '2025Q4',
      '2026Q1',
      '2026Q2',
      '2026Q3',
      '2026Q4',
    ]);
    expect(quartersToShow(GB, '2026-10-02')).toHaveLength(4);
    expect(quartersToShow(US, '2027-01-10')[0]).toMatchObject({ taxYear: 2026, number: 4 });
  });

  it('counts days left', () => {
    expect(daysUntil('2026-10-02', '2026-11-07')).toBe(36);
    expect(daysUntil('2026-11-07', '2026-11-07')).toBe(0);
    expect(daysUntil('2026-11-08', '2026-11-07')).toBe(-1);
  });

  it('names the days', () => {
    expect(formatQuarterRange(quartersOf(2026, GB)[1], GB)).toBe('6 Jul – 5 Oct');
    expect(formatQuarterRange(quartersOf(2026, US)[1], US)).toBe('Apr 1 – May 31');
  });
});

describe('reminders', () => {
  it('go out two weeks before each deadline, the next ones first', () => {
    expect(quarterReminderDate(quartersOf(2026, GB)[1])).toBe('2026-10-24');
    const upcoming = upcomingQuarterReminders(GB, new Date(2026, 9, 2, 12), 18, 4);
    expect(upcoming.map((q) => q.due)).toEqual(['2026-11-07', '2027-02-07', '2027-05-07', '2027-08-07']);
    // On the reminder day itself, until the reminder hour.
    expect(upcomingQuarterReminders(GB, new Date(2026, 9, 24, 17), 18, 1)[0].due).toBe('2026-11-07');
    expect(upcomingQuarterReminders(GB, new Date(2026, 9, 24, 19), 18, 1)[0].due).toBe('2027-02-07');
  });
});

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

describe('summarizeQuarter', () => {
  it('UK: the 10,000-mile tier is counted across the tax year, not per quarter', () => {
    const trips = [trip(GB, '2026-05-01', 9_000), trip(GB, '2026-08-01', 3_000), trip(GB, '2026-11-01', 100)];
    const deductions = computeDeductions(trips, GB);
    const [q1, q2, q3, q4] = quartersOf(2026, GB).map((q) => summarizeQuarter(trips, GB, q, deductions));
    expect(q1.mileage).toBe(495_000); // 9,000 at 55p
    expect(q2.mileage).toBe(105_000); // 1,000 at 55p, 2,000 at 25p
    expect(q3.mileage).toBe(2_500); // all at 25p
    expect(q4.mileage).toBe(0);
    expect(q1.mileage + q2.mileage + q3.mileage).toBe(602_500);
  });

  it('Australia: the 5,000 km cap per car runs across the quarters', () => {
    const trips = [trip(AU, '2026-08-01', 4_000), trip(AU, '2026-11-01', 2_000)];
    const deductions = computeDeductions(trips, AU);
    const [q1, q2] = quartersOf(2026, AU).map((q) => summarizeQuarter(trips, AU, q, deductions));
    expect(q1.mileage).toBe(364_000);
    expect(q2.mileage).toBe(91_000); // only 1,000 km left under the cap
  });

  it('counts drives, parking and tolls where they count, and what still needs sorting', () => {
    const trips = [
      trip(US, '2026-07-01', 10, { parkingMinor: 500, tollsMinor: 250 }),
      trip(US, '2026-07-02', 10, { purpose: '' }),
      trip(US, '2026-07-03', 10, { classification: 'unclassified' }),
      trip(US, '2026-07-04', 10, { classification: 'personal' }),
      trip(US, '2026-09-01', 10), // the next period
    ];
    const deductions = computeDeductions(trips, US);
    const summary = summarizeQuarter(trips, US, quarterOf('2026-07-01', US), deductions);
    expect(summary).toMatchObject({
      businessMeters: fromUnits(10, US) * 2,
      mileage: 1_520,
      costs: 750,
      costsAdded: true,
      total: 2_270,
      businessCount: 2,
      unsortedCount: 1,
      missingPurposeCount: 1,
    });
    // Canada records parking apart: not in the total.
    const ca = [trip(CA, '2026-07-01', 10, { parkingMinor: 500 })];
    expect(summarizeQuarter(ca, CA, quarterOf('2026-07-01', CA), computeDeductions(ca, CA))).toMatchObject({
      mileage: 730,
      costs: 500,
      costsAdded: false,
      total: 730,
    });
  });
});

describe('the quarter’s report', () => {
  it('has only the quarter’s drives, priced over the whole year', () => {
    const trips = [trip(GB, '2026-05-01', 9_000), trip(GB, '2026-08-01', 3_000)];
    const q2 = quartersOf(2026, GB)[1];
    const report = buildReport(trips, GB, 2026, { range: { start: q2.start, end: q2.end, name: 'Q2' } });
    expect(report.rows.map((row) => row.trip.localDate)).toEqual(['2026-08-01']);
    expect(report.deduction).toBe(105_000);
    expect(report.range).toEqual({ start: '2026-07-06', end: '2026-10-05', name: 'Q2' });
    expect(buildReport(trips, GB, 2026).range).toBeNull();
  });
});
