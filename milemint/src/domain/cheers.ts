import { getLanguage, type Lang, msg, translate } from "../i18n/i18n";
import type { RegionCode } from "./regions";

/**
 * A send-off when a shift starts, in the way people talk where the user
 * drives. Rotates so it stays fun; nothing that could read as rude,
 * religious or political.
 */
export const SHIFT_CHEERS: Record<RegionCode, readonly string[]> = {
  GB: [
    "Tally ho! 🚗",
    "Right, let’s crack on! 💪",
    "Off we pop! 👋",
    "Chocks away! ✈️",
    "Let’s go! 🚀",
    "Game on! 🎯",
    "Here we go! 🙌",
    "Wheels on, cuppa later ☕",
  ],
  US: [
    "Let’s roll! 🚗",
    "Let’s go! 🚀",
    "Let’s do this! 💪",
    "Hit the road! 🛣️",
    "Pedal to the metal! 🏁",
    "Showtime! ✨",
    "Game time! 🏈",
    "Let’s get this bread! 🍞",
  ],
  CA: [
    "Let’s roll, eh! 🚗",
    "Giv’er! 💪",
    "Let’s go! 🚀",
    "Beauty, let’s go! 🙌",
    "Hit the road! 🛣️",
    "Off to the races! 🏁",
    "Game on! 🏒",
  ],
  AU: [
    "Righto, let’s go! 👍",
    "Let’s get cracking! 💪",
    "Giddy up! 🐎",
    "Off we go! 🚀",
    "Too easy! 🙌",
    "No worries, let’s roll! 🚗",
    "She’ll be right! 🤙",
  ],
};

/**
 * For other languages: the regional slang doesn't travel, so a plain,
 * friendly set that translates well.
 */
export const NEUTRAL_CHEERS: readonly string[] = [
  msg("Let’s go! 🚀"),
  msg("Here we go! 🙌"),
  msg("Time to roll! 🚗"),
  msg("Game on! 🎯"),
  msg("Let’s do this! 💪"),
  msg("Off we go! 👋"),
];

const pick = (list: readonly string[], n: number) =>
  list[((n % list.length) + list.length) % list.length];

/**
 * The cheer for the `n`th shift: cycles through the region's list in
 * English, or the neutral list, translated, in other languages.
 */
export function shiftCheer(
  code: RegionCode,
  n: number,
  lang: Lang = getLanguage(),
): string {
  return lang === "en"
    ? pick(SHIFT_CHEERS[code], n)
    : translate(lang, pick(NEUTRAL_CHEERS, n));
}
