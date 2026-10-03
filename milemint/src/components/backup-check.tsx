import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

import { ICLOUD_OFF_STEPS } from '@/components/home/backup-card';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/i18n';

import { ICloudBackup } from '../../modules/icloud-backup';

/**
 * Set-up's last screen: whether trips will be backed up. Backups are on by
 * default, so there's nothing to choose; this only says so, or, with iCloud
 * Drive off, how to turn it on (checked again on coming back from Settings).
 * Nothing at all where iCloud backup isn't part of the build.
 */
export function BackupCheck({ style }: { style?: object }) {
  const t = useT();
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

  if (!ICloudBackup.supported || available === null) return null;
  return (
    <View style={[style, styles.row]} accessibilityLiveRegion="polite">
      <Text style={styles.icon}>{available ? '☁️' : '⚠️'}</Text>
      <Text style={[styles.text, !available && styles.warning]}>
        {available ? t('Backups are on: your trips are saved, encrypted, to your own iCloud.') : t(ICLOUD_OFF_STEPS)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  icon: { fontSize: 18, lineHeight: 22 },
  text: { flex: 1, color: '#D1FAE5', fontSize: 15, lineHeight: 21 },
  warning: { color: '#FFFFFF', fontWeight: '600' },
});
