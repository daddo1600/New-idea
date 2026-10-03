import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { noteScrubbed, pendingScrub } from '../after-scrub';
import { backUp, BackupStepError, loadBackupFailure, restoreSnapshot, STEP_TIMEOUT_MS } from '../backup';
import { emptyTables, makeSnapshot, SNAPSHOT_VERSION } from '../snapshot';

const writes: { name: string; keep: number }[] = [];
const log: string[] = [];

// jest-expo's own mock keeps nothing.
jest.mock('expo-secure-store', () => {
  const values = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK: 0,
    getItemAsync: async (key: string) => values.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => void values.set(key, value),
    deleteItemAsync: async (key: string) => void values.delete(key),
  };
});

jest.mock('../../../modules/icloud-backup', () => ({
  ICloudBackup: {
    supported: true,
    isAvailable: async () => true,
    seal: async (base64: string) => base64,
    write: async (name: string, _base64: string, keep: number) => {
      writes.push({ name, keep });
    },
  },
}));

/** A fake connection with one trip, logging the transactions it sees. */
function fakeDb() {
  const tick = () => new Promise((resolve) => setTimeout(resolve, 1));
  return {
    getAllAsync: async (sql: string) => {
      await tick();
      if (sql.startsWith('PRAGMA table_info')) return [{ name: 'id' }];
      return sql.includes('FROM trips') ? [{ id: 't1' }] : [];
    },
    getFirstAsync: async () => ({ count: 0, size: 0, lastId: 0 }),
    execAsync: async (sql: string) => {
      log.push(sql);
      await tick();
    },
    prepareAsync: async () => ({ executeAsync: async () => {}, finalizeAsync: async () => {} }),
    withTransactionAsync: async (task: () => Promise<void>) => task(),
  };
}

beforeEach(() => {
  writes.length = 0;
  log.length = 0;
});

describe('backUp', () => {
  it('reads every table in one read transaction', async () => {
    await backUp(fakeDb() as never, { force: true });
    expect(log).toEqual(['BEGIN DEFERRED;', 'COMMIT;']);
    expect(writes).toHaveLength(1);
  });

  it('after a scrub, replaces every older backup straight away', async () => {
    const db = fakeDb() as never;
    await backUp(db, { force: true });
    writes.length = 0;
    await noteScrubbed();
    // Not due by the schedule (a backup was just written), but the older ones still have addresses.
    expect(await backUp(db)).toBe('written');
    // Two copies with keep 1: the native side keeps the newest two, so nothing older survives.
    expect(writes.map((write) => write.keep)).toEqual([1, 1]);
    expect(new Set(writes.map((write) => write.name)).size).toBe(2);
    expect(await pendingScrub()).toBeNull();
    // And back to the usual schedule afterwards.
    expect(await backUp(db)).toBe('not-due');
  });

  it('never runs at the same time as a restore', async () => {
    const db = fakeDb() as never;
    const snapshot = makeSnapshot({ ...emptyTables(), trips: [{ id: 't1' }] }, { appVersion: '1', createdAt: new Date() });
    await Promise.all([backUp(db, { force: true }), restoreSnapshot(db, snapshot), backUp(db, { force: true })]);
    // Each transaction ends before the next begins.
    const begins = log.map((sql, index) => [sql, index] as const).filter(([sql]) => sql.startsWith('BEGIN'));
    for (const [, index] of begins.slice(1)) expect(['COMMIT;', 'ROLLBACK;']).toContain(log[index - 1]);
    expect(log.filter((sql) => sql.startsWith('BEGIN'))).toEqual(['BEGIN DEFERRED;', 'BEGIN IMMEDIATE;', 'BEGIN DEFERRED;']);
  });

  it('hands the native module the snapshot as text when it takes text, as base64 otherwise', async () => {
    const native = (jest.requireMock('../../../modules/icloud-backup') as { ICloudBackup: Record<string, unknown> })
      .ICloudBackup;
    const texts: string[] = [];
    const sealed: string[] = [];
    const seal = native.seal;
    Object.assign(native, {
      sealsText: true,
      sealText: async (text: string) => (texts.push(text), 'sealed'),
      seal: async (base64: string) => (sealed.push(base64), base64),
    });
    try {
      await backUp(fakeDb() as never, { force: true });
      native.sealsText = false;
      await backUp(fakeDb() as never, { force: true });
    } finally {
      Object.assign(native, { sealsText: false, seal });
    }
    expect(JSON.parse(texts[0])).toMatchObject({ format: 'milemint-backup', version: SNAPSHOT_VERSION });
    expect(JSON.parse(Buffer.from(sealed[0], 'base64').toString('utf8'))).toMatchObject({
      format: 'milemint-backup',
      version: SNAPSHOT_VERSION,
    });
  });

  it('gives up on a step that never answers, saves why, and lets the next backup run', async () => {
    const native = (jest.requireMock('../../../modules/icloud-backup') as { ICloudBackup: Record<string, unknown> })
      .ICloudBackup;
    const write = native.write;
    native.write = () => new Promise(() => {}); // iCloud never answers
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    try {
      const stuck = backUp(fakeDb() as never, { force: true });
      const caught = stuck.catch((error: unknown) => error);
      // Let the read and seal steps run (the fake database ticks on timers too).
      for (let i = 0; i < 50 && writes.length === 0; i++) await jest.advanceTimersByTimeAsync(5);
      await jest.advanceTimersByTimeAsync(STEP_TIMEOUT_MS.write);
      const error = await caught;
      expect(error).toBeInstanceOf(BackupStepError);
      expect(error).toMatchObject({ step: 'write', code: 'ERR_TIMEOUT' });
      expect(await loadBackupFailure()).toMatchObject({ step: 'write', code: 'ERR_TIMEOUT' });
    } finally {
      native.write = write;
      jest.useRealTimers();
    }
    // The queue isn't stuck: the next one goes through and clears the failure.
    await expect(backUp(fakeDb() as never, { force: true })).resolves.toBe('written');
    expect(await loadBackupFailure()).toBeNull();
  });
});
