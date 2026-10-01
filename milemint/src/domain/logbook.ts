import { msg } from '../i18n/i18n';
import {
  computeDeductions,
  REGIONS,
  taxYearBounds,
  taxYearLabel,
  taxYearOf,
  type Region,
} from './regions';
import { toLocalIsoDate, type Trip } from './trip';

/**
 * The ATO logbook method (Australia). The cents per km method stops at 5,000
 * business km per car a year; drivers who do more usually claim more by
 * keeping a logbook for 12 continuous weeks, which gives the car's
 * business-use percentage, and claiming that share of the year's actual car
 * expenses. Pure, so the figures on screen, in the CSV and in the PDF are the
 * ones tested here.
 *
 * ATO rules as modelled (checked Oct 2026; ato.gov.au "Logbook method"):
 * - The logbook covers a continuous 12-week period that is representative of
 *   the car's use over the year.
 * - It records when the period starts and ends, the odometer at its start and
 *   end, the total km travelled in it, and for each business journey: start
 *   and end dates, odometer at start and end, km travelled and the reason for
 *   the journey. It also states the business-use percentage.
 * - The business-use percentage is business km ÷ total km travelled in the
 *   period. The ATO doesn't prescribe rounding; we show and apply it as a
 *   whole percentage, as most logbooks state it.
 * - A logbook can be used for the income year it was kept in and the next
 *   4 (5 years in all), unless circumstances change (a new job, a different
 *   car, a change in how much you drive for work); then a new one is needed.
 * - Uncertain: when the 12 weeks straddle two income years (started in May,
 *   ended in August), we treat the logbook as kept in the income year it
 *   started in. Our understanding is that the ATO allows this, but we haven't
 *   found it stated plainly, so the screen says to check.
 * - Also needed, and outside this logbook: odometer readings at the start and
 *   end of each income year the method is used (the report's odometer card),
 *   and receipts for the expenses. With more than one car on the logbook
 *   method, the logbooks should cover the same 12 weeks; we don't enforce that.
 * - Depreciation is limited by the car cost limit for the year the car was
 *   bought; we take the user's figure as entered.
 */

/** A logbook period lasts 12 weeks (84 days, both ends included). */
export const LOGBOOK_WEEKS = 12;
export const LOGBOOK_DAYS = LOGBOOK_WEEKS * 7;
/** Income years a completed logbook covers: the one it was kept in and the next 4. */
export const LOGBOOK_VALID_YEARS = 5;
/** The cents per km method's limit per car per income year. */
export const CENTS_PER_KM_LIMIT_KM = 5_000;

const METERS_PER_KM = 1000;

export type Logbook = {
  id: string;
  /** The garage vehicle (a car) the logbook is for. */
  vehicleId: string;
  /** First day of the period (YYYY-MM-DD). */
  startDate: string;
  /** Last day of the period: 12 weeks after the start, or earlier if closed early. */
  endDate: string;
  /** Odometer readings off the car, in km; null until entered. */
  odometerStart: number | null;
  odometerEnd: number | null;
  createdAt: string;
};

/** Yearly car running costs, in cents, for the deduction estimate. */
export type ExpenseCategory = 'fuel' | 'registration' | 'insurance' | 'repairs' | 'interest' | 'depreciation' | 'other';

export type CarExpenses = Partial<Record<ExpenseCategory, number>>;

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'fuel',
  'registration',
  'insurance',
  'repairs',
  'interest',
  'depreciation',
  'other',
];

/** Category names, marked for translation (the CSV and PDF keep them in English). */
export const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  fuel: msg('Fuel and oil'),
  registration: msg('Registration'),
  insurance: msg('Insurance'),
  repairs: msg('Servicing and repairs'),
  interest: msg('Loan interest'),
  depreciation: msg('Depreciation'),
  other: msg('Other (lease, tyres, roadside assistance)'),
};

// ─── Dates ──────────────────────────────────────────────────────────────────

/** `date` (YYYY-MM-DD) moved by `days`. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (0 when the same day). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000);
}

/** The last day of a full 12-week period starting on `startDate`. */
export function plannedEndDate(startDate: string): string {
  return addDays(startDate, LOGBOOK_DAYS - 1);
}

/** The income year the logbook counts as kept in (the one it started in; see the note above). */
export function logbookTaxYear(logbook: Pick<Logbook, 'startDate'>): number {
  return taxYearOf(logbook.startDate, REGIONS.AU);
}

