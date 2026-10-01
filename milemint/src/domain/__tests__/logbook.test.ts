import { describe, expect, it } from '@jest/globals';

import { toLogbookCsv } from '../accounting-export';
import {
  addDays,
  carsOverKmLimit,
  centsPerKmForVehicle,
  compareMethods,
  logbookDeduction,
  logbookForYear,
  logbooksForReport,
  logbookValidFor,
  plannedEndDate,
  summarizeLogbook,
  totalExpenses,
  validTaxYears,
  type Logbook,
} from '../logbook';
import { REGIONS } from '../regions';
import { buildReport, toReportHtml } from '../report';
import type { Trip } from '../trip';

const { AU, GB } = REGIONS;

let next = 0;
function trip(overrides: Partial<Trip> & { km?: number } = {}): Trip {
  next += 1;
  const { km = 10, ...rest } = overrides;
  const localDate = rest.localDate ?? '2026-07-10';
  return {
    id: `t${next}`,
    startedAt: `${localDate}T${String(next % 24).padStart(2, '0')}:00:00.000Z`,
    localDate,
    // No end time: the journey's end date is its start date, whatever the test machine's time zone.
    endedAt: null,
    startLabel: 'Depot',
    endLabel: 'Site',
    distanceMeters: km * 1000,
    classification: 'business',
    purpose: 'Job at site',
    source: 'auto',
    createdAt: `${localDate}T23:00:00.000Z`,
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: 'ute',
    shiftId: null,
    ...rest,
  };
}

function logbook(overrides: Partial<Logbook> = {}): Logbook {
  const startDate = overrides.startDate ?? '2026-07-06';
  return {
    id: 'lb1',
    vehicleId: 'ute',
    startDate,
    endDate: plannedEndDate(startDate),
    odometerStart: 50_000,
    odometerEnd: null,
    createdAt: '2026-07-06T00:00:00.000Z',
    ...overrides,
  };
}

