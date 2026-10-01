import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { insertPlace } from '@/db/places-repo';
import { updateSettings } from '@/db/settings-repo';
import { insertTrip } from '@/db/trips-repo';
import type { AutoReason } from '@/domain/classify-rules';
import { distanceMeters, type LatLng } from '@/domain/geo';
import type { PlaceKind } from '@/domain/places';
import type { TrackingGap } from '@/domain/tracker-policy';
import type { TrackingHealth } from '@/domain/tracking-health';
import { milesToMeters, toLocalIsoDate, type Classification } from '@/domain/trip';

/**
 * Web-preview demo, development only: fills the app with sample auto-logged
 * drives so the finished experience can be reviewed and screenshotted without
 * driving. Never active in device builds.
 *   ?demo        tracking shown as on
 *   ?demo=setup  tracking shown as not yet allowed (first launch)
 *   ?demo=always location set to "While Using" only
 *   ?demo=gap    tracking stopped mid-drive: the "add the missed trip?" card
 *   ?demo=stopped / ?demo=precise  tracking not running / Precise Location off
 *   ?demo=free   a free-plan user, with sample App Store prices on the paywall
 *   ?demo=courier shift mode on (the swipe-to-start shift bar)
 *   ?demo=tutorial the practice run shown after setup, over an empty home
 *   ?demo=empty  home just after setup, with no drives yet
 *   &courier     (with tutorial or empty) a shift worker; &hours: set work hours
 *   &region=GB   preview another country's currency, units and rules
 */
const demoParam =
  __DEV__ && Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('demo')
    : null;

export const DEMO_MODE = demoParam !== null;

/** Region shown in the demo (US unless `&region=` names another). */
export const DEMO_REGION =
  DEMO_MODE && typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('region')?.toUpperCase() ?? 'US')
    : null;

export const DEMO_TRACKING_STATUS =
  demoParam === 'setup' ? 'needs-permission' : demoParam === 'always' ? 'needs-always' : 'on';

/**
 * Tracking health in the demo: `?demo=gap` shows the "tracking stopped, add
 * the missed trip?" card for a drive cut short this afternoon; `?demo=stopped`
 * and `?demo=precise` show those faults.
 */
export function demoTrackingHealth(now: number, gapDismissed: boolean): TrackingHealth {
  const lastSeenAt = now - 3 * 60_000;
  if (demoParam === 'setup') return { issue: 'needs-permission', gap: null, lastSeenAt: null };
  if (demoParam === 'always') return { issue: 'needs-always', gap: null, lastSeenAt };
  if (demoParam === 'stopped') return { issue: 'tracking-stopped', gap: null, lastSeenAt };
  if (demoParam === 'precise') return { issue: 'precise-location-off', gap: null, lastSeenAt };
  if (demoParam !== 'gap' || gapDismissed) return { issue: 'ok', gap: null, lastSeenAt };
  const gap: TrackingGap = {
    id: 'demo-gap',
    reason: 'cut',
    from: DEMO_GAP_PLACES.from.at,
    fromAt: now - 2 * 3_600_000,
    to: DEMO_GAP_PLACES.to.at,
    toAt: now - 25 * 60_000,
    distanceM: Math.round(distanceMeters(DEMO_GAP_PLACES.from.at, DEMO_GAP_PLACES.to.at)),
  };
  return { issue: 'gap', gap, lastSeenAt };
}

/** Where the demo gap starts and ends, with the names the add-trip form is filled with. */
export const DEMO_GAP_PLACES = {
  from: { label: 'Home', at: { latitude: 37.3229, longitude: -121.9471 } },
  to: { label: 'Bay Supply Co, Milpitas', at: { latitude: 37.4323, longitude: -121.8996 } },
};

/** `?demo=celebrate`: shows the milestone celebration for the demo trips. */
export const DEMO_CELEBRATE = demoParam === 'celebrate';

const demoFlag = (name: string) =>
  demoParam !== null && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has(name);

/** `?demo=courier` (or `&courier`): shift mode is on, so the home screen leads with the shift bar. */
export const DEMO_COURIER = demoParam === 'courier' || demoFlag('courier');

