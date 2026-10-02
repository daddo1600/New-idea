import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** The bars around the trip lists: select, bulk sort, filling in purposes, and the "value waits" note. */

/** "Select" above the list; while selecting, quick picks and Cancel. */
export function SelectBar({
  selecting,
  unsortedCount,
  onStart,
  onSelectUnsorted,
  onCancel,
}: {
  selecting: boolean;
  unsortedCount: number;
  onStart: () => void;
  onSelectUnsorted: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.selectBar}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('Trips')}
      </ThemedText>
      <View style={styles.selectActions}>
        {selecting && unsortedCount > 0 && (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onSelectUnsorted}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {t('Select {{count}} unsorted', { count: unsortedCount })}
            </ThemedText>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={selecting ? t('Stop selecting trips') : t('Select several trips to sort at once')}
          hitSlop={8}
          onPress={selecting ? onCancel : onStart}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {selecting ? t('Cancel') : t('Select')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

/** Pinned to the bottom while selecting. */
export function BulkActions({
  count,
  bottom,
  onBusiness,
  onPersonal,
}: {
  count: number;
  bottom: number;
  onBusiness: () => void;
  onPersonal: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const disabled = count === 0;
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.bulkBar, { paddingBottom: Spacing.three + bottom, borderTopColor: theme.backgroundSelected }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.bulkCount}>
        {count === 0 ? t('Tap trips to select them') : t('{{count}} selected', { count })}
      </ThemedText>
      <View style={styles.bulkButtons}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onBusiness}
          style={[styles.bulkButton, { backgroundColor: theme.accent, opacity: disabled ? 0.5 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Business')}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onPersonal}
          style={[styles.bulkButton, { backgroundColor: theme.backgroundSelected, opacity: disabled ? 0.5 : 1 }]}>
          <ThemedText type="smallBold">{t('Personal')}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

/** Above the list while filling in purposes: how many are left, and the way back to all drives. */
export function FillingBar({ count, onDone }: { count: number; onDone: () => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.selectBar}>
      <ThemedText type="smallBold" style={styles.flex}>
        {count > 0 ? t('{{count}} work drives need a purpose', { count }) : t('Every work drive has a purpose ✓')}
      </ThemedText>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onDone}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {count > 0 ? t('Show all drives') : t('Done')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

/**
 * Said when a drive sorted back from personal has to wait for Pro because the
 * month's free drives are used: the one case where a drive the user touches
 * doesn't show its value (domain/plan explains why it's this drive and not
 * one already showing its value).
 */
export function ValueWaitsNotice({ bottom, onClose }: { bottom: number; onClose: () => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityHint={t('Closes this message')}
      onPress={onClose}
      style={[styles.notice, { bottom: bottom + 96, backgroundColor: theme.text }]}>
      <Text style={[styles.noticeText, { color: theme.background }]}>
        {t(
          'Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it.',
        )}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: Spacing.one },
  selectBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.one },
  selectActions: { flexDirection: 'row', gap: Spacing.four, alignItems: 'center' },
  bulkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bulkCount: { textAlign: 'center' },
  bulkButtons: { flexDirection: 'row', gap: Spacing.two, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  bulkButton: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  notice: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    borderRadius: 14,
    padding: Spacing.three,
  },
  noticeText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
