import * as Location from 'expo-location';
import type { SQLiteDatabase } from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { getBackgroundDatabase } from '@/db/database';
import { insertTrip } from '@/db/trips-repo';
import type { LatLng } from '@/domain/geo';
import {
  GEOFENCE_RADIUS_M,
  INITIAL_TRACKER_RECORD,
  onGeofenceExit,
  onLocations,
} from '@/domain/tracker-policy';
import { toLocalIsoDate } from '@/domain/trip';
import type { DetectedTrip, LocationSample } from '@/domain/trip-detector';

import { loadTrackerRecord, saveTrackerRecord } from './tracker-store';

/**
 * Automatic trip logging.
 *
 * Parked: a single geofence around the car, no GPS. Leaving it wakes the app
 * (even if iOS had terminated it), GPS runs for the drive, and after the car
 * has been parked for the stop duration GPS turns off and a new geofence is
 * armed. All decisions live in the pure `tracker-policy` / `trip-detector`.
 *
 * Tasks must be defined at module load, before the app renders, so this file
 * is imported from the root layout.
 */

const GEOFENCE_TASK = 'milemint-geofence';
const LOCATION_TASK = 'milemint-location';

export const TRACKING_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

/** Serialises task handling: iOS can deliver a geofence exit and GPS batches back to back. */
let queue: Promise<void> = Promise.resolve();
function serial(work: () => Promise<void>): Promise<void> {
  queue = queue.then(work).catch((error) => console.warn('[tracking]', error));
  return queue;
}

function toSample(location: Location.LocationObject): LocationSample {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    speed: location.coords.speed,
    timestamp: location.timestamp,
  };
}

async function armGeofence(at: LatLng): Promise<void> {
  await Location.startGeofencingAsync(GEOFENCE_TASK, [
    {
      identifier: 'parked',
      latitude: at.latitude,
      longitude: at.longitude,
      radius: GEOFENCE_RADIUS_M,
      notifyOnEnter: false,
      notifyOnExit: true,
    },
  ]);
}

async function startGps(): Promise<void> {
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    activityType: Location.LocationActivityType.AutomotiveNavigation,
    // Fixes keep coming while stopped, which is how the end of a drive is detected.
    distanceInterval: 0,
    pausesUpdatesAutomatically: false,
    // Shows the blue location pill while driving: honest, and keeps iOS from suspending us.
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'MileMint is logging this drive',
      notificationBody: 'Tracking stops automatically when you park.',
    },
  });
}

async function stopTask(name: string, isRunning: (n: string) => Promise<boolean>, stop: (n: string) => Promise<void>) {
  if (await isRunning(name)) await stop(name);
}

