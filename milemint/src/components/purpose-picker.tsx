import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PopPress } from '@/components/pop-press';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';

/** The usual reasons for a business drive, as tax authorities expect them described. */
export const COMMON_PURPOSES = [
  ['🤝', msg('Client meeting')],
  ['🏗️', msg('Site visit')],
  ['📦', msg('Delivery or collection')],
  ['🛒', msg('Buying supplies')],
  ['🏢', msg('Between workplaces')],
  ['🎓', msg('Training or conference')],
  ['🏦', msg('Bank or post office')],
  ['🧾', msg('Business errand')],
] as const;

/** How long a picked tile shows its ✓ before the sheet closes. */
const PICKED_MS = 200;

/** Listed first in client privacy mode: the usual purpose for care and support work. */
const CLIENT_VISIT_PURPOSE = ['🩺', msg('Client visit')] as const;
const KNOWN_PURPOSES = [CLIENT_VISIT_PURPOSE, ...COMMON_PURPOSES];
/** What a shift files its drives under (see auto-classify); shown translated, offered to shift workers. */
const DELIVERIES_PURPOSE = ['🛵', msg('Deliveries')] as const;
const SHOWN_PURPOSES = [...KNOWN_PURPOSES, DELIVERIES_PURPOSE];

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** A saved purpose as shown: the common ones in the app's language, anything typed as it was typed. */
export function shownPurpose(purpose: string, translate: (key: string) => string): string {
  const match = SHOWN_PURPOSES.find(([, text]) => sameText(text, purpose));
  return match ? translate(match[1]) : purpose;
}

/** The emoji of a common purpose, or a pencil for one the user typed. */
export function purposeIcon(purpose: string): string {
  return SHOWN_PURPOSES.find(([, text]) => sameText(text, purpose))?.[0] ?? '✏️';
}

/**
 * Purposes to offer as one-tap choices, most likely first: the user's usual
 * one, the ones they use most, then the common ones for how they work
 * ("Deliveries" for shift workers, "Client visit" for client privacy). Saved
 * values (English for the common ones), no repeats.
 */
export function quickPurposes(
  {
    usual = null,
    chosen = [],
    recent = [],
    shiftMode = false,
    clientPrivacy = false,
  }: { usual?: string | null; chosen?: readonly string[]; recent?: readonly string[]; shiftMode?: boolean; clientPrivacy?: boolean },
  limit = 3,
): string[] {
  const common = [
    ...(shiftMode ? [DELIVERIES_PURPOSE] : []),
    ...(clientPrivacy ? [CLIENT_VISIT_PURPOSE] : []),
    ...COMMON_PURPOSES,
  ].map(([, text]) => text);
  const picked: string[] = [];
  for (const text of [usual ?? '', ...chosen, ...recent, ...common]) {
    if (text.trim() && !picked.some((other) => sameText(other, text))) picked.push(text.trim());
  }
  return picked.slice(0, limit);
}

/**
 * Common purposes are saved in English (the reports to the tax office stay in
 * English) and shown in the app's language.
 *
 * Business purpose as a pick list instead of typing: purposes used before
 * first, then common ones, then "Other…" for anything else.
 */
export function PurposePicker({
  value,
  onChange,
  recent = [],
  clientPrivacy = false,
  shiftMode = false,
  placeholder,
}: {
  value: string;
  onChange: (purpose: string) => void;
  /** Purposes used before, most used first. */
  recent?: readonly string[];
  /** Shift work: "Deliveries" comes first. */
  shiftMode?: boolean;
  /** Shown while nothing is chosen, instead of "Choose a purpose". */
  placeholder?: string;
  /**
   * Client privacy mode: "Client visit" comes first, and typing your own
   * suggests a non-identifying client reference (initials or a client number),
   * which with the area and distance is what the tax office needs.
   */
  clientPrivacy?: boolean;
}) {
  const theme = useTheme();
  const t = useT();
  const [open, setOpen] = useState(false);

  const listed = [...(shiftMode ? [DELIVERIES_PURPOSE] : []), ...(clientPrivacy ? KNOWN_PURPOSES : COMMON_PURPOSES)];
  const common = [...KNOWN_PURPOSES, ...listed].map(([, text]) => text.toLowerCase());
  const recentOnly = recent.filter((text) => !common.includes(text.toLowerCase())).slice(0, 4);
  const match = SHOWN_PURPOSES.find(([, text]) => text.toLowerCase() === value.trim().toLowerCase());
  const icon = match?.[0];
  const shown = match ? t(match[1]) : value;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          value ? t('Purpose: {{purpose}}', { purpose: shown }) : t('Purpose: not chosen')
        }
        accessibilityHint={t('Opens a list of purposes')}
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        {value ? (
          <ThemedText style={styles.flex} numberOfLines={1}>
            {icon ? `${icon}  ` : ''}
            {shown}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.flex}>
            {placeholder ?? t('Choose a purpose')}
          </ThemedText>
        )}
        <ThemedText style={{ color: theme.accent }}>▾</ThemedText>
      </Pressable>
      <PurposeSheet
        visible={open}
        onClose={() => setOpen(false)}
        onPick={onChange}
        purposes={[...recentOnly, ...listed.map(([, text]) => text)]}
        value={value}
        clientPrivacy={clientPrivacy}
      />
    </>
  );
}

