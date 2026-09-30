import type { ReactNode } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { LEAF_PATH, LEAF_VEINS, ROAD_PATH } from '@/brand/leaf';

/**
 * The MileMint logo: a mint leaf with a road for its vein and the car (the
 * yellow dot) at the start of it. `children` are drawn on top in leaf
 * coordinates (road along x = 0, from y = 420 up to y = -330).
 */
export function LeafMark({
  size,
  car = true,
  opacity = 1,
  children,
}: {
  size: number;
  car?: boolean;
  opacity?: number;
  children?: ReactNode;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" opacity={opacity}>
      <Defs>
        <LinearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#BBF7D0" />
          <Stop offset="0.5" stopColor="#4ADE80" />
          <Stop offset="1" stopColor="#16A34A" />
        </LinearGradient>
      </Defs>
      <G transform="translate(530 490) rotate(40)">
        <Path d={LEAF_PATH} transform="translate(-14 18)" fill="#011C14" fillOpacity={0.3} />
        <Path d={LEAF_PATH} fill="url(#leaf)" />
        {LEAF_VEINS.map((vein) => (
          <Path
            key={vein}
            d={vein}
            stroke="#15803D"
            strokeOpacity={0.45}
            strokeWidth={13}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <Path d={ROAD_PATH} stroke="#064E3B" strokeWidth={62} fill="none" strokeLinecap="round" />
        <Path d={ROAD_PATH} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeDasharray="30 26" strokeLinecap="round" />
        {car && <Circle cx={0} cy={430} r={58} fill="#FACC15" stroke="#FFFFFF" strokeWidth={16} />}
        {children}
      </G>
    </Svg>
  );
}
