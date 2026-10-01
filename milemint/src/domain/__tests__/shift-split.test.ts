import { describe, expect, it } from '@jest/globals';

import { autoClassify } from '../auto-classify';
import { distanceMeters, type LatLng } from '../geo';
import { backdateStart, legsOf, shiftLegs, splitRoute, workSpans } from '../shift-split';
import { stepAll, INITIAL_DETECTOR_STATE, sanitizeDetectorState, type DetectedTrip, type LocationSample } from '../trip-detector';

const T0 = Date.UTC(2026, 9, 1, 17, 0);
const min = (n: number) => T0 + n * 60_000;
const iso = (ms: number) => new Date(ms).toISOString();

/** A straight drive north, one point a minute. */
function line(points: number): LatLng[] {
  return Array.from({ length: points }, (_, i) => ({ latitude: 53.8 + i * 0.005, longitude: -1.55 }));
}

describe('splitRoute', () => {
  it('cuts by the route points’ times, and the two distances add up exactly', () => {
    const route = line(11);
    const times = route.map((_, i) => min(i));
    const split = splitRoute(route, times, min(0), min(10), 5_517, min(4.5));
    expect(split.before.meters + split.after.meters).toBe(5_517);
    expect(split.before.meters).toBe(Math.round(5_517 * 0.45));
    expect(split.cut?.latitude).toBeCloseTo(53.8 + 4.5 * 0.005, 6);
    expect(split.before.route.at(-1)).toEqual(split.cut);
    expect(split.after.route[0]).toEqual(split.cut);
    expect(split.before.times.at(-1)).toBe(min(4.5));
    expect(split.after.times[0]).toBe(min(4.5));
    expect(split.after.route).toHaveLength(split.after.times.length);
  });

  it('follows the real times: a slow first half moves the cut back along the route', () => {
    const route = line(3);
    // 8 minutes for the first stretch (traffic), 2 for the second.
    const split = splitRoute(route, [min(0), min(8), min(10)], min(0), min(10), 1_000, min(8));
    expect(split.before.meters).toBe(500);
    expect(split.after.meters).toBe(500);
  });

  it('without times (older drives, saved routes) takes a steady pace', () => {
    const route = line(5);
    const split = splitRoute(route, null, min(0), min(20), 2_001, min(5));
    expect(split.before.meters + split.after.meters).toBe(2_001);
    expect(split.before.meters).toBe(500);
  });

  it('without a route (client privacy) divides the distance by time and has no cut point', () => {
    const split = splitRoute([], undefined, min(0), min(30), 9_000, min(10));
    expect(split).toMatchObject({ cut: null, before: { meters: 3_000 }, after: { meters: 6_000 } });
  });

  it('ignores times that don’t line up with the points', () => {
    const split = splitRoute(line(5), [min(0), min(1)], min(0), min(20), 4_000, min(10));
    expect(split.before.meters).toBe(2_000);
  });
});

describe('working time and legs', () => {
  const shift = { startedAt: iso(min(0)), endedAt: iso(min(240)) };

  it('a shift less its pauses', () => {
    expect(workSpans(shift, [{ startedAt: iso(min(60)), endedAt: iso(min(90)) }], min(300))).toEqual([
      { start: min(0), end: min(60) },
      { start: min(90), end: min(240) },
    ]);
    // A running pause runs to the end.
    expect(workSpans(shift, [{ startedAt: iso(min(200)), endedAt: null }], min(300))).toEqual([
      { start: min(0), end: min(200) },
    ]);
  });

  it('a drive across the end is cut there; one wholly inside stays whole', () => {
    const spans = workSpans(shift, [], min(240));
    expect(legsOf(min(230), min(250), spans)).toEqual([
      { start: min(230), end: min(240), working: true },
      { start: min(240), end: min(250), working: false },
    ]);
    expect(legsOf(min(10), min(20), spans)).toEqual([{ start: min(10), end: min(20), working: true }]);
  });

  it('a drive across a pause is cut where it began and ended', () => {
    const spans = workSpans(shift, [{ startedAt: iso(min(60)), endedAt: iso(min(90)) }], min(240));
    expect(legsOf(min(50), min(100), spans).map((leg) => leg.working)).toEqual([true, false, true]);
  });
});

