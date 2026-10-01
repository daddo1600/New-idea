import { describe, expect, it } from '@jest/globals';

import { activeCountdown, countdownReminders, daysText, returnDueDate } from '../deadlines';
import { REGIONS } from '../regions';

const on = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

describe('returnDueDate', () => {
  it('is 31 January after the UK tax year ends', () => {
    expect(returnDueDate(2026, REGIONS.GB)).toBe('2028-01-31');
  });
  it('is 15 April in the US, rolled to Monday at a weekend', () => {
    expect(returnDueDate(2026, REGIONS.US)).toBe('2027-04-15');
    expect(returnDueDate(2027, REGIONS.US)).toBe('2028-04-17');
  });
  it('is 30 April in Canada', () => {
    expect(returnDueDate(2026, REGIONS.CA)).toBe('2027-04-30');
  });
  it('is 31 October in the same year the Australian year ends', () => {
    expect(returnDueDate(2026, REGIONS.AU)).toBe('2027-10-31');
  });
});

describe('activeCountdown', () => {
  it('counts down the last two months of the tax year', () => {
    expect(activeCountdown(REGIONS.GB, on('2027-03-06'))).toMatchObject({
      kind: 'year-end',
      days: 31,
      date: '2027-04-05',
      label: '2026/27',
    });
    expect(activeCountdown(REGIONS.US, on('2026-12-31'))).toMatchObject({
      kind: 'year-end',
      days: 1,
    });
  });
  it('then counts down to the return deadline', () => {
    expect(activeCountdown(REGIONS.AU, on('2026-10-01'))).toMatchObject({
      kind: 'return',
      days: 30,
      date: '2026-10-31',
      label: '2025–26',
    });
    expect(activeCountdown(REGIONS.GB, on('2027-01-15'))).toMatchObject({
      kind: 'return',
      days: 16,
    });
  });
  it('stays quiet the rest of the year', () => {
    expect(activeCountdown(REGIONS.GB, on('2026-10-01'))).toBeNull();
    expect(activeCountdown(REGIONS.US, on('2026-06-01'))).toBeNull();
    expect(activeCountdown(REGIONS.GB, on('2027-02-01'))).toBeNull();
  });
});

describe('countdownReminders', () => {
  it('schedules only reminders still ahead', () => {
    const reminders = countdownReminders(REGIONS.GB, on('2027-03-01'));
    expect(reminders.map((r) => [r.id, r.date])).toEqual([
      ['year-end-1', '2027-03-06'],
      ['year-end-2', '2027-03-29'],
      ['return-0', '2028-01-01'],
      ['return-1', '2028-01-24'],
    ]);
  });
  it('uses the right units and labels', () => {
    const [first] = countdownReminders(REGIONS.AU, on('2026-10-01'));
    expect(first.title).toContain('2026–27');
    expect(first.body).toContain('kilometres');
  });
});

describe('daysText', () => {
  it('reads naturally', () => {
    expect(daysText(0)).toBe('today');
    expect(daysText(1)).toBe('1 day');
    expect(daysText(12)).toBe('12 days');
  });
});
