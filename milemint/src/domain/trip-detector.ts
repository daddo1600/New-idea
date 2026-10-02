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
  /**
   * The phone's `Date#getTimezoneOffset()` (minutes) when the fix was taken,
   * so a drive keeps the calendar date of where it started even if it's saved
   * after crossing into another time zone.
   */
  utcOffsetMin?: number | null;
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
  /**
   * Keep a route point for the map at most every this many metres. Distance is
   * measured along these points too, so GPS jitter while stopped isn't mileage.
   */
  routePointSpacingM: number;
  /** Below this reported speed, leaving a stop on foot doesn't restart the drive (m/s). */
  walkingPaceMps: number;
  /**
   * How far the first fix after a geofence exit may be from where the car was
   * parked without the time to get there: iOS reports the exit late (metres).
   */
  startSlackM: number;
  /** A phone that settles somewhere new (not a drive) for this long is parked there (ms). */
  settleMs: number;
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
  walkingPaceMps: 2.5, // ~5.5 mph
  startSlackM: 1000,
  settleMs: 2 * 60_000,
};

type Fix = LatLng & { timestamp: number };

export type DetectedTrip = {
  startedAt: number;
  endedAt: number;
  start: LatLng;
  end: LatLng;
  distanceMeters: number;
  route: LatLng[];
  /**
   * When the car was at each route point (epoch ms), same length as `route`.
   * Absent for drives restored from state saved by older versions: a drive is
   * then cut (at the end of a shift) as if driven at a steady pace.
   */
  routeTimes?: number[];
  /** `getTimezoneOffset()` when the drive started; null when unknown. */
  utcOffsetMin?: number | null;
};

export type DetectorState =
  | {
      mode: 'idle';
      anchor: Fix | null;
      /**
       * A fix away from the car that isn't a drive yet: a Wi-Fi or cell fix can
       * jump hundreds of metres while parked, so a drive only starts once a
       * second fix confirms it, and the car only moves once the phone settles.
       */
      candidate?: Fix | null;
    }
  | {
      mode: 'driving';
      start: Fix;
      last: Fix;
      /** Distance along the route up to `odo` (the latest route point). */
      distanceM: number;
      maxSpeedMps: number;
      /** Fastest speed the OS itself reported (absent in state saved by older versions). */
      reportedMaxSpeedMps?: number;
      route: LatLng[];
      /** Each route point's time; absent (or dropped) in state saved by older versions. */
      routeTimes?: number[];
      /**
       * Where a possible stop began, and the distance driven up to it. `still`
       * is set when the phone has since moved off slowly (a walk from the
       * car, or a crawl in a jam): where it last came to rest.
       */
      stop: { at: Fix; distanceM: number; routeLength?: number; still?: Fix | null } | null;
      /** The latest route point, with its time (absent in older state: `last`). */
      odo?: Fix;
      /** Speed reported with `last`, when known. */
      lastSpeedMps?: number | null;
      utcOffsetMin?: number | null;
    };

type Driving = Extract<DetectorState, { mode: 'driving' }>;

export const INITIAL_DETECTOR_STATE: DetectorState = { mode: 'idle', anchor: null };

export type StepResult = { state: DetectorState; completed: DetectedTrip[] };

function toFix(s: LocationSample): Fix {
  return { latitude: s.latitude, longitude: s.longitude, timestamp: s.timestamp };
}

const point = (p: LatLng): LatLng => ({ latitude: p.latitude, longitude: p.longitude });

function knownSpeed(s: LocationSample): number | null {
  return typeof s.speed === 'number' && Number.isFinite(s.speed) && s.speed >= 0 ? s.speed : null;
}

function validPoint(p: unknown): p is LatLng {
  const q = p as Partial<LatLng> | null | undefined;
  return (
    !!q &&
    typeof q.latitude === 'number' &&
    typeof q.longitude === 'number' &&
    Number.isFinite(q.latitude) &&
    Number.isFinite(q.longitude) &&
    Math.abs(q.latitude) <= 90 &&
    Math.abs(q.longitude) <= 180
  );
}

