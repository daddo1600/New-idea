import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { countdownReminders } from "@/domain/deadlines";
import type { DistanceUnit, Region } from "@/domain/regions";
import { tomorrowAt, upcomingSundays, weeklyMessage } from "@/domain/reminders";
import { t } from "@/i18n/i18n";

/**
 * Local reminders, scheduled on the phone itself: no push service, no
 * server, nothing sent anywhere. Their text is written in the current
 * language when they're scheduled.
 *
 * The Sunday nudge is a different message each week, so the next few Sundays
 * are scheduled one by one and topped up whenever the app opens.
 */

/** Before rotating messages: one repeating notification under this id. */
const LEGACY_REMINDER_ID = "milemint-weekly-review";
const WEEKLY_PREFIX = "milemint-weekly-";
const WEEKS_AHEAD = 8;
/** Sunday 6pm, when most people plan the week ahead. */
const HOUR = 18;

const WORK_HOURS_NUDGE_ID = "milemint-work-hours-nudge";

export const REMINDERS_SUPPORTED =
  Platform.OS === "ios" || Platform.OS === "android";

async function allowed(ask: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !ask) return current.granted;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function cancelWeekly(): Promise<void> {
  const ids = [
    LEGACY_REMINDER_ID,
    ...Array.from({ length: WEEKS_AHEAD }, (_, i) => `${WEEKLY_PREFIX}${i}`),
  ];
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

async function scheduleWeekly(unit: DistanceUnit): Promise<void> {
  await cancelWeekly();
  const sundays = upcomingSundays(new Date(), WEEKS_AHEAD, HOUR);
  for (const [i, sunday] of sundays.entries()) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${WEEKLY_PREFIX}${i}`,
      content: { ...weeklyMessage(sunday, unit), data: { url: "/" } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: sunday,
      },
    });
  }
}

/** Asks for permission if needed; resolves to whether the reminder is now scheduled. */
export async function enableWeeklyReminder(
  unit: DistanceUnit,
): Promise<boolean> {
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
      title: t("Set it and forget it ⏱️"),
      body: t(
        "Tell MileMint your work hours once and it sorts most drives for you. Takes 30 seconds.",
      ),
      data: { url: "/settings" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrowAt(new Date(), HOUR),
    },
  });
}

export async function cancelWorkHoursNudge(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(WORK_HOURS_NUDGE_ID);
}

const COUNTDOWN_PREFIX = "milemint-countdown-";
const COUNTDOWN_IDS = [
  "year-end-0",
  "year-end-1",
  "year-end-2",
  "return-0",
  "return-1",
];

/**
 * Tax-year countdown: two months, a month and a week before the tax year
 * ends, then a month and a week before the return is due. Kept in step with
 * the region on every launch. Only if notifications are already allowed.
 */
export async function refreshCountdownReminders(region: Region): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await Promise.all(
    COUNTDOWN_IDS.map((id) =>
      Notifications.cancelScheduledNotificationAsync(
        `${COUNTDOWN_PREFIX}${id}`,
      ),
    ),
  );
  if (!(await allowed(false))) return;
  for (const reminder of countdownReminders(region, new Date())) {
    const [y, m, d] = reminder.date.split("-").map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: `${COUNTDOWN_PREFIX}${reminder.id}`,
      content: {
        title: reminder.title,
        body: reminder.body,
        data: { url: reminder.id.startsWith("return") ? "/report" : "/" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(y, m - 1, d, HOUR),
      },
    });
  }
}
