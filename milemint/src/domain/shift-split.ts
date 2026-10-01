import { msg } from '../i18n/i18n';
import { distanceMeters, type LatLng } from './geo';
import type { DetectedTrip } from './trip-detector';

/**
 * Shifts, cut to the minute. A courier's last delivery often runs straight
 * into the drive home (or an errand) with no 5-minute stop between them, so
 * the detector logs one trip. Classifying that trip by when it *started*
 * made the drive home "Deliveries". Instead a drive is cut where the shift
 * ended (and where a pause began or ended), and each part is sorted on its own.
 *
 * Pure, so it's unit-tested; the database side is in db/shifts-repo.ts.
 */

/**
 * Stored as the place name where a drive was cut when the phone couldn't (or
 * shouldn't) look the spot up; shown translated (domain/privacy shownLabel).
 */
export const SHIFT_END_LABEL = msg('Where your shift ended');
/** Where a drive was cut because the shift's start was moved into it. */
export const SHIFT_START_LABEL = msg('Where your shift started');

/** A break in a shift (a personal errand): drives in it aren't work. */
export type ShiftPause = { id: string; shiftId: string; startedAt: string; endedAt: string | null };

export type RouteSplit = {
  /** Where the drive was at the cut; null without a route (client privacy, manual). */
  cut: LatLng | null;
  /** Each part's route, distance and route-point times (estimated when `times` wasn't given). */
  before: { route: LatLng[]; meters: number; times: number[] };
  after: { route: LatLng[]; meters: number; times: number[] };
};

/**
 * Splits a drive's route and distance at time `at`.
 *
 * `times` are the route points' timestamps (epoch ms) when the detector kept
 * them. Without them (routes saved by older versions, or read back from the
 * database, which keeps only coordinates) the car is taken to have moved at
 * a steady pace: the cut is the same share of the way along as of the time.
 *
 * The two distances always add up to `distanceMeters` exactly: the route is
 * only used to say how the logged distance divides.
 */
export function splitRoute(
  route: readonly LatLng[],
  times: readonly number[] | null | undefined,
  startedAt: number,
  endedAt: number,
  distance: number,
  at: number,
): RouteSplit {
  const total = Math.max(0, Math.round(distance));
  const span = endedAt - startedAt;
  const timeShare = span > 0 ? Math.min(1, Math.max(0, (at - startedAt) / span)) : 0.5;
  if (route.length < 2) {
    const meters = Math.round(total * timeShare);
    const only = route[0] ? [point(route[0])] : [];
    const times = route[0] ? [startedAt] : [];
    return {
      cut: null,
      before: { route: only, meters, times },
      after: { route: only, meters: total - meters, times },
    };
  }
  const lengths = [0];
  for (let i = 1; i < route.length; i++) lengths.push(lengths[i - 1] + distanceMeters(route[i - 1], route[i]));
  const length = lengths[lengths.length - 1];
  const stamps =
    times && times.length === route.length && times.every(Number.isFinite)
      ? times
      : // Steady pace: each point's time from how far along the route it is.
        lengths.map((l, index) => startedAt + (length > 0 ? l / length : index / (route.length - 1)) * span);

  // The last point at or before the cut, and the one after it.
  let i = 0;
  while (i < route.length - 1 && stamps[i + 1] <= at) i++;
  let cut: LatLng;
  let along: number;
  const cutAt = Math.min(Math.max(at, stamps[0]), stamps[stamps.length - 1]);
  if (i >= route.length - 1) {
    cut = point(route[route.length - 1]);
    along = length;
  } else {
    const t0 = stamps[i];
    const t1 = stamps[i + 1];
    const f = t1 > t0 ? Math.min(1, Math.max(0, (at - t0) / (t1 - t0))) : 0;
    cut = {
      latitude: route[i].latitude + (route[i + 1].latitude - route[i].latitude) * f,
      longitude: route[i].longitude + (route[i + 1].longitude - route[i].longitude) * f,
    };
    along = lengths[i] + (lengths[i + 1] - lengths[i]) * f;
  }
  const share = length > 0 ? along / length : timeShare;
  const meters = Math.min(total, Math.max(0, Math.round(total * share)));
  return {
    cut,
    before: { route: [...route.slice(0, i + 1).map(point), cut], meters, times: [...stamps.slice(0, i + 1), cutAt] },
    after: { route: [cut, ...route.slice(i + 1).map(point)], meters: total - meters, times: [cutAt, ...stamps.slice(i + 1)] },
  };
}

const point = (p: LatLng): LatLng => ({ latitude: p.latitude, longitude: p.longitude });

/** A stretch of time: [start, end) in epoch ms. */
export type Span = { start: number; end: number };

/**
 * When a shift was working: from its start to its end (or `openEnd` while
 * it's running), less its pauses.
 */
export function workSpans(
  shift: { startedAt: string; endedAt: string | null },
  pauses: readonly Pick<ShiftPause, 'startedAt' | 'endedAt'>[],
  openEnd: number,
): Span[] {
  const start = Date.parse(shift.startedAt);
  const end = shift.endedAt ? Date.parse(shift.endedAt) : openEnd;
  const breaks = pauses
    .map((p) => ({ start: Date.parse(p.startedAt), end: p.endedAt ? Date.parse(p.endedAt) : end }))
    .filter((p) => p.end > p.start)
    .sort((a, b) => a.start - b.start);
  const spans: Span[] = [];
  let from = start;
  for (const pause of breaks) {
    if (pause.start > from) spans.push({ start: from, end: Math.min(pause.start, end) });
    from = Math.max(from, pause.end);
  }
  if (end > from) spans.push({ start: from, end });
  return spans.filter((s) => s.end > s.start);
}

