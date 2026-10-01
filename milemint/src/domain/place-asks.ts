import { isWithinWorkHours, type WorkWeek } from './classify-rules';
import { distanceMeters, type LatLng } from './geo';
import { DEFAULT_PLACE_RADIUS_M, matchPlace, type Place } from './places';

/**
 * Home and work, asked on the home screen once the drives show where they are,
 * instead of typed in during set-up: "Is this home?" for the spot the car
 * spends the night, "Is this work?" for the spot it's parked during work hours.
 * Pure: the trips, their route ends and the clock come in, a question goes out.
 */

/** Minutes east of UTC at an instant (London: 60 in summer, 0 in winter). */
export type Zone = (epochMs: number) => number;

/** The phone's own time zone, daylight saving included. */
export const localZone: Zone = (epochMs) => -new Date(epochMs).getTimezoneOffset();

/** A drive as these questions need it: when, where it ended (its route's last point), and the name shown for it. */
export type ParkedDrive = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  endLabel: string;
  /** The end is already linked to a named place. */
  endPlaceId: string | null;
  /** First and last points of the recorded route; null without a route (manual trips, client privacy). */
  start: LatLng | null;
  end: LatLng | null;
};

export type SpotAsk = {
  kind: 'home' | 'work';
  at: LatLng;
  /** The name the drive there was given (a street, a shop), for "Is this home? {{place}}". */
  label: string;
  /** Recent drives ending at the spot, and starting from it: linked to the place when the user says yes. */
  endingIds: string[];
  startingIds: string[];
};

/** A spot answered "No" isn't asked about again within this distance. */
export const ASKED_SPOT_RADIUS_M = 200;
/** How many "No" spots are remembered per question (the oldest go first). */
export const MAX_DISMISSED_SPOTS = 10;
/** A drive that starts this far from where the last one ended means the phone moved untracked: not parked there. */
const MOVED_M = 1000;

/** Evenings from 17:00 to 03:00 count as the end of the day. */
const EVENING_FROM = 17 * 60;
const NIGHT_UNTIL = 3 * 60;
/** "The next morning" starts at 05:00. */
const MORNING = 5 * 60;
/** Parked this long during work hours, on a weekday, counts as a day at work. */
const WORK_STAY_MIN = 3 * 60;
/** On at least this many different days. */
const WORK_DAYS = 2;
/** How far back the questions look. */
export const HOME_LOOKBACK_DAYS = 14;
export const WORK_LOOKBACK_DAYS = 28;
const DAY = 86_400_000;
/** Work-hours time is counted in slices this long. */
const SLICE_MIN = 15;

type Wall = { y: number; m: number; d: number; weekday: number; minutes: number };

/** The local calendar date, weekday and time of day at an instant. */
function wall(epochMs: number, zone: Zone): Wall {
  const at = new Date(epochMs + zone(epochMs) * 60_000);
  return {
    y: at.getUTCFullYear(),
    m: at.getUTCMonth(),
    d: at.getUTCDate(),
    weekday: at.getUTCDay(),
    minutes: at.getUTCHours() * 60 + at.getUTCMinutes(),
  };
}

/** The instant of a local date and time (the day may overflow: 32 March is 1 April). */
function instant(y: number, m: number, d: number, minutes: number, zone: Zone): number {
  const asUtc = Date.UTC(y, m, d) + minutes * 60_000;
  // Twice, so a clock change between the guess and the answer is allowed for.
  const first = asUtc - zone(asUtc) * 60_000;
  return asUtc - zone(first) * 60_000;
}

function dateKey(w: Wall): string {
  return `${w.y}-${String(w.m + 1).padStart(2, '0')}-${String(w.d).padStart(2, '0')}`;
}

/** Near a named place, or a spot already answered "No". */
function alreadyKnown(at: LatLng, places: readonly Place[], dismissed: readonly LatLng[]): boolean {
  return (
    matchPlace(at, places) !== null || dismissed.some((spot) => distanceMeters(spot, at) <= ASKED_SPOT_RADIUS_M)
  );
}

function byStart(drives: readonly ParkedDrive[]): ParkedDrive[] {
  return [...drives].sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
}

function askAt(kind: SpotAsk['kind'], at: LatLng, label: string, drives: readonly ParkedDrive[]): SpotAsk {
  const near = (point: LatLng | null) => point !== null && distanceMeters(point, at) <= DEFAULT_PLACE_RADIUS_M;
  return {
    kind,
    at,
    label,
    endingIds: drives.filter((drive) => drive.endPlaceId === null && near(drive.end)).map((drive) => drive.id),
    startingIds: drives.filter((drive) => near(drive.start)).map((drive) => drive.id),
  };
}

/**
 * Where the phone spent the night: the latest drive that ended between 17:00
 * and 03:00 local time and was followed by nothing until 05:00 the next
 * morning (the next drive starts then or later, from the same spot, or there
 * is none yet and it's past 05:00 now). Not asked when a Home is saved, for a
 * drive without a route, at a named place, or within 200 m of a spot already
 * answered "No".
 */
