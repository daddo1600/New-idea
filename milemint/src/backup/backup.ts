import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { SCHEMA_VERSION } from '@/db/migrations';
import { inReadTransaction, inWriteTransaction } from '@/db/transaction';

import { ICloudBackup } from '../../modules/icloud-backup';
import { clearScrub, pendingScrub } from './after-scrub';
import { base64ToUtf8Async, utf8ToBase64Async } from './base64';
import {
  BACKUPS_KEPT,
  backupDecision,
  fingerprintSource,
  shouldWrite,
  type BackupState,
} from './schedule';
import {
  BACKUP_TABLES,
  BackupError,
  backupDateFromName,
  backupFileName,
  emptyTables,
  makeSnapshot,
  mapRowsInTurns,
  packRoute,
  parseSnapshot,
  restorePlan,
  type BackupTable,
  type Row,
  type Snapshot,
  unpackRoute,
} from './snapshot';

/**
 * Automatic, end-to-end encrypted backups to the user's own iCloud, and
 * restoring from them. The snapshot is built here, sealed (compressed and
 * encrypted with the iCloud Keychain key) by modules/icloud-backup, and only
 * the sealed bytes are written to iCloud. MileSprout has no server in the loop.
 */

const STATE_KEY = 'milemint.backup.state';
const STORE_OPTIONS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

export async function loadBackupState(): Promise<BackupState | null> {
  if (Platform.OS === 'web') return null;
  try {
    const stored = await SecureStore.getItemAsync(STATE_KEY, STORE_OPTIONS);
    const parsed = stored ? (JSON.parse(stored) as Partial<BackupState>) : null;
    return typeof parsed?.at === 'string' && typeof parsed.fingerprint === 'string'
      ? { at: parsed.at, fingerprint: parsed.fingerprint }
      : null;
  } catch {
    return null;
  }
}

async function saveBackupState(state: BackupState): Promise<void> {
  await SecureStore.setItemAsync(STATE_KEY, JSON.stringify(state), STORE_OPTIONS);
}

const appVersion = () => Constants.expoConfig?.version ?? 'unknown';

// ─── Reading the database ──────────────────────────────────────────────────

async function readTable(db: SQLiteDatabase, table: BackupTable): Promise<Row[]> {
  return db.getAllAsync<Row>(`SELECT * FROM ${table} ORDER BY rowid;`);
}

/**
 * Every table a backup holds, rows exactly as stored, all read in one
 * transaction: a trip saved by the background tracker halfway through can't
 * leave the backup with its edit history but not the trip, or the other way round.
 */
async function readTables(db: SQLiteDatabase) {
  const tables = await inReadTransaction(db, async () => {
    const read = emptyTables();
    for (const table of BACKUP_TABLES) read[table] = await readTable(db, table);
    return read;
  });
  // Packed here, a few at a time, rather than all at once in makeSnapshot (which then has nothing left to do).
  tables.trip_routes = await mapRowsInTurns(tables.trip_routes, packRoute);
  return tables;
}

/*
 * The snapshot crosses to the native module as text where the build can take
 * it (UTF-8 conversion in Swift, off the JavaScript thread). Builds from
 * before that only take base64, made here a slice at a time.
 */
function seal(json: string): Promise<string> {
  if (ICloudBackup.sealsText) return ICloudBackup.sealText(json);
  return utf8ToBase64Async(json).then((base64) => ICloudBackup.seal(base64));
}

async function unseal(sealed: string): Promise<string> {
  if (ICloudBackup.sealsText) return ICloudBackup.openText(sealed);
  return base64ToUtf8Async(await ICloudBackup.open(sealed));
}

/** A cheap hash of the data, to tell whether anything changed since the last backup. */
async function fingerprint(db: SQLiteDatabase): Promise<{ fingerprint: string; trips: number }> {
  const small: Record<string, Row[]> = {};
  for (const table of BACKUP_TABLES) {
    if (table !== 'trip_routes' && table !== 'trip_edits') small[table] = await readTable(db, table);
  }
  const routes = await db.getFirstAsync<{ count: number; size: number }>(
    'SELECT COUNT(*) AS count, COALESCE(SUM(LENGTH(points)), 0) AS size FROM trip_routes;',
  );
  const edits = await db.getFirstAsync<{ count: number; lastId: number }>(
    'SELECT COUNT(*) AS count, COALESCE(MAX(id), 0) AS lastId FROM trip_edits;',
  );
  const source = fingerprintSource({
    schemaVersion: SCHEMA_VERSION,
    small,
    routes: routes ?? { count: 0, size: 0 },
    edits: edits ?? { count: 0, lastId: 0 },
  });
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, source);
  return { fingerprint: hash, trips: small.trips.length };
}

// ─── Backing up ────────────────────────────────────────────────────────────

export type BackupOutcome = 'written' | 'unchanged' | 'not-due' | 'empty' | 'unavailable';

/**
 * Backing up and restoring take turns: a backup read halfway through a
 * restore would save half of each, and a restore must not start while a
 * backup is still reading.
 */
let queue: Promise<unknown> = Promise.resolve();

function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

/**
 * Backs up if one is due (see schedule.ts), or now when `force`d (Settings →
 * Back up now), or after past trips were scrubbed of addresses (then the
 * older backups are replaced too). One at a time: a second call waits for the
 * first.
 */
