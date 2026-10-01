import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { DEMO_DRIVING, DEMO_MODE } from '@/dev/demo';
import { currentDistanceM } from '@/domain/trip-detector';

import { loadTrackerRecord } from './tracker-store';

/** A drive being recorded right now, as the background tracker last saved it. */
export type LiveDrive = {
  startedAt: number;
  distanceMeters: number;
  /** Stopped for a moment: the trip is saved if the stop lasts long enough. */
  stopped: boolean;
};

const POLL_MS = 5_000;

/** The drive in progress, re-read every few seconds while the app is open. Null when parked. */
export function useLiveDrive(): LiveDrive | null {
  const db = useSQLiteContext();
  const [drive, setDrive] = useState<LiveDrive | null>(() =>
    DEMO_DRIVING ? { startedAt: Date.now() - 14 * 60_000, distanceMeters: 5150, stopped: false } : null,
  );

  useEffect(() => {
    if (DEMO_MODE) return;
    let current = true;
    const read = async () => {
      if (AppState.currentState !== 'active') return;
      const record = await loadTrackerRecord(db).catch(() => null);
      if (!current) return;
      const detector = record?.enabled ? record.detector : null;
      setDrive(
        detector?.mode === 'driving'
          ? {
              startedAt: detector.start.timestamp,
              distanceMeters: currentDistanceM(detector),
              stopped: detector.stop !== null,
            }
          : null,
      );
    };
    read();
    const timer = setInterval(read, POLL_MS);
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && read());
    return () => {
      current = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [db]);

  return drive;
}
