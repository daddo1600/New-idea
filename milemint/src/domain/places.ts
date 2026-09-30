import { distanceMeters, type LatLng } from './geo';

export type PlaceKind = 'home' | 'work' | 'client' | 'other';

/** A spot the user has named, e.g. "Home" or "Acme HQ". */
export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  kind: PlaceKind;
};

/**
 * Big enough to cover a parking lot and GPS drift at the moment the car stops
 * (fixes are often 30–60 m off right after parking), small enough that two
 * neighbouring shops don't blur into one place.
 */
export const DEFAULT_PLACE_RADIUS_M = 150;

/** The nearest place whose radius contains the point, or null when none does. */
export function matchPlace(point: LatLng, places: readonly Place[]): Place | null {
  let best: Place | null = null;
  let bestDistance = Infinity;
  for (const place of places) {
    const d = distanceMeters(point, place);
    // Nearest wins so overlapping places (home and a neighbour's) resolve sensibly.
    if (d <= place.radiusM && d < bestDistance) {
      best = place;
      bestDistance = d;
    }
  }
  return best;
}
