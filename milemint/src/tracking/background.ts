import * as Location from 'expo-location';
import type { SQLiteDatabase } from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { AppState, Platform } from 'react-native';

import { getBackgroundDatabase } from '@/db/database';
import { listPlaces } from '@/db/places-repo';
import { loadSettings } from '@/db/settings-repo';
import { shiftAt } from '@/db/shifts-repo';
import { refreshLaunchTotal } from '@/region/launch-total';
import { autoTripExists, insertTrip, listClassificationHistory } from '@/db/trips-repo';
import { autoClassify } from '@/domain/auto-classify';
import { suggestClassification } from '@/domain/classify-rules';
import type { LatLng } from '@/domain/geo';
import { matchPlace } from '@/domain/places';
import { areaLabel, clientVisitLabel } from '@/domain/privacy';
import type { RegionCode } from '@/domain/regions';
import {
  dismissGap,
  GEOFENCE_RADIUS_M,
  INITIAL_TRACKER_RECORD,
  onGeofenceExit,
  onLocations,
  onReconcile,
  onReconcileParked,
  parkedAt,
  type TrackerRecord,
} from '@/domain/tracker-policy';
import { alertWorthy, trackingHealth, type TrackingHealth, type TrackingPermissions } from '@/domain/tracking-health';
import { isoDateAtOffset } from '@/domain/trip';
import type { DetectedTrip, LocationSample } from '@/domain/trip-detector';
import { t } from '@/i18n/i18n';

import { armDriveWatchdog, cancelHealthAlerts, queueHealthAlert } from './health-alerts';
import { waitForPromptAnswer } from './prompt-answer';
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

/** `serial`, for work whose result (or error) the caller needs. */
function inQueue<T>(work: () => Promise<T>): Promise<T> {
  const result = queue.then(work);
  queue = result.then(
    () => {},
    (error) => console.warn('[tracking]', error),
  );
  return result;
}

