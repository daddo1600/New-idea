import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';

/**
 * Single-use invites, without a server: CloudKit's public database in the
 * app's iCloud container (iCloud.com.milemint.app). See
 * modules/referral-cloud/README.md for the record types and the native side.
 *
 * - The sharer's app publishes an `Invite` record named after each new code.
 * - A friend's app claims it: a `claim-<code>` record (so each invite works
 *   once) and a `claimer-<iCloud user>` record (so each Apple Account claims
 *   one invite, ever, whatever phone or reinstall).
 * - After 3 real automatic drives the friend's app marks its claim qualified;
 *   the sharer counts their qualified claims.
 *
 * The native module doesn't exist yet (it needs the iCloud container set up
 * in the Apple Developer portal and `extra.icloudBackup` on), so today every
 * call answers "unavailable": invites are kept to publish later, and a
 * friend's code waits, pending, until it can be checked.
 */

/** What claiming an invite can come to. */
export type ClaimOutcome =
  /** Claimed: the friend gets their +10. */
  | 'ok'
  /** No invite with that code. */
  | 'not-found'
  /** Someone else already claimed it. */
  | 'used'
  /** The claimer's own invite (same iCloud account). */
  | 'own'
  /** This iCloud account has already claimed an invite. */
  | 'already-claimed'
  /** Can't check now: no module, signed out of iCloud, offline. */
  | 'unavailable';

/** Publishing a new invite: saved, the code is taken (make another), or not now. */
export type PublishOutcome = 'ok' | 'exists' | 'unavailable';

/** The cloud as the invite logic sees it, so tests can pass a fake. */
export type InviteCloud = {
  publishInvite(code: string): Promise<PublishOutcome>;
  claimInvite(code: string): Promise<ClaimOutcome>;
  /** Friend side, after 3 real automatic drives: whether it was saved. */
  markQualified(code: string): Promise<boolean>;
  /** Sharer side: qualified claims across every invite they published, or null when unknown now. */
  countQualifiedClaims(): Promise<number | null>;
};

type ReferralCloudNative = {
  /** Signed in to iCloud, with CloudKit reachable. */
  isAvailable(): Promise<boolean>;
  /** Creates Invite record `code`: 'ok' (also when it's already this account's), 'exists' (someone else's). */
  publishInvite(code: string): Promise<string>;
  /** Claims invite `code`; resolves to one of the ClaimOutcome values other than 'unavailable'. */
  claimInvite(code: string): Promise<string>;
  /** Sets `qualified` on this account's claim of `code`. */
  markQualified(code: string): Promise<void>;
  /** Claims marked qualified, across every Invite this account created (not its own). */
  countQualifiedClaims(): Promise<number>;
};

/** ios/ReferralCloudModule.swift, once written. Missing everywhere today. */
const native = requireOptionalNativeModule<ReferralCloudNative>('ReferralCloud');

/** Friend side: real automatic drives before a claim counts for the sharer (keeps out install-and-delete). */
export const DRIVES_BEFORE_RECORDING = 3;

const CLAIM_OUTCOMES: readonly ClaimOutcome[] = ['ok', 'not-found', 'used', 'own', 'already-claimed'];

/** This build can talk to CloudKit: the module is in it and it's signed with the iCloud entitlements. */
const supported = native !== null && Constants.expoConfig?.extra?.icloudBackup === true;

/** The native module, when this build has it and iCloud is signed in. */
async function ready(): Promise<ReferralCloudNative | null> {
  if (!native || !supported) return null;
  try {
    return (await native.isAvailable()) ? native : null;
  } catch {
    return null;
  }
}

export const ReferralCloud: InviteCloud & { supported: boolean } = {
  supported,

  async publishInvite(code) {
    const cloud = await ready();
    if (!cloud) return 'unavailable';
    try {
      const result = await cloud.publishInvite(code);
      return result === 'ok' || result === 'exists' ? result : 'unavailable';
    } catch {
      return 'unavailable';
    }
  },

  async claimInvite(code) {
    const cloud = await ready();
    if (!cloud) return 'unavailable';
    try {
      const result = (await cloud.claimInvite(code)) as ClaimOutcome;
      return CLAIM_OUTCOMES.includes(result) ? result : 'unavailable';
    } catch {
      return 'unavailable';
    }
  },

  async markQualified(code) {
    const cloud = await ready();
    if (!cloud) return false;
    try {
      await cloud.markQualified(code);
      return true;
    } catch {
      return false;
    }
  },

  async countQualifiedClaims() {
    const cloud = await ready();
    if (!cloud) return null;
    try {
      const count = await cloud.countQualifiedClaims();
      return Number.isFinite(count) && count >= 0 ? Math.floor(count) : null;
    } catch {
      return null;
    }
  },
};
