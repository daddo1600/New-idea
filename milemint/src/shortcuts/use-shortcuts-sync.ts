import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { onTripsChanged } from '@/db/use-trips';
import { useLanguage } from '@/i18n/i18n';
import { onShiftChangedElsewhere } from '@/live-activity/actions';
import { usePro } from '@/purchases/pro';
import { useRegion } from '@/region/region';

import { refreshShortcutsSnapshot, setShortcutsPro } from './sync';

/**
 * Keeps Siri's summary current while the app runs: at launch, when Pro, the
 * language or the country changes, after any screen reloads its drives (a
 * drive sorted, added or deleted), when the shift changes from the lock
 * screen or Siri, and as the app goes to the background. The background
 * tracker refreshes it too, after each drive it saves.
 */
export function useShortcutsSync(): void {
  const db = useSQLiteContext();
  const { isPro, statusKnown } = usePro();
  const language = useLanguage();
  const { region } = useRegion();

  useEffect(() => {
    if (statusKnown) setShortcutsPro(isPro);
    refreshShortcutsSnapshot(db);
  }, [db, isPro, statusKnown, language, region]);

  useEffect(() => {
    const refresh = () => void refreshShortcutsSnapshot(db);
    const trips = onTripsChanged(refresh);
    const shift = onShiftChangedElsewhere(refresh);
    const app = AppState.addEventListener('change', (state) => state === 'background' && refresh());
    return () => {
      trips();
      shift();
      app.remove();
    };
  }, [db]);
}

/** useShortcutsSync as a component, for the root layout (inside the Pro and region providers). */
export function ShortcutsSync(): null {
  useShortcutsSync();
  return null;
}
