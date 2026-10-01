import { useEffect, useId, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { LeafMark } from '@/components/leaf-mark';
import { Spacing } from '@/constants/theme';

const INK = '#064E3B';
const SHINE_WIDTH = 70;

/**
 * The Pro call to action: gold, with the leaf set in a green coin, and a soft
 * shine that sweeps across every few seconds (not with Reduce Motion).
 */
export function GoldButton({
  label,
  onPress,
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const reduceMotion = useReducedMotion();
  const id = `gold${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [width, setWidth] = useState(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || width === 0) return;
    sweep.value = withRepeat(
      withDelay(2200, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) })),
      -1,
    );
  }, [reduceMotion, sweep, width]);

  const shine = useAnimatedStyle(() => ({
    transform: [{ translateX: -SHINE_WIDTH + sweep.value * (width + SHINE_WIDTH * 2) }, { skewX: '-20deg' }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={({ pressed }) => [
        styles.button,
        { opacity: disabled ? 0.6 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FEF3C7" />
              <Stop offset="0.35" stopColor="#FACC15" />
              <Stop offset="1" stopColor="#D97706" />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="100" fill={`url(#${id})`} />
        </Svg>
      </View>
      {!reduceMotion && <Animated.View pointerEvents="none" style={[styles.shine, shine]} />}
      <View style={styles.coin}>
        <LeafMark size={30} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#B45309',
    shadowColor: '#B45309',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shine: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: 0,
    width: SHINE_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  coin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
  },
  label: { color: INK, fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
});
