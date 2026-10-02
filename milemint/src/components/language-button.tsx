import { StyleSheet, Text } from 'react-native';

import { GoldTrace } from '@/components/gold-trace';
import { PopPress } from '@/components/pop-press';

/**
 * The language button on the first welcome screen: bigger than a plain pill,
 * with a gold light that runs around its border every few seconds so people
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
      <GoldTrace />
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
