import type { LatLng } from './geo';

/**
 * Routes, kept small. Five decimal places of a degree is about a metre: far
 * finer than GPS on a phone, and plenty for drawing the route on a map.
 */

const SCALE = 1e5;

/** A coordinate to five decimal places, as the same number every time it's rounded or decoded. */
export const roundCoordinate = (value: number): number => Math.round(value * SCALE) / SCALE;

/** A route as stored: latitude and longitude only, to five decimal places. */
export function roundRoute(route: readonly LatLng[]): LatLng[] {
  return route.map((point) => ({ latitude: roundCoordinate(point.latitude), longitude: roundCoordinate(point.longitude) }));
}

/**
 * Google's encoded polyline (precision 5): each coordinate as the change from
 * the one before, in a few printable characters. A year of routes goes from
 * tens of megabytes of JSON to a few.
 */
export function encodePolyline(route: readonly LatLng[]): string {
  const parts: string[] = [];
  let codes: number[] = [];
  let lastLat = 0;
  let lastLng = 0;
  const push = (delta: number) => {
    let value = delta < 0 ? ~(delta * 2) : delta * 2;
    while (value >= 0x20) {
      codes.push((0x20 | (value & 0x1f)) + 63);
      value = Math.floor(value / 32);
    }
    codes.push(value + 63);
  };
  for (const point of route) {
    const lat = Math.round(point.latitude * SCALE);
    const lng = Math.round(point.longitude * SCALE);
    push(lat - lastLat);
    push(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
    if (codes.length >= 4096) {
      parts.push(String.fromCharCode(...codes));
      codes = [];
    }
  }
  parts.push(String.fromCharCode(...codes));
  return parts.join('');
}

/** The route back from encodePolyline; null if the text isn't one. */
export function decodePolyline(text: string): LatLng[] | null {
  const route: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const next = (): number | null => {
    let result = 0;
    let factor = 1;
    for (;;) {
      if (index >= text.length) return null;
      const code = text.charCodeAt(index++) - 63;
      if (code < 0 || code > 63) return null;
      result += (code & 0x1f) * factor;
      factor *= 32;
      if (code < 0x20) break;
      if (factor > 2 ** 40) return null;
    }
    return result % 2 === 1 ? -(result + 1) / 2 : result / 2;
  };
  while (index < text.length) {
    const dLat = next();
    const dLng = dLat === null ? null : next();
    if (dLat === null || dLng === null) return null;
    lat += dLat;
    lng += dLng;
    route.push({ latitude: lat / SCALE, longitude: lng / SCALE });
  }
  return route;
}
