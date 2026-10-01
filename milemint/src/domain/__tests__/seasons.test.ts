import { describe, expect, it } from '@jest/globals';

import { seasonFor } from '../seasons';

const on = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 9);
};
const id = (iso: string, code: 'US' | 'GB' | 'CA' | 'AU' = 'GB') => seasonFor(on(iso), code)?.id ?? null;

describe('seasonFor', () => {
  it('celebrates the same dates everywhere', () => {
    expect(id('2026-12-01')).toBe('festive');
    expect(id('2026-12-26', 'AU')).toBe('festive');
    expect(id('2026-12-31', 'US')).toBe('new-year');
    expect(id('2027-01-02', 'AU')).toBe('new-year');
    expect(id('2026-10-24', 'CA')).toBe('halloween');
    expect(id('2026-10-31')).toBe('halloween');
  });

  it('follows the northern seasons in the UK, US and Canada', () => {
    expect(id('2026-12-28')).toBe('winter');
    expect(id('2027-02-14', 'US')).toBe('winter');
    expect(id('2027-04-10', 'CA')).toBe('spring');
    expect(id('2027-07-04', 'US')).toBe('summer');
    expect(id('2026-10-01')).toBe('autumn');
    expect(id('2026-11-20', 'CA')).toBe('autumn');
  });

  it('flips them in Australia, with an Aussie summer', () => {
    expect(id('2027-01-20', 'AU')).toBe('aussie-summer');
    expect(id('2026-12-28', 'AU')).toBe('aussie-summer');
    expect(id('2027-04-10', 'AU')).toBe('autumn');
    expect(id('2027-07-04', 'AU')).toBe('winter');
    expect(id('2026-10-01', 'AU')).toBe('spring');
  });

  it('says fall in North America', () => {
    expect(seasonFor(on('2026-10-01'), 'US')?.greeting).toContain('Fall');
    expect(seasonFor(on('2026-10-01'), 'GB')?.greeting).toContain('Autumn');
  });
});
