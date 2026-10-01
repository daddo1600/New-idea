import { describe, expect, it } from '@jest/globals';

import { detectRegion } from '../detect-region';

describe('detectRegion', () => {
  it('trusts the Region setting first', () => {
    expect(detectRegion({ regionCode: 'GB', timeZone: 'America/New_York', locale: 'en-US' })).toBe('GB');
    expect(detectRegion({ regionCode: 'au' })).toBe('AU');
    expect(detectRegion({ regionCode: 'UK' })).toBe('GB');
  });

  it('falls back to the time zone', () => {
    expect(detectRegion({ regionCode: null, timeZone: 'Europe/London', locale: 'en-US' })).toBe('GB');
    expect(detectRegion({ timeZone: 'Australia/Perth' })).toBe('AU');
    expect(detectRegion({ timeZone: 'America/Toronto' })).toBe('CA');
    expect(detectRegion({ timeZone: 'America/Indiana/Indianapolis' })).toBe('US');
  });

  it("then the language's country", () => {
    expect(detectRegion({ regionCode: 'FR', timeZone: 'Europe/Paris', locale: 'en-CA' })).toBe('CA');
  });

  it('gives up for unsupported places', () => {
    expect(detectRegion({ regionCode: 'FR', timeZone: 'Europe/Paris', locale: 'fr-FR' })).toBeNull();
  });
});
