import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
    title: msg('Automatic tracking is off'),
    body: msg('Allow location access and MileSprout logs every drive for you.'),
  },
  'needs-always': {
    title: msg('Drives may be missed'),
    body: msg('Location is set to “While Using”. Switch it to “Always” so drives are logged when the app is closed.'),
  },
  off: { title: msg('Automatic tracking is paused'), body: msg('Turn it back on to keep logging drives.') },
  unsupported: {
    title: msg('Preview mode'),
    body: msg('Automatic tracking runs on your iPhone. Add a trip from the Drives tab to try the app here.'),
  },
};
/** "17:00" (or "5:00 PM"), from a "HH:MM" clock. */
function clockLabel(clock: string, region: Region): string {
  const [h, m] = clock.split(':').map(Number);
  return new Date(2026, 0, 1, h, m).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
}

/**
 * "Counting your miles" (never "tracking": it's the money being counted, not the person), or what to do to get there. With work hours on, it says
 * whether they're running now ("Work hours · until 17:00"), so set-hours
 * workers see the app working for them without having to do anything.
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
    return (
      <View style={styles.trackingOn} accessibilityRole="text">
        <View style={[styles.livePill, { backgroundColor: theme.accent + '1F' }]}>
          <LiveDot color={theme.accent} />
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {shift ? t('Work hours') : region?.unit === 'km' ? t('Counting your km') : t('Counting your miles')}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
          {shift && region
            ? t('Until {{time}}. Drives now count as work.', { time: clockLabel(shift.end, region) })
            : workWeek
              ? t('Outside work hours. Drives are saved when you park.')
              : t('Every work drive is money back at tax time.')}
        </ThemedText>
      </View>
    );
  }
  const message = TRACKING_MESSAGES[status];
  return (
    <ThemedView type="backgroundElement" style={[styles.trackingCard, { borderColor: theme.accent }]}>
      <ThemedText type="smallBold">{t(message.title)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t(message.body)}
      </ThemedText>
      {status !== 'unsupported' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/setup-tracking')}
          style={[styles.trackingButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Turn on')}
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: Spacing.one },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  trackingOn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.one },
  trackingCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  trackingButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
  },
});
