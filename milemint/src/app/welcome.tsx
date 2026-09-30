import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlwaysGuide } from '@/components/always-guide';
import { BrandGradient } from '@/components/brand-gradient';
import { CountryOptions, phoneRegion } from '@/components/country-options';
import { LeafMark } from '@/components/leaf-mark';
import { EMPTY_PLACE, PlaceField, resolvePlace, type PlaceDraft } from '@/components/place-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  DEFAULT_SIMPLE_WEEK,
  toWorkWeek,
  WorkHoursQuick,
  type SimpleWeek,
} from '@/components/work-hours-quick';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deletePlace, insertPlace, listPlaces } from '@/db/places-repo';
import { loadSettings, saveSettings } from '@/db/settings-repo';
import { formatRate, REGIONS, type RegionCode } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';
import { enableWeeklyReminder, REMINDERS_SUPPORTED, scheduleWorkHoursNudge } from '@/reminders/weekly';
import type { TrackingStatus } from '@/tracking/background';
import { useTracking } from '@/tracking/use-tracking';

/**
 * First launch, as one full-screen flow instead of a chain of pop-ups:
 * welcome → country → automatic tracking → work hours → home and work → done.
 * The last three are optional and skip in one tap. Each step does one thing,
 * and the user always sees how far along they are.
 */

const STEPS = 6;
const HOURS = 3;
const PLACES = 4;
const DONE = 5;

