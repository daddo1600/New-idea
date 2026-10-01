import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A small replica of an iOS permission pop-up with the button to tap
 * highlighted, so the real one is familiar when it appears. People stall on
 * these when reading them cold; seeing where to tap first takes the doubt away.
 */
export function IosPromptMock({
  step,
  title,
  buttons,
  tap,
}: {
  /** "1", "2": the order iOS asks in. */
  step: string;
  title: string;
  buttons: readonly string[];
  /** Index of the button to tap. */
  tap: number;
}) {
  const theme = useTheme();
  const dark = theme.background === '#000000';
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`iOS will ask: ${title}. Tap ${buttons[tap]}.`}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>{step}</Text>
      </View>
      <View style={[styles.alert, { backgroundColor: dark ? '#2C2C2E' : '#F2F2F7' }]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {buttons.map((label, i) => {
          const target = i === tap;
          return (
            <View
              key={label}
              style={[
                styles.button,
                { borderTopColor: dark ? '#3A3A3C' : '#D1D1D6' },
                target && { backgroundColor: theme.accent + '2E' },
              ]}>
              <Text
                style={[
                  styles.buttonText,
                  { color: target ? theme.accent : '#0A84FF', fontWeight: target ? '800' : '400' },
                ]}>
                {label}
              </Text>
              {target && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Tap this</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  // Gold, so it reads on the brand green as well as on white.
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#FACC15',
  },
  stepText: { fontSize: 13, fontWeight: '800', color: '#064E3B' },
  alert: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  title: { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingHorizontal: Spacing.three, paddingVertical: 10 },
  button: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15 },
  tag: {
    position: 'absolute',
    right: 8,
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { color: '#064E3B', fontSize: 10, fontWeight: '800' },
});
