import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

/** Listed first in client privacy mode: the usual purpose for care and support work. */
const CLIENT_VISIT_PURPOSE = ['🩺', msg('Client visit')] as const;
const KNOWN_PURPOSES = [CLIENT_VISIT_PURPOSE, ...COMMON_PURPOSES];

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
}: {
  value: string;
  onChange: (purpose: string) => void;
  /** Purposes used before, most used first. */
  recent?: readonly string[];
  /**
   * Client privacy mode: "Client visit" comes first, and typing your own
   * suggests a non-identifying client reference (initials or a client number),
   * which with the area and distance is what the tax office needs.
   */
  clientPrivacy?: boolean;
}) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [custom, setCustom] = useState('');

  const listed = clientPrivacy ? KNOWN_PURPOSES : COMMON_PURPOSES;
  const common = KNOWN_PURPOSES.map(([, text]) => text.toLowerCase());
  const recentOnly = recent.filter((text) => !common.includes(text.toLowerCase())).slice(0, 4);
  const match = KNOWN_PURPOSES.find(([, text]) => text.toLowerCase() === value.trim().toLowerCase());
  const icon = match?.[0];
  const shown = match ? t(match[1]) : value;

  const close = () => {
    setOpen(false);
    setTyping(false);
  };
  const pick = (purpose: string) => {
    onChange(purpose);
    close();
  };

  const row = (key: string, emoji: string, text: string, label: string = text) => {
    const selected = value.trim().toLowerCase() === text.toLowerCase();
    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => pick(text)}
        style={({ pressed }) => [
          styles.option,
          selected && { backgroundColor: theme.accent + '1F' },
          pressed && { backgroundColor: theme.backgroundSelected },
        ]}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        <ThemedText type={selected ? 'smallBold' : 'small'} style={[styles.flex, selected && { color: theme.accent }]}>
          {label}
        </ThemedText>
        {selected && <ThemedText style={{ color: theme.accent }}>✓</ThemedText>}
      </Pressable>
    );
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          value ? t('Business purpose: {{purpose}}', { purpose: shown }) : t('Business purpose: not chosen')
        }
        accessibilityHint={t('Opens a list of purposes')}
        onPress={() => {
          setCustom('');
          setOpen(true);
        }}
        style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        {value ? (
          <ThemedText style={styles.flex} numberOfLines={1}>
            {icon ? `${icon}  ` : ''}
            {shown}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.flex}>
            {t('Choose a purpose')}
          </ThemedText>
        )}
        <ThemedText style={{ color: theme.accent }}>▾</ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable accessibilityLabel={t('Close')} style={styles.backdrop} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
            <View style={[styles.grabber, { backgroundColor: theme.backgroundSelected }]} />
            <ThemedText type="smallBold" style={styles.title}>
              {t('Business purpose')}
            </ThemedText>
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {recentOnly.map((text) => row(`recent:${text}`, '🕘', text))}
              {recentOnly.length > 0 && (
                <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
              )}
              {listed.map(([emoji, text]) => row(text, emoji, text, t(text)))}
              {typing && clientPrivacy && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                  {t('Add initials or a client number if you like. Never a name or address.')}
                </ThemedText>
              )}
              {typing ? (
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
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTyping(true)}
                  style={({ pressed }) => [styles.option, pressed && { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText style={styles.emoji}>✏️</ThemedText>
                  <ThemedText type="small" style={[styles.flex, { color: theme.accent }]}>
                    {t('Other…')}
                  </ThemedText>
                </Pressable>
              )}
            </ScrollView>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    maxHeight: 560,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.two },
  title: { textAlign: 'center', marginBottom: Spacing.two },
  list: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: 13,
    borderRadius: 10,
  },
  emoji: { fontSize: 18, lineHeight: 24, width: 26, textAlign: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.one },
  hint: { paddingHorizontal: Spacing.two, paddingTop: Spacing.two },
  customRow: { flexDirection: 'row', gap: Spacing.two, paddingVertical: Spacing.two, alignItems: 'center' },
  input: { flex: 1, borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 10, fontSize: 16 },
  use: { paddingHorizontal: Spacing.three, paddingVertical: 10, borderRadius: 10 },
});
