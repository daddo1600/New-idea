import type { Row } from './snapshot';

/**
 * When to back up, as pure functions: on opening and leaving the app, if
 * anything changed and the last backup is over a day old, and at least once a
 * week regardless (so a quiet week still proves the backup works).
 */

export const MIN_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const MAX_BACKUP_INTERVAL_MS = 7 * MIN_BACKUP_INTERVAL_MS;
/** Backups kept in iCloud; older ones are deleted as new ones are written. */
export const BACKUPS_KEPT = 4;

/** Kept on the device (not in the database, which would change it every time). */
export type BackupState = {
  /** ISO time of the last backup written (or restored from). */
  at: string;
  /** Fingerprint of the data then, to tell whether anything changed since. */
  fingerprint: string;
};

export type BackupDecision = 'skip' | 'if-changed' | 'always';

export function backupDecision(now: Date, last: BackupState | null): BackupDecision {
  const at = last ? Date.parse(last.at) : NaN;
  if (Number.isNaN(at)) return 'always';
  const age = now.getTime() - at;
  // The clock went back (travel, a manual change): don't wait for it to catch up.
  if (age < 0) return 'if-changed';
  if (age < MIN_BACKUP_INTERVAL_MS) return 'skip';
  if (age >= MAX_BACKUP_INTERVAL_MS) return 'always';
  return 'if-changed';
}

/**
 * Whether to write a backup now. Never with no trips: a fresh install that
 * hasn't restored yet must not push the real backups out of the rolling set.
 */
export function shouldWrite(input: {
  decision: BackupDecision;
  fingerprint: string;
  last: BackupState | null;
  trips: number;
}): boolean {
  if (input.trips === 0 || input.decision === 'skip') return false;
  return input.decision === 'always' || input.fingerprint !== input.last?.fingerprint;
}

/**
 * What the change check hashes. Reading every route on each check would be
 * slow for a year of drives, so the two big tables are summarised: routes are
 * only ever added or deleted with their trip (count and total size tell), and
 * the edit history is append-only (count and last id tell). Everything else
 * is small and taken whole.
 */
export function fingerprintSource(parts: {
  schemaVersion: number;
  small: Record<string, Row[]>;
  routes: { count: number; size: number };
  edits: { count: number; lastId: number };
}): string {
  const small = Object.keys(parts.small)
    .sort()
    .map((table) => [table, parts.small[table]]);
  return JSON.stringify([parts.schemaVersion, small, parts.routes, parts.edits]);
}

export type Age = { unit: 'now' | 'minutes' | 'hours' | 'days'; count: number };

/** How long ago, for "Backed up 3 hours ago". */
export function backupAge(at: Date, now: Date): Age {
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000);
  if (minutes < 1) return { unit: 'now', count: 0 };
  if (minutes < 60) return { unit: 'minutes', count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: 'hours', count: hours };
  return { unit: 'days', count: Math.floor(hours / 24) };
}
