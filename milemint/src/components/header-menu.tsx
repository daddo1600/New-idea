import { router, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePro } from '@/purchases/pro';

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

/** Home's top-left button: the logo, which opens the app's other screens. */
export function MenuButton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isPro } = usePro();
  const [open, setOpen] = useState(false);

  const go = (href: Href) => {
    setOpen(false);
    router.push(href);
  };

  const items: { icon: SFSymbol; glyph: string; label: string; onPress: () => void }[] = [
    { icon: 'doc.text', glyph: '📄', label: 'Reports & export', onPress: () => go('/report') },
    { icon: 'star', glyph: '⭐', label: isPro ? 'MileMint Pro (active)' : 'MileMint Pro', onPress: () => go('/pro') },
    {
      icon: 'envelope',
      glyph: '✉️',
      label: 'Help & feedback',
      onPress: () => {
        setOpen(false);
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=MileMint`).catch(() => {});
      },
    },
    { icon: 'gearshape', glyph: '⚙️', label: 'Settings', onPress: () => go('/settings') },
  ];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Menu"
        hitSlop={10}
        onPress={() => setOpen(true)}
        style={[styles.headerButton, styles.logoButton]}>
        <LeafMark size={30} />
        <Icon name="chevron.down" glyph="▾" size={9} color={theme.textSecondary} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Close menu" style={styles.backdrop} onPress={() => setOpen(false)}>
          <ThemedView
            type="backgroundElement"
            accessibilityRole="menu"
            style={[styles.menu, { top: insets.top + 52, shadowColor: '#000' }]}>
            {items.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="menuitem"
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.item,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.backgroundSelected },
                  pressed && { backgroundColor: theme.backgroundSelected },
                ]}>
                <Icon name={item.icon} glyph={item.glyph} size={18} color={theme.accent} />
                <ThemedText type="small">{item.label}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

/** Home's top-right button: add a trip that wasn't tracked. */
export function AddTripButton() {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a missed trip"
      hitSlop={10}
      onPress={() => router.push('/add-trip')}
      style={styles.headerButton}>
      <View style={[styles.plus, { backgroundColor: theme.accent }]}>
        <Icon name="plus" glyph="+" size={16} color={theme.onAccent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: { paddingHorizontal: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  logoButton: { flexDirection: 'row', gap: 2 },
  plus: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  menu: {
    position: 'absolute',
    left: Spacing.three,
    minWidth: 230,
    borderRadius: 14,
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 14 },
});
