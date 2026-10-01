import { describe, expect, it } from '@jest/globals';

import type { LatLng } from '../geo';
import {
  dismissGap,
  onGeofenceExit,
  onLocations,
  onReconcile,
  onReconcileParked,
  parkedAt,
  withGaps,
  type TrackerRecord,
  type TrackingGap,
} from '../tracker-policy';
import {
  alertWorthy,
  forgetPending,
  logAlert,
  mayAlert,
  openGap,
  pendingAlerts,
  trackingHealth,
  type TrackingPermissions,
} from '../tracking-health';
import { stepAll, type LocationSample } from '../trip-detector';

const BASE = { latitude: 51.5, longitude: -0.12 };
const M_PER_DEG_LNG = 111_320 * Math.cos((BASE.latitude * Math.PI) / 180);
const T0 = Date.UTC(2026, 9, 1, 8, 0, 0);
const MIN = 60_000;
const DAY = 86_400_000;

const ll = (east: number): LatLng => ({ latitude: BASE.latitude, longitude: BASE.longitude + east / M_PER_DEG_LNG });
const fix = (east: number, t: number, speed: number | null = 12, accuracy: number | null = 8): LocationSample => ({
  ...ll(east),
  accuracy,
  speed,
  timestamp: t,
});

/** One fix a second along the x axis at `speed` m/s for `seconds`. */
function drive(fromEast: number, start: number, seconds: number, speed = 12.5): LocationSample[] {
  return Array.from({ length: seconds + 1 }, (_, s) => fix(fromEast + speed * s, start + s * 1000, speed));
}

const ALL_GOOD: TrackingPermissions = {
  foreground: true,
  background: true,
  precise: true,
  tasks: { geofence: true, gps: false },
};

const parked = (at = T0): TrackerRecord => parkedAt(ll(0), at);

function gap(id: string, toAt: number, extra: Partial<TrackingGap> = {}): TrackingGap {
  return { id, reason: 'cut', from: ll(0), fromAt: toAt - 30 * MIN, to: ll(9000), toAt, distanceM: 9000, ...extra };
}

describe('trackingHealth', () => {
  it('is fine while parked, however long the car sits', () => {
    expect(trackingHealth(parked(), ALL_GOOD, T0 + 10 * DAY).issue).toBe('ok');
    expect(trackingHealth(parked(), ALL_GOOD, T0 + 10 * DAY).lastSeenAt).toBe(T0);
  });

  it('puts permission problems first', () => {
    expect(trackingHealth(parked(), { ...ALL_GOOD, foreground: false, background: false }, T0).issue).toBe(
      'needs-permission',
    );
    expect(trackingHealth(parked(), { ...ALL_GOOD, background: false }, T0).issue).toBe('needs-always');
  });

  it('says tracking is off when the user switched it off', () => {
    expect(trackingHealth({ ...parked(), enabled: false }, ALL_GOOD, T0).issue).toBe('off');
  });

  it('spots Precise Location being off', () => {
    expect(trackingHealth(parked(), { ...ALL_GOOD, precise: false }, T0).issue).toBe('precise-location-off');
    // Not reported (older iOS, the preview): not a problem.
    expect(trackingHealth(parked(), { ...ALL_GOOD, precise: null }, T0).issue).toBe('ok');
  });

  it('spots tracking that is on but not registered with iOS', () => {
    const none = { ...ALL_GOOD, tasks: { geofence: false, gps: false } };
    expect(trackingHealth(parked(), none, T0).issue).toBe('tracking-stopped');
    const driving = onGeofenceExit(parked(), T0 + MIN);
    expect(trackingHealth(driving, none, T0 + 2 * MIN).issue).toBe('tracking-stopped');
    expect(trackingHealth(driving, { ...ALL_GOOD, tasks: { geofence: false, gps: true } }, T0 + 2 * MIN).issue).toBe(
      'ok',
    );
    // Unknown tasks are never reported as stopped.
    expect(trackingHealth(parked(), { ...ALL_GOOD, tasks: null }, T0).issue).toBe('ok');
  });

  it('calls GPS stale only after half an hour of silence mid-drive', () => {
    const gps = { ...ALL_GOOD, tasks: { geofence: false, gps: true } };
    const record = onLocations(onGeofenceExit(parked(), T0), drive(0, T0, 120), T0 + 120_000).record;
    expect(record.mode).toBe('gps');
    expect(trackingHealth(record, gps, T0 + 20 * MIN).issue).toBe('ok');
    expect(trackingHealth(record, gps, T0 + 2 * MIN + 30 * MIN).issue).toBe('stale');
  });

  it('offers the newest open gap, within two weeks', () => {
    const record = withGaps(parked(), [gap('a', T0 + MIN), gap('b', T0 + 2 * MIN)]);
    const health = trackingHealth(record, ALL_GOOD, T0 + 3 * MIN);
    expect(health.issue).toBe('gap');
    expect(health.gap?.id).toBe('b');
    expect(openGap(dismissGap(record, 'b'), T0 + 3 * MIN)?.id).toBe('a');
    expect(trackingHealth(record, ALL_GOOD, T0 + 15 * DAY).issue).toBe('ok');
  });

  it('keeps the gap alongside a more urgent issue', () => {
    const record = withGaps(parked(), [gap('a', T0 + MIN)]);
    const health = trackingHealth(record, { ...ALL_GOOD, precise: false }, T0 + 2 * MIN);
    expect(health.issue).toBe('precise-location-off');
    expect(health.gap?.id).toBe('a');
  });
});

