import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import type { RedeemProblem } from '@/referral/code';
import { useReferral } from '@/referral/referral';

const PROBLEMS: Record<RedeemProblem, string> = {
  format: msg('That doesn’t look like a MileMint code. It’s 4 letters, a dash and 3 more, like TRVB-7K2.'),
  own: msg('That’s your own code. Share it with friends instead.'),
  already: msg('A friend’s code has already been used on this iPhone.'),
  expired: msg('A friend’s code can only be entered in the first 30 days after installing MileMint.'),
};

/**
 * "Got a code from a friend?": a link that opens a box for a friend's
 * referral code. `onBrand` for the green welcome screen. `initialCode` (from
 * an invite link) opens it already filled in. Renders nothing
 * (not even `style`'s box) once a code can't be entered any more.
 */
export function RedeemCode({
  onBrand = false,
  initialCode,
  style,
}: {
  onBrand?: boolean;
  initialCode?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useT();
  const theme = useTheme();
  const { canRedeem, redeemedCode, redeem } = useReferral();
  const [open, setOpen] = useState(!!initialCode);
  const [text, setText] = useState(initialCode ?? '');
  const [problem, setProblem] = useState<RedeemProblem | null>(null);
  const [busy, setBusy] = useState(false);
  /** Redeemed here, just now: show the thank-you. */
  const [done, setDone] = useState(false);

  const color = onBrand ? '#FFFFFF' : theme.text;
  const soft = onBrand ? '#D1FAE5' : theme.textSecondary;
  const link = onBrand ? '#FACC15' : theme.accent;

  if (done && redeemedCode) {
    return (
      <View style={[styles.box, style]} accessibilityLiveRegion="polite">
        <Text style={[styles.title, { color }]}>🎉 {t('Code {{code}} added', { code: redeemedCode })}</Text>
        <Text style={[styles.body, { color: soft }]}>{t('You get 10 extra free drives every month.')}</Text>
      </View>
    );
  }
  if (!canRedeem) return null;

  if (!open) {
    return (
      <View style={style}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setOpen(true)}>
          <Text style={[styles.link, { color: link }]}>{t('Got a code from a friend?')}</Text>
        </Pressable>
      </View>
    );
  }

  const submit = async () => {
    setBusy(true);
    try {
      const result = await redeem(text);
      setProblem(result);
      if (!result) setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.box, style]}>
      <Text style={[styles.title, { color }]}>{t('Got a code from a friend?')}</Text>
      <Text style={[styles.body, { color: soft }]}>{t('Enter it for 10 extra free drives every month.')}</Text>
      <View style={styles.row}>
        <TextInput
          accessibilityLabel={t('Friend’s code')}
          value={text}
          onChangeText={(next) => {
            setText(next);
            setProblem(null);
          }}
          placeholder="TRVB-7K2"
          placeholderTextColor={onBrand ? 'rgba(255,255,255,0.5)' : theme.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={12}
          returnKeyType="done"
          onSubmitEditing={submit}
          style={[
            styles.input,
            onBrand
              ? { color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.14)' }
              : { color: theme.text, backgroundColor: theme.background },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: busy || !text.trim() }}
          disabled={busy || !text.trim()}
          onPress={submit}
          style={[
            styles.button,
            { backgroundColor: onBrand ? '#FFFFFF' : theme.accent, opacity: busy || !text.trim() ? 0.5 : 1 },
          ]}>
          <ThemedText type="smallBold" style={{ color: onBrand ? '#064E3B' : theme.onAccent }}>
            {t('Redeem')}
          </ThemedText>
        </Pressable>
      </View>
      {problem && (
        <Text accessibilityRole="alert" style={[styles.body, { color: onBrand ? '#FDE68A' : theme.danger }]}>
          {t(PROBLEMS[problem])}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: Spacing.two },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  link: { fontSize: 15, fontWeight: '700', paddingVertical: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  button: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 4 },
});
