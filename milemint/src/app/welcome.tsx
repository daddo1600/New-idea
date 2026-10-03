import { router, useLocalSearchParams, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  type ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LayoutAnimationConfig,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findLatestBackup, isDatabaseEmpty, problemOf, restoreBackup, type FoundBackup } from '@/backup/backup';
import { formatBackupDate, PROBLEM_TEXT } from '@/backup/copy';
import { tripCount } from '@/backup/snapshot';
import { BackupCheck } from '@/components/backup-check';
import { BrandGradient } from '@/components/brand-gradient';
import { CelebrationOverlay } from '@/components/celebration-overlay';
import { CountryOptions, phoneRegion } from '@/components/country-options';
import { LeafMark } from '@/components/leaf-mark';
import { MotionCoach, MotionStep } from '@/components/motion-ask';
import { PermissionPreview } from '@/components/permission-preview';
import { PopPress } from '@/components/pop-press';
import { purposeIcon, quickPurposes, shownPurpose } from '@/components/purpose-picker';
import { GoldSparkle } from '@/components/gold-sparkle';
import { LanguageButton } from '@/components/language-button';
import { MintWash, StepHeader } from '@/components/step-header';
import { VehiclePicker } from '@/components/vehicle-picker';
import { WorkStyleCard } from '@/components/work-style-card';
import { firstCode, RedeemCode } from '@/components/redeem-code';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  DEFAULT_SIMPLE_WEEK,
  toWorkWeek,
  WorkHoursQuick,
  type SimpleWeek,
} from '@/components/work-hours-quick';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { loadSettings, updateSettings } from '@/db/settings-repo';
import { marApplies, parsePence } from '@/domain/mar';
import { displayLocale, REGIONS, vehicleRule, type RegionCode } from '@/domain/regions';
import { type CheerKind, DONE, HOURS, PURPOSE, setupCheer } from '@/domain/setup-cheers';
import { shownStyles, type WorkStyle } from '@/domain/work-focus';
import { useTheme } from '@/hooks/use-theme';
import { LANGUAGES, msg, useLanguage, useT } from '@/i18n/i18n';
import { Rich } from '@/i18n/rich';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';
import { enableWeeklyReminder, scheduleWorkHoursNudge } from '@/reminders/weekly';
import type { TrackingStatus } from '@/tracking/background';
import { askForMotion, motionAskable } from '@/tracking/motion';
import { useTracking } from '@/tracking/use-tracking';
import { VEHICLE_ICONS, type VehicleType } from '@/domain/trip';
import { defaultVehicleName, isDefaultVehicleName } from '@/domain/vehicles';
import { addVehicle, ensureVehicles, listVehicles, updateVehicle } from '@/db/vehicles-repo';

import { ICloudBackup } from '../../modules/icloud-backup';

/**
 * First launch, as one full-screen flow instead of a chain of pop-ups:
 * welcome → country → automatic tracking → how you work → usual purpose →
 * done. Shift workers skip the usual purpose (their drives are Deliveries,
 * domain/auto-classify). Home and work aren't asked here: the home screen asks
 * "Is this home?" once the drives show it (domain/place-asks). Each step does
 * one thing, and the user always sees how far along they are.
 *
 * On a new iPhone with a MileSprout backup in iCloud, the welcome offers to
 * restore it instead; the backup brings the country, hours and places, so
 * only the tracking step (a permission for this phone) remains.
 */

/** Dots shown: the usual purpose is part of "Your work", not a step of its own. */
const STEPS = 5;
const EXTRA_LABELS: Record<VehicleType, string> = {
  car: msg('Car or van'),
  motorbike: msg('Moped or motorbike'),
  bicycle: msg('Bicycle'),
};

/** The three ways of working, as the menu shows them. */
const WORK_STYLE_TEXT: Record<WorkStyle, { emoji: string; title: string; detail: string }> = {
  hours: {
    emoji: '🗓️',
    title: msg('Set hours'),
    detail: msg('Trades, care or office work.'),
  },
  shifts: {
    emoji: '📦',
    title: msg('Shifts or blocks'),
    detail: msg('Delivery and ride apps.'),
  },
  neither: { emoji: '✋', title: msg('Neither'), detail: msg('I’ll swipe each drive myself.') },
};

