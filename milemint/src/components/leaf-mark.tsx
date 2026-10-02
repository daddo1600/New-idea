import { type ReactNode, useId } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import {
  DASH_WIDTH,
  DOT_R,
  LANE_DASHES,
  LEAF_PALETTES,
  LEAF_SHAPES,
  type Leaf,
  leafPlacement,
  LEAVES,
  type LeafPalette,
  RING_R,
  ROAD_WIDTH,
  SHADOW_OFFSET,
  SMALL,
  SMALL_LANE_DASHES,
  SMALL_MARK,
  SOIL,
  SPROUT_COLORS,
  STEM_PATH,
  stemAt,
  TOP,
} from '@/brand/sprout';

/**
 * The logo: a sprout whose stem is a road, with the car (the yellow dot) at
 * the top where the leaves open (see brand/sprout). `children` are drawn on
 * top in mark coordinates (a 100 × 100 box; the dot is at TOP).
 */
const BLEED = 0.3;

/** The mark's viewBox, with `margin` (a fraction of its size) of room around it. */
export function markViewBox(margin: number) {
  return `${-100 * margin} ${-100 * margin} ${100 * (1 + 2 * margin)} ${100 * (1 + 2 * margin)}`;
}

export function LeafMark({
  size,
  car = true,
  opacity = 1,
  palette = 'mint',
  bleed = false,
  children,
}: {
  size: number;
  car?: boolean;
  opacity?: number;
  palette?: LeafPalette;
  /** Room around the mark for things that stick out (seasonal hats), without changing its size or position. */
  bleed?: boolean;
  children?: ReactNode;
}) {
  // Ids are page-wide on the web: each logo needs its own, or every logo takes the first one's colours.
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const margin = bleed ? BLEED : 0;
  // Small logos drop the fine detail and draw the road, dashes and dot bolder.
  const small = size < SMALL_MARK;
  const zoom = small ? SMALL.scale : 1;
  return (
    <Svg
      width={size * (1 + 2 * margin)}
      height={size * (1 + 2 * margin)}
      viewBox={markViewBox(margin)}
      style={bleed ? { margin: -size * margin } : undefined}
      opacity={opacity}>
      <LeafGradient id={`leaf${id}`} palette={palette} />
      <G transform={`translate(${50 - 50 * zoom} ${50 - 50 * zoom}) scale(${zoom})`}>
        {LEAVES.map((leaf, i) => (
          <G key={i}>
            <LeafBody leaf={leaf} fill={`url(#leaf${id})`} palette={palette} detail={!small} />
            {!small && <LeafVeins leaf={leaf} palette={palette} />}
          </G>
        ))}
        <Path
          d={STEM_PATH}
          stroke={SPROUT_COLORS.road}
          strokeWidth={small ? SMALL.road : ROAD_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={(small ? SMALL_LANE_DASHES : LANE_DASHES).map((dash) => dash.d).join(' ')}
          stroke={SPROUT_COLORS.dash}
          strokeWidth={small ? SMALL.dash : DASH_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
        {car && (
          <>
            <Circle cx={TOP.x} cy={TOP.y} r={small ? SMALL.ring : RING_R} fill={SPROUT_COLORS.ring} />
            <Circle cx={TOP.x} cy={TOP.y} r={small ? SMALL.dot : DOT_R} fill={SPROUT_COLORS.gold} />
          </>
        )}
        {!small && <Soil />}
        {children}
      </G>
    </Svg>
  );
}

/** The leaves' two-tone gradient: deep at the base, light towards the tip. */
export function LeafGradient({ id, palette }: { id: string; palette: LeafPalette }) {
  const colors = LEAF_PALETTES[palette];
  return (
    <Defs>
      <LinearGradient id={id} x1="0" y1="1" x2="0.85" y2="0">
        <Stop offset="0" stopColor={colors.deep} />
        <Stop offset="1" stopColor={colors.light} />
      </LinearGradient>
    </Defs>
  );
}

/** One leaf's shadow, blade, folded underside and sheen, in mark coordinates. */
export function LeafBody({
  leaf,
  fill,
  palette,
  detail,
}: {
  leaf: Leaf;
  fill: string;
  palette: LeafPalette;
  /** The shadow and sheen, left out on small logos. */
  detail: boolean;
}) {
  const shape = LEAF_SHAPES[leaf.shape];
  const { transform } = leafPlacement(leaf);
  return (
    <>
      {detail && (
        <G transform={`translate(${SHADOW_OFFSET.x} ${SHADOW_OFFSET.y}) ${transform}`}>
          <Path d={shape.blade} fill={SPROUT_COLORS.shadow} fillOpacity={0.5} />
        </G>
      )}
      <G transform={transform}>
        <Path d={shape.blade} fill={fill} />
        <Path d={shape.fold} fill={LEAF_PALETTES[palette].fold} fillOpacity={0.42} />
        {detail && <Path d={shape.highlight} fill="#FFFFFF" fillOpacity={0.3} />}
      </G>
    </>
  );
}

/** One leaf's midrib and side veins, darker on the top and lighter on the underside. */
export function LeafVeins({ leaf, palette }: { leaf: Leaf; palette: LeafPalette }) {
  const shape = LEAF_SHAPES[leaf.shape];
  const colors = LEAF_PALETTES[palette];
  const { transform } = leafPlacement(leaf);
  return (
    <G transform={transform} fill="none" strokeLinecap="round">
      <Path d={shape.midrib} stroke={colors.vein} strokeOpacity={0.4} strokeWidth={0.9} />
      {shape.veins.map((vein) => (
        <Path key={vein} d={vein} stroke={colors.vein} strokeOpacity={0.3} strokeWidth={0.6} />
      ))}
      {shape.foldVeins.map((vein) => (
        <Path key={vein} d={vein} stroke={colors.foldVein} strokeOpacity={0.35} strokeWidth={0.55} />
      ))}
    </G>
  );
}

/** The low mound of soil at the stem's foot, drawn in front of it so the seed sits half in it. */
export function Soil() {
  return (
    <>
      <Path d={SOIL.mound} fill={SPROUT_COLORS.soil} fillOpacity={0.85} />
      <Path d={SOIL.rim} stroke="#0E9F6E" strokeOpacity={0.55} strokeWidth={0.8} strokeLinecap="round" fill="none" />
      {SOIL.pebbles.map((pebble) => (
        <Circle key={pebble.x} cx={pebble.x} cy={pebble.y} r={pebble.r} fill={SPROUT_COLORS.dash} fillOpacity={0.35} />
      ))}
    </>
  );
}

/**
 * The launch animation's first frame and the splash screen's image: the
 * gold seed half in its soil, where they sit in the full mark.
 */
export function SproutSeed({ size }: { size: number }) {
  const seed = stemAt(0);
  return (
    <Svg width={size} height={size} viewBox={markViewBox(0)}>
      <Circle cx={seed.x} cy={seed.y} r={DOT_R} fill={SPROUT_COLORS.gold} />
      <Soil />
    </Svg>
  );
}
