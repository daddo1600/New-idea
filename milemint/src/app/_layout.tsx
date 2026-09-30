import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DATABASE_NAME, initDatabase } from '@/db/database';
import { DEMO_MODE, seedDemoTrips } from '@/dev/demo';
import { ProProvider } from '@/purchases/pro';
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
                <Stack.Screen name="pro" options={{ title: 'MileMint Pro', presentation: 'modal' }} />
              </Stack>
            </ProProvider>
          </SQLiteProvider>
        </Suspense>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
