import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { DEFAULT_REGION, REGION_LIST, regionFromLocale, type RegionCode } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';

const UNIT_NAMES = { mi: 'miles', km: 'kilometres' } as const;

/** The phone's region as a MileMint country, e.g. an en-GB phone → GB. */
export function phoneRegion(): RegionCode {
  try {
    return regionFromLocale(Intl.DateTimeFormat().resolvedOptions().locale) ?? DEFAULT_REGION;
  } catch {
    return DEFAULT_REGION;
  }
}

/** Radio list of supported countries, with each one's currency, unit and rate. */
export function CountryOptions({ value, onChange }: { value: RegionCode; onChange: (code: RegionCode) => void }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={styles.options}>
      {REGION_LIST.map((option) => {
        const active = option.code === value;
        return (
          <Pressable
            key={option.code}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${option.name}. ${option.rule}`}
            onPress={() => onChange(option.code)}
            style={[
              styles.option,
              {
                borderColor: active ? theme.accent : theme.backgroundSelected,
                backgroundColor: theme.backgroundElement,
              },
            ]}>
            <ThemedText style={styles.flag}>{option.flag}</ThemedText>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{option.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {option.currencySymbol} · {UNIT_NAMES[option.unit]} · {option.authority}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {option.rule}
              </ThemedText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { gap: Spacing.two },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 2,
    borderRadius: 12,
    padding: Spacing.three,
  },
  flag: { fontSize: 32, lineHeight: 40 },
  flex: { flex: 1, gap: Spacing.half },
});
