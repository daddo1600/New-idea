import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PlanSheet } from '@/components/plan-rules';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { autoDrivesInMonth } from '@/domain/plan';
import { displayLocale } from '@/domain/regions';
import { toLocalIsoDate, type Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useAllowance, useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';

/** Free plan meter: how much of this month's allowance is used, shown from the first drive. */
export function PlanCard({ trips, locked }: { trips: readonly Trip[]; locked: ReadonlySet<string> }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  // 40 a month, plus 10 for joining with a friend's code and 10 for each friend who joined with yours.
  const limit = useAllowance();
  const { counting, canRedeem } = useReferral();
  const [explaining, setExplaining] = useState(false);
  const now = new Date();
  const thisMonth = toLocalIsoDate(now).slice(0, 7);
  const used = Math.min(autoDrivesInMonth(trips, thisMonth), limit);
  // This month's drives whose value waits (earlier months' are counted on the Pro screen).
  const lockedCount = trips.filter((trip) => locked.has(trip.id) && trip.localDate.startsWith(thisMonth)).length;
  const month = now.toLocaleDateString(displayLocale(region), { month: 'long' });
  const full = used >= limit;
  return (
    // The card opens Pro; "What counts?" and the friend's-code link are their own buttons, not nested inside.
    <ThemedView
      type="backgroundElement"
      style={[styles.planCard, lockedCount > 0 && { borderColor: theme.accent, borderWidth: 1 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/pro')} style={styles.planMain}>
        <View style={styles.rowHeader}>
          <ThemedText type="smallBold" style={styles.route}>
            {t('{{used}} of {{limit}} free work drives in {{month}}', { used, limit, month })}
          </ThemedText>
          <View style={styles.goPro}>
            <Text style={styles.goProText}>★ {t('Go Pro')}</Text>
          </View>
        </View>
        <View style={[styles.meter, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${(used / limit) * 100}%`,
                backgroundColor: full ? theme.danger : theme.accent,
              },
            ]}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {lockedCount > 0
            ? t('{{count}} drives are saved and shown in full. Their value unlocks with Pro.', { count: lockedCount })
            : full
              ? t('New work drives are still saved and shown in full. Their value unlocks with Pro.')
              : t('Personal drives don’t count.')}
        </ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setExplaining(true)} style={styles.savedLine}>
        <ThemedText type="small" style={{ color: theme.accent }}>
          {t('What counts?')}
        </ThemedText>
      </Pressable>
      {/* The sharer's own bonus needs iCloud to count friends; until then only a friend's code helps. */}
      {(full || lockedCount > 0) && (counting || canRedeem) && (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/friends' as Href)}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {counting
              ? t('Or invite a friend: you both get 10 more free drives a month.')
              : t('Got a code from a friend? It adds 10 free drives a month.')}
          </ThemedText>
        </Pressable>
      )}
      <PlanSheet visible={explaining} allowance={limit} onClose={() => setExplaining(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  planCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  planMain: { gap: Spacing.two },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  route: { flex: 1 },
  savedLine: { alignSelf: 'flex-start' },
  goPro: { backgroundColor: '#FACC15', borderRadius: 999, paddingHorizontal: Spacing.two + 2, paddingVertical: 3 },
  goProText: { color: '#064E3B', fontSize: 13, fontWeight: '800' },
  meter: { height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 },
});
