import type { SQLiteDatabase } from 'expo-sqlite';

import { EXPORT_FORMATS, type ExportFormat } from '@/domain/accounting-export';
import { MAX_PURPOSE_LENGTH } from '@/domain/auto-classify';
import type { WorkShift, WorkWeek } from '@/domain/classify-rules';
import { TAX_BANDS, type TaxBand } from '@/domain/mar';
import { REGIONS, type RegionCode } from '@/domain/regions';
import { VEHICLE_TYPES, type VehicleType } from '@/domain/trip';
import { cleanInvites, type ClaimRefusal, type IssuedInvite, type RedeemStatus } from '@/referral/invites';

import { withWriteLock } from './transaction';

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
   * The usual business purpose ("Client meeting"), filled in for business
   * drives that have none: when they're saved and when the user taps
   * Business. Common ones are stored in English, like trip purposes. Null:
   * none chosen ("Deliveries" in shift mode, see domain/auto-classify).
   */
  defaultPurpose: string | null;
  /** The kinds of work drive chosen at set-up (the first is defaultPurpose): offered first when a trip needs a purpose. */
  workPurposes: string[];
  /**
   * How the user is paid for business mileage (UK only for now). Employees
   * don't deduct mileage themselves: they claim Mileage Allowance Relief on
   * whatever their employer pays below HMRC's rate.
   */
  employment: 'self-employed' | 'employee';
  /** The employer's mileage rate in tenths of a penny a mile (450 = 45p); 0 when they pay nothing. */
  employerRate: number;
  /** Income tax band for the "tax back" estimate; "unsure" estimates at 20%. */
  taxBand: TaxBand;
  /** Tax years (start year) the user has marked as claimed, so home stops nudging about them. */
  claimedReliefYears: number[];
  /**
   * Client privacy mode (care, nursing, support work): new drives keep only the
   * area of stops the user hasn't named, and no GPS route. See domain/privacy.
   */
  clientPrivacy: boolean;
  /** Invites this user has sent, each with its own single-use code (src/referral/invites.ts). */
  invites: IssuedInvite[];
  /** A friend's invite code entered on this install. */
  redeemedCode: string | null;
  /** ISO time the friend's code was entered. */
  redeemedAt: string | null;
  /** 'pending' until iCloud confirms the invite; 'granted' (+10 free drives a month) after. */
  redeemStatus: RedeemStatus | null;
  /** Why iCloud last turned down a pending code, shown by the code box until another is entered. */
  redeemRefusal: ClaimRefusal | null;
  /** ISO time this user's claim was marked qualified in iCloud (3 real drives), crediting the sharer. */
  qualifiedAt: string | null;
  /** Friends who joined with this user's invites, as iCloud last counted them (+10 drives each). */
  friendsJoined: number;
  /** ISO time the app was first set up: a friend's code can be entered for 30 days after. */
  installedAt: string | null;
  /**
   * The practice run on home (sorting two sample drives) has been finished or
   * skipped. Settings can set it back to false to replay it.
   */
  tutorialDone: boolean;
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
  defaultPurpose: null,
  workPurposes: [],
  employment: 'self-employed',
  employerRate: 450,
  taxBand: 'unsure',
  claimedReliefYears: [],
  clientPrivacy: false,
  invites: [],
  redeemedCode: null,
  redeemedAt: null,
  redeemStatus: null,
  redeemRefusal: null,
  qualifiedAt: null,
  friendsJoined: 0,
  installedAt: null,
  tutorialDone: false,
};

type Check<T> = (value: unknown) => T | undefined;

const bool: Check<boolean> = (value) => (typeof value === 'boolean' ? value : undefined);
const oneOf =
  <T extends string>(allowed: readonly T[]): Check<T> =>
  (value) =>
    allowed.includes(value as T) ? (value as T) : undefined;
const textOrNull: Check<string | null> = (value) => (value === null || typeof value === 'string' ? value : undefined);
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Seven days of work hours; a damaged week would silently classify nothing (or crash the settings screen). */
const workWeek: Check<WorkWeek> = (value) => {
  if (!Array.isArray(value) || value.length !== 7 || !value.every((day) => Array.isArray(day))) return undefined;
  return value.map((day: unknown[]) =>
    day.filter(
      (shift): shift is WorkShift =>
        typeof shift === 'object' &&
        shift !== null &&
        TIME.test(String((shift as WorkShift).start)) &&
        TIME.test(String((shift as WorkShift).end)),
    ),
  );
};

/**
 * How each stored field is checked: anything else (a value from an older or
 * damaged build, the wrong type, an unknown choice) falls back to that
 * field's default, so one bad field never breaks the rest.
 */
