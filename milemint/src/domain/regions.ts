import { getLanguage, msg, t, translate } from '../i18n/i18n';
import { METERS_PER_MILE, tripCostsMinor, type Trip, type VehicleType } from './trip';

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
 *
 * Parking and tolls on business drives (`costs`, checked Oct 2026):
 *   US  Deductible on top of the standard mileage rate; not parking at the
 *       regular workplace or commuting tolls (IRS Topic 510, Pub 463).
 *   GB  Self-employed: allowable on top of simplified-expenses mileage, as is
 *       the Congestion Charge on a business journey; fines never are (GOV.UK
 *       simplified expenses, BIM). Employees: Mileage Allowance Relief only
 *       covers the vehicle, so parking and tolls are a separate expense
 *       (EIM31820), usually repaid by the employer: never added to MAR.
 *   CA  Recorded and listed apart, not added: the per-km figure is CRA's
 *       employer allowance, and the self-employed claim actual costs, where
 *       business parking is deducted in full (T2125 Chart A) and tolls aren't
 *       spelled out. Left to the user's accountant.
 *   AU  Not covered by cents per km; claimed separately as work-related
 *       travel expenses (D2), so added on top, and shown apart in the report.
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
  /**
   * The distance limits apply to each vehicle separately (the ATO's 5,000 km
   * is per car), rather than to all of the user's driving together.
   */
  limitsPerVehicle: boolean;
  /** One line on how the figure is worked out, shown when choosing a region. */
  rule: string;
  /** Anything the user should know about what the figure means. */
  caveat: string | null;
  /** Parking and tolls on business drives (see the sources above). */
  costs: {
    /** Added to the deduction on top of the mileage figure; otherwise recorded and listed apart. */
    onTop: boolean;
    /** One line on what counts, shown where they're entered. */
    note: string;
    /** UK employees: never part of Mileage Allowance Relief, so listed apart, with this line instead. */
    employeeNote: string | null;
  };
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

/** Translates a line: `t` (the current language) on screen, `inEnglish` for the report. */
export type Translator = (key: string, params?: Record<string, string | number>) => string;

/** The PDF and CSV reports go to the tax office, so their wording stays in English. */
export const inEnglish: Translator = (key, params) => translate('en', key, params);

