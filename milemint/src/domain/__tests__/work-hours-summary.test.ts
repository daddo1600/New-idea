import { describe, expect, it } from '@jest/globals';

import { formatWorkDays, summarizeWorkHours } from '../work-hours-summary';

const NINE_TO_FIVE = [{ start: '09:00', end: '17:00' }];
const NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const name = (day: number) => NAMES[day];

describe('summarizeWorkHours', () => {
  it('gives the days and hours when every working day is the same', () => {
    const week = [[], NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, NINE_TO_FIVE, []];
    expect(summarizeWorkHours(week)).toEqual({ days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' });
  });

  it('says the hours vary when a day differs or has two spans', () => {
    const late = [{ start: '10:00', end: '18:00' }];
    expect(summarizeWorkHours([[], NINE_TO_FIVE, late, [], [], [], []])).toBe('varies');
    const split = [
      { start: '08:00', end: '12:00' },
      { start: '14:00', end: '18:00' },
    ];
    expect(summarizeWorkHours([[], split, [], [], [], [], []])).toBe('varies');
  });

  it('is null with no hours at all', () => {
    expect(summarizeWorkHours([[], [], [], [], [], [], []])).toBeNull();
  });
});

describe('formatWorkDays', () => {
  it('writes a run of days as a range, Monday first', () => {
    expect(formatWorkDays([1, 2, 3, 4, 5], name)).toBe('Mon–Fri');
    expect(formatWorkDays([0, 1, 2, 3, 4, 5, 6], name)).toBe('Mon–Sun');
    expect(formatWorkDays([4, 5, 6, 0], name)).toBe('Thu–Sun');
  });

  it('lists short or broken runs', () => {
    expect(formatWorkDays([6, 0], name)).toBe('Sat, Sun');
    expect(formatWorkDays([1, 3, 5], name)).toBe('Mon, Wed, Fri');
    expect(formatWorkDays([2], name)).toBe('Tue');
  });
});
