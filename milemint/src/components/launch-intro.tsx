import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { STEM_SAMPLES, STEM_XS, STEM_YS, stemAt } from '@/brand/sprout';
import { phoneRegion } from '@/components/country-options';
import { GrowingSprout } from '@/components/growing-sprout';
import { IntroScenery } from '@/components/intro-scenery';
import { LeafMark, SproutSeed } from '@/components/leaf-mark';
import { SeasonAmbient } from '@/components/season/ambient';
import { SeasonHat } from '@/components/season/hats';
import { hasRider, SeasonRider } from '@/components/season/rider';
import { DEMO_TODAY } from '@/dev/demo';
import {
  formatDistance,
  formatMoney,
  ratePeriodFor,
  REGIONS,
  type RegionCode,
} from '@/domain/regions';
import { type Season, seasonFor } from '@/domain/seasons';
import { toLocalIsoDate } from '@/domain/trip';
import { useT } from '@/i18n/i18n';
import { type LaunchTotals, markTotalSeen, recallGoldLeaves, recallRegion, recallTotals } from '@/region/remembered-region';

/**
 * Plays on every launch while the app opens underneath: the seed (the logo's
 * yellow dot) wakes in its soil and climbs, the road growing up beneath it as
 * the sprout's stem and laying the lane markings behind it, past a petrol
 * station, shops and a café. Each leaf springs open as the car passes its
 * node, and the last one as the car lands at the top, while the miles and
 * their tax value count up in the user's currency. Starts exactly where the
 * native splash screen leaves off (same colour, and the seed at the same size
 * and position), and ends on the logo itself (see components/growing-sprout).
 */

/** Matches the splash screen in app.json. */
export const INTRO_BACKGROUND = '#0B7A55';
/** The splash icon is drawn 120pt wide. */
const SPLASH_SIZE = 120;
const GROWN_SCALE = 1.5;
/**
 * The grown sprout and the total under it are centred as one group: the sprout
 * rises this far and the total starts COUNTER_TOP below the middle, so the
 * gap between them is small and the pair sits in the middle of the screen.
 */
const LOGO_LIFT = 66;
const COUNTER_TOP = 40;

/** The first launch: slow enough to watch the sprout grow, each sign and leaf in turn. */
const DRIVE_MS = 4400;
const HOLD_MS = 1500;
/** Every launch after: the sprout grows as their own money and miles count up, at the same unhurried pace. */
const QUICK_DRIVE_MS = 4400;
/** The total stays up, still, long enough to read and take in. */
const QUICK_HOLD_MS = 2000;
/** A little longer to enjoy the seasonal touches. */
const SEASON_HOLD_MS = 2200;
const FADE_MS = 300;
/** The seed breaking out of the soil before the climb: longer the first time. */
const EMERGE_MS = 1000;
const QUICK_EMERGE_MS = 1000;
/** How far in (extra scale) the view moves onto the soil as the seed breaks out… */
const EMERGE_ZOOM = 1.2;
/** …keeping the soil, this far below the logo's centre, where it is. */
const SOIL_BELOW = SPLASH_SIZE * 0.38;

/** The extra zoom onto the soil: in while the seed breaks out, back out as the climb begins. */
function zoomFor(emerge: number, drive: number) {
  'worklet';
  const zoomIn = emerge * emerge * (3 - 2 * emerge);
  const back = Math.min(1, drive / 0.3);
  return EMERGE_ZOOM * zoomIn * (1 - back * back * (3 - 2 * back));
}
/** Reduce Motion: the seed cross-fades to the finished logo instead of growing. */
const CROSS_FADE_MS = 200;
/**
 * Reanimated jumps animations to their end under Reduce Motion, which would
 * skip the opening altogether; the cross-fade and fade are gentle enough to keep.
 */
const ALWAYS = ReduceMotion.Never;
/** The drive the counter shows. */
/**
 * The demo counts up a typical month of business driving (about 400 miles or
 * 650 km): big enough to show what's at stake, labelled so it promises nothing.
 */
const DEMO_MONTH = { mi: 400, km: 650 } as const;
/** The demo counter moves in 1% steps: smooth to the eye without hundreds of re-renders. */
const STEPS = 100;

/**
 * Opening sequence. Before set-up: the full demo drive (about 7 s) that
 * shows what MileSprout does. Once set up: the same pace (about 7.5 s) where
 * the sprout grows as the user's own tax-year money and distance count up
 * from zero, so every launch is a reminder of the money coming back. A tap
 * skips either.
 */
