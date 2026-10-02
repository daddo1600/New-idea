import { isCommute } from './classify-rules';
import {
  centsPerKmForVehicle,
  compareMethods,
  EXPENSE_CATEGORIES,
  EXPENSE_LABELS,
  logbookDeduction,
  logbookValidFor,
  percentBasisText,
  statusText,
  totalExpenses,
  validYearsText,
  type CarExpenses,
  type LogbookSummary,
} from './logbook';
import type { Place } from './places';
import {
  computeDeductionParts,
  costsAdded,
  costsNote,
  describeTier,
  formatReportDate,
  formatDistance,
  formatMoney,
  formatRate,
  fromUnits,
  inEnglish,
  periodRangeInTaxYear,
  taxYearBounds,
  taxYearLabel,
  taxYearOf,
  toUnits,
  type DeductionPart,
  type Region,
} from './regions';
import { toLocalIsoDate, type Trip, VEHICLE_LABELS } from './trip';
import { type Vehicle, vehicleLabel } from './vehicles';

/**
 * The tax-year mileage log: what tax offices ask a driver to keep (date,
 * where, distance, business purpose) plus totals, priced with the region's
 * official rates. Pure, so the numbers in the CSV and PDF are the ones
 * tested here.
 *
 * "Where" is whatever the trip stores. In client privacy mode that is the
 * area only ("Client visit · Leeds LS6"), which with the purpose and distance
 * is the business reason tax offices accept from care workers (see
 * domain/privacy).
 */

export type ReportRow = {
  trip: Trip;
  /** In the region's unit (miles or km). */
  distance: number;
  commute: boolean;
  /** How the business distance was priced; empty for other trips. */
  parts: DeductionPart[];
  /** Minor units (cents, pence). */
  deduction: number;
  /** Parking and tolls entered on the drive, minor units; 0 for a locked drive (its value waits for Pro). */
  parking: number;
  tolls: number;
  /** Changed after it was recorded (the edit history keeps the originals). */
  edited: boolean;
  /** What it was driven in, e.g. "Honda PCX (AB12 CDE)" or "Car or van". */
  vehicle: string;
  /** Logged in a vehicle other than the user's only car: worth showing in the trip log. */
  showVehicle: boolean;
  /**
   * Past the free plan's monthly allowance: listed in the trip log, but with
   * no value and left out of every total until Pro (domain/plan).
   */
  locked: boolean;
};

export type RateTotal = { label: string; distance: number; deduction: number };

/** An ATO logbook shown in an Australian report. */
export type ReportLogbook = {
  summary: LogbookSummary;
  /** e.g. "Golf (ABC123)". */
  vehicle: string;
  /** The car's running costs for the report's income year, when entered. */
  expenses: CarExpenses | null;
  /** Whether the logbook can be used for the report's income year. */
  valid: boolean;
  /** Cents per km for this car in the year (5,000 km limit applied), in cents. */
  centsPerKm: number;
  /** Expenses × business-use %, in cents; null without expenses or when the logbook isn't valid. */
  logbookEstimate: number | null;
};

export type MileageReport = {
  region: Region;
  taxYear: number;
  label: string;
  rows: ReportRow[];
  totalDistance: number;
  businessDistance: number;
  /** Home ↔ work drives not marked business. */
  commutingDistance: number;
  /** Everything else: personal and not yet classified. */
  otherDistance: number;
  unclassifiedCount: number;
  /** Business drives (with a value) that have no purpose, which tax offices expect on every one. */
  missingPurposeCount: number;
  /** Drives in the log whose value waits for Pro; not in any total. */
  lockedCount: number;
  /** The mileage figure: business distance at the official rates. */
  deduction: number;
  /** Parking and tolls on business drives with a value, minor units. */
  parking: number;
  tolls: number;
  /** Whether parking and tolls are added to `total` here (see costsAdded), or listed apart. */
  costsAdded: boolean;
  /** Made for a UK employee (Mileage Allowance Relief). */
  employee: boolean;
  /** The deduction, plus parking and tolls where they count. */
  total: number;
  byRate: RateTotal[];
  /** Odometer at the start and end of the tax year (region's unit), when the user entered them. */
  odometer: { start: number | null; end: number | null };
  /** End minus start, when both readings make sense. */
  drivenDistance: number | null;
  /** Australia: the ATO logbook for each car, when there is one. */
  logbooks: ReportLogbook[];
};

