import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ProBadge } from '@/components/pro-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  OTHER_PLATFORM,
  PLATFORM_NAMES,
  workMetersBetween,
  type EarningsScan,
  type PlatformEarning,
  type PlatformId,
} from '@/domain/earnings-scan';
import { formatDayMonth } from '@/domain/quarters';
import { formatMoney, toUnits, type DeductionTrip, type Region } from '@/domain/regions';
import { scanEarningsScreenshot, usePlatformEarnings } from '@/hooks/use-platform-earnings';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

type T = ReturnType<typeof useT>;

/** Entries shown on the card, newest first. */
const SHOWN = 5;

/** An app's name: its own, or "Other app". */
export function platformName(t: T, platform: PlatformId): string {
  return platform === 'other' ? t(OTHER_PLATFORM) : PLATFORM_NAMES[platform];
}

/** The days an entry covers: "28 Sep", or "21 Sep – 27 Sep". */
export function periodLabel(start: string, end: string, region: Region): string {
  return start === end ? formatDayMonth(start, region) : `${formatDayMonth(start, region)} – ${formatDayMonth(end, region)}`;
}

/** The confirm screen, filled in with what a scan read (anything unread left empty). */
export function openConfirm(scan: EarningsScan | null) {
  const params: Record<string, string> = {};
  if (scan) {
    params.scanned = '1';
    if (scan.platform) params.platform = scan.platform;
    if (scan.start && scan.end) Object.assign(params, { start: scan.start, end: scan.end });
    if (scan.amountMinor !== null) params.amount = String(scan.amountMinor);
    if (scan.trips !== null) params.trips = String(scan.trips);
    if (scan.distanceMeters !== null) params.distance = String(scan.distanceMeters);
  }
  router.push({ pathname: '/scan-earnings', params } as unknown as Href);
}

/**
 * "Uber counted 140 mi on jobs · MileSprout tracked 212 work mi": the app's
 * own distance (what it pays for) next to the work driving MileSprout logged
 * on the same days, which includes the drives to pickups and between jobs.
 */
export function comparisonLine(t: T, entry: PlatformEarning, trackedMeters: number, region: Region): string {
  const whole = (meters: number) =>
    new Intl.NumberFormat(region.locale, { maximumFractionDigits: 0 }).format(toUnits(meters, region));
  const tracked = whole(trackedMeters);
  const miles = region.unit === 'mi';
  if (entry.distanceMeters === null) {
    return miles ? t('MileSprout logged {{tracked}} work mi', { tracked }) : t('MileSprout logged {{tracked}} work km', { tracked });
  }
  const params = {
    platform: entry.platform === 'other' ? t('The app') : PLATFORM_NAMES[entry.platform],
    counted: whole(entry.distanceMeters),
    tracked,
  };
  return miles
    ? t('{{platform}} counted {{counted}} mi on jobs · MileSprout logged {{tracked}} work mi', params)
    : t('{{platform}} counted {{counted}} km on jobs · MileSprout logged {{tracked}} work km', params);
}

/**
 * The Money tab's earnings by platform (Pro, or the friends perk): "Scan
 * earnings screenshot", and the latest entries with what each app counted
 * next to what MileSprout tracked. Locked, the same button leads to Pro.
 */
