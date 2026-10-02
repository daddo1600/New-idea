import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { parseMoneyMinor, parseNumber } from '@/domain/parse-number';
import { formatMoney, type Region } from '@/domain/regions';
import {
  addDays,
  DEFAULT_SET_ASIDE_PERCENT,
  isValidSetAsidePercent,
  MAX_SET_ASIDE_PERCENT,
  MAX_WEEKLY_EARNINGS_MINOR,
  MIN_SET_ASIDE_PERCENT,
  previousEntry,
  setAsideAmount,
} from '@/domain/set-aside';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';

type Which = 'this' | 'last';

/** An amount as it's typed back into the box: 30000 → "300", 30050 → "300.50". */
const asInput = (minor: number) => (minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2));

/**
 * "Add this week's earnings": one number for the week, every platform
 * together, with "Same as last week" a tap away; last week can be filled in
 * too (most people are paid on Monday). The rate can be changed here.
 */
export function EarningsSheet({
  visible,
  onClose,
  region,
  thisWeek,
  earnings,
  deductionFor,
  percent,
  customPercent,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  region: Region;
  /** Monday of the current week. */
  thisWeek: string;
  earnings: ReadonlyMap<string, number>;
  /** A week's mileage deduction, minor units. */
  deductionFor: (weekStart: string) => number;
  percent: number;
  /** The user's own rate, or null for the region's default. */
  customPercent: number | null;
  onSave: (weekStart: string, amount: number | null, percent: number | null) => Promise<void>;
}) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const weekOf = (choice: Which) => (choice === 'this' ? thisWeek : addDays(thisWeek, -7));
  const savedText = (choice: Which) => {
    const value = earnings.get(weekOf(choice));
    return value === undefined ? '' : asInput(value);
  };
  // Mounted each time it opens (see SetAsideCard), so it starts from what's saved.
  const [which, setWhich] = useState<Which>('this');
  const [amount, setAmount] = useState(() => savedText('this'));
  const [rate, setRate] = useState(() => String(percent));
  /** English, shown with t() and its params. */
  const [error, setError] = useState<{ text: string; params?: Record<string, string | number> } | null>(null);
  const [busy, setBusy] = useState(false);
  const weekStart = weekOf(which);
  const saved = earnings.get(weekStart);
  const choose = (choice: Which) => {
    setWhich(choice);
    setAmount(savedText(choice));
    setError(null);
  };

  const previous = previousEntry(earnings, weekStart);
  const typed = parseMoneyMinor(amount);
  const typedRate = parseNumber(rate);
  const usedRate = typedRate !== null && typedRate !== undefined && isValidSetAsidePercent(typedRate) ? typedRate : percent;
  const deduction = deductionFor(weekStart);
  const preview = typed !== null && typed !== undefined ? setAsideAmount(typed, deduction, usedRate) : null;
  const regionDefault = DEFAULT_SET_ASIDE_PERCENT[region.code];

  const save = async () => {
    if (typed === undefined) return setError({ text: msg('Enter your earnings as an amount, e.g. 450 or 450.50.') });
    if (typed !== null && typed > MAX_WEEKLY_EARNINGS_MINOR) {
      return setError({
        text: msg('Over {{max}} in one week? Check the amount.'),
        params: { max: formatMoney(MAX_WEEKLY_EARNINGS_MINOR, region) },
      });
    }
    let nextPercent: number | null = customPercent;
    if (rate.trim() !== String(percent)) {
      if (typedRate === null || typedRate === undefined || !isValidSetAsidePercent(typedRate)) {
        return setError({
          text: msg('Enter a whole number from {{min}} to {{max}} for the rate.'),
          params: { min: MIN_SET_ASIDE_PERCENT, max: MAX_SET_ASIDE_PERCENT },
        });
      }
      nextPercent = typedRate === regionDefault ? null : typedRate;
    }
    setBusy(true);
    try {
      await onSave(weekStart, typed, nextPercent);
      onClose();
    } catch {
      setError({ text: msg('Couldn’t save. Please try again.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Close')} style={[styles.backdrop, { backgroundColor: theme.backdrop }]} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView type="sheet" style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
          <View style={[styles.grabber, { backgroundColor: theme.backgroundSelected }]} />
          <ThemedText type="smallBold" style={styles.center}>
            {t('What did you earn?')}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {t('All your apps and platforms together, before tax.')}
          </ThemedText>
          <Segmented
            options={[
              { value: 'this', label: t('This week') },
              { value: 'last', label: t('Last week') },
            ]}
            value={which}
            onChange={choose}
          />
          <View style={[styles.amountBox, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={[styles.symbol, { color: theme.textSecondary }]}>{region.currencySymbol}</ThemedText>
            <TextInput
              accessibilityLabel={t('Earnings, in {{currency}}', { currency: region.currency })}
              autoFocus
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError(null);
              }}
              inputMode="decimal"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              onSubmitEditing={save}
              style={[styles.amount, { color: theme.text }]}
            />
          </View>
          {previous && previous.amount !== typed && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setAmount(asInput(previous.amount));
                setError(null);
              }}
              style={[styles.pill, { borderColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {t('Same as last week ({{amount}})', { amount: formatMoney(previous.amount, region) })}
              </ThemedText>
            </Pressable>
          )}
          <View style={[styles.previewRow, { borderColor: theme.backgroundSelected }]}>
            <View style={styles.flex}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Mileage for the week: {{amount}}', { amount: formatMoney(deduction, region) })}
              </ThemedText>
              <ThemedText type="smallBold">
                {t('Put aside: {{amount}}', { amount: preview === null ? '–' : formatMoney(preview, region) })}
              </ThemedText>
            </View>
            <View style={styles.rateBox}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('Rate')}
              </ThemedText>
              <View style={[styles.rateInput, { backgroundColor: theme.backgroundElement }]}>
                <TextInput
                  accessibilityLabel={t('Set-aside rate, in percent')}
                  value={rate}
                  onChangeText={(text) => {
                    setRate(text);
                    setError(null);
                  }}
                  inputMode="numeric"
                  maxLength={2}
                  style={[styles.rateText, { color: theme.text }]}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  %
                </ThemedText>
              </View>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {t('For the self-employed, {{percent}}% is a rough guide. Change it to suit you.', { percent: regionDefault })}
          </ThemedText>
          {error && (
            <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
              {t(error.text, error.params)}
            </ThemedText>
          )}
          <View style={styles.buttons}>
            {saved !== undefined && (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  setBusy(true);
                  onSave(weekStart, null, customPercent)
                    .then(onClose, () => setError({ text: msg('Couldn’t save. Please try again.') }))
                    .finally(() => setBusy(false));
                }}
                style={[styles.button, styles.outline, { borderColor: theme.backgroundSelected }]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {t('Clear')}
                </ThemedText>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={save}
              style={[styles.button, styles.flex, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {t('Save')}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3 },
  center: { textAlign: 'center', marginTop: -Spacing.two },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  symbol: { fontSize: 28, lineHeight: 36, fontWeight: '600' },
  amount: { flex: 1, minWidth: 0, fontSize: 34, lineHeight: 42, fontWeight: '700', fontVariant: ['tabular-nums'], paddingVertical: 0 },
  pill: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: 6 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  flex: { flex: 1 },
  rateBox: { alignItems: 'flex-end', gap: Spacing.one },
  rateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  rateText: { width: 30, textAlign: 'right', fontSize: 17, fontWeight: '600', paddingVertical: 0 },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 14, paddingHorizontal: Spacing.four },
  outline: { borderWidth: 1 },
});
