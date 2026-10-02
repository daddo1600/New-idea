import { msg, t } from '../i18n/i18n';
import type { RegionCode } from './regions';

/**
 * Seasonal dress-up for the opening animation, by calendar date and the
 * user's country (seasons flip in Australia). Deliberately light: weather,
 * seasons and widely shared secular celebrations only, nothing religious or
 * political. Fixed dates, so it needs no data and works offline.
 */
export type SeasonId =
  | 'festive'
  | 'new-year'
  | 'halloween'
  | 'aussie-summer'
  | 'winter'
  | 'spring'
  | 'summer'
  | 'autumn';

export type Season = {
  id: SeasonId;
  /** A short line above the total, in the current language. */
  greeting: string;
};

const SOUTHERN: ReadonlySet<RegionCode> = new Set(['AU']);

/** Month 1–12 and day, as a sortable number: 1224 is 24 December. */
const md = (date: Date) => (date.getMonth() + 1) * 100 + date.getDate();

const GREETINGS: Record<SeasonId, (code: RegionCode) => string> = {
  festive: () => msg('Happy holidays from MileSprout 🎁'),
  'new-year': () => msg('Happy New Year 🎆'),
  halloween: () => msg('Happy Halloween 🎃'),
  'aussie-summer': () => msg('Summer on the road ☀️'),
  winter: () => msg('Stay warm and drive safely ❄️'),
  spring: () => msg('Spring is here 🌸'),
  summer: () => msg('Summer is here ☀️'),
  autumn: (code) => (code === 'US' || code === 'CA' ? msg('Fall is here 🍂') : msg('Autumn is here 🍂')),
};

/** The season to dress the opening in on `date`, or null for the everyday look. */
export function seasonFor(date: Date, code: RegionCode): Season | null {
  const day = md(date);
  const id = seasonId(day, SOUTHERN.has(code));
  return id ? { id, greeting: t(GREETINGS[id](code)) } : null;
}

function seasonId(day: number, southern: boolean): SeasonId | null {
  // Celebrations first: they're the same everywhere.
  if (day >= 1201 && day <= 1226) return 'festive';
  if (day >= 1231 || day <= 102) return 'new-year';
  if (day >= 1024 && day <= 1031) return 'halloween';
  // Then the weather, by meteorological season (whole months).
  const month = Math.floor(day / 100);
  const northern =
    month === 12 || month <= 2 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
  if (!southern) return northern;
  const flipped = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' } as const;
  const season = flipped[northern];
  return season === 'summer' ? 'aussie-summer' : season;
}
