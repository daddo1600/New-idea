import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Burst, Confetti } from '@/components/celebration';
import { GrowingSprout } from '@/components/growing-sprout';
import { LeafMark } from '@/components/leaf-mark';
import { Spacing } from '@/constants/theme';
import type { CheerKind } from '@/domain/setup-cheers';

const GOLD = '#FACC15';
const INK = '#064E3B';
/** The brand's greens, gold and cream, for the finish's confetti. */
const BRAND_CONFETTI = ['#0E9F6E', '#0B7A55', '#D1FAE5', GOLD, '#FBF7EE'];

/** How long each one stays before it fades by itself: longer the bigger it is. */
const SHOWN_MS: Record<CheerKind, number> = {
  thumbs: 1300,
  tracking: 1500,
  almost: 1600,
  done: 1600,
  thanks: 2200,
  backup: 1900,
};
const FADE_MS = 180;

/** Light taps for the small ones; Success for the big ones and the thank-you. */
function cheerHaptic(kind: CheerKind) {
  if (Platform.OS === 'web') return;
  if (kind === 'thumbs' || kind === 'tracking') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}

/**
 * A short celebration over the whole of its parent (set-up's welcome screen, or Settings):
 * `kind` picks the animation, `text` is said and shown. It closes by itself,
 * or at once on a tap, and never holds up what's underneath. Reduce Motion
 * shows only the text on a card, faded in.
 */
export function CelebrationOverlay({
  kind,
  text,
  onClose,
}: {
  kind: CheerKind;
  text: string;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const fade = useSharedValue(0);
  const latest = useRef(onClose);
  useEffect(() => {
    latest.current = onClose;
  }, [onClose]);

  useEffect(() => {
    cheerHaptic(kind);
    AccessibilityInfo.announceForAccessibility(text);
    fade.set(withTiming(1, { duration: reduceMotion ? 220 : 140 }));
    let closing: ReturnType<typeof setTimeout> | undefined;
    const shown = setTimeout(() => {
      fade.set(withTiming(0, { duration: FADE_MS }));
      closing = setTimeout(() => latest.current(), FADE_MS);
    }, SHOWN_MS[kind]);
    return () => {
      clearTimeout(shown);
      clearTimeout(closing);
    };
    // Once per celebration: a new one is a new element (keyed by the caller).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, fadeStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text}
        onPress={() => latest.current()}
        style={[StyleSheet.absoluteFill, styles.dim]}
      />
      <View style={styles.stage} pointerEvents="none">
        {reduceMotion ? (
          <View style={[styles.stillCard, kind === 'thanks' && styles.goldCard]}>
            <Text style={[styles.stillText, kind === 'thanks' && styles.goldText]}>{text}</Text>
          </View>
        ) : kind === 'thumbs' ? (
          <ThumbsUp text={text} />
        ) : kind === 'tracking' ? (
          <Sprouting text={text} />
        ) : kind === 'almost' ? (
          <AlmostDone text={text} />
        ) : kind === 'done' ? (
          <YouDidIt text={text} />
        ) : kind === 'backup' ? (
          <SafeInCloud text={text} />
        ) : (
          <ThankYou text={text} />
        )}
      </View>
    </Animated.View>
  );
}

/** Rises into place a moment after the picture, so the two read in turn. */
function Headline({ text, delay, style }: { text: string; delay: number; style: object }) {
  const rise = useSharedValue(0);
  useEffect(() => {
    rise.set(withDelay(delay, withSpring(1, { mass: 1, damping: 14, stiffness: 220 })));
  }, [rise, delay]);
  const riseStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, rise.value * 1.4),
    transform: [{ translateY: 18 * (1 - rise.value) }, { scale: 0.85 + 0.15 * rise.value }],
  }));
  return <Animated.Text style={[style, riseStyle]}>{text}</Animated.Text>;
}

/** A ring that grows out from the middle and fades. */
function Ring({ size, color, delay, width }: { size: number; color: string; delay: number; width: number }) {
  const grow = useSharedValue(0);
  useEffect(() => {
    grow.set(withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [grow, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: grow.value === 0 ? 0 : 1 - grow.value,
    transform: [{ scale: 0.55 + grow.value * 1.1 }],
  }));
  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor: color, borderWidth: width },
        style,
      ]}
    />
  );
}

