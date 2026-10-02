import { describe, expect, it } from '@jest/globals';

import { NEUTRAL_CHEERS, SHIFT_CHEERS, shiftCheer } from '../cheers';

describe('shiftCheer', () => {
  it('keeps a light local touch in plain English', () => {
    expect(SHIFT_CHEERS.GB).toContain(shiftCheer('GB', 0));
    expect(shiftCheer('GB', 0)).toBe('Off you go! 🚗');
    expect(shiftCheer('AU', 0)).toBe('No worries, let’s go! 🚗');
  });

  it('avoids slang a second-language speaker may not know', () => {
    const all = [...Object.values(SHIFT_CHEERS).flat(), ...NEUTRAL_CHEERS].join(' ');
    expect(all).not.toMatch(/tally ho|crack on|chocks|giv’er|giddy|she’ll be right|bread|pedal|game on|too easy/i);
  });

  it('rotates through every cheer and wraps around', () => {
    const seen = new Set(Array.from({ length: SHIFT_CHEERS.US.length }, (_, i) => shiftCheer('US', i)));
    expect(seen.size).toBe(SHIFT_CHEERS.US.length);
    expect(shiftCheer('CA', SHIFT_CHEERS.CA.length)).toBe(shiftCheer('CA', 0));
  });
});
