import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { loadSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { HABITS, type HabitId, MILESTONES, type Milestone, nextMilestone, reachedMilestones } from '@/domain/milestones';
import { computeDeductions, formatDistance, formatMoney, fromUnits } from '@/domain/regions';
import type { Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { milestoneProgress } from '@/milestones/use-milestones';
import { useRegion } from '@/region/region';

/** Badges for money back, distance logged and good habits, with progress to the next one. */
export default function MilestonesScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [exported, setExported] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listTrips(db).then(setTrips, () => {});
      loadSettings(db).then((s) => setExported(s.exportedReport), () => {});
    }, [db]),
  );

  const progress = useMemo(
    () => milestoneProgress(trips, computeDeductions(trips, region), region, exported),
    [trips, region, exported],
  );
  const earned = useMemo(() => new Set(reachedMilestones(progress).map((m) => m.id)), [progress]);
  const nextMoney = nextMilestone('money', progress.moneyMinor);
  const miles = region.unit === 'mi';
  const distanceLabel = (threshold: number) => {
    const distance = new Intl.NumberFormat(region.locale).format(threshold);
    // `count` lets a translation pick a plural form for the unit.
    return miles
      ? t('{{distance}} miles', { distance, count: threshold })
      : t('{{distance}} km', { distance, count: threshold });
  };

  const label = (m: Milestone) =>
    m.kind === 'money'
      ? formatMoney(m.threshold * 100, region).replace(/[.,]00$/, '')
      : m.kind === 'distance'
        ? distanceLabel(m.threshold)
        : t(HABITS[m.id as HabitId].title);

  const section = (title: string, kind: Milestone['kind']) => (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.grid}>
        {MILESTONES.filter((m) => m.kind === kind).map((m) => {
          const got = earned.has(m.id);
          return (
            <ThemedView
              key={m.id}
              type="backgroundElement"
              style={[styles.badge, got && { borderColor: '#FACC15', borderWidth: 2 }]}
              accessibilityLabel={
                got ? t('{{label}}: earned', { label: label(m) }) : t('{{label}}: not yet', { label: label(m) })
              }>
              <View style={[styles.coin, got ? styles.coinGot : { backgroundColor: theme.backgroundSelected }]}>
                <Text style={[styles.coinEmoji, !got && styles.dim]}>{got ? m.emoji : '🔒'}</Text>
              </View>
              <ThemedText
                type="small"
                numberOfLines={3}
                style={[styles.badgeLabel, !got && { color: theme.textSecondary }]}>
                {label(m)}
              </ThemedText>
            </ThemedView>
          );
        })}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <BrandGradient />
          <View style={styles.heroLeaf} pointerEvents="none">
            <LeafMark size={160} opacity={0.2} />
          </View>
          <Text style={styles.heroLabel}>{t('Found for you so far')}</Text>
          <Text style={styles.heroTotal}>{formatMoney(progress.moneyMinor, region)}</Text>
          <Text style={styles.heroLabel}>
            {t('{{distance}} of work driving', {
              distance: formatDistance(fromUnits(progress.distance, region), region),
            })}
          </Text>
          {nextMoney && (
            <View style={styles.next}>
              <View style={styles.meter}>
                <View style={[styles.meterFill, { width: `${Math.round(nextMoney.progress * 100)}%` }]} />
              </View>
              <Text style={styles.nextText}>
                {t('{{remaining}} to go to {{goal}}', {
                  remaining: formatMoney(nextMoney.threshold * 100 - progress.moneyMinor, region),
                  goal: formatMoney(nextMoney.threshold * 100, region).replace(/[.,]00$/, ''),
                })}
              </Text>
            </View>
          )}
        </View>
        {section(t('Money back'), 'money')}
        {section(miles ? t('Work miles') : t('Work km'), 'distance')}
        {section(t('Good habits'), 'habit')}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  hero: { borderRadius: 20, padding: Spacing.four, gap: 2, overflow: 'hidden' },
  heroLeaf: { position: 'absolute', right: -30, bottom: -40 },
  heroLabel: { color: '#D1FAE5', fontSize: 15, fontWeight: '500' },
  heroTotal: { color: '#FFFFFF', fontSize: 40, lineHeight: 48, fontWeight: '800', fontVariant: ['tabular-nums'] },
  next: { marginTop: Spacing.three, gap: Spacing.one },
  meter: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 4, backgroundColor: '#FACC15' },
  nextText: { color: '#FEF3C7', fontSize: 14, fontWeight: '700' },
  section: { gap: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badge: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 14,
    padding: Spacing.two + 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  coin: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  coinGot: { backgroundColor: '#FACC15', borderWidth: 2, borderColor: '#FEF3C7' },
  coinEmoji: { fontSize: 24, lineHeight: 30 },
  dim: { opacity: 0.5 },
  badgeLabel: { textAlign: 'center', fontWeight: '600' },
});
