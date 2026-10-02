import { describe, expect, it } from '@jest/globals';

import { toExpenseClaim, toFreeAgentMileage, toQuickBooksJournals, toXeroJournals } from '../accounting-export';
import { minorToInput, parseMoneyMinor } from '../parse-number';
import { costsAdded, costsNote, fromUnits, REGIONS, summarizeTaxYear, type Region } from '../regions';
import { buildReport, csvColumns, toCsv, toReportHtml } from '../report';
import { isValidCostMinor, MAX_COST_MINOR, tripCostsMinor, type Trip } from '../trip';

/*
 * Parking and tolls on a drive: entered in minor units, added on top of the
 * mileage figure where the tax office allows it (US, UK self-employed,
 * Australia), and recorded but listed apart where it isn't (UK employees'
 * Mileage Allowance Relief) or isn't clear (Canada).
 */

const { US, GB, CA, AU } = REGIONS;

/** A date in each region's 2026 tax year, and its car rate in minor units per unit (10 units in every test). */
const DATES: Record<Region['code'], string> = { US: '2026-03-10', GB: '2026-05-10', CA: '2026-03-10', AU: '2026-08-10' };

let next = 0;
function trip(region: Region, overrides: Partial<Trip> = {}): Trip {
  next += 1;
  const localDate = overrides.localDate ?? DATES[region.code];
  return {
    id: `t${next}`,
    startedAt: `${localDate}T09:00:00.000Z`,
    localDate,
    endedAt: `${localDate}T09:30:00.000Z`,
    startLabel: 'Home',
    endLabel: 'Client',
    distanceMeters: fromUnits(10, region),
    classification: 'business',
    purpose: 'Delivery',
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

const rowsOf = (csv: string) => csv.replace(/^﻿/, '').trim().split('\r\n');

describe('parseMoneyMinor', () => {
  it.each([
    ['3.50', 350],
    ['3,50', 350],
    ['£3.50', 350],
    ['$ 12', 1200],
    ['A$4.20', 420],
    ['C$ 4,20', 420],
    ['€2', 200],
    [' 7 ', 700],
    ['0.5', 50],
    ['1,250.00', 125_000],
    ['1.250,00', 125_000],
    ['0', 0],
  ])('reads %j as %d', (text, minor) => {
    expect(parseMoneyMinor(text)).toBe(minor);
  });

  it('reads nothing typed as nothing entered', () => {
    expect(parseMoneyMinor('')).toBeNull();
    expect(parseMoneyMinor('  ')).toBeNull();
    // Just the currency sign: still nothing.
    expect(parseMoneyMinor('£')).toBeNull();
  });

  it.each(['-3', '3.505', '0,125', 'abc', '3.', '3.5.0', '1e3', '£-2'])('rejects %j', (text) => {
    expect(parseMoneyMinor(text)).toBeUndefined();
  });

  it('puts an amount back for editing', () => {
    expect(minorToInput(350)).toBe('3.50');
    expect(minorToInput(1200)).toBe('12.00');
    expect(minorToInput(0)).toBe('');
    expect(minorToInput(undefined)).toBe('');
    expect(parseMoneyMinor(minorToInput(1999))).toBe(1999);
  });
});

describe('validation', () => {
  it('accepts whole minor units from 0 to the limit', () => {
    expect(isValidCostMinor(0)).toBe(true);
    expect(isValidCostMinor(350)).toBe(true);
    expect(isValidCostMinor(MAX_COST_MINOR)).toBe(true);
    expect(MAX_COST_MINOR).toBe(100_000);
  });

  it.each([-1, MAX_COST_MINOR + 1, 3.5, Number.NaN, Infinity, '350', null])('rejects %p', (value) => {
    expect(isValidCostMinor(value)).toBe(false);
  });

  it('adds parking and tolls, a missing one counting as 0', () => {
    expect(tripCostsMinor({ parkingMinor: 350, tollsMinor: 250 })).toBe(600);
    expect(tripCostsMinor({})).toBe(0);
  });
});

describe('the rule per region', () => {
  it('adds them on top in the US, for the UK self-employed and in Australia', () => {
    expect(costsAdded(US)).toBe(true);
    expect(costsAdded(GB)).toBe(true);
    expect(costsAdded(AU)).toBe(true);
  });

  it('never adds them to a UK employee’s Mileage Allowance Relief', () => {
    expect(costsAdded(GB, true)).toBe(false);
    expect(costsNote(GB, true)).toMatch(/aren’t part of Mileage Allowance Relief/);
    expect(costsNote(GB, false)).toMatch(/Congestion Charge/);
  });

  it('lists them apart in Canada (ask your accountant)', () => {
    expect(costsAdded(CA)).toBe(false);
    expect(costsAdded(CA, true)).toBe(false);
    expect(costsNote(CA)).toMatch(/Ask your accountant/);
  });

  it('employee only matters where there’s an employee rule', () => {
    expect(costsAdded(US, true)).toBe(true);
    expect(costsAdded(AU, true)).toBe(true);
  });

  it('says what counts in each country’s report guidance', () => {
    expect(US.report.guidance.join(' ')).toMatch(/regular place of work/);
    expect(GB.report.guidance.join(' ')).toMatch(/fines are never allowable/);
    expect(CA.report.guidance.join(' ')).toMatch(/T2125/);
    expect(AU.report.guidance.join(' ')).toMatch(/D2/);
  });
});

describe('summarizeTaxYear', () => {
  const trips = (region: Region) => [
    trip(region, { parkingMinor: 350, tollsMinor: 250 }),
    trip(region, { tollsMinor: 100 }),
    // Personal: kept with the drive, never counted.
    trip(region, { classification: 'personal', parkingMinor: 900 }),
    // Not sorted yet: not counted either.
    trip(region, { classification: 'unclassified', parkingMinor: 800 }),
    // Another tax year.
    trip(region, { localDate: '2024-09-01', parkingMinor: 700 }),
  ];

  it('US: adds business parking and tolls to the total', () => {
    const summary = summarizeTaxYear(trips(US), US, 2026);
    expect(summary.deduction).toBe(2 * 725);
    expect(summary.costs).toBe(700);
    expect(summary.costsAdded).toBe(true);
    expect(summary.total).toBe(2 * 725 + 700);
  });

  it('UK self-employed: added; UK employee: recorded only', () => {
    const selfEmployed = summarizeTaxYear(trips(GB), GB, 2026);
    expect(selfEmployed.deduction).toBe(2 * 550);
    expect(selfEmployed.total).toBe(2 * 550 + 700);
    const employee = summarizeTaxYear(trips(GB), GB, 2026, undefined, { employee: true });
    expect(employee.costs).toBe(700);
    expect(employee.costsAdded).toBe(false);
    expect(employee.total).toBe(employee.deduction);
  });

  it('Canada: recorded, not added', () => {
    const summary = summarizeTaxYear(trips(CA), CA, 2026);
    expect(summary.costs).toBe(700);
    expect(summary.total).toBe(summary.deduction);
  });

  it('Australia: added on top of cents per km', () => {
    const summary = summarizeTaxYear(trips(AU), AU, 2026);
    expect(summary.deduction).toBe(2 * 91 * 10);
    expect(summary.total).toBe(summary.deduction + 700);
  });

  it('a year without any is unchanged', () => {
    const summary = summarizeTaxYear([trip(US)], US, 2026);
    expect(summary.costs).toBe(0);
    expect(summary.total).toBe(summary.deduction);
  });
});

describe('buildReport', () => {
  it('totals parking and tolls on business drives only', () => {
    const paid = trip(US, { parkingMinor: 350, tollsMinor: 250 });
    const personal = trip(US, { classification: 'personal', parkingMinor: 900 });
    const report = buildReport([paid, personal], US, 2026);
    expect(report.parking).toBe(350);
    expect(report.tolls).toBe(250);
    expect(report.deduction).toBe(725);
    expect(report.total).toBe(725 + 600);
  });

  const cases: [string, Region, boolean, boolean][] = [
    ['US', US, false, true],
    ['UK self-employed', GB, false, true],
    ['UK employee', GB, true, false],
    ['Canada', CA, false, false],
    ['Australia', AU, false, true],
  ];
  it.each(cases)('%s', (_name, region, employee, added) => {
    const report = buildReport([trip(region, { parkingMinor: 400, tollsMinor: 600 })], region, 2026, { employee });
    expect(report.costsAdded).toBe(added);
    expect(report.parking + report.tolls).toBe(1000);
    expect(report.total).toBe(report.deduction + (added ? 1000 : 0));
  });
});

describe('spreadsheet', () => {
  it('appends Parking and Tolls after the existing columns', () => {
    const columns = csvColumns(GB);
    expect(columns.slice(-3)).toEqual(['Edited later', 'Parking (GBP)', 'Tolls (GBP)']);
    expect(columns.indexOf('Deduction (GBP)')).toBe(10);
  });

  it('fills them per trip: business always, others when entered', () => {
    const business = trip(GB, { parkingMinor: 350 });
    const plain = trip(GB);
    const personal = trip(GB, { classification: 'personal', tollsMinor: 120 });
    const personalNone = trip(GB, { classification: 'personal' });
    const rows = rowsOf(toCsv(buildReport([business, plain, personal, personalNone], GB, 2026)));
    expect(rows[1].endsWith(',No,3.50,0.00')).toBe(true);
    expect(rows[2].endsWith(',No,0.00,0.00')).toBe(true);
    expect(rows[3].endsWith(',No,,1.20')).toBe(true);
    expect(rows[4].endsWith(',No,,')).toBe(true);
    expect(rows).toHaveLength(5);
  });
});

describe('PDF report', () => {
  it('adds them to the deduction table where they count', () => {
    const html = toReportHtml(buildReport([trip(US, { parkingMinor: 350, tollsMinor: 250 })], US, 2026));
    expect(html).toContain('Mileage at IRS rates</td><td class="num">$7.25');
    expect(html).toContain('Parking (business trips)</td><td class="num">$3.50');
    expect(html).toContain('Tolls and road charges (business trips)</td><td class="num">$2.50');
    expect(html).toContain('Total, including parking and tolls</td><td class="num">$13.25');
    expect(html).not.toContain('recorded, not included above');
    // Trip log columns.
    expect(html).toContain('<th class="num">Parking</th><th class="num">Tolls</th>');
  });

  it('lists them apart for a UK employee, with the reason', () => {
    const html = toReportHtml(
      buildReport([trip(GB, { parkingMinor: 350, tollsMinor: 1500 })], GB, 2026, { employee: true }),
    );
    expect(html).toContain('<td colspan="2">Total</td><td class="num">£5.50');
    expect(html).toContain('Parking and tolls (recorded, not included above)');
    expect(html).toContain('Total parking and tolls</td><td class="num">£18.50');
    expect(html).toContain('aren’t part of Mileage Allowance Relief');
  });

  it('lists them apart in Canada', () => {
    const html = toReportHtml(buildReport([trip(CA, { parkingMinor: 1000 })], CA, 2026));
    expect(html).toContain('Parking and tolls (recorded, not included above)');
    expect(html).toContain('Ask your accountant about tolls');
  });

  it('leaves a report without any as it was', () => {
    const html = toReportHtml(buildReport([trip(AU)], AU, 2026));
    expect(html).not.toContain('Parking (business trips)');
    expect(html).not.toContain('<th class="num">Parking</th>');
    expect(html).toContain('<td colspan="2">Total</td>');
  });
});

describe('accounting exports', () => {
  const totalOf = (rows: string[], column: number) =>
    rows.slice(1).reduce((sum, row) => sum + Number(row.split(',')[column] || 0), 0);

  it('Xero: a parking and tolls line in the month’s journal, and it still balances', () => {
    const report = buildReport(
      [trip(GB, { localDate: '2026-05-10', parkingMinor: 350, tollsMinor: 250 }), trip(GB, { localDate: '2026-05-12' })],
      GB,
      2026,
    );
    const rows = rowsOf(toXeroJournals(report));
    expect(rows).toHaveLength(4);
    expect(rows[1]).toContain('Motor vehicle expenses (mileage allowance),449,No VAT,11.00');
    expect(rows[2]).toContain('Parking and tolls (business journeys),449,No VAT,6.00');
    expect(rows[3]).toContain('Owner funds introduced,881,No VAT,-17.00');
    expect(totalOf(rows, 5)).toBeCloseTo(0);
  });

  it('Xero and QuickBooks leave them out where they aren’t added (Canada)', () => {
    const report = buildReport([trip(CA, { parkingMinor: 350 })], CA, 2026);
    expect(toXeroJournals(report)).not.toContain('Parking');
    expect(toQuickBooksJournals(report)).not.toContain('Parking');
  });

  it('QuickBooks: debits equal credits with parking and tolls', () => {
    const report = buildReport([trip(US, { parkingMinor: 1000, tollsMinor: 275 })], US, 2026);
    const rows = rowsOf(toQuickBooksJournals(report));
    expect(rows).toHaveLength(4);
    expect(rows[2]).toContain('Car & Truck,12.75,');
    expect(rows[2]).toContain('Parking and tolls March 2026');
    expect(totalOf(rows, 3)).toBeCloseTo(totalOf(rows, 4));
    expect(totalOf(rows, 3)).toBeCloseTo(7.25 + 12.75);
  });

  it('FreeAgent: parking and tolls columns at the end', () => {
    const rows = rowsOf(toFreeAgentMileage(buildReport([trip(GB, { parkingMinor: 350 })], GB, 2026)));
    expect(rows[0]).toBe('Date,Description,Miles,Vehicle,Claimed at,Value (GBP),Parking (GBP),Tolls (GBP)');
    expect(rows[1].endsWith(',5.50,3.50,0.00')).toBe(true);
  });

  it('Expense claim: parking, tolls and the total per trip, for employees too', () => {
    const report = buildReport([trip(GB, { parkingMinor: 350, tollsMinor: 1150 })], GB, 2026, { employee: true });
    const rows = rowsOf(toExpenseClaim(report));
    expect(rows[1].endsWith(',5.50,3.50,11.50,20.50')).toBe(true);
  });

  it('a business drive with no mileage value but parking is still claimed (US bicycle)', () => {
    const report = buildReport([trip(US, { vehicle: 'bicycle', parkingMinor: 200 })], US, 2026);
    expect(report.deduction).toBe(0);
    expect(rowsOf(toExpenseClaim(report))[1].endsWith(',0.00,2.00,0.00,2.00')).toBe(true);
    const xero = rowsOf(toXeroJournals(report));
    expect(xero).toHaveLength(3);
    expect(xero[1]).toContain('Parking and tolls (business journeys),449,Tax Exempt,2.00');
  });
});
