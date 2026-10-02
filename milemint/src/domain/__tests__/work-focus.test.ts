import { describe, expect, it } from '@jest/globals';

import { PULL_TO_MENU, pullReturnsToMenu, rubberBand, shownStyles, WORK_STYLES } from '../work-focus';

describe('shownStyles', () => {
  it('offers all three, in order, with nothing chosen', () => {
    expect(shownStyles(null)).toEqual(['hours', 'shifts', 'neither']);
  });

  it('keeps only the chosen one in focus', () => {
    for (const style of WORK_STYLES) expect(shownStyles(style)).toEqual([style]);
  });
});

describe('rubberBand', () => {
  it('never moves the card up', () => {
    expect(rubberBand(-40)).toBe(0);
    expect(rubberBand(0)).toBe(0);
  });

  it('follows less the further it goes, and stops short of its limit', () => {
    const small = rubberBand(10);
    const large = rubberBand(200);
    expect(small).toBeGreaterThan(0);
    expect(small).toBeLessThan(10);
    expect(large / 200).toBeLessThan(small / 10);
    expect(rubberBand(100000)).toBeLessThan(140);
    expect(rubberBand(100000, 50)).toBeLessThan(50);
  });

  it('still moves enough at the threshold to be felt', () => {
    expect(rubberBand(PULL_TO_MENU)).toBeGreaterThan(20);
  });
});

describe('pullReturnsToMenu', () => {
  it('goes back once pulled past the threshold', () => {
    expect(pullReturnsToMenu(PULL_TO_MENU, 0)).toBe(true);
    expect(pullReturnsToMenu(PULL_TO_MENU - 1, 0)).toBe(false);
  });

  it('goes back on a quick flick from half as far, but not from a nudge', () => {
    expect(pullReturnsToMenu(PULL_TO_MENU / 2, 1200)).toBe(true);
    expect(pullReturnsToMenu(PULL_TO_MENU / 2 - 1, 5000)).toBe(false);
  });

  it('never goes back on a pull upwards', () => {
    expect(pullReturnsToMenu(-100, -3000)).toBe(false);
  });
});
