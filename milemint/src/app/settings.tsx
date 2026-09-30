import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { deletePlace, listPlaces } from '@/db/places-repo';
import { loadSettings, saveSettings, type AppSettings } from '@/db/settings-repo';
import { isValidShift, type WorkShift } from '@/domain/classify-rules';
import type { Place, PlaceKind } from '@/domain/places';
import { useTheme } from '@/hooks/use-theme';

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
    const settings: AppSettings = { workHoursEnabled: enabled, workWeek: week };
    try {
      await saveSettings(db, settings);
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
                          inputMode="numeric"
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
                          inputMode="numeric"
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
                      onPress={() => updateDay(weekday, [...shifts, { start: '', end: '' }])}>
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
              No places yet. Open a trip and tap “Save as place” to name where it started or ended.
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
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