describe('gap records', () => {
  it('adds each gap once and keeps the newest five', () => {
    let record = parked();
    for (let i = 0; i < 7; i++) record = withGaps(record, [gap(`g${i}`, T0 + i * MIN)]);
    record = withGaps(record, [gap('g6', T0 + 6 * MIN)]);
    expect(record.gaps?.map((g) => g.id)).toEqual(['g2', 'g3', 'g4', 'g5', 'g6']);
  });

  it('dismisses a gap without touching the others', () => {
    const record = withGaps(parked(), [gap('a', T0), gap('b', T0 + MIN)]);
    const next = dismissGap(record, 'a');
    expect(next.gaps?.find((g) => g.id === 'a')?.dismissed).toBe(true);
    expect(next.gaps?.find((g) => g.id === 'b')?.dismissed).toBeUndefined();
    expect(dismissGap(next, 'a')).toBe(next);
  });
});

describe('reconcile records the gap when the app was killed mid-drive', () => {
  const killedMidDrive = () => {
    const start = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    const samples = drive(0, T0, 300); // 3.75 km, then silence
    const record = onLocations(start, samples, T0 + 300_000).record;
    expect(record.detector.mode).toBe('driving');
    return { record, lastAt: T0 + 300_000 };
  };

  it('relaunched 25 min later, 5 km further on: a cut gap from the last fix to here', () => {
    const { record, lastAt } = killedMidDrive();
    const now = lastAt + 25 * MIN;
    const decision = onReconcile(record, fix(9000, now, -1, 10), now);
    expect(decision.completed).toHaveLength(1);
    const gaps = decision.record.gaps ?? [];
    expect(gaps).toHaveLength(1);
    expect(gaps[0].reason).toBe('cut');
    expect(gaps[0].fromAt).toBe(lastAt);
    expect(gaps[0].toAt).toBe(now);
    expect(Math.abs(gaps[0].distanceM - 5250)).toBeLessThan(60);
    expect(decision.record.lastSeenAt).toBe(now);
  });

  it('records it from a coarse fix too (the detector ignores it, reconcile re-anchors)', () => {
    const { record, lastAt } = killedMidDrive();
    const now = lastAt + 25 * MIN;
    const decision = onReconcile(record, fix(9000, now, -1, 300), now);
    expect(decision.record.gaps).toHaveLength(1);
    expect(decision.record.gaps?.[0].fromAt).toBe(lastAt);
  });

  it('no gap when the drive just ended where it was last seen', () => {
    const { record, lastAt } = killedMidDrive();
    const now = lastAt + 25 * MIN;
    expect(onReconcile(record, fix(3800, now, 0, 10), now).record.gaps ?? []).toHaveLength(0);
  });

  it('no gap when relaunched while still driving (the drive carries on)', () => {
    const { record, lastAt } = killedMidDrive();
    const now = lastAt + 2 * MIN;
    const decision = onReconcile(record, fix(3750 + 1500, now, 12.5), now);
    expect(decision.record.detector.mode).toBe('driving');
    expect(decision.record.gaps ?? []).toHaveLength(0);
  });

  it('no gap without a current position', () => {
    const { record, lastAt } = killedMidDrive();
    expect(onReconcile(record, null, lastAt + 25 * MIN).record.gaps ?? []).toHaveLength(0);
  });

  it('a woken-but-killed start (no drive seen at all) 6 km away is a gap from the parked spot', () => {
    const start = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    const now = T0 + 40 * MIN;
    const decision = onReconcile(start, fix(6000, now, -1, 10), now);
    expect(decision.record.gaps).toHaveLength(1);
    expect(Math.abs((decision.record.gaps?.[0].distanceM ?? 0) - 6000)).toBeLessThan(60);
  });
});

