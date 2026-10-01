import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** Dates are local calendar days as YYYY-MM-DD, like Trip#localDate. */
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** A month grid: tap a day to pick it. Days outside `min`…`max` can't be picked. */
export function CalendarPicker({
  value,
  onChange,
  min,
  max,
  locale,
  weekStartsOn,
}: {
  value: string;
  onChange: (date: string) => void;
  min: string;
  max: string;
  locale: string;
  /** 0 = Sunday (US, Canada), 1 = Monday (UK, Australia). */
  weekStartsOn: 0 | 1;
}) {
  const theme = useTheme();
  const t = useT();
  const [year, month] = value.split('-').map(Number);
  const [shown, setShown] = useState({ year, month: month - 1 });

  const first = new Date(shown.year, shown.month, 1);
  const daysInMonth = new Date(shown.year, shown.month + 1, 0).getDate();
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const move = (by: number) => {
    const next = new Date(shown.year, shown.month + by, 1);
    setShown({ year: next.getFullYear(), month: next.getMonth() });
  };
  const canBack = iso(shown.year, shown.month, 1) > min;
  const canForward = iso(shown.year, shown.month, daysInMonth) < max;

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    // 2023-01-01 was a Sunday.
    new Date(2023, 0, 1 + ((i + weekStartsOn) % 7)).toLocaleDateString(locale, { weekday: 'narrow' }),
  );
  const title = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const arrow = (by: number, enabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={by < 0 ? t('Previous month') : t('Next month')}
      disabled={!enabled}
      hitSlop={10}
      onPress={() => move(by)}
      style={[styles.arrow, { opacity: enabled ? 1 : 0.25 }]}>
      <ThemedText type="subtitle" style={{ color: theme.accent }}>
        {by < 0 ? '‹' : '›'}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {arrow(-1, canBack)}
        <ThemedText type="smallBold" accessibilityRole="header">
          {title}
        </ThemedText>
        {arrow(1, canForward)}
      </View>
      <View style={styles.row}>
        {weekdays.map((day, i) => (
          <ThemedText key={i} type="small" themeColor="textSecondary" style={styles.weekday}>
            {day}
          </ThemedText>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={styles.row}>
          {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
            if (day === null) return <View key={i} style={styles.cell} />;
            const date = iso(shown.year, shown.month, day);
            const selected = date === value;
            const today = date === max;
            const allowed = date >= min && date <= max;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={new Date(shown.year, shown.month, day).toLocaleDateString(locale, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                accessibilityState={{ selected, disabled: !allowed }}
                disabled={!allowed}
                onPress={() => onChange(date)}
                style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    selected && { backgroundColor: theme.accent },
                    !selected && today && { borderColor: theme.accent, borderWidth: 1.5 },
                  ]}>
                  <ThemedText
                    type={selected || today ? 'smallBold' : 'small'}
                    style={{
                      color: selected ? theme.onAccent : allowed ? theme.text : theme.textSecondary,
                      opacity: allowed ? 1 : 0.35,
                    }}>
                    {day}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.one },
  arrow: { paddingHorizontal: Spacing.two },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
