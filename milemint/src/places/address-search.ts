import * as Location from 'expo-location';
import { requireOptionalNativeModule } from 'expo';

import { DEMO_MODE } from '@/dev/demo';
import { distanceMeters, type LatLng } from '@/domain/geo';

/** An Apple Maps suggestion, e.g. { title: "10 Downing Street", subtitle: "London, SW1A 2AA, England" }. */
export type AddressSuggestion = { title: string; subtitle: string };

type AddressSearchNative = {
  suggest(query: string, latitude: number | null, longitude: number | null): Promise<AddressSuggestion[]>;
  resolve(title: string, subtitle: string): Promise<LatLng | null>;
  drivingDistance(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<number | null>;
};

/** modules/address-search (MapKit). Missing on the web and in builds from before it was added. */
const native = requireOptionalNativeModule<AddressSearchNative>('AddressSearch');

/** A few made-up addresses so the web preview can show suggestions. */
const DEMO_ADDRESSES: (AddressSuggestion & LatLng)[] = [
  { title: '1 Infinite Loop', subtitle: 'Cupertino, CA 95014, United States', latitude: 37.3318, longitude: -122.0312 },
  { title: '100 Main Street', subtitle: 'Los Altos, CA 94022, United States', latitude: 37.3794, longitude: -122.1141 },
  { title: '1000 Main Street', subtitle: 'Redwood City, CA 94063, United States', latitude: 37.4852, longitude: -122.2364 },
  { title: 'Westfield Valley Fair', subtitle: '2855 Stevens Creek Blvd, Santa Clara, CA', latitude: 37.3257, longitude: -121.9456 },
  { title: 'Santa Clara Convention Center', subtitle: '5001 Great America Pkwy, Santa Clara, CA', latitude: 37.4043, longitude: -121.9748 },
];

/** Whether suggestions appear while typing (otherwise the typed text is looked up on save). */
export const SUGGESTIONS_AVAILABLE = native !== null || DEMO_MODE;

export async function suggestAddresses(query: string, near: LatLng | null): Promise<AddressSuggestion[]> {
  if (native) {
    try {
      return await native.suggest(query, near?.latitude ?? null, near?.longitude ?? null);
    } catch {
      return [];
    }
  }
  if (!DEMO_MODE || query.trim().length < 2) return [];
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return DEMO_ADDRESSES.filter((a) => words.every((w) => `${a.title} ${a.subtitle}`.toLowerCase().includes(w)));
}

/** Coordinates for a chosen suggestion or typed address, or null when it can't be found. */
export async function locateAddress(title: string, subtitle = ''): Promise<LatLng | null> {
  if (native) {
    try {
      return await native.resolve(title, subtitle);
    } catch {
      return null;
    }
  }
  const demo = DEMO_ADDRESSES.find((a) => a.title === title && a.subtitle === subtitle);
  if (demo) return { latitude: demo.latitude, longitude: demo.longitude };
  try {
    const [found] = await Location.geocodeAsync([title, subtitle].filter(Boolean).join(', '));
    return found ? { latitude: found.latitude, longitude: found.longitude } : null;
  } catch {
    return null;
  }
}

/** Driving distance in metres by Apple Maps' route, or null when there's no route (or no Apple Maps). */
export async function drivingDistance(from: LatLng, to: LatLng): Promise<number | null> {
  if (native) {
    try {
      return await native.drivingDistance(from.latitude, from.longitude, to.latitude, to.longitude);
    } catch {
      return null;
    }
  }
  if (!DEMO_MODE) return null;
  // Preview only: straight line plus a typical detour for roads.
  return distanceMeters(from, to) * 1.3;
}
