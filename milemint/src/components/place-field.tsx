import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { LatLng } from '@/domain/geo';
import type { Place, PlaceKind } from '@/domain/places';
import { useTheme } from '@/hooks/use-theme';
import { locateAddress, suggestAddresses, type AddressSuggestion } from '@/places/address-search';

/**
 * Where a trip started or ended, or a place being saved: picked from saved
 * places, chosen from Apple Maps suggestions while typing, or "I'm here now".
 */
export type PlaceDraft = { text: string; at: LatLng | null; placeId: string | null };

export const EMPTY_PLACE: PlaceDraft = { text: '', at: null, placeId: null };

/** Where the draft points, looking the typed address up if needed. Throws a message fit to show. */
export async function resolvePlace(draft: PlaceDraft): Promise<LatLng> {
  if (draft.at) return draft.at;
  const found = await locateAddress(draft.text.trim());
  if (!found) throw new Error(`Couldn’t find “${draft.text.trim()}”. Pick a suggestion, or add the town or postcode.`);
  return found;
}

export const PLACE_ICONS: Record<PlaceKind, string> = { home: '🏠', work: '💼', client: '🤝', other: '📍' };

/** A short, readable label for where the phone is, e.g. "12 High Street, Bristol". */
function describe(address: Location.LocationGeocodedAddress | undefined): string {
  if (!address) return 'Current location';
  const street = [address.streetNumber, address.street].filter(Boolean).join(' ') || address.name;
  return [street, address.city].filter(Boolean).join(', ') || 'Current location';
}

const SUGGEST_DELAY_MS = 180;

export function PlaceField({
  label,
  placeholder,
  value,
  onChange,
  places = [],
  recent = [],
  near = null,
  here = true,
}: {
  label: string;
  placeholder: string;
  value: PlaceDraft;
  onChange: (next: PlaceDraft) => void;
  /** Saved places, offered as one-tap chips. */
  places?: readonly Place[];
  /** Other spots the user often drives to (trip labels), also as chips. */
  recent?: readonly string[];
  /** Suggestions near here come first. */
  near?: LatLng | null;
  /** Offer "I'm here now". */
  here?: boolean;
}) {
  const theme = useTheme();
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const latest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const type = (text: string) => {
    setNote(null);
    onChange({ text, at: null, placeId: null });
    if (timer.current) clearTimeout(timer.current);
    const request = ++latest.current;
    if (text.trim().length < 2) return setSuggestions([]);
    timer.current = setTimeout(async () => {
      const found = await suggestAddresses(text, near);
      // Only the newest keystroke's answer is shown.
      if (request === latest.current) setSuggestions(found);
    }, SUGGEST_DELAY_MS);
  };

  const choose = async (suggestion: AddressSuggestion) => {
    latest.current++;
    setSuggestions([]);
    Keyboard.dismiss();
    setLocating(true);
    onChange({ text: suggestion.title, at: null, placeId: null });
    const at = await locateAddress(suggestion.title, suggestion.subtitle);
    setLocating(false);
    if (at) onChange({ text: suggestion.title, at, placeId: null });
    else setNote('Apple Maps couldn’t place that one. Try another suggestion.');
  };

  const pickPlace = (place: Place) => {
    latest.current++;
    setSuggestions([]);
    setNote(null);
    Keyboard.dismiss();
    onChange({ text: place.name, at: { latitude: place.latitude, longitude: place.longitude }, placeId: place.id });
  };

  const pickRecent = (text: string) => {
    latest.current++;
    setSuggestions([]);
    setNote(null);
    Keyboard.dismiss();
    onChange({ text, at: null, placeId: null });
  };

  const useHere = async () => {
    setNote(null);
    setLocating(true);
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && !(await Location.requestForegroundPermissionsAsync()).granted) {
        setNote('Location is off for MileMint, so type the address instead.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const at = { latitude: coords.latitude, longitude: coords.longitude };
      const [address] = await Location.reverseGeocodeAsync(at).catch(() => []);
      onChange({ text: describe(address), at, placeId: null });
    } catch {
      setNote('Couldn’t find where you are right now. Type the address instead.');
    } finally {
      setLocating(false);
    }
  };

  const chips = places.length > 0 || recent.length > 0;
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {locating ? (
          <ActivityIndicator size="small" color={theme.accent} />
        ) : (
          value.at && (
            <ThemedText type="small" style={{ color: theme.accent }}>
              ✓ Found
            </ThemedText>
          )
        )}
      </View>

      {chips && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chips}>
          {places.map((place) => (
            <Chip
              key={place.id}
              label={`${PLACE_ICONS[place.kind]} ${place.name}`}
              selected={value.placeId === place.id}
              onPress={() => pickPlace(place)}
            />
          ))}
          {recent.map((text) => (
            <Chip
              key={`recent:${text}`}
              label={`🕘 ${text}`}
              selected={value.placeId === null && value.text === text}
              onPress={() => pickRecent(text)}
            />
          ))}
        </ScrollView>
      )}

      <TextInput
        accessibilityLabel={`${label} address`}
        value={value.text}
        onChangeText={type}
        onFocus={() => setFocused(true)}
        // A beat later, so tapping a suggestion lands before the list hides.
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCorrect={false}
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        returnKeyType="done"
        style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
      />

      {focused && suggestions.length > 0 && (
        <View
          accessibilityRole="list"
          style={[styles.suggestions, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
          {suggestions.slice(0, 6).map((suggestion, index) => (
            <Pressable
              key={`${suggestion.title}\n${suggestion.subtitle}`}
              accessibilityRole="button"
              accessibilityLabel={`${suggestion.title}, ${suggestion.subtitle}`}
              onPress={() => choose(suggestion)}
              style={({ pressed }) => [
                styles.suggestion,
                index > 0 && { borderTopColor: theme.backgroundSelected, borderTopWidth: StyleSheet.hairlineWidth },
                pressed && { backgroundColor: theme.backgroundSelected },
              ]}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {suggestion.title}
              </ThemedText>
              {suggestion.subtitle ? (
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {suggestion.subtitle}
                </ThemedText>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      {here && (
        <Pressable accessibilityRole="button" hitSlop={8} disabled={locating} onPress={useHere} style={styles.here}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            📍 I’m here now
          </ThemedText>
        </Pressable>
      )}
      {note && (
        <ThemedText type="small" themeColor="textSecondary">
          {note}
        </ThemedText>
      )}
    </ThemedView>
  );
}

/** A one-tap choice, e.g. a saved place. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.accent : theme.background, borderColor: theme.backgroundSelected },
      ]}>
      <ThemedText type="small" numberOfLines={1} style={{ color: selected ? theme.onAccent : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 },
  chips: { gap: Spacing.two },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    maxWidth: 220,
  },
  input: { borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 16 },
  suggestions: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  suggestion: { paddingHorizontal: Spacing.three, paddingVertical: 10, gap: 2 },
  here: { alignSelf: 'flex-start', minHeight: 20, justifyContent: 'center' },
});
