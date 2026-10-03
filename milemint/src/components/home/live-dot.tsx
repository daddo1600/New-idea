import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Gently pulses while automatic logging is on; a still dot with Reduce Motion. */
export function LiveDot({ color }: { color: string }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      // The ring sits at its end: faded out, so only the dot shows.
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1);
  }, [pulse, reduceMotion]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - pulse.value), transform: [{ scale: 1 + 1.4 * pulse.value }] }));
  return (
    <View style={styles.liveDot}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dot, { backgroundColor: color }, ring]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  liveDot: { width: 8, height: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
