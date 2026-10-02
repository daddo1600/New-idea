import { router } from 'expo-router';
import { type ReactNode, useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { quickPurposes, shownPurpose } from '@/components/purpose-picker';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { AutoReason } from '@/domain/classify-rules';
import { shownLabel } from '@/domain/privacy';
import { formatDistance, formatMoney, formatShortDate } from '@/domain/regions';
import { type PlacePurposes, suggestPurpose } from '@/domain/suggestions';
import { type Classification, type Trip, tripCostsMinor } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

import { PurposeLine } from './purpose-line';
import { CLASSIFY_OPTIONS, formatTime, rowStyles, SWIPE_THRESHOLD, SwipeAction } from './row-parts';

const AUTO_NOTES: Record<AutoReason, string> = {
  'learned-route': msg('Auto: usual route'),
  'work-hours': msg('Auto: work hours'),
  commute: msg('Auto: commute'),
  default: msg('Auto: business by default · swipe left if personal'),
};

/** A drive in the lists: swipe or tap Business / Personal, tap to open, long press to delete. */
export function TripRow({
  trip,
  deduction,
  potential,
  commute,
  offShift = null,
  onClassify,
  onLongPress,
  usualPurpose,
  purposeChoices,
  purposeHistory,
  clientPrivacy = false,
  onPurpose,
  rowLeaves = false,
  onOpen,
}: {
  trip: Trip;
  deduction: number;
  /** Instead of opening the trip's details (the practice tutorial's sample drives aren't saved). */
  onOpen?: () => void;
  /** Filled in for business drives with none; a trip still showing it is marked to check. */
  usualPurpose: string | null;
  /** Purposes to offer for a business drive, most likely first (the sheet's tiles). */
  purposeChoices: readonly string[];
  /** The purposes last used at each place (see purposesByPlace), so the suggestion fits the drive. */
  purposeHistory?: PlacePurposes;
  /** Client privacy mode: typing your own purpose suggests a client reference. */
  clientPrivacy?: boolean;
  /** Saves the purpose (a failed save puts the choices back). */
  onPurpose: (purpose: string) => void | Promise<unknown>;
  /** The whole row leaves once a purpose is picked (see LeavesWithPurpose), rather than showing it saved. */
  rowLeaves?: boolean;
  /** Cut off a shift: the part after it ended (the drive home), or in a pause. */
  offShift?: 'after' | 'pause' | null;
  /** What the trip would be worth as business: the nudge to classify it. */
  potential: number;
  /** Home ↔ work: shown with a warning if marked business. */
  commute: boolean;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const swipeable = useRef<SwipeableMethods>(null);
  const unclassified = trip.classification === 'unclassified';
  const business = trip.classification === 'business';
  const details = [
    formatShortDate(trip.localDate, region, undefined, t),
    trip.source === 'auto' ? formatTime(trip.startedAt, region) : t('Added manually'),
    // A business drive's purpose has a line of its own (see PurposeLine).
    business ? '' : shownPurpose(trip.purpose, t),
    deduction > 0 ? formatMoney(deduction, region) : '',
  ].filter(Boolean);
  const openDetails = onOpen ?? (() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } }));
  // Filled in by the app with the usual purpose and not checked since: said quietly, so it can be.
  const filledWithUsual =
    business &&
    !!trip.purposeFilled &&
    !trip.shiftId &&
    usualPurpose !== null &&
    trip.purpose.trim().toLowerCase() === usualPurpose.trim().toLowerCase();

  const autoNote = !trip.autoReason
    ? null
    : trip.shiftId
      ? t('Auto: on shift')
      : trip.autoReason === 'work-hours'
        ? business
          ? t('Auto: in your work hours')
          : t('Auto: outside your work hours · swipe right if it was work')
        : t(AUTO_NOTES[trip.autoReason]);
  const classify = (
    <Segmented
      compact={!unclassified}
      options={CLASSIFY_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
      value={unclassified ? null : trip.classification}
      onChange={onClassify}
      accessibilityLabelFor={(option) =>
        option.value === 'business'
          ? t('Mark {{from}} to {{to}} as business', { from: trip.startLabel, to: trip.endLabel })
          : t('Mark {{from}} to {{to}} as personal', { from: trip.startLabel, to: trip.endLabel })
      }
    />
  );

  // Swipe right = Business, left = Personal. The buttons below stay for
  // VoiceOver and anyone who doesn't discover the gesture.
  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      renderLeftActions={() => (
        <SwipeAction label={t('Business')} color={theme.accent} textColor={theme.onAccent} side="left" />
      )}
      renderRightActions={() => (
        <SwipeAction
          label={t('Personal')}
          color={theme.backgroundSelected}
          textColor={theme.text}
          side="right"
        />
      )}
      onSwipeableOpen={(direction) => {
        swipeable.current?.close();
        onClassify(direction === SwipeDirection.RIGHT ? 'business' : 'personal');
      }}>
      <Pressable
        onPress={openDetails}
        onLongPress={onLongPress}
        accessibilityHint={t('Opens trip details. Long press to delete')}>
        <ThemedView type="backgroundElement" style={rowStyles.row}>
          <View style={rowStyles.rowHeader}>
            <ThemedText type="smallBold" style={rowStyles.route} numberOfLines={1}>
              {shownLabel(trip.startLabel, t)} → {shownLabel(trip.endLabel, t)}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {details.join(' · ')}
          </ThemedText>
          {business && (
            <PurposeLine
              purpose={trip.purpose}
              suggestion={
                needsPurpose(trip)
                  ? suggestPurpose(trip, { byPlace: purposeHistory, usual: usualPurpose, choices: purposeChoices })
                  : null
              }
              // Never an empty sheet (the practice run passes no choices): the common purposes follow.
              choices={[...purposeChoices, ...quickPurposes({}, 10)]}
              route={`${shownLabel(trip.startLabel, t)} → ${shownLabel(trip.endLabel, t)}`}
              filledWithUsual={filledWithUsual}
              clientPrivacy={clientPrivacy}
              rowLeaves={rowLeaves}
              onPick={onPurpose}
            />
          )}
          {business && tripCostsMinor(trip) > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('+{{amount}} parking & tolls', { amount: formatMoney(tripCostsMinor(trip), region) })}
            </ThemedText>
          )}
          {unclassified && autoNote && (
            <ThemedText type="small" themeColor="textSecondary">
              {autoNote}
            </ThemedText>
          )}
          {offShift && (
            <ThemedText type="small" themeColor="textSecondary">
              {offShift === 'after'
                ? t('After your shift ended · not counted as work unless you say so')
                : t('During a pause in your shift · not counted as work unless you say so')}
            </ThemedText>
          )}
          {business && commute && (
            <ThemedText type="small" themeColor="danger">
              {t('Commute between home and work isn’t deductible.')}
            </ThemedText>
          )}
          {unclassified && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {potential > 0
                ? t('Business or personal? Worth {{amount}} if business.', { amount: formatMoney(potential, region) })
                : t('Business or personal?')}
            </ThemedText>
          )}
          {unclassified ? (
            classify
          ) : (
            // Sorted: the choice stays, smaller, beside how it was sorted.
            <View style={styles.sorted}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sortedNote}>
                {autoNote}
              </ThemedText>
              {classify}
            </View>
          )}
        </ThemedView>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/** A business drive with no purpose (the report counts the same, see domain/report). */
