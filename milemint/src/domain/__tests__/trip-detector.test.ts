import { describe, expect, it } from '@jest/globals';

import { distanceMeters } from '../geo';
import {
  DEFAULT_DETECTOR_CONFIG,
  flush,
  INITIAL_DETECTOR_STATE,
  stepAll,
  type LocationSample,
} from '../trip-detector';

// Simulated journeys around San Jose, heading due east.
const BASE = { latitude: 37.3382, longitude: -121.8863 };
const METERS_PER_DEG_LNG = 111_320 * Math.cos((BASE.latitude * Math.PI) / 180);
const T0 = Date.UTC(2026, 8, 30, 16, 0, 0);
const MIN = 60_000;

/** Deterministic GPS jitter so tests are repeatable. */
function jitter(i: number, meters: number) {
  return ((Math.sin(i * 12.9898) * 43758.5453) % 1) * meters;
}

function at(eastM: number, t: number, speed: number | null, accuracy = 8, i = 0): LocationSample {
  return {
    latitude: BASE.latitude + jitter(i, 5) / 111_320,
    longitude: BASE.longitude + (eastM + jitter(i + 7, 5)) / METERS_PER_DEG_LNG,
    accuracy,
    speed,
    timestamp: t,
  };
}

/** Parked at `eastM` for `minutes`, one fix every 30 s, with jitter. */
function parked(eastM: number, fromT: number, minutes: number): LocationSample[] {
  const out: LocationSample[] = [];
  for (let s = 0; s <= minutes * 60; s += 30) out.push(at(eastM, fromT + s * 1000, 0, 10, s));
  return out;
}

/** Drives from `fromM` to `toM` at `mps`, one fix every 5 s. */
function drive(fromM: number, toM: number, fromT: number, mps: number): LocationSample[] {
  const out: LocationSample[] = [];
  const seconds = Math.abs(toM - fromM) / mps;
  for (let s = 5; s <= seconds; s += 5) {
    out.push(at(fromM + Math.sign(toM - fromM) * mps * s, fromT + s * 1000, mps, 8, s));
  }
  return out;
}

const endOf = (samples: LocationSample[]) => samples[samples.length - 1].timestamp;

