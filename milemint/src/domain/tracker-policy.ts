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
  return { ...record, mode: 'gps', gpsSince: now, detector: INITIAL_DETECTOR_STATE };
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
  const anchor = idle ? detector.anchor : null;

  if (record.mode === 'gps' && idle && (drove || falseStart) && anchor) {
    return {
      record: { ...record, mode: 'geofence', gpsSince: null, detector },
      completed,
      switchToGeofenceAt: { latitude: anchor.latitude, longitude: anchor.longitude },
    };
  }
  return { record: { ...record, detector }, completed, switchToGeofenceAt: null };
}
