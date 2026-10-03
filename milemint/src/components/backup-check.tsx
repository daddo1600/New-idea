import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { ICloudBackup } from '../../modules/icloud-backup';

/**
 * Set-up's last screen: whether trips will be backed up. Backups are on by
 * default, so there's nothing to choose; this only says whether iCloud Drive
 * is on (checked again on coming back from Settings). Null while checking,
 * and always where iCloud backup isn't part of the build.
 */
export function useICloudAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ICloudBackup.supported) return;
    const check = () => {
      ICloudBackup.isAvailable()
        .then(setAvailable)
        .catch(() => setAvailable(false));
    };
    check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => subscription.remove();
  }, []);

  return ICloudBackup.supported ? available : null;
}
