import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlwaysGuide } from '@/components/always-guide';
import { BrandGradient } from '@/components/brand-gradient';
import { CountryOptions, phoneRegion } from '@/components/country-options';
import { LeafMark } from '@/components/leaf-mark';
import { MintWash, StepHeader, StepIcon } from '@/components/step-header';
import { VehiclePicker } from '@/components/vehicle-picker';
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
import { formatRate, REGIONS, vehicleRule, type RegionCode } from '@/domain/regions';
import { useKeyboardOpen } from '@/hooks/use-keyboard-open';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';
import { scheduleWorkHoursNudge } from '@/reminders/weekly';
import type { TrackingStatus } from '@/tracking/background';
import { useTracking } from '@/tracking/use-tracking';
import { VEHICLE_ICONS, type VehicleType } from '@/domain/trip';
import { DEFAULT_VEHICLE_NAMES } from '@/domain/vehicles';
import { addVehicle, ensureVehicles, listVehicles, updateVehicle } from '@/db/vehicles-repo';

/**
 * First launch, as one full-screen flow instead of a chain of pop-ups:
 * welcome → country → automatic tracking → work hours → home and work → done.
 * The last three are optional and skip in one tap. Each step does one thing,
 * and the user always sees how far along they are.
 */

const STEPS = 6;
const EXTRA_LABELS: Record<VehicleType, string> = {
  car: 'Car or van',
  motorbike: 'Moped or motorbike',
  bicycle: 'Bicycle',
};
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
  /** Which of iOS's two location questions is on screen, to say what to tap. */
  const [asking, setAsking] = useState<1 | 2 | null>(null);
  /** Sent to Settings to choose "Always": carry on by ourselves once it's chosen. */
  const [inSettings, setInSettings] = useState(false);
  const db = useSQLiteContext();
  const [week, setWeek] = useState<SimpleWeek>(DEFAULT_SIMPLE_WEEK);
  const [hoursSet, setHoursSet] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [workStyle, setWorkStyle] = useState<'hours' | 'shifts' | 'neither' | null>(null);
  const [extraVehicles, setExtraVehicles] = useState<VehicleType[]>([]);
  /** Chose shifts (delivery apps) instead of set hours. */
  const [shifts, setShifts] = useState(false);
  const [home, setHome] = useState<PlaceDraft>(EMPTY_PLACE);
  const [work, setWork] = useState<PlaceDraft>(EMPTY_PLACE);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const picked = REGIONS[country];
  const topRate = formatRate(picked.rates[picked.rates.length - 1].tiers[0].rate, picked);

  const saveCountry = async () => {
    await setRegion(country);
    await saveSettings(db, { ...(await loadSettings(db)), vehicle });
    // The first vehicle in the garage. Going back and changing the choice updates it.
    const { current } = await ensureVehicles(db);
    if (current.type !== vehicle) {
      const renamed = current.name === DEFAULT_VEHICLE_NAMES[current.type];
      await updateVehicle(db, {
        ...current,
        type: vehicle,
        name: renamed ? DEFAULT_VEHICLE_NAMES[vehicle] : current.name,
      });
    }
    setStep(2);
  };

  const allowLocation = async () => {
    setBusy(true);
    try {
      const next = await enable(setAsking);
      if (next === 'on') setStep(HOURS);
    } finally {
      setAsking(null);
      setAsked(true);
      setBusy(false);
    }
  };
  // Back from Settings with "Always" chosen: switch tracking on and move on, no extra tap.
  const cameBackWithAlways = step === 2 && inSettings && (status === 'off' || status === 'on');
  useEffect(() => {
    if (!cameBackWithAlways) return;
    let current = true;
    (status === 'on' ? Promise.resolve<TrackingStatus>('on') : enable()).then(
      (next) => {
        if (!current) return;
        setInSettings(false);
        if (next === 'on') setStep(HOURS);
      },
      () => {},
    );
    return () => {
      current = false;
    };
    // Runs once per return from Settings; `status` and `enable` are read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameBackWithAlways]);

  const chooseShifts = async () => {
    await saveSettings(db, { ...(await loadSettings(db)), shiftMode: true, workHoursEnabled: false });
    // Couriers often switch between a car and a moped: add the others they ticked.
    const garage = await listVehicles(db);
    for (const type of extraVehicles) {
      if (!garage.some((v) => v.type === type)) await addVehicle(db, { type });
    }
    setShifts(true);
    setStep(PLACES);
  };

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
      // Notifications are asked for later, when the first trip shows up (more yeses in context).
      if (!hoursSet && !shifts) await scheduleWorkHoursNudge().catch(() => {});
    } finally {
      setBusy(false);
    }
    await finishOnboarding();
    router.replace('/');
  };

  // Full brand green for the welcome, the tracking ask (the one that matters most) and the
  // finish; the steps in between open with a green header card.
  const onBrand = step === 0 || step === 2 || step === DONE;
  // While typing, the buttons would ride up above the keyboard, right over the address
  // suggestions, so a tap meant for a suggestion could save and move on. Hide them meanwhile.
  const typing = useKeyboardOpen();
  const scroller = useRef<ScrollView>(null);
  const fieldTops = useRef({ home: 0, work: 0 });
  /** Moves an address box near the top, so its suggestions show above the keyboard. */
  const scrollFieldUp = (field: 'home' | 'work') =>
    // After the keyboard has started to open and the extra room has been added.
    setTimeout(
      () => scroller.current?.scrollTo({ y: Math.max(0, fieldTops.current[field] - 8), animated: true }),
      250,
    );

  const primary = (label: string, onPress: () => void, enabled = true) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: busy || !enabled }}
      disabled={busy || !enabled}
      onPress={onPress}
      style={[
        styles.primary,
        { backgroundColor: onBrand ? '#FFFFFF' : theme.accent, opacity: busy ? 0.6 : enabled ? 1 : 0.35 },
      ]}>
      <ThemedText type="smallBold" style={{ color: onBrand ? '#064E3B' : theme.onAccent }}>
        {label}
      </ThemedText>
    </Pressable>
  );
  const secondary = (label: string, onPress: () => void) => (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.secondary}>
      <ThemedText type="small" themeColor="textSecondary" style={onBrand && styles.brandSoft}>
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
      {onBrand ? <BrandGradient /> : <MintWash />}
      <View style={styles.top}>
        {step > 0 && step < DONE ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => setStep(step - 1)}>
            <ThemedText type="small" style={{ color: onBrand ? '#D1FAE5' : theme.accent }}>
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
          ref={scroller}
          contentContainerStyle={[
            styles.content,
            (!onBrand || step === 2 || step === DONE) && styles.contentTop,
            // Room to scroll an address box up to the top while the keyboard is open.
            typing && step === PLACES && styles.roomToScroll,
          ]}
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
              <StepHeader glyph="globe" eyebrow="Step 1 · Country" title="Where do you drive?">
                Sets your currency, miles or kilometres, tax year and official mileage rate. You can change it
                later.
              </StepHeader>
              <CountryOptions
                value={country}
                onChange={(code) => {
                  setCountry(code);
                  // Bring "What do you drive?" into view once a country is picked.
                  setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 150);
                }}
                vehicle={vehicle}
                showRate={false}
              />
              <View style={styles.vehicles}>
                <ThemedText type="small" themeColor="textSecondary">
                  What do you drive?
                </ThemedText>
                <VehiclePicker value={vehicle} onChange={setVehicle} />
                <ThemedText type="small" themeColor="textSecondary" accessibilityLiveRegion="polite">
                  {vehicleRule(picked, vehicle)}
                  {vehicle === 'car' ? '. Petrol, diesel, hybrid or electric: same rate.' : ''}
                </ThemedText>
              </View>
            </>
          )}

          {step === 2 &&
            (asking ? (
              // Shown behind iOS's own question (it dims the screen but this still reads).
              <View style={styles.coach} accessibilityLiveRegion="polite">
                <View style={styles.coachCard}>
                  <Text style={styles.coachStep}>↑ {asking} OF 2</Text>
                  <Text style={styles.coachText}>
                    Tap “{asking === 1 ? 'Allow While Using App' : 'Change to Always Allow'}”
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.brandIcon}>
                  <StepIcon glyph="location" size={30} />
                </View>
                <Text style={styles.brandEyebrow}>STEP 2 · TRACKING</Text>
                <Text style={styles.brandTitleSmall}>Never miss a mile.</Text>
                <Text style={styles.brandBody}>
                  Set location to “Always” and MileMint logs every drive, even when it’s closed.
                </Text>
                <Text style={styles.brandCallout}>Without “Always”, drives go unlogged and unclaimed.</Text>
                {status === 'needs-always' || (status === 'needs-permission' && asked) ? (
                  <AlwaysGuide current={status === 'needs-always' ? 'While Using the App' : 'Never'} />
                ) : status === 'unsupported' ? (
                  <Text style={styles.pointBody}>
                    Automatic tracking runs on your iPhone. You can still add trips by hand here.
                  </Text>
                ) : (
                  <>
                    <View style={styles.glass}>
                      <Text style={styles.pointBody}>
                        iOS asks twice. Tap <Text style={styles.pointTitle}>Allow While Using App</Text>, then{' '}
                        <Text style={styles.pointTitle}>Change to Always Allow</Text>.
                      </Text>
                    </View>
                    <Text style={styles.privacy}>
                      🔒 GPS runs only while you’re driving. Trips stay on your iPhone, never on our servers.
                    </Text>
                  </>
                )}
              </>
            ))}

          {step === HOURS && (
            <>
              <StepHeader glyph="clock" eyebrow="Step 3 · Your work" title="How do you work?">
                MileMint sorts your drives to match. You can always swipe to change a trip.
              </StepHeader>
              <WorkStyleOption
                selected={workStyle === 'hours'}
                emoji="🗓️"
                title="Set hours"
                detail="Trades, sales, care, office. Drives in your hours are business."
                onPress={() => setWorkStyle('hours')}
              />
              {workStyle === 'hours' && (
                <WorkHoursQuick value={week} onChange={setWeek} locale={picked.locale} />
              )}
              <WorkStyleOption
                selected={workStyle === 'shifts'}
                emoji="📦"
                title="Shifts & rounds (delivery apps)"
                detail="Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber. Car, van, moped or bike."
                onPress={() => setWorkStyle('shifts')}
              />
              {workStyle === 'shifts' && (
                <View style={styles.vehicles}>
                  <ThemedText type="small" themeColor="textSecondary">
                    You drive: {VEHICLE_ICONS[vehicle]} {EXTRA_LABELS[vehicle]}. Use other vehicles too? Tap
                    to add; you’ll pick one when you start a shift.
                  </ThemedText>
                  <View style={styles.extraRow}>
                    {(['car', 'motorbike', 'bicycle'] as const)
                      .filter((type) => type !== vehicle)
                      .map((type) => {
                        const on = extraVehicles.includes(type);
                        return (
                          <Pressable
                            key={type}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: on }}
                            onPress={() =>
                              setExtraVehicles(
                                on ? extraVehicles.filter((t) => t !== type) : [...extraVehicles, type],
                              )
                            }
                            style={[
                              styles.extraChip,
                              on
                                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                                : { borderColor: theme.backgroundSelected },
                            ]}>
                            <ThemedText type="smallBold" style={{ color: on ? theme.onAccent : theme.text }}>
                              {on ? '✓' : '+'} {VEHICLE_ICONS[type]} {EXTRA_LABELS[type]}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                  </View>
                </View>
              )}
              <WorkStyleOption
                selected={workStyle === 'neither'}
                emoji="✋"
                title="Neither"
                detail="I’ll swipe each drive myself."
                onPress={() => setWorkStyle('neither')}
              />
            </>
          )}

          {step === PLACES && (
            <>
              {shifts ? (
                <StepHeader glyph="home" eyebrow="Step 4 · Places" title="Where’s home?">
                  So trips read “Home → …” instead of a street name. Optional.
                </StepHeader>
              ) : (
                <StepHeader glyph="home" eyebrow="Step 4 · Places" title="Where are home and work?">
                  Trips then read “Home → Work” instead of street names, and commutes are flagged for you. Both
                  are optional.
                </StepHeader>
              )}
              <View onLayout={(e) => (fieldTops.current.home = e.nativeEvent.layout.y)}>
                <PlaceField
                  label="Home"
                  icon="🏠"
                  placeholder="Address or postcode"
                  value={home}
                  onChange={setHome}
                  onFocus={() => scrollFieldUp('home')}
                />
              </View>
              {/* Couriers have no single workplace: no Work question, and no commute rule. */}
              {!shifts && (
                <View onLayout={(e) => (fieldTops.current.work = e.nativeEvent.layout.y)}>
                  <PlaceField
                    label="Work"
                    icon="💼"
                    placeholder="Address or postcode"
                    value={work}
                    onChange={setWork}
                    onFocus={() => scrollFieldUp('work')}
                  />
                </View>
              )}
              {placeError && (
                <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                  {placeError}
                </ThemedText>
              )}
            </>
          )}

          {step === DONE && (
            <>
              <LeafMark size={72} />
              <Text style={styles.brandTitleSmall}>You’re all set.</Text>
              <Text style={styles.brandBody}>
                {status === 'on'
                  ? `Just drive. Each trip appears after you park, and business drives count at ${picked.authority}’s ${topRate} rate.`
                  : 'Turn on automatic tracking from the home screen whenever you’re ready, or add trips with the + button.'}
              </Text>
              <View style={styles.glass}>
                <Text style={styles.pointTitle}>Good to know</Text>
                {[
                  ['👉', 'Swipe a trip right for business, left for personal.'],
                  ['📍', 'Save places like clients or the depot from any trip.'],
                  ...(shifts
                    ? [
                        [
                          '▶️',
                          'Tap “Start shift” when you start work. Every drive until you end it is business.',
                        ],
                      ]
                    : hoursSet
                      ? []
                      : [
                          [
                            '⏱️',
                            'Set your work hours any time in Settings, and most drives sort themselves.',
                          ],
                        ]),
                ].map(([icon, text]) => (
                  <View key={icon} style={styles.tip}>
                    <Text style={styles.tipIcon}>{icon}</Text>
                    <Text style={[styles.pointBody, styles.flex]}>{text}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.glass, styles.reminderRow]}>
                <Text style={styles.tipIcon}>🎁</Text>
                <View style={styles.flex}>
                  <Text style={styles.pointTitle}>Free to start</Text>
                  <Text style={styles.pointBody}>
                    40 automatic drives a month{shifts ? ' (a whole shift counts as one)' : ''}, plus unlimited trips
                    by hand. Go Pro any time for unlimited.
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        <View style={[styles.actions, typing && step === PLACES && styles.hidden]}>
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
                : asking
                  ? null
                  : primary('Set up auto-logging', allowLocation))}
          {step === 2 &&
            !asking &&
            status !== 'on' &&
            status !== 'unsupported' &&
            secondary(status === 'needs-always' ? 'Continue without “Always”' : 'Not now', () =>
              setStep(HOURS),
            )}
          {step === HOURS &&
            (workStyle === 'hours'
              ? primary('Save my hours', saveHours)
              : workStyle === 'shifts'
                ? primary('Use shifts', chooseShifts)
                : workStyle === 'neither'
                  ? primary('Continue', () => setStep(PLACES))
                  : primary('Choose one to continue', () => {}, false))}
          {step === PLACES &&
            primary(busy ? 'Saving…' : home.text || work.text ? 'Save and continue' : 'Continue', savePlaces)}
          {step === PLACES && secondary('Skip for now', () => setStep(DONE))}
          {step === DONE && primary('Start using MileMint', finish)}
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

/** One of the "How do you work?" choices: a card that fills with a mint tint and a tick when chosen. */
function WorkStyleOption({
  selected,
  emoji,
  title,
  detail,
  onPress,
}: {
  selected: boolean;
  emoji: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.workStyle,
        {
          borderColor: selected ? theme.accent : theme.backgroundSelected,
          backgroundColor: selected ? theme.accent + '14' : theme.backgroundElement,
        },
      ]}>
      <Text style={styles.workStyleEmoji}>{emoji}</Text>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      </View>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? theme.accent : theme.backgroundSelected },
          selected && { backgroundColor: theme.accent },
        ]}>
        {selected && <Text style={[styles.radioTick, { color: theme.onAccent }]}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  workStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.three,
  },
  workStyleEmoji: { fontSize: 26, lineHeight: 32 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioTick: { fontSize: 13, fontWeight: '800' },
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
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandEyebrow: { color: '#FACC15', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: Spacing.one },
  brandTitleSmall: { color: '#FFFFFF', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  brandCallout: { color: '#FACC15', fontSize: 17, lineHeight: 23, fontWeight: '800' },
  pointBody: { color: '#D1FAE5', fontSize: 14, lineHeight: 20 },
  brandSoft: { color: '#D1FAE5' },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  tip: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  tipIcon: { fontSize: 15, lineHeight: 20 },
  hidden: { display: 'none' },
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
  contentTop: { justifyContent: 'flex-start', paddingTop: Spacing.three },
  points: { gap: Spacing.three, marginTop: Spacing.two },
  point: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1, gap: Spacing.half },
  flexFill: { flex: 1 },
  vehicles: { gap: Spacing.two },
  roomToScroll: { paddingBottom: 420 },
  // Pinned low, below where iOS's alert sits, on a dark card so it still reads while dimmed.
  coach: { flex: 1, justifyContent: 'flex-end' },
  coachCard: {
    backgroundColor: 'rgba(1,28,20,0.85)',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.one,
    alignItems: 'center',
  },
  coachStep: { color: '#D1FAE5', fontSize: 15, fontWeight: '800', letterSpacing: 1.2 },
  coachText: { color: '#FACC15', fontSize: 28, lineHeight: 35, fontWeight: '800', textAlign: 'center' },
  privacy: { color: '#FFFFFF', fontSize: 15, lineHeight: 21 },
  extraRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  extraChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  reminderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  actions: { gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  primary: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  secondary: { alignItems: 'center', paddingVertical: Spacing.two },
});
