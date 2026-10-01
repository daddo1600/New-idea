import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
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
import { useT } from '@/i18n/i18n';

const HEIGHT = 64;
const THUMB = 52;
const PAD = (HEIGHT - THUMB) / 2;
/** How far along (0–1) the thumb must be let go to count. */
const COMMIT = 0.8;

/**
 * Slide-to-start for a shift: a gold thumb (the logo's dot) dragged along a
 * brand-green track, so starting is deliberate and can't happen by a stray
 * tap in a pocket. The thumb nudges itself every few seconds and the arrows
 * shimmer to show which way to go. A tap gives the same nudge; VoiceOver's
 * "activate" starts the shift directly.
 */
export function SwipeToStart({ label, hint, onComplete }: { label: string; hint: string; onComplete: () => void }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const travel = Math.max(1, width - THUMB - PAD * 2);
  const x = useSharedValue(0);
  const start = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const nudge = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    shimmer.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false);
    nudge.value = withRepeat(
      withSequence(
        withDelay(2200, withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) })),
        withSpring(0, { damping: 6, stiffness: 180 }),
      ),
      -1,
      false,
    );
  }, [shimmer, nudge, reduceMotion]);

  const done = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onComplete();
    // Ready again for next time (the bar changes to "On shift" meanwhile).
    setTimeout(() => x.set(0), 600);
  };
  const tick = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onBegin(() => {
      start.value = x.value;
      scheduleOnRN(tick);
    })
    .onUpdate((event) => {
      x.value = Math.min(travel, Math.max(0, start.value + event.translationX));
    })
    .onEnd(() => {
      if (x.value / travel >= COMMIT) {
        x.value = withTiming(travel, { duration: 120 });
        scheduleOnRN(done);
      } else {
        x.value = withSpring(0, { damping: 14, stiffness: 180 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value + nudge.value * 18 }],
  }));
  // The words fade as the thumb slides over them.
  const labelStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value / travel, [0, 0.5], [1, 0], 'clamp') }));
  const trailStyle = useAnimatedStyle(() => ({ width: x.value + THUMB + PAD }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('{{hint}}. Swipe the button to the right, or double-tap.', { hint })}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={done}
      onPress={() => {
        if (reduceMotion) return;
        nudge.set(withSequence(withTiming(1.6, { duration: 180 }), withSpring(0, { damping: 6, stiffness: 180 })));
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.track}>
      <BrandGradient />
      <View style={styles.leaf} pointerEvents="none">
        <LeafMark size={110} opacity={0.16} />
      </View>
      {/* The part already slid over glows gold. */}
      <Animated.View pointerEvents="none" style={[styles.trail, trailStyle]} />
      <Animated.View pointerEvents="none" style={[styles.labels, labelStyle]}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.chevrons}>
          {[0, 1, 2].map((i) => (
            <Chevron key={i} index={i} shimmer={shimmer} />
          ))}
        </View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <Text style={styles.play}>▶</Text>
        </Animated.View>
      </GestureDetector>
    </Pressable>
  );
}

/** One of the three arrows, lighting up in turn left to right. */
function Chevron({ index, shimmer }: { index: number; shimmer: ReturnType<typeof useSharedValue<number>> }) {
  const style = useAnimatedStyle(() => {
    const phase = (shimmer.value * 3 - index + 3) % 3;
    return { opacity: 0.35 + 0.65 * Math.max(0, 1 - Math.abs(phase - 0.5) * 1.6) };
  });
  return <Animated.Text style={[styles.chevron, style]}>›</Animated.Text>;
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  leaf: { position: 'absolute', right: -44, top: -8 },
  trail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: HEIGHT / 2,
    backgroundColor: 'rgba(250,204,21,0.28)',
  },
  labels: {
    position: 'absolute',
    left: THUMB + PAD * 2,
    right: Platform.OS === 'web' ? 16 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  chevrons: { flexDirection: 'row' },
  chevron: { color: '#FACC15', fontSize: 26, lineHeight: 28, fontWeight: '800', marginLeft: -2 },
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
  play: { color: '#064E3B', fontSize: 18, marginLeft: 3 },
});
