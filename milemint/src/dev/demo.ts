import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { insertPlace } from '@/db/places-repo';
import { insertTrip } from '@/db/trips-repo';
import type { AutoReason } from '@/domain/classify-rules';
import type { LatLng } from '@/domain/geo';
import type { PlaceKind } from '@/domain/places';
import { milesToMeters, toLocalIsoDate, type Classification } from '@/domain/trip';

/**
 * Web-preview demo, development only: fills the app with sample auto-logged
 * drives so the finished experience can be reviewed and screenshotted without
 * driving. Never active in device builds.
 *   ?demo        tracking shown as on
 *   ?demo=setup  tracking shown as not yet allowed (first launch)
 *   ?demo=free   a free-plan user, with sample App Store prices on the paywall
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

export async function seedDemoTrips(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips;');
  if ((existing?.n ?? 0) > 0) return;
  const placeIds = new Map<string, string>();
  for (const place of PLACES) placeIds.set(place.name, (await insertPlace(db, place)).id);
  for (const [daysAgo, hour, from, to, miles, classification, purpose, autoReason] of [
    ...TRIPS,
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
