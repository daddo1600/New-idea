import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CalendarPicker } from '@/components/calendar-picker';
import { Chip, EMPTY_PLACE, PlaceField, resolvePlace, type PlaceDraft } from '@/components/place-field';
import { PurposePicker } from '@/components/purpose-picker';
import { Segmented } from '@/components/segmented';
import { VehiclePicker } from '@/components/vehicle-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listPlaces } from '@/db/places-repo';
import { loadSettings } from '@/db/settings-repo';
import { insertTrip, listTrips } from '@/db/trips-repo';
import { parseMiles } from '@/domain/format';
import type { LatLng } from '@/domain/geo';
import { matchPlace, type Place } from '@/domain/places';
import { earliestDate, formatDistance, formatLongDate, fromUnits, toUnits } from '@/domain/regions';
import { frequentPurposes, frequentSpots } from '@/domain/suggestions';
import { toLocalIsoDate, type Trip, type VehicleType } from '@/domain/trip';
import { useKeyboardOpen } from '@/hooks/use-keyboard-open';
import { useTheme } from '@/hooks/use-theme';
import { drivingDistance } from '@/places/address-search';
import { useRegion } from '@/region/region';

type Kind = 'business' | 'personal';

/** One manual entry longer than this (about 1,000 miles) is almost certainly a typo. */
const MAX_TRIP_METERS = 1_610_000;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalIsoDate(date);
};

