import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { ICloudBackup } from '../../modules/icloud-backup';

/** How long to wait for iOS to say whether iCloud Drive is on. */
export const ICLOUD_CHECK_TIMEOUT_MS = 3000;

/**
 * Set-up's last screen: whether trips will be backed up. Backups are on by
 * default, so there's nothing to choose; this only says whether iCloud Drive
 * is on (checked again on coming back from Settings). Null while checking,
 * and always where iCloud backup isn't part of the build.
 */
export function useICloudAvailable(): boolean | null {
  // Null also when iOS takes longer than ICLOUD_CHECK_TIMEOUT_MS to answer.
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ICloudBackup.supported) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      // A native check that hangs leaves it unknown (no backup tile either way), not "checking" for ever.
      let settled = false;
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        settled = true;
      }, ICLOUD_CHECK_TIMEOUT_MS);
      ICloudBackup.isAvailable()
        .then((next) => !settled && setAvailable(next))
        .catch(() => !settled && setAvailable(false))
        .finally(() => {
          settled = true;
          if (timer !== undefined) clearTimeout(timer);
        });
    };
    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      subscription.remove();
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  return ICloudBackup.supported ? available : null;
}
