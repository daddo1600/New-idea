import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { EXPENSE_CATEGORIES, plannedEndDate, type CarExpenses, type Logbook } from '@/domain/logbook';

type LogbookRow = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  odometer_start: number | null;
  odometer_end: number | null;
  created_at: string;
};

const fromRow = (row: LogbookRow): Logbook => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  startDate: row.start_date,
  endDate: row.end_date,
  odometerStart: row.odometer_start,
  odometerEnd: row.odometer_end,
  createdAt: row.created_at,
});

/** Every logbook, newest period first. */
export async function listLogbooks(db: SQLiteDatabase): Promise<Logbook[]> {
  const rows = await db.getAllAsync<LogbookRow>('SELECT * FROM logbooks ORDER BY start_date DESC, created_at DESC;');
  return rows.map(fromRow);
}

/** Starts a 12-week logbook for a car; it ends 12 weeks later unless closed early. */
export async function startLogbook(
  db: SQLiteDatabase,
  input: { vehicleId: string; startDate: string; odometerStart: number | null },
): Promise<Logbook> {
  const logbook: Logbook = {
    id: Crypto.randomUUID(),
    vehicleId: input.vehicleId,
    startDate: input.startDate,
    endDate: plannedEndDate(input.startDate),
    odometerStart: input.odometerStart,
    odometerEnd: null,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO logbooks (id, vehicle_id, start_date, end_date, odometer_start, odometer_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    logbook.id,
    logbook.vehicleId,
    logbook.startDate,
    logbook.endDate,
    logbook.odometerStart,
    logbook.odometerEnd,
    logbook.createdAt,
  );
  return logbook;
}

export async function saveLogbookOdometer(
  db: SQLiteDatabase,
  id: string,
  readings: { start: number | null; end: number | null },
): Promise<void> {
  await db.runAsync(
    'UPDATE logbooks SET odometer_start = ?, odometer_end = ? WHERE id = ?;',
    readings.start,
    readings.end,
    id,
  );
}

/** Ends the period before its 12 weeks are up (the screen warns it won't be a valid logbook). */
export async function closeLogbookEarly(db: SQLiteDatabase, id: string, endDate: string): Promise<void> {
  await db.runAsync('UPDATE logbooks SET end_date = MAX(start_date, ?) WHERE id = ?;', endDate, id);
}

export async function deleteLogbook(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM logbooks WHERE id = ?;', id);
}

/** A car's running costs for an income year, or null when none were entered. */
export async function getCarExpenses(db: SQLiteDatabase, vehicleId: string, taxYear: number): Promise<CarExpenses | null> {
  const row = await db.getFirstAsync<{ json: string }>(
    'SELECT json FROM car_expenses WHERE vehicle_id = ? AND tax_year = ?;',
    vehicleId,
    taxYear,
  );
  if (!row) return null;
  try {
    const stored = JSON.parse(row.json) as Record<string, unknown>;
    const expenses: CarExpenses = {};
    for (const category of EXPENSE_CATEGORIES) {
      const value = stored[category];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) expenses[category] = Math.round(value);
    }
    return expenses;
  } catch {
    return null;
  }
}

export async function saveCarExpenses(
  db: SQLiteDatabase,
  vehicleId: string,
  taxYear: number,
  expenses: CarExpenses,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO car_expenses (vehicle_id, tax_year, json) VALUES (?, ?, ?)
     ON CONFLICT (vehicle_id, tax_year) DO UPDATE SET json = excluded.json;`,
    vehicleId,
    taxYear,
    JSON.stringify(expenses),
  );
}
