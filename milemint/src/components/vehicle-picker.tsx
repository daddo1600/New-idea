import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { VEHICLE_ICONS, type VehicleType } from '@/domain/trip';
import { useTheme } from '@/hooks/use-theme';
import { msg, useT } from '@/i18n/i18n';

const SHORT_LABELS: Record<VehicleType, string> = {
  car: msg('Car or van'),
  motorbike: msg('Motorbike'),
  bicycle: msg('Bicycle'),
};

/** Car, motorbike or bicycle as three equal buttons on one line, icon above the name. */
export function VehiclePicker({ value, onChange }: { value: VehicleType; onChange: (vehicle: VehicleType) => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t('Vehicle')}>
      {(['car', 'motorbike', 'bicycle'] as const).map((vehicle) => {
        const selected = vehicle === value;
        return (
          <Pressable
            key={vehicle}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(SHORT_LABELS[vehicle])}
            onPress={() => onChange(vehicle)}
            style={[
              styles.option,
              selected
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
            ]}>
            <Text style={styles.icon}>{VEHICLE_ICONS[vehicle]}</Text>
            <ThemedText type="smallBold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: selected ? theme.onAccent : theme.text }}>
              {t(SHORT_LABELS[vehicle])}
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
