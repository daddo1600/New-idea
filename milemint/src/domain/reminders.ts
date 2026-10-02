import { msg, t } from '../i18n/i18n';
import type { DistanceUnit } from './regions';

/**
 * Sunday-evening reminders. A different one each week so they stay worth
 * reading. Plain and friendly rather than punny: many drivers read English
 * as a second language, and jokes like "Knock knock" or "Swipe right on
 * savings" don't cross languages. Lines that name the distance unit have a
 * kilometres version (`titleKm`), used where the region counts in km.
 */
export const WEEKLY_MESSAGES: readonly { title: string; titleKm?: string; body: string }[] = [
  {
    title: msg('Your drives are waiting 📋'),
    body: msg('Sort them before Monday. It takes a minute.'),
  },
  {
    title: msg('What did you drive for work?'),
    body: msg('Sort this week’s drives and see what they’re worth.'),
  },
  {
    title: msg('Count every work drive 🚗'),
    body: msg('Sort this week’s drives so none are left out.'),
  },
  {
    title: msg('Your car did the hard part'),
    body: msg('Now take one minute to sort this week’s drives.'),
  },
  {
    title: msg('A quick question 🙋'),
    body: msg('Were this week’s drives for work or personal? Swipe to sort them.'),
  },
  {
    title: msg('It only takes a minute ⏱️'),
    body: msg('A few swipes tonight saves you a lot of work at tax time.'),
  },
  {
    title: msg('Sunday check-in 🗓️'),
    body: msg('Sort this week’s drives and keep your records up to date.'),
  },
  {
    title: msg('Make tax time easy 🙌'),
    body: msg('Sort this week’s drives now and tax time becomes a two-minute job.'),
  },
  {
    title: msg('Every work mile counts'),
    titleKm: msg('Every work kilometre counts'),
    body: msg('Take a minute to sort this week’s drives.'),
  },
  {
    title: msg('The weekend’s nearly over 🛋️'),
    body: msg('Sort this week’s drives before the new week starts.'),
  },
  {
    title: msg('Swipe right for work 👉'),
    body: msg('Swipe left for personal. This week’s drives are ready to sort.'),
  },
  {
    title: msg('Miles don’t sort themselves…'),
    titleKm: msg('Kilometres don’t sort themselves…'),
    body: msg('…unless you set your work hours. Until then, it only takes a few swipes.'),
  },
];

/** The message for the week containing `sunday`, cycling through the list, in the current language. */
export function weeklyMessage(sunday: Date, unit: DistanceUnit): { title: string; body: string } {
  const week = Math.floor(Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()) / (7 * 86_400_000));
  const message = WEEKLY_MESSAGES[week % WEEKLY_MESSAGES.length];
  const title = unit === 'km' && message.titleKm ? message.titleKm : message.title;
  return { title: t(title), body: t(message.body) };
}

/** The next `count` Sundays at `hour`:00 local time, starting today if that time is still ahead. */
export function upcomingSundays(now: Date, count: number, hour: number): Date[] {
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((7 - now.getDay()) % 7), hour);
  if (first <= now) first.setDate(first.getDate() + 7);
  return Array.from(
    { length: count },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + 7 * i, hour),
  );
}

/** Tomorrow at `hour`:00 local time. */
export function tomorrowAt(now: Date, hour: number): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour);
}
