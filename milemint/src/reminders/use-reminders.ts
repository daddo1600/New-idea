import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import { loadSettings } from '@/db/settings-repo';
import type { DistanceUnit } from '@/domain/regions';

import { refreshWeeklyReminder, REMINDERS_SUPPORTED } from './weekly';

/** The last notification tap already acted on, so a relaunch doesn't repeat it. */
let handledResponse: string | null = null;

function open(response: Notifications.NotificationResponse | null) {
  if (!response) return;
  const key = `${response.notification.request.identifier}@${response.notification.date}`;
  if (key === handledResponse) return;
  handledResponse = key;
  // Otherwise the next launch would report the same tap again.
  Notifications.clearLastNotificationResponseAsync().catch(() => {});
  const url = response.notification.request.content.data?.url;
  if (typeof url === 'string' && url !== '/') router.push(url as Href);
}

/** For the home screen: keeps Sunday reminders queued and opens the screen a tapped reminder points to. */
export function useReminders(unit: DistanceUnit) {
  const db = useSQLiteContext();

  useEffect(() => {
    if (!REMINDERS_SUPPORTED) return;
    loadSettings(db)
      .then((settings) => (settings.weeklyReminder ? refreshWeeklyReminder(unit) : undefined))
      .catch(() => {});
  }, [db, unit]);

  useEffect(() => {
    if (!REMINDERS_SUPPORTED) return;
    // Opened by tapping a reminder while the app was closed.
    Notifications.getLastNotificationResponseAsync().then(open, () => {});
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, []);
}
