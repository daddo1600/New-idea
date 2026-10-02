import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

/** How many glints twinkle around the pill at once. */
const COUNT = 14;
/** One twinkle: fade and grow in, then out. */
const TWINKLE_MS = 1100;
/** A four-pointed star, drawn in a 24-unit box. */
const STAR = 'M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z';

/**
 * Fairy dust round a pill: little gold stars that twinkle in and out along its
 * edge, each on its own beat, so it always shimmers and never stops. Lay it
 * over the pill (it fills its parent; the stars sit just outside the edge).
 * Reduce Motion keeps a still gold border instead.
 */
export function GoldSparkle({ size = 1 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const ready = box.width > 0 && box.height > 0;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(event) => setBox(event.nativeEvent.layout)}>
      <View style={[styles.border, reduceMotion ? styles.borderStill : styles.borderSoft]} />
      {ready &&
        !reduceMotion &&
        Array.from({ length: COUNT }, (_, i) => <Glint key={i} index={i} box={box} size={size} />)}
    </View>
  );
}

/** Where glint `i` sits: spread evenly-ish round the edge (golden-ratio steps), a little outside it. */
function place(i: number, { width, height }: { width: number; height: number }) {
  const t = (i * 0.618034) % 1;
  const r = height / 2;
  const straight = Math.max(0, width - 2 * r);
  const perimeter = 2 * straight + 2 * Math.PI * r;
  const outward = 3 + ((i * 7) % 5);
  let d = t * perimeter;
  // Top edge, left to right.
  if (d < straight) return { x: r + d, y: -outward };
  d -= straight;
  // Right end, round the half circle.
  if (d < Math.PI * r) {
    const a = -Math.PI / 2 + d / r;
    return { x: r + straight + Math.cos(a) * (r + outward), y: r + Math.sin(a) * (r + outward) };
  }
  d -= Math.PI * r;
  // Bottom edge, right to left.
  if (d < straight) return { x: r + straight - d, y: height + outward };
  d -= straight;
  // Left end.
  const a = Math.PI / 2 + d / r;
  return { x: r + Math.cos(a) * (r + outward), y: r + Math.sin(a) * (r + outward) };
}

function Glint({ index, box, size }: { index: number; box: { width: number; height: number }; size: number }) {
  const glow = useSharedValue(0);
  const { x, y } = place(index, box);
  const star = (7 + ((index * 5) % 7)) * size;
  const white = index % 3 === 0;

  useEffect(() => {
    // Each glint has its own pause, so they never twinkle in step.
    const rest = 500 + ((index * 389) % 1700);
    glow.set(
      withDelay(
        (index * 271) % 2000,
        withRepeat(
          withSequence(
            withTiming(1, { duration: TWINKLE_MS / 2, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: TWINKLE_MS / 2, easing: Easing.in(Easing.quad) }),
            withTiming(0, { duration: rest }),
          ),
          -1,
          false,
        ),
      ),
    );
    return () => cancelAnimation(glow);
  }, [glow, index]);

  const style = useTwinkle(glow, index);
  return (
    <Animated.View style={[styles.glint, { left: x - star / 2, top: y - star / 2, width: star, height: star }, style]}>
      <Svg width={star} height={star} viewBox="0 0 24 24">
        <Path d={STAR} fill={white ? '#FFFBEB' : '#FACC15'} />
      </Svg>
    </Animated.View>
  );
}

/** Fades and grows with the twinkle, turning a little and drifting up as it goes. */
function useTwinkle(glow: SharedValue<number>, index: number) {
  const spin = index % 2 === 0 ? 45 : -45;
  return useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [
      { translateY: -3 * glow.value },
      { scale: 0.3 + 0.7 * glow.value },
      { rotate: `${spin * glow.value}deg` },
    ],
  }));
}

const styles = StyleSheet.create({
  border: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 999, borderWidth: 1.5 },
  borderSoft: { borderColor: 'rgba(250,204,21,0.55)' },
  borderStill: { borderColor: 'rgba(250,204,21,0.9)' },
  glint: { position: 'absolute' },
});
