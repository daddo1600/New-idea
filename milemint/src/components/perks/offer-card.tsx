import { StyleSheet, View } from 'react-native';

import { PopPress } from '@/components/pop-press';
import { PerkEmblem } from '@/components/perks/perk-emblem';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Region } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import type { OfferState } from '@/perks/claims';
import { claimDate } from '@/perks/format';
import type { PerkOffer } from '@/perks/offers';

/**
 * One partner's offer: who, what, the small print and how many are left this
 * week, then Claim, or the code already claimed. No distance or map: Perks
 * never use the user's location.
 */
export function OfferCard({
  offer,
  state,
  region,
  busy,
  onClaim,
  onShow,
}: {
  offer: PerkOffer;
  state: OfferState;
  region: Region;
  busy: boolean;
  onClaim: () => void;
  onShow: (code: string) => void;
}) {
  const t = useT();
  const theme = useTheme();
  const { left, latest, status, canClaim } = state;
  const low = left <= Math.max(3, offer.weeklyCap * 0.2);
  const barColor = left === 0 ? theme.textSecondary : low ? theme.warning : theme.accent;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.top}>
        <PerkEmblem offer={offer} />
        <View style={styles.flex}>
          <ThemedText type="smallBold">{offer.partner}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t(offer.category)} · {offer.kind === 'online' ? t('Online code') : t('In store')}
          </ThemedText>
        </View>
      </View>

      <View style={styles.what}>
        <ThemedText style={styles.headline}>{t(offer.headline)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t(offer.terms)}
        </ThemedText>
      </View>

      <View style={styles.capRow}>
        <View
          style={[styles.track, { backgroundColor: theme.backgroundSelected }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: offer.weeklyCap, now: left }}>
          <View style={[styles.fill, { width: `${(left / offer.weeklyCap) * 100}%`, backgroundColor: barColor }]} />
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.capText}>
          {left === 0
            ? t('None left this week')
            : t('{{left}} of {{cap}} left this week', { left, cap: offer.weeklyCap })}
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <View style={styles.flex}>
          {status === 'active' && latest && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {t('Claimed · expires {{date}}', { date: claimDate(latest.expiresAt, region) })}
            </ThemedText>
          )}
          {status === 'redeemed' && latest?.redeemedAt && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {t('Redeemed ✓ · {{date}}', { date: claimDate(latest.redeemedAt, region) })}
            </ThemedText>
          )}
          {!canClaim && status !== 'active' && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('More codes on Monday.')}
            </ThemedText>
          )}
        </View>
        {status === 'active' && latest ? (
          <PopPress
            accessibilityRole="button"
            accessibilityLabel={t('Show code for {{partner}}', { partner: offer.partner })}
            onPress={() => onShow(latest.code)}
            scale={1.05}
            style={({ pressed }) => [
              styles.button,
              styles.outline,
              { borderColor: theme.accent, opacity: pressed ? 0.8 : 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {t('Show code')}
            </ThemedText>
          </PopPress>
        ) : (
          canClaim && (
            <PopPress
              accessibilityRole="button"
              accessibilityLabel={t('Claim: {{offer}}', { offer: `${offer.partner}, ${t(offer.headline)}` })}
              disabled={busy}
              onPress={onClaim}
              scale={1.05}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.accent, opacity: busy ? 0.6 : pressed ? 0.8 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {status === 'redeemed' ? t('Claim again') : t('Claim')}
              </ThemedText>
            </PopPress>
          )
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two + 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex: { flex: 1 },
  what: { gap: Spacing.half },
  headline: { fontSize: 19, lineHeight: 25, fontWeight: '700' },
  capRow: { gap: Spacing.one },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  capText: { fontVariant: ['tabular-nums'] },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 40 },
  button: {
    borderRadius: 10,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    minWidth: 104,
    alignItems: 'center',
  },
  outline: { borderWidth: 1.5 },
});
