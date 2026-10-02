import { weekStartOf } from '@/domain/set-aside';
import { toLocalIsoDate } from '@/domain/trip';

import type { LimitPeriod, PerkOffer } from './offers';

/**
 * Claimed perks, kept on the phone only (table perk_claims). A claim is
 * free; in the live version the partner pays MileSprout only when the code is
 * redeemed (scanned at the till or used online). Pure, so it's unit-tested.
 *
 * The rules, as partners set them per offer:
 * - a code works for a short window once claimed (often 30 minutes), so
 *   people claim it at the till;
 * - a code not used in time goes back into the week's pool and doesn't use up
 *   the person's allowance: only used and still-live codes count;
 * - one person can have so many a day, week or month.
 */
export type PerkClaim = {
  code: string;
  offerId: string;
  /** ISO times. */
  claimedAt: string;
  expiresAt: string;
  /** When it was used; null while it's still to use. */
  redeemedAt: string | null;
};

export type ClaimStatus = 'active' | 'expired' | 'redeemed';

const MINUTE_MS = 60 * 1000;

/** A new claim on `offer`, good for the offer's useWithinMinutes from now. */
export function newClaim(offer: PerkOffer, code: string, now: Date): PerkClaim {
  return {
    code,
    offerId: offer.id,
    claimedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + offer.useWithinMinutes * MINUTE_MS).toISOString(),
    redeemedAt: null,
  };
}

/** Used beats expired: a code used in time stays used. Expires at the exact time shown. */
export function claimStatus(claim: PerkClaim, now: Date): ClaimStatus {
  if (claim.redeemedAt) return 'redeemed';
  return now.getTime() >= Date.parse(claim.expiresAt) ? 'expired' : 'active';
}

/** Whole seconds left to use a code, rounded down; null once it has run out. */
export function secondsLeft(claim: PerkClaim, now: Date): number | null {
  const ms = Date.parse(claim.expiresAt) - now.getTime();
  return ms > 0 ? Math.floor(ms / 1000) : null;
}

/**
 * Whether a claim holds a code: used, or still live. A code that ran out
 * unused is back in the pool, so it counts against neither the week's cap
 * nor the person's allowance.
 */
export const holdsCode = (claim: PerkClaim, now: Date): boolean => claimStatus(claim, now) !== 'expired';

/** The Monday (local date) the weekly caps last reset on. */
export const capWeekStart = (now: Date): string => weekStartOf(toLocalIsoDate(now));

/** This user's codes on an offer since Monday (local time): used or still live, not ones that ran out. */
export function myClaimsThisWeek(offerId: string, claims: readonly PerkClaim[], now: Date): number {
  const monday = capWeekStart(now);
  return claims.filter(
    (claim) =>
      claim.offerId === offerId && toLocalIsoDate(new Date(claim.claimedAt)) >= monday && holdsCode(claim, now),
  ).length;
}

/**
 * Codes left this week: the partner's cap, less what others hold (a demo
 * number for now) and this user's own. Never below 0 or above the cap.
 */
export function weeklyLeft(offer: PerkOffer, mine: number): number {
  return Math.min(offer.weeklyCap, Math.max(0, offer.weeklyCap - offer.claimedByOthers - mine));
}

/** Local midnight that starts the day, week (Monday) or month `now` is in. */
export function periodStart(period: LimitPeriod, now: Date): Date {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  if (period === 'day') return new Date(y, m, d);
  if (period === 'month') return new Date(y, m, 1);
  return new Date(y, m, d - ((now.getDay() + 6) % 7));
}

/** Local midnight that starts the next day, week (Monday) or month. */
export function nextPeriodStart(period: LimitPeriod, now: Date): Date {
  const start = periodStart(period, now);
  const y = start.getFullYear();
  const m = start.getMonth();
  const d = start.getDate();
  if (period === 'day') return new Date(y, m, d + 1);
  if (period === 'month') return new Date(y, m + 1, 1);
  return new Date(y, m, d + 7);
}

/** This user's codes on an offer in the partner's period (local time): used or still live. */
export function myClaimsThisPeriod(offer: PerkOffer, claims: readonly PerkClaim[], now: Date): number {
  const start = periodStart(offer.perPerson.period, now).getTime();
  return claims.filter(
    (claim) => claim.offerId === offer.id && Date.parse(claim.claimedAt) >= start && holdsCode(claim, now),
  ).length;
}

export type OfferState = {
  left: number;
  /** The newest claim on this offer, if any. */
  latest: PerkClaim | null;
  status: ClaimStatus | null;
  /** When this person's allowance comes back (local midnight), if it's used up; else null. */
  nextAt: Date | null;
  /** No code waiting to be used, allowance not used up, and some left this week. */
  canClaim: boolean;
};

/** What an offer's card shows. */
export function offerState(offer: PerkOffer, claims: readonly PerkClaim[], now: Date): OfferState {
  const left = weeklyLeft(offer, myClaimsThisWeek(offer.id, claims, now));
  const latest = claims
    .filter((claim) => claim.offerId === offer.id)
    .reduce<PerkClaim | null>((newest, claim) => (!newest || claim.claimedAt > newest.claimedAt ? claim : newest), null);
  const status = latest ? claimStatus(latest, now) : null;
  const usedUp = myClaimsThisPeriod(offer, claims, now) >= offer.perPerson.count;
  const nextAt = usedUp ? nextPeriodStart(offer.perPerson.period, now) : null;
  return { left, latest, status, nextAt, canClaim: status !== 'active' && !usedUp && left > 0 };
}

/**
 * A card's main button: Claim (or Claim again), or, while the tracker is
 * recording a drive, "Park up to claim" (disabled), so no one claims on the
 * move. Null when there's nothing to claim.
 */
export type ClaimAction = 'claim' | 'claim-again' | 'park' | null;

export function claimAction(state: Pick<OfferState, 'canClaim' | 'latest'>, driving: boolean): ClaimAction {
  if (!state.canClaim) return null;
  if (driving) return 'park';
  return state.latest ? 'claim-again' : 'claim';
}
