import { describe, expect, it } from '@jest/globals';

import { STEM_SAMPLES, STEM_XS, STEM_YS, stemAt, stemSampleAt } from '../sprout';

describe('stemSampleAt', () => {
  it('starts at the foot of the stem and ends at its top', () => {
    expect(stemSampleAt(0)).toEqual({ x: STEM_XS[0], y: STEM_YS[0] });
    expect(stemSampleAt(1)).toEqual({ x: STEM_XS[STEM_SAMPLES], y: STEM_YS[STEM_SAMPLES] });
  });

  it('follows the stem in between', () => {
    const half = stemSampleAt(0.5);
    const [x, y] = [stemAt(0.5).x, stemAt(0.5).y];
    expect(half.x).toBeCloseTo(x, 1);
    expect(half.y).toBeCloseTo(y, 1);
  });

  // A timing's first frame can land a hair below 0: the car's position was NaN
  // there (STEM_XS[-1]), seen on set-up's "You're all set." hero.
  it('never gives NaN, whatever the progress', () => {
    for (const progress of [-0.0000347, -1, 1.02, 7, Number.NaN, Infinity, -Infinity]) {
      const spot = stemSampleAt(progress);
      expect(Number.isFinite(spot.x)).toBe(true);
      expect(Number.isFinite(spot.y)).toBe(true);
    }
    expect(stemSampleAt(-0.0000347)).toEqual(stemSampleAt(0));
    expect(stemSampleAt(1.02)).toEqual(stemSampleAt(1));
  });
});
