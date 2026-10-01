import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { VehicleType } from '@/domain/trip';
import { DEFAULT_VEHICLE_NAMES, type Vehicle } from '@/domain/vehicles';

import { loadSettings, saveSettings } from './settings-repo';

type VehicleRow = { id: string; name: string; type: VehicleType; registration: string | null };

const fromRow = (row: VehicleRow): Vehicle => ({
  id: row.id,
  name: row.name,
  type: row.type,
  registration: row.registration,
});

/** The garage, oldest first, without removed vehicles. */
export async function listVehicles(db: SQLiteDatabase): Promise<Vehicle[]> {
  const rows = await db.getAllAsync<VehicleRow>(
    'SELECT id, name, type, registration FROM vehicles WHERE archived = 0 ORDER BY created_at;',
  );
  return rows.map(fromRow);
}

/** Every vehicle ever added, removed ones included, for naming old trips in reports. */
export async function listAllVehicles(db: SQLiteDatabase): Promise<Vehicle[]> {
  const rows = await db.getAllAsync<VehicleRow>('SELECT id, name, type, registration FROM vehicles;');
  return rows.map(fromRow);
}

export async function addVehicle(
  db: SQLiteDatabase,
  input: { type: VehicleType; name?: string; registration?: string | null },
): Promise<Vehicle> {
  const vehicle: Vehicle = {
    id: Crypto.randomUUID(),
    name: input.name?.trim() || DEFAULT_VEHICLE_NAMES[input.type],
    type: input.type,
    registration: input.registration ?? null,
  };
  await db.runAsync(
    'INSERT INTO vehicles (id, name, type, registration, archived, created_at) VALUES (?, ?, ?, ?, 0, ?);',
    vehicle.id,
    vehicle.name,
    vehicle.type,
    vehicle.registration,
    new Date().toISOString(),
  );
  return vehicle;
}

export async function updateVehicle(db: SQLiteDatabase, vehicle: Vehicle): Promise<void> {
  await db.runAsync(
    'UPDATE vehicles SET name = ?, type = ?, registration = ? WHERE id = ?;',
    vehicle.name,
    vehicle.type,
    vehicle.registration,
    vehicle.id,
  );
  // Keep the current vehicle's type mirrored in settings (new drives are priced by it).
  const settings = await loadSettings(db);
  if (settings.currentVehicleId === vehicle.id) await saveSettings(db, { ...settings, vehicle: vehicle.type });
}

/** Hides a vehicle from the garage; its trips keep their record of it. */
export async function removeVehicle(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE vehicles SET archived = 1 WHERE id = ?;', id);
  const settings = await loadSettings(db);
  if (settings.currentVehicleId === id) {
    const [next] = await listVehicles(db);
    await saveSettings(db, { ...settings, currentVehicleId: next?.id ?? null, vehicle: next?.type ?? 'car' });
  }
}

export async function setCurrentVehicle(db: SQLiteDatabase, vehicle: Vehicle): Promise<void> {
  await saveSettings(db, { ...(await loadSettings(db)), currentVehicleId: vehicle.id, vehicle: vehicle.type });
}

/**
 * The garage, creating the first vehicle from the type chosen earlier if it's
 * empty (and filing older trips of that type under it), and making sure one
 * vehicle is current.
 */
export async function ensureVehicles(db: SQLiteDatabase): Promise<{ vehicles: Vehicle[]; current: Vehicle }> {
  let vehicles = await listVehicles(db);
  const settings = await loadSettings(db);
  if (vehicles.length === 0) {
    const first = await addVehicle(db, { type: settings.vehicle });
    await db.runAsync('UPDATE trips SET vehicle_id = ? WHERE vehicle_id IS NULL AND vehicle = ?;', first.id, first.type);
    vehicles = [first];
  }
  let current = vehicles.find((vehicle) => vehicle.id === settings.currentVehicleId);
  if (!current) {
    current = vehicles[0];
    await saveSettings(db, { ...settings, currentVehicleId: current.id, vehicle: current.type });
  }
  return { vehicles, current };
}
