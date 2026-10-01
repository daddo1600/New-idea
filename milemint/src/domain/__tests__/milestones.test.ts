import { describe, expect, it } from '@jest/globals';

import { hasSortedWeek, milestoneToCelebrate, nextMilestone, reachedMilestones } from '../milestones';

const progress = (moneyMinor: number, distance: number, habits: string[] = []) => ({
  moneyMinor,
  distance,
  habits: new Set(habits) as never,
});

describe('milestones', () => {
  it('reaches money and distance steps', () => {
    const ids = reachedMilestones(progress(260_00, 1_200, ['first-trip'])).map((m) => m.id);
    expect(ids).toEqual(
      expect.arrayContaining(['money-50', 'money-100', 'money-250', 'distance-100', 'distance-500', 'distance-1000', 'first-trip']),
    );
    expect(ids).not.toContain('money-500');
  });

  it('celebrates the biggest new money milestone first, once', () => {
    const reached = reachedMilestones(progress(1_200_00, 3_000, ['first-trip']));
    expect(milestoneToCelebrate(reached, new Set())?.id).toBe('money-1000');
    const done = new Set(reached.map((m) => m.id));
    expect(milestoneToCelebrate(reached, done)).toBeNull();
  });

  it('shows progress to the next step', () => {
    expect(nextMilestone('money', 75_00)).toEqual({ threshold: 100, progress: 0.5 });
    expect(nextMilestone('distance', 30_000)).toBeNull();
  });

  it('finds a fully sorted week, ignoring the current one', () => {
    const trips = [
      { localDate: '2026-09-21', classification: 'business' },
      { localDate: '2026-09-23', classification: 'personal' },
      { localDate: '2026-09-29', classification: 'unclassified' },
    ];
    expect(hasSortedWeek(trips, '2026-09-30')).toBe(true);
    expect(hasSortedWeek([{ localDate: '2026-09-29', classification: 'business' }], '2026-09-30')).toBe(false);
  });
});
