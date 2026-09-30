import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DATABASE_NAME, initDatabase } from '@/db/database';
import { DEMO_MODE, seedDemoTrips } from '@/dev/demo';
import { describeError } from '@/errors/fatal-errors';
import { ProProvider } from '@/purchases/pro';
import { RegionProvider } from '@/region/region';
// Registers the background location tasks; must run before the app renders.
import '@/tracking/background';

async function onInit(db: SQLiteDatabase) {
  await initDatabase(db);
  if (DEMO_MODE) await seedDemoTrips(db);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    // Needed for swipe-to-classify on trip rows.
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Suspense fallback={<ActivityIndicator style={{ flex: 1 }} />}>
          <SQLiteProvider databaseName={DATABASE_NAME} onInit={onInit} useSuspense>
            <RegionProvider>
              <ProProvider>
                <Stack>
                  <Stack.Screen name="index" options={{ title: 'MileMint' }} />
                  <Stack.Screen name="add-trip" options={{ title: 'Add missed trip', presentation: 'modal' }} />
                  <Stack.Screen
                    name="setup-tracking"
                    options={{ title: 'Automatic tracking', presentation: 'modal' }}
                  />
                  <Stack.Screen name="settings" options={{ title: 'Settings' }} />
                  <Stack.Screen name="trip/[id]" options={{ title: 'Trip' }} />
                  <Stack.Screen name="report" options={{ title: 'Reports' }} />
                  <Stack.Screen name="region" options={{ title: 'Your country', presentation: 'modal' }} />
                  <Stack.Screen name="pro" options={{ title: 'MileMint Pro', presentation: 'modal' }} />
                </Stack>
              </ProProvider>
            </RegionProvider>
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Shown instead of closing the app when a screen fails to render, with the
 * error so a tester's screenshot says what went wrong. Plain React Native
 * views only: the themed components may be what failed.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <ScrollView contentContainerStyle={styles.errorPage}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorBody}>
        MileMint couldn’t open this screen. Your trips are safe. Please send a screenshot of this page to
        milemint.support@gmail.com so we can fix it.
      </Text>
      <Text selectable style={styles.errorDetail}>
        {describeError(error)}
      </Text>
      <Pressable accessibilityRole="button" onPress={retry} style={styles.errorButton}>
        <Text style={styles.errorButtonText}>Try again</Text>
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
