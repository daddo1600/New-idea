import {
  costsAdded,
  formatDistance,
  formatMoney,
  largestRemainder,
  taxYearBounds,
  taxYearLabel,
  taxYearOf,
  type Region,
  type Translator,
} from './regions';
import { addDays, weekStartOf } from './set-aside';
import { tripCostsMinor, type Trip } from './trip';

/**
 * The weekly recap and "Ask MileSprout" (Pro). Every figure is worked out
 * here, from the drives, the same way as the Money tab; Apple's on-device
 * model (modules/on-device-ai) only puts them into words. When it can't (an
 * older iPhone, Apple Intelligence off, an answer with a number that isn't in
 * the figures), the recap is written from a template instead (`recapLines`).
 */

export type RecapTrip = Pick<Trip, 'id' | 'localDate' | 'distanceMeters' | 'classification' | 'parkingMinor' | 'tollsMinor'>;

export type Totals = {
  workMeters: number;
  workDrives: number;
  personalMeters: number;
  personalDrives: number;
  /** Drives not yet marked Work or Personal. */
  unsortedDrives: number;
  /** Work drives at the official rates, plus parking and tolls where they're added (as the year total), minor units. */
  claimMinor: number;
  /** The day with the most work distance (the earliest on a tie); null without work drives. */
  busiest: { date: string; meters: number } | null;
};

/** Every drive from `start` to `end` (YYYY-MM-DD, both included), added up. */
export function totalsBetween(
  trips: readonly RecapTrip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  start: string,
  end: string,
  employee = false,
): Totals {
  const withCosts = costsAdded(region, employee);
  const totals: Totals = {
    workMeters: 0,
    workDrives: 0,
    personalMeters: 0,
    personalDrives: 0,
    unsortedDrives: 0,
    claimMinor: 0,
    busiest: null,
  };
  const days = new Map<string, number>();
  for (const trip of trips) {
    if (trip.localDate < start || trip.localDate > end) continue;
    if (trip.classification === 'business') {
      totals.workMeters += trip.distanceMeters;
      totals.workDrives += 1;
      totals.claimMinor += (deductions.get(trip.id) ?? 0) + (withCosts ? tripCostsMinor(trip) : 0);
      days.set(trip.localDate, (days.get(trip.localDate) ?? 0) + trip.distanceMeters);
    } else if (trip.classification === 'personal') {
      totals.personalMeters += trip.distanceMeters;
      totals.personalDrives += 1;
    } else {
      totals.unsortedDrives += 1;
    }
  }
  for (const [date, meters] of [...days].sort(([a], [b]) => a.localeCompare(b))) {
    if (!totals.busiest || meters > totals.busiest.meters) totals.busiest = { date, meters };
  }
  return totals;
}

// ─── The weekly recap ───────────────────────────────────────────────────────

export type PlatformShare = { name: string; percent: number };

export type WeekRecap = {
  /** This week so far (Monday to today), or last week (Monday to Sunday). */
  period: 'thisWeek' | 'lastWeek';
  start: string;
  end: string;
  current: Totals;
  /** The same days a week earlier. */
  previous: Totals;
  /** Work distance against `previous`, whole percent; null when there's nothing to compare with. */
  change: number | null;
  /** Earnings by app, when they're known; empty otherwise. */
  platforms: PlatformShare[];
};

/**
 * The week to recap on `today`: this week so far against the same days last
 * week, or, on a Monday or before any drive this week, last week against the
 * week before.
 */
