import { msg } from '../i18n/i18n';
import type { DeductionTrip, RegionCode } from './regions';
import { MAX_WEEKLY_EARNINGS_MINOR, addDays, weekStartOf } from './set-aside';
import { METERS_PER_MILE } from './trip';

/**
 * Earnings by platform, read from a screenshot of a delivery or rideshare
 * app's earnings page. The text is read on the iPhone (Apple's Vision, see
 * modules/text-scan) and parsed here: which app, the day or days it covers,
 * the total, and, where the app shows them, its trip count and the distance
 * it counted on jobs. Nothing leaves the phone.
 *
 * Parsing is deliberately cautious: a figure that can't be read with
 * confidence (two different totals, a date that could be either day/month
 * or month/day) is left empty for the driver to fill in on the confirm
 * screen, rather than guessed.
 */

export type PlatformId =
  | 'uber'
  | 'uber-eats'
  | 'deliveroo'
  | 'doordash'
  | 'just-eat'
  | 'lyft'
  | 'amazon-flex'
  | 'stuart'
  | 'skip'
  | 'menulog'
  | 'instacart'
  | 'grubhub'
  | 'other';

/** The apps' own names (never translated). */
export const PLATFORM_NAMES: Record<Exclude<PlatformId, 'other'>, string> = {
  uber: 'Uber',
  'uber-eats': 'Uber Eats',
  deliveroo: 'Deliveroo',
  doordash: 'DoorDash',
  'just-eat': 'Just Eat',
  lyft: 'Lyft',
  'amazon-flex': 'Amazon Flex',
  stuart: 'Stuart',
  skip: 'Skip',
  menulog: 'Menulog',
  instacart: 'Instacart',
  grubhub: 'Grubhub',
};

/** "Other app", shown with t(). */
export const OTHER_PLATFORM = msg('Other app');

export const PLATFORM_IDS: readonly PlatformId[] = [...(Object.keys(PLATFORM_NAMES) as PlatformId[]), 'other'];

export function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === 'string' && (PLATFORM_IDS as readonly string[]).includes(value);
}

/** The apps couriers and drivers use most in each country, most used first, for the picker. */
export const PLATFORMS_BY_REGION: Record<RegionCode, readonly PlatformId[]> = {
  GB: ['uber-eats', 'deliveroo', 'just-eat', 'uber', 'amazon-flex', 'stuart'],
  US: ['doordash', 'uber-eats', 'uber', 'lyft', 'instacart', 'grubhub', 'amazon-flex'],
  CA: ['uber-eats', 'doordash', 'skip', 'uber', 'lyft', 'instacart', 'amazon-flex'],
  AU: ['uber-eats', 'doordash', 'menulog', 'uber', 'amazon-flex'],
};

/** The picker's apps: the country's own, then one the scan found elsewhere, then "Other app". */
export function platformChoices(region: RegionCode, found: PlatformId | null): PlatformId[] {
  const list: PlatformId[] = [...PLATFORMS_BY_REGION[region]];
  if (found && found !== 'other' && !list.includes(found)) list.push(found);
  return [...list, 'other'];
}

/** The most days one entry can cover: a day, a week or a monthly statement. */
export const MAX_PERIOD_DAYS = 31;

/** The most trips one entry can have, to catch a misread. */
export const MAX_TRIP_COUNT = 5_000;

/** The most distance one entry can have (metres), to catch a misread: 20,000 km. */
export const MAX_DISTANCE_METERS = 20_000_000;

export type EarningsScan = {
  platform: PlatformId | null;
  /** First and last day, YYYY-MM-DD (the same for a single day); null when not found. */
  start: string | null;
  end: string | null;
  /** Total earnings in minor units, in the region's currency. */
  amountMinor: number | null;
  /** Trips, deliveries or orders, as the app counted them. */
  trips: number | null;
  /** Distance the app counted (on jobs), in metres. */
  distanceMeters: number | null;
};

// ─── Text ──────────────────────────────────────────────────────────────────

