import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Shown when iOS granted location only "While Using" (or not at all): iOS's
 * own "Change to Always Allow" prompt appears at most once per install and
 * sometimes never, so the reliable way is Settings. A small replica of the
 * Settings screen shows exactly what to tap.
 */
const OPTIONS = ['Never', 'Ask Next Time Or When I Share', 'While Using the App', 'Always'] as const;

export function AlwaysGuide({ current }: { current: 'While Using the App' | 'Never' }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.card} accessibilityRole="alert">
      <ThemedText type="smallBold">One quick switch in Settings</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        iOS only offers “Always” in Settings. It takes ten seconds, and MileMint carries on by itself when you
        come back.
      </ThemedText>

      <View style={styles.steps}>
        {['Tap “Open Settings” below', 'Tap “Location”', 'Choose “Always”'].map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={[styles.number, { backgroundColor: theme.accent }]}>
              <Text style={[styles.numberText, { color: theme.onAccent }]}>{i + 1}</Text>
            </View>
            <ThemedText type="small">{step}</ThemedText>
          </View>
        ))}
      </View>

      {/* What they'll see in Settings → MileMint → Location. */}
      <View
        accessible
        accessibilityLabel="In Settings, under Allow Location Access, choose Always"
        style={[styles.mock, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
        <Text style={[styles.mockHeader, { color: theme.textSecondary }]}>ALLOW LOCATION ACCESS</Text>
        {OPTIONS.map((option, i) => {
          const target = option === 'Always';
          return (
            <View
              key={option}
              style={[
                styles.mockRow,
                i > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: theme.backgroundSelected,
                },
                target && { backgroundColor: theme.accent + '24' },
              ]}>
              <Text
                style={[
                  styles.mockText,
                  { color: target ? theme.accent : theme.textSecondary, fontWeight: target ? '700' : '400' },
                ]}>
                {option}
              </Text>
              {option === current && <Text style={[styles.mockText, { color: theme.textSecondary }]}>✓</Text>}
              {target && (
                <View style={styles.tapBadge}>
                  <Text style={styles.tapText}>Tap here</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  steps: { gap: Spacing.one + 2, marginTop: Spacing.one },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  number: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 12, fontWeight: '800' },
  mock: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  mockHeader: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 4,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
  },
  mockText: { fontSize: 14 },
  tapBadge: { backgroundColor: '#FACC15', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tapText: { color: '#064E3B', fontSize: 11, fontWeight: '800' },
});
