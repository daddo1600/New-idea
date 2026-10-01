import { describe, expect, it } from '@jest/globals';

import {
  DROPPED_WALKS_KEPT,
  judgeTrip,
  motionKind,
  motionVerdict,
  summarizeMotion,
  withDroppedWalks,
  type MotionSample,
} from '../motion';
import { INITIAL_TRACKER_RECORD } from '../tracker-policy';

const T0 = Date.UTC(2026, 9, 1, 8, 0, 0);
const MIN = 60_000;

type Kind = 'automotive' | 'cycling' | 'walking' | 'running' | 'stationary' | 'unknown' | 'none';

/** A sample starting `minutes` after T0. */
function at(minutes: number, kind: Kind | Kind[], confidence: 0 | 1 | 2 = 2): MotionSample {
  const kinds = Array.isArray(kind) ? kind : [kind];
  return {
    at: T0 + minutes * MIN,
    confidence,
    automotive: kinds.includes('automotive'),
    cycling: kinds.includes('cycling'),
    walking: kinds.includes('walking'),
    running: kinds.includes('running'),
    stationary: kinds.includes('stationary'),
    unknown: kinds.includes('unknown'),
  };
}

/** A trip from T0 to `minutes` later, over `km`. */
const trip = (minutes: number, km: number) => ({ startedAt: T0, endedAt: T0 + minutes * MIN, distanceMeters: km * 1000 });

describe('summarizeMotion', () => {
  it('weights each activity by how long it lasted, until the next one or the end of the window', () => {
    const summary = summarizeMotion([at(0, 'walking'), at(6, 'automotive')], T0, T0 + 10 * MIN);
    expect(summary.ms.walking).toBe(6 * MIN);
    expect(summary.ms.automotive).toBe(4 * MIN);
    expect(summary.share.walking).toBeCloseTo(0.6);
    expect(summary.coveredMs).toBe(10 * MIN);
  });

  it('lets a sample from before the window cover its start, and ignores what comes after it', () => {
    const summary = summarizeMotion([at(-30, 'walking'), at(5, 'automotive'), at(20, 'walking')], T0, T0 + 10 * MIN);
    expect(summary.ms.walking).toBe(5 * MIN);
    expect(summary.ms.automotive).toBe(5 * MIN);
  });

  it('sorts samples that arrive out of order', () => {
    const summary = summarizeMotion([at(6, 'automotive'), at(0, 'walking')], T0, T0 + 10 * MIN);
    expect(summary.ms.walking).toBe(6 * MIN);
  });

  it('counts low confidence, no activity, and malformed samples as nothing', () => {
    const summary = summarizeMotion(
      [at(0, 'walking', 0), at(2, 'none'), at(4, 'unknown'), { ...at(6, 'walking'), at: Number.NaN }],
      T0,
      T0 + 10 * MIN,
    );
    expect(summary.coveredMs).toBe(0);
  });

  it('is empty for an empty or backwards window', () => {
    expect(summarizeMotion([at(0, 'walking')], T0, T0).windowMs).toBe(0);
    expect(summarizeMotion([at(0, 'walking')], T0 + MIN, T0).coveredMs).toBe(0);
  });

  it('counts automotive while stationary (a red light) as automotive', () => {
    expect(motionKind(at(0, ['automotive', 'stationary']))).toBe('automotive');
    expect(motionKind(at(0, ['walking', 'stationary']))).toBe('walking');
  });
});

describe('motionVerdict', () => {
  it('is unknown with no data', () => {
    expect(judgeTrip([], trip(10, 0.8))).toBe('unknown');
  });

  it('is unknown when everything is low confidence', () => {
    expect(judgeTrip([at(0, 'walking', 0)], trip(10, 0.8))).toBe('unknown');
  });

  it('calls a walk a walk', () => {
    expect(judgeTrip([at(-2, 'walking')], trip(15, 1.2))).toBe('walk');
    expect(judgeTrip([at(0, 'running', 1)], trip(20, 3.5))).toBe('walk');
  });

  it('needs most of the window on foot: a short walk in a mostly unknown window stays', () => {
    expect(judgeTrip([at(0, 'walking'), at(4, 'unknown')], trip(10, 0.5))).toBe('unknown');
  });

  it('keeps a "walk" that covered more ground than anyone walks', () => {
    // 6 km in 15 minutes is 24 km/h: the GPS saw a vehicle, whatever the phone felt.
    expect(judgeTrip([at(0, 'walking')], trip(15, 6))).toBe('unknown');
  });

  it('keeps a drive that ended with a walk', () => {
    expect(judgeTrip([at(0, 'automotive'), at(20, 'walking')], trip(25, 12))).toBe('drive');
  });

  it('keeps a drive that was mostly a walk but had a minute or more in a vehicle', () => {
    // 2 minutes of 30 is under 10%, but still real time in a car.
    expect(judgeTrip([at(0, 'walking'), at(10, 'automotive'), at(12, 'walking')], trip(30, 2))).toBe('drive');
  });

  it('keeps a traffic jam a drive', () => {
    const samples = [at(0, 'automotive'), at(5, ['automotive', 'stationary']), at(25, 'stationary'), at(35, 'automotive')];
    expect(judgeTrip(samples, trip(40, 8))).toBe('drive');
  });

  it('calls mostly cycling a bike ride', () => {
    expect(judgeTrip([at(0, 'cycling'), at(18, 'walking')], trip(20, 5))).toBe('cycle');
  });

  it('is unknown for a mix with nothing clear', () => {
    expect(judgeTrip([at(0, 'walking'), at(5, 'stationary')], trip(10, 0.4))).toBe('unknown');
  });

  it('is unknown, not a walk, when the summary is empty', () => {
    expect(motionVerdict(summarizeMotion([], T0, T0 + MIN), 10)).toBe('unknown');
  });
});

describe('withDroppedWalks', () => {
  it('leaves the record untouched when nothing was dropped', () => {
    expect(withDroppedWalks(INITIAL_TRACKER_RECORD, [])).toBe(INITIAL_TRACKER_RECORD);
  });

  it('notes walks, newest last, keeping only the latest few', () => {
    const walks = Array.from({ length: DROPPED_WALKS_KEPT + 3 }, (_, i) => ({
      startedAt: T0 + i * MIN,
      endedAt: T0 + i * MIN + 30_000,
      distanceMeters: 400.4,
    }));
    const record = withDroppedWalks(INITIAL_TRACKER_RECORD, walks);
    expect(record.droppedWalks).toHaveLength(DROPPED_WALKS_KEPT);
    expect(record.droppedWalks?.[DROPPED_WALKS_KEPT - 1]).toEqual({
      startedAt: T0 + (DROPPED_WALKS_KEPT + 2) * MIN,
      endedAt: T0 + (DROPPED_WALKS_KEPT + 2) * MIN + 30_000,
      distanceM: 400,
    });
  });
});
