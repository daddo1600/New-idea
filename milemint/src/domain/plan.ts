import type { Trip } from './trip';

/**
 * Free plan: this many automatically logged drives per calendar month, the
 * same allowance as MileIQ, so light drivers can stay free for good.
 * Manual trips and CSV export are always free. In shift mode a whole shift
 * counts as one drive: a delivery shift is split into many drives by the
 * waits at each pickup.
 */
export const FREE_AUTO_DRIVES_PER_MONTH = 40;

/**
 * Referrals, Dropbox style and uncapped: joining with a friend's single-use
 * invite adds this many automatic drives a month, and so does every friend
 * who joins with one of yours. Both sides get it, for good.
 */
export const REFERRAL_BONUS_DRIVES = 10;

/**
 * The free plan's automatic drives a month: the base allowance, plus a bonus
 * for having joined with a friend's invite (`redeemed`: only once iCloud has
 * confirmed it, never while it's pending) and one for each friend who joined
 * with this user's invites (counted in iCloud; 0 until that's switched on).
 */
/** No limit on friends in practice; this only stops a corrupted count reaching Infinity. */
const MAX_FRIENDS_COUNTED = 10_000;

export function monthlyAllowance({ redeemed, friendsJoined }: { redeemed: boolean; friendsJoined: number }): number {
  const friends = Number.isFinite(friendsJoined)
    ? Math.min(MAX_FRIENDS_COUNTED, Math.max(0, Math.floor(friendsJoined)))
    : 0;
  return FREE_AUTO_DRIVES_PER_MONTH + REFERRAL_BONUS_DRIVES * ((redeemed ? 1 : 0) + friends);
}

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
type Countable = Pick<Trip, 'id' | 'localDate' | 'startedAt' | 'source'> & { shiftId?: string | null };

/**
 * What uses up the allowance: each drive on its own, or a shift's drives on
 * one day together. Per day, so a shift that's never ended can't make every
 * later drive free.
 */
function allowanceKey(trip: Pick<Countable, 'id' | 'localDate'> & { shiftId?: string | null }): string {
  return trip.shiftId ? `shift:${trip.shiftId}:${trip.localDate}` : trip.id;
}

export function lockedTripIds(
  trips: readonly Countable[],
  isPro: boolean,
  allowance = FREE_AUTO_DRIVES_PER_MONTH,
): Set<string> {
  const locked = new Set<string>();
  if (isPro) return locked;
  const byMonth = new Map<string, Countable[]>();
  for (const trip of trips) {
    if (trip.source !== 'auto') continue;
    const month = monthOf(trip);
    const drives = byMonth.get(month);
    if (drives) drives.push(trip);
    else byMonth.set(month, [trip]);
  }
  for (const drives of byMonth.values()) {
    drives.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const free = new Set<string>();
    for (const drive of drives) {
      const key = allowanceKey(drive);
      if (free.has(key)) continue;
      if (free.size < allowance) free.add(key);
      else locked.add(drive.id);
    }
  }
  return locked;
}

/** Automatic drives logged in the given month (YYYY-MM), for the "12 of 40" meter. */
export function autoDrivesInMonth(
  trips: readonly (Pick<Trip, 'id' | 'localDate' | 'source'> & { shiftId?: string | null })[],
  month: string,
): number {
  const counted = new Set<string>();
  for (const trip of trips) {
    if (trip.source === 'auto' && monthOf(trip) === month) counted.add(allowanceKey(trip));
  }
  return counted.size;
}
