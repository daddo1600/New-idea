import { describe, expect, it } from '@jest/globals';

import { buildWeek, currentShift } from '../week-strip';

const NINE_TO_FIVE = [{ start: '09:00', end: '17:00' }];
const weekdays = [[], NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, []];

describe('buildWeek', () => {
  // 7 October 2026 is a Wednesday.
  const today = '2026-10-07';
  const trips = [
    { id: 'a', localDate: '2026-10-05', distanceMeters: 8000, classification: 'business' },
    { id: 'b', localDate: '2026-10-07', distanceMeters: 4000, classification: 'business' },
    { id: 'c', localDate: '2026-10-07', distanceMeters: 9000, classification: 'personal' },
    { id: 'd', localDate: '2026-10-04', distanceMeters: 5000, classification: 'business' }, // last Sunday
  ];
  const deductions = new Map([
    ['a', 365],
    ['b', 182],
    ['c', 400],
    ['d', 230],
  ]);

  it('runs Monday to Sunday, with only this week’s work drives', () => {
    const week = buildWeek(trips, deductions, today, null);
    expect(week.days.map((day) => day.date)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
    expect(week.days.map((day) => day.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(week.days[0]).toMatchObject({ meters: 8000, money: 365, isToday: false, isFuture: false });
    expect(week.days[2]).toMatchObject({ meters: 4000, money: 182, isToday: true });
    expect(week.days[3].isFuture).toBe(true);
    expect(week).toMatchObject({ meters: 12_000, money: 547 });
  });

  it('marks work days when work hours are on', () => {
    expect(buildWeek([], new Map(), today, null).days[0].isWorkDay).toBeNull();
    const week = buildWeek([], new Map(), today, weekdays);
    expect(week.days.map((day) => day.isWorkDay)).toEqual([true, true, true, true, true, false, false]);
  });
});

describe('currentShift', () => {
  it('finds today’s shift, or last night’s past midnight', () => {
    expect(currentShift(weekdays, 3, 10 * 60)).toEqual(NINE_TO_FIVE[0]);
    expect(currentShift(weekdays, 3, 17 * 60)).toBeNull();
    expect(currentShift(weekdays, 0, 10 * 60)).toBeNull();
    const nights = [[], [{ start: '22:00', end: '06:00' }], [], [], [], [], []];
    expect(currentShift(nights, 1, 23 * 60)).toEqual({ start: '22:00', end: '06:00' });
    expect(currentShift(nights, 2, 5 * 60)).toEqual({ start: '22:00', end: '06:00' });
    expect(currentShift(nights, 2, 7 * 60)).toBeNull();
  });
});