/**
 * Choosing a way of working: the other two fade out, the chosen card springs
 * to the top and its questions come in beneath it, one after another. Going
 * back reverses it, the two cards fading back in once it has moved.
 */
const FOCUS_MOTION = {
  // A spring on iPhone; the web runs layout moves as CSS, so a curve that overshoots a little instead.
  card:
    Platform.OS === 'web'
      ? LinearTransition.duration(380).easing(Easing.bezier(0.3, 1.25, 0.5, 1))
      : LinearTransition.springify().mass(1).damping(20).stiffness(190),
  cardIn: FadeIn.duration(220).delay(140),
  cardOut: FadeOut.duration(150),
  // A question growing (the privacy tick's thank-you) slides the ones below; not on the web,
  // which would stretch the growing card's text instead of laying it out again.
  follow: Platform.OS === 'web' ? undefined : LinearTransition.duration(240).easing(Easing.bezier(0.2, 0, 0, 1)),
  followIn: (i: number) => FadeInDown.duration(260).delay(170 + i * 70),
  followOut: FadeOut.duration(110),
};

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
  /** After location, still on the tracking step: Motion & Fitness offered, or iOS's question for it up. */
  const [motion, setMotion] = useState<'offer' | 'asking' | null>(null);
  /** Sent to Settings to choose "Always": carry on by ourselves once it's chosen. */
  const [inSettings, setInSettings] = useState(false);
  const db = useSQLiteContext();
  const [week, setWeek] = useState<SimpleWeek>(DEFAULT_SIMPLE_WEEK);
  const [hoursSet, setHoursSet] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  /** The way of working chosen, shown on its own with its questions; null shows the menu of all three. */
  const [workStyle, setWorkStyle] = useState<WorkStyle | null>(null);
  const [extraVehicles, setExtraVehicles] = useState<VehicleType[]>([]);
  /** Visits clients or patients at home: keep only the area of each visit (domain/privacy). */
  const [clientPrivacy, setClientPrivacy] = useState(false);
  /** Chose shifts (delivery apps) instead of set hours. */
  const [shifts, setShifts] = useState(false);
  /** UK: employed and using their own vehicle, so home shows Mileage Allowance Relief. Optional. */
  const [employed, setEmployed] = useState(false);
  const [employerPaysNothing, setEmployerPaysNothing] = useState(false);
  const [employerRateText, setEmployerRateText] = useState('45');
  /** The kinds of work drive picked, in the order tapped; undefined until one is (shift workers then see Deliveries chosen). */
  const [workChoices, setWorkChoices] = useState<string[] | undefined>(undefined);
  /** The celebration on screen (one at a time), over the step that's already moved on underneath. */
  const [cheer, setCheer] = useState<{ kind: CheerKind; text: string } | null>(null);
  /** Each plays once a session: going back and forward again doesn't repeat it. */
  const cheered = useRef(new Set<CheerKind>());
  const celebrate = (kind: CheerKind, text: string) => {
    if (cheered.current.has(kind)) return;
    cheered.current.add(kind);
    setCheer({ kind, text });
  };
  // A step forward cheers, bigger the nearer the end (domain/setup-cheers); back never does.
  const lastStep = useRef(step);
  useEffect(() => {
    const kind = setupCheer(lastStep.current, step);
    lastStep.current = step;
    if (!kind) return;
    // Says tracking is set up only when it is: skipped (or not on this phone) is still a good start.
    const tracking = status === 'on' ? t('Drive logging’s set up') : t('Good start');
    celebrate(
      kind,
      kind === 'thumbs'
        ? t('Great!')
        : kind === 'tracking'
          ? tracking
          : kind === 'almost'
            ? t('ALMOST DONE!')
            : t('YOU DID IT!'),
    );
    // Runs on a step change; `status` is read as it is then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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

  /** Location is done: offer Motion & Fitness when iOS hasn't asked for it yet, else move on. */
  const afterLocation = () => {
    if (motionAskable()) setMotion('offer');
    else setStep(afterTracking);
  };

  const allowMotion = async () => {
    setMotion('asking');
    try {
      await askForMotion();
    } finally {
      setMotion(null);
      setStep(afterTracking);
    }
  };

  const allowLocation = async () => {
    setBusy(true);
    try {
      const next = await enable(setAsking);
      if (next === 'on') afterLocation();
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
        if (next === 'on') afterLocation();
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
    // No usual-purpose step: no usual purpose already means "Deliveries" in shift mode
    // (domain/auto-classify), and choosing set hours after going back asks again.
    await updateSettings(db, { defaultPurpose: null, workPurposes: [] });
    setWorkChoices([]);
    setShifts(true);
    setHoursSet(false);
    setStep(DONE);
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

  /** The usual purpose (set hours or neither; shift workers skip it), saved only when they tap one. */
  const shownChoices = workChoices ?? [];
  /** Several can be picked: the first is filled in on work drives, all of them are offered first on a trip. */
  const toggleWork = (purpose: string) =>
    setWorkChoices(
      shownChoices.includes(purpose) ? shownChoices.filter((other) => other !== purpose) : [...shownChoices, purpose],
    );
  const saveWork = async (choices: string[]) => {
    const first = choices[0] ?? null;
    await updateSettings(db, { defaultPurpose: first, workPurposes: choices });
    setWorkChoices(choices);
    setStep(DONE);
  };
  const purposeOptions = quickPurposes({ shiftMode: false, clientPrivacy }, 10);

  /** Under whichever way of working is chosen. */
  const privacyCheck = (
    <ClientPrivacyCheck
      value={clientPrivacy}
      onChange={(on) => {
        setClientPrivacy(on);
        // Thanks for ticking it; taking it back (a tap by mistake) is quiet.
        if (on) celebrate('thanks', t('Thank you for all you do for the people you care for. 💚'));
      }}
    />
  );

  /** Couriers often switch between a car and a moped: the others they also use. */
  const extraVehiclesPicker = (
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
    </View>
  );

  /** UK only: employed and using their own vehicle (Mileage Allowance Relief). */
  const employedCard = (
    <View style={[styles.employed, { borderColor: theme.backgroundSelected }]}>
      <View style={styles.employedRow}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{t('Employed, in your own vehicle?')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('MileSprout works out the tax relief you can claim. Optional.')}
          </ThemedText>
        </View>
        <Switch
          accessibilityLabel={t('Employed, in your own vehicle?')}
          value={employed}
          onValueChange={setEmployed}
          trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
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
  );

  /** The questions under each way of working, in order, keyed so each animates in once. */
  const followUps = (style: WorkStyle) => {
    const list: [string, ReactNode][] = [];
    if (style === 'hours') {
      list.push(['hours', <WorkHoursQuick key="hours" value={week} onChange={setWeek} locale={displayLocale(picked)} />]);
    }
    if (style === 'shifts') list.push(['vehicles', extraVehiclesPicker]);
    // Care and support work comes in all three.
    list.push(['privacy', privacyCheck]);
    if (marApplies(picked)) list.push(['employed', employedCard]);
    return list;
  };

  const reduceMotion = useReducedMotion();
  /** The menu-to-focus motion; none with Reduce Motion, so the swap is instant. */
  const focusMotion = reduceMotion ? null : FOCUS_MOTION;
  const chooseWorkStyle = (style: WorkStyle) => {
    setWorkStyle(style);
    // The chosen card goes to the top: bring the top into view if they'd scrolled.
    scroller.current?.scrollTo({ y: 0, animated: !reduceMotion });
    AccessibilityInfo.announceForAccessibility(
      t('{{option}} selected. Double-tap Change to pick another', { option: t(WORK_STYLE_TEXT[style].title) }),
    );
  };
  /** Back to all three; the hours, vehicles and ticks entered are kept for coming back. */
  const backToMenu = () => setWorkStyle(null);

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
  const scroller = useRef<ScrollView>(null);
  // Each step starts at its top, whatever the last one was scrolled to.
  useEffect(() => {
    scroller.current?.scrollTo({ y: 0, animated: false });
  }, [step]);
  /** Back from the finish skips the steps that weren't shown (shift workers have no usual-purpose step). */
  const previous = step === DONE ? (restored ? 2 : shifts ? HOURS : PURPOSE) : step - 1;

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
        {step > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Back')}
            hitSlop={12}
            onPress={() => setStep(previous)}>
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
          <LanguageButton
            name={languageName}
            accessibilityLabel={t('Language: {{name}}. Change', { name: languageName })}
            onPress={() => router.push('/language' as Href)}
          />
        ) : (
          <View style={styles.topSpacer} />
        )}
      </View>

      <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Gesture handler's, so a pull down on the chosen way of working (work-style-card) isn't also a scroll. */}
        <GestureScrollView
          ref={scroller}
          contentContainerStyle={[
            styles.content,
            (!onBrand || step === 2 || step === DONE) && styles.contentTop,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <LeafMark size={132} />
              <Text style={[styles.brandTitle, styles.heading]}>{t('Every work mile, counted.')}</Text>
              <Text style={styles.brandBody}>
                {t('MileSprout logs your drives automatically and works out what they’re worth at tax time.')}
              </Text>
              <Text style={styles.privacyLine}>🔒 {t('No account. Your trips stay on your phone.')}</Text>
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

          {step === 2 && motion && (motion === 'asking' ? <MotionCoach /> : <MotionStep />)}

          {step === 2 &&
            !motion &&
            (asking ? (
              // One slim line at the very bottom, in the gap under iOS's own question
              // (its map makes the alert tall, so anything higher is hidden behind it).
              <View style={styles.coach} accessibilityLiveRegion="polite">
                <View style={styles.coachPill}>
                  <GoldSparkle />
                  <Text style={styles.coachText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {asking === 1 ? t('Select “Allow While Using App”') : t('Select “Change to Always Allow”')}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.brandEyebrow}>{t('STEP 2 · YOUR DRIVES')}</Text>
                <Text style={styles.brandTitleSmall}>{t('Never miss a drive.')}</Text>
                <Text style={styles.brandBody}>
                  {t('Set location to “Always” and MileSprout logs every drive, even when it’s closed.')}
                </Text>
                {status === 'needs-permission' && !asked && (
                  <Text style={styles.brandCallout}>{t('Without “Always”, drives get missed, and missed miles are hard to prove.')}</Text>
                )}
                {status === 'needs-always' ? (
                  // iOS asks about "Always" by itself later on: no detour to Settings during set-up.
                  <View style={styles.preview}>
                    <Text style={styles.pointTitle}>{t('You’re set.')}</Text>
                    <Text style={styles.pointBody}>
                      {t(
                        'Your iPhone will check about “Always” later. Choose “Change to Always Allow” so drives log even when MileSprout is closed.',
                      )}
                    </Text>
                  </View>
                ) : status === 'needs-permission' && asked ? (
                  <View style={styles.preview}>
                    <Text style={styles.pointTitle}>{t('Location is off for now.')}</Text>
                    <Text style={styles.pointBody}>
                      {t('You can still add drives yourself, and turn on automatic logging any time in Settings.')}
                    </Text>
                  </View>
                ) : status === 'unsupported' ? (
                  <Text style={styles.pointBody}>
                    {t('Automatic logging runs on your iPhone. You can still add trips by hand here.')}
                  </Text>
                ) : (
                  <>
                    <View style={styles.preview}>
                      <PermissionPreview />
                      <Rich
                        text={t(
                          'iOS asks twice. Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>.',
                        )}
                        style={[styles.pointBody, styles.previewCaption]}
                        boldStyle={styles.pointTitle}
                      />
                    </View>
                    <Text style={styles.privacy}>
                      {t('🔒 Location is used only while you’re driving. Your trips stay on your iPhone and are never sent to MileSprout.')}
                    </Text>
                  </>
                )}
              </>
            ))}

          {step === HOURS && (
            // Opening the step shows it as it is (no entrances), and leaving it plays no exits.
            <LayoutAnimationConfig skipEntering skipExiting>
              <StepHeader glyph="clock" eyebrow={t('Step 3 · Your work')} title={t('How do you work?')}>
                {t('MileSprout sorts your drives to match. You can always swipe to change a trip.')}
              </StepHeader>
              {/* The menu, or only the chosen one: the others fade away and it springs to the top. */}
              {shownStyles(workStyle).map((style) => (
                <Animated.View
                  key={style}
                  layout={focusMotion?.card}
                  entering={focusMotion?.cardIn}
                  exiting={focusMotion?.cardOut}
                  style={workStyle === style ? styles.chosen : styles.raised}>
                  <WorkStyleCard
                    {...WORK_STYLE_TEXT[style]}
                    title={t(WORK_STYLE_TEXT[style].title)}
                    detail={t(WORK_STYLE_TEXT[style].detail)}
                    focused={workStyle === style}
                    onChoose={() => chooseWorkStyle(style)}
                    onChange={backToMenu}
                    reduceMotion={reduceMotion}
                    scroller={scroller}
                  />
                </Animated.View>
              ))}
              {/* Its questions, one after another beneath it. */}
              {workStyle &&
                followUps(workStyle).map(([key, node], i) => (
                  <Animated.View
                    key={key}
                    layout={focusMotion?.follow}
                    entering={focusMotion?.followIn(i)}
                    exiting={focusMotion?.followOut}>
                    {node}
                  </Animated.View>
                ))}
            </LayoutAnimationConfig>
          )}

          {step === PURPOSE && (
            <>
              <StepHeader
                glyph="briefcase"
                eyebrow={t('Step 3 · Your work')}
                title={t('What are most of your work drives for?')}>
                {t(
                  'Tax offices want a purpose for every work drive. MileSprout fills it in for you, and you can change it on any trip.',
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
                    // A pop either way; taking one back is the softer tap.
                    <PopPress
                      key={purpose}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityHint={order === 0 ? t('Filled in for you') : undefined}
                      haptic={on ? 'soft' : 'light'}
                      scale={1.08}
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
                    </PopPress>
                  );
                })}
              </View>
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
                  ? t('Just drive. Each trip appears after you park.')
                  : status === 'needs-always'
                    ? t('Almost there: set location to “Always” and every drive is logged. Home shows you how.')
                    : status === 'unsupported'
                      ? t('Add your drives from the Drives tab.')
                      : t(
                          'Turn on automatic logging from the home screen whenever you’re ready, or add a drive from the Drives tab.',
                        )}
              </Text>
              {/* Backups are on by themselves: this says so, or how to turn on iCloud Drive. */}
              <BackupCheck style={styles.glass} />
              {/* Optional, and also in Settings for 30 days. */}
              <RedeemCode onBrand initialCode={linkCode} style={styles.glass} />
            </>
          )}
        </GestureScrollView>

        <View style={styles.actions}>
          {step === 0 &&
            (backup
              ? primary(busy ? t('Restoring…') : t('Restore my trips'), restoreFromICloud)
              : primary(t('Get started'), () => setStep(1)))}
          {step === 0 && backup && secondary(t('Start fresh instead'), () => setStep(1))}
          {step === 1 && primary(t('Continue'), saveCountry)}
          {step === 2 && motion === 'offer' && primary(t('Turn on Motion & Fitness'), allowMotion)}
          {step === 2 &&
            motion === 'offer' &&
            secondary(t('Not now'), () => {
              setMotion(null);
              setStep(afterTracking);
            })}
          {step === 2 &&
            !motion &&
            (status === 'on' || status === 'unsupported'
              ? primary(t('Continue'), status === 'on' ? afterLocation : () => setStep(afterTracking))
              : status === 'needs-always'
                ? primary(t('Continue'), afterLocation)
                : status === 'needs-permission' && asked
                  ? primary(t('Continue'), () => setStep(afterTracking))
                  : asking
                  ? null
                  : primary(t('Set up auto-logging'), allowLocation))}
          {step === 2 &&
            !asking &&
            !motion &&
            status !== 'on' &&
            status !== 'unsupported' &&
            (status === 'needs-always' || asked
              ? secondary(t('Turn on in Settings'), () => {
                  setInSettings(true);
                  Linking.openSettings();
                })
              : secondary(t('Not now'), () => setStep(afterTracking)))}
          {step === HOURS &&
            (workStyle === 'hours'
              ? primary(t('Save my hours'), saveHours)
              : workStyle === 'shifts'
                ? primary(t('Continue'), chooseShifts)
                : workStyle === 'neither'
                  ? primary(t('Continue'), chooseNeither)
                  : primary(t('Choose one to continue'), () => {}, false))}
          {step === PURPOSE && shownChoices.length > 0 && primary(t('Continue'), () => saveWork(shownChoices))}
          {step === PURPOSE && secondary(t('Skip for now'), () => saveWork([]))}
          {step === DONE && primary(t('Start using MileSprout'), finish)}
        </View>
      </KeyboardAvoidingView>
      {cheer && (
        <CelebrationOverlay key={cheer.kind} kind={cheer.kind} text={cheer.text} onClose={() => setCheer(null)} />
      )}
    </ThemedView>
  );
}

