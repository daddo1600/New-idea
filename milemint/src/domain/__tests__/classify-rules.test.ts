import { describe, expect, it } from '@jest/globals';

import {
  endpointKey,
  isCommute,
  isValidShift,
  isWithinWorkHours,
  parseClock,
  suggestClassification,
  type ClassifiedTrip,
  type ClassifyContext,
  type DriveToClassify,
  type Endpoint,
  type WorkWeek,
} from '../classify-rules';
import { DEFAULT_PLACE_RADIUS_M, matchPlace, type Place } from '../places';

// San Jose area; 0.001° latitude ≈ 111 m.
const HOME: Place = {
  id: 'home',
  name: 'Home',
  latitude: 37.3,
  longitude: -121.9,
  radiusM: DEFAULT_PLACE_RADIUS_M,
  kind: 'home',
};
const OFFICE: Place = { ...HOME, id: 'office', name: 'Office', latitude: 37.35, kind: 'work' };
const CLIENT: Place = { ...HOME, id: 'client', name: 'Acme', latitude: 37.4, kind: 'client' };
const PLACES = [HOME, OFFICE, CLIENT];

const at = (place: Place): Endpoint => ({ placeId: place.id, point: place });
const point = (latitude: number, longitude: number): Endpoint => ({
  placeId: null,
  point: { latitude, longitude },
});

const MON = 1;
const TUE = 2;
const hm = (h: number, m = 0) => h * 60 + m;

const NINE_TO_FIVE: WorkWeek = [
  [],
  [{ start: '09:00', end: '17:00' }],
  [{ start: '09:00', end: '17:00' }],
  [{ start: '09:00', end: '17:00' }],
  [{ start: '09:00', end: '17:00' }],
  [{ start: '09:00', end: '17:00' }],
  [],
];

function drive(overrides: Partial<DriveToClassify> = {}): DriveToClassify {
  return { start: at(HOME), end: at(CLIENT), weekday: MON, minutesOfDay: hm(10), ...overrides };
}

let day = 0;
function past(
  classification: ClassifiedTrip['classification'],
  overrides: Partial<ClassifiedTrip> = {},
): ClassifiedTrip {
  day += 1;
  return {
    start: at(HOME),
    end: at(CLIENT),
    classification,
    purpose: '',
    // Later calls are more recent.
    startedAt: new Date(Date.UTC(2026, 0, 1) + day * 86_400_000).toISOString(),
    ...overrides,
  };
}

function context(overrides: Partial<ClassifyContext> = {}): ClassifyContext {
  return { history: [], places: PLACES, workHours: null, ...overrides };
}

describe('matchPlace', () => {
  it('matches a point inside the radius', () => {
    expect(matchPlace({ latitude: 37.301, longitude: -121.9 }, PLACES)?.id).toBe('home');
  });

  it('ignores a point just outside the radius', () => {
    // ≈ 167 m north of Home, radius 150 m.
    expect(matchPlace({ latitude: 37.3015, longitude: -121.9 }, PLACES)).toBeNull();
  });

  it('picks the nearest when radii overlap', () => {
    const neighbour: Place = { ...HOME, id: 'n', latitude: 37.3008 };
    const p = { latitude: 37.3006, longitude: -121.9 };
    expect(matchPlace(p, [HOME, neighbour])?.id).toBe('n');
    expect(matchPlace(p, [neighbour, HOME])?.id).toBe('n');
  });

  it('respects a per-place radius', () => {
    const big: Place = { ...CLIENT, radiusM: 500 };
    expect(matchPlace({ latitude: 37.404, longitude: -121.9 }, [big])?.id).toBe('client');
  });
});

