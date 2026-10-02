import { formatDistance, formatMoney, type Region, type Translator } from '@/domain/regions';

/**
 * What the shift's Live Activity (lock screen and Dynamic Island) shows,
 * worked out here and sent to iOS as ready-to-show text: the widget
 * extension has no access to the app's translations, the user's currency or
 * the encrypted database, so it draws exactly these strings. Field names
 * match ShiftContentRecord in modules/live-activity/ios.
 */
export type ShiftActivityContent = {
  /** "Shift on", "Shift paused" or "Shift ended". */
  title: string;
  /** Business distance of the shift's saved drives, e.g. "38.2 mi". */
  distance: string;
  /** What those drives are worth, e.g. "£20.90". */
  money: string;
  /** "Waiting for your next drive", "Driving · 3.1 mi" or "Paused". */
  status: string;
  /** The shift's time so far, e.g. "2h 14m": shown once it has ended (the live card counts with a timer). */
  elapsed: string;
  endLabel: string;
  notWorkingLabel: string;
  /** A drive is being recorded: "Not working" is offered. */
  driving: boolean;
  paused: boolean;
  /** The shift has ended: the card stops counting and shows `elapsed`. */
  ended: boolean;
  /** When the shift started, ms since 1970 (the timer counts from here). */
  startedAt: number;
};

export type ShiftActivityInput = {
  /** The open (or just ended) shift's start, ms since 1970. */
  startedAt: number;
  /** When it ended (ms), or null while it runs. */
  endedAt: number | null;
  now: number;
  paused: boolean;
  /** The shift's saved drives: their business distance and value. */
  drives: readonly { distanceMeters: number; value: number; business: boolean }[];
  /** A drive being recorded now, if any. */
  liveDrive: { distanceMeters: number } | null;
  region: Region;
};

/** "2h 14m" (minutes padded, as on the home screen's shift bar). */
export function formatElapsed(ms: number, t: Translator): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  return t('{{hours}}h {{minutes}}m', {
    hours: Math.floor(minutes / 60),
    minutes: String(minutes % 60).padStart(2, '0'),
  });
}

/** The card's content for a shift, in the user's language, distance unit and currency. */
export function shiftActivityContent(input: ShiftActivityInput, t: Translator): ShiftActivityContent {
  const { region } = input;
  const business = input.drives.filter((drive) => drive.business);
  const meters = business.reduce((sum, drive) => sum + drive.distanceMeters, 0);
  const value = business.reduce((sum, drive) => sum + drive.value, 0);
  const ended = input.endedAt !== null;
  const end = input.endedAt ?? input.now;
  // A drive in a pause isn't work: it isn't offered as "Not working" either.
  const driving = !ended && !input.paused && input.liveDrive !== null;
  const status = ended
    ? t('{{distance}} · {{value}} · {{count}} drives', {
        distance: formatDistance(meters, region),
        value: formatMoney(value, region),
        count: business.length,
      })
    : input.paused
      ? t('Paused')
      : driving
        ? t('Driving · {{distance}}', { distance: formatDistance(input.liveDrive!.distanceMeters, region) })
        : t('Waiting for your next drive');
  return {
    title: ended ? t('Shift ended') : input.paused ? t('Shift paused') : t('Shift on'),
    distance: formatDistance(meters, region),
    money: formatMoney(value, region),
    status,
    elapsed: formatElapsed(end - input.startedAt, t),
    endLabel: t('End shift'),
    notWorkingLabel: t('Not working'),
    driving,
    paused: !ended && input.paused,
    ended,
    startedAt: input.startedAt,
  };
}

/** While driving, the distance moves every second: the card is refreshed with it at most this often. */
export const PROGRESS_EVERY_MS = 45_000;

/**
 * Whether to send `next` to iOS, given what it shows now (`shown`, sent at
 * `shownAt`). Anything the driver would notice (a drive starting or saved,
 * money, a pause, the end) goes at once; the live drive's distance creeping
 * up waits for PROGRESS_EVERY_MS. iOS rations Live Activity updates, so
 * nothing is sent when nothing changed.
 */
export function shouldPush(
  shown: ShiftActivityContent | null,
  shownAt: number,
  next: ShiftActivityContent,
  now: number,
): boolean {
  if (!shown) return true;
  const keys = Object.keys(next) as (keyof ShiftActivityContent)[];
  const changed = keys.filter((key) => shown[key] !== next[key]);
  if (changed.length === 0) return false;
  // Only the live drive's distance moved (it's in the status line).
  const progressOnly = changed.every((key) => key === 'status') && shown.driving && next.driving;
  return !progressOnly || now - shownAt >= PROGRESS_EVERY_MS;
}
