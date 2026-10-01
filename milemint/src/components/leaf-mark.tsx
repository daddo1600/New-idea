import { type ReactNode, useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { LEAF_PATH, LEAF_VEINS, ROAD_PATH } from '@/brand/leaf';

/**
 * The MileMint logo: a mint leaf with a road for its vein and the car (the
 * yellow dot) at the start of it. `children` are drawn on top in leaf
 * coordinates (road along x = 0, from y = 420 up to y = -330).
 */
const BLEED = 0.3;

/** Leaf colours: mint all year, turning gold and orange in autumn. */
const PALETTES = {
  mint: { stops: ['#BBF7D0', '#4ADE80', '#16A34A'], vein: '#15803D' },
  autumn: { stops: ['#FEF3C7', '#FBBF24', '#EA580C'], vein: '#9A3412' },
} as const;

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
  palette?: keyof typeof PALETTES;
  /** Room around the leaf for things that stick out (seasonal hats), without changing its size or position. */
  bleed?: boolean;
  children?: ReactNode;
}) {
  const colors = PALETTES[palette];
  // Ids are page-wide on the web: each logo needs its own, or every logo takes the first one's colours.
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const margin = bleed ? BLEED : 0;
  return (
    <Svg
      width={size * (1 + 2 * margin)}
      height={size * (1 + 2 * margin)}
      viewBox={`${-1024 * margin} ${-1024 * margin} ${1024 * (1 + 2 * margin)} ${1024 * (1 + 2 * margin)}`}
      style={bleed ? { margin: -size * margin } : undefined}
      opacity={opacity}>
      <Defs>
        <LinearGradient id={`leaf${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.stops[0]} />
          <Stop offset="0.5" stopColor={colors.stops[1]} />
          <Stop offset="1" stopColor={colors.stops[2]} />
        </LinearGradient>
        <ClipPath id={`veins${id}`}>
          <Path d={LEAF_PATH} />
        </ClipPath>
      </Defs>
      <G transform="translate(530 490) rotate(40)">
        <Path d={LEAF_PATH} transform="translate(-14 18)" fill="#011C14" fillOpacity={0.3} />
        <Path d={LEAF_PATH} fill={`url(#leaf${id})`} />
        {/* Veins stop at the leaf's edge. */}
        <G clipPath={`url(#veins${id})`}>
          {LEAF_VEINS.map((vein) => (
            <Path
              key={vein}
              d={vein}
              stroke={colors.vein}
              strokeOpacity={0.45}
              strokeWidth={13}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </G>
        <Path d={ROAD_PATH} stroke="#064E3B" strokeWidth={62} fill="none" strokeLinecap="round" />
        <Path d={ROAD_PATH} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeDasharray="30 26" strokeLinecap="round" />
        {car && <Circle cx={0} cy={430} r={58} fill="#FACC15" stroke="#FFFFFF" strokeWidth={16} />}
        {children}
      </G>
    </Svg>
  );
}
