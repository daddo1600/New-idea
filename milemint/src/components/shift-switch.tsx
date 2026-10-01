import * as Haptics from "expo-haptics";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

import { BrandGradient } from "@/components/brand-gradient";
import { LeafMark } from "@/components/leaf-mark";
import { useT } from "@/i18n/i18n";

const HEIGHT = 64;
const THUMB = 52;
const PAD = (HEIGHT - THUMB) / 2;
/** How far (0–1) the thumb must travel before letting go counts. */
const COMMIT = 0.8;
/** Sparkles alive at once. */
const SLOTS = 18;
/** Sparkle kinds: starting leaves gold stars, a burst on arrival; ending leaves embers that settle. */
const NONE = 0;
const STAR = 1;
const BURST = 2;
const EMBER = 3;
const LIFE = { [STAR]: 700, [BURST]: 650, [EMBER]: 1100 } as Record<
  number,
  number
>;

type Spark = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  t: number;
  kind: number;
  size: number;
};
const EMPTY: Spark = { x: 0, y: 0, dx: 0, dy: 0, t: 0, kind: NONE, size: 0 };

/** A gold star thrown off behind the thumb, floating up as it twinkles out. */
function star(x: number, t: number): Spark {
  "worklet";
  return {
    x: PAD + x + 8,
    y: 12 + Math.random() * (HEIGHT - 24),
    dx: -10 - Math.random() * 22,
    dy: -8 - Math.random() * 14,
    t,
    kind: STAR,
    size: 10 + Math.random() * 9,
  };
}

/** A soft ember left behind when ending, drifting down to settle. */
function ember(x: number, t: number): Spark {
  "worklet";
  return {
    x: PAD + x + THUMB - 8,
    y: 14 + Math.random() * (HEIGHT - 28),
    dx: 6 + Math.random() * 14,
    dy: 6 + Math.random() * 10,
    t,
    kind: EMBER,
    size: 9 + Math.random() * 6,
  };
}

/**
 * The shift switch: one bar that goes both ways. Swipe the gold thumb right to
 * start: stars trail behind it, the bar warms from green to amber, and it lands
 * with a burst. Swipe it back to end: the colour cools to green and the trail
 * turns to soft embers that drift down and settle, finishing with a ripple.
 * Starting feels like setting off; ending feels like winding down.
 *
 * Deliberate either way (a stray tap in a pocket only nudges the thumb), with a
 * haptic tick as it travels. VoiceOver's "activate" switches it directly, and
 * Reduce Motion keeps the colour change but drops the sparkles.
 */
