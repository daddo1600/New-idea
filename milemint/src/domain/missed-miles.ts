import { msg } from '../i18n/i18n';
import type { DeductionTrip } from './regions';

export type Period = 'this-week' | 'this-month' | 'last-month';

export const PERIOD_LABELS: Record<Period, string> = {
  'this-week': msg('This week'),
  'this-month': msg('This month'),
  'last-month': msg('Last month'),
};

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** First and last local date (YYYY-MM-DD) of a period. Weeks start on Monday. */
export function periodBounds(period: Period, today: Date): { start: string; end: string } {
  const y = today.getFullYear();
  const m = today.getMonth();
  if (period === 'this-month') return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
  if (period === 'last-month') return { start: iso(new Date(y, m - 1, 1)), end: iso(new Date(y, m, 0)) };
  const monday = new Date(y, m, today.getDate() - ((today.getDay() + 6) % 7));
  return { start: iso(monday), end: iso(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)) };
}

export type MissedMiles = {
  /** Business distance MileSprout logged in the period, in the region's unit. */
  logged: number;
  /** What the delivery app counted. */
  counted: number;
  /** How much more MileSprout logged (0 if it logged less). */
  extra: number;
  /** Rough value of the extra distance, in minor units, at the rate the period's business trips averaged. */
  extraValue: number;
};

/**
 * Delivery apps only count miles driven with an order on board; the drive to
 * the pickup, between orders and home again are business miles too. This
 * compares what MileSprout logged with what the app counted.
 */
export function missedMiles(
  trips: readonly DeductionTrip[],
  deductions: ReadonlyMap<string, number>,
  bounds: { start: string; end: string },
  counted: number,
  toUnits: (meters: number) => number,
): MissedMiles {
  const inPeriod = trips.filter(
    (trip) => trip.classification === 'business' && trip.localDate >= bounds.start && trip.localDate <= bounds.end,
  );
  const logged = inPeriod.reduce((sum, trip) => sum + toUnits(trip.distanceMeters), 0);
  const value = inPeriod.reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0);
  const extra = Math.max(0, logged - counted);
  return { logged, counted, extra, extraValue: logged > 0 ? Math.round((value * extra) / logged) : 0 };
}
