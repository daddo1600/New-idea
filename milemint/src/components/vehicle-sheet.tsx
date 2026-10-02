import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { VEHICLE_ICONS, VEHICLE_LABELS } from '@/domain/trip';
import type { Vehicle } from '@/domain/vehicles';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';

/** Pick one of the garage's vehicles from a sheet that slides up. */
export function VehicleSheet({
  visible,
  title,
  vehicles,
  currentId,
  onPick,
  onClose,
}: {
  visible: boolean;
  title: string;
  vehicles: readonly Vehicle[];
  currentId: string | null;
  onPick: (vehicle: Vehicle) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('Close')} style={[styles.backdrop, { backgroundColor: theme.backdrop }]} onPress={onClose} />
      <ThemedView type="sheet" style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={[styles.grabber, { backgroundColor: theme.backgroundSelected }]} />
        <ThemedText type="smallBold" style={styles.title}>
          {title}
        </ThemedText>
        {vehicles.map((vehicle) => {
          const selected = vehicle.id === currentId;
          return (
            <Pressable
              key={vehicle.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onPick(vehicle)}
              style={({ pressed }) => [
                styles.option,
                { borderColor: selected ? theme.accent : theme.backgroundSelected },
                selected && { backgroundColor: theme.accent + '14' },
                pressed && { backgroundColor: theme.backgroundSelected },
              ]}>
              <Text style={styles.icon}>{VEHICLE_ICONS[vehicle.type]}</Text>
              <View style={styles.flex}>
                <ThemedText type="smallBold">{vehicle.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {[t(VEHICLE_LABELS[vehicle.type]), vehicle.registration].filter(Boolean).join(' · ')}
                </ThemedText>
              </View>
              {selected && <ThemedText style={{ color: theme.accent }}>✓</ThemedText>}
            </Pressable>
          );
        })}
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: Spacing.one },
  title: { textAlign: 'center', marginBottom: Spacing.one },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: Spacing.three,
  },
  icon: { fontSize: 26, lineHeight: 32 },
  flex: { flex: 1 },
});
