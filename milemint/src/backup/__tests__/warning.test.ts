import { describe, expect, it } from '@jest/globals';

import { backupWarning, NEVER_BACKED_UP_DAYS, STALE_BACKUP_DAYS } from '../warning';

const now = new Date('2026-10-20T12:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
const base = {
  supported: true,
  available: true,
  lastAt: daysAgo(1),
  failure: null,
  trips: 12,
  oldestTripAt: daysAgo(30).toISOString(),
  now,
};

describe('backupWarning', () => {
  it('is quiet when backups are working, without iCloud backup, while checking, or with no trips', () => {
    expect(backupWarning(base)).toBeNull();
    expect(backupWarning({ ...base, supported: false, available: false })).toBeNull();
    expect(backupWarning({ ...base, available: null })).toBeNull();
    expect(backupWarning({ ...base, available: false, trips: 0 })).toBeNull();
  });

  it('warns when iCloud is off for MileSprout', () => {
    expect(backupWarning({ ...base, available: false })).toBe('off');
  });

  it('warns about a failure only until a backup works again', () => {
    const failure = { at: daysAgo(0.5).toISOString(), step: 'write' as const, code: 'ERR_TIMEOUT' };
    expect(backupWarning({ ...base, failure })).toBe('failing');
    expect(backupWarning({ ...base, failure, lastAt: daysAgo(0.1) })).toBeNull();
    expect(backupWarning({ ...base, failure, lastAt: null })).toBe('failing');
  });

  it('gives a new install a few days before saying it has never backed up', () => {
    expect(backupWarning({ ...base, lastAt: null, oldestTripAt: daysAgo(NEVER_BACKED_UP_DAYS - 1).toISOString() })).toBeNull();
    expect(backupWarning({ ...base, lastAt: null, oldestTripAt: daysAgo(NEVER_BACKED_UP_DAYS).toISOString() })).toBe('never');
  });

  it('warns once backups have stopped for a fortnight', () => {
    expect(backupWarning({ ...base, lastAt: daysAgo(STALE_BACKUP_DAYS - 1) })).toBeNull();
    expect(backupWarning({ ...base, lastAt: daysAgo(STALE_BACKUP_DAYS) })).toBe('stale');
  });
});
