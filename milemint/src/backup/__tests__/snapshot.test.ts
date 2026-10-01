import { describe, expect, it } from '@jest/globals';

import { SCHEMA_VERSION } from '@/db/migrations';

import {
  BACKUP_TABLES,
  BackupError,
  backupDateFromName,
  backupFileName,
  consistentTables,
  emptyTables,
  makeSnapshot,
  packRoute,
  parseSnapshot,
  restorePlan,
  SNAPSHOT_VERSION,
  tripCount,
  unpackRoute,
  validateSnapshot,
  type BackupTable,
  type Tables,
} from '../snapshot';

const CURRENT = 7;

const trip = (id: string, extra: Record<string, string | number | null> = {}) => ({
  id,
  started_at: '2026-09-30T08:00:00.000Z',
  local_date: '2026-09-30',
  ended_at: '2026-09-30T08:20:00.000Z',
  start_label: 'Home',
  end_label: 'Acme, “Unit 2”',
  distance_meters: 12_400,
  classification: 'business',
  purpose: 'Site visit 🚗',
  source: 'auto',
  created_at: '2026-09-30T08:21:00.000Z',
  start_place_id: 'p1',
  end_place_id: null,
  vehicle_id: 'v1',
  ...extra,
});

function sampleTables(): Tables {
  return {
    ...emptyTables(),
    settings: [{ id: 1, json: '{"region":"GB","onboarded":true}' }],
    vehicles: [{ id: 'v1', name: 'Golf', type: 'car', registration: null, archived: 0, created_at: '2026-01-01' }],
    places: [{ id: 'p1', name: 'Home', latitude: 51.5, longitude: -0.12, radius_m: 150, kind: 'home', created_at: 'x' }],
    trips: [trip('t1'), trip('t2', { classification: 'personal' })],
    trip_routes: [{ trip_id: 't1', points: '[{"latitude":51.5,"longitude":-0.12}]' }],
    trip_edits: [
      { id: 1, trip_id: 't1', at: '2026-09-30T08:21:00Z', action: 'create', field: null, old_value: null, new_value: 'auto' },
      { id: 2, trip_id: 't1', at: '2026-09-30T09:00:00Z', action: 'update', field: 'purpose', old_value: '', new_value: 'Site visit' },
    ],
    odometer_readings: [{ region: 'GB', tax_year: 2026, start_reading: 41_000, end_reading: null }],
  };
}

const sample = () =>
  makeSnapshot(sampleTables(), { appVersion: '1.0.0', createdAt: new Date('2026-10-01T09:30:00Z'), schemaVersion: CURRENT });

const columnsOf = (tables: Tables) =>
  Object.fromEntries(
    BACKUP_TABLES.map((table) => [table, [...new Set(tables[table].flatMap((row) => Object.keys(row)))]]),
  ) as Record<BackupTable, string[]>;

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return error instanceof BackupError ? error.code : 'other';
  }
  return null;
};

