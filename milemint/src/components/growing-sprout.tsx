import { type ReactNode, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import {
  BURIED,
  CRACK,
  CRUMBS,
  DASH_WIDTH,
  DOT_R,
  LANE_DASHES,
  type Leaf,
  leafPlacement,
  LEAVES,
  type LeafPalette,
  RING_R,
  ROAD_WIDTH,
  SPROUT_COLORS,
  STEM_LENGTH,
  STEM_PATH,
  stemAt,
  stemSampleAt,
  TOP,
} from '@/brand/sprout';
import { LeafBody, LeafGradient, LeafVeins, markViewBox, Soil } from '@/components/leaf-mark';

/**
 * The launch animation's sprout. First `emerge` (0–1): the seed asleep in the
 * soil glows, the soil trembles and cracks, and the seed bursts out of it,
 * throwing clods aside. Then it grows by one progress value (`drive`, 0–1):
 * the road climbs out of the soil with the car at its tip, laying the lane
 * dashes behind it; each leaf springs open from its node once the car has
 * passed it, its veins following; the last, curled leaflet opens as the car
 * lands and its ring draws in. At 1 it is exactly LeafMark at the same size.
 *
 * Every part is drawn once and only animated props and styles change, so it
 * never re-renders while it plays. The leaves sit in their own layers under
 * the road and turn as views (SVG transforms don't animate reliably on iOS).
 */

/** How much of the drive each leaf takes to open, after the car passes its node… */
const LEAF_OPEN = 0.26;
/** …and by when, so only the last leaflet is still opening as the car lands. */
const LANDED = 0.95;
/** The lane dashes appear this far behind the car, clear of the dot. */
const DASH_LAG = 0.08;
/** The ring draws in over the last stretch of the climb. */
const RING_FROM = 0.9;
/** Of `emerge`: the seed stirs in the soil until here, then breaks out. */
const BREAK = 0.55;
/** How far the clods fall back under gravity, as a share of their throw. */
const GRAVITY = 0.6;
/** Room around the mark for the leaves' overshoot and the hats. */
const MARGIN = 0.3;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** easeOutBack's constant for an overshoot that peaks at `peak` (1.05 = 5% past full size). */
function backFor(peak: number) {
  let lo = 0;
  let hi = 4;
  for (let i = 0; i < 40; i++) {
    const c = (lo + hi) / 2;
    if ((4 * c * c * c) / (27 * (c + 1) * (c + 1)) < peak - 1) lo = c;
    else hi = c;
  }
  return lo;
}

export function GrowingSprout({
  size,
  emerge,
  drive,
  palette,
  car,
  hat,
}: {
  size: number;
  /** The seed breaking out of the soil, before the climb. */
  emerge: SharedValue<number>;
  drive: SharedValue<number>;
  palette: LeafPalette;
  /** The yellow dot (hidden while a seasonal rider stands in for it). */
  car: boolean;
  /** Drawn on the dot as it lands, in mark coordinates. */
  hat?: ReactNode;
}) {
  const layer = {
    position: 'absolute' as const,
    left: -size * MARGIN,
    top: -size * MARGIN,
    width: size * (1 + 2 * MARGIN),
    height: size * (1 + 2 * MARGIN),
  };
  return (
    <View style={{ width: size, height: size }}>
      {LEAVES.map((leaf, i) => {
        // The last leaf opens as the car lands; the others are open just before.
        const last = i === LEAVES.length - 1;
        const from = last ? Math.min(leaf.at, RING_FROM) : leaf.at;
        return (
          <GrowingLeaf
            key={i}
            leaf={leaf}
            drive={drive}
            palette={palette}
            from={from}
            span={last ? 1 - from : Math.min(LEAF_OPEN, LANDED - from)}
            size={size}
            layer={layer}
          />
        );
      })}
      <Svg style={layer} viewBox={markViewBox(MARGIN)}>
        <Road emerge={emerge} drive={drive} car={car} />
      </Svg>
      {hat && <Hat drive={drive} size={size} layer={layer} hat={hat} />}
    </View>
  );
}

type Layer = { position: 'absolute'; left: number; top: number; width: number; height: number };

/** Turns a layer about the point (x, y) in mark units, as RN transforms about its centre. */
function about(x: number, y: number, size: number) {
  return { dx: x * (size / 100) - size / 2, dy: y * (size / 100) - size / 2 };
}

function GrowingLeaf({
  leaf,
  drive,
  palette,
  from,
  span,
  size,
  layer,
}: {
  leaf: Leaf;
  drive: SharedValue<number>;
  palette: LeafPalette;
  from: number;
  span: number;
  size: number;
  layer: Layer;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { node } = leafPlacement(leaf);
  const { dx, dy } = about(node.x, node.y, size);
  const back = backFor(leaf.overshoot);
  const unfurl = leaf.unfurl;
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (drive.value - from) / span));
    // Springs open from nothing at the node, a little past full size, then settles.
    const b = t - 1;
    const open = 1 + (back + 1) * b * b * b + back * b * b;
    return {
      opacity: t > 0 ? 1 : 0,
      transform: [
        { translateX: dx },
        { translateY: dy },
        { rotate: `${unfurl * (1 - open)}deg` },
        { scale: Math.max(0.001, open) },
        { translateX: -dx },
        { translateY: -dy },
      ],
    };
  });
  // The veins come in once the blade is mostly open.
  const veinStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, (drive.value - from - span * 0.5) / (span * 0.5))),
  }));
  return (
    <Animated.View style={[layer, style]}>
      <Svg style={StyleSheet.absoluteFill} viewBox={markViewBox(MARGIN)}>
        <LeafGradient id={`leaf${id}`} palette={palette} />
        <LeafBody leaf={leaf} fill={`url(#leaf${id})`} palette={palette} detail />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, veinStyle]}>
        <Svg style={StyleSheet.absoluteFill} viewBox={markViewBox(MARGIN)}>
          <LeafVeins leaf={leaf} palette={palette} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

