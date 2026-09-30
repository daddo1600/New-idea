import { router, Stack, useIsFocused } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/db/use-trips';
import { isCommute, type AutoReason } from '@/domain/classify-rules';
import { autoDrivesInMonth, FREE_AUTO_DRIVES_PER_MONTH, lockedTripIds } from '@/domain/plan';
import type { Place } from '@/domain/places';
import {
  computeDeductions,
  currentTaxYear,
  formatDistance,
  formatMoney,
  potentialDeduction,
  summarizeTaxYear,
  taxYearOf,
  type TaxYearSummary,
} from '@/domain/regions';
import { type Classification, toLocalIsoDate, type Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import type { TrackingStatus } from '@/tracking/background';
import { useTracking } from '@/tracking/use-tracking';

const CLASSIFY_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
] as const satisfies readonly { value: Classification; label: string }[];

const AUTO_NOTES: Record<AutoReason, string> = {
  'learned-route': 'Auto: usual route',
  'work-hours': 'Auto: work hours',
  commute: 'Auto: commute',
};

/** How far a row must be dragged before letting go classifies it. */
const SWIPE_THRESHOLD = 80;

/** Show the tracking setup once per launch until location access is granted. */
let promptedForTracking = false;
/** Ask where the user drives once per launch until they've chosen. */
let promptedForRegion = false;

export default function HomeScreen() {
  const { trips, places, classify, classifyMany, remove, reload } = useTrips();
  const insets = useSafeAreaInsets();
  // Bulk sort: pick several trips, then mark them all at once.
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const { status } = useTracking(reload);
  const { isPro } = usePro();
  const { region, chosen, loaded } = useRegion();
  const taxYear = currentTaxYear(region);
  const locked = useMemo(() => lockedTripIds(trips ?? [], isPro), [trips, isPro]);
  // Locked drives don't count towards the total (or a tier limit) until they're unlocked.
  const visible = useMemo(() => (trips ?? []).filter((trip) => !locked.has(trip.id)), [trips, locked]);
  const deductions = useMemo(() => computeDeductions(visible, region), [visible, region]);
  const summary = useMemo(
    () => summarizeTaxYear(visible, region, taxYear, deductions),
    [visible, region, taxYear, deductions],
  );
  // Home ↔ work drives the user marked business anyway. Kept in the total (a
  // home office can make them deductible), but called out so they get a second look.
  const commuteCents = useMemo(() => {
    const kind = (id: string | null) => places.find((place) => place.id === id)?.kind ?? null;
    return visible
      .filter(
        (trip) =>
          taxYearOf(trip.localDate, region) === taxYear &&
          trip.classification === 'business' &&
          isCommute(kind(trip.startPlaceId), kind(trip.endPlaceId)),
      )
      .reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0);
  }, [visible, places, region, taxYear, deductions]);

  // First launch: where do you drive? Then location access. Only while this
  // screen is on top, so one set-up screen never opens over another.
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) return;
    if (loaded && !chosen && !promptedForRegion) {
      promptedForRegion = true;
      router.push('/region');
    } else if (chosen && status === 'needs-permission' && !promptedForTracking) {
      promptedForTracking = true;
      router.push('/setup-tracking');
    }
  }, [focused, loaded, chosen, status]);

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const kindOf = (id: string | null) => places.find((place: Place) => place.id === id)?.kind ?? null;

  const unsorted = visible.filter((trip) => trip.classification === 'unclassified');
  const stopSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };
  const toggle = (trip: Trip) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(trip.id)) next.delete(trip.id);
      else next.add(trip.id);
      return next;
    });
  const markSelected = async (classification: Classification) => {
    await classifyMany(visible.filter((trip) => selected.has(trip.id)), classification);
    stopSelecting();
  };

  const confirmDelete = (trip: Trip) =>
    Alert.alert('Delete trip?', `${trip.startLabel} → ${trip.endLabel}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(trip) },
    ]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{ headerLeft: () => <SettingsLink />, headerRight: () => <AddMissedTripLink /> }}
      />
      <FlatList
        data={trips}
        keyExtractor={(trip) => trip.id}
        // Room for the bulk actions bar while selecting.
        contentContainerStyle={[styles.list, selecting && { paddingBottom: 160 + insets.bottom }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <SummaryCard summary={summary} commuteCents={commuteCents} />
            <TrackingCard status={status} />
            {!isPro && <PlanCard trips={trips} lockedCount={locked.size} />}
            {visible.length > 0 && (
              <SelectBar
                selecting={selecting}
                unsortedCount={unsorted.length}
                onStart={() => setSelecting(true)}
                onSelectUnsorted={() => setSelected(new Set(unsorted.map((trip) => trip.id)))}
                onCancel={stopSelecting}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {status === 'on'
              ? 'Your next drive will appear here after you park.'
              : 'Turn on automatic tracking and your drives will appear here.'}
          </ThemedText>
        }
        renderItem={({ item }) =>
          selecting ? (
            locked.has(item.id) ? null : (
              <SelectableTripRow trip={item} selected={selected.has(item.id)} onToggle={() => toggle(item)} />
            )
          ) : locked.has(item.id) ? (
            <LockedTripRow trip={item} worth={potentialDeduction(item, visible, region)} />
          ) : (
            <TripRow
              trip={item}
              deduction={deductions.get(item.id) ?? 0}
              potential={item.classification === 'unclassified' ? potentialDeduction(item, visible, region) : 0}
              commute={isCommute(kindOf(item.startPlaceId), kindOf(item.endPlaceId))}
              onClassify={(c) => classify(item, c)}
              onLongPress={() => confirmDelete(item)}
            />
          )
        }
      />
      {selecting && (
        <BulkActions
          count={selected.size}
          bottom={insets.bottom}
          onBusiness={() => markSelected('business')}
          onPersonal={() => markSelected('personal')}
        />
      )}
    </ThemedView>
  );
}

/** "Select" above the list; while selecting, quick picks and Cancel. */
function SelectBar({
  selecting,
  unsortedCount,
  onStart,
  onSelectUnsorted,
  onCancel,
}: {
  selecting: boolean;
  unsortedCount: number;
  onStart: () => void;
  onSelectUnsorted: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.selectBar}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        Trips
      </ThemedText>
      <View style={styles.selectActions}>
        {selecting && unsortedCount > 0 && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onSelectUnsorted}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Select {unsortedCount} unsorted
            </ThemedText>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={selecting ? 'Stop selecting trips' : 'Select several trips to sort at once'}
          hitSlop={8}
          onPress={selecting ? onCancel : onStart}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {selecting ? 'Cancel' : 'Select'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

/** A trip row in select mode: tap to tick it; no swiping or opening. */
function SelectableTripRow({
  trip,
  selected,
  onToggle,
}: {
  trip: Trip;
  selected: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const { region } = useRegion();
  const status =
    trip.classification === 'unclassified' ? 'Not sorted' : trip.classification === 'business' ? 'Business' : 'Personal';
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${trip.startLabel} to ${trip.endLabel}, ${trip.localDate}, ${status}`}
      onPress={onToggle}>
      <ThemedView
        type="backgroundElement"
        style={[styles.row, styles.selectableRow, selected && { borderColor: theme.accent }]}>
        <View
          style={[
            styles.check,
            { borderColor: selected ? theme.accent : theme.textSecondary },
            selected && { backgroundColor: theme.accent },
          ]}>
          {selected && (
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              ✓
            </ThemedText>
          )}
        </View>
        <View style={styles.flex}>
          <View style={styles.rowHeader}>
            <ThemedText type="smallBold" style={styles.route} numberOfLines={1}>
              {trip.startLabel} → {trip.endLabel}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {trip.localDate} · {status}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

