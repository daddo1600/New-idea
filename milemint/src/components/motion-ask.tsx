import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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
 * Shown behind iOS's own Motion & Fitness question while it's up. iOS puts
 * its alert mid-screen with "Allow" bottom right, so this sits low on the
 * right, pointing up at it, on a dark card that still reads while dimmed.
 */
export function MotionCoach() {
  const t = useT();
  return (
    <View style={styles.coach} accessibilityLiveRegion="polite">
      <View style={styles.coachCard}>
        <Text style={styles.coachArrow}>↑</Text>
        <Text style={styles.coachText}>{t('Tap “{{button}}”', { button: t('Allow') })}</Text>
      </View>
    </View>
  );
}

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
  coach: { flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: Spacing.four },
  coachCard: {
    backgroundColor: 'rgba(1,28,20,0.85)',
    borderRadius: 20,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  coachArrow: { color: '#FACC15', fontSize: 56, lineHeight: 60, fontWeight: '800', marginRight: Spacing.three },
  coachText: { color: '#FACC15', fontSize: 28, lineHeight: 35, fontWeight: '800', textAlign: 'right' },
});
