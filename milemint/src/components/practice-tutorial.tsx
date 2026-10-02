import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ComponentType } from 'react';
import { AccessibilityInfo, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Rect } from 'react-native-svg';

import { useLaunchIntroDone } from '@/components/launch-intro-state';
import { LeafMark } from '@/components/leaf-mark';
import { ShiftSwitch } from '@/components/shift-switch';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { loadSettings, updateSettings } from '@/db/settings-repo';
import { DEMO_MODE, DEMO_TUTORIAL } from '@/dev/demo';
import { SHIFT_PURPOSE } from '@/domain/auto-classify';
import { CLIENT_VISIT } from '@/domain/privacy';
import { formatMoney, potentialDeduction, type Region } from '@/domain/regions';
import { type Classification, milesToMeters, toLocalIsoDate, type Trip } from '@/domain/trip';
import { currentStep, startTutorial, tutorialReducer, type TutorialStep } from '@/domain/tutorial';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

const GOLD = '#FACC15';
const INK = '#064E3B';
/** How long "Sorted as personal ✓" shows before the next step. */
const PASSED_MS = 1700;
/** How far the hand slides across the card. */
const HAND_TRAVEL = 110;

/** What the practice run gives home's trip row: the real row, fed a sample drive. */
export type SampleRowProps = {
  trip: Trip;
  deduction: number;
  potential: number;
  commute: boolean;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
  usualPurpose: string | null;
  purposeChoices: readonly string[];
  onPurpose: (purpose: string) => void;
  onOpen: () => void;
};

/** Asked for from Settings this session (the demo doesn't save settings it reads for this). */
let replayAsked = false;

/**
 * The practice run, once after setup (and again from Settings): sort two
 * sample drives by swiping, as every real one will be, with a hand showing
 * which way; shift workers then swipe on a sample shift. Moving on means
 * doing it, though "Skip" is always there. The sample drives are made up here
 * and never saved: no counters, free drives or milestones are touched.
 *
 * Home passes in its own trip row so the samples look and swipe exactly like
 * the real thing (swiping right is business, left personal; the Business and
 * Personal buttons on the row count too).
 */
export function PracticeTutorial({
  TripRow,
  hold = false,
}: {
  TripRow: ComponentType<SampleRowProps>;
  /**
   * Not now: a drive is being recorded, a shift is running, or another
   * overlay is up. The practice run waits (it never opens over the real
   * thing), and once open it stays until finished or skipped.
   */
  hold?: boolean;
}) {
  const db = useSQLiteContext();
  const [shown, setShown] = useState<{ shiftWorker: boolean; run: number; asked: boolean } | null>(null);
  const demoSeen = useRef(false);
  // Never under (so, on iOS, over) the launch animation: a native Modal would cover it.
  const introDone = useLaunchIntroDone();
  const [opened, setOpened] = useState<number | null>(null);
  // Replayed from Settings: asked for, so it opens straight away.
  const ready = introDone && (!hold || !!shown?.asked);
  // Once open it stays open (a drive starting meanwhile doesn't snatch it away).
  if (shown && ready && opened !== shown.run) setOpened(shown.run);

  // Read each time home comes into view: Settings' "Replay the tutorial" sets it going again.
  useFocusEffect(
    useCallback(() => {
      let current = true;
      loadSettings(db).then(
        (settings) => {
          if (!current) return;
          const due = replayAsked || (DEMO_MODE ? DEMO_TUTORIAL && !demoSeen.current : !settings.tutorialDone);
          setShown((now) =>
            due ? (now ?? { shiftWorker: settings.shiftMode, run: Date.now(), asked: replayAsked }) : null,
          );
        },
        () => {},
      );
      return () => {
        current = false;
      };
    }, [db]),
  );

  const close = useCallback(() => {
    setShown(null);
    demoSeen.current = true;
    replayAsked = false;
    if (!DEMO_MODE) updateSettings(db, { tutorialDone: true }).catch(() => {});
  }, [db]);

  if (!shown || opened !== shown.run) return null;
  return <TutorialOverlay key={shown.run} shiftWorker={shown.shiftWorker} TripRow={TripRow} onClose={close} />;
}

