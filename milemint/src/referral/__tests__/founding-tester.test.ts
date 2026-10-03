import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import { FOUNDING_BOOST_ENDS, FOUNDING_TESTER_ENDS } from '@/constants/rewards';
import { DEFAULT_SETTINGS, parseSettings } from '@/db/settings-repo';
import { canUse, earnedPerks, type ProFeature } from '@/domain/plan';

import {
  foundingTesterOpen,
  foundingTesterPerks,
  isTestFlight,
  withFoundingBadge,
  type InstallFacts,
} from '../founding-tester';

const ENDS = '2026-11-15';
/** Midday, so the user's local date is the same day in any time zone the tests run in. */
const day = (iso: string) => new Date(`${iso}T12:00:00`);
const BEFORE = day('2026-11-14');

/** A TestFlight install: Apple-signed, receipt is sandboxReceipt. */
const testFlight: InstallFacts = {
  dev: false,
  demoTester: false,
  signals: { receiptName: 'sandboxReceipt', provisioned: false, simulator: false },
};
/** An App Store install. */
const appStore: InstallFacts = {
  dev: false,
  demoTester: false,
  signals: { receiptName: 'receipt', provisioned: false, simulator: false },
};

describe('isTestFlight', () => {
  it('is true for a TestFlight install', () => {
    expect(isTestFlight(testFlight)).toBe(true);
  });

  it('never marks an App Store install, or one with no receipt', () => {
    expect(isTestFlight(appStore)).toBe(false);
    expect(isTestFlight({ ...appStore, signals: { ...appStore.signals!, receiptName: '' } })).toBe(false);
  });

  it('never asks StoreKit, which can show an Apple Account sign-in at launch', () => {
    for (const file of ['../founding-tester.ts', '../referral.tsx']) {
      const source = readFileSync(join(__dirname, file), 'utf8');
      expect(source).not.toMatch(/getAppTransactionIOS|appEnvironment|@\/purchases\/store/);
    }
  });

  it('is false in development, the Simulator, ad hoc builds and without the native module', () => {
    expect(isTestFlight({ ...testFlight, dev: true })).toBe(false);
    expect(isTestFlight({ ...testFlight, signals: { ...testFlight.signals!, simulator: true } })).toBe(false);
    expect(isTestFlight({ ...testFlight, signals: { ...testFlight.signals!, provisioned: true } })).toBe(false);
    expect(isTestFlight({ ...testFlight, signals: null })).toBe(false);
  });

  it('is true in the web demo only when it asks to play a tester', () => {
    expect(isTestFlight({ dev: true, demoTester: true, signals: null })).toBe(true);
    expect(isTestFlight({ dev: true, demoTester: false, signals: null })).toBe(false);
  });
});

describe('foundingTesterOpen', () => {
  it('is open before launch day and closed from launch day on', () => {
    expect(foundingTesterOpen(BEFORE, ENDS)).toBe(true);
    expect(foundingTesterOpen(day(ENDS), ENDS)).toBe(false);
    expect(foundingTesterOpen(day('2027-03-01'), ENDS)).toBe(false);
  });

  it('has a launch day set as an ISO date', () => {
    expect(FOUNDING_TESTER_ENDS).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('foundingTesterPerks', () => {
  it('gives a TestFlight install before launch day the badge', () => {
    expect(foundingTesterPerks([], { testFlight: true, now: BEFORE, ends: ENDS })).toEqual(['founding-badge']);
  });

  it('keeps perks already earned, in ladder order', () => {
    expect(foundingTesterPerks(['tax-set-aside'], { testFlight: true, now: BEFORE, ends: ENDS })).toEqual([
      'tax-set-aside',
      'founding-badge',
    ]);
  });

  it('gives nothing from launch day on', () => {
    expect(foundingTesterPerks([], { testFlight: true, now: day(ENDS), ends: ENDS })).toBeNull();
    expect(foundingTesterPerks([], { testFlight: true, now: day('2027-06-01'), ends: ENDS })).toBeNull();
  });

  it('gives nothing to an install that isn’t TestFlight', () => {
    expect(foundingTesterPerks([], { testFlight: false, now: BEFORE, ends: ENDS })).toBeNull();
    expect(
      foundingTesterPerks([], { testFlight: isTestFlight(appStore), now: BEFORE, ends: ENDS }),
    ).toBeNull();
  });

  it('is idempotent: a second launch adds nothing', () => {
    const first = foundingTesterPerks([], { testFlight: true, now: BEFORE, ends: ENDS });
    expect(first).toEqual(['founding-badge']);
    expect(foundingTesterPerks(first!, { testFlight: true, now: BEFORE, ends: ENDS })).toBeNull();
    expect(withFoundingBadge(first!)).toBeNull();
  });

  it('unlocks no Pro feature', () => {
    const perks = foundingTesterPerks([], { testFlight: true, now: BEFORE, ends: ENDS })!;
    const features: ProFeature[] = [
      'reports',
      'accountant',
      'quarterly',
      'platform-earnings',
      'tax-set-aside',
      'import',
      'weekly-recap',
      'siri',
    ];
    for (const feature of features) expect(canUse(feature, { isPro: false, perks })).toBe(false);
  });
});

describe('the badge is kept for good', () => {
  const awarded = foundingTesterPerks([], { testFlight: true, now: BEFORE, ends: ENDS })!;

  it('survives a backup and restore (the settings round trip)', () => {
    const restored = parseSettings(JSON.stringify({ ...DEFAULT_SETTINGS, perksEarned: awarded }));
    expect(restored.perksEarned).toEqual(['founding-badge']);
  });

  it('stays after launch day and after the founding boost ends, with no friends', () => {
    const later = new Date(`${FOUNDING_BOOST_ENDS}T12:00:00`);
    later.setFullYear(later.getFullYear() + 1);
    expect(earnedPerks(0, later, awarded)).toEqual(['founding-badge']);
  });

  it('is put back after restoring a backup from before it was earned (this iPhone remembers)', () => {
    const restored = parseSettings(JSON.stringify({ ...DEFAULT_SETTINGS, perksEarned: ['tax-set-aside'] }));
    expect(withFoundingBadge(restored.perksEarned)).toEqual(['tax-set-aside', 'founding-badge']);
  });
});
