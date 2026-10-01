import { router, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { INVITE_MESSAGE } from '@/referral/links';
import { useRegion } from '@/region/region';

const SUPPORT_EMAIL = 'milemint.support@gmail.com';

/** An SF Symbol on iOS, a text glyph elsewhere. */
function Icon({ name, glyph, size, color }: { name: SFSymbol; glyph: string; size: number; color: string }) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      fallback={<Text style={{ color, fontSize: size, lineHeight: size + 4, textAlign: 'center' }}>{glyph}</Text>}
      style={{ width: size + 4, height: size + 4 }}
    />
  );
}

type MenuItem = {
  icon: SFSymbol;
  glyph: string;
  title: string;
  detail: string;
  /** Pro is set apart in the logo's yellow while it's still to buy. */
  highlight?: boolean;
  onPress: () => void;
};

/** Home's top-left button: the logo, which opens the app's other screens. */
export function MenuButton() {
  const theme = useTheme();
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Menu')}
        hitSlop={10}
        onPress={() => setOpen(true)}
        style={[styles.headerButton, styles.logoButton]}>
        <LeafMark size={30} />
        <Icon name="chevron.down" glyph="▾" size={9} color={theme.textSecondary} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Menu onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function Menu({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { isPro } = usePro();
  const { region } = useRegion();

  // Springs open from the logo.
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.value = withSpring(1, { damping: 18, stiffness: 220, mass: 0.8 });
  }, [shown]);
  const pop = useAnimatedStyle(() => ({
    opacity: Math.min(1, shown.value * 1.5),
    transform: [
      { translateX: -120 * (1 - shown.value) },
      { translateY: -110 * (1 - shown.value) },
      { scale: 0.6 + 0.4 * shown.value },
      { translateX: 120 * (1 - shown.value) },
      { translateY: 110 * (1 - shown.value) },
    ],
  }));

  const go = (href: Href) => {
    onClose();
    router.push(href);
  };

  const items: MenuItem[] = [
    {
      icon: 'doc.text.fill',
      glyph: '📄',
      title: t('Reports & export'),
      detail: t('Your mileage log for {{authority}}', { authority: region.authority }),
      onPress: () => go('/report'),
    },
    {
      icon: 'star.fill',
      glyph: '⭐',
      title: isPro ? 'MileMint Pro' : t('Go Pro'),
      detail: isPro ? t('Active · thank you!') : t('Unlimited drives and PDF reports'),
      highlight: !isPro,
      onPress: () => go('/pro'),
    },
    {
      icon: 'gift.fill',
      glyph: '🎁',
      title: t('Invite a friend'),
      detail: t('Share MileMint on WhatsApp and more'),
      onPress: () => {
        onClose();
        Share.share({ message: INVITE_MESSAGE }).catch(() => {});
      },
    },
    {
      icon: 'trophy.fill',
      glyph: '🏆',
      title: t('Milestones'),
      detail: t('Your money back and badges'),
      onPress: () => go('/milestones'),
    },
    {
      icon: 'calendar',
      glyph: '🗓️',
      title: t('Tax dates'),
      detail: t('When and how to claim with {{authority}}', { authority: region.authority }),
      onPress: () => go('/tax-dates'),
    },
    {
      icon: 'chart.bar.fill',
      glyph: '📊',
      title: t('Missed miles check'),
      detail: t('Compare with your delivery app'),
      onPress: () => go('/compare'),
    },
    {
      icon: 'gearshape.fill',
      glyph: '⚙️',
      title: t('Settings'),
      detail: t('Work hours, places and reminders'),
      onPress: () => go('/settings'),
    },
    {
      icon: 'envelope.fill',
      glyph: '✉️',
      title: t('Help & feedback'),
      detail: t('We read every message'),
      onPress: () => {
        onClose();
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=MileMint`).catch(() => {});
      },
    },
  ];

  return (
    <Pressable accessibilityLabel={t('Close menu')} style={styles.backdrop} onPress={onClose}>
      <Animated.View
        accessibilityRole="menu"
        style={[
          styles.menu,
          { top: insets.top + 50, backgroundColor: theme.background, borderColor: theme.backgroundSelected },
          pop,
        ]}>
        {/* The deductions card's gradient and leaf, so the menu belongs to the app. */}
        <View style={styles.hero}>
          <BrandGradient />
          <View style={styles.heroLeaf} pointerEvents="none">
            <LeafMark size={120} opacity={0.25} />
          </View>
          <Text style={styles.heroTitle}>
            Mile<Text style={styles.heroMint}>Mint</Text>
          </Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{isPro ? t('★ Pro · unlimited drives') : t('Free plan')}</Text>
          </View>
        </View>

        <View style={styles.items}>
          {items.map((item) => (
            <Pressable
              key={item.title}
              accessibilityRole="menuitem"
              accessibilityHint={item.detail}
              onPress={item.onPress}
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: theme.backgroundElement }]}>
              <View
                style={[
                  styles.tile,
                  { backgroundColor: item.highlight ? '#FACC15' : theme.accent + '1F' },
                ]}>
                <Icon
                  name={item.icon}
                  glyph={item.glyph}
                  size={17}
                  color={item.highlight ? '#064E3B' : theme.accent}
                />
              </View>
              <View style={styles.itemText}>
                <ThemedText type="smallBold">{item.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {item.detail}
                </ThemedText>
              </View>
              <Icon name="chevron.right" glyph="›" size={12} color={theme.textSecondary} />
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Home's add-trip button, floating bottom right where a thumb reaches most easily. */
export function AddTripButton({ bottom }: { bottom: number }) {
  const theme = useTheme();
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Add a missed trip')}
      onPress={() => router.push('/add-trip')}
      style={({ pressed }) => [
        styles.fab,
        { bottom: bottom + Spacing.three, backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}>
      <Icon name="plus" glyph="+" size={24} color={theme.onAccent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: { paddingHorizontal: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  logoButton: { flexDirection: 'row', gap: 2 },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#053D2E',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  menu: {
    position: 'absolute',
    left: Spacing.three,
    width: 290,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  hero: { padding: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two, overflow: 'hidden' },
  heroLeaf: { position: 'absolute', right: -28, top: -30 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroMint: { color: '#86EFAC' },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  items: { padding: Spacing.one },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
  tile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, gap: 1 },
});
