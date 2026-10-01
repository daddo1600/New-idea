import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExportFormat } from '@/domain/accounting-export';
import type { WorkWeek } from '@/domain/classify-rules';
import { REGIONS, type RegionCode } from '@/domain/regions';
import type { VehicleType } from '@/domain/trip';

export type AppSettings = {
  /** Off by default: guessing from the clock is wrong for anyone without set hours. */
  workHoursEnabled: boolean;
  /** Kept while switched off so turning it back on restores the schedule. */
  workWeek: WorkWeek;
  /** Where the user drives; null until they choose on first launch. */
  region: RegionCode | null;
  /** Sunday-evening "sort this week's drives" notification. */
  weeklyReminder: boolean;
  /** The "Sunday nudge?" card has been answered (asked once the first trip appears). */
  reminderAsked: boolean;
  /**
   * The Sunday reminder has had its one-time switch-on (it's on by default, also
   * for people who set up before that). After this, turning it off sticks.
   */
  reminderDefaulted: boolean;
  /** Milestones already celebrated (ids), so each pat on the back happens once. */
  celebrated: string[];
  /** A report has been exported (a milestone). */
  exportedReport: boolean;
  /** Where exports go: a spreadsheet, accounting software or an expense claim. Remembered between exports. */
  exportFormat: ExportFormat;
  /** The first-launch welcome flow has been completed. */
  onboarded: boolean;
  /** The type of the vehicle being driven now (mirrors the current vehicle; seeds the first one). */
  vehicle: VehicleType;
  /** The garage vehicle new drives are recorded against. */
  currentVehicleId: string | null;
  /** Couriers and gig drivers: a Start shift / End shift button instead of (or as well as) work hours. */
  shiftMode: boolean;
  /** Drives no rule decides start as business (swipe left if personal); off leaves them unsorted. */
  defaultBusiness: boolean;
  /**
   * Client privacy mode (care, nursing, support work): new drives keep only the
   * area of stops the user hasn't named, and no GPS route. See domain/privacy.
   */
  clientPrivacy: boolean;
};

const WEEKDAY_9_TO_5 = [{ start: '09:00', end: '17:00' }];

export const DEFAULT_SETTINGS: AppSettings = {
  workHoursEnabled: false,
  workWeek: [[], WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, []],
  region: null,
  weeklyReminder: false,
  reminderAsked: false,
  reminderDefaulted: false,
  celebrated: [],
  exportedReport: false,
  exportFormat: 'spreadsheet',
  onboarded: false,
  vehicle: 'car',
  currentVehicleId: null,
  shiftMode: false,
  defaultBusiness: true,
  clientPrivacy: false,
};

export async function loadSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM settings WHERE id = 1;');
  if (!row) return DEFAULT_SETTINGS;
  try {
    const stored = JSON.parse(row.json) as Partial<AppSettings>;
    const settings = { ...DEFAULT_SETTINGS, ...stored };
    if (settings.region !== null && !(settings.region in REGIONS)) settings.region = null;
    // A damaged week would silently classify nothing; fall back instead.
    return Array.isArray(settings.workWeek) && settings.workWeek.length === 7
      ? settings
      : { ...settings, workWeek: DEFAULT_SETTINGS.workWeek };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(db: SQLiteDatabase, settings: AppSettings): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (id, json) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET json = excluded.json;',
    JSON.stringify(settings),
  );
}
