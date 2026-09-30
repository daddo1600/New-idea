import { distanceMeters, type LatLng } from './geo';

/**
 * Turns a stream of location samples into completed drives.
 *
 * Pure and serialisable on purpose: iOS may kill the app between background
 * wake-ups, so the state is saved after every batch and restored on the next
 * one. All the judgement about what counts as a drive lives here, where it can
 * be tested with simulated journeys.
 */

export type LocationSample = LatLng & {
  /** Horizontal accuracy in metres, if known. */
  accuracy: number | null;
  /** Speed in m/s; negative or null when the OS doesn't know. */
  speed: number | null;
  /** Epoch milliseconds. */
  timestamp: number;
};

export type DetectorConfig = {
  /** Ignore fixes less precise than this (metres). */
  maxAccuracyM: number;
  /** A trip starts once moving this fast (m/s)… */
  startSpeedMps: number;
  /** …or once this far from where the phone was parked (metres). */
  startDistanceM: number;
  /** Staying within this radius counts as stopped (metres). */
  stopRadiusM: number;
  /**
   * How long a stop must last before the trip ends. Shorter stops (traffic,
   * a restaurant pickup) are merged into the same trip.
   */
  stopDurationMs: number;
  /** Trips shorter than this are discarded as noise (metres). */
  minTripDistanceM: number;
  /** A real drive reaches this speed at some point; filters walks and runs (m/s). */
  minPeakSpeedMps: number;
  /** Implied speeds above this are GPS glitches, not driving (m/s). */
  maxPlausibleSpeedMps: number;
  /** Keep a route point for the map at most every this many metres. */
  routePointSpacingM: number;
};

export const DEFAULT_DETECTOR_CONFIG: DetectorConfig = {
  maxAccuracyM: 65,
  startSpeedMps: 4.5, // ~10 mph
  startDistanceM: 300,
  stopRadiusM: 120,
  stopDurationMs: 5 * 60_000,
  minTripDistanceM: 400, // ~0.25 mi
  minPeakSpeedMps: 6.7, // ~15 mph
  maxPlausibleSpeedMps: 70, // ~155 mph
  routePointSpacingM: 40,
};

type Fix = LatLng & { timestamp: number };

export type DetectedTrip = {
  startedAt: number;
  endedAt: number;
  start: LatLng;
  end: LatLng;
  distanceMeters: number;
  route: LatLng[];
};

export type DetectorState =
  | { mode: 'idle'; anchor: Fix | null }
  | {
      mode: 'driving';
      start: Fix;
      last: Fix;
      distanceM: number;
      maxSpeedMps: number;
      route: LatLng[];
      /** Where a possible stop began, and the distance driven up to it. */
      stop: { at: Fix; distanceM: number } | null;
    };

export const INITIAL_DETECTOR_STATE: DetectorState = { mode: 'idle', anchor: null };

export type StepResult = { state: DetectorState; completed: DetectedTrip[] };

function toFix(s: LocationSample): Fix {
  return { latitude: s.latitude, longitude: s.longitude, timestamp: s.timestamp };
}

function knownSpeed(s: LocationSample): number | null {
  return s.speed !== null && s.speed >= 0 ? s.speed : null;
}

function finish(
  state: Extract<DetectorState, { mode: 'driving' }>,
  end: Fix,
  distanceM: number,
  config: DetectorConfig,
): StepResult {
  const idle: DetectorState = { mode: 'idle', anchor: end };
  const isDrive =
    distanceM >= config.minTripDistanceM && state.maxSpeedMps >= config.minPeakSpeedMps;
  if (!isDrive) return { state: idle, completed: [] };
  const route = [...state.route];
  const lastRoute = route[route.length - 1];
  if (!lastRoute || distanceMeters(lastRoute, end) > 1) route.push({ latitude: end.latitude, longitude: end.longitude });
  return {
    state: idle,
    completed: [
      {
        startedAt: state.start.timestamp,
        endedAt: end.timestamp,
        start: { latitude: state.start.latitude, longitude: state.start.longitude },
        end: { latitude: end.latitude, longitude: end.longitude },
        distanceMeters: Math.round(distanceM),
        route,
      },
    ],
  };
}

