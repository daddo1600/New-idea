import type { WorkWeek } from '@/domain/classify-rules';

/** Weekdays in the order people read a work week: Monday first (0 is Sunday, as in WorkWeek). */
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

/**
 * The work hours in one line for home's first screen: the days and the hours,
 * when every working day has the same single span ("Mon–Fri 9:00–17:00");
 * 'varies' when they differ; null when no day has hours.
 */
export type WorkHoursSummary = { days: readonly number[]; start: string; end: string } | 'varies' | null;

export function summarizeWorkHours(week: WorkWeek): WorkHoursSummary {
  const days = MONDAY_FIRST.filter((day) => (week[day]?.length ?? 0) > 0);
  if (days.length === 0) return null;
  const [first] = week[days[0]];
  const same = days.every(
    (day) => week[day].length === 1 && week[day][0].start === first.start && week[day][0].end === first.end,
  );
  return same ? { days, start: first.start, end: first.end } : 'varies';
}

/**
 * The days as short names: a run of three or more as "Mon–Fri", otherwise
 * listed ("Sat, Sun"). `name` gives a weekday's short name (0 is Sunday).
 */
export function formatWorkDays(days: readonly number[], name: (day: number) => string): string {
  const positions = days.map((day) => MONDAY_FIRST.indexOf(day)).sort((a, b) => a - b);
  const run = positions.every((position, i) => i === 0 || position === positions[i - 1] + 1);
  const ordered = positions.map((position) => MONDAY_FIRST[position]);
  if (run && ordered.length >= 3) return `${name(ordered[0])}–${name(ordered[ordered.length - 1])}`;
  return ordered.map(name).join(', ');
}
