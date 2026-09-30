import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { BrandGradient } from '@/components/brand-gradient';
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
};

export type StepGlyph = 'globe' | 'location' | 'clock' | 'home';

/**
 * The top of each white set-up step: a small tile in the logo's green with the
 * step's icon, a step label, the title and one line of explanation.
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
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.tile}>
        <BrandGradient />
        {/* Its own layer, so it always sits above the gradient. */}
        <View style={styles.glyph}>
          <Svg width={26} height={26} viewBox="0 0 24 24">
            <G fill="none" stroke="#FFFFFF" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              {GLYPHS[glyph]}
            </G>
          </Svg>
        </View>
      </View>
      <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.accent }]}>
        {eyebrow.toUpperCase()}
      </ThemedText>
      <ThemedText type="subtitle" accessibilityRole="header">
        {title}
      </ThemedText>
      {children ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
          {children}
        </ThemedText>
      ) : null}
    </View>
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
  header: { gap: Spacing.one + 2, marginBottom: Spacing.one },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  glyph: { position: 'relative', zIndex: 1 },
  eyebrow: { fontSize: 12, letterSpacing: 1.2 },
  body: { marginTop: 2 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0 },
  steps: { gap: Spacing.two + 2 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  number: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, lineHeight: 16 },
  flex: { flex: 1, paddingTop: 2 },
});
