import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { loadSettings, saveSettings, type AppSettings } from '@/db/settings-repo';
import { monthlyAllowance } from '@/domain/plan';

import { DRIVES_BEFORE_RECORDING, ReferralCloud } from './cloud';
import {
  canRedeem as canRedeemNow,
  checkRedeem,
  generateReferralCode,
  isReferralCode,
  normalizeReferralCode,
  type RedeemProblem,
} from './code';
import { setShareCode } from './links';

/**
 * Referrals, Dropbox style: every user has a code; a new user who enters a
 * friend's code gets 10 extra free automatic drives a month, and so does the
 * friend, for every friend, with no cap. Everything is kept in settings (so
 * it's in the iCloud backup). The sharer's side is counted in CloudKit (see
 * ./cloud.ts), which is off until the iCloud container is set up; until then
 * friendsJoined stays 0.
 */

/**
 * Also kept in the iPhone's keychain, which survives deleting the app: the
 * same code after a reinstall, and a friend's code can't be redeemed twice by
 * reinstalling.
 */
const CODE_KEY = 'milemint.referral-code';
const REDEEMED_KEY = 'milemint.referral-redeemed';
const useKeychain = Platform.OS !== 'web';
/** CloudKit is asked for the sharer's count at most this often. */
const COUNT_EVERY_MS = 60 * 60 * 1000;

type Referral = {
  /** Settings have been read. */
  loaded: boolean;
  /** This user's own code. */
  code: string | null;
  /** The friend's code this user joined with. */
  redeemedCode: string | null;
  /** Friends who joined with this user's code (0 until iCloud counts them). */
  friendsJoined: number;
  /** This build can count friends who joined (CloudKit is switched on). */
  counting: boolean;
  /** Free automatic drives a month, with every referral bonus. */
  allowance: number;
  /** A friend's code can still be entered (none yet, within 30 days of install). */
  canRedeem: boolean;
  /** Redeems a friend's code: null when it worked, otherwise why not. */
  redeem: (input: string) => Promise<RedeemProblem | null>;
  /** Re-reads the settings, after restoring a backup replaced them. */
  reload: () => Promise<void>;
};

type Saved = Pick<
  AppSettings,
  'referralCode' | 'redeemedCode' | 'redeemedAt' | 'referralRecordedAt' | 'friendsJoined' | 'installedAt'
>;

const EMPTY: Saved = {
  referralCode: null,
  redeemedCode: null,
  redeemedAt: null,
  referralRecordedAt: null,
  friendsJoined: 0,
  installedAt: null,
};

async function keychainGet(key: string): Promise<string | null> {
  if (!useKeychain) return null;
  return SecureStore.getItemAsync(key).catch(() => null);
}

function keychainSet(key: string, value: string): void {
  if (useKeychain) SecureStore.setItemAsync(key, value).catch(() => {});
}

const pickSaved = (settings: AppSettings): Saved => ({
  referralCode: settings.referralCode,
  redeemedCode: settings.redeemedCode,
  redeemedAt: settings.redeemedAt,
  referralRecordedAt: settings.referralRecordedAt,
  friendsJoined: settings.friendsJoined,
  installedAt: settings.installedAt,
});

/** Reads the referral settings, making the user's code (and noting the install date) the first time. */
async function prepare(db: SQLiteDatabase): Promise<Saved> {
  const settings = await loadSettings(db);
  const changes: Partial<AppSettings> = {};
  if (!settings.installedAt) changes.installedAt = new Date().toISOString();
  if (!settings.referralCode || !isReferralCode(settings.referralCode)) {
    const kept = await keychainGet(CODE_KEY);
    changes.referralCode = kept && isReferralCode(kept) ? kept : generateReferralCode(Crypto.getRandomBytes);
  }
  if (!settings.redeemedCode) {
    try {
      const kept = JSON.parse((await keychainGet(REDEEMED_KEY)) ?? 'null') as { code?: string; at?: string } | null;
      const code = kept?.code ? normalizeReferralCode(kept.code) : null;
      if (code) {
        changes.redeemedCode = code;
        changes.redeemedAt = kept?.at ?? new Date().toISOString();
      }
    } catch {
      // Nothing usable kept.
    }
  }
  const next = { ...settings, ...changes };
  if (Object.keys(changes).length > 0) await saveSettings(db, { ...(await loadSettings(db)), ...changes });
  // A restored backup brings its own code: keep the keychain in step with it.
  if (next.referralCode) keychainSet(CODE_KEY, next.referralCode);
  return pickSaved(next);
}

