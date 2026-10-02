import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { DisplayRoute } from '@/domain/route-display';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

import { RouteMap } from './route-map';

/**
 * A detail screen's map of one or more routes: still, so the page scrolls
 * past it, and a tap opens it full screen to pan and zoom. Says so when
 * there's no route to draw. Never put one in a list row.
 */
export function RouteMapCard({
  routes,
  label,
  height = 180,
}: {
  routes: readonly DisplayRoute[];
  /** What the map shows, for VoiceOver. */
  label: string;
  height?: number;
}) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  if (routes.length === 0) {
    return (
      <ThemedView type="backgroundElement" style={[styles.card, styles.empty, { height: Math.min(height, 72) }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('No route recorded')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={t('Opens the map full screen')}
        onPress={() => setOpen(true)}
        style={[styles.card, { height, backgroundColor: theme.backgroundElement }]}>
        {/* Touches go to the card, not the map: the page scrolls and a tap opens it. */}
        <View style={[styles.fill, styles.still]}>
          <RouteMap routes={routes} />
        </View>
        <View style={[styles.expand, { backgroundColor: theme.background }]}>
          <ThemedText type="smallBold">⤢</ThemedText>
        </View>
      </Pressable>
      <Modal visible={open} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setOpen(false)}>
        <ThemedView style={styles.fill}>
          <RouteMap routes={routes} interactive padding={56} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setOpen(false)}
            hitSlop={8}
            style={[styles.close, { top: insets.top + Spacing.two, backgroundColor: theme.background }]}>
            <ThemedText type="smallBold">{t('Close')}</ThemedText>
          </Pressable>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, overflow: 'hidden' },
  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing.three },
  fill: { flex: 1 },
  still: { pointerEvents: 'none' },
  expand: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  close: {
    position: 'absolute',
    right: Spacing.three,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
