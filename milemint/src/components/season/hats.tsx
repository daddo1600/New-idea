import { useEffect } from 'react';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { SeasonId } from '@/domain/seasons';

/**
 * Seasonal headwear for the logo, drawn in leaf coordinates (see LeafMark):
 * the leaf's tip is at (0, -440) and "up" is negative y, so a hat sits over
 * the tip and tilts with the leaf.
 */

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

function SantaHat() {
  return (
    <G>
      {/* Hat, flopping over to the right with the bobble at the end. */}
      <Path d="M-125,-330 C-110,-470 -40,-585 70,-600 C110,-560 120,-470 125,-330 Z" fill="#DC2626" />
      <Path d="M-60,-345 C-50,-450 0,-540 70,-600" stroke="#B91C1C" strokeWidth={18} fill="none" />
      <Rect x={-150} y={-360} width={300} height={70} rx={35} fill="#FFFFFF" />
      <Circle cx={92} cy={-600} r={44} fill="#FFFFFF" />
    </G>
  );
}

function Beanie() {
  return (
    <G>
      <Path d="M-130,-330 C-130,-520 130,-520 130,-330 Z" fill="#FACC15" />
      {[-420, -470].map((y) => (
        <Rect key={y} x={-130} y={y} width={260} height={22} fill="#064E3B" opacity={0.85} />
      ))}
      <Rect x={-145} y={-365} width={290} height={70} rx={20} fill="#064E3B" />
      {[-110, -70, -30, 10, 50, 90].map((x) => (
        <Rect key={x} x={x} y={-358} width={14} height={56} rx={7} fill="#0B7A55" />
      ))}
      <Circle cx={0} cy={-530} r={46} fill="#FFFFFF" />
    </G>
  );
}

function WitchHat() {
  return (
    <G>
      <Ellipse cx={0} cy={-330} rx={200} ry={42} fill="#1E1B2E" />
      <Path d="M-100,-345 C-80,-460 -30,-560 60,-630 C40,-560 70,-460 100,-345 Z" fill="#2E2A45" />
      <Rect x={-104} y={-385} width={208} height={40} fill="#F97316" />
      <Rect x={-24} y={-389} width={48} height={48} rx={6} fill="none" stroke="#FACC15" strokeWidth={12} />
    </G>
  );
}

function PartyHat() {
  return (
    <G>
      <Path d="M-105,-330 L0,-570 L105,-330 Z" fill="#FACC15" />
      <Path d="M-62,-420 L62,-420 M-32,-495 L32,-495" stroke="#DB2777" strokeWidth={20} strokeLinecap="round" />
      {[-60, 0, 60].map((x, i) => (
        <Circle key={x} cx={x} cy={-365} r={14} fill={['#38BDF8', '#DB2777', '#FFFFFF'][i]} />
      ))}
      <Circle cx={0} cy={-578} r={34} fill="#DB2777" />
      <Path d="M-28,-605 L-52,-628 M28,-605 L52,-628" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
    </G>
  );
}

/** The cork hat: a bush hat with corks on strings that swing as you go. */
function CorkHat() {
  const reduceMotion = useReducedMotion();
  const swing = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    swing.value = withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [swing, reduceMotion]);
  const corks = [-185, -120, 120, 185];
  return (
    <G>
      {corks.map((x, i) => (
        <Cork key={x} x={x} swing={swing} flip={i % 2 === 0} />
      ))}
      <Ellipse cx={0} cy={-330} rx={230} ry={46} fill="#8B5A2B" />
      <Path d="M-115,-345 C-120,-500 120,-500 115,-345 Z" fill="#A16B3B" />
      <Path d="M-40,-470 C-10,-445 10,-445 40,-470" stroke="#7A4A22" strokeWidth={14} fill="none" strokeLinecap="round" />
      <Rect x={-117} y={-385} width={234} height={36} fill="#5C3A1A" />
    </G>
  );
}

/** One cork on a string, swinging like a pendulum from the brim (towards the stalk). */
function Cork({ x, swing, flip }: { x: number; swing: SharedValue<number>; flip: boolean }) {
  const LENGTH = 120;
  // End points move rather than rotating a group: SVG transforms don't animate reliably on iOS.
  const end = (value: number) => {
    'worklet';
    const angle = (((flip ? 1 : -1) * (value * 28 - 14)) * Math.PI) / 180;
    return { x: x + Math.sin(angle) * LENGTH, y: -320 + Math.cos(angle) * LENGTH };
  };
  const string = useAnimatedProps(() => {
    const at = end(swing.value);
    return { x2: at.x, y2: at.y };
  });
  const cork = useAnimatedProps(() => {
    const at = end(swing.value);
    return { cx: at.x, cy: at.y + 18 };
  });
  return (
    <G>
      <AnimatedLine x1={x} y1={-320} x2={x} y2={-200} stroke="#3F2A14" strokeWidth={6} animatedProps={string} />
      <AnimatedEllipse cx={x} cy={-182} rx={17} ry={26} fill="#D4A373" stroke="#B07D4F" strokeWidth={5} animatedProps={cork} />
    </G>
  );
}

function Sunglasses() {
  return (
    <G>
      <Path d="M-150,-170 L150,-170" stroke="#0F172A" strokeWidth={16} strokeLinecap="round" />
      <Rect x={-150} y={-180} width={120} height={78} rx={34} fill="#0F172A" />
      <Rect x={30} y={-180} width={120} height={78} rx={34} fill="#0F172A" />
      <Path d="M-125,-160 L-95,-160 M55,-160 L85,-160" stroke="#FFFFFF" strokeWidth={10} strokeOpacity={0.7} strokeLinecap="round" />
    </G>
  );
}

function Blossom() {
  const petals = [0, 72, 144, 216, 288];
  return (
    <G>
      {petals.map((angle) => {
        const r = (angle * Math.PI) / 180;
        return <Circle key={angle} cx={Math.sin(r) * 52} cy={-470 - Math.cos(r) * 52} r={46} fill="#F9A8D4" />;
      })}
      <Circle cx={0} cy={-470} r={34} fill="#FACC15" />
      <Path d="M0,-420 L0,-380" stroke="#15803D" strokeWidth={14} strokeLinecap="round" />
    </G>
  );
}

/** What the logo wears for `season`. Autumn changes the leaf's colour instead (see LEAF_PALETTES). */
export function SeasonHat({ season }: { season: SeasonId }) {
  // Drawn at a modest size, then enlarged around the leaf's tip so they read at a glance.
  return season === 'summer' ? (
    <G transform="translate(0 -170) scale(1.3) translate(0 170)">
      <HatArt season={season} />
    </G>
  ) : (
    <G transform="translate(0 -360) scale(1.45) translate(0 360)">
      <HatArt season={season} />
    </G>
  );
}

function HatArt({ season }: { season: SeasonId }) {
  switch (season) {
    case 'festive':
      return <SantaHat />;
    case 'winter':
      return <Beanie />;
    case 'halloween':
      return <WitchHat />;
    case 'new-year':
      return <PartyHat />;
    case 'aussie-summer':
      return <CorkHat />;
    case 'summer':
      return <Sunglasses />;
    case 'spring':
      return <Blossom />;
    default:
      return null;
  }
}
