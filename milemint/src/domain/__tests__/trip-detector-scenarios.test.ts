import { describe, expect, it } from '@jest/globals';

import { distanceMeters, type LatLng } from '../geo';
import { onGeofenceExit, onLocations, onReconcile, parkedAt, type TrackerRecord } from '../tracker-policy';
import {
  flush,
  INITIAL_DETECTOR_STATE,
  sanitizeDetectorState,
  stepAll,
  type DetectedTrip,
  type DetectorState,
  type LocationSample,
} from '../trip-detector';
import { isoDateAtOffset } from '../trip';

/**
 * Regression scenarios from the drive-detection stress test: each one was a
 * real failure (merged, missed, inflated or invented trips) before the fix.
 * Positions are metres east/north of a point in London; one fix per second
 * unless stated.
 */

const BASE = { latitude: 51.5, longitude: -0.12 };
const M_PER_DEG_LNG = 111_320 * Math.cos((BASE.latitude * Math.PI) / 180);
const T0 = Date.UTC(2026, 9, 1, 8, 0, 0);
const MIN = 60_000;

const ll = (east: number, north = 0): LatLng => ({
  latitude: BASE.latitude + north / 111_320,
  longitude: BASE.longitude + east / M_PER_DEG_LNG,
});

function fix(east: number, t: number, speed: number | null = 12, accuracy: number | null = 8, north = 0): LocationSample {
  return { ...ll(east, north), accuracy, speed, timestamp: t };
}

/** Builds a journey along the x axis, one fix per `every` seconds. */
class Journey {
  samples: LocationSample[] = [];
  constructor(
    public t = T0,
    public x = 0,
  ) {}
  drive(meters: number, mps: number, opts: { speed?: (i: number) => number | null; every?: number } = {}) {
    const every = opts.every ?? 1;
    const end = this.x + meters;
    for (let i = 0; this.x < end; i++) {
      this.x = Math.min(end, this.x + mps * every);
      this.t += every * 1000;
      this.samples.push(fix(this.x, this.t, opts.speed ? opts.speed(i) : mps));
    }
    return this;
  }
  stay(seconds: number, opts: { speed?: number | null; jitterM?: number; every?: number } = {}) {
    const every = opts.every ?? 1;
    for (let i = 0; i < seconds; i += every) {
      this.t += every * 1000;
      const j = opts.jitterM ? (i % 2 ? opts.jitterM : -opts.jitterM) : 0;
      this.samples.push(fix(this.x + j, this.t, opts.speed === undefined ? 0 : opts.speed));
    }
    return this;
  }
  /** Time passes with no fixes at all (underground, tunnel, app killed). */
  gap(seconds: number, meters = 0) {
    this.t += seconds * 1000;
    this.x += meters;
    return this;
  }
}

const parkedState = (t = T0 - 1): DetectorState => ({ mode: 'idle', anchor: { ...ll(0), timestamp: t } });

function run(samples: LocationSample[], from: DetectorState = parkedState()): DetectedTrip[] {
  const { state, completed } = stepAll(from, samples);
  const last = samples[samples.length - 1]?.timestamp ?? T0;
  return [...completed, ...flush(state, last + 60 * MIN).completed];
}

const km = (trip: DetectedTrip) => trip.distanceMeters / 1000;
const eastOf = (p: LatLng) => (p.longitude - BASE.longitude) * M_PER_DEG_LNG;

describe('trip detector: long silences', () => {
  it('ends the trip at the car park after a long underground stay, then logs the drive home', () => {
    // Drive 5 km into an underground car park, 8 h with no fix, then the first
    // fix is 300 m away on the way out, and a 6 km drive home.
    const j = new Journey().drive(5000, 13).gap(8 * 3600, 300).drive(6000, 13).stay(400);
    const trips = run(j.samples);
    expect(trips).toHaveLength(2);
    expect(km(trips[0])).toBeCloseTo(5, 1);
    expect(trips[0].endedAt - trips[0].startedAt).toBeLessThan(10 * MIN);
    // The drive home starts at the car park and includes the way out.
    expect(Math.abs(eastOf(trips[1].start) - 5000)).toBeLessThan(50);
    expect(km(trips[1])).toBeCloseTo(6.3, 1);
    expect(trips[1].startedAt).toBeGreaterThan(T0 + 8 * 3600 * 1000);
  });

  it('bridges a tunnel longer than the stop duration (driving speed across the gap)', () => {
    const j = new Journey().drive(3000, 15).gap(7 * 60, 6300).drive(3000, 15).stay(400);
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(km(trips[0])).toBeGreaterThan(12);
  });
});

