import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OfferCard } from '@/components/perks/offer-card';
import { SectionTitle } from '@/components/section-title';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { offerState } from '@/perks/claims';
import { DEMO_OFFERS, type PerkOffer } from '@/perks/offers';
import { usePerkClaims } from '@/perks/use-perk-claims';
import { useRegion } from '@/region/region';

const showCode = (code: string) => router.push({ pathname: '/perk/[code]', params: { code } } as unknown as Href);

/**
 * Perks: deals from partners (fuel, coffee, tyres…), free for every driver,
 * with no account. Claim one and the phone makes a single-use code to show at
 * the till; the partner pays MileSprout only when that code is used. Perks
 * never unlock anything in the app. For now every offer is a DEMO with a
 * made-up brand, and the tab says so at the top.
 */
export default function PerksTab() {
  const t = useT();
  const theme = useTheme();
  const { region } = useRegion();
  const { claims, loaded, claim, reset } = usePerkClaims();
  const [busy, setBusy] = useState<string | null>(null);

  if (!loaded) return <ActivityIndicator style={styles.loading} />;

  const now = new Date();
  const claimOffer = async (offer: PerkOffer) => {
    if (busy) return;
    setBusy(offer.id);
    try {
      const created = await claim(offer);
      showCode(created.code);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          accessibilityRole="summary"
          style={[styles.banner, { borderColor: theme.warning, backgroundColor: theme.warning + '1A' }]}>
          <Text style={styles.bannerIcon}>🧪</Text>
          <View style={styles.flex}>
            <ThemedText type="smallBold">{t('Demo offers — these partners are examples')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('They’re not real businesses, and the codes won’t work in shops yet.')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.steps}>
          <Step glyph="①" text={t('Claim a deal')} />
          <Step glyph="②" text={t('Show the code at the till')} />
          <Step glyph="③" text={t('The partner pays only when it’s used')} />
        </View>

        <SectionTitle title={t('This week’s offers')} value={t('Resets each Monday')} />
        {DEMO_OFFERS.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            state={offerState(offer, claims, now)}
            region={region}
            busy={busy === offer.id}
            onClaim={() => claimOffer(offer)}
            onShow={showCode}
          />
        ))}

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" accessibilityRole="header">
            {t('How perks work')}
          </ThemedText>
          <Bullet
            text={t('Tap Claim and your phone makes a code just for you. Each code works once and has an expiry date.')}
          />
          <Bullet text={t('Show the QR code at the till, or type the code in when you buy online.')} />
          <Bullet
            text={t('Partners pay MileSprout only when a code is used, never when you claim it. That helps keep MileSprout free.')}
          />
          <Bullet text={t('Each partner sets how many codes it gives out a week. When they’re gone, more come on Monday.')} />
          <Bullet
            text={t('MileSprout never shares your trips. A code has nothing about you in it, and claiming one needs no account.')}
          />
          <Bullet text={t('Perks are just deals: MileSprout works the same whether you use them or not.')} />
        </ThemedView>

        {claims.length > 0 && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => reset()} style={styles.reset}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('Clear demo claims')}
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function Step({ glyph, text }: { glyph: string; text: string }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.step}>
      <Text style={[styles.stepGlyph, { color: theme.accent }]}>{glyph}</Text>
      <ThemedText type="small" style={styles.stepText}>
        {text}
      </ThemedText>
    </ThemedView>
  );
}

function Bullet({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.bullet}>
      <View style={[styles.dot, { backgroundColor: theme.accent }]} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  flex: { flex: 1 },
  banner: { flexDirection: 'row', gap: Spacing.three, borderWidth: 1.5, borderRadius: 16, padding: Spacing.three },
  bannerIcon: { fontSize: 22, lineHeight: 28 },
  steps: { flexDirection: 'row', gap: Spacing.two },
  step: { flex: 1, borderRadius: 12, padding: Spacing.two + 2, gap: Spacing.one },
  stepGlyph: { fontSize: 20, lineHeight: 24, fontWeight: '700' },
  stepText: { fontSize: 13, lineHeight: 17 },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  bullet: { flexDirection: 'row', gap: Spacing.two + 2, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  reset: { alignSelf: 'center', paddingVertical: Spacing.two },
});
