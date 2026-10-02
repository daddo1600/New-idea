import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { shownPurpose } from '@/components/purpose-picker';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { shownLabel } from '@/domain/privacy';
import { formatDistance, formatShortDate } from '@/domain/regions';
import type { Classification, Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

import { CLASSIFY_OPTIONS, formatTime, rowStyles, SWIPE_THRESHOLD, SwipeAction } from './row-parts';

/**
 * A drive past the free plan's monthly allowance: saved and shown in full
 * (route, distance, time, purpose) and sortable like any other. Only its
 * value waits for Pro, and the row says so instead of hiding anything.
 */
export function LockedTripRow({
  trip,
  onClassify,
  onLongPress,
}: {
  trip: Trip;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const swipeable = useRef<SwipeableMethods>(null);
  const unclassified = trip.classification === 'unclassified';
  const details = [formatShortDate(trip.localDate, region, undefined, t), formatTime(trip.startedAt, region), shownPurpose(trip.purpose, t)].filter(Boolean);
  const openDetails = () => router.push({ pathname: '/trip/[id]', params: { id: trip.id } });
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
        <SwipeAction label={t('Personal')} color={theme.backgroundSelected} textColor={theme.text} side="right" />
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
          <Pressable
            accessibilityRole="button"
            accessibilityHint={t('Opens MileSprout Pro')}
            hitSlop={8}
            onPress={() => router.push('/pro')}
            style={rowStyles.savedLine}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              🔒 {t('Saved · value unlocks with Pro')}
            </ThemedText>
          </Pressable>
          {unclassified && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('Business or personal? Personal drives don’t use your free drives.')}
            </ThemedText>
          )}
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
