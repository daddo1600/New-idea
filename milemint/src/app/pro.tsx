import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/db/use-trips';
import { formatCents } from '@/domain/format';
import { FREE_AUTO_DRIVES_PER_MONTH, lockedTripIds } from '@/domain/plan';
import { tripDeductionCents } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL =
  'https://github.com/daddo1600/New-idea/blob/claude/ios-app-ideas-market-of84qv/milemint/docs/privacy-policy.md';

const BENEFITS = [
  ['Unlimited automatic drives', `Free covers ${FREE_AUTO_DRIVES_PER_MONTH} a month. Pro logs every one.`],
  ['Unlocks drives you’ve already made', 'Drives over the free limit are kept, never lost.'],
  ['Still private', 'No account, no ads, and your trips never leave your iPhone.'],
] as const;

export default function ProScreen() {
  const theme = useTheme();
  const { isPro, plans, storeAvailable, busy, error, buy, restore } = usePro();
  const { trips } = useTrips();
  const [selected, setSelected] = useState<string | null>(null);

  // What upgrading is worth to this user right now, if they've hit the limit.
  const locked = useMemo(() => {
    const ids = lockedTripIds(trips ?? [], false);
    const drives = (trips ?? []).filter((trip) => ids.has(trip.id));
    const cents = drives.reduce(
      (sum, trip) => sum + tripDeductionCents({ ...trip, classification: 'business' }),
      0,
    );
    return { count: drives.length, cents };
  }, [trips]);

  // Close once the subscription is active, whether bought or restored.
  useEffect(() => {
    if (isPro && router.canGoBack()) router.back();
  }, [isPro]);

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
            {locked.cents > 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                Worth up to {formatCents(locked.cents)} in deductions if they were for business.
              </ThemedText>
            )}
          </ThemedView>
        )}

        {BENEFITS.map(([title, body]) => (
          <View key={title} style={styles.benefit}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              ✓
            </ThemedText>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {body}
              </ThemedText>
            </View>
          </View>
        ))}

        {!storeAvailable ? (
          <ThemedText type="small" themeColor="textSecondary">
            Subscriptions are available in the App Store version of MileMint on iPhone.
          </ThemedText>
        ) : plans.length === 0 ? (
          <ActivityIndicator />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  locked: { borderRadius: 12, borderWidth: 1, padding: Spacing.three, gap: Spacing.half },
  benefit: { flexDirection: 'row', gap: Spacing.two },
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
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.four },
});
