import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { PopPress } from '@/components/pop-press';
import { PerkEmblem } from '@/components/perks/perk-emblem';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { getPerkClaim, markPerkRedeemed } from '@/db/perks-repo';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { claimStatus, secondsLeft, type PerkClaim } from '@/perks/claims';
import { perkRedeemUrl } from '@/perks/code';
import { claimDate, claimTime, countdown } from '@/perks/format';
import { findOffer } from '@/perks/offers';
import { useRegion } from '@/region/region';

/** Dark modules on white, in light and dark mode alike: what till scanners read best. */
const QR_INK = '#000000';
const QR_PAPER = '#FFFFFF';

/**
 * A claimed perk's code: a big QR code to scan at the till, the same code in
 * letters to read out or type in online, and a live countdown. "Demo: till scans"
 * stands in for the till's scan in this demo, to show the whole journey; in
 * the live version a server marks the code used when the partner scans it,
 * and that's when the partner pays.
 */
export default function PerkCodeScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const db = useSQLiteContext();
  const t = useT();
  const theme = useTheme();
  const { region } = useRegion();
  const [claim, setClaim] = useState<PerkClaim | null | undefined>(undefined);
  const [now, setNow] = useState(() => new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPerkClaim(db, code ?? '').then(setClaim, () => setClaim(null));
  }, [code, db]);
  // The countdown, to the second.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  if (claim === undefined) return <ActivityIndicator style={styles.loading} />;
  const offer = claim ? findOffer(claim.offerId) : undefined;
  if (!claim || !offer) {
    return (
      <ThemedView style={[styles.container, styles.missing]}>
        <ThemedText themeColor="textSecondary">{t('This code isn’t on this phone any more.')}</ThemedText>
      </ThemedView>
    );
  }

  const status = claimStatus(claim, now);
  const left = secondsLeft(claim, now) ?? 0;
  const online = offer.kind === 'online';

  const copy = async () => {
    // The web preview can copy straight away; on the iPhone the share sheet has Copy (no clipboard module needed).
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(claim.code).catch(() => {});
      setCopied(true);
      return;
    }
    await Share.share({ message: claim.code }).catch(() => {});
  };

  const markUsed = async () => {
    await markPerkRedeemed(db, claim.code, new Date());
    setNow(new Date());
    setClaim(await getPerkClaim(db, claim.code));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.partner}>
          <PerkEmblem offer={offer} size={44} />
          <View style={styles.flex}>
            <ThemedText type="smallBold">{offer.partner}</ThemedText>
            <ThemedText style={styles.headline}>{t(offer.headline)}</ThemedText>
          </View>
        </View>

        <View style={styles.ticket}>
          <View style={[styles.qr, status !== 'active' && styles.faded]}>
            <QRCode value={perkRedeemUrl(claim.code)} size={220} color={QR_INK} backgroundColor={QR_PAPER} ecl="M" />
          </View>
          {status === 'redeemed' && (
            <View style={styles.stamp} accessibilityRole="text">
              <Text style={[styles.stampText, { color: Colors.light.accent, borderColor: Colors.light.accent }]}>{t('Redeemed ✓')}</Text>
            </View>
          )}
          {status === 'expired' && (
            <View style={styles.stamp}>
              <Text style={[styles.stampText, { color: Colors.light.danger, borderColor: Colors.light.danger }]}>{t('Expired')}</Text>
            </View>
          )}
          <Text selectable style={styles.code} accessibilityLabel={claim.code.split('').join(' ')}>
            {claim.code}
          </Text>
          <Text style={styles.ticketHint}>
            {status === 'active'
              ? online
                ? t('Type this code in at checkout')
                : t('Show this at the till')
              : t(offer.terms)}
          </Text>
        </View>

        {status === 'active' && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText
              style={[styles.countdown, left < 5 * 60 && { color: theme.danger }]}
              accessibilityRole="timer">
              {t('Use within {{time}}', { time: countdown(left) })}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('Expires {{date}} at {{time}}. Works once.', {
                date: claimDate(claim.expiresAt, region),
                time: claimTime(claim.expiresAt, region),
              })}
            </ThemedText>
          </ThemedView>
        )}

        {status === 'redeemed' && claim.redeemedAt && (
          <View style={[styles.card, styles.done, { borderColor: theme.accent, backgroundColor: theme.accent + '14' }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {t('Used {{date}} at {{time}}', {
                date: claimDate(claim.redeemedAt, region),
                time: claimTime(claim.redeemedAt, region),
              })}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('This is when {{partner}} pays MileSprout: when the code is used, not when it was claimed.', {
                partner: offer.partner,
              })}
            </ThemedText>
          </View>
        )}

        {status === 'expired' && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{t('Expired — back in the pool')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('Not used in time, so it doesn’t count. Claim again from Perks.')}
            </ThemedText>
          </ThemedView>
        )}

        {status === 'active' && online && (
          <PopPress
            accessibilityRole="button"
            onPress={copy}
            scale={1.04}
            style={({ pressed }) => [styles.button, { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {copied ? t('Copied ✓') : Platform.OS === 'web' ? t('Copy code') : t('Copy or share code')}
            </ThemedText>
          </PopPress>
        )}

        {status === 'active' && (
          // Staff's side, not the driver's: the till marks a code used. Kept small, for showing the journey.
          <View style={[styles.demo, { borderTopColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              {t('Demo only — in the live version the till does this')}
            </ThemedText>
            <PopPress
              accessibilityRole="button"
              onPress={markUsed}
              scale={1.04}
              style={({ pressed }) => [
                styles.demoButton,
                { borderColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Demo: till scans the code')}
              </ThemedText>
            </PopPress>
          </View>
        )}

        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {t('This code has nothing about you in it: no name, no trips, no location.')}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  container: { flex: 1 },
  missing: { alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  flex: { flex: 1 },
  partner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  headline: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  // Always white, like a paper voucher, so the QR code has its quiet zone in dark mode too.
  ticket: {
    backgroundColor: QR_PAPER,
    borderRadius: 20,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
  },
  qr: { padding: Spacing.two },
  faded: { opacity: 0.15 },
  stamp: { position: 'absolute', top: 100, left: 0, right: 0, alignItems: 'center' },
  stampText: {
    fontSize: 26,
    fontWeight: '800',
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: QR_PAPER,
    overflow: 'hidden',
    transform: [{ rotate: '-8deg' }],
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: QR_INK,
    marginTop: Spacing.one,
  },
  ticketHint: { fontSize: 15, lineHeight: 20, fontWeight: '600', color: Colors.light.textSecondary, textAlign: 'center' },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  countdown: { fontSize: 22, lineHeight: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  done: { borderWidth: 1.5 },
  button: { borderRadius: 12, paddingVertical: Spacing.three, alignItems: 'center' },
  demo: { gap: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, alignItems: 'center' },
  demoButton: { borderWidth: 1, borderRadius: 10, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three },
  center: { textAlign: 'center' },
});
