import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { FILING, returnDueDate } from '@/domain/deadlines';
import { currentTaxYear, formatLongDate, taxYearBounds, taxYearLabel } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/** When the tax year ends, when the return is due, and who also reports quarterly, for the user's country. */
export default function TaxDatesScreen() {
  const t = useT();
  const { region } = useRegion();
  const guide = FILING[region.code];
  const year = currentTaxYear(region);
  const { end } = taxYearBounds(year, region);
  const today = toLocalIsoDate(new Date());
  const daysLeft = Math.round((Date.parse(end) - Date.parse(today)) / 86_400_000) + 1;
  const lastYearDue = returnDueDate(year - 1, region);
  const nextDue =
    lastYearDue >= today ? { year: year - 1, date: lastYearDue } : { year, date: returnDueDate(year, region) };

  const section = (glyph: string, title: string, body: string) => (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Text style={styles.glyph}>{glyph}</Text>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {body}
        </ThemedText>
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <BrandGradient />
          <View style={styles.heroLeaf} pointerEvents="none">
            <LeafMark size={150} opacity={0.2} />
          </View>
          <Text style={styles.heroLabel}>
            {region.flag} {t('{{year}} tax year', { year: taxYearLabel(year, region) })}
          </Text>
          <Text style={styles.heroBig}>
            {daysLeft <= 0 ? t('Last day today') : t('{{count}} days left', { count: daysLeft })}
          </Text>
          <Text style={styles.heroLabel}>{t('Ends {{date}}', { date: formatLongDate(end, region) })}</Text>
          <View style={styles.divider} />
          <Text style={styles.heroLabel}>
            {t(guide.returnIsDue, { year: taxYearLabel(nextDue.year, region) })}
          </Text>
          <Text style={styles.heroMid}>{formatLongDate(nextDue.date, region)}</Text>
        </View>

        {section('📅', t('Every year'), t(guide.yearly))}
        {guide.quarterly && section('🔁', t('Every quarter (some people)'), t(guide.quarterly))}
        {section('💼', t('If you’re employed'), t(guide.employees))}
        {section(
          '✅',
          t('Stay ready'),
          t(
            'Sort your drives each week and your figures are ready whenever a deadline comes round. MileMint reminds you two months, one month and one week before the tax year ends.',
          ),
        )}

        <ThemedText type="small" themeColor="textSecondary">
          {t(
            'Dates are a guide; deadlines can move for weekends and holidays. Check with {{authority}} or your accountant. Not tax advice.',
            { authority: region.authority },
          )}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  hero: { borderRadius: 20, padding: Spacing.four, gap: 2, overflow: 'hidden' },
  heroLeaf: { position: 'absolute', right: -30, bottom: -40 },
  heroLabel: { color: '#D1FAE5', fontSize: 15, fontWeight: '500' },
  heroBig: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroMid: { color: '#FACC15', fontSize: 22, fontWeight: '800' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
  },
  glyph: { fontSize: 22, lineHeight: 28 },
  flex: { flex: 1, gap: Spacing.one },
});
