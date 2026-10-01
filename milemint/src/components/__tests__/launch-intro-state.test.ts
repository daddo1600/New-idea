import { describe, expect, it, jest } from '@jest/globals';

/** The practice run waits for the launch animation: a native Modal would otherwise cover it. */
describe('launch intro state', () => {
  it('starts not done, and stays done once it ends', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const state = require('../launch-intro-state') as typeof import('../launch-intro-state');
      expect(state.launchIntroDone()).toBe(false);
      state.markLaunchIntroDone();
      expect(state.launchIntroDone()).toBe(true);
      // A second call (the animation can't end twice, but a skip and a fade could race) changes nothing.
      state.markLaunchIntroDone();
      expect(state.launchIntroDone()).toBe(true);
    });
  });
});
