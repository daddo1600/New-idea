import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { MAX_SHIFT_MS, type Shift } from '@/db/shifts-repo';
import { t } from '@/i18n/i18n';

/**
 * Local notifications for shifts, scheduled on the phone (nothing is sent
 * anywhere), and only when notifications are already allowed:
 *  - "End shift?" once the car has been parked at Home for a while with a
 *    shift still on: a forgotten shift turns tomorrow's school run into work;
 *  - at the 16-hour mark, when a shift left running ends by itself: said out
 *    loud instead of ending silently.
 */

const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';
const END_PROMPT_ID = 'milemint-shift-end-prompt';
const AUTO_END_ID = 'milemint-shift-auto-end';

/** How long parked at Home with a shift on before asking whether it's over. */
export const PARKED_AT_HOME_MS = 50 * 60_000;

async function allowed(): Promise<boolean> {
  if (!SUPPORTED) return false;
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Parked at Home at `parkedAt` with a shift on: ask in 50 minutes, unless a drive starts first. */
export async function scheduleEndShiftPrompt(parkedAt: number, now = Date.now()): Promise<void> {
  if (!(await allowed())) return;
  await Notifications.scheduleNotificationAsync({
    identifier: END_PROMPT_ID,
    content: {
      title: t('End your shift?'),
      body: t('You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work.'),
      data: { url: '/' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Math.max(now + 60_000, parkedAt + PARKED_AT_HOME_MS)),
    },
  });
}

export async function cancelEndShiftPrompt(): Promise<void> {
  if (!SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(END_PROMPT_ID).catch(() => {});
}

/** A shift started (or its start moved): tell the user when it ends by itself at 16 hours. */
export async function scheduleShiftAutoEnd(shift: Shift, now = Date.now()): Promise<void> {
  await cancelShiftAutoEnd();
  const at = Date.parse(shift.startedAt) + MAX_SHIFT_MS;
  if (shift.endedAt || at <= now || !(await allowed())) return;
  await Notifications.scheduleNotificationAsync({
    identifier: AUTO_END_ID,
    content: {
      title: t('Your shift ended after 16 hours'),
      body: t('It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times.'),
      data: { url: '/' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
  });
}

/** The shift ended (or was never started): nothing left to say about it. */
export async function cancelShiftAutoEnd(): Promise<void> {
  if (!SUPPORTED) return;
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(AUTO_END_ID).catch(() => {}),
    cancelEndShiftPrompt(),
  ]);
}
