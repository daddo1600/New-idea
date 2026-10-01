import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { CalendarPicker } from '@/components/calendar-picker';
import { GaragePicker } from '@/components/garage-picker';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  closeLogbookEarly,
  deleteLogbook,
  getCarExpenses,
  listLogbooks,
  saveCarExpenses,
  saveLogbookOdometer,
  startLogbook,
} from '@/db/logbooks-repo';
import { useTrips } from '@/db/use-trips';
import {
  addDays,
  centsPerKmForVehicle,
  compareMethods,
  CENTS_PER_KM_LIMIT_KM,
  EXPENSE_CATEGORIES,
  EXPENSE_LABELS,
  LOGBOOK_DAYS,
  LOGBOOK_WEEKS,
  logbookDeduction,
  logbookForYear,
  plannedEndDate,
  summarizeLogbook,
  validTaxYears,
  type CarExpenses,
  type ExpenseCategory,
  type Logbook,
  type LogbookSummary,
} from '@/domain/logbook';
import { parseNumber, parseOdometer } from '@/domain/parse-number';
import { lockedTripIds } from '@/domain/plan';
import {
  currentTaxYear,
  displayLocale,
  formatDistance,
  formatLongDate,
  formatMoney,
  taxYearLabel,
  taxYearOf,
} from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { vehicleLabel, type Vehicle } from '@/domain/vehicles';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useAllowance } from '@/referral/referral';
import { useRegion } from '@/region/region';
import { shareLogbookCsv } from '@/reports/export';
import { useVehicles } from '@/vehicles/use-vehicles';

/**
 * The ATO logbook method (Australia only): keep a 12-week logbook for a car,
 * see its business-use percentage build up, and compare what the logbook
 * method and the cents per km method would give.
 */
export default function LogbookScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const { isPro } = usePro();
  const allowance = useAllowance();
  const { trips } = useTrips();
  const garage = useVehicles();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[] | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => listLogbooks(db).then(setLogbooks, () => setLogbooks([])), [db]);
  useEffect(() => {
    reload();
  }, [reload]);

  const today = toLocalIsoDate(new Date());
  const taxYear = currentTaxYear(region);
  const cars = garage.vehicles.filter((vehicle) => vehicle.type === 'car');
  const car =
    cars.find((vehicle) => vehicle.id === chosenId) ??
    cars.find((vehicle) => vehicle.id === garage.current?.id) ??
    cars[0] ??
    null;

  // Drives over the free limit stay out until they're unlocked, as in reports.
  const visible = useMemo(() => {
    const locked = lockedTripIds(trips ?? [], isPro, allowance);
    return (trips ?? []).filter((trip) => !locked.has(trip.id));
  }, [trips, isPro, allowance]);
  const summaries = useMemo(
    () => (logbooks ?? []).map((logbook) => summarizeLogbook(logbook, visible, today)),
    [logbooks, visible, today],
  );

  if (region.code !== 'AU') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('The logbook method is for Australian tax returns. Change your country in Settings to use it.')}
          </ThemedText>
        </ScrollView>
      </ThemedView>
    );
  }
  if (!trips || !logbooks) return <ActivityIndicator style={styles.loading} />;

  // Newest first (the list is sorted by start date).
  const current = car ? (summaries.find((s) => s.logbook.vehicleId === car.id) ?? null) : null;
  const showStart = car !== null && (starting || current === null);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <BrandGradient />
          <View style={styles.heroLeaf} pointerEvents="none">
            <LeafMark size={150} opacity={0.2} />
          </View>
          <Text style={styles.heroTitle}>{t('The logbook method')}</Text>
          <Text style={styles.heroBody}>
            {t(
              'Keep a logbook for 12 weeks in a row. It gives your car’s business-use percentage, and you claim that share of what the car cost to run. One logbook lasts 5 years.',
            )}
          </Text>
          <Text style={styles.heroBody}>
            {t('The cents per km method stops at {{limit}} km per car a year. If you drive more for work, a logbook usually claims more.', {
              limit: new Intl.NumberFormat(region.locale).format(CENTS_PER_KM_LIMIT_KM),
            })}
          </Text>
        </View>

        {cars.length === 0 && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('The logbook method is for cars. Add your car in Settings first.')}
            </ThemedText>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/settings')}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {t('Open Settings')}
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {cars.length > 1 && car && (
          <GaragePicker
            vehicles={cars}
            value={car.id}
            onChange={(vehicle) => {
              setStarting(false);
              setChosenId(vehicle.id);
            }}
          />
        )}

        {error && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {t(error)}
          </ThemedText>
        )}

        {car && showStart && (
          <StartCard
            key={car.id}
            car={car}
            today={today}
            canCancel={current !== null}
            onCancel={() => setStarting(false)}
            onStart={async (startDate, odometerStart) => {
              setError(null);
              try {
                await startLogbook(db, { vehicleId: car.id, startDate, odometerStart });
                setStarting(false);
                await reload();
              } catch {
                setError(msg('Could not save. Please try again.'));
              }
            }}
          />
        )}

        {car && current && !showStart && (
          <ProgressCard
            key={current.logbook.id}
            summary={current}
            car={car}
            today={today}
            onChanged={reload}
            onStartNew={() => setStarting(true)}
          />
        )}

        {car && (
          <EstimateCard
            key={`${car.id}-${taxYear}`}
            car={car}
            taxYear={taxYear}
            businessPercent={
              logbookForYear(summaries, car.id, taxYear)?.businessPercent ??
              // A logbook ended early can't be used, not even as an estimate.
              (current?.status === 'closed-early' ? null : (current?.businessPercent ?? null))
            }
            percentIsFinal={logbookForYear(summaries, car.id, taxYear) !== null}
            centsPerKm={centsPerKmForVehicle(visible, car.id, taxYear, region).deduction}
          />
        )}

        <ThemedText type="small" themeColor="textSecondary">
          {t(
            'Estimates only, not tax advice. Keep receipts for your car expenses, and odometer readings at the start and end of each income year you use the logbook method.',
          )}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

