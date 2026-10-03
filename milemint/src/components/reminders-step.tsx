import * as Haptics from 'expo-haptics';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { LeafMark } from '@/components/leaf-mark';
import { Spacing } from '@/constants/theme';
import { WEEKLY_MESSAGES } from '@/domain/reminders';
import { currentTaxYear, taxYearLabel, type Region } from '@/domain/regions';
import { useLanguage, useT } from '@/i18n/i18n';

/** The second banner stacks in behind the first after this long. */
const SECOND_AFTER_MS = 1800;
/** How far the second banner shows below the first: enough for its title line. */
const PEEK = 40;

/**
 * Set-up's reminders step, before iOS asks about notifications: what
 * MileSprout actually sends (only these), shown as a real notification
 * sliding down. Its buttons are the screen's own ("Turn on notifications" asks).
 * Perk alerts are never part of this: they'd be a separate switch, off by default.
 */
export function RemindersStep({ region }: { region: Region }) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const rows = [
    { icon: '📋', label: t('Sunday recap: drives to sort') },
    { icon: '⚠️', label: t('If logging stops') },
    { icon: '⏳', label: t('Tax deadlines') },
  ];
  return (
    <>
      <Text style={styles.eyebrow}>{t('One last thing').toLocaleUpperCase()}</Text>
      <Text style={styles.title} accessibilityRole="header">
        {t('A nudge when it counts.')}
      </Text>
      <Text style={styles.body}>{t('Usually one a week. Never ads.')}</Text>
      <NotificationStack region={region} />
      <View style={styles.rows}>
        {rows.map((row, i) => (
          <Animated.View
            key={row.icon}
            entering={reduceMotion ? undefined : FadeInDown.duration(260).delay(500 + i * 80)}
            style={styles.row}>
            <View style={styles.rowIcon}>
              <Text style={styles.rowEmoji}>{row.icon}</Text>
            </View>
            <Text style={styles.rowLabel}>{row.label}</Text>
          </Animated.View>
        ))}
      </View>
      <Text style={styles.footnote}>{t('Change them any time in Settings.')}</Text>
    </>
  );
}

/** "now", as iOS writes it on a banner, in the app's language; nothing where Intl can't say it. */
function nowLabel(locale: string): string | null {
  try {
    if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat !== 'function') return null;
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second');
  } catch {
    return null;
  }
}

/**
 * The hero: the Sunday recap slides down like a real banner, then a tax-year
 * countdown stacks in behind it. Plays once; Reduce Motion shows both still.
 */
function NotificationStack({ region }: { region: Region }) {
  const t = useT();
  const lang = useLanguage();
  const reduceMotion = useReducedMotion();
  const now = useMemo(() => nowLabel(lang), [lang]);
  // Real notifications MileSprout sends (domain/reminders, domain/deadlines), in the current language.
  const recap = WEEKLY_MESSAGES[0];
  // The flag goes first: the line is cut short with "…" on narrow phones and long languages.
  const countdown = `🏁 ${t('One week left in the {{year}} tax year 🏁', {
    year: taxYearLabel(currentTaxYear(region), region),
  })
    .replace(/\s*🏁\s*$/u, '')
    .trim()}`;
  const first = useSharedValue(reduceMotion ? 1 : 0);
  const second = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    first.set(withSpring(1, { damping: 16, stiffness: 180 }));
    second.set(withDelay(SECOND_AFTER_MS, withTiming(1, { duration: 420 })));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
  }, [first, second, reduceMotion]);

  const firstStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, first.value * 1.5),
    transform: [{ translateY: -40 * (1 - first.value) }],
  }));
  const secondStyle = useAnimatedStyle(() => ({
    opacity: 0.85 * second.value,
    transform: [{ translateY: PEEK * second.value }, { scale: 0.92 }],
  }));

  const header = (
    <View style={styles.bannerHeader}>
      <View style={styles.appIcon}>
        <LeafMark size={22} />
      </View>
      {/* A brand name: not translated. */}
      <Text style={styles.appName}>MileSprout</Text>
      {now && <Text style={styles.now}>{now}</Text>}
    </View>
  );

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={t('Example notification: Your drives are waiting. Sort them before Monday.')}>
      <View style={styles.stack}>
        {/* Only its last line shows below the first: the real countdown, not a blank strip. */}
        <Animated.View style={[styles.banner, styles.behind, secondStyle]}>
          <Text style={[styles.bannerTitle, styles.behindTitle]} numberOfLines={1}>
            {countdown}
          </Text>
        </Animated.View>
        <Animated.View style={[styles.banner, firstStyle]}>
          {header}
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {t(recap.title)}
          </Text>
          <Text style={styles.bannerBody} numberOfLines={2}>
            {t(recap.body)}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: '#FDE68A', fontSize: 13, fontWeight: '800', letterSpacing: 1.2, marginTop: Spacing.one },
  title: { color: '#FFFFFF', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  body: { color: '#D1FAE5', fontSize: 17, lineHeight: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    padding: Spacing.three,
    paddingBottom: Spacing.three + PEEK - 4,
    overflow: 'hidden',
  },
  stack: { minHeight: 96 },
  banner: {
    // Opaque, like iOS's banner over a stack: only the edge of the one behind shows.
    backgroundColor: '#F4F7F5',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  behind: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end' },
  behindTitle: { color: '#3A3A3C' },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: 4 },
  appIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { flex: 1, color: '#1C1C1E', fontSize: 13, fontWeight: '600' },
  now: { color: '#6B6B70', fontSize: 13 },
  bannerTitle: { color: '#1C1C1E', fontSize: 15, lineHeight: 20, fontWeight: '700' },
  bannerBody: { color: '#2C2C2E', fontSize: 15, lineHeight: 20 },
  rows: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowEmoji: { fontSize: 16, lineHeight: 20 },
  rowLabel: { flex: 1, color: '#FFFFFF', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  footnote: { color: '#D1FAE5', fontSize: 13, lineHeight: 18 },
});
