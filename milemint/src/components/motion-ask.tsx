import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GoldTrace } from '@/components/gold-trace';
import { StepIcon } from '@/components/step-header';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/i18n';

/**
 * A small copy of iOS's Motion & Fitness question, before it's asked:
 * "Allow" pulses, "Don't Allow" is greyed. The title and body are greyed bars
 * (iOS writes them, from NSMotionUsageDescription), so nothing here can
 * disagree with what iOS shows. Same look as PermissionPreview.
 */
export function MotionPreview({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 650, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [pulse, reduceMotion]);

  const allowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.08 * pulse.value }],
    shadowOpacity: 0.12 + 0.18 * pulse.value,
  }));

  return (
    <View
      style={[styles.wrap, style]}
      accessible
      accessibilityLabel={t('Tap “{{button}}”', { button: t('Allow') })}>
      <View style={styles.alert}>
        <View style={styles.titleBar} />
        <View style={[styles.titleBar, styles.titleShort]} />
        <View style={[styles.bodyBar, styles.bodyLong]} />
        <View style={[styles.bodyBar, styles.bodyShort]} />
        <View style={styles.buttons}>
          <View style={styles.side}>
            <Text style={styles.dontAllow} numberOfLines={1} adjustsFontSizeToFit>
              {t('Don’t Allow')}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.side}>
            <Animated.View style={[styles.allow, allowStyle]}>
              <Text style={styles.allowText} numberOfLines={1} adjustsFontSizeToFit>
                {t('Allow')}
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Set-up's Motion & Fitness step, on the green brand background, above its buttons. */
export function MotionStep() {
  const t = useT();
  return (
    <>
      <View style={styles.icon}>
        <StepIcon glyph="motion" size={30} />
      </View>
      <Text style={styles.eyebrow}>{t('STEP 2 · TRACKING')}</Text>
      <Text style={styles.title} accessibilityRole="header">
        {t('One more for accuracy: Motion & Fitness')}
      </Text>
      <Text style={styles.body}>
        {t('Lets MileSprout tell driving from walking, so a stroll is never logged as a trip. It stays on your phone.')}
      </Text>
      <MotionPreview />
    </>
  );
}

/**
 * Shown behind iOS's own Motion & Fitness question while it's up. We can't
 * draw on Apple's alert, so this lines up just under it: iOS centres the alert
 * across about 80% of the screen with "Allow" on the right half, so a gold
 * arrow and a gold-outlined "Allow" sit under that half, pointing up at it.
 */
export function MotionCoach() {
  const t = useT();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const box = useRef<View>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    bob.set(withRepeat(withSequence(withTiming(1, { duration: 520 }), withTiming(0, { duration: 520 })), -1, false));
  }, [bob, reduceMotion]);
  const arrow = useAnimatedStyle(() => ({ transform: [{ translateY: -8 * bob.value }] }));

  // Where Allow sits on screen: the right half of an alert ~80% wide, centred,
  // whose bottom edge is a little under the middle of the screen.
  const alertWidth = width * ALERT_WIDTH;
  const column = { x: (width - alertWidth) / 2 + alertWidth / 2, y: height / 2 + ALERT_BELOW_MIDDLE };
  return (
    <View
      ref={box}
      style={styles.coach}
      accessibilityLiveRegion="polite"
      onLayout={() => box.current?.measureInWindow((x, y) => setOrigin({ x, y }))}>
      {origin && (
        <View
          style={[
            styles.coachColumn,
            { left: column.x - origin.x, top: column.y - origin.y, width: alertWidth / 2 },
          ]}>
          <Animated.Text style={[styles.coachArrow, arrow]}>↑</Animated.Text>
          <View style={styles.coachPill}>
            {/* The same gold light as the language button, quicker here: it's the one thing to tap. */}
            <GoldTrace stroke={3} lapMs={1400} restMs={500} restingOpacity={0.9} />
            <Text style={styles.coachText} numberOfLines={2} adjustsFontSizeToFit>
              {t('Tap “{{button}}”', { button: t('Allow') })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/** iOS 26's alert: about this share of the screen's width… */
const ALERT_WIDTH = 0.8;
/** …with its buttons ending about this far below the middle of the screen (points). */
const ALERT_BELOW_MIDDLE = 190;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // Fixed height, so the pulse never moves what's around it.
  alert: {
    width: 250,
    height: 150,
    borderRadius: 20,
    paddingTop: 14,
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.92)',
    overflow: 'hidden',
  },
  titleBar: { height: 10, borderRadius: 5, backgroundColor: '#D9DCE0', width: '80%', alignSelf: 'center' },
  titleShort: { width: '60%' },
  bodyBar: { height: 7, borderRadius: 4, backgroundColor: '#E6E8EB', alignSelf: 'center', marginTop: 1 },
  bodyLong: { width: '86%', marginTop: 5 },
  bodyShort: { width: '64%' },
  buttons: {
    marginTop: 'auto',
    height: 50,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C7CACF',
  },
  side: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: '#C7CACF' },
  dontAllow: { color: '#B4B8BE', fontSize: 16, fontWeight: '500' },
  allow: {
    minHeight: 34,
    minWidth: 84,
    borderRadius: 17,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  allowText: { color: '#0A84FF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  eyebrow: { color: '#FACC15', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: Spacing.one },
  title: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 },
  body: { color: '#D1FAE5', fontSize: 17, lineHeight: 24 },
  coach: { flex: 1, alignSelf: 'stretch', minHeight: 1 },
  coachColumn: { position: 'absolute', alignItems: 'center', gap: Spacing.one },
  coachArrow: { color: '#FACC15', fontSize: 48, lineHeight: 52, fontWeight: '800' },
  // Gold-outlined, like the button it points at.
  coachPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(1,28,20,0.85)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    shadowColor: '#FACC15',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  coachText: { color: '#FACC15', fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
});
