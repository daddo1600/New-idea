import * as Haptics from 'expo-haptics';
import { useEffect, useMemo } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/i18n';
import { useReferral } from '@/referral/referral';

const CONFETTI_COLORS = ['#FACC15', '#4ADE80', '#FFFFFF', '#BBF7D0', '#F59E0B'];
const PIECES = 36;

export type CelebrationContent = { emoji: string; title: string; message: string; share: string };

/** One falling piece of confetti. */
function Piece({
  index,
  width,
  height,
  colors,
  duration,
}: {
  index: number;
  width: number;
  height: number;
  colors: readonly string[];
  /** The slowest piece's fall, in milliseconds (the quickest takes 60% of it). */
  duration: number;
}) {
  // Deterministic "random" spread so it looks scattered but never jumps between renders.
  const seed = (n: number) => {
    const x = Math.sin(index * 97.13 + n * 13.7) * 10_000;
    return x - Math.floor(x);
  };
  const fall = useSharedValue(0);
  const left = seed(1) * width;
  const drift = (seed(2) - 0.5) * 120;
  const spin = (seed(3) - 0.5) * 720;
  const color = colors[index % colors.length];
  const size = 6 + seed(4) * 6;

  useEffect(() => {
    fall.value = withDelay(
      seed(5) * 400 * (duration / 3000),
      withTiming(1, { duration: duration * (0.6 + seed(6) * 0.4), easing: Easing.out(Easing.quad) }),
    );
    // seed only depends on index, which never changes for a piece.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fall]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, fall.value - 0.75) * 4,
    transform: [
      { translateY: -40 + fall.value * (height + 80) },
      { translateX: drift * fall.value },
      { rotate: `${spin * fall.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.piece, { left, width: size, height: size * 1.6, backgroundColor: color }, style]}
    />
  );
}

/** Confetti falling over the whole of its parent (`width` × `height`), in `colors`. */
export function Confetti({
  width,
  height,
  colors = CONFETTI_COLORS,
  count = PIECES,
  duration = 3000,
}: {
  width: number;
  height: number;
  colors?: readonly string[];
  count?: number;
  duration?: number;
}) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return pieces.map((i) => (
    <Piece key={i} index={i} width={width} height={height} colors={colors} duration={duration} />
  ));
}

/**
 * A small pop of confetti thrown out from one point (the top left of `style`'s
 * box), for a step done right. `reach` scales how far it flies.
 */
export function Burst({
  style,
  colors = CONFETTI_COLORS,
  count = 18,
  reach = 1,
}: {
  style?: StyleProp<ViewStyle>;
  colors?: readonly string[];
  count?: number;
  reach?: number;
}) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <View pointerEvents="none" style={style}>
      {pieces.map((i) => (
        <BurstPiece key={i} index={i} count={count} colors={colors} scale={reach} />
      ))}
    </View>
  );
}

function BurstPiece({
  index,
  count,
  colors,
  scale,
}: {
  index: number;
  count: number;
  colors: readonly string[];
  scale: number;
}) {
  const fly = useSharedValue(0);
  useEffect(() => {
    fly.set(withTiming(1, { duration: 900 + (index % 5) * 90, easing: Easing.out(Easing.cubic) }));
  }, [fly, index]);
  const angle = (index / count) * Math.PI * 2 + (index % 3) * 0.2;
  const reach = (70 + (index % 4) * 22) * scale;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, fly.value - 0.6) * 2.5,
    transform: [
      { translateX: Math.cos(angle) * reach * fly.value },
      // Thrown out, then falling a little.
      { translateY: Math.sin(angle) * reach * 0.6 * fly.value + 40 * fly.value * fly.value },
      { rotate: `${index * 47 * fly.value}deg` },
    ],
  }));
  return (
    <Animated.View style={[styles.burstPiece, { backgroundColor: colors[index % colors.length] }, style]} />
  );
}

/**
 * A pat on the back: confetti in the brand colours, a gold badge and a warm
 * line, for a milestone reached. Share sends a ready-made brag message with a
 * new single-use invite code, so a friend who joins counts towards their perks.
 */
export function Celebration({ content, onClose }: { content: CelebrationContent | null; onClose: () => void }) {
  const t = useT();
  const { shareInvite, sharing, offerCode } = useReferral();
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const pop = useSharedValue(0);

  useEffect(() => {
    if (!content) return;
    pop.value = 0;
    pop.value = withSpring(1, { damping: 12, stiffness: 160 });
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [content, pop]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ scale: 0.8 + 0.2 * pop.value }],
  }));

  if (!content) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {!reduceMotion && <Confetti width={width} height={height} />}
        <Animated.View style={[styles.card, cardStyle]} accessibilityRole="alert">
          <BrandGradient />
          <View style={styles.leaf} pointerEvents="none">
            <LeafMark size={170} opacity={0.18} />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{content.emoji}</Text>
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: sharing }}
            disabled={sharing}
            onPress={() => shareInvite(content.share).catch(() => {})}
            style={[styles.share, sharing && styles.dim]}>
            <Text style={styles.shareText}>
              {offerCode ? t('Share it · friends get 50% off Pro') : t('Share it with a friend')}
            </Text>
          </Pressable>
          {/* The share carries a new single-use invite code (src/referral/invites.ts). */}
          <Text style={styles.reward}>{t('Every friend who joins unlocks Pro perks for you.')}</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
            <Text style={styles.close}>{t('Keep going')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1,28,20,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    overflow: 'hidden',
  },
  piece: { position: 'absolute', top: 0, borderRadius: 2 },
  burstPiece: { position: 'absolute', width: 8, height: 12, borderRadius: 2 },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    overflow: 'hidden',
  },
  leaf: { position: 'absolute', right: -40, bottom: -50 },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FACC15',
    borderWidth: 3,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  badgeEmoji: { fontSize: 40, lineHeight: 48 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  message: { color: '#D1FAE5', fontSize: 16, lineHeight: 22, textAlign: 'center' },
  share: {
    marginTop: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two + 2,
  },
  shareText: { color: '#064E3B', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  dim: { opacity: 0.6 },
  reward: { color: '#D1FAE5', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  close: { color: '#D1FAE5', fontSize: 15, marginTop: Spacing.two },
});
