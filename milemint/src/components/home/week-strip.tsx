import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { displayLocale, formatDistance, formatMoney, type Region } from '@/domain/regions';
import type { Week, WeekDay } from '@/domain/week-strip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

const BAR_HEIGHT = 56;

/**
 * "This week" on Home: a column a day, Monday to Sunday, growing with each
 * work drive. Work days are shaded when work hours are on; today stands out.
 * Nothing to tap: it fills itself in as drives are logged.
 */
export function WeekStrip({ week, region }: { week: Week; region: Region }) {
  const theme = useTheme();
  const t = useT();
  const most = Math.max(...week.days.map((day) => day.meters));
  const total = t('{{money}} · {{distance}}', {
    money: formatMoney(week.money, region),
    distance: formatDistance(week.meters, region),
  });
  return (
    <ThemedView
      type="backgroundElement"
      style={styles.card}
      accessible
      accessibilityLabel={
        week.meters > 0
          ? t('This week: {{total}} of work driving.', { total })
          : t('This week: no work drives yet.')
      }>
      <View style={styles.header}>
        <ThemedText type="smallBold">{t('This week')}</ThemedText>
        {week.meters > 0 && (
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {total}
          </ThemedText>
        )}
      </View>
      <View style={styles.columns}>
        {week.days.map((day, index) => (
          <Column key={day.date} day={day} index={index} most={most} region={region} />
        ))}
      </View>
      {week.meters === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('Your week starts here. Each work drive fills in its day.')}
        </ThemedText>
      )}
    </ThemedView>
  );
}

function Column({ day, index, most, region }: { day: WeekDay; index: number; most: number; region: Region }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const target = day.meters > 0 && most > 0 ? Math.max(6, (day.meters / most) * BAR_HEIGHT) : 0;
  const height = useSharedValue(reduceMotion ? target : 0);
  useEffect(() => {
    // Grows into place, one day after another; a new drive grows its day.
    height.set(reduceMotion ? target : withDelay(index * 45, withTiming(target, { duration: 520 })));
  }, [height, target, index, reduceMotion]);
  const barStyle = useAnimatedStyle(() => ({ height: height.value }));
  const letter = new Date(`${day.date}T12:00:00`).toLocaleDateString(displayLocale(region), { weekday: 'narrow' });
  return (
    <View
      style={[
        styles.column,
        day.isWorkDay && { backgroundColor: theme.accent + '0C' },
        day.isFuture && styles.future,
      ]}>
      <View style={styles.track}>
        {day.meters === 0 && <View style={[styles.empty, { backgroundColor: theme.textSecondary + '40' }]} />}
        <Animated.View
          style={[styles.bar, { backgroundColor: theme.accent, opacity: day.isToday ? 1 : 0.55 }, barStyle]}
        />
      </View>
      <ThemedText
        type={day.isToday ? 'smallBold' : 'small'}
        themeColor={day.isToday ? undefined : 'textSecondary'}
        style={day.isToday && { color: theme.accent }}>
        {letter}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Spacing.two },
  columns: { flexDirection: 'row', gap: Spacing.one },
  column: { flex: 1, alignItems: 'center', gap: Spacing.one, borderRadius: 10, paddingTop: Spacing.two, paddingBottom: 2 },
  future: { opacity: 0.45 },
  track: { height: BAR_HEIGHT, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: 16, borderRadius: 6 },
  empty: { width: 16, height: 3, borderRadius: 2 },
});