describe('trip detector: starting', () => {
  it('records a drive when no fix reports a speed (dense fixes), from where the car was parked', () => {
    const j = new Journey().drive(8000, 12, { speed: () => -1 }).stay(400, { speed: -1 });
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(trips[0].startedAt).toBe(T0 - 1);
    expect(km(trips[0])).toBeGreaterThan(7.8);
  });

  it('starts at the parked car when the drive begins with a slow crawl', () => {
    const j = new Journey().drive(600, 4).drive(4400, 12).stay(400);
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(trips[0].startedAt).toBe(T0 - 1);
    expect(km(trips[0])).toBeCloseTo(5, 1);
  });

  it('does not log a walk around the neighbourhood', () => {
    const j = new Journey().drive(600, 1.4).drive(1200, 1.4).stay(600);
    expect(run(j.samples)).toHaveLength(0);
    const noSpeed = new Journey().drive(800, 1.4, { speed: () => -1 }).stay(600, { speed: -1 });
    expect(run(noSpeed.samples)).toHaveLength(0);
  });
});

describe('trip detector: stopping', () => {
  it('ends the trip at the car, not at the office the driver walked to', () => {
    const j = new Journey().drive(6000, 12).stay(30);
    const parkedAtT = j.t;
    for (let n = 1.4; n <= 500; n += 1.4) j.samples.push(fix(6000, (j.t += 1000), 1.4, 8, n));
    for (let i = 0; i < 400; i++) j.samples.push(fix(6000, (j.t += 1000), 0, 8, 500));
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(km(trips[0])).toBeCloseTo(6, 1);
    expect(distanceMeters(trips[0].end, ll(6000))).toBeLessThan(30);
    expect(trips[0].endedAt).toBeLessThanOrEqual(parkedAtT);
  });

  it('keeps a slow stop-and-go jam in one trip', () => {
    const j = new Journey().drive(3000, 13);
    for (let i = 0; i < 25; i++) j.drive(12, 3).stay(15);
    j.drive(3000, 13).stay(400);
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(km(trips[0])).toBeCloseTo(6.3, 1);
  });

  it('keeps a steady walking-pace crawl in one trip when the car speeds up again', () => {
    const j = new Journey().drive(3000, 13).drive(720, 1.5).drive(3000, 13).stay(400);
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(km(trips[0])).toBeCloseTo(6.7, 1);
  });
});

