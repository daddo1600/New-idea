import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS, parseSettings } from '../settings-repo';

/** Settings → Appearance: System, Light or Dark, checked when read back. */
describe('appearance', () => {
  it('follows the phone by default, also for settings saved before it existed', () => {
    expect(DEFAULT_SETTINGS.appearance).toBe('system');
    expect(parseSettings('{}').appearance).toBe('system');
  });

  it('keeps each choice', () => {
    for (const value of ['system', 'light', 'dark'] as const) {
      expect(parseSettings(JSON.stringify({ appearance: value })).appearance).toBe(value);
    }
  });

  it('drops anything else, without touching the other settings', () => {
    for (const value of ['Dark', 'auto', '', null, 1, true, {}]) {
      const settings = parseSettings(JSON.stringify({ appearance: value, onboarded: true }));
      expect(settings.appearance).toBe('system');
      expect(settings.onboarded).toBe(true);
    }
  });
});
