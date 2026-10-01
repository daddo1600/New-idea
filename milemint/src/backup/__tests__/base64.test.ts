import { describe, expect, it, jest } from '@jest/globals';

import {
  base64ToBytes,
  base64ToUtf8,
  base64ToUtf8Async,
  bytesToBase64,
  utf8Decode,
  utf8Encode,
  utf8ToBase64,
  utf8ToBase64Async,
} from '../base64';

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

/** Over a megabyte, with multi-byte characters landing on every slice boundary. */
const BIG = Array.from({ length: 40_000 }, (_, i) => `${i} Zoë’s café 🚗 東京 "q" \\ `).join('|');

describe('async (chunked) base64 of UTF-8 text', () => {
  it('matches Node and the sync version for text spanning many slices', async () => {
    const expected = Buffer.from(BIG, 'utf8').toString('base64');
    expect(await utf8ToBase64Async(BIG)).toBe(expected);
    expect(utf8ToBase64(BIG)).toBe(expected);
    expect(await base64ToUtf8Async(expected)).toBe(BIG);
    expect(base64ToUtf8(expected)).toBe(BIG);
  });

  it.each(SAMPLES)('round-trips %p', async (text) => {
    expect(await base64ToUtf8Async(await utf8ToBase64Async(text))).toBe(text);
  });

  it('gives the JavaScript thread back while it works', async () => {
    let ticks = 0;
    const timer = setInterval(() => ticks++, 0);
    const text = BIG.repeat(4);
    const encoded = await utf8ToBase64Async(text);
    await base64ToUtf8Async(encoded);
    clearInterval(timer);
    expect(ticks).toBeGreaterThan(0);
  });

  it('skips line breaks in base64 even across slices', async () => {
    const wrapped = Buffer.from(BIG, 'utf8').toString('base64').replace(/(.{76})/g, '$1\n');
    expect(await base64ToUtf8Async(wrapped)).toBe(BIG);
  });
});

describe('without TextEncoder (the hand-written encoder)', () => {
  it('encodes exactly as TextEncoder does', () => {
    const saved = globalThis.TextEncoder;
    let manual: typeof import('../base64') | undefined;
    try {
      // @ts-expect-error: removed to load the fallback
      delete globalThis.TextEncoder;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh copy of the module
        manual = require('../base64');
      });
    } finally {
      globalThis.TextEncoder = saved;
    }
    for (const text of [...SAMPLES, 'a\ud800b', '\udc00', BIG]) {
      expect(Buffer.from(manual!.utf8Encode(text)).equals(Buffer.from(new TextEncoder().encode(text)))).toBe(true);
    }
  });
});

describe('UTF-8 decoding', () => {
  it('turns broken sequences into the replacement character', () => {
    expect(utf8Decode(Uint8Array.from([0x61, 0xe2, 0x82, 0x62, 0xff, 0xf0, 0x9f]))).toBe('a�b��');
  });
});
