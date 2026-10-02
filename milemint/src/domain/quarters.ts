import { msg } from '../i18n/i18n';
import { emancipationDay } from './deadlines';
import {
  costsAdded,
  type DeductionTrip,
  displayLocale,
  type Region,
  type RegionCode,
  taxYearOf,
} from './regions';
import { tripCostsMinor, type Trip } from './trip';

/**
 * Quarterly figures (Pro): the tax year cut into the periods each tax office
 * asks about during the year, with the date each one is due. MileSprout
 * never sends anything: these are the figures, ready for the user (or their
 * accountant) to send.
 *
 * Sources (checked Oct 2026):
 *   GB  Making Tax Digital for Income Tax, standard update periods: 6 Apr–5 Jul,
 *       6 Jul–5 Oct, 6 Oct–5 Jan, 6 Jan–5 Apr; each update due on the 7th of
 *       the second month after (7 Aug, 7 Nov, 7 Feb, 7 May). Not moved at a
 *       weekend. (Calendar update periods, 1 Apr–30 Jun etc., can be chosen
 *       instead; not covered here.)
 *   US  Form 1040-ES estimated tax: income Jan–Mar due 15 Apr, Apr–May due
 *       15 Jun, Jun–Aug due 15 Sep, Sep–Dec due 15 Jan; on to the next
 *       business day at a weekend or a holiday (Emancipation Day in April,
 *       Martin Luther King Jr. Day in January, as with the 2023 fourth
 *       payment, due 16 Jan 2024).
 *   CA  CRA instalments: 15 Mar, 15 Jun, 15 Sep, 15 Dec, shown against the
 *       calendar quarter each falls in; next business day at a weekend.
 *   AU  Quarterly BAS: Jul–Sep due 28 Oct, Oct–Dec due 28 Feb, Jan–Mar due
 *       28 Apr, Apr–Jun due 28 Jul; next business day at a weekend.
 */

/** A month and day, with the year counted from the tax year's start (0 = the year it starts, 1 = the next). */
type YearDay = { month: number; day: number; year: 0 | 1 };

type QuarterRule = { start: YearDay; end: YearDay; due: YearDay };

const d = (month: number, day: number, year: 0 | 1 = 0): YearDay => ({ month, day, year });

/** Every region's quarters, in order through the tax year. The one table the screens and reminders read. */
export const QUARTER_RULES: Record<RegionCode, { rollsAtWeekend: boolean; quarters: readonly QuarterRule[] }> = {
  GB: {
    rollsAtWeekend: false,
    quarters: [
      { start: d(4, 6), end: d(7, 5), due: d(8, 7) },
      { start: d(7, 6), end: d(10, 5), due: d(11, 7) },
      { start: d(10, 6), end: d(1, 5, 1), due: d(2, 7, 1) },
      { start: d(1, 6, 1), end: d(4, 5, 1), due: d(5, 7, 1) },
    ],
  },
  US: {
    rollsAtWeekend: true,
    quarters: [
      { start: d(1, 1), end: d(3, 31), due: d(4, 15) },
      { start: d(4, 1), end: d(5, 31), due: d(6, 15) },
      { start: d(6, 1), end: d(8, 31), due: d(9, 15) },
      { start: d(9, 1), end: d(12, 31), due: d(1, 15, 1) },
    ],
  },
  CA: {
    rollsAtWeekend: true,
    quarters: [
      { start: d(1, 1), end: d(3, 31), due: d(3, 15) },
      { start: d(4, 1), end: d(6, 30), due: d(6, 15) },
      { start: d(7, 1), end: d(9, 30), due: d(9, 15) },
      { start: d(10, 1), end: d(12, 31), due: d(12, 15) },
    ],
  },
  AU: {
    rollsAtWeekend: true,
    quarters: [
      { start: d(7, 1), end: d(9, 30), due: d(10, 28) },
      { start: d(10, 1), end: d(12, 31), due: d(2, 28, 1) },
      { start: d(1, 1, 1), end: d(3, 31, 1), due: d(4, 28, 1) },
      { start: d(4, 1, 1), end: d(6, 30, 1), due: d(7, 28, 1) },
    ],
  },
};

