import type { AutoReason } from './classify-rules';

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

/** Local calendar date (YYYY-MM-DD) of a Date in the device's time zone. */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