/** Pinned to the bottom while selecting. */
function BulkActions({
  count,
  bottom,
  onBusiness,
  onPersonal,
}: {
  count: number;
  bottom: number;
  onBusiness: () => void;
  onPersonal: () => void;
}) {
  const theme = useTheme();
  const disabled = count === 0;
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.bulkBar, { paddingBottom: Spacing.three + bottom, borderTopColor: theme.backgroundSelected }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.bulkCount}>
        {count === 0 ? 'Tap trips to select them' : `${count} selected`}
      </ThemedText>
      <View style={styles.bulkButtons}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onBusiness}
          style={[styles.bulkButton, { backgroundColor: theme.accent, opacity: disabled ? 0.5 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            Business
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onPersonal}
          style={[styles.bulkButton, { backgroundColor: theme.backgroundSelected, opacity: disabled ? 0.5 : 1 }]}>
          <ThemedText type="smallBold">Personal</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function SummaryCard({ summary, commuteCents }: { summary: TaxYearSummary; commuteCents: number }) {
  const theme = useTheme();
  const { region } = useRegion();
  const total = formatMoney(summary.deduction, region);
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Deductions found in {summary.label}
        {summary.label.length > 4 ? ' tax year' : ''}
      </ThemedText>
      <ThemedText type="title" accessibilityLabel={`${total} found`}>
        {total}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatDistance(summary.businessMeters, region)} business
        {summary.unclassifiedCount > 0 && ` · ${summary.unclassifiedCount} to review`}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reports: export your mileage log"
        hitSlop={8}
        onPress={() => router.push('/report')}
        style={styles.reportLink}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Export report
        </ThemedText>
      </Pressable>
      {commuteCents > 0 && (
        <ThemedText type="small" themeColor="danger">
          Includes {formatMoney(commuteCents, region)} from home ↔ work commutes, which usually aren’t
          deductible.
        </ThemedText>
      )}
    </ThemedView>
  );
}

