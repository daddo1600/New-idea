/**
 * Text ↔ base64 (as UTF-8), for handing the backup to the native module,
 * which takes bytes as base64. Written out here rather than relying on
 * btoa/TextEncoder, so it behaves the same in Hermes, on the web and in tests.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Int16Array(128).fill(-1);
for (let i = 0; i < ALPHABET.length; i++) LOOKUP[ALPHABET.charCodeAt(i)] = i;

/** Characters per String.fromCharCode call: well under engines' argument limits. */
const CHUNK = 8192;

export function utf8Encode(text: string): Uint8Array {
  const out = new Uint8Array(text.length * 3);
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code < 0xdc00 && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low < 0xe000) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    // A lone surrogate can't be written as UTF-8: the replacement character, as TextEncoder does.
    if (code >= 0xd800 && code < 0xe000) code = 0xfffd;
    if (code < 0x80) {
      out[n++] = code;
    } else if (code < 0x800) {
      out[n++] = 0xc0 | (code >> 6);
      out[n++] = 0x80 | (code & 0x3f);
    } else if (code < 0x10000) {
      out[n++] = 0xe0 | (code >> 12);
      out[n++] = 0x80 | ((code >> 6) & 0x3f);
      out[n++] = 0x80 | (code & 0x3f);
    } else {
      out[n++] = 0xf0 | (code >> 18);
      out[n++] = 0x80 | ((code >> 12) & 0x3f);
      out[n++] = 0x80 | ((code >> 6) & 0x3f);
      out[n++] = 0x80 | (code & 0x3f);
    }
  }
  return out.subarray(0, n);
}

export function utf8Decode(bytes: Uint8Array): string {
  const units: number[] = [];
  const parts: string[] = [];
  const flush = () => {
    parts.push(String.fromCharCode(...units));
    units.length = 0;
  };
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i];
    let code: number;
    let extra: number;
    if (b < 0x80) [code, extra] = [b, 0];
    else if (b >= 0xc0 && b < 0xe0) [code, extra] = [b & 0x1f, 1];
    else if (b >= 0xe0 && b < 0xf0) [code, extra] = [b & 0x0f, 2];
    else if (b >= 0xf0 && b < 0xf8) [code, extra] = [b & 0x07, 3];
    else [code, extra] = [0xfffd, 0];
    i++;
    for (let k = 0; k < extra; k++, i++) {
      const next = bytes[i];
      if (next === undefined || (next & 0xc0) !== 0x80) {
        code = 0xfffd;
        break;
      }
      code = (code << 6) | (next & 0x3f);
    }
    if (code >= 0x10000) {
      code -= 0x10000;
      units.push(0xd800 + (code >> 10), 0xdc00 + (code & 0x3ff));
    } else {
      units.push(code);
    }
    if (units.length >= CHUNK) flush();
  }
  flush();
  return parts.join('');
}

export function bytesToBase64(bytes: Uint8Array): string {
  const parts: string[] = [];
  let line = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    line += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63] + ALPHABET[n & 63];
    if (line.length >= CHUNK) {
      parts.push(line);
      line = '';
    }
  }
  const rest = bytes.length - i;
  if (rest === 1) {
    const n = bytes[i] << 16;
    line += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63] + '==';
  } else if (rest === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    line += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63] + '=';
  }
  parts.push(line);
  return parts.join('');
}

export function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let n = 0;
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    // Only the last few bits are still needed; masking keeps it from overflowing.
    buffer = ((buffer << 6) | LOOKUP[clean.charCodeAt(i)]) & 0xffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[n++] = (buffer >> bits) & 0xff;
    }
  }
  return out.subarray(0, n);
}

export const utf8ToBase64 = (text: string): string => bytesToBase64(utf8Encode(text));
export const base64ToUtf8 = (base64: string): string => utf8Decode(base64ToBytes(base64));
