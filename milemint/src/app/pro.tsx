import { router, type Href } from 'expo-router';
import { getLocales } from 'expo-localization';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { GoldButton } from '@/components/gold-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { DEMO_MODE } from '@/dev/demo';
import { formatPrice, offerTermsKey, perMonthPrice, remindsBeforeTrialEnds } from '@/domain/pro-offer';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { presentOfferCodeSheet, type ProPlan, type ProTrial } from '@/purchases/store';
import { trialRemindersAllowed } from '@/purchases/trial-reminder';
import { redeemUrl } from '@/referral/links';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL =
  'https://github.com/daddo1600/New-idea/blob/claude/ios-app-ideas-market-of84qv/milemint/docs/privacy-policy.md';

/**
 * What each plan includes (`true` is a tick): tracking and seeing the money
 * are free for good, and Pro is for getting the record out (domain/plan).
 */
const COMPARISON: readonly [feature: string, free: boolean, pro: boolean][] = [
  [msg('Automatic tracking, no monthly limit'), true, true],
  [msg('Swipe to sort your trips'), true, true],
  [msg('Money total and tax-year totals'), true, true],
  [msg('Year-end summary on screen'), true, true],
  [msg('Add missed trips by hand'), true, true],
  [msg('Itemised mileage log and PDF report'), false, true],
  [msg('Spreadsheet, CSV, Xero, QuickBooks and FreeAgent exports'), false, true],
  [msg('Send your report to your accountant'), false, true],
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

/** e.g. "£49.99/year". */
function planPrice(t: T, plan: ProPlan): string {
  const price = plan.price;
  return plan.period === 'year' ? t('{{price}}/year', { price }) : t('{{price}}/month', { price });
}

/** The trial pill on a plan, e.g. "1 month free". */
function trialPill(t: T, trial: ProTrial): string {
  const { count } = trial;
  if (trial.unit === 'day') return t('{{count}} days free', { count });
  if (trial.unit === 'month') return t('{{count}} months free', { count });
  return t('Free trial');
}

/** A trial's length for the plain terms, e.g. "1 month". */
function trialLength(t: T, trial: ProTrial): string {
  const { count } = trial;
  return trial.unit === 'day' ? t('{{count}} days', { count }) : t('{{count}} months', { count });
}

/** The yearly price a month, e.g. "£4.17 a month", in the phone's own number format like the App Store's price. */
function perMonth(t: T, plan: ProPlan): string | null {
  if (plan.period !== 'year' || plan.amount === null || !plan.currency) return null;
  const amount = perMonthPrice(plan.amount, plan.currency);
  if (amount === null) return null;
  const locale = getLocales()[0]?.languageTag ?? 'en';
  const price = formatPrice(amount, plan.currency, locale);
  return price ? t('{{price}} a month', { price }) : null;
}

/** The plain sentence above the buy button, e.g. "1 month free, then £49.99 a year. Cancel any time in Settings." */
function offerTerms(t: T, plan: ProPlan): string {
  const trial = plan.trial?.unit ? trialLength(t, plan.trial) : '';
  return t(offerTermsKey(plan), { trial, price: plan.price });
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
  const { region } = useRegion();
  const { giftOpen, offerCode } = useReferral();
  const [selected, setSelected] = useState<string | null>(null);
  // The trial reminder is only promised when it can be sent; buying never asks.
  const [canRemind, setCanRemind] = useState(DEMO_MODE);
  useEffect(() => {
    if (DEMO_MODE) return;
    let live = true;
    trialRemindersAllowed().then((allowed) => live && setCanRemind(allowed));
    return () => {
      live = false;
    };
  }, []);

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
          <ThemedText type="subtitle">{t('MileSprout Pro is active')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Your itemised report and every export are unlocked. Thanks for supporting MileSprout.')}
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

  // The friend's gift: Apple's own sheet for typing an offer code, or (no StoreKit here) the App Store's redeem page.
  const redeemGift = async () => {
    const shown = await presentOfferCodeSheet().catch(() => false);
    if (!shown) Linking.openURL(redeemUrl(offerCode)).catch(() => {});
  };

  const onRestore = async () => {
    const found = await restore();
    if (!found) Alert.alert(t('No subscription found'), t('This Apple Account doesn’t have MileSprout Pro.'));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">{t('Your mileage report, ready for tax time')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('Tracking is always free: every drive, with no monthly limit. Pro is for your report and exports.')}
        </ThemedText>

        {giftOpen && (
          <ThemedView type="backgroundElement" style={styles.gift}>
            <ThemedText type="smallBold">🎁 {t('Your friend’s gift: 50% off your first year of Pro')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'On the yearly plan, with code {{code}}. It’s one offer per purchase, so it’s instead of the free month. Pro then renews at the normal yearly price.',
                { code: offerCode },
              )}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={redeemGift}
              style={[styles.giftButton, { borderColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {t('Redeem your friend’s gift')}
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}

        <Comparison />

        <ThemedText type="small" themeColor="textSecondary">
          {region.code === 'GB'
            ? t('Coming to Pro: earnings by platform, a tax set-aside pot and MTD quarterly figures.')
            : t('Coming to Pro: earnings by platform and a tax set-aside pot.')}
        </ThemedText>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/friends' as Href)}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {t('Or invite friends to unlock Pro perks for free ›')}
          </ThemedText>
        </Pressable>

        {!storeAvailable ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('Subscriptions are available in the App Store version of MileSprout on iPhone.')}
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
              const monthly = perMonth(t, option);
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
                    <View style={styles.planHeader}>
                      <ThemedText type="smallBold" style={styles.flex}>
                        {option.period === 'year' ? t('Yearly') : t('Monthly')}
                      </ThemedText>
                      {option.period === 'year' && (
                        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                          <ThemedText type="smallBold" style={[styles.badgeText, { color: theme.onAccent }]}>
                            {t('Most popular')}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText type="small">{planPrice(t, option)}</ThemedText>
                    {monthly && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {monthly}
                      </ThemedText>
                    )}
                    {option.trial && (
                      <View style={[styles.pill, { borderColor: theme.accent }]}>
                        <ThemedText type="smallBold" style={[styles.badgeText, { color: theme.accent }]}>
                          {trialPill(t, option.trial)}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}

            {error && (
              <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
                {t(error)}
              </ThemedText>
            )}

            {plan && (
              <View style={styles.terms}>
                <ThemedText type="small" style={styles.centered}>
                  {offerTerms(t, plan)}
                </ThemedText>
                {canRemind && remindsBeforeTrialEnds(plan) && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
                    {t('We’ll remind you 3 days before it ends.')}
                  </ThemedText>
                )}
              </View>
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

function Comparison() {
  const theme = useTheme();
  const t = useT();
  const cell = (value: boolean) => (
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
          {cell(free)}
          {cell(pro)}
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
  gift: { borderRadius: 12, borderWidth: 1, borderColor: '#EAB308', padding: Spacing.three, gap: Spacing.two },
  giftButton: { alignItems: 'center', paddingVertical: Spacing.two + 2, borderRadius: 10, borderWidth: 1 },
  flex: { flex: 1, gap: Spacing.half },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: { borderRadius: 999, paddingHorizontal: Spacing.two, paddingVertical: 2 },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    marginTop: Spacing.half,
  },
  badgeText: { fontSize: 12, lineHeight: 16 },
  terms: { gap: Spacing.half },
  centered: { textAlign: 'center' },
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
