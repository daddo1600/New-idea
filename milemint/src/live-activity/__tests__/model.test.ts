import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { inEnglish, REGIONS } from '@/domain/regions';
import { translate } from '@/i18n/i18n';

import {
  formatElapsed,
  PROGRESS_EVERY_MS,
  shiftActivityContent,
  shouldPush,
  type ShiftActivityInput,
} from '../model';
import { actionTime } from '../actions';
import { isNotWorkingDrive, NOT_WORKING_GRACE_MS, notWorkingTarget } from '../not-working';

const MILE = 1609.344;
const START = Date.parse('2026-10-02T09:00:00Z');

function input(overrides: Partial<ShiftActivityInput> = {}): ShiftActivityInput {
  return {
    startedAt: START,
    endedAt: null,
    now: START + (2 * 60 + 14) * 60_000,
    paused: false,
    drives: [
      { distanceMeters: 20 * MILE, value: 900, business: true },
      { distanceMeters: 18.2 * MILE, value: 1190, business: true },
    ],
    liveDrive: null,
    region: REGIONS.GB,
    ...overrides,
  };
}

describe('formatElapsed', () => {
  it('shows hours and padded minutes', () => {
    expect(formatElapsed((2 * 60 + 14) * 60_000, inEnglish)).toBe('2h 14m');
    expect(formatElapsed(5 * 60_000 + 59_000, inEnglish)).toBe('0h 05m');
  });

  it('never goes negative', () => {
    expect(formatElapsed(-60_000, inEnglish)).toBe('0h 00m');
  });
});

describe('shiftActivityContent', () => {
  it('shows the shift so far in the region’s unit and currency', () => {
    const content = shiftActivityContent(input(), inEnglish);
    expect(content).toMatchObject({
      title: 'Shift on',
      distance: '38.2 mi',
      money: '£20.90',
      status: 'Waiting for your next drive',
      elapsed: '2h 14m',
      endLabel: 'End shift',
      notWorkingLabel: 'Not working',
      driving: false,
      paused: false,
      ended: false,
      startedAt: START,
    });
  });

  it('uses kilometres and the local currency elsewhere', () => {
    const content = shiftActivityContent(
      input({ region: REGIONS.AU, drives: [{ distanceMeters: 12_345, value: 1086, business: true }] }),
      inEnglish,
    );
    expect(content.distance).toBe('12.3 km');
    expect(content.money).toBe('$10.86');
  });

  it('counts business drives only', () => {
    const content = shiftActivityContent(
      input({
        drives: [
          { distanceMeters: 10 * MILE, value: 450, business: true },
          { distanceMeters: 5 * MILE, value: 0, business: false },
        ],
      }),
      inEnglish,
    );
    expect(content.distance).toBe('10.0 mi');
    expect(content.money).toBe('£4.50');
  });

  it('shows a drive under way, and offers "Not working" for it', () => {
    const content = shiftActivityContent(input({ liveDrive: { distanceMeters: 3.1 * MILE } }), inEnglish);
    expect(content.status).toBe('Driving · 3.1 mi');
    expect(content.driving).toBe(true);
    // The money is what's saved: the drive counts once it's saved.
    expect(content.money).toBe('£20.90');
  });

  it('shows a pause, and no "Not working" in it', () => {
    const content = shiftActivityContent(input({ paused: true, liveDrive: { distanceMeters: 1000 } }), inEnglish);
    expect(content.title).toBe('Shift paused');
    expect(content.status).toBe('Paused');
    expect(content.driving).toBe(false);
  });

  it('sums the shift up once it has ended', () => {
    const content = shiftActivityContent(
      input({ endedAt: START + (6 * 60 + 12) * 60_000, liveDrive: { distanceMeters: 1000 } }),
      inEnglish,
    );
    expect(content).toMatchObject({
      title: 'Shift ended',
      elapsed: '6h 12m',
      status: '38.2 mi · £20.90 · 2 drives',
      ended: true,
      driving: false,
    });
  });

  it('is translated', () => {
    const french = (key: string, params?: Record<string, string | number>) => translate('fr', key, params);
    const content = shiftActivityContent(input({ region: REGIONS.CA }), french);
    expect(content.title).not.toBe('Shift on');
    expect(content.status).not.toBe('Waiting for your next drive');
    expect(content.endLabel).toBe(translate('fr', 'End shift'));
  });
});

