import { router, useFocusEffect, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { backUp, findLatestBackup, loadBackupState, restoreBackup, type FoundBackup } from '@/backup/backup';
import { backedUpText, formatBackupDate, PROBLEM_TEXT } from '@/backup/copy';
import { backupAge } from '@/backup/schedule';
import { tripCount, type Snapshot } from '@/backup/snapshot';
import { GoldButton } from '@/components/gold-button';
import { ProBadge } from '@/components/pro-prompt';
import { FoundingBadge, InviteHero, SproutGarden } from '@/components/invite';
import { clockTime, weekdayName } from '@/components/home-empty';
import { LinkRow } from '@/components/link-row';
import { ReplayTutorialSection } from '@/components/practice-tutorial';
import { PurposePicker, shownPurpose } from '@/components/purpose-picker';
import { EMPTY_PLACE, PlaceField, resolvePlace, type PlaceDraft } from '@/components/place-field';
import { SectionTitle } from '@/components/section-title';
import { Segmented } from '@/components/segmented';
import { TrackingCheckRow } from '@/components/tracking-health-card';
import { VehiclePicker } from '@/components/vehicle-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { countPastTrips, scrubPastTrips } from '@/db/privacy-repo';
import { DEMO_MODE } from '@/dev/demo';
import { AREA_EXAMPLES, clientVisitLabel } from '@/domain/privacy';
import { deletePlace, insertPlace, listPlaces } from '@/db/places-repo';
import { loadSettings, updateSettings, type AppSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { frequentPurposes } from '@/domain/suggestions';
import type { Appearance } from '@/domain/appearance';
import { isValidShift, type WorkShift } from '@/domain/classify-rules';
import { marApplies, parsePence, TAX_BAND_RATES, type TaxBand } from '@/domain/mar';
import { formatRate, ratePeriodFor, vehicleRule } from '@/domain/regions';
import { toLocalIsoDate, VEHICLE_ICONS, VEHICLE_LABELS, type VehicleType } from '@/domain/trip';
import { formatWorkDays, summarizeWorkHours } from '@/domain/work-hours-summary';
import { defaultVehicleName, normaliseRegistration, type Vehicle } from '@/domain/vehicles';
import { addVehicle, removeVehicle, updateVehicle } from '@/db/vehicles-repo';
import { useVehicles } from '@/vehicles/use-vehicles';
import type { Place, PlaceKind } from '@/domain/places';
import { type MileagePay, useMileagePay } from '@/hooks/use-mileage-pay';
import { setAppearance, useAppearance } from '@/hooks/use-appearance';
import { useCanUse } from '@/hooks/use-feature';
import { useTheme } from '@/hooks/use-theme';
import { LANGUAGES, msg, useLanguage, useT } from '@/i18n/i18n';
import { LIVE_ACTIVITY_SUPPORTED, syncShiftActivity } from '@/live-activity/sync';
import { usePro } from '@/purchases/pro';
import { RedeemCode } from '@/components/redeem-code';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';
import {
  cancelWorkHoursNudge,
  disableWeeklyReminder,
  enableWeeklyReminder,
  REMINDERS_SUPPORTED,
} from '@/reminders/weekly';
import { cancelQuarterlyReminders, cancelSetAsideReminder, scheduleQuarterlyReminders } from '@/reminders/money';
import { queueSetAsideReminder } from '@/reminders/use-money-reminders';

import { ICloudBackup, type BackupKeyInfo } from '../../../modules/icloud-backup';

/** Monday first, as people read a work week; values are `Date.getDay()` indexes. */
const DAYS = [
  [1, msg('Mon')],
  [2, msg('Tue')],
  [3, msg('Wed')],
  [4, msg('Thu')],
  [5, msg('Fri')],
  [6, msg('Sat')],
  [0, msg('Sun')],
] as const;

const KIND_LABELS: Record<PlaceKind, string> = {
  home: msg('Home'),
  work: msg('Work'),
  client: msg('Client'),
  other: msg('Other'),
};

const NEW_SHIFT: WorkShift = { start: '09:00', end: '17:00' };
/** A second shift that day, pre-filled so it's clearly editable rather than a hint. */
const EXTRA_SHIFT: WorkShift = { start: '18:00', end: '22:00' };

const SUPPORT_EMAIL = 'milemint.support@gmail.com';

export default function SettingsTab() {
  // After a restore every section loads afresh, so nothing stale (work hours, places) is saved over it.
  const [generation, reopen] = useReducer((n: number) => n + 1, 0);
  return <SettingsScreen key={generation} onRestored={reopen} />;
}

function SettingsScreen({ onRestored }: { onRestored: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [enabled, setEnabled] = useState(false);
  const [week, setWeek] = useState<WorkShift[][] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [settings, nextPlaces] = await Promise.all([loadSettings(db), listPlaces(db)]);
        setEnabled(settings.workHoursEnabled);
        setWeek(settings.workWeek.map((day) => day.map((shift) => ({ ...shift }))));
        setPlaces(nextPlaces);
      })();
    }, [db]),
  );

  if (!week) return <ActivityIndicator style={styles.loading} />;

  const updateDay = (weekday: number, shifts: WorkShift[]) => {
    setMessage(null);
    setWeek(week.map((day, i) => (i === weekday ? shifts : day)));
  };

  const save = async () => {
    const invalid = DAYS.filter(([weekday]) => !week[weekday].every(isValidShift));
    if (enabled && invalid.length > 0) {
      return setMessage({
        error: true,
        text: t('Check {{days}}: use 24-hour times like 09:00, and an end different from the start.', {
          days: invalid.map(([, name]) => t(name)).join(', '),
        }),
      });
    }
    try {
      // Only these two: the other settings (such as the region) stay as they are.
      await updateSettings(db, { workHoursEnabled: enabled, workWeek: week });
      if (enabled) cancelWorkHoursNudge().catch(() => {});
      setMessage({ error: false, text: t('Saved. New drives will use these hours.') });
    } catch {
      setMessage({ error: true, text: t('Could not save. Please try again.') });
    }
  };

  const confirmDelete = (place: Place) =>
    Alert.alert(t('Delete “{{name}}”?', { name: place.name }), t('Past trips keep their names.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: async () => {
          await deletePlace(db, place.id);
          setPlaces(await listPlaces(db));
        },
      },
    ]);

  const inputStyle = [styles.time, { color: theme.text, backgroundColor: theme.background }];
  // "Mon–Fri 9:00–17:00", "Varies" or "Off", next to the heading.
  const hours = enabled ? summarizeWorkHours(week) : null;
  const hoursValue =
    hours === null
      ? t('Off')
      : hours === 'varies'
        ? t('Varies by day')
        : `${formatWorkDays(hours.days, (day) => weekdayName(day, region))} ${clockTime(hours.start, region)}–${clockTime(hours.end, region)}`;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GroupTitle title={t('Tracking')} />

        <TrackingCheckRow />

        <SectionTitle title={t('Work hours')} value={hoursValue} />
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{t('Classify by work hours')}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t(
                  'Drives that start during your hours are marked work, others personal. Your usual routes and commutes take priority.',
                )}
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel={t('Classify by work hours')}
              value={enabled}
              onValueChange={(value) => {
                setMessage(null);
                setEnabled(value);
              }}
              trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
            />
          </View>

          {enabled &&
            DAYS.map(([weekday, name]) => {
              const shifts = week[weekday];
              return (
                <View key={weekday} style={styles.day}>
                  <View style={styles.rowBetween}>
                    <ThemedText type="smallBold">{t(name)}</ThemedText>
                    <Switch
                      accessibilityLabel={t('Work on {{day}}', { day: t(name) })}
                      value={shifts.length > 0}
                      onValueChange={(on) => updateDay(weekday, on ? [{ ...NEW_SHIFT }] : [])}
                      trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
                    />
                  </View>
                  {shifts.map((shift, index) => {
                    const setShift = (next: WorkShift) =>
                      updateDay(
                        weekday,
                        shifts.map((s, i) => (i === index ? next : s)),
                      );
                    return (
                      <View key={index} style={styles.shift}>
                        <TextInput
                          accessibilityLabel={t('{{day}} shift {{number}} start', { day: t(name), number: index + 1 })}
                          style={inputStyle}
                          value={shift.start}
                          onChangeText={(start) => setShift({ ...shift, start })}
                          placeholder="09:00"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numbers-and-punctuation"
                          maxLength={5}
                        />
                        <ThemedText type="small" themeColor="textSecondary">
                          {t('to')}
                        </ThemedText>
                        <TextInput
                          accessibilityLabel={t('{{day}} shift {{number}} end', { day: t(name), number: index + 1 })}
                          style={inputStyle}
                          value={shift.end}
                          onChangeText={(end) => setShift({ ...shift, end })}
                          placeholder="17:00"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numbers-and-punctuation"
                          maxLength={5}
                        />
                        {shifts.length > 1 && (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t('Remove {{day}} shift {{number}}', { day: t(name), number: index + 1 })}
                            hitSlop={8}
                            onPress={() => updateDay(weekday, shifts.filter((_, i) => i !== index))}>
                            <ThemedText type="small" themeColor="danger">
                              {t('Remove')}
                            </ThemedText>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                  {shifts.length > 0 && (
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => updateDay(weekday, [...shifts, { ...EXTRA_SHIFT }])}>
                      <ThemedText type="small" style={{ color: theme.accent }}>
                        {t('Add another time')}
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              );
            })}

          {enabled && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('24-hour times. A shift like 22:00 to 02:00 runs past midnight.')}
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
          <Pressable
            accessibilityRole="button"
            onPress={save}
            style={[styles.button, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Save work hours')}
            </ThemedText>
          </Pressable>
        </ThemedView>

        <SectionTitle title={t('Places')} value={String(places.length)} />
        <ThemedView type="backgroundElement" style={styles.card}>
          {places.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('No places yet. Add one below, or open a trip and tap “Save as place”.')}
            </ThemedText>
          ) : (
            places.map((place) => (
              <Pressable
                key={place.id}
                onLongPress={() => confirmDelete(place)}
                style={styles.rowBetween}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold">{place.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t(KIND_LABELS[place.kind])}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Delete {{name}}', { name: place.name })}
                  hitSlop={8}
                  onPress={() => confirmDelete(place)}>
                  <ThemedText type="small" themeColor="danger">
                    {t('Delete')}
                  </ThemedText>
                </Pressable>
              </Pressable>
            ))
          )}
          <AddPlace onAdded={async () => setPlaces(await listPlaces(db))} />
        </ThemedView>

        <GroupTitle title={t('Driving & tax')} />

        <CountrySection />

        <DrivingSection />

        <MileagePaySection />

        <ClientPrivacySection />

        <LogbookSection />

        <GroupTitle title={t('Pro & friends')} />

        <ProSection />

        <InviteSection />

        {/* Hidden on iPhone until iCloud is enabled for the app; the web preview explains it. */}
        {(ICloudBackup.supported || Platform.OS === 'web') && (
          <>
            <GroupTitle title={t('Backup & data')} />
            <BackupSection onRestored={onRestored} />
          </>
        )}

        {/* The web demo shows the switches as on iPhone (for screenshots). */}
        {(REMINDERS_SUPPORTED || DEMO_MODE) && (
          <>
            <GroupTitle title={t('Notifications')} />
            <ReminderSection />
          </>
        )}

        <GroupTitle title={t('About & support')} />

        <LanguageSection />

        <AppearanceSection />

        <ReplayTutorialSection />

        <ThemedText type="smallBold">{t('Help & feedback')}</ThemedText>
        <ThemedView type="backgroundElement" style={styles.links}>
          <LinkRow
            icon="envelope.fill"
            glyph="✉️"
            title={t('Help & feedback')}
            detail={t('We read every message')}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=MileSprout`).catch(() => {})}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

/** A group of sections: tracking, driving and tax, Pro, backup, notifications, the app itself. */
function GroupTitle({ title }: { title: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" accessibilityRole="header" style={styles.groupTitle}>
      {title}
    </ThemedText>
  );
}

/** Settings → Places: name a spot and find it by address, from Apple Maps suggestions. */
function AddPlace({ onAdded }: { onAdded: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PlaceKind>('client');
  const [where, setWhere] = useState<PlaceDraft>(EMPTY_PLACE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setOpen(true)}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('+ Add a place')}
        </ThemedText>
      </Pressable>
    );
  }

  const save = async () => {
    if (!name.trim()) return setError(t('Give the place a name, e.g. “Acme HQ”.'));
    if (!where.text.trim()) return setError(t('Search for its address, or use “I’m here now”.'));
    setError(null);
    setSaving(true);
    try {
      await insertPlace(db, { name: name.trim(), kind, at: await resolvePlace(where) });
      setOpen(false);
      setName('');
      setWhere(EMPTY_PLACE);
      onAdded();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('Couldn’t save the place. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.addPlace}>
      <TextInput
        accessibilityLabel={t('Place name')}
        value={name}
        onChangeText={setName}
        placeholder={t('Name, e.g. Acme HQ')}
        placeholderTextColor={theme.textSecondary}
        style={[styles.nameInput, { color: theme.text, backgroundColor: theme.background }]}
      />
      <Segmented
        options={(['home', 'work', 'client', 'other'] as const).map((value) => ({ value, label: t(KIND_LABELS[value]) }))}
        value={kind}
        onChange={setKind}
      />
      <PlaceField label={t('Address')} placeholder={t('Search an address or place')} value={where} onChange={setWhere} />
      {error && (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      )}
      <View style={styles.rowBetween}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setOpen(false)}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Cancel')}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={save}
          style={[styles.smallButton, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {saving ? t('Saving…') : t('Save place')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

type ReminderKey = 'weeklyReminder' | 'setAsideReminder' | 'quarterlyReminder';

function ReminderSection() {
  const db = useSQLiteContext();
  const t = useT();
  const { region } = useRegion();
  const { isPro } = usePro();
  const setAsideOpen = useCanUse('tax-set-aside');
  const [on, setOn] = useState<Record<ReminderKey, boolean> | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    loadSettings(db).then(
      (settings) =>
        setOn({
          weeklyReminder: settings.weeklyReminder,
          setAsideReminder: settings.setAsideReminder,
          quarterlyReminder: settings.quarterlyReminder,
        }),
      () => setOn({ weeklyReminder: false, setAsideReminder: false, quarterlyReminder: false }),
    );
  }, [db]);

  /** Switches one on (asking for permission if needed) or off; resolves to whether it's now queued. */
  const schedule = async (which: ReminderKey, value: boolean): Promise<boolean> => {
    // The web demo has no notifications: the switch just flips.
    if (DEMO_MODE && !REMINDERS_SUPPORTED) return value;
    if (!value) {
      if (which === 'weeklyReminder') await disableWeeklyReminder();
      else if (which === 'setAsideReminder') await cancelSetAsideReminder();
      else await cancelQuarterlyReminders();
      return false;
    }
    if (which === 'weeklyReminder') return enableWeeklyReminder(region.unit);
    if (which === 'setAsideReminder') return queueSetAsideReminder(db, region, true);
    return scheduleQuarterlyReminders(region, true);
  };

  const change = (which: ReminderKey) => async (value: boolean) => {
    setNote(null);
    const scheduled = await schedule(which, value).catch(() => false);
    if (value && !scheduled) {
      setNote(t('Notifications are off for MileSprout. Turn them on in iPhone Settings → Notifications.'));
    }
    setOn((current) => current && { ...current, [which]: scheduled });
    await updateSettings(db, { [which]: scheduled });
  };

  const anyOn = on !== null && (on.weeklyReminder || (setAsideOpen && on.setAsideReminder) || (isPro && on.quarterlyReminder));
  return (
    <>
      <SectionTitle title={t('Reminders')} value={on === null ? null : anyOn ? t('On') : t('Off')} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <ReminderRow
          title={t('Weekly reminder')}
          detail={t('A short reminder on Sunday evening to sort the week’s drives.')}
          value={on?.weeklyReminder ?? null}
          onChange={change('weeklyReminder')}
        />
        <ReminderRow
          title={t('Tax set-aside')}
          detail={t('Monday morning: how much to put aside from last week’s driving.')}
          value={on?.setAsideReminder ?? null}
          onChange={change('setAsideReminder')}
          locked={!setAsideOpen}
        />
        <ReminderRow
          title={t('Quarterly deadlines')}
          detail={t('Two weeks before each quarterly deadline, with your figures ready.')}
          value={on?.quarterlyReminder ?? null}
          onChange={change('quarterlyReminder')}
          locked={!isPro}
        />
        {note && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {note}
          </ThemedText>
        )}
      </ThemedView>
    </>
  );
}

/** One reminder's switch. Locked: shown off with a Pro tag, and tapping the row opens the Pro screen. */
function ReminderRow({
  title,
  detail,
  value,
  onChange,
  locked = false,
}: {
  title: string;
  detail: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  locked?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable accessible={false} disabled={!locked} onPress={() => router.push('/pro')} style={styles.rowBetween}>
      <View style={styles.flex}>
        <View style={styles.titleWithBadge}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {locked && <ProBadge />}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      </View>
      <Switch
        accessibilityLabel={title}
        disabled={value === null || locked}
        value={!locked && (value ?? false)}
        onValueChange={onChange}
        trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
      />
    </Pressable>
  );
}

/** Encrypted iCloud backup: whether it's working, when it last ran, and back up or restore now. */
function BackupSection({ onRestored }: { onRestored: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region, reload } = useRegion();
  const referral = useReferral();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [key, setKey] = useState<BackupKeyInfo | null>(null);
  const [lastAt, setLastAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState<'backup' | 'restore' | null>(null);
  const [note, setNote] = useState<{ error: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const [isAvailable, keyInfo, state] = await Promise.all([
      ICloudBackup.isAvailable(),
      ICloudBackup.keyInfo().catch(() => null),
      loadBackupState(),
    ]);
    setAvailable(isAvailable);
    setKey(keyInfo);
    setLastAt(state ? new Date(state.at) : null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => setAvailable(false));
    }, [refresh]),
  );

  const backUpNow = async () => {
    setBusy('backup');
    setNote(null);
    try {
      const outcome = await backUp(db, { force: true });
      setNote(
        outcome === 'written'
          ? { error: false, text: t('Backed up to iCloud.') }
          : outcome === 'empty'
            ? { error: false, text: t('Nothing to back up yet. Your trips are backed up once you have some.') }
            : {
                error: true,
                text: t('iCloud isn’t available. Sign in to iCloud and turn on iCloud Drive in iPhone Settings.'),
              },
      );
    } catch {
      setNote({ error: true, text: t('Couldn’t back up. Check your connection and try again.') });
    } finally {
      setBusy(null);
      refresh().catch(() => {});
    }
  };

  const restoreNow = async (found: FoundBackup, snapshot: Snapshot) => {
    setBusy('restore');
    try {
      await restoreBackup(db, { ...found, snapshot });
      await reload();
      await referral.reload();
      // Every section on this screen loaded the old data: open it afresh so
      // nothing stale (work hours, places) gets saved over what was restored.
      Alert.alert(t('Restored {{count}} trips from iCloud.', { count: tripCount(snapshot) }));
      onRestored();
      return;
    } catch {
      setNote({ error: true, text: t('Couldn’t restore. Nothing on this iPhone was changed.') });
    } finally {
      setBusy(null);
      refresh().catch(() => {});
    }
  };

  const restore = async () => {
    setBusy('restore');
    setNote(null);
    let found: FoundBackup | null;
    try {
      found = await findLatestBackup();
    } catch {
      return setNote({ error: true, text: t('Couldn’t reach your iCloud backups. Check your connection and try again.') });
    } finally {
      setBusy(null);
    }
    if (!found) return setNote({ error: false, text: t('There’s no backup in iCloud yet.') });
    const { snapshot } = found;
    if (!snapshot) return setNote({ error: true, text: t(PROBLEM_TEXT[found.problem ?? 'damaged']) });
    const from = found;
    Alert.alert(
      t('Replace what’s on this iPhone?'),
      t(
        'Restore the backup from {{date}} with {{count}} trips. The trips, places, vehicles and settings on this iPhone are replaced by the ones in the backup.',
        { date: formatBackupDate(found.createdAt, region), count: tripCount(snapshot) },
      ),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Restore'), style: 'destructive', onPress: () => restoreNow(from, snapshot) },
      ],
    );
  };

  const status = !ICloudBackup.supported
    ? t('Backups to iCloud work in the iPhone app.')
    : available === null
      ? t('Checking iCloud…')
      : !available
        ? t('iCloud is off for MileSprout. Sign in to iCloud and turn on iCloud Drive in iPhone Settings to back up your trips.')
        : lastAt
          ? backedUpText(backupAge(lastAt, new Date()), t)
          : t('Not backed up yet.');

  return (
    <>
      <ThemedText type="smallBold">{t('Backup')}</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">{t('iCloud backup')}</ThemedText>
          <ThemedText type="small" themeColor={available === false ? 'danger' : 'textSecondary'}>
            {status}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {t('Encrypted with a key only your iCloud Keychain holds. MileSprout never sees your trips.')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('Backs up by itself when something changes, at most once a day, and keeps the last four backups.')}
        </ThemedText>
        {key?.exists && !key.synchronizable && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {t(
              'iCloud Keychain isn’t available, so the backup key is kept on this iPhone only. These backups can’t be restored on a new iPhone.',
            )}
          </ThemedText>
        )}
        {note && (
          <ThemedText
            type="small"
            themeColor={note.error ? 'danger' : 'textSecondary'}
            accessibilityRole={note.error ? 'alert' : undefined}>
            {note.text}
          </ThemedText>
        )}
        {ICloudBackup.supported && available && (
          <View style={styles.rowBetween}>
            <Pressable
              accessibilityRole="button"
              disabled={busy !== null}
              hitSlop={8}
              onPress={restore}
              style={[styles.flex, { opacity: busy ? 0.6 : 1 }]}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {busy === 'restore' ? t('Restoring…') : t('Restore from iCloud backup')}
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy !== null}
              onPress={backUpNow}
              style={[styles.smallButton, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {busy === 'backup' ? t('Backing up…') : t('Back up now')}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </ThemedView>
    </>
  );
}

/** Your vehicles: add, edit (name, type, number plate), remove, and which one you're driving now. */
function Garage() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const { vehicles, current, choose, reload } = useVehicles();
  /** The vehicle being edited, or 'new' while adding one. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; type: VehicleType; registration: string }>({
    name: '',
    type: 'car',
    registration: '',
  });

  const open = (vehicle: Vehicle | null) => {
    setEditing(vehicle?.id ?? 'new');
    setDraft({
      name: vehicle?.name ?? '',
      type: vehicle?.type ?? 'car',
      registration: vehicle?.registration ?? '',
    });
  };

  // A double tap on Save would add the vehicle twice.
  const saving = useRef(false);
  const save = async () => {
    if (saving.current) return;
    saving.current = true;
    try {
      const registration = normaliseRegistration(draft.registration);
      const name = draft.name.trim() || defaultVehicleName(draft.type);
      if (editing === 'new') await addVehicle(db, { type: draft.type, name, registration });
      else if (editing) await updateVehicle(db, { id: editing, type: draft.type, name, registration });
      setEditing(null);
      await reload();
    } finally {
      saving.current = false;
    }
  };

  const remove = (vehicle: Vehicle) =>
    Alert.alert(t('Remove “{{name}}”?', { name: vehicle.name }), t('Trips already logged in it keep it in their record.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Remove'),
        style: 'destructive',
        onPress: async () => {
          await removeVehicle(db, vehicle.id);
          setEditing(null);
          await reload();
        },
      },
    ]);

  const types = [...new Set(vehicles.map((vehicle) => vehicle.type))];
  const editor = (
    <View style={styles.vehicleEditor}>
      <VehiclePicker value={draft.type} onChange={(type) => setDraft({ ...draft, type })} />
      <TextInput
        accessibilityLabel={t('Vehicle name')}
        value={draft.name}
        onChangeText={(name) => setDraft({ ...draft, name })}
        placeholder={
          draft.type === 'car'
            ? t('Name, e.g. Golf')
            : draft.type === 'motorbike'
              ? t('Name, e.g. Honda PCX')
              : t('Name, e.g. Cargo bike')
        }
        placeholderTextColor={theme.textSecondary}
        style={[styles.nameInput, { color: theme.text, backgroundColor: theme.background }]}
      />
      <TextInput
        accessibilityLabel={t('Number plate (optional)')}
        value={draft.registration}
        onChangeText={(registration) => setDraft({ ...draft, registration })}
        placeholder={t('Number plate (optional)')}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="characters"
        autoCorrect={false}
        style={[styles.nameInput, { color: theme.text, backgroundColor: theme.background }]}
      />
      <View style={styles.rowBetween}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setEditing(null)}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Cancel')}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={save}
          style={[styles.smallButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Save vehicle')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <SectionTitle title={t('Your vehicles')} value={String(vehicles.length)} />
      {vehicles.map((vehicle) =>
        editing === vehicle.id ? (
          <View key={vehicle.id}>
            {editor}
            {vehicles.length > 1 && (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => remove(vehicle)}>
                <ThemedText type="small" themeColor="danger">
                  {t('Remove this vehicle')}
                </ThemedText>
              </Pressable>
            )}
          </View>
        ) : (
          <View key={vehicle.id} style={[styles.vehicleRow, { backgroundColor: theme.background }]}>
            {/* Tapping the vehicle edits it; "Use now" is its own button beside it. */}
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('Edit this vehicle')}
              onPress={() => open(vehicle)}
              style={styles.vehicleMain}>
              <Text style={styles.vehicleIcon}>{VEHICLE_ICONS[vehicle.type]}</Text>
              <View style={styles.flex}>
                <ThemedText type="smallBold">{vehicle.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {[t(VEHICLE_LABELS[vehicle.type]), vehicle.registration].filter(Boolean).join(' · ')}
                </ThemedText>
              </View>
            </Pressable>
            {current?.id === vehicle.id ? (
              <ThemedText type="small" style={{ color: theme.accent }}>
                {t('Driving now')}
              </ThemedText>
            ) : (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => choose(vehicle)}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('Use now')}
                </ThemedText>
              </Pressable>
            )}
          </View>
        ),
      )}
      {editing === 'new' ? (
        editor
      ) : (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => open(null)}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {t('+ Add a vehicle')}
          </ThemedText>
        </Pressable>
      )}
      {types.map((type) => (
        <ThemedText key={type} type="small" themeColor="textSecondary">
          {VEHICLE_ICONS[type]}{' '}
          {type === 'car'
            ? t('{{rule}}. Petrol, diesel, hybrid or electric: same rate for a car or van you own.', {
                rule: t(vehicleRule(region, type)),
              })
            : t('{{rule}}.', { rule: t(vehicleRule(region, type)) })}
        </ThemedText>
      ))}
    </>
  );
}

/** What you drive (priced per vehicle) and shift mode for couriers. */
function DrivingSection() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [purposes, setPurposes] = useState<string[]>([]);

  useEffect(() => {
    loadSettings(db).then(setSettings, () => {});
    listTrips(db).then((trips) => setPurposes(frequentPurposes(trips, 6)), () => {});
  }, [db]);
  if (!settings) return null;

  const change = async (changes: Partial<AppSettings>) => {
    setSettings((shown) => shown && { ...shown, ...changes });
    setSettings(await updateSettings(db, changes));
    // Shift mode or the lock-screen switch changed: show or take down the shift's card.
    if ('shiftMode' in changes || 'shiftLiveActivity' in changes) syncShiftActivity(db).catch(() => {});
  };

  return (
    <>
      {/* The usual purpose and shift mode, at a glance. */}
      <SectionTitle
        title={t('Your driving')}
        value={[
          settings.defaultPurpose ? shownPurpose(settings.defaultPurpose, t) : null,
          `${t('Shift mode')}: ${settings.shiftMode ? t('On') : t('Off')}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      />
      <ThemedView type="backgroundElement" style={styles.card}>
        <Garage />
        <View style={[styles.rowBetween, styles.spaced]}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">{t('New drives start as work')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'Unless a rule says otherwise (work hours, a commute, a route you’ve taught it). Swipe left on any that were personal; only work drives should be claimed.',
              )}
            </ThemedText>
          </View>
          <Switch
            accessibilityLabel={t('New drives start as work')}
            value={settings.defaultBusiness}
            onValueChange={(defaultBusiness) => change({ defaultBusiness })}
            trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          />
        </View>
        <View style={[styles.purposeSetting, styles.spaced]}>
          <View style={styles.rowBetween}>
            <ThemedText type="smallBold" style={styles.flex}>
              {t('Usual purpose')}
            </ThemedText>
            {settings.defaultPurpose && (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => change({ defaultPurpose: null })}>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  {t('Clear')}
                </ThemedText>
              </Pressable>
            )}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {settings.shiftMode && !settings.defaultPurpose
              ? t('Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one.')
              : t('Filled in for work drives that have none, so your tax records are complete. You can change it on any trip.')}
          </ThemedText>
          <PurposePicker
            value={settings.defaultPurpose ?? ''}
            onChange={(purpose) => change({ defaultPurpose: purpose.trim() || null })}
            recent={purposes}
            clientPrivacy={settings.clientPrivacy}
            shiftMode={settings.shiftMode}
            placeholder={t('None: ask me each time')}
          />
        </View>
        <View style={[styles.rowBetween, styles.spaced]}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">{t('Shift mode')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'For delivery and ride app work (Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber and others): a Start shift button on the home screen. Every drive in a shift counts as work.',
              )}
            </ThemedText>
          </View>
          <Switch
            accessibilityLabel={t('Shift mode')}
            value={settings.shiftMode}
            onValueChange={(shiftMode) => change({ shiftMode })}
            trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          />
        </View>
        {settings.shiftMode && LIVE_ACTIVITY_SUPPORTED && (
          <View style={[styles.rowBetween, styles.spaced]}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{t('Show shift on lock screen')}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t(
                  'While a shift is on, your lock screen and the Dynamic Island show its time, distance and money so far, with a button to end it. Anyone who sees your phone can see the money.',
                )}
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel={t('Show shift on lock screen')}
              value={settings.shiftLiveActivity}
              onValueChange={(shiftLiveActivity) => change({ shiftLiveActivity })}
              trackColor={{ true: theme.accent }}
            />
          </View>
        )}
      </ThemedView>
    </>
  );
}

