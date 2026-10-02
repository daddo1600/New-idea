import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { TrackingGap } from '@/domain/tracker-policy';
import type { HealthIssue, TrackingHealth } from '@/domain/tracking-health';
import { displayLocale, formatDistance, type Region } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import { askForMotion, motionStatus } from '@/tracking/motion';
import { useTrackingHealth } from '@/tracking/use-tracking-health';

/**
 * "You'll know if a mile was missed." The home screen's plain-words warning
 * when automatic tracking isn't really working, with the one tap that fixes
 * it, and the offer to add a drive tracking lost.
 *
 * Location permission ("Allow", "Always") is already the tracking card's job
 * further down, so this card covers what that one can't see.
 */

type Fix = 'settings' | 'restart';

const ISSUES: Partial<Record<HealthIssue, { title: string; body: string; fix: Fix }>> = {
  'precise-location-off': {
    title: msg('Precise Location is off'),
    body: msg(
      'MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location.',
    ),
    fix: 'settings',
  },
  'tracking-stopped': {
    title: msg('Tracking has stopped'),
    body: msg('Automatic tracking stopped running, so new drives aren’t being logged.'),
    fix: 'restart',
  },
  stale: {
    title: msg('Tracking may have stopped'),
    body: msg('No location since {{time}}, in the middle of a drive.'),
    fix: 'restart',
  },
};

const WARNING = '#CA8A04';

