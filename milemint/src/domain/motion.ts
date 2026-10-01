import type { DroppedWalk, TrackerRecord } from './tracker-policy';

/**
 * What iOS's motion coprocessor (Motion & Fitness) says the phone was doing
 * while the GPS thought it was driving.
 *
 * The detector works from location alone, so a brisk walk with GPS drift, or
 * a walk along a road, can look like a slow drive. iOS records the phone's
 * activity all day for almost no battery, and reading it back for a drive's
 * window tells a walk from a drive.
 *
 * Deliberately conservative: a detected drive is only dropped when the phone
 * was clearly walking for most of the window, hardly ever in a vehicle, and
 * the GPS distance is walkable in that time. No data, all low confidence,
 * or anything mixed means "keep it", exactly as without motion data.
 */

/** One change of activity, lasting until the next starts. Same shape as modules/motion-activity. */
export type MotionSample = {
  /** Epoch ms when this activity started. */
  at: number;
  /** 0 low, 1 medium, 2 high. */
  confidence: 0 | 1 | 2;
  automotive: boolean;
  cycling: boolean;
  walking: boolean;
  running: boolean;
  stationary: boolean;
  unknown: boolean;
};

export type MotionKind = 'automotive' | 'cycling' | 'walking' | 'running' | 'stationary';

/** Time in each activity over a window, with medium or high confidence only. */
export type MotionSummary = {
  windowMs: number;
  /** Time iOS reported something for, with medium or high confidence. */
  coveredMs: number;
  ms: Record<MotionKind, number>;
  /** `ms` as shares of the whole window (0–1), so uncovered time counts against every activity. */
  share: Record<MotionKind, number>;
};

/**
 *   drive    clearly in a vehicle for a meaningful part of the window
 *   walk     clearly on foot: the detector mistook a walk for a drive
 *   cycle    mostly cycling (a bike mode could use it later)
 *   unknown  no data, or nothing clear
 */
export type MotionVerdict = 'drive' | 'walk' | 'cycle' | 'unknown';

/** At least this share of the window on foot (walking or running) for a walk. */
export const WALK_SHARE = 0.6;
/** At least this share cycling for a bike ride. */
export const CYCLE_SHARE = 0.6;
/** A vehicle for this share of the window, or for `DRIVE_MIN_MS`, and the trip is a drive whatever else it holds. */
export const DRIVE_SHARE = 0.1;
export const DRIVE_MIN_MS = 60_000;
/** Faster than this on average (metres a second, 15 km/h) and it can't have been a walk, whatever the motion data says. */
export const WALK_MAX_SPEED_MPS = 15 / 3.6;

const KINDS: readonly MotionKind[] = ['automotive', 'cycling', 'walking', 'running', 'stationary'];

/**
 * Which activity a sample counts as. Several flags can be set at once: in a
 * car at a red light iOS reports automotive and stationary, which counts as
 * automotive (that's what keeps a traffic jam a drive).
 */
export function motionKind(sample: MotionSample): MotionKind | null {
  if (sample.automotive) return 'automotive';
  if (sample.cycling) return 'cycling';
  if (sample.running) return 'running';
  if (sample.walking) return 'walking';
  if (sample.stationary) return 'stationary';
  return null;
}

const zeros = (): Record<MotionKind, number> => ({ automotive: 0, cycling: 0, walking: 0, running: 0, stationary: 0 });

/**
 * Time-weighted activity over [fromMs, toMs]. Each sample lasts until the
 * next one starts (the last until `toMs`); a sample from before the window
 * covers its start. Low-confidence samples, ones with no activity and
 * malformed ones count as nothing.
 */
export function summarizeMotion(samples: readonly MotionSample[], fromMs: number, toMs: number): MotionSummary {
  const windowMs = Number.isFinite(fromMs) && Number.isFinite(toMs) ? Math.max(0, toMs - fromMs) : 0;
  const ms = zeros();
  let coveredMs = 0;
  if (windowMs > 0) {
    const sorted = samples.filter((s) => Number.isFinite(s.at)).sort((a, b) => a.at - b.at);
    for (let index = 0; index < sorted.length; index++) {
      const sample = sorted[index];
      const start = Math.max(sample.at, fromMs);
      const end = Math.min(index + 1 < sorted.length ? sorted[index + 1].at : toMs, toMs);
      if (end <= start) continue;
      const kind = sample.confidence >= 1 ? motionKind(sample) : null;
      if (!kind) continue;
      ms[kind] += end - start;
      coveredMs += end - start;
    }
  }
  const share = zeros();
  for (const kind of KINDS) share[kind] = windowMs > 0 ? ms[kind] / windowMs : 0;
  return { windowMs, coveredMs, ms, share };
}

/**
 * The verdict for a detected drive. `distanceMeters` is what the GPS
 * measured over the same window: a "walk" that covered more ground than
 * anyone walks or runs in that time is kept.
 */
export function motionVerdict(summary: MotionSummary, distanceMeters: number): MotionVerdict {
  if (summary.windowMs <= 0 || summary.coveredMs <= 0) return 'unknown';
  const { ms, share } = summary;
  // Never drop a trip with real time in a vehicle (a drive that ended with a walk).
  if (share.automotive >= DRIVE_SHARE || ms.automotive >= DRIVE_MIN_MS) return 'drive';
  const speed = Number.isFinite(distanceMeters) ? distanceMeters / (summary.windowMs / 1000) : Infinity;
  if (share.walking + share.running >= WALK_SHARE && speed <= WALK_MAX_SPEED_MPS) return 'walk';
  if (share.cycling >= CYCLE_SHARE) return 'cycle';
  return 'unknown';
}

/** The parts of a detected drive the verdict needs (epoch ms, metres). */
export type DetectedTripWindow = { startedAt: number; endedAt: number; distanceMeters: number };

/** A detected drive's window: summary and verdict in one. */
export function judgeTrip(samples: readonly MotionSample[], trip: DetectedTripWindow): MotionVerdict {
  return motionVerdict(summarizeMotion(samples, trip.startedAt, trip.endedAt), trip.distanceMeters);
}

/** How many dropped walks the tracker record keeps. */
export const DROPPED_WALKS_KEPT = 10;

/** The tracker record with these walks noted (newest last, capped); unchanged when there are none. */
export function withDroppedWalks(record: TrackerRecord, walks: readonly DetectedTripWindow[]): TrackerRecord {
  if (walks.length === 0) return record;
  const added: DroppedWalk[] = walks.map((walk) => ({
    startedAt: walk.startedAt,
    endedAt: walk.endedAt,
    distanceM: Math.round(walk.distanceMeters),
  }));
  return { ...record, droppedWalks: [...(record.droppedWalks ?? []), ...added].slice(-DROPPED_WALKS_KEPT) };
}
