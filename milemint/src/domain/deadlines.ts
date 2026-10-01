import { msg, t } from '../i18n/i18n';
import { formatLongDate, type Region, type RegionCode, taxYearBounds, taxYearLabel, taxYearOf } from './regions';

/**
 * When and how drivers send their figures to the tax office, per region, and
 * the countdowns built on it: the end of the tax year (last chance to get
 * every drive logged) and the return deadline after it (time to export the
 * report).
 *
 * Sources (checked Oct 2026):
 *   GB  Self Assessment online by 31 Jan after the tax year. Making Tax Digital
 *       for Income Tax: quarterly updates from Apr 2026 above £50,000 of
 *       self-employed and property income, £30,000 from Apr 2027, £20,000 from
 *       Apr 2028. Employees: P87 or Self Assessment, up to 4 years back.
 *   US  Form 1040 by 15 Apr (next business day if a weekend). 1040-ES
 *       estimated tax 15 Apr, 15 Jun, 15 Sep, 15 Jan. Unreimbursed employee
 *       expenses are no longer deductible on the federal return.
 *   CA  Return by 30 Apr, or 15 Jun if self-employed (tax owing still due
 *       30 Apr). Instalments 15 Mar, 15 Jun, 15 Sep, 15 Dec when net tax owing
 *       is over $3,000.
 *   AU  Lodge by 31 Oct yourself, later through a registered tax agent. BAS and
 *       PAYG instalments quarterly when registered (28 Oct, 28 Feb, 28 Apr,
 *       28 Jul); rideshare drivers must register for GST from the first ride.
 */

export type FilingGuide = {
  /** The yearly return, as people call it. */
  returnName: string;
  /** "Your {{year}} tax return is due", a whole sentence so it translates well. */
  returnIsDue: string;
  /** Reminder a month before the return is due ({{year}} is the tax year label). */
  returnDueInMonth: string;
  /** Reminder a week before the return is due. */
  returnDueInWeek: string;
  /** "31 January", shown in sentences. */
  dueText: string;
  /** Month and day the return for a tax year is due, in the year after the tax year ends. */
  due: { month: number; day: number };
  /** Roll a weekend deadline to the Monday (the IRS does; others take it on the day). */
  weekendRolls: boolean;
  /** Who files yearly and what goes in. */
  yearly: string;
  /** Who also sends something every quarter, and when. Null when nobody does it for mileage. */
  quarterly: string | null;
  /** Employees who use their own car. */
  employees: string;
};

