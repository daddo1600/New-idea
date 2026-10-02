import { describe, expect, it } from '@jest/globals';
import { randomBytes } from 'node:crypto';


import type { ClaimOutcome, InviteCloud, PublishOutcome } from '../cloud';
import { canRedeem, checkRedeem, firstInstall, isReferralCode, type RedeemState } from '../code';
import {
  claimResult,
  cleanInvites,
  issueInvite,
  MAX_ISSUE_TRIES,
  mergeRedemption,
  nextFriendsJoined,
  NOT_FOUND_GRACE_DAYS,
  parseKeptRedemption,
  publishPending,
  redeemInvite,
  submitPendingClaim,
  type IssuedInvite,
} from '../invites';

const bytes = (n: number) => new Uint8Array(randomBytes(n));
const NOW = new Date('2026-10-01T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString();

/**
 * CloudKit's public database as modules/referral-cloud/README.md describes
 * it: Invite records named by code (owned by their creator), a
 * "claim-<code>" record per used invite and a "claimer-<user>" record per
 * Apple Account that ever claimed one. One instance is "the cloud"; `as(user)`
 * is one iCloud account's view of it.
 */
class FakeCloudKit {
  invites = new Map<string, string>();
  claims = new Map<string, { claimer: string; qualified: boolean }>();
  claimers = new Set<string>();
  online = true;

  as(user: string): InviteCloud {
    return {
      publishInvite: async (code): Promise<PublishOutcome> => {
        if (!this.online) return 'unavailable';
        const owner = this.invites.get(code);
        if (owner && owner !== user) return 'exists';
        this.invites.set(code, user);
        return 'ok';
      },
      claimInvite: async (code): Promise<ClaimOutcome> => {
        if (!this.online) return 'unavailable';
        const owner = this.invites.get(code);
        if (!owner) return 'not-found';
        if (owner === user) return 'own';
        if (this.claims.has(code)) return 'used';
        if (this.claimers.has(user)) return 'already-claimed';
        this.claims.set(code, { claimer: user, qualified: false });
        this.claimers.add(user);
        return 'ok';
      },
      markQualified: async (code) => {
        const claim = this.claims.get(code);
        if (!this.online || !claim || claim.claimer !== user) return false;
        claim.qualified = true;
        return true;
      },
      countQualifiedClaims: async () => {
        if (!this.online) return null;
        let count = 0;
        for (const [code, owner] of this.invites) {
          const claim = this.claims.get(code);
          if (owner === user && claim?.qualified && claim.claimer !== user) count++;
        }
        return count;
      },
    };
  }
}

const unavailable: InviteCloud = {
  publishInvite: async () => 'unavailable',
  claimInvite: async () => 'unavailable',
  markQualified: async () => false,
  countQualifiedClaims: async () => null,
};

const state = (overrides: Partial<RedeemState> = {}): RedeemState => ({
  myInvites: [],
  redeemedCode: null,
  installedAt: daysAgo(1),
  ...overrides,
});

describe('issuing invites', () => {
  it('makes a new readable code every time, saved in iCloud as the sharer’s', async () => {
    const cloud = new FakeCloudKit();
    const issued: IssuedInvite[] = [];
    for (let i = 0; i < 50; i++) {
      issued.push(await issueInvite({ issued, cloud: cloud.as('alice'), randomBytes: bytes, now: NOW }));
    }
    const codes = issued.map((invite) => invite.code);
    expect(new Set(codes).size).toBe(50);
    expect(codes.every(isReferralCode)).toBe(true);
    expect(issued.every((invite) => invite.publishedAt === NOW.toISOString())).toBe(true);
    expect(codes.every((code) => cloud.invites.get(code) === 'alice')).toBe(true);
  });

  it('makes another code when iCloud already has one (someone else’s invite)', async () => {
    const cloud = new FakeCloudKit();
    const tried: string[] = [];
    const sharer = cloud.as('alice');
    const fake: Pick<InviteCloud, 'publishInvite'> = {
      publishInvite: async (code) => {
        tried.push(code);
        // The first two codes it makes are already taken by Bob.
        if (tried.length <= 2) cloud.invites.set(code, 'bob');
        return sharer.publishInvite(code);
      },
    };
    const invite = await issueInvite({ issued: [], cloud: fake, randomBytes: bytes, now: NOW });
    expect(tried).toHaveLength(3);
    expect(invite.code).toBe(tried[2]);
    expect(invite.publishedAt).not.toBeNull();
    expect(cloud.invites.get(invite.code)).toBe('alice');
    expect(cloud.invites.get(tried[0])).toBe('bob');
  });

  it('never reuses a code the user already sent or joined with', async () => {
    // Random bytes that always make the same code: it's skipped locally before iCloud is asked.
    let call = 0;
    const repeating = (n: number) => new Uint8Array(n).fill(call++ < 4 ? 0 : 7);
    const first = await issueInvite({ issued: [], cloud: unavailable, randomBytes: repeating, now: NOW });
    call = 0;
    const second = await issueInvite({ issued: [first], cloud: unavailable, randomBytes: repeating, now: NOW });
    expect(second.code).not.toBe(first.code);
    call = 0;
    const third = await issueInvite({ issued: [], avoid: [first.code], cloud: unavailable, randomBytes: repeating, now: NOW });
    expect(third.code).not.toBe(first.code);
  });

  it('still shares when iCloud can’t be reached, publishing later', async () => {
    const invite = await issueInvite({ issued: [], cloud: unavailable, randomBytes: bytes, now: NOW });
    expect(isReferralCode(invite.code)).toBe(true);
    expect(invite.publishedAt).toBeNull();

    const cloud = new FakeCloudKit();
    const later = new Date(NOW.getTime() + DAY);
    const result = await publishPending([invite], cloud.as('alice'), later);
    expect(result.changed).toBe(true);
    expect(result.invites).toEqual([{ ...invite, publishedAt: later.toISOString() }]);
    expect(cloud.invites.get(invite.code)).toBe('alice');
  });

  it('gives up after a run of taken codes, keeping a fresh one to publish later', async () => {
    let asked = 0;
    const allTaken: Pick<InviteCloud, 'publishInvite'> = {
      publishInvite: async () => {
        asked++;
        return 'exists';
      },
    };
    const invite = await issueInvite({ issued: [], cloud: allTaken, randomBytes: bytes, now: NOW });
    expect(asked).toBe(MAX_ISSUE_TRIES);
    expect(invite.publishedAt).toBeNull();
  });

  it('publishes waiting invites, drops one that turned out taken, and stops when offline', async () => {
    const cloud = new FakeCloudKit();
    const waiting = (code: string): IssuedInvite => ({ code, issuedAt: daysAgo(2), publishedAt: null });
    const done: IssuedInvite = { code: 'BCDF-234', issuedAt: daysAgo(3), publishedAt: daysAgo(3) };
    cloud.invites.set('CDFG-346', 'bob');
    const result = await publishPending([done, waiting('CDFG-346'), waiting('DFGH-467')], cloud.as('alice'), NOW);
    expect(result.invites.map((invite) => invite.code)).toEqual(['BCDF-234', 'DFGH-467']);
    expect(result.invites[1].publishedAt).toBe(NOW.toISOString());

    cloud.online = false;
    const offline = await publishPending([waiting('FGHJ-678'), waiting('GHJK-789')], cloud.as('alice'), NOW);
    expect(offline.changed).toBe(false);
    expect(offline.invites.map((invite) => invite.publishedAt)).toEqual([null, null]);
  });
});

describe('redeeming a friend’s invite', () => {
  it('is granted at once when iCloud confirms it', async () => {
    const cloud = new FakeCloudKit();
    cloud.invites.set('MNPQ-4X9', 'alice');
    const result = await redeemInvite('mnpq 4x9', state(), cloud.as('bob'), NOW);
    expect(result).toEqual({ ok: true, redemption: { code: 'MNPQ-4X9', at: NOW.toISOString(), status: 'granted' } });
    expect(cloud.claims.get('MNPQ-4X9')).toEqual({ claimer: 'bob', qualified: false });
  });

  it('is saved as pending when iCloud can’t check it', async () => {
    const result = await redeemInvite('MNPQ-4X9', state(), unavailable, NOW);
    expect(result).toEqual({ ok: true, redemption: { code: 'MNPQ-4X9', at: NOW.toISOString(), status: 'pending' } });
  });

  it('says why iCloud turned it down: every outcome', async () => {
    const cloud = new FakeCloudKit();
    cloud.invites.set('MNPQ-4X9', 'alice');
    cloud.invites.set('BCDF-234', 'alice');
    cloud.invites.set('HJKM-PQR', 'bob');

    expect(await redeemInvite('TTTT-777', state(), cloud.as('bob'), NOW)).toEqual({ ok: false, problem: 'not-found' });
    // Bob's own invite, typed on a phone that doesn't remember sending it (a new iPhone).
    expect(await redeemInvite('HJKM-PQR', state(), cloud.as('bob'), NOW)).toEqual({ ok: false, problem: 'own' });
    expect((await redeemInvite('MNPQ-4X9', state(), cloud.as('bob'), NOW)).ok).toBe(true);
    // The same invite again, by Carol: each works once.
    expect(await redeemInvite('MNPQ-4X9', state(), cloud.as('carol'), NOW)).toEqual({ ok: false, problem: 'used' });
    // Bob, after deleting the app (nothing on the phone), tries another of Alice's invites.
    expect(await redeemInvite('BCDF-234', state(), cloud.as('bob'), NOW)).toEqual({
      ok: false,
      problem: 'claimed-before',
    });
    expect(cloud.claims.has('BCDF-234')).toBe(false);
  });

  it('refuses the user’s own invite without asking iCloud', async () => {
    let asked = false;
    const cloud: Pick<InviteCloud, 'claimInvite'> = {
      claimInvite: async () => {
        asked = true;
        return 'ok';
      },
    };
    expect(await redeemInvite('TRVB-7K2', state({ myInvites: ['TRVB-7K2'] }), cloud, NOW)).toEqual({
      ok: false,
      problem: 'own',
    });
    expect(asked).toBe(false);
  });

  it('checks the phone first: format, one per iPhone, 30 days', async () => {
    expect(await redeemInvite('HELLO', state(), unavailable, NOW)).toEqual({ ok: false, problem: 'format' });
    expect(await redeemInvite('MNPQ-4X9', state({ redeemedCode: 'BCDF-234' }), unavailable, NOW)).toEqual({
      ok: false,
      problem: 'already',
    });
    expect(await redeemInvite('MNPQ-4X9', state({ installedAt: daysAgo(31) }), unavailable, NOW)).toEqual({
      ok: false,
      problem: 'expired',
    });
  });
});

describe('a pending code', () => {
  const pending = { code: 'MNPQ-4X9', at: daysAgo(2) };

  it('stays pending while iCloud is out of reach', async () => {
    expect(await submitPendingClaim(pending, unavailable, NOW)).toEqual({ kind: 'pending' });
  });

  it('is granted once iCloud confirms it', async () => {
    const cloud = new FakeCloudKit();
    cloud.invites.set('MNPQ-4X9', 'alice');
    cloud.online = false;
    expect(await submitPendingClaim(pending, cloud.as('bob'), NOW)).toEqual({ kind: 'pending' });
    cloud.online = true;
    expect(await submitPendingClaim(pending, cloud.as('bob'), NOW)).toEqual({ kind: 'granted' });
  });

  it('is cleared, with the reason, when the invite was used, is their own, or they already joined', async () => {
    const cloud = new FakeCloudKit();
    cloud.invites.set('MNPQ-4X9', 'alice');
    cloud.invites.set('BCDF-234', 'bob');
    cloud.claims.set('MNPQ-4X9', { claimer: 'carol', qualified: false });
    expect(await submitPendingClaim(pending, cloud.as('bob'), NOW)).toEqual({ kind: 'cleared', reason: 'used' });
    expect(await submitPendingClaim({ code: 'BCDF-234', at: daysAgo(1) }, cloud.as('bob'), NOW)).toEqual({
      kind: 'cleared',
      reason: 'own',
    });
    cloud.invites.set('CDFG-346', 'alice');
    cloud.claimers.add('dan');
    expect(await submitPendingClaim({ code: 'CDFG-346', at: daysAgo(1) }, cloud.as('dan'), NOW)).toEqual({
      kind: 'cleared',
      reason: 'already-claimed',
    });
  });

  it('waits a few days for an invite iCloud hasn’t seen yet, then gives up', () => {
    expect(claimResult('not-found', daysAgo(1), NOW)).toEqual({ kind: 'pending' });
    expect(claimResult('not-found', daysAgo(NOT_FOUND_GRACE_DAYS), NOW)).toEqual({
      kind: 'cleared',
      reason: 'not-found',
    });
    expect(claimResult('not-found', null, NOW)).toEqual({ kind: 'cleared', reason: 'not-found' });
    // A date in the future (the clock moved) doesn't keep it waiting for ever.
    expect(claimResult('not-found', '2027-01-01T00:00:00Z', NOW)).toEqual({ kind: 'cleared', reason: 'not-found' });
  });

  it('maps every iCloud answer', () => {
    expect(claimResult('ok', daysAgo(1), NOW)).toEqual({ kind: 'granted' });
    expect(claimResult('unavailable', daysAgo(100), NOW)).toEqual({ kind: 'pending' });
    expect(claimResult('used', daysAgo(1), NOW)).toEqual({ kind: 'cleared', reason: 'used' });
    expect(claimResult('own', daysAgo(1), NOW)).toEqual({ kind: 'cleared', reason: 'own' });
    expect(claimResult('already-claimed', daysAgo(1), NOW)).toEqual({ kind: 'cleared', reason: 'already-claimed' });
  });

  it('opens the box again once cleared, inside the 30 days only', () => {
    // Cleared: no code saved any more.
    expect(canRedeem(state({ redeemedCode: null }), NOW)).toBe(true);
    expect(canRedeem(state({ redeemedCode: null, installedAt: daysAgo(31) }), NOW)).toBe(false);
    // While pending, it can't be swapped for another.
    expect(canRedeem(state({ redeemedCode: 'MNPQ-4X9' }), NOW)).toBe(false);
  });
});

describe('deleting the app and starting over', () => {
  it('brings back a granted code from the keychain, so the box stays shut', () => {
    const kept = parseKeptRedemption(JSON.stringify({ code: 'MNPQ-4X9', at: daysAgo(5), status: 'granted' }));
    expect(kept).toEqual({ code: 'MNPQ-4X9', at: daysAgo(5), status: 'granted' });
    // A fresh install has nothing in settings.
    const restored = mergeRedemption(null, kept);
    expect(restored?.status).toBe('granted');
    const after = state({ redeemedCode: restored?.code ?? null });
    expect(canRedeem(after, NOW)).toBe(false);
    expect(checkRedeem('BCDF-234', after, NOW)).toEqual({ ok: false, problem: 'already' });
  });

  it('keeps a pending code pending (it still has to be confirmed)', () => {
    const kept = parseKeptRedemption(JSON.stringify({ code: 'MNPQ-4X9', at: daysAgo(5), status: 'pending' }));
    expect(mergeRedemption(null, kept)?.status).toBe('pending');
    // One kept before invites were checked in iCloud has no status: pending too.
    expect(parseKeptRedemption(JSON.stringify({ code: 'mnpq-4x9', at: daysAgo(5) }))?.status).toBe('pending');
    expect(parseKeptRedemption('not json')).toBeNull();
    expect(parseKeptRedemption(JSON.stringify({ code: 'nonsense' }))).toBeNull();
    expect(parseKeptRedemption(null)).toBeNull();
  });

  it('lets the keychain win over settings, but never downgrades the same code', () => {
    const granted = { code: 'MNPQ-4X9', at: daysAgo(5), status: 'granted' as const };
    const pending = { ...granted, status: 'pending' as const };
    expect(mergeRedemption(granted, pending)).toEqual(granted);
    expect(mergeRedemption(pending, granted)).toEqual(granted);
    const other = { code: 'BCDF-234', at: daysAgo(1), status: 'pending' as const };
    expect(mergeRedemption(other, granted)).toEqual(granted);
    expect(mergeRedemption(other, null)).toEqual(other);
  });

  it('keeps the first install date, so the 30 days don’t start again', () => {
    const first = daysAgo(40);
    const reinstalled = NOW.toISOString();
    const installedAt = firstInstall(reinstalled, first, NOW);
    expect(installedAt).toBe(first);
    expect(canRedeem(state({ installedAt }), NOW)).toBe(false);
    expect(firstInstall(null, null, NOW)).toBe(NOW.toISOString());
    expect(firstInstall(daysAgo(3), null, NOW)).toBe(daysAgo(3));
  });

  it('can’t claim a second invite with the same Apple Account, whatever the phone', async () => {
    const cloud = new FakeCloudKit();
    cloud.invites.set('MNPQ-4X9', 'alice');
    cloud.invites.set('BCDF-234', 'alice');
    expect((await redeemInvite('MNPQ-4X9', state(), cloud.as('bob'), NOW)).ok).toBe(true);
    // Reinstalled with the keychain wiped (a new iPhone): the phone allows it, iCloud doesn't.
    expect(await redeemInvite('BCDF-234', state(), cloud.as('bob'), NOW)).toEqual({
      ok: false,
      problem: 'claimed-before',
    });
  });
});

describe('the sharer’s count', () => {
  it('counts claims of their invites once the friend has made real drives', async () => {
    const cloud = new FakeCloudKit();
    const alice = cloud.as('alice');
    const sent: IssuedInvite[] = [];
    for (let i = 0; i < 3; i++) sent.push(await issueInvite({ issued: sent, cloud: alice, randomBytes: bytes, now: NOW }));
    await cloud.as('bob').claimInvite(sent[0].code);
    await cloud.as('carol').claimInvite(sent[1].code);
    expect(await alice.countQualifiedClaims()).toBe(0);
    expect(await cloud.as('bob').markQualified(sent[0].code)).toBe(true);
    // Only the claimer can mark their own claim.
    expect(await cloud.as('alice').markQualified(sent[1].code)).toBe(false);
    expect(await alice.countQualifiedClaims()).toBe(1);
    expect(await cloud.as('carol').markQualified(sent[1].code)).toBe(true);
    expect(await alice.countQualifiedClaims()).toBe(2);
  });

  it('never goes down', () => {
    expect(nextFriendsJoined(3, 5)).toBe(5);
    expect(nextFriendsJoined(3, 1)).toBe(3);
    expect(nextFriendsJoined(3, null)).toBe(3);
  });
});

describe('saved invites', () => {
  it('leaves out damaged entries', () => {
    const good = { code: 'BCDF-234', issuedAt: daysAgo(1), publishedAt: null };
    expect(cleanInvites([good, { code: 'nope', issuedAt: 'x', publishedAt: null }, null, 3])).toEqual([good]);
    expect(cleanInvites('nonsense')).toEqual([]);
  });
});
