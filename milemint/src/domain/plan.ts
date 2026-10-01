import type { Trip } from './trip';

/**
 * Free plan: this many automatic work drives per calendar month, the same
 * allowance as MileIQ, so light drivers can stay free for good. Manual trips
 * and the spreadsheet export are always free. What counts (see `counts`):
 *  - personal drives never count: sorting a drive personal gives its slot back;
 *  - unsorted drives count until they're sorted;
 *  - in shift mode a whole shift counts once a day: a delivery shift is split
 *    into many drives by the waits at each pickup.
 * Drives past the allowance are never hidden or lost: they're recorded, shown
 * in full and sortable, and in the spreadsheet export. Only their value (the
 * money in totals, reports and accounting exports) waits for Pro.
 */
export const FREE_AUTO_DRIVES_PER_MONTH = 40;

/**
 * Referrals, Dropbox style and uncapped: joining with a friend's single-use
 * invite adds this many automatic drives a month, and so does every friend
 * who joins with one of yours. Both sides get it, for good.
 */
export const REFERRAL_BONUS_DRIVES = 10;

/** No limit on friends in practice; this only stops a corrupted count reaching Infinity. */
const MAX_FRIENDS_COUNTED = 10_000;

/**
 * The free plan's automatic drives a month: the base allowance, plus a bonus
 * for having joined with a friend's invite (`redeemed`: only once iCloud has
 * confirmed it, never while it's pending) and one for each friend who joined
 * with this user's invites (counted in iCloud; 0 until that's switched on).
 */
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
 * What the plan looks at. `classification` and `rejoinedAt` are optional so
 * callers (and tests) without them treat every automatic drive as counting.
 */
export type Countable = Pick<Trip, 'id' | 'localDate' | 'startedAt' | 'source'> &
  Partial<Pick<Trip, 'classification' | 'rejoinedAt'>> & { shiftId?: string | null };

/** Whether a drive uses the free allowance: automatic and not sorted personal. */
export function counts(trip: Pick<Countable, 'source' | 'classification'>): boolean {
  return trip.source === 'auto' && trip.classification !== 'personal';
}

/**
 * What uses up the allowance: each drive on its own, or a shift's drives on
 * one day together. Per day, so a shift that's never ended can't make every
 * later drive free.
 */
function allowanceKey(trip: Pick<Countable, 'id' | 'localDate'> & { shiftId?: string | null }): string {
  return trip.shiftId ? `shift:${trip.shiftId}:${trip.localDate}` : trip.id;
}

/**
 * Drives whose value waits for Pro: the ones past the monthly allowance.
 * They are still recorded and shown in full (see FREE_AUTO_DRIVES_PER_MONTH);
 * upgrading unlocks every one. Personal drives are never locked.
 *
 * Earliest first: within a month the allowance goes to drives (or shift days)
 * in the order they were driven, so logging a new drive never locks one the
 * user has already seen, and sorting one personal unlocks the earliest
 * locked one.
 *
 * Sorting back from personal: a drive sorted personal and later back to
 * business rejoins the queue when it was sorted back (`rejoinedAt`), not when
 * it was driven. It takes a free slot if there is one; otherwise its own value
 * waits for Pro, and every drive already showing its value keeps it. The only
 * drive that can change is the one the user just touched (home says so when it
 * happens), so nothing goes from unlocked to locked. A shift day keeps its
 * place while any of its drives still counts; if every one was personal and
 * one is sorted back, the day rejoins the same way.
 */
export function lockedTripIds(
  trips: readonly Countable[],
  isPro: boolean,
  allowance = FREE_AUTO_DRIVES_PER_MONTH,
): Set<string> {
  const locked = new Set<string>();
  if (isPro) return locked;
  for (const groups of groupsByMonth(trips).values()) {
    const queue = groups.filter((group): group is Group & { at: string } => group.at !== null);
    queue.sort((a, b) => a.at.localeCompare(b.at) || a.key.localeCompare(b.key));
    for (const group of queue.slice(Math.max(0, allowance))) {
      for (const id of group.ids) locked.add(id);
    }
  }
  return locked;
}

type Group = {
  key: string;
  /** Drives in it that count; their value waits for Pro if the group is past the allowance. */
  ids: string[];
  /** Its place in the month's queue; null when nothing in it counts. */
  at: string | null;
};

/** Each month's automatic drives as allowance groups (a drive, or a shift day). */
function groupsByMonth(trips: readonly Countable[]): Map<string, Group[]> {
  const members = new Map<string, Map<string, Countable[]>>();
  for (const trip of trips) {
    if (trip.source !== 'auto') continue;
    const month = monthOf(trip);
    let groups = members.get(month);
    if (!groups) members.set(month, (groups = new Map()));
    const key = allowanceKey(trip);
    const drives = groups.get(key);
    if (drives) drives.push(trip);
    else groups.set(key, [trip]);
  }
  const months = new Map<string, Group[]>();
  for (const [month, groups] of members) {
    months.set(
      month,
      [...groups].map(([key, drives]) => {
        // Personal drives included: one sorted personal mustn't move its shift day later.
        const start = drives.reduce((min, d) => (d.startedAt < min ? d.startedAt : min), drives[0].startedAt);
        const group: Group = { key, ids: [], at: null };
        for (const drive of drives) {
          if (!counts(drive)) continue;
          group.ids.push(drive.id);
          const at = drive.rejoinedAt && drive.rejoinedAt > drive.startedAt ? drive.rejoinedAt : start;
          if (group.at === null || at < group.at) group.at = at;
        }
        return group;
      }),
    );
  }
  return months;
}

/**
 * Drives (or shift days) using the allowance in the given month (YYYY-MM),
 * for the "12 of 40" meter. Personal drives aren't counted.
 */
export function autoDrivesInMonth(trips: readonly Countable[], month: string): number {
  const counted = new Set<string>();
  for (const trip of trips) {
    if (counts(trip) && monthOf(trip) === month) counted.add(allowanceKey(trip));
  }
  return counted.size;
}
