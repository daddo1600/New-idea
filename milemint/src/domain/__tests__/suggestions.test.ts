import { describe, expect, it } from '@jest/globals';

import type { Place } from '../places';
import { frequentPurposes, frequentSpots } from '../suggestions';

const trip = (startLabel: string, endLabel: string, purpose = '', day = 1, classification = 'business') => ({
  startLabel,
  endLabel,
  purpose,
  classification: classification as 'business' | 'personal',
  startedAt: `2026-09-${String(day).padStart(2, '0')}T09:00:00.000Z`,
});
const home = { id: 'h', name: 'Home', kind: 'home', latitude: 0, longitude: 0, radiusM: 150 } as Place;

describe('frequentSpots', () => {
  it('ranks by use, then recency, and leaves out saved places', () => {
    const trips = [
      trip('Home', 'Acme HQ', '', 1),
      trip('Acme HQ', 'Home', '', 2),
      trip('Home', 'Depot', '', 3),
      trip('home', 'Café Nero', '', 4),
    ];
    expect(frequentSpots(trips, [home])).toEqual(['Acme HQ', 'Café Nero', 'Depot']);
  });

  it('merges spellings, keeping the latest', () => {
    expect(frequentSpots([trip('acme hq', 'x', '', 1), trip('Acme HQ', 'x', '', 2)], [], 1)).toEqual(['Acme HQ']);
  });
});

describe('frequentPurposes', () => {
  it('only uses business trips and skips blanks', () => {
    const trips = [
      trip('a', 'b', 'Client meeting', 1),
      trip('a', 'b', 'Site visit', 2),
      trip('a', 'b', 'client meeting', 3),
      trip('a', 'b', 'Gym', 4, 'personal'),
      trip('a', 'b', '  ', 5),
    ];
    expect(frequentPurposes(trips)).toEqual(['client meeting', 'Site visit']);
  });
});