function validFix(p: unknown): p is Fix {
  return validPoint(p) && Number.isFinite((p as Partial<Fix>).timestamp);
}

/** A fix the OS delivered broken (NaN, missing, or negative accuracy) is dropped, not trusted. */
export function isValidSample(s: LocationSample): boolean {
  if (!validFix(s)) return false;
  const accuracy = s.accuracy as number | null | undefined;
  return accuracy === null || accuracy === undefined || (Number.isFinite(accuracy) && accuracy >= 0);
}

/**
 * Repairs state restored from storage: JSON turns NaN into null, and older
 * versions could save a poisoned fix. Anything unusable is dropped rather than
 * allowed to break every later trip.
 */
export function sanitizeDetectorState(state: unknown): DetectorState {
  const s = state as Partial<DetectorState> | null | undefined;
  if (!s || typeof s !== 'object') return INITIAL_DETECTOR_STATE;
  if (s.mode === 'driving') {
    const d = s as Partial<Driving>;
    if (!validFix(d.start) || !validFix(d.last)) return INITIAL_DETECTOR_STATE;
    const route = Array.isArray(d.route) ? d.route.filter(validPoint) : [];
    // Times only line up with the points if none was dropped.
    const routeTimes =
      Array.isArray(d.routeTimes) &&
      Array.isArray(d.route) &&
      d.routeTimes.length === d.route.length &&
      route.length === d.route.length &&
      d.routeTimes.every((time) => Number.isFinite(time))
        ? d.routeTimes
        : undefined;
    if (route.length === 0) route.push(point(d.start));
    const odo = validFix(d.odo) ? d.odo : undefined;
    let distanceM = Number.isFinite(d.distanceM) ? (d.distanceM as number) : NaN;
    if (!Number.isFinite(distanceM)) {
      // Rebuild along the route; the last route point then stands in for `odo`.
      distanceM = 0;
      for (let i = 1; i < route.length; i++) distanceM += distanceMeters(route[i - 1], route[i]);
    }
    const stop =
      d.stop && validFix(d.stop.at) && Number.isFinite(d.stop.distanceM)
        ? { ...d.stop, still: validFix(d.stop.still) ? d.stop.still : null }
        : null;
    const finite = (n: unknown, fallback: number) => (Number.isFinite(n) ? (n as number) : fallback);
    return {
      ...d,
      mode: 'driving',
      start: d.start,
      last: d.last,
      distanceM,
      maxSpeedMps: finite(d.maxSpeedMps, 0),
      reportedMaxSpeedMps: d.reportedMaxSpeedMps === undefined ? undefined : finite(d.reportedMaxSpeedMps, 0),
      route,
      routeTimes,
      stop,
      odo: odo ?? (Number.isFinite(d.distanceM) ? undefined : { ...route[route.length - 1], timestamp: d.last.timestamp }),
      lastSpeedMps: Number.isFinite(d.lastSpeedMps) ? d.lastSpeedMps : null,
      utcOffsetMin: Number.isFinite(d.utcOffsetMin) ? d.utcOffsetMin : null,
    };
  }
  const idle = s as Partial<Extract<DetectorState, { mode: 'idle' }>>;
  return {
    mode: 'idle',
    anchor: validFix(idle.anchor) ? idle.anchor : null,
    candidate: validFix(idle.candidate) ? idle.candidate : null,
  };
}

const odoOf = (state: Driving): Fix => state.odo ?? state.last;

/** Distance driven so far, up to `at` (a fix after the latest route point). */
function distanceTo(state: Driving, at: LatLng): number {
  return state.distanceM + distanceMeters(odoOf(state), at);
}

/** Live distance of a drive in progress (for the UI). */
export function currentDistanceM(state: DetectorState): number {
  if (state.mode !== 'driving') return 0;
  return state.stop ? state.stop.distanceM : distanceTo(state, state.last);
}

