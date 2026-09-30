import { describe, expect, it } from '@jest/globals';

import { tomorrowAt, upcomingSundays, weeklyMessage, WEEKLY_MESSAGES } from '../reminders';

describe('upcomingSundays', () => {
  it('starts today when it is Sunday before the reminder time', () => {
    const sundays = upcomingSundays(new Date(2026, 9, 4, 12), 3, 18); // Sun 4 Oct, noon
    expect(sundays.map((d) => [d.getDate(), d.getHours()])).toEqual([
      [4, 18],
      [11, 18],
      [18, 18],
    ]);
  });

  it('skips to next week once the reminder time has passed', () => {
    expect(upcomingSundays(new Date(2026, 9, 4, 19), 1, 18)[0].getDate()).toBe(11);
  });

  it('finds the coming Sunday midweek, across a month end', () => {
    const [first] = upcomingSundays(new Date(2026, 8, 30, 9), 1, 18); // Wed 30 Sep
    expect([first.getMonth(), first.getDate(), first.getDay()]).toEqual([9, 4, 0]);
  });
});

describe('weeklyMessage', () => {
  it('changes every week and fills in the unit', () => {
    const sundays = upcomingSundays(new Date(2026, 9, 1), WEEKLY_MESSAGES.length, 18);
    const titles = new Set(sundays.map((d) => weeklyMessage(d, 'mi').title));
    expect(titles.size).toBe(WEEKLY_MESSAGES.length);
    for (const d of sundays) {
      const km = weeklyMessage(d, 'km');
      expect(`${km.title} ${km.body}`).not.toMatch(/[{}]|\bmiles?\b/i);
    }
  });
});

describe('tomorrowAt', () => {
  it('rolls over the month', () => {
    const next = tomorrowAt(new Date(2026, 8, 30, 21), 18);
    expect([next.getMonth(), next.getDate(), next.getHours()]).toEqual([9, 1, 18]);
  });
});
