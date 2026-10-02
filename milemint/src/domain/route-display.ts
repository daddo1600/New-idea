import { distanceMeters, type LatLng } from './geo';
import { isPrivateLabel } from './privacy';

/**
 * Routes made ready to draw on a map: fewer points where they wouldn't show,
 * and, in client privacy mode, the last stretch to a client's door left off.
 * Pure functions, so the screens can memoise them and the tests can pin them.
 */

/** About as many points as a phone map draws smoothly for one drive. */
export const MAX_DISPLAY_POINTS = 500;

/** How much of a route is left off at a client's end in privacy mode. */
export const PRIVACY_TRIM_METERS = 200;

/** Planar x/y in metres around the route's middle latitude: close enough for a city drive. */
function projector(route: readonly LatLng[]) {
  let sum = 0;
  for (const point of route) sum += point.latitude;
  const cosLat = Math.cos(((sum / route.length) * Math.PI) / 180);
  const m = 111_320;
  return (point: LatLng) => [point.longitude * cosLat * m, point.latitude * m] as const;
}

/** Distance from p to the segment a–b, in the same units. */
function segmentDistance(p: readonly [number, number], a: readonly [number, number], b: readonly [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length2 = dx * dx + dy * dy;
  const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * The route with at most `maxPoints` points, keeping its shape
 * (Douglas–Peucker, ranked): every point gets the error it would leave if it
 * were dropped, as the algorithm meets it, and the most important ones are
 * kept. The first and last points always stay. A route already small enough
 * comes back as it is (the same array).
 */
export function simplifyRoute(route: readonly LatLng[], maxPoints = MAX_DISPLAY_POINTS): readonly LatLng[] {
  if (route.length <= maxPoints || route.length <= 2) return route;
  const keep = Math.max(2, maxPoints);
  const project = projector(route);
  const xy = route.map(project);
  const n = route.length;
  // importance[i]: how far off the line point i was when split on; NaN until met.
  const importance = new Float64Array(n).fill(Number.NaN);
  const order = new Int32Array(n).fill(-1);
  let met = 0;
  // A segment to split, and the importance of the split that made it: a
  // point can't matter more than the one it hangs off, so the kept set is
  // always a real Douglas–Peucker result at some tolerance.
  const stack: [number, number, number][] = [[0, n - 1, Infinity]];
  while (stack.length > 0) {
    const [first, last, cap] = stack.pop()!;
    if (last - first < 2) continue;
    let worst = -1;
    let at = -1;
    for (let i = first + 1; i < last; i++) {
      const d = segmentDistance(xy[i], xy[first], xy[last]);
      if (d > worst) {
        worst = d;
        at = i;
      }
    }
    const value = Math.min(worst, cap);
    importance[at] = value;
    order[at] = met++;
    stack.push([first, at, value], [at, last, value]);
  }
  const inner = Array.from({ length: n - 2 }, (_, k) => k + 1);
  inner.sort((a, b) => importance[b] - importance[a] || order[a] - order[b]);
  const chosen = new Uint8Array(n);
  chosen[0] = 1;
  chosen[n - 1] = 1;
  for (let k = 0; k < keep - 2 && k < inner.length; k++) chosen[inner[k]] = 1;
  const out: LatLng[] = [];
  for (let i = 0; i < n; i++) if (chosen[i]) out.push(route[i]);
  return out;
}

/** The route from its start with the last `meters` of it left off, cut between points. */
function dropLast(route: readonly LatLng[], meters: number): LatLng[] {
  let left = meters;
  for (let i = route.length - 1; i > 0; i--) {
    const step = distanceMeters(route[i - 1], route[i]);
    if (step >= left) {
      const f = step === 0 ? 0 : (step - left) / step;
      const a = route[i - 1];
      const b = route[i];
      const cut = { latitude: a.latitude + (b.latitude - a.latitude) * f, longitude: a.longitude + (b.longitude - a.longitude) * f };
      return [...route.slice(0, i), cut];
    }
    left -= step;
  }
  return [];
}

/**
 * The route with `meters` left off the chosen ends, so a map never shows
 * the door the drive started or ended at. Empty when nothing is left.
 */
export function trimRouteEnds(
  route: readonly LatLng[],
  ends: { start: boolean; end: boolean },
  meters = PRIVACY_TRIM_METERS,
): readonly LatLng[] {
  if (!ends.start && !ends.end) return route;
  let out: readonly LatLng[] = route;
  if (ends.end) out = dropLast(out, meters);
  if (ends.start && out.length > 0) out = dropLast([...out].reverse(), meters).reverse();
  return out.length > 1 ? out : [];
}

/**
 * Which ends of a drive the map keeps back. Client privacy mode stores no
 * route at all for the drives it records, so this is for the ones recorded
 * before it was turned on: with it on, neither end is shown, since either
 * could be a client's door. Without it, an end labelled "Client visit" still is.
 */
export function privateEnds(
  trip: { startLabel: string; endLabel: string },
  clientPrivacy: boolean,
): { start: boolean; end: boolean } {
  return {
    start: clientPrivacy || isPrivateLabel(trip.startLabel),
    end: clientPrivacy || isPrivateLabel(trip.endLabel),
  };
}

/** A route that's drawn on the map: its points, and whether its ends get a dot. */
export type DisplayRoute = { points: readonly LatLng[]; startDot: boolean; endDot: boolean };

/**
 * A recorded route made ready for the map: trimmed at the private ends,
 * then thinned. A private end gets no dot, since a dot where the line stops
 * would read as the address. Null when there's too little to draw.
 */
export function displayRoute(
  route: readonly LatLng[],
  privateEnds: { start: boolean; end: boolean },
  maxPoints = MAX_DISPLAY_POINTS,
): DisplayRoute | null {
  if (route.length < 2) return null;
  const trimmed = trimRouteEnds(route, privateEnds);
  if (trimmed.length < 2) return null;
  return { points: simplifyRoute(trimmed, maxPoints), startDot: !privateEnds.start, endDot: !privateEnds.end };
}

/** The box around every point, or null for none. */
export function routeBounds(routes: readonly (readonly LatLng[])[]) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const route of routes) {
    for (const p of route) {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    }
  }
  return minLat === Infinity ? null : { minLat, maxLat, minLng, maxLng };
}

/**
 * The map region that shows every route with some room round the edge, for
 * the first frame before the map fits itself. Never zoomed in past a street.
 */
export function routeRegion(routes: readonly (readonly LatLng[])[], margin = 1.3) {
  const box = routeBounds(routes);
  if (!box) return null;
  const minDelta = 0.004;
  return {
    latitude: (box.minLat + box.maxLat) / 2,
    longitude: (box.minLng + box.maxLng) / 2,
    latitudeDelta: Math.max((box.maxLat - box.minLat) * margin, minDelta),
    longitudeDelta: Math.max((box.maxLng - box.minLng) * margin, minDelta),
  };
}
