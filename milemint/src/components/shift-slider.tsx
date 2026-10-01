import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';

const HEIGHT = 68;
const THUMB = 56;
const PAD = (HEIGHT - THUMB) / 2;
/** How far (0–1 of the track) the thumb must travel before letting go counts. */
const COMMIT = 0.78;
/** A new sparkle or leaf every this many points of travel. */
const SPAWN_EVERY = 13;
const POOL = 18;

/**
 * Particle kinds:
 * - star: twinkles off the trail while swiping on (energetic, gold)
 * - burst: radiates from the thumb when a shift starts
 * - leaf: drifts down and settles while swiping off (calm: the day is done)
 */
const STAR = 0;
const BURST = 1;
const LEAF = 2;
const LIFE = [850, 750, 1500];

type Particle = { x: number; at: number; kind: number; seed: number };
const EMPTY: Particle = { x: 0, at: -1e9, kind: STAR, seed: 0 };

/**
 * The shift switch: one bar that is swiped right to start a shift and back
 * left to end it. Starting is a little celebration (the bar fills with green
 * behind the thumb and gold stars spark off the trail, then burst); ending is
 * a wind-down (the green drains and mint leaves drift down and settle).
 *
 * Swiping, not tapping, so a shift can't start or end from a pocket. With
 * Reduce Motion on, the particles are skipped and only the colour changes;
 * VoiceOver users double-tap.
 */
