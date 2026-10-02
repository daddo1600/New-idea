import { afterEach, describe, expect, it } from '@jest/globals';

import { setLanguage, translate } from '../../i18n/i18n';
import { formatReportDate, formatShortDate, friendlyDate, REGIONS, type Translator } from '../regions';

const { US, GB, CA, AU } = REGIONS;
const english: Translator = (key, params) => translate('en', key, params);
const french: Translator = (key, params) => translate('fr', key, params);

/** Friday 2 October 2026, mid-afternoon on the device's clock. */
const TODAY = new Date(2026, 9, 2, 15, 30);

describe('formatShortDate', () => {
  afterEach(() => setLanguage('en'));

  it('says Today and Yesterday', () => {
    expect(formatShortDate('2026-10-02', GB, TODAY, english)).toBe('Today');
    expect(formatShortDate('2026-10-01', US, TODAY, english)).toBe('Yesterday');
  });

  it('is the same day just after midnight and just before', () => {
    expect(formatShortDate('2026-10-02', GB, new Date(2026, 9, 2, 0, 1), english)).toBe('Today');
    expect(formatShortDate('2026-10-01', GB, new Date(2026, 9, 2, 23, 59), english)).toBe('Yesterday');
  });

  it('names the weekday within the last six days', () => {
    expect(formatShortDate('2026-09-30', GB, TODAY, english)).toBe('Wed');
    expect(formatShortDate('2026-09-26', US, TODAY, english)).toBe('Sat');
  });

  it('gives the day and month from a week ago', () => {
    expect(formatShortDate('2026-09-25', GB, TODAY, english)).toBe('25 Sept');
    expect(formatShortDate('2026-09-25', US, TODAY, english)).toBe('Sep 25');
  });

  it('puts the day first in the UK, Australia and Canada, the month first in the US', () => {
    expect(formatShortDate('2026-08-02', GB, TODAY, english)).toBe('2 Aug');
    expect(formatShortDate('2026-08-02', AU, TODAY, english)).toBe('2 Aug');
    expect(formatShortDate('2026-08-02', CA, TODAY, english)).toBe('2 Aug');
    expect(formatShortDate('2026-08-02', US, TODAY, english)).toBe('Aug 2');
  });

  it('adds the year only when it is not this year', () => {
    expect(formatShortDate('2026-01-01', GB, TODAY, english)).toBe('1 Jan');
    expect(formatShortDate('2025-10-02', GB, TODAY, english)).toBe('2 Oct 2025');
    expect(formatShortDate('2025-10-02', US, TODAY, english)).toBe('Oct 2, 2025');
  });

  it('counts days across the year boundary', () => {
    const newYear = new Date(2027, 0, 2, 9, 0);
    expect(formatShortDate('2027-01-01', GB, newYear, english)).toBe('Yesterday');
    expect(formatShortDate('2026-12-31', GB, newYear, english)).toBe('Thu');
    // A week back is last year: the year shows.
    expect(formatShortDate('2026-12-26', GB, newYear, english)).toBe('26 Dec 2026');
    expect(formatShortDate('2026-12-26', US, newYear, english)).toBe('Dec 26, 2026');
  });

  it('shows a future date (a clock that was wrong) as a date, not a weekday', () => {
    expect(formatShortDate('2026-10-03', GB, TODAY, english)).toBe('3 Oct');
  });

  it('speaks the app language with the country conventions', () => {
    setLanguage('fr');
    expect(formatShortDate('2026-10-02', CA, TODAY, french)).toBe('Aujourd’hui');
    expect(formatShortDate('2026-10-01', CA, TODAY, french)).toBe('Hier');
    expect(formatShortDate('2026-09-30', CA, TODAY, french)).toBe('mer.');
    expect(formatShortDate('2026-08-02', CA, TODAY, french)).toBe('2 août');
  });

  it('passes anything that is not a date through', () => {
    expect(friendlyDate('soon', 'en-GB', TODAY, english)).toBe('soon');
  });
});

describe('formatReportDate', () => {
  it('keeps the formal numeric date where it is unambiguous', () => {
    expect(formatReportDate('2026-09-30', US)).toBe('9/30/2026');
    expect(formatReportDate('2026-09-30', GB)).toBe('30/09/2026');
    expect(formatReportDate('2026-09-30', AU)).toBe('30/09/2026');
  });

  it('never prints ISO for Canada', () => {
    expect(formatReportDate('2026-09-30', CA)).toBe('Sep 30, 2026');
  });
});
