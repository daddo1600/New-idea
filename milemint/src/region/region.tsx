import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadSettings, saveSettings } from '@/db/settings-repo';
import { DEMO_REGION } from '@/dev/demo';
import { DEFAULT_REGION, REGIONS, type Region, type RegionCode } from '@/domain/regions';

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

  const setRegion = useCallback(
    async (next: RegionCode) => {
      setCode(next);
      if (demo) return;
      rememberRegion(next);
      await saveSettings(db, { ...(await loadSettings(db)), region: next });
    },
    [db, demo],
  );

  const finishOnboarding = useCallback(async () => {
    setOnboarded(true);
    if (demo) return;
    await saveSettings(db, { ...(await loadSettings(db)), onboarded: true });
  }, [db, demo]);

  const value = useMemo<RegionState>(
    () => ({
      region: REGIONS[code ?? DEFAULT_REGION],
      chosen: code !== null,
      loaded,
      setRegion,
      onboarded,
      finishOnboarding,
    }),
    [code, loaded, setRegion, onboarded, finishOnboarding],
  );
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionState {
  const state = useContext(RegionContext);
  if (!state) throw new Error('useRegion must be used inside <RegionProvider>');
  return state;
}
