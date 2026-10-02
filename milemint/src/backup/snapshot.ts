import { SCHEMA_VERSION } from '@/db/migrations';
import { decodePolyline, encodePolyline } from '@/domain/polyline';

/**
 * A backup is a versioned JSON snapshot of every table needed to rebuild the
 * database: rows exactly as stored, so restoring is "clear the tables, insert
 * the rows". Pure (no database, no iCloud), so it's unit-tested.
 */

export const BACKUP_FORMAT = 'milemint-backup';
/**
 * The snapshot's own layout (not the database schema). Bump only if this file's shape changes.
 * 1: rows exactly as stored. 2: routes packed (see packRoute); version 1 backups still restore.
 */
export const SNAPSHOT_VERSION = 2;

/**
 * Tables in a backup, parents before children (foreign keys): restored in
 * this order, cleared in reverse. tracker_state is left out on purpose: it's
 * the drive in progress on this particular phone.
 */
export const BACKUP_TABLES = [
  'settings',
  // Tax set-aside: each week's earnings (schema 12).
  'weekly_earnings',
  'vehicles',
  'places',
  'shifts',
  // Breaks in a shift: drives in them aren't work.
  'shift_pauses',
  'trips',
  'trip_routes',
  // The audit trail: who changed what and when (IRS Pub 463). Restored as is.
  'trip_edits',
  'odometer_readings',
  // Australia's 12-week logbook periods and each car's running costs.
  'logbooks',
  'car_expenses',
] as const;

export type BackupTable = (typeof BACKUP_TABLES)[number];
export type Cell = string | number | null;
export type Row = Record<string, Cell>;
export type Tables = Record<BackupTable, Row[]>;

export type Snapshot = {
  format: typeof BACKUP_FORMAT;
  version: number;
  /** PRAGMA user_version of the database it came from. */
  schemaVersion: number;
  appVersion: string;
  /** ISO time it was made. */
  createdAt: string;
  tables: Tables;
};

export type BackupErrorCode = 'not-a-backup' | 'newer-app';

export class BackupError extends Error {
  constructor(
    readonly code: BackupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

export function emptyTables(): Tables {
  return Object.fromEntries(BACKUP_TABLES.map((table) => [table, []])) as unknown as Tables;
}

export function makeSnapshot(
  tables: Tables,
  meta: { appVersion: string; createdAt: Date; schemaVersion?: number },
): Snapshot {
  return {
    format: BACKUP_FORMAT,
    version: SNAPSHOT_VERSION,
    schemaVersion: meta.schemaVersion ?? SCHEMA_VERSION,
    appVersion: meta.appVersion,
    createdAt: meta.createdAt.toISOString(),
    tables: { ...tables, trip_routes: tables.trip_routes.map(packRoute) },
  };
}

// ─── Routes ────────────────────────────────────────────────────────────────

/*
 * Routes are nearly all of a backup: a year of driving is tens of megabytes
 * of JSON points. In a backup each is packed as an encoded polyline (five
 * decimal places, about a metre, as new routes are stored anyway; see
 * domain/polyline.ts) in a `polyline` column instead of `points`, a tenth of
 * the size or less. Restoring unpacks it back into `points`.
 */

const POLYLINE = /^[\x3f-\x7e]*$/;

const isPoint = (value: unknown): value is { latitude: number; longitude: number } =>
  isRecord(value) &&
  typeof value.latitude === 'number' &&
  Number.isFinite(value.latitude) &&
  typeof value.longitude === 'number' &&
  Number.isFinite(value.longitude);

/** A route row with its points packed; left as it is if they aren't a plain list of points. */
export function packRoute(row: Row): Row {
  if (typeof row.points !== 'string') return row;
  let points: unknown;
  try {
    points = JSON.parse(row.points);
  } catch {
    return row;
  }
  if (!Array.isArray(points) || !points.every(isPoint)) return row;
  const { points: _unpacked, ...rest } = row;
  return { ...rest, polyline: encodePolyline(points) };
}

/** A route row as stored in the database: a packed one unpacked back into `points`. */
export function unpackRoute(row: Row): Row {
  if (typeof row.polyline !== 'string') return row;
  const points = decodePolyline(row.polyline);
  if (!points) throw new BackupError('not-a-backup', 'A route is damaged');
  const { polyline: _packed, ...rest } = row;
  return { ...rest, points: JSON.stringify(points) };
}

/**
 * Runs `step` on each row, giving the JavaScript thread back every few
 * milliseconds: a year of routes takes a while on a phone, and the app
 * shouldn't freeze meanwhile.
 */
export async function mapRowsInTurns(rows: readonly Row[], step: (row: Row) => Row): Promise<Row[]> {
  const out: Row[] = [];
  let since = Date.now();
  for (const row of rows) {
    out.push(step(row));
    if (Date.now() - since >= 8) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      since = Date.now();
    }
  }
  return out;
}

export const tripCount = (snapshot: Snapshot): number => snapshot.tables.trips.length;

// ─── Reading a backup back ─────────────────────────────────────────────────

/** Column names are put into SQL, so only plain lower-case identifiers are accepted. */
const COLUMN = /^[a-z_][a-z0-9_]*$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCell = (value: unknown): value is Cell =>
  value === null || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));

