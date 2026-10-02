import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

import { PopPress } from '@/components/pop-press';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** One lap of the gold light around the button… */
const LAP_MS = 2200;
/** …then a rest, so it draws the eye without nagging. */
const REST_MS = 2600;
/** How much of the border the light covers. */
const TAIL = 0.22;
const STROKE = 2;

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
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lap = useSharedValue(0);

  const inset = STROKE / 2;
  const w = Math.max(0, size.width - STROKE);
  const h = Math.max(0, size.height - STROKE);
  const r = h / 2;
  // A rounded rectangle's outline: two straights each way and a full circle of corners.
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;

  useEffect(() => {
    if (reduceMotion || perimeter <= 0) return;
    lap.set(
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withDelay(600, withTiming(1, { duration: LAP_MS, easing: Easing.inOut(Easing.quad) })),
          withTiming(1, { duration: REST_MS }),
        ),
        -1,
        false,
      ),
    );
  }, [lap, perimeter, reduceMotion]);

  const light = useAnimatedProps(() => ({
    strokeDashoffset: -perimeter * lap.value,
    strokeOpacity: lap.value > 0 && lap.value < 1 ? 1 : 0,
  }));
  const glow = useAnimatedProps(() => ({
    strokeDashoffset: -perimeter * lap.value,
    strokeOpacity: lap.value > 0 && lap.value < 1 ? 0.35 : 0,
  }));

  return (
    <PopPress
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={styles.button}>
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        onLayout={(event) => setSize(event.nativeEvent.layout)}>
        {perimeter > 0 && (
          <Svg width={size.width} height={size.height}>
            {/* The resting border: faint gold, or solid gold when the light doesn't run. */}
            <Rect
              x={inset}
              y={inset}
              width={w}
              height={h}
              rx={r}
              fill="none"
              stroke="#FACC15"
              strokeOpacity={reduceMotion ? 0.9 : 0.35}
              strokeWidth={STROKE}
            />
            {!reduceMotion && (
              <>
                <AnimatedRect
                  x={inset}
                  y={inset}
                  width={w}
                  height={h}
                  rx={r}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth={STROKE * 3}
                  strokeLinecap="round"
                  strokeDasharray={[perimeter * TAIL, perimeter * (1 - TAIL)]}
                  strokeOpacity={0}
                  animatedProps={glow}
                />
                <AnimatedRect
                  x={inset}
                  y={inset}
                  width={w}
                  height={h}
                  rx={r}
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={[perimeter * TAIL, perimeter * (1 - TAIL)]}
                  strokeOpacity={0}
                  animatedProps={light}
                />
              </>
            )}
          </Svg>
        )}
      </View>
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
