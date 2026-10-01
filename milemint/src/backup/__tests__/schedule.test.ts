import { describe, expect, it } from '@jest/globals';

import { backupAge, backupDecision, fingerprintSource, shouldWrite, type BackupState } from '../schedule';

const HOUR = 60 * 60 * 1000;
const now = new Date('2026-10-01T12:00:00Z');
const lastAt = (hoursAgo: number): BackupState => ({
  at: new Date(now.getTime() - hoursAgo * HOUR).toISOString(),
  fingerprint: 'abc',
});

describe('backupDecision', () => {
  it('backs up straight away when there has never been a backup', () => {
    expect(backupDecision(now, null)).toBe('always');
    expect(backupDecision(now, { at: 'garbage', fingerprint: 'abc' })).toBe('always');
  });

  it('waits a day between backups', () => {
    expect(backupDecision(now, lastAt(1))).toBe('skip');
    expect(backupDecision(now, lastAt(23.9))).toBe('skip');
  });

  it('after a day, backs up only if something changed', () => {
    expect(backupDecision(now, lastAt(24))).toBe('if-changed');
    expect(backupDecision(now, lastAt(6 * 24))).toBe('if-changed');
  });

  it('backs up at least weekly, changed or not', () => {
    expect(backupDecision(now, lastAt(7 * 24))).toBe('always');
    expect(backupDecision(now, lastAt(40 * 24))).toBe('always');
  });

  it('does not stall when the clock went backwards', () => {
    expect(backupDecision(now, lastAt(-48))).toBe('if-changed');
  });
});

describe('shouldWrite', () => {
  const last = lastAt(30);

  it('writes when the data changed', () => {
    expect(shouldWrite({ decision: 'if-changed', fingerprint: 'new', last, trips: 3 })).toBe(true);
  });

  it('skips when nothing changed, unless the weekly backup is due', () => {
    expect(shouldWrite({ decision: 'if-changed', fingerprint: 'abc', last, trips: 3 })).toBe(false);
    expect(shouldWrite({ decision: 'always', fingerprint: 'abc', last, trips: 3 })).toBe(true);
  });

  it('never writes when not due', () => {
    expect(shouldWrite({ decision: 'skip', fingerprint: 'new', last, trips: 3 })).toBe(false);
  });

  it('never writes an empty log over real backups (a new phone before restoring)', () => {
    expect(shouldWrite({ decision: 'always', fingerprint: 'new', last: null, trips: 0 })).toBe(false);
  });
});

describe('fingerprintSource', () => {
  const base = {
    schemaVersion: 7,
    small: { trips: [{ id: 't1', classification: 'business' }], places: [] },
    routes: { count: 1, size: 120 },
    edits: { count: 2, lastId: 2 },
  };

  it('does not depend on the order tables were read in', () => {
    const reordered = { ...base, small: { places: [], trips: base.small.trips } };
    expect(fingerprintSource(reordered)).toBe(fingerprintSource(base));
  });

  it('changes with a reclassified trip, a new edit or a new route', () => {
    const same = fingerprintSource(base);
    expect(fingerprintSource({ ...base, small: { ...base.small, trips: [{ id: 't1', classification: 'personal' }] } })).not.toBe(same);
    expect(fingerprintSource({ ...base, edits: { count: 3, lastId: 3 } })).not.toBe(same);
    expect(fingerprintSource({ ...base, routes: { count: 2, size: 240 } })).not.toBe(same);
  });
});

describe('backupAge', () => {
  it('rounds down to the largest whole unit', () => {
    expect(backupAge(new Date(now.getTime() - 20_000), now)).toEqual({ unit: 'now', count: 0 });
    expect(backupAge(new Date(now.getTime() - 5 * 60_000), now)).toEqual({ unit: 'minutes', count: 5 });
    expect(backupAge(new Date(now.getTime() - 3.5 * HOUR), now)).toEqual({ unit: 'hours', count: 3 });
    expect(backupAge(new Date(now.getTime() - 50 * HOUR), now)).toEqual({ unit: 'days', count: 2 });
  });
});
