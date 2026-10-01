import { router, useLocalSearchParams, type Href } from 'expo-router';
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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findLatestBackup, isDatabaseEmpty, problemOf, restoreBackup, type FoundBackup } from '@/backup/backup';
import { formatBackupDate, PROBLEM_TEXT } from '@/backup/copy';
import { tripCount } from '@/backup/snapshot';
import { AlwaysGuide } from '@/components/always-guide';
import { BrandGradient } from '@/components/brand-gradient';
import { CountryOptions, phoneRegion } from '@/components/country-options';
import { LeafMark } from '@/components/leaf-mark';
import { PermissionPreview } from '@/components/permission-preview';
import { purposeIcon, quickPurposes, shownPurpose } from '@/components/purpose-picker';
import { MintWash, StepHeader, StepIcon } from '@/components/step-header';
import { VehiclePicker } from '@/components/vehicle-picker';
import { firstCode, RedeemCode } from '@/components/redeem-code';
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
import { loadSettings, updateSettings } from '@/db/settings-repo';
import { SHIFT_PURPOSE } from '@/domain/auto-classify';
import { marApplies, parsePence } from '@/domain/mar';
import { FREE_AUTO_DRIVES_PER_MONTH } from '@/domain/plan';
import { displayLocale, formatRate, REGIONS, vehicleRule, type RegionCode } from '@/domain/regions';
import { useKeyboardOpen } from '@/hooks/use-keyboard-open';
import { useTheme } from '@/hooks/use-theme';
import { LANGUAGES, msg, useLanguage, useT } from '@/i18n/i18n';
import { Rich } from '@/i18n/rich';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';
import { enableWeeklyReminder, scheduleWorkHoursNudge } from '@/reminders/weekly';
import type { TrackingStatus } from '@/tracking/background';
import { useTracking } from '@/tracking/use-tracking';
import { VEHICLE_ICONS, type VehicleType } from '@/domain/trip';
import { defaultVehicleName, isDefaultVehicleName } from '@/domain/vehicles';
import { addVehicle, ensureVehicles, listVehicles, updateVehicle } from '@/db/vehicles-repo';

import { ICloudBackup } from '../../modules/icloud-backup';

/**
 * First launch, as one full-screen flow instead of a chain of pop-ups:
 * welcome → country → automatic tracking → work hours → usual purpose → home
 * and work → done. The last four are optional and skip in one tap. Each step does one thing,
 * and the user always sees how far along they are.
 *
 * On a new iPhone with a MileMint backup in iCloud, the welcome offers to
 * restore it instead; the backup brings the country, hours and places, so
 * only the tracking step (a permission for this phone) remains.
 */

/** Dots shown: the usual purpose is part of "Your work", not a step of its own. */
const STEPS = 6;
const EXTRA_LABELS: Record<VehicleType, string> = {
  car: msg('Car or van'),
  motorbike: msg('Moped or motorbike'),
  bicycle: msg('Bicycle'),
};
const HOURS = 3;
/** "What are most of your work drives for?", right after how they work. */
const PURPOSE = 4;
const PLACES = 5;
const DONE = 6;

const WELCOME_POINTS = [
  [msg('Automatic'), msg('Drives are logged in the background. No buttons to press.')],
  [msg('Worth money'), msg('See what each business drive saves you at tax time.')],
  [msg('Private'), msg('No account. Your trips stay encrypted on your iPhone.')],
] as const;

