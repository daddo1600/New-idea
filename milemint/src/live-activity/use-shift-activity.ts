import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { ShiftActivity } from '../../modules/live-activity';
import { handleShiftActivityActions } from './actions';
import { LIVE_ACTIVITY_SUPPORTED, syncShiftActivity } from './sync';

/**
 * Keeps the lock-screen card in step with the app, from the root layout:
 * at launch, each time the app comes to the foreground, and when a button on
 * the card is tapped, it acts on the buttons tapped (End shift, Not working)
 * and then starts, updates or ends the card.
 */
export function useShiftActivity(): void {
  const db = useSQLiteContext();
  useEffect(() => {
    if (!LIVE_ACTIVITY_SUPPORTED) return;
    // One check at a time, in order: a tap during a check is handled by the next one.
    let queue: Promise<void> = Promise.resolve();
    const check = () => {
      queue = queue
        .then(() => handleShiftActivityActions(db))
        .catch((error) => console.warn('[live-activity]', error))
        .then(() => syncShiftActivity(db));
    };
    check();
    const app = AppState.addEventListener('change', (state) => state === 'active' && check());
    const tapped = ShiftActivity.onAction(check);
    return () => {
      app.remove();
      tapped.remove();
    };
  }, [db]);
}

/** useShiftActivity as a component, for the root layout (inside the database provider). */
export function ShiftActivitySync(): null {
  useShiftActivity();
  return null;
}
