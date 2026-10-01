import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { DEMO_MODE } from '@/dev/demo';
import { exportFile, type ExportFormat } from '@/domain/accounting-export';
import { type MarOptions, type MarSummary, p87FileName, toP87Csv, toP87Html } from '@/domain/mar';
import type { Region } from '@/domain/regions';
import { pageSize, toReportHtml, type MileageReport } from '@/domain/report';

/**
 * Hands a report to the iOS share sheet (Mail, Files, AirDrop, the
 * accountant's email…). Nothing is uploaded: the file only leaves the phone
 * where the user sends it.
 */

/** The web preview's demo shows the button as on iPhone (for store screenshots). */
export const PDF_AVAILABLE = Platform.OS !== 'web' || DEMO_MODE;

function cacheFile(name: string): File {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  return file;
}

/** Web preview only: download the file instead of sharing it. */
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** The trip log as a spreadsheet, or laid out for accounting software or an expense claim. */
export async function shareCsv(report: MileageReport, format: ExportFormat = 'spreadsheet'): Promise<void> {
  const { name, text: csv } = exportFile(report, format);
  if (Platform.OS === 'web') return download(name, csv, 'text/csv');
  const file = cacheFile(name);
  file.write(csv);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
    dialogTitle: name,
  });
}

export async function sharePdf(report: MileageReport): Promise<void> {
  const name = `MileMint ${report.label.replace('/', '-')} ${report.region.authority} mileage report.pdf`;
  const { uri } = await Print.printToFileAsync({
    html: toReportHtml(report),
    // US Letter or A4, with half-inch margins.
    ...pageSize(report.region),
    margins: { left: 36, right: 36, top: 36, bottom: 36 },
  });
  const file = cacheFile(name);
  new File(uri).move(file);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: name });
}

/** The Mileage Allowance Relief figures per tax year, to fill in a P87 or Self Assessment. */
export async function shareP87Summary(
  summary: MarSummary,
  region: Region,
  options: MarOptions,
  kind: 'csv' | 'pdf',
): Promise<void> {
  const name = p87FileName(kind);
  if (kind === 'csv') {
    const csv = toP87Csv(summary);
    if (Platform.OS === 'web') return download(name, csv, 'text/csv');
    const file = cacheFile(name);
    file.write(csv);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
      dialogTitle: name,
    });
    return;
  }
  const { uri } = await Print.printToFileAsync({
    html: toP87Html(summary, region, options),
    ...pageSize(region),
    margins: { left: 36, right: 36, top: 36, bottom: 36 },
  });
  const file = cacheFile(name);
  new File(uri).move(file);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: name });
}
