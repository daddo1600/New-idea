import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { loadSettings, saveSettings } from '@/db/settings-repo';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';
import { enableWeeklyReminder, REMINDERS_SUPPORTED } from '@/reminders/weekly';

/**
 * Asks about the Sunday check-in once there's a trip to sort, rather than at
 * the end of set-up: people say yes far more when they can see why.
 */
export function ReminderAsk() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!REMINDERS_SUPPORTED) return;
    loadSettings(db).then((settings) => setShow(!settings.reminderAsked && !settings.weeklyReminder), () => {});
  }, [db]);
  if (!show) return null;

  const answer = async (yes: boolean) => {
    setShow(false);
    const scheduled = yes ? await enableWeeklyReminder(region.unit).catch(() => false) : false;
    await saveSettings(db, { ...(await loadSettings(db)), reminderAsked: true, weeklyReminder: scheduled });
  };

  return (
    <View style={[styles.card, { borderColor: theme.accent, backgroundColor: theme.accent + '14' }]}>
      <Text style={styles.icon}>📅</Text>
      <View style={styles.flex}>
        <ThemedText type="smallBold">{t('Want a Sunday nudge?')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t(
            'A quick (slightly cheeky) reminder each Sunday evening to sort the week’s drives, so nothing goes unclaimed.',
          )}
        </ThemedText>
        <View style={styles.buttons}>
          <Pressable
            accessibilityRole="button"
            onPress={() => answer(true)}
            style={[styles.yes, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
              {t('Yes, remind me')}
            </ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => answer(false)}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('No thanks')}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: Spacing.three, borderWidth: 1.5, borderRadius: 16, padding: Spacing.three },
  icon: { fontSize: 24, lineHeight: 30 },
  flex: { flex: 1, gap: Spacing.one },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four, marginTop: Spacing.two },
  yes: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
});