/**
 * "Care worker": one tick for care, nursing and support
 * workers, who must not keep clients' addresses on their phone.
 */
/**
 * For anyone who visits people at home (care, nursing, support work): keep
 * only the area of a client's address. A card of its own so it isn't missed;
 * once ticked it just says thank you (the line above already says what's kept).
 */
function ClientPrivacyCheck({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[
        styles.privacyCard,
        { borderColor: value ? theme.accent : theme.backgroundSelected },
        value && { backgroundColor: theme.accent + '14' },
      ]}>
      <View style={styles.privacyCheck}>
        <Text style={styles.privacyEmoji}>🩺</Text>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{t('Care worker')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Home visits. Only the area is saved, on your phone, never the address.')}
          </ThemedText>
        </View>
        <View
          style={[
            styles.checkbox,
            { borderColor: value ? theme.accent : theme.textSecondary },
            value && { backgroundColor: theme.accent },
          ]}>
          {value && <Text style={[styles.radioTick, { color: theme.onAccent }]}>✓</Text>}
        </View>
      </View>
      {value && (
        <View style={styles.privacyThanks}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {t('Thank you for all you do. 💚')}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  privacyCard: { borderWidth: 1.5, borderRadius: 16, padding: Spacing.three, gap: Spacing.three },
  privacyCheck: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  privacyEmoji: { fontSize: 24, lineHeight: 28 },
  privacyThanks: { gap: Spacing.two },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  /**
   * The cards stay above the questions (a card moving back to its place passes
   * over them as they fade, the chosen one is pulled over them), and the
   * chosen one above the two fading away.
   */
  raised: { zIndex: 2 },
  chosen: { zIndex: 3 },
  radioTick: { fontSize: 13, fontWeight: '800' },
  container: { flex: 1, paddingHorizontal: Spacing.four },
  brandTitle: { color: '#FFFFFF', fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -0.5 },
  brandBody: { color: '#D1FAE5', fontSize: 17, lineHeight: 24 },
  pointTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  brandEyebrow: { color: '#FACC15', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: Spacing.one },
  brandTitleSmall: { color: '#FFFFFF', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  brandCallout: { color: '#FACC15', fontSize: 17, lineHeight: 23, fontWeight: '800' },
  // The pulsing copy of iOS's alert and its one-line caption, as one centred block.
  preview: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  previewCaption: { textAlign: 'center', maxWidth: 320 },
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
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
  topSpacer: { width: 32 },
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
  flex: { flex: 1, gap: Spacing.half },
  flexFill: { flex: 1 },
  vehicles: { gap: Spacing.two },
  // Pinned low, below where iOS's alert sits, on a dark card so it still reads while dimmed.
  coach: { flex: 1, justifyContent: 'flex-end' },
  coachPill: {
    backgroundColor: 'rgba(1,28,20,0.85)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: -Spacing.two,
    alignSelf: 'center',
  },
  coachText: { color: '#FACC15', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  privacy: { color: '#FFFFFF', fontSize: 15, lineHeight: 21 },
  privacyLine: { color: '#D1FAE5', fontSize: 15, lineHeight: 21, fontWeight: '600' },
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
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  actions: { gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  primary: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  secondary: { alignItems: 'center', paddingVertical: Spacing.two },
});
