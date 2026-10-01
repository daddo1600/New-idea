import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { SeasonAmbient } from '@/components/season/ambient';
import { SeasonHat } from '@/components/season/hats';
import { hasRider, SeasonRider } from '@/components/season/rider';
import { DEMO_TODAY } from '@/dev/demo';
import {
  formatMoney,
  ratePeriodFor,
  REGIONS,
  type RegionCode,
} from '@/domain/regions';
import { type Season, seasonFor } from '@/domain/seasons';
import { toLocalIsoDate } from '@/domain/trip';
import { useT } from '@/i18n/i18n';
import { type LaunchTotals, markTotalSeen, recallRegion, recallTotals } from '@/region/remembered-region';

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
/**
 * The grown leaf and the total under it are centred as one group: the leaf
 * rises this far and the total starts COUNTER_TOP below the middle, so the
 * gap between them is small and the pair sits in the middle of the screen.
 */
const LOGO_LIFT = 66;
const COUNTER_TOP = 40;

const DRIVE_MS = 3200;
const HOLD_MS = 500;
/** The car's climb and the total counting up: unhurried enough to follow. */
const QUICK_DRIVE_MS = 1600;
/** The total stays up, still, long enough to read and take in. */
const QUICK_HOLD_MS = 1500;
/** A little longer to enjoy the seasonal touches. */
const SEASON_HOLD_MS = 1900;
const FADE_MS = 300;
/** The drive the counter shows. */
/**
 * The demo counts up a typical month of business driving (about 400 miles or
 * 650 km): big enough to show what's at stake, labelled so it promises nothing.
 */
const DEMO_MONTH = { mi: 400, km: 650 } as const;
/** The demo counter moves in 1% steps: smooth to the eye without hundreds of re-renders. */
const STEPS = 100;

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
      u * u * u * ROAD.p0[k] +
      3 * u * u * t * ROAD.p1[k] +
      3 * u * t * t * ROAD.p2[k] +
      t * t * t * ROAD.p3[k];
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

/**
 * Opening sequence. Before set-up: the full demo drive (about 3.5 s) that
 * shows what MileMint does. Once set up: a quick one (under 2 s) with the
 * user's own tax-year total counting up from what they last saw, so every
 * launch is a reminder of the money coming back. A tap skips either.
 */
export function LaunchIntro({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [mode, setMode] = useState<{ quick: LaunchTotals | null; code: RegionCode } | null>(null);
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    let current = true;
    // Both are read from the keychain in milliseconds; the splash screen covers the wait.
    Promise.all([recallRegion(), recallTotals()]).then(
      ([remembered, totals]) =>
        current &&
        setMode({
          code: remembered ?? phoneRegion(),
          // Real money to show: until the first business trip, keep the demo drive.
          quick: remembered && totals && totals.total > 0 ? totals : null,
        }),
      () => current && setMode({ code: phoneRegion(), quick: null }),
    );
    return () => {
      current = false;
    };
  }, []);

  const season = useMemo(
    () => (mode ? seasonFor(DEMO_TODAY ? new Date(`${DEMO_TODAY}T12:00:00`) : new Date(), mode.code) : null),
    [mode],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('MileMint. Tap to skip')}
      onPress={() => setSkip(true)}
      style={[StyleSheet.absoluteFill, styles.layer]}>
      {mode === null ? (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
          <LeafMark size={SPLASH_SIZE} />
        </View>
      ) : mode.quick ? (
        <QuickIntro code={mode.code} season={season} totals={mode.quick} skip={skip} onDone={onDone} />
      ) : (
        <FullIntro code={mode.code} season={season} skip={skip} onDone={onDone} />
      )}
    </Pressable>
  );
}