/** After the country: a thumbs-up springs in with a wiggle, and a ring bursts out behind it. */
function ThumbsUp({ text }: { text: string }) {
  const pop = useSharedValue(0);
  const wiggle = useSharedValue(0);
  useEffect(() => {
    pop.set(withSpring(1, { mass: 1, damping: 9, stiffness: 200 }));
    wiggle.set(
      withDelay(
        220,
        withSequence(
          withTiming(-16, { duration: 110 }),
          withTiming(12, { duration: 120 }),
          withTiming(-7, { duration: 110 }),
          withTiming(0, { duration: 120 }),
        ),
      ),
    );
  }, [pop, wiggle]);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { rotate: `${wiggle.value}deg` }],
  }));
  return (
    <>
      <View style={styles.picture}>
        <Ring size={150} color={GOLD} delay={120} width={5} />
        <Ring size={150} color="#FFFFFF" delay={260} width={2} />
        <Burst style={styles.centre} count={14} reach={1.05} />
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeEmoji}>👍</Text>
        </Animated.View>
      </View>
      <Headline text={text} delay={160} style={styles.headline} />
    </>
  );
}

/** A backup made: the cloud springs in, rings burst out, and a gold tick lands on it. */
function SafeInCloud({ text }: { text: string }) {
  const pop = useSharedValue(0);
  const tick = useSharedValue(0);
  useEffect(() => {
    pop.set(withSpring(1, { mass: 1, damping: 10, stiffness: 190 }));
    tick.set(withDelay(380, withSpring(1, { mass: 1, damping: 8, stiffness: 260 })));
  }, [pop, tick]);
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const tickStyle = useAnimatedStyle(() => ({ transform: [{ scale: tick.value }], opacity: Math.min(1, tick.value * 2) }));
  return (
    <>
      <View style={styles.picture}>
        <Ring size={150} color={GOLD} delay={140} width={5} />
        <Ring size={150} color="#FFFFFF" delay={300} width={2} />
        <Burst style={styles.centre} count={14} reach={1.05} />
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeEmoji}>☁️</Text>
          <Animated.View style={[styles.tick, tickStyle]}>
            <Text style={styles.tickText}>✓</Text>
          </Animated.View>
        </Animated.View>
      </View>
      <Headline text={text} delay={260} style={styles.headline} />
    </>
  );
}

