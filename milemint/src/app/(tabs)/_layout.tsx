import { Redirect, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAutoBackup } from '@/backup/use-backup';
import { BrandTitle } from '@/components/home/brand-title';
import { SymbolIcon } from '@/components/symbol-icon';
import { tabBarStyle } from '@/components/tab-bar-style';
import { DEMO_MODE } from '@/dev/demo';
import { useIncreaseContrast } from '@/hooks/use-increase-contrast';
import { useTheme } from '@/hooks/use-theme';
import { useUnsortedCount } from '@/hooks/use-unsorted-count';
import { useT } from '@/i18n/i18n';
import { usePerksNewDot } from '@/perks/use-perks-dot';
import { useRegion } from '@/region/region';
import { useMoneyReminders } from '@/reminders/use-money-reminders';
import { useReminders } from '@/reminders/use-reminders';
import { useTrackingAlerts } from '@/tracking/use-tracking-health';

/**
 * The app's five tabs: Home (today: the shift, the year's money, drives to
 * sort), Drives (every drive), Money (the year in detail, Pro and the tax
 * screens), Perks (partner deals, demo for now) and Settings. Everything else
 * opens over them from the root stack.
 */
export default function TabsLayout() {
  const t = useT();
  const theme = useTheme();
  const { region, loaded, onboarded } = useRegion();
  const unsorted = useUnsortedCount();
  const increaseContrast = useIncreaseContrast();
  const perksNew = usePerksNewDot(usePathname() === '/perks');
  const insets = useSafeAreaInsets();
  // First launch goes through the welcome flow before the tabs are ever shown.
  if (!loaded) return <ActivityIndicator style={styles.loading} />;
  if (!onboarded) return <Redirect href="/welcome" />;
  const pounds = region.code === 'GB';
  /**
   * What VoiceOver reads for a tab. The library's own iOS label is English
   * ("Home, tab, 1 of 5"), and it drops the label altogether when the label
   * is drawn by us (tabBarLabel below), so each tab gets one in the user's language.
   */
  const spoken = (label: string, index: number) =>
    Platform.OS === 'ios' ? t('{{label}}, tab, {{index}} of {{total}}', { label, index, total: 5 }) : label;
  return (
    <>
      <AppEffects />
      <Tabs
        screenOptions={{
          // Grey unselected tabs that pass 4.5:1 (darker with Increase Contrast);
          // the selected one is green on a soft pill with a heavier label, so it
          // doesn't rely on colour alone (research_notes/launch-2026/tab-bar-colour.md).
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: increaseContrast ? theme.tabInactiveContrast : theme.tabInactive,
          tabBarActiveBackgroundColor: theme.tabActivePill,
          tabBarStyle: tabBarStyle(insets.bottom, false),
          tabBarItemStyle: styles.tabItem,
          tabBarLabel: ({ focused, color, children }) => (
            <TabLabel focused={focused} color={color}>
              {children}
            </TabLabel>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('Home (tab)'),
            headerTitle: () => <BrandTitle />,
            tabBarBadge: unsorted > 0 ? unsorted : undefined,
            tabBarAccessibilityLabel: spoken(
              unsorted > 0 ? t('Home, {{count}} drives to sort', { count: unsorted }) : t('Home (tab)'),
              1,
            ),
            tabBarIcon: ({ color, size }) => <SymbolIcon name="house.fill" glyph="⌂" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="drives"
          options={{
            title: t('Drives'),
            tabBarAccessibilityLabel: spoken(t('Drives'), 2),
            tabBarIcon: ({ color, size }) => <SymbolIcon name="car.fill" glyph="🚗" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="money"
          options={{
            title: t('Money'),
            tabBarAccessibilityLabel: spoken(t('Money'), 3),
            tabBarIcon: ({ color, size }) => (
              <SymbolIcon
                name={pounds ? 'sterlingsign.circle.fill' : 'dollarsign.circle.fill'}
                glyph={pounds ? '£' : '$'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="perks"
          options={{
            title: t('Perks'),
            tabBarAccessibilityLabel: spoken(perksNew ? t('Perks, new offers') : t('Perks'), 4),
            // A quiet green dot for a new partner offer, drawn here rather than as
            // the red badge (kept for drives to sort). The bar draws the icon twice
            // (selected and not) on top of each other, so both copies carry it.
            tabBarIcon: ({ color, size }) => (
              <View>
                <SymbolIcon name="gift.fill" glyph="🎁" size={size} color={color} />
                {perksNew && (
                  <View style={[styles.newDot, { backgroundColor: theme.tabNewDot, borderColor: theme.tabBar }]} />
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            // Here rather than in the screen, so it follows a language change straight away.
            title: t('Settings'),
            tabBarAccessibilityLabel: spoken(t('Settings'), 5),
            tabBarIcon: ({ color, size }) => <SymbolIcon name="gearshape.fill" glyph="⚙" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

/** A tab's name: semibold when selected, medium otherwise. */
function TabLabel({ focused, color, children }: { focused: boolean; color: ColorValue; children: ReactNode }) {
  return (
    // Not scaled, as the library's own label: a long press shows it large (Large Content Viewer).
    <Text allowFontScaling={false} style={[styles.tabLabel, { color, fontWeight: focused ? '600' : '500' }]}>
      {children}
    </Text>
  );
}

/** What runs once for the whole app, whichever tab is open. */
function AppEffects() {
  const { region } = useRegion();
  // Sunday reminders, the tax-year countdown, and opening the screen a tapped reminder points to.
  useReminders(region);
  // Monday's tax set-aside and two weeks before each quarterly deadline, where the plan includes them.
  useMoneyReminders(region);
  // Encrypted copy in the user's own iCloud, so a lost phone doesn't take the log with it.
  useAutoBackup(!DEMO_MODE);
  // Tracking problems found as the app goes into the background, told later if still there.
  useTrackingAlerts();
  return null;
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  tabItem: { borderRadius: 14, marginHorizontal: 4, marginVertical: 4, overflow: 'hidden' },
  tabLabel: { fontSize: 10, textAlign: 'center' },
  // 8 pt, with a 1.5 pt ring in the bar's colour to part it from the glyph. No animation.
  newDot: { position: 'absolute', top: 0, right: -2, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
});
