/**
 * The order of home's celebrations, so one never lands on top of another: a
 * founding tester's thank-you (components/tester-thanks) and a milestone's
 * celebration (milestones/use-milestones). Whichever is up first stays until
 * it closes, and the other waits. Each waits on what's on screen, not on what's
 * waiting, so they can never both wait for each other.
 */

/** Whether a milestone celebration that's ready can be on screen. Once up, it stays up. */
export function milestoneCanShow({ showing, testerThanks }: { showing: boolean; testerThanks: boolean }): boolean {
  return showing || !testerThanks;
}

/**
 * Whether the tester's thank-you can open now: it's due, the launch
 * animation is over, home is in view and nothing else is on screen (`hold`).
 */
export function thanksCanOpen({
  testerThanks,
  introDone,
  focused,
  hold,
}: {
  testerThanks: boolean;
  introDone: boolean;
  focused: boolean;
  hold: boolean;
}): boolean {
  return testerThanks && introDone && focused && !hold;
}
