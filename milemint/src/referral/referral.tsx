import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, AppState, Platform, Share } from 'react-native';

import { loadSettings, updateSettings, type AppSettings } from '@/db/settings-repo';
import { msg, t } from '@/i18n/i18n';

import { DRIVES_BEFORE_RECORDING, ReferralCloud } from './cloud';
import { canRedeem as canRedeemNow, firstInstall, type RedeemProblem } from './code';
import {
  issueInvite,
  mergeRedemption,
  nextFriendsJoined,
  parseKeptRedemption,
  publishPending,
  redeemInvite,
  referralAllowance,
  submitPendingClaim,
  type ClaimRefusal,
  type ClaimResult,
  type Redemption,
  type RedeemStatus,
} from './invites';
import { inviteText, withInvite } from './links';

/**
 * Referrals with single-use invites. Every share makes a new code
 * (./invites.ts), published to iCloud as this user's; a new user who enters
 * one gets 10 extra free automatic drives a month once iCloud confirms it,
 * and so does the sharer once that friend has made 3 real drives: for every
 * friend, with no cap. One invite per Apple Account, ever, so deleting the
 * app and starting over earns nothing. Everything is kept in settings (so
 * it's in the iCloud backup). iCloud (./cloud.ts) is off until the container
 * is set up; until then invites wait to be published and a friend's code
 * waits, pending, without its bonus.
 */

/**
 * Also kept in the iPhone's keychain, which survives deleting the app: a
 * friend's code (and whether it was confirmed) can't be entered again by
 * reinstalling, and nor can the 30 days be restarted.
 */
const REDEEMED_KEY = 'milemint.referral-redeemed';
const INSTALLED_KEY = 'milemint.installed-at';
/** The permanent personal code from before single-use invites, cleared out. */
const OLD_CODE_KEY = 'milemint.referral-code';
const useKeychain = Platform.OS !== 'web';
/** CloudKit is asked for the sharer's count at most this often. */
const COUNT_EVERY_MS = 60 * 60 * 1000;

/** Why a pending code was turned down, as a whole sentence. */
export const REFUSAL_MESSAGES: Record<ClaimRefusal, string> = {
  'not-found': msg('We couldn’t find that invite. Check the code with your friend.'),
  used: msg('That invite has already been used. Ask your friend to send you a new one.'),
  own: msg('That’s one of your own invites. Send it to a friend instead.'),
  'already-claimed': msg('This Apple Account has already joined with a friend’s invite.'),
};

export type RedeemResult = { ok: true; status: RedeemStatus } | { ok: false; problem: RedeemProblem };

type Referral = {
  /** Settings have been read. */
  loaded: boolean;
  /** Invites this user has sent. */
  invitesSent: number;
  /** The friend's code this user entered (pending or granted). */
  redeemedCode: string | null;
  /** Whether that code has been confirmed in iCloud (only 'granted' earns the +10). */
  redeemStatus: RedeemStatus | null;
  /** Why iCloud last turned a pending code down, until another is entered. */
  redeemRefusal: ClaimRefusal | null;
  /** Friends who joined with this user's invites (0 until iCloud counts them). */
  friendsJoined: number;
  /** This build can check invites and count friends (CloudKit is switched on). */
  counting: boolean;
  /** Free automatic drives a month, with every referral bonus. */
  allowance: number;
  /** A friend's code can still be entered (none yet, within 30 days of install). */
  canRedeem: boolean;
  /** Redeems a friend's code: granted, pending, or why not. */
  redeem: (input: string) => Promise<RedeemResult>;
  /** Makes a new single-use invite and opens the share sheet with it. `message`: already translated. */
  shareInvite: (message?: string) => Promise<void>;
  /** An invite is being made. */
  sharing: boolean;
  /** Re-reads the settings, after restoring a backup replaced them. */
  reload: () => Promise<void>;
};

type Saved = Pick<
  AppSettings,
  'invites' | 'redeemedCode' | 'redeemedAt' | 'redeemStatus' | 'redeemRefusal' | 'qualifiedAt' | 'friendsJoined' | 'installedAt'
>;

