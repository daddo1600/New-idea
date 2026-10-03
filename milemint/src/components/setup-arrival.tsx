import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { GrowingSprout } from '@/components/growing-sprout';
import { LeafMark } from '@/components/leaf-mark';
import { Spacing } from '@/constants/theme';
import { msg, useT } from '@/i18n/i18n';

/**
 * "You're all set." as an arrival, once the "YOU DID IT!" overlay closes: the
 * sprout grows big, the tiles of what's set up pop in one by one, then a
 * little road draws "what happens next" and the car rolls along it. Reduce
 * Motion shows each part's final frame.
 */

const SPROUT_MS = 1100;
/** The tiles start popping in this long after the sprout starts growing… */
const TILES_FROM = 600;
/** …one after another… */
const TILE_STAGGER = 90;
/** …each tick landing a moment after its tile. */
const TICK_AFTER = 120;
const ROAD_MS = 900;
const CAR_MS = 1000;

/** When the timeline's road starts drawing: once the last tile has landed. */
function roadFrom(tiles: number) {
  return TILES_FROM + tiles * TILE_STAGGER + 300;
}

/** How long the whole arrival takes, so the button's sparkle starts as it ends. */
export function arrivalMs(tiles: number, timeline: boolean) {
  return timeline ? roadFrom(tiles) + ROAD_MS + CAR_MS : roadFrom(tiles);
}

function clamp01(x: number): number {
  'worklet';
  return Math.min(1, Math.max(0, x));
}

/** A spring-like pop: past full size a little, then settles. */
function pop(x: number): number {
  'worklet';
  const c = 1.9;
  const b = x - 1;
  return 1 + (c + 1) * b * b * b + c * b * b;
}

