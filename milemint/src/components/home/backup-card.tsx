import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { BackupWarning } from '@/backup/warning';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';

/** iCloud Drive turned off for MileSprout: the steps, since iOS has no link straight to them. */
export const ICLOUD_OFF_STEPS = msg(
  'iCloud Drive is off for MileSprout. In iPhone Settings, tap your name, then iCloud, then iCloud Drive, and turn it on.',
);

const TEXT: Record<BackupWarning, { title: string; body: string }> = {
  off: { title: msg('Your trips aren’t backed up'), body: ICLOUD_OFF_STEPS },
  failing: {
    title: msg('Your trips aren’t backed up'),
    body: msg('Backups to iCloud keep failing. Open Backup in Settings to see why and try again.'),
  },
  never: {
    title: msg('Your trips aren’t backed up'),
    body: msg('MileSprout hasn’t been able to back up to iCloud yet. Open Backup in Settings to back up now.'),
  },
  stale: {
    title: msg('Your last backup is over two weeks old'),
    body: msg('Your newer trips aren’t in iCloud yet. Open Backup in Settings to back up now.'),
  },
};

/** Home's warning when backups aren't working: a lost or replaced iPhone would take the trips with it. */
export function BackupCard({ warning }: { warning: BackupWarning }) {
  const theme = useTheme();
  const t = useT();
  const text = TEXT[warning];
  return (
    <ThemedView
      type="backgroundElement"
      accessibilityRole="alert"
      style={[styles.card, { borderColor: theme.danger }]}>
      <ThemedText type="smallBold">{t(text.title)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t(text.body)}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate('/settings' as Href)}
        style={[styles.button, { backgroundColor: theme.accent }]}>
        <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
          {t('Back up in Settings')}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
  },
});
