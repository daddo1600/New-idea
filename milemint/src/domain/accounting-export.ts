import { percentBasisText, statusText, validYearsText, type LogbookSummary } from './logbook';
import { formatDate, formatRate, REGIONS, type Region } from './regions';
import { csvCell, toCsv, type MileageReport, type ReportRow } from './report';

/**
 * The same mileage, laid out for where the user's books are kept. These are
 * import files for Xero, QuickBooks Online and FreeAgent, and a claim form for
 * an employer's expense system. Like the plain CSV and the PDF, they stay in
 * English: they're bookkeeping records.
 *
 * Xero and QuickBooks get one balanced journal per month. The month's
 * business mileage at the official rate is debited to motor expenses and
 * credited to the owner's funds, which is how a sole trader books a mileage
 * allowance. Account names and codes are the software's defaults and can be
 * re-mapped on import.
 */
export type ExportFormat = 'spreadsheet' | 'xero' | 'quickbooks' | 'freeagent' | 'expense-claim';

export const EXPORT_FORMATS: readonly ExportFormat[] = ['spreadsheet', 'xero', 'quickbooks', 'freeagent', 'expense-claim'];

/** The formats offered in a country: FreeAgent is UK-only software. */
export function formatsFor(region: Pick<Region, 'code'>): readonly ExportFormat[] {
  return region.code === 'GB' ? EXPORT_FORMATS : EXPORT_FORMATS.filter((format) => format !== 'freeagent');
}

/** Exports for accounting software need Pro; the plain spreadsheet and the claim form are free. */
export const PRO_FORMATS: ReadonlySet<ExportFormat> = new Set(['xero', 'quickbooks', 'freeagent']);

type Month = { key: string; lastDay: string; distance: number; deduction: number };

const businessRows = (report: MileageReport) =>
  report.rows.filter((row) => row.trip.classification === 'business' && !row.locked && row.deduction > 0);

/** Business mileage per calendar month, oldest first. */
function months(report: MileageReport): Month[] {
  const byMonth = new Map<string, Month>();
  for (const row of businessRows(report)) {
    const key = row.trip.localDate.slice(0, 7);
    const [y, m] = key.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    const month = byMonth.get(key) ?? { key, lastDay, distance: 0, deduction: 0 };
    month.distance += row.distance;
    month.deduction += row.deduction;
    byMonth.set(key, month);
  }
  return [...byMonth.values()].sort((a, b) => a.key.localeCompare(b.key));
}