function TripRow({
  trip,
  deduction,
  potential,
  commute,
  onClassify,
  onLongPress,
}: {
  trip: Trip;
  deduction: number;
  /** What the trip would be worth as business: the nudge to classify it. */
  potential: number;
  /** Home ↔ work: shown with a warning if marked business. */
  commute: boolean;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const { region } = useRegion();
  const swipeable = useRef<SwipeableMethods>(null);
  const unclassified = trip.classification === 'unclassified';
  const business = trip.classification === 'business';
  const details = [
    trip.localDate,
    trip.source === 'auto' ? formatTime(trip.startedAt) : 'Added manually',
    trip.purpose,
    deduction > 0 ? formatMoney(deduction, region) : '',
  ].filter(Boolean);
  const openDetails = () => router.push({ pathname: '/trip/[id]', params: { id: trip.id } });

  // Swipe right = Business, left = Personal. The buttons below stay for
  // VoiceOver and anyone who doesn't discover the gesture.
  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      leftThreshold={SWIPE_THRESHOLD}
      rightThreshold={SWIPE_THRESHOLD}
      renderLeftActions={() => (
        <SwipeAction label="Business" color={theme.accent} textColor={theme.onAccent} side="left" />
      )}
      renderRightActions={() => (
        <SwipeAction
          label="Personal"
          color={theme.backgroundSelected}
          textColor={theme.text}
          side="right"
        />
      )}
      onSwipeableOpen={(direction) => {
        swipeable.current?.close();
        onClassify(direction === SwipeDirection.RIGHT ? 'business' : 'personal');
      }}>
      <Pressable
        onPress={openDetails}
        onLongPress={onLongPress}
        accessibilityHint="Opens trip details. Long press to delete">
        <ThemedView type="backgroundElement" style={styles.row}>
          <View style={styles.rowHeader}>
            <ThemedText type="smallBold" style={styles.route} numberOfLines={1}>
              {trip.startLabel} → {trip.endLabel}
            </ThemedText>
            <ThemedText type="smallBold">{formatDistance(trip.distanceMeters, region)}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {details.join(' · ')}
          </ThemedText>
          {trip.autoReason && (
            <ThemedText type="small" themeColor="textSecondary">
              {AUTO_NOTES[trip.autoReason]}
            </ThemedText>
          )}
          {business && commute && (
            <ThemedText type="small" themeColor="danger">
              Commute between home and work isn’t deductible.
            </ThemedText>
          )}
          {unclassified && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Business or personal?{potential > 0 ? ` Worth ${formatMoney(potential, region)} if business.` : ''}
            </ThemedText>
          )}
          {business && !trip.purpose.trim() && (
            <Pressable accessibilityRole="button" onPress={openDetails} hitSlop={8}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Add business purpose
              </ThemedText>
            </Pressable>
          )}
          <Segmented
            options={CLASSIFY_OPTIONS}
            value={unclassified ? null : trip.classification}
            onChange={onClassify}
            accessibilityLabelFor={(option) => `Mark ${trip.startLabel} to ${trip.endLabel} as ${option.label.toLowerCase()}`}
          />
        </ThemedView>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/**
 * A drive over the free monthly limit: recorded and kept, but its details and
 * classification wait for Pro. Distance and date stay visible so the user can
 * see it's real.
 */
function LockedTripRow({ trip, worth }: { trip: Trip; worth: number }) {
  const theme = useTheme();
  const { region } = useRegion();
  const distance = formatDistance(trip.distanceMeters, region);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Locked drive on ${trip.localDate}, ${distance}`}
      accessibilityHint="Opens MileMint Pro to unlock it"
      onPress={() => router.push('/pro')}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.route}>
            🔒 Locked drive
          </ThemedText>
          <ThemedText type="smallBold">{distance}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {[trip.localDate, formatTime(trip.startedAt), worth > 0 ? `worth up to ${formatMoney(worth, region)}` : '']
            .filter(Boolean)
            .join(' · ')}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Unlock with MileMint Pro
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/** Free plan meter: how much of this month's allowance is used. */
function PlanCard({ trips, lockedCount }: { trips: readonly Trip[]; lockedCount: number }) {
  const theme = useTheme();
  const now = new Date();
  const used = Math.min(
    autoDrivesInMonth(trips, toLocalIsoDate(now).slice(0, 7)),
    FREE_AUTO_DRIVES_PER_MONTH,
  );
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const full = used >= FREE_AUTO_DRIVES_PER_MONTH;
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push('/pro')}>
      <ThemedView
        type="backgroundElement"
        style={[styles.planCard, lockedCount > 0 && { borderColor: theme.accent, borderWidth: 1 }]}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold">
            {used} of {FREE_AUTO_DRIVES_PER_MONTH} free drives in {month}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Go Pro
          </ThemedText>
        </View>
        <View style={[styles.meter, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${(used / FREE_AUTO_DRIVES_PER_MONTH) * 100}%`,
                backgroundColor: full ? theme.danger : theme.accent,
              },
            ]}
          />
        </View>
        {lockedCount > 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {lockedCount} {lockedCount === 1 ? 'drive is' : 'drives are'} locked. Upgrade for unlimited
            drives.
          </ThemedText>
        ) : (
          full && (
            <ThemedText type="small" themeColor="textSecondary">
              New drives this month are saved but locked until you upgrade.
            </ThemedText>
          )
        )}
      </ThemedView>
    </Pressable>
  );
}

