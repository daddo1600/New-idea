import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { DEMO_TODAY } from '@/dev/demo';
import { activeCountdown, FILING } from '@/domain/deadlines';
import { formatLongDate, formatMoney } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';

/** Gold from two weeks out. */
const URGENT_DAYS = 14;

/**
 * In the last two months of the tax year, a countdown on home: get every
 * drive in so nothing owed is left behind. After the year ends, a countdown
 * to the return deadline with the report one tap away.
 */
export function TaxCountdown({
  foundMinor,
  unsortedCount,
  onSortUnsorted,
}: {
  /** This tax year's money back so far. */
  foundMinor: number;
  unsortedCount: number;
  onSortUnsorted: () => void;
}) {
  const theme = useTheme();
  const { region } = useRegion();
  const countdown = activeCountdown(region, DEMO_TODAY ? new Date(`${DEMO_TODAY}T12:00:00`) : new Date());
  if (!countdown) return null;

  const units = region.unit === 'mi' ? 'miles' : 'kilometres';
  const urgent = countdown.days <= URGENT_DAYS;
  const color = urgent ? '#CA8A04' : theme.accent;
  const yearEnd = countdown.kind === 'year-end';
  const count = countdown.days <= 0 ? 'Today' : String(countdown.days);
  const unit = countdown.days <= 0 ? '' : countdown.days === 1 ? 'day' : 'days';

  return (
    <View
      style={[styles.card, { borderColor: color, backgroundColor: color + '14' }]}
      accessibilityLabel={
        yearEnd
          ? `${count} ${unit} left in the ${countdown.label} tax year`
          : `${count} ${unit} until your ${countdown.label} ${FILING[region.code].returnName} is due`
      }>
      <View style={[styles.count, { backgroundColor: color }]}>
        <Text style={styles.countNumber} adjustsFontSizeToFit numberOfLines={1}>
          {count}
        </Text>
        {unit !== '' && <Text style={styles.countUnit}>{unit}</Text>}
      </View>
      <View style={styles.flex}>
        <ThemedText type="smallBold">
          {yearEnd
            ? urgent
              ? `Last days of the ${countdown.label} tax year`
              : `The ${countdown.label} tax year ends soon`
            : `Your ${countdown.label} ${FILING[region.code].returnName} is due`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {yearEnd
            ? `Get your ${units} up to date before ${formatLongDate(countdown.date, region)} so you claim everything you’re owed. ${formatMoney(foundMinor, region)} found so far.`
            : `Due ${formatLongDate(countdown.date, region)}. Your mileage report for ${countdown.label} is ready to export.`}
        </ThemedText>
        <View style={styles.buttons}>
          {yearEnd ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => (unsortedCount > 0 ? onSortUnsorted() : router.push('/add-trip'))}
                style={[styles.primary, { backgroundColor: color }]}>
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  {unsortedCount > 0
                    ? `Sort ${unsortedCount} ${unsortedCount === 1 ? 'drive' : 'drives'}`
                    : 'Add a missed drive'}
                </ThemedText>
              </Pressable>
              {unsortedCount > 0 && (
                <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/add-trip')}>
                  <ThemedText type="small" style={{ color }}>
                    Add a missed drive
                  </ThemedText>
                </Pressable>
              )}
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/report')}
              style={[styles.primary, { backgroundColor: color }]}>
              <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                Get my report
              </ThemedText>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/tax-dates')}>
            <ThemedText type="small" style={{ color }}>
              Tax dates ›
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.three,
  },
  count: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  countUnit: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
  },
  flex: { flex: 1, gap: Spacing.one },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.three,
    rowGap: Spacing.two,
    marginTop: Spacing.two,
  },
  primary: {
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
