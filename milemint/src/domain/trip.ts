import { msg } from '../i18n/i18n';
import type { AutoReason } from './classify-rules';

export type Classification = 'unclassified' | 'business' | 'personal';
export type TripSource = 'manual' | 'auto';

/** What the trip was driven (or ridden) in; tax offices price them differently. */
export type VehicleType = 'car' | 'motorbike' | 'bicycle';
export const VEHICLE_TYPES: readonly VehicleType[] = ['car', 'motorbike', 'bicycle'];

export const VEHICLE_ICONS: Record<VehicleType, string> = { car: '🚗', motorbike: '🛵', bicycle: '🚲' };

/** Names of vehicle types, marked for translation (the report keeps them in English). */
export const VEHICLE_LABELS: Record<VehicleType, string> = {
  car: msg('Car or van'),
  motorbike: msg('Motorbike or scooter'),
  bicycle: msg('Bicycle'),
};

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
  vehicle: VehicleType;
  /** The garage vehicle, when known (trips from before the garage only have a type). */
  vehicleId: string | null;
  /** The shift the drive was part of (shift mode), or null. */
  shiftId: string | null;
  /**
   * The shift this drive was cut from, when it's the part after the shift
   * ended (or during a pause): not work, and left for the user to sort.
   */
  offShiftId?: string | null;
  /**
   * The purpose was filled in by the app (learned from the route, or the
   * user's usual purpose) and not changed since (from the edit log), so the
   * trip list can offer to check it.
   */
  purposeFilled?: boolean;
  /**
   * Parking and tolls (Congestion Charge, bridge and road tolls) paid on the
   * drive, in minor units (pence, cents); 0 or missing when none. They stay
   * with the drive whatever it's classified as, but only count on business
   * drives, and only where the tax office lets them go on top of the mileage
   * rate (see Region.costs).
   */
  parkingMinor?: number;
  tollsMinor?: number;
};

/** One drive's parking or tolls can't be more than this (minor units: £1,000 or $1,000): a typo otherwise. */
export const MAX_COST_MINOR = 100_000;

/** Whether an amount of parking or tolls can be saved: whole minor units, from 0 up to MAX_COST_MINOR. */
export function isValidCostMinor(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_COST_MINOR;
}

/** Parking and tolls on a drive together, in minor units. */
export function tripCostsMinor(trip: Pick<Trip, 'parkingMinor' | 'tollsMinor'>): number {
  return (trip.parkingMinor ?? 0) + (trip.tollsMinor ?? 0);
}

export const METERS_PER_MILE = 1609.344;

export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}

export function milesToMeters(miles: number): number {
  return Math.round(miles * METERS_PER_MILE);
}

/**
 * Calendar date (YYYY-MM-DD) of a moment at a given UTC offset, in
 * `Date#getTimezoneOffset()` minutes (UTC minus local, so UK summer time is -60).
 * Without a known offset, the device's current time zone is used.
 */
export function isoDateAtOffset(epochMs: number, utcOffsetMin?: number | null): string {
  if (utcOffsetMin === null || utcOffsetMin === undefined || !Number.isFinite(utcOffsetMin)) {
    return toLocalIsoDate(new Date(epochMs));
  }
  return new Date(epochMs - utcOffsetMin * 60_000).toISOString().slice(0, 10);
}

/** Local calendar date (YYYY-MM-DD) of a Date in the device's time zone. */
export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
