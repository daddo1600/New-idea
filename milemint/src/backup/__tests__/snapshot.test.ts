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
  parseSnapshot,
  restorePlan,
  tripCount,
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
      version: 1,
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

  it('ask for an app update when the backup is from a newer schema', () => {
    const newer = { ...sample(), schemaVersion: CURRENT + 1 };
    expect(codeOf(() => validateSnapshot(newer, CURRENT))).toBe('newer-app');
    expect(codeOf(() => validateSnapshot({ ...sample(), version: 2 }, CURRENT))).toBe('newer-app');
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
    expect(deletes[0]).toBe('DELETE FROM odometer_readings;');
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
