import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/**
 * The forgiving side of shifts: offers that fix the usual slips with one tap
 * (started late, still on at home, swiped off by mistake).
 */

/** A question with one action and a way to wave it away; also asks "Is this home?" (place-ask-card). */
export function PromptCard({
  title,
  body,
  action,
  dismiss,
  onAction,
  onDismiss,
}: {
  title: string;
  body: string;
  action: string;
  dismiss: string;
  onAction: () => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.accent }]}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {body}
      </ThemedText>
      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={[styles.button, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {action}
          </ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onDismiss} style={styles.button}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {dismiss}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

/** "Start shift from 10:40?": drives that look like work happened before the shift was started. */
export function BackdateOffer({
  time,
  count,
  running,
  onAccept,
  onDismiss,
}: {
  time: string;
  count: number;
  /** A shift is on already (started late), rather than none at all. */
  running: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const t = useT();
  return (
    <PromptCard
      title={running ? t('Did your shift start at {{time}}?', { time }) : t('Start shift from {{time}}?', { time })}
      body={t('{{count}} drives since then look like deliveries. They’ll be added to the shift as work.', {
        count,
      })}
      action={t('Start from {{time}}', { time })}
      dismiss={t('Not now')}
      onAction={onAccept}
      onDismiss={onDismiss}
    />
  );
}

/** Parked at Home for a while with a shift on: probably done for the day. */
export function EndShiftPrompt({ since, onEnd, onDismiss }: { since: string; onEnd: () => void; onDismiss: () => void }) {
  const t = useT();
  return (
    <PromptCard
      title={t('End your shift?')}
      body={t('You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work.', {
        time: since,
      })}
      action={t('End shift')}
      dismiss={t('Still working')}
      onAction={onEnd}
      onDismiss={onDismiss}
    />
  );
}

/** "Shift ended · Undo", for a few seconds after swiping the shift off. */
export function UndoEndBar({ onUndo }: { onUndo: () => void }) {
  const t = useT();
  // A dark toast in light and dark mode alike.
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOut} style={styles.undo}>
      <ThemedText type="smallBold" style={[styles.flex, { color: '#FFFFFF' }]} accessibilityLiveRegion="polite">
        {t('Shift ended')}
      </ThemedText>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Undo ending the shift')} hitSlop={10} onPress={onUndo}>
        <ThemedText type="smallBold" style={{ color: '#6EE7B7' }}>
          {t('Undo')}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one + 2 },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.one },
  button: { borderRadius: 10, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three },
  undo: {
    backgroundColor: '#1F2A24',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 12,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  flex: { flex: 1 },
});
