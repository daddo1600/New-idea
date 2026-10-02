import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/** On home while this tax year has work drives without a purpose; opens them one after another. */
export function PurposeNudge({ count, onFill }: { count: number; onFill: () => void }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('Shows only the drives that need a purpose')}
      onPress={onFill}>
      <ThemedView type="backgroundElement" style={[styles.purposeNudge, { borderColor: theme.warning }]}>
        <ThemedText type="smallBold">{t('{{count}} work drives need a purpose', { count })}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('{{authority}} expects a purpose for every work drive. One tap each.', {
            authority: region.authority,
          })}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Add purposes ›')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  purposeNudge: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
});