export function ShiftSlider({
  on,
  offLabel,
  onTitle,
  onSubtitle,
  endHint,
  accessibilityLabel,
  accessibilityHint,
  onStart,
  onEnd,
}: {
  on: boolean;
  offLabel: string;
  onTitle: string;
  onSubtitle: string;
  /** e.g. "Swipe back to end" */
  endHint: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  onStart: () => void;
  onEnd: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const travel = Math.max(1, width - THUMB - PAD * 2);

  const x = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const dragging = useSharedValue(false);
  const lastSpawn = useSharedValue(0);
  const lastQuarter = useSharedValue(0);
  const cursor = useSharedValue(0);
  const clock = useSharedValue(0);
  const particles = useSharedValue<Particle[]>(Array.from({ length: POOL }, () => EMPTY));
  const nudge = useSharedValue(0);
  const glow = useSharedValue(0);

  // Particles only need a clock while they're alive; stop it shortly after.
  const frames = useFrameCallback((frame) => {
    clock.value = frame.timestamp;
  }, false);
  const [touching, setTouching] = useState(false);
  const [settles, setSettles] = useState(0);
  const wake = () => {
    setTouching(true);
    if (!reduceMotion) frames.setActive(true);
  };
  const sleepSoon = () => {
    setTouching(false);
    setSettles((n) => n + 1);
  };
  useEffect(() => {
    if (touching) return;
    const timer = setTimeout(() => frames.setActive(false), 1800);
    return () => clearTimeout(timer);
  }, [touching, settles, frames]);

  // Rest at the right end while on shift, the left end while off.
  useEffect(() => {
    if (width === 0 || dragging.get()) return;
    x.set(reduceMotion ? (on ? travel : 0) : withSpring(on ? travel : 0, { damping: 18, stiffness: 160 }));
  }, [on, travel, width, reduceMotion, x, dragging]);

  // Off shift: the thumb gives a little hop every few seconds to invite a swipe.
  useEffect(() => {
    if (reduceMotion || on) {
      nudge.value = 0;
      return;
    }
    nudge.value = withRepeat(
      withSequence(
        withDelay(2600, withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) })),
        withSpring(0, { damping: 6, stiffness: 180 }),
      ),
      -1,
      false,
    );
  }, [on, reduceMotion, nudge]);

  // On shift: a slow breathing glow, so it's obvious at a glance that it's running.
  useEffect(() => {
    glow.value = on && !reduceMotion ? withRepeat(withTiming(1, { duration: 2200 }), -1, true) : withTiming(0);
  }, [on, reduceMotion, glow]);

  const haptic = (kind: 'tick' | 'start' | 'end' | 'leaf') => {
    if (Platform.OS === 'web') return;
    if (kind === 'tick') Haptics.selectionAsync().catch(() => {});
    else if (kind === 'start') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else if (kind === 'end') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  const started = () => {
    haptic('start');
    onStart();
    sleepSoon();
  };
  const ended = () => {
    haptic('end');
    onEnd();
    sleepSoon();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onBegin(() => {
      dragging.set(true);
      dragStart.value = x.value;
      lastSpawn.value = x.value;
      lastQuarter.value = Math.round((x.value / travel) * 4);
      scheduleOnRN(wake);
    })
    .onUpdate((event) => {
      const next = Math.min(travel, Math.max(0, dragStart.value + event.translationX));
      const forward = next > x.value;
      x.set(next);
      // A haptic click at each quarter of the way, in either direction.
      const quarter = Math.round((next / travel) * 4);
      if (quarter !== lastQuarter.value) {
        lastQuarter.value = quarter;
        scheduleOnRN(haptic, on ? 'leaf' : 'tick');
      }
      if (!reduceMotion && Math.abs(next - lastSpawn.value) >= SPAWN_EVERY) {
        lastSpawn.value = next;
        // Stars when swiping towards "on", leaves when swiping back to "off".
        const kind = on || !forward ? LEAF : STAR;
        const slot = cursor.value % POOL;
        cursor.value += 1;
        const now = clock.value;
        particles.modify((list) => {
          'worklet';
          list[slot] = { x: next + PAD + THUMB / 2, at: now, kind, seed: Math.random() };
          return list;
        });
      }
    })
    .onEnd(() => {
      const progress = x.value / travel;
      if (!on && progress >= COMMIT) {
        x.set(withTiming(travel, { duration: 140 }));
        if (!reduceMotion) {
          const now = clock.value;
          const center = travel + PAD + THUMB / 2;
          particles.modify((list) => {
            'worklet';
            for (let i = 0; i < 10; i++) {
              const slot = cursor.value % POOL;
              cursor.value += 1;
              list[slot] = { x: center, at: now, kind: BURST, seed: i / 10 };
            }
            return list;
          });
        }
        scheduleOnRN(started);
      } else if (on && progress <= 1 - COMMIT) {
        x.set(withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) }));
        scheduleOnRN(ended);
      } else {
        // Not far enough: spring back to where it was.
        x.set(withSpring(on ? travel : 0, { damping: 14, stiffness: 180 }));
        scheduleOnRN(sleepSoon);
      }
    })
    .onFinalize(() => {
      dragging.set(false);
    });

  const progress = (v: number) => {
    'worklet';
    return v / travel;
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value + nudge.value * 18 }, { scale: dragging.value ? 1.06 : 1 }],
  }));
  // Green fills in behind the thumb as it slides on, and drains as it slides back.
  const fillStyle = useAnimatedStyle(() => ({ width: x.value + THUMB + PAD * 2 }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.18 * glow.value * progress(x.value) }));
  const offLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0, 0.45], [1, 0], 'clamp'),
  }));
  const onLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0.85, 1], [0, 1], 'clamp'),
  }));
  const playStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress(x.value), [0.4, 0.7], [1, 0], 'clamp') }));
  const stopStyle = useAnimatedStyle(() => ({ opacity: interpolate(progress(x.value), [0.4, 0.7], [0, 1], 'clamp') }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => (on ? ended() : started())}
      onPress={() => {
        if (reduceMotion || on) return;
        nudge.set(withSequence(withTiming(1.6, { duration: 180 }), withSpring(0, { damping: 6, stiffness: 180 })));
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.track}>
      {/* Resting colour: pale mint with a green outline. */}
      <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none" />

      <Animated.View style={[styles.fill, fillStyle]} pointerEvents="none">
        <View style={{ width: Math.max(width, 1), height: HEIGHT }}>
          <BrandGradient />
          <View style={styles.leafWatermark}>
            <LeafMark size={120} opacity={0.14} />
          </View>
        </View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.glow, glowStyle]} />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.offLabel, offLabelStyle]}>
        <Text style={styles.offText}>{offLabel}</Text>
        <Chevrons />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.onLabel, onLabelStyle]}>
        <Text style={styles.onTitle} numberOfLines={1}>
          {onTitle}
        </Text>
        <Text style={styles.onSub} numberOfLines={1}>
          {onSubtitle}
        </Text>
        <Text style={styles.endHint}>‹ {endHint}</Text>
      </Animated.View>

      {!reduceMotion &&
        Array.from({ length: POOL }, (_, slot) => (
          <Spark key={slot} slot={slot} particles={particles} clock={clock} />
        ))}

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Animated.Text style={[styles.thumbIcon, styles.play, playStyle]}>▶</Animated.Text>
          <Animated.View style={[styles.stop, stopStyle]} />
        </Animated.View>
      </GestureDetector>
    </Pressable>
  );
}

