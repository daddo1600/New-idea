import { describe, expect, it } from '@jest/globals';

import { missedMiles, periodBounds } from '../missed-miles';

describe('periodBounds', () => {
  const wed = new Date(2026, 8, 30); // Wed 30 Sep 2026
  it('weeks run Monday to Sunday', () => {
    expect(periodBounds('this-week', wed)).toEqual({ start: '2026-09-28', end: '2026-10-04' });
  });
  it('months, including last month', () => {
    expect(periodBounds('this-month', wed)).toEqual({ start: '2026-09-01', end: '2026-09-30' });
    expect(periodBounds('last-month', wed)).toEqual({ start: '2026-08-01', end: '2026-08-31' });
  });
});

describe('missedMiles', () => {
  const trip = (id: string, localDate: string, miles: number, classification = 'business') => ({
    id,
    localDate,
    startedAt: `${localDate}T12:00:00.000Z`,
    distanceMeters: miles,
    classification: classification as 'business',
  });
  const identity = (m: number) => m;

  it('counts business miles in the period and values the extra proportionally', () => {
    const trips = [trip('a', '2026-09-02', 600), trip('b', '2026-09-20', 400), trip('c', '2026-10-01', 999)];
    const values = new Map([
      ['a', 33000],
      ['b', 22000],
    ]);
    const result = missedMiles(trips, values, { start: '2026-09-01', end: '2026-09-30' }, 700, identity);
    expect(result).toEqual({ logged: 1000, counted: 700, extra: 300, extraValue: 16500 });
  });

  it('never reports negative extra', () => {
    const result = missedMiles([trip('a', '2026-09-02', 100)], new Map(), { start: '2026-09-01', end: '2026-09-30' }, 150, identity);
    expect(result.extra).toBe(0);
  });
});
