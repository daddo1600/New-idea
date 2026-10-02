/**
 * Light or dark: follow the phone (the default), or always one of them.
 * Chosen in Settings → Appearance and kept in the settings.
 */
export const APPEARANCES = ['system', 'light', 'dark'] as const;

export type Appearance = (typeof APPEARANCES)[number];