/**
 * The numeric columns of each table: a backup with anything but a finite
 * number in one (or null where the column allows it) is damaged, and would
 * otherwise be restored as text and turn into NaN in the totals.
 */
const NUMERIC: Partial<Record<BackupTable, Record<string, { nullable: boolean; min?: number }>>> = {
  settings: { id: { nullable: false } },
  weekly_earnings: { amount_minor: { nullable: false, min: 0 } },
  vehicles: { archived: { nullable: false } },
  places: { latitude: { nullable: false }, longitude: { nullable: false }, radius_m: { nullable: false, min: 0 } },
  trips: {
    distance_meters: { nullable: false, min: 0 },
    auto_default: { nullable: false },
    // Parking and tolls, minor units (schema 11). Missing in older backups: restored as 0.
    parking_minor: { nullable: false, min: 0 },
    tolls_minor: { nullable: false, min: 0 },
  },
  trip_edits: { id: { nullable: true } },
  odometer_readings: {
    tax_year: { nullable: false },
    start_reading: { nullable: true, min: 0 },
    end_reading: { nullable: true, min: 0 },
  },
  logbooks: { odometer_start: { nullable: true, min: 0 }, odometer_end: { nullable: true, min: 0 } },
  car_expenses: { tax_year: { nullable: false } },
};

function checkNumbers(table: BackupTable, row: Record<string, unknown>) {
  for (const [column, rule] of Object.entries(NUMERIC[table] ?? {})) {
    // Missing: a backup from before the column existed, which then takes its default.
    if (!(column in row)) continue;
    const cell = row[column];
    const ok =
      cell === null
        ? rule.nullable
        : typeof cell === 'number' && Number.isFinite(cell) && (rule.min === undefined || cell >= rule.min);
    if (!ok) throw new BackupError('not-a-backup', `${table}.${column} is not a number`);
  }
}

function checkRows(table: BackupTable, value: unknown): Row[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new BackupError('not-a-backup', `${table} is not a list`);
  for (const row of value) {
    if (!isRecord(row)) throw new BackupError('not-a-backup', `${table} has a row that is not an object`);
    for (const [column, cell] of Object.entries(row)) {
      if (!COLUMN.test(column) || !isCell(cell)) {
        throw new BackupError('not-a-backup', `${table}.${column} is not a plain value`);
      }
    }
    checkNumbers(table, row);
  }
  return value as Row[];
}

/**
 * Snapshots from older versions of the app, brought up to this schema. Every
 * migration so far only added tables or columns with defaults, so older rows
 * restore as they are: a missing table is empty and a missing column takes
 * its default. A future migration that renames or reshapes data adds a step
 * here, keyed by the schema version it upgrades to.
 */
