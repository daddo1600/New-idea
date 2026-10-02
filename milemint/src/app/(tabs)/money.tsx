import { type Href, router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { LinkRow } from '@/components/link-row';
import { LogbookNudge } from '@/components/logbook-nudge';
import { PlanCard } from '@/components/home/plan-card';
import { ReliefNudge } from '@/components/home/summary-card';
import { TaxCountdown } from '@/components/tax-countdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  costsAdded,
  displayLocale,
  formatDistance,
  formatMoney,
  summarizeTaxYear,
  taxYearBounds,
  taxYearLabel,
  taxYearOf,
  type Region,
} from '@/domain/regions';
import { toLocalIsoDate, tripCostsMinor, type Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useTripList } from '@/hooks/use-trip-list';
import { useYearMoney } from '@/hooks/use-year-money';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import { useVehicles } from '@/vehicles/use-vehicles';

/** A month or tax year in the breakdown: business distance and its value. */
type Line = { key: string; label: string; meters: number; valueMinor: number };

/**
 * Money: the tax year month by month and the years before it, the plan, and
 * the screens for claiming (reports, the tax dates, relief, milestones).
 */
export default function MoneyScreen() {
  const list = useTripList();
  const { trips, visible, deductions, places, locked } = list;
  const money = useYearMoney(visible, deductions, places);
  const { isPro } = usePro();
  const garage = useVehicles();
  const { region } = useRegion();
  const theme = useTheme();
  const t = useT();

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const { summary, taxYear, relief } = money;
  const months = monthLines(visible, deductions, region, taxYear);
  const years = earlierYears(visible, deductions, region, taxYear, money.employee);
  const unsortedCount = trips.filter((trip) => trip.classification === 'unclassified').length;
  // UK employees whose employer pays the full rate have no money to show: their distance is what counts.
  const distanceOnly = relief !== null && !relief.paysLess;
  const headline = distanceOnly ? formatDistance(summary.businessMeters, region) : formatMoney(money.yearTotal, region);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            {relief?.paysLess
              ? t('Mileage Allowance Relief to claim, {{year}} tax year', { year: summary.label })
              : t('{{year}} tax year', { year: summary.label })}
          </ThemedText>
          <ThemedText style={[styles.total, { color: theme.accent }]} adjustsFontSizeToFit numberOfLines={1}>
            {headline}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {summary.unclassifiedCount > 0
              ? t('{{distance}} business · {{count}} to review', {
                  distance: formatDistance(summary.businessMeters, region),
                  count: summary.unclassifiedCount,
                })
              : t('{{distance}} business', { distance: formatDistance(summary.businessMeters, region) })}
          </ThemedText>
        </ThemedView>
        {money.nudge && <ReliefNudge nudge={money.nudge} />}

        {/* Employees' relief is worked out for the whole year, so their months show distance only. */}
        <ThemedText type="smallBold">{t('By month')}</ThemedText>
        <Breakdown lines={months} region={region} distanceOnly={relief !== null} />

        {years.length > 0 && (
          <>
            <ThemedText type="smallBold">{t('Earlier tax years')}</ThemedText>
            <Breakdown lines={years} region={region} distanceOnly={relief !== null} />
          </>
        )}

        <TaxCountdown
          foundMinor={money.yearTotal}
          unsortedCount={unsortedCount}
          // Home lists the drives to sort: there, they're all picked to sort at once.
          onSortUnsorted={() => router.navigate({ pathname: '/', params: { sort: 'unsorted' } })}
        />
        {!isPro && <PlanCard trips={trips} locked={locked} />}
        {/* Australia: past 5,000 km in a car, the logbook method usually claims more. */}
        <LogbookNudge trips={visible} vehicles={garage.vehicles} />

        <ThemedView type="backgroundElement" style={styles.links}>
          <LinkRow
            icon="star.fill"
            glyph="⭐"
            title={isPro ? 'MileSprout Pro' : t('Go Pro')}
            detail={isPro ? t('Active · thank you!') : t('Unlimited drives, PDF reports and accounting exports')}
            highlight={!isPro}
            onPress={() => router.push('/pro')}
          />
          <LinkRow
            icon="doc.text.fill"
            glyph="📄"
            title={t('Reports & export')}
            detail={t('Your mileage log for {{authority}}', { authority: region.authority })}
            onPress={() => router.push('/report')}
          />
          {region.code === 'AU' && (
            <LinkRow
              icon="book.closed.fill"
              glyph="📒"
              title={t('ATO logbook')}
              detail={t('The logbook method')}
              onPress={() => router.push('/logbook' as Href)}
            />
          )}
          {/* UK employees: Mileage Allowance Relief and the P87. */}
          {region.code === 'GB' && (
            <LinkRow
              icon="sterlingsign.circle.fill"
              glyph="💷"
              title={t('Claim mileage relief')}
              detail={t('For employees: P87 or Self Assessment')}
              onPress={() => router.push('/claim-relief' as Href)}
            />
          )}
          <LinkRow
            icon="trophy.fill"
            glyph="🏆"
            title={t('Milestones')}
            detail={t('Your money back and badges')}
            onPress={() => router.push('/milestones')}
          />
          <LinkRow
            icon="chart.bar.fill"
            glyph="📊"
            title={t('Missed miles check')}
            detail={t('Compare with your delivery app')}
            onPress={() => router.push('/compare')}
          />
          <LinkRow
            icon="calendar"
            glyph="🗓️"
            title={t('Tax dates')}
            detail={t('When and how to claim with {{authority}}', { authority: region.authority })}
            onPress={() => router.push('/tax-dates')}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

/** Rows of distance and value, in a card. */
function Breakdown({ lines, region, distanceOnly }: { lines: readonly Line[]; region: Region; distanceOnly: boolean }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.breakdown}>
      {lines.map((line, index) => (
        <View
          key={line.key}
          style={[
            styles.line,
            index > 0 && { borderTopColor: theme.backgroundSelected, borderTopWidth: StyleSheet.hairlineWidth },
          ]}>
          <ThemedText type="small" style={styles.lineLabel} numberOfLines={1}>
            {line.label}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatDistance(line.meters, region)}
          </ThemedText>
          {!distanceOnly && (
            <ThemedText type="smallBold" style={styles.lineValue}>
              {formatMoney(line.valueMinor, region)}
            </ThemedText>
          )}
        </View>
      ))}
    </ThemedView>
  );
}

