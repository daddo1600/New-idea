import { router, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getCarExpenses, listLogbooks } from '@/db/logbooks-repo';
import { getOdometer, saveOdometer, type OdometerReadings } from '@/db/odometer-repo';
import { loadSettings, saveSettings } from '@/db/settings-repo';
import { listEditedTripIds } from '@/db/trips-repo';
import { listAllVehicles } from '@/db/vehicles-repo';
import type { Vehicle } from '@/domain/vehicles';
import { useTrips } from '@/db/use-trips';
import { lockedTripIds } from '@/domain/plan';
import { EXPORT_FORMATS, PRO_FORMATS, type ExportFormat } from '@/domain/accounting-export';
import { logbooksForReport, summarizeLogbook, type CarExpenses, type Logbook } from '@/domain/logbook';
import { buildReport, reportYears } from '@/domain/report';
import { currentTaxYear, formatDistance, formatMoney, fromUnits, taxYearLabel } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import { PDF_AVAILABLE, shareCsv, shareLogbookCsv, sharePdf } from '@/reports/export';

const FORMAT_LABELS: Record<ExportFormat, string> = {
  spreadsheet: msg('Spreadsheet'),
  xero: 'Xero',
  quickbooks: 'QuickBooks',
  freeagent: 'FreeAgent',
  'expense-claim': msg('Expense claim'),
};

const FORMAT_NOTES: Record<Exclude<ExportFormat, 'spreadsheet'>, string> = {
  xero: msg(
    'A manual journal for each month of business mileage, ready to import in Xero (Accounting › Manual journals › Import). Check the account codes match your chart of accounts.',
  ),
  quickbooks: msg(
    'A journal entry for each month of business mileage, ready to import in QuickBooks Online (Settings › Import data › Journal entries). Check the account names match yours.',
  ),
  freeagent: msg(
    'Your business trips with date, description, distance and vehicle: everything FreeAgent’s mileage form asks for.',
  ),
  'expense-claim': msg(
    'A claim line for every business trip (date, from, to, purpose, distance, rate and amount) for your employer’s expense system.',
  ),
};

/** How many years to offer at once; older logs are rarely needed and still in the CSV of that year. */
const YEARS_SHOWN = 3;