const WELCOME_POINTS = [
  ['Automatic', 'Drives are logged in the background. No buttons to press.'],
  ['Worth money', 'See what each business drive saves you at tax time.'],
  ['Private', 'No account. Your trips stay encrypted on your iPhone.'],
] as const;

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { region, chosen, setRegion, finishOnboarding } = useRegion();
  const [step, setStep] = useState(0);
  const { status, enable } = useTracking(undefined, { watch: step === 2 });
  const [country, setCountry] = useState<RegionCode>(() => (chosen ? region.code : phoneRegion()));
  const [busy, setBusy] = useState(false);
  // iOS asks only once; after a "Don't Allow" the only way back is Settings.
  const [asked, setAsked] = useState(false);
  /** Sent to Settings to choose "Always": carry on by ourselves once it's chosen. */
  const [inSettings, setInSettings] = useState(false);
  const db = useSQLiteContext();
  const [week, setWeek] = useState<SimpleWeek>(DEFAULT_SIMPLE_WEEK);
  const [hoursSet, setHoursSet] = useState(false);
  const [home, setHome] = useState<PlaceDraft>(EMPTY_PLACE);
  const [work, setWork] = useState<PlaceDraft>(EMPTY_PLACE);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [reminder, setReminder] = useState(REMINDERS_SUPPORTED);

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
      if (next === 'on') setStep(HOURS);
    } finally {
      setAsked(true);
      setBusy(false);
    }
  };
  // Back from Settings with "Always" chosen: switch tracking on and move on, no extra tap.
  const cameBackWithAlways = step === 2 && inSettings && (status === 'off' || status === 'on');
  useEffect(() => {
    if (!cameBackWithAlways) return;
    let current = true;
    (status === 'on' ? Promise.resolve<TrackingStatus>('on') : enable()).then((next) => {
      if (!current) return;
      setInSettings(false);
      if (next === 'on') setStep(HOURS);
    }, () => {});
    return () => {
      current = false;
    };
    // Runs once per return from Settings; `status` and `enable` are read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameBackWithAlways]);


  const saveHours = async () => {
    const settings = await loadSettings(db);
    await saveSettings(db, { ...settings, workHoursEnabled: true, workWeek: toWorkWeek(week) });
    setHoursSet(true);
    setStep(PLACES);
  };

  const savePlaces = async () => {
    setPlaceError(null);
    setBusy(true);
    try {
      const existing = await listPlaces(db);
      for (const [draft, kind, name] of [
        [home, 'home', 'Home'],
        [work, 'work', 'Work'],
      ] as const) {
        if (!draft.text.trim() && !draft.at) continue;
        const at = await resolvePlace(draft);
        // Going back and saving again replaces the place instead of adding a second one.
        for (const old of existing.filter((place) => place.kind === kind && place.name === name)) {
          await deletePlace(db, old.id);
        }
        await insertPlace(db, { name, kind, at });
      }
      setStep(DONE);
    } catch (error) {
      setPlaceError(error instanceof Error ? error.message : 'Couldn’t save those places. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      const scheduled = reminder ? await enableWeeklyReminder(picked.unit).catch(() => false) : false;
      await saveSettings(db, { ...(await loadSettings(db)), weeklyReminder: scheduled });
      if (!hoursSet) await scheduleWorkHoursNudge().catch(() => {});
    } finally {
      setBusy(false);
    }
    await finishOnboarding();
    router.replace('/');
  };

  // The first screen stays on the launch animation's green, so one flows into the other.
  const onBrand = step === 0;

  const primary = (label: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={[
        styles.primary,
        { backgroundColor: onBrand ? '#FFFFFF' : theme.accent, opacity: busy ? 0.6 : 1 },
      ]}>
      <ThemedText type="smallBold" style={{ color: onBrand ? '#064E3B' : theme.onAccent }}>
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
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.three },
      ]}>
      <StatusBar style={onBrand ? 'light' : 'auto'} />
      {onBrand && <BrandGradient />}
      <View style={styles.top}>
        {step > 0 && step < DONE ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => setStep(step - 1)}>
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
              style={[
                styles.dot,
                {
                  backgroundColor: onBrand
                    ? i <= step
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.3)'
                    : i <= step
                      ? theme.accent
                      : theme.backgroundSelected,
                },
                i === step && styles.dotCurrent,
              ]}
            />
          ))}
        </View>
        <View style={styles.topSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <LeafMark size={132} />
              <Text style={[styles.brandTitle, styles.heading]}>Every business mile, counted.</Text>
              <Text style={styles.brandBody}>
                MileMint logs your drives automatically and works out what they’re worth at tax time.
              </Text>
              <View style={styles.points}>
                {WELCOME_POINTS.map(([title, body]) => (
                  <View key={title} style={styles.point}>
                    <View style={styles.pointTick}>
                      <Text style={styles.pointTickText}>✓</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.pointTitle}>{title}</Text>
                      <Text style={styles.pointBody}>{body}</Text>
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
                This sets your currency, miles or kilometres, tax year and official mileage rate. You can
                change it later in Settings.
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
              {status === 'needs-always' || (status === 'needs-permission' && asked) ? (
                <AlwaysGuide current={status === 'needs-always' ? 'While Using the App' : 'Never'} />
              ) : (
                status !== 'unsupported' && (
                  <ThemedView type="backgroundElement" style={styles.card}>
                    <ThemedText type="smallBold">What you’ll see next</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      1. Tap “Allow While Using App”.{'\n'}2. If iOS then offers “Change to Always Allow”, tap
                      it. If not, we’ll show you the quick switch in Settings.
                    </ThemedText>
                  </ThemedView>
                )
              )}
              {status === 'unsupported' && (
                <ThemedText type="small" themeColor="textSecondary">
                  Automatic tracking runs on your iPhone. You can still add trips by hand here.
                </ThemedText>
              )}
            </>
          )}

          {step === HOURS && (
            <>
              <ThemedText type="subtitle" style={styles.heading}>
                When do you usually work?
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Drives during these hours are marked business for you, the rest personal. Set it once and
                forget it. You can always swipe to change a trip.
              </ThemedText>
              <WorkHoursQuick value={week} onChange={setWeek} locale={picked.locale} />
            </>
          )}

          {step === PLACES && (
            <>
              <ThemedText type="subtitle" style={styles.heading}>
                Where are home and work?
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Trips then read “Home → Work” instead of street names, and commutes are flagged for you. Both
                are optional.
              </ThemedText>
              <PlaceField label="Home" placeholder="Address or postcode" value={home} onChange={setHome} />
              <PlaceField label="Work" placeholder="Address or postcode" value={work} onChange={setWork} />
              {placeError && (
                <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                  {placeError}
                </ThemedText>
              )}
            </>
          )}

          {step === DONE && (
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
                <ThemedText type="smallBold">Good to know</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  • Swipe a trip right for business, left for personal.{'\n'}• Add more places (clients, the
                  depot, the gym) from any trip with “Save as place”, or in Settings → Places.
                  {hoursSet ? '' : '\n• Set your work hours any time in Settings.'}
                </ThemedText>
              </ThemedView>
              {REMINDERS_SUPPORTED && (
                <ThemedView type="backgroundElement" style={[styles.card, styles.reminderRow]}>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">Sunday evening check-in</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      A (slightly cheeky) weekly nudge to sort your drives, so no business mile goes
                      unclaimed.
                    </ThemedText>
                  </View>
                  <Switch
                    accessibilityLabel="Sunday evening check-in"
                    value={reminder}
                    onValueChange={setReminder}
                    trackColor={{ true: theme.accent }}
                  />
                </ThemedView>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.actions}>
          {step === 0 && primary('Get started', () => setStep(1))}
          {step === 1 && primary('Continue', saveCountry)}
          {step === 2 &&
            (status === 'on' || status === 'unsupported'
              ? primary('Continue', () => setStep(HOURS))
              : status === 'needs-always' || (status === 'needs-permission' && asked)
                ? primary('Open Settings', () => {
                  setInSettings(true);
                  Linking.openSettings();
                })
                : primary(busy ? 'Waiting for your answer…' : 'Allow location', allowLocation))}
          {step === 2 &&
            status !== 'on' &&
            status !== 'unsupported' &&
            secondary(status === 'needs-always' ? 'Continue without “Always”' : 'Not now', () =>
              setStep(HOURS),
            )}
          {step === HOURS && primary('Save my hours', saveHours)}
          {step === HOURS && secondary('I don’t have set hours', () => setStep(PLACES))}
          {step === PLACES &&
            primary(busy ? 'Saving…' : home.text || work.text ? 'Save places' : 'Continue', savePlaces)}
          {step === PLACES && secondary('Skip for now', () => setStep(DONE))}
          {step === DONE && primary('Start using MileMint', finish)}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.four },
  brandTitle: { color: '#FFFFFF', fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -0.5 },
  brandBody: { color: '#D1FAE5', fontSize: 17, lineHeight: 24 },
  pointTick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  pointTickText: { color: '#064E3B', fontSize: 12, fontWeight: '800' },
  pointTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pointBody: { color: '#D1FAE5', fontSize: 14, lineHeight: 20 },
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
  heading: { marginTop: Spacing.two },
  points: { gap: Spacing.three, marginTop: Spacing.two },
  point: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1, gap: Spacing.half },
  flexFill: { flex: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  actions: { gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  primary: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  secondary: { alignItems: 'center', paddingVertical: Spacing.two },
});
