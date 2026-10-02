import { StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { GoldButton } from '@/components/gold-button';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { FOUNDING_BOOST_ENDS } from '@/constants/rewards';
import { Spacing } from '@/constants/theme';
import { friendsNeeded, PERK_LADDER } from '@/domain/plan';
import { displayLocale } from '@/domain/regions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { PERK_DETAILS, PERK_NAMES } from '@/referral/perks';
import { useReferral } from '@/referral/referral';
import { useRegion } from '@/region/region';

const GOLD = '#FACC15';
const MINT_TEXT = '#D1FAE5';

/** The founding boost's last day, short and in the user's language, e.g. "31 Jan". */
function useBoostEnd(): string {
  const { region } = useRegion();
  const [y, m, d] = FOUNDING_BOOST_ENDS.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(displayLocale(region), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/**
 * The invite's call to action, on the brand green: what the friend gets (once
 * the offer code is set), what the inviter gets, and a big gold button that
 * opens the share sheet with a ready-made message and a fresh invite code.
 */
export function InviteHero({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const { loaded, sharing, shareInvite, offerCode, boost } = useReferral();
  const boostEnd = useBoostEnd();
  const canShare = loaded && !sharing;
  return (
    <View style={[styles.hero, compact && styles.heroCompact]}>
      <BrandGradient />
      <View style={styles.watermark} pointerEvents="none">
        <LeafMark size={compact ? 140 : 170} opacity={0.12} car={false} />
      </View>
      {boost && (
        <View style={styles.boostPill}>
          <Text style={styles.boostPillText}>{t('Founding boost')}</Text>
        </View>
      )}
      <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]} accessibilityRole="header">
        {offerCode ? t('Give 50% off. Get free extras.') : t('Invite a driver, unlock free extras')}
      </Text>
      <Text style={styles.heroBody}>
        {offerCode
          ? t('Your friend gets 50% off their first year of Pro. You unlock extras, free for good, as friends join.')
          : t('Share MileSprout with drivers you know. You unlock extras, free for good, as friends join.')}
      </Text>
      <View style={styles.heroButton}>
        <GoldButton
          label={sharing ? t('Opening…') : t('Invite a driver')}
          disabled={!canShare}
          onPress={() => shareInvite().catch(() => {})}
        />
      </View>
      {boost && (
        <Text style={styles.boostLine}>{t('Founding boost: perks unlock faster until {{date}}', { date: boostEnd })}</Text>
      )}
      {!compact && <Text style={styles.heroSmall}>{t('Every invite has its own code, for one friend.')}</Text>}
    </View>
  );
}

/**
 * The sprout garden: one sprout per perk on the ladder, a seedling until it's
 * earned and green once it is, with how many friends each needs and the next
 * reward ("1 more friend → Tax set-aside"). `detailed` adds what each perk is.
 */
export function SproutGarden({ detailed = false }: { detailed?: boolean }) {
  const t = useT();
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  const { perks, next, friendsJoined } = useReferral();
  const now = new Date();
  const bed = dark ? '#0B2A20' : '#ECFDF5';
  const soil = dark ? '#3F2A1C' : '#D6C2A8';
  return (
    <View style={[styles.garden, { backgroundColor: bed }]}>
      <View style={styles.gardenHeader}>
        <ThemedText type="smallBold">{t('Your sprout garden')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('{{count}} friends joined', { count: friendsJoined })}
        </ThemedText>
      </View>
      <View style={styles.plots}>
        {PERK_LADDER.map((step) => {
          const earned = perks.includes(step.perk);
          const need = friendsNeeded(step, now);
          return (
            <View
              key={step.perk}
              style={styles.plot}
              accessible
              accessibilityLabel={
                earned
                  ? t('{{perk}}: unlocked', { perk: t(PERK_NAMES[step.perk]) })
                  : t('{{perk}}: {{count}} friends', { perk: t(PERK_NAMES[step.perk]), count: need })
              }>
              <View style={[styles.sprout, { height: detailed ? 64 : 52 }]}>
                {/* Seedlings until earned, full grown (with the gold car dot) once they are. */}
                <LeafMark
                  size={(detailed ? 64 : 52) * (earned ? 1 : 0.8)}
                  car={earned}
                  palette={earned ? 'mint' : 'seedling'}
                  opacity={earned ? 1 : 0.6}
                />
                {earned && (
                  <View style={[styles.tick, { backgroundColor: theme.accent }]}>
                    <Text style={[styles.tickText, { color: theme.onAccent }]}>✓</Text>
                  </View>
                )}
              </View>
              <View style={[styles.soil, { backgroundColor: soil }]} />
              <ThemedText type="smallBold" style={styles.plotName} numberOfLines={2}>
                {t(PERK_NAMES[step.perk])}
              </ThemedText>
              <ThemedText
                type="small"
                style={[styles.plotNeed, { color: earned ? theme.accent : theme.textSecondary }]}
                numberOfLines={1}>
                {earned ? t('Unlocked') : t('{{count}} friends', { count: need })}
              </ThemedText>
            </View>
          );
        })}
      </View>
      <View style={[styles.next, { borderTopColor: dark ? '#14532D' : '#BBF7D0' }]}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {next
            ? t('{{count}} more friend → {{perk}}', { count: next.more, perk: t(PERK_NAMES[next.perk]) })
            : t('Every perk unlocked. Thank you for helping MileSprout grow!')}
        </ThemedText>
      </View>
      {detailed && (
        <View style={styles.details}>
          {PERK_LADDER.map((step) => (
            <View key={step.perk} style={styles.detailRow}>
              <Text style={styles.detailIcon}>{perks.includes(step.perk) ? '🌿' : '🌱'}</Text>
              <View style={styles.flex}>
                <ThemedText type="smallBold">{t(PERK_NAMES[step.perk])}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t(PERK_DETAILS[step.perk])}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** The "Founding driver" badge, earned at the top of the perk ladder. */
export function FoundingBadge() {
  const t = useT();
  return (
    <View style={styles.badge}>
      <LeafMark size={20} palette="gold" car={false} />
      <Text style={styles.badgeText}>{t('Founding driver')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  hero: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: 'hidden',
    alignItems: 'center',
  },
  heroCompact: { padding: Spacing.three, paddingTop: Spacing.four },
  watermark: { position: 'absolute', right: -56, top: -44 },
  boostPill: {
    backgroundColor: 'rgba(250,204,21,0.18)',
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
  },
  boostPillText: { color: '#FEF08A', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  heroTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '800', textAlign: 'center' },
  heroTitleCompact: { fontSize: 22, lineHeight: 28 },
  heroBody: { color: MINT_TEXT, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  heroButton: { alignSelf: 'stretch', marginTop: Spacing.two },
  boostLine: { color: '#FEF08A', fontSize: 13, lineHeight: 18, fontWeight: '700', textAlign: 'center' },
  heroSmall: { color: MINT_TEXT, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  garden: { borderRadius: 16, paddingTop: Spacing.three, overflow: 'hidden' },
  gardenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  plots: { flexDirection: 'row', paddingHorizontal: Spacing.two, paddingTop: Spacing.two },
  plot: { flex: 1, alignItems: 'center', gap: 2 },
  sprout: { alignItems: 'center', justifyContent: 'flex-end' },
  tick: {
    position: 'absolute',
    top: 0,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: { fontSize: 12, lineHeight: 14, fontWeight: '900' },
  soil: { width: '70%', height: 6, borderRadius: 3, marginTop: -2, marginBottom: Spacing.one },
  plotName: { textAlign: 'center', fontSize: 13, lineHeight: 17 },
  plotNeed: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  next: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  details: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },
  detailRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  detailIcon: { fontSize: 18, lineHeight: 22 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF9C3',
    borderColor: '#CA8A04',
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: Spacing.one,
    paddingRight: Spacing.two + 2,
    paddingVertical: 3,
  },
  badgeText: { color: '#713F12', fontSize: 13, fontWeight: '800' },
});
