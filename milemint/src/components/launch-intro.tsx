import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { ROAD_PATH } from '@/brand/leaf';
import { phoneRegion } from '@/components/country-options';
import { IntroScenery } from '@/components/intro-scenery';
import { LeafMark } from '@/components/leaf-mark';
import { formatDistance, formatMoney, fromUnits, ratePeriodFor, REGIONS, type RegionCode } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { recallRegion } from '@/region/remembered-region';

/**
 * Plays on every launch while the app opens underneath: the car (the logo's
 * yellow dot) drives up the leaf's road, laying the lane markings behind it,
 * past a petrol station, shops and a café, while the miles and their tax
 * value count up in the user's currency. Starts exactly where the
 * native splash screen leaves off (same colour, size and position).
 */

/** Matches the splash screen in app.json. */
export const INTRO_BACKGROUND = '#0B7A55';
/** The splash icon is drawn 120pt wide. */
const SPLASH_SIZE = 120;
const GROWN_SCALE = 1.5;

const DRIVE_MS = 1700;
const HOLD_MS = 350;
const FADE_MS = 300;
/** The drive the counter shows. */
const DEMO_UNITS = 12.4;

/** The road as a cubic Bézier (see ROAD_PATH), sampled evenly by distance travelled. */
const ROAD = { p0: [0, 420], p1: [-20, 200], p2: [25, 0], p3: [0, -330] } as const;
const SAMPLES = 64;
const { roadXs, roadYs, roadLength } = sampleRoad();

function sampleRoad() {
  const fine = 400;
  const points: [number, number][] = [];
  const lengths = [0];
  for (let i = 0; i <= fine; i++) {
    const t = i / fine;
    const u = 1 - t;
    const at = (k: 0 | 1) =>
      u * u * u * ROAD.p0[k] + 3 * u * u * t * ROAD.p1[k] + 3 * u * t * t * ROAD.p2[k] + t * t * t * ROAD.p3[k];
    points.push([at(0), at(1)]);
    if (i > 0) {
      const [px, py] = points[i - 1];
      lengths.push(lengths[i - 1] + Math.hypot(at(0) - px, at(1) - py));
    }
  }
  const total = lengths[fine];
  const xs: number[] = [];
  const ys: number[] = [];
  let j = 0;
  for (let s = 0; s <= SAMPLES; s++) {
    const target = (s / SAMPLES) * total;
    while (j < fine && lengths[j + 1] < target) j++;
    const span = lengths[j + 1] - lengths[j] || 1;
    const f = Math.min(1, Math.max(0, (target - lengths[j]) / span));
    const next = points[Math.min(j + 1, fine)];
    xs.push(points[j][0] + (next[0] - points[j][0]) * f);
    ys.push(points[j][1] + (next[1] - points[j][1]) * f);
  }
  return { roadXs: xs, roadYs: ys, roadLength: total };
}

/** A point `t` (0–1) of the way along the road, in leaf units. */
function roadAt(t: number) {
  const i = Math.round(Math.min(1, Math.max(0, t)) * SAMPLES);
  return { x: roadXs[i], y: roadYs[i] };
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function LaunchIntro({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  // The phone's country until the one chosen in set-up has been read (a few milliseconds).
  const [code, setCode] = useState<RegionCode>(phoneRegion);
  useEffect(() => {
    let current = true;
    recallRegion().then((remembered) => current && remembered && setCode(remembered));
    return () => {
      current = false;
    };
  }, []);
  const region = REGIONS[code];
  const ratePerUnit = useMemo(() => {
    const period = ratePeriodFor(toLocalIsoDate(new Date()), region) ?? region.rates[region.rates.length - 1];
    return period.tiers[0].rate / 10; // minor units (cents, pence) per mile or km
  }, [region]);

  const drive = useSharedValue(reduceMotion ? 1 : 0);
  const grow = useSharedValue(reduceMotion ? 1 : 0);
  const fade = useSharedValue(1);
  const [shown, setShown] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    const easing = Easing.inOut(Easing.cubic);
    const lead = reduceMotion ? 0 : 120;
    const drivingFor = reduceMotion ? 0 : DRIVE_MS;
    grow.value = withDelay(lead, withTiming(1, { duration: drivingFor * 0.6, easing }));
    drive.value = withDelay(lead, withTiming(1, { duration: drivingFor, easing }));
    fade.value = withDelay(
      lead + drivingFor + HOLD_MS,
      withTiming(0, { duration: FADE_MS }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
  }, [drive, grow, fade, onDone, reduceMotion]);

  // The counter ticks in tenths, so only re-render when the shown value changes.
  useAnimatedReaction(
    () => Math.round(drive.value * DEMO_UNITS * 10),
    (tenths, previous) => {
      if (tenths !== previous) scheduleOnRN(setShown, tenths / (DEMO_UNITS * 10));
    },
  );

  const carProps = useAnimatedProps(() => {
    const at = drive.value * SAMPLES;
    const i = Math.min(SAMPLES - 1, Math.floor(at));
    const f = at - i;
    return {
      cx: roadXs[i] + (roadXs[i + 1] - roadXs[i]) * f,
      cy: roadYs[i] + (roadYs[i + 1] - roadYs[i]) * f,
    };
  });
  // Hides the lane markings the car hasn't reached yet.
  const unpavedProps = useAnimatedProps(() => ({ strokeDashoffset: -drive.value * roadLength }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -56 * grow.value }, { scale: 1 + (GROWN_SCALE - 1) * grow.value }],
  }));
  const counterStyle = useAnimatedStyle(() => ({
    opacity: grow.value,
    transform: [{ translateY: 12 * (1 - grow.value) }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const units = shown * DEMO_UNITS;
  return (
    <Animated.View
      accessible
      accessibilityLabel="MileMint"
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.container, fadeStyle]}>
      <Animated.View style={logoStyle}>
        <LeafMark size={SPLASH_SIZE} car={false}>
          <AnimatedPath
            d={ROAD_PATH}
            stroke="#064E3B"
            strokeWidth={16}
            fill="none"
            strokeDasharray={[roadLength, roadLength]}
            animatedProps={unpavedProps}
          />
          <AnimatedCircle r={58} fill="#FACC15" stroke="#FFFFFF" strokeWidth={16} animatedProps={carProps} />
        </LeafMark>
        {!reduceMotion && <IntroScenery size={SPLASH_SIZE} drive={drive} roadAt={roadAt} />}
      </Animated.View>
      <Animated.View style={[styles.counter, counterStyle]}>
        <Text style={styles.money}>{formatMoney(Math.round(units * ratePerUnit), region)}</Text>
        <Text style={styles.distance}>{formatDistance(fromUnits(units, region), region)} logged</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: INTRO_BACKGROUND, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  counter: { position: 'absolute', top: '50%', marginTop: 88, alignItems: 'center', gap: 2 },
  money: { color: '#FFFFFF', fontSize: 34, fontWeight: '700', fontVariant: ['tabular-nums'] },
  distance: { color: '#D1FAE5', fontSize: 15, fontWeight: '500', fontVariant: ['tabular-nums'] },
});
