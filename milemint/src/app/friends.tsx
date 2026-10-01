import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { RedeemCode } from '@/components/redeem-code';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { FREE_AUTO_DRIVES_PER_MONTH, REFERRAL_BONUS_DRIVES } from '@/domain/plan';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { inviteMessage } from '@/referral/links';
import { useReferral } from '@/referral/referral';

/**
 * "Invite friends", Dropbox style: your code, a Share button, how many
 * friends joined with it, and (in the first 30 days) a box for a friend's code.
 */
export default function FriendsScreen() {
  const t = useT();
  const theme = useTheme();
  const { isPro } = usePro();
  const { code, redeemedCode, friendsJoined, counting, allowance } = useReferral();
  /** From an invite link (milemint://invite/CODE): filled in, ready to redeem. */
  const { code: linkCode } = useLocalSearchParams<{ code?: string }>();

  const share = () => Share.share({ message: inviteMessage() }).catch(() => {});

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
              'When a friend joins MileMint with your code, you both get 10 extra free automatic drives a month. For every friend, with no limit.',
            )}
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>{t('Your code')}</Text>
            <Text selectable style={styles.code} accessibilityLabel={code ? code.split('').join(' ') : undefined}>
              {code ?? '…'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!code}
            onPress={share}
            style={[styles.share, !code && styles.dim]}>
            <Text style={styles.shareText}>{t('Share my code')}</Text>
          </Pressable>
        </View>

        {counting ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">
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
          </ThemedView>
        ) : (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t(
                'Your friends get their extra drives as soon as they enter your code. Yours are added when MileMint can count the friends who joined, coming in an update.',
              )}
            </ThemedText>
          </ThemedView>
        )}

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
            {t('You joined with {{code}}: 10 extra free drives a month.', { code: redeemedCode })}
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
  codeBox: {
    marginTop: Spacing.two,
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  codeLabel: { color: '#D1FAE5', fontSize: 13, fontWeight: '600' },
  code: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: 3 },
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
