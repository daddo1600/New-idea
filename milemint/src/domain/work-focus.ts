/**
 * "How do you work?" (app/welcome, step 3) as a menu and a focus: with
 * nothing chosen the three ways of working are offered; once one is chosen
 * only it stays, at the top, with its own questions beneath. A tap on it, its
 * "Change" pill or a pull down brings the menu back. What was entered meanwhile
 * (hours, vehicles, the client-privacy tick) is kept for when they come back.
 */
export type WorkStyle = 'hours' | 'shifts' | 'neither';

/** The menu's order. */
export const WORK_STYLES: readonly WorkStyle[] = ['hours', 'shifts', 'neither'];

/** How far the chosen card is pulled down (in points, before the rubber band) to go back to the menu. */
export const PULL_TO_MENU = 60;

/** A quick flick goes back from half as far. */
const FLICK_VELOCITY = 900;

/** How far the card can travel however far the finger goes: the rubber band's give. */
const PULL_LIMIT = 140;

/** The cards on screen: all three for the menu, only the chosen one in focus. */
export function shownStyles(focus: WorkStyle | null): readonly WorkStyle[] {
  return focus ? [focus] : WORK_STYLES;
}

/**
 * Where the card sits for a finger `dy` points down: it follows at first,
 * then resists more and more (iOS's rubber band), and never goes up.
 */
export function rubberBand(dy: number, limit?: number): number {
  'worklet';
  // No default parameter: in a worklet it runs before the closure is unpacked, so on the
  // UI thread `limit = PULL_LIMIT` threw (PULL_LIMIT not yet defined) and closed the app.
  const max = limit ?? PULL_LIMIT;
  if (dy <= 0) return 0;
  return max * (1 - 1 / ((dy * 0.55) / max + 1));
}

/** Let go after pulling `dy` points down at `vy` points a second: back to the menu, or springs back. */
export function pullReturnsToMenu(dy: number, vy: number): boolean {
  'worklet';
  return dy >= PULL_TO_MENU || (dy >= PULL_TO_MENU / 2 && vy >= FLICK_VELOCITY);
}
