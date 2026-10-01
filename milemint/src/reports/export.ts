import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { exportFile, logbookFileName, toLogbookCsv, type ExportFormat } from '@/domain/accounting-export';
import type { LogbookSummary } from '@/domain/logbook';
import { pageSize, toReportHtml, type MileageReport } from '@/domain/report';

/**
 * Hands a report to the iOS share sheet (Mail, Files, AirDrop, the
 * accountant's email…). Nothing is uploaded: the file only leaves the phone
 * where the user sends it.
 */

export const PDF_AVAILABLE = Platform.OS !== 'web';

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
  const { name, text } = exportFile(report, format);
  await shareCsvText(name, text);
}

/** Australia: the ATO logbook for one car, with every field the ATO asks for. */
export async function shareLogbookCsv(summary: LogbookSummary, vehicle: string): Promise<void> {
  await shareCsvText(logbookFileName(summary), toLogbookCsv(summary, vehicle));
}

async function shareCsvText(name: string, csv: string): Promise<void> {
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
