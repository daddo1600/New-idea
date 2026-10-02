import { useReducer, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { PopPress } from '@/components/pop-press';
import { purposeIcon, PurposeSheet, shownPurpose } from '@/components/purpose-picker';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** How long a confirmed suggestion shows green with its ✓ before it's saved and moves on. */
const PICKED_MS = 300;

/**
 * A business drive's purpose, on one slim line of its row.
 *
 * Without one (tax offices want a purpose for every business drive): a small
 * amber dot, "Purpose:", the one most likely purpose as a chip ("🩺 Client
 * visit?") and a quiet "Change". Tapping the chip confirms it: it pops and
 * turns green with a ✓ (and the phone taps back), then it's saved and the
 * line settles into the saved look. With `rowLeaves` (filling in purposes,
 * see LeavesWithPurpose) the whole row slides out instead.
 *
 * With one: the purpose with its emoji, in plain text. "Change", or tapping
 * the saved purpose, opens the purpose sheet.
 */
export function PurposeLine({
  purpose,
  suggestion,
  choices,
  route,
  filledWithUsual,
  clientPrivacy,
  rowLeaves,
  onPick,
}: {
  /** The saved purpose, or '' when it still needs one. */
  purpose: string;
  /** The one purpose offered (see suggestPurpose), or null with nothing to go on. */
  suggestion: string | null;
  /** The sheet's purposes, most likely first. */
  choices: readonly string[];
  /** The drive, under the sheet's title. */
  route: string;
  /** Filled in by the app with the usual purpose and not checked since: said quietly, so it can be. */
  filledWithUsual: boolean;
  clientPrivacy: boolean;
  rowLeaves: boolean;
  /** Saves the purpose (a failed save puts the suggestion back). */
  onPick: (purpose: string) => void | Promise<unknown>;
}) {
  const theme = useTheme();
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [sheet, setSheet] = useState(false);
  /** The suggestion confirmed: green until the save lands, and no second tap meanwhile. */
  const [picked, setPicked] = useState<string | null>(null);
  /** Handed on to be saved: no more taps until it lands (or fails). */
  const [saving, setSaving] = useState(false);
  /** Bumped when a save fails, to bring the line back as it was. */
  const [round, bumpRound] = useReducer((n: number) => n + 1, 0);
  const save = (chosen: string) => {
    setSaving(true);
    Promise.resolve(onPick(chosen)).catch(() => {
      setPicked(null);
      setSaving(false);
      bumpRound();
    });
  };
  const saved = purpose.trim();
  // Saved (or changed elsewhere): ready for the next one.
  const [seen, setSeen] = useState(saved);
  if (seen !== saved) {
    setSeen(saved);
    setSaving(false);
    setPicked(null);
  }
  const openSheet = () => setSheet(true);

  return (
    <>
      <Animated.View
        // The line settles into its saved look with a quick fade (none with Reduce Motion).
        key={saved ? 'saved' : `needed:${round}`}
        entering={reduceMotion || !saved ? undefined : FadeIn.duration(220)}
        style={styles.line}>
        {saved ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Business purpose: {{purpose}}', { purpose: shownPurpose(saved, t) })}
            accessibilityHint={t('Opens a list of purposes')}
            onPress={openSheet}
            hitSlop={8}
            style={styles.saved}>
            <ThemedText type="small" numberOfLines={1}>
              {purposeIcon(saved)} {shownPurpose(saved, t)}
              {filledWithUsual && (
                <ThemedText type="small" themeColor="textSecondary">
                  {'  ·  '}
                  {t('Usual purpose · tap to change')}
                </ThemedText>
              )}
            </ThemedText>
          </Pressable>
        ) : (
          <>
            {/* The dot is the only "needs attention" colour; the label says it for VoiceOver. */}
            <View accessible accessibilityLabel={t('Needs a business purpose')} style={styles.label}>
              <View style={[styles.dot, { backgroundColor: theme.warning }]} />
              <ThemedText type="small" themeColor="textSecondary">
                {t('Purpose:')}
              </ThemedText>
            </View>
            {suggestion !== null && (
              <PopPress
                accessibilityRole="button"
                accessibilityLabel={t('Business purpose: {{purpose}}. Double-tap to confirm', {
                  purpose: shownPurpose(suggestion, t),
                })}
                accessibilityState={{ selected: picked !== null, disabled: picked !== null }}
                disabled={saving}
                onPop={() => setPicked(suggestion)}
                commitDelay={PICKED_MS}
                onPress={() => save(suggestion)}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.chip,
                  picked !== null
                    ? { backgroundColor: theme.accent, borderColor: theme.accent }
                    : {
                        backgroundColor: pressed ? theme.backgroundSelected : theme.background,
                        borderColor: theme.backgroundSelected,
                      },
                ]}>
                <ThemedText
                  type="smallBold"
                  numberOfLines={1}
                  style={picked !== null && { color: theme.onAccent }}>
                  {picked !== null
                    ? `✓ ${shownPurpose(suggestion, t)}`
                    : `${purposeIcon(suggestion)} ${t('{{purpose}}?', { purpose: shownPurpose(suggestion, t) })}`}
                </ThemedText>
              </PopPress>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('Opens a list of purposes')}
              disabled={picked !== null || saving}
              onPress={openSheet}
              hitSlop={10}
              style={({ pressed }) => [styles.change, pressed && { opacity: 0.5 }]}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {suggestion === null ? t('Choose a purpose') : t('Change')}
              </ThemedText>
            </Pressable>
          </>
        )}
      </Animated.View>
      <PurposeSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        onPick={(chosen) => {
          if (chosen.trim().toLowerCase() !== saved.toLowerCase()) save(chosen);
        }}
        purposes={[...(suggestion && !saved ? [suggestion] : []), ...choices]}
        value={saved}
        subtitle={route}
        clientPrivacy={clientPrivacy}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // As tall as the chip, so nothing below moves when the chip gives way to the saved purpose.
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 30 },
  saved: { flexShrink: 1 },
  label: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chip: {
    flexShrink: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
  },
  change: { marginLeft: 'auto', paddingVertical: Spacing.one },
});
