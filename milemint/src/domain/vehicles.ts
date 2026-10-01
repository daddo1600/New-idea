import { msg, t } from '../i18n/i18n';
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
  car: msg('My car'),
  motorbike: msg('My motorbike'),
  bicycle: msg('My bike'),
};

/** The name a new vehicle gets when the user doesn't type one, in the current language. */
export function defaultVehicleName(type: VehicleType): string {
  return t(DEFAULT_VEHICLE_NAMES[type]);
}

/** Whether `name` is still a default name (in English or the current language), i.e. never renamed. */
export function isDefaultVehicleName(name: string, type: VehicleType): boolean {
  return name === DEFAULT_VEHICLE_NAMES[type] || name === defaultVehicleName(type);
}

/** Tidy a typed number plate: upper case, single spaces ("ab12 cde" → "AB12 CDE"). Empty → null. */
export function normaliseRegistration(input: string): string | null {
  const tidy = input.toUpperCase().replace(/\s+/g, ' ').trim();
  return tidy === '' ? null : tidy;
}

/** How a vehicle is named in reports, e.g. "Golf (AB12 CDE)". */
export function vehicleLabel(vehicle: Pick<Vehicle, 'name' | 'registration'>): string {
  return vehicle.registration ? `${vehicle.name} (${vehicle.registration})` : vehicle.name;
}
