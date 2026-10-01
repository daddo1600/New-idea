import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

/** The parts of a connection a write transaction uses (a fake one in tests). */
export type Writer = Pick<SQLiteDatabase, 'execAsync' | 'withTransactionAsync'>;

/**
 * One transaction at a time on each connection. SQLite has one transaction
 * per connection, so a second BEGIN on the same one while another is open
 * fails ("cannot start a transaction within a transaction"), or worse, its
 * statements run inside the other one and are rolled back with it. Calls on
 * the same connection wait their turn here. Never nest them: an inner call
 * would wait for the outer one forever.
 */
const queues = new WeakMap<object, Promise<unknown>>();

function serialized<T>(db: object, task: () => Promise<T>): Promise<T> {
  const before = queues.get(db) ?? Promise.resolve();
  const result = before.then(task, task);
  queues.set(db, result.catch(() => {}));
  return result;
}

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
  return serialized(db, async () => {
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
 * Runs `task`'s reads as one read transaction, so they all see the database
 * as it was at one moment (a backup whose trips and edit history agree), even
 * while the background tracker writes on its own connection. Waits for, and
 * holds off, write transactions on the same connection.
 */
export function inReadTransaction<T>(db: Pick<SQLiteDatabase, 'execAsync'>, task: () => Promise<T>): Promise<T> {
  return serialized(db, async () => {
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
