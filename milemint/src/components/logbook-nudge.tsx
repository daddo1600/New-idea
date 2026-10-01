import { router, useFocusEffect, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listLogbooks } from '@/db/logbooks-repo';
import { carsOverKmLimit, CENTS_PER_KM_LIMIT_KM, logbookTaxYear, plannedEndDate, type Logbook } from '@/domain/logbook';
import { currentTaxYear, formatDistance } from '@/domain/regions';
import { toLocalIsoDate, type Trip } from '@/domain/trip';
import type { Vehicle } from '@/domain/vehicles';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/**
 * Australia: a car past (or on track to pass) the 5,000 km cents per km limit
 * would probably claim more with a logbook. Hidden once that car has a
 * logbook from the last 5 income years, and everywhere else.
 */
export function LogbookNudge({ trips, vehicles }: { trips: readonly Trip[]; vehicles: readonly Vehicle[] }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const t = useT();
  const { region } = useRegion();
  const [logbooks, setLogbooks] = useState<Logbook[] | null>(null);
  const australia = region.code === 'AU';

  useFocusEffect(
    useCallback(() => {
      if (australia) listLogbooks(db).then(setLogbooks, () => setLogbooks([]));
    }, [db, australia]),
  );

  const today = toLocalIsoDate(new Date());
  const cars = useMemo(() => (australia ? carsOverKmLimit(trips, today, region) : []), [australia, trips, today, region]);
  if (!australia || !logbooks) return null;

  const year = currentTaxYear(region);
  // A logbook started in the last 5 income years (running, done, or waiting for readings) answers the nudge;
  // one ended early doesn't, as it can't be used.
  const covered = (vehicleId: string) =>
    logbooks.some(
      (logbook) =>
        logbook.vehicleId === vehicleId &&
        year - logbookTaxYear(logbook) < 5 &&
        logbook.endDate >= plannedEndDate(logbook.startDate),
    );
  const car = cars.find((candidate) => !covered(candidate.vehicleId));
  if (!car) return null;
  const vehicle = vehicles.find((v) => v.id === car.vehicleId)?.name ?? '';
  const over = car.businessKm >= CENTS_PER_KM_LIMIT_KM;
  const roundTo100 = (km: number) => Math.round(km / 100) * 100;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('Opens the logbook method')}
      onPress={() => router.push('/logbook' as Href)}>
      <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.accent }]}>
        <ThemedText type="smallBold">{t('Over 5,000 km? The logbook method could claim more')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {over
            ? t('{{vehicle}} has done {{distance}} of business driving this year. Cents per km stops counting at 5,000 km.', {
                vehicle,
                distance: formatDistance(car.businessKm * 1000, region),
              })
            : t('{{vehicle}} is on track for about {{distance}} of business driving this year. Cents per km stops counting at 5,000 km.', {
                vehicle,
                distance: formatDistance(roundTo100(car.projectedKm) * 1000, region),
              })}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {t('Start a 12-week logbook')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
});
