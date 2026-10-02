/**
 * The set-up flow's steps (app/welcome), and the cheer for each step forward:
 * small after the country, a little bigger after tracking, big on entering the
 * last question and biggest at the finish, so it builds towards the end.
 */
export const COUNTRY = 1;
export const TRACKING = 2;
export const HOURS = 3;
/** "What are most of your work drives for?", right after how they work. */
export const PURPOSE = 4;
export const DONE = 5;

export type CheerKind = 'thumbs' | 'tracking' | 'almost' | 'done' | 'thanks';

/**
 * The cheer for moving from step `from` to `to`, or null. Going back never
 * cheers, and neither does skipping past the questions: a restored backup
 * goes from the welcome straight to tracking, then to the finish. Shift
 * workers skip the usual purpose, so they go from tracking's to the finish's.
 */
export function setupCheer(from: number, to: number): CheerKind | null {
  if (to <= from) return null;
  if (to === DONE) return 'done';
  if (to === PURPOSE) return 'almost';
  if (from === TRACKING && to === HOURS) return 'tracking';
  if (from === COUNTRY && to === TRACKING) return 'thumbs';
  return null;
}
