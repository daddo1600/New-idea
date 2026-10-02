import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/i18n';

/**
 * Shown when iOS granted location only "While Using" and the user came here to
 * fix it: the one place left to choose "Always" is Settings. One line, not a
 * walk-through: the button under it opens the right page.
 */
export function AlwaysGuide() {
  const t = useT();
  return (
    <ThemedView type="backgroundElement" style={styles.card} accessibilityRole="alert">
      <ThemedText type="smallBold">{t('In Settings, tap Location, then Always.')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('MileSprout carries on by itself when you come back.')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
});