export function overnightHomeAsk(
  drives: readonly ParkedDrive[],
  input: { places: readonly Place[]; dismissed: readonly LatLng[]; now: number; zone?: Zone },
): SpotAsk | null {
  if (input.places.some((place) => place.kind === 'home')) return null;
  const zone = input.zone ?? localZone;
  const sorted = byStart(drives);
  const since = input.now - HOME_LOOKBACK_DAYS * DAY;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const drive = sorted[i];
    if (!drive.endedAt || !drive.end || drive.endPlaceId !== null) continue;
    const ended = Date.parse(drive.endedAt);
    if (ended < since) break;
    const at = wall(ended, zone);
    if (at.minutes < EVENING_FROM && at.minutes >= NIGHT_UNTIL) continue;
    // The evening it belongs to: after midnight, that's the day before.
    const eveningDay = at.minutes >= EVENING_FROM ? at.d : at.d - 1;
    const morning = instant(at.y, at.m, eveningDay + 1, MORNING, zone);
    const next = sorted[i + 1];
    if (next) {
      if (Date.parse(next.startedAt) < morning) continue;
      if (next.start && distanceMeters(next.start, drive.end) > MOVED_M) continue;
    } else if (input.now < morning) {
      continue;
    }
    if (alreadyKnown(drive.end, input.places, input.dismissed)) continue;
    return askAt('home', drive.end, drive.endLabel, sorted.filter((d) => d.endedAt && Date.parse(d.endedAt) >= since));
  }
  return null;
}

/** Minutes of work hours, on Monday to Friday, in [from, to), by local date. */
function workMinutesByDate(from: number, to: number, week: WorkWeek, zone: Zone): Map<string, number> {
  const minutes = new Map<string, number>();
  // Long stays (a week away) are counted only for their first three days.
  const until = Math.min(to, from + 3 * DAY);
  for (let at = from; at + SLICE_MIN * 60_000 <= until; at += SLICE_MIN * 60_000) {
    const w = wall(at, zone);
    if (w.weekday === 0 || w.weekday === 6) continue;
    if (!isWithinWorkHours(week, w.weekday, w.minutes)) continue;
    const key = dateKey(w);
    minutes.set(key, (minutes.get(key) ?? 0) + SLICE_MIN);
  }
  return minutes;
}

/**
 * Where the user works: a spot where the car was parked for 3 hours or more
 * within their work hours on a weekday, on at least two different days (each
 * stay counts for one day, so a car left in one place all week doesn't). The
 * spot seen on the most days wins (the latest, on a tie). Not asked when a
 * Work place is saved, at a named place (a client's, home), or within 200 m of
 * a spot already answered "No".
 */
export function workSpotAsk(
  drives: readonly ParkedDrive[],
  input: { places: readonly Place[]; dismissed: readonly LatLng[]; now: number; workWeek: WorkWeek; zone?: Zone },
): SpotAsk | null {
  if (input.places.some((place) => place.kind === 'work')) return null;
  const zone = input.zone ?? localZone;
  const since = input.now - WORK_LOOKBACK_DAYS * DAY;
  const sorted = byStart(drives).filter((drive) => drive.endedAt && Date.parse(drive.endedAt) >= since);
  /** Spots in the order last parked at (latest first), with the days spent there. */
  const spots: { at: LatLng; label: string; days: Set<string> }[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const drive = sorted[i];
    if (!drive.end || drive.endPlaceId !== null) continue;
    const next = sorted[i + 1];
    if (next?.start && distanceMeters(next.start, drive.end) > MOVED_M) continue;
    const parked = Date.parse(drive.endedAt!);
    const left = next ? Date.parse(next.startedAt) : input.now;
    // One day per stay: a car left at home all week isn't a commute to it.
    const day = [...workMinutesByDate(parked, left, input.workWeek, zone)].find(
      ([, minutes]) => minutes >= WORK_STAY_MIN,
    )?.[0];
    if (!day || alreadyKnown(drive.end, input.places, input.dismissed)) continue;
    const spot = spots.find((other) => distanceMeters(other.at, drive.end!) <= ASKED_SPOT_RADIUS_M);
    if (spot) spot.days.add(day);
    else spots.push({ at: drive.end, label: drive.endLabel, days: new Set([day]) });
  }
  let best: (typeof spots)[number] | null = null;
  for (const spot of spots) {
    if (spot.days.size >= WORK_DAYS && (!best || spot.days.size > best.days.size)) best = spot;
  }
  return best && askAt('work', best.at, best.label, sorted);
}

/** Adds a spot answered "No", keeping the latest ten. */
export function rememberDismissed(spots: readonly LatLng[], at: LatLng): LatLng[] {
  return [...spots, { latitude: at.latitude, longitude: at.longitude }].slice(-MAX_DISMISSED_SPOTS);
}
