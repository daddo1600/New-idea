import { Tabs } from 'expo-router/js-tabs';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeafMark } from '@/components/leaf-mark';
import { quickPurposes } from '@/components/purpose-picker';
import { ShiftRow } from '@/components/shift-row';
import { AddTripHeaderButton, AddTripLink, AddTripRow } from '@/components/trips/add-trip-links';
import { BulkActions, SelectBar } from '@/components/trips/list-bars';
import { SelectableTripRow } from '@/components/trips/selectable-trip-row';
import { TripRow } from '@/components/trips/trip-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { isCommute } from '@/domain/classify-rules';
import { homeItems, itemKey, offShiftKind, type HomeItem } from '@/domain/shift-rows';
import { displayLocale, formatDistance, formatMoney, potentialDeductions, type Region } from '@/domain/regions';
import { frequentPurposes } from '@/domain/suggestions';
import type { Trip } from '@/domain/trip';
import { usePurposeSettings } from '@/hooks/use-purpose-settings';
import { useTheme } from '@/hooks/use-theme';
import { useTripList } from '@/hooks/use-trip-list';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import { useShift } from '@/tracking/use-shift';
import { onTrackingChecked } from '@/tracking/use-tracking';

/** A month's heading in the list, with its business distance and value. */
type MonthItem = { kind: 'month'; month: string; meters: number; valueMinor: number };
type DriveItem = HomeItem | MonthItem;

/**
 * Every drive, newest first and grouped by month. A courier's shift is one
 * row that opens to its drives. Select several to sort at once, long press to
 * delete, + (header, or the row under the list) to add one tracking missed.
 */
