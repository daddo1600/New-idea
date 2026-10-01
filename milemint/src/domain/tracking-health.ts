import type { AlertLog, TrackerRecord, TrackingGap } from './tracker-policy';

/**
 * Is automatic tracking really working? MileMint promises "you'll know if a
 * mile was missed", so every way tracking can quietly stop has a name here,
 * and the home card, Settings and notifications all read it from this one
 * pure check.
 *
 * Deliberately conservative: a parked car can be silent for days, and that's
 * normal. Silence only counts as a problem when there's evidence something
 * should have happened (GPS stopped mid-drive), and the phone turning up far
 * from where tracking last saw it is recorded as a gap by the tracker itself.
 *
 * Not checked, because nothing installed can tell: Low Power Mode (needs
 * expo-battery) and Background App Refresh (expo-task-manager always reports
 * it as available). Neither stops geofences or location updates on iOS.
 */
export type HealthIssue =
  | 'ok'
  /** The user switched tracking off (or never set it up): not a fault. */
  | 'off'
  /** No location access at all (also what iOS reports when Location Services are off). */
  | 'needs-permission'
  /** "While Using" only: drives are missed while the app is closed. */
  | 'needs-always'
  /** Approximate location: fixes are kilometres wide and no drive can be measured. */
  | 'precise-location-off'
  /** On, but neither the geofence nor GPS is registered with iOS: nothing will wake the app. */
  | 'tracking-stopped'
  /** A drive was being logged but GPS has gone quiet for far longer than it ever should. */
  | 'stale'
  /** Tracking lost the phone for a while and a drive may be missing. */
  | 'gap';

/** What the phone says right now. `null` where it can't be known (the web preview). */
export type TrackingPermissions = {
  foreground: boolean;
  background: boolean;
  /** iOS 14+ Precise Location; null when not reported. */
  precise: boolean | null;
  /** Which background tasks iOS has registered; null when unknown. */
  tasks: { geofence: boolean; gps: boolean } | null;
};

export type HealthSettings = {
  /** In GPS mode fixes arrive every few seconds, even parked: this much silence means they stopped (ms). */
  staleGpsMs: number;
  /** Gaps older than this aren't offered any more (ms). */
  gapWindowMs: number;
};

export const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  staleGpsMs: 30 * 60_000,
  gapWindowMs: 14 * 86_400_000,
};

export type TrackingHealth = {
  issue: HealthIssue;
  /** The newest gap still worth filling, whatever the issue. */
  gap: TrackingGap | null;
  /** When tracking last had a location (epoch ms), if ever. */
  lastSeenAt: number | null;
};

/** The newest gap that hasn't been filled or dismissed, within the window. */
export function openGap(
  record: TrackerRecord,
  now: number,
  settings: HealthSettings = DEFAULT_HEALTH_SETTINGS,
): TrackingGap | null {
  const gaps = (record.gaps ?? []).filter((gap) => !gap.dismissed && now - gap.toAt <= settings.gapWindowMs);
  return gaps.length > 0 ? gaps.reduce((a, b) => (b.toAt > a.toAt ? b : a)) : null;
}

export function trackingHealth(
  record: TrackerRecord,
  permissions: TrackingPermissions,
  now: number,
  settings: HealthSettings = DEFAULT_HEALTH_SETTINGS,
): TrackingHealth {
  const gap = record.enabled ? openGap(record, now, settings) : null;
  const lastSeenAt = record.lastSeenAt ?? null;
  const result = (issue: HealthIssue): TrackingHealth => ({ issue, gap, lastSeenAt });

  if (!permissions.foreground) return result('needs-permission');
  if (!permissions.background) return result('needs-always');
  if (!record.enabled) return result('off');
  if (permissions.precise === false) return result('precise-location-off');

  const tasks = permissions.tasks;
  if (tasks) {
    const armed = record.mode === 'geofence' ? tasks.geofence : tasks.gps || tasks.geofence;
    if (!armed) return result('tracking-stopped');
  }

  if (record.mode === 'gps') {
    const heard = Math.max(record.gpsSince ?? 0, lastSeenAt ?? 0);
    if (heard > 0 && now - heard >= settings.staleGpsMs) return result('stale');
  }

  return result(gap ? 'gap' : 'ok');
}

/** Issues worth a notification when the app isn't open: things that silently lose drives. */
export function alertWorthy(issue: HealthIssue, record: TrackerRecord): boolean {
  switch (issue) {
    case 'needs-permission':
    case 'needs-always':
      // Only a downgrade: someone who never switched tracking on isn't nagged.
      return record.enabled;
    case 'precise-location-off':
    case 'tracking-stopped':
    case 'stale':
      return true;
    default:
      return false;
  }
}

/** The phone's local date, YYYY-MM-DD. */
export function localDay(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * At most one notification per issue per day. One already queued for later
 * (`at` in the future) can be moved; one that has gone off today can't be
 * repeated.
 */
export function mayAlert(log: AlertLog | undefined, issue: string, at: number, now: number): boolean {
  const last = log?.[issue];
  if (last === undefined) return true;
  if (last > now) return true;
  return localDay(last) !== localDay(at);
}

export function logAlert(log: AlertLog | undefined, issue: string, at: number): AlertLog {
  return { ...log, [issue]: at };
}

/** Alerts queued for later that haven't gone off yet. */
export function pendingAlerts(log: AlertLog | undefined, now: number): string[] {
  return Object.entries(log ?? {})
    .filter(([, at]) => at !== undefined && at > now)
    .map(([issue]) => issue);
}

/** Forgets alerts that were queued but cancelled before going off, so they don't count for today. */
export function forgetPending(log: AlertLog | undefined, now: number, issues?: readonly string[]): AlertLog {
  const next: AlertLog = {};
  for (const [issue, at] of Object.entries(log ?? {})) {
    if (at !== undefined && !(at > now && (!issues || issues.includes(issue)))) next[issue] = at;
  }
  return next;
}