describe('shouldPush', () => {
  const shown = shiftActivityContent(input({ liveDrive: { distanceMeters: 1000 } }), inEnglish);
  const at = START;

  it('sends the first card', () => {
    expect(shouldPush(null, 0, shown, at)).toBe(true);
  });

  it('sends nothing when nothing changed', () => {
    expect(shouldPush(shown, at, { ...shown }, at + 10 * PROGRESS_EVERY_MS)).toBe(false);
  });

  it('holds back the live distance creeping up', () => {
    const next = shiftActivityContent(input({ liveDrive: { distanceMeters: 1500 } }), inEnglish);
    expect(shouldPush(shown, at, next, at + 5_000)).toBe(false);
    expect(shouldPush(shown, at, next, at + PROGRESS_EVERY_MS)).toBe(true);
  });

  it('sends a saved drive, the money or the end at once', () => {
    const parked = shiftActivityContent(input(), inEnglish);
    expect(shouldPush(shown, at, parked, at + 1_000)).toBe(true);
    expect(shouldPush(shown, at, { ...shown, money: '£25.00' }, at + 1_000)).toBe(true);
    expect(shouldPush(shown, at, { ...shown, paused: true }, at + 1_000)).toBe(true);
  });
});

describe('actionTime', () => {
  const now = START + 3_600_000;

  it('acts as of the tap', () => {
    expect(actionTime(now - 120_000, now)).toBe(now - 120_000);
  });

  it('falls back to now for a time in the future, very old or missing', () => {
    expect(actionTime(now + 60_000, now)).toBe(now);
    expect(actionTime(now - 13 * 3_600_000, now)).toBe(now);
    expect(actionTime(Number.NaN, now)).toBe(now);
  });
});

describe('not working', () => {
  const iso = (ms: number) => new Date(ms).toISOString();
  const trip = (id: string, start: number, end: number, extra: Partial<{ shiftId: string | null; source: 'auto' | 'manual' }> = {}) => ({
    id,
    startedAt: iso(start),
    endedAt: iso(end),
    source: 'auto' as const,
    shiftId: 'shift',
    ...extra,
  });

  it('finds the drive under way at the tap (saved since)', () => {
    const trips = [trip('a', START, START + 600_000), trip('b', START + 900_000, START + 1_800_000)];
    expect(notWorkingTarget(trips, 'shift', START + 1_000_000)?.id).toBe('b');
  });

  it('finds a drive that ended just before the tap', () => {
    const trips = [trip('a', START, START + 600_000)];
    expect(notWorkingTarget(trips, 'shift', START + 600_000 + NOT_WORKING_GRACE_MS)?.id).toBe('a');
    expect(notWorkingTarget(trips, 'shift', START + 600_000 + NOT_WORKING_GRACE_MS + 1)).toBeNull();
  });

  it('leaves drives of other shifts, manual trips and later drives alone', () => {
    const trips = [
      trip('other', START, START + 600_000, { shiftId: 'other' }),
      trip('manual', START, START + 600_000, { source: 'manual' }),
      trip('later', START + 700_000, START + 800_000),
    ];
    expect(notWorkingTarget(trips, 'shift', START + 650_000)).toBeNull();
  });

  it('matches the marked drive by its start', () => {
    expect(isNotWorkingDrive(iso(START), START)).toBe(true);
    expect(isNotWorkingDrive(iso(START), START + 1_500)).toBe(true);
    expect(isNotWorkingDrive(iso(START), START + 60_000)).toBe(false);
    expect(isNotWorkingDrive(null, START)).toBe(false);
  });
});

describe('ShiftActivityAttributes', () => {
  // ActivityKit pairs the app's copy with the widget extension's by name and shape.
  const body = (path: string) => {
    const source = readFileSync(join(__dirname, '..', '..', '..', path), 'utf8');
    return source.slice(source.indexOf('@available(iOS 16.1, *)'));
  };

  it('is the same in the app and the widget extension', () => {
    const app = body('modules/live-activity/ios/ShiftActivityAttributes.swift');
    expect(app).toContain('struct ShiftActivityAttributes: ActivityAttributes');
    expect(body('targets/shift-activity/ShiftActivityAttributes.swift')).toBe(app);
  });

  it('has a field for every field of the content sent from JavaScript', () => {
    const app = body('modules/live-activity/ios/ShiftActivityAttributes.swift');
    for (const key of Object.keys(shiftActivityContent(input(), inEnglish))) {
      expect(app).toMatch(new RegExp(`var ${key}: `));
    }
  });
});
