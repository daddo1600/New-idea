import { describe, expect, it } from '@jest/globals';

import { toQuickBooksJournals, toXeroJournals } from '../accounting-export';
import { centsPerKmForVehicle } from '../logbook';
import { employerPaysLess, marForYear, marSummary, toP87Html } from '../mar';
import { computeDeductions, largestRemainder, REGIONS, summarizeTaxYear } from '../regions';
import { buildReport, toCsv, toReportHtml } from '../report';
import type { Trip } from '../trip';

/**
 * Money is rounded once per total, not per trip: a year of short trips used
 * to come to more (or less) than the rate × the miles, which made up relief,
 * a taxable excess, or a cents per km figure over the ATO's 5,000 km limit.
 */

const { GB, AU } = REGIONS;

let next = 0;
function trip(localDate: string, distanceMeters: number, overrides: Partial<Trip> = {}): Trip {
  next += 1;
  const startedAt = `${localDate}T${String(8 + (next % 10)).padStart(2, '0')}:00:00.000Z`;
  return {
    id: `r${next}`,
    startedAt,
    localDate,
    endedAt: startedAt,
    startLabel: 'Home',
    endLabel: 'Site',
    distanceMeters,
    classification: 'business',
    purpose: 'Site visit',
    source: 'auto',
    createdAt: startedAt,
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
    ...overrides,
  };
}

/** `count` trips of `meters`, two a day from `start`. */
function trips(start: string, count: number, meters: number, overrides: Partial<Trip> = {}): Trip[] {
  const [y, m, d] = start.split('-').map(Number);
  return Array.from({ length: count }, (_, i) =>
    trip(new Date(Date.UTC(y, m - 1, d + Math.floor(i / 2))).toISOString().slice(0, 10), meters, overrides),
  );
}

const sum = (values: Iterable<number>) => [...values].reduce((total, value) => total + value, 0);
const rowsOf = (csv: string) => csv.replace(/^﻿/, '').trim().split('\r\n');

describe('largestRemainder', () => {
  it('rounds each value down or up and adds up to the total', () => {
    expect(largestRemainder(10, [3.3, 3.3, 3.4])).toEqual([3, 3, 4]);
    expect(largestRemainder(3, [0.5, 0.5, 0.5, 0.5, 0.5, 0.5])).toEqual([1, 1, 1, 0, 0, 0]);
    expect(largestRemainder(455000, [454999.99999999994])).toEqual([455000]);
    expect(largestRemainder(0, [])).toEqual([]);
  });
});

