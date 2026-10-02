import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useAutoBackup } from '@/backup/use-backup';
import { BrandTitle } from '@/components/home/brand-title';
import { SymbolIcon } from '@/components/symbol-icon';
import { DEMO_MODE } from '@/dev/demo';
import { useTheme } from '@/hooks/use-theme';
import { useUnsortedCount } from '@/hooks/use-unsorted-count';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import { useMoneyReminders } from '@/reminders/use-money-reminders';
import { useReminders } from '@/reminders/use-reminders';
import { useTrackingAlerts } from '@/tracking/use-tracking-health';

/**
 * The app's four tabs: Home (today: the shift, the year's money, drives to
 * sort), Drives (every drive), Money (the year in detail, Pro and the tax
 * screens) and Settings. Everything else opens over them from the root stack.
 */
export default function TabsLayout() {
  const t = useT();
  const theme = useTheme();
  const { region, loaded, onboarded } = useRegion();
  const unsorted = useUnsortedCount();
  // First launch goes through the welcome flow before the tabs are ever shown.
  if (!loaded) return <ActivityIndicator style={styles.loading} />;
  if (!onboarded) return <Redirect href="/welcome" />;
  const pounds = region.code === 'GB';
  return (
    <>
      <AppEffects />
      <Tabs screenOptions={{ tabBarActiveTintColor: theme.accent }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('Home (tab)'),
            headerTitle: () => <BrandTitle />,
            tabBarBadge: unsorted > 0 ? unsorted : undefined,
            tabBarIcon: ({ color, size }) => <SymbolIcon name="house.fill" glyph="⌂" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="drives"
          options={{
            title: t('Drives'),
            tabBarIcon: ({ color, size }) => <SymbolIcon name="car.fill" glyph="🚗" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="money"
          options={{
            title: t('Money'),
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
          name="settings"
          options={{
            // Here rather than in the screen, so it follows a language change straight away.
            title: t('Settings'),
            tabBarIcon: ({ color, size }) => <SymbolIcon name="gearshape.fill" glyph="⚙" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
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
});
