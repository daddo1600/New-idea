import { describe, expect, it } from '@jest/globals';

import {
  autoDrivesInMonth,
  FREE_AUTO_DRIVES_PER_MONTH as FREE,
  lockedTripIds,
  monthlyAllowance,
  REFERRAL_BONUS_DRIVES,
} from '../plan';
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
    // A real shift: 30 drives on one day.
    const shift = drives('2026-09', 30, 's').map((d, i) => ({
      ...d,
      localDate: '2026-09-12',
      startedAt: `2026-09-12T${String(8 + Math.floor(i / 3)).padStart(2, '0')}:${String((i % 3) * 20).padStart(2, '0')}:00Z`,
      shiftId: 'shift-1',
    }));
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

describe('monthlyAllowance', () => {
  it('is the free allowance with no referrals', () => {
    expect(monthlyAllowance({ redeemed: false, friendsJoined: 0 })).toBe(FREE);
  });

  it('adds 10 for joining with a friend’s code', () => {
    expect(REFERRAL_BONUS_DRIVES).toBe(10);
    expect(monthlyAllowance({ redeemed: true, friendsJoined: 0 })).toBe(FREE + 10);
  });

  it('adds 10 for every friend who joined, with no cap', () => {
    expect(monthlyAllowance({ redeemed: false, friendsJoined: 3 })).toBe(FREE + 30);
    expect(monthlyAllowance({ redeemed: true, friendsJoined: 100 })).toBe(FREE + 10 + 1000);
  });

  it('ignores a damaged count', () => {
    expect(monthlyAllowance({ redeemed: false, friendsJoined: -2 })).toBe(FREE);
    expect(monthlyAllowance({ redeemed: false, friendsJoined: Number.NaN })).toBe(FREE);
    expect(monthlyAllowance({ redeemed: false, friendsJoined: 2.7 })).toBe(FREE + 20);
  });

  it('is the limit lockedTripIds applies', () => {
    const allowance = monthlyAllowance({ redeemed: true, friendsJoined: 1 });
    const locked = lockedTripIds(drives('2026-10', allowance + 2), false, allowance);
    expect([...locked].sort()).toEqual([`d${allowance}`, `d${allowance + 1}`].sort());
  });
});

describe('a shift that is never ended', () => {
  it('counts once per day, not once forever', () => {
    const trips = Array.from({ length: 60 }, (_, i) => ({
      id: `t${i}`,
      localDate: `2026-10-${String(1 + Math.floor(i / 2)).padStart(2, '0')}`,
      startedAt: `2026-10-${String(1 + Math.floor(i / 2)).padStart(2, '0')}T${i % 2 ? '18' : '09'}:00:00Z`,
      source: 'auto' as const,
      shiftId: 'forever',
    }));
    expect(autoDrivesInMonth(trips, '2026-10')).toBe(30);
    expect(lockedTripIds(trips, false, 20).size).toBe(20);
  });
});

