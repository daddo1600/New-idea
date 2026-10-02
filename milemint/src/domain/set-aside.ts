import { costsAdded, type DeductionTrip, type Region, type RegionCode, taxYearOf } from './regions';
import { toLocalIsoDate, tripCostsMinor } from './trip';

/**
 * Tax set-aside: how much of a week's earnings to put aside for the tax bill.
 * The user enters what they earned that week (every platform together); the
 * week's mileage deduction comes off first, and a flat share of what's left
 * is the amount to put aside:
 *
 *   set-aside = max(0, earnings − the week's mileage deduction) × rate
 *
 * An estimate to help people save, never advice: the real bill depends on
 * their total income, allowances and everything else on their return.
 *
 * Weeks run Monday to Sunday and are keyed by their Monday (YYYY-MM-DD). A
 * week belongs to the tax year its Monday is in.
 */

/**
 * The starting rate per region, a plain rule of thumb for the self-employed
 * (income tax plus National Insurance, self-employment tax or CPP), which the
 * user can change.
 */
export const DEFAULT_SET_ASIDE_PERCENT: Record<RegionCode, number> = { GB: 25, US: 30, CA: 25, AU: 25 };

/** Rates a user can set, in whole percent. */
export const MIN_SET_ASIDE_PERCENT = 1;
export const MAX_SET_ASIDE_PERCENT = 90;

/** The most one week's earnings can be (minor units), to catch a typo. */
export const MAX_WEEKLY_EARNINGS_MINOR = 10_000_000;

/** Whether a rate can be saved: a whole number from MIN to MAX_SET_ASIDE_PERCENT. */
export function isValidSetAsidePercent(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_SET_ASIDE_PERCENT &&
    value <= MAX_SET_ASIDE_PERCENT
  );
}

/** The rate in use: the user's own, or the region's default. */
export function setAsidePercent(saved: number | null, region: Pick<Region, 'code'>): number {
  return saved !== null && isValidSetAsidePercent(saved) ? saved : DEFAULT_SET_ASIDE_PERCENT[region.code];
}

const utc = (localDate: string) => {
  const [y, m, d] = localDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** A day plus `days` (negative for earlier), YYYY-MM-DD. */
export function addDays(localDate: string, days: number): string {
  const date = utc(localDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The Monday of the week a day is in. */
export function weekStartOf(localDate: string): string {
  const weekday = utc(localDate).getUTCDay();
  return addDays(localDate, -((weekday + 6) % 7));
}

/** The set-aside for one week, in minor units: never below zero, rounded to the penny or cent. */
export function setAsideAmount(earningsMinor: number, deductionMinor: number, percent: number): number {
  return Math.round((Math.max(0, earningsMinor - deductionMinor) * percent) / 100);
}

/**
 * Each week's mileage deduction (keyed by Monday): business drives at the
 * region's rates as worked out for the whole tax year (`deductions`, so tiers
 * count), plus parking and tolls where they're added, as in the year total.
 */
export function deductionsByWeek(
  trips: readonly DeductionTrip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  employee = false,
): Map<string, number> {
  const withCosts = costsAdded(region, employee);
  const weeks = new Map<string, number>();
  for (const trip of trips) {
    if (trip.classification !== 'business') continue;
    const week = weekStartOf(trip.localDate);
    const value = (deductions.get(trip.id) ?? 0) + (withCosts ? tripCostsMinor(trip) : 0);
    weeks.set(week, (weeks.get(week) ?? 0) + value);
  }
  return weeks;
}

export type SetAsideWeek = {
  /** Monday, YYYY-MM-DD. */
  weekStart: string;
  /** What the user entered for the week, minor units; null when nothing was. */
  earnings: number | null;
  /** The week's mileage deduction, minor units. */
  deduction: number;
  /** What to put aside; null without earnings. */
  setAside: number | null;
};

/** The figures for each of `weekStarts`. */
export function setAsideWeeks(
  weekStarts: readonly string[],
  earnings: ReadonlyMap<string, number>,
  byWeek: ReadonlyMap<string, number>,
  percent: number,
): SetAsideWeek[] {
  return weekStarts.map((weekStart) => {
    const entered = earnings.get(weekStart) ?? null;
    const deduction = byWeek.get(weekStart) ?? 0;
    return {
      weekStart,
      earnings: entered,
      deduction,
      setAside: entered === null ? null : setAsideAmount(entered, deduction, percent),
    };
  });
}

/** The Mondays of the last `count` weeks, oldest first, ending with the week `today` is in. */
export function recentWeekStarts(today: string, count: number): string[] {
  const current = weekStartOf(today);
  return Array.from({ length: count }, (_, i) => addDays(current, -7 * (count - 1 - i)));
}

/** The set-aside for every week with earnings in a tax year (by the week's Monday), added up. */
export function taxYearSetAside(
  earnings: ReadonlyMap<string, number>,
  byWeek: ReadonlyMap<string, number>,
  percent: number,
  region: Region,
  taxYear: number,
): number {
  let total = 0;
  for (const [weekStart, amount] of earnings) {
    if (taxYearOf(weekStart, region) !== taxYear) continue;
    total += setAsideAmount(amount, byWeek.get(weekStart) ?? 0, percent);
  }
  return total;
}

/** The latest week before `weekStart` with earnings, for "Same as last week"; null when there's none. */
export function previousEntry(
  earnings: ReadonlyMap<string, number>,
  weekStart: string,
): { weekStart: string; amount: number } | null {
  let best: { weekStart: string; amount: number } | null = null;
  for (const [week, amount] of earnings) {
    if (week < weekStart && (!best || week > best.weekStart)) best = { weekStart: week, amount };
  }
  return best;
}

/**
 * The week the Monday-morning reminder on `monday` is about (the week just
 * ended) and what to put aside for it; amount null when its earnings
 * haven't been entered.
 */
export function reminderWeek(
  monday: string,
  earnings: ReadonlyMap<string, number>,
  byWeek: ReadonlyMap<string, number>,
  percent: number,
): { weekStart: string; amount: number | null } {
  const weekStart = addDays(weekStartOf(monday), -7);
  const entered = earnings.get(weekStart);
  return {
    weekStart,
    amount: entered === undefined ? null : setAsideAmount(entered, byWeek.get(weekStart) ?? 0, percent),
  };
}

/** For the reminder: the amount to put aside for the week before a given Monday (null when its earnings aren't entered). */
export function amountBeforeMonday(
  earnings: ReadonlyMap<string, number>,
  byWeek: ReadonlyMap<string, number>,
  percent: number,
): (monday: Date) => number | null {
  return (monday) => reminderWeek(toLocalIsoDate(monday), earnings, byWeek, percent).amount;
}

/** The next Monday at `hour`:00 local time: today if it's Monday and that time is still ahead. */
export function nextMondayAt(now: Date, hour: number): Date {
  const days = (8 - now.getDay()) % 7;
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour);
  if (at <= now) at.setDate(at.getDate() + 7);
  return at;
}
