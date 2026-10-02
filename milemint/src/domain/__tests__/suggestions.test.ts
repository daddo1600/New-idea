import { describe, expect, it } from '@jest/globals';

import type { Place } from '../places';
import { frequentPurposes, frequentSpots, purposesByPlace, suggestPurpose } from '../suggestions';

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

describe('suggestPurpose', () => {
  /** A drive with saved places where given (`#id`), labels otherwise. */
  const drive = (from: string, to: string, purpose = '', day = 1, classification = 'business') => ({
    ...trip(from.replace('#', ''), to.replace('#', ''), purpose, day, classification),
    startPlaceId: from.startsWith('#') ? from.slice(1) : null,
    endPlaceId: to.startsWith('#') ? to.slice(1) : null,
  });
  const isHome = (id: string) => id === 'home';
  const options = (history: ReturnType<typeof drive>[], usual: string | null = 'Site visit') => ({
    byPlace: purposesByPlace(history, isHome),
    usual,
    choices: ['Client meeting', 'Site visit'],
  });

  it('suggests what the last business drive to the same place was for', () => {
    const history = [
      drive('#office', '#acme', 'Client visit', 1),
      drive('#office', '#acme', 'Quarterly review', 5),
      drive('#acme', '#office', 'Return from client', 6),
    ];
    expect(suggestPurpose(drive('#home', '#acme'), options(history))).toBe('Quarterly review');
  });

  it('matches places without a saved place by their label, ignoring case', () => {
    const history = [drive('Office', 'Job site, Elm St', 'Site visit', 1)];
    expect(suggestPurpose(drive('Depot', 'job site, elm st'), options(history, null))).toBe('Site visit');
  });

  it('falls back to a drive from the destination, then one touching the start', () => {
    const fromThere = [drive('#acme', '#office', 'Return from client', 2)];
    expect(suggestPurpose(drive('Depot', '#acme'), options(fromThere))).toBe('Return from client');
    const atStart = [drive('Bank', '#depot', 'Paying in', 2)];
    expect(suggestPurpose(drive('#depot', 'Somewhere new'), options(atStart))).toBe('Paying in');
  });

  it('ignores home, personal drives and drives without a purpose', () => {
    const history = [
      drive('#home', '#gym', 'Client meeting', 1),
      drive('Gym', 'Shop', 'Groceries', 2, 'personal'),
      drive('#office', 'Shop', '  ', 3),
    ];
    expect(suggestPurpose(drive('#home', 'Shop'), options(history))).toBe('Site visit');
    // Home is never the clue, even as the destination.
    expect(suggestPurpose(drive('Somewhere', '#home'), options([drive('#office', '#home', 'Errand', 1)]))).toBe(
      'Site visit',
    );
  });

  it('then uses the usual purpose, then the first quick choice', () => {
    expect(suggestPurpose(drive('a', 'b'), options([], '  Deliveries '))).toBe('Deliveries');
    expect(suggestPurpose(drive('a', 'b'), options([], null))).toBe('Client meeting');
    expect(suggestPurpose(drive('a', 'b'), {})).toBeNull();
  });
});