describe('dates', () => {
  it('plans a 12-week period, both ends included', () => {
    expect(plannedEndDate('2026-07-06')).toBe('2026-09-27');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('is valid for the income year it was kept in and the next 4', () => {
    expect(validTaxYears({ startDate: '2026-07-06' })).toEqual({ first: 2026, last: 2030 });
    // Started in May, ends in August: counts as kept in the year it started.
    expect(validTaxYears({ startDate: '2026-05-04' })).toEqual({ first: 2025, last: 2029 });
  });
});

describe('summarizeLogbook', () => {
  const trips = [
    trip({ localDate: '2026-07-07', km: 30 }),
    trip({ localDate: '2026-07-08', km: 20, classification: 'personal', purpose: '' }),
    trip({ localDate: '2026-07-09', km: 50 }),
    trip({ localDate: '2026-07-10', km: 5, classification: 'unclassified', purpose: '' }),
    trip({ localDate: '2026-07-11', km: 15, purpose: ' ' }),
    // Other car, and outside the period: left out.
    trip({ localDate: '2026-07-09', km: 999, vehicleId: 'other' }),
    trip({ localDate: '2026-07-05', km: 999 }),
    trip({ localDate: '2026-09-28', km: 999 }),
  ];

  it('tracks progress through the 12 weeks', () => {
    const summary = summarizeLogbook(logbook(), trips, '2026-07-20');
    expect(summary.status).toBe('in-progress');
    expect(summary.week).toBe(3);
    expect(summary.daysElapsed).toBe(15);
    expect(summary.daysLeft).toBe(84 - 15);
    expect(summarizeLogbook(logbook(), trips, '2026-07-06').week).toBe(1);
    expect(summarizeLogbook(logbook(), trips, '2026-09-27').week).toBe(12);
    expect(summarizeLogbook(logbook(), trips, '2026-07-01').status).toBe('not-started');
  });

  it('falls back to logged km while the end odometer is missing, and flags it', () => {
    const summary = summarizeLogbook(logbook(), trips, '2026-07-20');
    expect(summary.loggedKm).toBeCloseTo(120);
    expect(summary.businessKm).toBeCloseTo(95);
    expect(summary.basis).toBe('logged');
    expect(summary.totalKm).toBeCloseTo(120);
    expect(summary.businessPercent).toBe(79);
    expect(summary.unclassifiedCount).toBe(1);
    expect(summary.missingReasonCount).toBe(1);
  });

  it('uses the odometer for the total once both readings are in', () => {
    const summary = summarizeLogbook(logbook({ odometerEnd: 50_200 }), trips, '2026-10-01');
    expect(summary.status).toBe('complete');
    expect(summary.basis).toBe('odometer');
    expect(summary.totalKm).toBe(200);
    expect(summary.businessPercent).toBe(48);
  });

  it('works out each journey’s odometer from the start reading and GPS distance of every drive', () => {
    const { journeys } = summarizeLogbook(logbook(), trips, '2026-07-20');
    expect(journeys.map((j) => [j.odometerStart, j.odometerEnd])).toEqual([
      [50_000, 50_030],
      // The private 20 km drive in between moves the odometer too.
      [50_050, 50_100],
      [50_105, 50_120],
    ]);
    expect(journeys[0].startDate).toBe('2026-07-07');
    expect(journeys[0].endDate).toBe('2026-07-07');
    const noStart = summarizeLogbook(logbook({ odometerStart: null }), trips, '2026-07-20');
    expect(noStart.journeys[0].odometerStart).toBeNull();
  });

  it('ignores readings that don’t add up', () => {
    const summary = summarizeLogbook(logbook({ odometerEnd: 50_010 }), trips, '2026-10-01');
    expect(summary.readingsInconsistent).toBe(true);
    expect(summary.basis).toBe('logged');
  });

  it('is not valid when closed early', () => {
    const summary = summarizeLogbook(logbook({ endDate: '2026-08-01', odometerEnd: 50_200 }), trips, '2026-10-01');
    expect(summary.status).toBe('closed-early');
    expect(logbookValidFor(summary, 2026)).toBe(false);
  });

  it('is valid for 5 income years once complete with both readings', () => {
    const summary = summarizeLogbook(logbook({ odometerEnd: 50_200 }), trips, '2026-10-01');
    expect(logbookValidFor(summary, 2025)).toBe(false);
    expect(logbookValidFor(summary, 2026)).toBe(true);
    expect(logbookValidFor(summary, 2030)).toBe(true);
    expect(logbookValidFor(summary, 2031)).toBe(false);
    const noEnd = summarizeLogbook(logbook(), trips, '2026-10-01');
    expect(logbookValidFor(noEnd, 2026)).toBe(false);
  });

  it('picks the newest valid logbook for a year, or the one kept that year for the report', () => {
    const old = summarizeLogbook(logbook({ id: 'old', startDate: '2022-08-01', odometerEnd: 60_000 }), [], '2026-10-01');
    const current = summarizeLogbook(logbook({ odometerEnd: 50_200 }), trips, '2026-10-01');
    expect(logbookForYear([old, current], 'ute', 2026)?.logbook.id).toBe('lb1');
    expect(logbookForYear([old], 'ute', 2026)?.logbook.id).toBe('old');
    expect(logbookForYear([old], 'ute', 2027)).toBeNull();
    const running = summarizeLogbook(logbook({ id: 'running', startDate: '2027-07-05' }), [], '2027-08-01');
    expect(logbooksForReport([old, running], 2027).map((s) => s.logbook.id)).toEqual(['running']);
  });
});

describe('deduction estimate and comparison', () => {
  it('applies the business-use % to the year’s expenses', () => {
    const expenses = { fuel: 400_000, registration: 90_000, insurance: 110_000, depreciation: 400_000 };
    expect(totalExpenses(expenses)).toBe(1_000_000);
    expect(logbookDeduction(expenses, 80)).toBe(800_000);
    expect(logbookDeduction(expenses, null)).toBeNull();
    expect(logbookDeduction({}, 80)).toBeNull();
    expect(logbookDeduction(null, 80)).toBeNull();
  });

  it('caps cents per km at 5,000 km per car', () => {
    const trips = [trip({ km: 4_000 }), trip({ km: 3_000 }), trip({ km: 500, vehicleId: 'other' })];
    const estimate = centsPerKmForVehicle(trips, 'ute', 2026);
    expect(estimate.businessKm).toBe(7_000);
    expect(estimate.claimableKm).toBe(5_000);
    expect(estimate.deduction).toBe(455_000); // 5,000 km × 91c
  });

  it('says which method looks better', () => {
    expect(compareMethods(455_000, 800_000)).toEqual({
      better: 'logbook',
      centsPerKm: 455_000,
      logbook: 800_000,
      difference: 345_000,
    });
    expect(compareMethods(455_000, 300_000).better).toBe('cents-per-km');
    expect(compareMethods(455_000, 455_000).better).toBe('same');
    expect(compareMethods(455_000, null).better).toBe('unknown');
  });
});

describe('carsOverKmLimit', () => {
  it('finds cars past or on track to pass 5,000 km', () => {
    const trips = [
      // 1,200 km in the first 31 days of the year: about 14,000 km by June.
      trip({ localDate: '2026-07-15', km: 1_200 }),
      trip({ localDate: '2026-07-15', km: 100, vehicleId: 'small' }),
      trip({ localDate: '2026-07-20', km: 900, classification: 'personal', vehicleId: 'small' }),
    ];
    const cars = carsOverKmLimit(trips, '2026-07-31');
    expect(cars.map((car) => car.vehicleId)).toEqual(['ute']);
    expect(cars[0].projectedKm).toBeGreaterThan(5_000);
  });

  it('waits a few weeks before projecting', () => {
    expect(carsOverKmLimit([trip({ localDate: '2026-07-02', km: 300 })], '2026-07-05')).toEqual([]);
    expect(carsOverKmLimit([trip({ localDate: '2026-07-02', km: 5_100 })], '2026-07-05')).toHaveLength(1);
  });

  it('only applies where the limit is per car', () => {
    expect(carsOverKmLimit([trip({ km: 9_000 })], '2026-09-01', GB)).toEqual([]);
  });
});

describe('ATO logbook export', () => {
  const trips = [
    trip({ localDate: '2026-07-07', km: 30, purpose: 'Quote, Smith St' }),
    trip({ localDate: '2026-07-08', km: 20, classification: 'personal', purpose: '' }),
  ];
  const summary = summarizeLogbook(logbook({ odometerEnd: 50_100 }), trips, '2026-10-01');

  it('has every field the ATO asks for', () => {
    const csv = toLogbookCsv(summary, 'Hilux (ABC123)');
    expect(csv.startsWith('﻿')).toBe(true);
    for (const field of [
      'Logbook period start,06/07/2026',
      'Logbook period end,27/09/2026',
      'Odometer at start of period (km),50000.0',
      'Odometer at end of period (km),50100.0',
      'Total km travelled in the period,100.0,Odometer end minus start',
      'Business km travelled in the period,30.0',
      'Business-use percentage,30%',
      'Can be used for income years,2026–27 to 2030–31',
      'Journey start date,Journey end date,Odometer at start (km),Odometer at end (km),Km travelled,Reason for the journey',
      '07/07/2026,07/07/2026,50000.0,50030.0,30.0,"Quote, Smith St",Depot,Site,Calculated from GPS distance',
    ]) {
      expect(csv).toContain(field);
    }
    // Private drives aren't journeys in the logbook.
    expect(csv.split('\r\n').filter((line) => line.startsWith('08/07/2026'))).toEqual([]);
  });

  it('adds a logbook section and estimate to the Australian PDF', () => {
    const expenses = { fuel: 300_000, insurance: 100_000 };
    const report = buildReport(trips, AU, 2026, {
      vehicles: [{ id: 'ute', name: 'Hilux', type: 'car', registration: 'ABC123' }],
      logbooks: [{ summary, expenses }],
    });
    expect(report.logbooks).toHaveLength(1);
    expect(report.logbooks[0].valid).toBe(true);
    expect(report.logbooks[0].logbookEstimate).toBe(120_000);
    const html = toReportHtml(report, new Date('2026-10-01T00:00:00Z'));
    expect(html).toContain('ATO logbook · Hilux (ABC123)');
    expect(html).toContain('Business-use percentage');
    expect(html).toContain('30%');
    expect(html).toContain('Logbook method: expenses × 30% business use');
  });

  it('leaves logbooks out of other countries’ reports', () => {
    const report = buildReport(trips, GB, 2026, { logbooks: [{ summary, expenses: null }] });
    expect(report.logbooks).toEqual([]);
    expect(toReportHtml(report)).not.toContain('ATO logbook');
  });
});
