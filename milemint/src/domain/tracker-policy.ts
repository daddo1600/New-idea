import {
  DEFAULT_DETECTOR_CONFIG,
  flush,
  INITIAL_DETECTOR_STATE,
  isValidSample,
  silenceGap,
  step,
  type DetectedTrip,
  type DetectorConfig,
  type DetectorState,
  type LocationSample,
} from './trip-detector';
import { distanceMeters, type LatLng } from './geo';

/**
 * Battery policy. While parked, only a geofence around the car is armed (no
 * GPS). Leaving it switches GPS on; once the drive ends, or a wake-up turns out
 * not to be a drive, GPS goes off and a new geofence is armed where the phone is.
 */
export type TrackerRecord = {
  enabled: boolean;
  mode: 'geofence' | 'gps';
  /** When GPS was switched on, to give up on false wake-ups (e.g. a walk). */
  gpsSince: number | null;
  detector: DetectorState;
  /** Latest position from any fix, however imprecise: a fallback place to re-arm the geofence. */
  lastSeen?: LatLng | null;
  /** When `lastSeen` was taken (epoch ms): "Last location: 3 minutes ago" in Settings. */
  lastSeenAt?: number | null;
  /** Stretches where tracking lost the phone and miles may be missing, newest last. */
  gaps?: TrackingGap[];
  /** Tracking-health notifications: the day each issue last alerted, so it's once a day at most. */
  alerts?: AlertLog;
  /** Detected drives that Motion & Fitness showed were walks, so weren't saved (newest last, a few kept for debugging). */
  droppedWalks?: DroppedWalk[];
};

/**
 * The drive the tracker is recording right now, or null when parked (or
 * tracking is off). Perks use it too: claims wait until the driver parks.
 */
export function driveInProgress(
  record: Pick<TrackerRecord, 'enabled' | 'detector'> | null | undefined,
): Extract<DetectorState, { mode: 'driving' }> | null {
  const detector = record?.enabled ? record.detector : null;
  return detector?.mode === 'driving' ? detector : null;
}

/** A detected "drive" not saved because the phone was walking: when, and how far the GPS made it. */
export type DroppedWalk = { startedAt: number; endedAt: number; distanceM: number };

/**
 * A stretch where tracking lost the phone: it was last seen at `from` and
 * turned up again at `to`, far away, with no drive logged in between.
 *   cut     a drive was being logged and its fixes stopped (iOS killed the
 *           app, GPS went silent): the detector ended it early
 *   missed  parked, the phone ended up far from the geofence that should have
 *           woken the app when it left
 */
export type TrackingGap = {
  id: string;
  reason: 'cut' | 'missed';
  from: LatLng;
  fromAt: number;
  to: LatLng;
  toAt: number;
  /** Straight-line distance: the road distance is at least this. */
  distanceM: number;
  /** Filled in by hand, or the user said it wasn't a drive. */
  dismissed?: boolean;
};

/** Issue → when its last notification went off (or is queued to). */
export type AlertLog = Partial<Record<string, number>>;

/** Further than this between two sightings, with no drive logged, is worth a look (metres). */
export const GAP_MIN_DISTANCE_M = 1500;
/** Kept for the home card; older ones are dropped. */
const MAX_GAPS = 5;

export const INITIAL_TRACKER_RECORD: TrackerRecord = {
  enabled: false,
  mode: 'geofence',
  gpsSince: null,
  detector: INITIAL_DETECTOR_STATE,
};

/** Metres around the parked car; leaving it wakes the app. */
export const GEOFENCE_RADIUS_M = 150;

export type TrackerDecision = {
  record: TrackerRecord;
  completed: DetectedTrip[];
  /** Where to arm the next geofence, when GPS should be switched off. */
  switchToGeofenceAt: { latitude: number; longitude: number } | null;
};

/** The geofence was exited: switch GPS on and start watching for a drive. */
export function onGeofenceExit(record: TrackerRecord, now: number): TrackerRecord {
  if (!record.enabled || record.mode === 'gps') return record;
  // Keep where the car was parked, so the drive starts there rather than at the
  // first fix outside the geofence (150 m or more away). Restamped so the time
  // spent parked doesn't count as part of the drive.
  const parked = record.detector.mode === 'idle' ? record.detector.anchor : null;
  const detector: DetectorState = parked
    ? { mode: 'idle', anchor: { ...parked, timestamp: now - 1 } }
    : INITIAL_DETECTOR_STATE;
  return { ...record, mode: 'gps', gpsSince: now, detector };
}