/** The road growing up from the seed, its lane dashes, the car and the soil in front. */
function Road({ emerge, drive, car }: { emerge: SharedValue<number>; drive: SharedValue<number>; car: boolean }) {
  // A dash one unit longer than the road, so its tip never falls short of the top.
  const length = STEM_LENGTH + 1;
  const roadProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - drive.value) }));
  const carProps = useAnimatedProps(() => {
    const spot = stemSampleAt(drive.value);
    // Asleep in the soil it glows and trembles, swelling, then bursts up to the
    // stem's foot with a little bounce; its white ring draws in as it lands.
    const e = emerge.value;
    const stir = Math.min(1, e / BREAK);
    const out = Math.max(0, (e - BREAK) / (1 - BREAK));
    const rise = 1 - (1 - out) * (1 - out) + Math.sin(Math.PI * out) * 0.25;
    const tremble = e < BREAK ? Math.sin(e * 90) * 0.5 * stir : 0;
    const ring = (RING_R - DOT_R) * Math.min(1, Math.max(0, (drive.value - RING_FROM) / (1 - RING_FROM)));
    const buried = BURIED.r + (DOT_R * 0.75 - BURIED.r) * stir;
    return {
      cx: spot.x + tremble,
      cy: spot.y + (BURIED.y - FOOT.y) * (1 - rise),
      r: buried + (DOT_R - buried) * Math.min(1, out * 1.5) + ring / 2,
      strokeWidth: ring,
    };
  });
  return (
    <G>
      <AnimatedPath
        d={STEM_PATH}
        stroke={SPROUT_COLORS.road}
        strokeWidth={ROAD_WIDTH}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={[length, length]}
        animatedProps={roadProps}
      />
      {LANE_DASHES.map((dash) => (
        <LaneDash key={dash.d} d={dash.d} end={dash.end} drive={drive} />
      ))}
      {car && (
        <AnimatedCircle
          cx={TOP.x}
          cy={TOP.y}
          r={DOT_R}
          fill={SPROUT_COLORS.gold}
          stroke={SPROUT_COLORS.ring}
          strokeWidth={0}
          animatedProps={carProps}
        />
      )}
      <Soil />
      <Burst emerge={emerge} />
    </G>
  );
}

/** The stem's foot, where the seed comes to rest as it breaks out. */
const FOOT = stemAt(0);

/** The crack opening in the soil, and the clods the seed throws out as it breaks through. */
function Burst({ emerge }: { emerge: SharedValue<number> }) {
  const crackProps = useAnimatedProps(() => {
    const opening = Math.min(1, Math.max(0, (emerge.value - 0.2) / (BREAK - 0.2)));
    // Gone the moment the seed is through, so it never crosses the dot.
    const through = Math.min(1, Math.max(0, (emerge.value - BREAK) / 0.12));
    return { strokeOpacity: opening * (1 - through), strokeWidth: 0.6 + 0.8 * opening };
  });
  return (
    <G>
      <AnimatedPath
        d={CRACK}
        stroke={SPROUT_COLORS.soilCrack}
        strokeOpacity={0}
        strokeWidth={0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animatedProps={crackProps}
      />
      {CRUMBS.map((crumb) => (
        <Crumb key={`${crumb.dx},${crumb.dy}`} crumb={crumb} emerge={emerge} />
      ))}
    </G>
  );
}

function Crumb({ crumb, emerge }: { crumb: (typeof CRUMBS)[number]; emerge: SharedValue<number> }) {
  const props = useAnimatedProps(() => {
    const t = Math.max(0, (emerge.value - BREAK) / (1 - BREAK));
    // Thrown up and out, then falling back as they fade.
    return {
      cx: FOOT.x + crumb.dx * t,
      cy: FOOT.y + crumb.dy * t + -crumb.dy * GRAVITY * t * t,
      fillOpacity: t === 0 ? 0 : 1 - t * t,
    };
  });
  return (
    <AnimatedCircle cx={FOOT.x} cy={FOOT.y} r={crumb.r} fill={SPROUT_COLORS.soil} fillOpacity={0} animatedProps={props} />
  );
}

/** One lane dash, laid just behind the car. */
function LaneDash({ d, end, drive }: { d: string; end: number; drive: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({
    strokeOpacity: Math.min(1, Math.max(0, (drive.value - end - DASH_LAG) / 0.02)),
  }));
  return (
    <AnimatedPath
      d={d}
      stroke={SPROUT_COLORS.dash}
      strokeWidth={DASH_WIDTH}
      fill="none"
      strokeLinecap="round"
      strokeOpacity={0}
      animatedProps={props}
    />
  );
}

/** The season's hat, popping onto the dot as it lands. */
function Hat({ drive, size, layer, hat }: { drive: SharedValue<number>; size: number; layer: Layer; hat: ReactNode }) {
  const { dx, dy } = about(TOP.x, TOP.y, size);
  const style = useAnimatedStyle(() => {
    const t = Math.min(1, Math.max(0, (drive.value - RING_FROM) / (1 - RING_FROM)));
    const b = t - 1;
    const pop = 1 + 2.7 * b * b * b + 1.7 * b * b;
    return {
      opacity: Math.min(1, t * 3),
      transform: [
        { translateX: dx },
        { translateY: dy - 8 * (1 - t) },
        { scale: Math.max(0.001, pop) },
        { translateX: -dx },
        { translateY: -dy },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[layer, style]}>
      <Svg style={StyleSheet.absoluteFill} viewBox={markViewBox(MARGIN)}>
        {hat}
      </Svg>
    </Animated.View>
  );
}
