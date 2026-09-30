import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Places along the launch animation's road: a petrol station, a shop, a café,
 * an office and a tree pop up beside it as the car approaches, then slip away
 * behind it. Drawn in the logo's colours rather than emoji so they match.
 */

const INK = '#064E3B';
const LEAF = '#16A34A';
const SUN = '#FACC15';

const GLYPHS: Record<string, ReactNode> = {
  fuel: (
    <>
      <Rect x={4} y={4} width={10} height={16} rx={1.5} fill={INK} />
      <Rect x={6} y={6.5} width={6} height={4} rx={0.8} fill={SUN} />
      <Path
        d="M14 8h1.5a2 2 0 0 1 2 2v5.5a1.5 1.5 0 0 0 3 0V9l-2-2"
        stroke={INK}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  shop: (
    <>
      <Rect x={4.5} y={10} width={15} height={10} fill={INK} />
      <Path d="M3 10 5 4.5h14L21 10Z" fill={SUN} />
      <Rect x={10} y={13.5} width={4} height={6.5} fill="#FFFFFF" />
    </>
  ),
  cafe: (
    <>
      <Path d="M4.5 9.5h11V14a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" fill={INK} />
      <Path d="M15.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.5" stroke={INK} strokeWidth={1.8} fill="none" />
      <Path
        d="M8 3.5c-1 1.2 1 2 0 3.5M12 3.5c-1 1.2 1 2 0 3.5"
        stroke={LEAF}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  office: (
    <>
      <Rect x={6} y={3} width={12} height={18} rx={1} fill={INK} />
      {[6, 10, 14].map((y) =>
        [8.5, 13].map((x) => <Rect key={`${x},${y}`} x={x} y={y} width={2.5} height={2.5} fill={SUN} />),
      )}
    </>
  ),
  tree: (
    <>
      <Rect x={10.8} y={13} width={2.4} height={8} rx={1} fill={INK} />
      <Circle cx={12} cy={10} r={6.5} fill={LEAF} />
    </>
  ),
};

/** Where each place sits: how far along the road (0–1) and which side of it. */
const PLACES = [
  { glyph: 'fuel', at: 0.14, side: -1 },
  { glyph: 'shop', at: 0.29, side: 1 },
  { glyph: 'cafe', at: 0.44, side: -1 },
  { glyph: 'office', at: 0.59, side: 1 },
  { glyph: 'tree', at: 0.72, side: -1 },
] as const;

const BADGE = 30;
/** The road runs up the leaf at 40°; this is "forwards" on screen. */
const ANGLE = (40 * Math.PI) / 180;
const FORWARD = { x: Math.sin(ANGLE), y: -Math.cos(ANGLE) };
/** Beside the road, just outside the leaf (leaf units). */
const OFFSET = 390;
/** How far a place drifts back as the car passes (points). */
const DRIFT = 36;

/** Leaf coordinates (see LeafMark) to points inside a `size`-wide logo. */
function toScreen(x: number, y: number, size: number) {
  const scale = size / 1024;
  return {
    left: (530 + x * Math.cos(ANGLE) - y * Math.sin(ANGLE)) * scale - BADGE / 2,
    top: (490 + x * Math.sin(ANGLE) + y * Math.cos(ANGLE)) * scale - BADGE / 2,
  };
}

function Place({
  glyph,
  at,
  position,
  drive,
}: {
  glyph: string;
  at: number;
  position: { left: number; top: number };
  drive: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const appear = Math.min(1, Math.max(0, (drive.value - (at - 0.24)) / 0.18));
    const leave = Math.min(1, Math.max(0, (drive.value - (at + 0.08)) / 0.16));
    const passed = drive.value - at;
    return {
      opacity: appear * (1 - leave),
      transform: [
        { translateX: -FORWARD.x * DRIFT * passed * 2 },
        { translateY: -FORWARD.y * DRIFT * passed * 2 },
        { scale: 0.3 + 0.7 * appear - 0.3 * leave },
      ],
    };
  });
  return (
    <Animated.View style={[styles.badge, position, style]}>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        {GLYPHS[glyph]}
      </Svg>
    </Animated.View>
  );
}

/** Road points for 0…1 along the road, in leaf units (see launch-intro). */
export function IntroScenery({
  size,
  drive,
  roadAt,
}: {
  size: number;
  drive: SharedValue<number>;
  roadAt: (t: number) => { x: number; y: number };
}) {
  return (
    <>
      {PLACES.map(({ glyph, at, side }) => {
        const road = roadAt(at);
        return (
          <Place
            key={glyph}
            glyph={glyph}
            at={at}
            position={toScreen(road.x + side * OFFSET, road.y, size)}
            drive={drive}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#011C14',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
