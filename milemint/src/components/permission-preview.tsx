import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useT } from '@/i18n/i18n';

/** How long each of iOS's two questions is shown before the other. */
const STEP_MS = 3600;

/**
 * A small copy of iOS's location question, before it's asked: the button to
 * tap pulses, first "Allow While Using App", then "Change to Always Allow".
 * Only the button to tap is labelled (in iOS's own wording, as in the
 * coaching behind the real alert); the rest is greyed out, so nothing here
 * can disagree with what iOS shows.
 */
export function PermissionPreview() {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<1 | 2>(1);
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
    const timer = setInterval(() => setStep((current) => (current === 1 ? 2 : 1)), STEP_MS);
    return () => clearInterval(timer);
  }, [pulse, reduceMotion]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.06 * pulse.value }],
    shadowOpacity: 0.12 + 0.18 * pulse.value,
  }));

  const label = step === 1 ? t('Allow While Using App') : t('Change to Always Allow');
  // iOS lists three choices the first time, two the second: the missing one is
  // kept as an invisible space, so the card doesn't change height.
  const before = step === 1 ? 1 : 0;

  return (
    <View style={styles.wrap} accessible accessibilityLabel={t('Tap “{{button}}”', { button: label })}>
      <Text style={styles.step}>{t('{{step}} OF 2', { step })}</Text>
      <View style={styles.alert}>
        <View style={styles.titleBar} />
        <View style={[styles.titleBar, styles.titleShort]} />
        <View style={styles.map}>
          <Text style={styles.arrow}>➤</Text>
        </View>
        {Array.from({ length: before }, (_, index) => (
          <View key={`b${index}`} style={styles.ghost} />
        ))}
        <Animated.View style={[styles.button, buttonStyle]}>
          <Text style={styles.buttonText} numberOfLines={2} adjustsFontSizeToFit>
            {label}
          </Text>
        </Animated.View>
        <View style={styles.ghost} />
        {step === 2 && <View style={[styles.ghost, styles.hidden]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  step: { color: '#D1FAE5', fontSize: 13, fontWeight: '800', letterSpacing: 1.2 },
  alert: {
    width: 230,
    borderRadius: 20,
    padding: 12,
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  titleBar: { height: 10, borderRadius: 5, backgroundColor: '#D9DCE0', width: '85%', alignSelf: 'center' },
  titleShort: { width: '55%' },
  map: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3EBE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  arrow: { color: '#0B7A55', fontSize: 20, transform: [{ rotate: '-45deg' }] },
  ghost: { height: 26, borderRadius: 13, backgroundColor: '#E6E8EB' },
  hidden: { opacity: 0 },
  button: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginHorizontal: -10,
  },
  buttonText: { color: '#0A84FF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
