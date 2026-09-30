import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Optional nudge to sort the week's drives. Scheduled on the phone itself:
 * no push service, no server, nothing sent anywhere.
 */

const REMINDER_ID = 'milemint-weekly-review';
/** Sunday 6pm, when most people plan the week ahead (1 = Sunday for weekly triggers). */
const WEEKDAY = 1;
const HOUR = 18;

export const REMINDERS_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

/** Asks for permission if needed; resolves to whether the reminder is now scheduled. */
export async function enableWeeklyReminder(): Promise<boolean> {
  if (!REMINDERS_SUPPORTED) return false;
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Sort this week’s drives',
      body: 'Swipe your new trips business or personal. It takes a minute, and every business mile counts.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: WEEKDAY,
      hour: HOUR,
      minute: 0,
    },
  });
  return true;
}

export async function disableWeeklyReminder(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
}
