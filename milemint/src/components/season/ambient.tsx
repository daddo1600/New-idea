import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import type { SeasonId } from '@/domain/seasons';

/**
 * The seasonal backdrop behind the opening logo: snow, falling leaves or
 * petals, bats, fireworks, a summer sun, or kangaroos and an emu crossing the
 * outback. Off with Reduce Motion.
 */

/** Deterministic scatter so the pieces never jump between renders. */
const seed = (i: number, n: number) => {
  const x = Math.sin(i * 97.13 + n * 13.7) * 10_000;
  return x - Math.floor(x);
};

type FallKind = 'snow' | 'leaves' | 'petals' | 'stars';
const FALL_COLORS: Record<FallKind, readonly string[]> = {
  snow: ['#FFFFFF', '#E0F2FE'],
  leaves: ['#F59E0B', '#EA580C', '#FACC15', '#B45309'],
  petals: ['#F9A8D4', '#FBCFE8', '#FFFFFF'],
  stars: ['#FACC15', '#FFFFFF'],
};

function FallingPiece({ index, kind, width, height }: { index: number; kind: FallKind; width: number; height: number }) {
  const fall = useSharedValue(0);
  const left = seed(index, 1) * width;
  const duration = (kind === 'snow' ? 4200 : 3600) + seed(index, 2) * 2600;
  const sway = 14 + seed(index, 3) * 24;
  const size = kind === 'snow' ? 4 + seed(index, 4) * 6 : 10 + seed(index, 4) * 8;
  const color = FALL_COLORS[kind][index % FALL_COLORS[kind].length];
  const spin = (seed(index, 5) - 0.5) * 720;

  useEffect(() => {
    // Start part-way through so the screen is already full on the first frame.
    fall.value = seed(index, 6);
    fall.value = withTiming(1, { duration: duration * (1 - fall.value), easing: Easing.linear }, () => {
      fall.value = 0;
      fall.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
    });
  }, [fall, duration, index]);

  const style = useAnimatedStyle(() => ({
    opacity: kind === 'stars' ? 0.4 + 0.6 * Math.abs(Math.sin(fall.value * 9)) : 0.9,
    transform: [
      { translateY: -30 + fall.value * (height + 60) },
      { translateX: Math.sin(fall.value * Math.PI * 4 + index) * sway },
      { rotate: `${spin * fall.value}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.piece, { left }, style]}>
      {kind === 'snow' ? (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
      ) : kind === 'stars' ? (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z" fill={color} />
        </Svg>
      ) : kind === 'leaves' ? (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2C6 6 4 12 6 18c2 3 6 4 10 2 4-4 4-11-4-18Z" fill={color} />
          <Path d="M12 4c-1 6-2 11-6 16" stroke="#7C2D12" strokeOpacity={0.5} strokeWidth={1.4} fill="none" />
        </Svg>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Ellipse cx={12} cy={12} rx={7} ry={10} fill={color} />
        </Svg>
      )}
    </Animated.View>
  );
}

function Falling({ kind, count }: { kind: FallKind; count: number }) {
  const { width, height } = useWindowDimensions();
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <FallingPiece key={i} index={i} kind={kind} width={width} height={height} />
      ))}
    </>
  );
}

/** A bat flapping across the sky on a wavy path. */
function Bat({ index, width, height }: { index: number; width: number; height: number }) {
  const fly = useSharedValue(0);
  const flap = useSharedValue(0);
  const top = height * (0.12 + seed(index, 1) * 0.3);
  const fromLeft = index % 2 === 0;
  useEffect(() => {
    fly.value = withDelay(
      seed(index, 2) * 900,
      withRepeat(withTiming(1, { duration: 3200 + seed(index, 3) * 1600, easing: Easing.linear }), -1, false),
    );
    flap.value = withRepeat(withTiming(1, { duration: 160 }), -1, true);
  }, [fly, flap, index]);
  const style = useAnimatedStyle(() => {
    const x = -60 + fly.value * (width + 120);
    return {
      transform: [
        { translateX: fromLeft ? x : width - x },
        { translateY: top + Math.sin(fly.value * Math.PI * 6) * 18 },
        { scaleX: fromLeft ? 1 : -1 },
        { scaleY: 0.55 + 0.45 * flap.value },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.piece, style]}>
      <Svg width={44} height={22} viewBox="0 0 48 24">
        <Path
          d="M24 8C22 4 20 4 19 7 15 3 9 2 2 6c5 2 7 6 7 10 4-3 8-3 11 0 1-3 3-4 4-4s3 1 4 4c3-3 7-3 11 0 0-4 2-8 7-10-7-4-13-3-17 1-1-3-3-3-5 1Z"
          fill="#1E1B2E"
        />
        <Circle cx={22} cy={10} r={1} fill="#FACC15" />
        <Circle cx={26} cy={10} r={1} fill="#FACC15" />
      </Svg>
    </Animated.View>
  );
}

function Bats() {
  const { width, height } = useWindowDimensions();
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Bat key={i} index={i} width={width} height={height} />
      ))}
    </>
  );
}

const BURST_COLORS = ['#FACC15', '#F472B6', '#38BDF8', '#FFFFFF', '#4ADE80'];
const SPARKS = 16;

/** One firework: a ring of sparks flying out and fading, again and again. */
function Burst({ index, width, height }: { index: number; width: number; height: number }) {
  const t = useSharedValue(0);
  const cx = width * (0.15 + seed(index, 1) * 0.7);
  const cy = height * (0.1 + seed(index, 2) * 0.3);
  const radius = 60 + seed(index, 3) * 50;
  const color = BURST_COLORS[index % BURST_COLORS.length];
  useEffect(() => {
    t.value = withDelay(
      index * 420,
      withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [t, index]);
  return (
    <>
      {Array.from({ length: SPARKS }, (_, s) => (
        <Spark key={s} t={t} angle={(s / SPARKS) * Math.PI * 2} cx={cx} cy={cy} radius={radius} color={color} />
      ))}
    </>
  );
}

function Spark({
  t,
  angle,
  cx,
  cy,
  radius,
  color,
}: {
  t: SharedValue<number>;
  angle: number;
  cx: number;
  cy: number;
  radius: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.05 ? 0 : 1 - t.value * t.value,
    transform: [
      { translateX: cx + Math.cos(angle) * radius * t.value },
      // A little gravity as the sparks fade.
      { translateY: cy + Math.sin(angle) * radius * t.value + 30 * t.value * t.value },
    ],
  }));
  return <Animated.View pointerEvents="none" style={[styles.spark, { backgroundColor: color }, style]} />;
}

function Fireworks() {
  const { width, height } = useWindowDimensions();
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <Burst key={i} index={i} width={width} height={height} />
      ))}
    </>
  );
}

/** A big friendly sun in the top corner, its rays slowly turning. */
function Sun() {
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.value = withRepeat(withTiming(1, { duration: 12_000, easing: Easing.linear }), -1, false);
  }, [turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }));
  return (
    <View pointerEvents="none" style={styles.sun}>
      <Animated.View style={style}>
        <Svg width={150} height={150} viewBox="0 0 100 100">
          <G stroke="#FDE047" strokeWidth={4} strokeLinecap="round" opacity={0.8}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <Line
                  key={i}
                  x1={50 + Math.cos(a) * 30}
                  y1={50 + Math.sin(a) * 30}
                  x2={50 + Math.cos(a) * 44}
                  y2={50 + Math.sin(a) * 44}
                />
              );
            })}
          </G>
          <Circle cx={50} cy={50} r={22} fill="#FACC15" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const KANGAROO =
  'M6 44c6-1 11-4 15-9 3-6 6-12 14-14 4-1 6-4 7-8l2-5 2 5c3 0 6 2 7 5l-4 1c-2 3-4 7-6 11-2 4-3 8-1 14l6 3H38l-4-6c-4 0-8 2-10 4l-4 2h-8c-2-2-4-2-6-3Z';

/** Kangaroos hop and an emu runs along the bottom of the screen. */
function Outback() {
  const { width, height } = useWindowDimensions();
  return (
    <>
      <Sun />
      <View pointerEvents="none" style={[styles.ground, { top: height - 130 }]} />
      <Runner kind="kangaroo" index={0} width={width} bottom={height - 150} duration={3400} />
      <Runner kind="kangaroo" index={1} width={width} bottom={height - 120} duration={4000} small />
      <Runner kind="emu" index={2} width={width} bottom={height - 150} duration={2400} />
    </>
  );
}

function Runner({
  kind,
  index,
  width,
  bottom,
  duration,
  small = false,
}: {
  kind: 'kangaroo' | 'emu';
  index: number;
  width: number;
  bottom: number;
  duration: number;
  small?: boolean;
}) {
  const run = useSharedValue(0);
  useEffect(() => {
    run.value = withDelay(index * 500, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false));
  }, [run, index, duration]);
  const hops = kind === 'kangaroo' ? 5 : 14;
  const style = useAnimatedStyle(() => {
    const phase = (run.value * hops) % 1;
    const lift = kind === 'kangaroo' ? Math.sin(phase * Math.PI) * 34 : Math.abs(Math.sin(phase * Math.PI)) * 4;
    return {
      transform: [
        { translateX: -80 + run.value * (width + 160) },
        { translateY: bottom - lift },
        { rotate: kind === 'kangaroo' ? `${-10 * Math.sin(phase * Math.PI * 2)}deg` : '0deg' },
      ],
    };
  });
  const scale = small ? 1.2 : 1.6;
  return (
    <Animated.View pointerEvents="none" style={[styles.piece, style]}>
      {kind === 'kangaroo' ? (
        <Svg width={64 * scale} height={48 * scale} viewBox="0 0 64 48">
          <Path d={KANGAROO} fill="#7C2D12" />
          <Path d="M22 34C14 38 8 42 1 46" stroke="#7C2D12" strokeWidth={4} strokeLinecap="round" fill="none" />
          <Circle cx={48} cy={11} r={1.3} fill="#FFFFFF" />
        </Svg>
      ) : (
        <Svg width={48 * scale} height={64 * scale} viewBox="0 0 48 64">
          <Ellipse cx={20} cy={30} rx={16} ry={11} fill="#3F2A1D" />
          <Path d="M30 26C34 18 35 12 36 6" stroke="#57534E" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={37} cy={6} r={4} fill="#57534E" />
          <Path d="M40 6l6 1-6 2Z" fill="#A8A29E" />
          <Line x1={17} y1={40} x2={13} y2={62} stroke="#57534E" strokeWidth={3} strokeLinecap="round" />
          <Line x1={24} y1={40} x2={29} y2={62} stroke="#57534E" strokeWidth={3} strokeLinecap="round" />
        </Svg>
      )}
    </Animated.View>
  );
}

/** The backdrop for `season`, behind the logo. */
export function SeasonAmbient({ season, southern }: { season: SeasonId; southern: boolean }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {season === 'festive' && <Falling kind={southern ? 'stars' : 'snow'} count={southern ? 18 : 40} />}
      {season === 'winter' && <Falling kind="snow" count={40} />}
      {season === 'autumn' && <Falling kind="leaves" count={18} />}
      {season === 'spring' && <Falling kind="petals" count={22} />}
      {season === 'halloween' && <Bats />}
      {season === 'new-year' && <Fireworks />}
      {season === 'summer' && <Sun />}
      {season === 'aussie-summer' && <Outback />}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0 },
  spark: { position: 'absolute', top: 0, left: 0, width: 7, height: 7, borderRadius: 4 },
  sun: { position: 'absolute', top: 30, right: -30 },
  ground: {
    position: 'absolute',
    left: -40,
    right: -40,
    height: 260,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 400,
    backgroundColor: '#C2410C',
    opacity: 0.6,
  },
});
