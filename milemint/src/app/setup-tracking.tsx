import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TrackingStatus } from '@/tracking/background';
import { useTracking } from '@/tracking/use-tracking';

const POINTS = [
  ['Automatic', 'Every drive is logged the moment you park. No buttons to press.'],
  ['Light on battery', 'GPS only runs while you drive. Parked, MileMint sleeps.'],
  ['Private', 'Your trips are stored encrypted on your phone, not on our servers.'],
] as const;

export default function SetupTrackingScreen() {
  const theme = useTheme();
  const { status, enable } = useTracking(undefined, { watch: true });
  const [busy, setBusy] = useState(false);
  /** Sent to Settings to choose "Always": finish by ourselves once it's chosen. */
  const [inSettings, setInSettings] = useState(false);

  // Back from Settings with "Always" chosen: switch tracking on and close, no extra tap.
  const cameBackWithAlways = inSettings && (status === 'off' || status === 'on');
  useEffect(() => {
    if (!cameBackWithAlways) return;
    let current = true;
    (status === 'on' ? Promise.resolve<TrackingStatus>('on') : enable()).then((next) => {
      if (current && next === 'on') router.back();
    }, () => {});
    return () => {
      current = false;
    };
    // Runs once per return from Settings; `status` and `enable` are read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameBackWithAlways]);

  const turnOn = async () => {
    setBusy(true);
    try {
      const next = await enable();
      if (next === 'on') router.back();
    } finally {
      setBusy(false);
    }
  };

  // iOS only offers "Always" from Settings once "While Using" has been chosen.
  const needsSettings = status === 'needs-always';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Log every drive automatically</ThemedText>
        <ThemedText themeColor="textSecondary">
          MileMint needs location access set to “Always” to notice when you start driving, even
          when the app is closed.
        </ThemedText>

        {POINTS.map(([title, body]) => (
          <ThemedView key={title} type="backgroundElement" style={styles.point}>
            <ThemedText type="smallBold">{title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {body}
            </ThemedText>
          </ThemedView>
        ))}

        {needsSettings && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            Location is set to “While Using”, so drives would be missed when the app is closed. In
            Settings, tap Location and choose “Always”.
          </ThemedText>
        )}

        {status === 'unsupported' ? (
          <ThemedText type="small" themeColor="textSecondary">
            Automatic tracking runs on your iPhone. This preview can’t track drives.
          </ThemedText>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={
              needsSettings
                ? () => {
                    setInSettings(true);
                    Linking.openSettings();
                  }
                : turnOn
            }
            style={[styles.button, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {needsSettings ? 'Open Settings' : 'Turn on automatic tracking'}
            </ThemedText>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.later}>
          <ThemedText type="small" themeColor="textSecondary">
            Not now
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  point: { borderRadius: 12, padding: Spacing.three, gap: Spacing.half },
  button: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  later: { alignItems: 'center', paddingVertical: Spacing.two },
});
