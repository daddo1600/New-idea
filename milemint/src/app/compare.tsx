import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { lockedTripIds } from '@/domain/plan';
import { computeDeductions, formatMoney, toUnits } from '@/domain/regions';
import type { Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';

type T = ReturnType<typeof useT>;
type ShareParams = { counted: string; logged: string; extra: string; amount: string };

/** The message shared with friends, one whole sentence per period and unit. */
function shareMessage(t: T, period: Period, miles: boolean, params: ShareParams): string {
  if (miles) {
    if (period === 'this-week') {
      return t(
        'My delivery app counted {{counted}} miles this week. MileMint logged {{logged}} business miles: that\'s {{extra}} miles (about {{amount}}) I\'d have missed claiming. 🚗💸 MileMint logs every mile automatically.',
        params,
      );
    }
    if (period === 'this-month') {
      return t(
        'My delivery app counted {{counted}} miles this month. MileMint logged {{logged}} business miles: that\'s {{extra}} miles (about {{amount}}) I\'d have missed claiming. 🚗💸 MileMint logs every mile automatically.',
        params,
      );
    }
    return t(
      'My delivery app counted {{counted}} miles last month. MileMint logged {{logged}} business miles: that\'s {{extra}} miles (about {{amount}}) I\'d have missed claiming. 🚗💸 MileMint logs every mile automatically.',
      params,
    );
  }
  if (period === 'this-week') {
    return t(
      'My delivery app counted {{counted}} km this week. MileMint logged {{logged}} business km: that\'s {{extra}} km (about {{amount}}) I\'d have missed claiming. 🚗💸 MileMint logs every mile automatically.',
      params,
    );
  }
  if (period === 'this-month') {
    return t(
      'My delivery app counted {{counted}} km this month. MileMint logged {{logged}} business km: that\'s {{extra}} km (about {{amount}}) I\'d have missed claiming. 🚗💸 MileMint logs every mile automatically.',
      params,
    );
  }
  return t(
    'My delivery app counted {{counted}} km last month. MileMint logged {{logged}} business km: that\'s {{extra}} km (about {{amount}}) I\'d have missed claiming. 🚗💸 MileMint logs every mile automatically.',
    params,
  );
}

/** "of business driving this month", under the logged distance. */
function periodCaption(t: T, period: Period): string {
  if (period === 'this-week') return t('of business driving this week');
  if (period === 'this-month') return t('of business driving this month');
  return t('of business driving last month');
}

/**
 * "Missed miles": delivery apps only count distance with an order on board.
 * Compare with what MileMint logged, and share the difference.
 */
export default function CompareScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [period, setPeriod] = useState<Period>('this-month');
  const [counted, setCounted] = useState('');

  const { isPro } = usePro();
  const { allowance, shareInvite } = useReferral();
  useEffect(() => {
    // Locked drives (past the free plan's allowance) stay out of the figures, as everywhere else.
    listTrips(db).then((all) => {
      const locked = lockedTripIds(all, isPro, allowance);
      setTrips(all.filter((trip) => !locked.has(trip.id)));
    }, () => {});
  }, [db, isPro, allowance]);

  const miles = region.unit === 'mi';
  const deductions = useMemo(() => computeDeductions(trips, region), [trips, region]);
  const typed = parseMiles(counted);
  const result = useMemo(
    () =>
      missedMiles(trips, deductions, periodBounds(period, new Date()), typed ?? 0, (m) => toUnits(m, region)),
    [trips, deductions, period, typed, region],
  );
  const number = (n: number) => new Intl.NumberFormat(region.locale, { maximumFractionDigits: 0 }).format(n);

  // `count` lets a translation pick a plural form for the unit.
  const distance = (n: number) =>
    miles
      ? t('{{distance}} miles', { distance: number(n), count: Math.round(n) })
      : t('{{distance}} km', { distance: number(n), count: Math.round(n) });

  // With a new single-use invite code, like every share.
  const share = () => {
    shareInvite(
      shareMessage(t, period, miles, {
        counted: number(result.counted),
        logged: number(result.logged),
        extra: number(result.extra),
        amount: formatMoney(result.extraValue, region),
      }),
    ).catch(() => {});
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="small" themeColor="textSecondary">
            {miles
              ? t(
                  'Delivery apps only count miles with an order on board. The drive to the pickup, between orders and home again are business miles too, and MileMint logs them all.',
                )
              : t(
                  'Delivery apps only count km with an order on board. The drive to the pickup, between orders and home again are business km too, and MileMint logs them all.',
                )}
          </ThemedText>

          <Segmented
            options={(['this-week', 'this-month', 'last-month'] as const).map((value) => ({
              value,
              label: t(PERIOD_LABELS[value]),
            }))}
            value={period}
            onChange={setPeriod}
          />

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              {miles ? t('Miles your delivery app counted') : t('Kilometres your delivery app counted')}
            </ThemedText>
            <TextInput
              accessibilityLabel={miles ? t('miles your delivery app counted') : t('km your delivery app counted')}
              value={counted}
              onChangeText={setCounted}
              inputMode="decimal"
              placeholder={t('From its weekly or monthly summary')}
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
          </View>

          <View style={styles.result} accessibilityLiveRegion="polite">
            <BrandGradient />
            <View style={styles.leaf} pointerEvents="none">
              <LeafMark size={150} opacity={0.2} />
            </View>
            <Text style={styles.resultLabel}>{t('MileMint logged')}</Text>
            <Text style={styles.resultBig}>{distance(result.logged)}</Text>
            <Text style={styles.resultLabel}>{periodCaption(t, period)}</Text>
            {typed !== null && (
              <View style={styles.extra}>
                {result.extra > 0 ? (
                  <>
                    <Text style={styles.extraBig}>
                      {miles
                        ? t('+{{distance}} miles your app missed', {
                            distance: number(result.extra),
                            count: Math.round(result.extra),
                          })
                        : t('+{{distance}} km your app missed', {
                            distance: number(result.extra),
                            count: Math.round(result.extra),
                          })}
                    </Text>
                    <Text style={styles.extraSub}>
                      {t('worth about {{amount}}', { amount: formatMoney(result.extraValue, region) })}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.extraSub}>
                    {t('Your app counted as much as MileMint logged. Check your trips are sorted as business.')}
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
                {t('Share this')}
              </ThemedText>
            </Pressable>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {t('Estimated at {{authority}} rates for your business trips. Not tax advice.', {
              authority: region.authority,
            })}
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
