import { csvCell, escapeHtml } from './report';
import {
  computeDeductions,
  currentTaxYear,
  formatLongDate,
  formatMoney,
  ratePeriodFor,
  type DeductionTrip,
  type Region,
  taxYearBounds,
  taxYearLabel,
  taxYearOf,
  toUnits,
} from './regions';
import { toLocalIsoDate } from './trip';

/**
 * Mileage Allowance Relief (MAR): UK employees who use their own car, van,
 * motorbike or bicycle for work can claim tax relief when their employer pays
 * less than HMRC's approved mileage allowance payments (AMAP), or nothing.
 * Pure, so the figures on screen and in the P87 summary are the ones tested.
 *
 * Rules (HMRC, checked Oct 2026; see EIM31200 onwards and the P87 guidance):
 *   - AMAP is the official rate in `regions.ts` (cars and vans 55p a mile for
 *     the first 10,000 business miles of the tax year from 6 Apr 2026, 45p
 *     before; 25p after that; motorbikes 24p; bicycles 20p).
 *   - Relief = AMAP for the year's business miles − mileage allowance paid by
 *     the employer, never below zero. It is a deduction from taxable pay, so
 *     the tax it saves is the relief × the employee's marginal rate.
 *   - Paid more than AMAP: the excess is taxable pay (the employer normally
 *     reports it on the P11D or payrolls it). Shown as a note only.
 *   - Claim with form P87 (online or by post) when total employment expenses
 *     for the year are £2,500 or less and you don't file Self Assessment;
 *     otherwise claim on the Self Assessment return.
 *   - Claims go back 4 tax years: the claim for a year must reach HMRC within
 *     4 years of that tax year's end (5 April). The current tax year can be
 *     claimed too (HMRC adjusts the tax code).
 *   - Ordinary commuting doesn't count; the home screen already flags it.
 *
 * Simplifications, noted for review:
 *   - One employment. The 10,000-mile threshold applies per employment (or
 *     jointly for associated employers); MileMint counts all business miles.
 *   - The employer's rate applies to every business mile, whatever the vehicle.
 *   - Scotland has its own income tax bands (19%–48%); the estimate uses the
 *     band the user picks, and 20% when they're not sure.
 *   - Passenger payments and the 5p-a-mile passenger rate are left out.
 */

/** The marginal income tax rate used for the "tax back" estimate. */
export type TaxBand = 'basic' | 'higher' | 'additional' | 'unsure';

/** Percent. "Not sure" estimates at the basic rate. */
export const TAX_BAND_RATES: Record<TaxBand, number> = { basic: 20, higher: 40, additional: 45, unsure: 20 };

/** Above this (total employment expenses for a year, pence) HMRC wants a Self Assessment return instead of a P87. */
export const P87_LIMIT_MINOR = 250_000;

/** How far back a claim can go, in tax years before the current one. */
export const YEARS_BACK = 4;

/** HMRC's page for claiming tax relief on employment expenses (P87). */
export const P87_URL = 'https://www.gov.uk/guidance/claim-income-tax-relief-for-your-employment-expenses-p87';

/**
 * Pence a mile as typed ("45", "37.5", "45p") → tenths of a penny; null if it
 * isn't a sensible rate (up to £2). Pounds are understood too ("£0.45" or
 * "0.45" is 45p: nobody is paid under a penny a mile).
 */
export function parsePence(text: string): number | null {
  // A decimal comma ("37,5p") is as good as a point.
  const trimmed = text.trim().replace(/p$/i, '').trim().replace(',', '.');
  const pounds = /^£?\s*(\d)\.(\d{2,3})$/.exec(trimmed);
  if (pounds && (trimmed.startsWith('£') || pounds[1] === '0')) {
    const tenths = Math.round(Number(`${pounds[1]}.${pounds[2]}`) * 1000);
    return tenths > 0 && tenths <= 2000 ? tenths : null;
  }
  if (!/^\d{1,3}(\.\d)?$/.test(trimmed)) return null;
  const tenths = Math.round(Number(trimmed) * 10);
  return tenths <= 2000 ? tenths : null;
}

/** Relief is only worked out for the UK; elsewhere employees are shown their mileage as usual. */
export function marApplies(region: Region): boolean {
  return region.code === 'GB';
}

export type MarYear = {
  taxYear: number;
  /** e.g. "2025/26". */
  label: string;
  /** Business distance in miles. */
  businessMiles: number;
  /** HMRC approved mileage allowance for those miles, pence. */
  amap: number;
  /** Mileage allowance received from the employer, pence. */
  employerPaid: number;
  /** Mileage Allowance Relief to claim, pence. */
  relief: number;
  /** Estimated income tax saved by the relief at the chosen band, pence. */
  taxBack: number;
  /** Paid above AMAP: taxable, pence. */
  excessTaxable: number;
  /** Last day (YYYY-MM-DD) HMRC accepts a claim for this tax year. */
  claimBy: string;
  /** Over the P87 limit: claim on Self Assessment. */
  needsSelfAssessment: boolean;
  tripCount: number;
};