/** After set-up: the car zips up the leaf while their own total counts up. */
function QuickIntro({
  code,
  season,
  totals,
  skip,
  onDone,
}: {
  code: RegionCode;
  season: Season | null;
  totals: LaunchTotals;
  skip: boolean;
  onDone: () => void;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const region = REGIONS[code];
  const from = Math.max(0, Math.min(totals.seen, totals.total));
  const gained = totals.total - from;
  const drive = useSharedValue(reduceMotion ? 1 : 0);
  const fade = useSharedValue(1);
  const [shown, setShown] = useState(reduceMotion ? totals.total : from);

  useEffect(() => {
    // Eases in and out, so the car doesn't dart off the line.
    const easing = Easing.inOut(Easing.cubic);
    drive.value = withDelay(80, withTiming(1, { duration: reduceMotion ? 0 : QUICK_DRIVE_MS, easing }));
    fade.value = withDelay(
      80 + (reduceMotion ? 0 : QUICK_DRIVE_MS) + (season ? SEASON_HOLD_MS : QUICK_HOLD_MS),
      withTiming(0, { duration: FADE_MS }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
    markTotalSeen(totals);
  }, [drive, fade, onDone, reduceMotion, totals, season]);

  useEffect(() => {
    if (!skip) return;
    fade.set(
      withTiming(0, { duration: 180 }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
  }, [skip, fade, onDone]);

  useAnimatedReaction(
    () => Math.round(from + gained * drive.value),
    (minor, previous) => {
      if (minor !== previous) scheduleOnRN(setShown, minor);
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
  const unpavedProps = useAnimatedProps(() => ({ strokeDashoffset: -drive.value * roadLength }));
  const logoStyle = useAnimatedStyle(() => {
    const grow = Math.min(1, drive.value * 2);
    return { transform: [{ translateY: -LOGO_LIFT * grow }, { scale: 1 + (GROWN_SCALE - 1) * grow }] };
  });
  const counterStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, drive.value * 3) }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, fadeStyle]}>
      {season && <SeasonAmbient season={season.id} southern={code === 'AU'} />}
      <Animated.View style={logoStyle}>
        <SeasonalLeaf season={season} unpavedProps={unpavedProps} carProps={carProps} />
        {season && hasRider(season.id) && (
          <SeasonRider season={season.id} drive={drive} size={SPLASH_SIZE} xs={roadXs} ys={roadYs} samples={SAMPLES} />
        )}
        {/* The places flying past, as on the first launch, in every country and season. */}
        {!reduceMotion && (
          <IntroScenery
            size={SPLASH_SIZE}
            drive={drive}
            roadAt={roadAt}
            glyphs={season ? SEASON_PLACES[season.id] : undefined}
            drop={season?.id === 'festive'}
          />
        )}
      </Animated.View>
      <Animated.View style={[styles.counter, counterStyle]}>
        {season && <Greeting text={season.greeting} />}
        <Text style={styles.money}>{formatMoney(shown, region)}</Text>
        <Text style={styles.distance}>{t('found this tax year')}</Text>
        {gained > 0 && (
          <Text style={styles.gained}>
            {t('+{{amount}} since you last looked', { amount: formatMoney(gained, region) })}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

/** Before set-up: the full demo drive past a petrol station, shops and a café. */
function FullIntro({
  code,
  season,
  skip,
  onDone,
}: {
  code: RegionCode;
  season: Season | null;
  skip: boolean;
  onDone: () => void;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
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
    // Gentle: a steady drive, easing in and out only a little.
    const easing = Easing.inOut(Easing.sin);
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

  useEffect(() => {
    if (!skip) return;
    fade.set(
      withTiming(0, { duration: 180 }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
  }, [skip, fade, onDone]);

  // The counter ticks in tenths, so only re-render when the shown value changes.
  useAnimatedReaction(
    () => Math.round(drive.value * STEPS),
    (step, previous) => {
      if (step !== previous) scheduleOnRN(setShown, step / STEPS);
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
    transform: [{ translateY: -LOGO_LIFT * grow.value }, { scale: 1 + (GROWN_SCALE - 1) * grow.value }],
  }));
  const counterStyle = useAnimatedStyle(() => ({
    opacity: grow.value,
    transform: [{ translateY: 12 * (1 - grow.value) }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const units = Math.round(shown * DEMO_MONTH[region.unit]);
  const distance = new Intl.NumberFormat(region.locale).format(units);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, fadeStyle]}>
      {season && <SeasonAmbient season={season.id} southern={code === 'AU'} />}
      <Animated.View style={logoStyle}>
        <SeasonalLeaf season={season} unpavedProps={unpavedProps} carProps={carProps} />
        {season && hasRider(season.id) && (
          <SeasonRider season={season.id} drive={drive} size={SPLASH_SIZE} xs={roadXs} ys={roadYs} samples={SAMPLES} />
        )}
        {!reduceMotion && (
          <IntroScenery
            size={SPLASH_SIZE}
            drive={drive}
            roadAt={roadAt}
            glyphs={season ? SEASON_PLACES[season.id] : undefined}
            drop={season?.id === 'festive'}
          />
        )}
      </Animated.View>
      <Animated.View style={[styles.counter, counterStyle]}>
        {season && <Greeting text={season.greeting} />}
        <Text style={styles.money}>{formatMoney(Math.round(units * ratePerUnit), region)}</Text>
        <Text style={styles.distance}>
          {region.unit === 'mi'
            ? t('{{distance}} miles · a typical month of business driving', { count: units, distance })
            : t('{{distance}} km · a typical month of business driving', { count: units, distance })}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/** Seasonal stand-ins for the places along the road. */
const SEASON_PLACES: Partial<Record<Season['id'], readonly string[]>> = {
  festive: ['gift', 'gift', 'gift', 'gift', 'gift'],
  halloween: ['pumpkin', 'ghost', 'candy', 'pumpkin', 'ghost'],
};

/**
 * The season's line ("Autumn miles add up 🍂"), with the words centred and a
 * trailing emoji hung just outside them, so it doesn't pull the words left.
 */
function Greeting({ text }: { text: string }) {
  const match = /^(.*?)\s*(\p{Extended_Pictographic}[\p{Extended_Pictographic}\u200d\ufe0f]*)$/u.exec(text);
  if (!match) return <Text style={styles.greeting}>{text}</Text>;
  return (
    <View style={styles.greetingRow}>
      <Text style={styles.greeting}>{match[1]}</Text>
      <Text style={[styles.greeting, styles.greetingEmoji]}>{match[2]}</Text>
    </View>
  );
}

/** The logo with the road being laid, the car (unless a rider stands in) and the season's hat. */
function SeasonalLeaf({
  season,
  unpavedProps,
  carProps,
}: {
  season: Season | null;
  unpavedProps: Partial<{ strokeDashoffset: number }>;
  carProps: Partial<{ cx: number; cy: number }>;
}) {
  return (
    <LeafMark size={SPLASH_SIZE} car={false} bleed={season !== null} palette={season?.id === 'autumn' ? 'autumn' : 'mint'}>
      <AnimatedPath
        d={ROAD_PATH}
        stroke="#064E3B"
        strokeWidth={16}
        fill="none"
        strokeDasharray={[roadLength, roadLength]}
        animatedProps={unpavedProps}
      />
      {!(season && hasRider(season.id)) && (
        <AnimatedCircle r={58} fill="#FACC15" stroke="#FFFFFF" strokeWidth={16} animatedProps={carProps} />
      )}
      {season && <SeasonHat season={season.id} />}
    </LeafMark>
  );
}

const styles = StyleSheet.create({
  layer: { zIndex: 10 },
  greeting: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  greetingRow: { alignItems: 'center' },
  greetingEmoji: { position: 'absolute', left: '100%', marginLeft: 6 },
  gained: { color: '#FACC15', fontSize: 15, fontWeight: '700', marginTop: 6 },
  container: {
    backgroundColor: INTRO_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  counter: { position: 'absolute', top: '50%', marginTop: COUNTER_TOP, alignItems: 'center', gap: 2 },
  money: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] },
  distance: {
    color: '#FACC15',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    maxWidth: 300,
  },
});