export const FILING: Record<RegionCode, FilingGuide> = {
  GB: {
    returnName: msg('Self Assessment return'),
    returnIsDue: msg('Your {{year}} Self Assessment return is due'),
    returnDueInMonth: msg('Your {{year}} Self Assessment return is due in a month'),
    returnDueInWeek: msg('Self Assessment return due in a week 📄'),
    dueText: msg('31 January'),
    due: { month: 1, day: 31 },
    weekendRolls: false,
    yearly:
      msg('Self-employed: once a year, online by 31 January after the tax year ends (5 April). Your mileage goes in Car, van and travel expenses.'),
    quarterly:
      msg('Making Tax Digital: if your self-employed and property income is over £50,000 (£30,000 from April 2027, £20,000 from April 2028), you also send quarterly updates through MTD software by 7 August, 7 November, 7 February and 7 May. Your mileage counts towards each update.'),
    employees:
      msg('Employees: if your employer pays less than 55p a mile (or nothing), claim the difference with form P87 or on Self Assessment. You can go back 4 tax years.'),
  },
  US: {
    returnName: msg('tax return (Form 1040)'),
    returnIsDue: msg('Your {{year}} tax return (Form 1040) is due'),
    returnDueInMonth: msg('Your {{year}} tax return (Form 1040) is due in a month'),
    returnDueInWeek: msg('Tax return (Form 1040) due in a week 📄'),
    dueText: msg('April 15'),
    due: { month: 4, day: 15 },
    weekendRolls: true,
    yearly:
      msg('Self-employed: once a year on Form 1040 with Schedule C, due April 15 (October 15 with an extension, but tax owed is still due in April).'),
    quarterly:
      msg('Estimated tax: if you expect to owe $1,000 or more, pay quarterly with Form 1040-ES by April 15, June 15, September 15 and January 15. Your mileage lowers your profit, so keep it up to date to avoid overpaying.'),
    employees:
      msg('Employees: unreimbursed mileage can’t be deducted on your federal return. Use your log to get paid back by your employer; a few states still allow a deduction.'),
  },
  CA: {
    returnName: msg('tax return'),
    returnIsDue: msg('Your {{year}} tax return is due'),
    returnDueInMonth: msg('Your {{year}} tax return is due in a month'),
    returnDueInWeek: msg('Tax return due in a week 📄'),
    dueText: msg('April 30'),
    due: { month: 4, day: 30 },
    weekendRolls: false,
    yearly:
      msg('Once a year: by April 30, or June 15 if you’re self-employed (any tax owing is still due April 30). Self-employed claim vehicle costs on form T2125.'),
    quarterly:
      msg('Instalments: if your net tax owing is over $3,000 ($1,800 in Quebec), CRA asks for quarterly payments by March 15, June 15, September 15 and December 15.'),
    employees:
      msg('Employees: with a signed T2200 from your employer, claim vehicle expenses on form T777. Otherwise, use your log to get reimbursed at the per-km rate.'),
  },
  AU: {
    returnName: msg('tax return'),
    returnIsDue: msg('Your {{year}} tax return is due'),
    returnDueInMonth: msg('Your {{year}} tax return is due in a month'),
    returnDueInWeek: msg('Tax return due in a week 📄'),
    dueText: msg('31 October'),
    due: { month: 10, day: 31 },
    weekendRolls: false,
    yearly:
      msg('Once a year: lodge by 31 October after the income year ends (30 June), or later if you use a registered tax agent and sign up with them before 31 October.'),
    quarterly:
      msg('BAS: if you’re registered for GST or pay PAYG instalments, you lodge quarterly by 28 October, 28 February, 28 April and 28 July. Rideshare drivers must register for GST from their first ride; delivery riders only once turnover reaches $75,000.'),
    employees:
      msg('Employees: claim work-related car expenses at D1 on your return, up to 5,000 km per car with the cents per km method.'),
  },
};

/** Countdown windows: shown from this many days out. */
export const YEAR_END_WINDOW_DAYS = 60;
export const RETURN_WINDOW_DAYS = 60;

const DAY = 86_400_000;
const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const utc = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const daysBetween = (from: string, to: string) => Math.round((utc(to) - utc(from)) / DAY);

