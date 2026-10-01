/**
 * Invite codes, like "TRVB-7K2": a new one for every invite sent, each good
 * for one friend (see ./invites.ts). Four letters, a dash and three
 * letters or digits. Easy to read out and type: no vowels (so no words,
 * rude or otherwise), and none of the look-alikes 0/O, 1/I/L or 5/S.
 * Pure (randomness is passed in), so it's unit-tested.
 */

/** Consonants only, without L (reads as 1 or I) and S (reads as 5). */
const LETTERS = 'BCDFGHJKMNPQRTVWXZ';
const DIGITS = '2346789';
const TAIL = LETTERS + DIGITS;

/** How long after installing a friend's code can still be entered. */
export const REDEEM_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const PATTERN = new RegExp(`^[${LETTERS}]{4}-[${TAIL}]{3}$`);

/** Uniform pick from `alphabet` using random bytes (rejects bytes that would bias the result). */
function pick(alphabet: string, count: number, randomBytes: (n: number) => Uint8Array): string {
  const limit = 256 - (256 % alphabet.length);
  let out = '';
  while (out.length < count) {
    for (const byte of randomBytes(count * 2)) {
      if (byte < limit && out.length < count) out += alphabet[byte % alphabet.length];
    }
  }
  return out;
}

/** A new code. `randomBytes` is expo-crypto's getRandomBytes in the app. */
export function generateReferralCode(randomBytes: (n: number) => Uint8Array): string {
  return `${pick(LETTERS, 4, randomBytes)}-${pick(TAIL, 3, randomBytes)}`;
}

/**
 * The code someone typed, tidied up ("trvb 7k2", "TRVB7K2" → "TRVB-7K2"),
 * or null if it can't be a MileMint code. Case, spaces and dashes don't matter.
 */
export function normalizeReferralCode(input: string): string | null {
  // NFKC turns full-width ＴＲＶＢ－７Ｋ２ (Chinese and Japanese keyboards) into plain characters;
  // any dash, space, invisible character, dot or underscore is ignored.
  const compact = String(input ?? '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[\s\p{Pd}\p{Cf}\u2212_.]/gu, '');
  if (compact.length !== 7) return null;
  const code = `${compact.slice(0, 4)}-${compact.slice(4)}`;
  return PATTERN.test(code) ? code : null;
}

export const isReferralCode = (code: string): boolean => PATTERN.test(code);

/**
 * What stops a code from being redeemed, if anything. The first four are
 * checked on the iPhone; the last three come from iCloud (./cloud.ts).
 */
export type RedeemProblem =
  | 'format'
  | 'own'
  | 'already'
  | 'expired'
  /** No invite with that code. */
  | 'not-found'
  /** Someone else already used that invite. */
  | 'used'
  /** This Apple Account has already joined with a friend's invite. */
  | 'claimed-before';

export type RedeemState = {
  /** Invite codes this user has sent. */
  myInvites: readonly string[];
  /** A code already redeemed (pending or granted) on this install (or this iPhone, after a reinstall). */
  redeemedCode: string | null;
  /** ISO time the app was first set up. */
  installedAt: string | null;
};

/** Still within the 30 days after install when a friend's code can be entered. */
export function inRedeemWindow(installedAt: string | null, now: Date): boolean {
  if (!installedAt) return true;
  const since = now.getTime() - new Date(installedAt).getTime();
  // An unreadable install date, or one in the future (the clock set back), closes the window.
  return Number.isFinite(since) && since >= 0 && since < REDEEM_WINDOW_DAYS * DAY_MS;
}

/**
 * The install date to keep: the earlier of settings' and the keychain's (which
 * survives deleting the app), so reinstalling doesn't reopen the 30 days.
 */
export function firstInstall(fromSettings: string | null, kept: string | null, now: Date): string {
  if (kept && (!fromSettings || kept < fromSettings)) return kept;
  return fromSettings ?? now.toISOString();
}

/** Whether to offer "Got a code from a friend?" at all. */
export function canRedeem(state: RedeemState, now: Date): boolean {
  return !state.redeemedCode && inRedeemWindow(state.installedAt, now);
}

/** Checks a typed code: the tidied code to save, or why it can't be used. */
export function checkRedeem(
  input: string,
  state: RedeemState,
  now: Date,
): { ok: true; code: string } | { ok: false; problem: RedeemProblem } {
  if (state.redeemedCode) return { ok: false, problem: 'already' };
  if (!inRedeemWindow(state.installedAt, now)) return { ok: false, problem: 'expired' };
  const code = normalizeReferralCode(input);
  if (!code) return { ok: false, problem: 'format' };
  if (state.myInvites.includes(code)) return { ok: false, problem: 'own' };
  return { ok: true, code };
}
