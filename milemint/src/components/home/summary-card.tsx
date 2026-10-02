import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { MarYear, UnclaimedNudge } from '@/domain/mar';
import { formatDistance, formatLongDate, formatMoney, type TaxYearSummary } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/** Home's green card: this tax year's money back, as it has always looked. */
export function SummaryCard({
  summary,
  commuteCents,
  relief,
}: {
  summary: TaxYearSummary;
  commuteCents: number;
  /** UK employees: this tax year's Mileage Allowance Relief instead of a deduction. */
  relief: { year: MarYear; paysLess: boolean } | null;
}) {
  const t = useT();
  const { region } = useRegion();
  const total = formatMoney(summary.total, region);
  const distance = formatDistance(summary.businessMeters, region);
  if (relief) return <EmployeeSummaryCard summary={summary} year={relief.year} paysLess={relief.paysLess} />;
  return (
    <View style={styles.card}>
      {/* The app icon's gradient, with the leaf growing out of the corner. */}
      <BrandGradient />
      <View style={styles.watermark} pointerEvents="none">
        <LeafMark size={190} opacity={0.22} />
      </View>
      <Text style={styles.heroLabel}>
        {summary.label.length > 4
          ? t('Deductions found in {{year}} tax year', { year: summary.label })
          : t('Deductions found in {{year}}', { year: summary.label })}
      </Text>
      <Text style={styles.heroTotal} accessibilityLabel={t('{{amount}} found', { amount: total })}>
        {total}
      </Text>
      <Text style={styles.heroLabel}>
        {summary.unclassifiedCount > 0
          ? t('{{distance}} for work · {{count}} to review', { distance, count: summary.unclassifiedCount })
          : t('{{distance}} for work', { distance })}
      </Text>
      <CostsLine summary={summary} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Reports: export your mileage log')}
        hitSlop={8}
        onPress={() => router.push('/report')}
        style={styles.reportLink}>
        <Text style={styles.reportLinkText}>{t('Export report')}</Text>
      </Pressable>
      {commuteCents > 0 && (
        <Text style={styles.heroWarning}>
          {t('Includes {{amount}} from home ↔ work commutes, which usually aren’t deductible.', {
            amount: formatMoney(commuteCents, region),
          })}
        </Text>
      )}
    </View>
  );
}

/**
 * The hero card for UK employees: relief to claim when the employer pays less
 * than HMRC's rate, otherwise the business mileage for their expense claims.
 */
function EmployeeSummaryCard({ summary, year, paysLess }: { summary: TaxYearSummary; year: MarYear; paysLess: boolean }) {
  const t = useT();
  const { region } = useRegion();
  const distance = formatDistance(summary.businessMeters, region);
  const total = formatMoney(year.relief, region);
  return (
    <View style={styles.card}>
      <BrandGradient />
      <View style={styles.watermark} pointerEvents="none">
        <LeafMark size={190} opacity={0.22} />
      </View>
      {paysLess ? (
        <>
          <Text style={styles.heroLabel}>
            {t('Mileage Allowance Relief to claim, {{year}} tax year', { year: summary.label })}
          </Text>
          <Text style={styles.heroTotal} accessibilityLabel={t('{{amount}} relief to claim', { amount: total })}>
            {total}
          </Text>
          <Text style={styles.heroLabel}>
            {t('About {{amount}} tax back', { amount: formatMoney(year.taxBack, region) })}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.heroLabel}>{t('Mileage logged for your expense claims')}</Text>
          <Text style={styles.heroTotal} adjustsFontSizeToFit numberOfLines={1}>
            {distance}
          </Text>
          <Text style={styles.heroLabel}>{t('{{year}} tax year', { year: summary.label })}</Text>
        </>
      )}
      <Text style={styles.heroLabel}>
        {summary.unclassifiedCount > 0
          ? t('{{distance}} for work · {{count}} to review', { distance, count: summary.unclassifiedCount })
          : t('{{distance}} for work', { distance })}
      </Text>
      <CostsLine summary={summary} />
      <View style={styles.heroButtons}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Reports: export your mileage log')}
          hitSlop={8}
          onPress={() => router.push('/report')}
          style={styles.reportLink}>
          <Text style={styles.reportLinkText}>{t('Export report')}</Text>
        </Pressable>
        {paysLess && (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/claim-relief' as Href)}
            style={styles.reportLink}>
            <Text style={styles.reportLinkText}>{t('How to claim')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * Parking and tolls on the year's business drives, under the hero total:
 * "incl." where they're added on top, otherwise recorded and shown apart.
 */
function CostsLine({ summary }: { summary: TaxYearSummary }) {
  const t = useT();
  const { region } = useRegion();
  if (summary.costs === 0) return null;
  const amount = formatMoney(summary.costs, region);
  return (
    <Text style={styles.heroLabel}>
      {summary.costsAdded
        ? t('incl. {{amount}} parking & tolls', { amount })
        : t('Parking & tolls: {{amount}} (recorded)', { amount })}
    </Text>
  );
}

/** Relief left in an earlier tax year, before its 4-year window closes. */
export function ReliefNudge({ nudge }: { nudge: UnclaimedNudge }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const params = {
    amount: formatMoney(nudge.oldest.relief, region),
    year: nudge.oldest.label,
    date: formatLongDate(nudge.oldest.claimBy, region),
  };
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/claim-relief' as Href)}>
      <ThemedView type="backgroundElement" style={[styles.trackingCard, { borderColor: '#CA8A04' }]}>
        <ThemedText type="smallBold">{t('{{amount}} relief unclaimed from {{year}}', params)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {nudge.yearCount > 1
            ? t('Claim it before {{date}}. {{total}} unclaimed across {{count}} earlier tax years.', {
                date: params.date,
                total: formatMoney(nudge.totalRelief, region),
                count: nudge.yearCount,
              })
            : t('Claim it before {{date}}.', { date: params.date })}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('See how to claim ›')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: Spacing.four, gap: Spacing.one, overflow: 'hidden' },
  watermark: { position: 'absolute', right: -44, bottom: -52 },
  heroLabel: { color: '#D1FAE5', fontSize: 15, fontWeight: '500' },
  heroTotal: { color: '#FFFFFF', fontSize: 48, lineHeight: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  heroWarning: { color: '#FDE68A', fontSize: 14, lineHeight: 20 },
  reportLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  reportLinkText: { color: '#064E3B', fontSize: 14, fontWeight: '700' },
  heroButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  trackingCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
});
