import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Addresses removed from past trips (client privacy) are still in the older
 * iCloud backups until those are replaced. This remembers that a scrub
 * happened, so the next backup runs straight away, whatever the schedule, and
 * replaces every older backup (see backup.ts). Kept on the device, beside the
 * backup state, so it survives the app being closed before that backup runs.
 */

const KEY = 'milemint.backup.scrubbedAt';
const STORE_OPTIONS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

const listeners = new Set<() => void>();

/** Called after past trips were scrubbed: asks for a fresh backup that replaces the older ones. */
export async function noteScrubbed(at: Date = new Date()): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(KEY, at.toISOString(), STORE_OPTIONS).catch(() => {});
  }
  for (const listener of listeners) listener();
}

/** When past trips were last scrubbed, if no backup has replaced the older ones since. */
export async function pendingScrub(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const at = await SecureStore.getItemAsync(KEY, STORE_OPTIONS).catch(() => null);
  return typeof at === 'string' ? at : null;
}

/** The older backups are gone: forget the scrub (unless another one happened meanwhile). */
export async function clearScrub(at: string): Promise<void> {
  if ((await pendingScrub()) !== at) return;
  await SecureStore.deleteItemAsync(KEY, STORE_OPTIONS).catch(() => {});
}

/** For the auto-backup hook: back up as soon as a scrub is done. */
export function onScrubbed(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
