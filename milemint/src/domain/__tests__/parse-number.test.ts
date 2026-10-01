import { describe, expect, it } from '@jest/globals';

import { parseNumber } from '../parse-number';

describe('parseNumber', () => {
  it.each([
    ['2400', 2400],
    ['2,400.50', 2400.5],
    ['2.400,50', 2400.5],
    ['2400,50', 2400.5],
    ['2400.50', 2400.5],
    ['48,210', 48210],
    ['48 210', 48210],
    ['1,234,567', 1234567],
    ['1.234.567', 1234567],
    ['37,5', 37.5],
    ['$1,200', 1200],
    ['0', 0],
  ])('reads %s as %d', (text, value) => {
    expect(parseNumber(text)).toBe(value);
  });

  it('is null when empty', () => {
    expect(parseNumber('  ')).toBeNull();
  });

  it.each(['abc', '12a', '-5', '1,2,3', '1.', ',5', '1,234,56.7.8'])('rejects %s', (text) => {
    expect(parseNumber(text)).toBeUndefined();
  });
});
