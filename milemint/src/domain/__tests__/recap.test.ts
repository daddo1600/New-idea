import { describe, expect, it } from '@jest/globals';

import { translate } from '../../i18n/i18n';
import {
  askInstructions,
  buildDriveSummary,
  checkAnswer,
  numbersIn,
  platformShares,
  recapFacts,
  recapInstructions,
  recapLines,
  summaryText,
  totalsBetween,
  weekRecap,
  type RecapTrip,
} from '../recap';
import { computeDeductions, fromUnits, inEnglish, REGIONS, type DeductionTrip, type Region } from '../regions';

const { GB, US, CA } = REGIONS;

let next = 0;
type TestTrip = RecapTrip & DeductionTrip;

function trip(region: Region, localDate: string, units: number, overrides: Partial<TestTrip> = {}): TestTrip {
  next += 1;
  return {
    id: `t${next}`,
    startedAt: `${localDate}T09:00:00.000Z`,
    localDate,
    distanceMeters: fromUnits(units, region),
    classification: 'business',
    ...overrides,
  };
}

/** Thursday 1 October 2026; the week started on Monday 28 September. */
const THURSDAY = '2026-10-01';
const MONDAY = '2026-09-28';

describe('totalsBetween', () => {
  it('adds up work, personal and unsorted drives in the dates, both ends included', () => {
    const trips = [
      trip(GB, '2026-09-27', 50), // the day before: out
      trip(GB, MONDAY, 10),
      trip(GB, '2026-09-29', 4, { classification: 'personal' }),
      trip(GB, '2026-09-30', 3, { classification: 'unclassified' }),
      trip(GB, THURSDAY, 20),
      trip(GB, '2026-10-02', 99), // the day after: out
    ];
    const totals = totalsBetween(trips, computeDeductions(trips, GB), GB, MONDAY, THURSDAY);
    expect(totals.workDrives).toBe(2);
    expect(totals.workMeters).toBe(fromUnits(10, GB) + fromUnits(20, GB));
    expect(totals.personalDrives).toBe(1);
    expect(totals.personalMeters).toBe(fromUnits(4, GB));
    expect(totals.unsortedDrives).toBe(1);
    // 30 miles at 55p.
    expect(totals.claimMinor).toBe(1650);
    expect(totals.busiest).toEqual({ date: THURSDAY, meters: fromUnits(20, GB) });
  });

  it('counts parking and tolls on work drives where they go on top, as the year total does', () => {
    const trips = [trip(GB, MONDAY, 10, { parkingMinor: 300, tollsMinor: 200 })];
    expect(totalsBetween(trips, computeDeductions(trips, GB), GB, MONDAY, MONDAY).claimMinor).toBe(550 + 500);
    // Canada lists them apart.
    const ca = [trip(CA, MONDAY, 10, { parkingMinor: 300 })];
    const deductions = computeDeductions(ca, CA);
    expect(totalsBetween(ca, deductions, CA, MONDAY, MONDAY).claimMinor).toBe(deductions.get(ca[0].id));
  });

  it('takes the earliest day when two days tie for busiest', () => {
    const trips = [trip(GB, '2026-09-30', 10), trip(GB, MONDAY, 6), trip(GB, MONDAY, 4)];
    expect(totalsBetween(trips, computeDeductions(trips, GB), GB, MONDAY, THURSDAY).busiest?.date).toBe(MONDAY);
  });

  it('has no busiest day without work drives', () => {
    const trips = [trip(GB, MONDAY, 10, { classification: 'personal' })];
    expect(totalsBetween(trips, new Map(), GB, MONDAY, THURSDAY).busiest).toBeNull();
  });
});

