import { isCommute } from './classify-rules';
import { formatCents, formatMiles } from './format';
import type { Place } from './places';
import { rateForDate, US_BUSINESS_RATES, type RatePeriod } from './rates';
import { metersToMiles, tripDeductionCents, type Trip } from './trip';

/**
 * The yearly mileage log: what the IRS asks a driver to keep (date, where,
 * miles, business purpose) plus the totals Schedule C Part IV asks for.
 * Pure, so the numbers in the CSV and the PDF are the ones tested here.
 */

export type ReportRow = {
  trip: Trip;
  miles: number;
  commute: boolean;
  /** Tenths of a cent per mile, when a rate applies to the date. */
  rate: number | null;
  deductionCents: number;
  /** Changed after it was recorded (the edit history keeps the originals). */
  edited: boolean;
};

export type RateTotal = { period: RatePeriod; businessMiles: number; deductionCents: number };

export type MileageReport = {
  year: number;
  rows: ReportRow[];
  totalMiles: number;
  businessMiles: number;
  /** Home ↔ work drives not marked business. */
  commutingMiles: number;
  /** Everything else: personal and not yet classified. */
  otherMiles: number;
  unclassifiedCount: number;
  deductionCents: number;
  byRate: RateTotal[];
};

/** Years that have trips, newest first. */
export function reportYears(trips: readonly Pick<Trip, 'localDate'>[]): number[] {
  const years = new Set(trips.map((trip) => Number(trip.localDate.slice(0, 4))));
  return [...years].sort((a, b) => b - a);
}

export function buildReport(
  trips: readonly Trip[],
  year: number,
  options: { places?: readonly Place[]; editedIds?: ReadonlySet<string> } = {},
  rates: readonly RatePeriod[] = US_BUSINESS_RATES,
): MileageReport {
  const kindOf = (id: string | null) => options.places?.find((place) => place.id === id)?.kind ?? null;
  const rows = trips
    .filter((trip) => trip.localDate.startsWith(`${year}-`))
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .map((trip) => ({
      trip,
      miles: metersToMiles(trip.distanceMeters),
      commute: isCommute(kindOf(trip.startPlaceId), kindOf(trip.endPlaceId)),
      rate: rateForDate(trip.localDate, rates)?.tenthsOfCentPerMile ?? null,
      deductionCents: tripDeductionCents(trip, rates),
      edited: options.editedIds?.has(trip.id) ?? false,
    }));

  const report: MileageReport = {
    year,
    rows,
    totalMiles: 0,
    businessMiles: 0,
    commutingMiles: 0,
    otherMiles: 0,
    unclassifiedCount: 0,
    deductionCents: 0,
    byRate: [],
  };
  const byRate = new Map<string, RateTotal>();
  for (const row of rows) {
    report.totalMiles += row.miles;
    if (row.trip.classification === 'unclassified') report.unclassifiedCount += 1;
    if (row.trip.classification === 'business') {
      report.businessMiles += row.miles;
      report.deductionCents += row.deductionCents;
      const period = rateForDate(row.trip.localDate, rates);
      if (period) {
        const total = byRate.get(period.from) ?? { period, businessMiles: 0, deductionCents: 0 };
        total.businessMiles += row.miles;
        total.deductionCents += row.deductionCents;
        byRate.set(period.from, total);
      }
    } else if (row.commute) {
      report.commutingMiles += row.miles;
    } else {
      report.otherMiles += row.miles;
    }
  }
  report.byRate = [...byRate.values()].sort((a, b) => a.period.from.localeCompare(b.period.from));
  return report;
}

const CLASSIFICATION_LABELS: Record<Trip['classification'], string> = {
  business: 'Business',
  personal: 'Personal',
  unclassified: 'Not classified',
};

function localTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function rateText(rate: number | null): string {
  return rate === null ? '' : `${(rate / 1000).toFixed(3)}`;
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

export const CSV_COLUMNS = [
  'Date',
  'Start time',
  'End time',
  'From',
  'To',
  'Miles',
  'Classification',
  'Business purpose',
  'Rate ($/mile)',
  'Deduction ($)',
  'Recorded',
  'Edited later',
] as const;

export function toCsv(report: MileageReport): string {
  const lines = [CSV_COLUMNS.map(csvCell).join(',')];
  for (const row of report.rows) {
    const { trip } = row;
    lines.push(
      [
        trip.localDate,
        trip.source === 'auto' ? localTime(trip.startedAt) : '',
        trip.source === 'auto' ? localTime(trip.endedAt) : '',
        trip.startLabel,
        trip.endLabel,
        row.miles.toFixed(1),
        CLASSIFICATION_LABELS[trip.classification],
        trip.purpose,
        trip.classification === 'business' ? rateText(row.rate) : '',
        trip.classification === 'business' ? (row.deductionCents / 100).toFixed(2) : '',
        trip.source === 'auto' ? 'Automatically while driving' : `Added by hand on ${trip.createdAt.slice(0, 10)}`,
        row.edited ? 'Yes' : 'No',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // CRLF and a byte-order mark so Excel opens it as UTF-8 (names with accents, "→").
  return `﻿${lines.join('\r\n')}\r\n`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The printable IRS mileage report (Pro), laid out for US Letter. */
export function toReportHtml(report: MileageReport, generatedAt: Date = new Date()): string {
  const rateRows = report.byRate
    .map(
      (total) =>
        `<tr><td>From ${total.period.from}</td><td class="num">${(total.period.tenthsOfCentPerMile / 10).toFixed(1)}¢</td>` +
        `<td class="num">${escapeHtml(formatMiles(total.businessMiles))}</td><td class="num">${formatCents(total.deductionCents)}</td></tr>`,
    )
    .join('');
  const tripRows = report.rows
    .map((row) => {
      const { trip } = row;
      const business = trip.classification === 'business';
      return (
        `<tr${business ? '' : ' class="dim"'}>` +
        `<td>${trip.localDate}</td>` +
        `<td>${escapeHtml(trip.startLabel)} → ${escapeHtml(trip.endLabel)}</td>` +
        `<td class="num">${row.miles.toFixed(1)}</td>` +
        `<td>${CLASSIFICATION_LABELS[trip.classification]}${row.commute ? ' (commute)' : ''}</td>` +
        `<td>${escapeHtml(trip.purpose)}</td>` +
        `<td class="num">${business ? formatCents(row.deductionCents) : ''}</td>` +
        `<td>${trip.source === 'auto' ? 'Auto' : 'Manual'}${row.edited ? ', edited' : ''}</td>` +
        `</tr>`
      );
    })
    .join('');
  const warning =
    report.unclassifiedCount > 0
      ? `<p class="warn">${report.unclassifiedCount} trip${report.unclassifiedCount === 1 ? ' is' : 's are'} not classified yet and ${report.unclassifiedCount === 1 ? 'is' : 'are'} counted as other miles.</p>`
      : '';

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
  .note { color: #55635d; font-size: 8.5pt; margin-top: 16pt; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
</style></head><body>
  <h1>Vehicle mileage log ${report.year}</h1>
  <p class="sub">Prepared with MileMint on ${generatedAt.toISOString().slice(0, 10)} · IRS standard mileage rate</p>

  <h2>Summary (Schedule C, Part IV)</h2>
  <table class="summary">
    <tr><td>Business miles</td><td class="num">${escapeHtml(formatMiles(report.businessMiles))}</td></tr>
    <tr><td>Commuting miles</td><td class="num">${escapeHtml(formatMiles(report.commutingMiles))}</td></tr>
    <tr><td>Other personal miles</td><td class="num">${escapeHtml(formatMiles(report.otherMiles))}</td></tr>
    <tr class="total"><td>Total miles logged</td><td class="num">${escapeHtml(formatMiles(report.totalMiles))}</td></tr>
  </table>
  ${warning}

  <h2>Deduction at the standard mileage rate</h2>
  <table>
    <thead><tr><th>Period</th><th class="num">Rate</th><th class="num">Business miles</th><th class="num">Deduction</th></tr></thead>
    <tbody>${rateRows}<tr class="total"><td colspan="3">Total</td><td class="num">${formatCents(report.deductionCents)}</td></tr></tbody>
  </table>

  <h2>Trip log</h2>
  <table class="log">
    <thead><tr><th>Date</th><th>From → To</th><th class="num">Miles</th><th>Type</th><th>Business purpose</th><th class="num">Deduction</th><th>Recorded</th></tr></thead>
    <tbody>${tripRows}</tbody>
  </table>

  <p class="note">“Auto” trips were recorded by the phone while driving; “Manual” trips were added by hand. MileMint keeps a history of every change to a trip, and trips changed after they were recorded are marked “edited”. Deductions are estimates at the IRS standard mileage rate and are not tax advice.</p>
</body></html>`;
}