describe('snapshots', () => {
  it('survive a round trip through JSON unchanged, edit history included', () => {
    const snapshot = sample();
    const back = parseSnapshot(JSON.stringify(snapshot), CURRENT);
    expect(back).toEqual(snapshot);
    expect(back.tables.trip_edits).toHaveLength(2);
    expect(tripCount(back)).toBe(2);
  });

  it('are stamped with this build’s schema and accepted by it', () => {
    const snapshot = makeSnapshot(sampleTables(), { appVersion: '1.0.0', createdAt: new Date() });
    expect(snapshot.schemaVersion).toBe(SCHEMA_VERSION);
    expect(validateSnapshot(JSON.parse(JSON.stringify(snapshot)))).toEqual(snapshot);
  });

  it('record the schema, app version and creation time', () => {
    const snapshot = sample();
    expect(snapshot).toMatchObject({
      format: 'milemint-backup',
      version: SNAPSHOT_VERSION,
      schemaVersion: CURRENT,
      appVersion: '1.0.0',
      createdAt: '2026-10-01T09:30:00.000Z',
    });
  });

  it('refuse anything that is not a MileMint backup', () => {
    expect(codeOf(() => parseSnapshot('not json', CURRENT))).toBe('not-a-backup');
    expect(codeOf(() => validateSnapshot({ format: 'something-else' }, CURRENT))).toBe('not-a-backup');
    expect(codeOf(() => validateSnapshot({ ...sample(), createdAt: 'yesterday' }, CURRENT))).toBe('not-a-backup');
    expect(codeOf(() => validateSnapshot({ ...sample(), tables: [] }, CURRENT))).toBe('not-a-backup');
  });

  it('refuse rows with nested values or column names that are not plain identifiers', () => {
    const nested = sample();
    (nested.tables.trips[0] as Record<string, unknown>).purpose = { evil: true };
    expect(codeOf(() => validateSnapshot(nested, CURRENT))).toBe('not-a-backup');

    const injected = sample();
    injected.tables.places[0] = { ...injected.tables.places[0], 'name) VALUES (1); DROP TABLE trips; --': 'x' };
    expect(codeOf(() => validateSnapshot(injected, CURRENT))).toBe('not-a-backup');

    const noId = sample();
    noId.tables.trips[0] = { ...noId.tables.trips[0], id: null };
    expect(codeOf(() => validateSnapshot(noId, CURRENT))).toBe('not-a-backup');
  });

  it('refuse numbers that are not numbers, so they are never restored as text', () => {
    const withTrip = (extra: Record<string, unknown>) => {
      const snapshot = sample();
      snapshot.tables.trips[0] = { ...snapshot.tables.trips[0], ...extra } as never;
      return snapshot;
    };
    expect(codeOf(() => validateSnapshot(withTrip({ distance_meters: 'lots' }), CURRENT))).toBe('not-a-backup');
    expect(codeOf(() => validateSnapshot(withTrip({ distance_meters: '12400' }), CURRENT))).toBe('not-a-backup');
    expect(codeOf(() => validateSnapshot(withTrip({ distance_meters: null }), CURRENT))).toBe('not-a-backup');
    expect(codeOf(() => validateSnapshot(withTrip({ distance_meters: -5 }), CURRENT))).toBe('not-a-backup');

    const place = sample();
    place.tables.places[0] = { ...place.tables.places[0], latitude: 'north' };
    expect(codeOf(() => validateSnapshot(place, CURRENT))).toBe('not-a-backup');

    // Null where the column allows it, and a column an older backup doesn't have, are fine.
    const nullable = sample();
    nullable.tables.odometer_readings[0] = { region: 'GB', tax_year: 2026, start_reading: null, end_reading: null };
    nullable.tables.trips[1] = { id: 't2', start_label: 'A' };
    expect(codeOf(() => validateSnapshot(nullable, CURRENT))).toBeNull();
  });

  it('refuse a snapshot version that is not a whole number from 1', () => {
    for (const version of [0, -1, 0.5, '1']) {
      expect(codeOf(() => validateSnapshot({ ...sample(), version }, CURRENT))).toBe('not-a-backup');
    }
  });

  it('ask for an app update when the backup is from a newer schema', () => {
    const newer = { ...sample(), schemaVersion: CURRENT + 1 };
    expect(codeOf(() => validateSnapshot(newer, CURRENT))).toBe('newer-app');
    expect(codeOf(() => validateSnapshot({ ...sample(), version: SNAPSHOT_VERSION + 1 }, CURRENT))).toBe('newer-app');
  });

  it('bring older backups forward: missing tables are empty, the schema becomes current', () => {
    const old = {
      format: 'milemint-backup',
      version: 1,
      schemaVersion: 2,
      appVersion: '0.9.0',
      createdAt: '2025-12-01T10:00:00.000Z',
      tables: { trips: [trip('t1')], trip_edits: [], trip_routes: [] },
    };
    const upgraded = validateSnapshot(old, CURRENT);
    expect(upgraded.schemaVersion).toBe(CURRENT);
    expect(upgraded.tables.vehicles).toEqual([]);
    expect(upgraded.tables.settings).toEqual([]);
    expect(upgraded.tables.odometer_readings).toEqual([]);
    expect(upgraded.tables.trips).toHaveLength(1);
  });

  it('ignore tables this build does not know', () => {
    const extra = { ...sample(), tables: { ...sample().tables, receipts: [{ id: 'r1' }] } };
    expect(Object.keys(validateSnapshot(extra, CURRENT).tables).sort()).toEqual([...BACKUP_TABLES].sort());
  });
});

