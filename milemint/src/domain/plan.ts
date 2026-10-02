import { FOUNDING_BOOST_ENDS, FRIEND_GIFT_MONTHS } from '@/constants/rewards';

import { toLocalIsoDate } from './trip';

/**
 * Free and Pro. Free is for keeping the record: unlimited automatic tracking
 * (no monthly cap, nothing locked or hidden), sorting, the money totals, the
 * tax-year totals and year-end summary on screen, trips added by hand and the
 * practice run. Pro is for getting the record out and the extras built on it:
 * the features below. Nothing here touches tracking, so a free user's drives
 * are always all there and all counted.
 */
export type ProFeature =
  /** The itemised log or report and every export: PDF, CSV, the spreadsheet, accounting formats, the ATO logbook CSV and the P87 summary. */
  | 'reports'
  /** Sending the report to an accountant. */
  | 'accountant'
  /** Making Tax Digital quarterly figures (UK). */
  | 'mtd'
  /** Earnings by platform (Uber, Deliveroo…). */
  | 'platform-earnings'
  /** The tax set-aside pot. */
  | 'tax-set-aside'
  /** Importing a log from another app. */
  | 'import';

/** Rewards for inviting friends. Never a report or an export: those are what Pro is paid for. */
export type Perk = 'tax-set-aside' | 'platform-earnings' | 'founding-badge';

export type PerkStep = {
  perk: Perk;
  /** Friends joined to earn it. */
  friends: number;
  /** The same during the founding boost (until FOUNDING_BOOST_ENDS). */
  boosted: number;
};

/** The ladder, in order: each step needs more friends than the one before. */
export const PERK_LADDER: readonly PerkStep[] = [
  { perk: 'tax-set-aside', friends: 1, boosted: 1 },
  { perk: 'platform-earnings', friends: 3, boosted: 2 },
  { perk: 'founding-badge', friends: 5, boosted: 3 },
];

/** The Pro feature a perk unlocks for good, if it unlocks one. */
const PERK_FEATURES: Partial<Record<Perk, ProFeature>> = {
  'tax-set-aside': 'tax-set-aside',
  'platform-earnings': 'platform-earnings',
};

/** Whether the founding boost is on: up to and including FOUNDING_BOOST_ENDS, on the user's own calendar. */
export function foundingBoost(now: Date, ends = FOUNDING_BOOST_ENDS): boolean {
  return toLocalIsoDate(now) <= ends;
}

/** Friends needed for a step right now. */
export function friendsNeeded(step: PerkStep, now: Date): number {
  return foundingBoost(now) ? step.boosted : step.friends;
}

/** A friend count from storage or iCloud as a whole number from 0 (anything odd counts as 0). */
function friendsOf(friendsJoined: number): number {
  return Number.isFinite(friendsJoined) ? Math.max(0, Math.floor(friendsJoined)) : 0;
}

/**
 * The perks earned, in ladder order: those the friends reach now, plus those
 * `kept` from before. A perk is for good, so one earned during the founding
 * boost stays after the thresholds go back up.
 */
export function earnedPerks(friendsJoined: number, now: Date, kept: readonly Perk[] = []): Perk[] {
  const friends = friendsOf(friendsJoined);
  return PERK_LADDER.filter((step) => kept.includes(step.perk) || friends >= friendsNeeded(step, now)).map(
    (step) => step.perk,
  );
}

/** The next perk to earn and how many more friends it needs; null once every perk is earned. */
export function nextPerk(
  friendsJoined: number,
  now: Date,
  earned: readonly Perk[],
): { perk: Perk; more: number } | null {
  const step = PERK_LADDER.find((candidate) => !earned.includes(candidate.perk));
  if (!step) return null;
  return { perk: step.perk, more: Math.max(1, friendsNeeded(step, now) - friendsOf(friendsJoined)) };
}

/** Whether the user can use a Pro feature: with Pro, or through a perk (never reports or exports). */
export function canUse(feature: ProFeature, { isPro, perks }: { isPro: boolean; perks: readonly Perk[] }): boolean {
  if (isPro) return true;
  return perks.some((perk) => PERK_FEATURES[perk] === feature);
}

/**
 * Whether a friend's gift (50% off the first year of Pro) is still offered:
 * an offer code is set, and a friend's code was entered in the last
 * FRIEND_GIFT_MONTHS months.
 */
export function friendGiftOpen({
  offerCode,
  redeemedAt,
  now,
}: {
  offerCode: string;
  redeemedAt: string | null;
  now: Date;
}): boolean {
  if (!offerCode || !redeemedAt) return false;
  const since = new Date(redeemedAt);
  if (Number.isNaN(since.getTime())) return false;
  const until = new Date(since);
  until.setMonth(until.getMonth() + FRIEND_GIFT_MONTHS);
  return now < until;
}