describe('trip detector: distance', () => {
  it('does not count GPS jitter at a long red light', () => {
    const j = new Journey().drive(3000, 12).stay(240, { jitterM: 5 }).drive(3000, 12).stay(400, { jitterM: 5 });
    const trips = run(j.samples);
    expect(trips).toHaveLength(1);
    expect(trips[0].distanceMeters).toBeGreaterThan(5950);
    expect(trips[0].distanceMeters).toBeLessThan(6050);
  });

  it('keeps a courier route with 8 short drops close to the true distance', () => {
    const j = new Journey();
    for (let i = 0; i < 8; i++) j.drive(1500, 10).stay(120 + (i % 3) * 60, { jitterM: 4 });
    j.stay(400);
    const trips = run(j.samples);
    expect(trips).toHaveLength(1); // drops under 5 minutes merge (documented)
    expect(km(trips[0])).toBeGreaterThan(11.9);
    expect(km(trips[0])).toBeLessThan(12.2);
  });

  it('does not lose distance on a winding road', () => {
    // A 2 km circle-ish loop out and back east: points every second at 12 m/s.
    const samples: LocationSample[] = [];
    const R = 300;
    let t = T0;
    for (let a = 0; a <= 2 * Math.PI * 3; a += 12 / R) {
      t += 1000;
      samples.push({ ...ll(R * Math.sin(a) + a * 50, R - R * Math.cos(a)), accuracy: 8, speed: 12, timestamp: t });
    }
    let truth = 0;
    for (let i = 1; i < samples.length; i++) truth += distanceMeters(samples[i - 1], samples[i]);
    const last = samples[samples.length - 1];
    for (let i = 0; i < 400; i++) samples.push({ ...last, speed: 0, timestamp: (t += 1000) });
    const trips = run(samples);
    expect(trips).toHaveLength(1);
    expect(trips[0].distanceMeters / truth).toBeGreaterThan(0.98);
  });

  it('drops a 1.3 km spike with sparse fixes, with or without speed', () => {
    for (const speed of [12.5, -1]) {
      const samples: LocationSample[] = [];
      for (let i = 1; i <= 30; i++) samples.push(fix(i * 250, T0 + i * 20_000, speed));
      samples[14] = fix(14 * 250, samples[14].timestamp, -1, 30, 1300);
      const trips = run(samples);
      expect(trips).toHaveLength(1);
      expect(km(trips[0])).toBeCloseTo(7.5, 1);
    }
  });
});

describe('trip detector: broken fixes', () => {
  const drive = () => new Journey().drive(6000, 12).stay(400).samples;

  it('skips NaN, missing and negative-accuracy fixes', () => {
    const broken: LocationSample[] = [
      { ...fix(0, 0), latitude: NaN, longitude: NaN },
      { ...fix(0, 0), latitude: undefined as unknown as number, longitude: undefined as unknown as number },
      { ...fix(0, 0), latitude: -180, longitude: -180, accuracy: -1 },
      { ...fix(0, 0), timestamp: NaN },
    ];
    for (const bad of broken) {
      const samples = drive();
      samples[200] = { ...bad, timestamp: Number.isNaN(bad.timestamp) ? NaN : samples[200].timestamp };
      const trips = run(samples);
      expect(trips).toHaveLength(1);
      expect(km(trips[0])).toBeCloseTo(6, 1);
    }
  });

  it('starts cleanly when the very first fix is broken', () => {
    const samples = [{ ...fix(0, T0), latitude: NaN }, ...drive()];
    expect(run(samples, INITIAL_DETECTOR_STATE)).toHaveLength(1);
  });

  it('repairs state that JSON turned NaN into null', () => {
    const poisoned = JSON.parse(
      JSON.stringify({
        mode: 'driving',
        start: { ...ll(0), timestamp: T0 },
        last: { latitude: NaN, longitude: NaN, timestamp: T0 + 1000 },
        distanceM: NaN,
        maxSpeedMps: 12,
        route: [ll(0)],
        stop: null,
      }),
    );
    expect(sanitizeDetectorState(poisoned)).toEqual(INITIAL_DETECTOR_STATE);
    const idle = sanitizeDetectorState(JSON.parse(JSON.stringify({ mode: 'idle', anchor: { latitude: NaN, longitude: 1, timestamp: 1 } })));
    expect(idle).toEqual({ mode: 'idle', anchor: null, candidate: null });
    const midDrive = stepAll(parkedState(), drive().slice(0, 300)).state;
    const roundTrip = sanitizeDetectorState(JSON.parse(JSON.stringify({ ...midDrive, distanceM: NaN })));
    expect(roundTrip.mode).toBe('driving');
    expect(Number.isFinite((roundTrip as { distanceM: number }).distanceM)).toBe(true);
  });
});

