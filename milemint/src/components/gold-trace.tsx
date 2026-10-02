import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** How much of the border the light covers. */
const TAIL = 0.22;

/**
 * A gold light that runs around a pill's border, then rests, to draw the eye
 * (the language button, the "Tap Allow" coaching). Lay it over the pill: it
 * fills its parent and sizes itself to it. Reduce Motion keeps a still gold
 * border.
 */
export function GoldTrace({
  stroke = 2,
  lapMs = 2200,
  restMs = 2600,
  restingOpacity = 0.35,
}: {
  stroke?: number;
  /** One lap of the light… */
  lapMs?: number;
  /** …then a rest. */
  restMs?: number;
  /** The border between laps. */
  restingOpacity?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lap = useSharedValue(0);

  const inset = stroke / 2;
  const w = Math.max(0, size.width - stroke);
  const h = Math.max(0, size.height - stroke);
  const r = h / 2;
  // A rounded rectangle's outline: two straights each way and a full circle of corners.
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;

  useEffect(() => {
    if (reduceMotion || perimeter <= 0) return;
    lap.set(
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withDelay(600, withTiming(1, { duration: lapMs, easing: Easing.inOut(Easing.quad) })),
          withTiming(1, { duration: restMs }),
        ),
        -1,
        false,
      ),
    );
  }, [lap, perimeter, reduceMotion, lapMs, restMs]);

  const light = useAnimatedProps(() => ({
    strokeDashoffset: -perimeter * lap.value,
    strokeOpacity: lap.value > 0 && lap.value < 1 ? 1 : 0,
  }));
  const glow = useAnimatedProps(() => ({
    strokeDashoffset: -perimeter * lap.value,
    strokeOpacity: lap.value > 0 && lap.value < 1 ? 0.35 : 0,
  }));

  const outline = { x: inset, y: inset, width: w, height: h, rx: r, fill: 'none' };
  const dashes = [perimeter * TAIL, perimeter * (1 - TAIL)];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(event) => setSize(event.nativeEvent.layout)}>
      {perimeter > 0 && (
        <Svg width={size.width} height={size.height}>
          <Rect {...outline} stroke="#FACC15" strokeOpacity={reduceMotion ? 0.9 : restingOpacity} strokeWidth={stroke} />
          {!reduceMotion && (
            <>
              <AnimatedRect
                {...outline}
                stroke="#FACC15"
                strokeWidth={stroke * 3}
                strokeLinecap="round"
                strokeDasharray={dashes}
                strokeOpacity={0}
                animatedProps={glow}
              />
              <AnimatedRect
                {...outline}
                stroke="#FDE68A"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={dashes}
                strokeOpacity={0}
                animatedProps={light}
              />
            </>
          )}
        </Svg>
      )}
    </View>
  );
}
