import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { displayLocale, formatDistance } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import type { LiveDrive } from '@/tracking/use-live-drive';

import { LiveDot } from './live-dot';

/** A drive being recorded right now, so nobody has to wait until parking to know it's working. */
export function LiveDriveBanner({ drive }: { drive: LiveDrive }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const distance = formatDistance(drive.distanceMeters, region);
  const since = new Date(drive.startedAt).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={[styles.liveDrive, { borderColor: theme.accent, backgroundColor: theme.accent + '14' }]}>
      <LiveDot color={drive.stopped ? '#FACC15' : theme.accent} />
      <View style={styles.flex}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {drive.stopped
            ? t('Stopped · {{distance}}', { distance })
            : t('Recording a drive · {{distance}}', { distance })}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {drive.stopped
            ? t('If you’ve parked, the trip is saved after 5 minutes.')
            : t('Since {{time}}. It’s saved as a trip once you park.', { time: since })}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: Spacing.one },
  liveDrive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: Spacing.three,
  },
});
