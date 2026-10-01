import { requireOptionalNativeModule } from 'expo';
import Constants from 'expo-constants';

/**
 * Crediting the sharer, without a server: CloudKit's public database in the
 * app's iCloud container (iCloud.com.milemint.app). A friend who redeemed a
 * code writes one "Referral" record for it; the sharer counts the different
 * iCloud accounts that wrote one for their code. See
 * modules/referral-cloud/README.md for the native design.
 *
 * The native module doesn't exist yet (it needs the iCloud container set up
 * in the Apple Developer portal and `extra.icloudBackup` on), so today every
 * call is a no-op and the count is 0: friends still get their bonus when they
 * redeem, the sharer's arrives once this is switched on.
 */

type ReferralCloudNative = {
  /** Signed in to iCloud, with CloudKit reachable. */
  isAvailable(): Promise<boolean>;
  /** Saves a Referral record { code, createdAt } in the public database. */
  recordReferral(code: string): Promise<void>;
  /** Distinct iCloud accounts (creatorUserRecordID) with a Referral record for `code`. */
  countReferrals(code: string): Promise<number>;
};

/** ios/ReferralCloudModule.swift, once written. Missing everywhere today. */
const native = requireOptionalNativeModule<ReferralCloudNative>('ReferralCloud');

/** Friend side: real automatic drives before their redemption is recorded (keeps out install-and-delete). */
export const DRIVES_BEFORE_RECORDING = 3;

export const ReferralCloud = {
  /** This build can talk to CloudKit: the module is in it and it's signed with the iCloud entitlements. */
  supported: native !== null && Constants.expoConfig?.extra?.icloudBackup === true,

  /**
   * Friend side, called once after the friend has made a few real automatic
   * drives. Resolves to whether the record was saved (false: try again later).
   */
  async recordReferral(code: string): Promise<boolean> {
    if (!native || !ReferralCloud.supported) return false;
    try {
      if (!(await native.isAvailable())) return false;
      await native.recordReferral(code);
      return true;
    } catch {
      return false;
    }
  },

  /** Sharer side: friends who joined with `myCode`, or null when it can't be known right now. */
  async countReferrals(myCode: string): Promise<number | null> {
    if (!native || !ReferralCloud.supported) return null;
    try {
      if (!(await native.isAvailable())) return null;
      const count = await native.countReferrals(myCode);
      return Number.isFinite(count) && count >= 0 ? Math.floor(count) : null;
    } catch {
      return null;
    }
  },
};
