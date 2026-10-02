import { describe, expect, it } from '@jest/globals';

import {
  checkDraft,
  detectDistance,
  detectPeriod,
  detectPlatform,
  detectTotal,
  detectTripCount,
  isDuplicate,
  isPlatformId,
  parseEarningsScreenshot,
  platformChoices,
  weekOfPeriod,
  workMetersBetween,
  type EarningDraft,
  type PlatformEarning,
} from '../earnings-scan';
import { METERS_PER_MILE } from '../trip';

/** A Friday: Monday 28 September 2026 started the week. */
const TODAY = '2026-10-02';
const miles = (n: number) => Math.round(n * METERS_PER_MILE);

// ─── Whole screenshots, as Vision reads them (rows on one line where they sit side by side) ───

describe('parseEarningsScreenshot', () => {
  it('reads an Uber Eats weekly summary (GB): Monday-to-Monday week, headline figure, trips and miles', () => {
    const lines = [
      '9:41',
      'Earnings',
      'Uber Eats',
      'Sep 21 - Sep 28',
      '£412.35',
      '18 trips',
      'Online 23 h 15 m',
      'Fare £356.10',
      'Tips £32.00',
      'Promotions £24.25',
      'Distance on trips 142.3 mi',
    ];
    expect(parseEarningsScreenshot(lines, 'GB', TODAY)).toEqual({
      platform: 'uber-eats',
      start: '2026-09-21',
      end: '2026-09-27',
      amountMinor: 41_235,
      trips: 18,
      distanceMeters: miles(142.3),
    });
  });

  it('reads a Deliveroo week (GB): day-first range and "Orders 12"', () => {
    const lines = [
      'deliveroo',
      'Your fees',
      '22–28 Sept',
      'Orders 12',
      'Total £186.40',
      'Delivery fees £171.40',
      'Tips £15.00',
    ];
    expect(parseEarningsScreenshot(lines, 'GB', TODAY)).toEqual({
      platform: 'deliveroo',
      start: '2026-09-22',
      end: '2026-09-28',
      amountMinor: 18_640,
      trips: 12,
      distanceMeters: null,
    });
  });

  it('reads a DoorDash week (US): thousands, weekdays in the range, label under the figure', () => {
    const lines = [
      'DoorDash',
      'Earnings',
      'Mon, Sep 21 - Sun, Sep 27',
      '$1,234.56',
      'Total earnings',
      '23 deliveries',
      'Active time 21 hr 4 min',
      'DoorDash pay $890.10',
      'Customer tips $344.46',
      '$15.20/hr',
      '187.2 mi',
    ];
    expect(parseEarningsScreenshot(lines, 'US', TODAY)).toEqual({
      platform: 'doordash',
      start: '2026-09-21',
      end: '2026-09-27',
      amountMinor: 123_456,
      trips: 23,
      distanceMeters: miles(187.2),
    });
  });

  it('reads a Just Eat day (GB): one date with its weekday', () => {
    const lines = ['Just Eat', 'Mon 28 Sep', 'Total earnings £96.20', 'Deliveries 9', '31 mi'];
    expect(parseEarningsScreenshot(lines, 'GB', TODAY)).toEqual({
      platform: 'just-eat',
      start: '2026-09-28',
      end: '2026-09-28',
      amountMinor: 9_620,
      trips: 9,
      distanceMeters: miles(31),
    });
  });

  it('reads an Uber week in Australia: A$, km and "Trips 31"', () => {
    const lines = ['Uber', 'Weekly summary', '14 Sep – 20 Sep', 'Net earnings A$842.10', 'Trips 31', 'Distance 229 km'];
    expect(parseEarningsScreenshot(lines, 'AU', TODAY)).toEqual({
      platform: 'uber',
      start: '2026-09-14',
      end: '2026-09-20',
      amountMinor: 84_210,
      trips: 31,
      distanceMeters: 229_000,
    });
  });

  it('reads a Menulog week (AU) with a plain $', () => {
    const lines = ['Menulog Courier', 'Sep 21 – 27', 'Total pay $655.00', '41 orders'];
    expect(parseEarningsScreenshot(lines, 'AU', TODAY)).toMatchObject({
      platform: 'menulog',
      start: '2026-09-21',
      end: '2026-09-27',
      amountMinor: 65_500,
      trips: 41,
    });
  });

  it('reads a SkipTheDishes week (CA) with CA$ and kilometres', () => {
    const lines = ['SkipTheDishes', 'Sept 21-27, 2026', 'Total CA$512.75', 'Completed deliveries: 37', '388.5 km'];
    expect(parseEarningsScreenshot(lines, 'CA', TODAY)).toEqual({
      platform: 'skip',
      start: '2026-09-21',
      end: '2026-09-27',
      amountMinor: 51_275,
      trips: 37,
      distanceMeters: 388_500,
    });
  });

  it('reads a Lyft week in progress (US): it can end after today', () => {
    const lines = ['lyft', 'This week', 'Sep 28 - Oct 4', 'Ride earnings $301.40', '14 rides'];
    expect(parseEarningsScreenshot(lines, 'US', TODAY)).toMatchObject({
      platform: 'lyft',
      start: '2026-09-28',
      end: '2026-10-04',
      amountMinor: 30_140,
      trips: 14,
    });
  });

  it('reads Instacart batches and Grubhub orders', () => {
    expect(
      parseEarningsScreenshot(['Instacart', 'Sep 21 - Sep 27', 'Batches 14', 'Total earnings $402.18'], 'US', TODAY),
    ).toMatchObject({ platform: 'instacart', trips: 14, amountMinor: 40_218 });
    expect(parseEarningsScreenshot(['GRUBHUB', 'Sep 22–28', 'Orders: 15', 'You earned $288.00'], 'US', TODAY)).toMatchObject(
      { platform: 'grubhub', start: '2026-09-22', end: '2026-09-28', trips: 15, amountMinor: 28_800 },
    );
  });

  it('reads Amazon Flex without a trip count (blocks aren’t trips)', () => {
    const lines = ['amazon flex', 'Earnings', 'Sep 21 – Sep 27', '£288.00', '4 blocks'];
    expect(parseEarningsScreenshot(lines, 'GB', TODAY)).toEqual({
      platform: 'amazon-flex',
      start: '2026-09-21',
      end: '2026-09-27',
      amountMinor: 28_800,
      trips: null,
      distanceMeters: null,
    });
  });

  it('leaves everything empty for a screenshot that isn’t an earnings page', () => {
    expect(parseEarningsScreenshot(['Messages', 'See you at 6', 'Delivered'], 'GB', TODAY)).toEqual({
      platform: null,
      start: null,
      end: null,
      amountMinor: null,
      trips: null,
      distanceMeters: null,
    });
    expect(parseEarningsScreenshot([], 'US', TODAY).amountMinor).toBeNull();
  });
});