describe('learned routes', () => {
  it('learns after two matching classifications and reuses the latest purpose', () => {
    const history = [
      past('business', { purpose: 'Old purpose' }),
      past('business', { purpose: 'Client meeting' }),
    ];
    expect(suggestClassification(drive(), context({ history }))).toEqual({
      classification: 'business',
      purpose: 'Client meeting',
      reason: 'learned-route',
      commuteWarning: false,
    });
  });

  it('does not learn from a single trip', () => {
    const result = suggestClassification(drive(), context({ history: [past('business')] }));
    expect(result.classification).toBeNull();
  });

  it('skips an empty latest purpose in favour of an earlier one', () => {
    const history = [past('business', { purpose: 'Site visit' }), past('business')];
    expect(suggestClassification(drive(), context({ history })).purpose).toBe('Site visit');
  });

  it('returns a null purpose when none was ever entered', () => {
    const history = [past('personal'), past('personal')];
    const result = suggestClassification(drive(), context({ history }));
    expect(result).toMatchObject({ classification: 'personal', purpose: null });
  });

  it('does not learn a route with a conflict in the last five', () => {
    const history = [past('business'), past('personal'), past('business'), past('business')];
    expect(suggestClassification(drive(), context({ history })).classification).toBeNull();
  });

  it('forgets a conflict once it falls out of the window', () => {
    const history = [
      past('personal'),
      past('business'),
      past('business'),
      past('business'),
      past('business'),
      past('business'),
    ];
    expect(suggestClassification(drive(), context({ history })).reason).toBe('learned-route');
  });

  it('orders history by time, not array order', () => {
    const older = past('personal');
    const newer = [past('business'), past('business'), past('business'), past('business'), past('business')];
    const history = [...newer, older].reverse();
    expect(suggestClassification(drive(), context({ history })).classification).toBe('business');
  });

  it('is direction-specific', () => {
    const history = [past('business'), past('business')];
    const back = drive({ start: at(CLIENT), end: at(HOME) });
    expect(suggestClassification(back, context({ history })).classification).toBeNull();
  });

  it('learns unnamed spots by ~150 m grid cell', () => {
    const a = point(37.5, -122.0);
    const b = point(37.6, -122.0);
    const history = [past('business', { start: a, end: b }), past('business', { start: a, end: b })];
    const nearby = drive({ start: point(37.50001, -122.00001), end: b });
    expect(suggestClassification(nearby, context({ history })).reason).toBe('learned-route');
    const elsewhere = drive({ start: point(37.52, -122.0), end: b });
    expect(suggestClassification(elsewhere, context({ history })).classification).toBeNull();
  });

  it('matches old trips to a place saved after they were recorded', () => {
    const nearClient = point(37.4005, -121.9);
    const history = [
      past('business', { end: nearClient }),
      past('business', { end: nearClient }),
    ];
    expect(suggestClassification(drive(), context({ history })).reason).toBe('learned-route');
  });

  it('cannot learn without a location', () => {
    const history = [
      past('business', { start: { placeId: null, point: null } }),
      past('business', { start: { placeId: null, point: null } }),
    ];
    const noStart = drive({ start: { placeId: null, point: null } });
    expect(suggestClassification(noStart, context({ history })).classification).toBeNull();
  });

  it('beats work hours', () => {
    const history = [past('personal'), past('personal')];
    const result = suggestClassification(
      drive({ minutesOfDay: hm(11) }),
      context({ history, workHours: NINE_TO_FIVE }),
    );
    expect(result).toMatchObject({ classification: 'personal', reason: 'learned-route' });
  });
});

describe('work hours', () => {
  it('marks a drive inside a shift as business with no purpose yet', () => {
    expect(suggestClassification(drive(), context({ workHours: NINE_TO_FIVE }))).toEqual({
      classification: 'business',
      purpose: null,
      reason: 'work-hours',
      commuteWarning: false,
    });
  });

  it('marks a drive outside every shift as personal', () => {
    const evening = drive({ minutesOfDay: hm(19) });
    expect(suggestClassification(evening, context({ workHours: NINE_TO_FIVE }))).toMatchObject({
      classification: 'personal',
      reason: 'work-hours',
    });
    const sunday = drive({ weekday: 0 });
    expect(suggestClassification(sunday, context({ workHours: NINE_TO_FIVE })).classification).toBe(
      'personal',
    );
  });

  it('treats the shift end as exclusive', () => {
    expect(isWithinWorkHours(NINE_TO_FIVE, MON, hm(9))).toBe(true);
    expect(isWithinWorkHours(NINE_TO_FIVE, MON, hm(16, 59))).toBe(true);
    expect(isWithinWorkHours(NINE_TO_FIVE, MON, hm(17))).toBe(false);
  });

  it('supports several shifts in a day', () => {
    const split: WorkWeek = [
      [],
      [
        { start: '07:00', end: '11:00' },
        { start: '15:00', end: '19:30' },
      ],
      [],
      [],
      [],
      [],
      [],
    ];
    expect(isWithinWorkHours(split, MON, hm(8))).toBe(true);
    expect(isWithinWorkHours(split, MON, hm(13))).toBe(false);
    expect(isWithinWorkHours(split, MON, hm(19, 15))).toBe(true);
  });

  it('carries an overnight shift past midnight into the next day', () => {
    const nights: WorkWeek = [[], [{ start: '22:00', end: '02:00' }], [], [], [], [], []];
    expect(isWithinWorkHours(nights, MON, hm(21, 59))).toBe(false);
    expect(isWithinWorkHours(nights, MON, hm(23))).toBe(true);
    expect(isWithinWorkHours(nights, TUE, hm(1, 30))).toBe(true);
    expect(isWithinWorkHours(nights, TUE, hm(2))).toBe(false);
    // Monday's early hours belong to Sunday night, which has no shift.
    expect(isWithinWorkHours(nights, MON, hm(1))).toBe(false);
  });

  it('wraps a Saturday night shift into Sunday', () => {
    const saturdayNights: WorkWeek = [[], [], [], [], [], [], [{ start: '20:00', end: '03:00' }]];
    expect(isWithinWorkHours(saturdayNights, 0, hm(2))).toBe(true);
  });

  it('ignores malformed and zero-length shifts', () => {
    const bad: WorkWeek = [
      [],
      [
        { start: '9am', end: '17:00' },
        { start: '10:00', end: '10:00' },
      ],
      [],
      [],
      [],
      [],
      [],
    ];
    expect(isWithinWorkHours(bad, MON, hm(12))).toBe(false);
  });

  it('suggests nothing when work hours are off and nothing is learned', () => {
    expect(suggestClassification(drive(), context())).toEqual({
      classification: null,
      purpose: null,
      reason: null,
      commuteWarning: false,
    });
  });
});