describe('consistentTables', () => {
  it('drops routes of trips that are gone and unlinks missing places and vehicles', () => {
    const tables = sampleTables();
    tables.trip_routes.push({ trip_id: 'deleted-trip', points: '[]' });
    tables.trips.push(trip('t3', { start_place_id: 'gone', vehicle_id: 'sold' }));
    const fixed = consistentTables(tables);
    expect(fixed.trip_routes.map((route) => route.trip_id)).toEqual(['t1']);
    const t3 = fixed.trips.find((row) => row.id === 't3');
    expect(t3).toMatchObject({ start_place_id: null, vehicle_id: null });
    // Valid links are kept.
    expect(fixed.trips[0]).toMatchObject({ start_place_id: 'p1', vehicle_id: 'v1' });
  });

  it('drops logbooks and car costs of vehicles that are gone, which would otherwise fail the restore', () => {
    const tables = sampleTables();
    tables.logbooks = [
      { id: 'l1', vehicle_id: 'v1', start_date: '2026-05-15', end_date: '2026-08-06', odometer_start: 1, odometer_end: 2, created_at: 'x' },
      { id: 'l2', vehicle_id: 'sold', start_date: '2026-05-15', end_date: '2026-08-06', odometer_start: null, odometer_end: null, created_at: 'x' },
    ];
    tables.car_expenses = [
      { vehicle_id: 'v1', tax_year: 2026, json: '{}' },
      { vehicle_id: 'sold', tax_year: 2026, json: '{}' },
    ];
    const fixed = consistentTables(tables);
    expect(fixed.logbooks.map((logbook) => logbook.id)).toEqual(['l1']);
    expect(fixed.car_expenses.map((expenses) => expenses.vehicle_id)).toEqual(['v1']);
  });

  it('keeps shift pauses and drops one whose shift is gone', () => {
    const tables = sampleTables();
    tables.shifts = [{ id: 's1', started_at: '2026-09-30T16:00:00.000Z', ended_at: '2026-09-30T20:00:00.000Z' }];
    tables.shift_pauses = [
      { id: 'p1', shift_id: 's1', started_at: '2026-09-30T17:00:00.000Z', ended_at: '2026-09-30T17:20:00.000Z' },
      { id: 'p2', shift_id: 'deleted', started_at: '2026-09-30T17:00:00.000Z', ended_at: null },
    ];
    expect(consistentTables(tables).shift_pauses.map((pause) => pause.id)).toEqual(['p1']);
  });

  it('leaves trips from before vehicles existed without a vehicle_id column', () => {
    const tables = { ...emptyTables(), trips: [{ id: 'old', start_label: 'A' }] };
    expect(consistentTables(tables).trips[0]).toEqual({ id: 'old', start_label: 'A' });
  });
});

describe('restorePlan', () => {
  it('clears children before parents, then inserts parents before children', () => {
    const snapshot = sample();
    const plan = restorePlan(snapshot, columnsOf(snapshot.tables));
    const deletes = plan.filter((step) => step.sql.startsWith('DELETE')).map((step) => step.sql);
    expect(deletes[0]).toBe('DELETE FROM car_expenses;');
    expect(deletes.indexOf('DELETE FROM logbooks;')).toBeLessThan(deletes.indexOf('DELETE FROM vehicles;'));
    expect(deletes.indexOf('DELETE FROM trip_routes;')).toBeLessThan(deletes.indexOf('DELETE FROM trips;'));
    expect(deletes.indexOf('DELETE FROM trips;')).toBeLessThan(deletes.indexOf('DELETE FROM places;'));
    expect(deletes.at(-1)).toBe('DELETE FROM settings;');
    // Every table is cleared, even one the backup has no rows for (shifts here).
    expect(deletes).toContain('DELETE FROM shifts;');

    const inserted = plan.filter((step) => step.sql.startsWith('INSERT')).map((step) => step.sql.split(' ')[2]);
    expect(inserted.indexOf('vehicles')).toBeLessThan(inserted.indexOf('trips'));
    expect(inserted.indexOf('places')).toBeLessThan(inserted.indexOf('trips'));
    expect(inserted.indexOf('trips')).toBeLessThan(inserted.indexOf('trip_routes'));
    expect(inserted).not.toContain('shifts');
    expect(plan.findIndex((step) => step.sql.startsWith('INSERT'))).toBeGreaterThan(
      plan.findLastIndex((step) => step.sql.startsWith('DELETE')),
    );
  });

  it('writes every row with its values in column order', () => {
    const snapshot = sample();
    const plan = restorePlan(snapshot, columnsOf(snapshot.tables));
    const edits = plan.find((step) => step.sql.startsWith('INSERT INTO trip_edits'));
    expect(edits?.sql).toBe(
      'INSERT INTO trip_edits (id, trip_id, at, action, field, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?);',
    );
    expect(edits?.rows[1]).toEqual([2, 't1', '2026-09-30T09:00:00Z', 'update', 'purpose', '', 'Site visit']);
  });

  it('writes only columns the database has, so an older backup takes the defaults for new ones', () => {
    const snapshot = sample();
    const columns = columnsOf(snapshot.tables);
    columns.trips = columns.trips.filter((column) => column !== 'purpose');
    const tripsStep = restorePlan(snapshot, columns).find((step) => step.sql.startsWith('INSERT INTO trips'));
    expect(tripsStep?.sql).not.toContain('purpose');
    // A column the backup lacks (auto_default from before migration 6) isn't written at all.
    expect(tripsStep?.sql).not.toContain('auto_default');
  });
});

