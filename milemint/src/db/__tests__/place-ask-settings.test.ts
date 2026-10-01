import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS, parseSettings } from '../settings-repo';

/** The spots answered "No" to "Is this home?" / "Is this work?": checked when read back. */
describe('dismissed home and work spots', () => {
  it('are none by default', () => {
    expect(DEFAULT_SETTINGS.dismissedHomeSpots).toEqual([]);
    expect(DEFAULT_SETTINGS.dismissedWorkSpots).toEqual([]);
    expect(parseSettings('{}').dismissedHomeSpots).toEqual([]);
  });

  it('keep valid points and drop anything else', () => {
    const settings = parseSettings(
      JSON.stringify({
        dismissedHomeSpots: [
          { latitude: 53.8, longitude: -1.5, extra: 'x' },
          { latitude: 'north', longitude: 1 },
          { latitude: 91, longitude: 0 },
          { latitude: 0, longitude: 181 },
          null,
          [1, 2],
        ],
        dismissedWorkSpots: { latitude: 1, longitude: 2 },
      }),
    );
    expect(settings.dismissedHomeSpots).toEqual([{ latitude: 53.8, longitude: -1.5 }]);
    expect(settings.dismissedWorkSpots).toEqual([]);
  });

  it('keep only the latest ten', () => {
    const spots = Array.from({ length: 14 }, (_, i) => ({ latitude: i, longitude: 0 }));
    const settings = parseSettings(JSON.stringify({ dismissedWorkSpots: spots }));
    expect(settings.dismissedWorkSpots).toHaveLength(10);
    expect(settings.dismissedWorkSpots[0].latitude).toBe(4);
  });
});
