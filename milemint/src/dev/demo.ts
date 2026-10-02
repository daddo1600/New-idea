import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { saveWeeklyEarnings } from '@/db/earnings-repo';
import { insertPlace } from '@/db/places-repo';
import { updateSettings } from '@/db/settings-repo';
import { insertTrip } from '@/db/trips-repo';
import type { AutoReason } from '@/domain/classify-rules';
import { distanceMeters, type LatLng } from '@/domain/geo';
import type { PlaceKind } from '@/domain/places';
import type { TrackingGap } from '@/domain/tracker-policy';
import type { TrackingHealth } from '@/domain/tracking-health';
import { addDays, weekStartOf } from '@/domain/set-aside';
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
 *   ?demo=free   a free-plan user, with sample App Store products on the paywall
 *                (yearly 49.99 with a free month, monthly 5.99, in the region's
 *                currency: /pro?demo=free&region=GB shows £)
 *   ?demo=courier shift mode on (the swipe-to-start shift bar)
 *   ?demo=places no Home or Work saved yet: "Is this home?" (then, after No, "Is this work?")
 *   ?demo=motion Motion & Fitness not asked yet: set-up offers it after location
 *   ?demo=tutorial the practice run shown after setup, over an empty home
 *   ?demo=empty  home just after setup, with no drives yet
 *   &courier     (with tutorial or empty) a shift worker; &hours: set work hours
 *   &region=GB   preview another country's currency, units and rules
 *   &friends=2   friends joined with this user's invites (the perk ladder)
 *   &offer=CODE  as if the friend's 50% off offer code were set; &gift: joined with a friend's code
 *   &noearnings  no weekly earnings entered yet (the tax set-aside's first-use state)
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

/**
 * `&purposes`: the last week's business drives (outside shifts) have no
 * purpose yet, so home and Drives show several rows asking for one.
 */
const DEMO_NO_PURPOSES = demoFlag('purposes');

/** `?demo=tutorial`: the practice run (sorting two sample drives) over home, as after setup. */
export const DEMO_TUTORIAL = demoParam === 'tutorial';

/** `?demo=empty` (and the tutorial): home just after setup, no drives yet; `&hours` turns on work hours. */
export const DEMO_EMPTY = demoParam === 'empty' || DEMO_TUTORIAL;
const DEMO_HOURS = demoFlag('hours');

/**
 * `?demo=places`: set hours, but no Home or Work saved, and the drives have
 * routes, so the home screen asks "Is this home?" about where last night's
 * drive ended, and (after a No) "Is this work?" about the office.
 */
export const DEMO_PLACES = demoParam === 'places';

/** `?demo=driving`: the home screen shows a drive being recorded. */
export const DEMO_DRIVING = demoParam === 'driving';

/**
 * `?demo=motion`: Motion & Fitness is available and not asked yet, so set-up
 * shows the motion step after location; tapping its button keeps the coaching
 * that sits behind iOS's question on screen (there's no real question on the web).
 */
export const DEMO_MOTION = demoParam === 'motion';

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

/** Demo users are Pro unless showing the free plan. */
export const DEMO_PRO = DEMO_MODE && demoParam !== 'free';

const demoValue = (name: string) =>
  demoParam !== null && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(name) : null;

/** `&friends=2`: friends who joined with this user's invites, to preview the perk ladder; null to use the saved count. */
export const DEMO_FRIENDS = (() => {
  const value = Number(demoValue('friends'));
  return demoValue('friends') !== null && Number.isInteger(value) && value >= 0 ? value : null;
})();

/** `&offer=CODE`: preview the friend's 50% off as if FRIEND_OFFER_CODE were set. */
export const DEMO_OFFER_CODE = demoValue('offer') ?? '';

/** `&noearnings`: the tax set-aside before any earnings are entered. */
const DEMO_NO_EARNINGS = demoFlag('noearnings');

/** A believable 10 weeks of earnings (all apps together, whole units), oldest first; one week skipped. */
const DEMO_EARNINGS: (number | null)[] = [1180, 1045, 1260, 990, null, 1120, 1210, 1075, 1150, 1300];
/** The courier's: five shifts a week, mostly evenings. */
const DEMO_COURIER_EARNINGS: (number | null)[] = [415, 452, 398, 470, null, 436, 488, 421, 447, 462];

async function seedDemoEarnings(db: SQLiteDatabase): Promise<void> {
  const thisWeek = weekStartOf(toLocalIsoDate(new Date()));
  const earnings = DEMO_COURIER ? DEMO_COURIER_EARNINGS : DEMO_EARNINGS;
  for (const [index, amount] of earnings.entries()) {
    if (amount === null) continue;
    await saveWeeklyEarnings(db, addDays(thisWeek, -7 * (earnings.length - 1 - index)), amount * 100);
  }
  await updateSettings(db, { setAsideReminder: true, setAsideReminderDefaulted: true });
}

/** `&founding`: three friends have joined, so every invite perk (and the Founding driver badge) is earned. */
export const DEMO_FOUNDING = demoFlag('founding');

/** `&gift`: this user joined with a friend's code today, so the Pro screen offers the friend's gift (with `&offer`). */
export const DEMO_GIFT = demoFlag('gift');

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
  if (DEMO_PLACES) {
    // To the office and back on recent weekdays: parked there all day, every day.
    for (let daysAgo = 2; daysAgo <= 20; daysAgo++) {
      const day = new Date();
      day.setDate(day.getDate() - daysAgo);
      if (day.getDay() === 0 || day.getDay() === 6) continue;
      trips.push([daysAgo, 8, 'Home', 'Office, N 1st St', 7.9, 'business', 'Office', 'learned-route']);
      trips.push([daysAgo, 17, 'Office, N 1st St', 'Home', 7.9, 'personal', '', 'commute']);
    }
    return trips;
  }
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
  'Kirkstall Rd': { latitude: 53.8027, longitude: -1.5727 },
  'Burley Rd': { latitude: 53.8086, longitude: -1.5797 },
  'Otley Rd, Headingley': { latitude: 53.8196, longitude: -1.5768 },
  'Cardigan Rd': { latitude: 53.8143, longitude: -1.5846 },
  'Boar Lane, City Centre': { latitude: 53.7962, longitude: -1.5442 },
  'Hyde Park': { latitude: 53.8106, longitude: -1.5664 },
  'The Headrow, City Centre': { latitude: 53.8004, longitude: -1.5459 },
  'Meanwood Rd': { latitude: 53.8195, longitude: -1.5531 },
  'Chapel Allerton': { latitude: 53.8296, longitude: -1.5376 },
  'Bridge Rd, Kirkstall': { latitude: 53.8155, longitude: -1.6012 },
  'Bramley': { latitude: 53.8102, longitude: -1.6371 },
  Armley: { latitude: 53.799, longitude: -1.593 },
  Woodhouse: { latitude: 53.809, longitude: -1.553 },
  Horsforth: { latitude: 53.837, longitude: -1.639 },
};

