import { describe, expect, it } from '@jest/globals';

import type { MotionSample } from '@/domain/motion';

import { MotionActivity } from '../../../modules/motion-activity';
import { motionAskable, motionStatus, motionVerdictFor, screenDetectedTrips } from '../motion';

const T0 = Date.UTC(2026, 9, 1, 8, 0, 0);
const MIN = 60_000;
const drive = { startedAt: T0, endedAt: T0 + 15 * MIN, distanceMeters: 1200 };
const other = { startedAt: T0 + 60 * MIN, endedAt: T0 + 90 * MIN, distanceMeters: 30_000 };

const walking: MotionSample = {
  at: T0 - MIN,
  confidence: 2,
  automotive: false,
  cycling: false,
  walking: true,
  running: false,
  stationary: false,
  unknown: false,
};

/** A stand-in for the native module. */
function source(samples: () => Promise<MotionSample[]>, status: 'authorized' | 'denied' = 'authorized') {
  return { isAvailable: () => true, authorizationStatus: () => status, queryActivities: samples };
}

describe('without the native module (web, Jest, builds from before it)', () => {
  it('is unavailable and never asks', () => {
    expect(MotionActivity.isAvailable()).toBe(false);
    expect(motionStatus()).toBeNull();
    expect(motionAskable()).toBe(false);
  });

  it('saves every detected drive, in order, exactly as before', async () => {
    const trips = [drive, other];
    const { keep, walks } = await screenDetectedTrips(trips);
    expect(keep).toEqual(trips);
    expect(keep[0]).toBe(drive);
    expect(walks).toEqual([]);
    expect(await motionVerdictFor(drive)).toBe('unknown');
  });
});

describe('motionVerdictFor', () => {
  it('drops nothing without access', async () => {
    expect(await motionVerdictFor(drive, { source: source(async () => [walking], 'denied') })).toBe('unknown');
  });

  it('reads a walk', async () => {
    expect(await motionVerdictFor(drive, { source: source(async () => [walking]) })).toBe('walk');
  });

  it('gives up after the timeout, so saving is never held up', async () => {
    const never = source(() => new Promise<MotionSample[]>(() => {}));
    expect(await motionVerdictFor(drive, { source: never, timeoutMs: 20 })).toBe('unknown');
  });

  it('treats a failed query, or a strange answer, as unknown', async () => {
    expect(await motionVerdictFor(drive, { source: source(() => Promise.reject(new Error('nope'))) })).toBe('unknown');
    const odd = source(async () => null as unknown as MotionSample[]);
    expect(await motionVerdictFor(drive, { source: odd })).toBe('unknown');
    const throws = { ...source(async () => []), isAvailable: () => { throw new Error('gone'); } };
    expect(await motionVerdictFor(drive, { source: throws })).toBe('unknown');
  });
});

describe('screenDetectedTrips', () => {
  it('drops only clear walks', async () => {
    const verdicts = new Map([
      [drive, 'walk' as const],
      [other, 'drive' as const],
    ]);
    const { keep, walks } = await screenDetectedTrips([drive, other], async (trip) => verdicts.get(trip) ?? 'unknown');
    expect(keep).toEqual([other]);
    expect(walks).toEqual([drive]);
  });

  it('keeps bike rides and anything unclear', async () => {
    const { keep } = await screenDetectedTrips([drive, other], async (trip) => (trip === drive ? 'cycle' : 'unknown'));
    expect(keep).toEqual([drive, other]);
  });

  it('keeps a trip whose verdict failed', async () => {
    const { keep } = await screenDetectedTrips([drive], () => Promise.reject(new Error('nope')));
    expect(keep).toEqual([drive]);
  });
});
