import { describe, expect, it } from '@jest/globals';

import {
  currencyDigits,
  formatPrice,
  offerTermsKey,
  perMonthPrice,
  remindsBeforeTrialEnds,
  trialEnd,
  trialReminderDate,
} from '../pro-offer';

describe('per-month price of the yearly plan', () => {
  it('rounds up to the penny, so the price is never shown lower than it is', () => {
    expect(perMonthPrice(49.99, 'GBP')).toBe(4.17);
    expect(perMonthPrice(59.99, 'USD')).toBe(5);
    expect(perMonthPrice(60, 'EUR')).toBe(5);
  });

  it('is not thrown off by floating point', () => {
    // 3.48 * 100 is 347.99…; a twelfth of 3.48 is 0.29 exactly.
    expect(perMonthPrice(3.48, 'GBP')).toBe(0.29);
    expect(perMonthPrice(1.2, 'USD')).toBe(0.1);
  });

  it('works in whole units for currencies without decimals', () => {
    expect(currencyDigits('JPY')).toBe(0);
    expect(perMonthPrice(7800, 'JPY')).toBe(650);
    expect(perMonthPrice(7900, 'JPY')).toBe(659);
    expect(perMonthPrice(65000, 'KRW')).toBe(5417);
  });

  it('gives nothing for a missing or nonsense price', () => {
    expect(perMonthPrice(0, 'GBP')).toBeNull();
    expect(perMonthPrice(Number.NaN, 'GBP')).toBeNull();
    expect(perMonthPrice(-5, 'GBP')).toBeNull();
  });

  it('is formatted in the local currency style', () => {
    expect(formatPrice(4.16, 'GBP', 'en-GB')).toBe('£4.16');
    expect(formatPrice(650, 'JPY', 'en-US')).toBe('¥650');
    expect(formatPrice(4.16, 'EUR', 'de-DE')).toMatch(/^4,16\s€$/);
  });
});

describe('free trial reminder date', () => {
  const start = new Date(2026, 9, 1, 10, 30);

  it('is three days before a one-month trial ends', () => {
    expect(trialEnd(start, { count: 1, unit: 'month' })).toEqual(new Date(2026, 10, 1, 10, 30));
    expect(trialReminderDate(start, { count: 1, unit: 'month' })).toEqual(new Date(2026, 9, 29, 10, 30));
  });

  it('counts days for day and week trials', () => {
    expect(trialReminderDate(start, { count: 14, unit: 'day' })).toEqual(new Date(2026, 9, 12, 10, 30));
  });

  it('keeps a month on from the 31st inside the next month', () => {
    const jan31 = new Date(2027, 0, 31, 9);
    expect(trialEnd(jan31, { count: 1, unit: 'month' })).toEqual(new Date(2027, 1, 28, 9));
    expect(trialReminderDate(jan31, { count: 1, unit: 'month' })).toEqual(new Date(2027, 1, 25, 9));
  });

  it('is none when the trial is too short or its length unknown', () => {
    expect(trialReminderDate(start, { count: 3, unit: 'day' })).toBeNull();
    expect(trialReminderDate(start, { count: 1, unit: null })).toBeNull();
    expect(remindsBeforeTrialEnds({ period: 'year', trial: { count: 3, unit: 'day' } })).toBe(false);
    expect(remindsBeforeTrialEnds({ period: 'year', trial: { count: 1, unit: 'month' } })).toBe(true);
    expect(remindsBeforeTrialEnds({ period: 'month', trial: null })).toBe(false);
  });
});

describe('plain offer wording', () => {
  it('names the trial and the price after it', () => {
    expect(offerTermsKey({ period: 'year', trial: { count: 1, unit: 'month' } })).toBe(
      '{{trial}} free, then {{price}} a year. Cancel any time in Settings.',
    );
    expect(offerTermsKey({ period: 'month', trial: { count: 7, unit: 'day' } })).toBe(
      '{{trial}} free, then {{price}} a month. Cancel any time in Settings.',
    );
  });

  it('says only "free trial" when its length is unknown', () => {
    expect(offerTermsKey({ period: 'year', trial: { count: 1, unit: null } })).toBe(
      'Free trial, then {{price}} a year. Cancel any time in Settings.',
    );
  });

  it('is just the price without a trial, never "due today"', () => {
    expect(offerTermsKey({ period: 'year', trial: null })).toBe('{{price}} a year. Cancel any time in Settings.');
    expect(offerTermsKey({ period: 'month', trial: null })).toBe('{{price}} a month. Cancel any time in Settings.');
  });
});
