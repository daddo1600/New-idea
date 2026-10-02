import { StyleSheet, Text, View } from 'react-native';

import type { PerkOffer } from '@/perks/offers';

/** A partner's emblem: its initials on its colour. Generated, never a logo. */
export function PerkEmblem({ offer, size = 48 }: { offer: PerkOffer; size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: offer.color }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{offer.initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5 },
});
