import { weekStartOf } from '@/domain/set-aside';
import { toLocalIsoDate } from '@/domain/trip';

import type { PerkOffer } from './offers';

/**
 * Claimed perks, kept on the phone only (table perk_claims). A claim is
 * free; in the live version the partner pays MileSprout only when the code is
 * redeemed (scanned at the till or used online). Pure, so it's unit-tested.
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

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** A new claim on `offer`, good for the offer's validDays from now. */
export function newClaim(offer: PerkOffer, code: string, now: Date): PerkClaim {
  return {
    code,
    offerId: offer.id,
    claimedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + offer.validDays * DAY_MS).toISOString(),
    redeemedAt: null,
  };
}

/** Used beats expired: a code used in time stays used. Expires at the exact time shown. */
export function claimStatus(claim: PerkClaim, now: Date): ClaimStatus {
  if (claim.redeemedAt) return 'redeemed';
  return now.getTime() >= Date.parse(claim.expiresAt) ? 'expired' : 'active';
}

/** Time left before a code expires, rounded down to the minute; null once it has. */
export function timeLeft(claim: PerkClaim, now: Date): { days: number; hours: number; minutes: number } | null {
  const ms = Date.parse(claim.expiresAt) - now.getTime();
  if (ms <= 0) return null;
  const minutesLeft = Math.floor(ms / 60_000);
  return {
    days: Math.floor(minutesLeft / (24 * 60)),
    hours: Math.floor((minutesLeft % (24 * 60)) / 60),
    minutes: minutesLeft % 60,
  };
}

/** The Monday (local date) the weekly caps last reset on. */
export const capWeekStart = (now: Date): string => weekStartOf(toLocalIsoDate(now));

/** This user's claims on an offer since Monday (local time), used or not: each one used up a code. */
export function myClaimsThisWeek(offerId: string, claims: readonly PerkClaim[], now: Date): number {
  const monday = capWeekStart(now);
  return claims.filter((claim) => claim.offerId === offerId && toLocalIsoDate(new Date(claim.claimedAt)) >= monday)
    .length;
}

/**
 * Codes left this week: the partner's cap, less what others claimed (a demo
 * number for now) and this user's own claims. Never below 0 or above the cap.
 */
export function weeklyLeft(offer: PerkOffer, mine: number): number {
  return Math.min(offer.weeklyCap, Math.max(0, offer.weeklyCap - offer.claimedByOthers - mine));
}

export type OfferState = {
  left: number;
  /** The newest claim on this offer, if any. */
  latest: PerkClaim | null;
  status: ClaimStatus | null;
  /** No code waiting to be used, and some left this week. */
  canClaim: boolean;
};

/** What an offer's card shows. */
export function offerState(offer: PerkOffer, claims: readonly PerkClaim[], now: Date): OfferState {
  const left = weeklyLeft(offer, myClaimsThisWeek(offer.id, claims, now));
  const latest =
    claims
      .filter((claim) => claim.offerId === offer.id)
      .reduce<PerkClaim | null>((newest, claim) => (!newest || claim.claimedAt > newest.claimedAt ? claim : newest), null);
  const status = latest ? claimStatus(latest, now) : null;
  return { left, latest, status, canClaim: status !== 'active' && left > 0 };
}