const units = (region: Region) => (region.unit === 'mi' ? 'miles' : 'km');
const money = (minor: number) => (minor / 100).toFixed(2);
const monthName = (key: string) =>
  new Date(`${key}-15T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function narration(month: Month, region: Region): string {
  return `Business mileage ${monthName(month.key)}: ${month.distance.toFixed(1)} ${units(region)} at ${region.authority} rates (MileMint)`;
}

function lines(rows: readonly (string | number)[][]): string {
  return `﻿${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

/** Xero's default accounts and "no tax" rate name, per country. */
const XERO: Record<Region['code'], { expense: string; owner: string; taxRate: string }> = {
  GB: { expense: '449', owner: '881', taxRate: 'No VAT' },
  US: { expense: '449', owner: '881', taxRate: 'Tax Exempt' },
  CA: { expense: '449', owner: '881', taxRate: 'Tax Exempt' },
  AU: { expense: '449', owner: '881', taxRate: 'BAS Excluded' },
};

/** Xero › Accounting › Manual journals › Import. Positive amounts are debits. */
export function toXeroJournals(report: MileageReport): string {
  const { region } = report;
  const accounts = XERO[region.code];
  const header = ['*Narration', '*Date', 'Description', '*AccountCode', '*TaxRate', '*Amount'];
  const rows: (string | number)[][] = [header];
  for (const month of months(report)) {
    const text = narration(month, region);
    const date = formatDate(month.lastDay, region);
    rows.push([text, date, 'Motor vehicle expenses (mileage allowance)', accounts.expense, accounts.taxRate, money(month.deduction)]);
    rows.push([text, date, 'Owner funds introduced', accounts.owner, accounts.taxRate, `-${money(month.deduction)}`]);
  }
  return lines(rows);
}

/** QuickBooks Online's default account names, per country. */
const QUICKBOOKS: Record<Region['code'], { expense: string; owner: string }> = {
  GB: { expense: 'Motor Vehicle Expenses', owner: "Owner's Capital" },
  US: { expense: 'Car & Truck', owner: "Owner's Investment" },
  CA: { expense: 'Vehicle Expenses', owner: "Owner's Equity" },
  AU: { expense: 'Motor Vehicle Expenses', owner: "Owner's Equity" },
};

/** QuickBooks Online › Settings › Import data › Journal entries. */
export function toQuickBooksJournals(report: MileageReport): string {
  const { region } = report;
  const accounts = QUICKBOOKS[region.code];
  const rows: (string | number)[][] = [['Journal No.', 'Journal Date', 'Account Name', 'Debits', 'Credits', 'Description']];
  for (const [i, month] of months(report).entries()) {
    const number = `MM-${report.label.replace(/[^0-9]/g, '')}-${String(i + 1).padStart(2, '0')}`;
    const date = formatDate(month.lastDay, region);
    const text = narration(month, region);
    rows.push([number, date, accounts.expense, money(month.deduction), '', text]);
    rows.push([number, date, accounts.owner, '', money(month.deduction), text]);
  }
  return lines(rows);
}

/**
 * One line per business trip with what FreeAgent's mileage form asks for:
 * date, description, distance and vehicle. Until there's a direct connection
 * it's entered from this list.
 */
export function toFreeAgentMileage(report: MileageReport): string {
  const { region } = report;
  const rows: (string | number)[][] = [
    ['Date', 'Description', region.unit === 'mi' ? 'Miles' : 'Kilometres', 'Vehicle', 'Claimed at', `Value (${region.currency})`],
  ];
  for (const row of businessRows(report)) rows.push(tripLine(row, region, true));
  return lines(rows);
}

/** For an employer's expense system: a claim line per business trip. */
export function toExpenseClaim(report: MileageReport): string {
  const { region } = report;
  const rows: (string | number)[][] = [
    [
      'Date',
      'From',
      'To',
      'Business purpose',
      region.unit === 'mi' ? 'Miles' : 'Kilometres',
      'Vehicle',
      `Rate (${region.authority})`,
      `Amount (${region.currency})`,
    ],
  ];
  for (const row of businessRows(report)) {
    const { trip } = row;
    rows.push([
      formatDate(trip.localDate, region),
      trip.startLabel,
      trip.endLabel,
      trip.purpose,
      row.distance.toFixed(1),
      row.vehicle,
      ratesOf(row, region),
      money(row.deduction),
    ]);
  }
  return lines(rows);
}

function ratesOf(row: ReportRow, region: Region): string {
  return [...new Set(row.parts.map((part) => formatRate(part.rate, region)))].join(' / ');
}

function tripLine(row: ReportRow, region: Region, describe: boolean): (string | number)[] {
  const { trip } = row;
  const description = describe
    ? [trip.purpose, `${trip.startLabel} → ${trip.endLabel}`].filter(Boolean).join(': ')
    : trip.purpose;
  return [formatDate(trip.localDate, region), description, row.distance.toFixed(1), row.vehicle, ratesOf(row, region), money(row.deduction)];
}

/** The file for a format: its contents and a name. */
export function exportFile(report: MileageReport, format: ExportFormat): { name: string; text: string } {
  // "2026/27" or "2026–27" → "2026-27": slashes and en dashes trip up some file systems and downloads.
  const year = report.label.replace(/[/–]/g, '-');
  switch (format) {
    case 'xero':
      return { name: `MileMint ${year} Xero manual journals.csv`, text: toXeroJournals(report) };
    case 'quickbooks':
      return { name: `MileMint ${year} QuickBooks journal entries.csv`, text: toQuickBooksJournals(report) };
    case 'freeagent':
      return { name: `MileMint ${year} mileage for FreeAgent.csv`, text: toFreeAgentMileage(report) };
    case 'expense-claim':
      return { name: `MileMint ${year} expense claim.csv`, text: toExpenseClaim(report) };
    default:
      return { name: `MileMint ${year} mileage log.csv`, text: toCsv(report) };
  }
}

// ─── ATO logbook (Australia) ────────────────────────────────────────────────

const AU = REGIONS.AU;
const km1 = (value: number) => value.toFixed(1);
const reading = (value: number | null) => (value === null ? '' : km1(value));

/**
 * The logbook as a CSV with every field the ATO asks for: the period, the
 * odometer at its start and end, total km, each business journey (dates,
 * odometer, km, reason) and the business-use percentage.
 */
export function toLogbookCsv(summary: LogbookSummary, vehicle: string): string {
  const { logbook } = summary;
  const rows: (string | number)[][] = [
    ['ATO car logbook (logbook method)'],
    ['Vehicle', vehicle],
    ['Logbook period start', formatDate(logbook.startDate, AU)],
    ['Logbook period end', formatDate(logbook.endDate, AU)],
    ['Status', statusText(summary)],
    ['Odometer at start of period (km)', reading(logbook.odometerStart)],
    ['Odometer at end of period (km)', reading(logbook.odometerEnd)],
    [
      'Total km travelled in the period',
      km1(summary.totalKm),
      summary.basis === 'odometer' ? 'Odometer end minus start' : 'Km logged by MileMint (odometer readings missing)',
    ],
    ['Business km travelled in the period', km1(summary.businessKm)],
    ['Business-use percentage', summary.businessPercent === null ? '' : `${summary.businessPercent}%`, percentBasisText(summary)],
    ['Can be used for income years', summary.status === 'complete' ? validYearsText(logbook) : ''],
    [],
    [
      'Journey start date',
      'Journey end date',
      'Odometer at start (km)',
      'Odometer at end (km)',
      'Km travelled',
      'Reason for the journey',
      'From',
      'To',
      'Odometer readings',
    ],
  ];
  for (const journey of summary.journeys) {
    const { trip } = journey;
    rows.push([
      formatDate(journey.startDate, AU),
      formatDate(journey.endDate, AU),
      reading(journey.odometerStart),
      reading(journey.odometerEnd),
      km1(journey.km),
      trip.purpose,
      trip.startLabel,
      trip.endLabel,
      journey.odometerStart === null ? '' : 'Calculated from GPS distance',
    ]);
  }
  rows.push(
    [],
    [
      'Journey odometer readings are calculated from the odometer at the start of the period plus the GPS distance of every drive logged since; the readings at the start and end of the period are read off the car. The logbook can be used for the income year it was kept in and the next 4, unless your circumstances change. Prepared with MileMint; not tax advice.',
    ],
  );
  return lines(rows);
}

export function logbookFileName(summary: LogbookSummary): string {
  return `MileMint ATO logbook ${summary.logbook.startDate} to ${summary.logbook.endDate}.csv`;
}