describe('commutes', () => {
  it('recognises home ↔ work in both directions only', () => {
    expect(isCommute('home', 'work')).toBe(true);
    expect(isCommute('work', 'home')).toBe(true);
    expect(isCommute('home', 'client')).toBe(false);
    expect(isCommute('work', 'work')).toBe(false);
    expect(isCommute(null, 'work')).toBe(false);
  });

  it('never marks a commute business from work hours', () => {
    const toWork = drive({ end: at(OFFICE), minutesOfDay: hm(9, 30) });
    expect(suggestClassification(toWork, context({ workHours: NINE_TO_FIVE }))).toEqual({
      classification: 'personal',
      purpose: null,
      reason: 'commute',
      commuteWarning: false,
    });
  });

  it('flags the commute even without work hours', () => {
    const home = drive({ start: at(OFFICE), end: at(HOME) });
    expect(suggestClassification(home, context()).reason).toBe('commute');
  });

  it('recognises places by position when the trip has no stored place id', () => {
    const toWork = drive({ start: point(37.3003, -121.9), end: point(37.3502, -121.9) });
    expect(suggestClassification(toWork, context()).reason).toBe('commute');
  });

  it('honours a learned business commute but warns', () => {
    const history = [
      past('business', { end: at(OFFICE), purpose: 'Tools to site' }),
      past('business', { end: at(OFFICE) }),
    ];
    expect(suggestClassification(drive({ end: at(OFFICE) }), context({ history }))).toEqual({
      classification: 'business',
      purpose: 'Tools to site',
      reason: 'learned-route',
      commuteWarning: true,
    });
  });

  it('does not warn about a learned personal commute', () => {
    const history = [past('personal', { end: at(OFFICE) }), past('personal', { end: at(OFFICE) })];
    expect(
      suggestClassification(drive({ end: at(OFFICE) }), context({ history })).commuteWarning,
    ).toBe(false);
  });
});

describe('helpers', () => {
  it('parses 24-hour clock times', () => {
    expect(parseClock('09:30')).toBe(570);
    expect(parseClock('9:05')).toBe(545);
    expect(parseClock(' 23:59 ')).toBe(1439);
    expect(parseClock('24:00')).toBeNull();
    expect(parseClock('12:60')).toBeNull();
    expect(parseClock('noon')).toBeNull();
  });

  it('validates shifts', () => {
    expect(isValidShift({ start: '22:00', end: '02:00' })).toBe(true);
    expect(isValidShift({ start: '09:00', end: '09:00' })).toBe(false);
    expect(isValidShift({ start: '09:00', end: '' })).toBe(false);
  });

  it('keys an endpoint by place when one matches, else by grid cell', () => {
    expect(endpointKey(at(HOME), PLACES)).toBe('place:home');
    expect(endpointKey({ placeId: 'deleted', point: HOME }, PLACES)).toBe('place:home');
    expect(endpointKey(point(10, 10), PLACES)).toMatch(/^grid:/);
    expect(endpointKey({ placeId: null, point: null }, PLACES)).toBeNull();
  });
});
