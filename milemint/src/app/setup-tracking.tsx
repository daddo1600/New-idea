import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';

import { AlwaysGuide } from '@/components/always-guide';
import { MotionCoach, MotionPreview } from '@/components/motion-ask';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import type { TrackingStatus } from '@/tracking/background';
import { askForMotion, motionAskable } from '@/tracking/motion';
import { useTracking } from '@/tracking/use-tracking';

const POINTS = [
  [msg('Automatic'), msg('Every drive is logged the moment you park. No buttons to press.')],
  [msg('Light on battery'), msg('GPS only runs while you drive. Parked, MileSprout sleeps.')],
  [msg('Private'), msg('Your trips are stored encrypted on your phone, not on our servers.')],
] as const;

export default function SetupTrackingScreen() {
  const theme = useTheme();
  const t = useT();
  const { status, enable } = useTracking(undefined, { watch: true });
  const [busy, setBusy] = useState(false);
  /** Sent to Settings to choose "Always": finish by ourselves once it's chosen. */
  const [inSettings, setInSettings] = useState(false);
  /** Tracking is on: Motion & Fitness offered, or iOS's question for it up. */
  const [motion, setMotion] = useState<'offer' | 'asking' | null>(null);

  /** Location is done: offer Motion & Fitness when iOS hasn't asked for it yet, else close. */
  const done = () => {
    if (motionAskable()) setMotion('offer');
    else router.back();
  };

  const allowMotion = async () => {
    setMotion('asking');
    try {
      await askForMotion();
    } finally {
      router.back();
    }
  };

  // Back from Settings with "Always" chosen: switch tracking on and close, no extra tap.
  const cameBackWithAlways = inSettings && (status === 'off' || status === 'on');
  useEffect(() => {
    if (!cameBackWithAlways) return;
    let current = true;
    (status === 'on' ? Promise.resolve<TrackingStatus>('on') : enable()).then(
      (next) => {
        if (current && next === 'on') done();
      },
      () => {},
    );
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
      if (next === 'on') done();
    } finally {
      setBusy(false);
    }
  };

  // iOS only offers "Always" from Settings once "While Using" has been chosen.
  const needsSettings = status === 'needs-always';

  if (motion === 'asking') {
    return (
      <ThemedView style={[styles.container, styles.content]}>
        <MotionCoach />
      </ThemedView>
    );
  }

  if (motion === 'offer') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('One more for accuracy: Motion & Fitness')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('Lets MileSprout tell driving from walking, so a stroll is never logged as a trip. It stays on your phone.')}
          </ThemedText>
          <MotionPreview style={[styles.preview, { backgroundColor: theme.accent }]} />
          <Pressable
            accessibilityRole="button"
            onPress={allowMotion}
            style={[styles.button, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Turn on Motion & Fitness')}
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.later}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('Not now')}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">{t('Log every drive automatically')}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {t(
            'MileSprout needs location access set to “Always” to notice when you start driving, even when the app is closed.',
          )}
        </ThemedText>

        {/* Once only the Settings switch is left, it goes straight under the heading. */}
        {!needsSettings &&
          POINTS.map(([title, body]) => (
            <ThemedView key={title} type="backgroundElement" style={styles.point}>
              <ThemedText type="smallBold">{t(title)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t(body)}
              </ThemedText>
            </ThemedView>
          ))}

        {needsSettings && <AlwaysGuide current="While Using the App" />}

        {status === 'unsupported' ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('Automatic tracking runs on your iPhone. This preview can’t track drives.')}
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
              {needsSettings ? t('Open Settings') : t('Turn on automatic tracking')}
            </ThemedText>
          </Pressable>
        )}

        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.later}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Not now')}
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
  preview: { borderRadius: 16, paddingVertical: Spacing.four },
});
