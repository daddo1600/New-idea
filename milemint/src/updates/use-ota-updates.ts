import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState } from 'react-native';

/** Don't look for updates more often than this. */
const CHECK_EVERY_MS = 30 * 60_000;

/**
 * Over-the-air updates (EAS Update). iOS rarely restarts an app, so waiting
 * for a cold start could leave someone on an old version for weeks. Instead:
 * - when the app comes to the front, look for a new update and download it
 *   quietly in the background;
 * - the next time the app comes to the front with one downloaded, switch to
 *   it straight away, before the user starts doing anything.
 * Never mid-use. Updates are only sent to builds with the same native code
 * (runtimeVersion "fingerprint"), so a JS update can't reach an app that is
 * missing a native module it needs.
 */
export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    let downloaded = false;
    let checking = false;
    let lastCheck = 0;

    const onActive = async () => {
      if (downloaded) {
        await Updates.reloadAsync().catch(() => {});
        return;
      }
      if (checking || Date.now() - lastCheck < CHECK_EVERY_MS) return;
      checking = true;
      lastCheck = Date.now();
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (isAvailable) downloaded = (await Updates.fetchUpdateAsync()).isNew;
      } catch {
        // Offline or the update server is unreachable: try again next time.
      } finally {
        checking = false;
      }
    };

    onActive();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') onActive();
    });
    return () => subscription.remove();
  }, []);
}