export function ShiftSwitch({
  on,
  startLabel,
  startHint,
  endLabel,
  children,
  onStart,
  onEnd,
}: {
  on: boolean;
  startLabel: string;
  startHint: string;
  /** What the bar says while on, for VoiceOver (the visible content is `children`). */
  endLabel: string;
  /** Shown on the bar while on. */
  children?: ReactNode;
  onStart: () => void;
  onEnd: () => void;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const travel = Math.max(1, width - THUMB - PAD * 2);
  const x = useSharedValue(on ? travel : 0);
  const engaged = useSharedValue(on);
  const start = useSharedValue(0);
  const lastSpawn = useSharedValue(0);
  const lastStep = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const nudge = useSharedValue(0);
  /** The idle glint around the thumb: draws the eye to where to swipe. */
  const twinkle = useSharedValue(0);
  const halo = useSharedValue(0);
  const sparks = useSharedValue<Spark[]>(
    Array.from({ length: SLOTS }, () => EMPTY),
  );
  const next = useSharedValue(0);
  const ripple = useSharedValue(-1e9);
  const now = useSharedValue(0);
  const dragging = useSharedValue(false);
  const lastActive = useSharedValue(0);
  const [live, setLive] = useState(false);
  // The frame clock only runs while there are sparkles to draw: from the touch
  // until they've faded.
  const clock = useFrameCallback((frame) => {
    now.set(frame.timestamp);
    if (!dragging.value && frame.timestamp - lastActive.value > 1500)
      scheduleOnRN(setLive, false);
  }, false);

  // Follow the shift if it starts or ends some other way (another screen, VoiceOver).
  useEffect(() => {
    engaged.set(on);
    x.set(
      withTiming(on ? travel : 0, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [on, travel, x, engaged]);

  useEffect(() => {
    if (reduceMotion) return;
    shimmer.set(
      withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    twinkle.set(
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    halo.set(
      withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    nudge.value = withRepeat(
      withSequence(
        withDelay(
          2200,
          withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
        ),
        withSpring(0, { damping: 6, stiffness: 180 }),
      ),
      -1,
      false,
    );
  }, [shimmer, nudge, twinkle, halo, reduceMotion]);

  useEffect(() => clock.setActive(live), [clock, live]);
  const tick = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
  };
  const started = () => {
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    onStart();
  };
  const ended = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    onEnd();
  };

  const spawn = (spark: Spark) => {
    "worklet";
    const list = sparks.value.slice();
    list[next.value % SLOTS] = spark;
    next.set((next.value + 1) % SLOTS);
    sparks.set(list);
  };

  const sparkle = !reduceMotion;
  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onBegin(() => {
      start.set(x.value);
      lastSpawn.set(x.value);
      lastStep.set(Math.round((x.value / travel) * 5));
      dragging.set(true);
      if (sparkle) scheduleOnRN(setLive, true);
    })
    .onUpdate((event) => {
      x.set(Math.min(travel, Math.max(0, start.value + event.translationX)));
      // A light tick every fifth of the way.
      const step = Math.round((x.value / travel) * 5);
      if (step !== lastStep.value) {
        lastStep.set(step);
        scheduleOnRN(tick);
      }
      if (!sparkle || Math.abs(x.value - lastSpawn.value) < 9) return;
      lastSpawn.set(x.value);
      // Starting throws off gold stars; ending leaves embers that settle.
      spawn(
        engaged.value ? ember(x.value, now.value) : star(x.value, now.value),
      );
    })
    .onFinalize(() => {
      dragging.set(false);
      lastActive.set(now.value);
    })
    .onEnd(() => {
      const progress = x.value / travel;
      if (!engaged.value && progress >= COMMIT) {
        x.set(withTiming(travel, { duration: 120 }));
        engaged.set(true);
        if (sparkle) {
          const cx = PAD + travel + THUMB / 2;
          for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            spawn({
              x: cx,
              y: HEIGHT / 2,
              dx: Math.cos(angle) * 70,
              dy: Math.sin(angle) * 34,
              t: now.value,
              kind: BURST,
              size: 12 + (i % 3) * 3,
            });
          }
        }
        scheduleOnRN(started);
      } else if (engaged.value && progress <= 1 - COMMIT) {
        x.set(
          withTiming(0, { duration: 160, easing: Easing.out(Easing.cubic) }),
        );
        engaged.set(false);
        ripple.set(now.value);
        scheduleOnRN(ended);
      } else {
        x.set(
          withSpring(engaged.value ? travel : 0, {
            damping: 14,
            stiffness: 180,
          }),
        );
      }
    });

  const progress = (value: number) => {
    "worklet";
    return Math.min(1, Math.max(0, value / travel));
  };
  const thumbStyle = useAnimatedStyle(() => {
    const p = progress(x.value);
    return {
      backgroundColor: interpolateColor(p, [0, 1], ["#FACC15", "#FFFFFF"]),
      // Nudges towards the way it can go.
      transform: [
        { translateX: x.value + Math.max(0, nudge.value) * (engaged.value ? -18 : 18) },
      ],
    };
  });
  // Play turns to stop at the halfway point.
  const playStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0.4, 0.55], [1, 0], "clamp"),
  }));
  const stopStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0.45, 0.6], [0, 1], "clamp"),
  }));
  // The bar warms behind the thumb as it travels: amber fills in from the left,
  // and drains away again on the way back.
  const warmStyle = useAnimatedStyle(() => ({
    width: x.value + THUMB + PAD * 2,
    opacity: interpolate(x.value, [0, 14], [0, 1], "clamp"),
  }));
  const offLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0, 0.5], [1, 0], "clamp"),
  }));
  const onLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0.5, 1], [0, 1], "clamp"),
  }));
  // The glint follows the thumb and fades once it moves or the shift is on.
  const glintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress(x.value), [0, 0.12], [1, 0], "clamp"),
    transform: [{ translateX: x.value + Math.max(0, nudge.value) * 18 }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - halo.value),
    transform: [{ scale: 1 + 0.45 * halo.value }],
  }));
  const rippleStyle = useAnimatedStyle(() => {
    const age = (now.value - ripple.value) / 700;
    if (age < 0 || age > 1) return { opacity: 0 };
    return {
      opacity: 0.6 * (1 - age),
      transform: [{ scale: 0.6 + age * 2.6 }],
    };
  });

  const activate = () => (on ? ended() : started());

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={on ? endLabel : startLabel}
      accessibilityHint={
        on
          ? t("{{hint}}. Swipe the button to the left, or double-tap.", {
              hint: t("End shift"),
            })
          : t("{{hint}}. Swipe the button to the right, or double-tap.", {
              hint: startHint,
            })
      }
      accessibilityActions={[{ name: "activate" }]}
      onAccessibilityAction={activate}
      onPress={() => {
        if (reduceMotion) return;
        nudge.set(
          withSequence(
            withTiming(1.6, { duration: 180 }),
            withSpring(0, { damping: 6, stiffness: 180 }),
          ),
        );
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.track}
    >
      <BrandGradient />
      <Animated.View style={[styles.warm, warmStyle]} pointerEvents="none">
        <View style={{ width: Math.max(width, HEIGHT), height: HEIGHT }}>
          <WarmGradient />
        </View>
      </Animated.View>
      <View style={styles.leaf} pointerEvents="none">
        <LeafMark size={110} opacity={0.16} />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.offLabels, offLabelStyle]}
      >
        <Text style={styles.label}>{startLabel}</Text>
        <View style={styles.chevrons}>
          {[0, 1, 2].map((i) => (
            <Chevron key={i} index={i} shimmer={shimmer} glyph="›" />
          ))}
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.onLabels, onLabelStyle]}
      >
        <View style={styles.onContent}>{children}</View>
        <View style={styles.chevrons}>
          {[2, 1, 0].map((i) => (
            <Chevron key={i} index={i} shimmer={shimmer} glyph="‹" />
          ))}
        </View>
      </Animated.View>

      {Array.from({ length: SLOTS }, (_, i) => (
        <SparkView key={i} index={i} sparks={sparks} now={now} />
      ))}
      <Animated.View
        pointerEvents="none"
        style={[styles.ripple, rippleStyle]}
      />

      {!reduceMotion && !on && (
        <Animated.View pointerEvents="none" style={[styles.glint, glintStyle]}>
          <Animated.View style={[styles.halo, haloStyle]} />
          {GLINTS.map((spot, i) => (
            <Glint key={i} index={i} twinkle={twinkle} spot={spot} />
          ))}
        </Animated.View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Animated.Text style={[styles.glyph, styles.play, playStyle]}>
            ▶
          </Animated.Text>
          <Animated.View style={[styles.glyph, stopStyle]}>
            <View style={styles.stop} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Pressable>
  );
}