/** Courier history: where orders are picked up, and where they go (street names, no brands). */
const PICKUPS = ['Kirkstall Rd', 'Otley Rd, Headingley', 'Boar Lane, City Centre', 'The Headrow, City Centre', 'Bridge Rd, Kirkstall'];
const DROPS = ['Burley Rd', 'Cardigan Rd', 'Hyde Park', 'Meanwood Rd', 'Chapel Allerton', 'Bramley', 'Armley', 'Woodhouse', 'Horsforth'];

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
      [17 * 60 + 34, 11, 'Home', 'Kirkstall Rd', 2.6],
      [17 * 60 + 58, 8, 'Kirkstall Rd', 'Burley Rd', 1.4],
      [18 * 60 + 31, 7, 'Burley Rd', 'Otley Rd, Headingley', 1.2],
      [18 * 60 + 52, 10, 'Otley Rd, Headingley', 'Cardigan Rd', 1.9],
      [19 * 60 + 40, 12, 'Cardigan Rd', 'Boar Lane, City Centre', 2.3],
      [20 * 60 + 5, 11, 'Boar Lane, City Centre', 'Hyde Park', 1.8],
      [21 * 60 + 10, 9, 'Hyde Park', 'The Headrow, City Centre', 1.5],
      [21 * 60 + 36, 13, 'The Headrow, City Centre', 'Meanwood Rd', 2.7],
    ],
    after: [21 * 60 + 49, 13, 'Meanwood Rd', 'Home', 2.2],
  },
  {
    daysAgo: 2,
    start: 21 * 60 + 2,
    end: 24 * 60 + 41,
    legs: [
      [21 * 60 + 6, 14, 'Home', 'Bridge Rd, Kirkstall', 2.4],
      [21 * 60 + 41, 12, 'Bridge Rd, Kirkstall', 'Bramley', 2.1],
      [22 * 60 + 30, 15, 'Bramley', 'The Headrow, City Centre', 4.3],
      [23 * 60 + 18, 14, 'The Headrow, City Centre', 'Chapel Allerton', 2.6],
      [24 * 60 + 20, 16, 'Chapel Allerton', 'Home', 1.6],
    ],
  },
];

/**
 * The courier's earlier shifts this year, so the totals look like a real
 * courier's by autumn: evenings on Monday and Wednesday to Friday, lunch and
 * evening on Saturday; pickup, drop, pickup, drop… and home. Deterministic.
 */
