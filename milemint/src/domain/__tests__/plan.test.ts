import { describe, expect, it } from '@jest/globals';

import { autoDrivesInMonth, FREE_AUTO_DRIVES_PER_MONTH as FREE, lockedTripIds } from '../plan';
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
    expect(lockedTripIds(drives('2026-10', FREE), false).size).toBe(0);
  });

  it('locks the drives after the allowance, keeping the earliest free', () => {
    const october = drives('2026-10', FREE + 3);
    // Newest first, as the trip list stores them: order must not matter.
    const locked = lockedTripIds([...october].reverse(), false);
    expect([...locked].sort()).toEqual([`d${FREE}`, `d${FREE + 1}`, `d${FREE + 2}`].sort());
  });

  it('counts each month separately', () => {
    const trips = [...drives('2026-09', FREE + 1, 's'), ...drives('2026-10', FREE, 'o')];
    expect([...lockedTripIds(trips, false)]).toEqual([`s${FREE}`]);
  });

  it('never locks manual trips or counts them towards the allowance', () => {
    const trips = [...drives('2026-10', FREE), ...drives('2026-10', 5, 'm', 'manual')];
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

describe('shift mode', () => {
  it('counts every drive in a shift as one', () => {
    const shift = drives('2026-09', 30, 's').map((d) => ({ ...d, shiftId: 'shift-1' }));
    const single = drives('2026-09', 39, 'd');
    expect(autoDrivesInMonth([...shift, ...single], '2026-09')).toBe(40);
    expect(lockedTripIds([...shift, ...single], false).size).toBe(0);
  });

  it('locks a whole later shift once the allowance is used', () => {
    const early = drives('2026-09', FREE, 'd');
    const late = drives('2026-09', 5, 'late').map((d) => ({
      ...d,
      localDate: '2026-09-30',
      startedAt: `2026-09-30T2${d.id.slice(4)}:00:00.000Z`,
      shiftId: 'shift-2',
    }));
    expect(lockedTripIds([...early, ...late], false)).toEqual(new Set(late.map((d) => d.id)));
  });
});
