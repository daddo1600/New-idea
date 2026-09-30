import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
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
import { formatCents, formatMiles } from '@/domain/format';
import { autoDrivesInMonth, FREE_AUTO_DRIVES_PER_MONTH, lockedTripIds } from '@/domain/plan';
import type { Place } from '@/domain/places';
import {
  metersToMiles,
  summarizeYear,
  tripDeductionCents,
  type Classification,
  toLocalIsoDate,
  type Trip,
} from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';
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

export default function HomeScreen() {
  const { trips, places, classify, remove, reload } = useTrips();
  const { status } = useTracking(reload);
  const { isPro } = usePro();
  const year = new Date().getFullYear();
  const locked = useMemo(() => lockedTripIds(trips ?? [], isPro), [trips, isPro]);
  // Locked drives don't count towards the total until they're unlocked.
  const summary = useMemo(
    () => summarizeYear((trips ?? []).filter((trip) => !locked.has(trip.id)), year),
    [trips, locked, year],
  );

  useEffect(() => {
    if (status === 'needs-permission' && !promptedForTracking) {
      promptedForTracking = true;
      router.push('/setup-tracking');
    }
  }, [status]);

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const kindOf = (id: string | null) => places.find((place: Place) => place.id === id)?.kind ?? null;

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
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <SummaryCard year={year} summary={summary} />
            <TrackingCard status={status} />
            {!isPro && <PlanCard trips={trips} lockedCount={locked.size} />}
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
          locked.has(item.id) ? (
            <LockedTripRow trip={item} />
          ) : (
            <TripRow
              trip={item}
              commute={isCommute(kindOf(item.startPlaceId), kindOf(item.endPlaceId))}
              onClassify={(c) => classify(item, c)}
              onLongPress={() => confirmDelete(item)}
            />
          )
        }
      />
    </ThemedView>
  );
}

function SummaryCard({
  year,
  summary,
}: {
  year: number;
  summary: ReturnType<typeof summarizeYear>;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Deductions found in {year}
      </ThemedText>
      <ThemedText type="title" accessibilityLabel={`${formatCents(summary.deductionCents)} found`}>
        {formatCents(summary.deductionCents)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatMiles(summary.businessMiles)} business
        {summary.unclassifiedCount > 0 && ` · ${summary.unclassifiedCount} to review`}
      </ThemedText>
    </ThemedView>
  );
}

function TripRow({
  trip,
  commute,
  onClassify,
  onLongPress,
}: {
  trip: Trip;
  /** Home ↔ work: shown with a warning if marked business. */
  commute: boolean;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const swipeable = useRef<SwipeableMethods>(null);
  const unclassified = trip.classification === 'unclassified';
  const business = trip.classification === 'business';
  const deduction = tripDeductionCents(trip);
  // What the trip would be worth as business: the nudge to classify it.
  const potential = unclassified ? tripDeductionCents({ ...trip, classification: 'business' }) : 0;
  const details = [
    trip.localDate,
    trip.source === 'auto' ? formatTime(trip.startedAt) : 'Added manually',
    trip.purpose,
    deduction > 0 ? formatCents(deduction) : '',
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
            <ThemedText type="smallBold">{formatMiles(metersToMiles(trip.distanceMeters))}</ThemedText>
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
              Business or personal?{potential > 0 ? ` Worth ${formatCents(potential)} if business.` : ''}
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
function LockedTripRow({ trip }: { trip: Trip }) {
  const theme = useTheme();
  const worth = tripDeductionCents({ ...trip, classification: 'business' });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Locked drive on ${trip.localDate}, ${formatMiles(metersToMiles(trip.distanceMeters))}`}
      accessibilityHint="Opens MileMint Pro to unlock it"
      onPress={() => router.push('/pro')}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.route}>
            🔒 Locked drive
          </ThemedText>
          <ThemedText type="smallBold">{formatMiles(metersToMiles(trip.distanceMeters))}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {[trip.localDate, formatTime(trip.startedAt), worth > 0 ? `worth up to ${formatCents(worth)}` : '']
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
