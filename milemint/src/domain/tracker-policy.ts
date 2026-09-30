import {
  DEFAULT_DETECTOR_CONFIG,
  flush,
  INITIAL_DETECTOR_STATE,
  stepAll,
  type DetectedTrip,
  type DetectorConfig,
  type DetectorState,
  type LocationSample,
} from './trip-detector';
import type { LatLng } from './geo';

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
};

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
    lastSeen: here,
  };
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
  const stepped = stepAll(record.detector, samples, config);
  const flushed = flush(stepped.state, now, config);
  const completed = [...stepped.completed, ...flushed.completed];
  const detector = flushed.state;

  const idle = detector.mode === 'idle';
  const drove = completed.length > 0;
  // A wake-up that never became a drive (walked out of the geofence, GPS drift).
  const falseStart =
    idle && record.gpsSince !== null && now - record.gpsSince >= config.stopDurationMs;
  const latest = samples.length > 0 ? samples.reduce((a, b) => (b.timestamp > a.timestamp ? b : a)) : null;
  const lastSeen = latest ? { latitude: latest.latitude, longitude: latest.longitude } : (record.lastSeen ?? null);
  // With no precise fix at all (underground car park, cell-only), fall back to
  // the rough position rather than leaving GPS on all night.
  const anchor = idle ? (detector.anchor ?? (falseStart ? lastSeen : null)) : null;

  if (record.mode === 'gps' && idle && (drove || falseStart) && anchor) {
    return {
      record: { ...record, mode: 'geofence', gpsSince: null, detector, lastSeen },
      completed,
      switchToGeofenceAt: { latitude: anchor.latitude, longitude: anchor.longitude },
    };
  }
  return { record: { ...record, detector, lastSeen }, completed, switchToGeofenceAt: null };
}