export type Leg = { start: number; end: number; working: boolean };

/**
 * A drive cut wherever work started or stopped while it went on: each leg is
 * working (in the shift, not paused) or not. A drive wholly inside or
 * outside the working time is one leg.
 */
export function legsOf(start: number, end: number, spans: readonly Span[]): Leg[] {
  const working = (at: number) => spans.some((s) => at >= s.start && at < s.end);
  const cuts = [
    ...new Set(spans.flatMap((s) => [s.start, s.end]).filter((at) => at > start && at < end)),
  ].sort((a, b) => a - b);
  const bounds = [start, ...cuts, end];
  const legs: Leg[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const leg = { start: bounds[i], end: bounds[i + 1], working: working(bounds[i]) };
    const last = legs[legs.length - 1];
    if (last && last.working === leg.working) last.end = leg.end;
    else legs.push(leg);
  }
  return legs;
}

/** Drives at least this far apart aren't one working stretch (a lunch, a stop at home). */
export const BACKDATE_GAP_MS = 45 * 60_000;
/** The newest of them must have ended this recently: the courier is still out working. */
export const BACKDATE_RECENT_MS = 60 * 60_000;

type Drive = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  classification: string;
  source: string;
  shiftId: string | null;
  /** Set on the part of a drive cut off a shift's end: that drive home is never offered back to work. */
  offShiftId?: string | null;
};

/**
 * "Start shift from 10:40?": the moment to backdate a shift to, when the
 * newest drives look like work that wasn't on a shift. Unsorted automatic
 * drives, newest first, joined while the stops between them stay short, the
 * newest having just ended. Without a shift running it takes `minDrives` of
 * them (two: one drive could be anything); when a shift was just started
 * late, one is enough. Nothing before `notBefore` (the last shift's end).
 */
export function backdateStart(
  trips: readonly Drive[],
  now: number,
  { notBefore = 0, minDrives = 2, before = now }: { notBefore?: number; minDrives?: number; before?: number } = {},
): { from: string; tripIds: string[] } | null {
  const candidates = trips
    .filter(
      (trip) =>
        trip.source === 'auto' &&
        trip.shiftId === null &&
        trip.classification === 'unclassified' &&
        !trip.offShiftId &&
        Date.parse(trip.startedAt) > notBefore &&
        Date.parse(trip.startedAt) < before,
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const newest = candidates[0];
  if (!newest) return null;
  const endOf = (trip: Drive) => Date.parse(trip.endedAt ?? trip.startedAt);
  if (now - endOf(newest) > BACKDATE_RECENT_MS) return null;
  const chain = [newest];
  for (const trip of candidates.slice(1)) {
    const later = chain[chain.length - 1];
    if (Date.parse(later.startedAt) - endOf(trip) > BACKDATE_GAP_MS) break;
    chain.push(trip);
  }
  if (chain.length < minDrives) return null;
  const first = chain[chain.length - 1];
  return { from: first.startedAt, tripIds: chain.map((trip) => trip.id) };
}

/** A detected drive's part, and where it's filed: in a shift, cut off one, or neither. */
export type PlannedLeg = { drive: DetectedTrip; shiftId: string | null; offShiftId: string | null };

/**
 * How a detected drive is saved in shift mode: cut wherever work stopped or
 * started while it went on (the shift's end, a pause), using the route
 * points' times. A drive that started in the grace after the shift ended
 * stays whole and in the shift, as before; one outside any shift is left as is.
 */
export function shiftLegs(
  trip: DetectedTrip,
  around: {
    shift: { id: string; startedAt: string; endedAt: string | null };
    pauses: readonly Pick<ShiftPause, 'startedAt' | 'endedAt'>[];
    /** When the shift ends: its end, or its 16-hour mark while running. */
    end: number;
  } | null,
): PlannedLeg[] {
  if (!around) return [{ drive: trip, shiftId: null, offShiftId: null }];
  const { shift } = around;
  if (trip.startedAt >= around.end) return [{ drive: trip, shiftId: shift.id, offShiftId: null }];
  const legs = legsOf(trip.startedAt, trip.endedAt, workSpans({ ...shift, endedAt: new Date(around.end).toISOString() }, around.pauses, around.end));
  const planned: PlannedLeg[] = [];
  let rest = trip;
  for (const [index, leg] of legs.entries()) {
    let drive = rest;
    const next = legs[index + 1];
    if (next) {
      const split = splitRoute(rest.route, rest.routeTimes, rest.startedAt, rest.endedAt, rest.distanceMeters, next.start);
      const cut = split.cut ?? rest.end;
      drive = {
        ...rest,
        endedAt: next.start,
        end: cut,
        distanceMeters: split.before.meters,
        route: split.before.route,
        routeTimes: split.before.times,
      };
      rest = {
        ...rest,
        startedAt: next.start,
        start: cut,
        distanceMeters: split.after.meters,
        route: split.after.route,
        routeTimes: split.after.times,
      };
    }
    planned.push(
      leg.working ? { drive, shiftId: shift.id, offShiftId: null } : { drive, shiftId: null, offShiftId: shift.id },
    );
  }
  return planned;
}
