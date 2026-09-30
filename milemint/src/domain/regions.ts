import { METERS_PER_MILE, type Trip } from './trip';

/**
 * Where the user drives decides the currency, the distance unit, the tax
 * year and the official per-distance rate. Rates are in tenths of the minor
 * currency unit per unit of distance (725 = 72.5¢ a mile; 550 = 55p a mile),
 * so every calculation stays in integers until the final rounding.
 *
 * Sources (checked Sep 2026):
 *   US  IRS standard mileage rate; 76¢ from 1 Jul 2026 (IRS midyear increase).
 *   GB  HMRC approved mileage allowance payments; 55p from 6 Apr 2026,
 *       announced 21 May 2026, first change since 2011.
 *   CA  CRA reasonable per-km allowance (provinces; territories are 4¢ higher).
 *   AU  ATO cents per kilometre method, capped at 5,000 km per car per year.
 */

export type RegionCode = 'US' | 'GB' | 'CA' | 'AU';
export type DistanceUnit = 'mi' | 'km';

/** Up to `upTo` units of business distance in a tax year at `rate`; `null` means no limit. */
export type RateTier = { upTo: number | null; rate: number };

/** Tiers in force from `from` (YYYY-MM-DD) until the next period starts. */
export type RatePeriod = { from: string; tiers: readonly RateTier[] };

export type Region = {
  code: RegionCode;
  name: string;
  flag: string;
  currency: string;
  /** For number and currency formatting. */
  locale: string;
  unit: DistanceUnit;
  /** Tax office, as users know it. */
  authority: string;
  /** First day of the tax year. */
  taxYearStart: { month: number; day: number };
  rates: readonly RatePeriod[];
  /** One line on how the figure is worked out, shown when choosing a region. */
  rule: string;
  /** Anything the user should know about what the figure means. */
  caveat: string | null;
};

const METERS_PER_KM = 1000;

export const REGIONS: Record<RegionCode, Region> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    locale: 'en-US',
    unit: 'mi',
    authority: 'IRS',
    taxYearStart: { month: 1, day: 1 },
    rates: [
      { from: '2024-01-01', tiers: [{ upTo: null, rate: 670 }] },
      { from: '2025-01-01', tiers: [{ upTo: null, rate: 700 }] },
      { from: '2026-01-01', tiers: [{ upTo: null, rate: 725 }] },
      { from: '2026-07-01', tiers: [{ upTo: null, rate: 760 }] },
    ],
    rule: 'IRS standard mileage rate: 76¢ a mile from July 2026',
    caveat: null,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    locale: 'en-GB',
    unit: 'mi',
    authority: 'HMRC',
    taxYearStart: { month: 4, day: 6 },
    rates: [
      { from: '2011-04-06', tiers: [{ upTo: 10_000, rate: 450 }, { upTo: null, rate: 250 }] },
      { from: '2026-04-06', tiers: [{ upTo: 10_000, rate: 550 }, { upTo: null, rate: 250 }] },
    ],
    rule: 'HMRC mileage rate: 55p a mile for the first 10,000 business miles, then 25p',
    caveat: null,
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    locale: 'en-CA',
    unit: 'km',
    authority: 'CRA',
    taxYearStart: { month: 1, day: 1 },
    rates: [
      { from: '2024-01-01', tiers: [{ upTo: 5_000, rate: 700 }, { upTo: null, rate: 640 }] },
      { from: '2025-01-01', tiers: [{ upTo: 5_000, rate: 720 }, { upTo: null, rate: 660 }] },
      { from: '2026-01-01', tiers: [{ upTo: 5_000, rate: 730 }, { upTo: null, rate: 670 }] },
    ],
    rule: 'CRA per-km rate: 73¢ for the first 5,000 km, then 67¢',
    caveat:
      'This is CRA’s reimbursement rate for employees. If you’re self-employed, CRA usually wants your actual car costs, so treat the figure as an estimate.',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    locale: 'en-AU',
    unit: 'km',
    authority: 'ATO',
    taxYearStart: { month: 7, day: 1 },
    rates: [
      { from: '2023-07-01', tiers: [{ upTo: 5_000, rate: 850 }, { upTo: null, rate: 0 }] },
      { from: '2024-07-01', tiers: [{ upTo: 5_000, rate: 880 }, { upTo: null, rate: 0 }] },
      { from: '2026-07-01', tiers: [{ upTo: 5_000, rate: 910 }, { upTo: null, rate: 0 }] },
    ],
    rule: 'ATO cents per km method: 91c a km, up to 5,000 km per car a year',
    caveat: null,
  },
};

