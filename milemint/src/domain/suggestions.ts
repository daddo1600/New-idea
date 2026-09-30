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
