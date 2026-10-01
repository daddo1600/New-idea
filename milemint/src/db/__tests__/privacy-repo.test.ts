import { describe, expect, it, jest } from '@jest/globals';

import { pendingScrub } from '@/backup/after-scrub';

import { countPastTrips, scrubPastTrips } from '../privacy-repo';

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

type Row = Record<string, unknown>;

/** A fake connection with canned tables, recording every write. */
function fakeDb(tables: { places: Row[]; trips: Row[]; edits: Row[]; routes?: string[] }) {
  const writes: { sql: string; params: unknown[] }[] = [];
  let inTransaction = false;
  const db = {
    writes,
    vacuumed: false,
    getAllAsync: async (sql: string) =>
      sql.includes('FROM places')
        ? tables.places
        : sql.includes('FROM trips')
          ? tables.trips.map((trip) => ({ ...trip, has_route: tables.routes?.includes(trip.id as string) ? 1 : 0 }))
          : tables.edits,
    getFirstAsync: async () => null,
    runAsync: async (sql: string, ...params: unknown[]) => {
      if (!inTransaction) throw new Error('write outside the transaction');
      writes.push({ sql, params });
      return { changes: 1, lastInsertRowId: 0 };
    },
    execAsync: async (sql: string) => {
      if (sql === 'VACUUM;') db.vacuumed = true;
      if (sql.startsWith('BEGIN')) {
        if (inTransaction) throw new Error('cannot start a transaction within a transaction');
        inTransaction = true;
      }
      if (sql === 'COMMIT;' || sql === 'ROLLBACK;') inTransaction = false;
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
      places: [{ name: 'Home' }, { name: 'Office' }],
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

  it('reduces an address linked to a saved place unless it is that place’s name', async () => {
    const db = fakeDb({
      places: [{ name: 'Office' }],
      trips: [
        // Label edited after the trip was linked to the office: the place link stays, the address mustn't.
        { id: 'a', start_label: 'Office', end_label: '3 Kirkstall Lane, Leeds LS5 3BB', start_place_id: 'p1', end_place_id: 'p1' },
      ],
      edits: [],
    });
    await scrubPastTrips(db as never, 'GB');
    const update = db.writes.find((w) => w.sql.startsWith('UPDATE trips'));
    expect(update?.params).toEqual(['Office', 'Client visit · Leeds LS5', 'a']);
  });

  it('asks for a fresh backup that replaces the older ones', async () => {
    await run();
    expect(await pendingScrub()).not.toBeNull();
  });
});

describe('countPastTrips', () => {
  it('counts only trips that may still have an address or a route', async () => {
    const db = fakeDb({
      places: [{ name: 'Home' }],
      trips: [
        { id: 'done', start_label: 'Home', end_label: 'Client visit · Leeds LS6' },
        { id: 'address', start_label: 'Home', end_label: '14 Otley Road, Leeds' },
        { id: 'route', start_label: 'Home', end_label: 'Client visit' },
      ],
      edits: [],
      routes: ['route'],
    });
    expect(await countPastTrips(db as never)).toBe(2);
  });
});