export default function AddTripScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { region } = useRegion();
  const unitName = region.unit === 'mi' ? 'miles' : 'kilometres';
  const today = toLocalIsoDate(new Date());

  const [kind, setKind] = useState<Kind>('business');
  const keyboardOpen = useKeyboardOpen();
  const scroller = useRef<ScrollView>(null);
  const fieldTops = useRef({ from: 0, to: 0 });
  /** Moves an address box near the top, so its suggestions show above the keyboard. */
  const scrollFieldUp = (field: 'from' | 'to') =>
    setTimeout(() => scroller.current?.scrollTo({ y: Math.max(0, fieldTops.current[field] - 8), animated: true }), 250);
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [date, setDate] = useState(today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [from, setFrom] = useState<PlaceDraft>(EMPTY_PLACE);
  const [to, setTo] = useState<PlaceDraft>(EMPTY_PLACE);
  const [distance, setDistance] = useState('');
  /** Set when Apple Maps filled the distance in; cleared once the user types their own. */
  const [estimated, setEstimated] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [history, setHistory] = useState<Trip[]>([]);

  useEffect(() => {
    listPlaces(db).then(setPlaces, () => {});
    loadSettings(db).then((settings) => setVehicle(settings.vehicle), () => {});
    listTrips(db).then(setHistory, () => {});
  }, [db]);

  const spots = useMemo(() => frequentSpots(history, places), [history, places]);
  const purposes = useMemo(() => frequentPurposes(history, 6), [history]);
  const home = places.find((place) => place.kind === 'home');
  const near: LatLng | null = from.at ?? to.at ?? (home ? { latitude: home.latitude, longitude: home.longitude } : null);

  // Both ends known: ask Apple Maps how far it is by road, unless the user typed their own distance.
  const route = from.at && to.at ? JSON.stringify([from.at, to.at]) : null;
  const [measured, setMeasured] = useState<string | null>(null);
  const wantsEstimate = route !== null && (!distance || estimated);
  const measuring = wantsEstimate && measured !== route;
  useEffect(() => {
    if (!route || !wantsEstimate) return;
    let current = true;
    const [start, end] = JSON.parse(route) as [LatLng, LatLng];
    drivingDistance(start, end).then((meters) => {
      if (!current) return;
      setMeasured(route);
      if (meters === null) return;
      setDistance(String(Math.round(toUnits(meters, region) * 10) / 10));
      setEstimated(true);
    });
    return () => {
      current = false;
    };
    // Only when an end changes; the rest is read to respect a typed distance, not to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, region]);

  const clearError = () => setError(null);

  const save = async () => {
    const parsed = parseMiles(distance);
    const meters = parsed === null ? null : fromUnits(parsed, region);
    if (!from.text.trim() || !to.text.trim()) return setError('Choose where you drove from and to.');
    if (meters === null) return setError(`Enter the ${unitName} driven, e.g. 12.5.`);
    if (meters > MAX_TRIP_METERS) {
      return setError(`${formatDistance(meters, region)} is more than one trip should be. Check for an extra digit.`);
    }
    if (kind === 'business' && !purpose.trim()) {
      return setError(`${region.authority} needs a business purpose, e.g. "Client meeting".`);
    }
    setError(null);
    setSaving(true);
    try {
      // Link to saved places (typed addresses that land on one count too), so commutes are spotted.
      const placeFor = async (draft: PlaceDraft) => {
        if (draft.placeId) return draft.placeId;
        const at = draft.at ?? (await resolvePlace(draft).catch(() => null));
        return at ? (matchPlace(at, places)?.id ?? null) : null;
      };
      await insertTrip(db, {
        // Manual trips have no clock time; noon local keeps the UTC stamp on the same day.
        startedAt: new Date(`${date}T12:00:00`).toISOString(),
        localDate: date,
        endedAt: null,
        startLabel: from.text.trim(),
        endLabel: to.text.trim(),
        distanceMeters: meters,
        classification: kind,
        purpose: purpose.trim(),
        source: 'manual',
        vehicle,
        startPlaceId: await placeFor(from),
        endPlaceId: await placeFor(to),
      });
      router.back();
    } catch {
      setError('Could not save the trip. Please try again.');
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  const dateLabel =
    date === today ? 'Today' : date === daysAgo(1) ? 'Yesterday' : formatLongDate(date, region);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroller}
          contentContainerStyle={[styles.form, keyboardOpen && styles.roomToScroll]}
          keyboardShouldPersistTaps="handled">
          <Segmented
            options={[
              { value: 'business', label: 'Business' },
              { value: 'personal', label: 'Personal' },
            ]}
            value={kind}
            onChange={(value) => {
              clearError();
              setKind(value);
            }}
          />

          <ThemedView type="backgroundElement" style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Date: ${dateLabel}. ${calendarOpen ? 'Hide' : 'Show'} calendar`}
              onPress={() => setCalendarOpen(!calendarOpen)}
              style={styles.dateRow}>
              <View>
                <ThemedText type="small" themeColor="textSecondary">
                  Date
                </ThemedText>
                <ThemedText type="smallBold">{dateLabel}</ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.accent }}>
                📅 {calendarOpen ? 'Done' : 'Change'}
              </ThemedText>
            </Pressable>
            {!calendarOpen && (
              <View style={styles.chips}>
                <Chip label="Today" selected={date === today} onPress={() => setDate(today)} />
                <Chip label="Yesterday" selected={date === daysAgo(1)} onPress={() => setDate(daysAgo(1))} />
              </View>
            )}
            {calendarOpen && (
              <CalendarPicker
                value={date}
                min={earliestDate(region)}
                max={today}
                locale={region.locale}
                weekStartsOn={region.code === 'US' || region.code === 'CA' ? 0 : 1}
                onChange={(picked) => {
                  setDate(picked);
                  setCalendarOpen(false);
                }}
              />
            )}
          </ThemedView>

          <View onLayout={(e) => (fieldTops.current.from = e.nativeEvent.layout.y)}>
            <PlaceField
              label="From"
              placeholder="Search an address or place"
              value={from}
              onChange={(next) => {
                clearError();
                setFrom(next);
              }}
              places={places}
              recent={spots}
              near={near}
              onFocus={() => scrollFieldUp('from')}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Swap from and to"
            hitSlop={8}
            onPress={() => {
              setFrom(to);
              setTo(from);
            }}
            style={[styles.swap, { backgroundColor: theme.backgroundElement, borderColor: theme.background }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              ⇅
            </ThemedText>
          </Pressable>
          <View onLayout={(e) => (fieldTops.current.to = e.nativeEvent.layout.y)}>
            <PlaceField
              label="To"
              placeholder="Search an address or place"
              value={to}
              onChange={(next) => {
                clearError();
                setTo(next);
              }}
              places={places}
              recent={spots}
              near={near}
              here={false}
              onFocus={() => scrollFieldUp('to')}
            />
          </View>

          <VehiclePicker value={vehicle} onChange={setVehicle} />

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {unitName === 'miles' ? 'Miles' : 'Kilometres'}
              </ThemedText>
              {measuring ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Measuring the route…
                </ThemedText>
              ) : (
                estimated && (
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    By road, from Apple Maps
                  </ThemedText>
                )
              )}
            </View>
            <TextInput
              accessibilityLabel={unitName}
              style={inputStyle}
              placeholderTextColor={theme.textSecondary}
              value={distance}
              onChangeText={(value) => {
                clearError();
                setEstimated(false);
                setDistance(value);
              }}
              inputMode="decimal"
              placeholder={from.at && to.at ? '' : 'Pick both places to fill this in, or type it'}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              {kind === 'business' ? 'Business purpose' : 'Note (optional)'}
            </ThemedText>
            {kind === 'business' ? (
              <PurposePicker
                value={purpose}
                recent={purposes}
                onChange={(value) => {
                  clearError();
                  setPurpose(value);
                }}
              />
            ) : (
              <TextInput
                accessibilityLabel="Note"
                style={inputStyle}
                placeholderTextColor={theme.textSecondary}
                value={purpose}
                onChangeText={(value) => {
                  clearError();
                  setPurpose(value);
                }}
                placeholder="Optional"
              />
            )}
          </View>

          {error && (
            <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={save}
            style={[styles.save, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {saving ? 'Saving…' : 'Save trip'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  swap: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -Spacing.four,
    zIndex: 1,
  },
  field: { gap: Spacing.one },
  roomToScroll: { paddingBottom: 420 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  save: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