export const REGION_LIST: readonly Region[] = [REGIONS.US, REGIONS.GB, REGIONS.CA, REGIONS.AU];

export const DEFAULT_REGION: RegionCode = 'US';

/** A region from the phone's locale, e.g. "en-GB" → GB; null when it isn't one we cover. */
export function regionFromLocale(locale: string | undefined): RegionCode | null {
  const country = locale?.split(/[-_]/)[1]?.toUpperCase();
  if (country === 'UK') return 'GB';
  return country && country in REGIONS ? (country as RegionCode) : null;
}

// ─── Distances ──────────────────────────────────────────────────────────────

export function metersPerUnit(unit: DistanceUnit): number {
  return unit === 'mi' ? METERS_PER_MILE : METERS_PER_KM;
}

export function toUnits(meters: number, region: Region): number {
  return meters / metersPerUnit(region.unit);
}

export function fromUnits(units: number, region: Region): number {
  return Math.round(units * metersPerUnit(region.unit));
}

export function formatDistance(meters: number, region: Region): string {
  const value = new Intl.NumberFormat(region.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${value.format(toUnits(meters, region))} ${region.unit}`;
}

/** Money is kept in minor units (cents, pence). */
export function formatMoney(minor: number, region: Region): string {
  return new Intl.NumberFormat(region.locale, { style: 'currency', currency: region.currency }).format(minor / 100);
}

/** e.g. "55p", "72.5¢", "91c". */
export function formatRate(rate: number, region: Region): string {
  const amount = (rate / 10).toFixed(rate % 10 === 0 ? 0 : 1);
  if (region.currency === 'GBP') return `${amount}p`;
  if (region.currency === 'AUD') return `${amount}c`;
  return `${amount}¢`;
}

// ─── Tax years ──────────────────────────────────────────────────────────────

/** The calendar year the tax year containing `localDate` starts in. */
export function taxYearOf(localDate: string, region: Region): number {
  const year = Number(localDate.slice(0, 4));
  const { month, day } = region.taxYearStart;
  const start = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return localDate.slice(0, 10) >= start ? year : year - 1;
}

/** "2026" for calendar tax years, "2026/27" (UK) or "2026–27" (Australia) otherwise. */
export function taxYearLabel(startYear: number, region: Region): string {
  if (region.taxYearStart.month === 1 && region.taxYearStart.day === 1) return String(startYear);
  const next = String((startYear + 1) % 100).padStart(2, '0');
  return region.code === 'GB' ? `${startYear}/${next}` : `${startYear}–${next}`;
}

export function currentTaxYear(region: Region, today: Date = new Date()): number {
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return taxYearOf(iso, region);
}

// ─── Rates and deductions ───────────────────────────────────────────────────

/** The rate period in force on `localDate`, or null before the first known one. */
export function ratePeriodFor(localDate: string, region: Region): RatePeriod | null {
  const day = localDate.slice(0, 10);
  let match: RatePeriod | null = null;
  for (const period of region.rates) {
    if (period.from <= day) match = period;
    else break;
  }
  return match;
}

/** The earliest date MileMint has a rate for in this region. */
export function earliestDate(region: Region): string {
  return region.rates[0].from;
}

/** Part of a trip's business distance priced at one rate. */
export type DeductionPart = { period: RatePeriod; tier: number; units: number; rate: number };

/**
 * How `units` more business distance is priced when `already` units have
 * been driven this tax year: tiers apply to the year's running total, not to
 * each trip, so one trip can straddle two rates.
 */
function tieredParts(period: RatePeriod, already: number, units: number): DeductionPart[] {
  const parts: DeductionPart[] = [];
  const to = already + units;
  let floor = 0;
  period.tiers.forEach((tier, index) => {
    const ceiling = tier.upTo ?? Infinity;
    const start = Math.max(already, floor);
    const end = Math.min(to, ceiling);
    if (end > start) parts.push({ period, tier: index, units: end - start, rate: tier.rate });
    floor = ceiling;
  });
  return parts;
}

/** Value in tenths of a minor unit. */
function tieredValue(period: RatePeriod, already: number, units: number): number {
  return tieredParts(period, already, units).reduce((sum, part) => sum + part.units * part.rate, 0);
}

/** How each business trip's distance was priced, for reports that show the rates used. */
export function computeDeductionParts(
  trips: readonly DeductionTrip[],
  region: Region,
): Map<string, DeductionPart[]> {
  const result = new Map<string, DeductionPart[]>();
  const driven = new Map<number, number>();
  const business = trips
    .filter((trip) => trip.classification === 'business')
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const trip of business) {
    const period = ratePeriodFor(trip.localDate, region);
    const year = taxYearOf(trip.localDate, region);
    const already = driven.get(year) ?? 0;
    const units = toUnits(trip.distanceMeters, region);
    driven.set(year, already + units);
    result.set(trip.id, period ? tieredParts(period, already, units) : []);
  }
  return result;
}

/** e.g. "55p a mile, first 10,000 miles" / "25p a mile after 10,000 miles". */
export function describeTier(period: RatePeriod, tier: number, region: Region): string {
  const unit = region.unit === 'mi' ? 'mile' : 'km';
  const units = region.unit === 'mi' ? 'miles' : 'km';
  const rate = `${formatRate(period.tiers[tier].rate, region)} a ${unit}`;
  if (period.tiers.length === 1) return rate;
  const number = (n: number) => new Intl.NumberFormat(region.locale).format(n);
  const upTo = period.tiers[tier].upTo;
  const below = tier > 0 ? period.tiers[tier - 1].upTo : null;
  if (upTo !== null) return `${rate}, first ${number(upTo)} ${units}`;
  return below !== null ? `${rate} after ${number(below)} ${units}` : rate;
}

export type DeductionTrip = Pick<Trip, 'id' | 'localDate' | 'startedAt' | 'distanceMeters' | 'classification'>;

/**
 * Deduction per business trip, in minor units. Trips are taken in the order
 * they were driven, so a tier limit (10,000 miles in the UK, 5,000 km in
 * Canada and Australia) is reached by the trips that actually crossed it.
 */
export function computeDeductions(trips: readonly DeductionTrip[], region: Region): Map<string, number> {
  const result = new Map<string, number>();
  for (const [id, parts] of computeDeductionParts(trips, region)) {
    result.set(id, Math.round(parts.reduce((sum, part) => sum + part.units * part.rate, 0) / 10));
  }
  return result;
}

/**
 * What a not-yet-business trip would add if marked business, at the tier the
 * year has reached so far. An estimate for the "worth up to" nudge.
 */
export function potentialDeduction(
  trip: DeductionTrip,
  trips: readonly DeductionTrip[],
  region: Region,
): number {
  const period = ratePeriodFor(trip.localDate, region);
  if (!period) return 0;
  const year = taxYearOf(trip.localDate, region);
  const already = trips
    .filter((t) => t.classification === 'business' && t.id !== trip.id && taxYearOf(t.localDate, region) === year)
    .reduce((sum, t) => sum + toUnits(t.distanceMeters, region), 0);
  return Math.round(tieredValue(period, already, toUnits(trip.distanceMeters, region)) / 10);
}

export type TaxYearSummary = {
  taxYear: number;
  label: string;
  businessMeters: number;
  deduction: number;
  unclassifiedCount: number;
  tripCount: number;
};

export function summarizeTaxYear(
  trips: readonly DeductionTrip[],
  region: Region,
  taxYear: number,
  deductions: ReadonlyMap<string, number> = computeDeductions(trips, region),
): TaxYearSummary {
  const summary: TaxYearSummary = {
    taxYear,
    label: taxYearLabel(taxYear, region),
    businessMeters: 0,
    deduction: 0,
    unclassifiedCount: 0,
    tripCount: 0,
  };
  for (const trip of trips) {
    if (taxYearOf(trip.localDate, region) !== taxYear) continue;
    summary.tripCount += 1;
    if (trip.classification === 'unclassified') summary.unclassifiedCount += 1;
    if (trip.classification === 'business') {
      summary.businessMeters += trip.distanceMeters;
      summary.deduction += deductions.get(trip.id) ?? 0;
    }
  }
  return summary;
}
