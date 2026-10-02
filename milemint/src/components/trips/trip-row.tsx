import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { purposeIcon, shownPurpose } from '@/components/purpose-picker';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { AutoReason } from '@/domain/classify-rules';
import { shownLabel } from '@/domain/privacy';
import { formatDistance, formatMoney } from '@/domain/regions';
import { type Classification, type Trip, tripCostsMinor } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

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
  onPurpose,
  onOpen,
}: {
  trip: Trip;
  deduction: number;
  /** Instead of opening the trip's details (the practice tutorial's sample drives aren't saved). */
  onOpen?: () => void;
  /** Filled in for business drives with none; a trip still showing it is marked to check. */
  usualPurpose: string | null;
  /** One-tap purposes for a business drive without one, most likely first. */
  purposeChoices: readonly string[];
  onPurpose: (purpose: string) => void;
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
    trip.localDate,
    trip.source === 'auto' ? formatTime(trip.startedAt, region) : t('Added manually'),
    shownPurpose(trip.purpose, t),
    deduction > 0 ? formatMoney(deduction, region) : '',
  ].filter(Boolean);
  const openDetails = onOpen ?? (() => router.push({ pathname: '/trip/[id]', params: { id: trip.id } }));
  // Filled in by the app with the usual purpose and not checked since: said quietly, so it can be.
  const filledWithUsual =
    !!trip.purposeFilled &&
    !trip.shiftId &&
    usualPurpose !== null &&
    trip.purpose.trim().toLowerCase() === usualPurpose.trim().toLowerCase();

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
          {business && tripCostsMinor(trip) > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('+{{amount}} parking & tolls', { amount: formatMoney(tripCostsMinor(trip), region) })}
            </ThemedText>
          )}
          {trip.autoReason && (
            <ThemedText type="small" themeColor="textSecondary">
              {trip.shiftId
                ? t('Auto: on shift')
                : trip.autoReason === 'work-hours'
                  ? trip.classification === 'business'
                    ? t('Auto: in your work hours')
                    : t('Auto: outside your work hours · swipe right if it was work')
                  : t(AUTO_NOTES[trip.autoReason])}
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
          {business && filledWithUsual && (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('Opens trip details')}
              onPress={openDetails}
              hitSlop={8}
              style={rowStyles.savedLine}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Usual purpose · tap to change')}
              </ThemedText>
            </Pressable>
          )}
          {needsPurpose(trip) && <PurposeNeeded choices={purposeChoices} onPick={onPurpose} onOther={openDetails} />}
          <Segmented
            options={CLASSIFY_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
            value={unclassified ? null : trip.classification}
            onChange={onClassify}
            accessibilityLabelFor={(option) =>
              option.value === 'business'
                ? t('Mark {{from}} to {{to}} as business', { from: trip.startLabel, to: trip.endLabel })
                : t('Mark {{from}} to {{to}} as personal', { from: trip.startLabel, to: trip.endLabel })
            }
          />
        </ThemedView>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/** A business drive with no purpose (the report counts the same, see domain/report). */
export function needsPurpose(trip: Trip): boolean {
  return trip.classification === 'business' && !trip.purpose.trim();
}

/**
 * Under a business drive with no purpose: hard to miss, and one tap to fix.
 * Tax offices (HMRC, the IRS, CRA, ATO) want a purpose for every business
 * drive. "Other…" opens the trip, with the full purpose list.
 */
function PurposeNeeded({
  choices,
  onPick,
  onOther,
}: {
  choices: readonly string[];
  onPick: (purpose: string) => void;
  onOther: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const chip = ({ pressed }: { pressed: boolean }) => [
    styles.purposeChip,
    { backgroundColor: pressed ? theme.backgroundSelected : theme.background, borderColor: theme.warning },
  ];
  return (
    <View style={[styles.purposeNeeded, { borderColor: theme.warning, backgroundColor: theme.warning + '1A' }]}>
      <ThemedText type="smallBold">⚠️ {t('Purpose needed for your tax records')}</ThemedText>
      <View style={styles.purposeChips}>
        {choices.map((purpose) => (
          <Pressable
            key={purpose}
            accessibilityRole="button"
            accessibilityLabel={t('Business purpose: {{purpose}}', { purpose: shownPurpose(purpose, t) })}
            onPress={() => onPick(purpose)}
            style={chip}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {purposeIcon(purpose)} {shownPurpose(purpose, t)}
            </ThemedText>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" accessibilityHint={t('Opens trip details')} onPress={onOther} style={chip}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {t('Other…')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  purposeNeeded: { borderWidth: 1, borderRadius: 10, padding: Spacing.two + 2, gap: Spacing.two },
  purposeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  purposeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.one + 2,
    maxWidth: '100%',
  },
});
