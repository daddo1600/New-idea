import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BlurredText } from '@/components/blurred-text';
import { ProBadge } from '@/components/pro-prompt';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listEditedTripIds } from '@/db/trips-repo';
import { listAllVehicles } from '@/db/vehicles-repo';
import {
  daysUntil,
  formatQuarterRange,
  QUARTER_PURPOSE,
  quartersToShow,
  summarizeQuarter,
  type Quarter,
  type QuarterSummary,
} from '@/domain/quarters';
import { formatDistance, formatLongDate, formatMoney, taxYearLabel, taxYearOf, type Region } from '@/domain/regions';
import { buildReport } from '@/domain/report';
import { toLocalIsoDate, type Trip } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';
import { PDF_AVAILABLE, shareCsv, sharePdf } from '@/reports/export';

const key = (quarter: Quarter) => `${quarter.taxYear}-${quarter.number}`;

/**
 * Quarterly figures (Pro), under the year total on the Money tab: each quarter
 * of the tax year (and last year's still due) with its business distance,
 * mileage at the official rates, parking and tolls, drives to sort, and the
 * deadline. The current quarter is open; the others are a row each. Free
 * users see the current quarter with its totals blurred.
 */
export function QuarterlyFigures({
  trips,
  deductions,
  employee,
}: {
  trips: readonly Trip[];
  deductions: ReadonlyMap<string, number>;
  employee: boolean;
}) {
  const { isPro } = usePro();
  const { region } = useRegion();
  const t = useT();
  const today = toLocalIsoDate(new Date());
  const quarters = useMemo(() => quartersToShow(region, today), [region, today]);
  const current = quarters.find((quarter) => quarter.start <= today && today <= quarter.end) ?? quarters[0];
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set([key(current)]));
  const summaries = useMemo(
    () => quarters.map((quarter) => summarizeQuarter(trips, region, quarter, deductions, { employee })),
    [quarters, trips, region, deductions, employee],
  );

  const toggle = (quarter: Quarter) =>
    setOpen((was) => {
      const next = new Set(was);
      if (next.has(key(quarter))) next.delete(key(quarter));
      else next.add(key(quarter));
      return next;
    });

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <ThemedText type="smallBold" style={styles.flex}>
          {t('Quarterly figures')}
        </ThemedText>
        {!isPro && <ProBadge />}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {t(QUARTER_PURPOSE[region.code])}
      </ThemedText>
      {isPro ? (
        <ThemedView type="backgroundElement" style={styles.card}>
          {summaries.map((summary, index) => (
            <QuarterRow
              key={key(summary.quarter)}
              summary={summary}
              region={region}
              today={today}
              divided={index > 0}
              expanded={open.has(key(summary.quarter))}
              onToggle={() => toggle(summary.quarter)}
              trips={trips}
              employee={employee}
            />
          ))}
        </ThemedView>
      ) : (
        <LockedQuarter summary={summaries[quarters.indexOf(current)]} region={region} today={today} />
      )}
    </View>
  );
}

/** "Q2 · 6 Jul – 5 Oct", with the tax year for one from last year. */
function quarterTitle(t: ReturnType<typeof useT>, quarter: Quarter, region: Region, today: string): string {
  const name = t('Q{{number}}', { number: quarter.number });
  const earlier = quarter.taxYear < taxYearOf(today, region) ? ` ${taxYearLabel(quarter.taxYear, region)}` : '';
  return `${name}${earlier} · ${formatQuarterRange(quarter, region)}`;
}

/** "Due 7 Nov · 36 days left", "Due today" or "Was due 7 Aug". */
function DeadlineLine({ quarter, region, today }: { quarter: Quarter; region: Region; today: string }) {
  const t = useT();
  const theme = useTheme();
  const days = daysUntil(today, quarter.due);
  const date = formatLongDate(quarter.due, region);
  if (days < 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        {t('Was due {{date}}', { date })}
      </ThemedText>
    );
  }
  const soon = days <= 14;
  return (
    <ThemedText type="small" themeColor={soon ? undefined : 'textSecondary'} style={soon ? { color: theme.warning } : null}>
      {days === 0
        ? t('Due today')
        : `${t('Due {{date}}', { date })} · ${t('{{count}} days left', { count: days })}`}
    </ThemedText>
  );
}

function QuarterRow({
  summary,
  region,
  today,
  divided,
  expanded,
  onToggle,
  trips,
  employee,
}: {
  summary: QuarterSummary;
  region: Region;
  today: string;
  divided: boolean;
  expanded: boolean;
  onToggle: () => void;
  trips: readonly Trip[];
  employee: boolean;
}) {
  const theme = useTheme();
  const t = useT();
  const { quarter } = summary;
  const started = quarter.start <= today;
  return (
    <View style={[styles.row, divided && { borderTopColor: theme.backgroundSelected, borderTopWidth: StyleSheet.hairlineWidth }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.rowHeader}>
        <View style={styles.flex}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {quarterTitle(t, quarter, region, today)}
          </ThemedText>
          <DeadlineLine quarter={quarter} region={region} today={today} />
        </View>
        <ThemedText type="smallBold" style={styles.value} themeColor={started ? undefined : 'textSecondary'}>
          {started ? formatMoney(summary.total, region) : '–'}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.chevron}>
          {expanded ? '▾' : '▸'}
        </ThemedText>
      </Pressable>
      {expanded &&
        (started ? (
          <QuarterDetails summary={summary} region={region} trips={trips} employee={employee} />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.details}>
            {t('Starts {{date}}', { date: formatLongDate(quarter.start, region) })}
          </ThemedText>
        ))}
    </View>
  );
}