/** `?demo=tutorial`: the practice run (sorting two sample drives) over home, as after setup. */
export const DEMO_TUTORIAL = demoParam === 'tutorial';

/** `?demo=empty` (and the tutorial): home just after setup, no drives yet; `&hours` turns on work hours. */
export const DEMO_EMPTY = demoParam === 'empty' || DEMO_TUTORIAL;
const DEMO_HOURS = demoFlag('hours');

/** `?demo=driving`: the home screen shows a drive being recorded. */
export const DEMO_DRIVING = demoParam === 'driving';

/**
 * `?today=2027-03-20`: the tax-year countdown and the seasonal opening as they
 * look on that date. Works without `demo` too, so the opening (skipped in the
 * demo) can be previewed.
 */
export const DEMO_TODAY = validDate(
  __DEV__ && Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('today')
    : null,
);

/** A real calendar date as YYYY-MM-DD, or null ("2027-3-20", "x" and 30 February are ignored). */
function validDate(text: string | null): string | null {
  if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? text : null;
}

/** Demo users are Pro (every drive visible) unless showing the free plan. */
export const DEMO_PRO = DEMO_MODE && demoParam !== 'free';

type DemoTrip = [
  daysAgo: number,
  hour: number,
  from: string,
  to: string,
  miles: number,
  classification: Classification,
  purpose: string,
  autoReason?: AutoReason,
];

// Named places so home ↔ office drives show the commute warning.
const PLACES: { name: string; kind: PlaceKind; at: LatLng }[] = [
  { name: 'Home', kind: 'home', at: { latitude: 37.3229, longitude: -121.9471 } },
  { name: 'Office, N 1st St', kind: 'work', at: { latitude: 37.3861, longitude: -121.9312 } },
  { name: 'Acme Corp HQ, Santa Clara', kind: 'client', at: { latitude: 37.3875, longitude: -121.9636 } },
];

const TRIPS: DemoTrip[] = [
  [0, 16, '1st Street, San Jose', 'Westfield Valley Fair', 6.8, 'unclassified', ''],
  [0, 11, 'Office, N 1st St', 'Acme Corp HQ, Santa Clara', 2.1, 'business', 'Client meeting', 'learned-route'],
  [0, 8, 'Home', 'Office, N 1st St', 7.9, 'business', 'Picked up samples', 'learned-route'],
  [1, 14, 'Acme Corp HQ, Santa Clara', 'Job site, Elm St', 18.5, 'business', '', 'work-hours'],
  [1, 8, 'Home', 'Acme Corp HQ, Santa Clara', 12.4, 'business', 'Client meeting'],
  [1, 19, 'Office, N 1st St', 'Home', 7.9, 'personal', '', 'commute'],
  [2, 18, 'Home', 'Trader Joe’s, Campbell', 4.2, 'personal', '', 'work-hours'],
  [3, 10, 'Home', 'San Jose Airport (SJC)', 9.7, 'business', 'Flight to client'],
];

// Earlier in the year: two business drives each workday, so the deductions
// counter shows what a typical self-employed driver sees by autumn.
const CLIENTS = [
  'Acme Corp HQ, Santa Clara',
  'Job site, Elm St',
  'Bay Supply Co, Milpitas',
  'Client office, Cupertino',
  'Warehouse, Fremont',
];

function historyTrips(): DemoTrip[] {
  const trips: DemoTrip[] = [];
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const days = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000);
  for (let daysAgo = 4; daysAgo <= days; daysAgo++) {
    const day = new Date(today);
    day.setDate(day.getDate() - daysAgo);
    if (day.getDay() === 0 || day.getDay() === 6) continue;
    const client = CLIENTS[daysAgo % CLIENTS.length];
    const miles = 8 + ((daysAgo * 7) % 17);
    trips.push([daysAgo, 9, 'Office, N 1st St', client, miles, 'business', 'Client visit', 'work-hours']);
    trips.push([daysAgo, 15, client, 'Office, N 1st St', miles, 'business', 'Return from client', 'work-hours']);
  }
  return trips;
}

