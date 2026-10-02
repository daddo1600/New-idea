import { type RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { PopPress, popHaptic } from '@/components/pop-press';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { pullReturnsToMenu, rubberBand } from '@/domain/work-focus';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

type Props = {
  emoji: string;
  title: string;
  detail: string;
  /** In the menu: a choice with an empty radio. In focus: the one chosen, with a "Change" pill. */
  focused: boolean;
  /** Chosen from the menu. */
  onChoose: () => void;
  /** Back to the menu: a tap on the card or its pill, or a pull down. */
  onChange: () => void;
  /** Reduce Motion: the card stays put while pulled; the pull, the tap and the pill still go back. */
  reduceMotion: boolean;
  /** The screen's scroll view, which waits while the card is being pulled down. */
  scroller?: RefObject<unknown>;
};

/**
 * One of the "How do you work?" choices (app/welcome). In the menu it's a
 * card that pops when tapped; once chosen it's the only one left, at the top,
 * and goes back to the menu on a tap, on its "Change" pill or when pulled
 * down past PULL_TO_MENU (with a rubber band while it's pulled).
 */
export function WorkStyleCard(props: Props) {
  return props.focused ? <FocusedCard {...props} /> : <MenuCard {...props} />;
}

function MenuCard({ emoji, title, detail, onChoose }: Props) {
  const theme = useTheme();
  return (
    <PopPress
      accessibilityRole="radio"
      accessibilityState={{ selected: false }}
      accessibilityLabel={`${title}. ${detail}`}
      haptic="light"
      // A wide card: a small pop, so it doesn't spill past the screen's edges.
      scale={1.025}
      onPress={onChoose}
      style={[styles.card, { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      </View>
      <View style={[styles.radio, { borderColor: theme.backgroundSelected }]} />
    </PopPress>
  );
}

function FocusedCard({ emoji, title, detail, onChange, reduceMotion, scroller }: Props) {
  const theme = useTheme();
  const t = useT();
  /** How far the card sits below its place while pulled, after the rubber band. */
  const drag = useSharedValue(0);
  const back = () => {
    popHaptic('light');
    onChange();
  };
  /**
   * A pull that springs back isn't also a tap: on the web the press still
   * lands when the mouse comes up (on iPhone the gesture cancels it).
   */
  const pulled = useSharedValue(false);
  const tap = () => {
    if (!pulled.get()) back();
  };

  let pan = Gesture.Pan()
    // Down only: a pull up or sideways is the scroll view's (or nothing).
    .activeOffsetY(8)
    .failOffsetY(-8)
    .failOffsetX([-16, 16])
    // Each touch starts as a tap, until it moves far enough to be a pull.
    .onBegin(() => {
      pulled.set(false);
    })
    .onStart(() => {
      pulled.set(true);
    })
    .onUpdate((event) => {
      // Reduce Motion: the card stays still, and a pull far enough still goes back.
      if (!reduceMotion) drag.set(rubberBand(event.translationY));
    })
    .onEnd((event) => {
      if (pullReturnsToMenu(event.translationY, event.velocityY)) scheduleOnRN(back);
    })
    .onFinalize(() => {
      drag.set(withSpring(0, { mass: 1, damping: 18, stiffness: 260 }));
    });
  if (scroller) pan = pan.blocksExternalGesture(scroller as RefObject<never>);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drag.value }, { scale: 1 - Math.min(drag.value / 1400, 0.04) }],
  }));

  return (
    <GestureDetector gesture={pan}>
      {/* Opaque underneath the mint tint, so nothing shows through while it's pulled over what's below. */}
      <Animated.View style={[styles.under, { backgroundColor: theme.background }, dragStyle]}>
        <Pressable
          // The pill is the control for VoiceOver; the card itself reads as the choice.
          accessible={false}
          onPress={tap}
          // Laid out as in the menu (same padding, same radio), so moving to the top changes only where it is.
          style={[styles.card, { borderColor: theme.accent, backgroundColor: theme.accent + '14' }]}>
          {/* A grabber, as on iOS's sheets: this card pulls down. */}
          <View style={[styles.grabber, { backgroundColor: theme.accent + '59' }]} />
          <Text style={styles.emoji}>{emoji}</Text>
          <View
            style={styles.flex}
            accessible
            accessibilityRole="text"
            accessibilityState={{ selected: true }}
            accessibilityLabel={`${title}. ${detail}`}>
            <ThemedText type="smallBold">{title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {detail}
            </ThemedText>
          </View>
          <View style={[styles.radio, styles.radioOn, { borderColor: theme.accent, backgroundColor: theme.accent }]}>
            <Text style={[styles.tick, { color: theme.onAccent }]}>✓</Text>
          </View>
          {/* On the card's top-right corner, over the tick: the way back, in plain sight. */}
          <Animated.View
            entering={reduceMotion ? undefined : ZoomIn.duration(220).delay(260)}
            style={styles.pillSpot}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Change')}
              accessibilityHint={t('Shows all three ways of working again')}
              hitSlop={10}
              onPress={tap}
              style={({ pressed }) => [
                styles.pill,
                { backgroundColor: theme.accent, borderColor: theme.background, opacity: pressed ? 0.8 : 1 },
              ]}>
              <ThemedText type="smallBold" style={[styles.pillText, { color: theme.onAccent }]}>
                {t('Change')}
              </ThemedText>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: Spacing.three,
  },
  under: { borderRadius: 16 },
  grabber: { position: 'absolute', top: 6, left: '50%', marginLeft: -18, width: 36, height: 4, borderRadius: 2 },
  emoji: { fontSize: 26, lineHeight: 32 },
  flex: { flex: 1, gap: Spacing.half },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
  radioOn: { alignItems: 'center', justifyContent: 'center' },
  tick: { fontSize: 13, fontWeight: '800' },
  // Straddles the top border, its right edge in line with the tick's.
  pillSpot: { position: 'absolute', top: -14, right: Spacing.three - 6 },
  pill: {
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: Spacing.three - 2,
    paddingVertical: Spacing.one,
  },
  pillText: { fontSize: 13, lineHeight: 17 },
});
