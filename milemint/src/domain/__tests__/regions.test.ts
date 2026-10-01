import { describe, expect, it } from '@jest/globals';

import { LANGUAGES, setLanguage } from '../../i18n/i18n';
import {
  computeDeductions,
  displayLocale,
  formatDistance,
  formatMoney,
  formatRate,
  fromUnits,
  potentialDeduction,
  regionFromLocale,
  REGIONS,
  summarizeTaxYear,
  taxYearLabel,
  taxYearOf,
  type DeductionTrip,
} from '../regions';

const { US, GB, CA, AU } = REGIONS;

let next = 0;
function trip(localDate: string, units: number, region = US, classification: DeductionTrip['classification'] = 'business'): DeductionTrip {
  next += 1;
  return {
    id: `t${next}`,
    localDate,
    startedAt: `${localDate}T12:00:00.000Z`,
    distanceMeters: fromUnits(units, region),
    classification,
  };
}

describe('tax years', () => {
  it('UK tax year starts on 6 April', () => {
    expect(taxYearOf('2026-04-05', GB)).toBe(2025);
    expect(taxYearOf('2026-04-06', GB)).toBe(2026);
    expect(taxYearLabel(2026, GB)).toBe('2026/27');
  });

  it('Australian tax year starts on 1 July', () => {
    expect(taxYearOf('2026-06-30', AU)).toBe(2025);
    expect(taxYearOf('2026-07-01', AU)).toBe(2026);
    expect(taxYearLabel(2026, AU)).toBe('2026–27');
  });

  it('US and Canada use the calendar year', () => {
    expect(taxYearOf('2026-12-31', US)).toBe(2026);
    expect(taxYearLabel(2026, CA)).toBe('2026');
  });
});

describe('computeDeductions', () => {
  it('US: 72.5¢ then 76¢ from 1 July 2026', () => {
    const a = trip('2026-06-30', 100);
    const b = trip('2026-07-01', 100);
    const d = computeDeductions([a, b], US);
    expect(d.get(a.id)).toBe(7250);
    expect(d.get(b.id)).toBe(7600);
  });

  it('UK: 55p up to 10,000 business miles, then 25p, split inside the crossing trip', () => {
    const first = trip('2026-05-01', 9_900, GB);
    const crossing = trip('2026-06-01', 200, GB); // 100 at 55p + 100 at 25p
    const after = trip('2026-07-01', 100, GB);
    const d = computeDeductions([after, crossing, first], GB);
    expect(d.get(first.id)).toBe(9_900 * 55);
    expect(d.get(crossing.id)).toBe(100 * 55 + 100 * 25);
    expect(d.get(after.id)).toBe(100 * 25);
  });

  it('UK: the old 45p rate before 6 April 2026, and the allowance resets each tax year', () => {
    const old = trip('2026-04-05', 10_000, GB);
    const fresh = trip('2026-04-06', 100, GB);
    const d = computeDeductions([old, fresh], GB);
    expect(d.get(old.id)).toBe(10_000 * 45);
    expect(d.get(fresh.id)).toBe(100 * 55);
  });

  it('Canada: 73¢ for the first 5,000 km, then 67¢', () => {
    const a = trip('2026-02-01', 4_000, CA);
    const b = trip('2026-03-01', 2_000, CA);
    const d = computeDeductions([a, b], CA);
    expect(d.get(a.id)).toBe(4_000 * 73);
    expect(d.get(b.id)).toBe(1_000 * 73 + 1_000 * 67);
  });

  it('Australia: 91c a km, nothing beyond 5,000 km in the year', () => {
    const a = trip('2026-07-10', 4_500, AU);
    const b = trip('2026-08-10', 1_000, AU);
    const d = computeDeductions([a, b], AU);
    expect(d.get(a.id)).toBe(4_500 * 91);
    expect(d.get(b.id)).toBe(500 * 91);
    expect(d.get(a.id)! + d.get(b.id)!).toBe(455_000); // the $4,550 cap
  });

  it('personal and unclassified trips earn nothing and use none of the allowance', () => {
    const personal = trip('2026-05-01', 9_999, GB, 'personal');
    const business = trip('2026-05-02', 10, GB);
    const d = computeDeductions([personal, business], GB);
    expect(d.has(personal.id)).toBe(false);
    expect(d.get(business.id)).toBe(550);
  });
});

describe('potentialDeduction', () => {
  it('prices an unsorted trip at the tier the year has reached', () => {
    const done = trip('2026-05-01', 10_000, GB);
    const unsorted = trip('2026-06-01', 100, GB, 'unclassified');
    expect(potentialDeduction(unsorted, [done, unsorted], GB)).toBe(100 * 25);
  });
});

describe('summarizeTaxYear', () => {
  it('adds up one UK tax year only', () => {
    const trips = [trip('2026-04-05', 10, GB), trip('2026-04-06', 10, GB), trip('2027-04-05', 10, GB, 'unclassified')];
    const summary = summarizeTaxYear(trips, GB, 2026);
    expect(summary.tripCount).toBe(2);
    expect(summary.deduction).toBe(550);
    expect(summary.unclassifiedCount).toBe(1);
    expect(summary.label).toBe('2026/27');
  });
});

describe('formatting', () => {
  it('uses each country’s currency and unit', () => {
    expect(formatMoney(123456, US)).toBe('$1,234.56');
    expect(formatMoney(123456, GB)).toBe('£1,234.56');
    expect(formatDistance(fromUnits(1234.5, CA), CA)).toBe('1,234.5 km');
    expect(formatRate(550, GB)).toBe('55p');
    expect(formatRate(725, US)).toBe('72.5¢');
    expect(formatRate(910, AU)).toBe('91c');
  });

  it('reads the region from the phone’s locale', () => {
    expect(regionFromLocale('en-GB')).toBe('GB');
    expect(regionFromLocale('en_AU')).toBe('AU');
    expect(regionFromLocale('fr-CA')).toBe('CA');
    expect(regionFromLocale('de-DE')).toBeNull();
  });
});

describe('displayLocale', () => {
  it('makes a valid tag for every language and country', () => {
    for (const { code } of LANGUAGES) {
      setLanguage(code);
      for (const region of Object.values(REGIONS)) {
        const tag = displayLocale(region);
        expect(() => new Date(Date.UTC(2026, 9, 1)).toLocaleDateString(tag)).not.toThrow();
      }
    }
    setLanguage('pt-BR');
    expect(displayLocale(REGIONS.GB)).toBe('pt-GB');
    setLanguage('zh-Hans');
    expect(displayLocale(REGIONS.AU)).toBe('zh-Hans-AU');
    setLanguage('en');
  });
});
