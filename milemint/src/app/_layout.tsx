import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps, type Theme } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LaunchIntro } from '@/components/launch-intro';
import { markLaunchIntroDone } from '@/components/launch-intro-state';
import { DATABASE_NAME, initDatabase } from '@/db/database';
import { DEMO_MODE, seedDemoTrips } from '@/dev/demo';
import { Colors } from '@/constants/theme';
import { describeError } from '@/errors/fatal-errors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ShiftActivitySync } from '@/live-activity/use-shift-activity';
import { ProProvider } from '@/purchases/pro';
import { loadLanguage, useT } from '@/i18n/i18n';
import { ReferralProvider } from '@/referral/referral';
import { RegionProvider } from '@/region/region';
// Registers the background location tasks; must run before the app renders.
import '@/tracking/background';

// The language picked last time, read while the launch animation plays.
loadLanguage();

/** Headers, the tab bar and screen backgrounds in the app's own colours, light or dark. */
const NAV_THEMES: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: Colors.light.accent, background: Colors.light.background },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.accent,
      background: Colors.dark.background,
      card: '#121212',
      border: Colors.dark.backgroundSelected,
    },
  },
};

async function onInit(db: SQLiteDatabase) {
  await initDatabase(db);
  if (DEMO_MODE) await seedDemoTrips(db);
}

export default function RootLayout() {
  // The Appearance setting (System, Light or Dark), applied once settings load.
  const colorScheme = useColorScheme();
  const t = useT();
  // The web demo (store screenshots) opens straight onto the app.
  const [intro, setIntro] = useState(!DEMO_MODE);
  const endIntro = useCallback(() => {
    setIntro(false);
    // Overlays waiting for the animation (the practice run) can open now.
    markLaunchIntroDone();
  }, []);
  return (
    // Needed for swipe-to-classify on trip rows.
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={NAV_THEMES[colorScheme]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Suspense fallback={<ActivityIndicator style={{ flex: 1 }} />}>
          <SQLiteProvider databaseName={DATABASE_NAME} onInit={onInit} useSuspense>
            <RegionProvider>
              {/* The shift on the lock screen: its card, and the buttons tapped on it. */}
              <ShiftActivitySync />
              <ProProvider>
                <ReferralProvider>
                  <Stack>
                    {/* Home, Drives, Money and Settings; every other screen opens over them. */}
                    <Stack.Screen name="(tabs)" options={{ title: 'MileSprout', headerShown: false }} />
                    <Stack.Screen
                      name="welcome"
                      options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
                    />
                    <Stack.Screen name="add-trip" options={{ title: t('Add missed trip'), presentation: 'modal' }} />
                    <Stack.Screen
                      name="setup-tracking"
                      options={{ title: t('Automatic tracking'), presentation: 'modal' }}
                    />
                    <Stack.Screen name="trip/[id]" options={{ title: t('Trip') }} />
                    <Stack.Screen name="report" options={{ title: t('Reports') }} />
                    <Stack.Screen name="region" options={{ title: t('Your country'), presentation: 'modal' }} />
                    <Stack.Screen name="pro" options={{ title: 'MileSprout Pro', presentation: 'modal' }} />
                    <Stack.Screen name="compare" options={{ title: t('Missed miles check'), presentation: 'modal' }} />
                    <Stack.Screen
                      name="scan-earnings"
                      options={{ title: t('Check your earnings'), presentation: 'modal' }}
                    />
                    <Stack.Screen name="milestones" options={{ title: t('Milestones') }} />
                    <Stack.Screen name="tax-dates" options={{ title: t('Tax dates') }} />
                    <Stack.Screen name="claim-relief" options={{ title: t('Claim mileage relief') }} />
                    <Stack.Screen name="logbook" options={{ title: t('ATO logbook') }} />
                    <Stack.Screen name="language" options={{ title: t('Language'), presentation: 'modal' }} />
                    <Stack.Screen name="friends" options={{ title: t('Invite friends') }} />
                    {/* milemint://invite/TRVB-7K2: notes the code, then opens "Invite friends" or the welcome. */}
                    <Stack.Screen name="invite/[code]" options={{ headerShown: false, animation: 'none' }} />
                  </Stack>
                </ReferralProvider>
              </ProProvider>
            </RegionProvider>
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
      {intro && <LaunchIntro onDone={endIntro} />}
    </GestureHandlerRootView>
  );
}

/**
 * Shown instead of closing the app when a screen fails to render, with the
 * error so a tester's screenshot says what went wrong. Plain React Native
 * views only: the themed components may be what failed.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const t = useT();
  return (
    <ScrollView contentContainerStyle={styles.errorPage}>
      <Text style={styles.errorTitle}>{t('Something went wrong')}</Text>
      <Text style={styles.errorBody}>
        {t(
          'MileSprout couldn’t open this screen. Your trips are safe. Please send a screenshot of this page to {{email}} so we can fix it.',
          { email: 'milemint.support@gmail.com' },
        )}
      </Text>
      <Text selectable style={styles.errorDetail}>
        {describeError(error)}
      </Text>
      <Pressable accessibilityRole="button" onPress={retry} style={styles.errorButton}>
        <Text style={styles.errorButtonText}>{t('Try again')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errorPage: { flexGrow: 1, padding: 24, paddingTop: 96, gap: 16, backgroundColor: '#ffffff' },
  errorTitle: { fontSize: 24, fontWeight: '700', color: '#000000' },
  errorBody: { fontSize: 16, lineHeight: 22, color: '#333333' },
  errorDetail: { fontSize: 13, lineHeight: 18, color: '#C62828', fontFamily: 'Menlo' },
  errorButton: { alignSelf: 'flex-start', backgroundColor: '#0B7A55', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  errorButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
