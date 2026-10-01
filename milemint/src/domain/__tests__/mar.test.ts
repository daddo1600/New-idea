import { describe, expect, it } from '@jest/globals';

import {
  claimableYears,
  claimDeadline,
  employerPaysLess,
  marApplies,
  marForYear,
  marSummary,
  parsePence,
  taxBackFor,
  toP87Csv,
  toP87Html,
  unclaimedNudge,
} from '../mar';
import { fromUnits, REGIONS, type DeductionTrip } from '../regions';

const { GB, US } = REGIONS;

const on = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

let next = 0;
function trip(
  localDate: string,
  miles: number,
  classification: DeductionTrip['classification'] = 'business',
  vehicle: DeductionTrip['vehicle'] = 'car',
): DeductionTrip {
  next += 1;
  return {
    id: `t${next}`,
    localDate,
    startedAt: `${localDate}T12:00:00.000Z`,
    distanceMeters: fromUnits(miles, GB),
    classification,
    vehicle,
  };
}

const PAYS_NOTHING = { employerRate: 0, band: 'basic' } as const;
const PAYS_45P = { employerRate: 450, band: 'basic' } as const;

describe('marForYear', () => {
  it('claims the whole approved amount when the employer pays nothing', () => {
    const year = marForYear([trip('2026-05-01', 1_000)], GB, 2026, PAYS_NOTHING);
    expect(year).toMatchObject({ label: '2026/27', amap: 55_000, employerPaid: 0, relief: 55_000, taxBack: 11_000 });
    expect(year.businessMiles).toBeCloseTo(1_000, 3);
  });

  it('claims the difference when the employer pays less than 55p', () => {
    const year = marForYear([trip('2026-05-01', 1_000)], GB, 2026, PAYS_45P);
    expect(year).toMatchObject({ amap: 55_000, employerPaid: 45_000, relief: 10_000, excessTaxable: 0 });
  });

  it('uses 45p before 6 April 2026', () => {
    const year = marForYear([trip('2025-06-01', 1_000)], GB, 2025, PAYS_45P);
    expect(year).toMatchObject({ amap: 45_000, employerPaid: 45_000, relief: 0 });
  });

  it('drops to 25p after 10,000 business miles in the year', () => {
    const trips = [trip('2026-05-01', 10_000), trip('2026-06-01', 2_000)];
    const year = marForYear(trips, GB, 2026, PAYS_NOTHING);
    expect(year.amap).toBe(10_000 * 55 + 2_000 * 25);
  });

  it('prices motorbikes and bicycles at their own rates', () => {
    const trips = [trip('2026-05-01', 100, 'business', 'motorbike'), trip('2026-05-02', 100, 'business', 'bicycle')];
    expect(marForYear(trips, GB, 2026, PAYS_NOTHING).amap).toBe(2_400 + 2_000);
  });

  it('marks pay above the approved amount as taxable', () => {
    const year = marForYear([trip('2026-05-01', 15_000)], GB, 2026, { employerRate: 600, band: 'basic' });
    // 10,000 × 55p + 5,000 × 25p = £6,750; paid 15,000 × 60p = £9,000.
    expect(year).toMatchObject({ amap: 675_000, employerPaid: 900_000, relief: 0, excessTaxable: 225_000 });
  });

  it('ignores personal drives and other tax years', () => {
    const trips = [trip('2026-05-01', 100, 'personal'), trip('2026-04-05', 100), trip('2026-04-06', 10)];
    expect(marForYear(trips, GB, 2026, PAYS_NOTHING)).toMatchObject({ amap: 550, tripCount: 2 });
  });

  it('sends claims over £2,500 to Self Assessment', () => {
    expect(marForYear([trip('2026-05-01', 4_000)], GB, 2026, PAYS_NOTHING).needsSelfAssessment).toBe(false);
    expect(marForYear([trip('2026-05-01', 5_000)], GB, 2026, PAYS_NOTHING).needsSelfAssessment).toBe(true);
  });
});

describe('parsePence', () => {
  it('reads pence a mile as typed', () => {
    expect(parsePence('45')).toBe(450);
    expect(parsePence(' 37.5p ')).toBe(375);
    expect(parsePence('0')).toBe(0);
    expect(parsePence('')).toBeNull();
    expect(parsePence('abc')).toBeNull();
    expect(parsePence('250')).toBeNull();
  });
});

