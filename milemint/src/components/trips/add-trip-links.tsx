import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { SymbolIcon } from '@/components/symbol-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/**
 * Adding a drive by hand is the backup for one tracking missed, so it's a
 * quiet way in rather than a floating button: a + in the Drives header, a row
 * under the list, and a link where there are no drives yet.
 */

const openAddTrip = () => router.push('/add-trip');

/** The Drives tab's header button. */
export function AddTripHeaderButton() {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Add missed trip')}
      hitSlop={10}
      onPress={openAddTrip}
      style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.5 : 1 }]}>
      <SymbolIcon name="plus" glyph="+" size={22} color={theme.accent} />
    </Pressable>
  );
}

/** Under the list of drives. */
export function AddTripRow() {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={openAddTrip}
      style={({ pressed }) => [styles.row, { borderColor: theme.backgroundSelected, opacity: pressed ? 0.6 : 1 }]}>
      <SymbolIcon name="plus.circle" glyph="+" size={18} color={theme.accent} />
      <ThemedText type="smallBold" style={{ color: theme.accent }}>
        {t('Add a drive you missed')}
      </ThemedText>
    </Pressable>
  );
}

/** Where there are no drives yet: a secondary link, tracking comes first. */
export function AddTripLink() {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={openAddTrip} style={styles.link}>
      <ThemedText type="small" style={{ color: theme.accent }}>
        {t('Add a missed drive')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: { paddingHorizontal: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: Spacing.three,
  },
  link: { marginTop: Spacing.two },
});
