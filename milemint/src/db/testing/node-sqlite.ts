/**
 * Tests only: an expo-sqlite-like connection over Node's built-in SQLite
 * (node:sqlite, Node 22.5+), so repo tests run real SQL, constraints and
 * transactions. Every call waits a turn of the event loop first, like a
 * native async call, so other work interleaves between statements as it
 * does on a phone. `available` is false on Node versions without it.
 */

type Params = unknown[];
type Statement = {
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
};
type NodeDatabase = { exec(sql: string): void; prepare(sql: string): Statement; close(): void };

const sqlite = (() => {
  try {
    const load = (process as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule;
    return load?.('node:sqlite') as { DatabaseSync: new (path: string) => NodeDatabase } | undefined;
  } catch {
    return undefined;
  }
})();

export const available = sqlite !== undefined;

const turn = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** expo-sqlite takes parameters spread, or as one array. */
function values(params: Params): unknown[] {
  const flat = params.length === 1 && Array.isArray(params[0]) ? (params[0] as unknown[]) : params;
  return flat.map((value) => (value === undefined ? null : typeof value === 'boolean' ? Number(value) : value));
}

export type TestDatabase = ReturnType<typeof openTestDatabase>;

export function openTestDatabase() {
  if (!sqlite) throw new Error('node:sqlite is not available in this Node version');
  const raw = new sqlite.DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  const run = (sql: string, params: Params) => {
    const result = raw.prepare(sql).run(...values(params));
    return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
  };
  const db = {
    raw,
    async execAsync(sql: string) {
      await turn();
      raw.exec(sql);
    },
    async runAsync(sql: string, ...params: Params) {
      await turn();
      return run(sql, params);
    },
    async getFirstAsync<T>(sql: string, ...params: Params): Promise<T | null> {
      await turn();
      return (raw.prepare(sql).get(...values(params)) as T | undefined) ?? null;
    },
    async getAllAsync<T>(sql: string, ...params: Params): Promise<T[]> {
      await turn();
      return raw.prepare(sql).all(...values(params)) as T[];
    },
    async prepareAsync(sql: string) {
      await turn();
      const statement = raw.prepare(sql);
      return {
        async executeAsync(...params: Params) {
          await turn();
          const result = statement.run(...values(params));
          return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
        },
        async finalizeAsync() {},
      };
    },
    /** expo-sqlite's: BEGIN, the task, COMMIT (or ROLLBACK). */
    async withTransactionAsync(task: () => Promise<void>) {
      await db.execAsync('BEGIN;');
      try {
        await task();
        await db.execAsync('COMMIT;');
      } catch (error) {
        await db.execAsync('ROLLBACK;');
        throw error;
      }
    },
    /** Synchronous reads for checking results. */
    rows<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
      return raw.prepare(sql).all(...params) as T[];
    },
  };
  return db;
}
