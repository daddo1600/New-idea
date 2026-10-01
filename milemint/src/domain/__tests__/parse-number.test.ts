import { describe, expect, it } from '@jest/globals';

import { parseNumber, parseOdometer } from '../parse-number';

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
    ['0,001', 0.001],
    ['0.001', 0.001],
    ['1,500.25', 1500.25],
    ['1.500', 1.5],
  ])('reads %s as %d', (text, value) => {
    expect(parseNumber(text)).toBe(value);
  });

  it('is null when empty', () => {
    expect(parseNumber('  ')).toBeNull();
  });

  it.each(['abc', '12a', '-5', '1,2,3', '1.', ',5', '1,234,56.7.8', '1..2', '1,,2', '1.,2', '1.2.3,4', '1,2,3.4', '1,000,0', '1.2.3', '1,500.25.3'])(
    'rejects %s',
    (text) => {
      expect(parseNumber(text)).toBeUndefined();
    },
  );

  it('rejects numbers too big to be one', () => {
    expect(parseNumber('9'.repeat(400))).toBeUndefined();
  });
});

describe('parseOdometer', () => {
  it.each([
    ['48.210', 48210],
    ['148.210', 148210],
    ['1.048.210', 1048210],
    ['48,210', 48210],
    ['48 210', 48210],
    ['48210', 48210],
    ['48210.5', 48210.5],
    ['48210,5', 48210.5],
  ])('reads %s as %d', (text, value) => {
    expect(parseOdometer(text)).toBe(value);
  });

  it('is null when empty', () => {
    expect(parseOdometer('')).toBeNull();
  });
});