// ─── Each part ─────────────────────────────────────────────────────────────

describe('detectPlatform', () => {
  it('tells Uber Eats from Uber', () => {
    expect(detectPlatform(['Uber Eats', 'Earnings'])).toBe('uber-eats');
    expect(detectPlatform(['UberEats'])).toBe('uber-eats');
    expect(detectPlatform(['Uber', 'Driver'])).toBe('uber');
    expect(detectPlatform(['Uber Eats', 'Uber Eats deliveries'])).toBe('uber-eats');
  });

  it('knows the apps’ own words', () => {
    expect(detectPlatform(['Dasher earnings'])).toBe('doordash');
    expect(detectPlatform(['Just Eat Takeaway.com'])).toBe('just-eat');
    expect(detectPlatform(['Skip The Dishes'])).toBe('skip');
  });

  it('only takes Stuart from its logo line or web address, not a name', () => {
    expect(detectPlatform(['Stuart', 'Your week'])).toBe('stuart');
    expect(detectPlatform(['stuart.com/couriers'])).toBe('stuart');
    expect(detectPlatform(['Hi Stuart, here’s your week'])).toBeNull();
  });

  it('is unsure when two different apps are named', () => {
    expect(detectPlatform(['Uber Eats £120.00', 'Deliveroo £80.00'])).toBeNull();
  });
});

