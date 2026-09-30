import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { insertTrip } from '@/db/trips-repo';
import { milesToMeters, toLocalIsoDate, type Classification } from '@/domain/trip';

/**
 * Web-preview demo, development only: fills the app with sample auto-logged
 * drives so the finished experience can be reviewed and screenshotted without
 * driving. Never active in device builds.
 *   ?demo        tracking shown as on
 *   ?demo=setup  tracking shown as not yet allowed (first launch)
 */
const demoParam =
  __DEV__ && Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('demo')
    : null;

export const DEMO_MODE = demoParam !== null;

export const DEMO_TRACKING_STATUS = demoParam === 'setup' ? 'needs-permission' : 'on';

type DemoTrip = [
  daysAgo: number,
  hour: number,
  from: string,
  to: string,
  miles: number,
  classification: Classification,
  purpose: string,
];

const TRIPS: DemoTrip[] = [
  [0, 16, '1st Street, San Jose', 'Westfield Valley Fair', 6.8, 'unclassified', ''],
  [0, 9, 'Home', 'Acme Corp HQ, Santa Clara', 12.4, 'unclassified', ''],
  [1, 14, 'Acme Corp HQ, Santa Clara', 'Job site, Elm St', 18.5, 'business', 'Site inspection'],
  [1, 8, 'Home', 'Acme Corp HQ, Santa Clara', 12.4, 'business', 'Client meeting'],
  [2, 18, 'Home', 'Trader Joe’s, Campbell', 4.2, 'personal', ''],
  [3, 10, 'Home', 'San Jose Airport (SJC)', 9.7, 'business', 'Flight to client'],
];

export async function seedDemoTrips(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM trips;');
  if ((existing?.n ?? 0) > 0) return;
  for (const [daysAgo, hour, from, to, miles, classification, purpose] of [...TRIPS].reverse()) {
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
    });
  }
}
