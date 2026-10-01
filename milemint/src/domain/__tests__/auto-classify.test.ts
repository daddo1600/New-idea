import { describe, expect, it } from '@jest/globals';

import { autoClassify } from '../auto-classify';

const none = { classification: null, reason: null, purpose: null };

describe('autoClassify', () => {
  it('a drive in a shift is business, for deliveries', () => {
    expect(autoClassify({ inShift: true, suggestion: none, shiftMode: true, defaultBusiness: true })).toEqual({
      classification: 'business',
      reason: 'work-hours',
      purpose: 'Deliveries',
    });
  });

  it('after the shift has ended, a courier’s drive is left to sort (the train home)', () => {
    expect(autoClassify({ inShift: false, suggestion: none, shiftMode: true, defaultBusiness: true })).toEqual({
      classification: 'unclassified',
      reason: null,
      purpose: '',
    });
  });

  it('without shift mode, "start as business" still applies', () => {
    expect(autoClassify({ inShift: false, suggestion: none, shiftMode: false, defaultBusiness: true })).toMatchObject({
      classification: 'business',
      reason: 'default',
    });
    expect(autoClassify({ inShift: false, suggestion: none, shiftMode: false, defaultBusiness: false })).toMatchObject({
      classification: 'unclassified',
    });
  });

  it('a matched rule (a learned route, a commute) wins outside a shift', () => {
    expect(
      autoClassify({
        inShift: false,
        suggestion: { classification: 'personal', reason: 'commute', purpose: null },
        shiftMode: true,
        defaultBusiness: true,
      }),
    ).toMatchObject({ classification: 'personal', reason: 'commute' });
  });
});
