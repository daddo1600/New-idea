import { describe, expect, it, jest } from '@jest/globals';

import { migrate } from '../migrations';

// Hoisted above the import by babel-jest: migrate() sees an iPhone.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

/** A fake connection recording every statement, like the keyed SQLCipher connection. */
function fakeDb(userVersion: number) {
  const statements: string[] = [];
  const db = {
    statements,
    getFirstAsync: async () => ({ user_version: userVersion }),
    execAsync: async (sql: string) => {
      statements.push(sql.trim().split('\n')[0]);
    },
    withExclusiveTransactionAsync: async () => {
      throw new Error('opens an unkeyed second connection');
    },
    withTransactionAsync: async () => {
      throw new Error('not used on devices');
    },
  };
  return db;
}

describe('migrate on a device', () => {
  it('migrates on the same (keyed) connection inside BEGIN IMMEDIATE', async () => {
    const db = fakeDb(0);
    await migrate(db as never);
    expect(db.statements[0]).toBe('BEGIN IMMEDIATE;');
    expect(db.statements.at(-1)).toBe('COMMIT;');
    expect(db.statements.some((s) => s.startsWith('PRAGMA user_version ='))).toBe(true);
  });

  it('does nothing but begin and commit when already up to date', async () => {
    const db = fakeDb(99);
    await migrate(db as never);
    expect(db.statements).toEqual(['BEGIN IMMEDIATE;', 'COMMIT;']);
  });

  it('rolls back and reports a failed migration', async () => {
    const db = fakeDb(0);
    db.execAsync = async (sql: string) => {
      db.statements.push(sql.trim().split('\n')[0]);
      if (sql.includes('CREATE TABLE trips')) throw new Error('disk full');
    };
    await expect(migrate(db as never)).rejects.toThrow('disk full');
    expect(db.statements.at(-1)).toBe('ROLLBACK;');
  });
});
