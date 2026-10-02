import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { firstCode, RedeemCode } from '@/components/redeem-code';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { FREE_AUTO_DRIVES_PER_MONTH, REFERRAL_BONUS_DRIVES } from '@/domain/plan';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useReferral } from '@/referral/referral';

/**
 * "Invite friends", Dropbox style: send an invite (a new single-use code
 * every time), how many were sent and how many friends joined, and (in the
 * first 30 days) a box for a friend's code.
 */
export default function FriendsScreen() {
  const t = useT();
  const theme = useTheme();
  const { isPro } = usePro();
  const {
    loaded,
    invitesSent,
    redeemedCode,
    redeemStatus,
    friendsJoined,
    counting,
    allowance,
    shareInvite,
    sharing,
  } = useReferral();
  /** From an invite link (milemint://invite/CODE): filled in, ready to redeem. */
  const { code: codeParam } = useLocalSearchParams<{ code?: string | string[] }>();
  // A link can carry the parameter twice (an array) or be very long: take the first, cut short.
  const linkCode = firstCode(codeParam);

  const share = () => shareInvite().catch(() => {});
  const canShare = loaded && !sharing;

  return (
    <ThemedView style={styles.container}>
      {/* Opened from an invite link there's nothing to go back to. */}
      {!router.canGoBack() && (
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.replace('/')}>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  {t('Done')}
                </ThemedText>
              </Pressable>
            ),
          }}
        />
      )}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <BrandGradient />
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>{t('More free drives for every friend')}</Text>
          <Text style={styles.heroBody}>
            {t(
              'Send a friend an invite. When they join MileSprout with it, you both get 10 extra free automatic drives a month. For every friend, with no limit.',
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canShare }}
            disabled={!canShare}
            onPress={share}
            style={[styles.share, !canShare && styles.dim]}>
            <Text style={styles.shareText}>{t('Send an invite')}</Text>
          </Pressable>
          <Text style={styles.codeLabel}>{t('Every invite has its own code, for one friend.')}</Text>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{t('Invites sent: {{count}}', { count: invitesSent })}</ThemedText>
          {counting ? (
            <>
              <ThemedText type="small">
                {t('Friends joined: {{count}} · +{{drives}} free drives a month', {
                  count: friendsJoined,
                  drives: friendsJoined * REFERRAL_BONUS_DRIVES,
                })}
              </ThemedText>
              {friendsJoined === 0 && (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('Friends count once they’ve logged a few drives.')}
                </ThemedText>
              )}
            </>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you.',
              )}
            </ThemedText>
          )}
        </ThemedView>

        {isPro ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('You have Pro, so your drives are already unlimited. Your friends still get their extra drives.')}
          </ThemedText>
        ) : (
          allowance > FREE_AUTO_DRIVES_PER_MONTH && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('Your free plan: {{count}} automatic drives a month.', { count: allowance })}
            </ThemedText>
          )
        )}

        {redeemedCode ? (
          <ThemedText type="small" themeColor="textSecondary">
            {redeemStatus === 'granted'
              ? t('You joined with {{code}}: 10 extra free drives a month.', { code: redeemedCode })
              : t('You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed.', {
                  code: redeemedCode,
                })}
          </ThemedText>
        ) : (
          <RedeemCode initialCode={linkCode} style={[styles.card, { backgroundColor: theme.backgroundElement }]} />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  hero: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: 'hidden',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 40, lineHeight: 48 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '800', textAlign: 'center' },
  heroBody: { color: '#D1FAE5', fontSize: 16, lineHeight: 22, textAlign: 'center' },
  codeLabel: { color: '#D1FAE5', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  share: {
    marginTop: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two + 4,
  },
  shareText: { color: '#064E3B', fontSize: 16, fontWeight: '800' },
  dim: { opacity: 0.5 },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
});
