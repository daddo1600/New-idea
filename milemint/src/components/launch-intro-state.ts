import { useSyncExternalStore } from 'react';

import { DEMO_MODE } from '@/dev/demo';

/*
 * Whether the launch animation (components/launch-intro) has finished. It
 * plays over everything on each launch, but a native Modal opened underneath
 * (the practice run) would cover it instead, so such overlays wait for this.
 * The web demo opens straight onto the app, with no animation.
 */

let done = DEMO_MODE;
const listeners = new Set<() => void>();

/** Called once the launch animation has faded out (or was never played). */
export function markLaunchIntroDone(): void {
  if (done) return;
  done = true;
  for (const listener of listeners) listener();
}

export function launchIntroDone(): boolean {
  return done;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True once the launch animation is over: overlays can open. */
export function useLaunchIntroDone(): boolean {
  return useSyncExternalStore(subscribe, launchIntroDone, launchIntroDone);
}