/** After tracking: the logo grows, the gold car climbing its road and laying the lane dashes. */
function Sprouting({ text }: { text: string }) {
  const emerge = useSharedValue(1);
  const drive = useSharedValue(0);
  const disc = useSharedValue(0);
  useEffect(() => {
    disc.set(withSpring(1, { mass: 1, damping: 14, stiffness: 200 }));
    drive.set(withDelay(80, withTiming(1, { duration: 1050, easing: Easing.inOut(Easing.cubic) })));
  }, [disc, drive]);
  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + 0.4 * disc.value }], opacity: disc.value }));
  return (
    <>
      <View style={styles.picture}>
        <Animated.View style={[styles.disc, discStyle]}>
          <GrowingSprout size={132} emerge={emerge} drive={drive} palette="mint" car />
        </Animated.View>
      </View>
      <Headline text={text} delay={420} style={styles.headline} />
    </>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_SIZE = 176;
const RING_STROKE = 14;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_R;

/** Entering the last question: a progress ring that nearly fills, and pulses. */
function AlmostDone({ text }: { text: string }) {
  const fill = useSharedValue(0.55);
  const pulse = useSharedValue(0);
  useEffect(() => {
    fill.set(withTiming(0.9, { duration: 750, easing: Easing.out(Easing.cubic) }));
    pulse.set(
      withDelay(
        500,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }),
          ),
          2,
        ),
      ),
    );
  }, [fill, pulse]);
  const arc = useAnimatedProps(() => ({ strokeDashoffset: RING_LENGTH * (1 - fill.value) }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.08 * pulse.value }] }));
  return (
    <>
      <Animated.View style={[styles.picture, pulseStyle]}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            stroke={GOLD}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${RING_LENGTH} ${RING_LENGTH}`}
            fill="none"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            animatedProps={arc}
          />
        </Svg>
        <View style={styles.ringMark}>
          <LeafMark size={84} />
        </View>
      </Animated.View>
      <Headline text={text} delay={120} style={[styles.headline, styles.shout, styles.goldShout]} />
    </>
  );
}

/** The finish: confetti over the whole screen, the logo popping in and a big headline. */
function YouDidIt({ text }: { text: string }) {
  const { width, height } = useWindowDimensions();
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.set(withSpring(1, { mass: 1, damping: 8, stiffness: 160 }));
  }, [pop]);
  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <>
      <View style={StyleSheet.absoluteFill}>
        <Confetti width={width} height={height} colors={BRAND_CONFETTI} count={90} duration={1700} />
      </View>
      <View style={styles.picture}>
        <Ring size={170} color={GOLD} delay={60} width={6} />
        <Burst style={styles.centre} count={24} reach={1.7} colors={BRAND_CONFETTI} />
        <Animated.View style={markStyle}>
          <LeafMark size={124} />
        </Animated.View>
      </View>
      <Headline text={text} delay={140} style={[styles.headline, styles.shout, styles.bigShout]} />
    </>
  );
}

/** Sparkles around the thank-you card, each twinkling in turn. */
const SPARKLES = [
  { left: '8%', top: '4%', size: 30, color: GOLD },
  { left: '70%', top: '-2%', size: 18, color: '#D1FAE5' },
  { left: '86%', top: '12%', size: 24, color: '#FFFFFF' },
  { left: '-3%', top: '72%', size: 22, color: '#FBF7EE' },
  { left: '90%', top: '82%', size: 30, color: GOLD },
  { left: '28%', top: '92%', size: 20, color: '#D1FAE5' },
] as const;

function Sparkle({ index }: { index: number }) {
  const spot = SPARKLES[index];
  const twinkle = useSharedValue(0);
  useEffect(() => {
    twinkle.set(
      withDelay(
        180 + index * 140,
        withRepeat(
          withSequence(withTiming(1, { duration: 320 }), withTiming(0.25, { duration: 360 })),
          3,
          false,
        ),
      ),
    );
  }, [twinkle, index]);
  const style = useAnimatedStyle(() => ({
    opacity: twinkle.value,
    transform: [{ scale: 0.5 + 0.6 * twinkle.value }, { rotate: `${twinkle.value * 45}deg` }],
  }));
  return (
    <Animated.Text
      style={[styles.sparkle, { left: spot.left, top: spot.top, fontSize: spot.size, color: spot.color }, style]}>
      ✦
    </Animated.Text>
  );
}

/** The client-privacy tick: a heart that beats over a gold card with the thank-you. */
function ThankYou({ text }: { text: string }) {
  const pop = useSharedValue(0);
  const beat = useSharedValue(0);
  useEffect(() => {
    pop.set(withSpring(1, { mass: 1, damping: 12, stiffness: 180 }));
    beat.set(
      withDelay(
        260,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 140 }),
            withTiming(0.3, { duration: 120 }),
            withTiming(0.8, { duration: 140 }),
            withTiming(0, { duration: 320 }),
          ),
          2,
        ),
      ),
    );
  }, [pop, beat]);
  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ translateY: 24 * (1 - pop.value) }, { scale: 0.85 + 0.15 * pop.value }],
  }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value * (1 + 0.18 * beat.value) }] }));
  return (
    <Animated.View style={[styles.thanks, cardStyle]}>
      <Animated.View style={[styles.heart, heartStyle]}>
        <Text style={styles.heartEmoji}>💚</Text>
      </Animated.View>
      <View style={[styles.goldCard, styles.thanksCard]}>
        <Text style={[styles.thanksText, styles.goldText]}>{text}</Text>
      </View>
      {SPARKLES.map((_, i) => (
        <Sparkle key={i} index={i} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 10, elevation: 10 },
  dim: { backgroundColor: 'rgba(1,28,20,0.9)' },
  stage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
    overflow: 'hidden',
  },
  picture: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
  centre: { position: 'absolute', left: '50%', top: '50%', marginLeft: -4, marginTop: -6 },
  ring: { position: 'absolute' },
  badge: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#0B7A55',
    borderWidth: 5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeEmoji: { fontSize: 66, lineHeight: 78 },
  tick: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: '#0B7A55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: { color: INK, fontSize: 26, lineHeight: 30, fontWeight: '900' },
  disc: {
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: '#FBF7EE',
    borderWidth: 4,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMark: { position: 'absolute' },
  headline: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    maxWidth: 360,
  },
  shout: { fontWeight: '900', letterSpacing: 0.5 },
  goldShout: { color: GOLD, fontSize: 42, lineHeight: 48 },
  bigShout: { fontSize: 50, lineHeight: 56, textShadowColor: 'rgba(250,204,21,0.55)', textShadowRadius: 18 },
  stillCard: {
    backgroundColor: '#053D2E',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    maxWidth: 360,
  },
  stillText: { color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '800', textAlign: 'center' },
  goldCard: { backgroundColor: GOLD, borderColor: '#FEF3C7' },
  goldText: { color: INK },
  thanks: { width: '100%', maxWidth: 360, alignItems: 'center', paddingVertical: Spacing.four },
  heart: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -30,
    zIndex: 1,
    borderWidth: 4,
    borderColor: GOLD,
  },
  heartEmoji: { fontSize: 42, lineHeight: 50 },
  thanksCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 2,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five + Spacing.one,
    paddingBottom: Spacing.four,
  },
  thanksText: { fontSize: 22, lineHeight: 29, fontWeight: '800', textAlign: 'center' },
  sparkle: { position: 'absolute', fontWeight: '900' },
});
