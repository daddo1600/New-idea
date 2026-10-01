import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS, parseSettings } from '../settings-repo';

/** When the "your free trial ends soon" reminder is queued: checked when read back. */
describe('trialReminderAt', () => {
  it('is none by default', () => {
    expect(DEFAULT_SETTINGS.trialReminderAt).toBeNull();
    expect(parseSettings('{}').trialReminderAt).toBeNull();
  });

  it('keeps a full ISO time', () => {
    const at = '2026-10-29T10:30:00.000Z';
    expect(parseSettings(JSON.stringify({ trialReminderAt: at })).trialReminderAt).toBe(at);
    expect(parseSettings(JSON.stringify({ trialReminderAt: '2026-10-29T11:30:00+01:00' })).trialReminderAt).toBe(at);
    expect(parseSettings(JSON.stringify({ trialReminderAt: null })).trialReminderAt).toBeNull();
  });

  it('drops anything else', () => {
    for (const value of ['soon', '2026-10-29', '2026-13-45T99:00:00Z', 1793270000000, true, {}]) {
      expect(parseSettings(JSON.stringify({ trialReminderAt: value })).trialReminderAt).toBeNull();
    }
  });
});
