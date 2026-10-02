import type { PerkClaim } from './claims';

/**
 * A copy of recent perk claims kept in the iPhone's Keychain, so each
 * partner's per-person limit survives deleting and reinstalling the app (the
 * Keychain outlives the app; the database doesn't). Kept on this device only,
 * never synced or sent anywhere, and holds no more than the database does:
 * codes, offer ids and times. Pure, so it's unit-tested; use-perk-claims.ts
 * does the reading and writing.
 *
 * Until the redemption server enforces limits (and a new phone or a reset
 * iPhone starts afresh), this stops the easy route: delete, reinstall, claim
 * again.
 */

/** Long enough to cover the longest per-person period (a month) and the longest online code (30 days). */
export const LEDGER_KEEP_DAYS = 62;

const DAY_MS = 24 * 60 * 60 * 1000;

/** One claim, compact: [code, offerId, claimedAt, expiresAt, redeemedAt], times in whole seconds. */
type Entry = [string, string, number, number, number | null];

const toSeconds = (iso: string) => Math.floor(Date.parse(iso) / 1000);
const toIso = (seconds: number) => new Date(seconds * 1000).toISOString();

export function encodeLedger(claims: readonly PerkClaim[]): string {
  const entries: Entry[] = claims.map((claim) => [
    claim.code,
    claim.offerId,
    toSeconds(claim.claimedAt),
    toSeconds(claim.expiresAt),
    claim.redeemedAt ? toSeconds(claim.redeemedAt) : null,
  ]);
  return JSON.stringify(entries);
}

/** The claims in a saved ledger; anything unreadable is skipped, never thrown. */
export function decodeLedger(raw: string | null): PerkClaim[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const claims: PerkClaim[] = [];
  for (const entry of parsed) {
    if (!Array.isArray(entry) || entry.length !== 5) continue;
    const [code, offerId, claimedAt, expiresAt, redeemedAt] = entry;
    if (typeof code !== 'string' || typeof offerId !== 'string') continue;
    if (!Number.isFinite(claimedAt) || !Number.isFinite(expiresAt)) continue;
    if (redeemedAt !== null && !Number.isFinite(redeemedAt)) continue;
    claims.push({
      code,
      offerId,
      claimedAt: toIso(claimedAt),
      expiresAt: toIso(expiresAt),
      redeemedAt: redeemedAt === null ? null : toIso(redeemedAt),
    });
  }
  return claims;
}

/**
 * Both lists as one, by code. A code used in either stays used, at the
 * earlier time. Claims older than LEDGER_KEEP_DAYS drop off: they no longer
 * count against any limit.
 */
export function mergeClaims(a: readonly PerkClaim[], b: readonly PerkClaim[], now: Date): PerkClaim[] {
  const cutoff = now.getTime() - LEDGER_KEEP_DAYS * DAY_MS;
  const byCode = new Map<string, PerkClaim>();
  for (const claim of [...a, ...b]) {
    if (Date.parse(claim.claimedAt) < cutoff) continue;
    const seen = byCode.get(claim.code);
    if (!seen) {
      byCode.set(claim.code, claim);
      continue;
    }
    const used = [seen.redeemedAt, claim.redeemedAt].filter((at): at is string => at !== null).sort();
    byCode.set(claim.code, { ...seen, redeemedAt: used[0] ?? null });
  }
  return [...byCode.values()].sort((x, y) => (x.claimedAt < y.claimedAt ? 1 : -1));
}

/** Claims in the ledger the database doesn't have, or has as unused when the ledger says used. */
export function claimsToRestore(saved: readonly PerkClaim[], merged: readonly PerkClaim[]): PerkClaim[] {
  const byCode = new Map(saved.map((claim) => [claim.code, claim]));
  return merged.filter((claim) => {
    const have = byCode.get(claim.code);
    return !have || (claim.redeemedAt !== null && have.redeemedAt === null);
  });
}
