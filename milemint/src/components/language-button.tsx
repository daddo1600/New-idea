import { StyleSheet, Text } from 'react-native';

import { GoldSparkle } from '@/components/gold-sparkle';
import { PopPress } from '@/components/pop-press';

/**
 * The language button on the first welcome screen: bigger than a plain pill,
 * with gold fairy dust twinkling round its border so people
 * who don't read English notice they can change it. Reduce Motion keeps a
 * still gold border.
 */
export function LanguageButton({
  name,
  accessibilityLabel,
  onPress,
}: {
  name: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <PopPress
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={styles.button}>
      <GoldSparkle />
      <Text style={styles.text} numberOfLines={1}>
        🌐 {name}
      </Text>
    </PopPress>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    maxWidth: 200,
  },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