/** Tax years that have trips, newest first. */
export function reportYears(trips: readonly Pick<Trip, 'localDate'>[], region: Region): number[] {
  const years = new Set(trips.map((trip) => taxYearOf(trip.localDate, region)));
  return [...years].sort((a, b) => b - a);
}

export function buildReport(
  trips: readonly Trip[],
  region: Region,
  taxYear: number,
  options: {
    places?: readonly Place[];
    editedIds?: ReadonlySet<string>;
    odometer?: { start: number | null; end: number | null };
    /** The garage (removed vehicles included), to name each trip's vehicle. */
    vehicles?: readonly Vehicle[];
    /** Australia: logbooks to summarise (see `logbooksForReport`) with each car's expenses for the year. */
    logbooks?: readonly { summary: LogbookSummary; expenses: CarExpenses | null }[];
    /** Free plan: drives past the monthly allowance (lockedTripIds), logged without a value. */
    locked?: ReadonlySet<string>;
    /** A UK employee (Mileage Allowance Relief): parking and tolls are listed apart, not added. */
    employee?: boolean;
  } = {},
): MileageReport {
  const kindOf = (id: string | null) => options.places?.find((place) => place.id === id)?.kind ?? null;
  const vehicleOf = (trip: Trip) => {
    const vehicle = options.vehicles?.find((v) => v.id === trip.vehicleId);
    return vehicle ? vehicleLabel(vehicle) : VEHICLE_LABELS[trip.vehicle ?? 'car'];
  };
  const locked = options.locked ?? new Set<string>();
  // Tiers depend on every business trip of the year, so price them all first
  // (the ones with a value: as on the home screen, locked drives aren't priced).
  const valued = locked.size > 0 ? trips.filter((trip) => !locked.has(trip.id)) : trips;
  const allParts = computeDeductionParts(valued, region);
  const rows: ReportRow[] = trips
    .filter((trip) => taxYearOf(trip.localDate, region) === taxYear)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .map((trip) => {
      const parts = allParts.get(trip.id) ?? [];
      return {
        trip,
        distance: toUnits(trip.distanceMeters, region),
        commute: isCommute(kindOf(trip.startPlaceId), kindOf(trip.endPlaceId)),
        parts,
        deduction: parts.reduce((sum, part) => sum + part.amount, 0),
        parking: locked.has(trip.id) ? 0 : (trip.parkingMinor ?? 0),
        tolls: locked.has(trip.id) ? 0 : (trip.tollsMinor ?? 0),
        edited: options.editedIds?.has(trip.id) ?? false,
        vehicle: vehicleOf(trip),
        showVehicle: (options.vehicles?.length ?? 0) > 1 || (trip.vehicle ?? 'car') !== 'car',
        locked: locked.has(trip.id),
      };
    });

  const report: MileageReport = {
    region,
    taxYear,
    label: taxYearLabel(taxYear, region),
    rows,
    totalDistance: 0,
    businessDistance: 0,
    commutingDistance: 0,
    otherDistance: 0,
    unclassifiedCount: 0,
    missingPurposeCount: 0,
    lockedCount: 0,
    deduction: 0,
    parking: 0,
    tolls: 0,
    costsAdded: costsAdded(region, options.employee),
    employee: options.employee ?? false,
    total: 0,
    byRate: [],
    odometer: options.odometer ?? { start: null, end: null },
    drivenDistance: null,
    logbooks: [],
  };
  if (region.code === 'AU') {
    report.logbooks = (options.logbooks ?? []).map(({ summary, expenses }) => {
      const car = options.vehicles?.find((v) => v.id === summary.logbook.vehicleId);
      const valid = logbookValidFor(summary, taxYear);
      return {
        summary,
        vehicle: car ? vehicleLabel(car) : 'Car',
        expenses,
        valid,
        centsPerKm: centsPerKmForVehicle(valued, summary.logbook.vehicleId, taxYear, region).deduction,
        logbookEstimate: valid ? logbookDeduction(expenses, summary.businessPercent) : null,
      };
    });
  }
  const { start, end } = report.odometer;
  if (start !== null && end !== null && end >= start) report.drivenDistance = end - start;
  const byRate = new Map<string, RateTotal>();
  for (const row of rows) {
    if (row.trip.classification === 'unclassified') report.unclassifiedCount += 1;
    if (row.locked) {
      report.lockedCount += 1;
      continue;
    }
    report.totalDistance += row.distance;
    if (row.trip.classification === 'business' && !row.trip.purpose.trim()) report.missingPurposeCount += 1;
    if (row.trip.classification === 'business') {
      report.businessDistance += row.distance;
      report.deduction += row.deduction;
      report.parking += row.parking;
      report.tolls += row.tolls;
      for (const part of row.parts) {
        // Cars first (sorted by key), then two-wheelers, each labelled.
        const key = `${part.vehicle === 'car' ? 0 : part.vehicle === 'motorbike' ? 1 : 2}#${part.period.from}#${part.tier}`;
        const range = periodRangeInTaxYear(part.period, taxYear, region, part.vehicle);
        const tier = describeTier(part.period, part.tier, region, inEnglish);
        const what = part.vehicle === 'car' ? tier : `${VEHICLE_LABELS[part.vehicle]}: ${tier}`;
        const total = byRate.get(key) ?? {
          label: range ? `${range}: ${what}` : what,
          distance: 0,
          deduction: 0,
        };
        total.distance += part.units;
        // The same shared-out amounts as the rows, so the rate rows add up to the Total row.
        total.deduction += part.amount;
        byRate.set(key, total);
      }
    } else if (row.commute) {
      report.commutingDistance += row.distance;
    } else {
      report.otherDistance += row.distance;
    }
  }
  report.byRate = [...byRate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, total]) => total);
  report.total = report.deduction + (report.costsAdded ? report.parking + report.tolls : 0);
  return report;
}