/** Ends a trip if no samples have arrived for a full stop duration (e.g. GPS paused after parking). */
export function flush(
  state: DetectorState,
  now: number,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  if (state.mode !== 'driving') return { state, completed: [] };
  const stoppedSince = state.stop?.at ?? state.last;
  if (now - stoppedSince.timestamp < config.stopDurationMs) return { state, completed: [] };
  return state.stop
    ? finish(state, state.stop.at, state.stop.distanceM, config)
    : finish(state, state.last, state.distanceM, config);
}

export function step(
  state: DetectorState,
  sample: LocationSample,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  if (sample.accuracy !== null && sample.accuracy > config.maxAccuracyM) {
    return { state, completed: [] };
  }
  const fix = toFix(sample);
  const speed = knownSpeed(sample);

  if (state.mode === 'idle') {
    const anchor = state.anchor;
    if (anchor && fix.timestamp <= anchor.timestamp) return { state, completed: [] };
    const moved = anchor ? distanceMeters(anchor, fix) : 0;
    const fastEnough = speed !== null && speed >= config.startSpeedMps;
    if (!anchor || (!fastEnough && moved < config.startDistanceM)) {
      // Still parked: keep the anchor where the car sits, not wherever GPS drifts.
      return { state: { mode: 'idle', anchor: anchor && moved < config.stopRadiusM ? anchor : fix }, completed: [] };
    }
    // The drive started where the car was parked, so count the distance from there.
    const elapsedS = Math.max(1, (fix.timestamp - anchor.timestamp) / 1000);
    const plausible = moved / elapsedS <= config.maxPlausibleSpeedMps;
    return {
      state: {
        mode: 'driving',
        start: anchor,
        last: plausible ? fix : anchor,
        distanceM: plausible ? moved : 0,
        maxSpeedMps: Math.max(speed ?? 0, plausible ? Math.min(moved / elapsedS, config.maxPlausibleSpeedMps) : 0),
        route: plausible
          ? [
              { latitude: anchor.latitude, longitude: anchor.longitude },
              { latitude: fix.latitude, longitude: fix.longitude },
            ]
          : [{ latitude: anchor.latitude, longitude: anchor.longitude }],
        stop: null,
      },
      completed: [],
    };
  }

  if (fix.timestamp <= state.last.timestamp) return { state, completed: [] };

  // A long silence with the car still near its last fix means the trip ended then.
  const silenceMs = fix.timestamp - state.last.timestamp;
  const hop = distanceMeters(state.last, fix);
  if (silenceMs >= config.stopDurationMs && hop < config.stopRadiusM) {
    const ended = state.stop
      ? finish(state, state.stop.at, state.stop.distanceM, config)
      : finish(state, state.last, state.distanceM, config);
    return { state: { mode: 'idle', anchor: fix }, completed: ended.completed };
  }

  const impliedSpeed = hop / Math.max(1, silenceMs / 1000);
  if (impliedSpeed > config.maxPlausibleSpeedMps) return { state, completed: [] }; // GPS jump

  const distanceM = state.distanceM + hop;
  const maxSpeedMps = Math.max(state.maxSpeedMps, speed ?? Math.min(impliedSpeed, config.maxPlausibleSpeedMps));
  const lastRoute = state.route[state.route.length - 1];
  const route =
    !lastRoute || distanceMeters(lastRoute, fix) >= config.routePointSpacingM
      ? [...state.route, { latitude: fix.latitude, longitude: fix.longitude }]
      : state.route;

  let stop = state.stop;
  const stillMoving = speed !== null && speed >= config.startSpeedMps;
  if (!stop || stillMoving || distanceMeters(stop.at, fix) > config.stopRadiusM) {
    // Moving on: this fix is the latest place a stop could begin.
    stop = { at: fix, distanceM };
  } else if (fix.timestamp - stop.at.timestamp >= config.stopDurationMs) {
    // Parked long enough. End where the stop began; jitter while parked isn't mileage.
    return finish({ ...state, route }, stop.at, stop.distanceM, config);
  }

  return {
    state: { ...state, last: fix, distanceM, maxSpeedMps, route, stop },
    completed: [],
  };
}

/** Runs a batch of samples (as delivered by the OS) through the detector. */
export function stepAll(
  state: DetectorState,
  samples: readonly LocationSample[],
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  const completed: DetectedTrip[] = [];
  let current = state;
  const ordered = [...samples].sort((a, b) => a.timestamp - b.timestamp);
  for (const sample of ordered) {
    const result = step(current, sample, config);
    current = result.state;
    completed.push(...result.completed);
  }
  return { state: current, completed };
}