export default function ReportScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { isPro } = usePro();
  const { region } = useRegion();
  const { trips, places } = useTrips();
  const [editedIds, setEditedIds] = useState<Set<string>>(new Set());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [year, setYear] = useState(() => String(currentTaxYear(region)));
  const [busy, setBusy] = useState<'csv' | 'pdf' | 'logbook' | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<ExportFormat>('spreadsheet');
  useEffect(() => {
    loadSettings(db).then((settings) => setFormat(settings.exportFormat), () => {});
  }, [db]);
  const chooseFormat = (next: ExportFormat) => {
    setFormat(next);
    loadSettings(db)
      .then((settings) => saveSettings(db, { ...settings, exportFormat: next }))
      .catch(() => {});
  };

  useEffect(() => {
    listEditedTripIds(db).then(setEditedIds, () => setEditedIds(new Set()));
    listAllVehicles(db).then(setVehicles, () => {});
  }, [db]);

  // Australia: ATO logbooks, summarised in the PDF and exported on their own.
  const australia = region.code === 'AU';
  useEffect(() => {
    if (australia) listLogbooks(db).then(setLogbooks, () => {});
  }, [db, australia]);

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
  const visible = useMemo(() => {
    const locked = lockedTripIds(trips ?? [], isPro);
    return (trips ?? []).filter((trip) => !locked.has(trip.id));
  }, [trips, isPro]);
  const today = toLocalIsoDate(new Date());
  const yearLogbooks = useMemo(
    () =>
      australia
        ? logbooksForReport(
            logbooks.map((logbook) => summarizeLogbook(logbook, visible, today)),
            Number(year),
          )
        : [],
    [australia, logbooks, visible, today, year],
  );

  // Each logbook car's running costs for the year, tagged like the odometer readings.
  const expensesKey = `${year}:${yearLogbooks.map((s) => s.logbook.vehicleId).join(',')}`;
  const [loadedExpenses, setLoadedExpenses] = useState<{ key: string; byCar: Map<string, CarExpenses | null> } | null>(
    null,
  );
  useEffect(() => {
    const [taxYear, ids] = expensesKey.split(':');
    const cars = ids ? ids.split(',') : [];
    Promise.all(cars.map((id) => getCarExpenses(db, id, Number(taxYear)).catch(() => null))).then((all) =>
      setLoadedExpenses({ key: expensesKey, byCar: new Map(cars.map((id, i) => [id, all[i]])) }),
    );
  }, [db, expensesKey]);
  const expenses = loadedExpenses?.key === expensesKey ? loadedExpenses.byCar : null;

  const report = useMemo(
    () =>
      buildReport(visible, region, Number(year), {
        places,
        editedIds,
        odometer: odometer ?? undefined,
        vehicles,
        logbooks: yearLogbooks.map((summary) => ({
          summary,
          expenses: expenses?.get(summary.logbook.vehicleId) ?? null,
        })),
      }),
    [visible, region, year, places, editedIds, odometer, vehicles, yearLogbooks, expenses],
  );

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const run = async (kind: 'csv' | 'pdf') => {
    setError(null);
    setBusy(kind);
    try {
      await (kind === 'csv' ? shareCsv(report, format) : sharePdf(report));
      // A milestone: celebrated next time the home screen shows.
      saveSettings(db, { ...(await loadSettings(db)), exportedReport: true }).catch(() => {});
    } catch {
      setError(msg('Couldn’t create the file. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const empty = report.rows.length === 0;
  const miles = region.unit === 'mi';
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
            {report.label.length > 4
              ? t('{{year}} tax year at {{authority}} rates', { year: report.label, authority: region.authority })
              : t('{{year}} at {{authority}} rates', { year: report.label, authority: region.authority })}
          </ThemedText>
          <ThemedText type="title">{formatMoney(report.deduction, region)}</ThemedText>
          <View style={styles.lines}>
            <Line label={miles ? t('Business miles') : t('Business km')} value={distance(report.businessDistance)} />
            <Line label={miles ? t('Commuting miles') : t('Commuting km')} value={distance(report.commutingDistance)} />
            <Line
              label={miles ? t('Other personal miles') : t('Other personal km')}
              value={distance(report.otherDistance)}
            />
            <Line label={miles ? t('Total miles') : t('Total km')} value={distance(report.totalDistance)} bold />
          </View>
          {region.caveat && (
            <ThemedText type="small" themeColor="textSecondary">
              {t(region.caveat)}
            </ThemedText>
          )}
          {report.unclassifiedCount > 0 && (
            <ThemedText type="small" themeColor="danger">
              {t('{{count}} trips aren’t classified yet. Sort them first so the report is complete.', {
                count: report.unclassifiedCount,
              })}
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
            {t(error)}
          </ThemedText>
        )}

        <View style={styles.option}>
          <ThemedText type="smallBold">{t('Export your mileage')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Where is it going?')}
          </ThemedText>
          <View style={styles.formats} accessibilityRole="radiogroup">
            {EXPORT_FORMATS.map((option) => {
              const selected = option === format;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => chooseFormat(option)}
                  style={[
                    styles.format,
                    selected
                      ? { backgroundColor: theme.accent, borderColor: theme.accent }
                      : { borderColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText type="smallBold" style={{ color: selected ? theme.onAccent : theme.text }}>
                    {t(FORMAT_LABELS[option])}
                    {PRO_FORMATS.has(option) && !isPro ? ' · Pro' : ''}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {format === 'spreadsheet'
              ? miles
                ? t(
                    'Every trip with date, places, miles, purpose and deduction. Opens in Excel, Numbers or Google Sheets. Always free: it’s your data.',
                  )
                : t(
                    'Every trip with date, places, kilometres, purpose and deduction. Opens in Excel, Numbers or Google Sheets. Always free: it’s your data.',
                  )
              : t(FORMAT_NOTES[format])}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            disabled={empty || busy !== null}
            onPress={() => (PRO_FORMATS.has(format) && !isPro ? router.push('/pro') : run('csv'))}
            style={[styles.outline, { borderColor: theme.accent, opacity: empty || busy ? 0.5 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {busy === 'csv'
                ? t('Preparing…')
                : PRO_FORMATS.has(format) && !isPro
                  ? t('Unlock with Pro')
                  : t('Export')}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.option}>
          <ThemedText type="smallBold">
            {t('{{authority}} mileage report (PDF) · Pro', { authority: region.authority })}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {region.code === 'US'
              ? t(
                  'A ready-to-file report for you or your accountant: your Schedule C Part IV totals, the deduction at each {{authority}} rate, and the full trip log showing which trips were recorded while driving and which were edited.',
                  { authority: region.authority },
                )
              : t(
                  'A ready-to-file report for you or your accountant: your mileage totals, the deduction at each {{authority}} rate, and the full trip log showing which trips were recorded while driving and which were edited.',
                  { authority: region.authority },
                )}
          </ThemedText>
          {!PDF_AVAILABLE ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('PDF reports are created on iPhone.')}
            </ThemedText>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={empty || busy !== null}
              onPress={() => (isPro ? run('pdf') : router.push('/pro'))}
              style={[styles.filled, { backgroundColor: theme.accent, opacity: empty || busy ? 0.5 : 1 }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {busy === 'pdf' ? t('Preparing…') : isPro ? t('Create PDF report') : t('Unlock with Pro')}
              </ThemedText>
            </Pressable>
          )}
        </View>

        {australia && (
          <View style={styles.option}>
            <ThemedText type="smallBold">{t('ATO logbook (CSV)')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {report.logbooks.length > 0
                ? t(
                    'Your 12-week logbook with everything the ATO asks for: the period, odometer readings, total and business km, each business journey with its reason, and the business-use percentage. The PDF report includes a summary.',
                  )
                : t('Driving more than 5,000 business km in a car? A 12-week logbook could claim more than cents per km.')}
            </ThemedText>
            {report.logbooks.map((entry) => (
              <Pressable
                key={entry.summary.logbook.id}
                accessibilityRole="button"
                disabled={busy !== null}
                onPress={async () => {
                  setError(null);
                  setBusy('logbook');
                  try {
                    await shareLogbookCsv(entry.summary, entry.vehicle);
                  } catch {
                    setError(msg('Couldn’t create the file. Please try again.'));
                  } finally {
                    setBusy(null);
                  }
                }}
                style={[styles.outline, { borderColor: theme.accent, opacity: busy ? 0.5 : 1 }]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {busy === 'logbook' ? t('Preparing…') : t('Export logbook: {{vehicle}}', { vehicle: entry.vehicle })}
                </ThemedText>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/logbook' as Href)}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {report.logbooks.length > 0 ? t('Open the ATO logbook') : t('Start a 12-week logbook')}
              </ThemedText>
            </Pressable>
          </View>
        )}

        {empty && (
          <ThemedText type="small" themeColor="textSecondary">
            {t('No trips in {{year}} yet.', { year: taxYearLabel(Number(year), region) })}
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          {t('Files are shared straight from your iPhone. MileMint never uploads them. Deductions are estimates, not tax advice.')}
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
  const t = useT();
  const { region } = useRegion();
  const show = (value: number | null) => (value === null ? '' : String(value));
  const [start, setStart] = useState(show(readings.start));
  const [end, setEnd] = useState(show(readings.end));
  // `text` is English, marked with msg() and shown with t().
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
      return setMessage({ error: true, text: msg('Enter odometer readings as numbers, e.g. 48210.') });
    }
    if (s !== null && e !== null && e < s) {
      return setMessage({ error: true, text: msg('The end reading must be higher than the start reading.') });
    }
    await onSave({ start: s, end: e });
    setMessage({ error: false, text: msg('Saved. The PDF report includes these readings.') });
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.background }];
  const unit = region.unit;
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{t('Odometer readings')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {region.report.askForOdometer
          ? t('CRA needs your total distance driven to work out your business-use share.')
          : t('Optional. Shows your total driving and the business share on the report.')}
      </ThemedText>
      <View style={styles.odoRow}>
        <View style={styles.odoField}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Start of {{year}}', { year: report.label })}
          </ThemedText>
          <TextInput
            accessibilityLabel={t('Odometer at the start of {{year}}, in {{unit}}', { year: report.label, unit })}
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
            {t('End of {{year}}', { year: report.label })}
          </ThemedText>
          <TextInput
            accessibilityLabel={t('Odometer at the end of {{year}}, in {{unit}}', { year: report.label, unit })}
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
          {t('{{distance}} driven · {{percent}}% business', {
            distance: formatDistance(fromUnits(report.drivenDistance, region), region),
            percent: Math.round((report.businessDistance / report.drivenDistance) * 100),
          })}
        </ThemedText>
      )}
      {message && (
        <ThemedText
          type="small"
          themeColor={message.error ? 'danger' : 'textSecondary'}
          accessibilityRole={message.error ? 'alert' : undefined}>
          {t(message.text)}
        </ThemedText>
      )}
      <Pressable accessibilityRole="button" onPress={save} hitSlop={8} style={styles.odoSave}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Save readings')}
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
  formats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  format: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  odoRow: { flexDirection: 'row', gap: Spacing.two },
  odoField: { flex: 1, gap: Spacing.one },
  odoSave: { alignSelf: 'flex-start' },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  outline: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, borderWidth: 1 },
  filled: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