describe('detectTotal', () => {
  it('prefers a line saying "total"', () => {
    expect(detectTotal(['Earnings £300.00', 'Total £412.35'], 'GB')).toBe(41_235);
  });

  it('takes the amount on the line below or above a label', () => {
    expect(detectTotal(['Total earnings', '£412.35'], 'GB')).toBe(41_235);
    expect(detectTotal(['$1,234.56', 'Total earnings'], 'US')).toBe(123_456);
  });

  it('never takes tips, fares, hourly rates, balances or the year so far', () => {
    expect(detectTotal(['Tips £32.00', 'Fare £356.10'], 'GB')).toBeNull();
    expect(detectTotal(['Earnings per hour $18.20', 'Year to date earnings $9,120.00'], 'US')).toBeNull();
    expect(detectTotal(['Balance', '$84.10'], 'US')).toBeNull();
    expect(detectTotal(['$15.20/hr'], 'US')).toBeNull();
  });

  it('falls back to the largest amount alone on its line', () => {
    expect(detectTotal(['£412.35', 'Fare £356.10', '£12.00'], 'GB')).toBe(41_235);
  });

  it('only reads the region’s currency', () => {
    expect(detectTotal(['Total €412.35'], 'GB')).toBeNull();
    expect(detectTotal(['Total £412.35'], 'US')).toBeNull();
    expect(detectTotal(['Total A$842.10'], 'AU')).toBe(84_210);
    expect(detectTotal(['Total AU$ 842.10'], 'AU')).toBe(84_210);
    expect(detectTotal(['Total US$ 99'], 'US')).toBe(9_900);
  });

  it('skips negative amounts', () => {
    expect(detectTotal(['Total - £3.00'], 'GB')).toBeNull();
    expect(detectTotal(['Adjustment -£3.00', 'Total £96.20'], 'GB')).toBe(9_620);
  });

  it('ignores whole numbers that aren’t money and malformed amounts', () => {
    expect(detectTotal(['Total 412'], 'GB')).toBeNull();
    expect(detectTotal(['Total £12.5'], 'GB')).toBeNull();
    expect(detectTotal(['Total £1,234.567'], 'GB')).toBeNull();
  });

  it('ignores a zero or an amount too large to be real', () => {
    expect(detectTotal(['Total £0.00'], 'GB')).toBeNull();
    expect(detectTotal(['Total £250,000.00'], 'GB')).toBeNull();
  });
});

describe('detectTripCount', () => {
  it('reads the count before or after the word', () => {
    expect(detectTripCount(['18 trips'])).toBe(18);
    expect(detectTripCount(['23 deliveries'])).toBe(23);
    expect(detectTripCount(['1 delivery'])).toBe(1);
    expect(detectTripCount(['Orders 12'])).toBe(12);
    expect(detectTripCount(['Trips: 31'])).toBe(31);
    expect(detectTripCount(['Completed trips 9'])).toBe(9);
  });

  it('reads a label with its number on the next line', () => {
    expect(detectTripCount(['Deliveries', '23'])).toBe(23);
  });

  it('isn’t fooled by rates, distances, times or money', () => {
    expect(detectTripCount(['£5.20 per trip'])).toBeNull();
    expect(detectTripCount(['Avg per order 4'])).toBeNull();
    expect(detectTripCount(['Trips 180 mi'])).toBeNull();
    expect(detectTripCount(['Trip 10:41'])).toBeNull();
  });

  it('leaves it empty when the counts disagree', () => {
    expect(detectTripCount(['18 trips', 'Mon 4 trips'])).toBeNull();
    expect(detectTripCount(['0 trips'])).toBeNull();
  });

  it('agrees with itself when the count is said twice', () => {
    expect(detectTripCount(['18 trips', 'Trips 18'])).toBe(18);
  });
});

describe('detectDistance', () => {
  it('reads miles and kilometres', () => {
    expect(detectDistance(['142.3 mi'])).toBe(miles(142.3));
    expect(detectDistance(['229 km'])).toBe(229_000);
    expect(detectDistance(['1,204.5 km'])).toBe(1_204_500);
    expect(detectDistance(['12 miles'])).toBe(miles(12));
    expect(detectDistance(['48.6mi'])).toBe(miles(48.6));
  });

  it('isn’t fooled by rates or minutes', () => {
    expect(detectDistance(['$0.70 per mile'])).toBeNull();
    expect(detectDistance(['£1.20/mi'])).toBeNull();
    expect(detectDistance(['Online 45 min'])).toBeNull();
  });

  it('takes the labelled one when they differ, and is unsure otherwise', () => {
    expect(detectDistance(['Total distance 142.3 mi', 'Longest trip 9.1 mi'])).toBe(miles(142.3));
    expect(detectDistance(['3.2 mi', '4.1 mi'])).toBeNull();
  });
});