export function LaunchIntro({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [mode, setMode] = useState<{ quick: LaunchTotals | null; code: RegionCode; gold: boolean } | null>(null);
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    let current = true;
    // Both are read from the keychain in milliseconds; the splash screen covers the wait.
    Promise.all([recallRegion(), recallTotals(), recallGoldLeaves()]).then(
      ([remembered, totals, gold]) =>
        current &&
        setMode({
          code: remembered ?? phoneRegion(),
          gold,
          // Real money to show: until the first business trip, keep the demo drive.
          quick: remembered && totals && totals.total > 0 ? totals : null,
        }),
      () => current && setMode({ code: phoneRegion(), quick: null, gold: false }),
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
      accessibilityLabel={t('MileSprout. Tap to skip')}
      onPress={() => setSkip(true)}
      style={[StyleSheet.absoluteFill, styles.layer]}>
      {mode === null ? (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
          <SproutSeed size={SPLASH_SIZE} />
        </View>
      ) : mode.quick ? (
        <QuickIntro code={mode.code} season={season} gold={mode.gold} totals={mode.quick} skip={skip} onDone={onDone} />
      ) : (
        <FullIntro code={mode.code} season={season} skip={skip} onDone={onDone} />
      )}
    </Pressable>
  );
}

/** After set-up: the car zips up the sprout while their own total counts up. */
function QuickIntro({
  code,
  season,
  gold,
  totals,
  skip,
  onDone,
}: {
  code: RegionCode;
  season: Season | null;
  /** Gold leaves, earned by inviting friends (the Earnings by platform perk). */
  gold: boolean;
  totals: LaunchTotals;
  skip: boolean;
  onDone: () => void;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const region = REGIONS[code];
  // Grows from nothing every time; what's new since last time is called out below it.
  const gained = totals.total - Math.max(0, Math.min(totals.seen, totals.total));
  const meters = totals.meters ?? 0;
  // With Reduce Motion the same value runs the short cross-fade instead of the climb.
  const emerge = useSharedValue(reduceMotion ? 1 : 0);
  const drive = useSharedValue(0);
  const fade = useSharedValue(1);
  const [shown, setShown] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    // Gentle: a steady climb, easing in and out only a little, as on the first launch.
    const easing = reduceMotion ? Easing.linear : Easing.inOut(Easing.sin);
    const drivingFor = reduceMotion ? CROSS_FADE_MS : QUICK_DRIVE_MS;
    const lead = 80 + (reduceMotion ? 0 : QUICK_EMERGE_MS);
    if (!reduceMotion) emerge.value = withDelay(80, withTiming(1, { duration: QUICK_EMERGE_MS, easing: Easing.linear }));
    drive.value = withDelay(lead, withTiming(1, { duration: drivingFor, easing, reduceMotion: ALWAYS }), ALWAYS);
    fade.value = withDelay(
      lead + drivingFor + (season ? SEASON_HOLD_MS : QUICK_HOLD_MS),
      withTiming(0, { duration: FADE_MS, reduceMotion: ALWAYS }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
      ALWAYS,
    );
    markTotalSeen(totals);
  }, [emerge, drive, fade, onDone, reduceMotion, totals, season]);

  useEffect(() => {
    if (!skip) return;
    fade.set(
      withTiming(0, { duration: 180 }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
  }, [skip, fade, onDone]);

  // The counters move in 1% steps, so only re-render when the shown value changes.
  useAnimatedReaction(
    () => Math.round(drive.value * STEPS),
    (step, previous) => {
      // Reduce Motion shows the totals straight away, without counting.
      if (step !== previous && !reduceMotion) scheduleOnRN(setShown, step / STEPS);
    },
  );

  const logoStyle = useAnimatedStyle(() => {
    const grow = reduceMotion ? 1 : Math.min(1, drive.value / 0.6);
    return {
      opacity: reduceMotion ? drive.value : 1,
      transform: [
        { translateY: -LOGO_LIFT * grow - SOIL_BELOW * zoomFor(emerge.value, drive.value) },
        { scale: 1 + (GROWN_SCALE - 1) * grow + zoomFor(emerge.value, drive.value) },
      ],
    };
  });
  // In once the view has pulled back from the soil, so it never overlaps the burst.
  const counterStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, (drive.value - 0.15) * 4)) }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, fadeStyle]}>
      {season && <SeasonAmbient season={season.id} southern={code === 'AU'} />}
      {reduceMotion && <Seed drive={drive} />}
      <Animated.View style={logoStyle}>
        <SeasonalSprout season={season} gold={gold} emerge={emerge} drive={drive} reduceMotion={reduceMotion} />
        {season && hasRider(season.id) && !reduceMotion && (
          <SeasonRider
            season={season.id}
            drive={drive}
            size={SPLASH_SIZE}
            xs={STEM_XS}
            ys={STEM_YS}
            samples={STEM_SAMPLES}
          />
        )}
        {/* The signs beside the road, as on the first launch, in every country and season. */}
        {!reduceMotion && (
          <IntroScenery
            size={SPLASH_SIZE}
            drive={drive}
            roadAt={stemAt}
            glyphs={season ? SEASON_PLACES[season.id] : undefined}
            drop={season?.id === 'festive'}
          />
        )}
      </Animated.View>
      <Animated.View style={[styles.counter, counterStyle]}>
        {season && <Greeting text={season.greeting} />}
        <Text style={styles.money}>{formatMoney(Math.round(totals.total * shown), region)}</Text>
        <Text style={styles.distance}>{t('found this tax year')}</Text>
        {meters > 0 && (
          <Text style={styles.distance}>
            {t('{{distance}} of business driving', {
              distance: formatDistance(meters * shown, region, { whole: true }),
            })}
          </Text>
        )}
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

  // With Reduce Motion `drive` runs the short cross-fade instead of the climb.
  const emerge = useSharedValue(reduceMotion ? 1 : 0);
  const drive = useSharedValue(0);
  const grow = useSharedValue(reduceMotion ? 1 : 0);
  const fade = useSharedValue(1);
  const [shown, setShown] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    // Gentle: a steady drive, easing in and out only a little.
    const easing = reduceMotion ? Easing.linear : Easing.inOut(Easing.sin);
    const lead = reduceMotion ? 0 : 120 + EMERGE_MS;
    const drivingFor = reduceMotion ? CROSS_FADE_MS : DRIVE_MS;
    if (!reduceMotion) emerge.value = withDelay(120, withTiming(1, { duration: EMERGE_MS, easing: Easing.linear }));
    if (!reduceMotion) grow.value = withDelay(lead, withTiming(1, { duration: drivingFor * 0.6, easing }));
    drive.value = withDelay(lead, withTiming(1, { duration: drivingFor, easing, reduceMotion: ALWAYS }), ALWAYS);
    fade.value = withDelay(
      // Without the climb, the finished logo holds as long as the quick opening's.
      lead + drivingFor + (reduceMotion ? QUICK_HOLD_MS : HOLD_MS),
      withTiming(0, { duration: FADE_MS, reduceMotion: ALWAYS }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
      ALWAYS,
    );
  }, [emerge, drive, grow, fade, onDone, reduceMotion]);

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
      if (step !== previous && !reduceMotion) scheduleOnRN(setShown, step / STEPS);
    },
  );

  const logoStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? drive.value : 1,
    transform: [
      { translateY: -LOGO_LIFT * grow.value - SOIL_BELOW * zoomFor(emerge.value, drive.value) },
      { scale: 1 + (GROWN_SCALE - 1) * grow.value + zoomFor(emerge.value, drive.value) },
    ],
  }));
  // In once the view has pulled back from the soil, so it never overlaps the burst.
  const counterStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, (grow.value - 0.3) / 0.7),
    transform: [{ translateY: 12 * (1 - grow.value) }],
  }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const units = Math.round(shown * DEMO_MONTH[region.unit]);
  const distance = new Intl.NumberFormat(region.locale).format(units);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, fadeStyle]}>
      {season && <SeasonAmbient season={season.id} southern={code === 'AU'} />}
      {reduceMotion && <Seed drive={drive} />}
      <Animated.View style={logoStyle}>
        <SeasonalSprout season={season} emerge={emerge} drive={drive} reduceMotion={reduceMotion} />
        {season && hasRider(season.id) && !reduceMotion && (
          <SeasonRider
            season={season.id}
            drive={drive}
            size={SPLASH_SIZE}
            xs={STEM_XS}
            ys={STEM_YS}
            samples={STEM_SAMPLES}
          />
        )}
        {!reduceMotion && (
          <IntroScenery
            size={SPLASH_SIZE}
            drive={drive}
            roadAt={stemAt}
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

/** Seasonal stand-ins for the signs along the road. */
const SEASON_PLACES: Partial<Record<Season['id'], readonly string[]>> = {
  festive: ['gift', 'gift', 'gift'],
  halloween: ['pumpkin', 'ghost', 'candy'],
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

/**
 * The sprout growing (or, with Reduce Motion, already grown), the car unless a
 * rider stands in, the season's hat and autumn's colours, or gold leaves for
 * a driver who earned them by inviting friends.
 */
function SeasonalSprout({
  season,
  gold = false,
  emerge,
  drive,
  reduceMotion,
}: {
  season: Season | null;
  gold?: boolean;
  emerge: SharedValue<number>;
  drive: SharedValue<number>;
  reduceMotion: boolean;
}) {
  const palette = gold ? 'gold' : season?.id === 'autumn' ? 'autumn' : 'mint';
  const hat = season ? <SeasonHat season={season.id} /> : undefined;
  if (reduceMotion) {
    return (
      <LeafMark size={SPLASH_SIZE} bleed={season !== null} palette={palette}>
        {hat}
      </LeafMark>
    );
  }
  return (
    <GrowingSprout
      size={SPLASH_SIZE}
      emerge={emerge}
      drive={drive}
      palette={palette}
      car={!(season && hasRider(season.id))}
      hat={hat}
    />
  );
}

/** Reduce Motion: the splash screen's seed, fading out as the finished logo fades in over it. */
function Seed({ drive }: { drive: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: 1 - drive.value }));
  return (
    <Animated.View style={[styles.seed, style]}>
      <SproutSeed size={SPLASH_SIZE} />
    </Animated.View>
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
  seed: { position: 'absolute' },
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
