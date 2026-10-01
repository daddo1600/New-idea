/**
 * Text ↔ base64 (as UTF-8), for builds whose native backup module only takes
 * bytes as base64 (newer builds take the text itself: see backup.ts).
 *
 * Hermes has no JIT, so this works on typed arrays, a whole 12-bit lookup
 * table at a time, and turns codes into strings a large chunk per call. The
 * async versions also give the JavaScript thread back between chunks, so a
 * big backup never freezes the app. TextEncoder is used where the engine has
 * it (Hermes does, natively); decoding is done here, because Hermes's
 * TextDecoder is a JavaScript fallback no faster than this.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const CODES = Uint8Array.from(ALPHABET, (char) => char.charCodeAt(0));
const LOOKUP = new Int16Array(128).fill(-1);
for (let i = 0; i < ALPHABET.length; i++) LOOKUP[ALPHABET.charCodeAt(i)] = i;

/** Two base64 characters (as two char codes, little end first) for every 12 bits. */
const PAIRS = new Uint16Array(4096);
for (let i = 0; i < 4096; i++) PAIRS[i] = CODES[i >> 6] | (CODES[i & 63] << 8);

const EQUALS = 61;

/** Codes per String.fromCharCode call: well under engines' argument limits. */
const CHUNK = 8192;

/** Bytes per slice in the async versions (a multiple of 3 and 4). */
const SLICE = 3 * 4 * 32_768;

/** How long the async versions may hold the JavaScript thread before yielding (ms). */
const BUDGET_MS = 8;

const yieldToApp = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Char codes (all below 0x10000) to a string, a chunk at a time. */
function codesToString(codes: Uint8Array | Uint16Array): string {
  const parts: string[] = [];
  for (let i = 0; i < codes.length; i += CHUNK) {
    parts.push(String.fromCharCode.apply(null, codes.subarray(i, i + CHUNK) as unknown as number[]));
  }
  return parts.join('');
}

const encoder: { encode(text: string): Uint8Array } | null =
  typeof TextEncoder === 'function' ? new TextEncoder() : null;

export function utf8Encode(text: string): Uint8Array {
  if (encoder) return encoder.encode(text);
  const out = new Uint8Array(text.length * 3);
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code < 0x80) {
      out[n++] = code;
      continue;
    }
    if (code >= 0xd800 && code < 0xdc00 && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low < 0xe000) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    // A lone surrogate can't be written as UTF-8: the replacement character, as TextEncoder does.
    if (code >= 0xd800 && code < 0xe000) code = 0xfffd;
    if (code < 0x800) {
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

/**
 * Decodes UTF-8 from `start` up to (not past) `end`; returns the text and
 * where it stopped (a character cut off by `end` is left for the next call).
 */
function decodeRange(bytes: Uint8Array, start: number, end: number): { text: string; next: number } {
  // Never more UTF-16 units than bytes: a four-byte character is two units.
  const units = new Uint16Array(end - start);
  let n = 0;
  let i = start;
  while (i < end) {
    const b = bytes[i];
    if (b < 0x80) {
      units[n++] = b;
      i++;
      continue;
    }
    let code: number;
    let extra: number;
    if (b >= 0xc0 && b < 0xe0) [code, extra] = [b & 0x1f, 1];
    else if (b >= 0xe0 && b < 0xf0) [code, extra] = [b & 0x0f, 2];
    else if (b >= 0xf0 && b < 0xf8) [code, extra] = [b & 0x07, 3];
    else [code, extra] = [0xfffd, 0];
    // Cut off by the end of this range (but not of the input): finish it in the next one.
    if (extra > 0 && i + extra >= end && end < bytes.length) break;
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
      units[n++] = 0xd800 + (code >> 10);
      units[n++] = 0xdc00 + (code & 0x3ff);
    } else {
      units[n++] = code;
    }
  }
  return { text: codesToString(units.subarray(0, n)), next: i };
}

export function utf8Decode(bytes: Uint8Array): string {
  return decodeRange(bytes, 0, bytes.length).text;
}

/** Base64 of bytes[start, end): `end - start` is a multiple of 3 except for the last range. */
function encodeRange(bytes: Uint8Array, start: number, end: number): string {
  const triples = Math.floor((end - start) / 3);
  const whole = start + triples * 3;
  const out = new Uint16Array(triples * 2);
  let n = 0;
  for (let i = start; i < whole; i += 3) {
    const triple = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out[n++] = PAIRS[triple >> 12];
    out[n++] = PAIRS[triple & 0xfff];
  }
  const chars = new Uint8Array(out.buffer, 0, n * 2);
  let tail = '';
  const rest = end - whole;
  if (rest === 1) {
    const triple = bytes[whole] << 16;
    tail = String.fromCharCode(CODES[triple >> 18], CODES[(triple >> 12) & 63], EQUALS, EQUALS);
  } else if (rest === 2) {
    const triple = (bytes[whole] << 16) | (bytes[whole + 1] << 8);
    tail = String.fromCharCode(CODES[triple >> 18], CODES[(triple >> 12) & 63], CODES[(triple >> 6) & 63], EQUALS);
  }
  return codesToString(LITTLE_ENDIAN ? chars : swapPairs(chars)) + tail;
}