/**
 * The purposes as a sheet of large tiles, two to a row, with "Other…" last to
 * type your own. The tapped tile pops and ticks, then the sheet closes and
 * `onPick` gets the purpose (the saved value: English for the common ones).
 * The purpose field in trip details and the trip rows both open it.
 */
export function PurposeSheet({
  visible,
  onClose,
  onPick,
  purposes,
  value = '',
  subtitle,
  clientPrivacy = false,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (purpose: string) => void;
  /** In order, most likely first; repeats are left out. */
  purposes: readonly string[];
  /** The purpose chosen now, ticked. */
  value?: string;
  /** Under the title, e.g. the drive's route. */
  subtitle?: string;
  /** Typing your own suggests a client reference rather than a name (see PurposePicker). */
  clientPrivacy?: boolean;
}) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [typing, setTyping] = useState(false);
  const [custom, setCustom] = useState('');
  /** The tile just tapped: ticked while the sheet stays a moment, so the tap is seen. */
  const [picked, setPicked] = useState<string | null>(null);
  // Opened again: starts afresh.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setTyping(false);
      setCustom('');
      setPicked(null);
    }
  }

  const tiles: string[] = [];
  for (const text of purposes) {
    if (text.trim() && !tiles.some((other) => sameText(other, text))) tiles.push(text.trim());
  }
  const pick = (purpose: string) => {
    onPick(purpose);
    onClose();
  };

  const tile = (text: string) => {
    const selected = sameText(picked ?? value, text);
    return (
      <PopPress
        key={text}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        disabled={picked !== null && picked !== text}
        onPop={() => setPicked(text)}
        commitDelay={PICKED_MS}
        scale={1.05}
        onPress={() => pick(text)}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement, borderColor: 'transparent' },
          selected && { backgroundColor: theme.accent + '1F', borderColor: theme.accent },
        ]}>
        <ThemedText style={[styles.emoji, selected && { color: theme.accent }]}>
          {selected ? '✓' : purposeIcon(text)}
        </ThemedText>
        <ThemedText
          type={selected ? 'smallBold' : 'small'}
          numberOfLines={2}
          style={[styles.flex, selected && { color: theme.accent }]}>
          {shownPurpose(text, t)}
        </ThemedText>
      </PopPress>
    );
  };
  const other = (
    <Pressable
      key="other"
      accessibilityRole="button"
      accessibilityHint={t('Type your own purpose')}
      disabled={picked !== null}
      onPress={() => setTyping(true)}
      style={({ pressed }) => [
        styles.tile,
        { borderColor: theme.backgroundSelected, borderStyle: 'dashed' },
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <ThemedText style={styles.emoji}>✏️</ThemedText>
      <ThemedText type="small" style={[styles.flex, { color: theme.accent }]}>
        {t('Other…')}
      </ThemedText>
    </Pressable>
  );
  const cells = [...tiles.map(tile), ...(typing ? [] : [other])];
  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Close')} style={[styles.backdrop, { backgroundColor: theme.backdrop }]} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView type="sheet" style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
          <View style={[styles.grabber, { backgroundColor: theme.backgroundSelected }]} />
          <ThemedText type="smallBold" style={styles.title}>
            {t('Purpose')}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.title}>
              {subtitle}
            </ThemedText>
          ) : null}
          <ScrollView style={styles.list} contentContainerStyle={styles.grid} keyboardShouldPersistTaps="handled">
            {rows.map((row, i) => (
              <View key={i} style={styles.gridRow}>
                {row}
                {/* An odd one out keeps its half: the grid stays a grid. */}
                {row.length === 1 && <View style={[styles.tile, styles.spacer]} />}
              </View>
            ))}
            {typing && clientPrivacy && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                {t('Add initials or a client number if you like. Never a name or address.')}
              </ThemedText>
            )}
            {typing && (
              <View style={styles.customRow}>
                <TextInput
                  accessibilityLabel={t('Your own purpose')}
                  autoFocus
                  value={custom}
                  onChangeText={setCustom}
                  placeholder={clientPrivacy ? t('e.g. Client visit, J.S. or no. 1042') : t('e.g. Quote for Acme Ltd')}
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  onSubmitEditing={() => custom.trim() && pick(custom.trim())}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!custom.trim()}
                  onPress={() => pick(custom.trim())}
                  style={[styles.use, { backgroundColor: theme.accent, opacity: custom.trim() ? 1 : 0.4 }]}>
                  <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                    {t('Use')}
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  flex: { flex: 1 },
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    maxHeight: 560,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.two },
  title: { textAlign: 'center' },
  list: { flexGrow: 0, marginTop: Spacing.three },
  grid: { gap: Spacing.two, paddingBottom: Spacing.two },
  gridRow: { flexDirection: 'row', gap: Spacing.two },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 56,
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: Spacing.two,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  spacer: { borderColor: 'transparent' },
  emoji: { fontSize: 20, lineHeight: 26, width: 26, textAlign: 'center' },
  hint: { paddingHorizontal: Spacing.two, paddingTop: Spacing.one },
  customRow: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.one, alignItems: 'center' },
  input: { flex: 1, borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 10, fontSize: 16 },
  use: { paddingHorizontal: Spacing.three, paddingVertical: 10, borderRadius: 10 },
});
