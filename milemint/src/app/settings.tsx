import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { GoldButton } from '@/components/gold-button';
import { EMPTY_PLACE, PlaceField, resolvePlace, type PlaceDraft } from '@/components/place-field';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deletePlace, insertPlace, listPlaces } from '@/db/places-repo';
import { loadSettings, saveSettings, type AppSettings } from '@/db/settings-repo';
import { isValidShift, type WorkShift } from '@/domain/classify-rules';
import { FREE_AUTO_DRIVES_PER_MONTH } from '@/domain/plan';
import { vehicleRule } from '@/domain/regions';
import type { Place, PlaceKind } from '@/domain/places';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import {
  cancelWorkHoursNudge,
  disableWeeklyReminder,
  enableWeeklyReminder,
  REMINDERS_SUPPORTED,
} from '@/reminders/weekly';

/** Monday first, as people read a work week; values are `Date.getDay()` indexes. */
const DAYS = [
  [1, 'Mon'],
  [2, 'Tue'],
  [3, 'Wed'],
  [4, 'Thu'],
  [5, 'Fri'],
  [6, 'Sat'],
  [0, 'Sun'],
] as const;

const KIND_LABELS: Record<PlaceKind, string> = {
  home: 'Home',
  work: 'Work',
  client: 'Client',
  other: 'Other',
};

