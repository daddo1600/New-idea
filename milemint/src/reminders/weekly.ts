import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DistanceUnit } from '@/domain/regions';
import { tomorrowAt, upcomingSundays, weeklyMessage } from '@/domain/reminders';

/**
 * Local reminders, scheduled on the phone itself: no push service, no
 * server, nothing sent anywhere.
 *
 * The Sunday nudge is a different message each week, so the next few Sundays
 * are scheduled one by one and topped up whenever the app opens.
 */

/** Before rotating messages: one repeating notification under this id. */
const LEGACY_REMINDER_ID = 'milemint-weekly-review';
const WEEKLY_PREFIX = 'milemint-weekly-';
const WEEKS_AHEAD = 8;
/** Sunday 6pm, when most people plan the week ahead. */
const HOUR = 18;

const WORK_HOURS_NUDGE_ID = 'milemint-work-hours-nudge';

export const REMINDERS_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

async function allowed(ask: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !ask) return current.granted;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function cancelWeekly(): Promise<void> {
  const ids = [LEGACY_REMINDER_ID, ...Array.from({ length: WEEKS_AHEAD }, (_, i) => `${WEEKLY_PREFIX}${i}`)];
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

async function scheduleWeekly(unit: DistanceUnit): Promise<void> {
  await cancelWeekly();
  const sundays = upcomingSundays(new Date(), WEEKS_AHEAD, HOUR);
  for (const [i, sunday] of sundays.entries()) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${WEEKLY_PREFIX}${i}`,
      content: { ...weeklyMessage(sunday, unit), data: { url: '/' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: sunday },
    });
  }
}

/** Asks for permission if needed; resolves to whether the reminder is now scheduled. */
export async function enableWeeklyReminder(unit: DistanceUnit): Promise<boolean> {
  if (!REMINDERS_SUPPORTED || !(await allowed(true))) return false;
  await scheduleWeekly(unit);
  return true;
}

/** On launch: keeps the next few Sundays queued (and in the right units). Never asks. */
export async function refreshWeeklyReminder(unit: DistanceUnit): Promise<void> {
  if (!REMINDERS_SUPPORTED || !(await allowed(false))) return;
  await scheduleWeekly(unit);
}

export async function disableWeeklyReminder(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await cancelWeekly();
}

/**
 * A one-off "set and forget" nudge the evening after someone skips work hours
 * during set-up. Only if notifications are already allowed.
 */
export async function scheduleWorkHoursNudge(): Promise<void> {
  if (!REMINDERS_SUPPORTED || !(await allowed(false))) return;
  await Notifications.scheduleNotificationAsync({
    identifier: WORK_HOURS_NUDGE_ID,
    content: {
      title: 'Set it and forget it ⏱️',
      body: 'Tell MileMint your work hours once and it sorts most drives for you. Takes 30 seconds.',
      data: { url: '/settings' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: tomorrowAt(new Date(), HOUR) },
  });
}

export async function cancelWorkHoursNudge(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(WORK_HOURS_NUDGE_ID);
}
