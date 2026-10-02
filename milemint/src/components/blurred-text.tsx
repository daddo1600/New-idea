import { Platform, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

/** Small offsets the faint copies are drawn at, which smear the glyphs into a soft smudge. */
const SMEAR = [
  [-3, 0],
  [3, 0],
  [0, -3],
  [0, 3],
  [-2, -2],
  [2, 2],
  [-2, 2],
  [2, -2],
] as const;

/**
 * A figure shown blurred behind a paywall: the shape of a number, not one to
 * read. Faint copies drawn a few points apart (iOS has no blur for text);
 * where the platform can blur (Android, the web) it's blurred as well.
 * Hidden from screen readers.
 */
export function BlurredText({
  children,
  style,
  type = 'small',
}: {
  children: string;
  style?: StyleProp<TextStyle>;
  type?: 'small' | 'smallBold' | 'default';
}) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.wrap}>
      {/* Takes the space; never seen. */}
      <ThemedText type={type} style={[style, styles.hidden]}>
        {children}
      </ThemedText>
      {SMEAR.map(([x, y]) => (
        <ThemedText key={`${x},${y}`} type={type} style={[style, styles.copy, { left: x, top: y }, BLUR]}>
          {children}
        </ThemedText>
      ))}
    </View>
  );
}

const BLUR = Platform.OS === 'ios' ? null : ({ filter: 'blur(3px)' } as TextStyle);

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  hidden: { opacity: 0 },
  copy: { position: 'absolute', opacity: 0.16 },
});
