import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { DEFAULT_REGION, REGION_LIST, regionFromLocale, type Region, type RegionCode } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useRegion } from '@/region/region';

const UNIT_NAMES = { mi: 'miles', km: 'kilometres' } as const;

function currencySymbol(region: Region): string {
  const parts = new Intl.NumberFormat(region.locale, { style: 'currency', currency: region.currency }).formatToParts(0);
  return parts.find((part) => part.type === 'currency')?.value ?? region.currency;
}

/** First launch (and Settings): where do you drive? Sets currency, units, tax year and rules. */
export default function RegionScreen() {
  const theme = useTheme();
  const { region, chosen, setRegion } = useRegion();
  const [selected, setSelected] = useState<RegionCode>(() =>
    chosen
      ? region.code
      : (regionFromLocale(Intl.DateTimeFormat().resolvedOptions().locale) ?? DEFAULT_REGION),
  );
  const [saving, setSaving] = useState(false);

  const done = async () => {
    setSaving(true);
    await setRegion(selected);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <ThemedText type="subtitle">Where do you drive?</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            MileMint uses your country’s currency, distance unit, tax year and official mileage rate. No
            account needed, and you can change it later in Settings.
          </ThemedText>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          {REGION_LIST.map((option) => {
            const active = option.code === selected;
            return (
              <Pressable
                key={option.code}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${option.name}. ${option.rule}`}
                onPress={() => setSelected(option.code)}
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
                    {currencySymbol(option)} · {UNIT_NAMES[option.unit]} · {option.authority}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {option.rule}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={done}
          style={[styles.button, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            Continue
          </ThemedText>
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          More countries are coming. Deductions are estimates, not tax advice.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  intro: { gap: Spacing.two },
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
  button: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
  center: { textAlign: 'center' },
});