/** The income years (start years) a logbook can be used for: the year it was kept in and the next 4. */
export function validTaxYears(logbook: Pick<Logbook, 'startDate'>): { first: number; last: number } {
  const first = logbookTaxYear(logbook);
  return { first, last: first + LOGBOOK_VALID_YEARS - 1 };
}

/** The day a drive ended, on the phone's calendar; never before the day it started. */
function journeyEndDate(trip: Trip): string {
  if (!trip.endedAt) return trip.localDate;
  const end = toLocalIsoDate(new Date(trip.endedAt));
  return end < trip.localDate ? trip.localDate : end;
}

// ─── The logbook's figures ──────────────────────────────────────────────────

export type LogbookJourney = {
  trip: Trip;
  startDate: string;
  endDate: string;
  km: number;
  /**
   * Odometer at the start and end of the journey, worked out from the reading
   * at the start of the logbook plus the GPS distance of every drive logged
   * since (not read off the car). Null without a starting reading.
   */
  odometerStart: number | null;
  odometerEnd: number | null;
};

export type LogbookStatus =
  /** The period starts in the future. */
  | 'not-started'
  | 'in-progress'
  /** All 12 weeks are behind us. */
  | 'complete'
  /** Ended before 12 weeks: not a valid ATO logbook. */
  | 'closed-early';

export type LogbookSummary = {
  logbook: Logbook;
  plannedEnd: string;
  status: LogbookStatus;
  /** 1–12 while in progress; 12 once the period is over. */
  week: number;
  /** Days of the period gone by (0 before it starts, up to 84). */
  daysElapsed: number;
  /** Days still to go after today. */
  daysLeft: number;
  /** Business journeys in the period, oldest first. */
  journeys: LogbookJourney[];
  /** Every drive MileMint logged in this car in the period, in km. */
  loggedKm: number;
  businessKm: number;
  /** Odometer end minus start, when both readings are in and make sense. */
  odometerKm: number | null;
  /** The period's total km: by odometer when available, else what MileMint logged. */
  totalKm: number;
  /**
   * Where the total came from. 'logged' means the odometer readings are
   * missing (or don't add up), so driving MileMint didn't log isn't counted
   * and the percentage is likely too high: shown as a warning.
   */
  basis: 'odometer' | 'logged';
  /** Business km ÷ total km as a whole percentage (0–100), or null with no driving yet. */
  businessPercent: number | null;
  /** More business km logged than the odometer shows: a reading is probably wrong. */
  readingsInconsistent: boolean;
  /** Drives in the period still to be sorted; they count as private until they are. */
  unclassifiedCount: number;
  /** Logged drives with no business reason written down; the ATO asks for one. */
  missingReasonCount: number;
};

const kmOf = (trip: Pick<Trip, 'distanceMeters'>) => trip.distanceMeters / METERS_PER_KM;
const round1 = (value: number) => Math.round(value * 10) / 10;