/** The "on shift" amber, laid over the green as the thumb travels. */
function WarmGradient() {
  const id = `warm${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <Svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#D97706" />
          <Stop offset="1" stopColor="#9A3412" />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#${id})`} />
    </Svg>
  );
}

/** Where one sparkle slot's star (or ember) is now, drawn from the shared list. */
function useSparkStyle(
  index: number,
  sparks: SharedValue<Spark[]>,
  now: SharedValue<number>,
  ember: boolean,
) {
  return useAnimatedStyle(() => {
    const spark = sparks.value[index];
    const isEmber = spark.kind === EMBER;
    if (spark.kind === NONE || ember !== isEmber) return { opacity: 0 };
    const age = (now.value - spark.t) / LIFE[spark.kind];
    if (age < 0 || age > 1) return { opacity: 0 };
    // Stars burst out fast and twinkle; embers glide and fade slowly.
    const eased = isEmber ? age : 1 - (1 - age) * (1 - age);
    const scale =
      (spark.size / 16) *
      (isEmber
        ? 1 - age * 0.5
        : Math.sin(Math.PI * Math.min(1, age * 1.3)) + 0.2);
    return {
      opacity: isEmber ? 0.9 * (1 - age) : 1 - age * age,
      transform: [
        { translateX: spark.x + spark.dx * eased - 8 },
        { translateY: spark.y + spark.dy * eased - 10 },
        { scale },
        { rotate: `${isEmber ? 0 : age * 120}deg` },
      ],
    };
  });
}

