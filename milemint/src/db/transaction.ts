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
export async function inWriteTransaction(db: Writer, task: () => Promise<void>): Promise<void> {
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
}
