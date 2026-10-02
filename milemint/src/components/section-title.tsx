import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

/** A Settings section's heading, with its current value on the right ("Work hours  Mon–Fri 9:00–17:00"). */
export function SectionTitle({ title, value, valueColor }: { title: string; value?: string | null; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="smallBold" accessibilityRole="header" style={styles.title}>
        {title}
      </ThemedText>
      {!!value && (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          numberOfLines={1}
          style={[styles.value, valueColor ? { color: valueColor } : null]}>
          {value}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: Spacing.three },
  title: { flexShrink: 0, maxWidth: '60%' },
  value: { flexShrink: 1, textAlign: 'right' },
});
