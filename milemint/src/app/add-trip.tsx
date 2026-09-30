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
import { milesToMeters, toLocalIsoDate } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';

type Kind = 'business' | 'personal';

export default function AddTripScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [date, setDate] = useState(() => toLocalIsoDate(new Date()));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [kind, setKind] = useState<Kind>('business');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const parsedMiles = parseMiles(miles);
    if (!isValidIsoDate(date)) return setError('Enter the date as YYYY-MM-DD.');
    if (!from.trim() || !to.trim()) return setError('Enter where you drove from and to.');
    if (parsedMiles === null) return setError('Enter the miles driven, e.g. 12.5.');
    if (kind === 'business' && !purpose.trim()) {
      return setError('The IRS needs a business purpose, e.g. "Client meeting".');
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
        distanceMeters: milesToMeters(parsedMiles),
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
          <TextInput style={inputStyle} value={date} onChangeText={setDate} inputMode="numeric" />
        </Field>
        <Field label="From">
          <TextInput style={inputStyle} value={from} onChangeText={setFrom} placeholder="Home" />
        </Field>
        <Field label="To">
          <TextInput style={inputStyle} value={to} onChangeText={setTo} placeholder="Client office" />
        </Field>
        <Field label="Miles">
          <TextInput
            style={inputStyle}
            value={miles}
            onChangeText={setMiles}
            inputMode="decimal"
            placeholder="12.5"
          />
        </Field>
        <Field label={kind === 'business' ? 'Business purpose' : 'Note (optional)'}>
          <TextInput
            style={inputStyle}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Client meeting"
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