function toSample(location: Location.LocationObject): LocationSample {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    speed: location.coords.speed,
    timestamp: location.timestamp,
    // The time zone the phone is in when the fix is taken: a drive's date is
    // where it started, even if it's saved after crossing into another zone.
    utcOffsetMin: new Date(location.timestamp).getTimezoneOffset(),
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

export async function labelFor(point: LatLng): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync(point);
    const label = place?.name ?? place?.street ?? place?.city;
    if (label) return place?.city && label !== place.city ? `${label}, ${place.city}` : label;
  } catch {
    // Offline or rate-limited: fall back to coordinates; the user can rename later.
  }
  return `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;
}

/**
 * Client privacy: the area only, e.g. "Client visit · Leeds LS6". Never the
 * street, and never coordinates (they'd pinpoint the house) when the lookup fails.
 */
async function privateLabelFor(point: LatLng, region: RegionCode | null): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync(point);
    return clientVisitLabel(areaLabel(place, region));
  } catch {
    return clientVisitLabel(null);
  }
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
  // Places the user named (Home, Work, a saved office) keep their names, private or not.
  const label = settings.clientPrivacy ? (at: LatLng) => privateLabelFor(at, settings.region) : labelFor;
  const [startLabel, endLabel] = await Promise.all([
    startPlace?.name ?? label(trip.start),
    endPlace?.name ?? label(trip.end),
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
    { history, places, workHours: settings.workHoursEnabled ? settings.workWeek : null },
  );
  const sorted = autoClassify({
    inShift: shift !== null,
    suggestion,
    shiftMode: settings.shiftMode,
    defaultBusiness: settings.defaultBusiness,
  });
  await insertTrip(
    db,
    {
      startedAt: started.toISOString(),
      // The date where the drive started, not where the phone is when it's saved.
      localDate: isoDateAtOffset(trip.startedAt, trip.utcOffsetMin),
      endedAt: new Date(trip.endedAt).toISOString(),
      startLabel,
      endLabel,
      distanceMeters: trip.distanceMeters,
      classification: sorted.classification,
      // Business without a learned purpose stays empty; the trip list asks for one.
      purpose: sorted.purpose,
      source: 'auto',
      startPlaceId: startPlace?.id ?? null,
      endPlaceId: endPlace?.id ?? null,
      // A shift is stored as the work-hours rule (working time); shiftId tells them apart.
      autoReason: sorted.reason,
      vehicle: settings.vehicle,
      vehicleId: settings.currentVehicleId,
      shiftId: shift?.id ?? null,
    },
    // Client privacy keeps no route at all: it would lead straight to the client's door.
    settings.clientPrivacy ? [] : trip.route,
  );
  // Keep the opening animation's total current for the next launch.
  await refreshLaunchTotal(db).catch(() => {});
}

/** What iOS says about location access and MileMint's tasks right now. */
export async function readTrackingPermissions(): Promise<TrackingPermissions> {
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = foreground.granted ? await Location.getBackgroundPermissionsAsync() : null;
  const [geofence, gps] = await Promise.all([
    Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(() => null),
    Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => null),
  ]);
  return {
    foreground: foreground.granted,
    background: background?.granted ?? false,
    precise: foreground.ios?.accuracy ? foreground.ios.accuracy === 'full' : null,
    tasks: geofence === null || gps === null ? null : { geofence, gps },
  };
}

/** Background checks are cheap but not free: at most this often while woken. */
const WAKE_CHECK_EVERY_MS = 15 * 60_000;
let lastWakeCheck = 0;

/**
 * After a background wake-up: a drive in progress keeps a "tracking may have
 * stopped" notification queued just past the point it would be overdue, so if
 * iOS kills the app mid-drive the driver still hears about it. Now and then,
 * also checks for a setting that silently loses drives (Precise Location off).
 */
async function afterWake(record: TrackerRecord, now: number, driveEnded: boolean): Promise<TrackerRecord> {
  let next = record;
  try {
    if (driveEnded || next.mode !== 'gps') next = await cancelHealthAlerts(next, now, ['stale']);
    else next = await armDriveWatchdog(next, now);
    if (now - lastWakeCheck >= WAKE_CHECK_EVERY_MS) {
      lastWakeCheck = now;
      // Just woken by a task, so the tasks themselves are fine.
      const permissions = { ...(await readTrackingPermissions()), tasks: null };
      const { issue } = trackingHealth(next, permissions, now);
      if (issue !== 'stale' && alertWorthy(issue, next)) next = await queueHealthAlert(next, issue, now, now);
    }
  } catch (error) {
    console.warn('[tracking] health', error);
  }
  return next;
}

async function handleLocations(samples: LocationSample[]): Promise<void> {
  const db = await getBackgroundDatabase();
  const record = await loadTrackerRecord(db);
  const now = Date.now();
  const decision = onLocations(record, samples, now);
  for (const trip of decision.completed) await saveDetectedTrip(db, trip);
  await saveTrackerRecord(db, await afterWake(decision.record, now, decision.switchToGeofenceAt !== null));
  if (decision.switchToGeofenceAt) {
    await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
    await armGeofence(decision.switchToGeofenceAt);
  }
}

async function handleGeofenceExit(): Promise<void> {
  const db = await getBackgroundDatabase();
  const record = await loadTrackerRecord(db);
  const now = Date.now();
  const next = onGeofenceExit(record, now);
  if (next === record) return;
  await saveTrackerRecord(db, await afterWake(next, now, false));
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
    const background = await Location.requestBackgroundPermissionsAsync();
    // The answer can come back while iOS's question is still on screen: keep
    // the coaching up ("Tap Change to Always Allow") until it's really answered.
    if (!background.granted && Platform.OS === 'ios') {
      await waitForPromptAnswer({
        appState: AppState,
        answered: async () => (await Location.getBackgroundPermissionsAsync()).granted,
      });
    }
  }
  return getTrackingStatus(db);
}

/** Turns automatic logging on: arms a geofence where the phone is now. */
export async function startTracking(db: SQLiteDatabase): Promise<void> {
  if (!TRACKING_SUPPORTED) return;
  const here = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  await serial(async () => {
    // The phone is where the car is parked, so the first drive starts from here.
    // Gaps still to fill and today's alerts survive switching tracking back on.
    const previous = await loadTrackerRecord(db);
    await saveTrackerRecord(db, { ...parkedAt(here.coords, Date.now()), gaps: previous.gaps, alerts: previous.alerts });
    await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
    await armGeofence(here.coords);
  });
}

export async function stopTracking(db: SQLiteDatabase): Promise<void> {
  if (!TRACKING_SUPPORTED) return;
  await serial(async () => {
    // Switched off on purpose: nothing to warn about any more.
    const record = await loadTrackerRecord(db);
    await cancelHealthAlerts(record, Date.now()).catch(() => record);
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
      // Where the phone is now, first: if iOS killed the app mid-drive, the
      // last fix can be far behind. The detector decides whether the drive
      // carried on or ended back there, and tracking restarts from here
      // rather than from a stale point that would look like a jump.
      const here = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        .then(toSample)
        .catch(() => null);
      const decision = onReconcile(record, here, Date.now());
      for (const trip of decision.completed) await saveDetectedTrip(db, trip);
      await saveTrackerRecord(db, decision.record);
      if (decision.switchToGeofenceAt) {
        await stopTask(LOCATION_TASK, Location.hasStartedLocationUpdatesAsync, Location.stopLocationUpdatesAsync);
        await armGeofence(decision.switchToGeofenceAt);
      } else if (!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))) {
        await startGps();
      }
    } else {
      // Parked. A recent fix iOS already has (no GPS spin-up) shows whether the
      // phone left the geofence without it ever firing: a drive may be missing.
      const recent = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000, requiredAccuracy: 100 })
        .then((fix) => (fix ? toSample(fix) : null))
        .catch(() => null);
      const decision = onReconcileParked(record, recent, Date.now());
      if (decision.switchToGeofenceAt) {
        await saveTrackerRecord(db, decision.record);
        await armGeofence(decision.switchToGeofenceAt);
      } else if (!(await Location.hasStartedGeofencingAsync(GEOFENCE_TASK))) {
        const here = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await armGeofence(here.coords);
      }
    }
  });
}

/**
 * Is tracking really working? Null where there is no tracking (the web
 * preview). Waits its turn behind a reconcile, so a geofence being re-armed
 * isn't mistaken for one that's gone.
 */
export async function getTrackingHealth(db: SQLiteDatabase): Promise<TrackingHealth | null> {
  if (!TRACKING_SUPPORTED) return null;
  return inQueue(async () => trackingHealth(await loadTrackerRecord(db), await readTrackingPermissions(), Date.now()));
}

/** Changes the tracker record in its turn, so it can't overwrite a background update. */
export function updateTrackerRecord(
  db: SQLiteDatabase,
  change: (record: TrackerRecord) => TrackerRecord | Promise<TrackerRecord>,
): Promise<void> {
  return inQueue(async () => {
    const record = await loadTrackerRecord(db);
    const next = await change(record);
    if (next !== record) await saveTrackerRecord(db, next);
  });
}

/** The missed trip was added, or the user says it wasn't a drive. */
export function dismissTrackingGap(db: SQLiteDatabase, id: string): Promise<void> {
  return updateTrackerRecord(db, (record) => dismissGap(record, id));
}