export default function WelcomeScreen() {
  const theme = useTheme();
  const t = useT();
  const lang = useLanguage();
  const languageName = LANGUAGES.find((l) => l.code === lang)?.name ?? 'English';
  const insets = useSafeAreaInsets();
  const { region, chosen, setRegion, finishOnboarding, reload } = useRegion();
  const referral = useReferral();
  /** A friend's code from an invite link (milemint://invite/CODE), offered on the last step. */
  const { code: codeParam } = useLocalSearchParams<{ code?: string | string[] }>();
  // A link can carry the parameter twice (an array) or be very long: take the first, cut short.
  const linkCode = firstCode(codeParam);
  const [step, setStep] = useState(0);
  /** A backup in iCloud, offered when this iPhone has no trips yet. */
  const [backup, setBackup] = useState<FoundBackup | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  /** Restored from iCloud: set-up is done but for tracking, which is per phone. */
  const [restored, setRestored] = useState(false);
  const afterTracking = restored ? DONE : HOURS;
  const { status, enable } = useTracking(undefined, { watch: step === 2 });
  const [country, setCountry] = useState<RegionCode>(() => (chosen ? region.code : phoneRegion()));
  const [busy, setBusy] = useState(false);
  /**
   * One tap at a time: a second tap while the first is still saving is ignored,
   * and so is one landing in the next ~half second on the button that replaced it
   * (a triple-tap on "Get started" used to skip choosing the country).
   */
  const tapping = useRef(false);
  const once = (onPress: () => void | Promise<void>) => async () => {
    if (tapping.current) return;
    tapping.current = true;
    try {
      await onPress();
    } finally {
      setTimeout(() => {
        tapping.current = false;
      }, 450);
    }
  };
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
  /** Visits clients or patients at home: keep only the area of each visit (domain/privacy). */
  const [clientPrivacy, setClientPrivacy] = useState(false);
  /** Chose shifts (delivery apps) instead of set hours. */
  const [shifts, setShifts] = useState(false);
  const [home, setHome] = useState<PlaceDraft>(EMPTY_PLACE);
  const [work, setWork] = useState<PlaceDraft>(EMPTY_PLACE);
  const [placeError, setPlaceError] = useState<string | null>(null);
  /** UK: employed and using their own vehicle, so home shows Mileage Allowance Relief. Optional. */
  const [employed, setEmployed] = useState(false);
  const [employerPaysNothing, setEmployerPaysNothing] = useState(false);
  const [employerRateText, setEmployerRateText] = useState('45');
  /** The kinds of work drive picked, in the order tapped; undefined until one is (shift workers then see Deliveries chosen). */
  const [workChoices, setWorkChoices] = useState<string[] | undefined>(undefined);

  // A new iPhone: look for a backup in iCloud while the welcome is read.
  useEffect(() => {
    if (!ICloudBackup.supported) return;
    let current = true;
    (async () => {
      if (!(await isDatabaseEmpty(db))) return;
      const found = await findLatestBackup();
      if (current && found) setBackup(found);
    })().catch(() => {});
    return () => {
      current = false;
    };
  }, [db]);

  const restoreFromICloud = async () => {
    if (!backup) return;
    setBusy(true);
    setRestoreError(null);
    try {
      await restoreBackup(db, backup);
      await reload();
      await referral.reload();
      const settings = await loadSettings(db);
      setBackup(null);
      setHoursSet(settings.workHoursEnabled);
      setShifts(settings.shiftMode);
      setVehicle(settings.vehicle);
      if (settings.region) {
        setCountry(settings.region);
        setRestored(true);
        setStep(2);
      } else {
        // Backed up before choosing a country: ask now, then carry on as usual.
        setStep(1);
      }
    } catch (error) {
      setRestoreError(t(PROBLEM_TEXT[problemOf(error)]));
    } finally {
      setBusy(false);
    }
  };

  const picked = REGIONS[country];
  const topRate = formatRate(picked.rates[picked.rates.length - 1].tiers[0].rate, picked);

  const saveCountry = async () => {
    await setRegion(country);
    await updateSettings(db, { vehicle });
    // The first vehicle in the garage. Going back and changing the choice updates it.
    const { current } = await ensureVehicles(db);
    if (current.type !== vehicle) {
      const renamed = isDefaultVehicleName(current.name, current.type);
      await updateVehicle(db, {
        ...current,
        type: vehicle,
        name: renamed ? defaultVehicleName(vehicle) : current.name,
      });
    }
    setStep(2);
  };

  const allowLocation = async () => {
    setBusy(true);
    try {
      const next = await enable(setAsking);
      if (next === 'on') setStep(afterTracking);
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
        if (next === 'on') setStep(afterTracking);
      },
      () => {},
    );
    return () => {
      current = false;
    };
    // Runs once per return from Settings; `status`, `enable` and `afterTracking` are read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameBackWithAlways]);

  /** Saved with whichever way of working is chosen; going back and changing it overwrites it. */
  /** An employer rate that can't be read: the error under the field says so, and set-up waits for it. */
  const rateInvalid = marApplies(picked) && employed && !employerPaysNothing && parsePence(employerRateText) === null;

  const saveEmployment = async () => {
    if (!marApplies(picked)) return;
    const employerRate = employerPaysNothing ? 0 : (parsePence(employerRateText) ?? 450);
    await updateSettings(db, {
      employment: employed ? 'employee' : 'self-employed',
      employerRate,
    });
  };

  const chooseShifts = async () => {
    if (rateInvalid) return;
    await saveEmployment();
    await updateSettings(db, { shiftMode: true, workHoursEnabled: false, clientPrivacy });
    // Couriers often switch between a car and a moped: add the others they ticked.
    const garage = await listVehicles(db);
    for (const type of extraVehicles) {
      if (!garage.some((v) => v.type === type)) await addVehicle(db, { type });
    }
    setShifts(true);
    setHoursSet(false);
    setStep(PURPOSE);
  };

  const saveHours = async () => {
    if (rateInvalid) return;
    await saveEmployment();
    // Going back from "Shifts" and choosing hours instead turns shift mode off again.
    await updateSettings(db, {
      shiftMode: false,
      workHoursEnabled: true,
      workWeek: toWorkWeek(week),
      clientPrivacy,
    });
    setShifts(false);
    setHoursSet(true);
    setStep(PURPOSE);
  };

  const chooseNeither = async () => {
    if (rateInvalid) return;
    await saveEmployment();
    await updateSettings(db, { shiftMode: false, workHoursEnabled: false, clientPrivacy });
    setShifts(false);
    setHoursSet(false);
    setStep(PURPOSE);
  };

  /**
   * The usual purpose, saved as the user's own only when they tap one. Taking
   * the preselected "Deliveries" (shift workers) or skipping saves none, so
   * going back and choosing set hours instead leaves nothing behind: in shift
   * mode no usual purpose already means "Deliveries" (domain/auto-classify).
   */
  const shownChoices = workChoices ?? (shifts ? [SHIFT_PURPOSE] : []);
  /** Several can be picked: the first is filled in on work drives, all of them are offered first on a trip. */
  const toggleWork = (purpose: string) =>
    setWorkChoices(
      shownChoices.includes(purpose) ? shownChoices.filter((other) => other !== purpose) : [...shownChoices, purpose],
    );
  const saveWork = async (choices: string[]) => {
    const first = choices[0] ?? null;
    await updateSettings(db, {
      // Deliveries first for a shift worker is what no setting already means.
      defaultPurpose: shifts && first === SHIFT_PURPOSE ? null : first,
      workPurposes: choices,
    });
    setWorkChoices(choices);
    setStep(PLACES);
  };
  const purposeOptions = quickPurposes({ shiftMode: shifts, clientPrivacy }, 10);

  // Under whichever way of working is chosen: care and support work comes in all three.
  const privacyCheck = <ClientPrivacyCheck value={clientPrivacy} onChange={setClientPrivacy} />;

  const savePlaces = async () => {
    setPlaceError(null);
    setBusy(true);
    try {
      const existing = await listPlaces(db);
      for (const [draft, kind, name] of [
        [home, 'home', t('Home')],
        [work, 'work', t('Work')],
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
      setPlaceError(error instanceof Error ? error.message : t('Couldn’t save those places. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      // The Sunday check-in is on by default: iOS asks once, here. Turning it off is in Settings.
      const scheduled = await enableWeeklyReminder(picked.unit).catch(() => false);
      await updateSettings(db, { weeklyReminder: scheduled, reminderAsked: true, reminderDefaulted: true });
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
  /** The dot lit for this step: the usual purpose shares "Your work"'s. */
  const dot = step >= PURPOSE ? step - 1 : step;
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

  const primary = (label: string, onPress: () => void | Promise<void>, enabled = true) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: busy || !enabled }}
      disabled={busy || !enabled}
      onPress={once(onPress)}
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
            accessibilityLabel={t('Back')}
            hitSlop={12}
            onPress={() => setStep(step - 1)}>
            <ThemedText type="small" style={{ color: onBrand ? '#D1FAE5' : theme.accent }}>
              {t('Back')}
            </ThemedText>
          </Pressable>
        ) : (
          <View />
        )}
        <View accessibilityLabel={t('Step {{step}} of {{total}}', { step: dot + 1, total: STEPS })} style={styles.dots} pointerEvents="none">
          {Array.from({ length: STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: onBrand
                    ? i <= dot
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.3)'
                    : i <= dot
                      ? theme.accent
                      : theme.backgroundSelected,
                },
                i === dot && styles.dotCurrent,
              ]}
            />
          ))}
        </View>
        {step === 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Language: {{name}}. Change', { name: languageName })}
            hitSlop={8}
            onPress={() => router.push('/language' as Href)}
            style={styles.languagePill}>
            <Text style={styles.languagePillText} numberOfLines={1}>
              🌐 {languageName}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.topSpacer} />
        )}
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
              <Text style={[styles.brandTitle, styles.heading]}>{t('Every business mile, counted.')}</Text>
              <Text style={styles.brandBody}>
                {t('MileMint logs your drives automatically and works out what they’re worth at tax time.')}
              </Text>
              <View style={styles.points}>
                {WELCOME_POINTS.map(([title, body]) => (
                  <View key={title} style={styles.point}>
                    <View style={styles.pointTick}>
                      <Text style={styles.pointTickText}>✓</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.pointTitle}>{t(title)}</Text>
                      <Text style={styles.pointBody}>{t(body)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              {backup && (
                <View style={styles.glass} accessibilityLiveRegion="polite">
                  <Text style={styles.pointTitle}>{t('Restore your trips from iCloud')}</Text>
                  <Text style={styles.pointBody}>
                    {backup.snapshot
                      ? t('Backup from {{date}} with {{count}} trips', {
                          date: formatBackupDate(backup.createdAt, picked),
                          count: tripCount(backup.snapshot),
                        })
                      : t('Backup from {{date}}', { date: formatBackupDate(backup.createdAt, picked) })}
                  </Text>
                  {(restoreError || backup.problem === 'newer-app') && (
                    <Text style={styles.brandCallout} accessibilityRole="alert">
                      {restoreError ?? t(PROBLEM_TEXT['newer-app'])}
                    </Text>
                  )}
                </View>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <StepHeader glyph="globe" eyebrow={t('Step 1 · Country')} title={t('Where do you drive?')}>
                {t(
                  'Sets your currency, miles or kilometres, tax year and official mileage rate. You can change it later.',
                )}
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
                  {t('What do you drive?')}
                </ThemedText>
                <VehiclePicker value={vehicle} onChange={setVehicle} />
                <ThemedText type="small" themeColor="textSecondary" accessibilityLiveRegion="polite">
                  {vehicle === 'car'
                    ? t('{{rule}}. Petrol, diesel, hybrid or electric: same rate.', {
                        rule: vehicleRule(picked, vehicle),
                      })
                    : vehicleRule(picked, vehicle)}
                </ThemedText>
              </View>
            </>
          )}

          {step === 2 &&
            (asking ? (
              // Shown behind iOS's own question (it dims the screen but this still reads).
              <View style={styles.coach} accessibilityLiveRegion="polite">
                <View style={styles.coachCard}>
                  <Text style={styles.coachStep}>{t('↑ {{step}} OF 2', { step: asking })}</Text>
                  <Text style={styles.coachText}>
                    {asking === 1 ? t('Tap “Allow While Using App”') : t('Tap “Change to Always Allow”')}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.brandIcon}>
                  <StepIcon glyph="location" size={30} />
                </View>
                <Text style={styles.brandEyebrow}>{t('STEP 2 · TRACKING')}</Text>
                <Text style={styles.brandTitleSmall}>{t('Never miss a mile.')}</Text>
                <Text style={styles.brandBody}>
                  {t('Set location to “Always” and MileMint logs every drive, even when it’s closed.')}
                </Text>
                <Text style={styles.brandCallout}>{t('Without “Always”, drives go unlogged and unclaimed.')}</Text>
                {status === 'needs-always' || (status === 'needs-permission' && asked) ? (
                  <AlwaysGuide current={status === 'needs-always' ? 'While Using the App' : 'Never'} />
                ) : status === 'unsupported' ? (
                  <Text style={styles.pointBody}>
                    {t('Automatic tracking runs on your iPhone. You can still add trips by hand here.')}
                  </Text>
                ) : (
                  <>
                    <PermissionPreview />
                    <View style={styles.glass}>
                      <Rich
                        text={t(
                          'iOS asks twice. Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>.',
                        )}
                        style={styles.pointBody}
                        boldStyle={styles.pointTitle}
                      />
                    </View>
                    <Text style={styles.privacy}>
                      {t('🔒 GPS runs only while you’re driving. Trips stay on your iPhone, never on our servers.')}
                    </Text>
                  </>
                )}
              </>
            ))}

          {step === HOURS && (
            <>
              <StepHeader glyph="clock" eyebrow={t('Step 3 · Your work')} title={t('How do you work?')}>
                {t('MileMint sorts your drives to match. You can always swipe to change a trip.')}
              </StepHeader>
              <WorkStyleOption
                selected={workStyle === 'hours'}
                emoji="🗓️"
                title={t('Set hours')}
                detail={t('Trades, sales, care, office. Drives in your hours are business.')}
                onPress={() => setWorkStyle('hours')}
              />
              {workStyle === 'hours' && (
                <>
                  <WorkHoursQuick value={week} onChange={setWeek} locale={displayLocale(picked)} />
                  {privacyCheck}
                </>
              )}
              <WorkStyleOption
                selected={workStyle === 'shifts'}
                emoji="📦"
                title={t('Shifts & rounds (delivery apps)')}
                detail={t('Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber. Car, van, moped or bike.')}
                onPress={() => setWorkStyle('shifts')}
              />
              {workStyle === 'shifts' && (
                <View style={styles.vehicles}>
                  <ThemedText type="smallBold">{t('Use other vehicles for work too?')}</ThemedText>
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
                                on ? extraVehicles.filter((other) => other !== type) : [...extraVehicles, type],
                              )
                            }
                            style={[
                              styles.extraChip,
                              on
                                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                                : { borderColor: theme.backgroundSelected },
                            ]}>
                            <ThemedText type="smallBold" style={{ color: on ? theme.onAccent : theme.text }}>
                              {on ? '✓' : '+'} {VEHICLE_ICONS[type]} {t(EXTRA_LABELS[type])}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('You’ll choose which one when you start a shift.')}
                  </ThemedText>
                </View>
              )}
              {workStyle === 'shifts' && privacyCheck}
              <WorkStyleOption
                selected={workStyle === 'neither'}
                emoji="✋"
                title={t('Neither')}
                detail={t('I’ll swipe each drive myself.')}
                onPress={() => setWorkStyle('neither')}
              />
              {workStyle === 'neither' && privacyCheck}
              {marApplies(picked) && (
                <View style={[styles.employed, { borderColor: theme.backgroundSelected }]}>
                  <View style={styles.employedRow}>
                    <View style={styles.flex}>
                      <ThemedText type="smallBold">{t('Employed, in your own vehicle?')}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {t('MileMint works out the tax relief you can claim. Optional.')}
                      </ThemedText>
                    </View>
                    <Switch
                      accessibilityLabel={t('Employed, in your own vehicle?')}
                      value={employed}
                      onValueChange={setEmployed}
                      trackColor={{ true: theme.accent }}
                    />
                  </View>
                  {employed && (
                    <View style={styles.employedRow}>
                      <ThemedText type="small">{t('Your employer pays')}</ThemedText>
                      {!employerPaysNothing && (
                        <>
                          <TextInput
                            accessibilityLabel={t('Pence per mile your employer pays')}
                            value={employerRateText}
                            onChangeText={setEmployerRateText}
                            keyboardType="decimal-pad"
                            maxLength={5}
                            style={[styles.penceInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                          />
                          <ThemedText type="small">{t('p a mile')}</ThemedText>
                        </>
                      )}
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: employerPaysNothing }}
                        onPress={() => setEmployerPaysNothing(!employerPaysNothing)}
                        style={[
                          styles.extraChip,
                          employerPaysNothing
                            ? { backgroundColor: theme.accent, borderColor: theme.accent }
                            : { borderColor: theme.backgroundSelected },
                        ]}>
                        <ThemedText
                          type="smallBold"
                          style={{ color: employerPaysNothing ? theme.onAccent : theme.text }}>
                          {employerPaysNothing ? '✓ ' : ''}
                          {t('Nothing')}
                        </ThemedText>
                      </Pressable>
                    </View>
                  )}
                  {employed && !employerPaysNothing && parsePence(employerRateText) === null && (
                    <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                      {t('Enter pence a mile as a number, e.g. 45.')}
                    </ThemedText>
                  )}
                </View>
              )}
            </>
          )}

          {step === PURPOSE && (
            <>
              <StepHeader
                glyph="briefcase"
                eyebrow={t('Step 3 · Your work')}
                title={t('What are most of your work drives for?')}>
                {t(
                  'Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip.',
                )}
              </StepHeader>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Pick all that apply. The first one you pick is filled in for you.')}
              </ThemedText>
              <View style={styles.tiles}>
                {purposeOptions.map((purpose) => {
                  const order = shownChoices.indexOf(purpose);
                  const on = order >= 0;
                  return (
                    <Pressable
                      key={purpose}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityHint={order === 0 ? t('Filled in for you') : undefined}
                      onPress={() => toggleWork(purpose)}
                      style={[
                        styles.tile,
                        on
                          ? { backgroundColor: theme.accent, borderColor: theme.accent }
                          : { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
                      ]}>
                      <ThemedText style={styles.tileIcon}>{purposeIcon(purpose)}</ThemedText>
                      <ThemedText
                        type="smallBold"
                        numberOfLines={2}
                        style={[styles.tileLabel, { color: on ? theme.onAccent : theme.text }]}>
                        {shownPurpose(purpose, t)}
                      </ThemedText>
                      {order === 0 && (
                        <View style={[styles.tileBadge, { backgroundColor: theme.onAccent }]}>
                          <ThemedText style={[styles.tileBadgeText, { color: theme.accent }]}>{t('Default')}</ThemedText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === PLACES && (
            <>
              {shifts ? (
                <StepHeader glyph="home" eyebrow={t('Step 4 · Places')} title={t('Where’s home?')}>
                  {t('So trips read “Home → …” instead of a street name. Optional.')}
                </StepHeader>
              ) : (
                <StepHeader glyph="home" eyebrow={t('Step 4 · Places')} title={t('Where are home and work?')}>
                  {t(
                    'Trips then read “Home → Work” instead of street names, and commutes are flagged for you. Both are optional.',
                  )}
                </StepHeader>
              )}
              <View onLayout={(e) => (fieldTops.current.home = e.nativeEvent.layout.y)}>
                <PlaceField
                  label={t('Home')}
                  icon="🏠"
                  placeholder={t('Address or postcode')}
                  value={home}
                  onChange={setHome}
                  onFocus={() => scrollFieldUp('home')}
                />
              </View>
              {/* Couriers have no single workplace: no Work question, and no commute rule. */}
              {!shifts && (
                <View onLayout={(e) => (fieldTops.current.work = e.nativeEvent.layout.y)}>
                  <PlaceField
                    label={t('Work')}
                    icon="💼"
                    placeholder={t('Address or postcode')}
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
              <Text style={styles.brandTitleSmall}>{t('You’re all set.')}</Text>
              {restored && (
                <Text style={styles.brandCallout}>
                  {t('Your trips are back, with your places, vehicles and settings.')}
                </Text>
              )}
              <Text style={styles.brandBody}>
                {status === 'on'
                  ? t(
                      'Just drive. Each trip appears after you park, and business drives count at {{authority}}’s {{rate}} rate.',
                      { authority: picked.authority, rate: topRate },
                    )
                  : t(
                      'Turn on automatic tracking from the home screen whenever you’re ready, or add trips with the + button.',
                    )}
              </Text>
              <View style={styles.glass}>
                <Text style={styles.pointTitle}>{t('Good to know')}</Text>
                {[
                  ['👉', t('Swipe a trip right for business, left for personal.')],
                  ['📅', t('A quick Sunday reminder to sort your week. Turn it off any time in Settings.')],
                  ['📍', t('Save places like clients or the depot from any trip.')],
                  ...(shifts
                    ? [
                        [
                          '▶️',
                          t('Tap “Start shift” when you start work. Every drive until you end it is business.'),
                        ],
                      ]
                    : hoursSet
                      ? []
                      : [
                          [
                            '⏱️',
                            t('Set your work hours any time in Settings, and most drives sort themselves.'),
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
                  <Text style={styles.pointTitle}>{t('Free to start')}</Text>
                  <Text style={styles.pointBody}>
                    {/* The limit up front, in the same words as the plan meter's "What counts?" (domain/plan). */}
                    {shifts
                      ? t(
                          'Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited.',
                          { count: FREE_AUTO_DRIVES_PER_MONTH },
                        )
                      : t(
                          'Free: {{count}} work drives a month. Personal drives don’t count, and trips you add by hand are always free. Pro: unlimited.',
                          { count: FREE_AUTO_DRIVES_PER_MONTH },
                        )}
                  </Text>
                </View>
              </View>
              {/* Optional: a friend's code adds 10 drives a month (also in Settings for 30 days). */}
              <RedeemCode onBrand initialCode={linkCode} style={styles.glass} />
            </>
          )}
        </ScrollView>

        <View style={[styles.actions, typing && step === PLACES && styles.hidden]}>
          {step === 0 &&
            (backup
              ? primary(busy ? t('Restoring…') : t('Restore my trips'), restoreFromICloud)
              : primary(t('Get started'), () => setStep(1)))}
          {step === 0 && backup && secondary(t('Start fresh instead'), () => setStep(1))}
          {step === 1 && primary(t('Continue'), saveCountry)}
          {step === 2 &&
            (status === 'on' || status === 'unsupported'
              ? primary(t('Continue'), () => setStep(afterTracking))
              : status === 'needs-always' || (status === 'needs-permission' && asked)
                ? primary(t('Open Settings'), () => {
                    setInSettings(true);
                    Linking.openSettings();
                  })
                : asking
                  ? null
                  : primary(t('Set up auto-logging'), allowLocation))}
          {step === 2 &&
            !asking &&
            status !== 'on' &&
            status !== 'unsupported' &&
            secondary(status === 'needs-always' ? t('Continue without “Always”') : t('Not now'), () =>
              setStep(afterTracking),
            )}
          {step === HOURS &&
            (workStyle === 'hours'
              ? primary(t('Save my hours'), saveHours)
              : workStyle === 'shifts'
                ? primary(t('Use shifts'), chooseShifts)
                : workStyle === 'neither'
                  ? primary(t('Continue'), chooseNeither)
                  : primary(t('Choose one to continue'), () => {}, false))}
          {step === PURPOSE && shownChoices.length > 0 && primary(t('Continue'), () => saveWork(shownChoices))}
          {step === PURPOSE && secondary(t('Skip for now'), () => saveWork([]))}
          {step === PLACES &&
            primary(
              busy ? t('Saving…') : home.text || work.text ? t('Save and continue') : t('Continue'),
              savePlaces,
            )}
          {step === PLACES && secondary(t('Skip for now'), () => setStep(DONE))}
          {step === DONE && primary(t('Start using MileMint'), finish)}
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

/**
 * "I visit clients or patients at home": one tick for care, nursing and support
 * workers, who must not keep clients' addresses on their phone.
 */
function ClientPrivacyCheck({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.privacyCheck}>
      <View
        style={[
          styles.checkbox,
          { borderColor: value ? theme.accent : theme.textSecondary },
          value && { backgroundColor: theme.accent },
        ]}>
        {value && <Text style={[styles.radioTick, { color: theme.onAccent }]}>✓</Text>}
      </View>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{t('I visit clients or patients at home (care, nursing, support work)')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('We’ll keep only the area, never their address.')}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  privacyCheck: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three, paddingHorizontal: Spacing.one },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
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
  languagePill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    maxWidth: 180,
  },
  languagePillText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  // Centred on the screen whatever sits either side (Back, the language button).
  dots: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: Spacing.one },
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
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 96,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    justifyContent: 'flex-start',
  },
  tileIcon: { fontSize: 28, lineHeight: 34 },
  tileLabel: { lineHeight: 19 },
  tileBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  tileBadgeText: { fontSize: 11, lineHeight: 14, fontWeight: '800' },
  employed: { borderWidth: 1.5, borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  employedRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
  penceInput: {
    width: 64,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    fontSize: 16,
    textAlign: 'center',
  },
  reminderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  actions: { gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  primary: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  secondary: { alignItems: 'center', paddingVertical: Spacing.two },
});
