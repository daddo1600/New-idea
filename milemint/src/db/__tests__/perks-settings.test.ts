import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS, parseSettings } from '../settings-repo';

/** Invite perks kept for good (domain/plan), checked when read back. */
describe('perksEarned', () => {
  it('is none by default, and for settings saved before perks existed', () => {
    expect(DEFAULT_SETTINGS.perksEarned).toEqual([]);
    expect(parseSettings('{"friendsJoined":2}').perksEarned).toEqual([]);
  });

  it('keeps known perks, in ladder order, once each', () => {
    const saved = { perksEarned: ['founding-badge', 'tax-set-aside', 'tax-set-aside'] };
    expect(parseSettings(JSON.stringify(saved)).perksEarned).toEqual(['tax-set-aside', 'founding-badge']);
  });

  it('never keeps anything that isn’t a perk, so nothing can unlock reports', () => {
    const saved = { perksEarned: ['reports', 'export', 'pro', 42, null, 'platform-earnings'] };
    expect(parseSettings(JSON.stringify(saved)).perksEarned).toEqual(['platform-earnings']);
    expect(parseSettings(JSON.stringify({ perksEarned: 'tax-set-aside' })).perksEarned).toEqual([]);
  });
});