function finish(
  state: Driving,
  end: Fix,
  distanceM: number,
  config: DetectorConfig,
  routeLength?: number,
  /** Where the phone is now, if it has moved on from the end (walked off). */
  phoneAt?: Fix,
): StepResult {
  const idle: DetectorState = { mode: 'idle', anchor: phoneAt ?? end };
  // Real driving reports its speed. Without that, only trust a trip that ended
  // somewhere else: a "drive" out and back to the car built from GPS jumps is noise.
  const reportedDriving = (state.reportedMaxSpeedMps ?? state.maxSpeedMps) >= config.minPeakSpeedMps;
  const endedElsewhere = distanceMeters(state.start, end) >= config.startDistanceM;
  // Noisy fixes with no speed can make a walk look quick in places, but not
  // on average.
  const averageMps = distanceM / Math.max(1, (end.timestamp - state.start.timestamp) / 1000);
  const isDrive =
    distanceM >= config.minTripDistanceM &&
    state.maxSpeedMps >= config.minPeakSpeedMps &&
    (reportedDriving || (endedElsewhere && averageMps >= config.walkingPaceMps));
  if (!isDrive) return { state: idle, completed: [] };
  // Route points after the stop began (a walk from the car) aren't part of the drive.
  const kept = Math.max(1, routeLength ?? state.route.length);
  const route = state.route.slice(0, kept);
  const routeTimes = state.routeTimes?.slice(0, kept);
  const lastRoute = route[route.length - 1];
  if (!lastRoute || distanceMeters(lastRoute, end) > 1) {
    route.push(point(end));
    routeTimes?.push(end.timestamp);
  }
  return {
    state: idle,
    completed: [
      {
        startedAt: state.start.timestamp,
        endedAt: end.timestamp,
        start: point(state.start),
        end: point(end),
        distanceMeters: Math.round(distanceM),
        route,
        ...(routeTimes && routeTimes.length === route.length ? { routeTimes } : {}),
        utcOffsetMin: state.utcOffsetMin ?? null,
      },
    ],
  };
}

/** Ends the trip where the car stopped (or was last seen). */
function finishAtStop(state: Driving, config: DetectorConfig): StepResult {
  return state.stop
    ? finish(state, state.stop.at, state.stop.distanceM, config, state.stop.routeLength)
    : finish(state, state.last, distanceTo(state, state.last), config);
}

/** Ends a trip if no samples have arrived for a full stop duration (e.g. GPS paused after parking). */
export function flush(
  state: DetectorState,
  now: number,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  if (state.mode !== 'driving') return { state, completed: [] };
  const stoppedSince = state.stop ? (state.stop.still ?? state.stop.at) : state.last;
  if (now - stoppedSince.timestamp < config.stopDurationMs) return { state, completed: [] };
  return finishAtStop(state, config);
}

/**
 * Ends a drive in progress right now, where the car stopped or was last seen
 * (tracking switched off mid-drive), instead of waiting out the stop window.
 */
export function finishNow(state: DetectorState, config: DetectorConfig = DEFAULT_DETECTOR_CONFIG): StepResult {
  if (state.mode !== 'driving') return { state, completed: [] };
  return finishAtStop(state, config);
}

function startDriving(
  start: Fix,
  fix: Fix,
  sample: LocationSample,
  speed: number | null,
  config: DetectorConfig,
): Driving {
  const moved = distanceMeters(start, fix);
  const elapsedS = Math.max(1, (fix.timestamp - start.timestamp) / 1000);
  const plausible = moved / elapsedS <= config.maxPlausibleSpeedMps;
  // The parked point's time is when the geofence fired, not when the car left,
  // so the implied speed from it is meaningless (a walk out of the geofence
  // looks fast): only the OS's speed counts here, the route gives the rest.
  const counts = plausible && moved > 0;
  return {
    mode: 'driving',
    start,
    last: plausible ? fix : start,
    distanceM: counts ? moved : 0,
    maxSpeedMps: speed ?? 0,
    reportedMaxSpeedMps: speed ?? 0,
    route: counts ? [point(start), point(fix)] : [point(start)],
    routeTimes: counts ? [start.timestamp, fix.timestamp] : [start.timestamp],
    odo: counts ? fix : start,
    lastSpeedMps: plausible ? speed : null,
    stop: null,
    utcOffsetMin: Number.isFinite(sample.utcOffsetMin) ? sample.utcOffsetMin : null,
  };
}

