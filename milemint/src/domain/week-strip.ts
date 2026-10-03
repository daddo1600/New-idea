import { parseClock, type WorkShift, type WorkWeek } from './classify-rules';
import { addDays, weekStartOf } from './set-aside';

/**
 * Home's "This week": Monday to Sunday, each day's work distance and money,
 * from the drives already logged. Nothing to tap or set: it fills itself in.
 * Pure, so it's unit-tested.
 */
export type WeekDay = {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** 0 = Sunday, as Date.getDay(). */
  weekday: number;
  meters: number;
  /** Minor units (pence, cents). */
  money: number;
  isToday: boolean;
  isFuture: boolean;
  /** A day with work hours set (null when work hours are off). */
  isWorkDay: boolean | null;
};

export type Week = { days: WeekDay[]; meters: number; money: number };

type WeekTrip = { id: string; localDate: string; distanceMeters: number; classification: string };

export function buildWeek(
  trips: readonly WeekTrip[],
  deductions: ReadonlyMap<string, number>,
  today: string,
  workWeek: WorkWeek | null,
): Week {
  const monday = weekStartOf(today);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const weekday = (index + 1) % 7;
    return {
      date,
      weekday,
      meters: 0,
      money: 0,
      isToday: date === today,
      isFuture: date > today,
      isWorkDay: workWeek ? (workWeek[weekday] ?? []).some((shift) => shiftMinutes(shift) > 0) : null,
    };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));
  for (const trip of trips) {
    if (trip.classification !== 'business') continue;
    const day = byDate.get(trip.localDate);
    if (!day) continue;
    day.meters += trip.distanceMeters;
    day.money += deductions.get(trip.id) ?? 0;
  }
  return {
    days,
    meters: days.reduce((sum, day) => sum + day.meters, 0),
    money: days.reduce((sum, day) => sum + day.money, 0),
  };
}

function shiftMinutes(shift: WorkShift): number {
  const start = parseClock(shift.start);
  const end = parseClock(shift.end);
  if (start === null || end === null || start === end) return 0;
  return end > start ? end - start : end + 24 * 60 - start;
}

/**
 * The work-hours shift running now, if any: today's, or last night's that
 * runs past midnight. With its end, for "Work hours until 17:00".
 */
export function currentShift(week: WorkWeek, weekday: number, minutesOfDay: number): WorkShift | null {
  for (const shift of week[weekday] ?? []) {
    const start = parseClock(shift.start);
    const end = parseClock(shift.end);
    if (start === null || end === null || start === end) continue;
    if (start < end ? minutesOfDay >= start && minutesOfDay < end : minutesOfDay >= start) return shift;
  }
  for (const shift of week[(weekday + 6) % 7] ?? []) {
    const start = parseClock(shift.start);
    const end = parseClock(shift.end);
    if (start === null || end === null) continue;
    if (end < start && minutesOfDay < end) return shift;
  }
  return null;
}
