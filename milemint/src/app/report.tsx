import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listEditedTripIds } from '@/db/trips-repo';
import { useTrips } from '@/db/use-trips';
import { lockedTripIds } from '@/domain/plan';
import { buildReport, reportYears } from '@/domain/report';
import { currentTaxYear, formatDistance, formatMoney, fromUnits, taxYearLabel } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import { PDF_AVAILABLE, shareCsv, sharePdf } from '@/reports/export';

/** How many years to offer at once; older logs are rarely needed and still in the CSV of that year. */
const YEARS_SHOWN = 3;

export default function ReportScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { isPro } = usePro();
  const { region } = useRegion();
  const { trips, places } = useTrips();
  const [editedIds, setEditedIds] = useState<Set<string>>(new Set());
  const [year, setYear] = useState(() => String(currentTaxYear(region)));
  const [busy, setBusy] = useState<'csv' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEditedTripIds(db).then(setEditedIds, () => setEditedIds(new Set()));
  }, [db]);

  const years = useMemo(() => {
    const withTrips = reportYears(trips ?? [], region);
    const current = currentTaxYear(region);
    return (withTrips.includes(current) ? withTrips : [current, ...withTrips]).slice(0, YEARS_SHOWN);
  }, [trips, region]);

  // Drives over the free limit stay out until they're unlocked, as on the home screen.
  const report = useMemo(() => {
    const locked = lockedTripIds(trips ?? [], isPro);
    const visible = (trips ?? []).filter((trip) => !locked.has(trip.id));
    return buildReport(visible, region, Number(year), { places, editedIds });
  }, [trips, isPro, region, year, places, editedIds]);

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const run = async (kind: 'csv' | 'pdf') => {
    setError(null);
    setBusy(kind);
    try {
      await (kind === 'csv' ? shareCsv(report) : sharePdf(report));
    } catch {
      setError('Couldn’t create the file. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const empty = report.rows.length === 0;
  const units = region.unit === 'mi' ? 'miles' : 'km';
  const distance = (value: number) => formatDistance(fromUnits(value, region), region);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {years.length > 1 && (
          <Segmented
            options={years.map((y) => ({ value: String(y), label: taxYearLabel(y, region) }))}
            value={year}
            onChange={setYear}
          />
        )}

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            {report.label.length > 4 ? `${report.label} tax year` : report.label} at {region.authority} rates
          </ThemedText>
          <ThemedText type="title">{formatMoney(report.deduction, region)}</ThemedText>
          <View style={styles.lines}>
            <Line label={`Business ${units}`} value={distance(report.businessDistance)} />
            <Line label={`Commuting ${units}`} value={distance(report.commutingDistance)} />
            <Line label={`Other personal ${units}`} value={distance(report.otherDistance)} />
            <Line label={`Total ${units}`} value={distance(report.totalDistance)} bold />
          </View>
          {region.caveat && (
            <ThemedText type="small" themeColor="textSecondary">
              {region.caveat}
            </ThemedText>
          )}
          {report.unclassifiedCount > 0 && (
            <ThemedText type="small" themeColor="danger">
              {report.unclassifiedCount} trip{report.unclassifiedCount === 1 ? ' isn’t' : 's aren’t'} classified yet.
              Sort {report.unclassifiedCount === 1 ? 'it' : 'them'} first so the report is complete.
            </ThemedText>
          )}
        </ThemedView>

        {error && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        )}

        <View style={styles.option}>
          <ThemedText type="smallBold">Mileage log (CSV)</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Every trip with date, places, {units === 'km' ? 'kilometres' : 'miles'}, purpose and deduction. Opens in Excel, Numbers or Google
            Sheets. Always free: it’s your data.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            disabled={empty || busy !== null}
            onPress={() => run('csv')}
            style={[styles.outline, { borderColor: theme.accent, opacity: empty || busy ? 0.5 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {busy === 'csv' ? 'Preparing…' : 'Export CSV'}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.option}>
          <ThemedText type="smallBold">{region.authority} mileage report (PDF) · Pro</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            A ready-to-file report for you or your accountant: your{' '}
            {region.code === 'US' ? 'Schedule C Part IV' : 'mileage'} totals, the deduction at each{' '}
            {region.authority} rate, and the full trip log showing which trips were recorded while
            driving and which were edited.
          </ThemedText>
          {!PDF_AVAILABLE ? (
            <ThemedText type="small" themeColor="textSecondary">
              PDF reports are created on iPhone.
            </ThemedText>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={empty || busy !== null}
              onPress={() => (isPro ? run('pdf') : router.push('/pro'))}
              style={[styles.filled, { backgroundColor: theme.accent, opacity: empty || busy ? 0.5 : 1 }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {busy === 'pdf' ? 'Preparing…' : isPro ? 'Create PDF report' : 'Unlock with Pro'}
              </ThemedText>
            </Pressable>
          )}
        </View>

        {empty && (
          <ThemedText type="small" themeColor="textSecondary">
            No trips in {taxYearLabel(Number(year), region)} yet.
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          Files are shared straight from your iPhone. MileMint never uploads them. Deductions are estimates,
          not tax advice.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.line}>
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
    gap: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 16, padding: Spacing.four, gap: Spacing.two },
  lines: { gap: Spacing.one, marginTop: Spacing.one },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  option: { gap: Spacing.two },
  outline: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, borderWidth: 1 },
  filled: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