/** The hero: the sprout grows to full size (the overlay's small one, now big), with a gold ring once. */
export function ArrivalSprout({ start }: { start: boolean }) {
  const reduceMotion = useReducedMotion();
  const emerge = useSharedValue(1);
  const drive = useSharedValue(0);
  const ring = useSharedValue(0);
  useEffect(() => {
    if (!start || reduceMotion) return;
    drive.set(withTiming(1, { duration: SPROUT_MS, easing: Easing.inOut(Easing.cubic) }));
    ring.set(withDelay(SPROUT_MS - 250, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [start, reduceMotion, drive, ring]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value === 0 ? 0 : 1 - ring.value,
    transform: [{ scale: 0.6 + ring.value * 0.9 }],
  }));
  return (
    <View style={styles.hero} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {!reduceMotion && <Animated.View style={[styles.ring, ringStyle]} />}
      {reduceMotion ? (
        <LeafMark size={HERO} />
      ) : (
        <GrowingSprout size={HERO} emerge={emerge} drive={drive} palette="mint" car />
      )}
    </View>
  );
}

const HERO = 150;

export type SetupTile = {
  key: string;
  icon: string;
  label: string;
  /** A gold tick when set up; a gold "!" when it still needs something. */
  ok: boolean;
  onPress?: () => void;
};

/** What's set up, as glass tiles in two columns that pop in one by one (the last spans both if odd). */
export function SetupTiles({ tiles, start }: { tiles: SetupTile[]; start: boolean }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!start || reduceMotion || Platform.OS === 'web' || tiles.length === 0) return;
    // One light tap as the last tile lands.
    const timer = setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
      TILES_FROM + (tiles.length - 1) * TILE_STAGGER + 200,
    );
    return () => clearTimeout(timer);
    // Once per arrival, with the tiles there were then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, reduceMotion]);
  // Until the overlay closes the space is kept, so nothing jumps when they pop in.
  return (
    <View style={styles.tiles}>
      {tiles.map((tile, i) => {
        const wide = tiles.length % 2 === 1 && i === tiles.length - 1;
        const delay = TILES_FROM + i * TILE_STAGGER;
        // The gold "!" isn't read out: the label says so instead.
        const label = tile.ok ? tile.label : `${tile.label}${/[.。।]$/.test(tile.label) ? ' ' : '. '}${t('Needs attention')}`;
        const body = (
          <>
            <Text style={styles.tileIcon}>{tile.icon}</Text>
            <Text style={styles.tileLabel} numberOfLines={3}>
              {tile.label}
            </Text>
            <Animated.View
              entering={reduceMotion ? undefined : ZoomIn.springify().damping(14).delay(delay + TICK_AFTER)}
              style={[styles.badge, !tile.ok && styles.badgeWarn]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              <Text style={styles.badgeText}>{tile.ok ? '✓' : '!'}</Text>
            </Animated.View>
          </>
        );
        return (
          <View key={tile.key} style={[styles.tileSlot, wide && styles.tileWide]}>
            {start && (
              <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify().damping(14).delay(delay)}>
                {tile.onPress ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={tile.onPress}
                    style={styles.tile}>
                    {body}
                  </Pressable>
                ) : (
                  <View accessible accessibilityLabel={label} style={styles.tile}>
                    {body}
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const NODES = [
  { icon: '🚗', label: msg('Drive') },
  { icon: '🅿️', label: msg('Park') },
  { icon: '✨', label: msg('It appears') },
  { icon: '👉', label: msg('Swipe “Work”') },
] as const;
const NODE = 44;
const CAR = 14;

/**
 * "What happens next": drive, park, it appears, swipe it to Work, as stops on
 * a little road. The road draws itself once the tiles have landed, then the
 * car rolls along it and each stop pops as it passes. Reduce Motion: the road
 * and stops, no car. VoiceOver hears one sentence.
 */
export function NextTimeline({ start, tiles }: { start: boolean; tiles: number }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const road = useSharedValue(reduceMotion ? 1 : 0);
  const car = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!start || reduceMotion) return;
    const from = roadFrom(tiles);
    road.set(withDelay(from, withTiming(1, { duration: ROAD_MS, easing: Easing.out(Easing.cubic) })));
    car.set(withDelay(from + ROAD_MS, withTiming(1, { duration: CAR_MS, easing: Easing.inOut(Easing.cubic) })));
    // Once per arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, reduceMotion]);

  /** From the first stop's centre to the last's. */
  const span = (width * (NODES.length - 1)) / NODES.length;
  // Shares of a fixed track, so the animated styles never depend on the measured width.
  const roadStyle = useAnimatedStyle(() => ({ width: `${100 * road.value}%` }));
  const carStyle = useAnimatedStyle(() => ({
    opacity: car.value > 0 && car.value < 1 ? 1 : 0,
    left: `${100 * car.value}%`,
  }));

  return (
    <View
      style={styles.timeline}
      accessible
      accessibilityLabel={t('What happens next: drive, park, the trip appears, swipe it to Work.')}>
      <Text style={styles.heading}>{t('What happens next').toLocaleUpperCase()}</Text>
      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && (
          <View style={[styles.track, { left: width / NODES.length / 2, width: span }]}>
            <Animated.View style={[styles.road, roadStyle]}>
              <View style={[styles.lane, { width: span }]}>
                {Array.from({ length: Math.max(1, Math.floor(span / 18)) }, (_, i) => (
                  <View key={i} style={styles.dash} />
                ))}
              </View>
            </Animated.View>
            {!reduceMotion && <Animated.View style={[styles.car, carStyle]} />}
          </View>
        )}
        <View style={styles.nodes}>
          {NODES.map((node, i) => (
            <Stop
              key={node.label}
              icon={node.icon}
              label={t(node.label)}
              at={i / (NODES.length - 1)}
              road={road}
              car={car}
              still={!!reduceMotion}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/** One stop: shows once the road reaches it, and pops as the car passes. */
function Stop({
  icon,
  label,
  at,
  road,
  car,
  still,
}: {
  icon: string;
  label: string;
  at: number;
  road: SharedValue<number>;
  car: SharedValue<number>;
  still: boolean;
}) {
  const style = useAnimatedStyle(() => {
    if (still) return { opacity: 1, transform: [{ scale: 1 }] };
    const passed = clamp01((car.value - at + 0.04) / 0.18);
    return {
      opacity: road.value >= at - 0.02 ? 1 : 0.35,
      transform: [{ scale: 0.8 + 0.2 * pop(passed) }],
    };
  });
  return (
    <View style={styles.node}>
      <Animated.View style={[styles.circle, style]}>
        <Text style={styles.nodeIcon}>{icon}</Text>
      </Animated.View>
      <Text style={styles.nodeLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: HERO, height: HERO, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: HERO + 20,
    height: HERO + 20,
    borderRadius: (HERO + 20) / 2,
    borderWidth: 6,
    borderColor: '#FACC15',
  },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tileSlot: { flexBasis: '47%', flexGrow: 1, minHeight: 64 },
  tileWide: { flexBasis: '100%' },
  tile: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.three + 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileIcon: { fontSize: 22, lineHeight: 28 },
  tileLabel: { flex: 1, color: '#FFFFFF', fontSize: 15, lineHeight: 19, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: -6,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FACC15',
  },
  badgeWarn: { backgroundColor: '#FDE68A' },
  badgeText: { color: '#064E3B', fontSize: 12, lineHeight: 14, fontWeight: '900' },
  timeline: { gap: Spacing.two },
  heading: { color: '#FDE68A', fontSize: 13, fontWeight: '800', letterSpacing: 1.2 },
  track: { position: 'absolute', top: 0, height: NODE },
  road: {
    position: 'absolute',
    left: 0,
    top: NODE / 2 - 6,
    height: 12,
    borderRadius: 6,
    // Darker than the gradient's own bottom-right, with a light edge, so it reads to the last stop.
    backgroundColor: '#022C22',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  lane: { height: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  dash: { width: 8, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' },
  car: {
    position: 'absolute',
    top: NODE / 2 - CAR / 2,
    marginLeft: -CAR / 2,
    width: CAR,
    height: CAR,
    borderRadius: CAR / 2,
    backgroundColor: '#FACC15',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  nodes: { flexDirection: 'row' },
  node: { flex: 1, alignItems: 'center', gap: Spacing.one },
  circle: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F8A66',
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  nodeIcon: { fontSize: 20, lineHeight: 24 },
  nodeLabel: { color: '#D1FAE5', fontSize: 13, lineHeight: 17, textAlign: 'center', paddingHorizontal: 2 },
});
