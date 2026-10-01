import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { shownPurpose } from '@/components/purpose-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getRoute } from '@/db/trips-repo';
import type { LatLng } from '@/domain/geo';
import { displayLocale, formatDistance, formatMoney, type Region } from '@/domain/regions';
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

const MAP_HEIGHT = 140;

/** The shift's routes drawn to fit, each leg its own line: enough to see the round at a glance. */
function ShiftMap({ group }: { group: ShiftGroup }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const [routes, setRoutes] = useState<LatLng[][] | null>(null);
  const [width, setWidth] = useState(0);
  const ids = group.legs.map((leg) => leg.id).join(',');
  useEffect(() => {
    let current = true;
    Promise.all(ids.split(',').map((id) => getRoute(db, id))).then(
      (loaded) => current && setRoutes(loaded.filter((route) => route.length > 1)),
      () => current && setRoutes([]),
    );
    return () => {
      current = false;
    };
  }, [db, ids]);
  if (!routes || routes.length === 0) return null;
  const points = routes.flat();
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  // Longitude shrinks towards the poles: scale it so the shape isn't stretched.
  const lngScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = Math.max((maxLng - minLng) * lngScale, 1e-6);
  const spanY = Math.max(maxLat - minLat, 1e-6);
  const pad = 10;
  const scale = width > 0 ? Math.min((width - 2 * pad) / spanX, (MAP_HEIGHT - 2 * pad) / spanY) : 0;
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (MAP_HEIGHT - spanY * scale) / 2;
  const xy = (p: LatLng) => [offsetX + (p.longitude - minLng) * lngScale * scale, offsetY + (maxLat - p.latitude) * scale];
  const first = xy(routes[0][0]);
  const lastRoute = routes[routes.length - 1];
  const last = xy(lastRoute[lastRoute.length - 1]);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('Map of the drives in this shift')}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.map, { backgroundColor: theme.background }]}>
      {width > 0 && (
        <Svg width={width} height={MAP_HEIGHT}>
          {routes.map((route, index) => (
            <Polyline
              key={index}
              points={route.map((p) => xy(p).join(',')).join(' ')}
              fill="none"
              stroke={theme.accent}
              strokeOpacity={0.55 + (0.45 * (index + 1)) / routes.length}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          <Circle cx={first[0]} cy={first[1]} r={5} fill={theme.background} stroke={theme.accent} strokeWidth={2.5} />
          <Circle cx={last[0]} cy={last[1]} r={5} fill={theme.accent} />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent', overflow: 'hidden' },
  main: { padding: Spacing.three, gap: Spacing.one + 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: 1 },
  flex: { flex: 1 },
  details: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.three },
  map: { height: MAP_HEIGHT, borderRadius: 10, overflow: 'hidden' },
  times: { gap: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  step: { borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2, minWidth: 52, alignItems: 'center' },
});