describe('weekRecap', () => {
  it('is this week so far against the same days last week', () => {
    const trips = [trip(GB, MONDAY, 30), trip(GB, '2026-09-21', 20), trip(GB, '2026-09-26', 500)];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, THURSDAY);
    expect(recap.period).toBe('thisWeek');
    expect([recap.start, recap.end]).toEqual([MONDAY, THURSDAY]);
    // Last Saturday is past the same days last week (Monday to Thursday).
    expect(recap.previous.workMeters).toBe(fromUnits(20, GB));
    expect(recap.change).toBe(50);
  });

  it('is last week, against the week before, on a Monday', () => {
    const trips = [trip(GB, MONDAY, 5), trip(GB, '2026-09-27', 30), trip(GB, '2026-09-07', 40)];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, MONDAY);
    expect(recap.period).toBe('lastWeek');
    expect([recap.start, recap.end]).toEqual(['2026-09-21', '2026-09-27']);
    expect(recap.current.workMeters).toBe(fromUnits(30, GB));
    expect(recap.previous.workMeters).toBe(0);
    expect(recap.change).toBeNull();
  });

  it('is last week while nothing has been driven this week', () => {
    const trips = [trip(GB, '2026-09-22', 30), trip(GB, '2026-09-15', 40)];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, THURSDAY);
    expect(recap.period).toBe('lastWeek');
    expect(recap.change).toBe(-25);
  });
});

describe('platformShares', () => {
  it('gives whole percents adding up to 100, biggest first', () => {
    const shares = platformShares(new Map([['Deliveroo', 1000], ['Uber Eats', 2000], ['Just Eat', 0]]));
    expect(shares).toEqual([
      { name: 'Uber Eats', percent: 67 },
      { name: 'Deliveroo', percent: 33 },
    ]);
  });

  it('is empty when nothing is known', () => {
    expect(platformShares(undefined)).toEqual([]);
    expect(platformShares(new Map([['Uber', 0]]))).toEqual([]);
  });
});

describe('recapLines', () => {
  it('writes the week from a template, with every figure from the drives', () => {
    const trips = [
      trip(GB, MONDAY, 12),
      trip(GB, '2026-09-29', 30),
      trip(GB, '2026-09-30', 3, { classification: 'unclassified' }),
      trip(GB, '2026-09-22', 40),
    ];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, THURSDAY);
    expect(recapLines(recap, GB, 'en-GB', inEnglish)).toEqual([
      'This week so far: 42.0 mi for work over 2 drives, worth £23.10 at HMRC rates.',
      'Busiest day: Tuesday, with 30.0 mi.',
      'Up 5% on the same days last week.',
      '1 drive still to sort.',
    ]);
  });

  it('says about the same for a small change, and leaves out the busiest day when it was all one day', () => {
    const trips = [trip(US, MONDAY, 100), trip(US, '2026-09-21', 98)];
    const lines = recapLines(weekRecap(trips, computeDeductions(trips, US), US, THURSDAY), US, 'en-US', inEnglish);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^This week so far: 100\.0 mi for work over 1 drive, worth \$[\d.]+ at IRS rates\.$/);
    expect(lines[1]).toBe('About the same as the same days last week.');
  });

  it('says when there were no work drives', () => {
    const recap = weekRecap([trip(GB, '2026-09-22', 5, { classification: 'personal' })], new Map(), GB, THURSDAY);
    expect(recapLines(recap, GB, 'en-GB', inEnglish)).toEqual(['No work drives last week.']);
  });

  it('leaves the value out when the vehicle has no official rate', () => {
    const trips = [trip(US, MONDAY, 10, { vehicle: 'bicycle' })];
    const recap = weekRecap(trips, computeDeductions(trips, US), US, THURSDAY);
    expect(recapLines(recap, US, 'en-US', inEnglish)[0]).toBe('This week so far: 10.0 mi for work over 1 drive.');
  });

  it('lists earnings by app when they are known', () => {
    const trips = [trip(GB, MONDAY, 10)];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, THURSDAY, {
      platformEarnings: new Map([['Uber Eats', 3000], ['Deliveroo', 1000]]),
    });
    expect(recapLines(recap, GB, 'en-GB', inEnglish)).toContain('Earnings by app: Uber Eats 75%, Deliveroo 25%.');
  });

  it('is in the app’s language', () => {
    const trips = [trip(GB, MONDAY, 12), trip(GB, '2026-09-29', 30)];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, THURSDAY);
    const french = recapLines(recap, GB, 'fr-GB', (key, params) => translate('fr', key, params));
    expect(french[0]).not.toBe(recapLines(recap, GB, 'en-GB', inEnglish)[0]);
    expect(french[0]).toContain('42.0 mi');
    expect(french[1]).toContain('mardi');
  });
});

