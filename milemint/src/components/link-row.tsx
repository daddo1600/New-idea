import type { SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { SymbolIcon } from '@/components/symbol-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A row that opens another screen: icon tile, title, a line of detail and a chevron. */
export function LinkRow({
  icon,
  glyph,
  title,
  detail,
  highlight = false,
  onPress,
}: {
  icon: SFSymbol;
  /** Shown instead of the symbol where SF Symbols aren't available (the web preview). */
  glyph: string;
  title: string;
  detail: string;
  /** Pro is set apart in the logo's yellow while it's still to buy. */
  highlight?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={detail}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.tile, { backgroundColor: highlight ? '#FACC15' : theme.accent + '1F' }]}>
        <SymbolIcon name={icon} glyph={glyph} size={17} color={highlight ? '#064E3B' : theme.accent} />
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {detail}
        </ThemedText>
      </View>
      <SymbolIcon name="chevron.right" glyph="›" size={12} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
  tile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
});