const CLASSIFICATION_LABELS: Record<Trip['classification'], string> = {
  business: 'Business',
  personal: 'Personal',
  unclassified: 'Not classified',
};

/**
 * Formats local times of day. Made once per report: toLocaleTimeString builds
 * a new formatter for every call, which is slow over a year of trips. Not kept
 * between reports, so a change of time zone (travelling) is picked up.
 */
function localTimes(region: Region): (iso: string | null) => string {
  const format = new Intl.DateTimeFormat(region.locale, { hour: 'numeric', minute: '2-digit' });
  return (iso) => (iso ? format.format(new Date(iso)) : '');
}

/** The rate(s) a trip was priced at, e.g. "55p" or "55p / 25p" when it crossed a tier. */
function ratesText(parts: readonly DeductionPart[], region: Region): string {
  return [...new Set(parts.map((part) => formatRate(part.rate, region)))].join(' / ');
}

/**
 * One CSV cell. Quotes when needed, and defuses text a spreadsheet would run
 * as a formula (a place named "=HYPERLINK(…)" stays text).
 */
export function csvCell(value: string | number): string {
  let text = String(value);
  // A plain number ("-16.50") can't run as a formula, so it stays a number.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvColumns(region: Region): string[] {
  return [
    'Date (YYYY-MM-DD)',
    'Start time',
    'End time',
    'From',
    'To',
    region.unit === 'mi' ? 'Miles' : 'Kilometres',
    'Vehicle',
    'Classification',
    'Business purpose',
    `Rate (${region.authority})`,
    `Deduction (${region.currency})`,
    'Recorded',
    'Edited later',
    // Added after the columns above, so spreadsheets built on the old layout keep working.
    `Parking (${region.currency})`,
    `Tolls (${region.currency})`,
  ];
}

