import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import { loadSettings, saveSettings } from '@/db/settings-repo';
import type { Region } from '@/domain/regions';

import { enableWeeklyReminder, refreshCountdownReminders, refreshWeeklyReminder, REMINDERS_SUPPORTED } from './weekly';

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

/**
 * For the home screen: keeps Sunday reminders and the tax-year countdown
 * queued, and opens the screen a tapped reminder points to.
 */
export function useReminders(region: Region) {
  const db = useSQLiteContext();
  const unit = region.unit;

  useEffect(() => {
    if (!REMINDERS_SUPPORTED) return;
    loadSettings(db)
      .then(async (settings) => {
        if (settings.weeklyReminder) return refreshWeeklyReminder(unit);
        if (settings.reminderDefaulted || !settings.onboarded) return;
        // On by default: switch it on once for people who set up before it was.
        const scheduled = await enableWeeklyReminder(unit).catch(() => false);
        await saveSettings(db, {
          ...(await loadSettings(db)),
          weeklyReminder: scheduled,
          reminderAsked: true,
          reminderDefaulted: true,
        });
      })
      .catch(() => {});
  }, [db, unit]);

  useEffect(() => {
    refreshCountdownReminders(region).catch(() => {});
  }, [region]);

  useEffect(() => {
    if (!REMINDERS_SUPPORTED) return;
    // Opened by tapping a reminder while the app was closed.
    Notifications.getLastNotificationResponseAsync().then(open, () => {});
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, []);
}
