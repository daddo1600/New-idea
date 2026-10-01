import { describe, expect, it } from '@jest/globals';
import { randomBytes } from 'node:crypto';

import {
  canRedeem,
  checkRedeem,
  generateReferralCode,
  inRedeemWindow,
  isReferralCode,
  normalizeReferralCode,
  REDEEM_WINDOW_DAYS,
} from '../code';

const bytes = (n: number) => new Uint8Array(randomBytes(n));
const NOW = new Date('2026-10-01T12:00:00Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const fresh = { myCode: 'TRVB-7K2', redeemedCode: null, installedAt: daysAgo(1) };

describe('generateReferralCode', () => {
  it('makes short, readable codes like TRVB-7K2', () => {
    for (let i = 0; i < 500; i++) {
      const code = generateReferralCode(bytes);
      expect(code).toMatch(/^[A-Z]{4}-[A-Z0-9]{3}$/);
      expect(isReferralCode(code)).toBe(true);
      // No vowels (no words), no look-alikes.
      expect(code).not.toMatch(/[AEIOUYLS015]/);
    }
  });

  it('rarely repeats', () => {
    const codes = new Set(Array.from({ length: 2000 }, () => generateReferralCode(bytes)));
    expect(codes.size).toBeGreaterThan(1990);
  });

  it('copes with random bytes it has to skip', () => {
    let calls = 0;
    // 255 is above the unbiased range for every alphabet, so it's skipped.
    const skippy = (n: number) => new Uint8Array(n).fill(calls++ % 2 === 0 ? 255 : 1);
    expect(isReferralCode(generateReferralCode(skippy))).toBe(true);
  });
});

describe('normalizeReferralCode', () => {
  it('forgives case, spaces and a missing dash', () => {
    expect(normalizeReferralCode('trvb-7k2')).toBe('TRVB-7K2');
    expect(normalizeReferralCode(' TRVB 7K2 ')).toBe('TRVB-7K2');
    expect(normalizeReferralCode('TRVB7K2')).toBe('TRVB-7K2');
    expect(normalizeReferralCode('TRVB–7K2')).toBe('TRVB-7K2');
  });

  it('rejects anything that can’t be a code', () => {
    expect(normalizeReferralCode('')).toBeNull();
    expect(normalizeReferralCode('TRAV-7K2')).toBeNull(); // A vowel: never generated.
    expect(normalizeReferralCode('TRVB-7K')).toBeNull();
    expect(normalizeReferralCode('TRVB-7K22')).toBeNull();
    expect(normalizeReferralCode('7RVB-7K2')).toBeNull(); // Digits only after the dash.
    expect(normalizeReferralCode('TRVB-0K2')).toBeNull();
  });
});

describe('redeeming', () => {
  it('accepts a friend’s code, tidied', () => {
    expect(checkRedeem('mnpq 4x9', fresh, NOW)).toEqual({ ok: true, code: 'MNPQ-4X9' });
  });

  it('rejects a badly formed code', () => {
    expect(checkRedeem('HELLO', fresh, NOW)).toEqual({ ok: false, problem: 'format' });
  });

  it('rejects your own code', () => {
    expect(checkRedeem('trvb7k2', fresh, NOW)).toEqual({ ok: false, problem: 'own' });
  });

  it('allows one redemption per install', () => {
    const state = { ...fresh, redeemedCode: 'MNPQ-4X9' };
    expect(checkRedeem('BCDF-234', state, NOW)).toEqual({ ok: false, problem: 'already' });
    expect(canRedeem(state, NOW)).toBe(false);
  });

  it('is open for 30 days after install', () => {
    expect(REDEEM_WINDOW_DAYS).toBe(30);
    expect(inRedeemWindow(daysAgo(29.9), NOW)).toBe(true);
    expect(inRedeemWindow(daysAgo(30), NOW)).toBe(false);
    expect(inRedeemWindow(null, NOW)).toBe(true);
    expect(canRedeem({ ...fresh, installedAt: daysAgo(31) }, NOW)).toBe(false);
    expect(checkRedeem('MNPQ-4X9', { ...fresh, installedAt: daysAgo(31) }, NOW)).toEqual({
      ok: false,
      problem: 'expired',
    });
  });
});

describe('codes typed on other keyboards', () => {
  it('reads full-width characters and other dashes', () => {
    expect(normalizeReferralCode('ＴＲＶＢ－７Ｋ２')).toBe('TRVB-7K2');
    expect(normalizeReferralCode('TRVB‐7K2')).toBe('TRVB-7K2');
    expect(normalizeReferralCode('TRVB−7K2')).toBe('TRVB-7K2');
    expect(normalizeReferralCode('TRVB​-7K2')).toBe('TRVB-7K2');
  });
});

describe('the 30-day window', () => {
  it('closes for an unreadable or future install date', () => {
    const now = new Date('2026-10-01T12:00:00Z');
    expect(inRedeemWindow('nonsense', now)).toBe(false);
    expect(inRedeemWindow('2027-01-01T00:00:00Z', now)).toBe(false);
    expect(inRedeemWindow('2026-09-20T00:00:00Z', now)).toBe(true);
  });
});