/** The return deadline (YYYY-MM-DD) for the tax year starting in `startYear`. */
export function returnDueDate(startYear: number, region: Region): string {
  const guide = FILING[region.code];
  const endYear = Number(taxYearBounds(startYear, region).end.slice(0, 4));
  // Due in the year after the tax year ends, unless the date still falls after the year end.
  const sameYear = `${endYear}-${String(guide.due.month).padStart(2, '0')}-${String(guide.due.day).padStart(2, '0')}`;
  const year = sameYear > taxYearBounds(startYear, region).end ? endYear : endYear + 1;
  const date = new Date(Date.UTC(year, guide.due.month - 1, guide.due.day));
  if (guide.weekendRolls) {
    const weekday = date.getUTCDay();
    if (weekday === 6) date.setUTCDate(date.getUTCDate() + 2);
    if (weekday === 0) date.setUTCDate(date.getUTCDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

export type Countdown =
  | {
      kind: 'year-end';
      /** Days left including today: 1 on the last day. */
      days: number;
      /** Last day of the tax year, YYYY-MM-DD. */
      date: string;
      taxYear: number;
      label: string;
    }
  | {
      kind: 'return';
      days: number;
      date: string;
      taxYear: number;
      label: string;
    };

/**
 * The countdown to show today, if any: the end of the tax year within its
 * last two months, otherwise the return deadline for the year just ended
 * within the two months before it.
 */
export function activeCountdown(region: Region, today: Date = new Date()): Countdown | null {
  const now = toIso(today);
  const year = taxYearOf(now, region);
  const end = taxYearBounds(year, region).end;
  const toEnd = daysBetween(now, end) + 1;
  if (toEnd <= YEAR_END_WINDOW_DAYS) {
    return {
      kind: 'year-end',
      days: toEnd,
      date: end,
      taxYear: year,
      label: taxYearLabel(year, region),
    };
  }
  const due = returnDueDate(year - 1, region);
  const toDue = daysBetween(now, due);
  if (toDue >= 0 && toDue < RETURN_WINDOW_DAYS) {
    return {
      kind: 'return',
      days: toDue,
      date: due,
      taxYear: year - 1,
      label: taxYearLabel(year - 1, region),
    };
  }
  return null;
}

/** "23 days", "1 day", "today", in the current language. */
export function daysText(days: number): string {
  if (days <= 0) return t('today');
  return t('{{count}} days', { count: days });
}

/** Reminder notifications ahead of the next year end and the next return deadline. */
export function countdownReminders(
  region: Region,
  today: Date = new Date(),
): { id: string; date: string; title: string; body: string }[] {
  const now = toIso(today);
  const year = taxYearOf(now, region);
  const end = taxYearBounds(year, region).end;
  const km = region.unit === 'km';
  const label = taxYearLabel(year, region);
  const guide = FILING[region.code];
  const minus = (date: string, days: number) => new Date(utc(date) - days * DAY).toISOString().slice(0, 10);
  const endDate = formatLongDate(end, region);
  // Year end: two months, one month and one week out. Written now, in the current language.
  const yearEnd = [
    {
      before: 60,
      title: t('2 months left in the {{year}} tax year ⏳', { year: label }),
      body: km
        ? t('Time to get your kilometres up to date. Add any drives you missed so you claim everything you’re owed.')
        : t('Time to get your miles up to date. Add any drives you missed so you claim everything you’re owed.'),
    },
    {
      before: 30,
      title: t('1 month left in the {{year}} tax year', { year: label }),
      body: km
        ? t('Sort your drives and add any you missed before {{date}}. Every business kilometre is money back.', {
            date: endDate,
          })
        : t('Sort your drives and add any you missed before {{date}}. Every business mile is money back.', {
            date: endDate,
          }),
    },
    {
      before: 7,
      title: t('One week left in the {{year}} tax year 🏁', { year: label }),
      body: t('Last call: make sure every business drive is in MileMint before {{date}}.', { date: endDate }),
    },
  ].map((r, i) => ({
    id: `year-end-${i}`,
    date: minus(end, r.before),
    title: r.title,
    body: r.body,
  }));
  // The return for the year that's just ended, or for this one if that's already past.
  const pastDue = returnDueDate(year - 1, region);
  const dueYear = pastDue >= now ? year - 1 : year;
  const due = dueYear === year - 1 ? pastDue : returnDueDate(year, region);
  const dueLabel = taxYearLabel(dueYear, region);
  const returnDue = [
    {
      before: 30,
      title: t(guide.returnDueInMonth, { year: dueLabel }),
      body: t('Your mileage report is ready. Export it now so the figures are to hand.'),
    },
    {
      before: 7,
      title: t(guide.returnDueInWeek),
      body: t('Export your {{year}} mileage report from MileMint and you’re one step closer.', { year: dueLabel }),
    },
  ].map((r, i) => ({
    id: `return-${i}`,
    date: minus(due, r.before),
    title: r.title,
    body: r.body,
  }));
  return [...yearEnd, ...returnDue].filter((r) => r.date > now);
}
