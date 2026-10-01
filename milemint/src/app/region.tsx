import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CountryOptions, phoneRegion } from '@/components/country-options';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { RegionCode } from '@/domain/regions';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/** Settings → Country: change where you drive. First launch uses the welcome flow instead. */
export default function RegionScreen() {
  const theme = useTheme();
  const t = useT();
  const { region, chosen, setRegion } = useRegion();
  const [selected, setSelected] = useState<RegionCode>(() => (chosen ? region.code : phoneRegion()));

  const done = async () => {
    await setRegion(selected);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('MileMint uses your country’s currency, distance unit, tax year and official mileage rate.')}
        </ThemedText>
        <CountryOptions value={selected} onChange={setSelected} />
        <Pressable accessibilityRole="button" onPress={done} style={[styles.button, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Save')}
          </ThemedText>
        </Pressable>
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
  button: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: 12 },
});
