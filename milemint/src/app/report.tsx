import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getOdometer, saveOdometer, type OdometerReadings } from '@/db/odometer-repo';
import { listEditedTripIds } from '@/db/trips-repo';
import { listAllVehicles } from '@/db/vehicles-repo';
import type { Vehicle } from '@/domain/vehicles';
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [year, setYear] = useState(() => String(currentTaxYear(region)));
  const [busy, setBusy] = useState<'csv' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEditedTripIds(db).then(setEditedIds, () => setEditedIds(new Set()));
    listAllVehicles(db).then(setVehicles, () => {});
  }, [db]);

  // Readings for the chosen country and tax year, tagged so a stale load never shows for another year.
  const odometerKey = `${region.code}-${year}`;
  const [loadedOdometer, setLoadedOdometer] = useState<{ key: string; readings: OdometerReadings } | null>(null);
  useEffect(() => {
    const empty = { start: null, end: null };
    getOdometer(db, region.code, Number(year)).then(
      (readings) => setLoadedOdometer({ key: odometerKey, readings }),
      () => setLoadedOdometer({ key: odometerKey, readings: empty }),
    );
  }, [db, region.code, year, odometerKey]);
  const odometer = loadedOdometer?.key === odometerKey ? loadedOdometer.readings : null;

  const years = useMemo(() => {
    const withTrips = reportYears(trips ?? [], region);
    const current = currentTaxYear(region);
    return (withTrips.includes(current) ? withTrips : [current, ...withTrips]).slice(0, YEARS_SHOWN);
  }, [trips, region]);

  // Drives over the free limit stay out until they're unlocked, as on the home screen.
  const report = useMemo(() => {
    const locked = lockedTripIds(trips ?? [], isPro);
    const visible = (trips ?? []).filter((trip) => !locked.has(trip.id));
    return buildReport(visible, region, Number(year), {
      places,
      editedIds,
      odometer: odometer ?? undefined,
      vehicles,
    });
  }, [trips, isPro, region, year, places, editedIds, odometer, vehicles]);

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

        {odometer && (
          <OdometerCard
            key={odometerKey}
            readings={odometer}
            report={report}
            onSave={async (readings) => {
              await saveOdometer(db, region.code, Number(year), readings);
              setLoadedOdometer({ key: odometerKey, readings });
            }}
          />
        )}

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

/** Start and end of tax-year odometer readings, for total distance driven and the business-use share. */
function OdometerCard({
  readings,
  report,
  onSave,
}: {
  readings: OdometerReadings;
  report: ReturnType<typeof buildReport>;
  onSave: (readings: OdometerReadings) => Promise<void>;
}) {
  const theme = useTheme();
  const { region } = useRegion();
  const show = (value: number | null) => (value === null ? '' : String(value));
  const [start, setStart] = useState(show(readings.start));
  const [end, setEnd] = useState(show(readings.end));
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  const parse = (text: string): number | null | undefined => {
    const trimmed = text.trim().replace(/,/g, '');
    if (!trimmed) return null;
    return /^\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : undefined;
  };
  const save = async () => {
    const s = parse(start);
    const e = parse(end);
    if (s === undefined || e === undefined) {
      return setMessage({ error: true, text: 'Enter odometer readings as numbers, e.g. 48210.' });
    }
    if (s !== null && e !== null && e < s) {
      return setMessage({ error: true, text: 'The end reading must be higher than the start reading.' });
    }
    await onSave({ start: s, end: e });
    setMessage({ error: false, text: 'Saved. The PDF report includes these readings.' });
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.background }];
  const unit = region.unit;
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">Odometer readings</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {region.report.askForOdometer
          ? 'CRA needs your total distance driven to work out your business-use share.'
          : 'Optional. Shows your total driving and the business share on the report.'}
      </ThemedText>
      <View style={styles.odoRow}>
        <View style={styles.odoField}>
          <ThemedText type="small" themeColor="textSecondary">
            Start of {report.label}
          </ThemedText>
          <TextInput
            accessibilityLabel={`Odometer at the start of ${report.label}, in ${unit}`}
            style={inputStyle}
            value={start}
            onChangeText={(text) => {
              setMessage(null);
              setStart(text);
            }}
            placeholder={unit}
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.odoField}>
          <ThemedText type="small" themeColor="textSecondary">
            End of {report.label}
          </ThemedText>
          <TextInput
            accessibilityLabel={`Odometer at the end of ${report.label}, in ${unit}`}
            style={inputStyle}
            value={end}
            onChangeText={(text) => {
              setMessage(null);
              setEnd(text);
            }}
            placeholder={unit}
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
      {report.drivenDistance !== null && report.drivenDistance > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {formatDistance(fromUnits(report.drivenDistance, region), region)} driven ·{' '}
          {Math.round((report.businessDistance / report.drivenDistance) * 100)}% business
        </ThemedText>
      )}
      {message && (
        <ThemedText
          type="small"
          themeColor={message.error ? 'danger' : 'textSecondary'}
          accessibilityRole={message.error ? 'alert' : undefined}>
          {message.text}
        </ThemedText>
      )}
      <Pressable accessibilityRole="button" onPress={save} hitSlop={8} style={styles.odoSave}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Save readings
        </ThemedText>
      </Pressable>
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
  odoRow: { flexDirection: 'row', gap: Spacing.two },
  odoField: { flex: 1, gap: Spacing.one },
  odoSave: { alignSelf: 'flex-start' },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  outline: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, borderWidth: 1 },
  filled: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
