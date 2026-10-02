import { describe, expect, it } from '@jest/globals';

import { distanceMeters, type LatLng } from '../geo';
import { displayRoute, privateEnds, routeBounds, routeRegion, simplifyRoute, trimRouteEnds } from '../route-display';

/** A straight line north from Leeds, a point every `stepM` metres. */
function line(count: number, stepM = 10): LatLng[] {
  return Array.from({ length: count }, (_, i) => ({ latitude: 53.8 + (i * stepM) / 111_195, longitude: -1.55 }));
}

/** A wiggly drive: a sine wave across town with GPS-ish jitter. */
function wiggle(count: number): LatLng[] {
  return Array.from({ length: count }, (_, i) => ({
    latitude: 53.8 + Math.sin(i / 40) * 0.01 + ((i * 7919) % 13) * 1e-7,
    longitude: -1.55 + i * 0.0002,
  }));
}

function length(route: readonly LatLng[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += distanceMeters(route[i - 1], route[i]);
  return total;
}

/** The furthest any original point is from the simplified line, in metres (roughly). */
function maxDeviation(original: readonly LatLng[], simple: readonly LatLng[]): number {
  let worst = 0;
  for (const p of original) {
    let best = Infinity;
    for (let i = 1; i < simple.length; i++) {
      const a = simple[i - 1];
      const b = simple[i];
      // Flat metres around the point: plenty for a test.
      const m = 111_195;
      const c = Math.cos((p.latitude * Math.PI) / 180);
      const ax = (a.longitude - p.longitude) * c * m;
      const ay = (a.latitude - p.latitude) * m;
      const bx = (b.longitude - p.longitude) * c * m;
      const by = (b.latitude - p.latitude) * m;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const f = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
      best = Math.min(best, Math.hypot(ax + f * dx, ay + f * dy));
    }
    worst = Math.max(worst, best);
  }
  return worst;
}

describe('simplifyRoute', () => {
  it('leaves a short route alone', () => {
    const route = wiggle(120);
    expect(simplifyRoute(route)).toBe(route);
  });

  it('thins a long route to the limit, keeping both ends and the order', () => {
    const route = wiggle(5_000);
    const simple = simplifyRoute(route, 500);
    expect(simple.length).toBeLessThanOrEqual(500);
    expect(simple.length).toBeGreaterThan(400);
    expect(simple[0]).toBe(route[0]);
    expect(simple[simple.length - 1]).toBe(route[route.length - 1]);
    const indexes = simple.map((p) => route.indexOf(p));
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
  });

  it('keeps the shape: on a 65 km drive no point strays 10 m from the line', () => {
    const route = wiggle(5_000);
    expect(maxDeviation(route, simplifyRoute(route, 500))).toBeLessThan(10);
  });

  it('keeps a sharp corner', () => {
    const out = line(400);
    const corner = out[out.length - 1];
    const back = Array.from({ length: 400 }, (_, i) => ({ latitude: corner.latitude, longitude: corner.longitude + (i + 1) * 0.0001 }));
    const simple = simplifyRoute([...out, ...back], 10);
    expect(simple).toContain(corner);
  });

  it('draws a straight line with just its ends when that is all it needs', () => {
    const route = line(1_000);
    expect(simplifyRoute(route, 2)).toEqual([route[0], route[999]]);
  });
});

describe('trimRouteEnds', () => {
  it('leaves 200 m off the end, cutting between points', () => {
    const route = line(101); // 1,000 m
    const trimmed = trimRouteEnds(route, { start: false, end: true });
    expect(trimmed[0]).toBe(route[0]);
    expect(length(trimmed)).toBeCloseTo(800, 0);
    expect(distanceMeters(trimmed[trimmed.length - 1], route[100])).toBeCloseTo(200, 0);
  });

  it('can trim both ends', () => {
    const trimmed = trimRouteEnds(line(101), { start: true, end: true });
    expect(length(trimmed)).toBeCloseTo(600, 0);
  });

  it('trims mid-segment when points are far apart', () => {
    const trimmed = trimRouteEnds(line(3, 500), { start: false, end: true });
    expect(trimmed).toHaveLength(3);
    expect(length(trimmed)).toBeCloseTo(800, 0);
  });

  it('leaves nothing of a drive shorter than the trim', () => {
    expect(trimRouteEnds(line(15), { start: false, end: true })).toEqual([]);
    expect(trimRouteEnds(line(31), { start: true, end: true })).toEqual([]);
  });

  it('changes nothing with no private end', () => {
    const route = line(10);
    expect(trimRouteEnds(route, { start: false, end: false })).toBe(route);
  });
});

describe('displayRoute', () => {
  it('needs two points', () => {
    expect(displayRoute([], { start: false, end: false })).toBeNull();
    expect(displayRoute(line(1), { start: false, end: false })).toBeNull();
  });

  it('gives a private end no dot, and never shows the last 200 m there', () => {
    const route = line(101);
    const shown = displayRoute(route, { start: false, end: true })!;
    expect(shown.startDot).toBe(true);
    expect(shown.endDot).toBe(false);
    for (const p of shown.points) expect(distanceMeters(p, route[100])).toBeGreaterThanOrEqual(199.9);
  });

  it('is null when privacy leaves too little to draw', () => {
    expect(displayRoute(line(10), { start: true, end: false })).toBeNull();
  });

  it('thins long routes', () => {
    expect(displayRoute(wiggle(3_000), { start: false, end: false })!.points.length).toBeLessThanOrEqual(500);
  });
});

describe('routeBounds and routeRegion', () => {
  it('cover every route', () => {
    const a = [{ latitude: 1, longitude: 2 }, { latitude: 3, longitude: 1 }];
    const b = [{ latitude: -1, longitude: 5 }];
    expect(routeBounds([a, b])).toEqual({ minLat: -1, maxLat: 3, minLng: 1, maxLng: 5 });
    const region = routeRegion([a, b], 1)!;
    expect(region).toEqual({ latitude: 1, longitude: 3, latitudeDelta: 4, longitudeDelta: 4 });
  });

  it('never zooms in past a street, and is null for nothing', () => {
    expect(routeRegion([[{ latitude: 1, longitude: 1 }]])!.latitudeDelta).toBeGreaterThan(0);
    expect(routeRegion([])).toBeNull();
  });
});

describe('privateEnds', () => {
  it('keeps both ends back in client privacy mode', () => {
    expect(privateEnds({ startLabel: 'Home', endLabel: '12 High St' }, true)).toEqual({ start: true, end: true });
  });

  it('otherwise keeps back only an end labelled as a client visit', () => {
    expect(privateEnds({ startLabel: 'Home', endLabel: 'Client visit · Leeds LS6' }, false)).toEqual({ start: false, end: true });
    expect(privateEnds({ startLabel: 'Home', endLabel: '12 High St' }, false)).toEqual({ start: false, end: false });
  });
});
