import { msg, t } from '../i18n/i18n';
import type { DistanceUnit } from './regions';

/**
 * Sunday-evening nudges. A different one each week so they stay worth
 * reading. Lines that name the distance unit have a kilometres version
 * (`titleKm`), used where the region counts in km.
 */
export const WEEKLY_MESSAGES: readonly {
  title: string;
  titleKm?: string;
  body: string;
}[] = [
  {
    title: msg('Your miles called 📞'),
    titleKm: msg('Your kilometres called 📞'),
    body: msg('They’d like to be sorted before Monday. It takes a minute.'),
  },
  {
    title: msg('Plot twist: driving pays'),
    body: msg('Swipe this week’s trips business or personal and see what you’ve earned back.'),
  },
  {
    title: msg('Free money alert 💸'),
    body: msg('Well, technically it’s your money. Sort this week’s drives to claim it back.'),
  },
  {
    title: msg('Your car did the hard part'),
    body: msg('Now spend one minute taking the credit. Sort this week’s drives.'),
  },
  {
    title: msg('Knock knock 🚪'),
    body: msg('Who’s there? This week’s drives. They’d like to know if they were business.'),
  },
  {
    title: msg('Low effort, high reward'),
    body: msg('A few swipes tonight beats a shoebox of receipts at tax time.'),
  },
  {
    title: msg('Sunday scaries? Not for your taxes'),
    body: msg('Sort this week’s drives and bank the deduction. Done in a minute.'),
  },
  {
    title: msg('Future you says thanks 🙌'),
    body: msg('Sort this week’s drives now and tax time becomes a two-minute job.'),
  },
  {
    title: msg('Every business mile counts'),
    titleKm: msg('Every business kilometre counts'),
    body: msg('Literally. We counted them. Come and sort this week’s.'),
  },
  {
    title: msg('The weekend’s nearly over 🛋️'),
    body: msg('Before Monday shows up, give this week’s drives a quick sort.'),
  },
  {
    title: msg('Swipe right on savings'),
    body: msg('Business drives swipe right, personal swipe left. Easiest date of the week.'),
  },
  {
    title: msg('Miles don’t sort themselves…'),
    titleKm: msg('Kilometres don’t sort themselves…'),
    body: msg('…unless you set your work hours. Until then, a few swipes will do.'),
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
