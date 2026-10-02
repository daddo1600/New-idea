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