/** What the quarter's figures are for, per region, in a sentence (English: show with t). Never "we submit". */
export const QUARTER_PURPOSE: Record<RegionCode, string> = {
  GB: msg('Figures ready for your MTD update'),
  US: msg('Figures ready for your estimated tax payment'),
  CA: msg('Figures ready for your tax instalment'),
  AU: msg('Figures ready for your BAS'),
};

/** The notification two weeks before a deadline ({{period}} like "6 Jul – 5 Oct", {{date}} the deadline). English: show with t. */
export const QUARTER_REMINDER: Record<RegionCode, { title: string; body: string }> = {
  GB: {
    title: msg('MTD update due in 2 weeks'),
    body: msg('Your figures for {{period}} are ready for your MTD update, due {{date}}.'),
  },
  US: {
    title: msg('Estimated tax due in 2 weeks'),
    body: msg('Your mileage for {{period}} is ready for your estimated tax payment, due {{date}}.'),
  },
  CA: {
    title: msg('Tax instalment due in 2 weeks'),
    body: msg('Your mileage for {{period}} is ready for your tax instalment, due {{date}}.'),
  },
  AU: {
    title: msg('BAS due in 2 weeks'),
    body: msg('Your figures for {{period}} are ready for your BAS, due {{date}}.'),
  },
};

export type Quarter = {
  /** 1–4 through the tax year. */
  number: number;
  /** The tax year it belongs to (the calendar year it starts in). */
  taxYear: number;
  /** First and last day, YYYY-MM-DD. */
  start: string;
  end: string;
  /** When the update or payment is due, YYYY-MM-DD. */
  due: string;
};

