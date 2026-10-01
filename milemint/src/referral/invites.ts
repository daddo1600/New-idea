import { monthlyAllowance } from '@/domain/plan';

import type { ClaimOutcome, InviteCloud } from './cloud';
import { checkRedeem, generateReferralCode, isReferralCode, normalizeReferralCode, type RedeemProblem, type RedeemState } from './code';

/**
 * Single-use invites. Every share makes a new code, published to iCloud as
 * the sharer's (./cloud.ts), and each code works for one friend. A friend's
 * Apple Account can join with one invite, ever, so deleting the app and
 * starting over doesn't earn a second bonus. Pure apart from the cloud,
 * which is passed in, so all of it is unit-tested with a fake.
 */

/** An invite this user has sent. */
export type IssuedInvite = {
  code: string;
  /** ISO time it was made. */
  issuedAt: string;
  /** ISO time it was saved in iCloud; null until iCloud could be reached. */
  publishedAt: string | null;
};

/**
 * A friend's code entered here. `pending` until iCloud confirms the invite
 * (no +10 yet); `granted` once it has (+10 free drives a month).
 */
export type RedeemStatus = 'pending' | 'granted';
export type Redemption = { code: string; at: string; status: RedeemStatus };

/** Why iCloud turned a friend's code down. */
export type ClaimRefusal = 'not-found' | 'used' | 'own' | 'already-claimed';

/** New codes tried when iCloud says one is taken, before keeping the last to publish later. */
export const MAX_ISSUE_TRIES = 8;

/**
 * A pending code iCloud can't find is kept this long before giving up: the
 * friend may have sent it while their own iPhone was offline, so their
 * invite reaches iCloud a little later.
 */
export const NOT_FOUND_GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The message for each refusal, as a redeem problem (shown under the code box). */
export const REFUSAL_PROBLEM: Record<ClaimRefusal, RedeemProblem> = {
  'not-found': 'not-found',
  used: 'used',
  own: 'own',
  'already-claimed': 'claimed-before',
};

/**
 * Makes a new invite: a code this user hasn't used, saved in iCloud as
 * theirs. If iCloud already has the code (someone else's invite), another is
 * made. If iCloud can't be reached it's kept to publish later
 * (publishPending), so sharing always works.
 */
export async function issueInvite({
  issued,
  avoid = [],
  cloud,
  randomBytes,
  now,
}: {
  issued: readonly IssuedInvite[];
  /** Other codes not to reuse (the friend's code this user joined with). */
  avoid?: readonly (string | null)[];
  cloud: Pick<InviteCloud, 'publishInvite'>;
  randomBytes: (n: number) => Uint8Array;
  now: Date;
}): Promise<IssuedInvite> {
  const taken = new Set<string>([...issued.map((invite) => invite.code), ...avoid.filter((c): c is string => !!c)]);
  const issuedAt = now.toISOString();
  let code = '';
  for (let tries = 0; tries < MAX_ISSUE_TRIES; tries++) {
    do code = generateReferralCode(randomBytes);
    while (taken.has(code));
    const published = await cloud.publishInvite(code);
    if (published === 'ok') return { code, issuedAt, publishedAt: issuedAt };
    if (published === 'unavailable') return { code, issuedAt, publishedAt: null };
    // 'exists': someone else's invite has this code. Try another.
    taken.add(code);
  }
  // Astronomically unlikely: keep a fresh code and publish it later.
  do code = generateReferralCode(randomBytes);
  while (taken.has(code));
  return { code, issuedAt, publishedAt: null };
}

/**
 * Publishes the invites made while iCloud was out of reach. One whose code
 * turns out to be someone else's is dropped (it can't be claimed as this
 * user's); `changed` says whether the list needs saving.
 */
export async function publishPending(
  issued: readonly IssuedInvite[],
  cloud: Pick<InviteCloud, 'publishInvite'>,
  now: Date,
): Promise<{ invites: IssuedInvite[]; changed: boolean }> {
  const invites: IssuedInvite[] = [];
  let changed = false;
  for (let i = 0; i < issued.length; i++) {
    const invite = issued[i];
    if (invite.publishedAt) {
      invites.push(invite);
      continue;
    }
    const published = await cloud.publishInvite(invite.code);
    if (published === 'unavailable') {
      // Offline or signed out: the rest would fail too, so keep them for next time.
      invites.push(...issued.slice(i));
      return { invites, changed };
    }
    changed = true;
    if (published === 'ok') invites.push({ ...invite, publishedAt: now.toISOString() });
  }
  return { invites, changed };
}

