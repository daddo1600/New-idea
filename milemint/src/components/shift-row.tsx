import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { shownPurpose } from '@/components/purpose-picker';
import { RouteMapCard } from '@/components/route-map/route-map-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { loadSettings } from '@/db/settings-repo';
import { getRoute } from '@/db/trips-repo';
import type { LatLng } from '@/domain/geo';
import { displayLocale, formatDistance, formatMoney, type Region } from '@/domain/regions';
import { displayRoute, privateEnds, type DisplayRoute } from '@/domain/route-display';
import type { ShiftGroup } from '@/domain/shift-rows';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** How far the steppers move a shift's start or end. */
const STEP_MS = 15 * 60_000;

/** "4:12 PM" or "16:12", the way the user's country writes it. */
export function shortTime(iso: string, region: Region): string {
  return new Date(iso).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
}

function shortDate(isoDate: string, region: Region): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(displayLocale(region), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * One row for a whole shift: when, how long, how far, how many drives and
 * what it's worth. Tapping it opens the legs (listed below it) with a map
 * of the routes and the shift's times to correct.
 */
export function ShiftRow({
  group,
  valueMinor,
  region,
  expanded,
  now,
  onToggle,
  onEditTimes,
}: {
  group: ShiftGroup;
  /** What the shift's business drives are worth. */
  valueMinor: number;
  region: Region;
  expanded: boolean;
  now: number;
  onToggle: () => void;
  onEditTimes: (changes: { startedAt?: Date; endedAt?: Date }) => void;
}) {
  const theme = useTheme();
  const t = useT();
  const running = group.endedAt === null;
  const minutes = Math.max(0, Math.round(((running ? now : Date.parse(group.endedAt!)) - Date.parse(group.startedAt)) / 60_000));
  const hours = t('{{hours}}h {{minutes}}m', {
    hours: Math.floor(minutes / 60),
    minutes: String(minutes % 60).padStart(2, '0'),
  });
  const start = shortTime(group.startedAt, region);
  const span = running ? t('Since {{time}}', { time: start }) : `${start}–${shortTime(group.endedAt!, region)}`;
  const drives = t('{{count}} drives', { count: group.legs.length });
  const value = formatMoney(valueMinor, region);
  const date = shortDate(group.date, region);
  const purposes = [...new Set(group.legs.filter((leg) => leg.classification === 'business').map((leg) => leg.purpose.trim()))];
  const purpose = shownPurpose(purposes.length === 1 && purposes[0] ? purposes[0] : 'Deliveries', t);
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, expanded && { borderColor: theme.accent }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={t('Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}}', {
          date,
          span,
          hours,
          distance: formatDistance(group.distanceMeters, region),
          drives,
          value,
        })}
        accessibilityHint={expanded ? t('Hides the drives in this shift') : t('Shows the drives in this shift')}
        onPress={onToggle}
        style={styles.main}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {running ? t('On shift') : t('Shift')}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.flex} numberOfLines={1}>
            {date}
          </ThemedText>
          <ThemedText type="smallBold">{formatDistance(group.distanceMeters, region)}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {[span, hours, drives, valueMinor > 0 ? value : ''].filter(Boolean).join(' · ')}
        </ThemedText>
        <View style={styles.header}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.flex} numberOfLines={1}>
            {group.unsortedCount > 0
              ? t('{{purpose}} · {{count}} to sort', { purpose, count: group.unsortedCount })
              : purpose}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {expanded ? t('Hide drives ▴') : t('Show drives ▾')}
          </ThemedText>
        </View>
      </Pressable>
      {expanded && (
        <View style={styles.details}>
          <ShiftMap group={group} />
          {group.shift && (
            <View style={styles.times}>
              <TimeStepper
                label={t('Started {{time}}', { time: start })}
                earlier={t('Start 15 minutes earlier')}
                later={t('Start 15 minutes later')}
                onStep={(sign) => onEditTimes({ startedAt: new Date(Date.parse(group.shift!.startedAt) + sign * STEP_MS) })}
              />
              {group.shift.endedAt && (
                <TimeStepper
                  label={t('Ended {{time}}', { time: shortTime(group.shift.endedAt, region) })}
                  earlier={t('End 15 minutes earlier')}
                  later={t('End 15 minutes later')}
                  onStep={(sign) => onEditTimes({ endedAt: new Date(Date.parse(group.shift!.endedAt!) + sign * STEP_MS) })}
                />
              )}
              <ThemedText type="small" themeColor="textSecondary">
                {t('Drives join or leave the shift by when they started. A drive past the end is cut there.')}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
}

function TimeStepper({
  label,
  earlier,
  later,
  onStep,
}: {
  label: string;
  earlier: string;
  later: string;
  onStep: (sign: -1 | 1) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stepper}>
      <ThemedText type="smallBold" style={styles.flex}>
        {label}
      </ThemedText>
      {([-1, 1] as const).map((sign) => (
        <Pressable
          key={sign}
          accessibilityRole="button"
          accessibilityLabel={sign < 0 ? earlier : later}
          hitSlop={6}
          onPress={() => onStep(sign)}
          style={[styles.step, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold">{sign < 0 ? '−15' : '+15'}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const MAP_HEIGHT = 160;

/**
 * The shift's drives on one map, each its own line: enough to see the round
 * at a glance. Only mounted while the shift is open, never in a closed row.
 */
function ShiftMap({ group }: { group: ShiftGroup }) {
  const db = useSQLiteContext();
  const t = useT();
  const [loaded, setLoaded] = useState<{ routes: LatLng[][]; clientPrivacy: boolean } | null>(null);
  const ids = group.legs.map((leg) => leg.id).join(',');
  useEffect(() => {
    let current = true;
    Promise.all([
      Promise.all(ids.split(',').map((id) => getRoute(db, id))),
      // Unread settings count as privacy on: better a shorter line than a client's door.
      loadSettings(db).then((settings) => settings.clientPrivacy, () => true),
    ]).then(
      ([routes, clientPrivacy]) => current && setLoaded({ routes, clientPrivacy }),
      () => current && setLoaded({ routes: [], clientPrivacy: true }),
    );
    return () => {
      current = false;
    };
  }, [db, ids]);
  const legs = group.legs;
  const routes = useMemo(() => {
    if (!loaded) return null;
    const shown = loaded.routes
      .map((route, index) => (legs[index] ? displayRoute(route, privateEnds(legs[index], loaded.clientPrivacy)) : null))
      .filter((route): route is DisplayRoute => route !== null);
    // One dot where the shift's driving began and one where it ended, not one per drive.
    return shown.map((route, index) => ({
      ...route,
      startDot: route.startDot && index === 0,
      endDot: route.endDot && index === shown.length - 1,
    }));
  }, [loaded, legs]);
  if (!routes) return null;
  return <RouteMapCard routes={routes} label={t('Map of the drives in this shift')} height={MAP_HEIGHT} />;
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent', overflow: 'hidden' },
  main: { padding: Spacing.three, gap: Spacing.one + 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: 1 },
  flex: { flex: 1 },
  details: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.three },
  times: { gap: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  step: { borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, minWidth: 52, alignItems: 'center' },
});