const iso = (y: number, m: number, day: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/** Martin Luther King Jr. Day: the third Monday of January (a federal holiday the 15 January payment can land on). */
export function mlkDay(year: number): string {
  const first = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const firstMonday = 1 + ((8 - first) % 7);
  return iso(year, 1, firstMonday + 14);
}

/**
 * The day itself, or the next business day when `rolls` and it falls at a
 * weekend or, in the US, on a holiday a deadline can meet (Emancipation Day
 * in April, Martin Luther King Jr. Day in January).
 */
function businessDay(date: string, region: Region, rolls: boolean): string {
  if (!rolls) return date;
  const [y, m, day] = date.split('-').map(Number);
  const at = new Date(Date.UTC(y, m - 1, day));
  for (;;) {
    const weekday = at.getUTCDay();
    const text = at.toISOString().slice(0, 10);
    const year = at.getUTCFullYear();
    const holiday = region.code === 'US' && (text === emancipationDay(year) || text === mlkDay(year));
    if (weekday !== 0 && weekday !== 6 && !holiday) return text;
    at.setUTCDate(at.getUTCDate() + 1);
  }
}

/** The four quarters of the tax year starting in `taxYear`, in order. */
export function quartersOf(taxYear: number, region: Region): Quarter[] {
  const rules = QUARTER_RULES[region.code];
  const date = (when: YearDay) => iso(taxYear + when.year, when.month, when.day);
  return rules.quarters.map((rule, index) => ({
    number: index + 1,
    taxYear,
    start: date(rule.start),
    end: date(rule.end),
    due: businessDay(date(rule.due), region, rules.rollsAtWeekend),
  }));
}

/** The quarter a day (YYYY-MM-DD) falls in. */
export function quarterOf(localDate: string, region: Region): Quarter {
  const day = localDate.slice(0, 10);
  const quarters = quartersOf(taxYearOf(day, region), region);
  return quarters.find((quarter) => quarter.start <= day && day <= quarter.end) ?? quarters[0];
}

/**
 * The quarters to show on `today`: the last tax year's that are still due
 * (the US January payment, the UK's May update), then this tax year's four.
 */
export function quartersToShow(region: Region, today: string): Quarter[] {
  const year = taxYearOf(today, region);
  const earlier = quartersOf(year - 1, region).filter((quarter) => quarter.due >= today);
  return [...earlier, ...quartersOf(year, region)];
}

/** Whole days from `from` to `to` (both YYYY-MM-DD): 0 on the day, negative once past. */
export function daysUntil(from: string, to: string): number {
  const utc = (text: string) => {
    const [y, m, day] = text.split('-').map(Number);
    return Date.UTC(y, m - 1, day);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

export type QuarterSummary = {
  quarter: Quarter;
  businessMeters: number;
  /** Business distance at the official rates, tiers counted across the whole tax year. */
  mileage: number;
  /** Parking and tolls on the quarter's business drives, minor units. */
  costs: number;
  /** Whether `costs` is part of `total` here (see costsAdded), or only recorded. */
  costsAdded: boolean;
  /** Mileage, plus parking and tolls where they count. */
  total: number;
  /** Business drives in the quarter. */
  businessCount: number;
  /** Drives in the quarter not yet sorted into business or personal. */
  unsortedCount: number;
  /** Business drives with no purpose, which tax offices expect on every one. */
  missingPurposeCount: number;
};

/**
 * One quarter's figures. `deductions` is each business trip's value worked out
 * over the whole tax year (computeDeductions), so a tier limit crossed in an
 * earlier quarter (the UK's 10,000 miles) is already counted: a quarter's
 * drives after it are at the lower rate.
 */
export function summarizeQuarter(
  trips: readonly (DeductionTrip & Pick<Trip, 'purpose'>)[],
  region: Region,
  quarter: Quarter,
  deductions: ReadonlyMap<string, number>,
  options: { employee?: boolean } = {},
): QuarterSummary {
  const summary: QuarterSummary = {
    quarter,
    businessMeters: 0,
    mileage: 0,
    costs: 0,
    costsAdded: costsAdded(region, options.employee),
    total: 0,
    businessCount: 0,
    unsortedCount: 0,
    missingPurposeCount: 0,
  };
  for (const trip of trips) {
    const day = trip.localDate.slice(0, 10);
    if (day < quarter.start || day > quarter.end) continue;
    if (trip.classification === 'unclassified') summary.unsortedCount += 1;
    if (trip.classification !== 'business') continue;
    summary.businessCount += 1;
    summary.businessMeters += trip.distanceMeters;
    summary.mileage += deductions.get(trip.id) ?? 0;
    summary.costs += tripCostsMinor(trip);
    if (!trip.purpose.trim()) summary.missingPurposeCount += 1;
  }
  summary.total = summary.mileage + (summary.costsAdded ? summary.costs : 0);
  return summary;
}

/** Reminders go out this many days before each deadline. */
export const QUARTER_REMINDER_DAYS = 14;

/** The reminder date (YYYY-MM-DD) for a quarter: two weeks before it's due. */
export function quarterReminderDate(quarter: Quarter): string {
  const [y, m, day] = quarter.due.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day - QUARTER_REMINDER_DAYS)).toISOString().slice(0, 10);
}

/** The next `count` quarters whose reminder is still ahead on `today` (the reminder day counts until `hour`). */
export function upcomingQuarterReminders(region: Region, now: Date, hour: number, count = 4): Quarter[] {
  const today = iso(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const year = taxYearOf(today, region);
  return [...quartersOf(year - 1, region), ...quartersOf(year, region), ...quartersOf(year + 1, region)]
    .filter((quarter) => {
      const date = quarterReminderDate(quarter);
      return date > today || (date === today && now.getHours() < hour);
    })
    .slice(0, count);
}

/** A day without the year, e.g. "6 Jul" ("Jul 6" in the US), in the app's language with the country's conventions. */
export function formatDayMonth(localDate: string, region: Region): string {
  const [y, m, day] = localDate.slice(0, 10).split('-').map(Number);
  const locale = displayLocale(region);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', timeZone: 'UTC' };
  try {
    return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString(locale === 'en-CA' ? 'en-GB' : locale, options);
  } catch {
    return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-GB', options);
  }
}

/** A quarter's days, e.g. "6 Jul – 5 Oct". */
export function formatQuarterRange(quarter: Quarter, region: Region): string {
  return `${formatDayMonth(quarter.start, region)} – ${formatDayMonth(quarter.end, region)}`;
}
