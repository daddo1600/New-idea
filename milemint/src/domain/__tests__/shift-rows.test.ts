import { describe, expect, it } from '@jest/globals';

import { lockedTripIds } from '../plan';
import { homeItems, itemKey, offShiftKind, shiftGroups } from '../shift-rows';
import { toLocalIsoDate, type Trip } from '../trip';

let n = 0;
function trip(startedAt: string, extra: Partial<Trip> = {}): Trip {
  const start = new Date(startedAt);
  return {
    id: `t${n++}`,
    startedAt: start.toISOString(),
    localDate: toLocalIsoDate(start),
    endedAt: new Date(start.getTime() + 10 * 60_000).toISOString(),
    startLabel: 'A',
    endLabel: 'B',
    distanceMeters: 2_000,
    classification: 'business',
    purpose: 'Deliveries',
    source: 'auto',
    createdAt: startedAt,
    startPlaceId: null,
    endPlaceId: null,
    autoReason: 'work-hours',
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
    ...extra,
  };
}

/** Local times, as the phone shows them. */
const at = (day: number, hour: number, minute = 0) => new Date(2026, 8, day, hour, minute).toISOString();

describe('the shift is the row', () => {
  const shift = { id: 's1', startedAt: at(30, 17, 30), endedAt: at(30, 21, 49) };
  const legs = [
    trip(at(30, 17, 34), { shiftId: 's1' }),
    trip(at(30, 18, 31), { shiftId: 's1', classification: 'unclassified', autoReason: null, purpose: '' }),
    trip(at(30, 21, 36), { shiftId: 's1' }),
  ];
  const home = trip(at(30, 21, 49), { offShiftId: 's1', classification: 'unclassified', autoReason: null, purpose: '' });
  const morning = trip(at(30, 9, 0), { classification: 'personal', autoReason: null, purpose: '' });
  const today = trip(at(1 + 30, 8, 0));
  const trips = [today, home, ...legs, morning];

  it('groups a shift’s drives into one row with its totals', () => {
    const [group] = shiftGroups(trips, [shift]);
    expect(group).toMatchObject({
      shiftId: 's1',
      date: '2026-09-30',
      startedAt: shift.startedAt,
      endedAt: shift.endedAt,
      distanceMeters: 6_000,
      unsortedCount: 1,
      earningsMinor: null,
    });
    expect(group.legs.map((leg) => leg.id)).toEqual(legs.map((leg) => leg.id));
  });

  it('lists the shift where its drives were, closed or open to its legs; drives outside shifts as before', () => {
    const closed = homeItems(trips, [shift], new Set());
    expect(closed.map(itemKey)).toEqual([today.id, home.id, 'shift:s1', morning.id]);
    const open = homeItems(trips, [shift], new Set(['s1']));
    expect(open.map((item) => item.kind)).toEqual(['trip', 'trip', 'shift', 'leg', 'leg', 'leg', 'trip']);
    expect(open[5]).toMatchObject({ kind: 'leg', last: true });
  });

  it('a night shift across midnight is one row, dated the day it started', () => {
    const night = { id: 'n', startedAt: at(28, 21, 0), endedAt: at(29, 0, 41) };
    const drives = [trip(at(28, 21, 6), { shiftId: 'n' }), trip(at(29, 0, 20), { shiftId: 'n' })];
    expect(drives[1].localDate).toBe('2026-09-29');
    const items = homeItems([...drives].reverse(), [night], new Set());
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'shift', group: { date: '2026-09-28', endedAt: night.endedAt } });
  });

  it('a running shift has no end yet; one whose record is gone still groups its drives', () => {
    const running = shiftGroups(legs, [{ ...shift, endedAt: null }]);
    expect(running[0].endedAt).toBeNull();
    const orphan = shiftGroups(legs, []);
    expect(orphan[0]).toMatchObject({ shift: null, startedAt: legs[0].startedAt, date: '2026-09-30' });
  });

  it('says where a drive cut off a shift falls', () => {
    expect(offShiftKind(home, [shift])).toBe('after');
    expect(offShiftKind(trip(at(30, 19, 0), { offShiftId: 's1' }), [shift])).toBe('pause');
    expect(offShiftKind(morning, [shift])).toBeNull();
  });

  it('free plan: the shift is one drive; the drive home cut off it is a drive of its own', () => {
    const many = Array.from({ length: 40 }, (_, i) => trip(at(2, 8, i)));
    const locked = lockedTripIds([...many, ...legs, home], false, 41);
    // 40 drives + the shift = 41: the drive home is the 42nd, so it's the one locked.
    expect([...locked]).toEqual([home.id]);
  });
});