/** Drives in `logbook`'s car within its period. */
export function tripsInLogbook(trips: readonly Trip[], logbook: Logbook): Trip[] {
  return trips
    .filter(
      (trip) =>
        trip.vehicleId === logbook.vehicleId &&
        trip.localDate >= logbook.startDate &&
        trip.localDate <= logbook.endDate,
    )
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

/**
 * Everything the ATO asks a logbook to show, from the drives logged in the
 * car during the period and the odometer readings. `today` is a local date.
 */
export function summarizeLogbook(logbook: Logbook, trips: readonly Trip[], today: string): LogbookSummary {
  const plannedEnd = plannedEndDate(logbook.startDate);
  const closedEarly = logbook.endDate < plannedEnd;
  const inPeriod = tripsInLogbook(trips, logbook);

  const daysElapsed = Math.max(0, Math.min(daysBetween(logbook.startDate, today) + 1, LOGBOOK_DAYS));
  let status: LogbookStatus;
  if (closedEarly) status = 'closed-early';
  else if (today < logbook.startDate) status = 'not-started';
  else if (today > logbook.endDate) status = 'complete';
  else status = 'in-progress';
  const week = status === 'complete' ? LOGBOOK_WEEKS : Math.max(1, Math.min(LOGBOOK_WEEKS, Math.ceil(daysElapsed / 7)));
  const daysLeft = status === 'in-progress' ? daysBetween(today, logbook.endDate) : status === 'not-started' ? LOGBOOK_DAYS : 0;

  const journeys: LogbookJourney[] = [];
  let loggedKm = 0;
  let businessKm = 0;
  let unclassifiedCount = 0;
  let missingReasonCount = 0;
  for (const trip of inPeriod) {
    const km = kmOf(trip);
    const odometerStart = logbook.odometerStart === null ? null : round1(logbook.odometerStart + loggedKm);
    loggedKm += km;
    if (trip.classification === 'unclassified') unclassifiedCount += 1;
    if (trip.classification !== 'business') continue;
    businessKm += km;
    if (!trip.purpose.trim()) missingReasonCount += 1;
    journeys.push({
      trip,
      startDate: trip.localDate,
      endDate: journeyEndDate(trip),
      km,
      odometerStart,
      odometerEnd: odometerStart === null ? null : round1(odometerStart + km),
    });
  }

  const { odometerStart: start, odometerEnd: end } = logbook;
  const odometerKm = start !== null && end !== null && end > start ? end - start : null;
  // GPS distance can run a little over the odometer; well over means a typo in a reading.
  const readingsInconsistent = odometerKm !== null && businessKm > odometerKm * 1.05;
  const basis = odometerKm !== null && !readingsInconsistent ? 'odometer' : 'logged';
  const totalKm = basis === 'odometer' ? (odometerKm as number) : loggedKm;
  const businessPercent = totalKm > 0 ? Math.min(100, Math.round((businessKm / totalKm) * 100)) : null;

  return {
    logbook,
    plannedEnd,
    status,
    week,
    daysElapsed,
    daysLeft,
    journeys,
    loggedKm,
    businessKm,
    odometerKm,
    totalKm,
    basis,
    businessPercent,
    readingsInconsistent,
    unclassifiedCount,
    missingReasonCount,
  };
}

/**
 * Whether the logbook can be used to claim for the income year starting in
 * `taxYear`: the full 12 weeks kept, both odometer readings in, and no more
 * than 5 income years old.
 */
export function logbookValidFor(summary: LogbookSummary, taxYear: number): boolean {
  const { first, last } = validTaxYears(summary.logbook);
  return summary.status === 'complete' && summary.basis === 'odometer' && taxYear >= first && taxYear <= last;
}

/** The logbook to use for a car in an income year: the newest one valid for it, if any. */
export function logbookForYear(summaries: readonly LogbookSummary[], vehicleId: string, taxYear: number): LogbookSummary | null {
  return (
    summaries
      .filter((s) => s.logbook.vehicleId === vehicleId && logbookValidFor(s, taxYear))
      .sort((a, b) => b.logbook.startDate.localeCompare(a.logbook.startDate))[0] ?? null
  );
}

/**
 * The logbook to show for each car in an income year's report: the one valid
 * for that year, else the newest one kept in it (still running, closed early
 * or waiting for its odometer readings), so the report says where it stands.
 */
export function logbooksForReport(summaries: readonly LogbookSummary[], taxYear: number): LogbookSummary[] {
  const cars = [...new Set(summaries.map((s) => s.logbook.vehicleId))];
  return cars.flatMap((vehicleId) => {
    const valid = logbookForYear(summaries, vehicleId, taxYear);
    if (valid) return [valid];
    const kept = summaries
      .filter((s) => s.logbook.vehicleId === vehicleId && logbookTaxYear(s.logbook) === taxYear)
      .sort((a, b) => b.logbook.startDate.localeCompare(a.logbook.startDate))[0];
    return kept ? [kept] : [];
  });
}

// ─── Deduction estimate and comparison ──────────────────────────────────────

export function totalExpenses(expenses: CarExpenses): number {
  return EXPENSE_CATEGORIES.reduce((sum, category) => sum + Math.max(0, expenses[category] ?? 0), 0);
}

/** Logbook method estimate in cents: the year's car expenses × business-use %. Null without both. */
export function logbookDeduction(expenses: CarExpenses | null, businessPercent: number | null): number | null {
  if (!expenses || businessPercent === null) return null;
  const total = totalExpenses(expenses);
  if (total <= 0) return null;
  return Math.round((total * businessPercent) / 100);
}

export type CentsPerKmEstimate = {
  /** Business km driven in this car in the income year. */
  businessKm: number;
  /** The part of it the method allows (up to 5,000 km). */
  claimableKm: number;
  /** Cents. */
  deduction: number;
};

/** What the cents per km method gives for one car in an income year, with the 5,000 km limit applied. */
export function centsPerKmForVehicle(
  trips: readonly Trip[],
  vehicleId: string,
  taxYear: number,
  region: Region = REGIONS.AU,
): CentsPerKmEstimate {
  const own = trips.filter(
    (trip) => trip.vehicleId === vehicleId && (trip.vehicle ?? 'car') === 'car' && taxYearOf(trip.localDate, region) === taxYear,
  );
  const deductions = computeDeductions(own, region);
  const businessKm = own.filter((trip) => trip.classification === 'business').reduce((sum, trip) => sum + kmOf(trip), 0);
  let deduction = 0;
  for (const value of deductions.values()) deduction += value;
  return { businessKm, claimableKm: Math.min(businessKm, CENTS_PER_KM_LIMIT_KM), deduction };
}

export type MethodComparison = {
  /** Which looks better; 'unknown' until there are expenses and a business-use % to compare. */
  better: 'logbook' | 'cents-per-km' | 'same' | 'unknown';
  centsPerKm: number;
  logbook: number | null;
  /** How much more the better method gives, in cents. */
  difference: number;
};

/** Cents per km (capped) against the logbook estimate. An estimate only: not tax advice. */
export function compareMethods(centsPerKm: number, logbook: number | null): MethodComparison {
  if (logbook === null) return { better: 'unknown', centsPerKm, logbook, difference: 0 };
  const difference = Math.abs(logbook - centsPerKm);
  const better = logbook > centsPerKm ? 'logbook' : logbook < centsPerKm ? 'cents-per-km' : 'same';
  return { better, centsPerKm, logbook, difference };
}

export type KmCapNudge = { vehicleId: string; businessKm: number; projectedKm: number };

/** Projections need a few weeks of driving before they mean anything. */
const MIN_DAYS_TO_PROJECT = 28;

/**
 * Cars that have passed, or are on track to pass, the 5,000 km cents per km
 * limit this income year: worth telling about the logbook method. The
 * projection is the year's business km so far scaled to the full year.
 */
export function carsOverKmLimit(trips: readonly Trip[], today: string, region: Region = REGIONS.AU): KmCapNudge[] {
  if (!region.limitsPerVehicle) return [];
  const year = taxYearOf(today, region);
  const { start, end } = taxYearBounds(year, region);
  const elapsed = daysBetween(start, today) + 1;
  const length = daysBetween(start, end) + 1;
  const byCar = new Map<string, number>();
  for (const trip of trips) {
    if (!trip.vehicleId || (trip.vehicle ?? 'car') !== 'car' || trip.classification !== 'business') continue;
    if (taxYearOf(trip.localDate, region) !== year) continue;
    byCar.set(trip.vehicleId, (byCar.get(trip.vehicleId) ?? 0) + kmOf(trip));
  }
  return [...byCar.entries()]
    .map(([vehicleId, businessKm]) => ({
      vehicleId,
      businessKm,
      projectedKm: elapsed >= MIN_DAYS_TO_PROJECT ? (businessKm / elapsed) * length : businessKm,
    }))
    .filter((car) => car.businessKm >= CENTS_PER_KM_LIMIT_KM || car.projectedKm >= CENTS_PER_KM_LIMIT_KM)
    .sort((a, b) => b.projectedKm - a.projectedKm);
}

// ─── Report wording (English: the CSV and PDF go to the ATO) ────────────────

const AU = REGIONS.AU;

/** e.g. "2026–27 to 2030–31". */
export function validYearsText(logbook: Pick<Logbook, 'startDate'>): string {
  const { first, last } = validTaxYears(logbook);
  return `${taxYearLabel(first, AU)} to ${taxYearLabel(last, AU)}`;
}

/** The status in the report's words. */
export function statusText(summary: LogbookSummary): string {
  switch (summary.status) {
    case 'complete':
      return summary.basis === 'odometer'
        ? 'Complete (12 continuous weeks)'
        : '12 weeks kept; odometer readings still needed';
    case 'closed-early':
      return 'Closed early: not a valid ATO logbook (needs 12 continuous weeks)';
    case 'not-started':
      return 'Not started yet';
    default:
      return `In progress: week ${summary.week} of ${LOGBOOK_WEEKS}`;
  }
}

/** How the business-use percentage was worked out, in the report's words. */
export function percentBasisText(summary: LogbookSummary): string {
  return summary.basis === 'odometer'
    ? 'Business km ÷ total km travelled (odometer)'
    : 'Business km ÷ km logged by MileMint (odometer readings missing, so driving MileMint didn’t log isn’t counted)';
}