// ─── Courier demo: shifts as the detector logs them ─────────────────────────

/** Where the courier demo's drives go, in Leeds (any coordinates do for the shift map). */
const SPOTS: Record<string, LatLng> = {
  Home: { latitude: 53.8243, longitude: -1.5715 },
  'McDonald’s, Kirkstall Rd': { latitude: 53.8027, longitude: -1.5727 },
  'Burley Rd': { latitude: 53.8086, longitude: -1.5797 },
  'Nando’s, Headingley': { latitude: 53.8196, longitude: -1.5768 },
  'Cardigan Rd': { latitude: 53.8143, longitude: -1.5846 },
  'Wagamama, Trinity Leeds': { latitude: 53.7962, longitude: -1.5442 },
  'Hyde Park': { latitude: 53.8106, longitude: -1.5664 },
  'Five Guys, The Headrow': { latitude: 53.8004, longitude: -1.5459 },
  'Meanwood Rd': { latitude: 53.8195, longitude: -1.5531 },
  'Chapel Allerton': { latitude: 53.8296, longitude: -1.5376 },
  'KFC, Kirkstall': { latitude: 53.8155, longitude: -1.6012 },
  'Bramley': { latitude: 53.8102, longitude: -1.6371 },
};

type CourierLeg = [startMinute: number, minutes: number, from: string, to: string, miles: number];

type CourierShift = {
  daysAgo: number;
  /** Minutes after midnight of that day; past 24 h runs into the next day. */
  start: number;
  end: number;
  legs: CourierLeg[];
  /** The drive home after the shift ended, cut off the last delivery. */
  after?: CourierLeg;
};

/**
 * Yesterday's evening shift (the last drop ran on into the drive home, cut
 * where the shift ended), and a night shift two days ago that ran past
 * midnight: one row each, dated by when they started.
 */
const COURIER_SHIFTS: CourierShift[] = [
  {
    daysAgo: 1,
    start: 17 * 60 + 30,
    end: 21 * 60 + 49,
    legs: [
      [17 * 60 + 34, 11, 'Home', 'McDonald’s, Kirkstall Rd', 2.6],
      [17 * 60 + 58, 8, 'McDonald’s, Kirkstall Rd', 'Burley Rd', 1.4],
      [18 * 60 + 31, 7, 'Burley Rd', 'Nando’s, Headingley', 1.2],
      [18 * 60 + 52, 10, 'Nando’s, Headingley', 'Cardigan Rd', 1.9],
      [19 * 60 + 40, 12, 'Cardigan Rd', 'Wagamama, Trinity Leeds', 2.3],
      [20 * 60 + 5, 11, 'Wagamama, Trinity Leeds', 'Hyde Park', 1.8],
      [21 * 60 + 10, 9, 'Hyde Park', 'Five Guys, The Headrow', 1.5],
      [21 * 60 + 36, 13, 'Five Guys, The Headrow', 'Meanwood Rd', 2.7],
    ],
    after: [21 * 60 + 49, 13, 'Meanwood Rd', 'Home', 2.2],
  },
  {
    daysAgo: 2,
    start: 21 * 60 + 2,
    end: 24 * 60 + 41,
    legs: [
      [21 * 60 + 6, 14, 'Home', 'KFC, Kirkstall', 2.4],
      [21 * 60 + 41, 12, 'KFC, Kirkstall', 'Bramley', 2.1],
      [22 * 60 + 30, 15, 'Bramley', 'Five Guys, The Headrow', 4.3],
      [23 * 60 + 18, 14, 'Five Guys, The Headrow', 'Chapel Allerton', 2.6],
      [24 * 60 + 20, 16, 'Chapel Allerton', 'Home', 1.6],
    ],
  },
];

/** A believable wiggly route between two spots, for the shift map. */
function demoRoute(from: string, to: string): LatLng[] {
  const a = SPOTS[from];
  const b = SPOTS[to];
  if (!a || !b) return [];
  const steps = 12;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const f = i / steps;
    // Streets aren't straight: an L-ish bend with a little wobble.
    const bend = Math.sin(f * Math.PI) * 0.0025;
    return {
      latitude: a.latitude + (b.latitude - a.latitude) * f + bend,
      longitude: a.longitude + (b.longitude - a.longitude) * f + Math.sin(f * 9) * 0.0006,
    };
  });
}