describe('trip detector', () => {
  it('records one drive from where the car was parked to where it parked next', () => {
    const home = parked(0, T0, 3);
    const road = drive(0, 8000, endOf(home), 13); // 8 km at ~29 mph
    const client = parked(8000, endOf(road) + 5000, 8);
    const { state, completed } = stepAll(INITIAL_DETECTOR_STATE, [...home, ...road, ...client]);

    expect(completed).toHaveLength(1);
    const trip = completed[0];
    expect(trip.distanceMeters).toBeGreaterThan(7800);
    expect(trip.distanceMeters).toBeLessThan(8300);
    expect(distanceMeters(trip.start, { ...BASE })).toBeLessThan(30);
    expect(distanceMeters(trip.end, { latitude: BASE.latitude, longitude: BASE.longitude + 8000 / METERS_PER_DEG_LNG })).toBeLessThan(60);
    expect(trip.startedAt).toBeLessThanOrEqual(endOf(home));
    // Ends when the car stopped, not five minutes later.
    expect(trip.endedAt).toBeLessThan(endOf(road) + 60_000);
    expect(trip.route.length).toBeGreaterThan(20);
    expect(state.mode).toBe('idle');
  });

  it('merges a short restaurant pickup into the same trip (gig drivers)', () => {
    const start = parked(0, T0, 1);
    const leg1 = drive(0, 4000, endOf(start), 12);
    const pickup = parked(4000, endOf(leg1) + 5000, 3); // shorter than the 5-min stop rule
    const leg2 = drive(4000, 9000, endOf(pickup), 12);
    const dropoff = parked(9000, endOf(leg2) + 5000, 7);
    const { completed } = stepAll(INITIAL_DETECTOR_STATE, [...start, ...leg1, ...pickup, ...leg2, ...dropoff]);

    expect(completed).toHaveLength(1);
    expect(completed[0].distanceMeters).toBeGreaterThan(8700);
    expect(completed[0].distanceMeters).toBeLessThan(9400);
  });

  it('splits into two trips when the stop is long', () => {
    const start = parked(0, T0, 1);
    const leg1 = drive(0, 4000, endOf(start), 12);
    const meeting = parked(4000, endOf(leg1) + 5000, 45);
    const leg2 = drive(4000, 0, endOf(meeting), 12);
    const back = parked(0, endOf(leg2) + 5000, 7);
    const { completed } = stepAll(INITIAL_DETECTOR_STATE, [...start, ...leg1, ...meeting, ...leg2, ...back]);

    expect(completed).toHaveLength(2);
    for (const trip of completed) {
      expect(trip.distanceMeters).toBeGreaterThan(3800);
      expect(trip.distanceMeters).toBeLessThan(4300);
    }
  });

  it('ignores a walk', () => {
    const start = parked(0, T0, 1);
    const walk = drive(0, 1500, endOf(start), 1.4);
    const end = parked(1500, endOf(walk) + 5000, 7);
    expect(stepAll(INITIAL_DETECTOR_STATE, [...start, ...walk, ...end]).completed).toHaveLength(0);
  });

  it('ignores GPS jitter while parked', () => {
    const noisy = parked(0, T0, 60).map((s, i) => ({ ...s, speed: null, accuracy: 30, i }));
    expect(stepAll(INITIAL_DETECTOR_STATE, noisy).completed).toHaveLength(0);
  });

  it('drops a single wild GPS jump instead of adding miles', () => {
    const start = parked(0, T0, 1);
    const road = drive(0, 6000, endOf(start), 13);
    const glitch = { ...road[20], longitude: road[20].longitude + 0.5, timestamp: road[20].timestamp + 1000 };
    const end = parked(6000, endOf(road) + 5000, 7);
    const { completed } = stepAll(INITIAL_DETECTOR_STATE, [...start, ...road, glitch, ...end]);
    expect(completed).toHaveLength(1);
    expect(completed[0].distanceMeters).toBeLessThan(6300);
  });

  it('ignores imprecise fixes', () => {
    const start = parked(0, T0, 1);
    const wobbly = drive(0, 6000, endOf(start), 13).map((s) => ({ ...s, accuracy: 500 }));
    expect(stepAll(INITIAL_DETECTOR_STATE, [...start, ...wobbly]).state.mode).toBe('idle');
  });

  it('ends a trip on flush when updates stop after parking', () => {
    const start = parked(0, T0, 1);
    const road = drive(0, 5000, endOf(start), 13);
    const { state } = stepAll(INITIAL_DETECTOR_STATE, [...start, ...road]);
    expect(state.mode).toBe('driving');

    expect(flush(state, endOf(road) + MIN).completed).toHaveLength(0);
    const { completed, state: after } = flush(state, endOf(road) + DEFAULT_DETECTOR_CONFIG.stopDurationMs);
    expect(completed).toHaveLength(1);
    expect(completed[0].endedAt).toBe(endOf(road));
    expect(after.mode).toBe('idle');
  });

  it('survives being resumed from saved state mid-drive (app killed in background)', () => {
    const start = parked(0, T0, 1);
    const road = drive(0, 8000, endOf(start), 13);
    const end = parked(8000, endOf(road) + 5000, 7);
    const all = [...start, ...road, ...end];
    const half = Math.floor(all.length / 2);
    const first = stepAll(INITIAL_DETECTOR_STATE, all.slice(0, half));
    const restored = JSON.parse(JSON.stringify(first.state));
    const second = stepAll(restored, all.slice(half));
    expect([...first.completed, ...second.completed]).toHaveLength(1);
  });
});
