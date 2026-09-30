import { describe, expect, it } from '@jest/globals';

import { rankAddresses } from '../address-rank';

const s = (title: string, subtitle: string) => ({ title, subtitle });

describe('rankAddresses', () => {
  it('puts results matching more of the typed words first', () => {
    const ranked = rankAddresses('The forge, london', [
      s('London Road', 'Boxmoor, Hemel Hempstead, England'),
      s('London Road', 'Luton, England'),
      s('The Forge', '3–5 Parkway, London, NW1 7PG'),
      s('The Forge, Tinkers Lane', 'Wigginton, Tring HP23 6JB, England'),
    ]);
    expect(ranked[0]).toEqual(s('The Forge', '3–5 Parkway, London, NW1 7PG'));
    // The rest each match one word, and keep their original order.
    expect(ranked).toHaveLength(4);
  });

  it('matches a half-typed last word as a prefix', () => {
    const ranked = rankAddresses('forge lon', [s('The Forge', 'Tring'), s('The Forge', 'Camden, London')]);
    expect(ranked[0].subtitle).toBe('Camden, London');
  });

  it('drops duplicates and keeps order when nothing tells results apart', () => {
    const list = [s('A Street', 'X'), s('B Street', 'Y'), s('a  street', 'x')];
    expect(rankAddresses('the', list)).toEqual([s('A Street', 'X'), s('B Street', 'Y')]);
  });
});
