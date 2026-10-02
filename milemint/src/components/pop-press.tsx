import * as Haptics from 'expo-haptics';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** How far the pop grows, and how fast, before it springs back. */
const POP_SCALE = 1.12;
const POP_MS = 110;

/** Light for choosing something, soft for taking it back (a quieter tap). */
export type PopHaptic = 'light' | 'soft' | 'none';

/** One tap of the phone, as the swipe-to-start shift does it. Never on web. */
export function popHaptic(kind: PopHaptic): void {
  if (kind === 'none' || Platform.OS === 'web') return;
  Haptics.impactAsync(kind === 'soft' ? Haptics.ImpactFeedbackStyle.Soft : Haptics.ImpactFeedbackStyle.Light).catch(
    () => {},
  );
}

/**
 * The pop: grows quickly, then drops back with a little bounce. Reduce Motion
 * keeps it still (the haptic is the feedback then).
 */
export function usePop(scaleTo = POP_SCALE) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pop = () => {
    if (reduceMotion) return;
    scale.set(
      withSequence(
        withTiming(scaleTo, { duration: POP_MS, easing: Easing.out(Easing.quad) }),
        // Mass set, as Reanimated 4's default (4) would make it wobble for a second or more.
        withSpring(1, { mass: 1, damping: 14, stiffness: 300 }),
      ),
    );
  };
  return { style, pop };
}

/**
 * A button that answers a tap: a haptic and a quick pop. Made for choices
 * that change what's on screen (a purpose picked, a tile ticked), so the
 * user feels the tap land before the row moves on.
 *
 * `onPress` runs at once, unless `commitDelay` asks it to wait so the pop is
 * seen first; `onPop` runs at once either way (to show the choice straight
 * away). While a delayed press is waiting, more taps are ignored. A press
 * still lands if the button goes away while it waits: the tap was made.
 */
export function PopPress({
  onPress,
  onPop,
  commitDelay = 0,
  haptic = 'light',
  scale = POP_SCALE,
  style,
  children,
  ...props
}: Omit<PressableProps, 'onPress' | 'style' | 'children'> & {
  onPress?: () => void;
  /** Runs with the pop, before a delayed `onPress`. */
  onPop?: () => void;
  /** Milliseconds to wait before `onPress`, so the pop is seen before the screen changes. */
  commitDelay?: number;
  haptic?: PopHaptic;
  /** How far it grows: less for a wide row, which would otherwise spill out of its list. */
  scale?: number;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children?: ReactNode;
}) {
  const { style: popStyle, pop } = usePop(scale);
  const [pressed, setPressed] = useState(false);
  const waiting = useRef(false);
  const latest = useRef(onPress);
  useEffect(() => {
    latest.current = onPress;
  }, [onPress]);

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        setPressed(true);
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        props.onPressOut?.(event);
      }}
      onPress={() => {
        if (waiting.current) return;
        popHaptic(haptic);
        pop();
        onPop?.();
        if (commitDelay <= 0) {
          onPress?.();
          return;
        }
        waiting.current = true;
        setTimeout(() => {
          waiting.current = false;
          latest.current?.();
        }, commitDelay);
      }}
      style={[typeof style === 'function' ? style({ pressed }) : style, popStyle]}>
      {children}
    </AnimatedPressable>
  );
}
