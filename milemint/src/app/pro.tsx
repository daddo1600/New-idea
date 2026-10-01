import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GoldButton } from '@/components/gold-button';
import { PlanRules } from '@/components/plan-rules';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/db/use-trips';
import { lockedTripIds } from '@/domain/plan';
import { formatMoney, potentialDeductions } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import type { ProPlan, ProTrial } from '@/purchases/store';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL =
  'https://github.com/daddo1600/New-idea/blob/claude/ios-app-ideas-market-of84qv/milemint/docs/privacy-policy.md';

/**
 * What each plan includes: `true` is a tick, a string is shown translated, and
 * `null` is the free plan's monthly drive limit.
 */
const COMPARISON: readonly [feature: string, free: string | boolean | null, pro: string | boolean][] = [
  [msg('Automatic drive logging'), null, msg('Unlimited')],
  [msg('Drives past the limit, saved and shown in full'), true, true],
  [msg('The value of drives past the limit'), false, true],
  [msg('Add missed trips by hand'), true, true],
  [msg('Swipe to sort business trips'), true, true],
  [msg('Work hours, places, learned routes'), true, true],
  [msg('Mileage log export (CSV)'), true, true],
  [msg('Export to Xero, QuickBooks and FreeAgent'), false, true],
  [msg('Tax-ready PDF report'), false, true],
  [msg('Encrypted on your iPhone, no ads'), true, true],
];

type T = ReturnType<typeof useT>;

/** e.g. "30-day free trial". */
function trialText(t: T, trial: ProTrial): string {
  const { count } = trial;
  if (trial.unit === 'day') return t('{{count}}-day free trial', { count });
  if (trial.unit === 'month') return t('{{count}}-month free trial', { count });
  return t('Free trial');
}

/** e.g. "30-day free trial, then $49.99/year". */
function planPrice(t: T, plan: ProPlan): string {
  const price = plan.price;
  if (plan.trial) {
    const trial = trialText(t, plan.trial);
    return plan.period === 'year'
      ? t('{{trial}}, then {{price}}/year', { trial, price })
      : t('{{trial}}, then {{price}}/month', { trial, price });
  }
  return plan.period === 'year' ? t('{{price}}/year', { price }) : t('{{price}}/month', { price });
}

/** The renewal terms Apple requires next to an auto-renewing offer. */
function renewalTerms(t: T, plan: ProPlan): string {
  const price = plan.price;
  if (plan.trial) {
    const trial = trialText(t, plan.trial);
    return plan.period === 'year'
      ? t(
          'After the {{trial}}, {{price}} per year is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period.',
          { trial, price },
        )
      : t(
          'After the {{trial}}, {{price}} per month is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period.',
          { trial, price },
        );
  }
  return plan.period === 'year'
    ? t(
        '{{price}} per year is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period.',
        { price },
      )
    : t(
        '{{price}} per month is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period.',
        { price },
      );
}

