/**
 * The opening's big number. In the first weeks the real tax-year total is
 * tiny (one short drive: £1.09), which says nothing about what MileSprout is
 * worth, so until there's a month to show it leads with a month instead:
 * their own pace once a week of driving shows it beats a typical month, else
 * what a typical month of work driving is worth. Their real total stays
 * underneath. Pure, so it's unit-tested.
 */
export type LaunchHeadline =
  | { kind: 'year'; amount: number }
  | { kind: 'pace'; amount: number }
  | { kind: 'typical'; amount: number };

const DAY_MS = 24 * 60 * 60 * 1000;
/** Days of driving before their own pace says anything. */
export const PACE_AFTER_DAYS = 7;
/** After this, the real total leads, as it always did. */
export const EARLY_DAYS = 30;
const DAYS_PER_MONTH = 365.25 / 12;

export function launchHeadline(input: {
  /** The tax year's total so far, in minor units. */
  total: number;
  /** When the first total was seen (ISO); null for totals kept before this was recorded. */
  since: string | null;
  /** What a typical month of work driving is worth, in minor units. */
  typicalMonth: number;
  now: Date;
}): LaunchHeadline {
  const { total, since, typicalMonth, now } = input;
  const started = since ? Date.parse(since) : NaN;
  const days = Number.isNaN(started) ? 0 : Math.max(0, (now.getTime() - started) / DAY_MS);
  // A month in, or a month's worth found already: their own total says it best.
  if (days >= EARLY_DAYS || total >= typicalMonth) return { kind: 'year', amount: total };
  const pace = days >= PACE_AFTER_DAYS ? Math.round((total / days) * DAYS_PER_MONTH) : 0;
  return pace >= typicalMonth ? { kind: 'pace', amount: pace } : { kind: 'typical', amount: typicalMonth };
}
