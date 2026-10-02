import { useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useTrips } from '@/db/use-trips';
import { lockedTripIds } from '@/domain/plan';
import type { Place } from '@/domain/places';
import { computeDeductions } from '@/domain/regions';
import type { Classification, Trip } from '@/domain/trip';
import { useT } from '@/i18n/i18n';
import { usePro } from '@/purchases/pro';
import { useAllowance } from '@/referral/referral';
import { useRegion } from '@/region/region';

/**
 * What the trip lists (home's drives to sort, the Drives tab) share: the
 * trips, which ones wait for Pro, their value, sorting (one or many at once),
 * shift rows opened, and deleting.
 */
export function useTripList() {
  const { trips, places, classify, classifyMany, setPurpose, remove, reload } = useTrips();
  const { isPro } = usePro();
  const allowance = useAllowance();
  const { region } = useRegion();
  const t = useT();
  // Bulk sort: pick several trips, then mark them all at once.
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  /** Shift rows opened to show their drives. */
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const locked = useMemo(() => lockedTripIds(trips ?? [], isPro, allowance), [trips, isPro, allowance]);
  /** Drives just sorted back from personal: if the month's free drives are used, their value waits (domain/plan). */
  const [rejoined, setRejoined] = useState<readonly string[] | null>(null);
  const rejoinedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Drives past the free allowance are listed in full, but their value isn't in any total until Pro.
  const visible = useMemo(() => (trips ?? []).filter((trip) => !locked.has(trip.id)), [trips, locked]);
  const deductions = useMemo(() => computeDeductions(visible, region), [visible, region]);

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
  /** Sorts trips, and says so if one sorted back from personal now has to wait for Pro. */
  const sort = async (many: readonly Trip[], classification: Classification) => {
    const back = many.filter((trip) => trip.classification === 'personal' && classification !== 'personal');
    await (many.length === 1 ? classify(many[0], classification) : classifyMany(many, classification));
    if (!isPro && back.length > 0) {
      setRejoined(back.map((trip) => trip.id));
      clearTimeout(rejoinedTimer.current);
      rejoinedTimer.current = setTimeout(() => setRejoined(null), 8000);
    }
  };
  const markSelected = async (classification: Classification) => {
    await sort((trips ?? []).filter((trip) => selected.has(trip.id)), classification);
    stopSelecting();
  };
  const waiting = rejoined?.some((id) => locked.has(id)) ?? false;

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
    locked,
    visible,
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
    waiting,
    closeWaiting: () => setRejoined(null),
    confirmDelete,
  };
}
