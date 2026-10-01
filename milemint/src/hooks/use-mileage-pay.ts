import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { loadSettings, updateSettings, type AppSettings } from '@/db/settings-repo';
import { marApplies, type TaxBand } from '@/domain/mar';
import { useRegion } from '@/region/region';

export type MileagePay = {
  /** A UK employee claiming Mileage Allowance Relief, rather than self-employed. */
  employee: boolean;
  /** Tenths of a penny a mile (450 = 45p); 0 when the employer pays nothing. */
  employerRate: number;
  band: TaxBand;
  claimedYears: readonly number[];
};

type PaySettings = Pick<AppSettings, 'employment' | 'employerRate' | 'taxBand' | 'claimedReliefYears'>;

/**
 * How the user is paid for mileage, re-read whenever the screen comes into
 * view (it's changed in Settings). Null until loaded.
 */
export function useMileagePay() {
  const db = useSQLiteContext();
  const { region } = useRegion();
  const [stored, setStored] = useState<PaySettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      let current = true;
      loadSettings(db).then(
        (settings) => current && setStored(settings),
        () => {},
      );
      return () => {
        current = false;
      };
    }, [db]),
  );

  /** Changes can be worked out from the saved settings, so quick taps in a row each build on the last. */
  const update = useCallback(
    (changes: Partial<PaySettings> | ((saved: PaySettings) => Partial<PaySettings>)) =>
      updateSettings(db, changes).then((next) => setStored(next)),
    [db],
  );

  const pay: MileagePay | null = stored && {
    employee: stored.employment === 'employee' && marApplies(region),
    employerRate: stored.employerRate,
    band: stored.taxBand,
    claimedYears: stored.claimedReliefYears,
  };
  return { pay, update };
}
