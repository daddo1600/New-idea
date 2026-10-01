import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { AppStateStatus } from 'react-native';

import { type AppStateLike, waitForPromptAnswer } from '../prompt-answer';

/** A stand-in for iOS: the app is `inactive` while a system alert is up. */
function fakeAppState(initial: AppStateStatus = 'active') {
  const listeners = new Set<(state: AppStateStatus) => void>();
  const appState: AppStateLike & { set(state: AppStateStatus): void } = {
    currentState: initial,
    addEventListener: (_type, listener) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
    set(state) {
      appState.currentState = state;
      listeners.forEach((listener) => listener(state));
    },
  };
  return appState;
}

/** When (in ms of fake time) the coaching card would come down. */
async function coachHiddenAt(run: (appState: ReturnType<typeof fakeAppState>) => Promise<void>, appState = fakeAppState()) {
  let hiddenAt: number | null = null;
  const start = Date.now();
  run(appState).then(() => {
    hiddenAt = Date.now() - start;
  });
  return () => hiddenAt;
}

describe('the coaching card behind iOS’s “Change to Always Allow” question', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  const notGranted = async () => false;

  it('stays up while the question is on screen, even if iOS reports back early (the reported bug)', async () => {
    // expo-location resolves while the alert is still up: the app is inactive.
    const appState = fakeAppState('inactive');
    const hiddenAt = await coachHiddenAt((a) => waitForPromptAnswer({ appState: a, answered: notGranted }), appState);
    await jest.advanceTimersByTimeAsync(8000); // reading the alert
    expect(hiddenAt()).toBeNull();
    appState.set('active'); // taps "Keep Only While Using"
    await jest.advanceTimersByTimeAsync(0);
    expect(hiddenAt()).toBe(8000);
  });

  it('stays up when the alert appears a moment after iOS reports back', async () => {
    const appState = fakeAppState('active');
    const hiddenAt = await coachHiddenAt((a) => waitForPromptAnswer({ appState: a, answered: notGranted }), appState);
    await jest.advanceTimersByTimeAsync(300);
    appState.set('inactive'); // alert slides in
    await jest.advanceTimersByTimeAsync(10_000);
    expect(hiddenAt()).toBeNull();
    appState.set('active');
    await jest.advanceTimersByTimeAsync(0);
    expect(hiddenAt()).toBe(10_300);
  });

  it('comes down as soon as “Always” is granted', async () => {
    const appState = fakeAppState('inactive');
    let granted = false;
    const hiddenAt = await coachHiddenAt(
      (a) => waitForPromptAnswer({ appState: a, answered: async () => granted }),
      appState,
    );
    await jest.advanceTimersByTimeAsync(2000);
    granted = true; // taps "Change to Always Allow"
    await jest.advanceTimersByTimeAsync(500);
    expect(hiddenAt()).not.toBeNull();
  });

  it('moves on quickly when iOS shows no second question at all', async () => {
    const hiddenAt = await coachHiddenAt((a) => waitForPromptAnswer({ appState: a, answered: notGranted }));
    await jest.advanceTimersByTimeAsync(1000);
    expect(hiddenAt()).toBe(1000);
  });

  it('never leaves set-up stuck', async () => {
    const appState = fakeAppState('inactive');
    const hiddenAt = await coachHiddenAt(
      (a) => waitForPromptAnswer({ appState: a, answered: notGranted, maxMs: 120_000 }),
      appState,
    );
    await jest.advanceTimersByTimeAsync(120_000);
    expect(hiddenAt()).toBe(120_000);
  });
});
