import { describe, expect, it } from '@jest/globals';

import { decodePolyline, encodePolyline, roundCoordinate, roundRoute } from '../polyline';

describe('encoded polylines', () => {
  it("match Google's published example", () => {
    const route = [
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ];
    expect(encodePolyline(route)).toBe('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual(route);
  });

  it('round-trip any route to five decimal places, extremes and long routes included', () => {
    const route = [
      { latitude: 90, longitude: 180 },
      { latitude: -90, longitude: -180 },
      { latitude: 0, longitude: 0 },
      ...Array.from({ length: 5000 }, (_, i) => ({ latitude: 51 + Math.sin(i) / 3, longitude: -0.1 + i / 7e4 })),
    ];
    const rounded = roundRoute(route);
    expect(decodePolyline(encodePolyline(route))).toEqual(rounded);
    // Stored routes are already rounded: packing them changes nothing.
    expect(JSON.stringify(decodePolyline(encodePolyline(rounded)))).toBe(JSON.stringify(rounded));
  });

  it('are empty for an empty route, and refuse text that is not one', () => {
    expect(encodePolyline([])).toBe('');
    expect(decodePolyline('')).toEqual([]);
    expect(decodePolyline('_p~iF')).toBeNull();
    expect(decodePolyline('_p~iF~ps|U ')).toBeNull();
  });

  it('round coordinates to about a metre, keeping only latitude and longitude', () => {
    expect(roundCoordinate(51.123456789)).toBe(51.12346);
    expect(roundRoute([{ latitude: 1.000004, longitude: 2.000006, accuracy: 5 } as never])).toEqual([
      { latitude: 1, longitude: 2.00001 },
    ]);
  });
});
