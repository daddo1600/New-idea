import { describe, expect, it } from '@jest/globals';

import { autoClassify, usualPurpose } from '../auto-classify';

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

describe('the usual business purpose', () => {
  const base = { inShift: false, suggestion: none, shiftMode: false, defaultBusiness: true };

  it('fills in a business drive that has no purpose', () => {
    expect(autoClassify({ ...base, defaultPurpose: 'Client meeting' })).toEqual({
      classification: 'business',
      reason: 'default',
      purpose: 'Client meeting',
    });
    expect(
      autoClassify({
        ...base,
        suggestion: { classification: 'business', reason: 'work-hours', purpose: null },
        defaultPurpose: 'Site visit',
      }),
    ).toMatchObject({ classification: 'business', purpose: 'Site visit' });
  });

  it('a purpose learned from the route beats it', () => {
    expect(
      autoClassify({
        ...base,
        suggestion: { classification: 'business', reason: 'learned-route', purpose: 'Buying supplies' },
        defaultPurpose: 'Client meeting',
      }),
    ).toMatchObject({ purpose: 'Buying supplies' });
  });

  it('in a shift: Deliveries, unless the user chose their own', () => {
    const shift = { ...base, inShift: true, shiftMode: true };
    expect(autoClassify(shift).purpose).toBe('Deliveries');
    expect(autoClassify({ ...shift, defaultPurpose: 'Delivery or collection' }).purpose).toBe('Delivery or collection');
    expect(
      autoClassify({ ...shift, suggestion: { classification: null, purpose: 'Site visit' }, defaultPurpose: 'Client meeting' })
        .purpose,
    ).toBe('Site visit');
  });

  it('shift mode: a work drive outside a shift gets Deliveries too', () => {
    expect(
      autoClassify({
        ...base,
        shiftMode: true,
        suggestion: { classification: 'business', reason: 'learned-route', purpose: '' },
      }).purpose,
    ).toBe('Deliveries');
  });

  it('personal and unsorted drives get none', () => {
    expect(
      autoClassify({
        ...base,
        suggestion: { classification: 'personal', reason: 'commute', purpose: null },
        defaultPurpose: 'Client meeting',
      }).purpose,
    ).toBe('');
    expect(autoClassify({ ...base, defaultBusiness: false, defaultPurpose: 'Client meeting' }).purpose).toBe('');
    expect(
      autoClassify({ ...base, shiftMode: true, offShift: true, defaultPurpose: 'Client meeting' }).purpose,
    ).toBe('');
  });

  it('usualPurpose: the user’s own, else Deliveries in shift mode, else none', () => {
    expect(usualPurpose({ defaultPurpose: ' Client meeting ', shiftMode: true })).toBe('Client meeting');
    expect(usualPurpose({ defaultPurpose: null, shiftMode: true })).toBe('Deliveries');
    expect(usualPurpose({ defaultPurpose: '  ', shiftMode: false })).toBeNull();
  });
});