function minutesInto(daysAgo: number, minute: number): Date {
  const at = new Date();
  at.setDate(at.getDate() - daysAgo);
  at.setHours(0, 0, 0, 0);
  return new Date(at.getTime() + minute * 60_000);
}

async function seedCourierShifts(db: SQLiteDatabase, placeIds: Map<string, string>): Promise<void> {
  const drive = async (
    [startMinute, minutes, from, to, miles]: CourierLeg,
    daysAgo: number,
    filed: { shiftId?: string; offShiftId?: string },
  ) => {
    const start = minutesInto(daysAgo, startMinute);
    await insertTrip(
      db,
      {
        startedAt: start.toISOString(),
        localDate: toLocalIsoDate(start),
        endedAt: new Date(start.getTime() + minutes * 60_000).toISOString(),
        startLabel: from,
        endLabel: to,
        distanceMeters: milesToMeters(miles),
        classification: filed.shiftId ? 'business' : 'unclassified',
        purpose: filed.shiftId ? 'Deliveries' : '',
        source: 'auto',
        startPlaceId: from === 'Home' ? (placeIds.get('Home') ?? null) : null,
        endPlaceId: to === 'Home' ? (placeIds.get('Home') ?? null) : null,
        autoReason: filed.shiftId ? 'work-hours' : null,
        shiftId: filed.shiftId ?? null,
        offShiftId: filed.offShiftId ?? null,
      },
      demoRoute(from, to),
    );
  };
  for (const [index, shift] of COURIER_SHIFTS.entries()) {
    const id = `demo-shift-${index}`;
    await db.runAsync(
      'INSERT INTO shifts (id, started_at, ended_at) VALUES (?, ?, ?);',
      id,
      minutesInto(shift.daysAgo, shift.start).toISOString(),
      minutesInto(shift.daysAgo, shift.end).toISOString(),
    );
    for (const leg of shift.legs) await drive(leg, shift.daysAgo, { shiftId: id });
    if (shift.after) await drive(shift.after, shift.daysAgo, { offShiftId: id });
  }
  // Today: two drops before the shift was started, so "Start shift from …?" shows.
  const now = new Date();
  const minuteNow = now.getHours() * 60 + now.getMinutes();
  await drive([minuteNow - 75, 12, 'Home', 'Nando’s, Headingley', 1.9], 0, {});
  await drive([minuteNow - 41, 11, 'Nando’s, Headingley', 'Cardigan Rd', 1.3], 0, {});
}

export async function seedDemoTrips(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips;');
  if ((existing?.n ?? 0) > 0) return;
  if (DEMO_COURIER) await updateSettings(db, { shiftMode: true });
  if (DEMO_EMPTY) {
    if (DEMO_HOURS) await updateSettings(db, { workHoursEnabled: true });
    return;
  }
  const placeIds = new Map<string, string>();
  for (const place of PLACES) placeIds.set(place.name, (await insertPlace(db, place)).id);
  if (DEMO_COURIER) await seedCourierShifts(db, placeIds);
  // A courier's own days are the shifts above; the office drives are history.
  for (const [daysAgo, hour, from, to, miles, classification, purpose, autoReason] of [
    ...(DEMO_COURIER ? [] : TRIPS),
    ...historyTrips(),
  ].reverse()) {
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    start.setHours(hour, 12, 0, 0);
    const end = new Date(start.getTime() + (miles / 28) * 3_600_000);
    await insertTrip(db, {
      startedAt: start.toISOString(),
      localDate: toLocalIsoDate(start),
      endedAt: end.toISOString(),
      startLabel: from,
      endLabel: to,
      distanceMeters: milesToMeters(miles),
      classification,
      purpose,
      source: 'auto',
      startPlaceId: placeIds.get(from) ?? null,
      endPlaceId: placeIds.get(to) ?? null,
      autoReason: autoReason ?? null,
    });
  }
}
