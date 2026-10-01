import type { AppStateStatus } from 'react-native';

/** The parts of React Native's AppState used here (a fake one in tests). */
export type AppStateLike = {
  currentState: AppStateStatus;
  addEventListener(type: 'change', listener: (state: AppStateStatus) => void): { remove(): void };
};

/**
 * Waits until the person has answered an iOS permission question.
 *
 * iOS's second location question ("Change to Always Allow") is a system
 * alert, and expo-location can report back while it's still on screen. If we
 * took that as the answer, the coaching behind the alert ("Tap Change to
 * Always Allow") would disappear while they're still reading it. While a
 * system alert is up the app is `inactive`; once it's answered the app is
 * `active` again, so that's the signal.
 *
 * Also done when:
 * - `answered()` says so (checked every half second: e.g. "Always" granted);
 * - no alert appeared at all (the app never left `active` within
 *   `noPromptMs`: iOS sometimes doesn't ask a second time);
 * - `maxMs` passes, so set-up can never hang.
 */
export function waitForPromptAnswer({
  appState,
  answered,
  noPromptMs = 1000,
  maxMs = 120_000,
  pollMs = 500,
}: {
  appState: AppStateLike;
  answered: () => Promise<boolean>;
  noPromptMs?: number;
  maxMs?: number;
  pollMs?: number;
}): Promise<void> {
  return new Promise((resolve) => {
    let finished = false;
    let alertSeen = appState.currentState !== 'active';
    const timers: ReturnType<typeof setTimeout>[] = [];
    const done = () => {
      if (finished) return;
      finished = true;
      subscription.remove();
      timers.forEach(clearTimeout);
      clearInterval(poll);
      resolve();
    };
    const subscription = appState.addEventListener('change', (state) => {
      if (state !== 'active') alertSeen = true;
      else if (alertSeen) done();
    });
    timers.push(
      setTimeout(() => {
        if (!alertSeen && appState.currentState === 'active') done();
      }, noPromptMs),
      setTimeout(done, maxMs),
    );
    const poll = setInterval(() => {
      answered().then(
        (yes) => yes && done(),
        () => {},
      );
    }, pollMs);
  });
}
