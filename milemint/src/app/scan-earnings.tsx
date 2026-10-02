import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { CalendarPicker } from '@/components/calendar-picker';
import { platformName } from '@/components/money/platform-earnings-card';
import { Chip } from '@/components/place-field';
import { ProBadge } from '@/components/pro-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { addPlatformEarning, listPlatformEarnings } from '@/db/earnings-repo';
import {
  checkDraft,
  isPlatformId,
  platformChoices,
  weekOfPeriod,
  type PlatformEarning,
  type PlatformId,
} from '@/domain/earnings-scan';
import { parseMoneyMinor, parseNumber } from '@/domain/parse-number';
import { displayLocale, earliestDate, formatDate, fromUnits, toUnits } from '@/domain/regions';
import { addDays, weekStartOf } from '@/domain/set-aside';
import { toLocalIsoDate } from '@/domain/trip';
import { useCanUse } from '@/hooks/use-feature';
import { useMileagePay } from '@/hooks/use-mileage-pay';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

type Params = { scanned?: string; platform?: string; start?: string; end?: string; amount?: string; trips?: string; distance?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** An amount as it's typed back into the box: 30000 → "300", 30050 → "300.50". */
const asInput = (minor: number) => (minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2));

/**
 * Check your earnings: what a screenshot scan read (or nothing, to type it
 * in), every figure editable, then saved as one app's earnings for the days.
 * Days in one week can be added to that week's earnings for the tax
 * set-aside too.
 */