/** One line of figures: a label and its value. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.figure}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.tabular}>
        {value}
      </ThemedText>
    </View>
  );
}

function QuarterDetails({
  summary,
  region,
  trips,
  employee,
}: {
  summary: QuarterSummary;
  region: Region;
  trips: readonly Trip[];
  employee: boolean;
}) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const [busy, setBusy] = useState<'csv' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { quarter } = summary;
  const costs = summary.costs > 0;

  const exportQuarter = async (kind: 'csv' | 'pdf') => {
    setBusy(kind);
    setError(null);
    try {
      const [editedIds, vehicles] = await Promise.all([listEditedTripIds(db), listAllVehicles(db)]);
      const report = buildReport(trips, region, quarter.taxYear, {
        editedIds,
        vehicles,
        employee,
        range: { start: quarter.start, end: quarter.end, name: `Q${quarter.number}` },
      });
      await (kind === 'csv' ? shareCsv(report) : sharePdf(report));
    } catch {
      setError(msg('Couldn’t create the file. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.details}>
      <Figure label={t('Work distance')} value={formatDistance(summary.businessMeters, region)} />
      <Figure
        label={t('Mileage at {{authority}} rates', { authority: region.authority })}
        value={formatMoney(summary.mileage, region)}
      />
      {costs && (
        <Figure
          label={summary.costsAdded ? t('Parking and tolls') : t('Parking and tolls (listed apart)')}
          value={formatMoney(summary.costs, region)}
        />
      )}
      <Figure label={t('Work drives')} value={String(summary.businessCount)} />
      {summary.unsortedCount > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate({ pathname: '/', params: { sort: 'unsorted' } })}>
          <ThemedText type="small" style={{ color: theme.warning }}>
            ⚠︎ {t('Drives still to sort: {{number}}', { number: summary.unsortedCount })} ›
          </ThemedText>
        </Pressable>
      )}
      {summary.missingPurposeCount > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.navigate({ pathname: '/', params: { fill: 'purpose', year: String(quarter.taxYear) } })
          }>
          <ThemedText type="small" style={{ color: theme.warning }}>
            ⚠︎ {t('Work drives without a purpose: {{number}}', { number: summary.missingPurposeCount })} ›
          </ThemedText>
        </Pressable>
      )}
      <View style={styles.exportRow}>
        <ExportButton
          label={busy === 'csv' ? t('Preparing…') : t('Export this quarter (CSV)')}
          disabled={busy !== null}
          onPress={() => exportQuarter('csv')}
        />
        {PDF_AVAILABLE && (
          <ExportButton label={busy === 'pdf' ? t('Preparing…') : 'PDF'} disabled={busy !== null} onPress={() => exportQuarter('pdf')} narrow />
        )}
      </View>
      {error && (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {t(error)}
        </ThemedText>
      )}
    </View>
  );
}

function ExportButton({
  label,
  onPress,
  disabled,
  narrow = false,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  narrow?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.exportButton, !narrow && styles.flex, { borderColor: theme.accent, opacity: disabled ? 0.5 : 1 }]}>
      <ThemedText type="smallBold" style={{ color: theme.accent }} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/** Free plan: this quarter and its deadline, with the figures blurred, and the way to Pro. */
function LockedQuarter({ summary, region, today }: { summary: QuarterSummary; region: Region; today: string }) {
  const theme = useTheme();
  const t = useT();
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.rowHeader}>
          <View style={styles.flex}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {quarterTitle(t, summary.quarter, region, today)}
            </ThemedText>
            <DeadlineLine quarter={summary.quarter} region={region} today={today} />
          </View>
          <BlurredText type="smallBold" style={styles.value}>
            {formatMoney(summary.total, region)}
          </BlurredText>
        </View>
        <View style={styles.details}>
          {[
            [t('Work distance'), formatDistance(summary.businessMeters, region)],
            [t('Mileage at {{authority}} rates', { authority: region.authority }), formatMoney(summary.mileage, region)],
            [t('Work drives'), String(summary.businessCount)],
          ].map(([label, value]) => (
            <View key={label} style={styles.figure}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
                {label}
              </ThemedText>
              <BlurredText style={styles.tabular}>{value}</BlurredText>
            </View>
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {t('Each quarter’s figures and deadline, a reminder two weeks before, and an export for the quarter.')}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/pro')}
          style={[styles.unlock, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            {t('Unlock with Pro')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
  card: { borderRadius: 12, paddingHorizontal: Spacing.three },
  row: { paddingVertical: Spacing.two + 2, gap: Spacing.two },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  value: { minWidth: 72, textAlign: 'right', fontVariant: ['tabular-nums'] },
  chevron: { width: 14, textAlign: 'center' },
  details: { gap: Spacing.one + 2, paddingBottom: Spacing.one },
  figure: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tabular: { fontVariant: ['tabular-nums'] },
  exportRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  exportButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
  },
  unlock: { alignItems: 'center', borderRadius: 12, paddingVertical: 12 },
});
