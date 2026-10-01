import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { VEHICLE_TYPES, type VehicleType } from '@/domain/trip';
import { defaultVehicleName, type Vehicle } from '@/domain/vehicles';

import { loadSettings, updateSettings, writeSettings } from './settings-repo';
import { inWriteTransaction, withWriteLock } from './transaction';

type VehicleRow = { id: string; name: string; type: VehicleType; registration: string | null };

const fromRow = (row: VehicleRow): Vehicle => ({
  id: row.id,
  name: row.name,
  type: row.type,
  registration: row.registration,
});

/** The garage, oldest first, without removed vehicles. */
export async function listVehicles(db: Pick<SQLiteDatabase, 'getAllAsync'>): Promise<Vehicle[]> {
  const rows = await db.getAllAsync<VehicleRow>(
    'SELECT id, name, type, registration FROM vehicles WHERE archived = 0 ORDER BY created_at, rowid;',
  );
  return rows.map(fromRow);
}

/** Every vehicle ever added, removed ones included, for naming old trips in reports. */
export async function listAllVehicles(db: SQLiteDatabase): Promise<Vehicle[]> {
  const rows = await db.getAllAsync<VehicleRow>('SELECT id, name, type, registration FROM vehicles;');
  return rows.map(fromRow);
}

/** Inserts a vehicle without taking the write lock (callers hold it). */
async function insertVehicle(
  db: SQLiteDatabase,
  input: { type: VehicleType; name?: string; registration?: string | null },
): Promise<Vehicle> {
  const vehicle: Vehicle = {
    id: Crypto.randomUUID(),
    name: input.name?.trim() || defaultVehicleName(input.type),
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

export function addVehicle(
  db: SQLiteDatabase,
  input: { type: VehicleType; name?: string; registration?: string | null },
): Promise<Vehicle> {
  return withWriteLock(() => insertVehicle(db, input));
}

/**
 * Renames a vehicle or changes its registration or type. A new type applies
 * to the trips driven in it too: they're priced by type, and it was wrong
 * for all of them (one vehicle is one type).
 */
export async function updateVehicle(db: SQLiteDatabase, vehicle: Vehicle): Promise<void> {
  await inWriteTransaction(db, async () => {
    const before = await db.getFirstAsync<{ type: VehicleType }>('SELECT type FROM vehicles WHERE id = ?;', vehicle.id);
    if (!before) return;
    await db.runAsync(
      'UPDATE vehicles SET name = ?, type = ?, registration = ? WHERE id = ?;',
      vehicle.name,
      vehicle.type,
      vehicle.registration,
      vehicle.id,
    );
    if (before.type !== vehicle.type) {
      await db.runAsync('UPDATE trips SET vehicle = ? WHERE vehicle_id = ?;', vehicle.type, vehicle.id);
    }
    // Keep the current vehicle's type mirrored in settings (new drives are priced by it).
    const settings = await loadSettings(db);
    if (settings.currentVehicleId === vehicle.id && settings.vehicle !== vehicle.type) {
      await writeSettings(db, { ...settings, vehicle: vehicle.type });
    }
  });
}

/** Hides a vehicle from the garage; its trips keep their record of it. */
export async function removeVehicle(db: SQLiteDatabase, id: string): Promise<void> {
  await inWriteTransaction(db, async () => {
    await db.runAsync('UPDATE vehicles SET archived = 1 WHERE id = ?;', id);
    // Read now, inside the transaction: settings loaded before it may be stale.
    const settings = await loadSettings(db);
    if (settings.currentVehicleId === id) {
      const [next] = await listVehicles(db);
      await writeSettings(db, { ...settings, currentVehicleId: next?.id ?? null, vehicle: next?.type ?? 'car' });
    }
  });
}

export async function setCurrentVehicle(db: SQLiteDatabase, vehicle: Vehicle): Promise<void> {
  await updateSettings(db, { currentVehicleId: vehicle.id, vehicle: vehicle.type });
}

/**
 * The garage, creating the first vehicle from the type chosen earlier if it's
 * empty, and making sure one vehicle is current. Checked and created in one
 * transaction, so two screens asking at once don't each make a vehicle.
 *
 * Trips from before the garage existed (schema 7) have a type but no vehicle:
 * when the garage is first made, each is filed under a vehicle of its type
 * (the first vehicle for its own type, and a new one for any other type driven).
 */
export async function ensureVehicles(db: SQLiteDatabase): Promise<{ vehicles: Vehicle[]; current: Vehicle }> {
  let result: { vehicles: Vehicle[]; current: Vehicle } | null = null;
  await inWriteTransaction(db, async () => {
    let vehicles = await listVehicles(db);
    const settings = await loadSettings(db);
    if (vehicles.length === 0) {
      vehicles = [await insertVehicle(db, { type: settings.vehicle })];
      const unfiled = await db.getAllAsync<{ vehicle: VehicleType }>(
        'SELECT DISTINCT vehicle FROM trips WHERE vehicle_id IS NULL;',
      );
      for (const { vehicle: type } of unfiled) {
        if (!VEHICLE_TYPES.includes(type)) continue;
        let vehicle = vehicles.find((candidate) => candidate.type === type);
        if (!vehicle) {
          vehicle = await insertVehicle(db, { type });
          vehicles.push(vehicle);
        }
        await db.runAsync('UPDATE trips SET vehicle_id = ? WHERE vehicle_id IS NULL AND vehicle = ?;', vehicle.id, type);
      }
    }
    let current = vehicles.find((vehicle) => vehicle.id === settings.currentVehicleId);
    if (!current) {
      current = vehicles[0];
      await writeSettings(db, { ...settings, currentVehicleId: current.id, vehicle: current.type });
    }
    result = { vehicles, current };
  });
  return result!;
}
