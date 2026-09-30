import type { SQLiteDatabase } from 'expo-sqlite';

import type { RegionCode } from '@/domain/regions';

/** Odometer readings for one tax year, in the region's unit (miles or km). */
export type OdometerReadings = { start: number | null; end: number | null };

export async function getOdometer(db: SQLiteDatabase, region: RegionCode, taxYear: number): Promise<OdometerReadings> {
  const row = await db.getFirstAsync<{ start_reading: number | null; end_reading: number | null }>(
    'SELECT start_reading, end_reading FROM odometer_readings WHERE region = ? AND tax_year = ?;',
    region,
    taxYear,
  );
  return { start: row?.start_reading ?? null, end: row?.end_reading ?? null };
}

export async function saveOdometer(
  db: SQLiteDatabase,
  region: RegionCode,
  taxYear: number,
  readings: OdometerReadings,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO odometer_readings (region, tax_year, start_reading, end_reading) VALUES (?, ?, ?, ?)
     ON CONFLICT (region, tax_year) DO UPDATE SET start_reading = excluded.start_reading, end_reading = excluded.end_reading;`,
    region,
    taxYear,
    readings.start,
    readings.end,
  );
}
