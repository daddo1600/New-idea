import type { LatLng } from './geo';
import { matchPlace, type Place, type PlaceKind } from './places';

/**
 * Automatic business/personal suggestions for a newly detected drive, so the
 * user rarely has to classify by hand. Rules, highest priority first:
 *
 * 1. Learned route: the user classified this same start → end the same way
 *    before (at least twice, never the other way in the recent past).
 * 2. Commute: home ↔ work is personal under IRS rules, whatever the clock says.
 * 3. Work hours: a drive starting inside a shift is business, outside is personal.
 *
 * Pure and deterministic: the caller supplies the drive's local weekday and
 * time so tests don't depend on the machine's time zone.
 */

export type AutoReason = 'learned-route' | 'work-hours' | 'commute';

export type ClassificationSuggestion = {
  classification: 'business' | 'personal' | null;
  purpose: string | null;
  reason: AutoReason | null;
  /**
   * A home ↔ work drive is being marked business. The IRS treats commuting as
   * personal, so the UI should warn rather than silently count it.
   */
  commuteWarning: boolean;
};

/** One end of a drive: the matched place if any, and the raw GPS point if known. */
export type Endpoint = { placeId: string | null; point: LatLng | null };

/** A trip the user classified themselves; the evidence routes are learned from. */
export type ClassifiedTrip = {
  start: Endpoint;
  end: Endpoint;
  classification: 'business' | 'personal';
  purpose: string;
  /** ISO timestamp; only used to find the most recent occurrences. */
  startedAt: string;
};

/** "HH:MM" 24-hour clock. A shift whose end is before its start runs past midnight. */
export type WorkShift = { start: string; end: string };

/** Shifts per weekday, index 0 = Sunday (as `Date.getDay()`). */
export type WorkWeek = readonly (readonly WorkShift[])[];

export type DriveToClassify = {
  start: Endpoint;
  end: Endpoint;
  /** Local weekday the drive started, 0 = Sunday. */
  weekday: number;
  /** Local minutes since midnight when the drive started. */
  minutesOfDay: number;
};

export type ClassifyContext = {
  history: readonly ClassifiedTrip[];
  places: readonly Place[];
  /** null when the user hasn't switched work hours on. */
  workHours: WorkWeek | null;
};

/** How many of the most recent drives on a route are looked at. */
export const LEARNING_WINDOW = 5;
/** Same answer this many times (with no disagreement in the window) before it's learned. */
export const LEARNING_MIN_AGREEING = 2;
/** Grid size for drives that don't start or end at a named place. */
export const ROUTE_CELL_M = 150;

const METERS_PER_DEGREE_LAT = 111_320;

const NO_SUGGESTION: ClassificationSuggestion = {
  classification: null,
  purpose: null,
  reason: null,
  commuteWarning: false,
};

export function suggestClassification(
  drive: DriveToClassify,
  context: ClassifyContext,
): ClassificationSuggestion {
  const commute = isCommute(
    placeKind(drive.start, context.places),
    placeKind(drive.end, context.places),
  );

  const learned = learnedRoute(drive, context);
  if (learned) {
    return {
      classification: learned.classification,
      purpose: learned.purpose,
      reason: 'learned-route',
      // The user taught us this commute is business (e.g. carrying tools to a
      // job site first). Honour it, but flag it: auditors look for exactly this.
      commuteWarning: commute && learned.classification === 'business',
    };
  }

  if (commute) {
    return { classification: 'personal', purpose: null, reason: 'commute', commuteWarning: false };
  }

  if (context.workHours) {
    const working = isWithinWorkHours(context.workHours, drive.weekday, drive.minutesOfDay);
    return {
      classification: working ? 'business' : 'personal',
      // A business trip still needs a purpose for the IRS; the UI asks for it.
      purpose: null,
      reason: 'work-hours',
      commuteWarning: false,
    };
  }

  return NO_SUGGESTION;
}

