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
 *
 * Inside `task`, write with plain runAsync/execAsync: calling anything that
 * takes the lock itself (saveSettings, insertPlace, …) would wait for this
 * task to finish, forever; see withWriteLock.
 */
export function inWriteTransaction(db: Writer, task: () => Promise<void>): Promise<void> {
  return withWriteLock(async () => {
    // The web preview has a single connection and no locking to worry about.
    if (Platform.OS === 'web') return db.withTransactionAsync(() => startLocked(task));
    await db.execAsync('BEGIN IMMEDIATE;');
    try {
      await startLocked(task);
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
 * first one's work. A write outside any transaction lands inside whichever
 * one is open, and is rolled back with it. Both run in the same JavaScript
 * runtime, so every write goes through this one queue: single statements via
 * withWriteLock, several together via inWriteTransaction.
 *
 * Never call either from inside another one's task: it would wait for itself
 * forever. There's no async context to tell such a call apart in general,
 * so it is caught two ways:
 *  - asked for before the task's first await (on any engine): fails at once
 *    with a NestedWriteLockError;
 *  - otherwise, a write still waiting after `lockWait.ms`: in development it
 *    gives up with a NestedWriteLockError (which the nested caller sees, so
 *    its task ends and the queue moves on); in production it logs a warning
 *    and keeps waiting, as a slow but legitimate turn would.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

/** How long a write may wait for its turn before it's taken to be nested (see above). Tests shorten it. */
export const lockWait = { ms: 15_000 };

export class NestedWriteLockError extends Error {
  constructor(waitedMs?: number, gaveUp = true) {
    super(
      (waitedMs === undefined
        ? 'withWriteLock/inWriteTransaction was called from inside a task already holding the write lock.'
        : `A database write waited ${waitedMs / 1000} s for the write lock: most likely it was asked for from ` +
          `inside a task already holding it${gaveUp ? ' (gave up; development builds only)' : ''}.`) +
        ' That waits for itself forever: inside a locked task, write with db.runAsync directly ' +
        "(or the repo's unlocked variant, e.g. writeSettings).",
    );
    this.name = 'NestedWriteLockError';
  }
}

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/** Above 0 while a locked task runs synchronously (up to its first await). */
let startingTasks = 0;

/** Starts a task that holds the lock: a write lock asked for before its first await is nested. */
function startLocked<T>(task: () => Promise<T>): Promise<T> {
  startingTasks++;
  try {
    return task();
  } finally {
    startingTasks--;
  }
}

export function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  if (startingTasks > 0) return Promise.reject(new NestedWriteLockError());
  let state: 'waiting' | 'started' | 'abandoned' = 'waiting';
  let giveUp: (error: Error) => void = () => {};
  const gaveUp = new Promise<never>((_, reject) => (giveUp = reject));
  const limit = lockWait.ms;
  const timer = setTimeout(() => {
    if (state !== 'waiting') return;
    if (isDev) {
      state = 'abandoned';
      giveUp(new NestedWriteLockError(limit));
    } else {
      console.warn(new NestedWriteLockError(limit, false).message);
    }
  }, limit);
  const start = (): Promise<T> | undefined => {
    clearTimeout(timer);
    // Gave up waiting: its caller has the error already, and the task must not run late.
    if (state === 'abandoned') return undefined;
    state = 'started';
    return startLocked(task);
  };
  const turn = writeQueue.then(start, start);
  writeQueue = turn.catch(() => {});
  return (isDev ? Promise.race([turn, gaveUp]) : turn) as Promise<T>;
}

/**
 * Runs `task`'s reads as one read transaction, so they all see the database
 * as it was at one moment (a backup whose trips and edit history agree).
 * Takes its turn in the same queue as writes.
 */
export function inReadTransaction<T>(db: Pick<SQLiteDatabase, 'execAsync'>, task: () => Promise<T>): Promise<T> {
  return withWriteLock(async () => {
    if (Platform.OS === 'web') return startLocked(task);
    await db.execAsync('BEGIN DEFERRED;');
    try {
      return await startLocked(task);
    } finally {
      // Nothing to undo in a read; COMMIT also keeps any write that slipped in on this connection.
      await db.execAsync('COMMIT;').catch(() => db.execAsync('ROLLBACK;').catch(() => {}));
    }
  });
}
