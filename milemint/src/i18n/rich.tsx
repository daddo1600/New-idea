import { Text, type StyleProp, type TextStyle } from 'react-native';

/**
 * A translated sentence with bold words in it: `<b>…</b>` marks them, so a
 * translation can put the bold part wherever its grammar needs it.
 * `t('Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>.')`
 */
export function Rich({
  text,
  style,
  boldStyle,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  boldStyle?: StyleProp<TextStyle>;
}) {
  const parts = text.split(/<b>(.*?)<\/b>/g);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={[{ fontWeight: '700' }, boldStyle]}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
