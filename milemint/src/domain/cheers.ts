import { getLanguage, type Lang, msg, translate } from '../i18n/i18n';
import type { RegionCode } from './regions';

/**
 * A send-off when a shift starts. Many drivers speak English as a second
 * language, so these stay plain: a touch of local flavour only where anyone
 * living there knows it ("Cheers", "eh", "G’day", "No worries"), never slang
 * like "Tally ho" or "Giv’er". Rotates so it stays fresh; nothing that could
 * read as rude, religious or political.
 */
export const SHIFT_CHEERS: Record<RegionCode, readonly string[]> = {
  GB: [
    'Off you go! 🚗',
    'Have a good shift! 👋',
    'Right, let’s go! 💪',
    'Drive safely! 🛣️',
    'Let’s go! 🚀',
    'Here we go! 🙌',
    'Off we go! 👋',
    'Cheers, have a good shift! ☕',
  ],
  US: [
    'Let’s roll! 🚗',
    'Let’s go! 🚀',
    'Let’s do this! 💪',
    'Have a good shift! 👋',
    'Drive safely! 🛣️',
    'Go get those orders! 📦',
    'Here we go! 🙌',
  ],
  CA: [
    'Let’s go, eh! 🚗',
    'Let’s go! 🚀',
    'Have a good shift! 👋',
    'Drive safely! 🛣️',
    'Go get those orders! 📦',
    'Let’s do this! 💪',
    'Here we go! 🙌',
  ],
  AU: [
    'No worries, let’s go! 🚗',
    'G’day! Have a good shift 👋',
    'Right, let’s go! 👍',
    'Off we go! 🚀',
    'Drive safely! 🛣️',
    'Let’s do this! 💪',
    'Here we go! 🙌',
  ],
};

/** For other languages: a plain, friendly set that translates well. */
export const NEUTRAL_CHEERS: readonly string[] = [
  msg('Let’s go! 🚀'),
  msg('Here we go! 🙌'),
  msg('Have a good shift! 👋'),
  msg('Drive safely! 🚗'),
  msg('Let’s do this! 💪'),
  msg('Off we go! 👋'),
];

const pick = (list: readonly string[], n: number) => list[((n % list.length) + list.length) % list.length];

/**
 * The cheer for the `n`th shift: cycles through the region's list in
 * English, or the neutral list, translated, in other languages.
 */
export function shiftCheer(code: RegionCode, n: number, lang: Lang = getLanguage()): string {
  return lang === 'en' ? pick(SHIFT_CHEERS[code], n) : translate(lang, pick(NEUTRAL_CHEERS, n));
}