function stepIdle(
  state: Extract<DetectorState, { mode: 'idle' }>,
  sample: LocationSample,
  config: DetectorConfig,
): StepResult {
  const fix = toFix(sample);
  const speed = knownSpeed(sample);
  const anchor = state.anchor;
  if (!anchor) return { state: { mode: 'idle', anchor: fix }, completed: [] };
  if (fix.timestamp <= anchor.timestamp) return { state, completed: [] };
  const moved = distanceMeters(anchor, fix);
  const fastEnough = speed !== null && speed >= config.startSpeedMps;
  if (!fastEnough && moved < config.stopRadiusM) {
    // Still parked: keep the anchor where the car sits, not wherever GPS drifts.
    return { state: { mode: 'idle', anchor }, completed: [] };
  }

  // The anchor's time is when the geofence fired, after the car had already
  // gone some way, hence the slack.
  const reachable = (from: Fix, to: Fix) =>
    distanceMeters(from, to) <=
    config.maxPlausibleSpeedMps * Math.max(1, (to.timestamp - from.timestamp) / 1000) + config.startSlackM;
  if (!reachable(anchor, fix)) {
    // Too far to have got here since the anchor: the anchor is stale (app
    // killed mid-drive, geofence re-armed at an old spot) or this fix is junk.
    // Never count that jump as mileage.
    if (fastEnough) return { state: startDriving(fix, fix, sample, speed, config), completed: [] };
    const candidate = state.candidate;
    if (
      candidate &&
      fix.timestamp > candidate.timestamp &&
      distanceMeters(candidate, fix) < config.stopRadiusM &&
      !reachable(anchor, candidate)
    ) {
      // Two fixes agree the phone is somewhere else: that's where it is now.
      return { state: { mode: 'idle', anchor: candidate }, completed: [] };
    }
    return { state: { mode: 'idle', anchor, candidate: fix }, completed: [] };
  }

  if (fastEnough) return { state: startDriving(anchor, fix, sample, speed, config), completed: [] };
  if (speed !== null && speed < config.walkingPaceMps) {
    // On foot (the OS says so): the phone is going somewhere without the car.
    return { state: { mode: 'idle', anchor: fix }, completed: [] };
  }

  // Away from the car without driving speed (no speed reported, or a crawl):
  // don't drag the anchor along; a drive starts once a second fix confirms it.
  const candidate = state.candidate;
  if (candidate && fix.timestamp > candidate.timestamp) {
    const fromCandidate = distanceMeters(candidate, fix);
    const confirmed =
      distanceMeters(anchor, candidate) >= config.startDistanceM &&
      fromCandidate / Math.max(1, (fix.timestamp - candidate.timestamp) / 1000) <= config.maxPlausibleSpeedMps;
    if (confirmed) return { state: startDriving(anchor, fix, sample, speed, config), completed: [] };
    if (fromCandidate < config.stopRadiusM) {
      // Settled somewhere new nearby (walked to a neighbour's): the phone is parked there now.
      if (fix.timestamp - candidate.timestamp >= config.settleMs) {
        return { state: { mode: 'idle', anchor: candidate }, completed: [] };
      }
      return { state: { mode: 'idle', anchor, candidate }, completed: [] };
    }
  }
  return { state: { mode: 'idle', anchor, candidate: fix }, completed: [] };
}

