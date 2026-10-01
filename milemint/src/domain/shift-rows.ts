import type { Trip } from './trip';
import { toLocalIsoDate } from './trip';

/**
 * The home list with the shift as the row: a courier's drives in one shift
 * (split by the detector at every restaurant wait) shown as one row that
 * opens to its legs. Drives outside shifts stay rows of their own. Pure, so
 * it's unit-tested.
 */

type ShiftTimes = { id: string; startedAt: string; endedAt: string | null };

export type ShiftGroup = {
  shiftId: string;
  /** The shift's own record; null if it's gone (the drives still say which shift they were in). */
  shift: ShiftTimes | null;
  /** Its drives, first to last. */
  legs: Trip[];
  /** The day the shift started (a night shift across midnight stays on that day). */
  date: string;
  startedAt: string;
  /** When it ended; null while it's running. */
  endedAt: string | null;
  distanceMeters: number;
  /** Drives in it still to sort (the user can re-sort a leg). */
  unsortedCount: number;
  /**
   * Earnings entered for the shift (minor units), for £/hour and paid versus
   * unpaid miles. Not entered anywhere yet: always null until that's built.
   */
  earningsMinor: number | null;
};

export type HomeItem =
  | { kind: 'trip'; trip: Trip }
  | { kind: 'shift'; group: ShiftGroup; expanded: boolean }
  | { kind: 'leg'; trip: Trip; group: ShiftGroup; last: boolean };

export const itemKey = (item: HomeItem): string =>
  item.kind === 'shift' ? `shift:${item.group.shiftId}` : item.trip.id;

/** The shifts' drives grouped, newest shift first (by its latest drive), legs in order. */
export function shiftGroups(trips: readonly Trip[], shifts: readonly ShiftTimes[]): ShiftGroup[] {
  const byShift = new Map<string, Trip[]>();
  for (const trip of trips) {
    if (!trip.shiftId) continue;
    const legs = byShift.get(trip.shiftId);
    if (legs) legs.push(trip);
    else byShift.set(trip.shiftId, [trip]);
  }
  const known = new Map(shifts.map((shift) => [shift.id, shift]));
  return [...byShift.entries()].map(([shiftId, legs]) => {
    legs.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const shift = known.get(shiftId) ?? null;
    const first = legs[0];
    const last = legs[legs.length - 1];
    const startedAt = shift && shift.startedAt < first.startedAt ? shift.startedAt : first.startedAt;
    const lastEnd = last.endedAt ?? last.startedAt;
    const endedAt = shift ? (shift.endedAt === null ? null : shift.endedAt > lastEnd ? shift.endedAt : lastEnd) : lastEnd;
    return {
      shiftId,
      shift,
      legs,
      // The shift's own start in this phone's zone; its first drive's date if the record is gone.
      date: shift ? toLocalIsoDate(new Date(shift.startedAt)) : first.localDate,
      startedAt,
      endedAt,
      distanceMeters: legs.reduce((sum, trip) => sum + trip.distanceMeters, 0),
      unsortedCount: legs.filter((trip) => trip.classification === 'unclassified').length,
      earningsMinor: null,
    };
  });
}

/**
 * The rows of the home list, newest first as before (by date, then time):
 * a shift sits where its latest drive would, and is followed by its legs
 * when it's open.
 */
export function homeItems(
  trips: readonly Trip[],
  shifts: readonly ShiftTimes[],
  expanded: ReadonlySet<string>,
): HomeItem[] {
  type Entry = { date: string; at: string; items: HomeItem[] };
  const entries: Entry[] = trips
    .filter((trip) => !trip.shiftId)
    .map((trip) => ({ date: trip.localDate, at: trip.startedAt, items: [{ kind: 'trip', trip }] }));
  for (const group of shiftGroups(trips, shifts)) {
    const open = expanded.has(group.shiftId);
    const items: HomeItem[] = [{ kind: 'shift', group, expanded: open }];
    if (open) {
      group.legs.forEach((trip, index) =>
        items.push({ kind: 'leg', trip, group, last: index === group.legs.length - 1 }),
      );
    }
    entries.push({ date: group.date, at: group.legs[group.legs.length - 1].startedAt, items });
  }
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.at.localeCompare(a.at));
  return entries.flatMap((entry) => entry.items);
}

/** Where a drive cut off a shift falls: after the shift ended, or in one of its pauses. */
export function offShiftKind(trip: Trip, shifts: readonly ShiftTimes[]): 'after' | 'pause' | null {
  if (!trip.offShiftId) return null;
  const shift = shifts.find((s) => s.id === trip.offShiftId);
  if (!shift) return 'after';
  return shift.endedAt !== null && trip.startedAt >= shift.endedAt ? 'after' : 'pause';
}