describe('recapFacts', () => {
  it('has every figure the template recap uses, so the model never needs to work one out', () => {
    const trips = [
      trip(GB, MONDAY, 12.4),
      trip(GB, '2026-09-29', 30.2, { parkingMinor: 250 }),
      trip(GB, '2026-09-30', 3, { classification: 'unclassified' }),
      trip(GB, '2026-09-22', 40),
    ];
    const recap = weekRecap(trips, computeDeductions(trips, GB), GB, THURSDAY);
    const facts = recapFacts(recap, GB);
    expect(facts).toContain('Work distance: 42.6 mi');
    expect(facts).toContain('Busiest day: Tuesday, with 30.2 mi');
    for (const line of recapLines(recap, GB, 'en-GB', inEnglish)) expect(checkAnswer(line, [facts])).toBe(line);
  });
});

describe('buildDriveSummary', () => {
  const trips = [
    trip(GB, '2026-10-01', 10),
    trip(GB, '2026-09-30', 25),
    trip(GB, '2026-09-01', 5),
    trip(GB, '2026-08-31', 7, { classification: 'personal' }),
    trip(GB, '2025-11-15', 60),
    trip(GB, '2025-10-31', 99), // 12 months back is November 2025: out of the months
  ];
  const summary = buildDriveSummary(trips, computeDeductions(trips, GB), GB, '2026-10-02');

  it('has the last 12 months, newest first, each from its first to last day', () => {
    expect(summary.months.map((month) => month.month)).toEqual([
      '2026-10',
      '2026-09',
      '2026-08',
      '2026-07',
      '2026-06',
      '2026-05',
      '2026-04',
      '2026-03',
      '2026-02',
      '2026-01',
      '2025-12',
      '2025-11',
    ]);
    expect(summary.months[1].totals.workMeters).toBe(fromUnits(25, GB) + fromUnits(5, GB));
    expect(summary.months[1].totals.workDrives).toBe(2);
    expect(summary.months[2].totals.personalMeters).toBe(fromUnits(7, GB));
    expect(summary.months[11].totals.workMeters).toBe(fromUnits(60, GB));
  });

  it('has eight weeks, Monday to Sunday, this one so far', () => {
    expect(summary.weeks).toHaveLength(8);
    expect(summary.weeks[0]).toMatchObject({ start: MONDAY, end: '2026-10-02' });
    expect(summary.weeks[0].totals.workMeters).toBe(fromUnits(10, GB) + fromUnits(25, GB));
    expect(summary.weeks[1]).toMatchObject({ start: '2026-09-21', end: '2026-09-27' });
  });

  it('adds up work by weekday, and finds the busiest day, over the months', () => {
    // Monday first: 15 November 2025 was a Saturday.
    expect(summary.weekdays[5]).toEqual({ workMeters: fromUnits(60, GB), workDrives: 1 });
    expect(summary.weekdays[2].workDrives).toBe(1);
    expect(summary.busiest).toEqual({ date: '2025-11-15', meters: fromUnits(60, GB) });
  });

  it('has this tax year so far and last tax year', () => {
    expect(summary.taxYears.map((year) => [year.label, year.start, year.end, year.current])).toEqual([
      ['2026/27', '2026-04-06', '2026-10-02', true],
      ['2025/26', '2025-04-06', '2026-04-05', false],
    ]);
    expect(summary.taxYears[1].totals.workMeters).toBe(fromUnits(60, GB) + fromUnits(99, GB));
  });

  it('reads as short English lines with the figures already formatted', () => {
    const text = summaryText(summary, GB);
    expect(text).toMatch(/^Today is Friday,? 2 October 2026\./);
    expect(text).toMatch(
      /- September 2026 \(last month\): work 30\.0 mi in 2 drives; claim £16\.50; personal 0\.0 mi; busiest day Wednesday,? 30 September 2026 \(25\.0 mi\)/,
    );
    expect(text).toMatch(/Busiest single day \(last 12 months\): Saturday,? 15 November 2025, 60\.0 mi for work\./);
  });

  it('stays small enough for the on-device model’s context, however many drives there are', () => {
    const many: TestTrip[] = [];
    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2025, 9, 3 + day)).toISOString().slice(0, 10);
      for (let i = 0; i < 12; i++) many.push(trip(GB, date, 3.3 + i, { classification: i % 4 === 0 ? 'personal' : 'business' }));
    }
    const text = summaryText(buildDriveSummary(many, computeDeductions(many, GB), GB, '2026-10-02'), GB);
    const instructions = askInstructions('English', text);
    // About 4 characters a token: well inside the model's 4,096 tokens, leaving room for the answer.
    expect(instructions.length).toBeLessThan(9000);
  });
});

