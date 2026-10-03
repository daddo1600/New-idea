import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { LeafMark } from '@/components/leaf-mark';
import { useT } from '@/i18n/i18n';

/**
 * Set-up's Motion & Fitness hero: why the permission matters, as a picture.
 * Top lane, a walk along a footpath: it ends in "Not a drive" and nothing
 * grows. Bottom lane, the sprout's road: the gold car drives it, laying the
 * lane dashes behind it, and a sprout springs up at the end, "Drive ✓".
 *
 * One clock (ms into a ~6.4s loop) drives every part, so they never drift.
 * It plays three times and holds the final frame; Reduce Motion shows only
 * that frame. VoiceOver hears one sentence.
 */

const WALK_MS = 2400;
/** The walk's chip pops in as the walker stops… */
const WALK_CHIP_MS = 350;
/** …and the drive starts this long after it lands. */
const DRIVE_FROM = WALK_MS + WALK_CHIP_MS + 300;
const DRIVE_MS = 1400;
const LANDED = DRIVE_FROM + DRIVE_MS;
const LEAF_MS = 420;
const CHIP_MS = 350;
/** Everything holds, then fades before the loop starts again. */
const HOLD_UNTIL = LANDED + 1600;
const FADE_MS = 300;
const LOOP_MS = HOLD_UNTIL + FADE_MS;
/** The frame it rests on: everything shown. */
const FINAL = HOLD_UNTIL;
const PLAYS = 3;

const PAD = 16;
const LANE = 105;
const WALKER = 34;
const LEAF = 40;
const DASH_COUNT = 12;

function clamp01(x: number): number {
  'worklet';
  return Math.min(1, Math.max(0, x));
}

/** 0–1 through the part that starts at `from` and lasts `duration`. */
function phase(time: number, from: number, duration: number): number {
  'worklet';
  return clamp01((time - from) / duration);
}

/** A spring-like pop: past full size a little, then settles. */
function pop(x: number): number {
  'worklet';
  const c = 1.9;
  const b = x - 1;
  return 1 + (c + 1) * b * b * b + c * b * b;
}

function inOutCubic(x: number): number {
  'worklet';
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Fades the whole scene in at the start of a loop and out at its end. */
function sceneOpacity(time: number): number {
  'worklet';
  return Math.min(phase(time, 0, 200), 1 - phase(time, HOLD_UNTIL, FADE_MS));
}

export function WalkOrDrive() {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const clock = useSharedValue(FINAL);

  useEffect(() => {
    if (reduceMotion || width === 0) {
      clock.set(FINAL);
      return;
    }
    clock.set(0);
    clock.set(
      withSequence(
        withRepeat(withTiming(LOOP_MS, { duration: LOOP_MS, easing: Easing.linear }), PLAYS - 1, false),
        withTiming(0, { duration: 0 }),
        withTiming(FINAL, { duration: FINAL, easing: Easing.linear }),
      ),
    );
    return () => cancelAnimation(clock);
  }, [clock, reduceMotion, width]);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={t('A walk is marked Not a drive. A drive is logged.')}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          <Walk clock={clock} width={width} notADrive={t('Not a drive')} />
          <Drive clock={clock} width={width} drive={t('Drive ✓')} />
        </>
      )}
    </View>
  );
}

