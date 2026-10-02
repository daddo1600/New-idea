import * as Notifications from 'expo-notifications';

import { REMINDER_HOUR } from '@/domain/deadlines';
import {
  formatQuarterRange,
  QUARTER_REMINDER,
  quarterReminderDate,
  upcomingQuarterReminders,
} from '@/domain/quarters';
import { formatLongDate, formatMoney, type Region } from '@/domain/regions';
import { nextMondayAt } from '@/domain/set-aside';
import { t } from '@/i18n/i18n';

import { REMINDERS_SUPPORTED } from './weekly';

/**
 * The money reminders, scheduled on the phone like the Sunday one:
 *   - Tax set-aside (Pro, or the 1-friend perk): Monday morning, "Put £X
 *     aside from last week's driving". One at a time, the next Monday, as the
 *     amount depends on what's been entered by then; topped up when the app
 *     opens and whenever the figures change.
 *   - Quarterly deadlines (Pro): two weeks before each one.
 */

const SET_ASIDE_ID = 'milemint-set-aside';
/** Monday morning, when the week's pay has usually landed. */
export const SET_ASIDE_HOUR = 9;

const QUARTER_PREFIX = 'milemint-quarter-';
const QUARTERS_AHEAD = 4;

async function allowed(ask: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !ask) return current.granted;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** The set-aside reminder's text: the amount for the week just ended, or a nudge to enter it. */
export function setAsideMessage(amount: number | null, region: Region): { title: string; body: string } {
  const title = t('Tax set-aside');
  if (amount === null) return { title, body: t('Add last week’s earnings to see how much to put aside for tax.') };
  if (amount === 0) return { title, body: t('Your mileage covered last week’s earnings, so there’s nothing to put aside.') };
  return { title, body: t('Put {{amount}} aside from last week’s driving.', { amount: formatMoney(amount, region) }) };
}

/**
 * Queues next Monday's set-aside reminder. `amountFor` gives the amount for
 * the week before that Monday (null when its earnings aren't entered).
 * Asks for permission only when `ask`; resolves to whether it's queued.
 */
export async function scheduleSetAsideReminder(
  region: Region,
  amountFor: (monday: Date) => number | null,
  ask = false,
): Promise<boolean> {
  if (!REMINDERS_SUPPORTED) return false;
  await Notifications.cancelScheduledNotificationAsync(SET_ASIDE_ID);
  if (!(await allowed(ask))) return false;
  const monday = nextMondayAt(new Date(), SET_ASIDE_HOUR);
  await Notifications.scheduleNotificationAsync({
    identifier: SET_ASIDE_ID,
    content: { ...setAsideMessage(amountFor(monday), region), data: { url: '/money' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: monday },
  });
  return true;
}

export async function cancelSetAsideReminder(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(SET_ASIDE_ID);
}

async function cancelQuarterly(): Promise<void> {
  await Promise.all(
    Array.from({ length: QUARTERS_AHEAD }, (_, i) => Notifications.cancelScheduledNotificationAsync(`${QUARTER_PREFIX}${i}`)),
  );
}

/** Queues the next quarterly deadline reminders. Asks for permission only when `ask`; resolves to whether they're queued. */
export async function scheduleQuarterlyReminders(region: Region, ask = false): Promise<boolean> {
  if (!REMINDERS_SUPPORTED) return false;
  await cancelQuarterly();
  if (!(await allowed(ask))) return false;
  const copy = QUARTER_REMINDER[region.code];
  for (const [i, quarter] of upcomingQuarterReminders(region, new Date(), REMINDER_HOUR, QUARTERS_AHEAD).entries()) {
    const [y, m, d] = quarterReminderDate(quarter).split('-').map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: `${QUARTER_PREFIX}${i}`,
      content: {
        title: t(copy.title),
        body: t(copy.body, { period: formatQuarterRange(quarter, region), date: formatLongDate(quarter.due, region) }),
        data: { url: '/money' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(y, m - 1, d, REMINDER_HOUR) },
    });
  }
  return true;
}

export async function cancelQuarterlyReminders(): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  await cancelQuarterly();
}