/** One pooled particle: a gold star, a burst star or a mint leaf. */
function Spark({ slot, particles, clock }: { slot: number; particles: SharedValue<Particle[]>; clock: SharedValue<number> }) {
  const star = useAnimatedStyle(() => {
    const p = particles.value[slot];
    const t = (clock.value - p.at) / LIFE[p.kind];
    if (p.kind === LEAF || t < 0 || t > 1) return { opacity: 0 };
    if (p.kind === BURST) {
      const angle = p.seed * Math.PI * 2;
      const reach = 46 * Easing.out(Easing.cubic)(t);
      return {
        opacity: 1 - t,
        transform: [
          { translateX: p.x + Math.cos(angle) * reach - 8 },
          { translateY: HEIGHT / 2 + Math.sin(angle) * reach * 0.8 - 10 },
          { scale: 1.2 - 0.6 * t },
          { rotate: `${t * 160}deg` },
        ],
      };
    }
    // Trail star: pops, twinkles and floats up or down a little off the line.
    const drift = (p.seed - 0.5) * 44;
    const pop = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;
    return {
      opacity: pop,
      transform: [
        { translateX: p.x - 18 - t * 10 - 8 },
        { translateY: HEIGHT / 2 + drift * Easing.out(Easing.quad)(t) - 10 },
        { scale: 0.5 + 0.8 * pop },
        { rotate: `${(p.seed > 0.5 ? 1 : -1) * t * 220}deg` },
      ],
    };
  });
  const leaf = useAnimatedStyle(() => {
    const p = particles.value[slot];
    const t = (clock.value - p.at) / LIFE[p.kind];
    if (p.kind !== LEAF || t < 0 || t > 1) return { opacity: 0 };
    // Drifts down with a gentle side-to-side sway, then settles and fades.
    const sway = Math.sin(t * Math.PI * 2.2 + p.seed * 6) * 8;
    return {
      opacity: t < 0.15 ? t / 0.15 : 1 - Math.max(0, (t - 0.6) / 0.4),
      transform: [
        { translateX: p.x + 10 + sway - 9 },
        { translateY: 6 + Easing.out(Easing.quad)(t) * (HEIGHT - 26) },
        { rotate: `${-30 + sway * 4 + p.seed * 40}deg` },
        { scale: 0.8 + p.seed * 0.4 },
      ],
    };
  });
  return (
    <>
      <Animated.Text pointerEvents="none" style={[styles.spark, star]}>
        ✦
      </Animated.Text>
      <Animated.View pointerEvents="none" style={[styles.leafParticle, leaf]}>
        <LeafMark size={18} car={false} />
      </Animated.View>
    </>
  );
}

/** Three arrows lighting up left to right: "this way". */
function Chevrons() {
  const reduceMotion = useReducedMotion();
  const shimmer = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) shimmer.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false);
  }, [shimmer, reduceMotion]);
  return (
    <View style={styles.chevrons}>
      {[0, 1, 2].map((i) => (
        <Chevron key={i} index={i} shimmer={shimmer} />
      ))}
    </View>
  );
}

function Chevron({ index, shimmer }: { index: number; shimmer: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const phase = (shimmer.value * 3 - index + 3) % 3;
    return { opacity: 0.35 + 0.65 * Math.max(0, 1 - Math.abs(phase - 0.5) * 1.6) };
  });
  return <Animated.Text style={[styles.chevron, style]}>›</Animated.Text>;
}

const GREEN = '#0B7A55';

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  base: { backgroundColor: '#E8F6EF', borderRadius: HEIGHT / 2, borderWidth: 2, borderColor: GREEN },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: HEIGHT / 2, overflow: 'hidden' },
  leafWatermark: { position: 'absolute', right: -40, top: -14 },
  glow: { backgroundColor: '#FACC15' },
  offLabel: {
    position: 'absolute',
    left: THUMB + PAD * 2,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  offText: { color: GREEN, fontSize: 17, fontWeight: '800' },
  chevrons: { flexDirection: 'row' },
  chevron: { color: GREEN, fontSize: 26, lineHeight: 28, fontWeight: '800', marginLeft: -2 },
  onLabel: { position: 'absolute', left: 22, right: THUMB + PAD * 2 + 8 },
  onTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  onSub: { color: '#D1FAE5', fontSize: 13 },
  endHint: { color: '#FDE68A', fontSize: 11, fontWeight: '700', marginTop: 1 },
  spark: { position: 'absolute', left: 0, top: 0, color: '#FACC15', fontSize: 18, textShadowColor: '#FDE68A', textShadowRadius: 6 },
  leafParticle: { position: 'absolute', left: 0, top: 0 },
  thumb: {
    position: 'absolute',
    left: PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FACC15',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: { position: 'absolute' },
  play: { color: '#064E3B', fontSize: 19, marginLeft: 3 },
  stop: { position: 'absolute', width: 16, height: 16, borderRadius: 3, backgroundColor: '#064E3B' },
});
