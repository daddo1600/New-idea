import type { SQLiteDatabase } from 'expo-sqlite';

import type { WorkWeek } from '@/domain/classify-rules';

export type AppSettings = {
  /** Off by default: guessing from the clock is wrong for anyone without set hours. */
  workHoursEnabled: boolean;
  /** Kept while switched off so turning it back on restores the schedule. */
  workWeek: WorkWeek;
};

const WEEKDAY_9_TO_5 = [{ start: '09:00', end: '17:00' }];

export const DEFAULT_SETTINGS: AppSettings = {
  workHoursEnabled: false,
  workWeek: [[], WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, WEEKDAY_9_TO_5, []],
};

export async function loadSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM settings WHERE id = 1;');
  if (!row) return DEFAULT_SETTINGS;
  try {
    const stored = JSON.parse(row.json) as Partial<AppSettings>;
    const settings = { ...DEFAULT_SETTINGS, ...stored };
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