const EMPTY: Saved = {
  invites: [],
  redeemedCode: null,
  redeemedAt: null,
  redeemStatus: null,
  redeemRefusal: null,
  qualifiedAt: null,
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

function keychainDelete(key: string): void {
  if (useKeychain) SecureStore.deleteItemAsync(key).catch(() => {});
}

const keepRedemption = (redemption: Redemption) => keychainSet(REDEEMED_KEY, JSON.stringify(redemption));

const pickSaved = (settings: AppSettings): Saved => ({
  invites: settings.invites,
  redeemedCode: settings.redeemedCode,
  redeemedAt: settings.redeemedAt,
  redeemStatus: settings.redeemStatus,
  redeemRefusal: settings.redeemRefusal,
  qualifiedAt: settings.qualifiedAt,
  friendsJoined: settings.friendsJoined,
  installedAt: settings.installedAt,
});

const redemptionOf = (saved: Saved): Redemption | null =>
  saved.redeemedCode
    ? { code: saved.redeemedCode, at: saved.redeemedAt ?? new Date().toISOString(), status: saved.redeemStatus ?? 'pending' }
    : null;

const redeemState = (saved: Saved) => ({
  myInvites: saved.invites.map((invite) => invite.code),
  redeemedCode: saved.redeemedCode,
  installedAt: saved.installedAt,
});

/** Reads the referral settings, squaring them with what this iPhone's keychain remembers. */
async function prepare(db: SQLiteDatabase): Promise<Saved> {
  const settings = await loadSettings(db);
  const changes: Partial<AppSettings> = {};
  const keptInstall = await keychainGet(INSTALLED_KEY);
  const installedAt = firstInstall(settings.installedAt, keptInstall, new Date());
  if (installedAt !== settings.installedAt) changes.installedAt = installedAt;
  const kept = parseKeptRedemption(await keychainGet(REDEEMED_KEY));
  const current = redemptionOf(pickSaved(settings));
  const merged = mergeRedemption(current, kept);
  if (merged && (merged.code !== current?.code || merged.status !== current?.status)) {
    changes.redeemedCode = merged.code;
    changes.redeemedAt = merged.at;
    changes.redeemStatus = merged.status;
  }
  const next = { ...settings, ...changes };
  if (Object.keys(changes).length > 0) await updateSettings(db, changes);
  if (installedAt !== keptInstall) keychainSet(INSTALLED_KEY, installedAt);
  if (merged && (merged.code !== kept?.code || merged.status !== kept?.status)) keepRedemption(merged);
  if (await keychainGet(OLD_CODE_KEY)) keychainDelete(OLD_CODE_KEY);
  return pickSaved(next);
}

const ReferralContext = createContext<Referral | null>(null);

export function ReferralProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const lastCount = useRef(0);
  /** Referral changes run one at a time, each on the latest settings, so none overwrites another. */
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const apply = useCallback((next: Saved) => {
    setSaved(next);
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

  /** Runs `change` on the current referral settings and saves what it returns. */
  const mutate = useCallback(
    <R,>(change: (current: Saved) => Promise<{ changes: Partial<Saved>; result: R }>): Promise<R> => {
      const run = queue.current.then(async () => {
        const { changes, result } = await change(pickSaved(await loadSettings(db)));
        if (Object.keys(changes).length > 0) {
          const next = await updateSettings(db, changes);
          setSaved(pickSaved(next));
        }
        return result;
      });
      queue.current = run.catch(() => {});
      return run;
    },
    [db],
  );

  // CloudKit, once it's on: publish waiting invites, check a pending code,
  // credit the friend who invited us, and count the friends who joined.
  const syncCloud = useCallback(async () => {
    if (!ReferralCloud.supported || !loaded) return;
    const now = new Date();
    await mutate(async (current) => {
      const published = await publishPending(current.invites, ReferralCloud, now);
      return { changes: published.changed ? { invites: published.invites } : {}, result: null };
    });

    const settled = await mutate<ClaimResult | null>(async (current) => {
      const pending = redemptionOf(current);
      if (!pending || pending.status !== 'pending') return { changes: {}, result: null };
      const result = await submitPendingClaim(pending, ReferralCloud, now);
      if (result.kind === 'granted') {
        keepRedemption({ ...pending, status: 'granted' });
        return { changes: { redeemStatus: 'granted', redeemRefusal: null }, result };
      }
      if (result.kind === 'cleared') {
        // Turned down: the box opens again (within the 30 days) for another friend's code.
        keychainDelete(REDEEMED_KEY);
        return {
          changes: { redeemedCode: null, redeemedAt: null, redeemStatus: null, redeemRefusal: result.reason },
          result,
        };
      }
      return { changes: {}, result: null };
    });
    if (settled?.kind === 'granted') {
      Alert.alert(t('🎉 Your friend’s invite is confirmed'), t('You get 10 extra free drives every month.'));
    } else if (settled?.kind === 'cleared') {
      Alert.alert(t('Your friend’s invite couldn’t be used'), t(REFUSAL_MESSAGES[settled.reason]));
    }

    await mutate(async (current) => {
      if (current.redeemStatus !== 'granted' || !current.redeemedCode || current.qualifiedAt) {
        return { changes: {}, result: null };
      }
      // Only after a few real drives, so installing and deleting doesn't count for the sharer.
      const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM trips WHERE source = 'auto';");
      if ((row?.n ?? 0) < DRIVES_BEFORE_RECORDING || !(await ReferralCloud.markQualified(current.redeemedCode))) {
        return { changes: {}, result: null };
      }
      return { changes: { qualifiedAt: new Date().toISOString() }, result: null };
    });

    if (Date.now() - lastCount.current > COUNT_EVERY_MS) {
      lastCount.current = Date.now();
      const counted = await ReferralCloud.countQualifiedClaims();
      await mutate(async (current) => {
        const friendsJoined = nextFriendsJoined(current.friendsJoined, counted);
        return { changes: friendsJoined !== current.friendsJoined ? { friendsJoined } : {}, result: null };
      });
    }
  }, [db, loaded, mutate]);

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
    (input: string): Promise<RedeemResult> =>
      mutate<RedeemResult>(async (current) => {
        const result = await redeemInvite(input, redeemState(current), ReferralCloud, new Date());
        if (!result.ok) return { changes: {}, result };
        keepRedemption(result.redemption);
        return {
          changes: {
            redeemedCode: result.redemption.code,
            redeemedAt: result.redemption.at,
            redeemStatus: result.redemption.status,
            redeemRefusal: null,
          },
          result: { ok: true, status: result.redemption.status },
        };
      }),
    [mutate],
  );

  const shareInvite = useCallback(
    async (message?: string) => {
      setSharing(true);
      try {
        const invite = await mutate(async (current) => {
          const made = await issueInvite({
            issued: current.invites,
            avoid: [current.redeemedCode],
            cloud: ReferralCloud,
            randomBytes: Crypto.getRandomBytes,
            now: new Date(),
          });
          return { changes: { invites: [...current.invites, made] }, result: made };
        });
        setSharing(false);
        const shared = await Share.share({ message: withInvite(message ?? inviteText(), invite.code) }).catch(
          () => null,
        );
        // Closed without sending: it isn't an invite sent (the code is simply never used).
        if (!shared || shared.action === Share.dismissedAction) {
          await mutate(async (current) => ({
            changes: { invites: current.invites.filter((sent) => sent.code !== invite.code) },
            result: null,
          }));
        }
      } finally {
        setSharing(false);
      }
    },
    [mutate],
  );

  const value = useMemo<Referral>(
    () => ({
      loaded,
      invitesSent: saved.invites.length,
      redeemedCode: saved.redeemedCode,
      redeemStatus: saved.redeemStatus,
      redeemRefusal: saved.redeemRefusal,
      friendsJoined: saved.friendsJoined,
      counting: ReferralCloud.supported,
      // A pending code earns nothing until iCloud confirms it.
      allowance: referralAllowance(saved),
      canRedeem: loaded && canRedeemNow(redeemState(saved), new Date()),
      redeem,
      shareInvite,
      sharing,
      reload,
    }),
    [loaded, saved, redeem, shareInvite, sharing, reload],
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
