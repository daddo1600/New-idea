import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, AppState, Platform, Share } from 'react-native';

import { loadSettings, updateSettings, type AppSettings } from '@/db/settings-repo';
import { DEMO_FRIENDS, DEMO_GIFT, DEMO_TESTER } from '@/dev/demo';
import { earnedPerks, foundingBoost, friendGiftOpen, nextPerk, type Perk } from '@/domain/plan';
import { msg, t } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import { rememberGoldLeaves } from '@/region/remembered-region';

import { installSignals } from '../../modules/install-source';

import { DRIVES_BEFORE_RECORDING, ReferralCloud } from './cloud';
import { canRedeem as canRedeemNow, firstInstall, type RedeemProblem } from './code';
import { foundingTesterOpen, foundingTesterPerks, isTestFlight, withFoundingBadge } from './founding-tester';
import {
  issueInvite,
  mergeRedemption,
  nextFriendsJoined,
  parseKeptRedemption,
  publishPending,
  redeemInvite,
  submitPendingClaim,
  type ClaimRefusal,
  type ClaimResult,
  type Redemption,
  type RedeemStatus,
} from './invites';
import { inviteText, offerCode, withInvite } from './links';
import { PERK_NAMES } from './perks';

/**
 * Referrals with single-use invites. Every share makes a new code
 * (./invites.ts), published to iCloud as this user's. A new user who enters
 * one gets the friend's gift (50% off their first year of Pro, through an
 * App Store offer code, once FRIEND_OFFER_CODE is set), and the sharer is
 * credited once that friend has made 3 real drives: friends climb the perk
 * ladder (domain/plan). One invite per Apple Account, ever, so deleting the
 * app and starting over earns nothing. Everything is kept in settings (so
 * it's in the iCloud backup). iCloud (./cloud.ts) is off until the container
 * is set up; until then invites wait to be published and a friend's code
 * waits, pending.
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
/**
 * Set once this iPhone has earned the founding testers' badge: restoring a
 * backup from before then (on this iPhone) puts it back.
 */
const FOUNDING_TESTER_KEY = 'milemint.founding-tester';
const useKeychain = Platform.OS !== 'web';
/** CloudKit is asked for the sharer's count at most this often. */
const COUNT_EVERY_MS = 60 * 60 * 1000;

/** Why a pending code was turned down, as a whole sentence. */
export const REFUSAL_MESSAGES: Record<ClaimRefusal, string> = {
  'not-found': msg('That invite code wasn’t found. Check it with your friend.'),
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
  /** Whether that code has been confirmed in iCloud (only 'granted' credits the friend). */
  redeemStatus: RedeemStatus | null;
  /** Why iCloud last turned a pending code down, until another is entered. */
  redeemRefusal: ClaimRefusal | null;
  /** Friends who joined with this user's invites (0 until iCloud counts them). */
  friendsJoined: number;
  /** Perks earned by inviting friends, in ladder order; kept for good. */
  perks: Perk[];
  /** The next perk and how many more friends it needs; null once all are earned. */
  next: { perk: Perk; more: number } | null;
  /** The founding boost is on: perks unlock at 1, 2 and 3 friends. */
  boost: boolean;
  /** The App Store offer code for a friend's 50% off; empty until it's set up (every friend-discount line is hidden). */
  offerCode: string;
  /** This user entered a friend's code within the last year and the offer code is set: the Pro screen offers the gift. */
  giftOpen: boolean;
  /** This build can check invites and count friends (CloudKit is switched on). */
  counting: boolean;
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
  /** The Founding driver badge has just been earned for testing: home says thank you, once. */
  testerThanks: boolean;
  /** The thank-you has been shown. */
  thankedTester: () => void;
};

type Saved = Pick<
  AppSettings,
  | 'invites'
  | 'redeemedCode'
  | 'redeemedAt'
  | 'redeemStatus'
  | 'redeemRefusal'
  | 'qualifiedAt'
  | 'friendsJoined'
  | 'perksEarned'
  | 'installedAt'
>;

const EMPTY: Saved = {
  invites: [],
  redeemedCode: null,
  redeemedAt: null,
  redeemStatus: null,
  redeemRefusal: null,
  qualifiedAt: null,
  friendsJoined: 0,
  perksEarned: [],
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
  perksEarned: settings.perksEarned,
  installedAt: settings.installedAt,
});

/** Perks to save when the friends now reach more than is kept, or null when nothing's new. */
function newPerks(saved: Pick<Saved, 'friendsJoined' | 'perksEarned'>, now: Date): Perk[] | null {
  const earned = earnedPerks(saved.friendsJoined, now, saved.perksEarned);
  return earned.length > saved.perksEarned.length ? earned : null;
}

const redemptionOf = (saved: Saved): Redemption | null =>
  saved.redeemedCode
    ? { code: saved.redeemedCode, at: saved.redeemedAt ?? new Date().toISOString(), status: saved.redeemStatus ?? 'pending' }
    : null;