/** What the employer pays and the band the estimate uses. */
export type MarOptions = {
  /** Employer's mileage rate in tenths of a penny a mile (450 = 45p); 0 when they pay nothing. */
  employerRate: number;
  band: TaxBand;
};

/** The last day a claim for the tax year starting in `taxYear` can be made: 4 years after it ends. */
export function claimDeadline(taxYear: number, region: Region): string {
  return taxYearBounds(taxYear + YEARS_BACK, region).end;
}

/** Tax years a claim can still be made for, newest first: this one and the previous 4. */
export function claimableYears(region: Region, today: Date = new Date()): number[] {
  const current = currentTaxYear(region, today);
  return Array.from({ length: YEARS_BACK + 1 }, (_, i) => current - i);
}

/** Estimated tax saved by `relief` pence at a band. */
export function taxBackFor(relief: number, band: TaxBand): number {
  return Math.round((relief * TAX_BAND_RATES[band]) / 100);
}

/** Relief, tax back and the excess for one tax year. */
export function marForYear(
  trips: readonly DeductionTrip[],
  region: Region,
  taxYear: number,
  options: MarOptions,
  deductions: ReadonlyMap<string, number> = computeDeductions(trips, region),
): MarYear {
  let meters = 0;
  let amap = 0;
  let tripCount = 0;
  for (const trip of trips) {
    if (taxYearOf(trip.localDate, region) !== taxYear) continue;
    tripCount += 1;
    if (trip.classification !== 'business') continue;
    meters += trip.distanceMeters;
    amap += deductions.get(trip.id) ?? 0;
  }
  const businessMiles = toUnits(meters, region);
  const employerPaid = Math.round((businessMiles * Math.max(0, options.employerRate)) / 10);
  const relief = Math.max(0, amap - employerPaid);
  return {
    taxYear,
    label: taxYearLabel(taxYear, region),
    businessMiles,
    amap,
    employerPaid,
    relief,
    taxBack: taxBackFor(relief, options.band),
    excessTaxable: Math.max(0, employerPaid - amap),
    claimBy: claimDeadline(taxYear, region),
    needsSelfAssessment: relief > P87_LIMIT_MINOR,
    tripCount,
  };
}

export type MarSummary = {
  /** Claimable tax years with trips (the current one always), newest first. */
  years: MarYear[];
  totalRelief: number;
  totalTaxBack: number;
};

/** Relief for every tax year still open to a claim. */
export function marSummary(
  trips: readonly DeductionTrip[],
  region: Region,
  options: MarOptions,
  today: Date = new Date(),
  deductions: ReadonlyMap<string, number> = computeDeductions(trips, region),
): MarSummary {
  const current = currentTaxYear(region, today);
  const years = claimableYears(region, today)
    .map((year) => marForYear(trips, region, year, options, deductions))
    .filter((year) => year.taxYear === current || year.tripCount > 0);
  return {
    years,
    totalRelief: years.reduce((sum, year) => sum + year.relief, 0),
    totalTaxBack: years.reduce((sum, year) => sum + year.taxBack, 0),
  };
}

/**
 * Whether the employer pays less than HMRC's rate: the year's figures when
 * there are business miles, otherwise the employer's rate against the
 * first-tier car rate in force today.
 */
export function employerPaysLess(year: MarYear, region: Region, employerRate: number, today: Date = new Date()): boolean {
  if (year.amap > 0) return year.relief > 0;
  const period = ratePeriodFor(toLocalIsoDate(today), region);
  return period ? employerRate < period.tiers[0].rate : false;
}

export type UnclaimedNudge = {
  /** The past year whose window closes first. */
  oldest: MarYear;
  /** Relief across every past year not marked as claimed, pence. */
  totalRelief: number;
  yearCount: number;
};

/**
 * Relief left in past tax years (not the current one) that the user hasn't
 * marked as claimed, for the home screen. Null when there's none.
 */
export function unclaimedNudge(
  summary: MarSummary,
  region: Region,
  claimedYears: readonly number[],
  today: Date = new Date(),
): UnclaimedNudge | null {
  const current = currentTaxYear(region, today);
  const open = summary.years.filter(
    (year) => year.taxYear < current && year.relief > 0 && !claimedYears.includes(year.taxYear),
  );
  if (open.length === 0) return null;
  const oldest = open.reduce((a, b) => (a.taxYear < b.taxYear ? a : b));
  return { oldest, totalRelief: open.reduce((sum, year) => sum + year.relief, 0), yearCount: open.length };
}

// ─── P87 summary export (English: it goes to HMRC) ─────────────────────────

const pounds = (minor: number) => (minor / 100).toFixed(2);
const miles = (value: number) => value.toFixed(1);