/** Vision's lines tidied: one kind of dash, single spaces, no empty lines. */
function tidy(lines: readonly string[]): string[] {
  return lines
    .map((line) =>
      line
        .replace(/[‐‑‒–—―−]/g, '–')
        .replace(/[   ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((line) => line.length > 0);
}

// ─── Platform ──────────────────────────────────────────────────────────────

/**
 * Each app's name as it appears on its own screens, most specific first:
 * "Uber Eats" is checked (and taken out) before "Uber". Stuart is a common
 * first name, so only its logo line or web address counts.
 */
const PLATFORM_PATTERNS: readonly [PlatformId, RegExp][] = [
  ['uber-eats', /\buber ?eats\b/gi],
  ['skip', /\bskip ?the ?dishes\b/gi],
  ['just-eat', /\bjust ?eat\b/gi],
  ['amazon-flex', /\bamazon ?flex\b/gi],
  ['doordash', /\bdoor ?dash\b|\bdasher\b/gi],
  ['deliveroo', /\bdeliveroo\b/gi],
  ['menulog', /\bmenulog\b/gi],
  ['instacart', /\binstacart\b/gi],
  ['grubhub', /\bgrubhub\b/gi],
  ['lyft', /\blyft\b/gi],
  ['stuart', /^stuart(?: courier)?$|\bstuart\.com\b/gim],
  ['uber', /\buber\b/gi],
];

/** The app the screenshot is from; null when none is named, or two different ones are. */
export function detectPlatform(lines: readonly string[]): PlatformId | null {
  let text = tidy(lines).join('\n');
  const found = new Set<PlatformId>();
  for (const [id, pattern] of PLATFORM_PATTERNS) {
    if (text.match(pattern)) {
      found.add(id);
      text = text.replace(pattern, ' ');
    }
  }
  return found.size === 1 ? [...found][0] : null;
}

// ─── Money ─────────────────────────────────────────────────────────────────

/** Currency signs each country's apps use: "$" alone is the local dollar. */
const CURRENCY: Record<RegionCode, string> = {
  GB: '£',
  US: 'US\\$|\\$',
  CA: 'CA\\$|C\\$|\\$',
  AU: 'AU\\$|A\\$|\\$',
};

/** An amount in the region's currency: "£1,234.56", "$85", "A$ 412.30". Never a negative one. */
function moneyPattern(region: RegionCode): RegExp {
  return new RegExp(
    `(^|[^\\w.,$£€−–-])(${CURRENCY[region]})\\s?(\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.(\\d{2}))?(?![\\d.,]*\\d)`,
    'gi',
  );
}

function amountsIn(line: string, region: RegionCode): number[] {
  const amounts: number[] = [];
  for (const match of line.matchAll(moneyPattern(region))) {
    // A sign right before it ("-£3.00", "– $2.10"): a deduction, not earnings.
    if (/[-–]\s?$/.test(line.slice(0, (match.index ?? 0) + match[1].length))) continue;
    const whole = Number(match[3].replace(/,/g, ''));
    const minor = whole * 100 + (match[4] ? Number(match[4]) : 0);
    if (Number.isSafeInteger(minor)) amounts.push(minor);
  }
  return amounts;
}

/** A line that is nothing but one amount: the big figure at the top of most earnings pages. */
function onlyAmount(line: string, region: RegionCode): number | null {
  const amounts = amountsIn(line, region);
  if (amounts.length !== 1) return null;
  const rest = line.replace(moneyPattern(region), '$1').replace(/[\s*~≈]/g, '');
  return rest === '' ? amounts[0] : null;
}

const TOTAL_LABEL = /\b(total|earnings|earned|you made|net pay|payout|take[- ]home|your pay|weekly pay|paid)\b/i;
/** Parts of the total, rates and other figures that are never the period's earnings. */
const NOT_TOTAL =
  /\b(tips?|fares?|promotions?|promo|boosts?|surge|quests?|bonus(es)?|service|adjustments?|refunds?|per (hour|hr|trip|delivery|order|mile|km|mi)|hourly|an hour|balance|cash ?out|instant|year|ytd|lifetime|goal|target|average|avg|expected|estimated tax|cash collected)\b|\/\s?(h|hr|hour)\b/i;

/**
 * The total earned. Labelled totals first: "Total earnings £412.35", or a
 * label with the amount alone on the line below or above. Then, failing
 * that, the largest amount standing alone on its line (the headline figure).
 * Tips, fares, boosts, balances and hourly rates are never taken.
 */
export function detectTotal(lines: readonly string[], region: RegionCode): number | null {
  const tidied = tidy(lines);
  type Candidate = { amount: number; rank: number; at: number };
  const candidates: Candidate[] = [];
  tidied.forEach((line, i) => {
    if (!TOTAL_LABEL.test(line) || NOT_TOTAL.test(line)) return;
    const rank = /\btotal\b/i.test(line) ? 0 : 1;
    const here = amountsIn(line, region);
    if (here.length > 0) return candidates.push({ amount: here[0], rank, at: i });
    const below = i + 1 < tidied.length ? onlyAmount(tidied[i + 1], region) : null;
    if (below !== null) return candidates.push({ amount: below, rank, at: i });
    const above = i > 0 ? onlyAmount(tidied[i - 1], region) : null;
    if (above !== null) candidates.push({ amount: above, rank, at: i });
  });
  const valid = (amount: number) => amount > 0 && amount <= MAX_WEEKLY_EARNINGS_MINOR;
  const labelled = candidates.filter((candidate) => valid(candidate.amount));
  if (labelled.length > 0) {
    labelled.sort((a, b) => a.rank - b.rank || a.at - b.at);
    return labelled[0].amount;
  }
  const alone = tidied
    .filter((line, i) => !NOT_TOTAL.test(line) && !(i > 0 && NOT_TOTAL.test(tidied[i - 1])))
    .map((line) => onlyAmount(line, region))
    .filter((amount): amount is number => amount !== null && valid(amount));
  return alone.length > 0 ? Math.max(...alone) : null;
}

// ─── Trips ─────────────────────────────────────────────────────────────────

const COUNTED = '(?:trips?|deliver(?:y|ies)|orders?|rides?|jobs?|batch(?:es)?)';
/** "18 trips", "23 completed deliveries". */
const COUNT_BEFORE = new RegExp(`(?<![\\d.,$£:/])\\b(\\d{1,4})\\s+(?:completed\\s+)?${COUNTED}\\b`, 'gi');
/** "Orders 12", "Trips: 18", "Completed deliveries · 23". */
const COUNT_AFTER = new RegExp(
  `\\b(?:(?:total|completed)\\s+)?${COUNTED}\\s*(?:completed\\s*)?[:·•|]?\\s*(\\d{1,4})(?![\\d.,:])(?!\\s?(?:mi|km|h|hr|hrs|min|mins|m|%|x)\\b)`,
  'gi',
);
/** A line that's only the label, with the number on the next line. */
const COUNT_LABEL = new RegExp(`^(?:(?:total|completed)\\s+)?${COUNTED}(?:\\s+completed)?:?$`, 'i');

/**
 * Trips, deliveries or orders in the period. Only when every mention agrees
 * (a day-by-day list with its own counts leaves it empty).
 */
export function detectTripCount(lines: readonly string[]): number | null {
  const tidied = tidy(lines);
  const found = new Set<number>();
  tidied.forEach((line, i) => {
    // Rates and averages ("£5.20 per trip", "Avg per order") are about one trip, not the count.
    if (/\b(per|avg|average)\b/i.test(line)) return;
    for (const match of line.matchAll(COUNT_BEFORE)) found.add(Number(match[1]));
    for (const match of line.matchAll(COUNT_AFTER)) found.add(Number(match[1]));
    const next = tidied[i + 1];
    if (COUNT_LABEL.test(line) && next && /^\d{1,4}$/.test(next)) found.add(Number(next));
  });
  const counts = [...found].filter((count) => count > 0 && count <= MAX_TRIP_COUNT);
  return counts.length === 1 && found.size === 1 ? counts[0] : null;
}

// ─── Distance ──────────────────────────────────────────────────────────────

const DISTANCE =
  /(?<![\d.,$£:/])\b(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?\s?(mi|miles?|km|kms|kilomet(?:re|er)s?)\b(?!\s?\/)/gi;
const DISTANCE_LABEL = /\b(distance|on (trips?|jobs?|deliver(y|ies)|orders?)|driven|travell?ed|total)\b/i;

/**
 * The distance the app counted. Where it differs between mentions, the one
 * on a labelled line ("Total distance", "on trips") if that's the only one;
 * otherwise left empty.
 */
export function detectDistance(lines: readonly string[]): number | null {
  const all = new Set<number>();
  const labelled = new Set<number>();
  for (const line of tidy(lines)) {
    // Rates: "$0.70 per mile", "£1.20 a mile".
    if (/\b(per|a|each) (mile|mi|km|kilomet)/i.test(line)) continue;
    for (const match of line.matchAll(DISTANCE)) {
      const units = Number(`${match[1].replace(/,/g, '')}.${match[2] ?? '0'}`);
      const perUnit = /^k/i.test(match[3]) ? 1000 : METERS_PER_MILE;
      const meters = Math.round(units * perUnit);
      if (meters <= 0 || meters > MAX_DISTANCE_METERS) continue;
      all.add(meters);
      if (DISTANCE_LABEL.test(line)) labelled.add(meters);
    }
  }
  if (all.size === 1) return [...all][0];
  return labelled.size === 1 ? [...labelled][0] : null;
}

// ─── Dates ─────────────────────────────────────────────────────────────────

const MONTH_NUMBERS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?';
const DAY = '(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:])';
/** "Mon ", "Monday, ", "Tues. ": a weekday in front of a date, skipped. */
const WEEKDAY = '(?:(?:mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(?:day|sday|nesday|rsday|urday)?\\.?,?\\s+)?';
const YEAR_AFTER_DAY = '(?:,?\\s+(\\d{4}))?(?!\\d)';
const YEAR_AFTER_MONTH = '(?:,?\\s+(\\d{4}))?(?!\\d)';
const TO = '\\s*(?:–|-|to|until|thru|through)\\s*';

/** Month-first and day-first ranges and days, as written in the apps' English. */
const RANGES: readonly { pattern: RegExp; parts: (m: RegExpMatchArray) => [Part, Part] }[] = [
  {
    // "Sep 22 – Sep 28", "Sep 29, 2025 - Oct 5, 2025", "Mon, Sep 22 to Sun, Sep 28"
    pattern: new RegExp(`\\b${WEEKDAY}${MONTH}\\s+${DAY}${YEAR_AFTER_DAY}${TO}${WEEKDAY}${MONTH}\\s+${DAY}${YEAR_AFTER_DAY}`, 'i'),
    parts: (m) => [part(m[1], m[2], m[3]), part(m[4], m[5], m[6])],
  },
  {
    // "22 Sep – 28 Sep", "29 September 2025 - 5 October 2025"
    pattern: new RegExp(`\\b${WEEKDAY}${DAY}\\s+${MONTH}${YEAR_AFTER_MONTH}${TO}${WEEKDAY}${DAY}\\s+${MONTH}${YEAR_AFTER_MONTH}`, 'i'),
    parts: (m) => [part(m[2], m[1], m[3]), part(m[5], m[4], m[6])],
  },
  {
    // "Sep 22 – 28", "Sept 22-28, 2026"
    pattern: new RegExp(`\\b${MONTH}\\s+${DAY}${TO}${DAY}${YEAR_AFTER_DAY}`, 'i'),
    parts: (m) => [part(m[1], m[2], m[4]), part(m[1], m[3], m[4])],
  },
  {
    // "22–28 Sept", "22 - 28 September 2026"
    pattern: new RegExp(`(?<![\\d.,:/])\\b${DAY}${TO}${DAY}\\s+${MONTH}${YEAR_AFTER_MONTH}`, 'i'),
    parts: (m) => [part(m[3], m[1], m[4]), part(m[3], m[2], m[4])],
  },
];

const SINGLES: readonly { pattern: RegExp; part: (m: RegExpMatchArray) => Part }[] = [
  // "Mon 22 Sep", "Monday, 22 September 2026"
  { pattern: new RegExp(`\\b${WEEKDAY}${DAY}\\s+${MONTH}${YEAR_AFTER_MONTH}`, 'gi'), part: (m) => part(m[2], m[1], m[3]) },
  // "Mon, Sep 22", "September 22, 2026"
  { pattern: new RegExp(`\\b${WEEKDAY}${MONTH}\\s+${DAY}${YEAR_AFTER_DAY}`, 'gi'), part: (m) => part(m[1], m[2], m[3]) },
];

/** A date as read: month and day, and the year if it was shown. "May" in lower case is the word, not the month. */
type Part = { month: number; day: number; year: number | null; word: boolean };

function part(month: string, day: string, year: string | undefined): Part {
  return {
    month: MONTH_NUMBERS[month.slice(0, 3).toLowerCase()],
    day: Number(day),
    year: year ? Number(year) : null,
    word: month === 'may',
  };
}

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** A real calendar date, YYYY-MM-DD, or null (31 Sep, 30 Feb). */
function dateOf(year: number, month: number, day: number): string | null {
  if (!month || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 ? iso(year, month, day) : null;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/**
 * A range with its years worked out: those shown, otherwise the latest that
 * doesn't start in the future (a screenshot is of earnings already made; the
 * week in progress can end after today). A range over New Year ("Dec 29 –
 * Jan 4") starts the year before it ends.
 */
function resolveRange(from: Part, to: Part, today: string): { start: string; end: string } | null {
  if (from.word || to.word) return null;
  const crosses = to.month < from.month;
  let startYear: number;
  if (from.year !== null) startYear = from.year;
  else if (to.year !== null) startYear = to.year - (crosses ? 1 : 0);
  else {
    startYear = Number(today.slice(0, 4));
    const start = dateOf(startYear, from.month, from.day);
    if (start && daysBetween(today, start) > 1) startYear -= 1;
  }
  const endYear = to.year ?? startYear + (crosses ? 1 : 0);
  const start = dateOf(startYear, from.month, from.day);
  let end = dateOf(endYear, to.month, to.day);
  if (!start || !end || end < start || daysBetween(today, start) > 1) return null;
  // Uber's weeks run Monday 4am to Monday 4am, shown as "Sep 21 – Sep 28": the last day is the Sunday.
  if (daysBetween(start, end) === 7 && weekStartOf(start) === start) end = addDays(end, -1);
  if (daysBetween(start, end) + 1 > MAX_PERIOD_DAYS) return null;
  return { start, end };
}

/** "22/09/2026": the order follows the country (US month first); in Canada only when it can only be read one way. */
function numericDates(line: string, region: RegionCode, today: string): string[] {
  const dates: string[] = [];
  for (const match of line.matchAll(/(?<![\d.,/])(\d{1,2})[/.](\d{1,2})[/.](\d{4}|\d{2})(?![\d/.])/g)) {
    const [a, b] = [Number(match[1]), Number(match[2])];
    const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
    let order: 'dm' | 'md' | null = region === 'US' ? 'md' : region === 'CA' ? null : 'dm';
    if (region === 'CA') order = a > 12 && b <= 12 ? 'dm' : b > 12 && a <= 12 ? 'md' : null;
    if (!order) continue;
    const date = order === 'dm' ? dateOf(year, b, a) : dateOf(year, a, b);
    if (date) dates.push(date);
  }
  return dates;
}

/**
 * The day or days the earnings cover. A range is taken from the first line
 * that has one (the page's heading); failing that, a single day, but only
 * if just one day is mentioned (a list of trips has a date on every row).
 */
export function detectPeriod(
  lines: readonly string[],
  region: RegionCode,
  today: string,
): { start: string; end: string } | null {
  const tidied = tidy(lines);
  /** Lines with a range that couldn't be a real one ("Feb 30 – Mar 2"): none of their dates is taken. */
  const unreadable = new Set<string>();
  for (const line of tidied) {
    for (const { pattern, parts } of RANGES) {
      const match = line.match(pattern);
      if (!match) continue;
      const range = resolveRange(...parts(match), today);
      if (range) return range;
      unreadable.add(line);
    }
    const numeric = numericDates(line, region, today);
    if (
      numeric.length === 2 &&
      numeric[0] <= numeric[1] &&
      daysBetween(today, numeric[0]) <= 1 &&
      daysBetween(numeric[0], numeric[1]) + 1 <= MAX_PERIOD_DAYS
    ) {
      return { start: numeric[0], end: numeric[1] };
    }
  }
  const days = new Set<string>();
  for (const line of tidied) {
    if (unreadable.has(line)) continue;
    let rest = line;
    for (const { pattern, part: read } of SINGLES) {
      for (const match of rest.matchAll(pattern)) {
        const day = read(match);
        const range = resolveRange(day, day, today);
        if (range) days.add(range.start);
      }
      // Each date counted once, whichever way round it's written.
      rest = rest.replace(pattern, ' ');
    }
    for (const date of numericDates(line, region, today)) if (daysBetween(today, date) <= 1) days.add(date);
  }
  if (days.size !== 1) return null;
  const [day] = days;
  return { start: day, end: day };
}

// ─── All together ──────────────────────────────────────────────────────────

/** Everything that could be read from a screenshot's lines; anything unsure is null. */
export function parseEarningsScreenshot(lines: readonly string[], region: RegionCode, today: string): EarningsScan {
  const period = detectPeriod(lines, region, today);
  return {
    platform: detectPlatform(lines),
    start: period?.start ?? null,
    end: period?.end ?? null,
    amountMinor: detectTotal(lines, region),
    trips: detectTripCount(lines),
    distanceMeters: detectDistance(lines),
  };
}

// ─── Saved entries ─────────────────────────────────────────────────────────

/** A saved entry: one app's earnings for a day or a few days. */
export type PlatformEarning = {
  id: string;
  platform: PlatformId;
  start: string;
  end: string;
  amountMinor: number;
  trips: number | null;
  distanceMeters: number | null;
  /** The Monday of the week whose tax set-aside earnings this was added to, or null. */
  addedToWeek: string | null;
  createdAt: string;
};

export type EarningDraft = Omit<PlatformEarning, 'id' | 'addedToWeek' | 'createdAt'>;

/** The week (its Monday) a period falls in, or null when it runs over more than one week. */
export function weekOfPeriod(start: string, end: string): string | null {
  const week = weekStartOf(start);
  return weekStartOf(end) === week ? week : null;
}

/** The same app, days and amount already saved: most likely the same screenshot again. */
export function isDuplicate(saved: readonly PlatformEarning[], draft: EarningDraft): boolean {
  return saved.some(
    (entry) =>
      entry.platform === draft.platform &&
      entry.start === draft.start &&
      entry.end === draft.end &&
      entry.amountMinor === draft.amountMinor,
  );
}

/** What's wrong with an entry before it's saved (English, shown with t()), or null when it's fine. */
export function checkDraft(draft: EarningDraft, saved: readonly PlatformEarning[], today: string): string | null {
  if (draft.end < draft.start) return msg('The last day is before the first day.');
  // The week in progress can end after today, but can't start after it.
  if (draft.start > today) return msg('These dates are in the future. Check the days.');
  if (daysBetween(draft.start, draft.end) + 1 > MAX_PERIOD_DAYS) {
    return msg('Add up to 31 days at a time. For longer, add each week or month on its own.');
  }
  if (draft.amountMinor <= 0 || draft.amountMinor > MAX_WEEKLY_EARNINGS_MINOR) {
    return msg('Enter your earnings as an amount, e.g. 450 or 450.50.');
  }
  if (draft.trips !== null && (!Number.isInteger(draft.trips) || draft.trips < 0 || draft.trips > MAX_TRIP_COUNT)) {
    return msg('Enter the jobs as a whole number, or leave it empty.');
  }
  if (draft.distanceMeters !== null && (draft.distanceMeters < 0 || draft.distanceMeters > MAX_DISTANCE_METERS)) {
    return msg('Enter the distance as a number, or leave it empty.');
  }
  if (isDuplicate(saved, draft)) return msg('These earnings are already saved.');
  return null;
}

/** Work distance MileSprout logged from `start` to `end` (inclusive), in metres. */
export function workMetersBetween(
  trips: readonly Pick<DeductionTrip, 'classification' | 'localDate' | 'distanceMeters'>[],
  start: string,
  end: string,
): number {
  let meters = 0;
  for (const trip of trips) {
    if (trip.classification === 'business' && trip.localDate >= start && trip.localDate <= end) {
      meters += trip.distanceMeters;
    }
  }
  return meters;
}
