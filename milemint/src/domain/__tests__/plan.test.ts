import { describe, expect, it } from '@jest/globals';

import { autoDrivesInMonth, lockedTripIds } from '../plan';
import type { Trip } from '../trip';

type Drive = Pick<Trip, 'id' | 'localDate' | 'startedAt' | 'source'>;

/** `count` drives in time order, four a day, ids `${prefix}0`, `${prefix}1`… */
function drives(month: string, count: number, prefix = 'd', source: Trip['source'] = 'auto'): Drive[] {
  return Array.from({ length: count }, (_, i) => {
    const day = String(Math.floor(i / 4) + 1).padStart(2, '0');
    const hour = String((i % 4) * 6).padStart(2, '0');
    return {
      id: `${prefix}${i}`,
      localDate: `${month}-${day}`,
      startedAt: `${month}-${day}T${hour}:00:00.000Z`,
      source,
    };
  });
}

describe('lockedTripIds', () => {
  it('locks nothing within the allowance', () => {
    expect(lockedTripIds(drives('2026-10', 40), false).size).toBe(0);
  });

  it('locks the drives after the allowance, keeping the earliest free', () => {
    const october = drives('2026-10', 43);
    // Newest first, as the trip list stores them: order must not matter.
    const locked = lockedTripIds([...october].reverse(), false);
    expect([...locked].sort()).toEqual(['d40', 'd41', 'd42']);
  });

  it('counts each month separately', () => {
    const trips = [...drives('2026-09', 41, 's'), ...drives('2026-10', 40, 'o')];
    expect([...lockedTripIds(trips, false)]).toEqual(['s40']);
  });

  it('never locks manual trips or counts them towards the allowance', () => {
    const trips = [...drives('2026-10', 40), ...drives('2026-10', 5, 'm', 'manual')];
    expect(lockedTripIds(trips, false).size).toBe(0);
  });

  it('unlocks everything for Pro', () => {
    expect(lockedTripIds(drives('2026-10', 100), true).size).toBe(0);
  });
});

describe('autoDrivesInMonth', () => {
  it('counts only automatic drives in that month', () => {
    const trips = [
      ...drives('2026-09', 3, 's'),
      ...drives('2026-10', 7, 'o'),
      ...drives('2026-10', 2, 'm', 'manual'),
    ];
    expect(autoDrivesInMonth(trips, '2026-10')).toBe(7);
  });
});
