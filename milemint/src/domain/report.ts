import { isCommute } from './classify-rules';
import type { Place } from './places';
import {
  computeDeductionParts,
  describeTier,
  formatDate,
  formatDistance,
  formatMoney,
  formatRate,
  fromUnits,
  periodRangeInTaxYear,
  taxYearBounds,
  taxYearLabel,
  taxYearOf,
  toUnits,
  type DeductionPart,
  type Region,
} from './regions';
import type { Trip } from './trip';

/**
 * The tax-year mileage log: what tax offices ask a driver to keep (date,
 * where, distance, business purpose) plus totals, priced with the region's
 * official rates. Pure, so the numbers in the CSV and PDF are the ones
 * tested here.
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
  /** Changed after it was recorded (the edit history keeps the originals). */
  edited: boolean;
};

export type RateTotal = { label: string; distance: number; deduction: number };

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
  deduction: number;
  byRate: RateTotal[];
  /** Odometer at the start and end of the tax year (region's unit), when the user entered them. */
  odometer: { start: number | null; end: number | null };
  /** End minus start, when both readings make sense. */
  drivenDistance: number | null;
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
  } = {},
): MileageReport {
  const kindOf = (id: string | null) => options.places?.find((place) => place.id === id)?.kind ?? null;
  // Tiers depend on every business trip of the year, so price them all first.
  const allParts = computeDeductionParts(trips, region);
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
        deduction: Math.round(parts.reduce((sum, part) => sum + part.units * part.rate, 0) / 10),
        edited: options.editedIds?.has(trip.id) ?? false,
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
    deduction: 0,
    byRate: [],
    odometer: options.odometer ?? { start: null, end: null },
    drivenDistance: null,
  };
  const { start, end } = report.odometer;
  if (start !== null && end !== null && end >= start) report.drivenDistance = end - start;
  const byRate = new Map<string, RateTotal & { tenths: number }>();
  for (const row of rows) {
    report.totalDistance += row.distance;
    if (row.trip.classification === 'unclassified') report.unclassifiedCount += 1;
    if (row.trip.classification === 'business') {
      report.businessDistance += row.distance;
      report.deduction += row.deduction;
      for (const part of row.parts) {
        const key = `${part.period.from}#${part.tier}`;
        const range = periodRangeInTaxYear(part.period, taxYear, region);
        const tier = describeTier(part.period, part.tier, region);
        const total = byRate.get(key) ?? {
          label: range ? `${range}: ${tier}` : tier,
          distance: 0,
          deduction: 0,
          tenths: 0,
        };
        total.distance += part.units;
        total.tenths += part.units * part.rate;
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
    .map(([, total]) => ({ label: total.label, distance: total.distance, deduction: Math.round(total.tenths / 10) }));
  return report;
}

const CLASSIFICATION_LABELS: Record<Trip['classification'], string> = {
  business: 'Business',
  personal: 'Personal',
  unclassified: 'Not classified',
};

function localTime(iso: string | null, region: Region): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(region.locale, { hour: 'numeric', minute: '2-digit' });
}

/** The rate(s) a trip was priced at, e.g. "55p" or "55p / 25p" when it crossed a tier. */
function ratesText(parts: readonly DeductionPart[], region: Region): string {
  return [...new Set(parts.map((part) => formatRate(part.rate, region)))].join(' / ');
}

/**
 * One CSV cell. Quotes when needed, and defuses text a spreadsheet would run
 * as a formula (a place named "=HYPERLINK(…)" stays text).
 */
function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
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
    'Classification',
    'Business purpose',
    `Rate (${region.authority})`,
    `Deduction (${region.currency})`,
    'Recorded',
    'Edited later',
  ];
}