/** A time on screen: "14:10", or "Tue 14:10" when it isn't today (and isn't the same day as `sameDayAs`). */
export function formatMoment(at: number, region: Region, now: number, sameDayAs?: number): string {
  const locale = displayLocale(region);
  const day = (ms: number) => toLocalIsoDate(new Date(ms));
  const showDay = day(at) !== day(sameDayAs ?? now);
  const old = now - at > 6 * 86_400_000;
  return new Date(at).toLocaleString(locale, {
    ...(showDay ? (old ? { day: 'numeric', month: 'short' } : { weekday: 'short' }) : {}),
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Home's card; `state` comes from home's own useTrackingHealth, which also decides whether "Tracking on" shows. */
export function TrackingHealthCard({ state }: { state: ReturnType<typeof useTrackingHealth> }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const { health, checkedAt: now, restart, dismissGap, labelGap } = state;
  const [busy, setBusy] = useState(false);

  if (!health) return null;
  const issue = ISSUES[health.issue];

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } finally {
      setBusy(false);
    }
  };

  if (issue) {
    const fix = () =>
      run(async () => {
        if (issue.fix === 'settings') await Linking.openSettings();
        // No fix right now (indoors, or permission changed meanwhile): the full set-up explains.
        else await restart().catch(() => router.push('/setup-tracking'));
      });
    return (
      <ThemedView
        type="backgroundElement"
        accessibilityRole="alert"
        style={[styles.card, { borderColor: theme.danger }]}>
        <ThemedText type="smallBold">{t(issue.title)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t(issue.body, { time: health.lastSeenAt ? formatMoment(health.lastSeenAt, region, now) : '–' })}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={fix}
          style={[styles.button, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {issue.fix === 'settings' ? t('Open Settings') : t('Turn tracking back on')}
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const gap = health.gap;
  if (!gap || (health.issue !== 'gap' && health.issue !== 'ok')) return null;
  const params = {
    from: formatMoment(gap.fromAt, region, now),
    to: formatMoment(gap.toAt, region, now, gap.fromAt),
    distance: formatDistance(gap.distanceM, region, { whole: gap.distanceM >= 10_000 }),
  };
  const addTrip = () =>
    run(async () => {
      const labels = await labelGap(gap).catch(() => ({ from: '', to: '' }));
      router.push({ pathname: '/add-trip', params: addTripParams(gap, labels) } as Href);
    });
  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: WARNING }]}>
      <ThemedText type="smallBold">
        {gap.reason === 'cut' ? t('Tracking stopped {{from}}–{{to}}', params) : t('A drive may have been missed')}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {gap.reason === 'cut'
          ? t('About {{distance}} may be missing. Add the missed trip?', params)
          : t(
              'Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip?',
              params,
            )}
      </ThemedText>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={addTrip}
          style={[styles.button, styles.inline, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Add missed trip')}
          </ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" hitSlop={8} disabled={busy} onPress={() => run(() => dismissGap(gap))}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {t('Not a drive')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

/** What the add-trip form is pre-filled with (route params are strings). */
function addTripParams(gap: TrackingGap, labels: { from: string; to: string }): Record<string, string> {
  // A cut drive has known times; for a missed one only "sometime before now" is known.
  const day = toLocalIsoDate(new Date(gap.reason === 'cut' ? gap.fromAt : gap.toAt));
  return {
    gap: gap.id,
    date: day,
    fromLabel: labels.from,
    fromLat: String(gap.from.latitude),
    fromLng: String(gap.from.longitude),
    toLabel: labels.to,
    toLat: String(gap.to.latitude),
    toLng: String(gap.to.longitude),
    ...(gap.reason === 'cut'
      ? { startedAt: new Date(gap.fromAt).toISOString(), endedAt: new Date(gap.toAt).toISOString() }
      : {}),
  };
}

const STATUS: Record<HealthIssue, string> = {
  ok: msg('All good'),
  off: msg('Automatic tracking is paused'),
  'needs-permission': msg('Automatic tracking is off'),
  'needs-always': msg('Drives may be missed'),
  'precise-location-off': msg('Precise Location is off'),
  'tracking-stopped': msg('Tracking has stopped'),
  stale: msg('Tracking may have stopped'),
  gap: msg('A drive may have been missed'),
};

/** "3 minutes ago", for the Settings check. */
function ago(at: number, now: number, t: ReturnType<typeof useT>): string {
  const minutes = Math.max(0, Math.floor((now - at) / 60_000));
  if (minutes < 1) return t('just now');
  if (minutes < 60) return t('{{count}} minutes ago', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return t('{{count}} hours ago', { count: hours });
  return t('{{count}} days ago', { count: Math.floor(hours / 24) });
}

/** Settings → Tracking check: when tracking last had a location, and whether all is well. */
export function TrackingCheckRow() {
  const theme = useTheme();
  const t = useT();
  const { health, checkedAt: now } = useTrackingHealth();
  if (!health) return null;
  const good = health.issue === 'ok';
  return (
    <>
      <ThemedText type="smallBold">{t('Tracking check')}</ThemedText>
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          {health.lastSeenAt
            ? t('Last location: {{ago}}', { ago: ago(health.lastSeenAt, now, t) })
            : t('No location yet')}
          {' · '}
          <ThemedText
            type="smallBold"
            style={{
              color: good
                ? theme.accent
                : health.issue === 'off'
                  ? theme.textSecondary
                  : health.issue === 'gap'
                    ? theme.text
                    : theme.danger,
            }}>
            {t(STATUS[health.issue])}
          </ThemedText>
        </ThemedText>
      </ThemedView>
      <MotionRow />
    </>
  );
}

/**
 * Motion & Fitness, under the tracking check: on or off, with the one tap
 * that changes it. Hidden where there's none (web, Android, older builds).
 */
function MotionRow() {
  const theme = useTheme();
  const t = useT();
  const [status, setStatus] = useState(motionStatus);
  useEffect(() => {
    // Back from Settings, where it may have been switched.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setStatus(motionStatus());
    });
    return () => subscription.remove();
  }, []);
  if (status === null) return null;
  const on = status === 'authorized';
  const action =
    status === 'denied'
      ? { label: t('Open Settings'), run: () => Linking.openSettings() }
      : status === 'notDetermined'
        ? { label: t('Turn on'), run: async () => setStatus(await askForMotion().catch(() => motionStatus())) }
        : null;
  return (
    <ThemedView type="backgroundElement" style={[styles.row, styles.motionRow]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
        {t('Motion & Fitness')}
        {': '}
        <ThemedText type="smallBold" style={{ color: on ? theme.accent : theme.textSecondary }}>
          {on ? t('On') : t('Off')}
        </ThemedText>
      </ThemedText>
      {action && (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={action.run}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {action.label}
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.four,
    rowGap: Spacing.two,
    marginTop: Spacing.two,
  },
  inline: { marginTop: 0 },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
  },
  row: { borderRadius: 12, padding: Spacing.three },
  motionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
});