export default function ProScreen() {
  const theme = useTheme();
  const t = useT();
  const { isPro, plans, plansLoaded, storeAvailable, busy, error, buy, restore, manage } = usePro();
  const { trips } = useTrips();
  const { region } = useRegion();
  const { allowance, counting, canRedeem } = useReferral();
  const [selected, setSelected] = useState<string | null>(null);

  // What upgrading is worth to this user right now, if they've hit the limit.
  const locked = useMemo(() => {
    const ids = lockedTripIds(trips ?? [], false, allowance);
    const visible = (trips ?? []).filter((trip) => !ids.has(trip.id));
    const drives = (trips ?? []).filter((trip) => ids.has(trip.id));
    const potentialOf = potentialDeductions(visible, region);
    const value = drives.reduce((sum, trip) => sum + potentialOf(trip), 0);
    return { count: drives.length, value };
  }, [trips, region, allowance]);

  // Close once the subscription becomes active here, whether bought or restored.
  const wasPro = useRef(isPro);
  useEffect(() => {
    if (isPro && !wasPro.current && router.canGoBack()) router.back();
    wasPro.current = isPro;
  }, [isPro]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (isPro) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('MileMint Pro is active')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Every drive is logged and unlocked. Thanks for supporting MileMint.')}
          </ThemedText>
          {storeAvailable && (
            <Pressable accessibilityRole="button" onPress={manage} hitSlop={8}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {t('Manage subscription')}
              </ThemedText>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={[styles.button, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Done')}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </ThemedView>
    );
  }

  const plan = plans.find((p) => p.id === selected) ?? plans[0];

  const onRestore = async () => {
    const found = await restore();
    if (!found) Alert.alert(t('No subscription found'), t('This Apple Account doesn’t have MileMint Pro.'));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">{t('Log every drive with MileMint Pro')}</ThemedText>
        {locked.count > 0 && (
          <ThemedView type="backgroundElement" style={[styles.locked, { borderColor: theme.accent }]}>
            <ThemedText type="smallBold">
              {t('{{count}} saved drives have their value waiting for Pro', { count: locked.count })}
            </ThemedText>
            {locked.value > 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                {t('Worth up to {{amount}} in deductions if they were for business.', {
                  amount: formatMoney(locked.value, region),
                })}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {/* The free plan's rules, the same words as home's "What counts?", so the paywall holds no surprises. */}
        <ThemedView type="backgroundElement" style={styles.rules}>
          <PlanRules allowance={allowance} />
        </ThemedView>

        <Comparison allowance={allowance} />

        {/* Staying free: friends add drives. The sharer's own bonus needs iCloud to count friends. */}
        {(counting || canRedeem) && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/friends' as Href)}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {counting
                ? t('Or invite a friend: you both get 10 more free drives a month.')
                : t('Got a code from a friend? It adds 10 free drives a month.')}
            </ThemedText>
          </Pressable>
        )}

        {!storeAvailable ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('Subscriptions are available in the App Store version of MileMint on iPhone.')}
          </ThemedText>
        ) : plans.length === 0 ? (
          plansLoaded ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'Couldn’t load subscription options from the App Store. Check your connection and try again later.',
              )}
            </ThemedText>
          ) : (
            <ActivityIndicator />
          )
        ) : (
          <>
            {plans.map((option) => {
              const active = option.id === plan?.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelected(option.id)}
                  style={[
                    styles.plan,
                    {
                      borderColor: active ? theme.accent : theme.backgroundSelected,
                      backgroundColor: theme.backgroundElement,
                    },
                  ]}>
                  <View style={styles.flex}>
                    <ThemedText type="smallBold">{option.period === 'year' ? t('Yearly') : t('Monthly')}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {planPrice(t, option)}
                    </ThemedText>
                  </View>
                  {option.period === 'year' && (
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      {t('Best value')}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}

            {error && (
              <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                {t(error)}
              </ThemedText>
            )}

            <GoldButton
              label={busy ? t('Opening the App Store…') : plan?.trial ? t('Start free trial') : t('Subscribe')}
              disabled={busy || !plan}
              onPress={() => plan && buy(plan.id)}
            />

            {/* Terms Apple requires next to any auto-renewing subscription offer. */}
            <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
              {plan ? `${renewalTerms(t, plan)} ` : ''}
              {t('Manage or cancel anytime in your App Store account settings.')}
            </ThemedText>
          </>
        )}

        <Pressable accessibilityRole="button" onPress={close} style={styles.notNow}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Not now')}
          </ThemedText>
        </Pressable>

        <View style={styles.links}>
          {storeAvailable && (
            <Pressable accessibilityRole="button" disabled={busy} onPress={onRestore} hitSlop={8}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {t('Restore purchases')}
              </ThemedText>
            </Pressable>
          )}
          <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Terms of Use')}
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Privacy Policy')}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Comparison({ allowance }: { allowance: number }) {
  const theme = useTheme();
  const t = useT();
  const cell = (value: string | boolean | null, pro: boolean) =>
    value === null || typeof value === 'string' ? (
      <ThemedText type="small" style={[styles.planCell, pro && { color: theme.accent }]}>
        {value === null ? t('{{count}} a month', { count: allowance }) : t(value)}
      </ThemedText>
    ) : (
      <ThemedText
        type="smallBold"
        accessibilityLabel={value ? t('Included') : t('Not included')}
        style={[styles.planCell, { color: value ? theme.accent : theme.textSecondary }]}>
        {value ? '✓' : '–'}
      </ThemedText>
    );
  return (
    <ThemedView type="backgroundElement" style={styles.table}>
      <View style={styles.tableRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.feature}>
          {t('What’s included')}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.planCell}>
          {t('Free')}
        </ThemedText>
        <ThemedText type="smallBold" style={[styles.planCell, { color: theme.accent }]}>
          Pro
        </ThemedText>
      </View>
      {COMPARISON.map(([feature, free, pro]) => (
        <View key={feature} style={[styles.tableRow, { borderTopColor: theme.backgroundSelected }, styles.divided]}>
          <ThemedText type="small" style={styles.feature}>
            {t(feature)}
          </ThemedText>
          {cell(free, false)}
          {cell(pro, true)}
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  divided: { borderTopWidth: StyleSheet.hairlineWidth },
  feature: { flex: 1 },
  planCell: { width: 84, textAlign: 'center' },
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  locked: { borderRadius: 12, borderWidth: 1, padding: Spacing.three, gap: Spacing.half },
  rules: { borderRadius: 12, padding: Spacing.three },
  flex: { flex: 1, gap: Spacing.half },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 2,
    borderRadius: 12,
    padding: Spacing.three,
  },
  button: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  legal: { fontSize: 12, lineHeight: 16 },
  notNow: { alignItems: 'center', paddingVertical: Spacing.two },
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.four },
});