function courierHistory(): CourierShift[] {
  const shifts: CourierShift[] = [];
  const today = new Date();
  const days = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86_400_000);
  for (let daysAgo = 3; daysAgo <= days; daysAgo++) {
    const day = new Date(today);
    day.setDate(day.getDate() - daysAgo);
    const weekday = day.getDay();
    if (weekday === 0 || weekday === 2) continue;
    const start = (weekday === 6 ? 11 * 60 + 45 : 17 * 60) + ((daysAgo * 13) % 40);
    const orders = weekday === 6 ? 8 : 3 + (daysAgo % 3);
    const legs: CourierLeg[] = [];
    let minute = start + 4;
    let at = 'Home';
    for (let order = 0; order <= orders * 2; order++) {
      const to =
        order === orders * 2
          ? 'Home'
          : order % 2 === 0
            ? PICKUPS[(daysAgo + order * 3) % PICKUPS.length]
            : DROPS[(daysAgo * 7 + order * 5) % DROPS.length];
      if (to === at) continue;
      // Roads aren't straight: about a third longer than as the crow flies.
      const miles = Math.max(0.6, Math.round((distanceMeters(SPOTS[at], SPOTS[to]) / 1609.344) * 13.5) / 10);
      const minutes = Math.round(4 + miles * 3.5);
      legs.push([minute, minutes, at, to, miles]);
      minute += minutes + (order % 2 === 0 ? 4 + ((daysAgo + order) % 5) : 8 + ((daysAgo * order) % 14));
      at = to;
    }
    const last = legs[legs.length - 1];
    shifts.push({ daysAgo, start, end: last[0] + last[1] + 2, legs });
  }
  return shifts;
}

/** Where the `?demo=places` drives go, under the street names they'd be logged with. */
const PLACE_SPOTS: Record<string, LatLng> = {
  '14 Maple Ave, San Jose': PLACES[0].at,
  '200 N 1st St, San Jose': PLACES[1].at,
  'Acme Corp HQ, Santa Clara': PLACES[2].at,
  '1st Street, San Jose': { latitude: 37.3382, longitude: -121.8863 },
  'Westfield Valley Fair': { latitude: 37.3255, longitude: -121.9454 },
  'Job site, Elm St': { latitude: 37.3541, longitude: -121.9552 },
  'Trader Joe’s, Campbell': { latitude: 37.2872, longitude: -121.9500 },
  'San Jose Airport (SJC)': { latitude: 37.3639, longitude: -121.9289 },
};
/** Not saved as places in `?demo=places`: logged by street name instead. */
const UNNAMED: Record<string, string> = { Home: '14 Maple Ave, San Jose', 'Office, N 1st St': '200 N 1st St, San Jose' };

/** A believable wiggly route between two spots, for the shift map. */
function demoRoute(from: string, to: string, spots: Record<string, LatLng> = SPOTS): LatLng[] {
  const a = spots[from];
  const b = spots[to];
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
  for (const [index, shift] of [...COURIER_SHIFTS, ...courierHistory()].entries()) {
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
  await drive([minuteNow - 75, 12, 'Home', 'Otley Rd, Headingley', 1.9], 0, {});
  await drive([minuteNow - 41, 11, 'Otley Rd, Headingley', 'Cardigan Rd', 1.3], 0, {});
}

export async function seedDemoTrips(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips;');
  if ((existing?.n ?? 0) > 0) return;
  if (DEMO_COURIER) await updateSettings(db, { shiftMode: true });
  if (DEMO_PLACES) await updateSettings(db, { workHoursEnabled: true });
  if (DEMO_FOUNDING) {
    await updateSettings(db, {
      friendsJoined: 3,
      perksEarned: ['tax-set-aside', 'platform-earnings', 'founding-badge'],
    });
  }
  if (DEMO_EMPTY) {
    if (DEMO_HOURS) await updateSettings(db, { workHoursEnabled: true });
    return;
  }
  const placeIds = new Map<string, string>();
  // A courier's only saved place is home, in Leeds with the shifts.
  const places = DEMO_COURIER ? [{ name: 'Home', kind: 'home' as const, at: SPOTS.Home }] : PLACES;
  for (const place of places) {
    if (DEMO_PLACES && place.kind !== 'client') continue;
    placeIds.set(place.name, (await insertPlace(db, place)).id);
  }
  if (DEMO_COURIER) await seedCourierShifts(db, placeIds);
  if (!DEMO_NO_EARNINGS) await seedDemoEarnings(db);
  // A courier's days are all shifts (above); everyone else gets the office drives.
  for (const [daysAgo, hour, rawFrom, rawTo, miles, classification, purpose, autoReason] of (DEMO_COURIER
    ? []
    : [...TRIPS, ...historyTrips()]
  ).reverse()) {
    const [from, to] = DEMO_PLACES ? [UNNAMED[rawFrom] ?? rawFrom, UNNAMED[rawTo] ?? rawTo] : [rawFrom, rawTo];
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
      purpose: DEMO_NO_PURPOSES && daysAgo <= 7 ? '' : purpose,
      source: 'auto',
      startPlaceId: placeIds.get(from) ?? null,
      endPlaceId: placeIds.get(to) ?? null,
      autoReason: autoReason ?? null,
    }, DEMO_PLACES ? demoRoute(from, to, PLACE_SPOTS) : []);
  }
}
