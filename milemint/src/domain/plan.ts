import type { Trip } from './trip';

/**
 * Free plan: this many automatically logged drives per calendar month, about
 * a week of work driving: enough to trust the app before being asked to pay.
 * Manual trips are always free and never count.
 */
export const FREE_AUTO_DRIVES_PER_MONTH = 20;

/** YYYY-MM of a trip's local date: the month its drive counts towards. */
function monthOf(trip: Pick<Trip, 'localDate'>): string {
  return trip.localDate.slice(0, 7);
}

/**
 * Drives past the monthly allowance. They are still recorded, so nothing is
 * lost, but stay locked until the user upgrades; upgrading unlocks every one.
 * The earliest drives of a month are the free ones, so logging a new drive
 * never locks one the user has already seen.
 */
export function lockedTripIds(
  trips: readonly Pick<Trip, 'id' | 'localDate' | 'startedAt' | 'source'>[],
  isPro: boolean,
  allowance = FREE_AUTO_DRIVES_PER_MONTH,
): Set<string> {
  const locked = new Set<string>();
  if (isPro) return locked;
  const byMonth = new Map<string, Pick<Trip, 'id' | 'startedAt'>[]>();
  for (const trip of trips) {
    if (trip.source !== 'auto') continue;
    const month = monthOf(trip);
    const drives = byMonth.get(month);
    if (drives) drives.push(trip);
    else byMonth.set(month, [trip]);
  }
  for (const drives of byMonth.values()) {
    if (drives.length <= allowance) continue;
    drives.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    for (const drive of drives.slice(allowance)) locked.add(drive.id);
  }
  return locked;
}

/** Automatic drives logged in the given month (YYYY-MM), for the "12 of 20" meter. */
export function autoDrivesInMonth(
  trips: readonly Pick<Trip, 'localDate' | 'source'>[],
  month: string,
): number {
  return trips.filter((trip) => trip.source === 'auto' && monthOf(trip) === month).length;
}