const ReferralContext = createContext<Referral | null>(null);

export function ReferralProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const lastCount = useRef(0);

  const apply = useCallback((next: Saved) => {
    setSaved(next);
    setShareCode(next.referralCode);
    setLoaded(true);
  }, []);

  const reload = useCallback(async () => apply(await prepare(db)), [db, apply]);

  useEffect(() => {
    let cancelled = false;
    prepare(db).then(
      (next) => !cancelled && apply(next),
      () => !cancelled && setLoaded(true),
    );
    return () => {
      cancelled = true;
    };
  }, [db, apply]);

  const update = useCallback(
    async (changes: Partial<Saved>) => {
      setSaved((current) => ({ ...current, ...changes }));
      await saveSettings(db, { ...(await loadSettings(db)), ...changes });
    },
    [db],
  );

  // CloudKit, once it's on: credit the friend who shared the code, and count the friends who used ours.
  const syncCloud = useCallback(async () => {
    if (!ReferralCloud.supported || !loaded) return;
    if (saved.redeemedCode && !saved.referralRecordedAt) {
      // Only after a few real drives, so installing and deleting doesn't count.
      const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM trips WHERE source = 'auto';");
      if ((row?.n ?? 0) >= DRIVES_BEFORE_RECORDING && (await ReferralCloud.recordReferral(saved.redeemedCode))) {
        await update({ referralRecordedAt: new Date().toISOString() });
      }
    }
    if (saved.referralCode && Date.now() - lastCount.current > COUNT_EVERY_MS) {
      lastCount.current = Date.now();
      const count = await ReferralCloud.countReferrals(saved.referralCode);
      // Never goes down: a bonus once given stays, even if iCloud answers oddly one day.
      if (count !== null && count > saved.friendsJoined) await update({ friendsJoined: count });
    }
  }, [db, loaded, saved, update]);

  useEffect(() => {
    if (!ReferralCloud.supported) return;
    // Deferred so it runs after this render, not inside it.
    const initial = setTimeout(() => syncCloud().catch(() => {}), 0);
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncCloud().catch(() => {});
    });
    return () => {
      clearTimeout(initial);
      foreground.remove();
    };
  }, [syncCloud]);

  const redeem = useCallback(
    async (input: string): Promise<RedeemProblem | null> => {
      const result = checkRedeem(
        input,
        { myCode: saved.referralCode, redeemedCode: saved.redeemedCode, installedAt: saved.installedAt },
        new Date(),
      );
      if (!result.ok) return result.problem;
      const redeemedAt = new Date().toISOString();
      keychainSet(REDEEMED_KEY, JSON.stringify({ code: result.code, at: redeemedAt }));
      await update({ redeemedCode: result.code, redeemedAt });
      return null;
    },
    [saved, update],
  );

  const value = useMemo<Referral>(
    () => ({
      loaded,
      code: saved.referralCode,
      redeemedCode: saved.redeemedCode,
      friendsJoined: saved.friendsJoined,
      counting: ReferralCloud.supported,
      allowance: monthlyAllowance({ redeemed: saved.redeemedCode !== null, friendsJoined: saved.friendsJoined }),
      canRedeem:
        loaded &&
        canRedeemNow(
          { myCode: saved.referralCode, redeemedCode: saved.redeemedCode, installedAt: saved.installedAt },
          new Date(),
        ),
      redeem,
      reload,
    }),
    [loaded, saved, redeem, reload],
  );

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export function useReferral(): Referral {
  const referral = useContext(ReferralContext);
  if (!referral) throw new Error('useReferral must be used inside <ReferralProvider>');
  return referral;
}

/** Free automatic drives a month for this user, with their referral bonuses. */
export const useAllowance = (): number => useReferral().allowance;