/** This tax year's months so far, newest first: business distance and value (parking and tolls where they're added). */
function monthLines(
  visible: readonly Trip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  taxYear: number,
): Line[] {
  const { start, end } = taxYearBounds(taxYear, region);
  const today = toLocalIsoDate(new Date());
  const last = (today < end ? today : end).slice(0, 7);
  // Employees' breakdown shows distance only, so their costs never reach here.
  const withCosts = costsAdded(region);
  const lines = new Map<string, Line>();
  for (let [year, month] = start.slice(0, 7).split('-').map(Number); ; month++) {
    if (month > 12) [year, month] = [year + 1, 1];
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (key > last) break;
    // "octubre de 2026" → "Octubre de 2026": only the first letter, as a heading.
    const name = new Date(year, month - 1, 1).toLocaleDateString(displayLocale(region), {
      month: 'long',
      year: 'numeric',
    });
    const label = name.charAt(0).toLocaleUpperCase() + name.slice(1);
    lines.set(key, { key, label, meters: 0, valueMinor: 0 });
  }
  for (const trip of visible) {
    if (trip.classification !== 'business' || taxYearOf(trip.localDate, region) !== taxYear) continue;
    const line = lines.get(trip.localDate.slice(0, 7));
    if (!line) continue;
    line.meters += trip.distanceMeters;
    line.valueMinor += (deductions.get(trip.id) ?? 0) + (withCosts ? tripCostsMinor(trip) : 0);
  }
  return [...lines.values()].reverse();
}

/** Every earlier tax year with drives, newest first. */
function earlierYears(
  visible: readonly Trip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  taxYear: number,
  employee: boolean,
): Line[] {
  const years = [...new Set(visible.map((trip) => taxYearOf(trip.localDate, region)))]
    .filter((year) => year < taxYear)
    .sort((a, b) => b - a);
  return years.map((year) => {
    const summary = summarizeTaxYear(visible, region, year, deductions, { employee });
    return { key: String(year), label: taxYearLabel(year, region), meters: summary.businessMeters, valueMinor: summary.total };
  });
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  total: { fontSize: 36, lineHeight: 44, fontWeight: '800', fontVariant: ['tabular-nums'] },
  breakdown: { borderRadius: 12, paddingHorizontal: Spacing.three },
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two + 2 },
  lineLabel: { flex: 1 },
  lineValue: { minWidth: 80, textAlign: 'right', fontVariant: ['tabular-nums'] },
  links: { borderRadius: 16, padding: Spacing.one },
});