export function backUp(db: SQLiteDatabase, { force = false } = {}): Promise<BackupOutcome> {
  return exclusive(() => run(db, force));
}

async function run(db: SQLiteDatabase, force: boolean): Promise<BackupOutcome> {
  if (!(await ICloudBackup.isAvailable())) return 'unavailable';
  const last = await loadBackupState();
  const scrubbedAt = await pendingScrub();
  const now = new Date();
  const decision = force || scrubbedAt !== null ? 'always' : backupDecision(now, last);
  if (decision === 'skip') return 'not-due';
  const current = await fingerprint(db);
  if (!shouldWrite({ decision, last, ...current })) return current.trips === 0 ? 'empty' : 'unchanged';

  const snapshot = makeSnapshot(await readTables(db), { appVersion: appVersion(), createdAt: now });
  // Plaintext goes only as far as the native module, which encrypts it before anything is written.
  const sealed = await seal(JSON.stringify(snapshot));
  if (scrubbedAt === null) {
    await ICloudBackup.write(backupFileName(now), sealed, BACKUPS_KEPT);
  } else {
    // Every older backup still has the addresses. The native side always keeps the newest two, so the
    // same backup goes in twice, a second apart: together the two copies push all the older ones out.
    await ICloudBackup.write(backupFileName(now), sealed, 1);
    await ICloudBackup.write(backupFileName(new Date(now.getTime() + 1000)), sealed, 1);
    await clearScrub(scrubbedAt);
  }
  await saveBackupState({ at: snapshot.createdAt, fingerprint: current.fingerprint });
  return 'written';
}

// ─── Finding and restoring ─────────────────────────────────────────────────

export type BackupProblem = 'key-missing' | 'newer-app' | 'not-downloaded' | 'damaged';

export type FoundBackup = {
  name: string;
  createdAt: Date;
  /** Null when it couldn't be opened on this iPhone (see `problem`). */
  snapshot: Snapshot | null;
  problem: BackupProblem | null;
};

export function problemOf(error: unknown): BackupProblem {
  if (error instanceof BackupError) return error.code === 'newer-app' ? 'newer-app' : 'damaged';
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'ERR_BACKUP_KEY_MISSING') return 'key-missing';
  if (code === 'ERR_BACKUP_NOT_FOUND' || code === 'ERR_ICLOUD_UNAVAILABLE') return 'not-downloaded';
  return 'damaged';
}

async function openBackup(name: string): Promise<Snapshot> {
  const sealed = await ICloudBackup.read(name);
  return parseSnapshot(await unseal(sealed));
}

/**
 * The newest backup this iPhone can open, or else the newest one with the
 * reason it can't be opened (most often: iCloud Keychain hasn't brought the
 * key over yet). Null when iCloud has no backups or isn't available.
 */
export async function findLatestBackup(): Promise<FoundBackup | null> {
  if (!(await ICloudBackup.isAvailable())) return null;
  const files = [...(await ICloudBackup.list())].sort((a, b) => (a.name < b.name ? 1 : -1));
  let first: FoundBackup | null = null;
  for (const file of files) {
    const createdAt = backupDateFromName(file.name) ?? new Date(file.modified);
    try {
      return { name: file.name, createdAt, snapshot: await openBackup(file.name), problem: null };
    } catch (error) {
      first ??= { name: file.name, createdAt, snapshot: null, problem: problemOf(error) };
    }
  }
  return first;
}

/** Whether the database has no trips yet (a fresh install, where restoring is offered). */
export async function isDatabaseEmpty(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM trips;');
  return (row?.count ?? 0) === 0;
}

/**
 * Replaces everything on this iPhone with the backup, in one transaction:
 * if any row fails, nothing changes.
 */
export function restoreSnapshot(db: SQLiteDatabase, snapshot: Snapshot): Promise<void> {
  return exclusive(() => restore(db, snapshot));
}

async function restore(db: SQLiteDatabase, snapshot: Snapshot): Promise<void> {
  const columns = {} as Record<BackupTable, string[]>;
  for (const table of BACKUP_TABLES) {
    const info = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table});`);
    columns[table] = info.map((column) => column.name);
  }
  // Routes unpacked a few at a time first (restorePlan would do them all at once).
  const routes = await mapRowsInTurns(snapshot.tables.trip_routes, unpackRoute);
  const plan = restorePlan({ ...snapshot, tables: { ...snapshot.tables, trip_routes: routes } }, columns);
  await inWriteTransaction(db, async () => {
    for (const step of plan) {
      if (step.rows.length === 0) {
        await db.execAsync(step.sql);
        continue;
      }
      const statement = await db.prepareAsync(step.sql);
      try {
        for (const row of step.rows) await statement.executeAsync(row);
      } finally {
        await statement.finalizeAsync();
      }
    }
  });
  // What's here now is what's in iCloud: no need to back it straight up again.
  const current = await fingerprint(db);
  await saveBackupState({ at: snapshot.createdAt, fingerprint: current.fingerprint }).catch(() => {});
}

/** Re-reads a backup (it may have been found before its key arrived) and restores it. */
export async function restoreBackup(db: SQLiteDatabase, found: FoundBackup): Promise<Snapshot> {
  const snapshot = found.snapshot ?? (await openBackup(found.name));
  await restoreSnapshot(db, snapshot);
  return snapshot;
}