export function needsPurpose(trip: Trip): boolean {
  return trip.classification === 'business' && !trip.purpose.trim();
}

/** How long a row takes to slide out and close up. */
const LEAVE_MS = 280;

/**
 * Filling in purposes: a drive given one is no longer listed. Rather than
 * vanish, its row slides out and the rows below close up, then it's saved
 * (a failed save brings it back).
 */
export function LeavesWithPurpose({
  onPurpose,
  children,
}: {
  onPurpose: (purpose: string) => Promise<unknown>;
  children: (onPurpose: (purpose: string) => void) => ReactNode;
}) {
  const [purpose, setPurpose] = useState<string | null>(null);
  const [round, bumpRound] = useReducer((n: number) => n + 1, 0);
  return (
    <Leaving
      key={round}
      leaving={purpose !== null}
      gap={Spacing.three}
      onGone={() => {
        if (purpose === null) return;
        onPurpose(purpose).catch(() => {
          setPurpose(null);
          bumpRound();
        });
      }}>
      {children(setPurpose)}
    </Leaving>
  );
}

/**
 * Slides its content out to the left while closing up the space it took (and
 * the `gap` before it, so nothing jumps when it's gone), then calls `onGone`.
 * Reduce Motion skips straight to `onGone`.
 */
function Leaving({
  leaving,
  gap,
  onGone,
  children,
}: {
  leaving: boolean;
  gap: number;
  onGone: () => void;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const height = useSharedValue(0);
  const out = useSharedValue(0);
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  }, [onGone]);
  useEffect(() => {
    if (!leaving) return;
    const done = () => gone.current();
    if (reduceMotion) return done();
    out.set(
      withTiming(1, { duration: LEAVE_MS, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) scheduleOnRN(done);
      }),
    );
  }, [leaving, reduceMotion, out]);
  const style = useAnimatedStyle(() => {
    if (out.value === 0) return {};
    // Out of sight in the first part; the space closes up over the whole.
    const shown = Math.max(0, 1 - out.value * 1.6);
    return {
      height: height.value * (1 - out.value),
      marginTop: -gap * out.value,
      opacity: shown,
      transform: [{ translateX: -48 * (1 - shown) }],
    };
  });
  return (
    <Animated.View
      style={[styles.leaving, style]}
      onLayout={(event) => {
        if (!leaving) height.set(event.nativeEvent.layout.height);
      }}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sorted: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  sortedNote: { flex: 1 },
  leaving: { overflow: 'hidden' },
});
