import { displayLocale, type Region } from '@/domain/regions';

/** A claim's day as the user reads it: "9 Oct" this year, "9 Oct 2027" otherwise. */
export function claimDate(iso: string, region: Region, now: Date = new Date()): string {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  };
  try {
    return date.toLocaleDateString(displayLocale(region), options);
  } catch {
    return date.toLocaleDateString('en-GB', options);
  }
}

/** "14:30" (or "2:30 PM", as the country writes times). */
export function claimTime(iso: string, region: Region): string {
  return new Date(iso).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
}

/** A countdown, to the second: "28:41", or "23:59:10" from an hour up. */
export function countdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(s % 60)}` : `${minutes}:${pad(s % 60)}`;
}

const localDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Whole local days from `now` to `date` (1 is tomorrow). */
export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.round((localDay(date) - localDay(now)) / 86_400_000);
}

/** When the next code comes: "Saturday" within the coming week, else the date ("1 Nov"). */
export function dayName(date: Date, region: Region, now: Date = new Date()): string {
  if (daysUntil(date, now) >= 7) return claimDate(date.toISOString(), region, now);
  try {
    return date.toLocaleDateString(displayLocale(region), { weekday: 'long' });
  } catch {
    return date.toLocaleDateString('en-GB', { weekday: 'long' });
  }
}
