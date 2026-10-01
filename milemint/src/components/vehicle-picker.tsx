import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { VEHICLE_ICONS, type VehicleType } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';

const SHORT_LABELS: Record<VehicleType, string> = { car: 'Car or van', motorbike: 'Motorbike', bicycle: 'Bicycle' };

/** Car, motorbike or bicycle as three equal buttons on one line, icon above the name. */
export function VehiclePicker({ value, onChange }: { value: VehicleType; onChange: (vehicle: VehicleType) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Vehicle">
      {(['car', 'motorbike', 'bicycle'] as const).map((vehicle) => {
        const selected = vehicle === value;
        return (
          <Pressable
            key={vehicle}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={SHORT_LABELS[vehicle]}
            onPress={() => onChange(vehicle)}
            style={[
              styles.option,
              selected
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
            ]}>
            <Text style={styles.icon}>{VEHICLE_ICONS[vehicle]}</Text>
            <ThemedText type="smallBold" numberOfLines={1} style={{ color: selected ? theme.onAccent : theme.text }}>
              {SHORT_LABELS[vehicle]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  icon: { fontSize: 22, lineHeight: 28 },
});
