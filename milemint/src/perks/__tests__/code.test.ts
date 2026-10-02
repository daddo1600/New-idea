import { describe, expect, it } from '@jest/globals';
import { randomBytes } from 'node:crypto';

import { checkDigits, generatePerkCode, isPerkCode, PERK_CODE_PATTERN, perkRedeemUrl } from '../code';
import { DEMO_OFFERS } from '../offers';

const bytes = (n: number) => new Uint8Array(randomBytes(n));

describe('generatePerkCode', () => {
  it('makes codes like MS-KRB-7Q4X-92, with the partner’s letters and valid check digits', () => {
    for (let i = 0; i < 500; i++) {
      const code = generatePerkCode('KRB', bytes);
      expect(code).toMatch(/^MS-KRB-[A-Z0-9]{4}-\d{2}$/);
      expect(code).toMatch(PERK_CODE_PATTERN);
      expect(isPerkCode(code)).toBe(true);
      // The random part has no vowels (no words) and no look-alikes.
      expect(code.split('-')[2]).not.toMatch(/[AEIOUYLS015]/);
    }
  });

  it('takes a lower-case prefix, and refuses one that isn’t three letters', () => {
    expect(generatePerkCode('grp', bytes)).toMatch(/^MS-GRP-/);
    expect(() => generatePerkCode('KR', bytes)).toThrow();
    expect(() => generatePerkCode('KRB1', bytes)).toThrow();
  });

  it('never repeats a code already on the phone', () => {
    const taken = new Set<string>();
    for (let i = 0; i < 3000; i++) taken.add(generatePerkCode('DBK', bytes, taken));
    expect(taken.size).toBe(3000);
  });

  it('draws again when the random part comes out the same as a taken code', () => {
    // The same bytes twice, then different ones: the second draw repeats the first code.
    const sequences = [1, 1, 2];
    let call = 0;
    const scripted = (n: number) => new Uint8Array(n).fill(sequences[Math.min(call++, sequences.length - 1)]);
    const first = generatePerkCode('KRB', scripted);
    const second = generatePerkCode('KRB', scripted, new Set([first]));
    expect(second).not.toBe(first);
    expect(isPerkCode(second)).toBe(true);
  });

  it('rarely repeats across phones, too', () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generatePerkCode('TRD', bytes)));
    expect(codes.size).toBeGreaterThan(990);
  });

  it('copes with random bytes it has to skip', () => {
    let calls = 0;
    // 255 is above the unbiased range for the alphabet, so it's skipped.
    const skippy = (n: number) => new Uint8Array(n).fill(calls++ % 2 === 0 ? 255 : 3);
    expect(isPerkCode(generatePerkCode('SPK', skippy))).toBe(true);
  });

  it('every demo partner has its own three-letter prefix', () => {
    const prefixes = DEMO_OFFERS.map((offer) => offer.codePrefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const prefix of prefixes) expect(prefix).toMatch(/^[A-Z]{3}$/);
  });
});

describe('isPerkCode', () => {
  it('catches a mistyped character or swapped digits', () => {
    const code = `MS-KRB-7Q4X-${checkDigits('KRB7Q4X')}`;
    expect(isPerkCode(code)).toBe(true);
    expect(isPerkCode(code.replace('7Q4X', '7Q4Z'))).toBe(false);
    expect(isPerkCode(code.replace('7Q4X', 'Q74X'))).toBe(false);
    const [a, b] = code.slice(-2);
    if (a !== b) expect(isPerkCode(code.slice(0, -2) + b + a)).toBe(false);
  });

  it('rejects anything that isn’t a perk code', () => {
    for (const text of ['', 'TRVB-7K2', 'MS-KRB-7Q4X', 'ms-krb-7q4x-92', 'MS-KRB-7Q4O-92', 'XX-KRB-7Q4X-92']) {
      expect(isPerkCode(text)).toBe(false);
    }
  });

  it('check digits are always two digits', () => {
    for (let i = 0; i < 200; i++) expect(generatePerkCode('LDG', bytes).slice(-2)).toMatch(/^\d{2}$/);
    expect(checkDigits('AAA2222')).toMatch(/^\d{2}$/);
  });
});

describe('perkRedeemUrl', () => {
  it('points at the redemption page, with nothing but the code', () => {
    expect(perkRedeemUrl('MS-KRB-7Q4X-92')).toBe('https://milesprout.app/r/MS-KRB-7Q4X-92');
  });
});
