import { useSyncExternalStore } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useAppearance } from './use-appearance';

const subscribe = () => () => {};

/**
 * 'light' or 'dark': the Appearance setting, or the browser's own when it's
 * "System". To support static rendering, the browser's scheme is read on the
 * client only: pre-rendered HTML always uses the light scheme.
 */
export function useColorScheme(): 'light' | 'dark' {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const appearance = useAppearance();
  const system = useSystemColorScheme();
  if (appearance !== 'system') return appearance;
  return hasHydrated && system === 'dark' ? 'dark' : 'light';
}
