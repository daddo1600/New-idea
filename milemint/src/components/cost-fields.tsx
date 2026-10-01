import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { parseMoneyMinor } from '@/domain/parse-number';
import { formatMoney, type Region } from '@/domain/regions';
import { MAX_COST_MINOR } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';

/** Parking and tolls as typed, before they're read. */
export type CostDraft = { parking: string; tolls: string };

export const EMPTY_COSTS: CostDraft = { parking: '', tolls: '' };

/**
 * Reads the typed parking and tolls into minor units ("3.50", "3,50" and
 * "£3.50" all work; empty is 0). An error is English, to show with t() and
 * the `max` param.
 */
export function readCosts(
  draft: CostDraft,
): { parkingMinor: number; tollsMinor: number } | { error: string } {
  const parking = parseMoneyMinor(draft.parking);
  const tolls = parseMoneyMinor(draft.tolls);
  if (parking === undefined) return { error: msg('Enter parking as an amount, e.g. 3.50.') };
  if (tolls === undefined) return { error: msg('Enter tolls as an amount, e.g. 3.50.') };
  if ((parking ?? 0) > MAX_COST_MINOR || (tolls ?? 0) > MAX_COST_MINOR) {
    return { error: msg('Parking or tolls over {{max}} for one drive? Check the amount.') };
  }
  return { parkingMinor: parking ?? 0, tollsMinor: tolls ?? 0 };
}

/** The most one drive's parking or tolls can be, for the error message. */
export const maxCost = (region: Region) => formatMoney(MAX_COST_MINOR, region);

/** A pair of small money boxes for the parking and tolls paid on a drive, in the region's currency. */
export function CostFields({
  value,
  onChange,
  region,
  note,
}: {
  value: CostDraft;
  onChange: (next: CostDraft) => void;
  region: Region;
  /** What counts here (see costsNote), already translated. */
  note: string;
}) {
  const theme = useTheme();
  const t = useT();
  const box = (key: keyof CostDraft, label: string) => (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={[styles.input, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {region.currencySymbol}
        </ThemedText>
        <TextInput
          accessibilityLabel={t('{{what}}, in {{currency}}', { what: label, currency: region.currency })}
          style={[styles.text, { color: theme.text }]}
          placeholderTextColor={theme.textSecondary}
          value={value[key]}
          onChangeText={(text) => onChange({ ...value, [key]: text })}
          inputMode="decimal"
          placeholder="0.00"
        />
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {box('parking', t('Parking'))}
        {box('tolls', t('Tolls'))}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {note}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two },
  field: { flex: 1, minWidth: 0, gap: Spacing.one },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
  },
  // minWidth 0: a text box's own width would otherwise push the pair past the screen edge.
  text: { flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 16 },
});