export function toCsv(report: MileageReport): string {
  const { region } = report;
  const lines = [csvColumns(region).map(csvCell).join(',')];
  for (const row of report.rows) {
    const { trip } = row;
    const business = trip.classification === 'business';
    lines.push(
      [
        trip.localDate,
        trip.source === 'auto' ? localTime(trip.startedAt, region) : '',
        trip.source === 'auto' ? localTime(trip.endedAt, region) : '',
        trip.startLabel,
        trip.endLabel,
        row.distance.toFixed(1),
        CLASSIFICATION_LABELS[trip.classification],
        trip.purpose,
        business ? ratesText(row.parts, region) : '',
        business ? (row.deduction / 100).toFixed(2) : '',
        trip.source === 'auto' ? 'Automatically while driving' : `Added by hand on ${trip.createdAt.slice(0, 10)}`,
        row.edited ? 'Yes' : 'No',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // CRLF and a byte-order mark so Excel opens it as UTF-8 (names with accents, "→", "£").
  return `﻿${lines.join('\r\n')}\r\n`;
}

function escapeHtml(text: string): string {
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
  const period = `${formatDate(bounds.start, region)} to ${formatDate(bounds.end, region)}`;
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
    <tr><td>Odometer on ${formatDate(bounds.start, region)}</td>${reading(report.odometer.start)}</tr>
    <tr><td>Odometer on ${formatDate(bounds.end, region)}</td>${reading(report.odometer.end)}</tr>
    <tr><td>Total ${units} driven in the year (end minus start)</td>${driven === null ? '<td class="blank"></td>' : `<td class="num">${distance(driven)}</td>`}</tr>
    <tr class="total"><td>Business-use share (business ${units} ÷ total ${units} driven)</td>${
      driven ? `<td class="num">${percent(report.businessDistance, driven)}</td>` : '<td class="blank"></td>'
    }</tr>
  </table>
  <p class="hint">${
    driven
      ? `Business share of the ${units} MileMint logged: ${loggedShare}. The odometer share above includes driving MileMint didn’t log, so use it for the claim.`
      : `Business share of the ${units} MileMint logged: ${loggedShare}. Use your odometer total for the claim, since it includes any driving MileMint didn’t log.`
  }</p>`
      : '';
  const guidance = region.report.guidance.map((line) => `<li>${escapeHtml(line)}</li>`).join('');

  const rateRows = report.byRate
    .map(
      (total) =>
        `<tr><td>${escapeHtml(total.label)}</td><td class="num">${distance(total.distance)}</td><td class="num">${money(total.deduction)}</td></tr>`,
    )
    .join('');
  const tripRows = report.rows
    .map((row) => {
      const { trip } = row;
      const business = trip.classification === 'business';
      return (
        `<tr${business ? '' : ' class="dim"'}>` +
        `<td>${formatDate(trip.localDate, region)}</td>` +
        `<td>${escapeHtml(trip.startLabel)} → ${escapeHtml(trip.endLabel)}</td>` +
        `<td class="num">${row.distance.toFixed(1)}</td>` +
        `<td>${CLASSIFICATION_LABELS[trip.classification]}${row.commute ? ' (commute)' : ''}</td>` +
        `<td>${escapeHtml(trip.purpose)}</td>` +
        `<td class="num">${business ? money(row.deduction) : ''}</td>` +
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
  <p class="sub">${escapeHtml(region.name)} · ${period} · ${escapeHtml(region.authority)} rates · prepared with MileMint on ${formatDate(generatedAt.toISOString().slice(0, 10), region)}</p>

  <h2>${summaryHeading}</h2>
  <table class="summary">
    <tr><td>Business ${units}</td><td class="num">${distance(report.businessDistance)}</td></tr>
    <tr><td>Commuting ${units}</td><td class="num">${distance(report.commutingDistance)}</td></tr>
    <tr><td>Other personal ${units}</td><td class="num">${distance(report.otherDistance)}</td></tr>
    <tr class="total"><td>Total ${units} logged</td><td class="num">${distance(report.totalDistance)}</td></tr>
  </table>
  ${warning}
  ${odometer}

  <h2>Deduction at ${escapeHtml(region.authority)} rates</h2>
  <table>
    <thead><tr><th>Rate</th><th class="num">Business ${units}</th><th class="num">Deduction</th></tr></thead>
    <tbody>${rateRows}<tr class="total"><td colspan="2">Total</td><td class="num">${money(report.deduction)}</td></tr></tbody>
  </table>

  <h2>Trip log</h2>
  <table class="log">
    <thead><tr><th>Date</th><th>From → To</th><th class="num">${Units}</th><th>Type</th><th>Business purpose</th><th class="num">Deduction</th><th>Recorded</th></tr></thead>
    <tbody>${tripRows}</tbody>
  </table>

  <h2>Where these figures go</h2>
  <ul>${guidance}</ul>

  <p class="note">“Auto” trips were recorded by the phone while driving; “Manual” trips were added by hand. MileMint keeps a history of every change to a trip, and trips changed after they were recorded are marked “edited”. Deductions are estimates at ${escapeHtml(region.authority)} rates and are not tax advice.${caveat}</p>
</body></html>`;
}
