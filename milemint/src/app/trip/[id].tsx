import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { GaragePicker } from '@/components/garage-picker';
import { PurposePicker } from '@/components/purpose-picker';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { insertPlace, listPlaces } from '@/db/places-repo';
import {
  deleteTrip,
  getRoute,
  getTrip,
  listTrips,
  setClassification,
  setTripPlace,
  updateTripDetails,
} from '@/db/trips-repo';
import type { LatLng } from '@/domain/geo';
import type { PlaceKind } from '@/domain/places';
import { formatDistance } from '@/domain/regions';
import { frequentPurposes } from '@/domain/suggestions';
import { type Classification, type Trip, type VehicleType } from '@/domain/trip';
import type { Vehicle } from '@/domain/vehicles';
import { listVehicles } from '@/db/vehicles-repo';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';

const KIND_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'client', label: 'Client' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly { value: PlaceKind; label: string }[];

type End = 'start' | 'end';

const CLASSIFY_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
] as const satisfies readonly { value: Classification; label: string }[];

export default function TripScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { region } = useRegion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [startLabel, setStartLabel] = useState('');
  const [endLabel, setEndLabel] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  useEffect(() => {
    listTrips(db).then((trips) => setPurposes(frequentPurposes(trips, 6)), () => {});
    listVehicles(db).then(setVehicles, () => {});
  }, [db]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [loaded, points] = await Promise.all([getTrip(db, id), getRoute(db, id)]);
      if (cancelled) return;
      setTrip(loaded);
      setRoute(points);
      if (loaded) {
        setStartLabel(loaded.startLabel);
        setEndLabel(loaded.endLabel);
        setPurpose(loaded.purpose);
        setVehicle(loaded.vehicle);
        setVehicleId(loaded.vehicleId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db, id]);

  if (trip === undefined) return <ActivityIndicator style={styles.loading} />;
  if (trip === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText themeColor="textSecondary" style={styles.missing}>
          This trip no longer exists.
        </ThemedText>
      </ThemedView>
    );
  }

  const business = trip.classification === 'business';

  const classify = async (classification: Classification) => {
    await setClassification(db, trip, classification);
    setTrip(await getTrip(db, trip.id));
  };

  const confirmDelete = () =>
    Alert.alert('Delete trip?', `${trip.startLabel} → ${trip.endLabel}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(db, trip);
          router.back();
        },
      },
    ]);

  /**
   * Names one end of the trip. The typed name is saved on the trip too, so the
   * row and the place agree, and an existing place with that name is reused.
   */
  const saveAsPlace = async (end: End, name: string, kind: PlaceKind) => {
    await updateTripDetails(db, trip, end === 'start' ? { startLabel: name } : { endLabel: name });
    const existing = (await listPlaces(db)).find(
      (place) => place.name.trim().toLowerCase() === name.toLowerCase(),
    );
    const place = existing ?? (await insertPlace(db, { name, kind, at: pointFor(end) }));
    await setTripPlace(db, trip.id, end, place.id);
    setTrip(await getTrip(db, trip.id));
  };

  const save = async () => {
    if (!startLabel.trim() || !endLabel.trim()) return setError('Enter where you drove from and to.');
    if (business && !purpose.trim()) {
      return setError(`${region.authority} needs a business purpose, e.g. "Client meeting".`);
    }
    setError(null);
    setSaving(true);
    try {
      await updateTripDetails(db, trip, {
        startLabel: startLabel.trim(),
        endLabel: endLabel.trim(),
        purpose: purpose.trim(),
        vehicle,
        vehicleId,
      });
      router.back();
    } catch {
      setError('Could not save the trip. Please try again.');
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];
  // Manual trips have no GPS route, so there is nothing to pin a place to.
  const pointFor = (end: End) => (end === 'start' ? route[0] : route[route.length - 1]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <ThemedText type="small" themeColor="textSecondary">
          {trip.localDate} · {formatDistance(trip.distanceMeters, region)}
          {trip.source === 'manual' ? ' · Added manually' : ''}
        </ThemedText>
        <Segmented
          options={CLASSIFY_OPTIONS}
          value={trip.classification === 'unclassified' ? null : trip.classification}
          onChange={classify}
        />
        {vehicles.length > 1 && (
          <Field label="Vehicle">
            <GaragePicker
              vehicles={vehicles}
              value={vehicleId}
              onChange={(picked) => {
                setVehicleId(picked.id);
                setVehicle(picked.type);
              }}
            />
          </Field>
        )}
        <Field label="From">
          <TextInput style={inputStyle} value={startLabel} onChangeText={setStartLabel} />
        </Field>
        <Field label="To">
          <TextInput style={inputStyle} value={endLabel} onChangeText={setEndLabel} />
        </Field>
        <Field label={business ? 'Business purpose' : 'Note (optional)'}>
          {business ? (
            <PurposePicker value={purpose} onChange={setPurpose} recent={purposes} />
          ) : (
            <TextInput
              style={inputStyle}
              placeholderTextColor={theme.textSecondary}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Optional"
            />
          )}
        </Field>
        {error && (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {error}
          </ThemedText>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={save}
          style={[styles.button, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {saving ? 'Saving…' : 'Save'}
          </ThemedText>
        </Pressable>

        {route.length > 0 && (
          <>
            <SaveAsPlace
              end="start"
              name={startLabel.trim()}
              linked={trip.startPlaceId !== null}
              onSave={(kind) => saveAsPlace('start', startLabel.trim(), kind)}
            />
            <SaveAsPlace
              end="end"
              name={endLabel.trim()}
              linked={trip.endPlaceId !== null}
              onSave={(kind) => saveAsPlace('end', endLabel.trim(), kind)}
            />
          </>
        )}

        <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.delete}>
          <ThemedText type="small" themeColor="danger">
            Delete trip
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

/**
 * Names where the drive started or ended, so future drives there get this
 * label and can be learned or recognised as a commute.
 */
function SaveAsPlace({
  end,
  name,
  linked,
  onSave,
}: {
  end: End;
  name: string;
  linked: boolean;
  onSave: (kind: PlaceKind) => Promise<void>;
}) {
  const theme = useTheme();
  const [kind, setKind] = useState<PlaceKind>('client');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'failed'>(linked ? 'saved' : 'idle');

  if (state === 'saved') {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        {end === 'start' ? 'Start' : 'End'} is a saved place.
      </ThemedText>
    );
  }

  const save = async () => {
    if (!name) return;
    setState('saving');
    try {
      await onSave(kind);
      setState('saved');
    } catch {
      setState('failed');
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.placeCard}>
      <ThemedText type="smallBold">
        Save {end === 'start' ? 'start' : 'end'} as a place{name ? `: ${name}` : ''}
      </ThemedText>
      <Segmented options={KIND_OPTIONS} value={kind} onChange={setKind} />
      {state === 'failed' && (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          Could not save the place. Please try again.
        </ThemedText>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={!name || state === 'saving'}
        onPress={save}
        style={[styles.placeButton, { borderColor: theme.accent, opacity: name ? 1 : 0.5 }]}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {state === 'saving' ? 'Saving…' : 'Save as place'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  missing: { textAlign: 'center', marginTop: Spacing.five },
  form: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  field: { gap: Spacing.one },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  button: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  delete: { alignItems: 'center', paddingVertical: Spacing.three },
  placeCard: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  placeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
    borderWidth: 1,
  },
});
