import * as Notifications from 'expo-notifications';

import type { TrackerRecord } from '@/domain/tracker-policy';
import {
  DEFAULT_HEALTH_SETTINGS,
  forgetPending,
  logAlert,
  mayAlert,
  pendingAlerts,
  type HealthIssue,
} from '@/domain/tracking-health';
import { msg, t } from '@/i18n/i18n';
import { REMINDERS_SUPPORTED } from '@/reminders/weekly';

/**
 * Local notifications for tracking that stopped while the app isn't open.
 * Never asks for notification permission (only uses it if already given),
 * and never more than once per issue per day: the log lives in the tracker
 * record, and every function here takes a record and returns the updated one
 * for the caller to save in its turn.
 */

const ID_PREFIX = 'milemint-health-';

const ALERTS: Partial<Record<HealthIssue, { title: string; body: string; url: string }>> = {
  'needs-permission': {
    title: msg('Automatic tracking is off'),
    body: msg('Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on.'),
    url: '/setup-tracking',
  },
  'needs-always': {
    title: msg('Drives may be missed'),
    body: msg('Location is set to “While Using”. Switch it to “Always” so drives are logged when the app is closed.'),
    url: '/setup-tracking',
  },
  'precise-location-off': {
    title: msg('Precise Location is off'),
    body: msg('Drives can’t be measured from a rough position. Tap to fix it.'),
    url: '/',
  },
  'tracking-stopped': {
    title: msg('Tracking has stopped'),
    body: msg('New drives aren’t being logged. Tap to turn tracking back on.'),
    url: '/',
  },
};

/** How long after the last fix a drive in progress counts as lost. */
const WATCHDOG_MS = DEFAULT_HEALTH_SETTINGS.staleGpsMs;
/** The queued watchdog is only moved when it would go off this much too early. */
const WATCHDOG_SLACK_MS = 5 * 60_000;

async function allowed(): Promise<boolean> {
  if (!REMINDERS_SUPPORTED) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

async function schedule(issue: string, content: Notifications.NotificationContentInput, at: number, now: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: `${ID_PREFIX}${issue}`,
    content,
    trigger:
      at > now + 1000 ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) } : null,
  });
}

/** Tells the driver about `issue` at `at` (now, or later if they may still fix it), once a day at most. */
export async function queueHealthAlert(
  record: TrackerRecord,
  issue: HealthIssue,
  at: number,
  now: number,
): Promise<TrackerRecord> {
  const alert = ALERTS[issue];
  if (!alert || !mayAlert(record.alerts, issue, at, now) || !(await allowed())) return record;
  await schedule(issue, { title: t(alert.title), body: t(alert.body), data: { url: alert.url } }, at, now);
  return { ...record, alerts: logAlert(record.alerts, issue, at) };
}

/** Cancels queued alerts that haven't gone off (all, or just `issues`), so they don't count for today. */
export async function cancelHealthAlerts(
  record: TrackerRecord,
  now: number,
  issues?: readonly string[],
): Promise<TrackerRecord> {
  const pending = pendingAlerts(record.alerts, now).filter((issue) => !issues || issues.includes(issue));
  if (pending.length === 0) return record;
  if (REMINDERS_SUPPORTED) {
    await Promise.all(pending.map((issue) => Notifications.cancelScheduledNotificationAsync(`${ID_PREFIX}${issue}`)));
  }
  return { ...record, alerts: forgetPending(record.alerts, now, pending) };
}

/**
 * During a drive: keeps "tracking may have stopped" queued for half an hour
 * after the latest fix. Each batch of fixes pushes it back; the drive ending
 * cancels it. If iOS kills the app mid-drive, nothing pushes it back and it
 * goes off.
 */
export async function armDriveWatchdog(record: TrackerRecord, now: number): Promise<TrackerRecord> {
  const heard = Math.max(record.lastSeenAt ?? 0, record.gpsSince ?? 0) || now;
  const at = heard + WATCHDOG_MS;
  const queued = record.alerts?.stale;
  if (queued !== undefined && queued > now && at - queued < WATCHDOG_SLACK_MS) return record;
  if (!mayAlert(record.alerts, 'stale', at, now) || !(await allowed())) return record;
  const time = new Date(heard).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  await schedule(
    'stale',
    {
      title: t('Tracking may have stopped'),
      body: t('No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up.', { time }),
      data: { url: '/' },
    },
    at,
    now,
  );
  return { ...record, alerts: logAlert(record.alerts, 'stale', at) };
}
