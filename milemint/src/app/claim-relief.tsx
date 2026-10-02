import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { ProExportPrompt } from '@/components/pro-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/db/use-trips';
import { DEMO_TODAY } from '@/dev/demo';
import { marApplies, marSummary, type MarYear, P87_LIMIT_MINOR, P87_URL, TAX_BAND_RATES } from '@/domain/mar';
import { formatDistance, formatLongDate, formatMoney, formatRate, fromUnits, ratePeriodFor, type Region } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { useMileagePay } from '@/hooks/use-mileage-pay';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import { PDF_AVAILABLE, shareP87Summary } from '@/reports/export';

/**
 * UK employees: the Mileage Allowance Relief in each tax year still open to a
 * claim, how to claim it (P87 or Self Assessment), and the figures to copy in.
 */
export default function ClaimReliefScreen() {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const { isPro } = usePro();
  const { trips } = useTrips();
  const { pay, update } = useMileagePay();
  const [busy, setBusy] = useState<'csv' | 'pdf' | null>(null);
  // English, marked with msg() and shown with t().
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => (DEMO_TODAY ? new Date(`${DEMO_TODAY}T12:00:00`) : new Date()), []);
  const options = useMemo(
    () => ({ employerRate: pay?.employerRate ?? 0, band: pay?.band ?? 'unsure' }) as const,
    [pay?.employerRate, pay?.band],
  );
  const summary = useMemo(() => marSummary(trips ?? [], region, options, today), [trips, region, options, today]);

  if (!trips || !pay) return <ActivityIndicator style={styles.loading} />;

  if (!marApplies(region) || !pay.employee) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{t('Mileage Allowance Relief')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {marApplies(region)
                ? t(
                    'For UK employees who use their own vehicle for work. If that’s you, choose Employee under “How you’re paid for mileage” in Settings.',
                  )
                : t('Mileage Allowance Relief is a UK tax relief for employees.')}
            </ThemedText>
            {marApplies(region) && (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.navigate('/settings' as Href)}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {t('Open Settings')}
                </ThemedText>
              </Pressable>
            )}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    );
  }

  const percent = TAX_BAND_RATES[pay.band];
  const share = async (kind: 'csv' | 'pdf') => {
    // The figures on screen are free; the P87 summary file is an export, so it's Pro.
    if (!isPro) return router.push('/pro');
    setError(null);
    setBusy(kind);
    try {
      await shareP87Summary(summary, region, options, kind);
    } catch {
      setError(msg('Couldn’t create the file. Please try again.'));
    } finally {
      setBusy(null);
    }
  };
  const toggleClaimed = (year: number, claimed: boolean) =>
    update((saved) => ({
      claimedReliefYears: claimed
        ? [...new Set([...saved.claimedReliefYears, year])]
        : saved.claimedReliefYears.filter((other) => other !== year),
    }));
  const limit = p87Limit(region);
  const period = ratePeriodFor(toLocalIsoDate(today), region);
  const hmrcRate = period ? formatRate(period.tiers[0].rate, region) : '';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <BrandGradient />
          <View style={styles.heroLeaf} pointerEvents="none">
            <LeafMark size={150} opacity={0.2} />
          </View>
          <Text style={styles.heroLabel}>{t('Mileage Allowance Relief you can claim')}</Text>
          <Text style={styles.heroBig}>{formatMoney(summary.totalRelief, region)}</Text>
          <Text style={styles.heroLabel}>
            {t('About {{amount}} tax back at {{percent}}%', {
              amount: formatMoney(summary.totalTaxBack, region),
              percent,
            })}
          </Text>
          <Text style={styles.heroNote}>
            {pay.employerRate > 0
              ? t('Your employer pays {{employerRate}} a mile. HMRC’s rate is {{rate}} a mile for the first 10,000 business miles.', {
                  employerRate: formatRate(pay.employerRate, region),
                  rate: hmrcRate,
                })
              : t('Your employer pays nothing for mileage. HMRC’s rate is {{rate}} a mile for the first 10,000 business miles.', {
                  rate: hmrcRate,
                })}
          </Text>
        </View>

        {summary.years.map((year) => (
          <YearCard
            key={year.taxYear}
            year={year}
            claimed={pay.claimedYears.includes(year.taxYear)}
            onClaimed={(claimed) => toggleClaimed(year.taxYear, claimed)}
          />
        ))}

        <ThemedText type="smallBold">{t('How to claim')}</ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          {[
            t(
              'Choose the route. Use form P87 if your employment expenses for the year are {{limit}} or less and you don’t file a Self Assessment return. Otherwise, claim on your Self Assessment return.',
              { limit },
            ),
            t(
              'Have to hand: your employer’s name and PAYE reference (on your payslip or P60), your National Insurance number, and for each tax year your business miles and the mileage allowance you were paid. The P87 summary below has the figures.',
            ),
            t(
              'Claim online on GOV.UK with your Government Gateway login, or print the P87 form and post it. You can claim this tax year and the 4 before it.',
            ),
            t(
              'HMRC usually changes your tax code for this year and refunds earlier years. They may ask to see your mileage log: export it from Reports.',
            ),
          ].map((text, index) => (
            <View key={index} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                <Text style={[styles.stepNumberText, { color: theme.onAccent }]}>{index + 1}</Text>
              </View>
              <ThemedText type="small" style={styles.flex}>
                {text}
              </ThemedText>
            </View>
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            {t('Only business journeys count, not ordinary commuting between home and your usual workplace.')}
          </ThemedText>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(P87_URL).catch(() => {})}
            style={[styles.filled, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Claim on GOV.UK (P87)')}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText type="smallBold">{t('P87 summary')}</ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            {t(
              'Each tax year’s business miles, HMRC’s approved amount, what your employer paid and the relief to claim, in English for HMRC.',
            )}
          </ThemedText>
          {error && (
            <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
              {t(error)}
            </ThemedText>
          )}
          {!isPro && (
            <ProExportPrompt
              body={t('The figures above stay free to copy into your claim. Pro saves them as a file.')}
            />
          )}
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              disabled={busy !== null}
              onPress={() => share('csv')}
              style={[styles.outline, { borderColor: theme.accent, opacity: busy ? 0.5 : 1 }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {busy === 'csv' ? t('Preparing…') : t('Spreadsheet (CSV)')}
                {!isPro && ' · Pro'}
              </ThemedText>
            </Pressable>
            {PDF_AVAILABLE && (
              <Pressable
                accessibilityRole="button"
                disabled={busy !== null}
                onPress={() => share('pdf')}
                style={[styles.outline, { borderColor: theme.accent, opacity: busy ? 0.5 : 1 }]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {busy === 'pdf' ? t('Preparing…') : t('PDF')}
                  {!isPro && ' · Pro'}
                </ThemedText>
              </Pressable>
            )}
          </View>
        </ThemedView>

        <ThemedText type="small" themeColor="textSecondary">
          {t(
            'Estimates from your logged business drives at HMRC’s approved mileage rates. The tax you get back depends on your income and tax rate. Not tax advice.',
          )}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

/** "£2,500". */
const p87Limit = (region: Region) => formatMoney(P87_LIMIT_MINOR, region).replace(/[.,]00$/, '');

/** One tax year: the figures for the claim, when it must be in by, and whether it's done. */
function YearCard({
  year,
  claimed,
  onClaimed,
}: {
  year: MarYear;
  claimed: boolean;
  onClaimed: (claimed: boolean) => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.rowBetween}>
        <ThemedText type="smallBold">{t('{{year}} tax year', { year: year.label })}</ThemedText>
        <ThemedText type="smallBold" style={{ color: year.relief > 0 ? theme.accent : theme.textSecondary }}>
          {formatMoney(year.relief, region)}
        </ThemedText>
      </View>
      <View style={styles.lines}>
        <Line label={t('Business miles')} value={formatDistance(fromUnits(year.businessMiles, region), region)} />
        <Line label={t('HMRC approved amount')} value={formatMoney(year.amap, region)} />
        <Line label={t('Paid by your employer')} value={formatMoney(year.employerPaid, region)} />
        <Line label={t('Relief to claim')} value={formatMoney(year.relief, region)} bold />
        <Line label={t('Estimated tax back')} value={formatMoney(year.taxBack, region)} />
      </View>
      {year.relief > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {year.needsSelfAssessment
            ? t('Over {{limit}}: claim on a Self Assessment return by {{date}}.', {
                limit: p87Limit(region),
                date: formatLongDate(year.claimBy, region),
              })
            : t('Claim with a P87 (or Self Assessment) by {{date}}.', { date: formatLongDate(year.claimBy, region) })}
        </ThemedText>
      )}
      {year.excessTaxable > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('Your employer paid {{amount}} more than HMRC’s approved amount. The extra is taxable pay.', {
            amount: formatMoney(year.excessTaxable, region),
          })}
        </ThemedText>
      )}
      {year.relief > 0 && (
        <View style={styles.rowBetween}>
          <ThemedText type="small">{t('I’ve claimed this year')}</ThemedText>
          <Switch
            accessibilityLabel={t('I’ve claimed the {{year}} tax year', { year: year.label })}
            value={claimed}
            onValueChange={onClaimed}
            trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          />
        </View>
      )}
    </ThemedView>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.rowBetween}>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={bold ? 'smallBold' : 'small'}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
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
  heroBig: { color: '#FFFFFF', fontSize: 40, lineHeight: 48, fontWeight: '800', fontVariant: ['tabular-nums'] },
  heroNote: { color: '#D1FAE5', fontSize: 13, lineHeight: 18, marginTop: Spacing.two },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  lines: { gap: Spacing.one },
  step: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  stepNumber: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumberText: { fontSize: 12, fontWeight: '800' },
  flex: { flex: 1 },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  outline: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, borderWidth: 1 },
  filled: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, marginTop: Spacing.one },
});