/** One sparkle slot: a gold star or a mint ember. */
function SparkView({
  index,
  sparks,
  now,
}: {
  index: number;
  sparks: SharedValue<Spark[]>;
  now: SharedValue<number>;
}) {
  const star = useSparkStyle(index, sparks, now, false);
  const ember = useSparkStyle(index, sparks, now, true);
  return (
    <>
      <Animated.Text
        pointerEvents="none"
        style={[styles.spark, styles.star, star]}
      >
        ✦
      </Animated.Text>
      <Animated.Text
        pointerEvents="none"
        style={[styles.spark, styles.ember, ember]}
      >
        ●
      </Animated.Text>
    </>
  );
}

/** Where the idle stars sit around the thumb. */
const GLINTS = [
  { left: -8, top: -7, size: 20 },
  { left: THUMB - 4, top: -6, size: 15 },
  { left: THUMB + 2, top: THUMB / 2 - 10, size: 22 },
  { left: THUMB - 8, top: THUMB - 14, size: 14 },
];

/** One idle star, twinkling in turn with the others. */
function Glint({
  index,
  twinkle,
  spot,
}: {
  index: number;
  twinkle: SharedValue<number>;
  spot: (typeof GLINTS)[number];
}) {
  const style = useAnimatedStyle(() => {
    const phase = (twinkle.value + index / GLINTS.length) % 1;
    const shine = phase < 0.4 ? Math.sin((phase / 0.4) * Math.PI) : 0;
    return {
      opacity: shine,
      transform: [{ scale: 0.4 + 0.8 * shine }, { rotate: `${phase * 90}deg` }],
    };
  });
  return (
    <Animated.Text
      style={[
        styles.spark,
        styles.glintStar,
        {
          left: spot.left,
          top: spot.top,
          fontSize: spot.size,
          width: spot.size + 4,
          lineHeight: spot.size + 6,
          height: spot.size + 6,
        },
        style,
      ]}
    >
      ✦
    </Animated.Text>
  );
}

/** One of the three arrows, lighting up in turn in the direction to swipe. */
function Chevron({
  index,
  shimmer,
  glyph,
}: {
  index: number;
  shimmer: SharedValue<number>;
  glyph: string;
}) {
  const style = useAnimatedStyle(() => {
    const phase = (shimmer.value * 3 - index + 3) % 3;
    return {
      opacity: 0.35 + 0.65 * Math.max(0, 1 - Math.abs(phase - 0.5) * 1.6),
    };
  });
  return <Animated.Text style={[styles.chevron, style]}>{glyph}</Animated.Text>;
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    overflow: "hidden",
    justifyContent: "center",
    shadowColor: "#064E3B",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  leaf: { position: "absolute", right: -44, top: -8 },
  warm: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: HEIGHT / 2,
    overflow: "hidden",
  },
  offLabels: {
    position: "absolute",
    left: THUMB + PAD * 2,
    right: Platform.OS === "web" ? 16 : 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  onLabels: {
    position: "absolute",
    left: 18,
    right: THUMB + PAD * 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onContent: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  label: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  chevrons: { flexDirection: "row" },
  chevron: {
    color: "#FACC15",
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "800",
    marginLeft: -2,
  },
  spark: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 16,
    height: 20,
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
  },
  glintStar: {
    color: "#FFFBEB",
    textShadowColor: "#FACC15",
    textShadowRadius: 8,
  },
  star: {
    color: "#FDE68A",
    textShadowColor: "rgba(250,204,21,0.9)",
    textShadowRadius: 6,
  },
  ember: {
    color: "#D1FAE5",
    fontSize: 12,
    textShadowColor: "rgba(167,243,208,0.8)",
    textShadowRadius: 4,
  },
  glint: {
    position: "absolute",
    left: PAD,
    top: PAD,
    width: THUMB,
    height: THUMB,
  },
  halo: {
    position: "absolute",
    left: 0,
    top: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    borderColor: "#FDE68A",
  },
  ripple: {
    position: "absolute",
    left: PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  thumb: {
    position: "absolute",
    left: PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  play: { color: "#064E3B", fontSize: 18, marginLeft: 3 },
  stop: { width: 16, height: 16, borderRadius: 3, backgroundColor: "#B45309" },
});
