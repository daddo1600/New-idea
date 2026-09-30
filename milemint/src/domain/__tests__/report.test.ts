import { describe, expect, it } from '@jest/globals';

import type { Place } from '../places';
import { REGIONS, fromUnits, type Region } from '../regions';
import { buildReport, pageSize, reportYears, toCsv, toReportHtml } from '../report';
import type { Trip } from '../trip';

const { US, GB, AU } = REGIONS;

let next = 0;
function trip(overrides: Partial<Trip> & { units?: number }, region: Region = US): Trip {
  next += 1;
  const { units = 10, ...rest } = overrides;
  const localDate = rest.localDate ?? '2026-03-10';
  return {
    id: `t${next}`,
    startedAt: `${localDate}T16:00:00.000Z`,
    localDate,
    endedAt: `${localDate}T16:30:00.000Z`,
    startLabel: 'Office',
    endLabel: 'Client',
    distanceMeters: fromUnits(units, region),
    classification: 'business',
    purpose: 'Client visit',
    source: 'auto',
    createdAt: `${localDate}T16:31:00.000Z`,
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    ...rest,
  };
}

const places: Place[] = [
  { id: 'home', name: 'Home', kind: 'home', latitude: 0, longitude: 0, radiusM: 150 },
  { id: 'work', name: 'Office', kind: 'work', latitude: 0, longitude: 0, radiusM: 150 },
];

describe('buildReport (US)', () => {
  const trips = [
    trip({ localDate: '2026-06-30' }),
    trip({ localDate: '2026-07-01' }),
    trip({ classification: 'personal', startPlaceId: 'home', endPlaceId: 'work', purpose: '' }),
    trip({ classification: 'personal', purpose: '', units: 4 }),
    trip({ classification: 'unclassified', purpose: '', units: 2 }),
    trip({ localDate: '2025-12-31' }),
  ];
  const report = buildReport(trips, US, 2026, { places });

  it('only includes the chosen tax year, oldest first', () => {
    expect(report.rows).toHaveLength(5);
    expect(report.rows[0].trip.localDate <= report.rows[4].trip.localDate).toBe(true);
    expect(report.label).toBe('2026');
  });

  it('splits distance the way Schedule C Part IV asks', () => {
    expect(report.businessDistance).toBeCloseTo(20, 1);
    expect(report.commutingDistance).toBeCloseTo(10, 1);
    expect(report.otherDistance).toBeCloseTo(6, 1);
    expect(report.totalDistance).toBeCloseTo(36, 1);
    expect(report.unclassifiedCount).toBe(1);
  });

  it('prices each half of 2026 at its own rate', () => {
    expect(report.byRate.map((r) => r.label)).toEqual(['72.5¢ a mile', '76¢ a mile']);
    expect(report.deduction).toBe(725 + 760);
  });

  it('lists the tax years that have trips, newest first', () => {
    expect(reportYears(trips, US)).toEqual([2026, 2025]);
  });
});

describe('buildReport (UK)', () => {
  it('uses the 6 April tax year and splits the trip that crosses 10,000 miles', () => {
    const trips = [
      trip({ localDate: '2026-04-05', units: 50 }, GB), // previous tax year
      trip({ localDate: '2026-05-01', units: 9_950 }, GB),
      trip({ localDate: '2026-06-01', units: 100 }, GB), // 50 at 55p, 50 at 25p
    ];
    const report = buildReport(trips, GB, 2026);
    expect(report.label).toBe('2026/27');
    expect(report.rows).toHaveLength(2);
    expect(report.byRate.map((r) => r.label)).toEqual([
      '55p a mile, first 10,000 miles',
      '25p a mile after 10,000 miles',
    ]);
    expect(report.deduction).toBe(9_950 * 55 + 50 * 55 + 50 * 25);
    expect(report.rows[1].deduction).toBe(50 * 55 + 50 * 25);
  });
});

describe('toCsv', () => {
  it('has a header and one line per trip, in the region’s units and currency', () => {
    const csv = toCsv(buildReport([trip({}), trip({})], US, 2026));
    const lines = csv.trim().split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('Deduction (USD)');
    expect(lines[1]).toContain('Client visit');
    expect(lines[1]).toContain('72.5¢');
    expect(lines[1]).toContain('7.25');

    const au = toCsv(buildReport([trip({ localDate: '2026-08-01', units: 100 }, AU)], AU, 2026));
    expect(au).toContain('Kilometres');
    expect(au).toContain('91c');
    expect(au).toContain('91.00');
  });

  it('quotes commas and quotes, and keeps formulas as text', () => {
    const csv = toCsv(
      buildReport([trip({ startLabel: 'Acme, Inc. "HQ"', endLabel: '=HYPERLINK("x")' })], US, 2026),
    );
    expect(csv).toContain('"Acme, Inc. ""HQ"""');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });

  it('marks edited trips', () => {
    const edited = trip({});
    const csv = toCsv(buildReport([edited], US, 2026, { editedIds: new Set([edited.id]) }));
    expect(csv.trim().split('\r\n')[1].endsWith(',Yes')).toBe(true);
  });
});

describe('toReportHtml', () => {
  it('escapes place names and shows the total', () => {
    const html = toReportHtml(buildReport([trip({ startLabel: '<script>' })], US, 2026), new Date('2026-10-01'));
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('$7.25');
    expect(html).toContain('Schedule C');
  });

  it('uses pounds, the UK tax year and A4 for the UK', () => {
    const html = toReportHtml(buildReport([trip({ localDate: '2026-05-01' }, GB)], GB, 2026));
    expect(html).toContain('2026/27 tax year');
    expect(html).toContain('£5.50');
    expect(html).not.toContain('Schedule C');
    expect(pageSize(GB)).toEqual({ width: 595, height: 842 });
  });
});