/**
 * Client privacy, for care workers, nurses and support workers who visit people
 * at home: new drives keep the area of a visit, never the address or the route.
 * Switching it on offers to do the same to past trips (which can't be undone).
 */
function ClientPrivacySection() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [on, setOn] = useState<boolean | null>(null);
  const [note, setNote] = useState<{ error: boolean; text: string } | null>(null);

  useEffect(() => {
    loadSettings(db).then((settings) => setOn(settings.clientPrivacy), () => setOn(false));
  }, [db]);

  const scrub = async () => {
    try {
      const count = await scrubPastTrips(db, region.code);
      setNote({ error: false, text: t('Done. {{count}} past trips now show only the area.', { count }) });
    } catch {
      setNote({ error: true, text: t('Couldn’t change past trips. Please try again.') });
    }
  };

  const confirmScrub = () =>
    Alert.alert(
      t('Remove addresses from past trips?'),
      t('This can’t be undone. Dates, distances and purposes stay as they are; places you saved keep their names.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Remove addresses'), style: 'destructive', onPress: scrub },
      ],
    );

  const offerScrub = async () => {
    const count = await countPastTrips(db);
    if (count === 0) return;
    Alert.alert(
      t('Past trips too?'),
      t('{{count}} past trips may still have addresses and routes. Replace them with the area only and delete the routes?', {
        count,
      }),
      [
        { text: t('Keep them'), style: 'cancel' },
        { text: t('Replace…'), onPress: confirmScrub },
      ],
    );
  };

  const change = async (value: boolean) => {
    setNote(null);
    setOn(value);
    try {
      await updateSettings(db, { clientPrivacy: value });
      if (value) await offerScrub();
    } catch {
      setOn(!value);
    }
  };

  return (
    <>
      <ThemedText type="smallBold">{t('Client privacy')}</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">{t('I visit clients or patients at home (care, nursing, support work)')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('We’ll keep only the area, never their address.')}
            </ThemedText>
          </View>
          <Switch
            accessibilityLabel={t('Client privacy')}
            disabled={on === null}
            value={on ?? false}
            onValueChange={change}
            trackColor={{ false: theme.backgroundSelected, true: theme.accent }}
          />
        </View>
        {on && (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'New drives read like “{{example}}”, with no route saved. Places you saved yourself, like Home, keep their names. For the tax office, the area, the distance and the purpose are enough; add initials or a client number to the purpose if you like.',
                { example: clientVisitLabel(AREA_EXAMPLES[region.code]) },
              )}
            </ThemedText>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={confirmScrub}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {t('Remove addresses from past trips')}
              </ThemedText>
            </Pressable>
          </>
        )}
        {note && (
          <ThemedText
            type="small"
            themeColor={note.error ? 'danger' : 'textSecondary'}
            accessibilityRole={note.error ? 'alert' : undefined}>
            {note.text}
          </ThemedText>
        )}
      </ThemedView>
    </>
  );
}

