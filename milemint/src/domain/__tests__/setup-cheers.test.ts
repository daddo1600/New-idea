import { describe, expect, it } from '@jest/globals';

import { COUNTRY, DONE, HOURS, PURPOSE, REMINDERS, setupCheer, TRACKING } from '../setup-cheers';

describe('setupCheer', () => {
  it('builds up through the usual set-up', () => {
    expect(setupCheer(0, COUNTRY)).toBeNull();
    expect(setupCheer(COUNTRY, TRACKING)).toBe('thumbs');
    expect(setupCheer(TRACKING, HOURS)).toBe('tracking');
    expect(setupCheer(HOURS, PURPOSE)).toBe('almost');
    expect(setupCheer(PURPOSE, DONE)).toBe('done');
  });

  it('takes shift workers from tracking straight to the finish', () => {
    expect(setupCheer(HOURS, DONE)).toBe('done');
  });

  it('cheers a restored backup only at the finish', () => {
    expect(setupCheer(0, TRACKING)).toBeNull();
    expect(setupCheer(TRACKING, DONE)).toBe('done');
  });

  it('gives the reminders step no cheer of its own, and cheers the finish after it', () => {
    expect(setupCheer(PURPOSE, REMINDERS)).toBeNull();
    expect(setupCheer(HOURS, REMINDERS)).toBeNull();
    expect(setupCheer(TRACKING, REMINDERS)).toBeNull();
    expect(setupCheer(REMINDERS, DONE)).toBe('done');
  });

  it('never cheers going back', () => {
    expect(setupCheer(DONE, REMINDERS)).toBeNull();
    expect(setupCheer(REMINDERS, PURPOSE)).toBeNull();
    expect(setupCheer(DONE, PURPOSE)).toBeNull();
    expect(setupCheer(DONE, HOURS)).toBeNull();
    expect(setupCheer(TRACKING, COUNTRY)).toBeNull();
    expect(setupCheer(HOURS, HOURS)).toBeNull();
  });
});
