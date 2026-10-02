import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { SymbolIcon } from '@/components/symbol-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** The add-trip button, floating bottom right where a thumb reaches most easily. */
export function AddTripButton({ bottom }: { bottom: number }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Add a missed trip')}
      onPress={() => router.push('/add-trip')}
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottom + Spacing.three, backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}>
      <SymbolIcon name="plus" glyph="+" size={24} color={theme.onAccent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#053D2E',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