/** Start a 12-week logbook: the first day and the odometer reading that morning. */
function StartCard({
  car,
  today,
  canCancel,
  onCancel,
  onStart,
}: {
  car: Vehicle;
  today: string;
  canCancel: boolean;
  onCancel: () => void;
  onStart: (startDate: string, odometerStart: number | null) => Promise<void>;
}) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [startDate, setStartDate] = useState(today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [odometer, setOdometer] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    const reading = parseOdometer(odometer);
    if (reading === undefined) return setMessage(msg('Enter odometer readings as numbers, e.g. 48210.'));
    setBusy(true);
    await onStart(startDate, reading);
    setBusy(false);
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{t('Start a 12-week logbook for {{vehicle}}', { vehicle: car.name })}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('Pick 12 weeks that are typical of how you use the car through the year. MileMint logs each drive; you add the reason for each work trip.')}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary">
        {t('First day')}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('First day: {{date}}. Change', { date: formatLongDate(startDate, region) })}
        onPress={() => setCalendarOpen((open) => !open)}
        style={[styles.field, { backgroundColor: theme.background }]}>
        <ThemedText>{formatLongDate(startDate, region)}</ThemedText>
      </Pressable>
      {calendarOpen && (
        <CalendarPicker
          value={startDate}
          // Drives already logged can count: a logbook can start up to 12 weeks back.
          min={addDays(today, -(LOGBOOK_DAYS - 1))}
          max={today}
          locale={displayLocale(region)}
          weekStartsOn={1}
          onChange={(picked) => {
            setStartDate(picked);
            setCalendarOpen(false);
          }}
        />
      )}
      <ThemedText type="small" themeColor="textSecondary">
        {t('Ends {{date}}', { date: formatLongDate(plannedEndDate(startDate), region) })}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary">
        {t('Odometer on the first day (km)')}
      </ThemedText>
      <TextInput
        accessibilityLabel={t('Odometer on the first day (km)')}
        style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
        value={odometer}
        onChangeText={(text) => {
          setMessage(null);
          setOdometer(text);
        }}
        placeholder="km"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
      />
      <ThemedText type="small" themeColor="textSecondary">
        {t('The ATO asks for the odometer at the start and end of the logbook. You can add it later.')}
      </ThemedText>
      {message && (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {t(message)}
        </ThemedText>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={start}
        style={[styles.filled, { backgroundColor: theme.accent, opacity: busy ? 0.5 : 1 }]}>
        <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
          {t('Start logbook')}
        </ThemedText>
      </Pressable>
      {canCancel && (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onCancel} style={styles.link}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {t('Cancel')}
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

/** Where the logbook stands: week X of 12, the business-use % so far, readings, export. */
function ProgressCard({
  summary,
  car,
  today,
  onChanged,
  onStartNew,
}: {
  summary: LogbookSummary;
  car: Vehicle;
  today: string;
  onChanged: () => Promise<void>;
  onStartNew: () => void;
}) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const { logbook } = summary;
  const show = (value: number | null) => (value === null ? '' : String(value));
  const [start, setStart] = useState(show(logbook.odometerStart));
  const [end, setEnd] = useState(show(logbook.odometerEnd));
  // `text` is English, marked with msg() and shown with t().
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const km = (value: number) => formatDistance(value * 1000, region);

  const saveReadings = async () => {
    const s = parseOdometer(start);
    const e = parseOdometer(end);
    if (s === undefined || e === undefined) {
      return setMessage({ error: true, text: msg('Enter odometer readings as numbers, e.g. 48210.') });
    }
    if (s !== null && e !== null && e < s) {
      return setMessage({ error: true, text: msg('The end reading must be higher than the start reading.') });
    }
    try {
      await saveLogbookOdometer(db, logbook.id, { start: s, end: e });
      setMessage({ error: false, text: msg('Saved.') });
      await onChanged();
    } catch {
      setMessage({ error: true, text: msg('Could not save. Please try again.') });
    }
  };

  const confirmCloseEarly = () =>
    Alert.alert(
      t('End the logbook early?'),
      t('The ATO needs 12 weeks in a row. A logbook ended early can’t be used for the logbook method, so you’d need to start a new one.'),
      [
        { text: t('Keep going'), style: 'cancel' },
        {
          text: t('End early'),
          style: 'destructive',
          onPress: async () => {
            await closeLogbookEarly(db, logbook.id, today);
            await onChanged();
          },
        },
      ],
    );

  const confirmDelete = () =>
    Alert.alert(t('Delete this logbook?'), t('Your drives stay. Only the logbook period and its odometer readings are deleted.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteLogbook(db, logbook.id);
          await onChanged();
        },
      },
    ]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await shareLogbookCsv(summary, vehicleLabel(car));
    } catch {
      setMessage({ error: true, text: msg('Couldn’t create the file. Please try again.') });
    } finally {
      setExporting(false);
    }
  };

  const { first, last } = validTaxYears(logbook);
  const period = `${formatLongDate(logbook.startDate, region)} – ${formatLongDate(logbook.endDate, region)}`;
  const progress = summary.status === 'complete' ? 1 : summary.daysElapsed / LOGBOOK_DAYS;
  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.background }];

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.line}>
        <ThemedText type="smallBold">
          {summary.status === 'complete'
            ? t('12 weeks complete')
            : summary.status === 'closed-early'
              ? t('Ended early')
              : summary.status === 'not-started'
                ? t('Starts {{date}}', { date: formatLongDate(logbook.startDate, region) })
                : t('Week {{week}} of {{weeks}}', { week: summary.week, weeks: LOGBOOK_WEEKS })}
        </ThemedText>
        {summary.status === 'in-progress' && (
          <ThemedText type="small" themeColor="textSecondary">
            {t('{{count}} days to go', { count: summary.daysLeft })}
          </ThemedText>
        )}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {period}
      </ThemedText>
      <View
        style={[styles.meter, { backgroundColor: theme.backgroundSelected }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: LOGBOOK_DAYS, now: summary.status === 'complete' ? LOGBOOK_DAYS : summary.daysElapsed }}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: summary.status === 'closed-early' ? theme.danger : theme.accent,
            },
          ]}
        />
      </View>

      <ThemedText type="title">
        {summary.businessPercent === null
          ? t('No drives yet')
          : summary.status === 'complete'
            ? t('{{percent}}% business use', { percent: summary.businessPercent })
            : t('{{percent}}% business use so far', { percent: summary.businessPercent })}
      </ThemedText>
      <View style={styles.lines}>
        <Line label={t('Business km')} value={km(summary.businessKm)} />
        <Line
          label={summary.basis === 'odometer' ? t('Total km (odometer)') : t('Total km (logged by MileMint)')}
          value={km(summary.totalKm)}
          bold
        />
        <Line label={t('Business journeys')} value={String(summary.journeys.length)} />
      </View>

      {summary.status === 'closed-early' && (
        <ThemedText type="small" themeColor="danger">
          {t('This logbook ended before 12 weeks, so it can’t be used for the logbook method. Start a new one.')}
        </ThemedText>
      )}
      {summary.basis === 'logged' && summary.businessPercent !== null && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('Worked out from the km MileMint logged. Add both odometer readings so any driving MileMint missed is counted too.')}
        </ThemedText>
      )}
      {summary.readingsInconsistent && (
        <ThemedText type="small" themeColor="danger">
          {t('Your odometer readings show less driving than the business drives logged. Please check them.')}
        </ThemedText>
      )}
      {summary.unclassifiedCount > 0 && (
        <ThemedText type="small" themeColor="danger">
          {t('{{count}} drives in this period aren’t sorted yet. They count as private until you sort them.', {
            count: summary.unclassifiedCount,
          })}
        </ThemedText>
      )}
      {summary.missingReasonCount > 0 && (
        <ThemedText type="small" themeColor="danger">
          {t('{{count}} business drives have no reason yet. The ATO asks for the reason for each journey.', {
            count: summary.missingReasonCount,
          })}
        </ThemedText>
      )}
      {summary.status === 'complete' && summary.basis === 'odometer' && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('Valid for the {{first}} to {{last}} income years, unless your work or your car changes.', {
            first: taxYearLabel(first, region),
            last: taxYearLabel(last, region),
          })}
        </ThemedText>
      )}
      {taxYearOf(logbook.endDate, region) !== first && summary.status !== 'closed-early' && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('These 12 weeks run into the next income year. MileMint counts the logbook as kept in the year it started; check with your tax agent if unsure.')}
        </ThemedText>
      )}

      <ThemedText type="smallBold" style={styles.spaced}>
        {t('Odometer readings')}
      </ThemedText>
      <View style={styles.odoRow}>
        <View style={styles.odoField}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('First day (km)')}
          </ThemedText>
          <TextInput
            accessibilityLabel={t('Odometer on the first day (km)')}
            style={inputStyle}
            value={start}
            onChangeText={(text) => {
              setMessage(null);
              setStart(text);
            }}
            placeholder="km"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.odoField}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Last day (km)')}
          </ThemedText>
          <TextInput
            accessibilityLabel={t('Odometer on the last day (km)')}
            style={inputStyle}
            value={end}
            onChangeText={(text) => {
              setMessage(null);
              setEnd(text);
            }}
            placeholder="km"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
      {summary.status === 'complete' && logbook.odometerEnd === null && (
        <ThemedText type="small" themeColor="danger">
          {t('Add the odometer reading from the last day to finish the logbook.')}
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
      <Pressable accessibilityRole="button" onPress={saveReadings} hitSlop={8} style={styles.link}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Save readings')}
        </ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={exporting}
        onPress={exportCsv}
        style={[styles.outline, { borderColor: theme.accent, opacity: exporting ? 0.5 : 1 }]}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {exporting ? t('Preparing…') : t('Export ATO logbook (CSV)')}
        </ThemedText>
      </Pressable>

      <View style={styles.actions}>
        {summary.status === 'in-progress' && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={confirmCloseEarly}>
            <ThemedText type="small" themeColor="danger">
              {t('End early')}
            </ThemedText>
          </Pressable>
        )}
        {summary.status !== 'in-progress' && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onStartNew}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Start a new logbook')}
            </ThemedText>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" hitSlop={8} onPress={confirmDelete}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Delete')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

/** This year's car costs, and what each method would give for them. */
function EstimateCard({
  car,
  taxYear,
  businessPercent,
  percentIsFinal,
  centsPerKm,
}: {
  car: Vehicle;
  taxYear: number;
  businessPercent: number | null;
  /** From a completed logbook valid this year, rather than one still running. */
  percentIsFinal: boolean;
  centsPerKm: number;
}) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [saved, setSaved] = useState<CarExpenses | null>(null);
  const [draft, setDraft] = useState<Partial<Record<ExpenseCategory, string>> | null>(null);
  // `text` is English, marked with msg() and shown with t().
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  useEffect(() => {
    getCarExpenses(db, car.id, taxYear).then(
      (expenses) => {
        setSaved(expenses);
        const fields: Partial<Record<ExpenseCategory, string>> = {};
        for (const category of EXPENSE_CATEGORIES) {
          const cents = expenses?.[category];
          if (cents) fields[category] = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
        }
        setDraft(fields);
      },
      () => setDraft({}),
    );
  }, [db, car.id, taxYear]);

  if (!draft) return null;

  const save = async () => {
    const expenses: CarExpenses = {};
    for (const category of EXPENSE_CATEGORIES) {
      const value = parseNumber(draft[category] ?? '');
      if (value === undefined) {
        return setMessage({ error: true, text: msg('Enter amounts as numbers, e.g. 2400 or 2,400.50.') });
      }
      if (value !== null && value > 0) expenses[category] = Math.round(value * 100);
    }
    try {
      await saveCarExpenses(db, car.id, taxYear, expenses);
      setSaved(expenses);
      setMessage({ error: false, text: msg('Saved.') });
    } catch {
      setMessage({ error: true, text: msg('Could not save. Please try again.') });
    }
  };

  const estimate = logbookDeduction(saved, businessPercent);
  const comparison = compareMethods(centsPerKm, estimate);
  const year = taxYearLabel(taxYear, region);
  const inputStyle = [styles.input, styles.amount, { color: theme.text, backgroundColor: theme.background }];

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{t('{{vehicle}}’s costs in {{year}}', { vehicle: car.name, year })}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('Optional. Add what the car costs to run this income year (your best estimate is fine for now) to compare the two methods. Keep the receipts.')}
      </ThemedText>
      {EXPENSE_CATEGORIES.map((category) => (
        <View key={category} style={styles.line}>
          <ThemedText type="small" style={styles.flex}>
            {t(EXPENSE_LABELS[category])}
          </ThemedText>
          <TextInput
            accessibilityLabel={t('{{category}} in {{year}}, in dollars', { category: t(EXPENSE_LABELS[category]), year })}
            style={inputStyle}
            value={draft[category] ?? ''}
            onChangeText={(text) => {
              setMessage(null);
              setDraft({ ...draft, [category]: text });
            }}
            placeholder="$"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
      ))}
      {message && (
        <ThemedText
          type="small"
          themeColor={message.error ? 'danger' : 'textSecondary'}
          accessibilityRole={message.error ? 'alert' : undefined}>
          {t(message.text)}
        </ThemedText>
      )}
      <Pressable accessibilityRole="button" onPress={save} hitSlop={8} style={styles.link}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Save costs')}
        </ThemedText>
      </Pressable>

      <View style={styles.lines}>
        <Line
          label={t('Cents per km method (up to {{limit}} km)', {
            limit: new Intl.NumberFormat(region.locale).format(CENTS_PER_KM_LIMIT_KM),
          })}
          value={formatMoney(centsPerKm, region)}
        />
        <Line
          label={
            businessPercent === null
              ? t('Logbook method')
              : percentIsFinal
                ? t('Logbook method ({{percent}}% of costs)', { percent: businessPercent })
                : t('Logbook method ({{percent}}% so far)', { percent: businessPercent })
          }
          value={estimate === null ? '–' : formatMoney(estimate, region)}
          bold
        />
      </View>
      <ThemedText type="small" style={comparison.better === 'logbook' ? { color: theme.accent } : undefined}>
        {comparison.better === 'logbook'
          ? t('The logbook method looks better: about {{amount}} more.', { amount: formatMoney(comparison.difference, region) })
          : comparison.better === 'cents-per-km'
            ? t('Cents per km looks better: about {{amount}} more.', { amount: formatMoney(comparison.difference, region) })
            : comparison.better === 'same'
              ? t('Both methods come out the same.')
              : businessPercent === null
                ? t('Once the logbook has some drives, MileMint compares the two methods here.')
                : t('Add this year’s costs to compare the two methods.')}
      </ThemedText>
      {!percentIsFinal && estimate !== null && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('Based on the logbook so far. You can only use the logbook method once the 12 weeks are complete.')}
        </ThemedText>
      )}
    </ThemedView>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.line}>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? 'text' : 'textSecondary'} style={styles.flex}>
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
  hero: { borderRadius: 20, padding: Spacing.four, gap: Spacing.two, overflow: 'hidden' },
  heroLeaf: { position: 'absolute', right: -30, bottom: -40 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  heroBody: { color: '#D1FAE5', fontSize: 15, lineHeight: 21 },
  card: { borderRadius: 16, padding: Spacing.four, gap: Spacing.two },
  lines: { gap: Spacing.one, marginTop: Spacing.one },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  spaced: { marginTop: Spacing.two },
  field: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  amount: { width: 120, textAlign: 'right' },
  odoRow: { flexDirection: 'row', gap: Spacing.two },
  odoField: { flex: 1, gap: Spacing.one },
  link: { alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', gap: Spacing.four, flexWrap: 'wrap' },
  meter: { height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 },
  outline: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, borderWidth: 1 },
  filled: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, marginTop: Spacing.one },
});