async function labelFor(point: LatLng): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync(point);
    const label = place?.name ?? place?.street ?? place?.city;
    if (label) return place?.city && label !== place.city ? `${label}, ${place.city}` : label;
  } catch {
    // Offline or rate-limited: fall back to coordinates; the user can rename later.
  }
  return `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;
}

async function saveDetectedTrip(db: SQLiteDatabase, trip: DetectedTrip): Promise<void> {
  const [startLabel, endLabel] = await Promise.all([labelFor(trip.start), labelFor(trip.end)]);
  await insertTrip(
    db,
    {
      startedAt: new Date(trip.startedAt).toISOString(),
      localDate: toLocalIsoDate(new Date(trip.startedAt)),
      endedAt: new Date(trip.endedAt).toISOString(),
      startLabel,
      endLabel,
      distanceMeters: trip.distanceMeters,
      classification: 'unclassified',
      purpose: '',
      source: 'auto',
    },
    trip.route,
  );
}

async function handleLocations(samples: LocationSample[]): Promise<void> {
  const db = await getBackgroundDatabase();
  const record = await loadTrackerRecord(db);
  const decision = onLocations(record, samples, Date.now());
  for (const trip of decision.completed) await saveDetectedTrip(db, trip);
  await saveTrackerRecord(db, decision.record);
  if (decision.switchToGeofenceAt) {
    await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
    await armGeofence(decision.switchToGeofenceAt);
  }
}

async function handleGeofenceExit(): Promise<void> {
  const db = await getBackgroundDatabase();
  const record = await loadTrackerRecord(db);
  const next = onGeofenceExit(record, Date.now());
  if (next === record) return;
  await saveTrackerRecord(db, next);
  await stopTask(GEOFENCE_TASK, Location.hasStartedGeofencingAsync, Location.stopGeofencingAsync);
  await startGps();
}

if (TRACKING_SUPPORTED) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK, ({ data, error }) => {
    if (error || !data) return Promise.resolve();
    return serial(() => handleLocations(data.locations.map(toSample)));
  });

  TaskManager.defineTask<{ eventType: Location.LocationGeofencingEventType }>(
    GEOFENCE_TASK,
    ({ data, error }) => {
      if (error || data?.eventType !== Location.LocationGeofencingEventType.Exit) {
        return Promise.resolve();
      }
      return serial(handleGeofenceExit);
    },
  );
}

export type TrackingStatus =
  | 'unsupported'
  | 'needs-permission' // no location access yet
  | 'needs-always' // "While Using" only: drives would be missed
  | 'off' // permission fine, user switched tracking off
  | 'on';

export async function getTrackingStatus(db: SQLiteDatabase): Promise<TrackingStatus> {
  if (!TRACKING_SUPPORTED) return 'unsupported';
  const foreground = await Location.getForegroundPermissionsAsync();
  if (!foreground.granted) return 'needs-permission';
  const background = await Location.getBackgroundPermissionsAsync();
  if (!background.granted) return 'needs-always';
  const record = await loadTrackerRecord(db);
  return record.enabled ? 'on' : 'off';
}

/** Asks for location access (While Using, then Always). Returns the resulting status. */
export async function requestTrackingPermissions(db: SQLiteDatabase): Promise<TrackingStatus> {
  if (!TRACKING_SUPPORTED) return 'unsupported';
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.granted) await Location.requestBackgroundPermissionsAsync();
  return getTrackingStatus(db);
}

/** Turns automatic logging on: arms a geofence where the phone is now. */
export async function startTracking(db: SQLiteDatabase): Promise<void> {
  if (!TRACKING_SUPPORTED) return;
  const here = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  await serial(async () => {
    await saveTrackerRecord(db, { ...INITIAL_TRACKER_RECORD, enabled: true });
    await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
    await armGeofence(here.coords);
  });
}

export async function stopTracking(db: SQLiteDatabase): Promise<void> {
  if (!TRACKING_SUPPORTED) return;
  await serial(async () => {
    await saveTrackerRecord(db, INITIAL_TRACKER_RECORD);
    await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
    await stopTask(GEOFENCE_TASK, Location.hasStartedGeofencingAsync, Location.stopGeofencingAsync);
  });
}

/**
 * Called when the app comes to the foreground: finishes a drive whose final
 * GPS batch never arrived, and re-arms tracking if iOS dropped it.
 */
export async function reconcileTracking(db: SQLiteDatabase): Promise<void> {
  if (!TRACKING_SUPPORTED) return;
  await serial(async () => {
    const record = await loadTrackerRecord(db);
    if (!record.enabled) return;
    const background = await Location.getBackgroundPermissionsAsync();
    if (!background.granted) return;
    if (record.mode === 'gps') {
      const decision = onLocations(record, [], Date.now());
      for (const trip of decision.completed) await saveDetectedTrip(db, trip);
      await saveTrackerRecord(db, decision.record);
      if (decision.switchToGeofenceAt) {
        await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
        await armGeofence(decision.switchToGeofenceAt);
      } else if (!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))) {
        await startGps();
      }
    } else if (!(await Location.hasStartedGeofencingAsync(GEOFENCE_TASK))) {
      const here = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await armGeofence(here.coords);
    }
  });
}
