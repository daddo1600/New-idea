import type { AutoReason } from './classify-rules';
import { rateForDate, type RatePeriod, US_BUSINESS_RATES } from './rates';

export type Classification = 'unclassified' | 'business' | 'personal';
export type TripSource = 'manual' | 'auto';

export type Trip = {
  id: string;
  /** ISO timestamp (UTC) when the drive started. */
  startedAt: string;
  /**
   * The driver's local calendar date (YYYY-MM-DD) at the start of the drive.
   * Rates and tax years follow this, not UTC: an 8pm drive on 30 June in
   * California is already 1 July in UTC.
   */
  localDate: string;
  endedAt: string | null;
  startLabel: string;
  endLabel: string;
  distanceMeters: number;
  classification: Classification;
  purpose: string;
  source: TripSource;
  createdAt: string;
  /** Named places the drive started/ended at, when matched. */
  startPlaceId: string | null;
  endPlaceId: string | null;
  /** Why the classification was set automatically; null once the user sets it. */
  autoReason: AutoReason | null;
};

export const METERS_PER_MILE = 1609.344;

export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}

export function milesToMeters(miles: number): number {
  return Math.round(miles * METERS_PER_MILE);
}

/** Deduction for one trip in whole cents; zero unless the trip is business. */
export function tripDeductionCents(
  trip: Pick<Trip, 'localDate' | 'distanceMeters' | 'classification'>,
  rates: readonly RatePeriod[] = US_BUSINESS_RATES,
): number {
  if (trip.classification !== 'business') return 0;
  const rate = rateForDate(trip.localDate, rates);
  if (!rate) return 0;
  return Math.round((metersToMiles(trip.distanceMeters) * rate.tenthsOfCentPerMile) / 10);
}

export type YearSummary = {
  year: number;
  businessMiles: number;
  deductionCents: number;
  unclassifiedCount: number;
  tripCount: number;
};

export function summarizeYear(
  trips: readonly Trip[],
  year: number,
  rates: readonly RatePeriod[] = US_BUSINESS_RATES,
): YearSummary {
  const prefix = String(year);
  const summary: YearSummary = {
    year,
    businessMiles: 0,
    deductionCents: 0,
    unclassifiedCount: 0,
    tripCount: 0,
  };
  for (const trip of trips) {
    if (!trip.localDate.startsWith(prefix)) continue;
    summary.tripCount += 1;
    if (trip.classification === 'unclassified') summary.unclassifiedCount += 1;
    if (trip.classification === 'business') {
      summary.businessMiles += metersToMiles(trip.distanceMeters);
      summary.deductionCents += tripDeductionCents(trip, rates);
    }
  }
  return summary;
}

/** Local calendar date (YYYY-MM-DD) of a Date in the device's time zone. */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
