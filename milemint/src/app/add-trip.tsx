import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { insertTrip } from '@/db/trips-repo';
import { isValidIsoDate, parseMiles } from '@/domain/format';
import { earliestDate, formatDistance, fromUnits } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';

type Kind = 'business' | 'personal';

/** One manual entry longer than this (about 1,000 miles) is almost certainly a typo. */
const MAX_TRIP_METERS = 1_610_000;

export default function AddTripScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [date, setDate] = useState(() => toLocalIsoDate(new Date()));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { region } = useRegion();
  const unitName = region.unit === 'mi' ? 'miles' : 'kilometres';
  const [distance, setDistance] = useState('');
  const [purpose, setPurpose] = useState('');
  const [kind, setKind] = useState<Kind>('business');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /** Clears a shown error as soon as the user starts fixing it. */
  const edited = (set: (value: string) => void) => (value: string) => {
    setError(null);
    set(value);
  };

  const save = async () => {
    const parsed = parseMiles(distance);
    const meters = parsed === null ? null : fromUnits(parsed, region);
    const earliest = earliestDate(region);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Enter the date as YYYY-MM-DD.');
    if (!isValidIsoDate(date)) return setError('That date doesn’t exist. Check the month and day.');
    if (date > toLocalIsoDate(new Date())) return setError('That date is in the future. Add trips you’ve already made.');
    if (date < earliest) return setError(`MileMint covers trips from ${earliest.slice(0, 4)} onwards.`);
    if (!from.trim() || !to.trim()) return setError('Enter where you drove from and to.');
    if (meters === null) return setError(`Enter the ${unitName} driven, e.g. 12.5.`);
    if (meters > MAX_TRIP_METERS) {
      return setError(`${formatDistance(meters, region)} is more than one trip should be. Check for an extra digit.`);
    }
    if (kind === 'business' && !purpose.trim()) {
      return setError(`${region.authority} needs a business purpose, e.g. "Client meeting".`);
    }
    setError(null);
    setSaving(true);
    try {
      await insertTrip(db, {
        // Manual trips have no clock time; noon local keeps the UTC stamp on the same day.
        startedAt: new Date(`${date}T12:00:00`).toISOString(),
        localDate: date,
        endedAt: null,
        startLabel: from.trim(),
        endLabel: to.trim(),
        distanceMeters: meters,
        classification: kind,
        purpose: purpose.trim(),
        source: 'manual',
      });
      router.back();
    } catch {
      setError('Could not save the trip. Please try again.');
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.backgroundElement },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Segmented
          options={[
            { value: 'business', label: 'Business' },
            { value: 'personal', label: 'Personal' },
          ]}
          value={kind}
          onChange={setKind}
        />
        <Field label="Date (YYYY-MM-DD)">
          <TextInput style={inputStyle} placeholderTextColor={theme.textSecondary} value={date} onChangeText={edited(setDate)} keyboardType="numbers-and-punctuation" />
        </Field>
        <Field label="From">
          <TextInput style={inputStyle} placeholderTextColor={theme.textSecondary} value={from} onChangeText={edited(setFrom)} placeholder="Home" />
        </Field>
        <Field label="To">
          <TextInput style={inputStyle} placeholderTextColor={theme.textSecondary} value={to} onChangeText={edited(setTo)} placeholder="Client office" />
        </Field>
        <Field label={unitName === 'miles' ? 'Miles' : 'Kilometres'}>
          <TextInput
            style={inputStyle}
            placeholderTextColor={theme.textSecondary}
            value={distance}
            onChangeText={edited(setDistance)}
            inputMode="decimal"
            placeholder="12.5"
          />
        </Field>
        <Field label={kind === 'business' ? 'Business purpose' : 'Note (optional)'}>
          <TextInput
            style={inputStyle}
            placeholderTextColor={theme.textSecondary}
            value={purpose}
            onChangeText={edited(setPurpose)}
            placeholder={kind === 'business' ? 'Client meeting' : 'Optional'}
          />
        </Field>
        {error && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={save}
          style={[styles.save, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {saving ? 'Saving…' : 'Save trip'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  field: { gap: Spacing.one },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  save: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
