import { FOUNDING_TESTER_ENDS } from '@/constants/rewards';
import { PERK_LADDER, type Perk } from '@/domain/plan';
import { toLocalIsoDate } from '@/domain/trip';

import type { InstallSignals } from '../../modules/install-source';

/**
 * Founding testers (decisions.md, 3 Oct 2026, option 2a): a TestFlight
 * install opened before launch day earns the Founding driver badge. Like
 * every perk it's kept for good in settings, so it carries over to the App
 * Store version (installed over TestFlight, the data stays) and travels in
 * the iCloud backup. It unlocks no Pro feature (domain/plan PERK_FEATURES).
 */

/** What's known about this copy of the app, to tell whether it came from TestFlight. */
export type InstallFacts = {
  /** A development build (__DEV__): never a tester. */
  dev: boolean;
  /** The web demo asked to play a tester (`&tester`). */
  demoTester: boolean;
  /** From modules/install-source; null where it's missing (web, Jest, Android). */
  signals: InstallSignals | null;
  /** StoreKit 2's AppTransaction environment ("Sandbox", "Production", "Xcode"), or null if it couldn't say. */
  environment: string | null;
};

/**
 * Whether this is a TestFlight install. Only ever true for a build Apple
 * signed (no provisioning profile, not the Simulator, not a development
 * build) whose AppTransaction is in the sandbox; when StoreKit can't say,
 * the receipt's name ("sandboxReceipt") decides. An App Store install is
 * "Production" with a receipt named "receipt", so it's never marked.
 */
export function isTestFlight({ dev, demoTester, signals, environment }: InstallFacts): boolean {
  if (demoTester) return true;
  if (dev || !signals || signals.simulator || signals.provisioned) return false;
  if (environment) return environment.toLowerCase() === 'sandbox';
  return signals.receiptName === 'sandboxReceipt';
}

/** Whether a tester can still earn the badge: before launch day, on the user's own calendar. */
export function foundingTesterOpen(now: Date, ends = FOUNDING_TESTER_ENDS): boolean {
  return toLocalIsoDate(now) < ends;
}

/** `kept` with the Founding driver badge added, in ladder order; null if it's already there. */
export function withFoundingBadge(kept: readonly Perk[]): Perk[] | null {
  if (kept.includes('founding-badge')) return null;
  return PERK_LADDER.map((step) => step.perk).filter((perk) => perk === 'founding-badge' || kept.includes(perk));
}

/** The perks to save for a founding tester, or null when there's nothing new (not a tester, too late, or already kept). */
export function foundingTesterPerks(
  kept: readonly Perk[],
  { testFlight, now, ends = FOUNDING_TESTER_ENDS }: { testFlight: boolean; now: Date; ends?: string },
): Perk[] | null {
  if (!testFlight || !foundingTesterOpen(now, ends)) return null;
  return withFoundingBadge(kept);
}
