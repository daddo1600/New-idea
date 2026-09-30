/**
 * IRS business standard mileage rates, in tenths of a cent per mile
 * (725 = 72.5¢) so every calculation stays in integers.
 *
 * Rates change by date, not just by year: the IRS raised the 2026 rate
 * mid-year, so trips must be priced at the rate in force on the trip date.
 * Periods are inclusive of `from` and run until the next entry starts.
 *
 * TODO(before launch): confirm the 1 Jul 2026 change on irs.gov — it is
 * currently sourced from secondary reporting (Driversnote, Bradyware).
 * Later this table ships as remotely updatable data.
 */
export type RatePeriod = {
  /** ISO date (YYYY-MM-DD) the rate takes effect. */
  from: string;
  tenthsOfCentPerMile: number;
};

export const US_BUSINESS_RATES: readonly RatePeriod[] = [
  { from: '2024-01-01', tenthsOfCentPerMile: 670 },
  { from: '2025-01-01', tenthsOfCentPerMile: 700 },
  { from: '2026-01-01', tenthsOfCentPerMile: 725 },
  { from: '2026-07-01', tenthsOfCentPerMile: 760 },
];

/** Returns the rate in force on `isoDate`, or null before the first known period. */
export function rateForDate(
  isoDate: string,
  rates: readonly RatePeriod[] = US_BUSINESS_RATES,
): RatePeriod | null {
  const day = isoDate.slice(0, 10);
  let match: RatePeriod | null = null;
  for (const period of rates) {
    if (period.from <= day) match = period;
    else break;
  }
  return match;
}
