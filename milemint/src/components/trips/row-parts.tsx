import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { displayLocale, type Region } from '@/domain/regions';
import type { Classification } from '@/domain/trip';
import { msg } from '@/i18n/i18n';

/** What the trip rows share: the Work/Personal choice, the swipe and their styles. */

export const CLASSIFY_OPTIONS = [
  { value: 'business', label: msg('Work (drive type)') },
  { value: 'personal', label: msg('Personal') },
] as const satisfies readonly { value: Classification; label: string }[];

/** How far a row must be dragged before letting go classifies it. */
export const SWIPE_THRESHOLD = 80;

export function SwipeAction({
  label,
  color,
  textColor,
  side,
}: {
  label: string;
  color: string;
  textColor: string;
  side: 'left' | 'right';
}) {
  return (
    <View
      style={[
        rowStyles.swipeAction,
        { backgroundColor: color, alignItems: side === 'left' ? 'flex-start' : 'flex-end' },
      ]}>
      <ThemedText type="smallBold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </View>
  );
}

/** A trip's start time the way the user's country and language write it ("4:12 PM", "16:12"). */
export function formatTime(iso: string, region: Region): string {
  return new Date(iso).toLocaleTimeString(displayLocale(region), { hour: 'numeric', minute: '2-digit' });
}

export const rowStyles = StyleSheet.create({
  row: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  route: { flex: 1 },
  savedLine: { alignSelf: 'flex-start' },
  flex: { flex: 1, gap: Spacing.one },
  swipeAction: {
    width: 120,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
  },
});
