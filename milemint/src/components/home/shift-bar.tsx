import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { ShiftSwitch } from '@/components/shift-switch';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Shift } from '@/db/shifts-repo';
import { shiftCheer } from '@/domain/cheers';
import { getLanguage, useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

import { LiveDot } from './live-dot';

/** Shift mode: swipe to start, swipe back to end; every drive in between is work. */
export function ShiftBar({
  shift,
  drives,
  distance,
  value,
  revision,
  onStart,
  onEnd,
}: {
  revision: number;
  shift: Shift | null;
  drives: number;
  distance: string;
  value: string;
  onStart: () => void;
  onEnd: () => void;
}) {
  const t = useT();
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
        startHint={t('Every drive until you end your shift counts as work')}
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
                  {t('On shift · {{elapsed}}', { elapsed })}
                </Text>
              )}
              <Text style={styles.shiftSub} numberOfLines={1}>
                {drives > 0
                  ? t('{{distance}} · {{value}} · {{count}} drives', { distance, value, count: drives })
                  : t('Every drive counts as work')}
              </Text>
            </View>
          </>
        )}
      </ShiftSwitch>
      {/* No pause: a personal errand mid-shift is just swiped to personal afterwards. */}
      <ThemedText type="small" themeColor="textSecondary" style={styles.shiftHint}>
        {shift
          ? t('Swipe back to end your shift. Stopped for something personal? Swipe that drive left afterwards.')
          : t('Every drive until you end your shift counts as work.')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: Spacing.one },
  shiftStart: { gap: Spacing.one + 2 },
  shiftHint: { textAlign: 'center' },
  cheer: { color: '#FEF3C7', fontSize: 19, fontWeight: '800' },
  shiftTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  shiftSub: { color: '#FEF3C7', fontSize: 12 },
});
