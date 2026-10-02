import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePop } from '@/components/pop-press';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** The bars around the trip lists: select, bulk sort, filling in purposes, and the "value waits" note. */

/** "Select" above the list; while selecting, quick picks and Cancel. */
export function SelectBar({
  title,
  selecting,
  unsortedCount,
  onStart,
  onSelectUnsorted,
  onCancel,
}: {
  /** What the list is called ("Trips" when not given; null for none, the actions on the right). */
  title?: string | null;
  selecting: boolean;
  unsortedCount: number;
  onStart: () => void;
  onSelectUnsorted: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={[styles.selectBar, title === null && styles.actionsOnly]}>
      {title !== null && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {title ?? t('Trips')}
        </ThemedText>
      )}
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

/** How long "Every work drive has a purpose ✓" shows in green before the full list comes back. */
const ALL_FILLED_MS = 1600;

/**
 * Above the list while filling in purposes: how many are left, and the way
 * back to all drives. Filling in the last one is a small moment: a success
 * tap, the line pops in green with how many were added, then all drives come back.
 */
export function FillingBar({ count, onDone }: { count: number; onDone: () => void }) {
  const theme = useTheme();
  const t = useT();
  const { style: popStyle, pop } = usePop();
  /** The most drives waiting at once while filling: how many were added when it's done. */
  const [most, setMost] = useState(count);
  if (count > most) setMost(count);
  // Set while rendering, so the green line is there from the first frame the count is 0.
  const [before, setBefore] = useState(count);
  const [cheer, setCheer] = useState(false);
  if (count !== before) {
    setBefore(count);
    if (before > 0 && count === 0) setCheer(true);
  }
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);
  const allFilled = t('Every work drive has a purpose ✓');
  useEffect(() => {
    if (!cheer) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    AccessibilityInfo.announceForAccessibility(allFilled);
    pop();
    const timer = setTimeout(() => done.current(), ALL_FILLED_MS);
    return () => clearTimeout(timer);
    // Once, when the last one is filled in: not again if the words or the pop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheer]);
  return (
    <View style={styles.selectBar}>
      {cheer ? (
        <Animated.View style={[styles.flex, styles.allFilled, popStyle]}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {allFilled}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {t('{{count}} purposes added', { count: most })}
          </ThemedText>
        </Animated.View>
      ) : (
        <ThemedText type="smallBold" style={styles.flex}>
          {count > 0 ? t('{{count}} work drives need a purpose', { count }) : allFilled}
        </ThemedText>
      )}
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
  allFilled: { transformOrigin: 'left center' },
  selectBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.one },
  actionsOnly: { justifyContent: 'flex-end' },
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