/** What a pending code comes to: granted, still waiting, or turned down. */
export type ClaimResult = { kind: 'granted' } | { kind: 'pending' } | { kind: 'cleared'; reason: ClaimRefusal };

/**
 * A pending code's fate from iCloud's answer. `redeemedAt`: when it was
 * entered (a missing invite is waited for a few days, NOT_FOUND_GRACE_DAYS).
 */
export function claimResult(outcome: ClaimOutcome, redeemedAt: string | null, now: Date): ClaimResult {
  if (outcome === 'ok') return { kind: 'granted' };
  if (outcome === 'unavailable') return { kind: 'pending' };
  if (outcome === 'not-found') {
    const since = redeemedAt ? now.getTime() - new Date(redeemedAt).getTime() : Number.NaN;
    if (Number.isFinite(since) && since >= 0 && since < NOT_FOUND_GRACE_DAYS * DAY_MS) return { kind: 'pending' };
  }
  return { kind: 'cleared', reason: outcome };
}

/** Sends a pending code to iCloud, once it can be reached. */
export async function submitPendingClaim(
  redemption: Pick<Redemption, 'code' | 'at'>,
  cloud: Pick<InviteCloud, 'claimInvite'>,
  now: Date,
): Promise<ClaimResult> {
  return claimResult(await cloud.claimInvite(redemption.code), redemption.at, now);
}

/**
 * A friend's code typed in: checked here (format, own invite, one per
 * iPhone, 30 days), then claimed in iCloud straight away when it can be.
 * Granted when iCloud says yes; pending (saved, no bonus yet) when iCloud
 * can't be asked now; a problem when either says no.
 */
export async function redeemInvite(
  input: string,
  state: RedeemState,
  cloud: Pick<InviteCloud, 'claimInvite'>,
  now: Date,
): Promise<{ ok: true; redemption: Redemption } | { ok: false; problem: RedeemProblem }> {
  const checked = checkRedeem(input, state, now);
  if (!checked.ok) return checked;
  const at = now.toISOString();
  const outcome = await cloud.claimInvite(checked.code);
  if (outcome === 'ok') return { ok: true, redemption: { code: checked.code, at, status: 'granted' } };
  if (outcome === 'unavailable') return { ok: true, redemption: { code: checked.code, at, status: 'pending' } };
  // Typed just now, so a code iCloud can't find is most likely mistyped: say so at once.
  return { ok: false, problem: REFUSAL_PROBLEM[outcome] };
}

/**
 * The redemption kept in the iPhone's keychain (it survives deleting the
 * app), or null. One saved before invites were checked in iCloud (no
 * status) waits to be confirmed like any other.
 */
export function parseKeptRedemption(json: string | null): Redemption | null {
  try {
    const kept = JSON.parse(json ?? 'null') as { code?: unknown; at?: unknown; status?: unknown } | null;
    const code = typeof kept?.code === 'string' ? normalizeReferralCode(kept.code) : null;
    if (!code) return null;
    const at = typeof kept?.at === 'string' ? kept.at : new Date(0).toISOString();
    return { code, at, status: kept?.status === 'granted' ? 'granted' : 'pending' };
  } catch {
    return null;
  }
}

/**
 * Settings (perhaps restored from a backup) against the keychain (this
 * iPhone, survives reinstalling). The keychain wins for a different code, so
 * reinstalling can't open the box again; for the same code, the further
 * along of the two (granted beats pending).
 */
export function mergeRedemption(fromSettings: Redemption | null, kept: Redemption | null): Redemption | null {
  if (!kept) return fromSettings;
  if (!fromSettings || fromSettings.code !== kept.code) return kept;
  return fromSettings.status === 'granted' ? fromSettings : kept;
}

/** Invites as saved in settings, with anything damaged left out. */
export function cleanInvites(value: unknown): IssuedInvite[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (invite): invite is IssuedInvite =>
      typeof invite === 'object' &&
      invite !== null &&
      typeof invite.code === 'string' &&
      isReferralCode(invite.code) &&
      typeof invite.issuedAt === 'string' &&
      (invite.publishedAt === null || typeof invite.publishedAt === 'string'),
  );
}

/** Free automatic drives a month: a friend's invite counts only once granted, never while pending. */
export function referralAllowance({
  redeemStatus,
  friendsJoined,
}: {
  redeemStatus: RedeemStatus | null;
  friendsJoined: number;
}): number {
  return monthlyAllowance({ redeemed: redeemStatus === 'granted', friendsJoined });
}

/** Friends who joined: never goes down, so a bonus once given stays, even if iCloud answers oddly one day. */
export function nextFriendsJoined(current: number, counted: number | null): number {
  return counted !== null && counted > current ? counted : current;
}