describe('detectPeriod', () => {
  const period = (line: string, region: 'GB' | 'US' | 'CA' | 'AU' = 'GB', today = TODAY) =>
    detectPeriod([line], region, today);

  it('reads month-first and day-first ranges', () => {
    expect(period('Sep 22 - Sep 28')).toEqual({ start: '2026-09-22', end: '2026-09-28' });
    expect(period('Sep 22 – 28')).toEqual({ start: '2026-09-22', end: '2026-09-28' });
    expect(period('22–28 Sept')).toEqual({ start: '2026-09-22', end: '2026-09-28' });
    expect(period('22 Sep - 28 Sep')).toEqual({ start: '2026-09-22', end: '2026-09-28' });
    expect(period('September 22 to September 28')).toEqual({ start: '2026-09-22', end: '2026-09-28' });
    expect(period('29 Aug – 4 Sep')).toEqual({ start: '2026-08-29', end: '2026-09-04' });
    expect(period('Week of Sep 21st - 27th')).toEqual({ start: '2026-09-21', end: '2026-09-27' });
  });

  it('uses the year shown', () => {
    expect(period('Sep 22, 2025 - Sep 28, 2025')).toEqual({ start: '2025-09-22', end: '2025-09-28' });
    expect(period('Sep 22 - Sep 28, 2025')).toEqual({ start: '2025-09-22', end: '2025-09-28' });
    expect(period('22 September 2025 – 28 September 2025')).toEqual({ start: '2025-09-22', end: '2025-09-28' });
  });

  it('puts a range without a year in the latest year it has started by', () => {
    expect(period('Nov 2 - Nov 8')).toEqual({ start: '2025-11-02', end: '2025-11-08' });
    expect(period('Dec 29 – Jan 4', 'US', '2027-01-06')).toEqual({ start: '2026-12-29', end: '2027-01-04' });
    expect(period('Dec 29, 2025 – Jan 4, 2026', 'US')).toEqual({ start: '2025-12-29', end: '2026-01-04' });
  });

  it('turns Uber’s Monday-to-Monday week into Monday to Sunday', () => {
    expect(period('Sep 21 - Sep 28')).toEqual({ start: '2026-09-21', end: '2026-09-27' });
  });

  it('reads one day, with or without its weekday', () => {
    expect(period('Mon 28 Sep')).toEqual({ start: '2026-09-28', end: '2026-09-28' });
    expect(period('Monday, 28 September')).toEqual({ start: '2026-09-28', end: '2026-09-28' });
    expect(period('Mon, Sep 28')).toEqual({ start: '2026-09-28', end: '2026-09-28' });
    expect(period('September 28, 2026')).toEqual({ start: '2026-09-28', end: '2026-09-28' });
  });

  it('is unsure about a list of trips each with its own date', () => {
    expect(detectPeriod(['Sep 28 10:41 AM £6.20', 'Sep 29 12:02 PM £7.15'], 'GB', TODAY)).toBeNull();
    expect(detectPeriod(['Mon 28 Sep', '28 Sep'], 'GB', TODAY)).toEqual({ start: '2026-09-28', end: '2026-09-28' });
  });

  it('takes the first range (the heading) when there are several', () => {
    expect(detectPeriod(['Sep 21 – 27', 'Sep 14 – 20'], 'GB', TODAY)).toEqual({ start: '2026-09-21', end: '2026-09-27' });
  });

  it('reads numeric dates in the country’s order', () => {
    expect(period('21/09/2026 - 27/09/2026', 'GB')).toEqual({ start: '2026-09-21', end: '2026-09-27' });
    expect(period('09/21/2026 - 09/27/2026', 'US')).toEqual({ start: '2026-09-21', end: '2026-09-27' });
    expect(period('21/09/26', 'AU')).toEqual({ start: '2026-09-21', end: '2026-09-21' });
    expect(period('21/09/2026', 'CA')).toEqual({ start: '2026-09-21', end: '2026-09-21' });
    // Canada writes both ways: 09/10 could be 9 October or 10 September.
    expect(period('09/10/2026', 'CA')).toBeNull();
  });

  it('rejects impossible, backwards, future and too-long periods', () => {
    expect(period('Sep 31')).toBeNull();
    expect(period('Feb 30 - Mar 2')).toBeNull();
    expect(period('Sep 28 - Sep 22, 2026')).toBeNull();
    expect(period('Oct 10, 2026')).toBeNull();
    expect(period('Aug 1 - Sep 28')).toBeNull();
  });

  it('doesn’t take "may" the word for May the month', () => {
    expect(period('you may 3 times')).toBeNull();
    expect(period('May 3')).toEqual({ start: '2026-05-03', end: '2026-05-03' });
  });
});

