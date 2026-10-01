import type { VehicleType } from './trip';

/** A vehicle in the user's garage. Trips record which one they were driven in. */
export type Vehicle = {
  id: string;
  /** e.g. "Golf", "Honda PCX". */
  name: string;
  type: VehicleType;
  /** Number plate, optional; shown in reports so each trip's vehicle is identifiable. */
  registration: string | null;
};

export const DEFAULT_VEHICLE_NAMES: Record<VehicleType, string> = {
  car: 'My car',
  motorbike: 'My motorbike',
  bicycle: 'My bike',
};

/** Tidy a typed number plate: upper case, single spaces ("ab12 cde" → "AB12 CDE"). Empty → null. */
export function normaliseRegistration(input: string): string | null {
  const tidy = input.toUpperCase().replace(/\s+/g, ' ').trim();
  return tidy === '' ? null : tidy;
}

/** How a vehicle is named in reports, e.g. "Golf (AB12 CDE)". */
export function vehicleLabel(vehicle: Pick<Vehicle, 'name' | 'registration'>): string {
  return vehicle.registration ? `${vehicle.name} (${vehicle.registration})` : vehicle.name;
}
