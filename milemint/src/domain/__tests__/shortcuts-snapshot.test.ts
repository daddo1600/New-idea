import { describe, expect, it } from '@jest/globals';

import { translate } from '../../i18n/i18n';
import { fromUnits, inEnglish, REGIONS, type Region } from '../regions';
import { SHORTCUTS_SNAPSHOT_VERSION, shortcutsSnapshot } from '../shortcuts-snapshot';
import type { Trip } from '../trip';

const { GB, AU } = REGIONS;

let next = 0;
function trip(region: Region, localDate: string, units: number, overrides: Partial<Trip> = {}): Trip {
  next += 1;
  return {
    id: `t${next}`,
    startedAt: `${localDate}T09:00:00.000Z`,
    localDate,
    endedAt: `${localDate}T09:30:00.000Z`,
    startLabel: 'Restaurant',
    endLabel: 'Customer',
    distanceMeters: fromUnits(units, region),
    classification: 'business',
    purpose: 'Deliveries',
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

// Friday 2 October 2026, midday on the phone's clock: the week started on Monday 28 September.
const NOW = new Date(2026, 9, 2, 12, 0, 0);

describe('shortcutsSnapshot', () => {
  it('counts work drives today and since Monday, at the region’s rate', () => {
    const trips = [
      trip(GB, '2026-10-02', 10),
      trip(GB, '2026-10-02', 3, { classification: 'unclassified' }),
      trip(GB, '2026-09-30', 20),
      trip(GB, '2026-09-30', 5, { classification: 'personal' }),
      // Last Sunday: last week.
      trip(GB, '2026-09-27', 30),
    ];
    const snapshot = shortcutsSnapshot({ trips, region: GB, now: NOW, isPro: true }, inEnglish);
    expect(snapshot.version).toBe(SHORTCUTS_SNAPSHOT_VERSION);
    expect(snapshot.isPro).toBe(true);
    expect(snapshot.updatedAt).toBe(NOW.getTime());
    expect(snapshot.today).toBe('2026-10-02');
    expect(snapshot.weekStart).toBe('2026-09-28');
    // 10 miles at 55p.
    expect(snapshot.todayFigures).toMatchObject({ drives: 1, valueMinor: 550, distance: '10.0 mi', value: '£5.50' });
    expect(snapshot.todayFigures.spoken).toBe('You’ve driven 10.0 mi for work today, worth about £5.50.');
    expect(snapshot.todayFigures.worth).toBe('Worth about £5.50');
    // 30 miles at 55p.
    expect(snapshot.weekFigures).toMatchObject({ drives: 2, valueMinor: 1650, distance: '30.0 mi', value: '£16.50' });
    expect(snapshot.weekFigures.spoken).toBe('You’ve driven 30.0 mi for work this week, worth about £16.50.');
  });

  it('says so when there are no work drives yet', () => {
    const trips = [trip(GB, '2026-10-01', 8), trip(GB, '2026-10-02', 4, { classification: 'personal' })];
    const snapshot = shortcutsSnapshot({ trips, region: GB, now: NOW, isPro: true }, inEnglish);
    expect(snapshot.todayFigures.drives).toBe(0);
    expect(snapshot.todayFigures.spoken).toBe('No work drives yet today.');
    expect(snapshot.weekFigures.drives).toBe(1);
    // What a new day or week starts from, before the app has run again.
    expect(snapshot.todayEmpty).toMatchObject({ drives: 0, meters: 0, valueMinor: 0, distance: '0.0 mi', value: '£0.00' });
    expect(snapshot.todayEmpty.spoken).toBe('No work drives yet today.');
    expect(snapshot.weekEmpty.spoken).toBe('No work drives yet this week.');
  });

  it('values the week at the tier the tax year has reached', () => {
    // 10,000 business miles earlier in the tax year: this week's are at 25p, not 55p.
    const trips = [trip(GB, '2026-05-01', 10_000), trip(GB, '2026-09-29', 40)];
    const snapshot = shortcutsSnapshot({ trips, region: GB, now: NOW, isPro: true }, inEnglish);
    expect(snapshot.weekFigures.valueMinor).toBe(1000);
  });

  it('adds parking and tolls where they count', () => {
    const trips = [trip(GB, '2026-10-02', 10, { parkingMinor: 300, tollsMinor: 150 })];
    const snapshot = shortcutsSnapshot({ trips, region: GB, now: NOW, isPro: true }, inEnglish);
    expect(snapshot.todayFigures.valueMinor).toBe(550 + 450);
  });

  it('gives a UK employee the relief left after what the employer pays, without parking', () => {
    const trips = [trip(GB, '2026-10-02', 10, { parkingMinor: 300 }), trip(GB, '2026-09-28', 20)];
    const snapshot = shortcutsSnapshot(
      { trips, region: GB, now: NOW, isPro: true, employee: true, employerRate: 250 },
      inEnglish,
    );
    // 30 miles: 55p from HMRC's rate, 25p paid by the employer.
    expect(snapshot.weekFigures.valueMinor).toBe(1650 - 750);
    expect(snapshot.todayFigures.valueMinor).toBe(550 - 250);
  });

  it('uses the region’s unit and currency', () => {
    const snapshot = shortcutsSnapshot({ trips: [trip(AU, '2026-10-02', 12)], region: AU, now: NOW, isPro: false }, inEnglish);
    expect(snapshot.isPro).toBe(false);
    expect(snapshot.todayFigures.distance).toBe('12.0 km');
    // 12 km at 91c.
    expect(snapshot.todayFigures.valueMinor).toBe(1092);
  });

  it('is in the app’s language', () => {
    const fr = (key: string, params?: Record<string, string | number>) => translate('fr', key, params);
    const snapshot = shortcutsSnapshot({ trips: [], region: GB, now: NOW, isPro: false }, fr);
    expect(snapshot.text.thisWeek).toBe('Cette semaine');
    expect(snapshot.weekFigures.spoken).toBe('Aucun trajet de travail pour l’instant cette semaine.');
    expect(snapshot.text.proOnly).toContain('MileSprout Pro');
  });
});