// ─── Saving ────────────────────────────────────────────────────────────────

const draft = (overrides: Partial<EarningDraft> = {}): EarningDraft => ({
  platform: 'uber-eats',
  start: '2026-09-21',
  end: '2026-09-27',
  amountMinor: 41_235,
  trips: 18,
  distanceMeters: miles(142.3),
  ...overrides,
});

const saved = (overrides: Partial<PlatformEarning> = {}): PlatformEarning => ({
  id: 'e1',
  addedToWeek: null,
  createdAt: '2026-09-28T09:00:00.000Z',
  ...draft(),
  ...overrides,
});

describe('checkDraft', () => {
  it('accepts a good entry, and the week in progress', () => {
    expect(checkDraft(draft(), [], TODAY)).toBeNull();
    expect(checkDraft(draft({ start: '2026-09-28', end: '2026-10-04' }), [], TODAY)).toBeNull();
    expect(checkDraft(draft({ trips: null, distanceMeters: null }), [], TODAY)).toBeNull();
  });

  it('says what’s wrong', () => {
    expect(checkDraft(draft({ end: '2026-09-20' }), [], TODAY)).toBe('The last day is before the first day.');
    expect(checkDraft(draft({ start: '2026-10-05', end: '2026-10-05' }), [], TODAY)).toBe(
      'These dates are in the future. Check the days.',
    );
    expect(checkDraft(draft({ start: '2026-08-01' }), [], TODAY)).toBe(
      'Add up to 31 days at a time. For longer, add each week or month on its own.',
    );
    expect(checkDraft(draft({ amountMinor: 0 }), [], TODAY)).toBe('Enter your earnings as an amount, e.g. 450 or 450.50.');
    expect(checkDraft(draft({ trips: 2.5 }), [], TODAY)).toBe('Enter the jobs as a whole number, or leave it empty.');
    expect(checkDraft(draft({ distanceMeters: 99_000_000 }), [], TODAY)).toBe(
      'Enter the distance as a number, or leave it empty.',
    );
    expect(checkDraft(draft(), [saved()], TODAY)).toBe('These earnings are already saved.');
  });
});

describe('isDuplicate', () => {
  it('matches the same app, days and amount only', () => {
    expect(isDuplicate([saved()], draft())).toBe(true);
    expect(isDuplicate([saved()], draft({ amountMinor: 41_236 }))).toBe(false);
    expect(isDuplicate([saved()], draft({ platform: 'deliveroo' }))).toBe(false);
    expect(isDuplicate([saved()], draft({ end: '2026-09-26' }))).toBe(false);
  });
});

describe('weekOfPeriod', () => {
  it('is the Monday when the days are in one week', () => {
    expect(weekOfPeriod('2026-09-21', '2026-09-27')).toBe('2026-09-21');
    expect(weekOfPeriod('2026-09-24', '2026-09-24')).toBe('2026-09-21');
    expect(weekOfPeriod('2026-09-27', '2026-09-28')).toBeNull();
  });
});

describe('workMetersBetween', () => {
  it('adds up work drives on the days, inclusive', () => {
    const trips = [
      { classification: 'business' as const, localDate: '2026-09-20', distanceMeters: 1000 },
      { classification: 'business' as const, localDate: '2026-09-21', distanceMeters: 2000 },
      { classification: 'personal' as const, localDate: '2026-09-22', distanceMeters: 4000 },
      { classification: 'unclassified' as const, localDate: '2026-09-23', distanceMeters: 8000 },
      { classification: 'business' as const, localDate: '2026-09-27', distanceMeters: 16000 },
    ];
    expect(workMetersBetween(trips, '2026-09-21', '2026-09-27')).toBe(18_000);
  });
});

describe('platform choices', () => {
  it('lists the country’s apps, then one found elsewhere, then Other', () => {
    expect(platformChoices('GB', null)).toEqual(['uber-eats', 'deliveroo', 'just-eat', 'uber', 'amazon-flex', 'stuart', 'other']);
    expect(platformChoices('AU', 'lyft').slice(-2)).toEqual(['lyft', 'other']);
    expect(platformChoices('US', 'doordash').filter((id) => id === 'doordash')).toHaveLength(1);
  });

  it('knows its ids', () => {
    expect(isPlatformId('menulog')).toBe(true);
    expect(isPlatformId('other')).toBe(true);
    expect(isPlatformId('bolt')).toBe(false);
    expect(isPlatformId(3)).toBe(false);
  });
});