describe('checkAnswer', () => {
  const facts = '- Work distance: 1,234.5 mi\n- Worth at HMRC rates: £555.53\n- Busiest day: Tuesday 29 September 2026, with 30.2 mi';

  it('keeps an answer whose numbers are all in the figures, however they are written', () => {
    expect(checkAnswer('You drove 1,234.5 mi for work, worth £555.53.', [facts])).toBe(
      'You drove 1,234.5 mi for work, worth £555.53.',
    );
    expect(checkAnswer('Vous avez roulé 1 234,5 mi pour le travail.', [facts])).not.toBeNull();
    expect(checkAnswer('आपने काम के लिए ३०.२ mi चलाए।', [facts])).not.toBeNull();
    expect(checkAnswer('Your busiest day was 29 September, about £555.', [facts])).not.toBeNull();
  });

  it('turns down an answer with a number that isn’t in the figures', () => {
    expect(checkAnswer('You drove 1,300 mi for work.', [facts])).toBeNull();
    expect(checkAnswer('That’s 12% more than last week.', [facts])).toBeNull();
  });

  it('allows numbers from the question', () => {
    expect(checkAnswer('I only have your last 12 months, not 2019.', [facts, 'What about 2019?'])).toBeNull();
    expect(checkAnswer('I only have your drives since September, not 2019.', [facts, 'What about 2019?'])).not.toBeNull();
  });

  it('drops Markdown and turns down empty or long answers', () => {
    expect(checkAnswer('**You drove** 30.2 mi\n\non Tuesday.', [facts])).toBe('You drove 30.2 mi on Tuesday.');
    expect(checkAnswer('   ', [facts])).toBeNull();
    expect(checkAnswer('word '.repeat(200), [facts])).toBeNull();
  });

  it('reads digits the same in any script', () => {
    expect(numbersIn('৩০.২ and ３０')).toEqual(new Set(['302', '30']));
    expect(numbersIn('2026-09-08', true)).toEqual(new Set(['2026', '9', '8']));
  });
});

describe('instructions', () => {
  it('tell the model to use only the given figures, in the language asked for', () => {
    const recap = recapInstructions('French');
    expect(recap).toContain('Copy every number exactly');
    expect(recap).toContain('Write in French.');
    const ask = askInstructions('English', 'THE DATA');
    expect(ask).toContain('Answer in English.');
    expect(ask.endsWith('THE DATA')).toBe(true);
  });
});
