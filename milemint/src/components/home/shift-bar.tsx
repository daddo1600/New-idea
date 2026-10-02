import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ShiftSwitch } from '@/components/shift-switch';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Shift } from '@/db/shifts-repo';
import { shiftCheer } from '@/domain/cheers';
import { useTheme } from '@/hooks/use-theme';
import { getLanguage, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

import { LiveDot } from './live-dot';

/** Shift mode: swipe to start, swipe back to end; every drive in between is work. */
export function ShiftBar({
  shift,
  paused,
  drives,
  distance,
  value,
  revision,
  onStart,
  onEnd,
  onTogglePause,
}: {
  revision: number;
  shift: Shift | null;
  /** On a break for a personal errand: drives now aren't work. */
  paused: boolean;
  onTogglePause: () => void;
  drives: number;
  distance: string;
  value: string;
  onStart: () => void;
  onEnd: () => void;
}) {
  const t = useT();
  const theme = useTheme();
  const { region } = useRegion();
  const [now, setNow] = useState(() => Date.now());
  /** A send-off shown for a few seconds after swiping to start. */
  const [cheer, setCheer] = useState<string | null>(null);
  const cheerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(cheerTimer.current), []);
  useEffect(() => {
    if (!shift) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [shift]);

  const minutes = shift ? Math.max(0, Math.floor((now - Date.parse(shift.startedAt)) / 60_000)) : 0;
  const elapsed = t('{{hours}}h {{minutes}}m', {
    hours: Math.floor(minutes / 60),
    minutes: String(minutes % 60).padStart(2, '0'),
  });
  return (
    <View style={styles.shiftStart}>
      <ShiftSwitch
        on={!!shift}
        revision={revision}
        startLabel={t('Swipe to start shift')}
        startHint={t('Every drive until you end it counts as business')}
        endLabel={t('On shift for {{elapsed}}, {{count}} drives', { elapsed, count: drives })}
        onStart={() => {
          setCheer(shiftCheer(region.code, Math.floor(Date.now() / 1000), getLanguage()));
          clearTimeout(cheerTimer.current);
          cheerTimer.current = setTimeout(() => setCheer(null), 3500);
          onStart();
        }}
        onEnd={() => {
          setCheer(null);
          onEnd();
        }}>
        {shift && (
          <>
            <LiveDot color="#FDE68A" />
            <View style={styles.flex}>
              {cheer ? (
                <Animated.Text
                  entering={ZoomIn.springify().damping(12)}
                  style={styles.cheer}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {cheer}
                </Animated.Text>
              ) : (
                <Text style={styles.shiftTitle} numberOfLines={1}>
                  {paused ? t('Paused · {{elapsed}}', { elapsed }) : t('On shift · {{elapsed}}', { elapsed })}
                </Text>
              )}
              <Text style={styles.shiftSub} numberOfLines={1}>
                {drives > 0
                  ? t('{{distance}} · {{value}} · {{count}} drives', { distance, value, count: drives })
                  : t('Every drive counts as business')}
              </Text>
            </View>
          </>
        )}
      </ShiftSwitch>
      <View style={styles.shiftFoot}>
        <ThemedText type="small" themeColor="textSecondary" style={[styles.shiftHint, styles.flex]}>
          {!shift
            ? t('Every drive until you end it counts as business.')
            : paused
              ? t('Paused: drives now aren’t counted as work. Resume when you’re back.')
              : t('Swipe back to end your shift.')}
        </ThemedText>
        {shift && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? t('Resume the shift') : t('Pause the shift for a personal errand')}
            hitSlop={8}
            onPress={onTogglePause}
            style={[styles.pauseButton, { borderColor: theme.accent }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {paused ? t('Resume') : t('Pause')}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: Spacing.one },
  shiftStart: { gap: Spacing.one + 2 },
  shiftHint: { textAlign: 'center' },
  shiftFoot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pauseButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  cheer: { color: '#FEF3C7', fontSize: 19, fontWeight: '800' },
  shiftTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  shiftSub: { color: '#FEF3C7', fontSize: 12 },
});
