import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** How much of the border the gold light covers. */
const TAIL = 0.22;
/** The bright glint at the head of the light. */
const GLINT = 0.05;

/**
 * A gold light that runs round and round a pill's border, with a bright glint
 * at its head and a gently shimmering glow, to draw the eye (the language
 * button, the "Tap Allow" coaching). Lay it over the pill: it fills its parent
 * and sizes itself to it. The loop is seamless: one lap ends exactly where the
 * next begins. Reduce Motion keeps a still gold border.
 */
export function GoldTrace({
  stroke = 2,
  lapMs = 2400,
  shimmerMs = 900,
}: {
  stroke?: number;
  /** One lap of the light. */
  lapMs?: number;
  /** One swell of the shimmering glow. */
  shimmerMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lap = useSharedValue(0);
  const shimmer = useSharedValue(0);

  const inset = stroke / 2;
  const w = Math.max(0, size.width - stroke);
  const h = Math.max(0, size.height - stroke);
  const r = h / 2;
  // A rounded rectangle's outline: two straights each way and a full circle of corners.
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  const ready = perimeter > 0;

  // Started once when the pill has a size: a re-layout only changes the
  // perimeter the props read, so it never restarts the loop.
  useEffect(() => {
    if (reduceMotion || !ready) return;
    lap.set(withRepeat(withTiming(1, { duration: lapMs, easing: Easing.linear }), -1, false));
    shimmer.set(withRepeat(withTiming(1, { duration: shimmerMs, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => {
      cancelAnimation(lap);
      cancelAnimation(shimmer);
    };
  }, [lap, shimmer, ready, reduceMotion, lapMs, shimmerMs]);

  const border = useAnimatedProps(() => ({ strokeOpacity: 0.45 + 0.35 * shimmer.value }));
  const glow = useAnimatedProps(() => ({
    strokeDashoffset: -perimeter * lap.value,
    strokeOpacity: 0.25 + 0.35 * shimmer.value,
  }));
  const light = useAnimatedProps(() => ({ strokeDashoffset: -perimeter * lap.value }));
  const glint = useAnimatedProps(() => ({
    strokeDashoffset: -perimeter * (lap.value + TAIL - GLINT),
    strokeOpacity: 0.7 + 0.3 * shimmer.value,
  }));

  const outline = { x: inset, y: inset, width: w, height: h, rx: r, fill: 'none' };
  const tail = [perimeter * TAIL, perimeter * (1 - TAIL)];
  const head = [perimeter * GLINT, perimeter * (1 - GLINT)];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(event) => setSize(event.nativeEvent.layout)}>
      {ready && (
        <Svg width={size.width} height={size.height}>
          {reduceMotion ? (
            <Rect {...outline} stroke="#FACC15" strokeOpacity={0.9} strokeWidth={stroke} />
          ) : (
            <>
              <AnimatedRect {...outline} stroke="#FACC15" strokeWidth={stroke} animatedProps={border} />
              <AnimatedRect
                {...outline}
                stroke="#FACC15"
                strokeWidth={stroke * 3}
                strokeLinecap="round"
                strokeDasharray={tail}
                animatedProps={glow}
              />
              <AnimatedRect
                {...outline}
                stroke="#FDE68A"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={tail}
                animatedProps={light}
              />
              <AnimatedRect
                {...outline}
                stroke="#FFFBEB"
                strokeWidth={stroke * 1.4}
                strokeLinecap="round"
                strokeDasharray={head}
                animatedProps={glint}
              />
            </>
          )}
        </Svg>
      )}
    </View>
  );
}
