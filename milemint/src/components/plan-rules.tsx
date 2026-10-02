import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';

/**
 * What counts towards the free plan's monthly allowance, in plain words: the
 * same lines on the home screen's "What counts?" sheet and on the paywall, so
 * nobody meets a rule for the first time when a drive waits for Pro.
 * The rules themselves live in domain/plan.
 */
const RULES: readonly [icon: string, text: string][] = [
  ['🚗', msg('Each automatic work drive counts once. Unsorted drives count until you sort them.')],
  ['🏠', msg('Personal drives don’t count. Sort one personal and the next drive gets its place.')],
  ['📦', msg('On shift, a whole shift counts as one drive a day.')],
  ['✍️', msg('Trips you add by hand never count.')],
  [
    '🔒',
    msg(
      'Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro.',
    ),
  ],
  [
    '📅',
    msg('The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st.'),
  ],
];

/** The free plan in one line, then each rule. */
export function PlanRules({ allowance }: { allowance: number }) {
  const t = useT();
  return (
    <View style={styles.rules}>
      <ThemedText type="smallBold">
        {t('Free: {{count}} work drives a month. Pro: unlimited.', { count: allowance })}
      </ThemedText>
      {RULES.map(([icon, text]) => (
        <View key={icon} style={styles.rule}>
          <Text style={styles.icon}>{icon}</Text>
          <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
            {t(text)}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

/** "What counts?": the rules in a sheet that slides up from the home screen's plan meter. */
export function PlanSheet({
  visible,
  allowance,
  onClose,
}: {
  visible: boolean;
  allowance: number;
  onClose: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Close')} style={[styles.backdrop, { backgroundColor: theme.backdrop }]} onPress={onClose} />
      <ThemedView type="sheet" style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={[styles.grabber, { backgroundColor: theme.backgroundSelected }]} />
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" accessibilityRole="header">
            {t('What counts?')}
          </ThemedText>
          <PlanRules allowance={allowance} />
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={[styles.button, { borderColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold">{t('Got it')}</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onClose();
                router.push('/pro');
              }}
              style={[styles.button, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {t('See Pro')}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.two,
    maxHeight: '85%',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.one },
  rules: { gap: Spacing.two },
  rule: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  icon: { fontSize: 16, lineHeight: 20, width: 22 },
  flex: { flex: 1 },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  button: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12, borderWidth: 1.5 },
});
