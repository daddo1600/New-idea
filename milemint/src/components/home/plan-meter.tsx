import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { autoDrivesInMonth } from '@/domain/plan';
import { displayLocale } from '@/domain/regions';
import { toLocalIsoDate, type Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useAllowance } from '@/referral/referral';
import { useRegion } from '@/region/region';

/** From three quarters of the month's free drives used (or one waiting for Pro). */
const SHOW_FROM = 0.75;

/**
 * Home's free-plan line: "32 of 40 free work drives in October · Go Pro",
 * only once the allowance is nearly used or a drive's value is waiting. The
 * full plan card, with what counts, is on the Money tab.
 *
 * Self-contained, so a change to the free plan only has to change this.
 */
export function PlanMeter({ trips, locked }: { trips: readonly Trip[]; locked: ReadonlySet<string> }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const limit = useAllowance();
  const now = new Date();
  const thisMonth = toLocalIsoDate(now).slice(0, 7);
  const used = Math.min(autoDrivesInMonth(trips, thisMonth), limit);
  const waiting = trips.some((trip) => locked.has(trip.id) && trip.localDate.startsWith(thisMonth));
  if (!waiting && used < limit * SHOW_FROM) return null;
  const month = now.toLocaleDateString(displayLocale(region), { month: 'long' });
  const full = used >= limit;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('Opens MileSprout Pro')}
      onPress={() => router.push('/pro')}
      style={[styles.meter, { backgroundColor: theme.backgroundElement }, waiting && { borderColor: theme.accent }]}>
      <ThemedText
        type="small"
        numberOfLines={1}
        style={[styles.text, full && { color: theme.danger }]}>
        {t('{{used}} of {{limit}} free work drives in {{month}}', { used, limit, month })}
      </ThemedText>
      <View style={styles.goPro}>
        <Text style={styles.goProText}>★ {t('Go Pro')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  meter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one + 2,
    paddingVertical: Spacing.one + 2,
  },
  text: { flex: 1 },
  goPro: { backgroundColor: '#FACC15', borderRadius: 999, paddingHorizontal: Spacing.two + 2, paddingVertical: 3 },
  goProText: { color: '#064E3B', fontSize: 13, fontWeight: '800' },
});
