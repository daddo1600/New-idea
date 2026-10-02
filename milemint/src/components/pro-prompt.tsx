import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/**
 * Where a free user meets an export: what stays free, what Pro adds, and one
 * tap to the Pro screen. Said once per screen, above the export buttons
 * (which then read "Unlock with Pro"), so it informs rather than nags.
 */
export function ProExportPrompt({ body }: { body?: string }) {
  const theme = useTheme();
  const t = useT();
  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: GOLD_EDGE }]}>
      <View style={styles.row}>
        <View style={styles.coin}>
          <LeafMark size={26} />
        </View>
        <View style={styles.flex}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold" style={styles.flexText}>
              {t('Exports are part of Pro')}
            </ThemedText>
            <ProBadge />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {body ?? t('Your totals and year-end summary stay free. Pro adds the itemised log, the PDF report and every export.')}
          </ThemedText>
        </View>
      </View>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/pro')} style={styles.link}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('See what Pro adds ›')}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

/** A small gold "PRO" tag, for anything that needs Pro. */
export function ProBadge() {
  return (
    <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={styles.badgeText}>PRO</Text>
    </View>
  );
}

const GOLD_EDGE = '#EAB308';

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  flex: { flex: 1, gap: Spacing.half },
  flexText: { flexShrink: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  coin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FACC15',
  },
  link: { alignSelf: 'flex-start', paddingLeft: 36 + Spacing.three },
  badge: { backgroundColor: '#FACC15', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { color: '#064E3B', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
});