const TAX_BAND_LABELS: Record<TaxBand, string> = {
  basic: msg('Basic'),
  higher: msg('Higher'),
  additional: msg('Additional'),
  unsure: msg('Not sure'),
};

/**
 * UK: self-employed, or an employee paid a mileage allowance (or nothing), so
 * home shows Mileage Allowance Relief instead of a deduction.
 */
function MileagePaySection() {
  const t = useT();
  const { region } = useRegion();
  const { pay, update } = useMileagePay();
  if (!marApplies(region) || !pay) return null;
  return (
    <>
      <ThemedText type="smallBold">{t('How you’re paid for mileage')}</ThemedText>
      <MileagePayForm pay={pay} update={update} />
    </>
  );
}

function MileagePayForm({
  pay,
  update,
}: {
  pay: MileagePay;
  update: ReturnType<typeof useMileagePay>['update'];
}) {
  const theme = useTheme();
  const t = useT();
  const show = (rate: number) => (rate > 0 ? String(rate / 10) : '');
  const [rateText, setRateText] = useState(() => show(pay.employerRate));
  const [paysNothing, setPaysNothing] = useState(pay.employerRate === 0);
  const rateError = !paysNothing && rateText.trim() !== '' && parsePence(rateText) === null;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Segmented
        options={[
          { value: 'self-employed', label: t('Self-employed') },
          { value: 'employee', label: t('Employee') },
        ]}
        value={pay.employee ? 'employee' : 'self-employed'}
        onChange={(employment) => update({ employment })}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {pay.employee
          ? t(
              'You drive your own vehicle for your employer. If they pay less than HMRC’s rate (or nothing), you can claim tax relief on the difference.',
            )
          : t('Your business mileage is an expense on your Self Assessment return.')}
      </ThemedText>
      {pay.employee && (
        <>
          <View style={styles.stack}>
            <ThemedText type="smallBold">{t('What does your employer pay?')}</ThemedText>
            <Segmented
              options={[
                { value: 'rate', label: t('Per mile') },
                { value: 'nothing', label: t('Nothing') },
              ]}
              value={paysNothing ? 'nothing' : 'rate'}
              onChange={(choice) => {
                const nothing = choice === 'nothing';
                setPaysNothing(nothing);
                if (nothing) update({ employerRate: 0 });
                else {
                  const rate = parsePence(rateText) ?? 450;
                  setRateText(show(rate));
                  update({ employerRate: rate });
                }
              }}
            />
          </View>
          {!paysNothing && (
            <View style={styles.shift}>
              <TextInput
                accessibilityLabel={t('Pence per mile your employer pays')}
                style={[styles.time, { color: theme.text, backgroundColor: theme.background }]}
                value={rateText}
                onChangeText={setRateText}
                // Saved once typing is done, so "0.45" isn't stored as 0p then 0.4p on the way.
                onEndEditing={() => {
                  const rate = parsePence(rateText);
                  if (rate !== null) {
                    update({ employerRate: rate });
                    setRateText(show(rate));
                  }
                }}
                placeholder="45"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {t('pence a mile')}
              </ThemedText>
            </View>
          )}
          {rateError && (
            <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
              {t('Enter pence a mile as a number, e.g. 45.')}
            </ThemedText>
          )}
          <View style={styles.stack}>
            <ThemedText type="smallBold">{t('Your income tax rate')}</ThemedText>
            <Segmented
              options={(['basic', 'higher', 'additional', 'unsure'] as const).map((value) => ({
                value,
                label: t(TAX_BAND_LABELS[value]),
              }))}
              value={pay.band}
              onChange={(taxBand) => update({ taxBand })}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'For the tax back estimate: basic {{basic}}%, higher {{higher}}%, additional {{additional}}%. Not sure? MileSprout uses {{basic}}%. Scottish rates differ a little.',
                TAX_BAND_RATES,
              )}
            </ThemedText>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/claim-relief' as Href)}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {t('How to claim Mileage Allowance Relief ›')}
            </ThemedText>
          </Pressable>
        </>
      )}
    </ThemedView>
  );
}

