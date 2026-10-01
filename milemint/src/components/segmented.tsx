import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = { value: T; label: string };

/** Two-or-more option toggle, e.g. Business / Personal. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabelFor,
}: {
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Spoken label per option when the visible one lacks context, e.g. "Mark Home → Office as business". */
  accessibilityLabelFor?: (option: Option<T>) => string;
}) {
  const theme = useTheme();
  return (
    // Outlined so it reads as a control even on a card of the same colour.
    <View style={[styles.row, { borderColor: theme.backgroundSelected }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={accessibilityLabelFor?.(option)}
            onPress={() => onChange(option.value)}
            // Four or more options share the width: less padding so labels stay on one line.
            style={[styles.option, options.length > 3 && styles.tight, selected && { backgroundColor: theme.accent }]}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{ color: selected ? theme.onAccent : value === null ? theme.text : theme.textSecondary }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: Spacing.half },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
  },
  tight: { paddingHorizontal: Spacing.one, flexBasis: 'auto' },
});
