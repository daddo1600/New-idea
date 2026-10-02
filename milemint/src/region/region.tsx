import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadSettings, updateSettings } from '@/db/settings-repo';
import { DEMO_REGION } from '@/dev/demo';
import { DEFAULT_REGION, REGIONS, type Region, type RegionCode } from '@/domain/regions';
import { setAppearance } from '@/hooks/use-appearance';

import { rememberRegion } from './remembered-region';

type RegionState = {
  region: Region;
  /** False until the user has picked where they drive (first launch). */
  chosen: boolean;
  /** Settings have been read; before that `chosen` isn't known yet. */
  loaded: boolean;
  setRegion: (code: RegionCode) => Promise<void>;
  /** The welcome flow has been completed (the demo counts as done). */
  onboarded: boolean;
  finishOnboarding: () => Promise<void>;
  /** Re-reads the settings, after restoring a backup replaced them. */
  reload: () => Promise<void>;
};

const RegionContext = createContext<RegionState | null>(null);

function demoRegion(): RegionCode | null {
  return DEMO_REGION && DEMO_REGION in REGIONS ? (DEMO_REGION as RegionCode) : DEMO_REGION ? DEFAULT_REGION : null;
}

/** The user's country: currency, distance unit, tax year and deduction rules for every screen. */
export function RegionProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const demo = demoRegion();
  const [code, setCode] = useState<RegionCode | null>(demo);
  const [loaded, setLoaded] = useState(demo !== null);
  const [onboarded, setOnboarded] = useState(demo !== null);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    loadSettings(db).then(
      (settings) => {
        if (cancelled) return;
        // Read here with the rest of the settings: light or dark for the whole app.
        setAppearance(settings.appearance);
        setCode(settings.region);
        if (settings.region) rememberRegion(settings.region);
        setOnboarded(settings.onboarded);
        setLoaded(true);
      },
      () => !cancelled && setLoaded(true),
    );
    return () => {
      cancelled = true;
    };
  }, [db, demo]);

  const reload = useCallback(async () => {
    if (demo) return;
    const settings = await loadSettings(db);
    setAppearance(settings.appearance);
    setCode(settings.region);
    if (settings.region) rememberRegion(settings.region);
    setOnboarded(settings.onboarded);
  }, [db, demo]);

  const setRegion = useCallback(
    async (next: RegionCode) => {
      setCode(next);
      if (demo) return;
      rememberRegion(next);
      await updateSettings(db, { region: next });
    },
    [db, demo],
  );

  const finishOnboarding = useCallback(async () => {
    setOnboarded(true);
    if (demo) return;
    await updateSettings(db, { onboarded: true });
  }, [db, demo]);

  const value = useMemo<RegionState>(
    () => ({
      region: REGIONS[code ?? DEFAULT_REGION],
      chosen: code !== null,
      loaded,
      setRegion,
      onboarded,
      finishOnboarding,
      reload,
    }),
    [code, loaded, setRegion, onboarded, finishOnboarding, reload],
  );
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionState {
  const state = useContext(RegionContext);
  if (!state) throw new Error('useRegion must be used inside <RegionProvider>');
  return state;
}
