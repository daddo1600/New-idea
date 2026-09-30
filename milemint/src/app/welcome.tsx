import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountryOptions, phoneRegion } from '@/components/country-options';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { formatRate, REGIONS, type RegionCode } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';
import { useTracking } from '@/tracking/use-tracking';

/**
 * First launch, as one full-screen flow instead of a chain of pop-ups:
 * welcome → country → automatic tracking → done. Each step does one thing,
 * and the user always sees how far along they are.
 */

const STEPS = 4;

const WELCOME_POINTS = [
  ['Automatic', 'Drives are logged in the background. No buttons to press.'],
  ['Worth money', 'See what each business drive saves you at tax time.'],
  ['Private', 'No account. Your trips stay encrypted on your iPhone.'],
] as const;

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { region, chosen, setRegion, finishOnboarding } = useRegion();
  const { status, enable } = useTracking();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<RegionCode>(() => (chosen ? region.code : phoneRegion()));
  const [busy, setBusy] = useState(false);
  // iOS asks only once; after a "Don't Allow" the only way back is Settings.
  const [asked, setAsked] = useState(false);

  const picked = REGIONS[country];
  const topRate = formatRate(picked.rates[picked.rates.length - 1].tiers[0].rate, picked);

  const saveCountry = async () => {
    await setRegion(country);
    setStep(2);
  };

  const allowLocation = async () => {
    setBusy(true);
    try {
      const next = await enable();
      if (next === 'on') setStep(3);
    } finally {
      setAsked(true);
      setBusy(false);
    }
  };

  const finish = async () => {
    await finishOnboarding();
    router.replace('/');
  };

  const primary = (label: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={[styles.primary, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
      <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
        {label}
      </ThemedText>
    </Pressable>
  );
  const secondary = (label: string, onPress: () => void) => (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.secondary}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.three }]}>
      <View style={styles.top}>
        {step > 0 && step < 3 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => setStep(step - 1)}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Back
            </ThemedText>
          </Pressable>
        ) : (
          <View />
        )}
        <View accessibilityLabel={`Step ${step + 1} of ${STEPS}`} style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i <= step ? theme.accent : theme.backgroundSelected }, i === step && styles.dotCurrent]}
            />
          ))}
        </View>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <Image source={require('@/../assets/images/icon.png')} style={styles.icon} accessibilityIgnoresInvertColors />
            <ThemedText type="title" style={styles.heading}>
              Every business mile, counted.
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              MileMint logs your drives automatically and works out what they’re worth at tax time.
            </ThemedText>
            <View style={styles.points}>
              {WELCOME_POINTS.map(([title, body]) => (
                <View key={title} style={styles.point}>
                  <ThemedText type="smallBold" style={{ color: theme.accent }}>
                    ✓
                  </ThemedText>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">{title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {body}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <ThemedText type="subtitle" style={styles.heading}>
              Where do you drive?
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              This sets your currency, miles or kilometres, tax year and official mileage rate. You can change
              it later in Settings.
            </ThemedText>
            <CountryOptions value={country} onChange={setCountry} />
          </>
        )}

        {step === 2 && (
          <>
            <ThemedText type="subtitle" style={styles.heading}>
              Log every drive automatically
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              To notice when you start driving, even when MileMint is closed, it needs location access set
              to “Always”. GPS only runs while you drive, and your trips never leave your iPhone.
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">What you’ll see next</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                1. Tap “Allow While Using App”.{'\n'}2. Then tap “Change to Always Allow”.
              </ThemedText>
            </ThemedView>
            {status === 'needs-always' && (
              <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                Location is set to “While Using”, so drives would be missed while MileMint is closed. In
                Settings, tap Location and choose “Always”.
              </ThemedText>
            )}
            {status === 'needs-permission' && asked && !busy && (
              <ThemedText type="small" themeColor="textSecondary">
                If you chose “Don’t Allow”, you can turn location on in Settings at any time.
              </ThemedText>
            )}
            {status === 'unsupported' && (
              <ThemedText type="small" themeColor="textSecondary">
                Automatic tracking runs on your iPhone. You can still add trips by hand here.
              </ThemedText>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <ThemedText type="title" style={styles.heading}>
              You’re all set.
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              {status === 'on'
                ? `Just drive. Each trip appears after you park, and business drives count at ${picked.authority}’s ${topRate} rate.`
                : 'You can turn on automatic tracking from the home screen whenever you’re ready, or add trips by hand.'}
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Tip</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Swipe a trip right for business or left for personal. Set your work hours in Settings and
                MileMint sorts many trips for you.
              </ThemedText>
            </ThemedView>
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {step === 0 && primary('Get started', () => setStep(1))}
        {step === 1 && primary('Continue', saveCountry)}
        {step === 2 &&
          (status === 'on' || status === 'unsupported'
            ? primary('Continue', () => setStep(3))
            : status === 'needs-always' || (status === 'needs-permission' && asked)
              ? primary('Open Settings', () => Linking.openSettings())
              : primary(busy ? 'Waiting for your answer…' : 'Allow location', allowLocation))}
        {step === 2 &&
          status !== 'on' &&
          status !== 'unsupported' &&
          secondary(status === 'needs-always' ? 'Continue without “Always”' : 'Not now', () => setStep(3))}
        {step === 3 && primary('Start using MileMint', finish)}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.four },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  topSpacer: { width: 32 },
  dots: { flexDirection: 'row', gap: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotCurrent: { width: 24 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  icon: { width: 88, height: 88, borderRadius: 20 },
  heading: { marginTop: Spacing.two },
  points: { gap: Spacing.three, marginTop: Spacing.two },
  point: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1, gap: Spacing.half },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  actions: { gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  primary: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  secondary: { alignItems: 'center', paddingVertical: Spacing.two },
});
