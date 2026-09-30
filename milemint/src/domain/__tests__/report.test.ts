import { describe, expect, it } from '@jest/globals';

import type { Place } from '../places';
import { buildReport, reportYears, toCsv, toReportHtml } from '../report';
import { milesToMeters, type Trip } from '../trip';

let next = 0;
function trip(overrides: Partial<Trip>): Trip {
  next += 1;
  return {
    id: `t${next}`,
    startedAt: '2026-03-10T16:00:00.000Z',
    localDate: '2026-03-10',
    endedAt: '2026-03-10T16:30:00.000Z',
    startLabel: 'Office',
    endLabel: 'Client',
    distanceMeters: milesToMeters(10),
    classification: 'business',
    purpose: 'Client visit',
    source: 'auto',
    createdAt: '2026-03-10T16:31:00.000Z',
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    ...overrides,
  };
}

const places: Place[] = [
  { id: 'home', name: 'Home', kind: 'home', latitude: 0, longitude: 0, radiusM: 150 },
  { id: 'work', name: 'Office', kind: 'work', latitude: 0, longitude: 0, radiusM: 150 },
];

describe('buildReport', () => {
  const trips = [
    trip({ localDate: '2026-06-30', startedAt: '2026-06-30T16:00:00.000Z' }),
    trip({ localDate: '2026-07-01', startedAt: '2026-07-01T16:00:00.000Z' }),
    trip({ classification: 'personal', startPlaceId: 'home', endPlaceId: 'work', purpose: '' }),
    trip({ classification: 'personal', purpose: '', distanceMeters: milesToMeters(4) }),
    trip({ classification: 'unclassified', purpose: '', distanceMeters: milesToMeters(2) }),
    trip({ localDate: '2025-12-31', startedAt: '2025-12-31T16:00:00.000Z' }),
  ];
  const report = buildReport(trips, 2026, { places });

  it('only includes the chosen year, oldest first', () => {
    expect(report.rows).toHaveLength(5);
    expect(report.rows[0].trip.localDate <= report.rows[4].trip.localDate).toBe(true);
  });

  it('splits miles the way Schedule C Part IV asks', () => {
    expect(report.businessMiles).toBeCloseTo(20, 1);
    expect(report.commutingMiles).toBeCloseTo(10, 1);
    expect(report.otherMiles).toBeCloseTo(6, 1);
    expect(report.totalMiles).toBeCloseTo(36, 1);
    expect(report.unclassifiedCount).toBe(1);
  });

  it('prices each half of 2026 at its own rate', () => {
    expect(report.byRate.map((r) => r.period.from)).toEqual(['2026-01-01', '2026-07-01']);
    // 10 mi at 72.5¢ + 10 mi at 76¢
    expect(report.deductionCents).toBe(725 + 760);
  });

  it('lists the years that have trips, newest first', () => {
    expect(reportYears(trips)).toEqual([2026, 2025]);
  });
});

describe('toCsv', () => {
  it('has a header and one line per trip', () => {
    const csv = toCsv(buildReport([trip({}), trip({})], 2026));
    const lines = csv.trim().split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('Business purpose');
    expect(lines[1]).toContain('Client visit');
    expect(lines[1]).toContain('7.25');
  });

  it('quotes commas and quotes, and keeps formulas as text', () => {
    const csv = toCsv(
      buildReport([trip({ startLabel: 'Acme, Inc. "HQ"', endLabel: '=HYPERLINK("x")' })], 2026),
    );
    expect(csv).toContain('"Acme, Inc. ""HQ"""');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });

  it('marks edited trips', () => {
    const edited = trip({});
    const csv = toCsv(buildReport([edited], 2026, { editedIds: new Set([edited.id]) }));
    expect(csv.trim().split('\r\n')[1].endsWith(',Yes')).toBe(true);
  });
});

describe('toReportHtml', () => {
  it('escapes place names and shows the total', () => {
    const html = toReportHtml(buildReport([trip({ startLabel: '<script>' })], 2026), new Date('2026-10-01'));
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('$7.25');
  });
});
