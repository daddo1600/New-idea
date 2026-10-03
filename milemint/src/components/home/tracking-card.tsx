import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import type { WorkWeek } from '@/domain/classify-rules';
import type { Region } from '@/domain/regions';
import { displayLocale } from '@/domain/regions';
import { currentShift } from '@/domain/week-strip';
import type { TrackingStatus } from '@/tracking/background';

import { LiveDot } from './live-dot';

const TRACKING_MESSAGES: Record<Exclude<TrackingStatus, 'on'>, { title: string; body: string }> = {
  'needs-permission': {
    title: msg('Automatic logging is off'),
    body: msg('Allow location access and MileSprout logs every drive for you.'),
  },
  'needs-always': {
    title: msg('Drives may be missed'),
    body: msg('Location is set to “While Using”. Switch it to “Always” so drives are logged when the app is closed.'),
  },
  off: { title: msg('Automatic logging is paused'), body: msg('Turn it back on to keep logging drives.') },
  unsupported: {
    title: msg('Preview mode'),
    body: msg('Automatic logging runs on your iPhone. Add a trip from the Drives tab to try the app here.'),
  },
};
/** "17:00" (or "5:00 PM"), from a "HH:MM" clock. */
function clockLabel(clock: string, region: Region): string {
  const [h, m] = clock.split(':').map(Number);
  return new Date(2026, 0, 1, h, m).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
}

/**
 * Home's logging status, as one tidy row. Logging on: the pulsing "Counting
 * your miles" pill (never "tracking": it's the money being counted, not the
 * person), with one small chip on the right only when something's worth
 * knowing: "Until 17:00" while work hours run, "Outside work hours" after
 * them. Nothing on the right otherwise. Logging off or limited: the problem
 * in a pill and a "Turn on" chip, the whole row one tap to fix it. The longer
 * explanations are the VoiceOver hint, not more lines on Home.
 */
export function TrackingCard({
  status,
  working,
  workWeek = null,
  now,
  region,
}: {
  status: TrackingStatus | null;
  working: boolean;
  workWeek?: WorkWeek | null;
  /** The time to check work hours at (Home's minute tick). */
  now?: number;
  region?: Region;
}) {
  const theme = useTheme();
  const t = useT();
  if (!status) return null;
  if (status === 'on') {
    // Permission is fine but tracking isn't (stopped, Precise Location off): the health card above says so.
    if (!working) return null;
    const at = now === undefined ? null : new Date(now);
    const shift =
      workWeek && at ? currentShift(workWeek, at.getDay(), at.getHours() * 60 + at.getMinutes()) : null;
    const label = shift ? t('Work hours') : region?.unit === 'km' ? t('Counting your km') : t('Counting your miles');
    const until = shift && region ? clockLabel(shift.end, region) : null;
    // Only what's worth knowing goes on the right.
    const chip = until
      ? { icon: '🕔', text: t('Until {{time}}', { time: until }) }
      : workWeek
        ? { icon: '🌙', text: t('Outside work hours') }
        : null;
    return (
      <View
        style={styles.row}
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          until ? `${label}. ${t('Until {{time}}. Drives now count as work.', { time: until })}` : chip ? `${label}. ${chip.text}` : label
        }
        accessibilityHint={t('Drives are saved when you park.')}>
        <View style={[styles.pill, { backgroundColor: theme.accent + '1F' }]}>
          <LiveDot color={theme.accent} />
          <ThemedText type="smallBold" numberOfLines={1} style={[styles.shrink, { color: theme.accent }]}>
            {label}
          </ThemedText>
        </View>
        {chip && (
          <View style={styles.chip}>
            <ThemedText type="small" style={styles.chipIcon}>
              {chip.icon}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.shrink}>
              {chip.text}
            </ThemedText>
          </View>
        )}
      </View>
    );
  }
  const message = TRACKING_MESSAGES[status];
  const fixable = status !== 'unsupported';
  const pill = (
    <View style={[styles.pill, styles.shrinkPill, { backgroundColor: theme.warning + '24' }]}>
      <View style={[styles.warnDot, { backgroundColor: theme.warning }]} />
      <ThemedText type="smallBold" numberOfLines={1} style={styles.shrink}>
        {t(message.title)}
      </ThemedText>
    </View>
  );
  if (!fixable) {
    return (
      <View style={styles.row} accessible accessibilityLabel={t(message.title)} accessibilityHint={t(message.body)}>
        {pill}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t(message.title)}. ${t('Turn on')}`}
      accessibilityHint={t(message.body)}
      onPress={() => router.push('/setup-tracking')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {pill}
      <View style={[styles.turnOn, { backgroundColor: theme.accent }]}>
        <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.onAccent }}>
          {t('Turn on')} ›
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // One line: the pill on the left, at most one chip on the right.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    minHeight: 36,
  },
  pressed: { opacity: 0.7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    flexShrink: 1,
  },
  shrinkPill: { flexShrink: 1 },
  shrink: { flexShrink: 1 },
  warnDot: { width: 8, height: 8, borderRadius: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexShrink: 1 },
  chipIcon: { fontSize: 13 },
  turnOn: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2 },
});
