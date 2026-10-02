import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { InviteHero, SproutGarden } from '@/components/invite';
import { firstCode, RedeemCode } from '@/components/redeem-code';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useReferral } from '@/referral/referral';

/**
 * "Invite friends": the gift for the friend and the perks for the sharer,
 * a big button that sends an invite (a new single-use code every time), the
 * sprout garden of perks, how many were sent and joined, and (in the first
 * 30 days) a box for a friend's code.
 */
export default function FriendsScreen() {
  const t = useT();
  const theme = useTheme();
  const { isPro } = usePro();
  const { invitesSent, redeemedCode, redeemStatus, friendsJoined, counting, giftOpen } = useReferral();
  /** From an invite link (milemint://invite/CODE): filled in, ready to redeem. */
  const { code: codeParam } = useLocalSearchParams<{ code?: string | string[] }>();
  // A link can carry the parameter twice (an array) or be very long: take the first, cut short.
  const linkCode = firstCode(codeParam);

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
        <InviteHero />

        <SproutGarden detailed />

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{t('Invites sent: {{count}}', { count: invitesSent })}</ThemedText>
          {counting ? (
            <>
              <ThemedText type="small">{t('Friends joined: {{count}}', { count: friendsJoined })}</ThemedText>
              {friendsJoined === 0 && (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('Friends count once they’ve logged a few drives.')}
                </ThemedText>
              )}
            </>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'Invites are confirmed through iCloud, which is coming in an update. Friends who join before then count once it’s switched on.',
              )}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {t('Tax set-aside and earnings by platform are both ready now, in the Money tab.')}
          </ThemedText>
          {isPro && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('You have Pro, so these are already yours. Your sprout garden still grows, and so does your badge.')}
            </ThemedText>
          )}
        </ThemedView>

        {giftOpen && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/pro')}
            style={[styles.card, styles.gift, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">🎁 {t('Your friend’s gift: 50% off your first year of Pro')}</ThemedText>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {t('Redeem your friend’s gift ›')}
            </ThemedText>
          </Pressable>
        )}

        {redeemedCode ? (
          <ThemedText type="small" themeColor="textSecondary">
            {redeemStatus === 'granted'
              ? t('You joined with {{code}}.', { code: redeemedCode })
              : t('You entered {{code}}. It’s confirmed once iCloud can check it.', { code: redeemedCode })}
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
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  gift: { borderWidth: 1, borderColor: '#EAB308' },
});
