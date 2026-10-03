import type { RegionCode } from '@/domain/regions';
import type { VehicleType } from '@/domain/trip';

/**
 * The small green "new" dot on the Perks tab (research_notes/launch-2026/tab-bar-colour.md).
 *
 * OFF until the first real partner is live: every offer today is a demo, and
 * demo offers never count. Turning it on is a one-line change here.
 */
export const PERKS_NEW_DOT_ENABLED: boolean = false;

/** The dot shows at most once in this many days, however many offers arrive. */
export const NEW_DOT_GAP_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

/** What the dot needs to know about a live partner offer (from the server, once there is one). */
export type DotOffer = {
  id: string;
  /** Demo offers (DEMO_OFFERS) never light the dot. */
  demo: boolean;
  /** Pro-only offers never light it either: the dot is the same for Free and Pro, and never a Pro teaser. */
  proOnly: boolean;
  /** Where it's offered; empty means everywhere. */
  regions: readonly RegionCode[];
  /** Who it's for; empty means every vehicle. */
  vehicles: readonly VehicleType[];
  /** ISO time it ends; null runs until withdrawn. */
  endsAt: string | null;
};

/** What's remembered between launches (in settings). */
export type DotMemory = {
  /** Offer ids already seen on the Perks tab. */
  seenIds: readonly string[];
  /** ISO time the dot last appeared. */
  lastShownAt: string | null;
  /** The dot is up and waiting for Perks to be opened. */
  showing: boolean;
};

export type DotContext = {
  enabled: boolean;
  offers: readonly DotOffer[];
  region: RegionCode;
  vehicle: VehicleType;
  perksFocused: boolean;
  now: Date;
};

/** Offers that count for this user now: real, not Pro-only, for their region and vehicle, and not ended. */
export function dotEligibleIds(offers: readonly DotOffer[], region: RegionCode, vehicle: VehicleType, now: Date): string[] {
  return offers
    .filter(
      (offer) =>
        !offer.demo &&
        !offer.proOnly &&
        (offer.regions.length === 0 || offer.regions.includes(region)) &&
        (offer.vehicles.length === 0 || offer.vehicles.includes(vehicle)) &&
        (offer.endsAt === null || Date.parse(offer.endsAt) > now.getTime()),
    )
    .map((offer) => offer.id);
}

/**
 * The memory after this moment: opening Perks marks every current offer seen
 * and clears the dot; otherwise an unseen offer raises it, unless it was
 * raised less than NEW_DOT_GAP_DAYS ago. With the flag off, nothing changes
 * and the dot stays down.
 */
export function nextDotMemory(memory: DotMemory, context: DotContext): DotMemory {
  if (!context.enabled) return memory.showing ? { ...memory, showing: false } : memory;
  const eligible = dotEligibleIds(context.offers, context.region, context.vehicle, context.now);
  if (context.perksFocused) {
    const seenIds = [...new Set([...memory.seenIds, ...eligible])];
    const same = seenIds.length === memory.seenIds.length && !memory.showing;
    return same ? memory : { ...memory, seenIds, showing: false };
  }
  const unseen = eligible.some((id) => !memory.seenIds.includes(id));
  if (memory.showing) return unseen ? memory : { ...memory, showing: false };
  if (!unseen) return memory;
  const last = memory.lastShownAt === null ? NaN : Date.parse(memory.lastShownAt);
  if (Number.isFinite(last) && context.now.getTime() - last < NEW_DOT_GAP_DAYS * DAY) return memory;
  return { ...memory, showing: true, lastShownAt: context.now.toISOString() };
}

/** Whether the dot is drawn: never while Perks is the open tab. */
export function perksDotVisible(memory: DotMemory, context: DotContext): boolean {
  return context.enabled && !context.perksFocused && nextDotMemory(memory, context).showing;
}