const CHECKS: { [K in keyof AppSettings]-?: Check<AppSettings[K]> } = {
  workHoursEnabled: bool,
  workWeek,
  region: (value) =>
    value === null || (typeof value === 'string' && Object.hasOwn(REGIONS, value))
      ? (value as RegionCode | null)
      : undefined,
  weeklyReminder: bool,
  reminderAsked: bool,
  reminderDefaulted: bool,
  celebrated: (value) => (Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : undefined),
  exportedReport: bool,
  exportFormat: oneOf(EXPORT_FORMATS),
  onboarded: bool,
  vehicle: oneOf(VEHICLE_TYPES),
  currentVehicleId: textOrNull,
  shiftMode: bool,
  defaultBusiness: bool,
  defaultPurpose: (value) => {
    if (value === null) return null;
    if (typeof value !== 'string') return undefined;
    // Blank means none; an over-long one (a damaged value) is cut to a phrase.
    return value.trim().slice(0, MAX_PURPOSE_LENGTH).trim() || null;
  },
  workPurposes: (value) =>
    Array.isArray(value)
      ? value
          .filter((text): text is string => typeof text === 'string' && text.trim() !== '')
          .map((text) => text.trim().slice(0, MAX_PURPOSE_LENGTH).trim())
          .slice(0, 12)
      : undefined,
  employment: oneOf(['self-employed', 'employee'] as const),
  employerRate: (value) => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined),
  taxBand: oneOf(TAX_BANDS),
  claimedReliefYears: (value) =>
    Array.isArray(value) ? value.filter((year): year is number => Number.isInteger(year)) : undefined,
  clientPrivacy: bool,
  invites: (value) => cleanInvites(value),
  redeemedCode: textOrNull,
  redeemedAt: textOrNull,
  redeemStatus: oneOf(['pending', 'granted'] as const),
  redeemRefusal: oneOf(['not-found', 'used', 'own', 'already-claimed'] as const),
  qualifiedAt: textOrNull,
  friendsJoined: (value) => (typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined),
  installedAt: textOrNull,
  tutorialDone: bool,
};

/** Stored settings, each field checked against its type and allowed values (see CHECKS). */
export function parseSettings(json: string): AppSettings {
  let stored: unknown;
  try {
    stored = JSON.parse(json);
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return DEFAULT_SETTINGS;
  const record = stored as Record<string, unknown>;
  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(CHECKS) as (keyof AppSettings)[]) {
    if (!Object.hasOwn(record, key)) continue;
    const checked = (CHECKS[key] as Check<unknown>)(record[key]);
    if (checked !== undefined) settings[key] = checked;
  }
  // A code entered before invites were checked in iCloud waits, pending, to be confirmed.
  if (!settings.redeemedCode) settings.redeemStatus = null;
  else if (settings.redeemStatus !== 'granted') settings.redeemStatus = 'pending';
  return settings as AppSettings;
}

export async function loadSettings(db: Pick<SQLiteDatabase, 'getFirstAsync'>): Promise<AppSettings> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM settings WHERE id = 1;');
  return row ? parseSettings(row.json) : DEFAULT_SETTINGS;
}

/**
 * Writes the whole settings row without taking the write lock: only for code
 * already inside inWriteTransaction/withWriteLock. Everything else uses
 * updateSettings (or saveSettings).
 */
export async function writeSettings(db: Pick<SQLiteDatabase, 'runAsync'>, settings: AppSettings): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (id, json) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET json = excluded.json;',
    JSON.stringify(settings),
  );
}

/**
 * Replaces the settings outright, in its turn in the write queue. To change
 * some fields use updateSettings instead: settings loaded a moment ago may be
 * stale by now, and saving them whole would undo another change made since.
 */
export function saveSettings(db: SQLiteDatabase, settings: AppSettings): Promise<void> {
  return withWriteLock(() => writeSettings(db, settings));
}

export type SettingsPatch = Partial<AppSettings> | ((saved: AppSettings) => Partial<AppSettings>);

/**
 * Changes some settings: loads what's saved, applies `patch` (worked out from
 * the saved settings when it's a function) and saves, all in one turn of the
 * write queue, so two changes made at once both stick. Returns the new settings.
 */
export function updateSettings(db: SQLiteDatabase, patch: SettingsPatch): Promise<AppSettings> {
  return withWriteLock(async () => {
    const saved = await loadSettings(db);
    const next = { ...saved, ...(typeof patch === 'function' ? patch(saved) : patch) };
    await writeSettings(db, next);
    return next;
  });
}