export function step(
  state: DetectorState,
  sample: LocationSample,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  if (!isValidSample(sample)) return { state, completed: [] };
  if (sample.accuracy !== null && sample.accuracy !== undefined && sample.accuracy > config.maxAccuracyM) {
    return { state, completed: [] };
  }
  if (state.mode === 'idle') return stepIdle(state, sample, config);

  const fix = toFix(sample);
  const speed = knownSpeed(sample);
  if (fix.timestamp <= state.last.timestamp) return { state, completed: [] };

  const silenceMs = fix.timestamp - state.last.timestamp;
  const silenceS = Math.max(1, silenceMs / 1000);
  const hop = distanceMeters(state.last, fix);
  const impliedSpeed = hop / silenceS;

  // A long silence (underground car park, app killed) ends the trip where the
  // car was last seen, unless covering the gap needed driving speed (a tunnel).
  if (silenceMs >= config.stopDurationMs && (hop < config.stopRadiusM || impliedSpeed < config.startSpeedMps)) {
    const ended = finishAtStop(state, config);
    const end = ended.state.mode === 'idle' && ended.state.anchor ? ended.state.anchor : state.last;
    // Start watching for the next drive from where the car was left; it left
    // some time before this fix, so the parked time isn't counted.
    const parked: DetectorState = { mode: 'idle', anchor: { ...point(end), timestamp: fix.timestamp - 1 } };
    const next = stepIdle(parked, sample, config);
    return { state: next.state, completed: [...ended.completed, ...next.completed] };
  }

  if (impliedSpeed > config.maxPlausibleSpeedMps) return { state, completed: [] }; // GPS jump
  // Further than the car could have gone at the speed the OS reports: a jump.
  const refSpeed = Math.max(speed ?? -1, state.lastSpeedMps ?? -1);
  if (refSpeed >= 0 && silenceS <= 60 && hop > (refSpeed * 1.5 + 10) * silenceS + 100) {
    return { state, completed: [] };
  }

  // Distance is measured between route points at least `routePointSpacingM`
  // apart, so jitter while stopped (lights, drops) doesn't add up.
  let route = state.route;
  let routeTimes = state.routeTimes;
  let distanceM = state.distanceM;
  let odo = odoOf(state);
  let maxSpeedMps = state.maxSpeedMps;
  const fromOdo = distanceMeters(odo, fix);
  // Imprecise fixes wander further, so they need a longer baseline.
  const spacingM = Math.max(config.routePointSpacingM, 2 * (sample.accuracy ?? 0));
  let segmentSpeed: number | null = null;
  if (fromOdo >= spacingM) {
    // Speed over the route segment: steadier than fix-to-fix with GPS noise.
    segmentSpeed = fromOdo / Math.max(1, (fix.timestamp - odo.timestamp) / 1000);
    const a = route.length >= 2 ? route[route.length - 2] : null;
    const b = route[route.length - 1];
    const ab = a ? distanceMeters(a, b) : 0;
    const ac = a ? distanceMeters(a, fix) : 0;
    if (a && ab > 500 && fromOdo > 500 && ab + fromOdo > 2 * ac + 500 && distanceMeters(b, odo) < 1) {
      // A→B→C where B is far off and C back near A: B was a GPS spike.
      route = [...route.slice(0, -1), point(fix)];
      routeTimes = routeTimes && [...routeTimes.slice(0, -1), fix.timestamp];
      distanceM = distanceM - ab + ac;
    } else {
      route = [...route, point(fix)];
      routeTimes = routeTimes && [...routeTimes, fix.timestamp];
      distanceM += fromOdo;
      // Not from the parked point, though: its time is when the geofence fired.
      const fromStart = odo.timestamp === state.start.timestamp && distanceMeters(odo, state.start) < 1;
      if (speed === null && !fromStart) {
        maxSpeedMps = Math.max(maxSpeedMps, Math.min(segmentSpeed, config.maxPlausibleSpeedMps));
      }
    }
    odo = fix;
  }
  if (speed !== null) maxSpeedMps = Math.max(maxSpeedMps, speed);
  const reportedMaxSpeedMps = Math.max(state.reportedMaxSpeedMps ?? state.maxSpeedMps, speed ?? 0);
  const next: Driving = {
    ...state,
    last: fix,
    distanceM,
    maxSpeedMps,
    reportedMaxSpeedMps,
    route,
    routeTimes,
    odo,
    lastSpeedMps: speed,
  };

  let stop = state.stop;
  const stillMoving = speed !== null && speed >= config.startSpeedMps;
  // Leaving the stop only counts as driving on at more than walking pace
  // (measured over a route segment, not one noisy hop): a walk from the
  // parked car isn't part of the drive. A crawl in a jam still is.
  const leftStop =
    !!stop &&
    segmentSpeed !== null &&
    distanceMeters(stop.at, fix) > config.stopRadiusM &&
    (speed !== null
      ? speed >= config.walkingPaceMps && segmentSpeed >= config.walkingPaceMps
      : segmentSpeed >= config.startSpeedMps);
  if (!stop || stillMoving || leftStop) {
    // Moving on: this fix is the latest place a stop could begin.
    stop = { at: fix, distanceM: distanceTo(next, fix), routeLength: route.length };
  } else if (distanceMeters(stop.at, fix) <= config.stopRadiusM && !stop.still) {
    if (fix.timestamp - stop.at.timestamp >= config.stopDurationMs) {
      // Parked long enough. End where the stop began; jitter while parked isn't mileage.
      return finish(next, stop.at, stop.distanceM, config, stop.routeLength);
    }
  } else {
    // Moving off slowly: a walk from the parked car, or a crawl in a jam. Only
    // driving pace again (above) says it was a jam; coming to rest somewhere
    // for the stop duration, or creeping along for too long, says it was a
    // walk, and the trip ends back where the car stopped.
    const still = stop.still && distanceMeters(stop.still, fix) <= config.stopRadiusM ? stop.still : fix;
    if (
      fix.timestamp - still.timestamp >= config.stopDurationMs ||
      fix.timestamp - stop.at.timestamp >= 3 * config.stopDurationMs
    ) {
      // Watch for the next drive from where the phone is, not the car park.
      return finish(next, stop.at, stop.distanceM, config, stop.routeLength, { ...point(fix), timestamp: fix.timestamp });
    }
    stop = { ...stop, still };
  }

  return { state: { ...next, stop }, completed: [] };
}

