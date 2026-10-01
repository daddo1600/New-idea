import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { loadSettings, updateSettings } from '@/db/settings-repo';
import { trialEnd, trialReminderDate } from '@/domain/pro-offer';
import { t } from '@/i18n/i18n';

import type { ProPlan } from './store';

/**
 * A local notification three days before a free trial ends, so nobody is
 * charged by surprise. Scheduled on the phone (nothing is sent anywhere),
 * only when notifications are already allowed: buying never brings up the
 * system's permission question.
 */

const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';
const TRIAL_REMINDER_ID = 'milemint-trial-ending';

/** Whether notifications are allowed, so the paywall can promise the reminder. Never asks. */
export async function trialRemindersAllowed(): Promise<boolean> {
  if (!SUPPORTED) return false;
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/**
 * After a purchase of `plan` at `purchasedAt` (ms): if it started a free
 * trial, queue the reminder, once. `locale` formats the date it ends.
 */
export async function scheduleTrialReminder(
  db: SQLiteDatabase,
  plan: ProPlan,
  purchasedAt: number,
  locale: string,
  now = Date.now(),
): Promise<void> {
  if (!plan.trial) return;
  const start = new Date(Number.isFinite(purchasedAt) && purchasedAt > 0 ? purchasedAt : now);
  const end = trialEnd(start, plan.trial);
  const at = trialReminderDate(start, plan.trial);
  if (!end || !at || at.getTime() <= now || !(await trialRemindersAllowed())) return;

  // Claimed in the settings first, so two purchase events can't both queue it.
  let claimed = false;
  await updateSettings(db, (saved) => {
    if (saved.trialReminderAt) return {};
    claimed = true;
    return { trialReminderAt: at.toISOString() };
  });
  if (!claimed) return;

  let date: string;
  try {
    date = end.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  } catch {
    date = end.toLocaleDateString('en', { day: 'numeric', month: 'long' });
  }
  const price = plan.price;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: TRIAL_REMINDER_ID,
      content: {
        title:
          plan.trial.unit === 'month' && plan.trial.count === 1
            ? t('Your free month ends on {{date}}', { date })
            : t('Your free trial ends on {{date}}', { date }),
        body:
          plan.period === 'year'
            ? t('Keep Pro for {{price}} a year, or cancel in Settings. Nothing to do if you’re staying.', { price })
            : t('Keep Pro for {{price}} a month, or cancel in Settings. Nothing to do if you’re staying.', { price }),
        data: { url: '/pro' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  } catch (error) {
    // Not queued after all: let a later purchase event try again.
    await updateSettings(db, { trialReminderAt: null }).catch(() => {});
    throw error;
  }
}

/** The subscription is no longer active: a reminder about its trial would be wrong. */
export async function cancelTrialReminder(db: SQLiteDatabase): Promise<void> {
  const settings = await loadSettings(db);
  if (!settings.trialReminderAt) return;
  if (SUPPORTED) await Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID).catch(() => {});
  await updateSettings(db, { trialReminderAt: null });
}
