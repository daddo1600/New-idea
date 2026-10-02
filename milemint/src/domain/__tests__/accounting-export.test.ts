import { describe, expect, it } from '@jest/globals';

import { exportFile, toExpenseClaim, toFreeAgentMileage, toQuickBooksJournals, toXeroJournals } from '../accounting-export';
import { REGIONS, fromUnits, type Region } from '../regions';
import { buildReport } from '../report';
import type { Trip } from '../trip';

const { GB, US } = REGIONS;
let next = 0;
function trip(localDate: string, units: number, overrides: Partial<Trip> = {}, region: Region = GB): Trip {
  next += 1;
  return {
    id: `t${next}`,
    startedAt: `${localDate}T09:00:00.000Z`,
    localDate,
    endedAt: `${localDate}T09:30:00.000Z`,
    startLabel: 'Home',
    endLabel: 'Site',
    distanceMeters: fromUnits(units, region),
    classification: 'business',
    purpose: 'Boiler install',
    source: 'auto',
    createdAt: `${localDate}T09:31:00.000Z`,
    startPlaceId: null,
    endPlaceId: null,
    autoReason: null,
    vehicle: 'car',
    vehicleId: null,
    shiftId: null,
    ...overrides,
  };
}

const rowsOf = (csv: string) => csv.replace(/^﻿/, '').trim().split('\r\n');

describe('accounting exports (UK)', () => {
  const report = buildReport(
    [
      trip('2026-04-10', 20),
      trip('2026-04-22', 10),
      trip('2026-05-03', 30),
      trip('2026-05-04', 5, { classification: 'personal', purpose: '' }),
    ],
    GB,
    2026,
  );

  it('books one balanced Xero journal per month at HMRC rates', () => {
    const rows = rowsOf(toXeroJournals(report));
    expect(rows[0]).toBe('*Narration,*Date,Description,*AccountCode,*TaxRate,*Amount');
    expect(rows).toHaveLength(5);
    // April: 30 miles at 55p = £16.50, debit expenses, credit owner funds, on the last day of the month.
    expect(rows[1]).toContain('30/04/2026');
    expect(rows[1]).toMatch(/,449,No VAT,16\.50$/);
    expect(rows[2]).toMatch(/,881,No VAT,-16\.50$/);
    expect(rows[3]).toMatch(/,449,No VAT,16\.50$/);
  });

  it('writes QuickBooks journal entries with debits and credits', () => {
    const rows = rowsOf(toQuickBooksJournals(report));
    expect(rows[0]).toBe('Journal No.,Journal Date,Account Name,Debits,Credits,Description');
    expect(rows[1]).toMatch(/^MM-202627-01,30\/04\/2026,Motor Vehicle Expenses,16\.50,,/);
    expect(rows[2]).toMatch(/^MM-202627-01,30\/04\/2026,Owner's Capital,,16\.50,/);
  });

  it('lists business trips only for FreeAgent and expense claims', () => {
    const freeagent = rowsOf(toFreeAgentMileage(report));
    expect(freeagent).toHaveLength(4);
    expect(freeagent[1]).toContain('Boiler install: Home → Site');
    const claim = rowsOf(toExpenseClaim(report));
    expect(claim[0]).toBe(
      'Date,From,To,Business purpose,Miles,Vehicle,Rate (HMRC),Amount (GBP),Parking (GBP),Tolls (GBP),Total (GBP)',
    );
    expect(claim[1]).toMatch(/^10\/04\/2026,Home,Site,Boiler install,20\.0,/);
  });

  it('names each file for where it goes', () => {
    expect(exportFile(report, 'xero').name).toBe('MileSprout 2026-27 Xero manual journals.csv');
    expect(exportFile(report, 'spreadsheet').name).toBe('MileSprout 2026-27 mileage log.csv');
  });
});

describe('accounting exports (US)', () => {
  it('uses US dates and QuickBooks account names', () => {
    const report = buildReport([trip('2026-03-10', 100, {}, US)], US, 2026);
    const rows = rowsOf(toQuickBooksJournals(report));
    expect(rows[1]).toMatch(/^MM-2026-01,3\/31\/2026,Car & Truck,72\.50,,/);
  });
});
