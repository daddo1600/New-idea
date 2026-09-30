import { describe, expect, it } from '@jest/globals';

import {
  INITIAL_TRACKER_RECORD,
  onGeofenceExit,
  onLocations,
  type TrackerRecord,
} from '../tracker-policy';
import type { LocationSample } from '../trip-detector';

const T0 = Date.UTC(2026, 8, 30, 16, 0, 0);
const LNG_PER_M = 1 / (111_320 * Math.cos((37.3382 * Math.PI) / 180));

function sample(eastM: number, t: number, speed: number): LocationSample {
  return { latitude: 37.3382, longitude: -121.8863 + eastM * LNG_PER_M, accuracy: 8, speed, timestamp: t };
}

const enabled: TrackerRecord = { ...INITIAL_TRACKER_RECORD, enabled: true };

describe('tracker policy', () => {
  it('does nothing while tracking is off', () => {
    expect(onGeofenceExit(INITIAL_TRACKER_RECORD, T0).mode).toBe('geofence');
  });

  it('switches GPS on when the geofence is exited', () => {
    const record = onGeofenceExit(enabled, T0);
    expect(record.mode).toBe('gps');
    expect(record.gpsSince).toBe(T0);
  });

  it('goes back to a geofence at the destination after a drive', () => {
    let record = onGeofenceExit(enabled, T0);
    const samples: LocationSample[] = [sample(0, T0, 0)];
    for (let s = 5; s <= 600; s += 5) samples.push(sample(13 * s, T0 + s * 1000, 13));
    const parkedAt = T0 + 605_000;
    for (let s = 0; s <= 360; s += 30) samples.push(sample(7800, parkedAt + s * 1000, 0));

    const decision = onLocations(record, samples, parkedAt + 360_000);
    expect(decision.completed).toHaveLength(1);
    expect(decision.record.mode).toBe('geofence');
    expect(decision.switchToGeofenceAt?.longitude).toBeCloseTo(-121.8863 + 7800 * LNG_PER_M, 3);
    record = decision.record;
    expect(record.gpsSince).toBeNull();
  });

  it('gives up on a false wake-up (a walk) after the stop duration', () => {
    const record = onGeofenceExit(enabled, T0);
    const walk: LocationSample[] = [];
    for (let s = 0; s <= 400; s += 10) walk.push(sample(1.4 * s, T0 + s * 1000, 1.4));
    const early = onLocations(record, walk, T0 + 60_000);
    expect(early.record.mode).toBe('gps');
    const later = onLocations(early.record, [], T0 + 6 * 60_000);
    expect(later.completed).toHaveLength(0);
    expect(later.record.mode).toBe('geofence');
    expect(later.switchToGeofenceAt).not.toBeNull();
  });

  it('keeps GPS on mid-drive', () => {
    const record = onGeofenceExit(enabled, T0);
    const samples = [sample(0, T0, 0), sample(65, T0 + 5000, 13), sample(130, T0 + 10_000, 13)];
    const decision = onLocations(record, samples, T0 + 10_000);
    expect(decision.record.mode).toBe('gps');
    expect(decision.record.detector.mode).toBe('driving');
  });
});
