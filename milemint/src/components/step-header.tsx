import { useId, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { BrandGradient } from '@/components/brand-gradient';
import { LeafMark } from '@/components/leaf-mark';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Simple white line icons for the set-up steps, drawn on a 24-unit grid. */
const GLYPHS: Record<StepGlyph, ReactNode> = {
  globe: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  location: <Path d="M20 4 4 11l7 2 2 7 7-16Z" />,
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3.5 2" />
    </>
  ),
  home: (
    <>
      <Path d="M4 11 12 4l8 7" />
      <Path d="M6 9.5V20h12V9.5" />
      <Rect x={10} y={14} width={4} height={6} />
    </>
  ),
  briefcase: (
    <>
      <Rect x={3} y={7} width={18} height={13} rx={2} />
      <Path d="M9 7V4.5h6V7M3 12.5h18" />
    </>
  ),
};

export type StepGlyph = 'globe' | 'location' | 'clock' | 'home' | 'briefcase';

/**
 * The top of each set-up step: a green brand card like the home screen's,
 * with the leaf behind, the step's icon, a gold step label, the title and one
 * line of explanation. Keeps every step on brand between the green welcome
 * and done screens.
 */
export function StepHeader({
  glyph,
  eyebrow,
  title,
  children,
}: {
  glyph: StepGlyph;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <BrandGradient />
      <View style={styles.leaf} pointerEvents="none">
        <LeafMark size={150} opacity={0.18} />
      </View>
      <View style={styles.headRow}>
        <View style={styles.tile}>
          <StepIcon glyph={glyph} />
        </View>
        <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {children ? <Text style={styles.body}>{children}</Text> : null}
    </View>
  );
}

/** A step's white line icon. */
export function StepIcon({ glyph, size = 24 }: { glyph: StepGlyph; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke="#FFFFFF" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[glyph]}
      </G>
    </Svg>
  );
}

/** A faint mint wash fading down from the top of the screen, tying white steps to the green ones. */
export function MintWash({ height = 280 }: { height?: number }) {
  const theme = useTheme();
  const id = `wash${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View pointerEvents="none" style={[styles.wash, { height }]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.accent} stopOpacity={0.14} />
            <Stop offset="1" stopColor={theme.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Numbered instructions with the numbers in brand green. */
export function NumberedSteps({ steps }: { steps: readonly string[] }) {
  const theme = useTheme();
  return (
    <View style={styles.steps}>
      {steps.map((step, i) => (
        <View key={step} style={styles.step}>
          <View style={[styles.number, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={[styles.numberText, { color: theme.onAccent }]}>
              {i + 1}
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.flex}>
            {step}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one + 2,
    marginBottom: Spacing.one,
    borderRadius: 20,
    padding: Spacing.four,
    overflow: 'hidden',
  },
  leaf: { position: 'absolute', right: -34, bottom: -44 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  eyebrow: { color: '#FACC15', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.3 },
  body: { color: '#D1FAE5', fontSize: 15, lineHeight: 21, marginTop: 2 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0 },
  steps: { gap: Spacing.two + 2 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  number: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, lineHeight: 16 },
  flex: { flex: 1, paddingTop: 2 },
});
