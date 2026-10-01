import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { loadSettings } from '@/db/settings-repo';
import {
  currentPause,
  currentShift,
  editShiftTimes,
  endShift,
  listPauses,
  listShifts,
  pauseShift,
  reopenShift,
  resumeShift,
  startShift,
  startShiftFrom,
  type Shift,
  type ShiftPause,
} from '@/db/shifts-repo';

import { cancelShiftAutoEnd, scheduleShiftAutoEnd } from './shift-notifications';

/** How long "Shift ended · Undo" stays up after swiping a shift off. */
export const UNDO_MS = 5_000;

type Ended = Awaited<ReturnType<typeof endShift>>;

/**
 * Shift mode for the home screen: whether it's on, the open shift and its
 * pause, every shift (for the shift rows), and the actions on them. Trips
 * change with most of these (a late start pulls drives in, an end cuts the
 * last one), so `onTripsChanged` runs after them.
 */
export function useShift(onTripsChanged?: () => unknown) {
  const db = useSQLiteContext();
  const [enabled, setEnabled] = useState(false);
  const [shift, setShift] = useState<Shift | null>(null);
  const [pause, setPause] = useState<ShiftPause | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [pauses, setPauses] = useState<ShiftPause[]>([]);
  /** The shift just swiped off, while it can still be undone. */
  const [ended, setEnded] = useState<NonNullable<Ended> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const changed = useRef(onTripsChanged);
  useEffect(() => {
    changed.current = onTripsChanged;
  });
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  /** Whether a shift was open when last loaded: one gone since may have ended by itself. */
  const wasOpen = useRef(false);
  /** Loads it all; resolves to whether the shift open last time has closed since. */
  const load = useCallback(async () => {
    const [settings, open] = await Promise.all([loadSettings(db), currentShift(db)]);
    const [all, allPauses, running] = await Promise.all([listShifts(db), listPauses(db), currentPause(db)]);
    setEnabled(settings.shiftMode);
    setShift(open);
    setPause(open ? running : null);
    setShifts(all);
    setPauses(allPauses);
    const closedSince = wasOpen.current && !open;
    wasOpen.current = open !== null;
    return closedSince;
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      let current = true;
      load().then(
        (closedSince) => {
          // A shift that ended by itself at 16 hours may have cut a drive: show it.
          if (current && closedSince) changed.current?.();
        },
        () => {},
      );
      return () => {
        current = false;
      };
    }, [load]),
  );

  const after = useCallback(async () => {
    await load();
    await changed.current?.();
  }, [load]);

  const start = useCallback(async () => {
    const started = await startShift(db);
    setShift(started);
    setEnded(null);
    scheduleShiftAutoEnd(started).catch(() => {});
    await after();
  }, [db, after]);

  /** "Start shift from 10:40?": starts (or moves back) the shift, pulling in the drives since. */
  const startFrom = useCallback(
    async (from: Date) => {
      const started = await startShiftFrom(db, from);
      setEnded(null);
      scheduleShiftAutoEnd(started).catch(() => {});
      await after();
    },
    [db, after],
  );

  const end = useCallback(async () => {
    const result = await endShift(db);
    setShift(null);
    setPause(null);
    cancelShiftAutoEnd().catch(() => {});
    clearTimeout(undoTimer.current);
    if (result) {
      setEnded(result);
      undoTimer.current = setTimeout(() => setEnded(null), UNDO_MS);
    }
    await after();
  }, [db, after]);

  const undo = useCallback(async () => {
    if (!ended) return;
    clearTimeout(undoTimer.current);
    setEnded(null);
    const reopened = await reopenShift(db, ended);
    if (reopened) scheduleShiftAutoEnd(reopened).catch(() => {});
    await after();
  }, [db, ended, after]);

  const togglePause = useCallback(async () => {
    if (pause) await resumeShift(db);
    else await pauseShift(db);
    await after();
  }, [db, pause, after]);

  /** Moves a shift's start or end (from its row), then re-files its drives. */
  const editTimes = useCallback(
    async (id: string, changes: { startedAt?: Date; endedAt?: Date }) => {
      const saved = await editShiftTimes(db, id, changes);
      if (saved && !saved.endedAt) scheduleShiftAutoEnd(saved).catch(() => {});
      await after();
    },
    [db, after],
  );

  return { enabled, shift, pause, shifts, pauses, ended, start, startFrom, end, undo, togglePause, editTimes };
}
