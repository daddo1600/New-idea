import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { askMileSprout, modelSpeaks, useOnDeviceAI, writeRecap, writtenRecap } from '@/ai/on-device';
import { BlurredText } from '@/components/blurred-text';
import { ProBadge } from '@/components/pro-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { buildDriveSummary, MAX_QUESTION_LENGTH, recapFacts, recapLines, summaryText, weekRecap } from '@/domain/recap';
import { displayLocale } from '@/domain/regions';
import { toLocalIsoDate, type Trip } from '@/domain/trip';
import { useCanUse } from '@/hooks/use-feature';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/**
 * The week in a few sentences, on the Money tab: work distance, drives, what
 * it's worth, the busiest day and how it compares with last week. With Pro
 * and Apple Intelligence, the on-device model words it and answers questions
 * (Ask MileSprout); every figure is worked out in domain/recap and checked in
 * the answer. Without Apple Intelligence the recap comes from a template.
 * Free users see the first line, the rest blurred, and the way to Pro.
 */
export function WeeklyRecap({
  trips,
  deductions,
  employee,
}: {
  trips: readonly Trip[];
  deductions: ReadonlyMap<string, number>;
  employee: boolean;
}) {
  const unlocked = useCanUse('weekly-recap');
  const { region } = useRegion();
  const lang = useLanguage();
  const t = useT();
  const theme = useTheme();
  const status = useOnDeviceAI();
  const today = toLocalIsoDate(new Date());

  const recap = useMemo(
    () => weekRecap(trips, deductions, region, today, { employee }),
    [trips, deductions, region, today, employee],
  );
  const lines = recapLines(recap, region, displayLocale(region), t);
  const facts = useMemo(() => recapFacts(recap, region), [recap, region]);

  // The model words the recap only in the app's language; otherwise the template's (translated) recap stays.
  const canWrite = unlocked && status === 'available' && recap.current.workDrives > 0 && modelSpeaks(lang);
  const [written, setWritten] = useState<{ key: string; text: string } | null>(null);
  const key = `${lang}\n${facts}`;
  useEffect(() => {
    if (!canWrite || writtenRecap(facts, lang)) return;
    let live = true;
    writeRecap(facts, lang).then((text) => {
      if (live && text) setWritten({ key: `${lang}\n${facts}`, text });
    });
    return () => {
      live = false;
    };
  }, [canWrite, facts, lang]);
  const aiText = canWrite ? (written?.key === key ? written.text : writtenRecap(facts, lang)) : null;

  if (trips.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <ThemedText type="smallBold" style={styles.flex}>
          {t('Your week')}
        </ThemedText>
        {!unlocked && <ProBadge />}
      </View>
      <ThemedView type="backgroundElement" style={styles.card}>
        {unlocked ? (
          <>
            <ThemedText type="small">{aiText ?? lines.join(' ')}</ThemedText>
            {aiText && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
                {t('Written on your iPhone by Apple Intelligence. The figures come from your drives.')}
              </ThemedText>
            )}
            {status === 'appleIntelligenceNotEnabled' && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
                {t('Turn on Apple Intelligence in Settings to ask MileSprout about your drives.')}
              </ThemedText>
            )}
            {status === 'modelNotReady' && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
                {t('Apple Intelligence is still getting ready. You can ask MileSprout about your drives once it’s done.')}
              </ThemedText>
            )}
            {status === 'available' && (
              <AskMileSprout trips={trips} deductions={deductions} employee={employee} today={today} />
            )}
          </>
        ) : (
          <>
            <ThemedText type="small">{lines[0]}</ThemedText>
            {lines.slice(1).map((line) => (
              <BlurredText key={line}>{line}</BlurredText>
            ))}
            <ThemedText type="small" themeColor="textSecondary">
              {status === 'unsupported' || status === 'deviceNotEligible'
                ? t('Pro adds your full weekly recap: your busiest day and how the week compares with the last.')
                : t('Pro adds your full weekly recap and Ask MileSprout: questions about your drives, answered on your iPhone.')}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/pro')}
              style={[styles.unlock, { backgroundColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
                {t('Unlock with Pro')}
              </ThemedText>
            </Pressable>
          </>
        )}
      </ThemedView>
    </View>
  );
}

/** A question about the drives, answered by the on-device model from the figures (domain/recap summaryText). */
function AskMileSprout({
  trips,
  deductions,
  employee,
  today,
}: {
  trips: readonly Trip[];
  deductions: ReadonlyMap<string, number>;
  employee: boolean;
  today: string;
}) {
  const { region } = useRegion();
  const lang = useLanguage();
  const t = useT();
  const theme = useTheme();
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<{ question: string; text: string | null } | null>(null);

  const lastMonth = useMemo(() => {
    const [y, m] = today.split('-').map(Number);
    return new Date(Date.UTC(y, m - 2, 1)).toLocaleDateString(displayLocale(region), { month: 'long', timeZone: 'UTC' });
  }, [today, region]);
  const suggestions = [
    region.unit === 'mi'
      ? t('How many work miles in {{month}}?', { month: lastMonth })
      : t('How many work km in {{month}}?', { month: lastMonth }),
    t('What did I claim last month?'),
    t('Which day did I drive most?'),
  ];

  const ask = async (asked: string) => {
    const trimmed = asked.trim();
    if (!trimmed || busy) return;
    setQuestion(trimmed);
    setBusy(true);
    try {
      const summary = summaryText(buildDriveSummary(trips, deductions, region, today, { employee }), region, employee);
      setAnswer({ question: trimmed, text: await askMileSprout(trimmed, summary, lang) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.ask, { borderTopColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold">{t('Ask MileSprout')}</ThemedText>
      <View style={styles.askRow}>
        <TextInput
          accessibilityLabel={t('Ask MileSprout')}
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={() => ask(question)}
          placeholder={t('Ask about your drives')}
          placeholderTextColor={theme.textSecondary}
          returnKeyType="send"
          maxLength={MAX_QUESTION_LENGTH}
          editable={!busy}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={busy || !question.trim()}
          onPress={() => ask(question)}
          style={[styles.askButton, { backgroundColor: theme.accent, opacity: busy || !question.trim() ? 0.5 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Ask')}
          </ThemedText>
        </Pressable>
      </View>
      {!answer && !busy && (
        <View style={styles.chips}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              onPress={() => ask(suggestion)}
              style={[styles.chip, { borderColor: theme.accent }]}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                {suggestion}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
      {busy && (
        <View style={styles.thinking}>
          <ActivityIndicator size="small" />
          <ThemedText type="small" themeColor="textSecondary">
            {t('Thinking…')}
          </ThemedText>
        </View>
      )}
      {answer && !busy && (
        <ThemedText type="small" accessibilityLiveRegion="polite">
          {answer.text ??
            t('Sorry, I couldn’t answer that from your drives. Try asking about a month, a week or a day.')}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  card: { borderRadius: 12, padding: Spacing.three, gap: Spacing.two },
  caption: { fontSize: 12, lineHeight: 16 },
  unlock: { alignItems: 'center', borderRadius: 12, paddingVertical: 12 },
  ask: { gap: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.two, marginTop: Spacing.one },
  askRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two + 2, paddingVertical: 10, fontSize: 15 },
  askButton: { borderRadius: 10, paddingHorizontal: Spacing.three, paddingVertical: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: Spacing.two + 2, paddingVertical: 4 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