function CountrySection() {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const rate = ratePeriodFor(toLocalIsoDate(new Date()), region, 'car')?.tiers[0]?.rate;
  const countryValue = rate === undefined ? region.flag : `${region.flag} · ${formatRate(rate, region)}`;
  return (
    <>
      <SectionTitle title={t('Country')} value={countryValue} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">
              {region.flag} {t(region.name)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t(region.rule)}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Change country')}
            hitSlop={8}
            onPress={() => router.push('/region')}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Change')}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

/** Australia only: the ATO logbook method, for cars past the 5,000 km cents per km limit. */
function LogbookSection() {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  if (region.code !== 'AU') return null;
  return (
    <>
      <ThemedText type="smallBold">{t('ATO logbook')}</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">{t('The logbook method')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('Over 5,000 business km in a car? Keep a 12-week logbook and claim the business share of its running costs.')}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Open the ATO logbook')}
            hitSlop={8}
            onPress={() => router.push('/logbook' as Href)}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Open')}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

/** The app's language, shown in its own words; changed on its own screen. */
function LanguageSection() {
  const theme = useTheme();
  const t = useT();
  const code = useLanguage();
  const language = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
  return (
    <>
      <SectionTitle title={t('Language')} value={language.name} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">{language.name}</ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Change language')}
            hitSlop={8}
            onPress={() => router.push('/language' as Href)}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Change')}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

const APPEARANCE_OPTIONS = [
  { value: 'system', label: msg('System') },
  { value: 'light', label: msg('Light') },
  { value: 'dark', label: msg('Dark') },
] as const satisfies readonly { value: Appearance; label: string }[];

/** Light or dark: follow the phone (the default), or always one. Applies straight away. */
function AppearanceSection() {
  const db = useSQLiteContext();
  const t = useT();
  const appearance = useAppearance();
  const current = APPEARANCE_OPTIONS.find((option) => option.value === appearance) ?? APPEARANCE_OPTIONS[0];
  const change = (next: Appearance) => {
    setAppearance(next);
    updateSettings(db, { appearance: next }).catch(() => {});
  };
  return (
    <>
      <SectionTitle title={t('Appearance')} value={t(current.label)} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <Segmented
          options={APPEARANCE_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
          value={appearance}
          onChange={change}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('System follows your iPhone’s light or dark setting.')}
        </ThemedText>
      </ThemedView>
    </>
  );
}

function ProSection() {
  const theme = useTheme();
  const t = useT();
  const { isPro, storeAvailable, busy, restore, manage } = usePro();
  const onRestore = async () => {
    const found = await restore();
    Alert.alert(
      found ? t('MileSprout Pro restored') : t('No subscription found'),
      found ? t('Your reports and exports are unlocked.') : t('This Apple Account doesn’t have MileSprout Pro.'),
    );
  };
  return (
    <>
      <SectionTitle title="MileSprout Pro" value={isPro ? 'Pro' : t('Free')} />
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="small" themeColor="textSecondary">
          {isPro
            ? t('Pro is active: the itemised report, the PDF and every export.')
            : t(
                'Free: every drive tracked, with no monthly limit, plus your totals and year-end summary. Pro adds the itemised report, the PDF and every export.',
              )}
        </ThemedText>
        {isPro ? (
          storeAvailable && (
            <Pressable accessibilityRole="button" onPress={manage} hitSlop={8}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {t('Manage subscription')}
              </ThemedText>
            </Pressable>
          )
        ) : (
          <GoldButton label={t('Upgrade to Pro')} onPress={() => router.push('/pro')} />
        )}
        {!isPro && storeAvailable && (
          <Pressable accessibilityRole="button" disabled={busy} onPress={onRestore} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Restore purchases')}
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </>
  );
}

/**
 * Settings → Invite friends: the gift and the perks on the brand green with a
 * big gold button, the sprout garden, and (for 30 days after install) a box
 * for a friend's code. The Founding driver badge shows here once earned.
 */
function InviteSection() {
  const theme = useTheme();
  const t = useT();
  const { invitesSent, redeemedCode, redeemStatus, perks } = useReferral();
  return (
    <>
      <View style={styles.rowBetween}>
        <ThemedText type="smallBold" accessibilityRole="header">
          {t('Invite friends')}
        </ThemedText>
        {perks.includes('founding-badge') && <FoundingBadge />}
      </View>
      <InviteHero compact />
      <SproutGarden />
      <ThemedView type="backgroundElement" style={styles.card}>
        {redeemedCode ? (
          <ThemedText type="small" themeColor="textSecondary">
            {redeemStatus === 'granted'
              ? t('You joined with {{code}}.', { code: redeemedCode })
              : t('You entered {{code}}. It’s confirmed once iCloud can check it.', { code: redeemedCode })}
          </ThemedText>
        ) : (
          <RedeemCode />
        )}
        <View style={styles.rowBetween}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Invites sent: {{count}}', { count: invitesSent })}
          </ThemedText>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/friends' as Href)}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('How it works ›')}
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 12, padding: Spacing.three },
  vehicleIcon: { fontSize: 24, lineHeight: 30 },
  vehicleMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  vehicleEditor: { gap: Spacing.two },
  spaced: { marginTop: Spacing.two },
  addPlace: { gap: Spacing.two },
  nameInput: { borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 16 },
  smallButton: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: 10 },
  loading: { flex: 1 },
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.three },
  links: { borderRadius: 12, padding: Spacing.one },
  groupTitle: { marginTop: Spacing.three, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  titleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1, gap: Spacing.half },
  // Stacked blocks in a card: not stretched, so the next one can't slide under it.
  stack: { gap: Spacing.half },
  purposeSetting: { gap: Spacing.two },
  day: { gap: Spacing.two },
  shift: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  time: {
    width: 80,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 16,
    textAlign: 'center',
  },
  button: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
