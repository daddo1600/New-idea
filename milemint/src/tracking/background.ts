import * as Location from 'expo-location';
import type { SQLiteDatabase } from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { getBackgroundDatabase } from '@/db/database';
import { listPlaces } from '@/db/places-repo';
import { loadSettings } from '@/db/settings-repo';
import { shiftAt } from '@/db/shifts-repo';
import { refreshLaunchTotal } from '@/region/launch-total';
import { autoTripExists, insertTrip, listClassificationHistory } from '@/db/trips-repo';
import { suggestClassification } from '@/domain/classify-rules';
import type { LatLng } from '@/domain/geo';
import { matchPlace } from '@/domain/places';
import {
  GEOFENCE_RADIUS_M,
  INITIAL_TRACKER_RECORD,
  onGeofenceExit,
  onLocations,
  parkedAt,
} from '@/domain/tracker-policy';
import { toLocalIsoDate } from '@/domain/trip';
import type { DetectedTrip, LocationSample } from '@/domain/trip-detector';
import { t } from '@/i18n/i18n';

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
      notificationTitle: t('MileMint is logging this drive'),
      notificationBody: t('Tracking stops automatically when you park.'),
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
  // If the app was killed after saving a trip but before saving the tracker
  // state, the same drive is detected again on the next wake-up.
  if (await autoTripExists(db, new Date(trip.startedAt).toISOString())) return;
  const [places, history, settings] = await Promise.all([
    listPlaces(db),
    listClassificationHistory(db),
    loadSettings(db),
  ]);
  const startPlace = matchPlace(trip.start, places);
  const endPlace = matchPlace(trip.end, places);
  const [startLabel, endLabel] = await Promise.all([
    startPlace?.name ?? labelFor(trip.start),
    endPlace?.name ?? labelFor(trip.end),
  ]);
  const started = new Date(trip.startedAt);
  // Shift mode: every drive in a shift is work.
  const shift = settings.shiftMode ? await shiftAt(db, started.toISOString()) : null;
  const suggestion = suggestClassification(
    {
      start: { placeId: startPlace?.id ?? null, point: trip.start },
      end: { placeId: endPlace?.id ?? null, point: trip.end },
      // The phone's current time zone: work hours are "when I work where I am".
      weekday: started.getDay(),
      minutesOfDay: started.getHours() * 60 + started.getMinutes(),
    },
    {
      history,
      places,
      workHours: settings.workHoursEnabled ? settings.workWeek : null,
    },
  );
  await insertTrip(
    db,
    {
      startedAt: started.toISOString(),
      localDate: toLocalIsoDate(started),
      endedAt: new Date(trip.endedAt).toISOString(),
      startLabel,
      endLabel,
      distanceMeters: trip.distanceMeters,
      classification: shift
        ? 'business'
        : (suggestion.classification ?? (settings.defaultBusiness ? 'business' : 'unclassified')),
      // Business without a learned purpose stays empty; the trip list asks for one.
      purpose: suggestion.purpose ?? (shift ? 'Deliveries' : ''),
      source: 'auto',
      startPlaceId: startPlace?.id ?? null,
      endPlaceId: endPlace?.id ?? null,
      // Stored as the work-hours rule (a shift is working time); shiftId tells them apart.
      autoReason: shift
        ? 'work-hours'
        : suggestion.classification
          ? suggestion.reason
          : settings.defaultBusiness
            ? 'default'
            : null,
      vehicle: settings.vehicle,
      vehicleId: settings.currentVehicleId,
      shiftId: shift?.id ?? null,
    },
    trip.route,
  );
  // Keep the opening animation's total current for the next launch.
  await refreshLaunchTotal(db).catch(() => {});
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

  TaskManager.defineTask<{ eventType: Location.LocationGeofencingEventType }>(GEOFENCE_TASK, ({ data, error }) => {
    if (error || data?.eventType !== Location.LocationGeofencingEventType.Exit) {
      return Promise.resolve();
    }
    return serial(handleGeofenceExit);
  });
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

/**
 * Asks for location access (While Using, then Always). Returns the resulting
 * status. `onAsking` says which of iOS's two questions is about to show, so
 * the screen behind it can say what to tap.
 */
export async function requestTrackingPermissions(
  db: SQLiteDatabase,
  onAsking?: (question: 1 | 2) => void,
): Promise<TrackingStatus> {
  if (!TRACKING_SUPPORTED) return 'unsupported';
  onAsking?.(1);
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.granted) {
    onAsking?.(2);
    await Location.requestBackgroundPermissionsAsync();
  }
  return getTrackingStatus(db);
}

/** Turns automatic logging on: arms a geofence where the phone is now. */
export async function startTracking(db: SQLiteDatabase): Promise<void> {
  if (!TRACKING_SUPPORTED) return;
  const here = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  await serial(async () => {
    // The phone is where the car is parked, so the first drive starts from here.
    await saveTrackerRecord(db, parkedAt(here.coords, Date.now()));
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
      const here = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await armGeofence(here.coords);
    }
  });
}