/**
 * Whether `step` would end the drive in progress because of a long silence
 * before `sample` (the app was killed, GPS stopped): where the car was last
 * seen and where the phone turned up. Read-only: it changes nothing about
 * detection, it lets the tracker note that miles in between may be missing.
 */
export function silenceGap(
  state: DetectorState,
  sample: LocationSample,
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): { from: Fix; to: Fix } | null {
  if (state.mode !== 'driving' || !isValidSample(sample)) return null;
  if (sample.accuracy !== null && sample.accuracy !== undefined && sample.accuracy > config.maxAccuracyM) return null;
  const fix = toFix(sample);
  const silenceMs = fix.timestamp - state.last.timestamp;
  if (silenceMs < config.stopDurationMs) return null;
  const hop = distanceMeters(state.last, fix);
  const impliedSpeed = hop / Math.max(1, silenceMs / 1000);
  // The same test as `step`: anything else is bridged as a tunnel and counted.
  if (hop >= config.stopRadiusM && impliedSpeed >= config.startSpeedMps) return null;
  return { from: state.last, to: fix };
}

/** Runs a batch of samples (as delivered by the OS) through the detector. */
export function stepAll(
  state: DetectorState,
  samples: readonly LocationSample[],
  config: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): StepResult {
  const completed: DetectedTrip[] = [];
  let current = state;
  const ordered = samples.filter(isValidSample).sort((a, b) => a.timestamp - b.timestamp);
  for (const sample of ordered) {
    const result = step(current, sample, config);
    current = result.state;
    completed.push(...result.completed);
  }
  return { state: current, completed };
}