export function PlatformEarningsCard({ trips }: { trips: readonly DeductionTrip[] }) {
  const earnings = usePlatformEarnings();
  const { region } = useRegion();
  const theme = useTheme();
  const t = useT();
  const [scanning, setScanning] = useState(false);

  if (!earnings.unlocked) return <LockedPlatformEarnings />;

  const typeIn = () => openConfirm(null);
  const scan = async () => {
    setScanning(true);
    const outcome = await scanEarningsScreenshot(region.code).catch(() => ({ kind: 'failed' as const }));
    setScanning(false);
    if (outcome.kind === 'scanned') return openConfirm(outcome.scan);
    if (outcome.kind === 'cancelled') return;
    Alert.alert(
      outcome.kind === 'unavailable'
        ? t('Screenshots can only be read in the iPhone app')
        : t('Couldn’t read that screenshot'),
      t('You can type the figures in instead.'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Type them in'), onPress: typeIn },
      ],
    );
  };

  const confirmDelete = (entry: PlatformEarning) => {
    Alert.alert(
      t('Delete these earnings?'),
      entry.addedToWeek
        ? t('They also come off that week’s earnings in your tax set-aside.')
        : undefined,
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => {
            earnings.remove(entry.id).catch(() => Alert.alert(t('Couldn’t delete. Please try again.')));
          },
        },
      ],
    );
  };

  const shown = earnings.entries.slice(0, SHOWN);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{t('Earnings by platform')}</ThemedText>

      {earnings.loaded && shown.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('Scan a screenshot of an app’s earnings page to see what each app pays you, next to the distance you drove for it.')}
        </ThemedText>
      )}

      {shown.map((entry, index) => (
        <Pressable
          key={entry.id}
          accessibilityRole="button"
          accessibilityHint={t('Opens a choice to delete these earnings')}
          onPress={() => confirmDelete(entry)}
          style={({ pressed }) => [
            styles.entry,
            index > 0 && { borderTopColor: theme.backgroundSelected, borderTopWidth: StyleSheet.hairlineWidth },
            { opacity: pressed ? 0.6 : 1 },
          ]}>
          <View style={styles.entryTop}>
            <ThemedText type="small" style={styles.flex} numberOfLines={1}>
              {platformName(t, entry.platform)} · {periodLabel(entry.start, entry.end, region)}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.tabular}>
              {formatMoney(entry.amountMinor, region)}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            {comparisonLine(t, entry, workMetersBetween(trips, entry.start, entry.end), region)}
            {entry.trips !== null ? ` · ${t('{{count}} jobs', { count: entry.trips })}` : ''}
          </ThemedText>
        </Pressable>
      ))}

      <Pressable
        accessibilityRole="button"
        disabled={scanning}
        onPress={scan}
        style={({ pressed }) => [styles.scan, { backgroundColor: theme.accent, opacity: pressed || scanning ? 0.7 : 1 }]}>
        {scanning ? (
          <ActivityIndicator color={theme.onAccent} />
        ) : (
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Scan earnings screenshot')}
          </ThemedText>
        )}
      </Pressable>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={typeIn} style={styles.typeIn}>
        <ThemedText type="small" style={{ color: theme.accent }}>
          {t('Or type them in ›')}
        </ThemedText>
      </Pressable>

      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {t('Read on your iPhone. The screenshot isn’t kept or uploaded.')}
      </ThemedText>
    </ThemedView>
  );
}

/** Locked: the same entry point, marked Pro, with both ways in (Pro, or inviting friends). */
function LockedPlatformEarnings() {
  const theme = useTheme();
  const t = useT();
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.flex}>
          {t('Earnings by platform')}
        </ThemedText>
        <ProBadge />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {t('Scan your earnings screenshots from each app. See what each one pays you, and the driving they don’t count: to pickups and between jobs.')}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/pro')}
        style={[styles.scan, styles.lockedScan, { borderColor: theme.accent }]}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Scan earnings screenshot')}
        </ThemedText>
        <ProBadge />
      </Pressable>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/friends' as Href)} style={styles.typeIn}>
        <ThemedText type="small" style={{ color: theme.accent }}>
          {t('Or unlock it free by inviting friends ›')}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  tabular: { fontVariant: ['tabular-nums'] },
  entry: { paddingVertical: Spacing.two, gap: Spacing.half },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  note: { fontSize: 12, lineHeight: 16 },
  scan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    paddingVertical: 12,
    minHeight: 44,
    marginTop: Spacing.one,
  },
  lockedScan: { borderWidth: 1 },
  typeIn: { alignSelf: 'center' },
});
