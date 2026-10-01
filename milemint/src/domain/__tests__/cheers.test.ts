import { describe, expect, it } from '@jest/globals';

import { SHIFT_CHEERS, shiftCheer } from '../cheers';

describe('shiftCheer', () => {
  it('speaks the local lingo', () => {
    expect(SHIFT_CHEERS.GB).toContain(shiftCheer('GB', 0));
    expect(shiftCheer('GB', 0)).toBe('Tally ho! 🚗');
    expect(shiftCheer('AU', 0)).toBe('Righto, let’s go! 👍');
  });

  it('rotates through every cheer and wraps around', () => {
    const seen = new Set(Array.from({ length: SHIFT_CHEERS.US.length }, (_, i) => shiftCheer('US', i)));
    expect(seen.size).toBe(SHIFT_CHEERS.US.length);
    expect(shiftCheer('CA', SHIFT_CHEERS.CA.length)).toBe(shiftCheer('CA', 0));
  });
});
