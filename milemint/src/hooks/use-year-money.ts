import { useMemo } from 'react';

import { isCommute } from '@/domain/classify-rules';
import { employerPaysLess, marForYear, marSummary, unclaimedNudge } from '@/domain/mar';
import type { Place } from '@/domain/places';
import { currentTaxYear, summarizeTaxYear, taxYearOf } from '@/domain/regions';
import type { Trip } from '@/domain/trip';
import { useMileagePay } from '@/hooks/use-mileage-pay';
import { useRegion } from '@/region/region';

/**
 * This tax year's money back, for home's green card and the Money tab: the
 * deduction (or, for UK employees, Mileage Allowance Relief), relief left in
 * earlier years, and commutes marked business.
 *
 * `visible` and `deductions` come from useTripList: every drive, on the free
 * plan too.
 */
export function useYearMoney(
  visible: readonly Trip[],
  deductions: ReadonlyMap<string, number>,
  places: readonly Place[],
) {
  const { region } = useRegion();
  const taxYear = currentTaxYear(region);
  // UK employees don't deduct mileage: they claim Mileage Allowance Relief on what the employer didn't pay.
  const { pay } = useMileagePay();
  const employee = pay?.employee ?? false;
  const summary = useMemo(
    () => summarizeTaxYear(visible, region, taxYear, deductions, { employee }),
    [visible, region, taxYear, deductions, employee],
  );
  const employerRate = pay?.employerRate ?? 0;
  const band = pay?.band ?? 'unsure';
  const claimedYears = pay?.claimedYears;
  const relief = useMemo(
    () => (employee ? marForYear(visible, region, taxYear, { employerRate, band }, deductions) : null),
    [employee, visible, region, taxYear, employerRate, band, deductions],
  );
  const nudge = useMemo(() => {
    if (!employee || !claimedYears) return null;
    return unclaimedNudge(marSummary(visible, region, { employerRate, band }, new Date(), deductions), region, claimedYears);
  }, [employee, claimedYears, visible, region, employerRate, band, deductions]);
  // This tax year's total: the relief for UK employees, otherwise the deduction.
  const yearTotal = relief ? relief.relief : summary.total;

  // Home ↔ work drives the user marked business anyway. Kept in the total (a
  // home office can make them deductible), but called out so they get a second look.
  const commuteCents = useMemo(() => {
    const kind = (id: string | null) => places.find((place) => place.id === id)?.kind ?? null;
    return visible
      .filter(
        (trip) =>
          taxYearOf(trip.localDate, region) === taxYear &&
          trip.classification === 'business' &&
          isCommute(kind(trip.startPlaceId), kind(trip.endPlaceId)),
      )
      .reduce((sum, trip) => sum + (deductions.get(trip.id) ?? 0), 0);
  }, [visible, places, region, taxYear, deductions]);

  return {
    taxYear,
    employee,
    summary,
    relief: relief && { year: relief, paysLess: employerPaysLess(relief, region, employerRate) },
    nudge,
    yearTotal,
    commuteCents,
  };
}
