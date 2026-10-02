import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Soft: 'soft' },
}));
// The pop itself needs the native animation runtime; only the haptic is under test.
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (component: unknown) => component },
  Easing: { out: () => () => 0, quad: () => 0 },
}));

/** One tap of the phone per pop: light for choosing, soft for taking back, none on web. */
describe('pop haptic', () => {
  const load = (os: string) => {
    let loaded: { popHaptic: (kind: 'light' | 'soft' | 'none') => void; impactAsync: jest.Mock } | undefined;
    jest.isolateModules(() => {
      jest.doMock('react-native', () => ({ Platform: { OS: os }, Pressable: 'Pressable' }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const haptics = require('expo-haptics') as { impactAsync: jest.Mock };
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { popHaptic } = require('../pop-press') as typeof import('../pop-press');
      loaded = { popHaptic, impactAsync: haptics.impactAsync };
    });
    return loaded!;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('taps light to choose and soft to take back', () => {
    const { popHaptic, impactAsync } = load('ios');
    popHaptic('light');
    popHaptic('soft');
    expect(impactAsync.mock.calls).toEqual([['light'], ['soft']]);
  });

  it('stays still when asked for none, and always on web', () => {
    const ios = load('ios');
    ios.popHaptic('none');
    expect(ios.impactAsync).not.toHaveBeenCalled();
    const web = load('web');
    web.popHaptic('light');
    expect(web.impactAsync).not.toHaveBeenCalled();
  });
});