export function weekRecap(
  trips: readonly RecapTrip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  today: string,
  options: { employee?: boolean; platformEarnings?: ReadonlyMap<string, number> } = {},
): WeekRecap {
  const employee = options.employee ?? false;
  const monday = weekStartOf(today);
  const thisWeek = totalsBetween(trips, deductions, region, monday, today, employee);
  const anyThisWeek = thisWeek.workDrives + thisWeek.personalDrives + thisWeek.unsortedDrives > 0;
  const period = today !== monday && anyThisWeek ? 'thisWeek' : 'lastWeek';
  const start = period === 'thisWeek' ? monday : addDays(monday, -7);
  const end = period === 'thisWeek' ? today : addDays(monday, -1);
  const current = period === 'thisWeek' ? thisWeek : totalsBetween(trips, deductions, region, start, end, employee);
  const previous = totalsBetween(trips, deductions, region, addDays(start, -7), addDays(end, -7), employee);
  const change =
    previous.workMeters > 0 ? Math.round(((current.workMeters - previous.workMeters) / previous.workMeters) * 100) : null;
  return { period, start, end, current, previous, change, platforms: platformShares(options.platformEarnings) };
}

/** Each app's share of the earnings, whole percent adding up to 100, biggest first. */
export function platformShares(earnings: ReadonlyMap<string, number> | undefined): PlatformShare[] {
  const entries = [...(earnings ?? [])].filter(([name, minor]) => name.trim() && minor > 0);
  const total = entries.reduce((sum, [, minor]) => sum + minor, 0);
  if (total <= 0) return [];
  const percents = largestRemainder(
    100,
    entries.map(([, minor]) => (minor / total) * 100),
  );
  return entries
    .map(([name], index) => ({ name: name.trim(), percent: percents[index] }))
    .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));
}

/** A change this small reads as "about the same". */
const SAME_PERCENT = 5;

/** "Tuesday", in `locale`. */
export function weekdayName(localDate: string, locale: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  try {
    return date.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
  } catch {
    return date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  }
}

/**
 * The recap written from a template, one sentence a line, in the app's
 * language: shown when the on-device model can't write it, and (the first
 * line) to free users. `locale` is for the weekday's name.
 */
export function recapLines(recap: WeekRecap, region: Region, locale: string, t: Translator): string[] {
  const { current, period } = recap;
  if (current.workDrives === 0) {
    const none = period === 'thisWeek' ? t('No work drives yet this week.') : t('No work drives last week.');
    return current.unsortedDrives > 0
      ? [none, t('{{count}} drives still to sort.', { count: current.unsortedDrives })]
      : [none];
  }
  const params = {
    distance: formatDistance(current.workMeters, region),
    count: current.workDrives,
    amount: formatMoney(current.claimMinor, region),
    authority: region.authority,
  };
  const lines: string[] = [];
  if (period === 'thisWeek') {
    lines.push(
      current.claimMinor > 0
        ? t('This week so far: {{distance}} for work over {{count}} drives, worth {{amount}} at {{authority}} rates.', params)
        : t('This week so far: {{distance}} for work over {{count}} drives.', params),
    );
  } else {
    lines.push(
      current.claimMinor > 0
        ? t('Last week: {{distance}} for work over {{count}} drives, worth {{amount}} at {{authority}} rates.', params)
        : t('Last week: {{distance}} for work over {{count}} drives.', params),
    );
  }
  // A busiest day only says something when the work was spread over more than one day.
  if (current.busiest && current.busiest.meters < current.workMeters) {
    lines.push(
      t('Busiest day: {{day}}, with {{distance}}.', {
        day: weekdayName(current.busiest.date, locale),
        distance: formatDistance(current.busiest.meters, region),
      }),
    );
  }
  if (recap.change !== null) {
    const percent = Math.abs(recap.change);
    if (percent < SAME_PERCENT) {
      lines.push(
        period === 'thisWeek' ? t('About the same as the same days last week.') : t('About the same as the week before.'),
      );
    } else if (recap.change > 0) {
      lines.push(
        period === 'thisWeek'
          ? t('Up {{percent}}% on the same days last week.', { percent })
          : t('Up {{percent}}% on the week before.', { percent }),
      );
    } else {
      lines.push(
        period === 'thisWeek'
          ? t('Down {{percent}}% on the same days last week.', { percent })
          : t('Down {{percent}}% on the week before.', { percent }),
      );
    }
  }
  if (recap.platforms.length > 1) {
    const list = recap.platforms.map((share) => `${share.name} ${share.percent}%`).join(', ');
    lines.push(t('Earnings by app: {{list}}.', { list }));
  }
  if (current.unsortedDrives > 0) lines.push(t('{{count}} drives still to sort.', { count: current.unsortedDrives }));
  return lines;
}