function SwipeAction({
  label,
  color,
  textColor,
  side,
}: {
  label: string;
  color: string;
  textColor: string;
  side: 'left' | 'right';
}) {
  return (
    <View
      style={[
        styles.swipeAction,
        { backgroundColor: color, alignItems: side === 'left' ? 'flex-start' : 'flex-end' },
      ]}>
      <ThemedText type="smallBold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </View>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function SettingsLink() {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Settings: work hours and places"
      hitSlop={12}
      onPress={() => router.push('/settings')}
      style={styles.headerLink}>
      <ThemedText type="small" style={{ color: theme.accent }}>
        Settings
      </ThemedText>
    </Pressable>
  );
}

function AddMissedTripLink() {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a missed trip manually"
      hitSlop={12}
      onPress={() => router.push('/add-trip')}
      style={styles.headerLink}>
      <ThemedText type="small" style={{ color: theme.accent }}>
        Add missed trip
      </ThemedText>
    </Pressable>
  );
}

const TRACKING_MESSAGES: Record<Exclude<TrackingStatus, 'on'>, { title: string; body: string }> = {
  'needs-permission': {
    title: 'Automatic tracking is off',
    body: 'Allow location access and MileMint logs every drive for you.',
  },
  'needs-always': {
    title: 'Drives may be missed',
    body: 'Location is set to “While Using”. Switch it to “Always” so drives are logged when the app is closed.',
  },
  off: { title: 'Automatic tracking is paused', body: 'Turn it back on to keep logging drives.' },
  unsupported: {
    title: 'Preview mode',
    body: 'Automatic tracking runs on your iPhone. Use “Add missed trip” to try the app here.',
  },
};

function TrackingCard({ status }: { status: TrackingStatus | null }) {
  const theme = useTheme();
  if (!status) return null;
  if (status === 'on') {
    return (
      <View style={styles.trackingOn} accessibilityRole="text">
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <ThemedText type="small" themeColor="textSecondary">
          Automatic tracking on. Drives are logged when you park.
        </ThemedText>
      </View>
    );
  }
  const message = TRACKING_MESSAGES[status];
  return (
    <ThemedView type="backgroundElement" style={[styles.trackingCard, { borderColor: theme.accent }]}>
      <ThemedText type="smallBold">{message.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {message.body}
      </ThemedText>
      {status !== 'unsupported' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/setup-tracking')}
          style={[styles.trackingButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            Turn on
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
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
  card: { borderRadius: 16, padding: Spacing.four, gap: Spacing.one },
  reportLink: { alignSelf: 'flex-start', marginTop: Spacing.one },
  empty: { textAlign: 'center', marginTop: Spacing.five },
  row: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  route: { flex: 1 },
  swipeAction: {
    width: 120,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
  },
  header: { gap: Spacing.three },
  selectBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.one },
  selectActions: { flexDirection: 'row', gap: Spacing.four, alignItems: 'center' },
  selectableRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderWidth: 2, borderColor: 'transparent' },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: Spacing.one },
  bulkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bulkCount: { textAlign: 'center' },
  bulkButtons: { flexDirection: 'row', gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  bulkButton: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  planCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  meter: { height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 },
  headerLink: { paddingHorizontal: Spacing.three },
  trackingOn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 4 },
  trackingCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  trackingButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
  },
});
