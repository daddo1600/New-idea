/**
 * Milestones: pats on the back for money claimed back, distance logged and
 * good habits. Each is celebrated once, the first time it's reached.
 */

import { msg } from '../i18n/i18n';

export type MilestoneKind = 'money' | 'distance' | 'habit';

export type Milestone = {
  id: string;
  kind: MilestoneKind;
  /** Major currency units (money) or the region's distance unit (distance); 1 for habits. */
  threshold: number;
  emoji: string;
};

/** Money back, in pounds / dollars: real amounts for anyone who drives for work. */
export const MONEY_STEPS = [50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000] as const;
/** Business distance, in miles or kilometres. */
export const DISTANCE_STEPS = [100, 500, 1_000, 2_500, 5_000, 10_000, 25_000] as const;

export const HABITS = {
  'first-trip': { emoji: '🚗', title: msg('First trip logged'), message: msg('MileSprout logs your drives for you. Just drive.') },
  'first-shift': { emoji: '📦', title: msg('First shift done'), message: msg('Every drive in it counted as work.') },
  'sorted-week': {
    emoji: '✅',
    title: msg('A fully sorted week'),
    message: msg('Every drive sorted. Tax time just got easier.'),
  },
  'first-report': {
    emoji: '📄',
    title: msg('First report exported'),
    message: msg('Your mileage log is ready for your tax return.'),
  },
} as const;
export type HabitId = keyof typeof HABITS;

export const MILESTONES: readonly Milestone[] = [
  ...MONEY_STEPS.map((threshold) => ({ id: `money-${threshold}`, kind: 'money' as const, threshold, emoji: '💰' })),
  ...DISTANCE_STEPS.map((threshold) => ({
    id: `distance-${threshold}`,
    kind: 'distance' as const,
    threshold,
    emoji: '🛣️',
  })),
  ...(Object.keys(HABITS) as HabitId[]).map((id) => ({
    id,
    kind: 'habit' as const,
    threshold: 1,
    emoji: HABITS[id].emoji,
  })),
];

export type Progress = {
  /** Business deductions found so far, all years, in minor units (pence, cents). */
  moneyMinor: number;
  /** Business distance logged so far, all years, in the region's unit. */
  distance: number;
  habits: ReadonlySet<HabitId>;
};

/** Every milestone the progress has reached. */
export function reachedMilestones(progress: Progress): Milestone[] {
  return MILESTONES.filter((m) =>
    m.kind === 'money'
      ? progress.moneyMinor >= m.threshold * 100
      : m.kind === 'distance'
        ? progress.distance >= m.threshold
        : progress.habits.has(m.id as HabitId),
  );
}

/**
 * Which newly reached milestone to celebrate now: the biggest money one first
 * (that's the one that matters), then distance, then a habit. Everything
 * newly reached is marked as celebrated at once, so a long-time user updating
 * the app gets one pat on the back, not ten in a row.
 */
export function milestoneToCelebrate(reached: readonly Milestone[], celebrated: ReadonlySet<string>): Milestone | null {
  const fresh = reached.filter((m) => !celebrated.has(m.id));
  const rank = (m: Milestone) => (m.kind === 'money' ? 3 : m.kind === 'distance' ? 2 : 1) * 1e9 + m.threshold;
  return fresh.sort((a, b) => rank(b) - rank(a))[0] ?? null;
}

/** The next milestone of a kind and how far along the way to it, 0–1. */
export function nextMilestone(kind: 'money' | 'distance', value: number): { threshold: number; progress: number } | null {
  const steps: readonly number[] = kind === 'money' ? MONEY_STEPS : DISTANCE_STEPS;
  const target = (n: number) => (kind === 'money' ? n * 100 : n);
  const index = steps.findIndex((step) => value < target(step));
  if (index === -1) return null;
  const previous = index === 0 ? 0 : target(steps[index - 1]);
  return { threshold: steps[index], progress: (value - previous) / (target(steps[index]) - previous) };
}

/** A week (Monday start) where every drive was sorted, finished before `today`. Dates are YYYY-MM-DD. */
export function hasSortedWeek(
  trips: readonly { localDate: string; classification: string }[],
  today: string,
): boolean {
  const weekOf = (date: string) => {
    const [y, m, d] = date.split('-').map(Number);
    const day = new Date(Date.UTC(y, m - 1, d));
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    return day.toISOString().slice(0, 10);
  };
  const current = weekOf(today);
  const weeks = new Map<string, boolean>();
  for (const trip of trips) {
    const week = weekOf(trip.localDate);
    // Only weeks that are over count (not this one, nor a future one).
    if (week >= current) continue;
    weeks.set(week, (weeks.get(week) ?? true) && trip.classification !== 'unclassified');
  }
  return [...weeks.values()].some(Boolean);
}