describe('tax back', () => {
  it('estimates at the chosen band, and 20% when not sure', () => {
    expect(taxBackFor(10_000, 'basic')).toBe(2_000);
    expect(taxBackFor(10_000, 'higher')).toBe(4_000);
    expect(taxBackFor(10_000, 'additional')).toBe(4_500);
    expect(taxBackFor(10_000, 'unsure')).toBe(2_000);
  });
});

describe('claim window', () => {
  it('is this tax year and the 4 before it', () => {
    expect(claimableYears(GB, on('2026-10-01'))).toEqual([2026, 2025, 2024, 2023, 2022]);
    expect(claimableYears(GB, on('2026-04-05'))).toEqual([2025, 2024, 2023, 2022, 2021]);
  });

  it('closes 4 years after the tax year ends', () => {
    expect(claimDeadline(2022, GB)).toBe('2027-04-05');
    expect(claimDeadline(2024, GB)).toBe('2029-04-05');
  });

  it('applies to the UK only', () => {
    expect(marApplies(GB)).toBe(true);
    expect(marApplies(US)).toBe(false);
  });
});

describe('marSummary', () => {
  const trips = [
    trip('2021-05-01', 100), // 2021/22: closed on 5 April 2026
    trip('2022-05-01', 100),
    trip('2024-05-01', 200),
    trip('2026-05-01', 300),
  ];

  it('lists open years with trips, plus this one, newest first', () => {
    const summary = marSummary(trips, GB, PAYS_NOTHING, on('2026-10-01'));
    expect(summary.years.map((y) => y.label)).toEqual(['2026/27', '2024/25', '2022/23']);
    expect(summary.totalRelief).toBe(300 * 55 + 200 * 45 + 100 * 45);
    expect(summary.totalTaxBack).toBe(Math.round(16_500 * 0.2) + Math.round(9_000 * 0.2) + Math.round(4_500 * 0.2));
  });

  it('always includes the current year, even with no trips', () => {
    const summary = marSummary([], GB, PAYS_NOTHING, on('2026-10-01'));
    expect(summary.years).toHaveLength(1);
    expect(summary.years[0]).toMatchObject({ taxYear: 2026, relief: 0 });
  });

  it('nudges about the oldest past year not yet claimed', () => {
    const summary = marSummary(trips, GB, PAYS_NOTHING, on('2026-10-01'));
    expect(unclaimedNudge(summary, GB, [], on('2026-10-01'))).toMatchObject({
      oldest: { label: '2022/23', claimBy: '2027-04-05' },
      totalRelief: 9_000 + 4_500,
      yearCount: 2,
    });
    expect(unclaimedNudge(summary, GB, [2022], on('2026-10-01'))).toMatchObject({
      oldest: { label: '2024/25' },
      yearCount: 1,
    });
    expect(unclaimedNudge(summary, GB, [2022, 2024], on('2026-10-01'))).toBeNull();
  });
});

describe('employerPaysLess', () => {
  it('compares the year’s figures, or the rate when nothing is logged yet', () => {
    const empty = marForYear([], GB, 2026, PAYS_45P);
    expect(employerPaysLess(empty, GB, 450, on('2026-10-01'))).toBe(true);
    expect(employerPaysLess(empty, GB, 550, on('2026-10-01'))).toBe(false);
    const year = marForYear([trip('2026-05-01', 100)], GB, 2026, { employerRate: 550, band: 'basic' });
    expect(employerPaysLess(year, GB, 550, on('2026-10-01'))).toBe(false);
  });
});

describe('P87 summary', () => {
  const summary = marSummary([trip('2024-05-01', 200), trip('2026-05-01', 300)], GB, PAYS_45P, on('2026-10-01'));

  it('lists each year as CSV, in English', () => {
    const lines = toP87Csv(summary).replace(/^﻿/, '').trim().split('\r\n');
    expect(lines[0]).toContain('Mileage Allowance Relief claimable (GBP)');
    expect(lines[1]).toBe('2026/27,300.0,165.00,135.00,30.00,0.00,P87 or Self Assessment,2031-04-05');
    expect(lines[2]).toBe('2024/25,200.0,90.00,90.00,0.00,0.00,Nothing to claim,2029-04-05');
  });

  it('prints a summary with the total', () => {
    const html = toP87Html(summary, GB, PAYS_45P, on('2026-10-01'));
    expect(html).toContain('P87 summary');
    expect(html).toContain('45p a mile');
    expect(html).toContain('Total relief claimable: £30.00');
  });
});
