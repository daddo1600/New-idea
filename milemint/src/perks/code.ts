/**
 * Perk codes, like "MS-KRB-7Q4X-92": made on the phone when a driver claims
 * an offer, each one used once. "MS", the partner's three letters, four
 * random letters or digits, then two check digits (ISO 7064 mod 97, as on
 * bank account numbers) so a till or checkout can spot a mistyped code.
 * Easy to read out: no vowels (so no words) and none of the look-alikes
 * 0/O, 1/I/L or 5/S in the random part.
 *
 * The code carries no personal data: nothing about the driver, their trips
 * or their phone. Pure (randomness is passed in), so it's unit-tested.
 */

/** Consonants without L or S, and digits without 0, 1 or 5 (as invite codes). */
const RANDOM_ALPHABET = 'BCDFGHJKMNPQRTVWXZ2346789';
const RANDOM_LENGTH = 4;

export const PERK_CODE_PATTERN = new RegExp(`^MS-[A-Z]{3}-[${RANDOM_ALPHABET}]{${RANDOM_LENGTH}}-\\d{2}$`);

/**
 * Where the QR code points: the till's scanner (or a partner's website)
 * opens it to check the code and mark it used.
 * PLACEHOLDER: milesprout.app isn't live yet, and nothing checks codes so far.
 * Real redemption needs a server that issues codes, enforces each partner's
 * weekly cap, marks a code used once and bills the partner for it.
 */
export const REDEEM_URL_BASE = 'https://milesprout.app/r/';

export function perkRedeemUrl(code: string): string {
  return `${REDEEM_URL_BASE}${encodeURIComponent(code)}`;
}

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

/** The remainder mod 97 of the characters read as an IBAN-style number (A = 10 … Z = 35). */
function mod97(text: string): number {
  let remainder = 0;
  for (const char of text) {
    for (const digit of String(parseInt(char, 36))) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

/** The two check digits for a code's letters and digits (dashes and "MS" left out). */
export function checkDigits(body: string): string {
  return String(98 - ((mod97(body) * 100) % 97)).padStart(2, '0');
}

/**
 * A new code for a partner. `taken` holds the codes already on this phone, so
 * a new one never repeats them; a server will make codes unique across all
 * drivers once redemption is live.
 */
export function generatePerkCode(
  prefix: string,
  randomBytes: (n: number) => Uint8Array,
  taken: ReadonlySet<string> = new Set(),
): string {
  const partner = prefix.toUpperCase();
  if (!/^[A-Z]{3}$/.test(partner)) throw new Error(`A partner prefix is three letters, not "${prefix}"`);
  for (;;) {
    const random = pick(RANDOM_ALPHABET, RANDOM_LENGTH, randomBytes);
    const code = `MS-${partner}-${random}-${checkDigits(partner + random)}`;
    if (!taken.has(code)) return code;
  }
}

/** True for a well-formed code whose check digits match. */
export function isPerkCode(code: string): boolean {
  if (!PERK_CODE_PATTERN.test(code)) return false;
  const [, partner, random, check] = code.split('-');
  return checkDigits(partner + random) === check;
}
