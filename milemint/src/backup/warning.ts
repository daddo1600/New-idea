import type { BackupFailure } from './backup';

/**
 * When Home warns that trips aren't backed up, as a pure function. Backups
 * run by themselves, so a problem is otherwise invisible until a lost phone.
 * Quiet for a fresh install's first days (the first backup can wait for
 * trips), and never on builds or devices without iCloud backup.
 */
export type BackupWarning = 'off' | 'failing' | 'never' | 'stale';

/** Trips this old with no backup at all are worth a warning. */
export const NEVER_BACKED_UP_DAYS = 3;
/** Backups are due daily on changes and weekly regardless; a fortnight means they've stopped. */
export const STALE_BACKUP_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export function backupWarning(input: {
  supported: boolean;
  /** iCloud signed in, iCloud Drive on for MileSprout; null while checking. */
  available: boolean | null;
  lastAt: Date | null;
  failure: BackupFailure | null;
  trips: number;
  /** When the earliest trip started (ISO), or null. */
  oldestTripAt: string | null;
  now: Date;
}): BackupWarning | null {
  const { supported, available, lastAt, failure, trips, oldestTripAt, now } = input;
  if (!supported || available === null || trips === 0) return null;
  if (!available) return 'off';
  if (failure && (!lastAt || Date.parse(failure.at) > lastAt.getTime())) return 'failing';
  if (!lastAt) {
    const oldest = oldestTripAt ? Date.parse(oldestTripAt) : NaN;
    return !Number.isNaN(oldest) && now.getTime() - oldest >= NEVER_BACKED_UP_DAYS * DAY_MS ? 'never' : null;
  }
  return now.getTime() - lastAt.getTime() >= STALE_BACKUP_DAYS * DAY_MS ? 'stale' : null;
}
