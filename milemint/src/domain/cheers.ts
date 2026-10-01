import type { RegionCode } from './regions';

/**
 * A send-off when a shift starts, in the way people talk where the user
 * drives. Rotates so it stays fun; nothing that could read as rude,
 * religious or political.
 */
export const SHIFT_CHEERS: Record<RegionCode, readonly string[]> = {
  GB: [
    'Tally ho! 🚗',
    'Right, let’s crack on! 💪',
    'Off we pop! 👋',
    'Chocks away! ✈️',
    'Let’s go! 🚀',
    'Game on! 🎯',
    'Here we go! 🙌',
    'Wheels on, cuppa later ☕',
  ],
  US: [
    'Let’s roll! 🚗',
    'Let’s go! 🚀',
    'Let’s do this! 💪',
    'Hit the road! 🛣️',
    'Pedal to the metal! 🏁',
    'Showtime! ✨',
    'Game time! 🏈',
    'Let’s get this bread! 🍞',
  ],
  CA: [
    'Let’s roll, eh! 🚗',
    'Giv’er! 💪',
    'Let’s go! 🚀',
    'Beauty, let’s go! 🙌',
    'Hit the road! 🛣️',
    'Off to the races! 🏁',
    'Game on! 🏒',
  ],
  AU: [
    'Righto, let’s go! 👍',
    'Let’s get cracking! 💪',
    'Giddy up! 🐎',
    'Off we go! 🚀',
    'Too easy! 🙌',
    'No worries, let’s roll! 🚗',
    'She’ll be right! 🤙',
  ],
};

/** The cheer for the `n`th shift: cycles through the region's list. */
export function shiftCheer(code: RegionCode, n: number): string {
  const cheers = SHIFT_CHEERS[code];
  return cheers[((n % cheers.length) + cheers.length) % cheers.length];
}
