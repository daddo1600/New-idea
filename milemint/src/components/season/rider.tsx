import { StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { SeasonId } from '@/domain/seasons';

/**
 * Seasonal stand-ins for the car (the logo's yellow dot): Santa's sleigh and
 * reindeer in December, a jack-o'-lantern at Halloween. Drawn on screen over
 * the logo and moved along the road with the drive.
 */

type RiderSpec = {
  width: number;
  height: number;
  tilt: number;
  /** After the road ends: keep flying up and away (the sleigh) rather than stop. */
  takeOff: boolean;
  /** How far up the road it goes (0–1): the pumpkin stops just under the witch hat. */
  reach: number;
  art: () => React.ReactNode;
};

function Reindeer({ x }: { x: number }) {
  return (
    <G>
      <Ellipse cx={x} cy={30} rx={11} ry={6} fill="#92400E" />
      <Line x1={x - 7} y1={34} x2={x - 10} y2={44} stroke="#78350F" strokeWidth={2.4} strokeLinecap="round" />
      <Line x1={x + 6} y1={34} x2={x + 10} y2={44} stroke="#78350F" strokeWidth={2.4} strokeLinecap="round" />
      <Path d={`M${x + 8} 27 L${x + 13} 19`} stroke="#92400E" strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={x + 15} cy={17} rx={5} ry={3.6} fill="#92400E" />
      <Path
        d={`M${x + 12} 14 l-2 -7 m1 3 l-4 -2 M${x + 15} 13 l2 -7 m-1 3 l4 -2`}
        stroke="#FDE68A"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      {/* Every nose brown, the lead's too: a red one risks the Rudolph trade mark. */}
      <Circle cx={x + 20} cy={17} r={1.4} fill="#451A03" />
    </G>
  );
}

const RIDERS: Partial<Record<SeasonId, RiderSpec>> = {
  festive: {
    width: 92,
    height: 46,
    tilt: -40,
    takeOff: true,
    reach: 1,
    art: () => (
      <>
        {/* Reins from the sleigh to the reindeer. */}
        <Path d="M26 22 C40 18 52 26 62 24 M26 22 C44 26 66 28 84 22" stroke="#FACC15" strokeWidth={1.4} fill="none" />
        <Reindeer x={52} />
        <Reindeer x={72} />
        {/* Sleigh with a sack of parcels. */}
        <Rect x={6} y={10} width={14} height={14} rx={3} fill="#FACC15" />
        <Rect x={12} y={6} width={10} height={10} rx={2} fill="#38BDF8" />
        <Path d="M2 18 H28 C30 18 30 30 24 32 H8 C3 32 2 26 2 18 Z" fill="#DC2626" />
        <Path d="M0 38 H26 C30 38 32 35 33 33" stroke="#FACC15" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <Line x1={8} y1={32} x2={8} y2={38} stroke="#FACC15" strokeWidth={2} />
        <Line x1={22} y1={32} x2={22} y2={38} stroke="#FACC15" strokeWidth={2} />
      </>
    ),
  },
  halloween: {
    width: 30,
    height: 30,
    tilt: 0,
    takeOff: false,
    reach: 0.93,
    art: () => (
      <>
        <Path d="M15 4 C16 1 19 1 20 2" stroke="#15803D" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Ellipse cx={15} cy={17} rx={13} ry={11} fill="#F97316" stroke="#FFFFFF" strokeWidth={2} />
        <Path d="M9 12 l3 4 h-6 Z M21 12 l3 4 h-6 Z" fill="#431407" />
        <Path d="M8 20 Q15 26 22 20 L19 21 L17 19 L15 21 L13 19 L11 21 Z" fill="#431407" />
      </>
    ),
  },
};

/** Whether `season` swaps the car for a rider (so the yellow dot is hidden). */
export function hasRider(season: SeasonId | null): boolean {
  return season !== null && RIDERS[season] !== undefined;
}

/**
 * The rider, following the car up the road. `xs` and `ys` are the road's
 * points (mark units, see brand/sprout) for the drive's progress; `size` is
 * the logo's width.
 */
export function SeasonRider({
  season,
  drive,
  size,
  xs,
  ys,
  samples,
}: {
  season: SeasonId;
  drive: SharedValue<number>;
  size: number;
  xs: readonly number[];
  ys: readonly number[];
  samples: number;
}) {
  const spec = RIDERS[season];
  const scale = size / 100;
  const style = useAnimatedStyle(() => {
    const progress = drive.value * (spec?.reach ?? 1);
    const at = Math.min(progress, 1) * samples;
    const i = Math.min(samples - 1, Math.floor(at));
    const f = at - i;
    const x = xs[i] + (xs[i + 1] - xs[i]) * f;
    const y = ys[i] + (ys[i + 1] - ys[i]) * f;
    const width = spec?.width ?? 0;
    const height = spec?.height ?? 0;
    // The sleigh lifts off over the last stretch and soars away past the leaves.
    const lift = spec?.takeOff ? Math.max(0, (drive.value - 0.6) / 0.4) : 0;
    const soar = lift * lift * 110;
    return {
      transform: [
        { translateX: x * scale - width / 2 + soar * 0.75 },
        { translateY: y * scale - height / 2 - soar },
        { rotate: `${spec?.tilt ?? 0}deg` },
      ],
    };
  });
  if (!spec) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.rider, style]}>
      <Svg width={spec.width} height={spec.height} viewBox={`0 0 ${spec.width} ${spec.height}`}>
        {spec.art()}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rider: { position: 'absolute', top: 0, left: 0 },
});
