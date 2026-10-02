import { StyleSheet, Text, View } from 'react-native';

import { LeafMark } from '@/components/leaf-mark';
import { useTheme } from '@/hooks/use-theme';

/** Home's header: the leaf and the name, with "Sprout" in the brand green. */
export function BrandTitle() {
  const theme = useTheme();
  return (
    <View style={styles.brand} accessibilityRole="header" accessibilityLabel="MileSprout">
      <LeafMark size={26} />
      <Text style={[styles.brandText, { color: theme.text }]}>
        Mile<Text style={{ color: theme.accent }}>Sprout</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
});
