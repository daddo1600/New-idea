import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandGradient } from '@/components/brand-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  DEFAULT_REGION,
  REGION_LIST,
  REGIONS,
  regionFromLocale,
  vehicleRule,
  type RegionCode,
} from '@/domain/regions';
import type { VehicleType } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';

const UNIT_NAMES = { mi: 'miles', km: 'km' } as const;
/** Short enough to fit a half-width tile beside the flag. */
const SHORT_NAMES: Record<RegionCode, string> = { US: 'USA', GB: 'UK', CA: 'Canada', AU: 'Australia' };

/** The phone's region as a MileMint country, e.g. an en-GB phone → GB. */
export function phoneRegion(): RegionCode {
  try {
    return regionFromLocale(Intl.DateTimeFormat().resolvedOptions().locale) ?? DEFAULT_REGION;
  } catch {
    return DEFAULT_REGION;
  }
}

/**
 * The supported countries as a 2×2 grid of flag tiles, so all four fit on one
 * screen. The chosen one fills with the brand green; its official rate shows
 * underneath.
 */
export function CountryOptions({
  value,
  onChange,
  vehicle = 'car',
  showRate = true,
}: {
  value: RegionCode;
  onChange: (code: RegionCode) => void;
  /** Shows the rate for this vehicle under the grid. */
  vehicle?: VehicleType;
  /** Off when the screen shows the rate itself (set-up shows it under the vehicle choice). */
  showRate?: boolean;
}) {
  const theme = useTheme();
  const chosen = REGIONS[value];
  return (
    <View style={styles.container}>
      <View accessibilityRole="radiogroup" style={styles.grid}>
        {REGION_LIST.map((option) => {
          const active = option.code === value;
          return (
            <Pressable
              key={option.code}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${option.name}. ${option.rule}`}
              onPress={() => onChange(option.code)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: theme.backgroundElement, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}>
              {active && <BrandGradient />}
              {active && (
                <View style={styles.tick}>
                  <Text style={styles.tickText}>✓</Text>
                </View>
              )}
              <Text style={styles.flag}>{option.flag}</Text>
              <View style={styles.flex}>
                <ThemedText type="smallBold" style={active && styles.onBrand} numberOfLines={1}>
                  {SHORT_NAMES[option.code]}
                </ThemedText>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  numberOfLines={1}
                  style={active && styles.onBrandSoft}>
                  {option.currencySymbol} · {UNIT_NAMES[option.unit]}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
      {showRate && (
        <ThemedView type="backgroundElement" style={styles.rate}>
          <View style={[styles.rateDot, { backgroundColor: theme.accent }]} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.flex} accessibilityLiveRegion="polite">
            {vehicleRule(chosen, vehicle)}
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 4 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    overflow: 'hidden',
  },

  flag: { fontSize: 30, lineHeight: 36 },
  onBrand: { color: '#FFFFFF' },
  onBrandSoft: { color: '#D1FAE5' },
  tick: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: { color: '#064E3B', fontSize: 11, fontWeight: '800' },
  rate: { flexDirection: 'row', gap: Spacing.two, borderRadius: 12, padding: Spacing.three, alignItems: 'flex-start' },
  rateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  flex: { flex: 1 },
});