// ─── The figures given to the on-device model ───────────────────────────────

/** English names for the model: it gets every figure in English and answers in the user's language. */
function englishDay(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function englishMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** The recap's figures, one a line, for the model to put into words (it never sees a drive). */
export function recapFacts(recap: WeekRecap, region: Region): string {
  const { current, previous } = recap;
  const distance = (meters: number) => formatDistance(meters, region);
  const lines = [
    recap.period === 'thisWeek'
      ? `Period: this week so far, ${englishDay(recap.start)} to today, ${englishDay(recap.end)}`
      : `Period: last week, ${englishDay(recap.start)} to ${englishDay(recap.end)}`,
    `Work distance: ${distance(current.workMeters)}`,
    `Work drives: ${current.workDrives}`,
  ];
  if (current.claimMinor > 0) lines.push(`Worth at ${region.authority} rates: ${formatMoney(current.claimMinor, region)}`);
  if (current.busiest && current.busiest.meters < current.workMeters) {
    lines.push(`Busiest day: ${weekdayName(current.busiest.date, 'en-GB')}, with ${distance(current.busiest.meters)}`);
  }
  const before = recap.period === 'thisWeek' ? 'the same days last week' : 'the week before';
  if (recap.change !== null) {
    const percent = Math.abs(recap.change);
    lines.push(
      percent < SAME_PERCENT
        ? `Compared with ${before}: about the same (${distance(previous.workMeters)} then)`
        : `Compared with ${before}: work distance ${recap.change > 0 ? 'up' : 'down'} ${percent}% (${distance(previous.workMeters)} then)`,
    );
  } else if (current.workDrives > 0) {
    lines.push(`Compared with ${before}: no work drives then`);
  }
  if (recap.platforms.length > 1) {
    lines.push(`Earnings by app: ${recap.platforms.map((share) => `${share.name} ${share.percent}%`).join(', ')}`);
  }
  if (current.personalDrives > 0) lines.push(`Personal distance: ${distance(current.personalMeters)}`);
  if (current.unsortedDrives > 0) lines.push(`Drives still to sort: ${current.unsortedDrives}`);
  return lines.map((line) => `- ${line}`).join('\n');
}

export type MonthSummary = { month: string; totals: Totals };
export type WeekSummary = { start: string; end: string; totals: Totals };

export type DriveSummary = {
  today: string;
  /** This month and the 11 before, newest first. */
  months: MonthSummary[];
  /** This week and the 7 before (Monday to Sunday), newest first. */
  weeks: WeekSummary[];
  /** Work by weekday over the months, Monday first. */
  weekdays: { workMeters: number; workDrives: number }[];
  /** The busiest work day over the months. */
  busiest: { date: string; meters: number } | null;
  /** This tax year so far, and last tax year. */
  taxYears: { label: string; start: string; end: string; totals: Totals; current: boolean }[];
};

export const SUMMARY_MONTHS = 12;
export const SUMMARY_WEEKS = 8;

function monthEnd(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function monthsBack(today: string, count: number): string[] {
  let [y, m] = today.split('-').map(Number);
  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    months.push(`${y}-${String(m).padStart(2, '0')}`);
    m -= 1;
    if (m === 0) [y, m] = [y - 1, 12];
  }
  return months;
}

/**
 * Every figure "Ask MileSprout" can answer from: month by month for a year,
 * week by week for eight weeks, by weekday, the busiest day and the tax years.
 * A few hundred words, so it fits the on-device model's context with room for
 * the question and the answer.
 */
export function buildDriveSummary(
  trips: readonly RecapTrip[],
  deductions: ReadonlyMap<string, number>,
  region: Region,
  today: string,
  options: { employee?: boolean } = {},
): DriveSummary {
  const employee = options.employee ?? false;
  const between = (start: string, end: string) => totalsBetween(trips, deductions, region, start, end, employee);
  const months = monthsBack(today, SUMMARY_MONTHS).map((month) => ({
    month,
    totals: between(`${month}-01`, monthEnd(month) < today ? monthEnd(month) : today),
  }));
  const monday = weekStartOf(today);
  const weeks = Array.from({ length: SUMMARY_WEEKS }, (_, i) => {
    const start = addDays(monday, -7 * i);
    const end = i === 0 ? today : addDays(start, 6);
    return { start, end, totals: between(start, end) };
  });
  const first = `${months[months.length - 1].month}-01`;
  const weekdays = Array.from({ length: 7 }, () => ({ workMeters: 0, workDrives: 0 }));
  for (const trip of trips) {
    if (trip.classification !== 'business' || trip.localDate < first || trip.localDate > today) continue;
    const [y, m, d] = trip.localDate.split('-').map(Number);
    const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    weekdays[weekday].workMeters += trip.distanceMeters;
    weekdays[weekday].workDrives += 1;
  }
  const year = taxYearOf(today, region);
  const taxYears = [year, year - 1].map((taxYear) => {
    const { start, end } = taxYearBounds(taxYear, region);
    const until = end < today ? end : today;
    return { label: taxYearLabel(taxYear, region), start, end: until, totals: between(start, until), current: taxYear === year };
  });
  return { today, months, weeks, weekdays, busiest: between(first, today).busiest, taxYears };
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** The summary as short English lines, the numbers already formatted, for the model's instructions. */
export function summaryText(summary: DriveSummary, region: Region, employee = false): string {
  const distance = (meters: number) => formatDistance(meters, region);
  const money = (minor: number) => formatMoney(minor, region);
  const describe = (totals: Totals, withBusiest = true) => {
    const parts = [
      `work ${distance(totals.workMeters)} in ${totals.workDrives} ${totals.workDrives === 1 ? 'drive' : 'drives'}`,
      `claim ${money(totals.claimMinor)}`,
      `personal ${distance(totals.personalMeters)}`,
    ];
    if (totals.unsortedDrives > 0) parts.push(`${totals.unsortedDrives} not sorted yet`);
    if (withBusiest && totals.busiest) parts.push(`busiest day ${englishDay(totals.busiest.date)} (${distance(totals.busiest.meters)})`);
    return parts.join('; ');
  };
  const thisMonth = summary.months[0]?.month;
  const lastMonth = summary.months[1]?.month;
  const lines = [
    `Today is ${englishDay(summary.today)}.`,
    `Distances are in ${region.unit === 'mi' ? 'miles (mi)' : 'kilometres (km)'}; money in ${region.currency}.`,
    `"Work" means drives marked Work. "Claim" means work distance at the ${region.authority} rates${
      costsAdded(region, employee) ? ', plus parking and tolls' : ''
    }: an estimate of what the driver can claim.`,
    '',
    'Tax years:',
    ...summary.taxYears.map(
      (year) =>
        `- ${year.label} tax year (${englishDay(year.start)} to ${englishDay(year.end)}${year.current ? ', so far' : ''}): ${describe(year.totals, false)}`,
    ),
    '',
    `Months, newest first (the last ${SUMMARY_MONTHS} months):`,
    ...summary.months.map((month) => {
      const tag = month.month === thisMonth ? ' (this month, so far)' : month.month === lastMonth ? ' (last month)' : '';
      return `- ${englishMonth(month.month)}${tag}: ${describe(month.totals)}`;
    }),
    '',
    'Weeks, Monday to Sunday, newest first:',
    ...summary.weeks.map((week, index) => {
      const tag = index === 0 ? ' (this week, so far)' : index === 1 ? ' (last week)' : '';
      return `- Week of ${englishDay(week.start)}${tag}: ${describe(week.totals)}`;
    }),
    '',
    `Work by day of the week (last ${SUMMARY_MONTHS} months):`,
    ...summary.weekdays.map(
      (day, index) => `- ${WEEKDAYS[index]}s: ${distance(day.workMeters)} in ${day.workDrives} ${day.workDrives === 1 ? 'drive' : 'drives'}`,
    ),
    '',
    summary.busiest
      ? `Busiest single day (last ${SUMMARY_MONTHS} months): ${englishDay(summary.busiest.date)}, ${distance(summary.busiest.meters)} for work.`
      : `No work drives in the last ${SUMMARY_MONTHS} months.`,
  ];
  return lines.join('\n');
}

// ─── Checking what the model wrote ──────────────────────────────────────────

/** Where each script's digit zero is (ASCII, Arabic-Indic, Devanagari, Bengali, Gurmukhi, full width). */
const ZEROS = [0x30, 0x660, 0x6f0, 0x966, 0x9e6, 0xa66, 0xff10];
const NUMBER = /\p{Nd}+(?:[.,'   ]\p{Nd}+)*/gu;

function asciiDigits(text: string): string {
  let out = '';
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const zero = ZEROS.find((z) => code >= z && code <= z + 9);
    if (zero !== undefined) out += String(code - zero);
  }
  // "09" and "9" are the same day.
  return out.replace(/^0+(?=\d)/, '');
}

/**
 * The numbers in `text`, as their digits (separators dropped, so "1,234.5",
 * "1 234,5" and "1234.5" match). With `wholeToo`, a figure's whole part
 * counts as well ("£12.40" allows "£12").
 */
export function numbersIn(text: string, wholeToo = false): Set<string> {
  const found = new Set<string>();
  for (const [token] of text.matchAll(NUMBER)) {
    found.add(asciiDigits(token));
    if (wholeToo) found.add(asciiDigits(token.split('.')[0]));
  }
  return found;
}

export const MAX_ANSWER_LENGTH = 700;

/**
 * What the model wrote, tidied (no Markdown), or null when it can't be shown:
 * empty, too long, or with a number that isn't in `sources` (the figures it
 * was given and the question). The model words the figures; it never makes
 * one up.
 */
export function checkAnswer(answer: string, sources: readonly string[]): string | null {
  const plain = answer.replace(/\*\*|__|`|^#+\s*/gm, '').replace(/^\s*[-•]\s+/gm, '');
  // Spaces tidied after the numbers are read: a narrow space can be a thousands separator ("1 234,5").
  const text = plain.replace(/\s+/g, ' ').trim();
  if (!text || text.length > MAX_ANSWER_LENGTH) return null;
  const allowed = new Set<string>();
  for (const source of sources) for (const number of numbersIn(source, true)) allowed.add(number);
  for (const number of numbersIn(plain)) if (!allowed.has(number)) return null;
  return text;
}

// ─── What the model is told ─────────────────────────────────────────────────

const RULES = [
  'Use only the figures given. Copy every number exactly as written, with its unit or currency symbol.',
  'Never calculate, add up, convert, round or guess a number, and never mention a number that is not in the figures.',
  'Say "work" drives, never "business". Plain, friendly words for a delivery or rideshare driver. No Markdown, no lists, no tax advice.',
];

/** For the weekly recap; `language` is the language's English name ("French"). */
export function recapInstructions(language: string): string {
  return [
    'You write a short weekly recap for a driver who logs their mileage with the MileSprout app.',
    ...RULES,
    'Write two or three short sentences. No greeting, no sign-off.',
    `Write in ${language}.`,
  ].join('\n');
}

export function recapPrompt(facts: string): string {
  return `Figures for the recap:\n${facts}\n\nWrite the recap.`;
}

/** For Ask MileSprout: the rules, then the figures (`summary`, from summaryText). */
export function askInstructions(language: string, summary: string): string {
  return [
    'You answer a driver’s questions about the drives they logged in the MileSprout app.',
    ...RULES,
    `If the figures below don’t answer the question, say that you can answer questions about their drives in the last ${SUMMARY_MONTHS} months, by month, week, weekday or tax year.`,
    'Answer in one or two short sentences.',
    `Answer in ${language}.`,
    '',
    'THE FIGURES:',
    summary,
  ].join('\n');
}

/** The longest question taken. */
export const MAX_QUESTION_LENGTH = 200;