const NEW_SHIFT: WorkShift = { start: '09:00', end: '17:00' };
/** A second shift that day, pre-filled so it's clearly editable rather than a hint. */
const EXTRA_SHIFT: WorkShift = { start: '18:00', end: '22:00' };

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
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
        text: `Check ${invalid.map(([, name]) => name).join(', ')}: use 24-hour times like 09:00, and an end different from the start.`,
      });
    }
    // Keep the other settings (such as the region) as they are.
    const settings: AppSettings = { ...(await loadSettings(db)), workHoursEnabled: enabled, workWeek: week };
    try {
      await saveSettings(db, settings);
      if (enabled) cancelWorkHoursNudge().catch(() => {});
      setMessage({ error: false, text: 'Saved. New drives will use these hours.' });
    } catch {
      setMessage({ error: true, text: 'Could not save. Please try again.' });
    }
  };

  const confirmDelete = (place: Place) =>
    Alert.alert(`Delete “${place.name}”?`, 'Past trips keep their names.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePlace(db, place.id);
          setPlaces(await listPlaces(db));
        },
      },
    ]);

  const inputStyle = [styles.time, { color: theme.text, backgroundColor: theme.background }];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProSection />

        <CountrySection />

        <DrivingSection />

        {REMINDERS_SUPPORTED && <ReminderSection />}

        <ThemedText type="smallBold">Work hours</ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">Classify by work hours</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Drives that start during your hours are marked business, others personal. Your usual
                routes and commutes take priority.
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel="Classify by work hours"
              value={enabled}
              onValueChange={(value) => {
                setMessage(null);
                setEnabled(value);
              }}
              trackColor={{ true: theme.accent }}
            />
          </View>

          {enabled &&
            DAYS.map(([weekday, name]) => {
              const shifts = week[weekday];
              return (
                <View key={weekday} style={styles.day}>
                  <View style={styles.rowBetween}>
                    <ThemedText type="smallBold">{name}</ThemedText>
                    <Switch
                      accessibilityLabel={`Work on ${name}`}
                      value={shifts.length > 0}
                      onValueChange={(on) => updateDay(weekday, on ? [{ ...NEW_SHIFT }] : [])}
                      trackColor={{ true: theme.accent }}
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
                          accessibilityLabel={`${name} shift ${index + 1} start`}
                          style={inputStyle}
                          value={shift.start}
                          onChangeText={(start) => setShift({ ...shift, start })}
                          placeholder="09:00"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numbers-and-punctuation"
                          maxLength={5}
                        />
                        <ThemedText type="small" themeColor="textSecondary">
                          to
                        </ThemedText>
                        <TextInput
                          accessibilityLabel={`${name} shift ${index + 1} end`}
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
                            accessibilityLabel={`Remove ${name} shift ${index + 1}`}
                            hitSlop={8}
                            onPress={() => updateDay(weekday, shifts.filter((_, i) => i !== index))}>
                            <ThemedText type="small" themeColor="danger">
                              Remove
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
                        Add shift
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              );
            })}

          {enabled && (
            <ThemedText type="small" themeColor="textSecondary">
              24-hour times. A shift like 22:00 to 02:00 runs past midnight.
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
              Save work hours
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText type="smallBold">Places</ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          {places.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              No places yet. Add one below, or open a trip and tap “Save as place”.
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
                    {KIND_LABELS[place.kind]}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${place.name}`}
                  hitSlop={8}
                  onPress={() => confirmDelete(place)}>
                  <ThemedText type="small" themeColor="danger">
                    Delete
                  </ThemedText>
                </Pressable>
              </Pressable>
            ))
          )}
          <AddPlace onAdded={async () => setPlaces(await listPlaces(db))} />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

/** Settings → Places: name a spot and find it by address, from Apple Maps suggestions. */
function AddPlace({ onAdded }: { onAdded: () => void }) {
  const db = useSQLiteContext();
  const theme = useTheme();
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
          + Add a place
        </ThemedText>
      </Pressable>
    );
  }

  const save = async () => {
    if (!name.trim()) return setError('Give the place a name, e.g. “Acme HQ”.');
    if (!where.text.trim()) return setError('Search for its address, or use “I’m here now”.');
    setError(null);
    setSaving(true);
    try {
      await insertPlace(db, { name: name.trim(), kind, at: await resolvePlace(where) });
      setOpen(false);
      setName('');
      setWhere(EMPTY_PLACE);
      onAdded();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Couldn’t save the place. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.addPlace}>
      <TextInput
        accessibilityLabel="Place name"
        value={name}
        onChangeText={setName}
        placeholder="Name, e.g. Acme HQ"
        placeholderTextColor={theme.textSecondary}
        style={[styles.nameInput, { color: theme.text, backgroundColor: theme.background }]}
      />
      <Segmented
        options={(['home', 'work', 'client', 'other'] as const).map((value) => ({ value, label: KIND_LABELS[value] }))}
        value={kind}
        onChange={setKind}
      />
      <PlaceField label="Address" placeholder="Search an address or place" value={where} onChange={setWhere} />
      {error && (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      )}
      <View style={styles.rowBetween}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setOpen(false)}>
          <ThemedText type="small" themeColor="textSecondary">
            Cancel
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={save}
          style={[styles.smallButton, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {saving ? 'Saving…' : 'Save place'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function ReminderSection() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { region } = useRegion();
  const [on, setOn] = useState<boolean | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    loadSettings(db).then((settings) => setOn(settings.weeklyReminder), () => setOn(false));
  }, [db]);

  const change = async (value: boolean) => {
    setNote(null);
    const scheduled = value ? await enableWeeklyReminder(region.unit) : (await disableWeeklyReminder(), false);
    if (value && !scheduled) {
      setNote('Notifications are off for MileMint. Turn them on in iPhone Settings → Notifications.');
    }
    setOn(scheduled);
    await saveSettings(db, { ...(await loadSettings(db)), weeklyReminder: scheduled });
  };

  return (
    <>
      <ThemedText type="smallBold">Reminders</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">Weekly reminder</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              A (slightly cheeky) nudge on Sunday evening to sort the week’s drives.
            </ThemedText>
          </View>
          <Switch
            accessibilityLabel="Weekly reminder"
            disabled={on === null}
            value={on ?? false}
            onValueChange={change}
            trackColor={{ true: theme.accent }}
          />
        </View>
        {note && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {note}
          </ThemedText>
        )}
      </ThemedView>
    </>
  );
}

/** What you drive (priced per vehicle) and shift mode for couriers. */
function DrivingSection() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { region } = useRegion();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings(db).then(setSettings, () => {});
  }, [db]);
  if (!settings) return null;

  const change = async (changes: Partial<AppSettings>) => {
    const next = { ...(await loadSettings(db)), ...changes };
    setSettings(next);
    await saveSettings(db, next);
  };

  return (
    <>
      <ThemedText type="smallBold">Your driving</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Vehicle</ThemedText>
        <Segmented
          options={(['car', 'motorbike', 'bicycle'] as const).map((value) => ({
            value,
            label: value === 'car' ? 'Car or van' : value === 'motorbike' ? 'Motorbike' : 'Bicycle',
          }))}
          value={settings.vehicle}
          onChange={(vehicle) => change({ vehicle })}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {vehicleRule(region, settings.vehicle)}. New drives use this; change any trip on its own screen.
        </ThemedText>
        {settings.vehicle === 'car' && (
          <ThemedText type="small" themeColor="textSecondary">
            Petrol, diesel, hybrid or electric: the same rate applies to a car or van you own. Company cars
            follow different rules.
          </ThemedText>
        )}
        <View style={[styles.rowBetween, styles.spaced]}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">New drives start as business</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Unless a rule says otherwise (work hours, a commute, a route you’ve taught it). Swipe left on any
              that were personal; only business drives should be claimed.
            </ThemedText>
          </View>
          <Switch
            accessibilityLabel="New drives start as business"
            value={settings.defaultBusiness}
            onValueChange={(defaultBusiness) => change({ defaultBusiness })}
            trackColor={{ true: theme.accent }}
          />
        </View>
        <View style={[styles.rowBetween, styles.spaced]}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">Shift mode</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              For delivery and gig drivers: a Start shift button on the home screen. Every drive in a shift
              is business, and a whole shift counts as one drive on the free plan.
            </ThemedText>
          </View>
          <Switch
            accessibilityLabel="Shift mode"
            value={settings.shiftMode}
            onValueChange={(shiftMode) => change({ shiftMode })}
            trackColor={{ true: theme.accent }}
          />
        </View>
      </ThemedView>
    </>
  );
}

function CountrySection() {
  const theme = useTheme();
  const { region } = useRegion();
  return (
    <>
      <ThemedText type="smallBold">Country</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <ThemedText type="smallBold">
              {region.flag} {region.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {region.rule}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change country"
            hitSlop={8}
            onPress={() => router.push('/region')}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Change
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}

function ProSection() {
  const theme = useTheme();
  const { isPro, storeAvailable, busy, restore, manage } = usePro();
  const onRestore = async () => {
    const found = await restore();
    Alert.alert(
      found ? 'MileMint Pro restored' : 'No subscription found',
      found ? 'Every drive is unlocked.' : 'This Apple Account doesn’t have MileMint Pro.',
    );
  };
  return (
    <>
      <ThemedText type="smallBold">MileMint Pro</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="small" themeColor="textSecondary">
          {isPro
            ? 'Pro is active: unlimited automatic drives.'
            : `Free plan: ${FREE_AUTO_DRIVES_PER_MONTH} automatic drives a month, unlimited manual trips and CSV export.`}
        </ThemedText>
        {isPro ? (
          storeAvailable && (
            <Pressable accessibilityRole="button" onPress={manage} hitSlop={8}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                Manage subscription
              </ThemedText>
            </Pressable>
          )
        ) : (
          <GoldButton label="Upgrade to Pro" onPress={() => router.push('/pro')} />
        )}
        {!isPro && storeAvailable && (
          <Pressable accessibilityRole="button" disabled={busy} onPress={onRestore} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Restore purchases
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
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
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  flex: { flex: 1, gap: Spacing.half },
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