export const REGIONS: Record<RegionCode, Region> = {
  US: {
    code: 'US',
    name: msg('United States'),
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
    rule: msg('IRS standard mileage rate: 76¢ a mile from July 2026'),
    caveat: null,
    costs: {
      onTop: true,
      note: msg('Business parking and tolls are deductible on top of the mileage rate. Parking at your regular workplace isn’t, and fines never are.'),
      employeeNote: null,
    },
    otherVehicleRates: {},
    vehicleNote: msg('The IRS standard mileage rate is for cars, vans and pickups. Motorbike and bicycle trips are logged for your records; claim their actual costs instead.'),
    limitsPerVehicle: false,
    report: {
      summaryHeading: msg('Vehicle use (Schedule C, Part IV)'),
      guidance: [
        msg('Self-employed: enter business, commuting and other miles on Schedule C, Part IV (lines 44a–44c) and the deduction on line 9, Car and truck expenses, using the standard mileage rate.'),
        msg('Parking fees and tolls for business trips can be deducted on top of the standard mileage rate.'),
        msg('Parking at your regular place of work and tolls on your commute are not deductible.'),
        msg('The IRS asks for a record made at or near the time of each trip, showing the date, where you went, the business purpose and the miles.'),
      ],
      askForOdometer: false,
    },
  },
  GB: {
    code: 'GB',
    name: msg('United Kingdom'),
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
    rule: msg('HMRC mileage rate: 55p a mile for the first 10,000 business miles, then 25p'),
    caveat: null,
    costs: {
      onTop: true,
      note: msg('Self-employed: business parking, tolls and Congestion Charge or ULEZ charges are claimed on top of the mileage rate. Parking and traffic fines never are.'),
      employeeNote: msg('Parking and tolls aren’t part of Mileage Allowance Relief. Claim them from your employer, or as a separate employment expense if they don’t repay them. Fines never count.'),
    },
    otherVehicleRates: {
      motorbike: [{ from: '2011-04-06', tiers: [{ upTo: null, rate: 240 }] }],
      bicycle: [{ from: '2011-04-06', tiers: [{ upTo: null, rate: 200 }] }],
    },
    vehicleNote: null,
    limitsPerVehicle: false,
    report: {
      summaryHeading: msg('Business mileage (HMRC simplified expenses)'),
      guidance: [
        msg('Self-employed: this total is your simplified expenses figure for business mileage. Include it in Car, van and travel expenses on your Self Assessment return.'),
        msg('Employees: you can claim Mileage Allowance Relief on the difference between this total and any mileage allowance your employer paid you.'),
        msg('Self-employed: parking, tolls and Congestion Charge or ULEZ charges on business journeys are added on top of the mileage figure, in the same Car, van and travel expenses box. Parking and traffic fines are never allowable.'),
        msg('Employees: parking and tolls are not part of Mileage Allowance Relief. They are listed separately, to claim from your employer or as a separate employment expense.'),
        msg('Ordinary commuting between home and your permanent workplace is not business mileage.'),
      ],
      askForOdometer: false,
    },
  },
  CA: {
    code: 'CA',
    name: msg('Canada'),
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
    rule: msg('CRA per-km rate: 73¢ for the first 5,000 km, then 67¢'),
    costs: {
      onTop: false,
      note: msg('Recorded apart from the per-km figure. Self-employed: business parking is usually claimed in full. Ask your accountant about tolls.'),
      employeeNote: null,
    },
    caveat:
      msg('This is CRA’s reimbursement rate for employees. If you’re self-employed, CRA usually wants your actual car costs, so treat the figure as an estimate.'),
    otherVehicleRates: {},
    vehicleNote: msg('The CRA per-km rate is for cars. Motorbike and bicycle trips are logged for your records; claim their actual costs instead.'),
    limitsPerVehicle: false,
    report: {
      summaryHeading: msg('Business use of your vehicle'),
      guidance: [
        msg('Self-employed (T2125): claim your actual vehicle costs multiplied by your business-use share, which is business kilometres divided by total kilometres driven in the year. Record your odometer readings below to work it out.'),
        msg('Employees reimbursed at CRA’s per-km rate: the figure above is what your employer can pay you tax-free.'),
        msg('CRA asks for a logbook showing the date, destination, purpose and kilometres of each business trip, plus your odometer readings at the start and end of the year.'),
        msg('Parking and tolls are listed separately and not added to the per-km figure. Self-employed: business parking fees are deducted in full on T2125, not reduced to your business-use share. Ask your accountant whether your tolls can be claimed.'),
      ],
      askForOdometer: true,
    },
  },
  AU: {
    code: 'AU',
    name: msg('Australia'),
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
    rule: msg('ATO cents per km method: 91c a km, up to 5,000 km per car a year'),
    caveat: null,
    costs: {
      onTop: true,
      note: msg('Work parking and tolls aren’t covered by cents per km, so they’re claimed separately. Not parking at your regular workplace, or tolls on the way there.'),
      employeeNote: null,
    },
    otherVehicleRates: {},
    vehicleNote: msg('The ATO cents per km method is for cars only. Motorbike and bicycle trips are logged for your records; claim their actual costs instead.'),
    limitsPerVehicle: true,
    report: {
      summaryHeading: msg('Work-related car use (cents per km method)'),
      guidance: [
        msg('Individuals: enter the deduction as Work-related car expenses (D1) using the cents per km method. Sole traders: include it with your business motor vehicle expenses.'),
        msg('You can claim up to 5,000 business kilometres per car each income year. This report assumes one car.'),
        msg('You don’t need a logbook for this method, but the ATO may ask how you worked out your kilometres. This trip log shows that.'),
        msg('Parking fees and tolls for work trips aren’t covered by the cents per km rate. Claim them separately: individuals as Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace, or tolls between home and work.'),
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

export function formatDistance(meters: number, region: Region, options: { whole?: boolean } = {}): string {
  // `whole` for rounded figures ("about 13,000 km"), where ".0" would look oddly precise.
  const digits = options.whole ? 0 : 1;
  const value = new Intl.NumberFormat(region.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
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
/**
 * The locale for dates and times on screen: the country's own English, or the
 * app's language with the country's conventions ("es-US", "pa-CA").
 */
export function displayLocale(region: Region): string {
  const lang = getLanguage();
  if (lang === 'en') return region.locale;
  // A language tag can already carry a country ("pt-BR"): swap it for this one ("pt-GB"),
  // since "pt-BR-GB" isn't a valid tag and Intl throws on it. A script stays ("zh-Hans-AU").
  const parts = lang.split('-').filter((part) => !/^[A-Z]{2}$/.test(part));
  const tag = [...parts, region.code].join('-');
  try {
    return Intl.getCanonicalLocales(tag)[0] ?? region.locale;
  } catch {
    return region.locale;
  }
}

export function formatLongDate(localDate: string, region: Region): string {
  const [y, m, d] = localDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(displayLocale(region), {
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

/**
 * One line on how a vehicle's trips are valued here, e.g. "HMRC rate for
 * motorbikes and scooters: 24p a mile", in the current language.
 */
export function vehicleRule(region: Region, vehicle: VehicleType): string {
  if (vehicle === 'car') return t(region.rule);
  const periods = ratesFor(region, vehicle);
  if (!periods) {
    if (region.vehicleNote) return t(region.vehicleNote);
    return region.unit === 'mi'
      ? t('{{authority}} has no per-mile rate for this vehicle.', { authority: region.authority })
      : t('{{authority}} has no per-km rate for this vehicle.', { authority: region.authority });
  }
  const rate = describeTier(periods[periods.length - 1], 0, region);
  return vehicle === 'motorbike'
    ? t('{{authority}} rate for motorbikes and scooters: {{rate}}', { authority: region.authority, rate })
    : t('{{authority}} rate for bicycles: {{rate}}', { authority: region.authority, rate });
}

/** The earliest date MileSprout has a rate for in this region. */
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
  /**
   * Minor units (pence, cents) this part contributes. The year's total is
   * rate × distance rounded once, shared out to rate bands, vehicles and
   * then parts by largest remainder (see `computeDeductionParts`), so the
   * amounts shown per trip add up exactly to every total built from them.
   */
  amount: number;
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
    if (end > start) parts.push({ period, tier: index, units: end - start, rate: tier.rate, vehicle, amount: 0 });
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
    const own = region.limitsPerVehicle ? (trip.vehicleId ?? '') : '';
    const key = `${taxYearOf(trip.localDate, region)}:${vehicle}:${own}`;
    const already = driven.get(key) ?? 0;
    const units = toUnits(trip.distanceMeters, region);
    driven.set(key, already + units);
    result.set(trip.id, period ? tieredParts(period, already, units, vehicle) : []);
  }
  allocateAmounts(
    business.map((trip) => ({
      year: taxYearOf(trip.localDate, region),
      own: region.limitsPerVehicle ? (trip.vehicleId ?? '') : '',
      parts: result.get(trip.id) ?? [],
    })),
  );
  return result;
}

/** Exact value of a part in minor units, unrounded. */
const exactMinor = (part: Pick<DeductionPart, 'units' | 'rate'>) => (part.units * part.rate) / 10;

/**
 * Drops floating-point noise (a 5,000 km cap summed from many trips comes to
 * 454999.99999999994), so an amount that is exactly whole stays whole.
 */
const snap = (value: number) => Math.round(value * 1e6) / 1e6;

/**
 * Shares `total` whole minor units out over `values` (unrounded, minor units)
 * by largest remainder: each gets its value rounded down or up, the biggest
 * remainders (the earliest on a tie) get the extra units, and the shares add
 * up to `total` exactly.
 */
export function largestRemainder(total: number, values: readonly number[]): number[] {
  const shares = values.map((value) => Math.floor(snap(value)));
  const order = values
    .map((value, index) => ({ index, remainder: snap(value) - shares[index] }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  let left = total - shares.reduce((sum, share) => sum + share, 0);
  for (let i = 0; left > 0 && order.length > 0; i = (i + 1) % order.length, left -= 1) shares[order[i].index] += 1;
  for (let i = order.length - 1; left < 0 && order.length > 0; i = (i - 1 + order.length) % order.length) {
    if (shares[order[i].index] > 0) {
      shares[order[i].index] -= 1;
      left += 1;
    }
  }
  return shares;
}

/** Groups items by key, keeping first-seen order. */
function groupBy<T>(items: readonly T[], key: (item: T) => string): T[][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(key(item));
    if (group) group.push(item);
    else groups.set(key(item), [item]);
  }
  return [...groups.values()];
}

/**
 * Fills in each part's `amount`. Per tax year, the deduction is the exact
 * rate × distance rounded once; that is shared out to rate bands (vehicle
 * type, rate period, tier), within a band to each vehicle (where limits are
 * per vehicle), and then to the parts in the order they were driven. So a
 * year's total, a rate band's row and a car's capped amount are each the
 * unrounded figure rounded down or up (never past a cap that is whole), and
 * trip amounts always add up to them.
 */
function allocateAmounts(trips: readonly { year: number; own: string; parts: DeductionPart[] }[]): void {
  const entries = trips.flatMap(({ year, own, parts }) => parts.map((part) => ({ year, own, part })));
  const exact = (items: readonly { part: DeductionPart }[]) => items.reduce((sum, item) => sum + exactMinor(item.part), 0);
  const share = <T extends { part: DeductionPart }>(total: number, groups: T[][], next: (total: number, group: T[]) => void) => {
    const totals = largestRemainder(total, groups.map(exact));
    groups.forEach((group, index) => next(totals[index], group));
  };
  for (const year of groupBy(entries, (entry) => String(entry.year))) {
    const bands = groupBy(year, ({ part }) => `${part.vehicle}#${part.period.from}#${part.tier}`);
    share(Math.round(snap(exact(year))), bands, (bandTotal, band) => {
      share(bandTotal, groupBy(band, (entry) => entry.own), (ownTotal, own) => {
        share(ownTotal, own.map((entry) => [entry]), (amount, [entry]) => {
          entry.part.amount = amount;
        });
      });
    });
  }
}

/**
 * e.g. "55p a mile, first 10,000 miles" / "25p a mile after 10,000 miles".
 * In the current language; the report passes `inEnglish`.
 */
export function describeTier(period: RatePeriod, tier: number, region: Region, tr: Translator = t): string {
  const mi = region.unit === 'mi';
  const amount = formatRate(period.tiers[tier].rate, region);
  const rate = mi ? tr('{{rate}} a mile', { rate: amount }) : tr('{{rate}} a km', { rate: amount });
  if (period.tiers.length === 1) return rate;
  const number = (n: number) => new Intl.NumberFormat(region.locale).format(n);
  const upTo = period.tiers[tier].upTo;
  const below = tier > 0 ? period.tiers[tier - 1].upTo : null;
  if (period.tiers[tier].rate === 0 && below !== null) {
    const params = { distance: number(below), authority: region.authority };
    return mi
      ? tr('Over {{distance}} miles: not claimable ({{authority}} limit)', params)
      : tr('Over {{distance}} km: not claimable ({{authority}} limit)', params);
  }
  if (upTo !== null) {
    const params = { rate, distance: number(upTo) };
    return mi ? tr('{{rate}}, first {{distance}} miles', params) : tr('{{rate}}, first {{distance}} km', params);
  }
  if (below === null) return rate;
  const params = { rate, distance: number(below) };
  return mi ? tr('{{rate}} after {{distance}} miles', params) : tr('{{rate}} after {{distance}} km', params);
}

export type DeductionTrip = Pick<
  Trip,
  'id' | 'localDate' | 'startedAt' | 'distanceMeters' | 'classification' | 'parkingMinor' | 'tollsMinor'
> & {
  /** Cars when missing. */
  vehicle?: VehicleType;
  /** Which of the user's vehicles, where limits are per vehicle. */
  vehicleId?: string | null;
};

/**
 * Deduction per business trip, in minor units. Trips are taken in the order
 * they were driven, so a tier limit (10,000 miles in the UK, 5,000 km in
 * Canada and Australia) is reached by the trips that actually crossed it.
 *
 * Not each trip rounded on its own: a year of 0.5-mile trips at 45p would
 * come to 23p each, £2.45 more than 45p × the miles over 500 of them. The
 * year is rounded once and shared out (see `allocateAmounts`), so a year's
 * trips add up to exactly rate × distance rounded once, and a rate band's or
 * (in Australia) a car's trips to their exact figure rounded down or up.
 */
export function computeDeductions(trips: readonly DeductionTrip[], region: Region): Map<string, number> {
  const result = new Map<string, number>();
  for (const [id, parts] of computeDeductionParts(trips, region)) {
    result.set(id, parts.reduce((sum, part) => sum + part.amount, 0));
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
        (!region.limitsPerVehicle || (t.vehicleId ?? null) === (trip.vehicleId ?? null)) &&
        taxYearOf(t.localDate, region) === year,
    )
    .reduce((sum, t) => sum + toUnits(t.distanceMeters, region), 0);
  return Math.round(tieredValue(period, already, toUnits(trip.distanceMeters, region)) / 10);
}

/**
 * `potentialDeduction` for many trips against the same list (each row of the
 * home list, every drive waiting for Pro). The business distance so far is
 * added up once per tax year and vehicle, in the same order, rather than
 * once per trip, so each value is exactly what `potentialDeduction` gives.
 */
export function potentialDeductions(
  trips: readonly DeductionTrip[],
  region: Region,
): (trip: DeductionTrip) => number {
  let totals: Map<string, number> | null = null;
  const business = new Set<string>();
  const keyOf = (year: number, vehicle: VehicleType, vehicleId: string | null) =>
    `${year}|${vehicle}|${!region.limitsPerVehicle ? '' : vehicleId === null ? 'none' : `id:${vehicleId}`}`;
  return (trip) => {
    if (!totals) {
      totals = new Map();
      for (const t of trips) {
        if (t.classification !== 'business') continue;
        business.add(t.id);
        const key = keyOf(taxYearOf(t.localDate, region), t.vehicle ?? 'car', t.vehicleId ?? null);
        totals.set(key, (totals.get(key) ?? 0) + toUnits(t.distanceMeters, region));
      }
    }
    // A business trip in the list is left out of its own year so far: worked out on its own.
    if (business.has(trip.id)) return potentialDeduction(trip, trips, region);
    const vehicle = trip.vehicle ?? 'car';
    const period = ratePeriodFor(trip.localDate, region, vehicle);
    if (!period) return 0;
    const already = totals.get(keyOf(taxYearOf(trip.localDate, region), vehicle, trip.vehicleId ?? null)) ?? 0;
    return Math.round(tieredValue(period, already, toUnits(trip.distanceMeters, region)) / 10);
  };
}

/**
 * Whether parking and tolls on business drives are added to the deduction:
 * where the tax office lets them go on top of the mileage figure, and never
 * to a UK employee's Mileage Allowance Relief. Otherwise they're recorded and
 * shown apart ("ask your accountant").
 */
export function costsAdded(region: Region, employee = false): boolean {
  return region.costs.onTop && !(employee && region.costs.employeeNote !== null);
}

/** The line on what parking and tolls count for here, for the user's situation (English: show with t). */
export function costsNote(region: Region, employee = false): string {
  return employee && region.costs.employeeNote !== null ? region.costs.employeeNote : region.costs.note;
}

export type TaxYearSummary = {
  taxYear: number;
  label: string;
  businessMeters: number;
  /** The mileage figure: business distance at the official rates. */
  deduction: number;
  /** Parking and tolls entered on the year's business drives, minor units. */
  costs: number;
  /** Whether `costs` is part of `total` (see costsAdded), or only recorded. */
  costsAdded: boolean;
  /** The deduction, plus parking and tolls where they count. */
  total: number;
  unclassifiedCount: number;
  tripCount: number;
};

export function summarizeTaxYear(
  trips: readonly DeductionTrip[],
  region: Region,
  taxYear: number,
  deductions: ReadonlyMap<string, number> = computeDeductions(trips, region),
  options: { employee?: boolean } = {},
): TaxYearSummary {
  const summary: TaxYearSummary = {
    taxYear,
    label: taxYearLabel(taxYear, region),
    businessMeters: 0,
    deduction: 0,
    costs: 0,
    costsAdded: costsAdded(region, options.employee),
    total: 0,
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
      summary.costs += tripCostsMinor(trip);
    }
  }
  summary.total = summary.deduction + (summary.costsAdded ? summary.costs : 0);
  return summary;
}