describe('UK: 500 business trips of 805 m (0.5 mi) in 2025/26, employer paying 45p', () => {
  const short = trips('2025-04-07', 500, 805);
  const exact = Math.round(((500 * 805) / 1609.344) * 45); // 250.1 miles × 45p = £112.55

  it('AMAP is 45p × the year’s miles, rounded once (not 23p × 500 = £115.00)', () => {
    expect(exact).toBe(11255);
    const deductions = computeDeductions(short, GB);
    expect(sum(deductions.values())).toBe(exact);
    for (const value of deductions.values()) expect([22, 23]).toContain(value);
    expect(summarizeTaxYear(short, GB, 2025, deductions).deduction).toBe(exact);
  });

  it('no made-up relief and no P87 nudge when the employer pays exactly HMRC’s rate', () => {
    const year = marForYear(short, GB, 2025, { employerRate: 450, band: 'basic' });
    expect(year.amap).toBe(exact);
    expect(year.employerPaid).toBe(exact);
    expect(year.relief).toBe(0);
    expect(year.excessTaxable).toBe(0);
    expect(employerPaysLess(year, GB, 450, new Date(2026, 3, 1, 12))).toBe(false);
  });

  it('no spurious taxable excess when per-trip pennies would round down (1.3 km trips)', () => {
    // 0.808 mi × 45p = 36.35p: per-trip rounding gave 36p each, £1.75 short over 500 trips.
    const down = trips('2025-04-07', 500, 1300);
    const year = marForYear(down, GB, 2025, { employerRate: 450, band: 'basic' });
    expect(year.amap).toBe(year.employerPaid);
    expect(year.excessTaxable).toBe(0);
    expect(year.relief).toBe(0);
    expect(marSummary(down, GB, { employerRate: 450, band: 'basic' }, new Date(2026, 3, 1, 12)).totalRelief).toBe(0);
  });

  it('report rows, the rate row, the Total row and the CSV all agree', () => {
    const report = buildReport(short, GB, 2025);
    expect(report.deduction).toBe(exact);
    expect(sum(report.rows.map((row) => row.deduction))).toBe(exact);
    expect(report.byRate).toHaveLength(1);
    expect(report.byRate[0].deduction).toBe(exact);
    const html = toReportHtml(report, new Date(2026, 4, 1, 12));
    expect(html.match(/£112\.55/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain('£115.00');
    const csv = rowsOf(toCsv(report));
    const column = csv[0].split(',').findIndex((name) => name.startsWith('Deduction'));
    const pennies = csv.slice(1).map((line) => Math.round(Number(line.split(',')[column]) * 100));
    expect(sum(pennies)).toBe(exact);
  });

  it('monthly Xero and QuickBooks journals add up to the rows of each month and to the year', () => {
    const report = buildReport(short, GB, 2025);
    const byMonth = new Map<string, number>();
    for (const row of report.rows) {
      const key = row.trip.localDate.slice(0, 7);
      byMonth.set(key, (byMonth.get(key) ?? 0) + row.deduction);
    }
    const xero = rowsOf(toXeroJournals(report))
      .slice(1)
      .filter((line) => !line.includes(',-'))
      .map((line) => Math.round(Number(line.split(',').at(-1)) * 100));
    expect(xero).toEqual([...byMonth.values()]);
    expect(sum(xero)).toBe(exact);
    const quickBooks = rowsOf(toQuickBooksJournals(report)).slice(1);
    expect(quickBooks.length).toBe(byMonth.size * 2);
    expect(toQuickBooksJournals(report)).toContain(((byMonth.get('2025-04') ?? 0) / 100).toFixed(2));
  });

  it('a tier crossing keeps the rate rows adding up to the total', () => {
    // 10,000 miles at 45p then 25p: 500 trips of 32.2 km = 10,004.1 miles.
    const many = trips('2025-04-07', 500, 32_200);
    const report = buildReport(many, GB, 2025);
    expect(report.byRate).toHaveLength(2);
    expect(sum(report.byRate.map((rate) => rate.deduction))).toBe(report.deduction);
    expect(sum(report.rows.map((row) => row.deduction))).toBe(report.deduction);
    const miles = (500 * 32_200) / 1609.344;
    expect(report.deduction).toBe(Math.round(10_000 * 45 + (miles - 10_000) * 25));
    expect(report.byRate[0].deduction).toBe(450_000);
  });
});

describe('AU: 184 business trips of 30.555 km in car A in 2026–27', () => {
  const au = trips('2026-07-01', 184, 30_555, { vehicleId: 'A' });

  it('cents per km never goes over 5,000 km × 91c', () => {
    // Per-trip rounding gave 455081 cents.
    expect(centsPerKmForVehicle(au, 'A', 2026).deduction).toBe(5000 * 91);
  });

  it('the car’s trip rows add up to the capped amount, with another car in the report', () => {
    const both = [...au, ...trips('2026-07-01', 50, 12_345, { vehicleId: 'B' })];
    const report = buildReport(both, AU, 2026);
    const carA = sum(report.rows.filter((row) => row.trip.vehicleId === 'A').map((row) => row.deduction));
    expect(carA).toBe(455_000);
    expect(centsPerKmForVehicle(both, 'A', 2026, AU).deduction).toBe(455_000);
    expect(centsPerKmForVehicle(both, 'B', 2026, AU).deduction).toBe(Math.round(50 * 12.345 * 91));
    expect(report.deduction).toBe(455_000 + Math.round(50 * 12.345 * 91));
    expect(sum(report.byRate.map((rate) => rate.deduction))).toBe(report.deduction);
  });
});

describe('“prepared on” dates are the local date, not UTC', () => {
  const local = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  // Just after midnight and just before: one of them is a different day in UTC in any zone but UTC itself.
  const moments = [new Date(2026, 3, 6, 0, 30), new Date(2026, 3, 5, 23, 30)];

  it('in the P87 summary', () => {
    for (const moment of moments) {
      const summary = marSummary([], GB, { employerRate: 450, band: 'basic' }, moment);
      const html = toP87Html(summary, GB, { employerRate: 450, band: 'basic' }, moment);
      const day = Number(local(moment).slice(8));
      expect(html).toContain(`prepared with MileMint on ${day} Apr 2026`);
    }
  });

  it('in the mileage report', () => {
    for (const moment of moments) {
      const [y, m, d] = local(moment).split('-');
      expect(toReportHtml(buildReport([], GB, 2025), moment)).toContain(`prepared with MileMint on ${d}/${m}/${y}`);
    }
  });
});