describe('a detected drive in shift mode', () => {
  const shift = { id: 's1', startedAt: iso(min(-120)), endedAt: iso(min(6)) };
  // The last delivery ran straight into the drive home: one detected trip, 10 minutes.
  const route = line(11);
  const trip: DetectedTrip = {
    startedAt: min(0),
    endedAt: min(10),
    start: route[0],
    end: route[10],
    distanceMeters: 5_560,
    route,
    routeTimes: route.map((_, i) => min(i)),
    utcOffsetMin: -60,
  };

  it('is cut at the shift’s end: the delivery is work, the drive home is left to sort', () => {
    const legs = shiftLegs(trip, { shift, pauses: [], end: min(6) });
    expect(legs).toHaveLength(2);
    expect(legs[0]).toMatchObject({ shiftId: 's1', offShiftId: null, drive: { startedAt: min(0), endedAt: min(6) } });
    expect(legs[1]).toMatchObject({ shiftId: null, offShiftId: 's1', drive: { startedAt: min(6), endedAt: min(10) } });
    expect(legs[0].drive.distanceMeters + legs[1].drive.distanceMeters).toBe(5_560);
    expect(legs[0].drive.end).toEqual(legs[1].drive.start);
    expect(legs[1].drive.end).toEqual(trip.end);
    const sorted = legs.map((leg) =>
      autoClassify({
        inShift: leg.shiftId !== null,
        offShift: leg.offShiftId !== null,
        // A learned route would call the drive home personal or business: it's still left to the user.
        suggestion: { classification: 'business', reason: 'learned-route', purpose: 'Deliveries' },
        shiftMode: true,
        defaultBusiness: true,
      }),
    );
    expect(sorted.map((s) => s.classification)).toEqual(['business', 'unclassified']);
  });

  it('a running shift ends at its 16-hour mark', () => {
    const legs = shiftLegs(trip, { shift: { ...shift, endedAt: null }, pauses: [], end: min(3) });
    expect(legs.map((leg) => [leg.drive.startedAt, leg.shiftId])).toEqual([
      [min(0), 's1'],
      [min(3), null],
    ]);
  });

  it('a drive that started in the grace after the end stays whole and in the shift, as before', () => {
    expect(shiftLegs(trip, { shift: { ...shift, endedAt: iso(min(-2)) }, pauses: [], end: min(-2) })).toEqual([
      { drive: trip, shiftId: 's1', offShiftId: null },
    ]);
  });

  it('a drive started in a pause is not work', () => {
    const legs = shiftLegs(trip, {
      shift: { ...shift, endedAt: null },
      pauses: [{ startedAt: iso(min(-5)), endedAt: iso(min(4)) }],
      end: min(600),
    });
    expect(legs.map((leg) => [leg.shiftId, leg.offShiftId])).toEqual([
      [null, 's1'],
      ['s1', null],
    ]);
  });

  it('without a shift it is one drive, untouched', () => {
    expect(shiftLegs(trip, null)).toEqual([{ drive: trip, shiftId: null, offShiftId: null }]);
  });
});

