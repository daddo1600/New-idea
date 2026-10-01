import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { DEMO_TODAY } from '@/dev/demo';
import { activeCountdown, FILING } from '@/domain/deadlines';
import { formatLongDate, formatMoney } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
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
  const t = useT();
  const { region } = useRegion();
  const countdown = activeCountdown(region, DEMO_TODAY ? new Date(`${DEMO_TODAY}T12:00:00`) : new Date());
  if (!countdown) return null;

  const urgent = countdown.days <= URGENT_DAYS;
  const color = urgent ? '#CA8A04' : theme.accent;
  const yearEnd = countdown.kind === 'year-end';
  const today = countdown.days <= 0;
  const count = today ? t('Today') : String(countdown.days);
  // The word under the number in the box: "day" or "days".
  const unit = today ? '' : t('days', { count: countdown.days });
  const year = countdown.label;
  const returnName = t(FILING[region.code].returnName);
  const date = formatLongDate(countdown.date, region);
  const amount = formatMoney(foundMinor, region);

  return (
    <View
      style={[styles.card, { borderColor: color, backgroundColor: color + '14' }]}
      accessibilityLabel={
        yearEnd
          ? today
            ? t('Last day of the {{year}} tax year', { year })
            : t('{{count}} days left in the {{year}} tax year', { count: countdown.days, year })
          : today
            ? t('Your {{year}} {{returnName}} is due today', { year, returnName })
            : t('{{count}} days until your {{year}} {{returnName}} is due', { count: countdown.days, year, returnName })
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
              ? t('Last days of the {{year}} tax year', { year })
              : t('The {{year}} tax year ends soon', { year })
            : t('Your {{year}} {{returnName}} is due', { year, returnName })}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {yearEnd
            ? region.unit === 'mi'
              ? t(
                  'Get your miles up to date before {{date}} so you claim everything you’re owed. {{amount}} found so far.',
                  { date, amount },
                )
              : t(
                  'Get your kilometres up to date before {{date}} so you claim everything you’re owed. {{amount}} found so far.',
                  { date, amount },
                )
            : t('Due {{date}}. Your mileage report for {{year}} is ready to export.', { date, year })}
        </ThemedText>
        <View style={styles.buttons}>
          {yearEnd ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => (unsortedCount > 0 ? onSortUnsorted() : router.push('/add-trip'))}
                style={[styles.primary, { backgroundColor: color }]}>
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  {unsortedCount > 0 ? t('Sort {{count}} drives', { count: unsortedCount }) : t('Add a missed drive')}
                </ThemedText>
              </Pressable>
              {unsortedCount > 0 && (
                <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/add-trip')}>
                  <ThemedText type="small" style={{ color }}>
                    {t('Add a missed drive')}
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
                {t('Get my report')}
              </ThemedText>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/tax-dates')}>
            <ThemedText type="small" style={{ color }}>
              {t('Tax dates ›')}
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