/** Tracking was just switched on with the phone at `here`: treat it as where the car is parked. */
export function parkedAt(here: LatLng, now: number): TrackerRecord {
  return {
    ...INITIAL_TRACKER_RECORD,
    enabled: true,
    detector: { mode: 'idle', anchor: { latitude: here.latitude, longitude: here.longitude, timestamp: now } },
    lastSeen: { latitude: here.latitude, longitude: here.longitude },
    lastSeenAt: now,
  };
}

const plain = (p: LatLng): LatLng => ({ latitude: p.latitude, longitude: p.longitude });

type Sighting = LatLng & { timestamp: number };

function makeGap(reason: TrackingGap['reason'], from: Sighting, to: Sighting): TrackingGap {
  return {
    id: `${reason}-${from.timestamp}-${to.timestamp}`,
    reason,
    from: plain(from),
    fromAt: from.timestamp,
    to: plain(to),
    toAt: to.timestamp,
    distanceM: Math.round(distanceMeters(from, to)),
  };
}

/** Adds gaps to the record (once each), keeping the newest few. */
export function withGaps(record: TrackerRecord, gaps: readonly TrackingGap[]): TrackerRecord {
  const known = new Set((record.gaps ?? []).map((gap) => gap.id));
  const fresh = gaps.filter((gap) => !known.has(gap.id));
  if (fresh.length === 0) return record;
  return { ...record, gaps: [...(record.gaps ?? []), ...fresh].slice(-MAX_GAPS) };
}

/** The user added the missed trip, or said it wasn't one. */
export function dismissGap(record: TrackerRecord, id: string): TrackerRecord {
  const gaps = record.gaps ?? [];
  if (!gaps.some((gap) => gap.id === id && !gap.dismissed)) return record;
  return { ...record, gaps: gaps.map((gap) => (gap.id === id ? { ...gap, dismissed: true } : gap)) };
}

/** A batch of GPS fixes arrived (or none, with `samples` empty, on a periodic check). */
export function onLocations(
  record: TrackerRecord,
  samples: readonly LocationSample[],
  now: number,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): TrackerDecision {
  if (!record.enabled) {
    return { record, completed: [], switchToGeofenceAt: null };
  }
  // stepAll, sample by sample, noting where a drive was cut short by a long
  // silence and the phone turned up far away: those miles may be missing.
  let state = record.detector;
  const steppedTrips: DetectedTrip[] = [];
  const gaps: TrackingGap[] = [];
  const ordered = samples.filter(isValidSample).sort((a, b) => a.timestamp - b.timestamp);
  for (const sample of ordered) {
    const silence = silenceGap(state, sample, config);
    if (silence && distanceMeters(silence.from, silence.to) >= GAP_MIN_DISTANCE_M) {
      gaps.push(makeGap('cut', silence.from, silence.to));
    }
    const result = step(state, sample, config);
    state = result.state;
    steppedTrips.push(...result.completed);
  }
  const stepped = { state, completed: steppedTrips };
  const flushed = flush(stepped.state, now, config);
  const completed = [...stepped.completed, ...flushed.completed];
  const detector = flushed.state;

  const idle = detector.mode === 'idle';
  const drove = completed.length > 0;
  // A wake-up that never became a drive (walked out of the geofence, GPS drift).
  const falseStart =
    idle && record.gpsSince !== null && now - record.gpsSince >= config.stopDurationMs;
  const valid = samples.filter(isValidSample);
  const latest = valid.length > 0 ? valid.reduce((a, b) => (b.timestamp > a.timestamp ? b : a)) : null;
  const lastSeen = latest ? { latitude: latest.latitude, longitude: latest.longitude } : (record.lastSeen ?? null);
  const lastSeenAt = latest ? Math.max(latest.timestamp, record.lastSeenAt ?? 0) : (record.lastSeenAt ?? null);
  const base = withGaps(record, gaps);
  // With no precise fix at all (underground car park, cell-only), fall back to
  // the rough position rather than leaving GPS on all night.
  const anchor = idle ? (detector.anchor ?? (falseStart ? lastSeen : null)) : null;

  if (record.mode === 'gps' && idle && (drove || falseStart) && anchor) {
    return {
      record: { ...base, mode: 'geofence', gpsSince: null, detector, lastSeen, lastSeenAt },
      completed,
      switchToGeofenceAt: { latitude: anchor.latitude, longitude: anchor.longitude },
    };
  }
  return { record: { ...base, detector, lastSeen, lastSeenAt }, completed, switchToGeofenceAt: null };
}