/** PAIRS packs two codes in one 16-bit slot; read as bytes that's the right order on little-endian CPUs (every iPhone). */
const LITTLE_ENDIAN = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

function swapPairs(chars: Uint8Array): Uint8Array {
  const swapped = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i += 2) {
    swapped[i] = chars[i + 1];
    swapped[i + 1] = chars[i];
  }
  return swapped;
}

export function bytesToBase64(bytes: Uint8Array): string {
  return encodeRange(bytes, 0, bytes.length);
}

type Base64State = { buffer: number; bits: number; length: number };

/** Base64 characters to bytes into `out`; anything else (line breaks, padding) is skipped. */
function decodeBase64Range(base64: string, start: number, end: number, out: Uint8Array, state: Base64State) {
  let { buffer, bits, length: n } = state;
  for (let i = start; i < end; i++) {
    const code = base64.charCodeAt(i);
    const value = code < 128 ? LOOKUP[code] : -1;
    if (value < 0) continue;
    // Only the last few bits are still needed; masking keeps it from overflowing.
    buffer = ((buffer << 6) | value) & 0xffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[n++] = (buffer >> bits) & 0xff;
    }
  }
  state.buffer = buffer;
  state.bits = bits;
  state.length = n;
}

export function base64ToBytes(base64: string): Uint8Array {
  const out = new Uint8Array(Math.floor((base64.length * 3) / 4));
  const state: Base64State = { buffer: 0, bits: 0, length: 0 };
  decodeBase64Range(base64, 0, base64.length, out, state);
  return out.subarray(0, state.length);
}

export const utf8ToBase64 = (text: string): string => bytesToBase64(utf8Encode(text));
export const base64ToUtf8 = (base64: string): string => utf8Decode(base64ToBytes(base64));

/** Runs `step` over [0, total) a slice at a time, yielding to the app whenever it has run for a while. */
async function sliced(total: number, size: number, step: (start: number, end: number) => void): Promise<void> {
  let since = Date.now();
  for (let start = 0; start < total; start += size) {
    step(start, Math.min(start + size, total));
    if (Date.now() - since >= BUDGET_MS) {
      await yieldToApp();
      since = Date.now();
    }
  }
}

/** utf8ToBase64 a slice at a time, giving the JavaScript thread back in between. */
export async function utf8ToBase64Async(text: string): Promise<string> {
  // UTF-8, a slice of text at a time (never splitting a surrogate pair).
  const pieces: Uint8Array[] = [];
  let length = 0;
  let start = 0;
  await sliced(text.length, SLICE, () => {
    if (start >= text.length) return;
    let end = Math.min(start + SLICE, text.length);
    const last = text.charCodeAt(end - 1);
    if (end < text.length && last >= 0xd800 && last < 0xdc00) end++;
    const piece = utf8Encode(text.slice(start, end));
    pieces.push(piece);
    length += piece.length;
    start = end;
  });
  const bytes = pieces.length === 1 ? pieces[0] : new Uint8Array(length);
  if (pieces.length > 1) {
    let at = 0;
    for (const piece of pieces) {
      bytes.set(piece, at);
      at += piece.length;
    }
  }
  const parts: string[] = [];
  await sliced(bytes.length, SLICE, (from, to) => parts.push(encodeRange(bytes, from, to)));
  return parts.join('');
}

/** base64ToUtf8 a slice at a time, giving the JavaScript thread back in between. */
export async function base64ToUtf8Async(base64: string): Promise<string> {
  const bytes = new Uint8Array(Math.floor((base64.length * 3) / 4));
  const state: Base64State = { buffer: 0, bits: 0, length: 0 };
  await sliced(base64.length, SLICE, (from, to) => decodeBase64Range(base64, from, to, bytes, state));
  const { length } = state;
  const parts: string[] = [];
  let at = 0;
  await sliced(length, SLICE, () => {
    if (at >= length) return;
    const { text, next } = decodeRange(bytes, at, Math.min(at + SLICE, length));
    parts.push(text);
    at = next;
  });
  // A slice can stop a little short (a character cut off): finish whatever is left.
  while (at < length) {
    const { text, next } = decodeRange(bytes, at, Math.min(at + SLICE, length));
    parts.push(text);
    at = next;
  }
  return parts.join('');
}
