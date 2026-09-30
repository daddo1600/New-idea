import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/db/use-trips';
import { FREE_AUTO_DRIVES_PER_MONTH, lockedTripIds } from '@/domain/plan';
import { formatMoney, potentialDeduction } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL =
  'https://github.com/daddo1600/New-idea/blob/claude/ios-app-ideas-market-of84qv/milemint/docs/privacy-policy.md';

/** What each plan includes: `true` is a tick, a string is shown as is. */
const COMPARISON: readonly [feature: string, free: string | boolean, pro: string | boolean][] = [
  ['Automatic drive logging', `${FREE_AUTO_DRIVES_PER_MONTH} a month`, 'Unlimited'],
  ['Drives over the limit', 'Kept, locked', 'Unlocked'],
  ['Add missed trips by hand', true, true],
  ['Swipe to sort business trips', true, true],
  ['Work hours, places, learned routes', true, true],
  ['Mileage log export (CSV)', true, true],
  ['Tax-ready PDF report', false, true],
  ['Encrypted on your iPhone, no ads', true, true],
];

export default function ProScreen() {
  const theme = useTheme();
  const { isPro, plans, plansLoaded, storeAvailable, busy, error, buy, restore, manage } = usePro();
  const { trips } = useTrips();
  const { region } = useRegion();
  const [selected, setSelected] = useState<string | null>(null);

  // What upgrading is worth to this user right now, if they've hit the limit.
  const locked = useMemo(() => {
    const ids = lockedTripIds(trips ?? [], false);
    const visible = (trips ?? []).filter((trip) => !ids.has(trip.id));
    const drives = (trips ?? []).filter((trip) => ids.has(trip.id));
    const value = drives.reduce((sum, trip) => sum + potentialDeduction(trip, visible, region), 0);
    return { count: drives.length, value };
  }, [trips, region]);

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
          <ThemedText type="subtitle">MileMint Pro is active</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Every drive is logged and unlocked. Thanks for supporting MileMint.
          </ThemedText>
          {storeAvailable && (
            <Pressable accessibilityRole="button" onPress={manage} hitSlop={8}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                Manage subscription
              </ThemedText>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={[styles.button, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              Done
            </ThemedText>
          </Pressable>
        </ScrollView>
      </ThemedView>
    );
  }

  const plan = plans.find((p) => p.id === selected) ?? plans[0];

  const onRestore = async () => {
    const found = await restore();
    if (!found) Alert.alert('No subscription found', 'This Apple Account doesn’t have MileMint Pro.');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Log every drive with MileMint Pro</ThemedText>
        {locked.count > 0 && (
          <ThemedView type="backgroundElement" style={[styles.locked, { borderColor: theme.accent }]}>
            <ThemedText type="smallBold">
              {locked.count} {locked.count === 1 ? 'drive is' : 'drives are'} waiting to be unlocked
            </ThemedText>
            {locked.value > 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                Worth up to {formatMoney(locked.value, region)} in deductions if they were for business.
              </ThemedText>
            )}
          </ThemedView>
        )}

        <Comparison />

        {!storeAvailable ? (
          <ThemedText type="small" themeColor="textSecondary">
            Subscriptions are available in the App Store version of MileMint on iPhone.
          </ThemedText>
        ) : plans.length === 0 ? (
          plansLoaded ? (
            <ThemedText type="small" themeColor="textSecondary">
              Couldn’t load subscription options from the App Store. Check your connection and try again
              later.
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
                    <ThemedText type="smallBold">{option.period === 'year' ? 'Yearly' : 'Monthly'}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {option.trial ? `${option.trial}, then ` : ''}
                      {option.price}/{option.period}
                    </ThemedText>
                  </View>
                  {option.period === 'year' && (
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      Best value
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}

            {error && (
              <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                {error}
              </ThemedText>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={busy || !plan}
              onPress={() => plan && buy(plan.id)}
              style={[styles.button, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {busy ? 'Opening the App Store…' : plan?.trial ? 'Start free trial' : 'Subscribe'}
              </ThemedText>
            </Pressable>

            {/* Terms Apple requires next to any auto-renewing subscription offer. */}
            <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
              {plan?.trial ? `After the ${plan.trial}, ` : ''}
              {plan ? `${plan.price} per ${plan.period} ` : ''}is charged to your Apple Account and renews
              automatically unless cancelled at least 24 hours before the end of the period. Manage or
              cancel anytime in your App Store account settings.
            </ThemedText>
          </>
        )}

        <Pressable accessibilityRole="button" onPress={close} style={styles.notNow}>
          <ThemedText type="small" themeColor="textSecondary">
            Not now
          </ThemedText>
        </Pressable>

        <View style={styles.links}>
          {storeAvailable && (
            <Pressable accessibilityRole="button" disabled={busy} onPress={onRestore} hitSlop={8}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                Restore purchases
              </ThemedText>
            </Pressable>
          )}
          <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Terms of Use
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Privacy Policy
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Comparison() {
  const theme = useTheme();
  const cell = (value: string | boolean, pro: boolean) =>
    typeof value === 'string' ? (
      <ThemedText type="small" style={[styles.planCell, pro && { color: theme.accent }]}>
        {value}
      </ThemedText>
    ) : (
      <ThemedText
        type="smallBold"
        accessibilityLabel={value ? 'Included' : 'Not included'}
        style={[styles.planCell, { color: value ? theme.accent : theme.textSecondary }]}>
        {value ? '✓' : '–'}
      </ThemedText>
    );
  return (
    <ThemedView type="backgroundElement" style={styles.table}>
      <View style={styles.tableRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.feature}>
          What’s included
        </ThemedText>
        <ThemedText type="smallBold" style={styles.planCell}>
          Free
        </ThemedText>
        <ThemedText type="smallBold" style={[styles.planCell, { color: theme.accent }]}>
          Pro
        </ThemedText>
      </View>
      {COMPARISON.map(([feature, free, pro]) => (
        <View key={feature} style={[styles.tableRow, { borderTopColor: theme.backgroundSelected }, styles.divided]}>
          <ThemedText type="small" style={styles.feature}>
            {feature}
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
