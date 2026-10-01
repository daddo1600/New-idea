import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

/** The parts of a connection a write transaction uses (a fake one in tests). */
export type Writer = Pick<SQLiteDatabase, 'execAsync' | 'withTransactionAsync'>;

/**
 * Runs `task` as one write transaction: everything or nothing.
 *
 * On devices the app and a background location wake-up can open the database
 * at the same moment. BEGIN IMMEDIATE takes the write lock up front (waiting
 * out the other side via busy_timeout). Not withExclusiveTransactionAsync:
 * that opens a second connection which never received the SQLCipher key, so
 * it can't read the encrypted file ("file is not a database") and the app
 * failed on launch.
 */
export function inWriteTransaction(db: Writer, task: () => Promise<void>): Promise<void> {
  return withWriteLock(async () => {
    // The web preview has a single connection and no locking to worry about.
    if (Platform.OS === 'web') return db.withTransactionAsync(task);
    await db.execAsync('BEGIN IMMEDIATE;');
    try {
      await task();
      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;').catch(() => {});
      throw error;
    }
  });
}

/**
 * expo-sqlite gives the app (SQLiteProvider) and the background location task
 * the same native connection for the same file, so busy_timeout never comes
 * into play: a second BEGIN on that connection fails straight away ("cannot
 * start a transaction within a transaction"), and its ROLLBACK would undo the
 * first one's work. Both run in the same JavaScript runtime, so one queue here
 * keeps their transactions one after another. Never call inWriteTransaction
 * from inside another one's task: it would wait for itself.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

export function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => {});
  return run;
}

/**
 * Runs `task`'s reads as one read transaction, so they all see the database
 * as it was at one moment (a backup whose trips and edit history agree).
 * Takes its turn in the same queue as writes.
 */
export function inReadTransaction<T>(db: Pick<SQLiteDatabase, 'execAsync'>, task: () => Promise<T>): Promise<T> {
  return withWriteLock(async () => {
    if (Platform.OS === 'web') return task();
    await db.execAsync('BEGIN DEFERRED;');
    try {
      return await task();
    } finally {
      // Nothing to undo in a read; COMMIT also keeps any write that slipped in on this connection.
      await db.execAsync('COMMIT;').catch(() => db.execAsync('ROLLBACK;').catch(() => {}));
    }
  });
}