describe('backup file names', () => {
  it('carry the time they were made, and sort by it', () => {
    const at = new Date('2026-10-01T09:30:05.123Z');
    expect(backupFileName(at)).toBe('milemint-backup-20261001T093005Z.mmbk');
    expect(backupDateFromName(backupFileName(at))?.toISOString()).toBe('2026-10-01T09:30:05.000Z');
    const names = [new Date('2026-12-31T23:59:59Z'), new Date('2026-01-02T00:00:00Z'), at].map(backupFileName);
    expect([...names].sort()).toEqual([names[1], names[2], names[0]]);
  });

  it('ignore names that are not ours', () => {
    expect(backupDateFromName('notes.txt')).toBeNull();
    expect(backupDateFromName('milemint-backup-latest.mmbk')).toBeNull();
  });
});

describe('routes in a backup', () => {
  const route = Array.from({ length: 500 }, (_, i) => ({
    latitude: Math.round((51.5 + i * 0.00031) * 1e5) / 1e5,
    longitude: Math.round((-0.12 - i * 0.00027) * 1e5) / 1e5,
  }));
  const points = JSON.stringify(route);

  it('are packed to a small fraction of their JSON and unpacked exactly', () => {
    const packed = packRoute({ trip_id: 't1', points });
    expect(packed).not.toHaveProperty('points');
    expect(typeof packed.polyline).toBe('string');
    expect(String(packed.polyline).length).toBeLessThan(points.length / 8);
    expect(unpackRoute(packed)).toEqual({ trip_id: 't1', points });
  });

  it('round-trip through a whole snapshot and its restore plan', () => {
    const tables = { ...sampleTables(), trip_routes: [{ trip_id: 't1', points }] };
    const snapshot = parseSnapshot(JSON.stringify(makeSnapshot(tables, { appVersion: '1', createdAt: new Date() })));
    const insert = restorePlan(snapshot, columnsOf(tables)).find((step) => step.sql.startsWith('INSERT INTO trip_routes'));
    expect(insert?.sql).toBe('INSERT INTO trip_routes (trip_id, points) VALUES (?, ?);');
    expect(insert?.rows).toEqual([['t1', points]]);
  });

  it('keep points that are not a plain list of coordinates as they are', () => {
    for (const odd of ['not json', '{"a":1}', '[{"latitude":"51","longitude":0}]', '[null]']) {
      expect(packRoute({ trip_id: 't1', points: odd })).toEqual({ trip_id: 't1', points: odd });
    }
  });

  it('restore from version-1 backups (routes as JSON), as made by older builds', () => {
    const v1 = { ...makeSnapshot(sampleTables(), { appVersion: '1', createdAt: new Date() }), version: 1 };
    v1.tables.trip_routes = [{ trip_id: 't1', points: '[{"latitude":51.123456789,"longitude":-0.12}]' }];
    const snapshot = parseSnapshot(JSON.stringify(v1));
    const insert = restorePlan(snapshot, columnsOf(sampleTables())).find((step) =>
      step.sql.startsWith('INSERT INTO trip_routes'),
    );
    expect(insert?.rows).toEqual([['t1', '[{"latitude":51.123456789,"longitude":-0.12}]']]);
  });

  it('refuse a damaged packed route', () => {
    const damaged = { ...sample(), tables: { ...sampleTables(), trip_routes: [{ trip_id: 't1', polyline: 'a b' }] } };
    expect(codeOf(() => validateSnapshot(JSON.parse(JSON.stringify(damaged))))).toBe('not-a-backup');
    expect(codeOf(() => unpackRoute({ trip_id: 't1', polyline: '_' }))).toBe('not-a-backup');
    const missing = { ...sample(), tables: { ...sampleTables(), trip_routes: [{ trip_id: 't1' }] } };
    expect(codeOf(() => validateSnapshot(JSON.parse(JSON.stringify(missing))))).toBe('not-a-backup');
  });
});
