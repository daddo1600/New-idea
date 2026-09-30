import { router, Stack } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/db/use-trips';
import { formatCents, formatMiles } from '@/domain/format';
import {
  metersToMiles,
  summarizeYear,
  tripDeductionCents,
  type Classification,
  type Trip,
} from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import type { TrackingStatus } from '@/tracking/background';
import { useTracking } from '@/tracking/use-tracking';

const CLASSIFY_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
] as const satisfies readonly { value: Classification; label: string }[];

/** Show the tracking setup once per launch until location access is granted. */
let promptedForTracking = false;

export default function HomeScreen() {
  const { trips, classify, remove, reload } = useTrips();
  const { status } = useTracking(reload);
  const year = new Date().getFullYear();
  const summary = useMemo(() => summarizeYear(trips ?? [], year), [trips, year]);

  useEffect(() => {
    if (status === 'needs-permission' && !promptedForTracking) {
      promptedForTracking = true;
      router.push('/setup-tracking');
    }
  }, [status]);

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const confirmDelete = (trip: Trip) =>
    Alert.alert('Delete trip?', `${trip.startLabel} → ${trip.endLabel}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(trip) },
    ]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerRight: () => <AddMissedTripLink /> }} />
      <FlatList
        data={trips}
        keyExtractor={(trip) => trip.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <SummaryCard year={year} summary={summary} />
            <TrackingCard status={status} />
          </View>
        }
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {status === 'on'
              ? 'Your next drive will appear here after you park.'
              : 'Turn on automatic tracking and your drives will appear here.'}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TripRow
            trip={item}
            onClassify={(c) => classify(item, c)}
            onLongPress={() => confirmDelete(item)}
          />
        )}
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
  onClassify,
  onLongPress,
}: {
  trip: Trip;
  onClassify: (classification: Classification) => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const unclassified = trip.classification === 'unclassified';
  const deduction = tripDeductionCents(trip);
  // What the trip would be worth as business: the nudge to classify it.
  const potential = unclassified ? tripDeductionCents({ ...trip, classification: 'business' }) : 0;
  const details = [
    trip.localDate,
    trip.source === 'auto' ? formatTime(trip.startedAt) : 'Added manually',
    trip.purpose,
    deduction > 0 ? formatCents(deduction) : '',
  ].filter(Boolean);
  return (
    <Pressable onLongPress={onLongPress} accessibilityHint="Long press to delete">
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
        {unclassified && (
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Business or personal?{potential > 0 ? ` Worth ${formatCents(potential)} if business.` : ''}
          </ThemedText>
        )}
        <Segmented
          options={CLASSIFY_OPTIONS}
          value={unclassified ? null : trip.classification}
          onChange={onClassify}
        />
      </ThemedView>
    </Pressable>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
  header: { gap: Spacing.three },
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
