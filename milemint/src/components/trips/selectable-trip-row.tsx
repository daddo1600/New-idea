import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { shownLabel } from '@/domain/privacy';
import { formatDistance, formatShortDate } from '@/domain/regions';
import type { Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

import { rowStyles } from './row-parts';

/** A trip row in select mode: tap to tick it; no swiping or opening. */
export function SelectableTripRow({
  trip,
  selected,
  onToggle,
}: {
  trip: Trip;
  selected: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const date = formatShortDate(trip.localDate, region, undefined, t);
  const status =
    trip.classification === 'unclassified'
      ? t('Not sorted')
      : trip.classification === 'business'
        ? t('Business')
        : t('Personal');
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t('{{from}} to {{to}}, {{date}}, {{status}}', {
        from: trip.startLabel,
        to: trip.endLabel,
        date,
        status,
      })}
      onPress={onToggle}>
      <ThemedView
        type="backgroundElement"
        style={[rowStyles.row, styles.selectableRow, selected && { borderColor: theme.accent }]}>
        <View
          style={[
            styles.check,
            { borderColor: selected ? theme.accent : theme.textSecondary },
            selected && { backgroundColor: theme.accent },
          ]}>
          {selected && (
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              ✓
            </ThemedText>
          )}
        </View>
        <View style={rowStyles.flex}>
          <View style={rowStyles.rowHeader}>
            <ThemedText type="smallBold" style={rowStyles.route} numberOfLines={1}>
              {shownLabel(trip.startLabel, t)} → {shownLabel(trip.endLabel, t)}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {date} · {status}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  selectableRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderWidth: 2, borderColor: 'transparent' },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
