import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/**
 * The app icon's green, as a background that fills its parent (give the parent overflow: 'hidden').
 * `from` starts it darker where small text sits at its top-left (set-up: #0A7350 takes
 * #D1FAE5 body text to about 5.2:1 and the #FDE68A eyebrow to about 4.7:1, both WCAG AA).
 */
export function BrandGradient({ from = '#0E9F6E' }: { from?: string }) {
  // Each gradient needs its own id: on the web they share one page.
  const id = `brand${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor="#053D2E" />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
