import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Text, type ColorValue } from 'react-native';

/** An SF Symbol on iOS, a text glyph elsewhere. */
export function SymbolIcon({ name, glyph, size, color }: { name: SFSymbol; glyph: string; size: number; color: ColorValue }) {
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
