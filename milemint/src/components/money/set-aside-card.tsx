import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BlurredText } from '@/components/blurred-text';
import { EarningsSheet } from '@/components/money/earnings-sheet';
import { ProBadge } from '@/components/pro-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatMoney, type DeductionTrip } from '@/domain/regions';
import type { SetAsideWeek } from '@/domain/set-aside';
import { formatDayMonth } from '@/domain/quarters';
import { useSetAside } from '@/hooks/use-set-aside';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/**
 * The Money tab's tax set-aside (Pro, or the 1-friend perk): what to put
 * aside this week, the tax year's total, the last 8 weeks, and the sheet for
 * entering the week's earnings. Locked, it says what it does and both ways
 * to unlock it.
 */
export function SetAsideCard({
  trips,
  deductions,
  employee,
}: {
  trips: readonly DeductionTrip[];
  deductions: ReadonlyMap<string, number>;
  employee: boolean;
}) {
  const setAside = useSetAside(trips, deductions, employee);
  const { region } = useRegion();
  const theme = useTheme();
  const t = useT();
  const [sheet, setSheet] = useState(false);

  if (!setAside.unlocked) return <LockedSetAside />;
  if (!setAside.loaded) return null;

  const { weeks, thisWeek, earnings, percent } = setAside;
  const current = weeks[weeks.length - 1];
  const last = weeks[weeks.length - 2];
  // This week once it's entered; until then, last week's (most people are paid on Monday).
  const shown = current.setAside !== null ? current : last?.setAside != null ? last : null;
  const anyEntered = earnings.size > 0;
  const deductionFor = (weekStart: string) =>
    weeks.find((week) => week.weekStart === weekStart)?.deduction ?? 0;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.flex}>
          {t('Tax set-aside')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('{{percent}}% of profit', { percent })}
        </ThemedText>
      </View>

      {shown ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {shown === current ? t('Put aside for tax this week') : t('Put aside for tax from last week')}
          </ThemedText>
          <ThemedText style={[styles.big, { color: theme.accent }]} adjustsFontSizeToFit numberOfLines={1}>
            {formatMoney(shown.setAside ?? 0, region)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('Earned {{earned}}, minus {{mileage}} of mileage', {
              earned: formatMoney(shown.earnings ?? 0, region),
              mileage: formatMoney(shown.deduction, region),
            })}
          </ThemedText>
        </>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {anyEntered
            ? t('Add this week’s earnings to see what to put aside.')
            : t('Enter what you earn each week, all apps together. MileSprout takes off your mileage and shows how much to put aside for tax.')}
        </ThemedText>
      )}

      {anyEntered && <WeekBars weeks={weeks} />}

      {anyEntered && (
        <View style={[styles.yearRow, { borderTopColor: theme.backgroundSelected }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
            {t('Put aside this tax year')}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.tabular}>
            {formatMoney(setAside.yearTotal, region)}
          </ThemedText>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => setSheet(true)}
        style={({ pressed }) => [styles.add, { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 }]}>
        <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
          {current.earnings !== null ? t('Change this week’s earnings') : t('Add this week’s earnings')}
        </ThemedText>
      </Pressable>

      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {t('An estimate to help you save for your tax bill. Your real bill depends on your total income.')}
      </ThemedText>

      {sheet && (
        <EarningsSheet
          visible
          onClose={() => setSheet(false)}
          region={region}
          thisWeek={thisWeek}
          earnings={earnings}
          deductionFor={deductionFor}
          percent={percent}
          customPercent={setAside.customPercent}
          onSave={setAside.save}
        />
      )}
    </ThemedView>
  );
}

/** The last 8 weeks' set-aside as small bars, this week on the right; weeks with nothing entered are a stub. */
function WeekBars({ weeks }: { weeks: readonly SetAsideWeek[] }) {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const max = Math.max(1, ...weeks.map((week) => week.setAside ?? 0));
  const label = weeks
    .map((week) =>
      week.setAside === null
        ? t('Week of {{date}}: no earnings entered', { date: formatDayMonth(week.weekStart, region) })
        : t('Week of {{date}}: {{amount}}', {
            date: formatDayMonth(week.weekStart, region),
            amount: formatMoney(week.setAside, region),
          }),
    )
    .join('. ');
  return (
    <View accessible accessibilityLabel={label} style={styles.bars}>
      <View style={styles.barRow}>
        {weeks.map((week, index) => {
          const now = index === weeks.length - 1;
          const height = week.setAside === null ? 3 : Math.max(4, Math.round((week.setAside / max) * 44));
          return (
            <View key={week.weekStart} style={styles.barSlot}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: week.setAside === null ? theme.backgroundSelected : theme.accent,
                    opacity: week.setAside === null || now ? 1 : 0.45,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.barLabels}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.tiny}>
          {formatDayMonth(weeks[0].weekStart, region)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.tiny}>
          {t('This week')}
        </ThemedText>
      </View>
    </View>
  );
}

/** Locked: what it does, a faded example, and both ways in (Pro, or one friend). */
function LockedSetAside() {
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  // A made-up amount, shown faded: what the card looks like, not the user's figure.
  const example = formatMoney(4250, region);
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.flex}>
          {t('Tax set-aside')}
        </ThemedText>
        <ProBadge />
      </View>
      <View style={styles.sample}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('Put aside for tax this week')}
        </ThemedText>
        <View style={styles.sampleFigure}>
          <BlurredText type="default" style={[styles.big, { color: theme.accent }]}>
            {example}
          </BlurredText>
        </View>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {t('Enter what you earn each week and see how much to put aside for tax, after your mileage, so the tax bill is no surprise.')}
      </ThemedText>
      <ThemedText type="smallBold">
        {t('Unlock with Pro, or invite 1 friend')}
      </ThemedText>
      <View style={styles.lockButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/pro')}
          style={[styles.lockButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Go Pro')}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/friends' as Href)}
          style={[styles.lockButton, styles.outline, { borderColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {t('Invite a friend')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  big: { fontSize: 36, lineHeight: 44, fontWeight: '800', fontVariant: ['tabular-nums'] },
  tabular: { fontVariant: ['tabular-nums'] },
  bars: { gap: Spacing.one, marginTop: Spacing.one },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', height: 46, gap: 6 },
  barSlot: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  tiny: { fontSize: 12, lineHeight: 16 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  add: { alignItems: 'center', borderRadius: 12, paddingVertical: 12, marginTop: Spacing.one },
  note: { fontSize: 12, lineHeight: 16 },
  sample: { gap: Spacing.half },
  sampleFigure: { alignSelf: 'flex-start' },
  lockButtons: { flexDirection: 'row', gap: Spacing.two },
  lockButton: { flex: 1, alignItems: 'center', borderRadius: 12, paddingVertical: 12 },
  outline: { borderWidth: 1 },
});