const UPGRADES: Partial<Record<number, (tables: Tables) => Tables>> = {
  // 2: trip_routes. 3: places, settings, trip place links and auto_reason. 4: odometer_readings.
  // 5: trips.vehicle (default 'car'), trips.shift_id, shifts. 6: trips.auto_default (default 0).
  // 7: vehicles and trips.vehicle_id (null: the app links old trips to the first vehicle).
  // 8: logbooks and car_expenses. 9: shift_pauses and trips.off_shift_id (null).
  // 10: indexes, and tracker_route (the drive in progress: never backed up).
  // 11: trips.parking_minor and trips.tolls_minor (NOT NULL DEFAULT 0). Written as 0 on
  // every older trip rather than left out, so a restore never inserts null into them.
  // 12: weekly_earnings (a new table: missing in older backups, so restored empty).
  11: (tables) => ({
    ...tables,
    trips: tables.trips.map((trip) => ({ parking_minor: 0, tolls_minor: 0, ...trip })),
  }),
};

export function upgradeSnapshot(snapshot: Snapshot, currentSchema = SCHEMA_VERSION): Snapshot {
  let tables = snapshot.tables;
  for (let version = snapshot.schemaVersion + 1; version <= currentSchema; version++) {
    tables = UPGRADES[version]?.(tables) ?? tables;
  }
  return { ...snapshot, schemaVersion: Math.max(snapshot.schemaVersion, currentSchema), tables };
}

/** Checks a parsed backup and upgrades it to this build's schema; throws BackupError if it can't be used. */
export function validateSnapshot(value: unknown, currentSchema = SCHEMA_VERSION): Snapshot {
  if (!isRecord(value) || value.format !== BACKUP_FORMAT) {
    throw new BackupError('not-a-backup', 'Not a MileSprout backup');
  }
  const { version, schemaVersion, createdAt, appVersion, tables } = value;
  if (typeof version !== 'number' || typeof schemaVersion !== 'number') {
    throw new BackupError('not-a-backup', 'No version');
  }
  if (!Number.isInteger(version) || version < 1) throw new BackupError('not-a-backup', 'Bad snapshot version');
  if (version > SNAPSHOT_VERSION) throw new BackupError('newer-app', 'Made by a newer version of MileSprout');
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new BackupError('not-a-backup', 'Bad schema version');
  }
  // A newer schema may hold data this build would silently drop: update the app first.
  if (schemaVersion > currentSchema) throw new BackupError('newer-app', 'Made by a newer version of MileSprout');
  if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) {
    throw new BackupError('not-a-backup', 'Bad creation time');
  }
  if (!isRecord(tables)) throw new BackupError('not-a-backup', 'No tables');
  const checked = emptyTables();
  // Tables this build doesn't know are ignored.
  for (const table of BACKUP_TABLES) checked[table] = checkRows(table, tables[table]);
  if (
    checked.trip_routes.some(
      (route) =>
        typeof route.points !== 'string' && (typeof route.polyline !== 'string' || !POLYLINE.test(route.polyline)),
    )
  ) {
    throw new BackupError('not-a-backup', 'A route has no points');
  }
  if (checked.trips.some((trip) => typeof trip.id !== 'string')) {
    throw new BackupError('not-a-backup', 'A trip has no id');
  }
  // Rows that others point at need their id too, or the whole restore fails on them.
  for (const table of ['vehicles', 'places', 'shifts', 'logbooks'] as const) {
    if (checked[table].some((row) => typeof row.id !== 'string')) {
      throw new BackupError('not-a-backup', `A row in ${table} has no id`);
    }
  }
  return upgradeSnapshot(
    {
      format: BACKUP_FORMAT,
      version,
      schemaVersion,
      appVersion: typeof appVersion === 'string' ? appVersion : 'unknown',
      createdAt,
      tables: checked,
    },
    currentSchema,
  );
}

