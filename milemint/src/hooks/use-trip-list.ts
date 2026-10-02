import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useTrips } from '@/db/use-trips';
import type { Place } from '@/domain/places';
import { computeDeductions } from '@/domain/regions';
import type { Classification, Trip } from '@/domain/trip';
import { useT } from '@/i18n/i18n';
import { useRegion } from '@/region/region';

/**
 * What the trip lists (home's drives to sort, the Drives tab) share: the
 * trips, their value, sorting (one or many at once), shift rows opened, and
 * deleting. Every drive is shown and counted, on the free plan too.
 */
export function useTripList() {
  const { trips, places, classify, classifyMany, setPurpose, remove, reload } = useTrips();
  const { region } = useRegion();
  const t = useT();
  // Bulk sort: pick several trips, then mark them all at once.
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  /** Shift rows opened to show their drives. */
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const allTrips = useMemo(() => trips ?? [], [trips]);
  const deductions = useMemo(() => computeDeductions(allTrips, region), [allTrips, region]);

  const kindOf = (id: string | null) => places.find((place: Place) => place.id === id)?.kind ?? null;
  const toggleShift = (shiftId: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(shiftId)) next.delete(shiftId);
      else next.add(shiftId);
      return next;
    });
  const stopSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };
  const toggle = (trip: Trip) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(trip.id)) next.delete(trip.id);
      else next.add(trip.id);
      return next;
    });
  const sort = async (many: readonly Trip[], classification: Classification) => {
    await (many.length === 1 ? classify(many[0], classification) : classifyMany(many, classification));
  };
  const markSelected = async (classification: Classification) => {
    await sort((trips ?? []).filter((trip) => selected.has(trip.id)), classification);
    stopSelecting();
  };

  const confirmDelete = (trip: Trip) =>
    Alert.alert(t('Delete trip?'), `${trip.startLabel} → ${trip.endLabel}`, [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: () => remove(trip) },
    ]);

  return {
    trips,
    places,
    reload,
    setPurpose,
    allTrips,
    deductions,
    kindOf,
    selecting,
    setSelecting,
    selected,
    setSelected,
    toggle,
    stopSelecting,
    markSelected,
    sort,
    expanded,
    toggleShift,
    confirmDelete,
  };
}
