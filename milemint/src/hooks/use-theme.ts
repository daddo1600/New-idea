/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** The colours for the current scheme: the Appearance setting, or the phone's. */
export function useTheme() {
  return Colors[useColorScheme()];
}
