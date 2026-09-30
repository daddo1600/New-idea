import { METERS_PER_MILE, type Trip, type VehicleType } from './trip';

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
  /** Shown on the country picker; a literal so it doesn't depend on Intl support. */
  currencySymbol: string;
  /** For number and currency formatting. */
  locale: string;
  unit: DistanceUnit;
  /** Tax office, as users know it. */
  authority: string;
  /** First day of the tax year. */
  taxYearStart: { month: number; day: number };
  /** Rates for cars and vans. */
  rates: readonly RatePeriod[];
  /**
   * Rates for two-wheelers, where the tax office has one. Missing means the
   * official per-distance rate only covers cars: those trips are logged but
   * valued at nothing (see `vehicleNote`).
   */
  otherVehicleRates: Partial<Record<Exclude<VehicleType, 'car'>, readonly RatePeriod[]>>;
  /** Shown when a two-wheeler has no official rate here. */
  vehicleNote: string | null;
  /** One line on how the figure is worked out, shown when choosing a region. */
  rule: string;
  /** Anything the user should know about what the figure means. */
  caveat: string | null;
  /** How the printed report is worded for this tax office. */
  report: {
    summaryHeading: string;
    /** Where the figures go, in the tax office's own terms. */
    guidance: readonly string[];
    /** CRA needs total distance driven (odometer) to work out the business-use share. */
    askForOdometer: boolean;
  };
};

const METERS_PER_KM = 1000;

export const REGIONS: Record<RegionCode, Region> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
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
    otherVehicleRates: {},
    vehicleNote: 'The IRS standard mileage rate is for cars, vans and pickups. Motorbike and bicycle trips are logged for your records; claim their actual costs instead.',
    report: {
      summaryHeading: 'Vehicle use (Schedule C, Part IV)',
      guidance: [
        'Self-employed: enter business, commuting and other miles on Schedule C, Part IV (lines 44a–44c) and the deduction on line 9, Car and truck expenses, using the standard mileage rate.',
        'Parking fees and tolls for business trips can be deducted on top of the standard mileage rate.',
        'The IRS asks for a record made at or near the time of each trip, showing the date, where you went, the business purpose and the miles.',
      ],
      askForOdometer: false,
    },
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
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
    otherVehicleRates: {
      motorbike: [{ from: '2011-04-06', tiers: [{ upTo: null, rate: 240 }] }],
      bicycle: [{ from: '2011-04-06', tiers: [{ upTo: null, rate: 200 }] }],
    },
    vehicleNote: null,
    report: {
      summaryHeading: 'Business mileage (HMRC simplified expenses)',
      guidance: [
        'Self-employed: this total is your simplified expenses figure for business mileage. Include it in Car, van and travel expenses on your Self Assessment return.',
        'Employees: you can claim Mileage Allowance Relief on the difference between this total and any mileage allowance your employer paid you.',
        'Ordinary commuting between home and your permanent workplace is not business mileage.',
      ],
      askForOdometer: false,
    },
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$',
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
    otherVehicleRates: {},
    vehicleNote: 'The CRA per-km rate is for cars. Motorbike and bicycle trips are logged for your records; claim their actual costs instead.',
    report: {
      summaryHeading: 'Business use of your vehicle',
      guidance: [
        'Self-employed (T2125): claim your actual vehicle costs multiplied by your business-use share, which is business kilometres divided by total kilometres driven in the year. Record your odometer readings below to work it out.',
        'Employees reimbursed at CRA’s per-km rate: the figure above is what your employer can pay you tax-free.',
        'CRA asks for a logbook showing the date, destination, purpose and kilometres of each business trip, plus your odometer readings at the start and end of the year.',
      ],
      askForOdometer: true,
    },
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: '$',
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
    otherVehicleRates: {},
    vehicleNote: 'The ATO cents per km method is for cars only. Motorbike and bicycle trips are logged for your records; claim their actual costs instead.',
    report: {
      summaryHeading: 'Work-related car use (cents per km method)',
      guidance: [
        'Individuals: enter the deduction as Work-related car expenses (D1) using the cents per km method. Sole traders: include it with your business motor vehicle expenses.',
        'You can claim up to 5,000 business kilometres per car each income year. This report assumes one car.',
        'You don’t need a logbook for this method, but the ATO may ask how you worked out your kilometres. This trip log shows that.',
      ],
      askForOdometer: false,
    },
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

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** First and last day (YYYY-MM-DD) of the tax year starting in `startYear`. */
export function taxYearBounds(startYear: number, region: Region): { start: string; end: string } {
  const { month, day } = region.taxYearStart;
  const start = iso(startYear, month, day);
  const next = new Date(Date.UTC(startYear + 1, month - 1, day - 1));
  return { start, end: next.toISOString().slice(0, 10) };
}

/** A date as people in the region write it: 9/30/2026, 30/09/2026 or 2026-09-30 (Canada). */
export function formatDate(localDate: string, region: Region): string {
  const [y, m, d] = localDate.slice(0, 10).split('-');
  if (region.code === 'US') return `${Number(m)}/${Number(d)}/${y}`;
  if (region.code === 'CA') return `${y}-${m}-${d}`;
  return `${d}/${m}/${y}`;
}

