import { describe, expect, it } from '@jest/globals';

import { milestoneCanShow, thanksCanOpen } from '../home-overlays';

/**
 * Home's two celebrations, played step by step the way home renders them:
 * the milestone's (use-milestones) and the tester's thank-you (tester-thanks).
 * The thank-you's hold is whether the milestone's is on screen.
 */
type Home = { milestoneReady: boolean; milestoneShowing: boolean; testerThanks: boolean; thanksOpen: boolean };

function render(home: Home): Home {
  const milestoneShowing =
    home.milestoneReady && milestoneCanShow({ showing: home.milestoneShowing, testerThanks: home.testerThanks });
  const thanksOpen =
    home.thanksOpen ||
    thanksCanOpen({ testerThanks: home.testerThanks, introDone: true, focused: true, hold: milestoneShowing });
  return { ...home, milestoneShowing, thanksOpen };
}

const closeThanks = (home: Home): Home => ({ ...home, thanksOpen: false, testerThanks: false });
const closeMilestone = (home: Home): Home => ({ ...home, milestoneReady: false, milestoneShowing: false });
const stacked = (home: Home) => home.milestoneShowing && home.thanksOpen;

describe('milestoneCanShow', () => {
  it('waits while a tester’s thank-you is due or up', () => {
    expect(milestoneCanShow({ showing: false, testerThanks: true })).toBe(false);
    expect(milestoneCanShow({ showing: false, testerThanks: false })).toBe(true);
  });

  it('never takes away one already on screen', () => {
    expect(milestoneCanShow({ showing: true, testerThanks: true })).toBe(true);
  });
});

describe('thanksCanOpen', () => {
  it('opens only when due, after the launch animation, in view and with nothing else up', () => {
    const ready = { testerThanks: true, introDone: true, focused: true, hold: false };
    expect(thanksCanOpen(ready)).toBe(true);
    expect(thanksCanOpen({ ...ready, testerThanks: false })).toBe(false);
    expect(thanksCanOpen({ ...ready, introDone: false })).toBe(false);
    expect(thanksCanOpen({ ...ready, focused: false })).toBe(false);
    expect(thanksCanOpen({ ...ready, hold: true })).toBe(false);
  });
});

describe('home never stacks the milestone celebration on the tester’s thank-you', () => {
  it('a milestone reached while the thank-you is up waits for it, then shows', () => {
    let home = render({ milestoneReady: false, milestoneShowing: false, testerThanks: true, thanksOpen: false });
    expect(home.thanksOpen).toBe(true);
    home = render({ ...home, milestoneReady: true });
    expect(home.milestoneShowing).toBe(false);
    expect(stacked(home)).toBe(false);
    home = render(closeThanks(home));
    expect(home.milestoneShowing).toBe(true);
    expect(home.thanksOpen).toBe(false);
  });

  it('both ready at once: the thank-you first, then the milestone (no deadlock)', () => {
    let home = render({ milestoneReady: true, milestoneShowing: false, testerThanks: true, thanksOpen: false });
    expect(home.thanksOpen).toBe(true);
    expect(home.milestoneShowing).toBe(false);
    home = render(closeThanks(home));
    expect(home.milestoneShowing).toBe(true);
  });

  it('a milestone already up stays, and the thank-you waits for it', () => {
    let home = render({ milestoneReady: true, milestoneShowing: false, testerThanks: false, thanksOpen: false });
    expect(home.milestoneShowing).toBe(true);
    home = render({ ...home, testerThanks: true });
    expect(home.milestoneShowing).toBe(true);
    expect(home.thanksOpen).toBe(false);
    home = render(closeMilestone(home));
    expect(home.thanksOpen).toBe(true);
    expect(stacked(home)).toBe(false);
  });
});
