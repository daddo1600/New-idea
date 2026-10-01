import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CalendarPicker } from '@/components/calendar-picker';
import { Chip, EMPTY_PLACE, PlaceField, resolvePlace, type PlaceDraft } from '@/components/place-field';
import { PurposePicker } from '@/components/purpose-picker';
import { Segmented } from '@/components/segmented';
import { GaragePicker } from '@/components/garage-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listPlaces } from '@/db/places-repo';
import { ensureVehicles } from '@/db/vehicles-repo';
import { insertTrip, listTrips } from '@/db/trips-repo';
import { parseMiles } from '@/domain/format';
import type { LatLng } from '@/domain/geo';
import { matchPlace, type Place } from '@/domain/places';
import { areaLabel, clientVisitLabel, isAreaOnly, placeNameSet, privateLabel } from '@/domain/privacy';
import { loadSettings } from '@/db/settings-repo';
import { displayLocale, earliestDate, formatDistance, formatLongDate, fromUnits, toUnits } from '@/domain/regions';
import { frequentPurposes, frequentSpots } from '@/domain/suggestions';
import { toLocalIsoDate, type Trip, type VehicleType } from '@/domain/trip';
import type { Vehicle } from '@/domain/vehicles';
import { useKeyboardOpen } from '@/hooks/use-keyboard-open';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { drivingDistance } from '@/places/address-search';
import { useRegion } from '@/region/region';
import { markGapFilled } from '@/tracking/use-tracking-health';

type Kind = 'business' | 'personal';

/** One manual entry longer than this (about 1,000 miles) is almost certainly a typo. */
const MAX_TRIP_METERS = 1_610_000;

/** Route params from the home card's missed-trip offer (all optional strings). */
type GapParams = {
  gap?: string;
  date?: string;
  fromLabel?: string;
  fromLat?: string;
  fromLng?: string;
  toLabel?: string;
  toLat?: string;
  toLng?: string;
  startedAt?: string;
  endedAt?: string;
};

function gapPlace(label?: string, lat?: string, lng?: string): PlaceDraft {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!label?.trim()) return EMPTY_PLACE;
  const at = lat && lng && Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  return { text: label, at, placeId: null };
}

/** A valid ISO time from a route param, or null. */
function isoParam(value?: string): string | null {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalIsoDate(date);
};