const redeemState = (saved: Saved) => ({
  myInvites: saved.invites.map((invite) => invite.code),
  redeemedCode: saved.redeemedCode,
  installedAt: saved.installedAt,
});

/** Whether this copy of the app came from TestFlight (see ./founding-tester). Never asks StoreKit. */
function testFlightInstall(): boolean {
  return isTestFlight({ dev: __DEV__, demoTester: DEMO_TESTER, signals: installSignals() });
}

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
  // Perks reached in an earlier build (or before a restore) are kept from now on.
  const perksEarned = newPerks(settings, new Date());
  if (perksEarned) changes.perksEarned = perksEarned;
  // A founding tester's badge is for good, even after a restore from before it was earned.
  if ((await keychainGet(FOUNDING_TESTER_KEY)) === 'yes') {
    const withBadge = withFoundingBadge(changes.perksEarned ?? settings.perksEarned);
    if (withBadge) changes.perksEarned = withBadge;
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
  const { region } = useRegion();
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [testerThanks, setTesterThanks] = useState(false);
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

  // Founding testers: a TestFlight install before launch day earns the badge,
  // once. After launch day the install isn't even looked at.
  useEffect(() => {
    if (!loaded || !foundingTesterOpen(new Date())) return;
    let cancelled = false;
    (async () => {
      if (!testFlightInstall()) return;
      keychainSet(FOUNDING_TESTER_KEY, 'yes');
      const added = await mutate<boolean>(async (current) => {
        const perksEarned = foundingTesterPerks(current.perksEarned, { testFlight: true, now: new Date() });
        return { changes: perksEarned ? { perksEarned } : {}, result: perksEarned !== null };
      });
      if (added && !cancelled) setTesterThanks(true);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loaded, mutate]);

  const thankedTester = useCallback(() => setTesterThanks(false), []);

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
      Alert.alert(
        t('🎉 Your friend’s invite is confirmed'),
        offerCode()
          ? t('Your friend’s gift is waiting: 50% off your first year of Pro, on the Pro screen.')
          : t('Thanks for joining with a friend’s invite. It counts towards their perks.'),
      );
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
      const unlocked = await mutate<Perk[]>(async (current) => {
        const friendsJoined = nextFriendsJoined(current.friendsJoined, counted);
        const perksEarned = newPerks({ friendsJoined, perksEarned: current.perksEarned }, new Date());
        const changes: Partial<Saved> = {};
        if (friendsJoined !== current.friendsJoined) changes.friendsJoined = friendsJoined;
        if (perksEarned) changes.perksEarned = perksEarned;
        return { changes, result: perksEarned ? perksEarned.filter((perk) => !current.perksEarned.includes(perk)) : [] };
      });
      if (unlocked.length > 0) {
        const perk = unlocked[unlocked.length - 1];
        Alert.alert(t('🌱 New perk unlocked'), t(PERK_NAMES[perk]));
      }
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
        const shared = await Share.share({ message: withInvite(message ?? inviteText(region), invite.code) }).catch(
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
    [mutate, region],
  );

  const friendsJoined = DEMO_FRIENDS ?? saved.friendsJoined;
  const perks = useMemo(
    () => earnedPerks(friendsJoined, new Date(), saved.perksEarned),
    [friendsJoined, saved.perksEarned],
  );
  // The gold leaves in the opening come with earnings by platform; the opening reads them before the database opens.
  const gold = perks.includes('platform-earnings');
  useEffect(() => {
    if (loaded) rememberGoldLeaves(gold);
  }, [loaded, gold]);

  const value = useMemo<Referral>(() => {
    const now = new Date();
    const redeemedAt = DEMO_GIFT ? now.toISOString() : saved.redeemedAt;
    return {
      loaded,
      invitesSent: saved.invites.length,
      redeemedCode: DEMO_GIFT ? 'TRVB-7K2' : saved.redeemedCode,
      redeemStatus: DEMO_GIFT ? 'pending' : saved.redeemStatus,
      redeemRefusal: saved.redeemRefusal,
      friendsJoined,
      perks,
      next: nextPerk(friendsJoined, now, perks),
      boost: foundingBoost(now),
      offerCode: offerCode(),
      giftOpen: friendGiftOpen({ offerCode: offerCode(), redeemedAt, now }),
      counting: ReferralCloud.supported,
      canRedeem: loaded && !DEMO_GIFT && canRedeemNow(redeemState(saved), now),
      redeem,
      shareInvite,
      sharing,
      reload,
      testerThanks,
      thankedTester,
    };
  }, [loaded, saved, friendsJoined, perks, redeem, shareInvite, sharing, reload, testerThanks, thankedTester]);

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export function useReferral(): Referral {
  const referral = useContext(ReferralContext);
  if (!referral) throw new Error('useReferral must be used inside <ReferralProvider>');
  return referral;
}