/** The footpath: a walker strolls 60% of the way, bobbing, and is marked "Not a drive". */
function Walk({ clock, width, notADrive }: { clock: SharedValue<number>; width: number; notADrive: string }) {
  const path = { y: LANE - 14, from: PAD, to: width - PAD };
  const travel = (width - 2 * PAD - WALKER) * 0.6;
  const walker = useAnimatedStyle(() => {
    const time = clock.value;
    const walked = phase(time, 0, WALK_MS);
    // A small bob every 300ms while walking.
    const bob = walked < 1 ? Math.abs(Math.sin((time / 300) * Math.PI)) * 2 : 0;
    return {
      opacity: sceneOpacity(time) * (1 - 0.4 * phase(time, WALK_MS, 200)),
      transform: [{ translateX: travel * walked }, { translateY: -bob }, { scaleX: -1 }],
    };
  });
  const chip = useAnimatedStyle(() => {
    const time = clock.value;
    const shown = phase(time, WALK_MS, WALK_CHIP_MS);
    return {
      opacity: Math.min(clamp01(shown * 3), sceneOpacity(time)),
      transform: [{ scale: Math.max(0.001, pop(shown)) }],
    };
  });
  return (
    <View style={[styles.lane, { top: 0 }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Line
          x1={path.from}
          y1={path.y}
          x2={path.to}
          y2={path.y}
          stroke="rgba(209,250,229,0.5)"
          strokeWidth={3}
          strokeDasharray="1 8"
          strokeLinecap="round"
        />
      </Svg>
      {/* The emoji faces left; flipped, it walks the way it's going. */}
      <Animated.Text style={[styles.walker, { left: PAD, top: path.y - WALKER - 4 }, walker]}>🚶</Animated.Text>
      {/* Above the end of the path, clear of the walker, with room for longer languages. */}
      <Animated.View style={[styles.chip, styles.creamChip, { right: PAD, top: 12, maxWidth: width - 2 * PAD }, chip]}>
        <Text style={styles.chipText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          ✕ {notADrive}
        </Text>
      </Animated.View>
    </View>
  );
}

/** The road: the gold car drives it, dashes appear behind it, and a sprout springs up at the end. */
function Drive({ clock, width, drive }: { clock: SharedValue<number>; width: number; drive: string }) {
  const road = { y: LANE - 34, from: PAD, to: width - PAD - LEAF - 4 };
  const length = road.to - road.from;
  const car = useAnimatedStyle(() => {
    const time = clock.value;
    const along = inOutCubic(phase(time, DRIVE_FROM, DRIVE_MS));
    return {
      opacity: sceneOpacity(time),
      transform: [{ translateX: (length - CAR) * along }],
    };
  });
  const leaf = useAnimatedStyle(() => {
    const time = clock.value;
    const grown = phase(time, LANDED, LEAF_MS);
    return {
      opacity: Math.min(clamp01(grown * 4), sceneOpacity(time)),
      transform: [{ translateY: 10 * (1 - grown) }, { scale: Math.max(0.001, pop(grown)) }],
    };
  });
  const chip = useAnimatedStyle(() => {
    const time = clock.value;
    const shown = phase(time, LANDED + 120, CHIP_MS);
    return {
      opacity: Math.min(clamp01(shown * 3), sceneOpacity(time)),
      transform: [{ scale: Math.max(0.001, pop(shown)) }],
    };
  });
  const roadStyle = useAnimatedStyle(() => ({ opacity: Math.max(0.35, sceneOpacity(clock.value)) }));
  return (
    <View style={[styles.lane, { top: LANE }]}>
      <Animated.View
        style={[styles.road, { left: road.from, top: road.y - ROAD / 2, width: length }, roadStyle]}>
        {Array.from({ length: DASH_COUNT }, (_, i) => (
          <Dash key={i} index={i} clock={clock} spacing={length / DASH_COUNT} length={length} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.car, { left: road.from, top: road.y - CAR / 2 }, car]} />
      <Animated.View style={[styles.leaf, { left: road.to + 2, top: road.y - LEAF + 8 }, leaf]}>
        <LeafMark size={LEAF} />
      </Animated.View>
      <Animated.View style={[styles.chip, styles.goldChip, { right: PAD + LEAF + 10, top: road.y - 52 }, chip]}>
        <Text style={styles.chipText} numberOfLines={1}>
          {drive}
        </Text>
      </Animated.View>
    </View>
  );
}

const ROAD = 18;
const CAR = 14;

/** One lane dash, laid once the car has passed it. */
function Dash({ index, clock, spacing, length }: { index: number; clock: SharedValue<number>; spacing: number; length: number }) {
  const x = spacing * index + spacing / 2 - 5;
  const style = useAnimatedStyle(() => {
    const time = clock.value;
    const carX = (length - CAR) * inOutCubic(phase(time, DRIVE_FROM, DRIVE_MS));
    return { opacity: carX > x + 12 ? sceneOpacity(time) : 0 };
  });
  return <Animated.View style={[styles.dash, { left: x }, style]} />;
}

const styles = StyleSheet.create({
  card: {
    height: 2 * LANE,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    overflow: 'hidden',
  },
  lane: { position: 'absolute', left: 0, right: 0, height: LANE },
  walker: { position: 'absolute', fontSize: WALKER, lineHeight: WALKER + 6, width: WALKER + 6, textAlign: 'center' },
  chip: {
    position: 'absolute',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // Dark text on cream and on gold (about 10:1 and 7:1): never white on the card.
  creamChip: { backgroundColor: '#FBF7EE' },
  goldChip: { backgroundColor: '#FACC15' },
  chipText: { color: '#064E3B', fontSize: 14, fontWeight: '800' },
  road: { position: 'absolute', height: ROAD, borderRadius: ROAD / 2, backgroundColor: '#064E3B' },
  dash: { position: 'absolute', top: ROAD / 2 - 1, width: 10, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' },
  car: {
    position: 'absolute',
    width: CAR,
    height: CAR,
    borderRadius: CAR / 2,
    backgroundColor: '#FACC15',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  leaf: { position: 'absolute', width: LEAF, height: LEAF },
});