export default function AddTripScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const miles = region.unit === 'mi';
  const today = toLocalIsoDate(new Date());

  const [kind, setKind] = useState<Kind>('business');
  const keyboardOpen = useKeyboardOpen();
  const scroller = useRef<ScrollView>(null);
  const fieldTops = useRef({ from: 0, to: 0 });
  /** Moves an address box near the top, so its suggestions show above the keyboard. */
  const scrollFieldUp = (field: 'from' | 'to') =>
    setTimeout(() => scroller.current?.scrollTo({ y: Math.max(0, fieldTops.current[field] - 8), animated: true }), 250);
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  // Opened from the home card's "Add missed trip": a gap tracking lost, with its ends and times.
  const gap = useLocalSearchParams<GapParams>();
  const [date, setDate] = useState(gap.date && gap.date <= today ? gap.date : today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [from, setFrom] = useState<PlaceDraft>(() => gapPlace(gap.fromLabel, gap.fromLat, gap.fromLng));
  const [to, setTo] = useState<PlaceDraft>(() => gapPlace(gap.toLabel, gap.toLat, gap.toLng));
  const [distance, setDistance] = useState('');
  /** Set when Apple Maps filled the distance in; cleared once the user types their own. */
  const [estimated, setEstimated] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [history, setHistory] = useState<Trip[]>([]);

  const [clientPrivacy, setClientPrivacy] = useState(false);

  useEffect(() => {
    listPlaces(db).then(setPlaces, () => {});
    loadSettings(db).then((settings) => setClientPrivacy(settings.clientPrivacy), () => {});
    ensureVehicles(db).then(({ vehicles: garage, current }) => {
      setVehicles(garage);
      setVehicle(current.type);
      setVehicleId(current.id);
    }, () => {});
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

  /** True for the area only, false to keep the address as typed, null to go back and change it. */
  const askAreaOnly = () =>
    // The web preview has no alerts: the private choice.
    Platform.OS === 'web'
      ? Promise.resolve(true)
      : new Promise<boolean | null>((resolve) =>
          Alert.alert(
            t('Save only the area?'),
            t('Client privacy is on. MileMint can save the town and postcode area instead of the address, as “Client visit · area”.'),
            [
              { text: t('Cancel'), style: 'cancel', onPress: () => resolve(null) },
              { text: t('Keep the address'), onPress: () => resolve(false) },
              { text: t('Area only'), isPreferred: true, onPress: () => resolve(true) },
            ],
            { cancelable: true, onDismiss: () => resolve(null) },
          ),
        );

  /** One save at a time: the checks before `saving` is set await (area lookup), so a double tap could save twice. */
  const busy = useRef(false);
  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await saveTrip();
    } finally {
      busy.current = false;
    }
  };
  const saveTrip = async () => {
    const parsed = parseMiles(distance);
    const meters = parsed === null ? null : fromUnits(parsed, region);
    if (!from.text.trim() || !to.text.trim()) return setError(t('Choose where you drove from and to.'));
    if (meters === null) {
      return setError(miles ? t('Enter the miles driven, e.g. 12.5.') : t('Enter the kilometres driven, e.g. 12.5.'));
    }
    if (meters > MAX_TRIP_METERS) {
      return setError(
        t('{{distance}} is more than one trip should be. Check for an extra digit.', {
          distance: formatDistance(meters, region),
        }),
      );
    }
    if (kind === 'business' && !purpose.trim()) {
      return setError(t('{{authority}} needs a business purpose, e.g. "Client meeting".', { authority: region.authority }));
    }
    // Client privacy: address search still works, but offer to store just the area.
    const placeNames = placeNameSet(places);
    const needsArea = (draft: PlaceDraft) =>
      !draft.placeId && !isAreaOnly(draft.text, placeNames);
    const areaOnly = clientPrivacy && (needsArea(from) || needsArea(to)) ? await askAreaOnly() : false;
    if (areaOnly === null) return;
    /** "Client visit · area" for an end the user didn't pick from their own places. */
    const labelFor = async (draft: PlaceDraft) => {
      if (!areaOnly || !needsArea(draft)) return draft.text.trim();
      if (draft.at) {
        const [found] = await Location.reverseGeocodeAsync(draft.at).catch(() => []);
        const area = areaLabel(found, region.code);
        if (area) return clientVisitLabel(area);
      }
      return privateLabel(draft.text, region.code);
    };
    setError(null);
    setSaving(true);
    try {
      // Link to saved places (typed addresses that land on one count too), so commutes are spotted.
      const placeFor = async (draft: PlaceDraft) => {
        if (draft.placeId) return draft.placeId;
        const at = draft.at ?? (await resolvePlace(draft).catch(() => null));
        return at ? (matchPlace(at, places)?.id ?? null) : null;
      };
      // A gap tracking lost keeps its real times, unless the date was changed.
      const gapTimes = gap.gap && date === gap.date ? { start: isoParam(gap.startedAt), end: isoParam(gap.endedAt) } : null;
      await insertTrip(db, {
        // Manual trips have no clock time; noon local keeps the UTC stamp on the same day.
        startedAt: gapTimes?.start ?? new Date(`${date}T12:00:00`).toISOString(),
        localDate: date,
        endedAt: gapTimes?.start ? gapTimes.end : null,
        startLabel: await labelFor(from),
        endLabel: await labelFor(to),
        distanceMeters: meters,
        classification: kind,
        purpose: purpose.trim(),
        source: 'manual',
        vehicle,
        vehicleId,
        startPlaceId: await placeFor(from),
        endPlaceId: await placeFor(to),
      });
      // Filled in: the home card stops offering it.
      if (gap.gap) await markGapFilled(db, gap.gap).catch(() => {});
      // Opened from a link (nothing to go back to): home instead.
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch {
      setError(t('Could not save the trip. Please try again.'));
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  const dateLabel =
    date === today ? t('Today') : date === daysAgo(1) ? t('Yesterday') : formatLongDate(date, region);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroller}
          contentContainerStyle={[styles.form, keyboardOpen && styles.roomToScroll]}
          keyboardShouldPersistTaps="handled">
          <Segmented
            options={[
              { value: 'business', label: t('Business') },
              { value: 'personal', label: t('Personal') },
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
              accessibilityLabel={
                calendarOpen
                  ? t('Date: {{date}}. Hide calendar', { date: dateLabel })
                  : t('Date: {{date}}. Show calendar', { date: dateLabel })
              }
              onPress={() => setCalendarOpen(!calendarOpen)}
              style={styles.dateRow}>
              <View>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('Date')}
                </ThemedText>
                <ThemedText type="smallBold">{dateLabel}</ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.accent }}>
                📅 {calendarOpen ? t('Done') : t('Change')}
              </ThemedText>
            </Pressable>
            {!calendarOpen && (
              <View style={styles.chips}>
                <Chip label={t('Today')} selected={date === today} onPress={() => setDate(today)} />
                <Chip label={t('Yesterday')} selected={date === daysAgo(1)} onPress={() => setDate(daysAgo(1))} />
              </View>
            )}
            {calendarOpen && (
              <CalendarPicker
                value={date}
                min={earliestDate(region)}
                max={today}
                locale={displayLocale(region)}
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
              label={t('From')}
              placeholder={t('Search an address or place')}
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
            accessibilityLabel={t('Swap from and to')}
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
              label={t('To')}
              placeholder={t('Search an address or place')}
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

          {vehicles.length > 1 && (
            <GaragePicker
              vehicles={vehicles}
              value={vehicleId}
              onChange={(picked) => {
                setVehicleId(picked.id);
                setVehicle(picked.type);
              }}
            />
          )}

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {miles ? t('Miles') : t('Kilometres')}
              </ThemedText>
              {measuring ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('Measuring the route…')}
                </ThemedText>
              ) : (
                estimated && (
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    {t('By road, from Apple Maps')}
                  </ThemedText>
                )
              )}
            </View>
            <TextInput
              accessibilityLabel={miles ? t('miles') : t('kilometres')}
              style={inputStyle}
              placeholderTextColor={theme.textSecondary}
              value={distance}
              onChangeText={(value) => {
                clearError();
                setEstimated(false);
                setDistance(value);
              }}
              inputMode="decimal"
              placeholder={from.at && to.at ? '' : t('Pick both places to fill this in, or type it')}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              {kind === 'business' ? t('Business purpose') : t('Note (optional)')}
            </ThemedText>
            {kind === 'business' ? (
              <PurposePicker
                value={purpose}
                recent={purposes}
                clientPrivacy={clientPrivacy}
                onChange={(value) => {
                  clearError();
                  setPurpose(value);
                }}
              />
            ) : (
              <TextInput
                accessibilityLabel={t('Note')}
                style={inputStyle}
                placeholderTextColor={theme.textSecondary}
                value={purpose}
                onChangeText={(value) => {
                  clearError();
                  setPurpose(value);
                }}
                placeholder={t('Optional')}
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
              {saving ? t('Saving…') : t('Save trip')}
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
