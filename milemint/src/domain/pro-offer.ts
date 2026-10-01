import { msg } from '@/i18n/i18n';

/**
 * The paywall's sums and word choices, kept free of React and StoreKit so they
 * can be tested: the per-month price of the yearly plan, when a free trial
 * ends, and which plain sentence describes an offer.
 */

/** A free trial's length; `unit: null` when the App Store gives no length we word. */
export type TrialLength = { count: number; unit: 'day' | 'month' | null };

export type Offer = { period: 'month' | 'year'; trial: TrialLength | null };

/** How many days before a free trial ends the reminder comes. */
export const TRIAL_REMINDER_DAYS = 3;

/** Digits after the decimal point for a currency: 2 for GBP, 0 for JPY. */
export function currencyDigits(currency: string): number {
  try {
    const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits;
    return typeof digits === 'number' && digits >= 0 && digits <= 4 ? digits : 2;
  } catch {
    return 2;
  }
}

/**
 * What the yearly price comes to a month, rounded up to the currency's
 * smallest unit so the price is never shown lower than it is: £49.99 →
 * £4.17, ¥7,800 → ¥650. Null for a price that isn't a positive number.
 */
export function perMonthPrice(yearly: number, currency: string): number | null {
  if (!Number.isFinite(yearly) || yearly <= 0) return null;
  const scale = 10 ** currencyDigits(currency);
  // Whole minor units first: 49.99 * 100 is 4998.999… in floating point.
  const minor = Math.round(yearly * scale);
  return Math.ceil(minor / 12) / scale;
}

/** e.g. "£4.16" in the given locale; null if the currency is unknown to Intl. */
export function formatPrice(amount: number, currency: string, locale: string): string | null {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    try {
      return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
    } catch {
      return null;
    }
  }
}

/** When a free trial started at `start` ends; null when its length isn't known. */
export function trialEnd(start: Date, trial: TrialLength): Date | null {
  if (!trial.unit || !Number.isInteger(trial.count) || trial.count <= 0) return null;
  const end = new Date(start.getTime());
  if (trial.unit === 'day') {
    end.setDate(end.getDate() + trial.count);
    return end;
  }
  // A month on from 31 January is the last day of February, not 3 March.
  const day = end.getDate();
  end.setDate(1);
  end.setMonth(end.getMonth() + trial.count);
  const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  end.setDate(Math.min(day, lastDay));
  return end;
}

/**
 * When to remind someone their free trial is ending: three days before it
 * ends. Null when the length isn't known or the trial is too short for a
 * reminder to come before the day it ends.
 */
export function trialReminderDate(start: Date, trial: TrialLength): Date | null {
  const end = trialEnd(start, trial);
  if (!end) return null;
  const at = new Date(end.getTime());
  at.setDate(at.getDate() - TRIAL_REMINDER_DAYS);
  return at.getTime() > start.getTime() ? at : null;
}

/** Whether an offer's trial is long enough to be reminded about before it ends. */
export function remindsBeforeTrialEnds(offer: Offer): boolean {
  return !!offer.trial && trialReminderDate(new Date(2026, 0, 1), offer.trial) !== null;
}

/**
 * The plain sentence above the buy button (English key, shown with t()):
 * `{{trial}}` is the trial's length ("1 month"), `{{price}}` the App Store's price.
 */
export function offerTermsKey(offer: Offer): string {
  const { trial, period } = offer;
  if (trial?.unit) {
    return period === 'year'
      ? msg('{{trial}} free, then {{price}} a year. Cancel any time in Settings.')
      : msg('{{trial}} free, then {{price}} a month. Cancel any time in Settings.');
  }
  if (trial) {
    return period === 'year'
      ? msg('Free trial, then {{price}} a year. Cancel any time in Settings.')
      : msg('Free trial, then {{price}} a month. Cancel any time in Settings.');
  }
  return period === 'year'
    ? msg('{{price}} a year. Cancel any time in Settings.')
    : msg('{{price}} a month. Cancel any time in Settings.');
}
