import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useAppearance } from './use-appearance';

/** 'light' or 'dark': the Appearance setting, or the phone's own when it's "System". */
export function useColorScheme(): 'light' | 'dark' {
  const appearance = useAppearance();
  const system = useSystemColorScheme();
  if (appearance !== 'system') return appearance;
  return system === 'dark' ? 'dark' : 'light';
}