/** e.g. "1 Jul 2026" (or "Jul 1, 2026" in the US). */
export function formatLongDate(localDate: string, region: Region): string {
  const [y, m, d] = localDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(region.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * The part of a tax year a rate period covers, e.g. "1 Jan – 30 Jun 2026".
 * Null when the period covers the whole tax year.
 */
export function periodRangeInTaxYear(
  period: RatePeriod,
  startYear: number,
  region: Region,
  vehicle: VehicleType = 'car',
): string | null {
  const bounds = taxYearBounds(startYear, region);
  const periods = ratesFor(region, vehicle) ?? [];
  const index = periods.indexOf(period);
  const nextFrom = index >= 0 ? periods[index + 1]?.from : undefined;
  const start = period.from > bounds.start ? period.from : bounds.start;
  let end = bounds.end;
  if (nextFrom && nextFrom <= bounds.end) {
    const [y, m, d] = nextFrom.split('-').map(Number);
    end = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
  }
  if (start === bounds.start && end === bounds.end) return null;
  return `${formatLongDate(start, region)} – ${formatLongDate(end, region)}`;
}

export function currentTaxYear(region: Region, today: Date = new Date()): number {
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return taxYearOf(iso, region);
}

// ─── Rates and deductions ───────────────────────────────────────────────────

/** The rate period in force on `localDate`, or null before the first known one. */
export function ratePeriodFor(
  localDate: string,
  region: Region,
  vehicle: VehicleType = 'car',
): RatePeriod | null {
  const periods = ratesFor(region, vehicle);
  if (!periods) return null;
  const day = localDate.slice(0, 10);
  let match: RatePeriod | null = null;
  for (const period of periods) {
    if (period.from <= day) match = period;
    else break;
  }
  return match;
}

/** The rate periods for a vehicle, or null when the tax office has no per-distance rate for it. */
export function ratesFor(region: Region, vehicle: VehicleType = 'car'): readonly RatePeriod[] | null {
  return vehicle === 'car' ? region.rates : (region.otherVehicleRates[vehicle] ?? null);
}

/** One line on how a vehicle's trips are valued here, e.g. "HMRC rate for motorbikes: 24p a mile". */
export function vehicleRule(region: Region, vehicle: VehicleType): string {
  if (vehicle === 'car') return region.rule;
  const periods = ratesFor(region, vehicle);
  if (!periods) return region.vehicleNote ?? `${region.authority} has no per-${region.unit === 'mi' ? 'mile' : 'km'} rate for this vehicle.`;
  const latest = periods[periods.length - 1];
  const kind = vehicle === 'motorbike' ? 'motorbikes and scooters' : 'bicycles';
  return `${region.authority} rate for ${kind}: ${describeTier(latest, 0, region)}`;
}

/** The earliest date MileMint has a rate for in this region. */
export function earliestDate(region: Region): string {
  return region.rates[0].from;
}

/** Part of a trip's business distance priced at one rate. */
export type DeductionPart = {
  period: RatePeriod;
  tier: number;
  units: number;
  rate: number;
  vehicle: VehicleType;
};

/**
 * How `units` more business distance is priced when `already` units have
 * been driven this tax year: tiers apply to the year's running total, not to
 * each trip, so one trip can straddle two rates.
 */
function tieredParts(
  period: RatePeriod,
  already: number,
  units: number,
  vehicle: VehicleType = 'car',
): DeductionPart[] {
  const parts: DeductionPart[] = [];
  const to = already + units;
  let floor = 0;
  period.tiers.forEach((tier, index) => {
    const ceiling = tier.upTo ?? Infinity;
    const start = Math.max(already, floor);
    const end = Math.min(to, ceiling);
    if (end > start) parts.push({ period, tier: index, units: end - start, rate: tier.rate, vehicle });
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
  // Running totals per tax year and vehicle: the UK's 10,000-mile threshold counts cars and vans only.
  const driven = new Map<string, number>();
  const business = trips
    .filter((trip) => trip.classification === 'business')
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const trip of business) {
    const vehicle = trip.vehicle ?? 'car';
    const period = ratePeriodFor(trip.localDate, region, vehicle);
    const key = `${taxYearOf(trip.localDate, region)}:${vehicle}`;
    const already = driven.get(key) ?? 0;
    const units = toUnits(trip.distanceMeters, region);
    driven.set(key, already + units);
    result.set(trip.id, period ? tieredParts(period, already, units, vehicle) : []);
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
  if (period.tiers[tier].rate === 0 && below !== null) {
    return `Over ${number(below)} ${units}: not claimable (${region.authority} limit)`;
  }
  if (upTo !== null) return `${rate}, first ${number(upTo)} ${units}`;
  return below !== null ? `${rate} after ${number(below)} ${units}` : rate;
}

export type DeductionTrip = Pick<Trip, 'id' | 'localDate' | 'startedAt' | 'distanceMeters' | 'classification'> & {
  /** Cars when missing. */
  vehicle?: VehicleType;
};

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
  const vehicle = trip.vehicle ?? 'car';
  const period = ratePeriodFor(trip.localDate, region, vehicle);
  if (!period) return 0;
  const year = taxYearOf(trip.localDate, region);
  const already = trips
    .filter(
      (t) =>
        t.classification === 'business' &&
        t.id !== trip.id &&
        (t.vehicle ?? 'car') === vehicle &&
        taxYearOf(t.localDate, region) === year,
    )
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