describe('the detector keeps each route point’s time', () => {
  const sample = (i: number, speed = 12): LocationSample => ({
    latitude: 53.8 + i * 0.001,
    longitude: -1.55,
    accuracy: 10,
    speed,
    timestamp: T0 + i * 10_000,
  });

  it('one time per point, in order, ending at the trip’s end', () => {
    const samples: LocationSample[] = [{ ...sample(0), speed: 0 }];
    for (let i = 1; i <= 30; i++) samples.push(sample(i));
    // Parked for over 5 minutes.
    for (let j = 1; j <= 40; j++) samples.push({ ...sample(30, 0), timestamp: T0 + 300_000 + j * 10_000 });
    const { completed } = stepAll(INITIAL_DETECTOR_STATE, samples);
    expect(completed).toHaveLength(1);
    const [trip] = completed;
    expect(trip.routeTimes).toHaveLength(trip.route.length);
    expect(trip.routeTimes![0]).toBe(trip.startedAt);
    expect(trip.routeTimes!.at(-1)).toBeLessThanOrEqual(trip.endedAt);
    for (let i = 1; i < trip.routeTimes!.length; i++) expect(trip.routeTimes![i]).toBeGreaterThan(trip.routeTimes![i - 1]);
    let along = 0;
    for (let i = 1; i < trip.route.length; i++) along += distanceMeters(trip.route[i - 1], trip.route[i]);
    expect(Math.abs(along - trip.distanceMeters)).toBeLessThan(50);
  });

  it('state saved by an older version (no times) still finishes a drive, without them', () => {
    const state = sanitizeDetectorState({
      mode: 'driving',
      start: { latitude: 53.8, longitude: -1.55, timestamp: T0 },
      last: { latitude: 53.81, longitude: -1.55, timestamp: T0 + 60_000 },
      distanceM: 1_112,
      maxSpeedMps: 12,
      route: [
        { latitude: 53.8, longitude: -1.55 },
        { latitude: 53.81, longitude: -1.55 },
      ],
      stop: null,
    });
    expect(state.mode === 'driving' && state.routeTimes).toBeUndefined();
    const parked = Array.from({ length: 40 }, (_, j) => ({ ...sample(10, 0), timestamp: T0 + 70_000 + j * 10_000 }));
    const { completed } = stepAll(state, parked);
    expect(completed).toHaveLength(1);
    expect(completed[0].routeTimes).toBeUndefined();
  });

  it('times that no longer match the points (one dropped as broken) are dropped too', () => {
    const state = sanitizeDetectorState({
      mode: 'driving',
      start: { latitude: 53.8, longitude: -1.55, timestamp: T0 },
      last: { latitude: 53.81, longitude: -1.55, timestamp: T0 + 60_000 },
      distanceM: 1_112,
      maxSpeedMps: 12,
      route: [{ latitude: 53.8, longitude: -1.55 }, { latitude: Number.NaN, longitude: 0 }, { latitude: 53.81, longitude: -1.55 }],
      routeTimes: [T0, T0 + 30_000, T0 + 60_000],
      stop: null,
    });
    expect(state.mode === 'driving' && state.routeTimes).toBeUndefined();
  });
});

describe('"Start shift from 10:40?"', () => {
  const now = min(0);
  const drive = (id: string, start: number, end: number, extra: object = {}) => ({
    id,
    startedAt: iso(start),
    endedAt: iso(end),
    classification: 'unclassified',
    source: 'auto',
    shiftId: null,
    ...extra,
  });

  it('offers the start of a run of drives with short stops, the newest just ended', () => {
    const trips = [
      drive('early', min(-300), min(-290)), // breakfast run, long before
      drive('a', min(-100), min(-88)),
      drive('b', min(-70), min(-60)),
      drive('c', min(-30), min(-20)),
    ];
    expect(backdateStart(trips, now)).toEqual({ from: iso(min(-100)), tripIds: ['c', 'b', 'a'] });
  });

  it('one drive could be anything; an old one isn’t a shift in progress', () => {
    expect(backdateStart([drive('a', min(-30), min(-20))], now)).toBeNull();
    expect(backdateStart([drive('a', min(-200), min(-190)), drive('b', min(-170), min(-160))], now)).toBeNull();
  });

  it('a shift started late takes one drive, from before it started', () => {
    const started = min(0);
    expect(backdateStart([drive('a', min(-25), min(-15)), drive('late', min(10), min(20))], started, { minDrives: 1 })).toEqual({
      from: iso(min(-25)),
      tripIds: ['a'],
    });
  });

  it('skips sorted, manual and shift drives, and never reaches into the last shift', () => {
    const trips = [
      drive('sorted', min(-50), min(-40), { classification: 'personal' }),
      drive('manual', min(-35), min(-30), { source: 'manual' }),
      drive('a', min(-70), min(-60)),
      drive('b', min(-25), min(-15)),
    ];
    expect(backdateStart(trips, now)?.tripIds).toEqual(['b', 'a']);
    expect(backdateStart(trips, now, { notBefore: min(-60) })).toBeNull();
  });
});