/**
 * The app came back (relaunched after iOS killed it, or foregrounded) while a
 * drive was being tracked. `here` is a fresh fix of where the phone is now.
 *
 * Without it, the drive would be ended by the clock and the next geofence armed
 * where the car was last seen, possibly kilometres back, and the next wake-up
 * would read that gap as a jump. With it, a drive still under way carries on;
 * otherwise the trip ends where the car was last seen and tracking restarts
 * from where the phone really is, at the time it was really there.
 */
export function onReconcile(
  record: TrackerRecord,
  here: LocationSample | null,
  now: number,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): TrackerDecision {
  if (!record.enabled || record.mode !== 'gps') {
    return { record, completed: [], switchToGeofenceAt: null };
  }
  const usable = here && isValidSample(here) ? here : null;
  const decision = onLocations(record, usable ? [usable] : [], now, config);
  const detector = decision.record.detector;
  if (!usable || detector.mode !== 'idle') return decision;
  const anchor = detector.anchor;
  // A coarse fix (cell, underground) only moves the anchor if it's clearly elsewhere.
  if (anchor && distanceMeters(anchor, usable) <= config.stopRadiusM + Math.max(0, usable.accuracy ?? 0)) {
    return decision;
  }
  // The phone is somewhere else now (too coarse a fix for the detector, or
  // stale anchor): re-anchor here, with the time it was really here.
  const at = { latitude: usable.latitude, longitude: usable.longitude };
  // Far from where tracking last had it, and no drive in between: the app was
  // killed mid-drive (or right after the geofence woke it). Unless the
  // detector already noted it, offer to fill the gap.
  const before = record.detector.mode === 'driving' ? record.detector.last : record.detector.anchor;
  const noted = decision.record.gaps !== record.gaps;
  const gapped =
    before && !noted && usable.timestamp > before.timestamp && distanceMeters(before, usable) >= GAP_MIN_DISTANCE_M
      ? withGaps(decision.record, [makeGap('cut', before, usable)])
      : decision.record;
  return {
    record: {
      ...gapped,
      detector: { mode: 'idle', anchor: { ...at, timestamp: usable.timestamp } },
      lastSeen: at,
      lastSeenAt: Math.max(usable.timestamp, gapped.lastSeenAt ?? 0),
    },
    completed: decision.completed,
    switchToGeofenceAt: decision.switchToGeofenceAt ? at : null,
  };
}

/** A recent fix has to be at least this good to say the phone left the geofence unseen (metres). */
const PARKED_CHECK_ACCURACY_M = 100;

/**
 * The app came to the foreground while parked (geofence armed). `here` is a
 * recent fix. If the phone is now far from the geofence and no exit ever
 * arrived (iOS dropped it after a restart, or never delivered it), a drive
 * may have been missed: note the gap and re-arm where the phone is, since a
 * geofence the phone is already outside of never fires.
 *
 * Conservative on purpose: a parked car is silent for days, so silence alone
 * is never a problem. Only a precise fix, newer than the last sighting and
 * clearly beyond the geofence, counts.
 */
export function onReconcileParked(record: TrackerRecord, here: LocationSample | null, now: number): TrackerDecision {
  const none: TrackerDecision = { record, completed: [], switchToGeofenceAt: null };
  if (!record.enabled || record.mode !== 'geofence' || !here || !isValidSample(here)) return none;
  const accuracy = here.accuracy;
  if (accuracy === null || accuracy === undefined || accuracy > PARKED_CHECK_ACCURACY_M) return none;
  const anchor = record.detector.mode === 'idle' ? record.detector.anchor : null;
  if (!anchor) return none;
  const lastSeenAt = Math.max(anchor.timestamp, record.lastSeenAt ?? 0);
  if (here.timestamp <= lastSeenAt || here.timestamp > now + 60_000) return none;
  if (distanceMeters(anchor, here) < Math.max(GAP_MIN_DISTANCE_M, GEOFENCE_RADIUS_M + 2 * accuracy)) return none;
  const at = { latitude: here.latitude, longitude: here.longitude };
  return {
    record: {
      ...withGaps(record, [makeGap('missed', { ...anchor, timestamp: lastSeenAt }, here)]),
      detector: { mode: 'idle', anchor: { ...at, timestamp: here.timestamp } },
      lastSeen: at,
      lastSeenAt: here.timestamp,
    },
    completed: [],
    switchToGeofenceAt: at,
  };
}