export default function ScanEarningsScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<Params>();
  const { region } = useRegion();
  const theme = useTheme();
  const t = useT();
  const unlocked = useCanUse('platform-earnings');
  const setAsideUnlocked = useCanUse('tax-set-aside');
  const { pay } = useMileagePay();
  const today = toLocalIsoDate(new Date());

  const scanned = params.scanned === '1';
  const number = (value: string | undefined) => (value !== undefined && /^\d+$/.test(value) ? Number(value) : null);
  const scannedAmount = number(params.amount);
  const scannedTrips = number(params.trips);
  const scannedDistance = number(params.distance);
  const found = isPlatformId(params.platform) ? params.platform : null;
  const nothingRead =
    scanned && !found && !params.start && scannedAmount === null && scannedTrips === null && scannedDistance === null;

  const [platform, setPlatform] = useState<PlatformId | null>(found);
  const [start, setStart] = useState(params.start && ISO.test(params.start) ? params.start : '');
  const [end, setEnd] = useState(params.end && ISO.test(params.end) ? params.end : '');
  const [calendar, setCalendar] = useState<'start' | 'end' | null>(null);
  const [amount, setAmount] = useState(scannedAmount !== null ? asInput(scannedAmount) : '');
  const [trips, setTrips] = useState(scannedTrips !== null ? String(scannedTrips) : '');
  const [distance, setDistance] = useState(
    scannedDistance !== null ? String(Math.round(toUnits(scannedDistance, region) * 10) / 10) : '',
  );
  const [addToWeek, setAddToWeek] = useState(true);
  const [saved, setSaved] = useState<PlatformEarning[]>([]);
  /** English, shown with t(). */
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listPlatformEarnings(db).then(setSaved, () => {});
  }, [db]);

  if (!unlocked) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.row}>
            <ThemedText type="smallBold" style={styles.flex}>
              {t('Earnings by platform')}
            </ThemedText>
            <ProBadge />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/pro')}
            style={[styles.save, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Go Pro')}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const week = start && end ? weekOfPeriod(start, end) : null;
  // UK employees have no tax set-aside (PAYE takes their tax).
  const offerSetAside = setAsideUnlocked && pay !== null && !pay.employee;
  const edit = <V,>(set: (value: V) => void) => (value: V) => {
    set(value);
    setError(null);
  };
  const setDays = (from: string, to: string) => {
    setStart(from);
    setEnd(to);
    setCalendar(null);
    setError(null);
  };
  const thisMonday = weekStartOf(today);
  const lastMonday = addDays(thisMonday, -7);

  const save = async () => {
    if (!platform) return setError(msg('Choose the app these earnings are from.'));
    if (!start || !end) return setError(msg('Choose the first and last day.'));
    const amountMinor = parseMoneyMinor(amount);
    if (amountMinor === null || amountMinor === undefined) {
      return setError(msg('Enter your earnings as an amount, e.g. 450 or 450.50.'));
    }
    const tripCount = parseNumber(trips);
    if (tripCount === undefined || (tripCount !== null && !Number.isInteger(tripCount))) {
      return setError(msg('Enter the jobs as a whole number, or leave it empty.'));
    }
    const units = parseNumber(distance);
    if (units === undefined) return setError(msg('Enter the distance as a number, or leave it empty.'));
    const draft = {
      platform,
      start,
      end,
      amountMinor,
      trips: tripCount,
      distanceMeters: units === null ? null : fromUnits(units, region),
    };
    const problem = checkDraft(draft, saved, today);
    if (problem) return setError(problem);
    setBusy(true);
    try {
      await addPlatformEarning(db, draft, offerSetAside && addToWeek ? week : null);
      router.back();
    } catch {
      setError(msg('Couldn’t save. Please try again.'));
      setBusy(false);
    }
  };

  const dateRow = (which: 'start' | 'end', label: string, value: string) => {
    const shown = value ? formatDate(value, region) : t('Choose');
    const open = calendar === which;
    return (
      <View key={which}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            open ? t('{{label}}: {{date}}. Hide calendar', { label, date: shown }) : t('{{label}}: {{date}}. Show calendar', { label, date: shown })
          }
          onPress={() => setCalendar(open ? null : which)}
          style={styles.dateRow}>
          <View style={styles.flex}>
            <ThemedText type="small" themeColor="textSecondary">
              {label}
            </ThemedText>
            <ThemedText type="smallBold" themeColor={value ? undefined : 'textSecondary'}>
              {shown}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.accent }}>
            📅 {open ? t('Done') : t('Change')}
          </ThemedText>
        </Pressable>
        {open && (
          <CalendarPicker
            value={value || (which === 'end' && start) || today}
            min={which === 'end' && start ? start : earliestDate(region)}
            // The week in progress can end after today.
            max={which === 'end' ? addDays(today, 7) : today}
            locale={displayLocale(region)}
            weekStartsOn={region.code === 'US' || region.code === 'CA' ? 0 : 1}
            onChange={(picked) => {
              if (which === 'start') setDays(picked, end && end >= picked ? end : picked);
              else setDays(start || picked, picked);
            }}
          />
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {scanned && (
            <ThemedText type="small" themeColor="textSecondary">
              {nothingRead
                ? t('No earnings could be read from that screenshot. Fill them in below.')
                : t('Read from your screenshot on this iPhone. Check each figure, and fill in anything left empty.')}
            </ThemedText>
          )}

          <View style={styles.field}>
            <ThemedText type="smallBold">{t('Which app?')}</ThemedText>
            <View style={styles.chips}>
              {platformChoices(region.code, found).map((id) => (
                <Chip key={id} label={platformName(t, id)} selected={platform === id} onPress={() => edit(setPlatform)(id)} />
              ))}
            </View>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            {dateRow('start', t('First day'), start)}
            {dateRow('end', t('Last day'), end)}
            {calendar === null && (
              <View style={styles.chips}>
                <Chip label={t('Today')} selected={start === today && end === today} onPress={() => setDays(today, today)} />
                <Chip
                  label={t('This week')}
                  selected={start === thisMonday && end === addDays(thisMonday, 6)}
                  onPress={() => setDays(thisMonday, addDays(thisMonday, 6))}
                />
                <Chip
                  label={t('Last week')}
                  selected={start === lastMonday && end === addDays(lastMonday, 6)}
                  onPress={() => setDays(lastMonday, addDays(lastMonday, 6))}
                />
              </View>
            )}
          </ThemedView>

          <View style={styles.field}>
            <ThemedText type="smallBold">{t('Total earnings')}</ThemedText>
            <View style={[styles.amountBox, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={[styles.symbol, { color: theme.textSecondary }]}>{region.currencySymbol}</ThemedText>
              <TextInput
                accessibilityLabel={t('Earnings, in {{currency}}', { currency: region.currency })}
                value={amount}
                onChangeText={edit(setAmount)}
                inputMode="decimal"
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                style={[styles.amount, { color: theme.text }]}
              />
            </View>
          </View>

          <View style={styles.pair}>
            <View style={[styles.field, styles.flex]}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Jobs (optional)')}
              </ThemedText>
              <TextInput
                accessibilityLabel={t('Jobs: trips, deliveries or orders')}
                value={trips}
                onChangeText={edit(setTrips)}
                inputMode="numeric"
                placeholder="–"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              />
            </View>
            <View style={[styles.field, styles.flex]}>
              <ThemedText type="small" themeColor="textSecondary">
                {region.unit === 'mi' ? t('Miles on jobs (optional)') : t('Km on jobs (optional)')}
              </ThemedText>
              <TextInput
                accessibilityLabel={
                  region.unit === 'mi' ? t('Miles your delivery app counted') : t('Kilometres your delivery app counted')
                }
                value={distance}
                onChangeText={edit(setDistance)}
                inputMode="decimal"
                placeholder="–"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              />
            </View>
          </View>

          {offerSetAside && start !== '' && end !== '' && (
            <ThemedView type="backgroundElement" style={styles.card}>
              {week ? (
                <View style={styles.row}>
                  <ThemedText type="small" style={styles.flex}>
                    {t('Add to that week’s earnings for your tax set-aside')}
                  </ThemedText>
                  <Switch
                    accessibilityLabel={t('Add to that week’s earnings for your tax set-aside')}
                    value={addToWeek}
                    onValueChange={setAddToWeek}
                    trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
                  />
                </View>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('These days run over more than one week, so they aren’t added to your tax set-aside. Add each week there instead.')}
                </ThemedText>
              )}
            </ThemedView>
          )}

          {error && (
            <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
              {t(error)}
            </ThemedText>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={save}
            style={[styles.save, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Save')}
            </ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            {t('Read on your iPhone. The screenshot isn’t kept or uploaded.')}
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  field: { gap: Spacing.one },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pair: { flexDirection: 'row', gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  symbol: { fontSize: 28, lineHeight: 36, fontWeight: '600' },
  amount: { flex: 1, minWidth: 0, fontSize: 34, lineHeight: 42, fontWeight: '700', fontVariant: ['tabular-nums'], paddingVertical: 0 },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  save: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 14 },
  note: { fontSize: 12, lineHeight: 16, textAlign: 'center' },
});