/** Per tax year: business miles, AMAP amount, employer paid, relief claimable. */
export function toP87Csv(summary: MarSummary): string {
  const lines = [
    [
      'Tax year',
      'Business miles',
      'HMRC approved mileage allowance (GBP)',
      'Mileage allowance received from employer (GBP)',
      'Mileage Allowance Relief claimable (GBP)',
      'Taxable excess paid by employer (GBP)',
      'How to claim',
      'Claim by (YYYY-MM-DD)',
    ]
      .map(csvCell)
      .join(','),
  ];
  for (const year of summary.years) {
    lines.push(
      [
        year.label,
        miles(year.businessMiles),
        pounds(year.amap),
        pounds(year.employerPaid),
        pounds(year.relief),
        pounds(year.excessTaxable),
        year.relief === 0 ? 'Nothing to claim' : year.needsSelfAssessment ? 'Self Assessment' : 'P87 or Self Assessment',
        year.claimBy,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // CRLF and a byte-order mark so Excel opens it as UTF-8 ("£").
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** The printable P87 summary. */
export function toP87Html(summary: MarSummary, region: Region, options: MarOptions, generatedAt: Date = new Date()): string {
  const money = (minor: number) => escapeHtml(formatMoney(minor, region));
  const date = (iso: string) => escapeHtml(formatLongDate(iso, region));
  const employerRate =
    options.employerRate > 0
      ? `${(options.employerRate / 10).toFixed(options.employerRate % 10 === 0 ? 0 : 1)}p a mile`
      : 'nothing';
  const rows = summary.years
    .map(
      (year) =>
        `<tr><td>${escapeHtml(year.label)}</td>` +
        `<td class="num">${escapeHtml(new Intl.NumberFormat(region.locale, { maximumFractionDigits: 1 }).format(year.businessMiles))}</td>` +
        `<td class="num">${money(year.amap)}</td>` +
        `<td class="num">${money(year.employerPaid)}</td>` +
        `<td class="num"><b>${money(year.relief)}</b></td>` +
        `<td>${year.relief === 0 ? 'Nothing to claim' : year.needsSelfAssessment ? 'Self Assessment' : 'P87 or Self Assessment'}</td>` +
        `<td>${date(year.claimBy)}</td></tr>`,
    )
    .join('');
  const excess = summary.years.filter((year) => year.excessTaxable > 0);
  const excessNote = excess.length
    ? `<p class="note">Your employer paid more than the approved amount in ${excess
        .map((year) => `${escapeHtml(year.label)} (${money(year.excessTaxable)})`)
        .join(', ')}. The excess is taxable pay; your employer normally reports it to HMRC.</p>`
    : '';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111; font-size: 11pt; }
  h1 { font-size: 18pt; margin: 0 0 4px; }
  h2 { font-size: 13pt; margin: 18px 0 6px; }
  .sub { color: #555; margin: 0 0 12px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border-bottom: 1px solid #ddd; padding: 5px 6px; text-align: left; vertical-align: top; }
  th { background: #f2f5f3; font-size: 9.5pt; }
  .num { text-align: right; white-space: nowrap; }
  .note { color: #555; font-size: 9.5pt; }
  ol li { margin-bottom: 4px; }
</style></head>
<body>
  <h1>Mileage Allowance Relief · P87 summary</h1>
  <p class="sub">Business mileage in your own vehicle as an employee · employer mileage allowance: ${escapeHtml(employerRate)} · prepared with MileMint on ${date(generatedAt.toISOString().slice(0, 10))}</p>
  <table>
    <thead><tr><th>Tax year</th><th class="num">Business miles</th><th class="num">HMRC approved amount</th><th class="num">Allowance received</th><th class="num">Relief claimable</th><th>How to claim</th><th>Claim by</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p><b>Total relief claimable: ${money(summary.totalRelief)}</b></p>
  ${excessNote}
  <h2>Claiming</h2>
  <ol>
    <li>Online with form P87 at GOV.UK (“Claim Income Tax relief for your employment expenses”), or by post, if your employment expenses for the year are £2,500 or less and you don’t file a Self Assessment return.</li>
    <li>Otherwise, include it in employment expenses on your Self Assessment return.</li>
    <li>You’ll need your employer’s name and PAYE reference (on your payslip or P60), the business miles and the mileage allowance you received for each tax year.</li>
    <li>HMRC may ask to see your mileage log; export it from MileMint (Reports).</li>
  </ol>
  <p class="note">Approved amounts use HMRC approved mileage allowance payments rates: cars and vans 45p a mile (55p from 6 April 2026) for the first 10,000 business miles in a tax year and 25p after that, motorbikes 24p, bicycles 20p. Ordinary commuting is not business mileage. Relief reduces your taxable pay, so the tax you get back depends on your tax rate. These are estimates, not tax advice.</p>
</body></html>`;
}

/** File name for the P87 summary, e.g. "MileMint P87 summary.csv". */
export function p87FileName(extension: 'csv' | 'pdf'): string {
  return `MileMint P87 summary.${extension}`;
}