describe('a long silence mid-drive in the background', () => {
  it('notes the gap without changing what is detected', () => {
    const start = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    // 3.75 km, 30 minutes of nothing (too slow to be one drive), then fixes 6 km on, parked.
    const before = drive(0, T0, 300);
    const resume = T0 + 300_000 + 30 * MIN;
    const after = Array.from({ length: 400 }, (_, s) => fix(9750, resume + s * 1000, 0));
    const samples = [...before, ...after];
    const decision = onLocations(start, samples, resume + 400_000);
    expect(decision.record.gaps).toHaveLength(1);
    expect(decision.record.gaps?.[0].reason).toBe('cut');
    expect(Math.abs((decision.record.gaps?.[0].distanceM ?? 0) - 6000)).toBeLessThan(60);
    // Detection is exactly what the detector alone finds.
    expect(decision.completed).toEqual(stepAll(start.detector, samples).completed);
  });

  it('no gap for a tunnel the detector bridges at driving speed', () => {
    const start = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    const before = drive(0, T0, 300);
    const resume = T0 + 300_000 + 6 * MIN; // 4.5 km in 6 min: 12.5 m/s
    const after = drive(3750 + 4500, resume, 60);
    const decision = onLocations(start, [...before, ...after], resume + 60_000);
    expect(decision.record.gaps ?? []).toHaveLength(0);
  });

  it('no gap for a short pause near the same spot', () => {
    const start = onGeofenceExit(parkedAt(ll(0), T0 - 3600_000), T0);
    const before = drive(0, T0, 300);
    const resume = T0 + 300_000 + 10 * MIN;
    const after = drive(3800, resume, 60);
    expect(onLocations(start, [...before, ...after], resume + 60_000).record.gaps ?? []).toHaveLength(0);
  });
});

describe('reconcile while parked: a geofence exit that never came', () => {
  const now = T0 + 3 * DAY;

  it('far away on a precise, recent fix: a missed gap, and the geofence moves here', () => {
    const decision = onReconcileParked(parked(), fix(8000, now - MIN, null, 20), now);
    expect(decision.record.gaps).toHaveLength(1);
    expect(decision.record.gaps?.[0]).toMatchObject({ reason: 'missed', fromAt: T0, toAt: now - MIN });
    expect(decision.switchToGeofenceAt).toEqual(ll(8000));
    expect(decision.record.detector).toEqual({ mode: 'idle', anchor: { ...ll(8000), timestamp: now - MIN } });
  });

  it('nothing while the phone is still near the car, even after days', () => {
    expect(onReconcileParked(parked(), fix(300, now, null, 20), now).switchToGeofenceAt).toBeNull();
    expect(onReconcileParked(parked(), fix(1200, now, null, 20), now).record.gaps ?? []).toHaveLength(0);
  });

  it('ignores coarse, old or missing fixes', () => {
    expect(onReconcileParked(parked(), fix(8000, now, null, 500), now).switchToGeofenceAt).toBeNull();
    expect(onReconcileParked(parked(), fix(8000, T0 - MIN, null, 20), now).switchToGeofenceAt).toBeNull();
    expect(onReconcileParked(parked(), null, now).switchToGeofenceAt).toBeNull();
    expect(onReconcileParked(parked(), fix(8000, now, null, null), now).switchToGeofenceAt).toBeNull();
  });

  it('does nothing while a drive is being tracked or tracking is off', () => {
    expect(onReconcileParked(onGeofenceExit(parked(), T0 + MIN), fix(8000, now, null, 20), now).switchToGeofenceAt).toBeNull();
    expect(onReconcileParked({ ...parked(), enabled: false }, fix(8000, now, null, 20), now).switchToGeofenceAt).toBeNull();
  });
});

describe('notifications: once per issue per day', () => {
  const morning = new Date(2026, 9, 1, 9, 0).getTime();

  it('allows the first, then not again the same day', () => {
    const log = logAlert(undefined, 'tracking-stopped', morning);
    expect(mayAlert(undefined, 'tracking-stopped', morning, morning)).toBe(true);
    expect(mayAlert(log, 'tracking-stopped', morning + 3600_000, morning + 3600_000)).toBe(false);
    expect(mayAlert(log, 'precise-location-off', morning + 3600_000, morning + 3600_000)).toBe(true);
    expect(mayAlert(log, 'tracking-stopped', morning + DAY, morning + DAY)).toBe(true);
  });

  it('a queued one can still be moved, and cancelling it frees the day', () => {
    const queued = logAlert(undefined, 'stale', morning + 30 * MIN);
    expect(mayAlert(queued, 'stale', morning + 40 * MIN, morning + 10 * MIN)).toBe(true);
    expect(pendingAlerts(queued, morning + 10 * MIN)).toEqual(['stale']);
    const cancelled = forgetPending(queued, morning + 10 * MIN);
    expect(cancelled).toEqual({});
    expect(forgetPending(queued, morning + 31 * MIN)).toEqual(queued);
  });

  it('only alerts about permissions for someone who had tracking on', () => {
    expect(alertWorthy('needs-always', parked())).toBe(true);
    expect(alertWorthy('needs-always', { ...parked(), enabled: false })).toBe(false);
    expect(alertWorthy('tracking-stopped', parked())).toBe(true);
    expect(alertWorthy('gap', parked())).toBe(false);
    expect(alertWorthy('ok', parked())).toBe(false);
  });
});
