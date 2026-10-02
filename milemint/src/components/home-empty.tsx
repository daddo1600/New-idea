import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { shownPurpose } from '@/components/purpose-picker';
import { ThemedText } from '@/components/themed-text';
import { loadSettings, type AppSettings } from '@/db/settings-repo';
import { usualPurpose } from '@/domain/auto-classify';
import { displayLocale, formatRate, ratePeriodFor, type Region } from '@/domain/regions';
import { toLocalIsoDate, VEHICLE_ICONS, VEHICLE_LABELS } from '@/domain/trip';
import { formatWorkDays, summarizeWorkHours } from '@/domain/work-hours-summary';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

type SetupAnswers = Pick<
  AppSettings,
  'shiftMode' | 'defaultPurpose' | 'workHoursEnabled' | 'workWeek' | 'vehicle'
>;

/** "09:00" the way the user's country and language write a time ("9:00 AM", "09:00"). */
export function clockTime(hhmm: string, region: Region): string {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return new Date(2024, 0, 1, hours, minutes).toLocaleTimeString(displayLocale(region), {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** A weekday's short name in the user's language (0 is Sunday; 7 January 2024 was a Sunday). */
export function weekdayName(day: number, region: Region): string {
  return new Date(2024, 0, 7 + day).toLocaleDateString(displayLocale(region), { weekday: 'short' });
}

/**
 * The lines under home's "Ready when you are" before the first drive, worked
 * out from the setup answers: how this user's drives get sorted (their shift,
 * their hours, or a swipe), and one quiet line showing the app is set up for
 * them (their rate, vehicle and country).
 */
export function HomeEmptyLines({ trackingOn, style }: { trackingOn: boolean; style?: StyleProp<TextStyle> }) {
  const db = useSQLiteContext();
  const t = useT();
  const theme = useTheme();
  const { region } = useRegion();
  const [answers, setAnswers] = useState<SetupAnswers | null>(null);

  // Re-read on coming back, as the answers can be changed in Settings.
  useFocusEffect(
    useCallback(() => {
      let current = true;
      loadSettings(db).then(
        (settings) => current && setAnswers(settings),
        () => {},
      );
      return () => {
        current = false;
      };
    }, [db]),
  );

  if (!trackingOn) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={style}>
        {t('Turn on automatic tracking and your drives will appear here.')}
      </ThemedText>
    );
  }
  if (!answers) return null;

  const hours = answers.workHoursEnabled ? summarizeWorkHours(answers.workWeek) : null;
  const purpose = usualPurpose(answers);
  const how = answers.shiftMode
    ? t('When you start work, swipe to start your shift. Every drive in it counts as {{purpose}}.', {
        purpose: shownPurpose(purpose ?? 'Deliveries', t),
      })
    : hours === 'varies'
      ? t('Drives in your work hours are sorted as work for you.')
      : hours
        ? t('Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as work for you.', {
            days: formatWorkDays(hours.days, (day) => weekdayName(day, region)),
            from: clockTime(hours.start, region),
            to: clockTime(hours.end, region),
          })
        : t('After each drive, swipe right if it was for work (deliveries, pickups), left if it was personal.');

  // Today's rate for their vehicle (the first band, where the rate drops after a distance).
  const rate = ratePeriodFor(toLocalIsoDate(new Date()), region, answers.vehicle)?.tiers[0]?.rate;
  const vehicle = `${VEHICLE_ICONS[answers.vehicle]} ${t(VEHICLE_LABELS[answers.vehicle])}`;
  const country = `${region.flag} ${t(region.name)}`;
  const setUp =
    rate === undefined
      ? `${vehicle} · ${country}`
      : region.unit === 'mi'
        ? t('{{rate}} a mile · {{vehicle}} · {{country}}', { rate: formatRate(rate, region), vehicle, country })
        : t('{{rate}} a km · {{vehicle}} · {{country}}', { rate: formatRate(rate, region), vehicle, country });

  return (
    <>
      {answers.shiftMode && <UpHint color={theme.accent} />}
      <ThemedText type="small" themeColor="textSecondary" style={style}>
        {how}
      </ThemedText>
      <ThemedText type="small" style={[style, styles.setUp, { color: theme.accent }]}>
        {setUp}
      </ThemedText>
    </>
  );
}

/** A small arrow bobbing towards the shift bar at the top of home. */
function UpHint({ color }: { color: string }) {
  const reduceMotion = useReducedMotion();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    bob.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [bob, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * bob.value }] }));
  return (
    <Animated.Text accessible={false} style={[styles.arrow, { color }, style]}>
      ↑
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  setUp: { fontSize: 13, fontWeight: '700' },
  arrow: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
});