export default function DrivesScreen() {
  const list = useTripList();
  const { trips, reload, setPurpose, allTrips, deductions, kindOf, selecting, selected } = list;
  const purposeSettings = usePurposeSettings();
  const shiftMode = useShift(reload);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  // Drives logged while the app was in the background: home catches tracking up, this list follows.
  useEffect(() => onTrackingChecked(() => reload()), [reload]);
  /** The time a running shift's row is worked out at, ticking each minute. */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const purposeChoices = useMemo(
    () =>
      quickPurposes({
        usual: purposeSettings.usual,
        chosen: purposeSettings.chosen,
        recent: frequentPurposes(trips ?? []),
        shiftMode: purposeSettings.shiftMode,
        clientPrivacy: purposeSettings.clientPrivacy,
      }),
    [trips, purposeSettings.usual, purposeSettings.chosen, purposeSettings.shiftMode, purposeSettings.clientPrivacy],
  );

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const potentialOf = potentialDeductions(allTrips, region);
  const unsorted = trips.filter((trip) => trip.classification === 'unclassified');
  // Selecting works on drives, so it lists them one by one.
  const rows: HomeItem[] = selecting
    ? trips.map((trip) => ({ kind: 'trip', trip }))
    : homeItems(trips, shiftMode.shifts, list.expanded);
  const items = withMonths(rows, trips, deductions);

  return (
    <ThemedView style={styles.container}>
      {/* The bulk actions bar takes the tab bar's place while selecting; + adds a drive tracking missed. */}
      <Tabs.Screen
        options={{
          tabBarStyle: selecting ? { display: 'none' } : undefined,
          headerRight: selecting ? undefined : () => <AddTripHeaderButton />,
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => (item.kind === 'month' ? `month:${item.month}` : itemKey(item))}
        contentContainerStyle={[styles.list, selecting && { paddingBottom: 160 + insets.bottom }]}
        ListHeaderComponent={
          trips.length > 0 ? (
            <SelectBar
              // The screen's title already says what the list is.
              title={null}
              selecting={selecting}
              unsortedCount={unsorted.length}
              onStart={() => list.setSelecting(true)}
              onSelectUnsorted={() => list.setSelected(new Set(unsorted.map((trip) => trip.id)))}
              onCancel={list.stopSelecting}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <LeafMark size={72} />
            <ThemedText type="smallBold">{t('No drives yet')}</ThemedText>
            <AddTripLink />
          </View>
        }
        ListFooterComponent={trips.length > 0 && !selecting ? <AddTripRow /> : null}
        renderItem={({ item: row }) => {
          if (row.kind === 'month') return <MonthHeading item={row} region={region} />;
          if (row.kind === 'shift') {
            return (
              <ShiftRow
                group={row.group}
                valueMinor={row.group.legs.reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0)}
                region={region}
                expanded={row.expanded}
                now={now}
                onToggle={() => list.toggleShift(row.group.shiftId)}
                onEditTimes={(changes) => shiftMode.editTimes(row.group.shiftId, changes).catch(() => {})}
              />
            );
          }
          const item = row.trip;
          const content = selecting ? (
            <SelectableTripRow trip={item} selected={selected.has(item.id)} onToggle={() => list.toggle(item)} />
          ) : (
            <TripRow
              trip={item}
              deduction={deductions.get(item.id) ?? 0}
              potential={item.classification === 'unclassified' ? potentialOf(item) : 0}
              commute={isCommute(kindOf(item.startPlaceId), kindOf(item.endPlaceId))}
              offShift={offShiftKind(item, shiftMode.shifts)}
              onClassify={(c) => list.sort([item], c)}
              onLongPress={() => list.confirmDelete(item)}
              usualPurpose={purposeSettings.usual}
              purposeChoices={purposeChoices}
              onPurpose={(purpose) => setPurpose(item, purpose)}
            />
          );
          // A shift's drives, under its row while it's open.
          return row.kind === 'leg' ? (
            <View style={[styles.leg, { borderLeftColor: theme.accent }]}>{content}</View>
          ) : (
            content
          );
        }}
      />
      {selecting && (
        <BulkActions
          count={selected.size}
          bottom={insets.bottom}
          onBusiness={() => list.markSelected('business')}
          onPersonal={() => list.markSelected('personal')}
        />
      )}
    </ThemedView>
  );
}

/** The list's rows with a heading before each month (a shift goes under the month it started). */
function withMonths(rows: readonly HomeItem[], trips: readonly Trip[], deductions: ReadonlyMap<string, number>): DriveItem[] {
  const totals = new Map<string, { meters: number; valueMinor: number }>();
  for (const trip of trips) {
    const month = trip.localDate.slice(0, 7);
    const total = totals.get(month) ?? { meters: 0, valueMinor: 0 };
    if (trip.classification === 'business') total.meters += trip.distanceMeters;
    total.valueMinor += deductions.get(trip.id) ?? 0;
    totals.set(month, total);
  }
  const items: DriveItem[] = [];
  let current: string | null = null;
  for (const row of rows) {
    if (row.kind !== 'leg') {
      const month = (row.kind === 'shift' ? row.group.date : row.trip.localDate).slice(0, 7);
      if (month !== current) {
        current = month;
        items.push({ kind: 'month', month, ...(totals.get(month) ?? { meters: 0, valueMinor: 0 }) });
      }
    }
    items.push(row);
  }
  return items;
}

function MonthHeading({ item, region }: { item: MonthItem; region: Region }) {
  const t = useT();
  const [year, month] = item.month.split('-').map(Number);
  const long = new Date(year, month - 1, 1).toLocaleDateString(displayLocale(region), { month: 'long', year: 'numeric' });
  // "octubre de 2026" → "Octubre de 2026": only the first letter, as a heading.
  const name = long.charAt(0).toLocaleUpperCase() + long.slice(1);
  const distance = formatDistance(item.meters, region);
  return (
    <View style={styles.month} accessibilityRole="header">
      <ThemedText type="smallBold" style={styles.monthName}>
        {name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('{{distance}} business', { distance })} · {formatMoney(item.valueMinor, region)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  list: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  empty: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.five, paddingHorizontal: Spacing.four },
  month: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    marginTop: Spacing.two,
  },
  monthName: { flexShrink: 1 },
  leg: { marginLeft: Spacing.three, paddingLeft: Spacing.two, borderLeftWidth: 2, marginTop: -Spacing.two },
});
