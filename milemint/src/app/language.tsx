import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { LANGUAGES, setLanguage, useLanguage, useT } from '@/i18n/i18n';
import { useTheme } from '@/hooks/use-theme';

/**
 * Pick the app's language. Each one is listed in its own words (with the
 * English name under it), and no flags: languages aren't countries.
 */
export default function LanguageScreen() {
  const theme = useTheme();
  const t = useT();
  const current = useLanguage();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t('Language') }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('Choose the language for MileSprout. Reports for the tax office stay in English.')}
        </ThemedText>
        <View style={styles.list}>
          {LANGUAGES.map((language) => {
            const selected = language.code === current;
            return (
              <Pressable
                key={language.code}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${language.name}, ${language.english}`}
                onPress={() => {
                  setLanguage(language.code);
                  if (router.canGoBack()) router.back();
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor: selected ? theme.accent + '1F' : theme.backgroundElement,
                    borderColor: selected ? theme.accent : 'transparent',
                  },
                ]}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold" style={styles.name}>
                    {language.name}
                  </ThemedText>
                  {language.code !== 'en' && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {language.english}
                    </ThemedText>
                  )}
                </View>
                {selected && <Text style={[styles.tick, { color: theme.accent }]}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  flex: { flex: 1, gap: 2 },
  name: { fontSize: 17 },
  tick: { fontSize: 18, fontWeight: '800' },
});
