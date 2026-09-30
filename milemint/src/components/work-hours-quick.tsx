import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { WorkWeek } from '@/domain/classify-rules';
import { useTheme } from '@/hooks/use-theme';

/** One shift, the same on each chosen day: the quick version of Settings → Work hours. */
export type SimpleWeek = { days: readonly boolean[]; start: number; end: number };

/** Monday to Friday, 9 to 5. Days are indexed like Date#getDay (0 = Sunday). */
export const DEFAULT_SIMPLE_WEEK: SimpleWeek = {
  days: [false, true, true, true, true, true, false],
  start: 9 * 60,
  end: 17 * 60,
};

const STEP = 30;
const DAY_MINUTES = 24 * 60;
/** Shown Monday first; values are Date#getDay indexes. */
const DAY_CHIPS = [
  [1, 'M', 'Monday'],
  [2, 'T', 'Tuesday'],
  [3, 'W', 'Wednesday'],
  [4, 'T', 'Thursday'],
  [5, 'F', 'Friday'],
  [6, 'S', 'Saturday'],
  [0, 'S', 'Sunday'],
] as const;

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export function toWorkWeek(week: SimpleWeek): WorkWeek {
  const shift = { start: hhmm(week.start), end: hhmm(week.end) };
  return week.days.map((on) => (on ? [{ ...shift }] : []));
}

function formatTime(minutes: number, locale: string): string {
  return new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60).toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function WorkHoursQuick({
  value,
  onChange,
  locale,
}: {
  value: SimpleWeek;
  onChange: (next: SimpleWeek) => void;
  locale: string;
}) {
  const theme = useTheme();
  const shift = (key: 'start' | 'end', by: number) => {
    const next = (value[key] + by + DAY_MINUTES) % DAY_MINUTES;
    const other = key === 'start' ? value.end : value.start;
    // A shift has to last some time; skip over the other end.
    onChange({ ...value, [key]: next === other ? (next + by + DAY_MINUTES) % DAY_MINUTES : next });
  };

  const stepButton = (key: 'start' | 'end', label: string, by: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${by < 0 ? 'earlier' : 'later'}`}
      hitSlop={6}
      onPress={() => shift(key, by)}
      style={[styles.stepButton, { backgroundColor: theme.accent + '1F' }]}>
      <ThemedText type="smallBold" style={{ color: theme.accent }}>
        {by < 0 ? '−' : '+'}
      </ThemedText>
    </Pressable>
  );

  const stepper = (key: 'start' | 'end', label: string) => (
    <View style={styles.stepperRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.stepperLabel}>
        {label}
      </ThemedText>
      <View style={styles.stepper}>
        {stepButton(key, label, -STEP)}
        <ThemedText type="smallBold" style={styles.time} accessibilityLiveRegion="polite">
          {formatTime(value[key], locale)}
        </ThemedText>
        {stepButton(key, label, STEP)}
      </View>
    </View>
  );

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.days} accessibilityRole="toolbar">
        {DAY_CHIPS.map(([day, letter, name]) => {
          const on = value.days[day];
          return (
            <Pressable
              key={day}
              accessibilityRole="checkbox"
              accessibilityLabel={name}
              accessibilityState={{ checked: on }}
              onPress={() => onChange({ ...value, days: value.days.map((d, i) => (i === day ? !d : d)) })}
              style={[
                styles.day,
                on
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : { backgroundColor: 'transparent', borderColor: theme.backgroundSelected },
              ]}>
              <ThemedText type="smallBold" style={{ color: on ? theme.onAccent : theme.textSecondary }}>
                {letter}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {stepper('start', 'Start')}
      {stepper('end', 'Finish')}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.three },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepperLabel: { width: 56 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stepButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  time: { minWidth: 84, textAlign: 'center' },
});