/** Home ↔ regular workplace, in either direction. */
export function isCommute(start: PlaceKind | null, end: PlaceKind | null): boolean {
  return (start === 'home' && end === 'work') || (start === 'work' && end === 'home');
}

function placeKind(endpoint: Endpoint, places: readonly Place[]): PlaceKind | null {
  return resolvePlace(endpoint, places)?.kind ?? null;
}

function resolvePlace(endpoint: Endpoint, places: readonly Place[]): Place | null {
  if (endpoint.placeId) {
    const stored = places.find((p) => p.id === endpoint.placeId);
    if (stored) return stored;
  }
  // Older trips were recorded before the place was saved, so match by position too.
  return endpoint.point ? matchPlace(endpoint.point, places) : null;
}

/**
 * Stable identity for one end of a route: the named place if there is one,
 * otherwise a ~150 m grid cell. Grid cells have edges, so a spot right on a
 * boundary may split into two keys; naming the place fixes that.
 */
export function endpointKey(endpoint: Endpoint, places: readonly Place[]): string | null {
  const place = resolvePlace(endpoint, places);
  if (place) return `place:${place.id}`;
  if (!endpoint.point) return null;
  const { latitude, longitude } = endpoint.point;
  const latStep = ROUTE_CELL_M / METERS_PER_DEGREE_LAT;
  // Longitude degrees shrink towards the poles; keep cells roughly square.
  const lngStep = latStep / Math.max(0.01, Math.cos((latitude * Math.PI) / 180));
  return `grid:${Math.floor(latitude / latStep)}:${Math.floor(longitude / lngStep)}`;
}

/**
 * Direction-specific on purpose: home → client may be business while the
 * drive back is on the way to something personal.
 */
function learnedRoute(
  drive: DriveToClassify,
  { history, places }: ClassifyContext,
): { classification: 'business' | 'personal'; purpose: string | null } | null {
  const startKey = endpointKey(drive.start, places);
  const endKey = endpointKey(drive.end, places);
  if (!startKey || !endKey) return null;

  const recent = history
    .filter(
      (trip) =>
        endpointKey(trip.start, places) === startKey && endpointKey(trip.end, places) === endKey,
    )
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0))
    .slice(0, LEARNING_WINDOW);
  if (recent.length < LEARNING_MIN_AGREEING) return null;

  const classification = recent[0].classification;
  // Any disagreement in the window means the route is genuinely mixed: ask.
  if (recent.some((trip) => trip.classification !== classification)) return null;

  const purpose = recent.find((trip) => trip.purpose.trim())?.purpose.trim() ?? null;
  return { classification, purpose };
}

/** Parses "HH:MM" (24-hour) to minutes since midnight; null if invalid. */
export function parseClock(input: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Whether a local weekday/time falls inside a shift. An overnight shift
 * (22:00–02:00 on Monday) covers Monday from 22:00 and Tuesday until 02:00,
 * so the previous day's shifts are checked too. Zero-length or malformed
 * shifts never match.
 */
export function isWithinWorkHours(week: WorkWeek, weekday: number, minutesOfDay: number): boolean {
  const today = week[weekday] ?? [];
  const yesterday = week[(weekday + 6) % 7] ?? [];

  for (const shift of today) {
    const range = shiftRange(shift);
    if (!range) continue;
    const [start, end] = range;
    if (start < end ? minutesOfDay >= start && minutesOfDay < end : minutesOfDay >= start) {
      return true;
    }
  }
  for (const shift of yesterday) {
    const range = shiftRange(shift);
    if (!range) continue;
    const [start, end] = range;
    if (end < start && minutesOfDay < end) return true;
  }
  return false;
}

function shiftRange(shift: WorkShift): [number, number] | null {
  const start = parseClock(shift.start);
  const end = parseClock(shift.end);
  if (start === null || end === null || start === end) return null;
  return [start, end];
}

/** Whether a shift parses and has a length (start ≠ end); for validating the settings form. */
export function isValidShift(shift: WorkShift): boolean {
  return shiftRange(shift) !== null;
}
