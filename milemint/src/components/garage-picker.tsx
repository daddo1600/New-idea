import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { VEHICLE_ICONS } from '@/domain/trip';
import type { Vehicle } from '@/domain/vehicles';
import { useTheme } from '@/hooks/use-theme';

/** Which of the user's vehicles a trip was in: one tap, icon and name. */
export function GaragePicker({
  vehicles,
  value,
  onChange,
}: {
  vehicles: readonly Vehicle[];
  value: string | null;
  onChange: (vehicle: Vehicle) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Vehicle">
      {vehicles.map((vehicle) => {
        const selected = vehicle.id === value;
        return (
          <Pressable
            key={vehicle.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(vehicle)}
            style={[
              styles.chip,
              selected
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
            ]}>
            <Text style={styles.icon}>{VEHICLE_ICONS[vehicle.type]}</Text>
            <ThemedText type="smallBold" numberOfLines={1} style={{ color: selected ? theme.onAccent : theme.text }}>
              {vehicle.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxWidth: '100%',
  },
  icon: { fontSize: 18, lineHeight: 22 },
});
