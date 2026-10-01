import { describe, expect, it } from '@jest/globals';

import { scrubPastTrips } from '../privacy-repo';

type Row = Record<string, unknown>;

/** A fake connection with canned tables, recording every write. */
function fakeDb(tables: { places: Row[]; trips: Row[]; edits: Row[] }) {
  const writes: { sql: string; params: unknown[] }[] = [];
  let inTransaction = false;
  const db = {
    writes,
    vacuumed: false,
    getAllAsync: async (sql: string) =>
      sql.includes('FROM places') ? tables.places : sql.includes('FROM trips') ? tables.trips : tables.edits,
    getFirstAsync: async () => null,
    runAsync: async (sql: string, ...params: unknown[]) => {
      if (!inTransaction) throw new Error('write outside the transaction');
      writes.push({ sql, params });
      return { changes: 1, lastInsertRowId: 0 };
    },
    execAsync: async (sql: string) => {
      if (sql === 'VACUUM;') db.vacuumed = true;
    },
    withTransactionAsync: async (work: () => Promise<void>) => {
      inTransaction = true;
      try {
        await work();
      } finally {
        inTransaction = false;
      }
    },
  };
  return db;
}

describe('scrubPastTrips', () => {
  const run = async () => {
    const db = fakeDb({
      places: [{ name: 'Home' }],
      trips: [
        { id: 'a', start_label: 'Home', end_label: '14 Otley Road, Leeds', start_place_id: null, end_place_id: null },
        { id: 'b', start_label: 'Client visit · Leeds LS6', end_label: 'Office', start_place_id: null, end_place_id: 'p1' },
      ],
      edits: [
        { id: 1, action: 'update', field: 'end_label', old_value: '3 Kirkstall Lane, Leeds', new_value: 'Mrs Smith' },
        {
          id: 2,
          action: 'delete',
          field: null,
          old_value: JSON.stringify({ id: 'c', startLabel: 'Home', endLabel: '9 Elm Grove, Leeds LS6 2AA', endPlaceId: null }),
          new_value: null,
        },
      ],
    });
    const changed = await scrubPastTrips(db as never, 'GB');
    return { db, changed };
  };

  it('reduces unnamed stops to the area and keeps saved places', async () => {
    const { db, changed } = await run();
    expect(changed).toBe(1);
    const update = db.writes.find((w) => w.sql.startsWith('UPDATE trips'));
    expect(update?.params).toEqual(['Home', 'Client visit · Leeds', 'a']);
  });

  it('logs the change without keeping the old address', async () => {
    const { db } = await run();
    const logs = db.writes.filter((w) => w.sql.startsWith('INSERT INTO trip_edits'));
    expect(logs).toHaveLength(1);
    expect(logs[0].params).toEqual(['a', expect.any(String), 'redact', 'end_label', null, 'Client visit · Leeds']);
  });

  it('removes addresses from the edit history, deleted trips included', async () => {
    const { db } = await run();
    const history = db.writes.filter((w) => w.sql.startsWith('UPDATE trip_edits'));
    expect(history[0].params).toEqual(['Client visit · Leeds', 'Client visit', 1]);
    const deleted = JSON.parse(history[1].params[0] as string);
    expect(deleted).toMatchObject({ startLabel: 'Home', endLabel: 'Client visit · Leeds LS6' });
    expect(JSON.stringify(db.writes)).not.toMatch(/Otley|Kirkstall|Elm Grove|Smith/);
  });

  it('deletes every stored route and compacts the file', async () => {
    const { db } = await run();
    expect(db.writes.some((w) => w.sql === 'DELETE FROM trip_routes;')).toBe(true);
    expect(db.vacuumed).toBe(true);
  });
});
