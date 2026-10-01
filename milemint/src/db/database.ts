import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { migrate } from './migrations';

export const DATABASE_NAME = 'milemint.db';

const KEY_NAME = 'milemint.db.key.v1';

/**
 * Expo Go (the free preview app) doesn't bundle SQLCipher. It reports the
 * `storeClient` environment, as do our own dev builds, which do include
 * SQLCipher. Store/TestFlight builds report `standalone` and are never
 * allowed to fall back to an unencrypted database.
 */
const MAY_RUN_UNENCRYPTED = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Returns the database encryption key, creating it on first launch.
 *
 * AFTER_FIRST_UNLOCK (not THIS_DEVICE_ONLY) is deliberate: the key must be
 * readable while the phone is locked in a car mount so background trips can
 * be saved, and it must travel with the user's encrypted iCloud backup so a
 * restored phone can still open the database.
 */
async function getOrCreateKeyHex(): Promise<string> {
  const options = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };
  const existing = await SecureStore.getItemAsync(KEY_NAME, options);
  if (existing) return existing;
  const bytes = await Crypto.getRandomBytesAsync(32);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(KEY_NAME, hex, options);
  return hex;
}

/**
 * Unlocks the SQLCipher database, then runs migrations. Used as the
 * SQLiteProvider `onInit`, so no screen can touch the database before this.
 *
 * `PRAGMA key` is silently ignored by plain SQLite, so we confirm SQLCipher
 * is really active and refuse to continue rather than write trips in the clear.
 */
export function initDatabase(db: SQLiteDatabase): Promise<void> {
  // The app and a background wake-up can open the database at the same moment
  // (e.g. the first launch after an update is a geofence exit mid-drive). They
  // share one native connection, so unlocking and migrating run one at a time;
  // the second finds the schema already up to date.
  const run = initQueue.then(() => unlockAndMigrate(db));
  initQueue = run.catch(() => {});
  return run;
}

let initQueue: Promise<void> = Promise.resolve();

async function unlockAndMigrate(db: SQLiteDatabase): Promise<void> {
  // Web is a development preview only: no SQLCipher and no Keychain there.
  if (Platform.OS !== 'web') {
    const keyHex = await getOrCreateKeyHex();
    // Raw 256-bit key syntax: skips passphrase derivation, key never logged.
    await db.execAsync(`PRAGMA key = "x'${keyHex}'";`);
    const cipher = await db.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version;');
    if (!cipher?.cipher_version) {
      if (!MAY_RUN_UNENCRYPTED) {
        throw new Error('Database encryption is not active; refusing to open.');
      }
      console.warn('SQLCipher unavailable (Expo Go?): database is NOT encrypted.');
    }
  }
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  await migrate(db);
}

let backgroundDb: Promise<SQLiteDatabase> | null = null;

/**
 * Database connection for background tasks, which run outside React and so
 * can't use SQLiteProvider. Opened once per process.
 */
export function getBackgroundDatabase(): Promise<SQLiteDatabase> {
  backgroundDb ??= (async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);
    await initDatabase(db);
    return db;
  })().catch((error) => {
    backgroundDb = null;
    throw error;
  });
  return backgroundDb;
}
