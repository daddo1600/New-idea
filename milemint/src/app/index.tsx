import { router } from 'expo-router';
import { useMemo } from 'react';
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

const CLASSIFY_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
] as const satisfies readonly { value: Classification; label: string }[];

export default function HomeScreen() {
  const { trips, classify, remove } = useTrips();
  const year = new Date().getFullYear();
  const summary = useMemo(() => summarizeYear(trips ?? [], year), [trips, year]);

  if (!trips) return <ActivityIndicator style={styles.loading} />;

  const confirmDelete = (trip: Trip) =>
    Alert.alert('Delete trip?', `${trip.startLabel} → ${trip.endLabel}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(trip) },
    ]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(trip) => trip.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<SummaryCard year={year} summary={summary} />}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No trips yet. Add your first drive to see what it&apos;s worth.
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
      <AddTripButton />
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
  const deduction = tripDeductionCents(trip);
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
          {trip.localDate}
          {trip.purpose ? ` · ${trip.purpose}` : ''}
          {deduction > 0 ? ` · ${formatCents(deduction)}` : ''}
        </ThemedText>
        <Segmented
          options={CLASSIFY_OPTIONS}
          value={trip.classification === 'unclassified' ? null : trip.classification}
          onChange={onClassify}
        />
      </ThemedView>
    </Pressable>
  );
}

function AddTripButton() {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/add-trip')}
      style={[styles.fab, { backgroundColor: theme.accent }]}>
      <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
        + Add trip
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  list: {
    padding: Spacing.three,
    paddingBottom: Spacing.six + Spacing.five,
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
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.five,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 28,
  },
});
