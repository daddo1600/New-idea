import type { DistanceUnit } from './regions';

/**
 * Sunday-evening nudges. A different one each week so they stay worth
 * reading; `{miles}` becomes "miles" or "kilometres" (`{Miles}`, `{mile}` likewise).
 */
export const WEEKLY_MESSAGES: readonly { title: string; body: string }[] = [
  { title: 'Your {miles} called 📞', body: 'They’d like to be sorted before Monday. It takes a minute.' },
  { title: 'Plot twist: driving pays', body: 'Swipe this week’s trips business or personal and see what you’ve earned back.' },
  { title: 'Free money alert 💸', body: 'Well, technically it’s your money. Sort this week’s drives to claim it back.' },
  { title: 'Your car did the hard part', body: 'Now spend one minute taking the credit. Sort this week’s drives.' },
  { title: 'Knock knock 🚪', body: 'Who’s there? This week’s drives. They’d like to know if they were business.' },
  { title: 'Low effort, high reward', body: 'A few swipes tonight beats a shoebox of receipts at tax time.' },
  { title: 'Sunday scaries? Not for your taxes', body: 'Sort this week’s drives and bank the deduction. Done in a minute.' },
  { title: 'Future you says thanks 🙌', body: 'Sort this week’s drives now and tax time becomes a two-minute job.' },
  { title: 'Every business {mile} counts', body: 'Literally. We counted them. Come and sort this week’s.' },
  { title: 'The weekend’s nearly over 🛋️', body: 'Before Monday shows up, give this week’s drives a quick sort.' },
  { title: 'Swipe right on savings', body: 'Business drives swipe right, personal swipe left. Easiest date of the week.' },
  { title: '{Miles} don’t sort themselves…', body: '…unless you set your work hours. Until then, a few swipes will do.' },
];

/** The message for the week containing `sunday`, cycling through the list. */
export function weeklyMessage(sunday: Date, unit: DistanceUnit): { title: string; body: string } {
  const week = Math.floor(Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()) / (7 * 86_400_000));
  const message = WEEKLY_MESSAGES[week % WEEKLY_MESSAGES.length];
  const plural = unit === 'mi' ? 'miles' : 'kilometres';
  const fill = (text: string) =>
    text
      .replace('{miles}', plural)
      .replace('{Miles}', plural[0].toUpperCase() + plural.slice(1))
      .replace('{mile}', unit === 'mi' ? 'mile' : 'kilometre');
  return { title: fill(message.title), body: fill(message.body) };
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