/** Settings: run the practice again, back on home. */
export function ReplayTutorialSection() {
  const db = useSQLiteContext();
  const t = useT();
  const theme = useTheme();
  const replay = async () => {
    replayAsked = true;
    if (!DEMO_MODE) await updateSettings(db, { tutorialDone: false }).catch(() => {});
    router.navigate('/');
  };
  return (
    <>
      <ThemedText type="smallBold">{t('Tutorial')}</ThemedText>
      <ThemedView type="backgroundElement" style={styles.settingsCard}>
        <View style={styles.settingsText}>
          <ThemedText type="smallBold">{t('Replay the tutorial')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Try sorting two sample drives again. Nothing is saved.')}
          </ThemedText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Replay the tutorial')} hitSlop={8} onPress={replay}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {t('Replay')}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </>
  );
}

/** Today at a time, as a sample drive's start or end. */
function todayAt(hours: number, minutes: number): Date {
  const at = new Date();
  at.setHours(hours, minutes, 0, 0);
  return at;
}

/** A made-up drive for the practice run (never saved). */
function sampleTrip(
  id: string,
  from: string,
  to: string,
  meters: number,
  [start, end]: [Date, Date],
  purpose: string,
): Trip {
  return {
    id,
    startedAt: start.toISOString(),
    localDate: toLocalIsoDate(start),
    endedAt: end.toISOString(),
    startLabel: from,
    endLabel: to,
    distanceMeters: meters,
    classification: 'unclassified',
    purpose,
    source: 'auto',
    createdAt: end.toISOString(),
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
  };
}

/** The two sample drives, in the user's units and words. */
function sampleTrips(region: Region, shiftWorker: boolean, t: (key: string) => string) {
  const km = region.unit === 'km';
  // 2.6 mi or 4.2 km; the work drive 6.4 mi or 10.3 km (a courier's drop 1.9 mi or 3.1 km).
  const personal = sampleTrip(
    'practice-personal',
    t('Home'),
    t('Supermarket'),
    km ? 4200 : milesToMeters(2.6),
    [todayAt(9, 0), todayAt(9, 35)],
    '',
  );
  // With a purpose already, so the row stays clean once it's sorted as business.
  const business = shiftWorker
    ? sampleTrip(
        'practice-business',
        'Nando’s',
        t('Customer'),
        km ? 3100 : milesToMeters(1.9),
        [todayAt(18, 40), todayAt(18, 52)],
        SHIFT_PURPOSE,
      )
    : sampleTrip(
        'practice-business',
        t('Office'),
        CLIENT_VISIT,
        km ? 10300 : milesToMeters(6.4),
        [todayAt(11, 0), todayAt(11, 20)],
        'Client meeting',
      );
  return { personal, business };
}

function TutorialOverlay({
  shiftWorker,
  TripRow,
  onClose,
}: {
  shiftWorker: boolean;
  TripRow: ComponentType<SampleRowProps>;
  onClose: () => void;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { region } = useRegion();
  const [state, dispatch] = useReducer(tutorialReducer, shiftWorker, startTutorial);
  const step = currentStep(state);
  const samples = sampleTrips(region, shiftWorker, t);
  // What the work drive is worth at the real rate for the user's country, as if it were their first.
  const value = potentialDeduction(samples.business, [], region);

  useEffect(() => {
    if (state.closed) onClose();
  }, [state.closed, onClose]);

  // Done right: a moment to enjoy it, then on to the next step.
  useEffect(() => {
    if (!state.passed) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const timer = setTimeout(() => dispatch({ type: 'next' }), PASSED_MS);
    return () => clearTimeout(timer);
  }, [state.passed]);

  useEffect(() => {
    if (state.misses > 0 && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [state.misses]);

  const passedLine =
    step === 'personal'
      ? t('Sorted as personal ✓')
      : step === 'business'
        ? t('Sorted as business: worth {{amount}}', { amount: formatMoney(value, region) })
        : t('Your shift is on ✓');
  useEffect(() => {
    if (state.passed) AccessibilityInfo.announceForAccessibility(passedLine);
  }, [state.passed, passedLine]);

  const sort = (classification: Classification) => dispatch({ type: 'sort', classification });
  const skip = () => dispatch({ type: 'skip' });

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={skip}>
      <GestureHandlerRootView style={styles.root}>
        <View
          style={[
            styles.backdrop,
            { paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom + Spacing.three },
          ]}>
          <View style={styles.topBar}>
            <Progress steps={state.steps} index={state.index} />
            {step !== 'done' && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('Skip the practice run')}
                hitSlop={12}
                onPress={skip}
                style={styles.skip}>
                <Text style={styles.skipText}>{t('Skip')}</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.stage}>
            {step === 'done' ? (
              <DoneStep TripRow={TripRow} samples={samples} value={value} onStart={() => dispatch({ type: 'next' })} />
            ) : (
              <>
                <Text style={styles.eyebrow}>{t('PRACTICE RUN')}</Text>
                <Text style={styles.headline} accessibilityRole="header">
                  {step === 'personal'
                    ? t('This is how a drive shows up after you park. Try sorting it.')
                    : step === 'business'
                      ? t('Now a work drive. Work drives are worth money back.')
                      : t('Every drive until you end it counts as business.')}
                </Text>
                <Bubble step={step} misses={state.misses} passed={state.passed} passedLine={passedLine} />
                {step === 'shift' ? (
                  <ShiftPractice passed={state.passed} onStart={() => dispatch({ type: 'shift-started' })} />
                ) : (
                  <SampleCard
                    key={step}
                    TripRow={TripRow}
                    trip={step === 'personal' ? samples.personal : samples.business}
                    expected={step}
                    value={potentialDeduction(step === 'personal' ? samples.personal : samples.business, [], region)}
                    misses={state.misses}
                    passed={state.passed}
                    onSort={sort}
                  />
                )}
                {step !== 'shift' && <Text style={styles.sampleNote}>{t('Practice drive · not saved')}</Text>}
              </>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Dots along the top, the current step drawn long and gold. */
function Progress({ steps, index }: { steps: readonly TutorialStep[]; index: number }) {
  const t = useT();
  return (
    <View
      style={styles.dots}
      accessible
      accessibilityLabel={t('Step {{step}} of {{total}}', { step: index + 1, total: steps.length })}>
      {steps.map((step, i) => (
        <View
          key={step}
          style={[styles.dot, i === index && styles.dotNow, i < index && styles.dotDone]}
        />
      ))}
    </View>
  );
}

/**
 * The tooltip above the sample: which way to swipe, with an arrow pointing
 * down at it. A wrong-way swipe brings it back with a shake; done right, it
 * turns green and says so.
 */
function Bubble({
  step,
  misses,
  passed,
  passedLine,
}: {
  step: Exclude<TutorialStep, 'done'>;
  misses: number;
  passed: boolean;
  passedLine: string;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const shake = useSharedValue(0);
  useEffect(() => {
    if (misses === 0 || reduceMotion) return;
    shake.set(
      withDelay(
        180,
        withSequence(
          withTiming(-9, { duration: 55 }),
          withTiming(9, { duration: 70 }),
          withTiming(-6, { duration: 70 }),
          withTiming(6, { duration: 70 }),
          withTiming(0, { duration: 55 }),
        ),
      ),
    );
  }, [misses, shake, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const [icon, text] =
    step === 'personal'
      ? ['🏠', t('Swipe left for personal')]
      : step === 'business'
        ? ['💼', t('Swipe right for business')]
        : ['▶', t('Swipe to start your shift')];
  return (
    <Animated.View
      key={passed ? 'passed' : `hint-${misses}`}
      entering={reduceMotion ? undefined : passed ? ZoomIn.springify().damping(13) : FadeIn.duration(220)}
      style={[styles.bubbleWrap, style]}
      accessibilityLiveRegion="polite">
      <View style={[styles.bubble, passed && styles.bubblePassed]}>
        {passed ? (
          <Text style={[styles.bubbleText, styles.bubbleTextPassed]}>{passedLine}</Text>
        ) : (
          <>
            <Text style={styles.bubbleIcon}>{icon}</Text>
            <Text style={styles.bubbleText}>{text}</Text>
          </>
        )}
      </View>
      {misses > 0 && !passed && <Text style={styles.retry}>{t('Not that way. Try again.')}</Text>}
      <View style={[styles.bubbleArrow, passed && styles.bubbleArrowPassed]} />
    </Animated.View>
  );
}

/**
 * The sample drive on home's real trip row, lit up on top of the dimmed
 * screen, with the hand showing the swipe. A wrong-way swipe springs back
 * (the row does that itself) and the card gives a little shake.
 */
function SampleCard({
  TripRow,
  trip,
  expected,
  value,
  misses,
  passed,
  onSort,
}: {
  TripRow: ComponentType<SampleRowProps>;
  trip: Trip;
  expected: 'personal' | 'business';
  value: number;
  misses: number;
  passed: boolean;
  onSort: (classification: Classification) => void;
}) {
  const t = useT();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const screenReader = useScreenReader();
  const shake = useSharedValue(0);
  useEffect(() => {
    if (misses === 0 || reduceMotion) return;
    // After the row has sprung back.
    shake.set(
      withDelay(
        260,
        withSequence(
          withTiming(-12, { duration: 60 }),
          withTiming(12, { duration: 80 }),
          withTiming(-7, { duration: 80 }),
          withTiming(7, { duration: 80 }),
          withTiming(0, { duration: 60 }),
        ),
      ),
    );
  }, [misses, shake, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const shown: Trip = passed ? { ...trip, classification: expected } : trip;

  return (
    <View style={styles.cardArea}>
      <Animated.View testID="practice-card" style={[styles.cardGlow, { backgroundColor: theme.background }, style]}>
        <TripRow
          trip={shown}
          deduction={passed && expected === 'business' ? value : 0}
          potential={passed ? 0 : value}
          commute={false}
          onClassify={(classification) => {
            if (!passed) onSort(classification);
          }}
          onLongPress={() => {}}
          usualPurpose={null}
          purposeChoices={[]}
          onPurpose={() => {}}
          onOpen={() => {}}
        />
        {!passed && <Hand direction={expected === 'personal' ? -1 : 1} />}
      </Animated.View>
      {passed && !reduceMotion && <Burst />}
      {/* VoiceOver can't feel the swipe: the same thing as a plain button. */}
      {screenReader && !passed && (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSort(expected)}
          style={[styles.voiceButton, { borderColor: GOLD }]}>
          <Text style={styles.voiceText}>
            {expected === 'personal' ? t('Mark as personal') : t('Mark as business')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/** The sample shift bar: the real switch, but starting it only moves the practice on. */
function ShiftPractice({ passed, onStart }: { passed: boolean; onStart: () => void }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  return (
    <View style={styles.cardArea}>
      <View testID="practice-shift">
        <ShiftSwitch
          on={passed}
          startLabel={t('Swipe to start shift')}
          startHint={t('Every drive until you end it counts as business')}
          endLabel={t('Your shift is on ✓')}
          onStart={onStart}
          onEnd={() => {}}>
          {passed && <Text style={styles.shiftOn}>{t('Your shift is on ✓')}</Text>}
        </ShiftSwitch>
        {!passed && <Hand direction={1} start={-HAND_TRAVEL - 30} top={14} />}
      </View>
      {passed && !reduceMotion && <Burst />}
    </View>
  );
}

/**
 * The last step: just drive. The two practice drives, sorted, drop into a
 * small list the way real ones will after each drive; then a swipe (the same
 * feel as starting a shift) closes the practice run.
 */
function DoneStep({
  TripRow,
  samples,
  value,
  onStart,
}: {
  TripRow: ComponentType<SampleRowProps>;
  samples: { personal: Trip; business: Trip };
  value: number;
  onStart: () => void;
}) {
  const t = useT();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const rows: { trip: Trip; deduction: number }[] = [
    { trip: { ...samples.business, classification: 'business' }, deduction: value },
    { trip: { ...samples.personal, classification: 'personal' }, deduction: 0 },
  ];
  return (
    <Animated.View testID="practice-done" entering={reduceMotion ? undefined : FadeIn.duration(300)} style={styles.done}>
      <LeafMark size={64} />
      <Text style={styles.headline} accessibilityRole="header">
        {t('That’s it. Just drive: trips appear here after you park.')}
      </Text>
      {/* What home's list will look like: the practice drives, one after the other. Just to look at. */}
      <View style={[styles.doneList, { backgroundColor: theme.background }]} pointerEvents="none" accessible={false}>
        {rows.map(({ trip, deduction }, i) => (
          <Animated.View
            key={trip.id}
            entering={reduceMotion ? undefined : FadeInDown.delay(350 + i * 450).springify().damping(16)}>
            <TripRow
              trip={trip}
              deduction={deduction}
              potential={0}
              commute={false}
              onClassify={() => {}}
              onLongPress={() => {}}
              usualPurpose={null}
              purposeChoices={[]}
              onPurpose={() => {}}
              onOpen={() => {}}
            />
          </Animated.View>
        ))}
      </View>
      <View style={styles.startButton}>
        <ShiftSwitch
          on={false}
          startLabel={t('Swipe to start driving')}
          startHint={t('Ends the practice run')}
          endLabel={t('Swipe to start driving')}
          onStart={onStart}
          onEnd={() => {}}
        />
      </View>
    </Animated.View>
  );
}

/**
 * A hand pressing on the card and sliding the way to swipe, over and over.
 * With Reduce Motion it stays still, with an arrow the way to go.
 */
function Hand({ direction, start = 0, top }: { direction: 1 | -1; start?: number; top?: number }) {
  const reduceMotion = useReducedMotion();
  const loop = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    loop.set(withRepeat(withTiming(1, { duration: 2200, easing: Easing.linear }), -1, false));
  }, [loop, reduceMotion]);
  const style = useAnimatedStyle(() => {
    const p = loop.value;
    // Press (0–0.15), slide (0.15–0.65), let go and fade (0.65–0.8), rest.
    const slide = Math.min(1, Math.max(0, (p - 0.15) / 0.5));
    const eased = 1 - (1 - slide) * (1 - slide);
    const opacity = p < 0.15 ? p / 0.15 : p < 0.65 ? 1 : p < 0.8 ? 1 - (p - 0.65) / 0.15 : 0;
    const press = p < 0.15 ? 1.15 - p : 1;
    return {
      opacity,
      transform: [{ translateX: start + direction * HAND_TRAVEL * eased }, { scale: press }],
    };
  });
  if (reduceMotion) {
    return (
      <View pointerEvents="none" style={[styles.hand, top !== undefined && { top }, styles.handStill]}>
        {direction < 0 && <Text style={styles.handArrow}>←</Text>}
        <HandShape />
        {direction > 0 && <Text style={styles.handArrow}>→</Text>}
      </View>
    );
  }
  return (
    <Animated.View pointerEvents="none" style={[styles.hand, top !== undefined && { top }, style]}>
      <HandShape />
    </Animated.View>
  );
}

/** A pointing hand, drawn so it looks the same everywhere (no emoji font needed). */
function HandShape() {
  const parts = (fill: string, grow: number) => (
    <G fill={fill}>
      {/* Index finger, three folded fingers, the thumb and the palm. */}
      <Rect x={17 - grow} y={2 - grow} width={11 + grow * 2} height={34 + grow * 2} rx={5.5 + grow} />
      <Rect x={27 - grow} y={21 - grow} width={9 + grow * 2} height={16 + grow * 2} rx={4.5 + grow} />
      <Rect x={34 - grow} y={24 - grow} width={8.5 + grow * 2} height={15 + grow * 2} rx={4.25 + grow} />
      <Rect
        x={5 - grow}
        y={29 - grow}
        width={9 + grow * 2}
        height={18 + grow * 2}
        rx={4.5 + grow}
        transform="rotate(-32 9.5 38)"
      />
      <Rect x={10 - grow} y={30 - grow} width={32 + grow * 2} height={26 + grow * 2} rx={11 + grow} />
    </G>
  );
  return (
    <Svg width={48} height={60} viewBox="-3 -3 50 64">
      <Circle cx={22.5} cy={6} r={9} fill={GOLD} opacity={0.55} />
      {parts(INK, 2.2)}
      {parts('#FFFFFF', 0)}
    </Svg>
  );
}

const BURST_COLORS = [GOLD, '#4ADE80', '#FFFFFF', '#BBF7D0', '#F59E0B'];

/** A small pop of confetti from the card, for a step done right. */
function Burst() {
  const pieces = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);
  return (
    <View pointerEvents="none" style={styles.burst}>
      {pieces.map((i) => (
        <BurstPiece key={i} index={i} />
      ))}
    </View>
  );
}

function BurstPiece({ index }: { index: number }) {
  const fly = useSharedValue(0);
  useEffect(() => {
    fly.set(withTiming(1, { duration: 900 + (index % 5) * 90, easing: Easing.out(Easing.cubic) }));
  }, [fly, index]);
  const angle = (index / 18) * Math.PI * 2 + (index % 3) * 0.2;
  const reach = 70 + (index % 4) * 22;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, fly.value - 0.6) * 2.5,
    transform: [
      { translateX: Math.cos(angle) * reach * fly.value },
      // Thrown out, then falling a little.
      { translateY: Math.sin(angle) * reach * 0.6 * fly.value + 40 * fly.value * fly.value },
      { rotate: `${index * 47 * fly.value}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[styles.piece, { backgroundColor: BURST_COLORS[index % BURST_COLORS.length] }, style]}
    />
  );
}

/** VoiceOver (or TalkBack) is on: swipes on the card are out of reach, so a button does the same. */
function useScreenReader(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    // The web preview always reports one: there, the row's own buttons do.
    if (Platform.OS === 'web') return;
    let current = true;
    AccessibilityInfo.isScreenReaderEnabled().then(
      (enabled) => current && setOn(enabled),
      () => {},
    );
    const listener = AccessibilityInfo.addEventListener('screenReaderChanged', setOn);
    return () => {
      current = false;
      listener.remove();
    };
  }, []);
  return on;
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  settingsCard: {
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  settingsText: { flex: 1, gap: Spacing.half },
  // Solid: home showing through behind the text made it hard to read.
  backdrop: { flex: 1, backgroundColor: '#011610', paddingHorizontal: Spacing.three },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 36 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotNow: { width: 26, backgroundColor: GOLD },
  dotDone: { backgroundColor: '#4ADE80' },
  skip: { position: 'absolute', right: 0, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  skipText: { color: '#D1FAE5', fontSize: 15, fontWeight: '600' },
  stage: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  eyebrow: { color: GOLD, fontSize: 13, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center' },
  headline: { color: '#FFFFFF', fontSize: 20, lineHeight: 26, fontWeight: '800', textAlign: 'center' },
  bubbleWrap: { alignItems: 'center', marginTop: Spacing.two },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    maxWidth: '100%',
  },
  bubblePassed: { backgroundColor: '#4ADE80' },
  bubbleIcon: { fontSize: 20, color: INK },
  bubbleText: { color: INK, fontSize: 17, fontWeight: '800', flexShrink: 1 },
  bubbleTextPassed: { textAlign: 'center' },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GOLD,
  },
  bubbleArrowPassed: { borderTopColor: '#4ADE80' },
  retry: { color: '#FEF3C7', fontSize: 14, fontWeight: '700', marginTop: Spacing.one, textAlign: 'center' },
  cardArea: { gap: Spacing.three, alignItems: 'stretch' },
  cardGlow: {
    borderRadius: 18,
    padding: 5,
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  hand: { position: 'absolute', top: '38%', left: '50%', marginLeft: -24 },
  handStill: { flexDirection: 'row', alignItems: 'center', marginLeft: -40 },
  handArrow: { color: GOLD, fontSize: 28, fontWeight: '900', marginHorizontal: 2 },
  voiceButton: { borderWidth: 2, borderRadius: 999, paddingVertical: Spacing.two + 2, alignItems: 'center' },
  voiceText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  sampleNote: { color: 'rgba(209,250,229,0.75)', fontSize: 13, textAlign: 'center' },
  shiftOn: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  burst: { position: 'absolute', left: '50%', top: '45%' },
  piece: { position: 'absolute', width: 8, height: 12, borderRadius: 2 },
  done: { alignItems: 'center', gap: Spacing.three },
  doneList: { width: '100%', borderRadius: 18, overflow: 'hidden', paddingVertical: Spacing.one },
  startButton: { width: '100%', marginTop: Spacing.two },
});