export function parseSnapshot(json: string, currentSchema = SCHEMA_VERSION): Snapshot {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new BackupError('not-a-backup', 'Not JSON');
  }
  return validateSnapshot(value, currentSchema);
}

// ─── Restoring ─────────────────────────────────────────────────────────────

/**
 * Drops what would break a foreign key on restore. Backups from before they
 * were read in one transaction can have a route that outlived its trip, or a
 * trip pointing at a place deleted a moment later. Deleting a place or
 * vehicle only unlinks trips in the app too. A logbook or a year's car costs
 * can't exist without their vehicle, so those are dropped with it.
 */
export function consistentTables(tables: Tables): Tables {
  const ids = (rows: Row[], key: string) => new Set(rows.map((row) => row[key]));
  const trips = ids(tables.trips, 'id');
  const places = ids(tables.places, 'id');
  const vehicles = ids(tables.vehicles, 'id');
  const shifts = ids(tables.shifts, 'id');
  const link = (value: Cell | undefined, known: Set<Cell>) =>
    value === undefined || value === null || known.has(value) ? value : null;
  return {
    ...tables,
    trips: tables.trips.map((trip) => {
      const fixed: Row = { ...trip };
      for (const column of ['start_place_id', 'end_place_id'] as const) {
        const value = link(trip[column], places);
        if (value !== undefined) fixed[column] = value;
      }
      const vehicle = link(trip.vehicle_id, vehicles);
      if (vehicle !== undefined) fixed.vehicle_id = vehicle;
      return fixed;
    }),
    trip_routes: tables.trip_routes.filter((route) => trips.has(route.trip_id)),
    logbooks: tables.logbooks.filter((logbook) => vehicles.has(logbook.vehicle_id)),
    car_expenses: tables.car_expenses.filter((expenses) => vehicles.has(expenses.vehicle_id)),
    // A pause can't outlive its shift (the shift deleted a moment before the backup).
    shift_pauses: tables.shift_pauses.filter((pause) => shifts.has(pause.shift_id)),
    // A week's earnings needs its week and amount, or the whole restore would fail on it.
    weekly_earnings: tables.weekly_earnings.filter(
      (week) =>
        typeof week.week_start === 'string' &&
        typeof week.amount_minor === 'number' &&
        typeof week.updated_at === 'string',
    ),
  };
}

export type RestoreStep = { sql: string; rows: Cell[][] };

/**
 * The statements that rebuild the database from a snapshot: clear every
 * table, then insert the rows. Only columns this build's tables have are
 * written; a column an older backup lacks takes its default.
 */
export function restorePlan(snapshot: Snapshot, columns: Record<BackupTable, readonly string[]>): RestoreStep[] {
  const consistent = consistentTables(snapshot.tables);
  const tables = { ...consistent, trip_routes: consistent.trip_routes.map(unpackRoute) };
  const clear = [...BACKUP_TABLES].reverse().map((table): RestoreStep => ({ sql: `DELETE FROM ${table};`, rows: [] }));
  const inserts = BACKUP_TABLES.flatMap((table): RestoreStep[] => {
    const rows = tables[table];
    const known = new Set(columns[table]);
    const names = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter(
      (name) => known.has(name) && COLUMN.test(name),
    );
    if (rows.length === 0 || names.length === 0) return [];
    return [
      {
        sql: `INSERT INTO ${table} (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')});`,
        rows: rows.map((row) => names.map((name) => row[name] ?? null)),
      },
    ];
  });
  return [...clear, ...inserts];
}

// ─── File names ────────────────────────────────────────────────────────────

const NAME = /^milemint-backup-(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z\.mmbk$/;

/** "milemint-backup-20261001T093000Z.mmbk": sorts by date, and says when without opening it. */
export function backupFileName(at: Date): string {
  const stamp = at.toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[-:]/g, '');
  return `milemint-backup-${stamp}.mmbk`;
}

export function backupDateFromName(name: string): Date | null {
  const match = NAME.exec(name);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  return Number.isNaN(date.getTime()) ? null : date;
}
