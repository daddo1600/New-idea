import type { SQLiteDatabase } from 'expo-sqlite';

import { loadSettings } from '@/db/settings-repo';
import { listTrips } from '@/db/trips-repo';
import { marApplies } from '@/domain/mar';
import { canUse } from '@/domain/plan';
import { REGIONS } from '@/domain/regions';
import { shortcutsSnapshot } from '@/domain/shortcuts-snapshot';
import { t } from '@/i18n/i18n';

import { SiriShortcuts } from '../../modules/siri-shortcuts';

/**
 * Pro as the App Store last said, passed on by ShortcutsSync once known.
 * Null in a process that hasn't heard yet (the background tracker woken
 * with the app closed): the summary keeps the Pro status it had.
 */
let proStatus: boolean | null = null;

export function setShortcutsPro(isPro: boolean): void {
  proStatus = isPro;
}

/** The Pro status in the summary written last, if it says. */
function previousPro(): boolean | null {
  const json = SiriShortcuts.getSnapshot();
  if (!json) return null;
  try {
    const isPro = (JSON.parse(json) as { isPro?: unknown }).isPro;
    return typeof isPro === 'boolean' ? isPro : null;
  } catch {
    return null;
  }
}

async function write(db: SQLiteDatabase): Promise<void> {
  const settings = await loadSettings(db);
  if (!settings.onboarded || !settings.region) {
    // Not set up (or set up again from scratch): Siri asks to open the app first.
    SiriShortcuts.clearSnapshot();
    return;
  }
  const region = REGIONS[settings.region];
  const trips = await listTrips(db);
  const isPro = proStatus ?? previousPro() ?? false;
  const snapshot = shortcutsSnapshot(
    {
      trips,
      region,
      now: new Date(),
      isPro: canUse('siri', { isPro, perks: settings.perksEarned }),
      employee: settings.employment === 'employee' && marApplies(region),
      employerRate: settings.employerRate,
    },
    t,
  );
  SiriShortcuts.setSnapshot(JSON.stringify(snapshot));
}

/** One write at a time, in order. */
let queue: Promise<void> = Promise.resolve();
/** A write waiting its turn: it reads everything when it starts, so later asks can share it. */
let waiting: Promise<void> | null = null;

/**
 * Brings the summary Siri answers from up to date: after drives are saved or
 * sorted, a shift starts or ends, Pro, the language or the country changes.
 * Cheap to call often (asks while one is waiting share it). Never throws.
 */
export function refreshShortcutsSnapshot(db: SQLiteDatabase): Promise<void> {
  if (!SiriShortcuts.supported) return Promise.resolve();
  if (waiting) return waiting;
  const run = queue.then(() => {
    waiting = null;
    return write(db);
  });
  queue = run.catch((error) => console.warn('[shortcuts]', error));
  waiting = queue;
  return queue;
}