/** An amount of parking or tolls for a CSV cell: always on a business drive with a value, otherwise only when entered. */
function costCell(minor: number, business: boolean): string {
  return business || minor > 0 ? (minor / 100).toFixed(2) : '';
}

export function toCsv(report: MileageReport): string {
  const { region } = report;
  const lines = [csvColumns(region).map(csvCell).join(',')];
  const localTime = localTimes(region);
  for (const row of report.rows) {
    const { trip } = row;
    // Past the free allowance: the drive is the user's data and always listed; its value waits for Pro.
    const business = trip.classification === 'business' && !row.locked;
    lines.push(
      [
        trip.localDate,
        trip.source === 'auto' ? localTime(trip.startedAt) : '',
        trip.source === 'auto' ? localTime(trip.endedAt) : '',
        trip.startLabel,
        trip.endLabel,
        row.distance.toFixed(1),
        row.vehicle,
        CLASSIFICATION_LABELS[trip.classification],
        trip.purpose,
        business ? ratesText(row.parts, region) : row.locked ? 'Value unlocks with MileSprout Pro' : '',
        business ? (row.deduction / 100).toFixed(2) : '',
        trip.source === 'auto' ? 'Automatically while driving' : `Added by hand on ${trip.createdAt.slice(0, 10)}`,
        row.edited ? 'Yes' : 'No',
        row.locked ? '' : costCell(row.parking, business),
        row.locked ? '' : costCell(row.tolls, business),
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // CRLF and a byte-order mark so Excel opens it as UTF-8 (names with accents, "→", "£").
  return `﻿${lines.join('\r\n')}\r\n`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Page size for the PDF: US Letter in North America, A4 elsewhere (points). */
export function pageSize(region: Region): { width: number; height: number } {
  return region.code === 'US' || region.code === 'CA' ? { width: 612, height: 792 } : { width: 595, height: 842 };
}

/** The printable tax-year mileage report (Pro). */
export function toReportHtml(report: MileageReport, generatedAt: Date = new Date()): string {
  const { region } = report;
  const units = region.unit === 'mi' ? 'miles' : 'km';
  const Units = region.unit === 'mi' ? 'Miles' : 'Km';
  const distance = (value: number) => escapeHtml(formatDistance(fromUnits(value, region), region));
  const money = (minor: number) => escapeHtml(formatMoney(minor, region));
  const summaryHeading = escapeHtml(region.report.summaryHeading);
  const yearName = report.label.length > 4 ? `${report.label} tax year` : report.label;
  const bounds = taxYearBounds(report.taxYear, region);
  const period = `${formatReportDate(bounds.start, region)} to ${formatReportDate(bounds.end, region)}`;
  const percent = (part: number, whole: number) => `${Math.round((part / whole) * 100)}%`;
  const loggedShare = report.totalDistance > 0 ? percent(report.businessDistance, report.totalDistance) : '–';
  const reading = (value: number | null) =>
    value === null
      ? '<td class="blank"></td>'
      : `<td class="num">${escapeHtml(new Intl.NumberFormat(region.locale, { maximumFractionDigits: 1 }).format(value))} ${region.unit}</td>`;
  const driven = report.drivenDistance;
  const hasReadings = report.odometer.start !== null || report.odometer.end !== null;
  // Canada always gets the section (fill-in lines if empty); elsewhere only when readings were entered.
  const odometer =
    region.report.askForOdometer || hasReadings
      ? `<h2>Odometer readings</h2>
  <table class="summary">
    <tr><td>Odometer on ${formatReportDate(bounds.start, region)}</td>${reading(report.odometer.start)}</tr>
    <tr><td>Odometer on ${formatReportDate(bounds.end, region)}</td>${reading(report.odometer.end)}</tr>
    <tr><td>Total ${units} driven in the year (end minus start)</td>${driven === null ? '<td class="blank"></td>' : `<td class="num">${distance(driven)}</td>`}</tr>
    <tr class="total"><td>Business-use share (business ${units} ÷ total ${units} driven)</td>${
      driven ? `<td class="num">${percent(report.businessDistance, driven)}</td>` : '<td class="blank"></td>'
    }</tr>
  </table>
  <p class="hint">${
    driven
      ? `Business share of the ${units} MileSprout logged: ${loggedShare}. The odometer share above includes driving MileSprout didn’t log, so use it for the claim.`
      : `Business share of the ${units} MileSprout logged: ${loggedShare}. Use your odometer total for the claim, since it includes any driving MileSprout didn’t log.`
  }</p>`
      : '';
  const logbooks = report.logbooks.map((entry) => logbookHtml(entry, report, distance, money)).join('');
  const guidance = region.report.guidance.map((line) => `<li>${escapeHtml(line)}</li>`).join('');

  const rateRows = report.byRate
    .map(
      (total) =>
        `<tr><td>${escapeHtml(total.label)}</td><td class="num">${distance(total.distance)}</td><td class="num">${money(total.deduction)}</td></tr>`,
    )
    .join('');
  // Parking and tolls: in the deduction table where they're added on top, otherwise a table of their own.
  const costs = report.parking + report.tolls;
  const costRows = `<tr><td colspan="2">Parking (business trips)</td><td class="num">${money(report.parking)}</td></tr>` +
    `<tr><td colspan="2">Tolls and road charges (business trips)</td><td class="num">${money(report.tolls)}</td></tr>`;
  const deductionRows =
    costs > 0 && report.costsAdded
      ? `${rateRows}<tr class="total"><td colspan="2">Mileage at ${escapeHtml(region.authority)} rates</td><td class="num">${money(report.deduction)}</td></tr>` +
        `${costRows}<tr class="total"><td colspan="2">Total, including parking and tolls</td><td class="num">${money(report.total)}</td></tr>`
      : `${rateRows}<tr class="total"><td colspan="2">Total</td><td class="num">${money(report.deduction)}</td></tr>`;
  const separateCosts =
    costs > 0 && !report.costsAdded
      ? `<h2>Parking and tolls (recorded, not included above)</h2>
  <table>
    <tbody>${costRows}<tr class="total"><td colspan="2">Total parking and tolls</td><td class="num">${money(costs)}</td></tr></tbody>
  </table>
  <p class="hint">${escapeHtml(costsNote(region, report.employee))}</p>`
      : '';
  // The trip log has their columns only when some drive has them, so a log without any stays as narrow as before.
  const costColumns = report.rows.some((row) => row.parking + row.tolls > 0);
  const costCells = (row: ReportRow) =>
    costColumns
      ? `<td class="num">${row.parking ? money(row.parking) : ''}</td><td class="num">${row.tolls ? money(row.tolls) : ''}</td>`
      : '';
  const tripRows = report.rows
    .map((row) => {
      const { trip } = row;
      const business = trip.classification === 'business';
      return (
        `<tr${business ? '' : ' class="dim"'}>` +
        `<td>${formatReportDate(trip.localDate, region)}</td>` +
        `<td>${escapeHtml(trip.startLabel)} → ${escapeHtml(trip.endLabel)}</td>` +
        `<td class="num">${row.distance.toFixed(1)}</td>` +
        `<td>${CLASSIFICATION_LABELS[trip.classification]}${row.commute ? ' (commute)' : ''}` +
        `${row.showVehicle ? ` · ${escapeHtml(row.vehicle)}` : ''}</td>` +
        `<td>${escapeHtml(trip.purpose)}</td>` +
        `<td class="num">${business ? money(row.deduction) : ''}</td>` +
        costCells(row) +
        `<td>${trip.source === 'auto' ? 'Auto' : 'Manual'}${row.edited ? ', edited' : ''}</td>` +
        `</tr>`
      );
    })
    .join('');
  const warning =
    report.unclassifiedCount > 0
      ? `<p class="warn">${report.unclassifiedCount} trip${report.unclassifiedCount === 1 ? ' is' : 's are'} not classified yet and ${report.unclassifiedCount === 1 ? 'is' : 'are'} counted as other ${units}.</p>`
      : '';
  const caveat = region.caveat ? ` ${escapeHtml(region.caveat)}` : '';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body { font: 10pt -apple-system, Helvetica, Arial, sans-serif; color: #16201c; margin: 0; }
  h1 { font-size: 18pt; margin: 0 0 2pt; }
  h2 { font-size: 11pt; margin: 18pt 0 6pt; }
  .sub { color: #55635d; margin: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 4pt 6pt; border-bottom: 0.5pt solid #d6e0db; vertical-align: top; }
  th { background: #f0f4f2; font-weight: 600; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .log td, .log th { font-size: 9pt; }
  .log td:first-child { white-space: nowrap; }
  .dim td { color: #6b7a73; }
  .summary td:first-child { width: 70%; }
  .total td { font-weight: 700; }
  .warn { color: #9a5b00; }
  .blank { border-bottom: 0.75pt solid #16201c; width: 30%; }
  .hint { color: #55635d; font-size: 9pt; }
  ul { margin: 0; padding-left: 14pt; }
  li { margin: 0 0 4pt; }
  .note { color: #55635d; font-size: 8.5pt; margin-top: 16pt; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
</style></head><body>
  <h1>Vehicle mileage log · ${escapeHtml(yearName)}</h1>
  <p class="sub">${escapeHtml(region.name)} · ${period} · ${escapeHtml(region.authority)} rates · prepared with MileSprout on ${formatReportDate(toLocalIsoDate(generatedAt), region)}</p>

  <h2>${summaryHeading}</h2>
  <table class="summary">
    <tr><td>Business ${units}</td><td class="num">${distance(report.businessDistance)}</td></tr>
    <tr><td>Commuting ${units}</td><td class="num">${distance(report.commutingDistance)}</td></tr>
    <tr><td>Other personal ${units}</td><td class="num">${distance(report.otherDistance)}</td></tr>
    <tr class="total"><td>Total ${units} logged</td><td class="num">${distance(report.totalDistance)}</td></tr>
  </table>
  ${warning}
  ${odometer}

  ${logbooks}

  <h2>Deduction at ${escapeHtml(region.authority)} rates</h2>
  <table>
    <thead><tr><th>Rate</th><th class="num">Business ${units}</th><th class="num">Deduction</th></tr></thead>
    <tbody>${deductionRows}</tbody>
  </table>
  ${separateCosts}

  <h2>Trip log</h2>
  <table class="log">
    <thead><tr><th>Date</th><th>From → To</th><th class="num">${Units}</th><th>Type</th><th>Business purpose</th><th class="num">Deduction</th>${costColumns ? '<th class="num">Parking</th><th class="num">Tolls</th>' : ''}<th>Recorded</th></tr></thead>
    <tbody>${tripRows}</tbody>
  </table>

  <h2>Where these figures go</h2>
  <ul>${guidance}</ul>

  <p class="note">“Auto” trips were recorded by the phone while driving; “Manual” trips were added by hand. MileSprout keeps a history of every change to a trip, and trips changed after they were recorded are marked “edited”. Deductions are estimates at ${escapeHtml(region.authority)} rates and are not tax advice.${caveat}</p>
</body></html>`;
}

/** Australia: the ATO logbook summary for one car, with the logbook method estimate when expenses were entered. */
function logbookHtml(
  entry: ReportLogbook,
  report: MileageReport,
  distance: (value: number) => string,
  money: (minor: number) => string,
): string {
  const { region } = report;
  const { summary } = entry;
  const { logbook } = summary;
  const reading = (value: number | null) =>
    value === null
      ? '<td class="blank"></td>'
      : `<td class="num">${escapeHtml(new Intl.NumberFormat(region.locale, { maximumFractionDigits: 1 }).format(value))} km</td>`;
  const row = (label: string, cell: string) => `<tr><td>${label}</td>${cell}</tr>`;
  const num = (text: string) => `<td class="num">${text}</td>`;
  const percent = summary.businessPercent === null ? '<td class="blank"></td>' : num(`${summary.businessPercent}%`);
  const rows = [
    row('Vehicle', `<td>${escapeHtml(entry.vehicle)}</td>`),
    row('Logbook period', num(`${formatReportDate(logbook.startDate, region)} to ${formatReportDate(logbook.endDate, region)}`)),
    row('Status', `<td>${escapeHtml(statusText(summary))}</td>`),
    row('Odometer at start of period', reading(logbook.odometerStart)),
    row('Odometer at end of period', reading(logbook.odometerEnd)),
    row(
      summary.basis === 'odometer' ? 'Total km travelled in the period' : 'Total km logged in the period (no odometer readings)',
      num(distance(summary.totalKm)),
    ),
    row('Business km travelled in the period', num(distance(summary.businessKm))),
    `<tr class="total"><td>Business-use percentage</td>${percent}</tr>`,
  ];
  if (summary.status === 'complete') rows.push(row('Can be used for income years', num(escapeHtml(validYearsText(logbook)))));

  let estimate = '';
  if (entry.valid && entry.expenses && entry.logbookEstimate !== null) {
    const costs = EXPENSE_CATEGORIES.filter((category) => (entry.expenses?.[category] ?? 0) > 0)
      .map((category) => row(escapeHtml(EXPENSE_LABELS[category]), num(money(entry.expenses?.[category] ?? 0))))
      .join('');
    const comparison = compareMethods(entry.centsPerKm, entry.logbookEstimate);
    const better =
      comparison.better === 'logbook'
        ? `The logbook method gives ${money(comparison.difference)} more for this car.`
        : comparison.better === 'cents-per-km'
          ? `The cents per km method gives ${money(comparison.difference)} more for this car.`
          : 'Both methods give the same for this car.';
    estimate = `<h2>Logbook method estimate · ${escapeHtml(entry.vehicle)} · ${escapeHtml(report.label)}</h2>
  <table class="summary">
    ${costs}
    <tr class="total"><td>Total car expenses</td>${num(money(totalExpenses(entry.expenses)))}</tr>
    <tr class="total"><td>Logbook method: expenses × ${summary.businessPercent}% business use</td>${num(money(entry.logbookEstimate))}</tr>
    <tr><td>Cents per km method (up to 5,000 km)</td>${num(money(entry.centsPerKm))}</tr>
  </table>
  <p class="hint">${better} Estimates only. Keep receipts for every expense (fuel can be estimated from your records), and use one method per car for the year.</p>`;
  }
  const note = entry.valid
    ? 'Claim this share of the car’s actual expenses with the logbook method. Journey details, with dates, odometer readings and reasons, are in MileSprout’s ATO logbook export.'
    : summary.status === 'closed-early'
      ? 'This logbook was closed before 12 weeks, so it can’t be used for the logbook method.'
      : `This logbook can’t be used for ${escapeHtml(report.label)} yet: the ATO needs 12 continuous weeks and the odometer readings at the start and end of the period.`;

  return `<h2>ATO logbook · ${escapeHtml(entry.vehicle)}</h2>
  <table class="summary">${rows.join('')}</table>
  <p class="hint">${escapeHtml(percentBasisText(summary))}. ${note}</p>
  ${estimate}`;
}