describe('tracker policy: relaunch after iOS killed the app', () => {
  const driving = (): { record: TrackerRecord; j: Journey } => {
    let record = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    const j = new Journey().drive(3750, 12.5); // killed after 5 min of driving
    record = onLocations(record, j.samples, j.t).record;
    expect(record.detector.mode).toBe('driving');
    return { record, j };
  };

  it('ends the trip at the last fix and re-arms where the phone really is', () => {
    const { record, j } = driving();
    // Relaunched 25 min later, parked 5 km further on, and speed unknown.
    const now = j.t + 25 * MIN;
    const here = fix(9000, now, -1, 10);
    const decision = onReconcile(record, here, now);
    expect(decision.completed).toHaveLength(1);
    expect(Math.abs(eastOf(decision.completed[0].end) - 3750)).toBeLessThan(50);
    expect(Math.abs((decision.switchToGeofenceAt ? eastOf(decision.switchToGeofenceAt) : 0) - 9000)).toBeLessThan(50);
    expect(decision.record.detector).toEqual({ mode: 'idle', anchor: { ...ll(9000), timestamp: now } });
    // The next fixes where the phone sits are not a 5 km drive.
    const next = onGeofenceExit(decision.record, now + MIN);
    const sitting: LocationSample[] = [];
    for (let s = 1; s <= 300; s++) sitting.push(fix(9000, now + MIN + s * 1000, -1, 10));
    const later = onLocations(next, sitting, now + 7 * MIN);
    expect(later.completed).toHaveLength(0);
    expect(later.record.detector.mode).toBe('idle');
  });

  it('keeps one trip when relaunched while still driving', () => {
    const { record, j } = driving();
    const now = j.t + 2 * MIN;
    const decision = onReconcile(record, fix(3750 + 1500, now, 12.5), now);
    expect(decision.completed).toHaveLength(0);
    expect(decision.record.detector.mode).toBe('driving');
    const rest = new Journey(now, 5250).drive(3000, 12.5).stay(400);
    const end = onLocations(decision.record, rest.samples, rest.t);
    expect(end.completed).toHaveLength(1);
    expect(km(end.completed[0])).toBeGreaterThan(8);
  });

  it('never turns a stale geofence into a jump: speedless fixes 4.6 km away are not a drive', () => {
    const record = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    const far: LocationSample[] = [];
    for (let s = 1; s <= 300; s++) far.push(fix(4600 + (s % 2) * 5, T0 + s * 1000, -1, 10));
    const first = onLocations(record, far, T0 + 300_000);
    const second = onLocations(first.record, [], T0 + 11 * MIN);
    expect([...first.completed, ...second.completed]).toHaveLength(0);
    const fence = second.switchToGeofenceAt ?? first.switchToGeofenceAt;
    expect(Math.abs((fence ? eastOf(fence) : 0) - 4600)).toBeLessThan(50);
  });

  it('ignores a broken or missing current position', () => {
    const { record, j } = driving();
    const now = j.t + 25 * MIN;
    expect(onReconcile(record, null, now).completed).toHaveLength(1);
    expect(onReconcile(record, { ...fix(9000, now), latitude: NaN }, now).completed).toHaveLength(1);
  });
});

describe('trip date', () => {
  it("dates a drive by where it started, even if it's saved in another time zone", () => {
    // 23:40 on 5 April in the UK (BST, offset -60): the last day of the UK tax year.
    const startedAt = Date.UTC(2026, 3, 5, 22, 40);
    expect(isoDateAtOffset(startedAt, -60)).toBe('2026-04-05');
    // Saved after crossing into Paris (CEST, -120) it would have been 6 April.
    expect(isoDateAtOffset(startedAt, -120)).toBe('2026-04-06');
    // US Pacific (+420 in summer): 15:40 the same day.
    expect(isoDateAtOffset(startedAt, 420)).toBe('2026-04-05');
  });

  it('falls back to the current time zone when the offset is unknown', () => {
    const at = Date.UTC(2026, 3, 5, 12, 0);
    const local = new Date(at);
    const expected = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
    expect(isoDateAtOffset(at, null)).toBe(expected);
    expect(isoDateAtOffset(at, undefined)).toBe(expected);
  });

  it('records the offset of the fix that started the drive', () => {
    const j = new Journey().drive(6000, 12).stay(400);
    const samples = j.samples.map((s, i) => ({ ...s, utcOffsetMin: i < 100 ? -60 : -120 }));
    const trips = run(samples);
    expect(trips).toHaveLength(1);
    expect(trips[0].utcOffsetMin).toBe(-60);
  });
});
