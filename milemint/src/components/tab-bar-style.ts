import type { ViewStyle } from 'react-native';

/**
 * The selected tab's pill sits 4 pt inside the bar (research_notes/launch-2026/tab-bar-colour.md),
 * so the bar is 8 pt taller than the standard 49 to keep the labels in it.
 */
const TAB_BAR_HEIGHT = 49 + 8;

/**
 * The tab bar's style, for the tabs layout and for screens that hide the bar
 * while selecting (a screen's own tabBarStyle replaces the layout's, so they
 * pass this back rather than undefined).
 */
export function tabBarStyle(bottomInset: number, hidden: boolean): ViewStyle {
  return hidden ? { display: 'none' } : { height: TAB_BAR_HEIGHT + bottomInset };
}
