import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listTrips } from '@/db/trips-repo';
import { parseMiles } from '@/domain/format';
import { missedMiles, PERIOD_LABELS, periodBounds, type Period } from '@/domain/missed-miles';
import { computeDeductions, formatMoney, toUnits } from '@/domain/regions';
import type { Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { withInvite } from '@/referral/links';
import { useRegion } from '@/region/region';

/**
 * "Missed miles": delivery apps only count distance with an order on board.
 * Compare with what MileMint logged, and share the difference.
 */
export default function CompareScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { region } = useRegion();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [period, setPeriod] = useState<Period>('this-month');
  const [counted, setCounted] = useState('');

  useEffect(() => {
    listTrips(db).then(setTrips, () => {});
  }, [db]);

  const units = region.unit === 'mi' ? 'miles' : 'km';
  const deductions = useMemo(() => computeDeductions(trips, region), [trips, region]);
  const typed = parseMiles(counted);
  const result = useMemo(
    () =>
      missedMiles(trips, deductions, periodBounds(period, new Date()), typed ?? 0, (m) => toUnits(m, region)),
    [trips, deductions, period, typed, region],
  );
  const number = (n: number) => new Intl.NumberFormat(region.locale, { maximumFractionDigits: 0 }).format(n);

  const share = () => {
    const when = PERIOD_LABELS[period].toLowerCase();
    Share.share({
      message: withInvite(
        `My delivery app counted ${number(result.counted)} ${units} ${when}. MileMint logged ${number(result.logged)} ` +
        `business ${units}: that's ${number(result.extra)} ${units} (about ${formatMoney(result.extraValue, region)}) ` +
        `I'd have missed claiming. 🚗💸 MileMint logs every mile automatically.`,
      ),
    }).catch(() => {});
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="small" themeColor="textSecondary">
            Delivery apps only count {units} with an order on board. The drive to the pickup, between orders
            and home again are business {units} too, and MileMint logs them all.
          </ThemedText>

          <Segmented
            options={(['this-week', 'this-month', 'last-month'] as const).map((value) => ({
              value,
              label: PERIOD_LABELS[value],
            }))}
            value={period}
            onChange={setPeriod}
          />

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              {units === 'miles' ? 'Miles' : 'Kilometres'} your delivery app counted
            </ThemedText>
            <TextInput
              accessibilityLabel={`${units} your delivery app counted`}
              value={counted}
              onChangeText={setCounted}
              inputMode="decimal"
              placeholder="From its weekly or monthly summary"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
          </View>

          <View style={styles.result} accessibilityLiveRegion="polite">
            <BrandGradient />
            <View style={styles.leaf} pointerEvents="none">
              <LeafMark size={150} opacity={0.2} />
            </View>
            <Text style={styles.resultLabel}>MileMint logged</Text>
            <Text style={styles.resultBig}>
              {number(result.logged)} {units}
            </Text>
            <Text style={styles.resultLabel}>of business driving {PERIOD_LABELS[period].toLowerCase()}</Text>
            {typed !== null && (
              <View style={styles.extra}>
                {result.extra > 0 ? (
                  <>
                    <Text style={styles.extraBig}>
                      +{number(result.extra)} {units} your app missed
                    </Text>
                    <Text style={styles.extraSub}>worth about {formatMoney(result.extraValue, region)}</Text>
                  </>
                ) : (
                  <Text style={styles.extraSub}>
                    Your app counted as much as MileMint logged. Check your trips are sorted as business.
                  </Text>
                )}
              </View>
            )}
          </View>

          {typed !== null && result.extra > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={share}
              style={[styles.shareButton, { backgroundColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                Share this
              </ThemedText>
            </Pressable>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            Estimated at {region.authority} rates for your business trips. Not tax advice.
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  field: { gap: Spacing.one },
  input: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  result: { borderRadius: 20, padding: Spacing.four, gap: 2, overflow: 'hidden' },
  leaf: { position: 'absolute', right: -30, bottom: -40 },
  resultLabel: { color: '#D1FAE5', fontSize: 15, fontWeight: '500' },
  resultBig: { color: '#FFFFFF', fontSize: 44, lineHeight: 52, fontWeight: '800', fontVariant: ['tabular-nums'] },
  extra: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.3)',
    gap: 2,
  },
  extraBig: { color: '#FACC15', fontSize: 22, fontWeight: '800' },
  extraSub: { color: '#D1FAE5', fontSize: 15 },
  shareButton: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
