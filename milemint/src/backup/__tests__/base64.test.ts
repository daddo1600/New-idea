import { describe, expect, it } from '@jest/globals';

import { base64ToBytes, base64ToUtf8, bytesToBase64, utf8Encode, utf8ToBase64 } from '../base64';

const SAMPLES = [
  '',
  'a',
  'ab',
  'abc',
  '{"start_label":"Home","purpose":"Site visit"}',
  'Café “Unit 2” – £12.40 → €14',
  'नमस्ते ਸਤ ਸ੍ਰੀ ਅਕਾਲ 你好 Zażółć',
  'Emoji 🚗🛵🚲 and a flag 🇬🇧',
];

describe('base64 of UTF-8 text', () => {
  it.each(SAMPLES)('matches Node for %p', (text) => {
    expect(utf8ToBase64(text)).toBe(Buffer.from(text, 'utf8').toString('base64'));
  });

  it.each(SAMPLES)('round-trips %p', (text) => {
    expect(base64ToUtf8(utf8ToBase64(text))).toBe(text);
  });

  it('writes a lone surrogate as the replacement character, like TextEncoder', () => {
    expect(Array.from(utf8Encode('a\ud800b'))).toEqual([0x61, 0xef, 0xbf, 0xbd, 0x62]);
  });

  it('handles text longer than one chunk', () => {
    const long = 'Mile 🚗 '.repeat(20_000);
    expect(base64ToUtf8(utf8ToBase64(long))).toBe(long);
  });
});

describe('base64 of bytes', () => {
  it('matches Node for every byte value and every padding length', () => {
    const all = Uint8Array.from({ length: 256 }, (_, i) => i);
    for (const length of [0, 1, 2, 3, 4, 255, 256]) {
      const bytes = all.subarray(0, length);
      const encoded = bytesToBase64(bytes);
      expect(encoded).toBe(Buffer.from(bytes).toString('base64'));
      expect(Array.from(base64ToBytes(encoded))).toEqual(Array.from(bytes));
    }
  });
});