describe('personal drives', () => {
  type Sorted = Drive & Pick<Trip, 'classification' | 'rejoinedAt'> & { shiftId?: string | null };
  const sorted = (list: Drive[], classification: Trip['classification'] = 'business'): Sorted[] =>
    list.map((d) => ({ ...d, classification }));
  const sortAs = (list: Sorted[], id: string, classification: Trip['classification'], rejoinedAt?: string) =>
    list.map((d) => (d.id === id ? { ...d, classification, rejoinedAt: rejoinedAt ?? d.rejoinedAt } : d));
  /** A drive at an exact time on a day of October 2026. */
  const at = (id: string, day: number, hour: number, extra: Partial<Sorted> = {}): Sorted => {
    const date = `2026-10-${String(day).padStart(2, '0')}`;
    return {
      id,
      localDate: date,
      startedAt: `${date}T${String(hour).padStart(2, '0')}:00:00.000Z`,
      source: 'auto',
      classification: 'business',
      ...extra,
    };
  };

  it('never count and are never locked, even late in the month', () => {
    const personal = [0, 1, 2, 3, 4].map((i) => at(`p${i}`, 31, i, { classification: 'personal' }));
    const trips = [...sorted(drives('2026-10', FREE)), ...personal];
    expect(lockedTripIds(trips, false).size).toBe(0);
    expect(autoDrivesInMonth(trips, '2026-10')).toBe(FREE);
  });

  it('unsorted drives count until they are sorted', () => {
    const trips = sorted(drives('2026-10', FREE + 1), 'unclassified');
    expect([...lockedTripIds(trips, false)]).toEqual([`d${FREE}`]);
    expect(autoDrivesInMonth(trips, '2026-10')).toBe(FREE + 1);
    expect(autoDrivesInMonth(sortAs(trips, 'd0', 'personal'), '2026-10')).toBe(FREE);
  });

  it('sorting a drive personal mid-month frees a slot, earliest locked drive first', () => {
    const month = sorted(drives('2026-10', FREE + 2));
    expect([...lockedTripIds(month, false)].sort()).toEqual([`d${FREE}`, `d${FREE + 1}`]);
    const after = sortAs(month, 'd10', 'personal');
    // Earliest-first is kept: the earlier of the two locked drives gets the slot.
    expect([...lockedTripIds(after, false)]).toEqual([`d${FREE + 1}`]);
    expect(autoDrivesInMonth(after, '2026-10')).toBe(FREE + 1);
  });

  it('a later locked business drive becomes unlocked when an earlier one goes personal', () => {
    const month = sorted(drives('2026-10', FREE + 1));
    const locked = `d${FREE}`;
    expect(lockedTripIds(month, false).has(locked)).toBe(true);
    expect(lockedTripIds(sortAs(month, 'd0', 'personal'), false).has(locked)).toBe(false);
  });

  it('frees a slot in its own month only', () => {
    const trips = [...sorted(drives('2026-09', FREE + 1, 's')), ...sorted(drives('2026-10', FREE + 1, 'o'))];
    expect([...lockedTripIds(sortAs(trips, 'o3', 'personal'), false)]).toEqual([`s${FREE}`]);
  });

  it('sorted back to business with a free slot, it keeps its value', () => {
    const month = sorted(drives('2026-10', 10));
    const back = sortAs(sortAs(month, 'd2', 'personal'), 'd2', 'business', '2026-10-20T12:00:00.000Z');
    expect(lockedTripIds(back, false).size).toBe(0);
  });

  it('sorted back to business when the month is full, only that drive waits for Pro', () => {
    // A full month plus one: d40 is locked.
    const month = sorted(drives('2026-10', FREE + 1));
    // d5 goes personal: d40 takes its slot and shows its value.
    const personal = sortAs(month, 'd5', 'personal');
    expect(lockedTripIds(personal, false).size).toBe(0);
    // d5 back to business: it rejoins at the back of the queue, so d40 keeps its value.
    const back = sortAs(personal, 'd5', 'business', '2026-10-28T09:00:00.000Z');
    expect([...lockedTripIds(back, false)]).toEqual(['d5']);
    // Another drive going personal frees a slot for it again.
    expect(lockedTripIds(sortAs(back, 'd7', 'personal'), false).size).toBe(0);
  });

  it('never moves another drive from unlocked to locked, however drives are sorted', () => {
    let trips = sorted(drives('2026-10', FREE + 6));
    let unlocked = new Set(trips.map((d) => d.id).filter((id) => !lockedTripIds(trips, false).has(id)));
    let clock = Date.parse('2026-10-31T00:00:00Z');
    // A fixed pseudo-random sequence of sorts.
    for (let step = 0; step < 200; step++) {
      const trip = trips[(step * 37 + 11) % trips.length];
      const next = trip.classification === 'personal' ? 'business' : 'personal';
      clock += 60_000;
      trips = sortAs(trips, trip.id, next, next === 'business' ? new Date(clock).toISOString() : undefined);
      const locked = lockedTripIds(trips, false);
      for (const id of unlocked) {
        // Only the drive just sorted back may wait for Pro.
        if (id !== trip.id) expect(locked.has(id)).toBe(false);
      }
      unlocked = new Set(trips.filter((d) => d.classification !== 'personal' && !locked.has(d.id)).map((d) => d.id));
      const counting = trips.filter((d) => d.classification !== 'personal').length;
      expect(locked.size).toBe(Math.max(0, counting - FREE));
    }
  });

  it('a shift day keeps its place when its first drive goes personal', () => {
    const shift = [0, 3, 6].map((hour, i) => at(`sh${i}`, 1, hour, { shiftId: 'shift-1' }));
    // A drive between the shift's first and second, then the rest of the month up to the limit.
    const between = at('x0', 1, 1);
    const rest = Array.from({ length: FREE - 2 }, (_, i) => at(`r${i}`, 10 + Math.floor(i / 4), (i % 4) * 5));
    const late = at('late', 30, 9);
    const trips = [...shift, between, ...rest, late];
    expect([...lockedTripIds(trips, false)]).toEqual(['late']);
    // Without its first drive the shift day would queue behind x0 and could lose its slot.
    expect([...lockedTripIds(sortAs(trips, 'sh0', 'personal'), false)]).toEqual(['late']);
  });

  it('a shift day all sorted personal stops counting, and rejoins when one is sorted back', () => {
    const shift = [8, 9, 10].map((hour, i) => at(`sh${i}`, 1, hour, { shiftId: 's', classification: 'personal' }));
    const rest = Array.from({ length: FREE }, (_, i) => at(`r${i}`, 10 + Math.floor(i / 4), (i % 4) * 5));
    const trips = [...shift, ...rest];
    expect(autoDrivesInMonth(trips, '2026-10')).toBe(FREE);
    expect(lockedTripIds(trips, false).size).toBe(0);
    const back = sortAs(trips, 'sh1', 'business', '2026-10-25T00:00:00.000Z');
    expect(autoDrivesInMonth(back, '2026-10')).toBe(FREE + 1);
    expect([...lockedTripIds(back, false)]).toEqual(['sh1']);
  });

  it('ignores a rejoin time before the drive itself', () => {
    const month = sorted(drives('2026-10', FREE + 1));
    const odd = sortAs(month, 'd3', 'business', '2020-01-01T00:00:00.000Z');
    expect([...lockedTripIds(odd, false)]).toEqual([`d${FREE}`]);
  });
});
