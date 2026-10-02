import { useSyncExternalStore } from 'react';
import { Appearance as NativeAppearance, Platform } from 'react-native';

import type { Appearance } from '@/domain/appearance';

/**
 * The Appearance setting for the whole app, outside React so the root layout
 * (above the database) can read it. Settings are loaded inside the database
 * provider, which calls setAppearance with the saved choice; until then the
 * app follows the phone.
 */
let current: Appearance = 'system';
const listeners = new Set<() => void>();

export function setAppearance(next: Appearance): void {
  if (next === current) return;
  current = next;
  // On iPhone and Android this also turns native parts (alerts, the keyboard,
  // switches, date pickers) light or dark. The web has no such override;
  // useColorScheme applies the choice there.
  if (Platform.OS !== 'web') {
    try {
      NativeAppearance.setColorScheme(next === 'system' ? 'unspecified' : next);
    } catch {
      // The app's own colours still follow the choice.
    }
  }
  for (const listener of listeners) listener();
}

export const getAppearance = (): Appearance => current;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The chosen appearance ("system", "light" or "dark"), re-rendering when it changes. */
export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getAppearance, getAppearance);
}
