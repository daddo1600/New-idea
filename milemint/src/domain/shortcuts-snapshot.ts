import {
  computeDeductions,
  costsAdded,
  formatDistance,
  formatMoney,
  toUnits,
  type DeductionTrip,
  type Region,
  type Translator,
} from './regions';
import { weekStartOf } from './set-aside';
import { toLocalIsoDate, tripCostsMinor } from './trip';

/**
 * What Siri and the Shortcuts app answer "Miles today" and "Miles this week"
 * with, without opening MileSprout. The app keeps this small summary in the
 * App Group it shares with its App Intents (modules/siri-shortcuts), because
 * the intents can't open the encrypted database. Every line is already in
 * the app's language, the region's unit and currency, so the Swift side only
 * picks one.
 *
 * Kept in step with native/siri-shortcuts/MileSproutShortcuts.swift
 * (`ShortcutsSnapshot`): bump SHORTCUTS_SNAPSHOT_VERSION if a field changes
 * meaning, and the intents ignore a snapshot from a version they don't know.
 */
export const SHORTCUTS_SNAPSHOT_VERSION = 1;

/** Work driving over a stretch of days. */
export type ShortcutsFigures = {
  /** Work (business) drives. */
  drives: number;
  meters: number;
  /** What they're worth to claim, minor units (pence, cents). */
  valueMinor: number;
  /** e.g. "38.2 mi". */
  distance: string;
  /** e.g. "£21.01". */
  value: string;
  /** Said by Siri: "You’ve driven 38.2 mi for work today, worth about £21.01." or "No work drives yet today." */
  spoken: string;
  /** Under the distance on the card: "Worth about £21.01". */
  worth: string;
};

export type ShortcutsSnapshot = {
  version: typeof SHORTCUTS_SNAPSHOT_VERSION;
  /** Siri & Shortcuts is a Pro feature: without Pro, every intent says so and does nothing else. */
  isPro: boolean;
  /** ms since 1970. */
  updatedAt: number;
  /** The phone's date (YYYY-MM-DD) when this was worked out. A later day means nothing driven since. */
  today: string;
  /** The Monday of that week (YYYY-MM-DD). A later Monday means a new week, nothing driven yet. */
  weekStart: string;
  todayFigures: ShortcutsFigures;
  weekFigures: ShortcutsFigures;
  /** What the intents say when the snapshot's day or week is over (no drives since): nothing yet. */
  todayEmpty: ShortcutsFigures;
  weekEmpty: ShortcutsFigures;
  text: {
    /** Card titles. */
    today: string;
    thisWeek: string;
    /** Said when Siri is asked without Pro. */
    proOnly: string;
    /** Said as the app opens to start or end the shift. */
    starting: string;
    ending: string;
  };
};

export type ShortcutsInput = {
  /** Every trip (the deduction tiers count the whole tax year). */
  trips: readonly DeductionTrip[];
  region: Region;
  now: Date;
  isPro: boolean;
  /** A UK employee claiming Mileage Allowance Relief (domain/mar): worth the relief, not the deduction. */
  employee?: boolean;
  /** The employer's rate, tenths of a penny a mile (employees only). */
  employerRate?: number;
};

/**
 * What work drives on days `from`..`to` (inclusive) are worth: the deduction
 * at the region's rates (tiers counted over the year), plus parking and tolls
 * where they count; for a UK employee, the relief left after what the
 * employer paid, as the home card counts it.
 */
function figuresFor(
  trips: readonly DeductionTrip[],
  deductions: ReadonlyMap<string, number>,
  from: string,
  to: string,
  input: ShortcutsInput,
): { drives: number; meters: number; valueMinor: number } {
  let drives = 0;
  let meters = 0;
  let deduction = 0;
  let costs = 0;
  for (const trip of trips) {
    if (trip.classification !== 'business' || trip.localDate < from || trip.localDate > to) continue;
    drives += 1;
    meters += trip.distanceMeters;
    deduction += deductions.get(trip.id) ?? 0;
    costs += tripCostsMinor(trip);
  }
  const { region, employee = false, employerRate = 0 } = input;
  if (employee) {
    const employerPaid = Math.round((toUnits(meters, region) * Math.max(0, employerRate)) / 10);
    return { drives, meters, valueMinor: Math.max(0, deduction - employerPaid) };
  }
  return { drives, meters, valueMinor: deduction + (costsAdded(region) ? costs : 0) };
}

function describe(
  figures: { drives: number; meters: number; valueMinor: number },
  period: 'today' | 'week',
  region: Region,
  t: Translator,
): ShortcutsFigures {
  const distance = formatDistance(figures.meters, region);
  const value = formatMoney(figures.valueMinor, region);
  const params = { distance, amount: value };
  let spoken: string;
  if (figures.drives === 0) {
    spoken = period === 'today' ? t('No work drives yet today.') : t('No work drives yet this week.');
  } else {
    spoken =
      period === 'today'
        ? t('You’ve driven {{distance}} for work today, worth about {{amount}}.', params)
        : t('You’ve driven {{distance}} for work this week, worth about {{amount}}.', params);
  }
  return { ...figures, distance, value, spoken, worth: t('Worth about {{amount}}', params) };
}

/**
 * The summary Siri reads from: work distance and value today and this week
 * (Monday to today, as the Money tab's weeks), in the app's language `t`.
 */
export function shortcutsSnapshot(input: ShortcutsInput, t: Translator): ShortcutsSnapshot {
  const { trips, region, now } = input;
  const today = toLocalIsoDate(now);
  const weekStart = weekStartOf(today);
  const deductions = computeDeductions(trips, region);
  const none = { drives: 0, meters: 0, valueMinor: 0 };
  return {
    version: SHORTCUTS_SNAPSHOT_VERSION,
    isPro: input.isPro,
    updatedAt: now.getTime(),
    today,
    weekStart,
    todayFigures: describe(figuresFor(trips, deductions, today, today, input), 'today', region, t),
    weekFigures: describe(figuresFor(trips, deductions, weekStart, today, input), 'week', region, t),
    todayEmpty: describe(none, 'today', region, t),
    weekEmpty: describe(none, 'week', region, t),
    text: {
      today: t('Today'),
      thisWeek: t('This week'),
      proOnly: t('Siri & Shortcuts are part of MileSprout Pro. Open MileSprout to upgrade.'),
      starting: t('Starting your shift in MileSprout.'),
      ending: t('Ending your shift in MileSprout.'),
    },
  };
}
