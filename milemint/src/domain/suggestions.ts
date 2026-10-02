import type { Place } from './places';
import type { Trip } from './trip';

type Sortable = Pick<Trip, 'startLabel' | 'endLabel' | 'purpose' | 'startedAt'>;

/** Most used first; ties go to the most recent. Case-insensitive, keeping the latest spelling. */
function rank(entries: { text: string; at: string }[], limit: number): string[] {
  const seen = new Map<string, { text: string; count: number; last: string }>();
  for (const { text, at } of entries) {
    const trimmed = text.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const entry = seen.get(key);
    if (!entry) seen.set(key, { text: trimmed, count: 1, last: at });
    else {
      entry.count++;
      if (at > entry.last) Object.assign(entry, { text: trimmed, last: at });
    }
  }
  return [...seen.values()]
    .sort((a, b) => b.count - a.count || b.last.localeCompare(a.last))
    .slice(0, limit)
    .map((entry) => entry.text);
}

/** Where the user often starts or ends drives, other than their saved places: quick picks for manual trips. */
export function frequentSpots(trips: readonly Sortable[], places: readonly Place[], limit = 4): string[] {
  const named = new Set(places.map((place) => place.name.trim().toLowerCase()));
  return rank(
    trips.flatMap((trip) => [
      { text: trip.startLabel, at: trip.startedAt },
      { text: trip.endLabel, at: trip.startedAt },
    ]),
    limit + named.size,
  )
    .filter((text) => !named.has(text.toLowerCase()))
    .slice(0, limit);
}

/** Business purposes used before, e.g. "Client meeting", most used first. */
export function frequentPurposes(trips: readonly (Sortable & Pick<Trip, 'classification'>)[], limit = 4): string[] {
  return rank(
    trips.filter((trip) => trip.classification === 'business').map((trip) => ({ text: trip.purpose, at: trip.startedAt })),
    limit,
  );
}

type Placed = Pick<Trip, 'startLabel' | 'endLabel' | 'startPlaceId' | 'endPlaceId'>;

/** The purposes last given to business drives, by where they went (`to:`) and any place they touched (`at:`). */
export type PlacePurposes = ReadonlyMap<string, string>;

/** A spot as the history knows it: the saved place, or the label for anywhere else. */
function spotKey(placeId: string | null, label: string): string | null {
  if (placeId) return `place:${placeId}`;
  const trimmed = label.trim().toLowerCase();
  return trimmed ? `label:${trimmed}` : null;
}

/**
 * The purpose last given to a business drive to (and to or from) each place,
 * worked out once for a list. Home is left out (`isHome`): nearly every drive
 * starts or ends there, so it says nothing about why.
 */
export function purposesByPlace(
  trips: readonly (Placed & Pick<Trip, 'classification' | 'purpose' | 'startedAt'>)[],
  isHome: (placeId: string) => boolean = () => false,
): PlacePurposes {
  const latest = new Map<string, { purpose: string; at: string }>();
  const note = (key: string, purpose: string, at: string) => {
    const seen = latest.get(key);
    if (!seen || at > seen.at) latest.set(key, { purpose, at });
  };
  for (const trip of trips) {
    const purpose = trip.purpose.trim();
    if (trip.classification !== 'business' || !purpose) continue;
    const ends = [
      { placeId: trip.endPlaceId, label: trip.endLabel, to: true },
      { placeId: trip.startPlaceId, label: trip.startLabel, to: false },
    ];
    for (const { placeId, label, to } of ends) {
      if (placeId && isHome(placeId)) continue;
      const key = spotKey(placeId, label);
      if (!key) continue;
      if (to) note(`to:${key}`, purpose, trip.startedAt);
      note(`at:${key}`, purpose, trip.startedAt);
    }
  }
  return new Map([...latest].map(([key, { purpose }]) => [key, purpose]));
}

/**
 * The one purpose to suggest for a business drive without one, most likely
 * first: what the last drive to the same place was for, then the last one
 * to or from either of its ends; else the user's usual purpose; else the
 * first of the quick choices. Null when there's nothing to go on.
 */
export function suggestPurpose(
  trip: Placed,
  {
    byPlace = new Map(),
    usual = null,
    choices = [],
  }: { byPlace?: PlacePurposes; usual?: string | null; choices?: readonly string[] },
): string | null {
  const end = spotKey(trip.endPlaceId, trip.endLabel);
  const start = spotKey(trip.startPlaceId, trip.startLabel);
  for (const key of [end && `to:${end}`, end && `at:${end}`, start && `at:${start}`]) {
    const purpose = key ? byPlace.get(key) : undefined;
    if (purpose) return purpose;
  }
  return usual?.trim() || choices.find((choice) => choice.trim())?.trim() || null;
}
