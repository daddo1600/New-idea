import { describe, expect, it } from '@jest/globals';

import { setupReminderSettings, tomorrowAt, upcomingSundays, weeklyMessage, WEEKLY_MESSAGES } from '../reminders';

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

describe('setupReminderSettings', () => {
  it('keeps the Sunday recap on only when it could be queued, and never asks again cold', () => {
    expect(setupReminderSettings(true, 'answered')).toEqual({
      weeklyReminder: true,
      reminderDefaulted: true,
      reminderAsked: true,
    });
    expect(setupReminderSettings(false, 'answered')).toEqual({
      weeklyReminder: false,
      reminderDefaulted: true,
      reminderAsked: true,
    });
  });

  // A restored backup brings back the old phone's reminderAsked: true. Saving that
  // with the recap off would hide home's offer for good, though they only said "Not now".
  it('after "Not now", leaves home free to offer the recap', () => {
    const saved = setupReminderSettings(false, 'not-now');
    expect(saved).toEqual({ weeklyReminder: false, reminderDefaulted: true, reminderAsked: false });
    // ReminderAsk shows while neither is set.
    expect(!saved.reminderAsked && !saved.weeklyReminder).toBe(true);
  });

  it("leaves reminderAsked as it was when the step wasn't shown", () => {
    expect(setupReminderSettings(true, 'not-shown')).toEqual({ weeklyReminder: true, reminderDefaulted: true });
    expect(setupReminderSettings(false, 'not-shown')).not.toHaveProperty('reminderAsked');
  });
});
