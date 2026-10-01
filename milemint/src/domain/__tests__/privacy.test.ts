import { describe, expect, it } from '@jest/globals';

import {
  areaFromLabel,
  areaLabel,
  clientVisitLabel,
  isPrivateLabel,
  postcodeArea,
  privateLabel,
  redactLabel,
  type GeocodedArea,
} from '../privacy';

/** What iOS's reverse geocoder returns for a house, with every field the app could leak. */
const geocoded = (fields: GeocodedArea) => ({
  name: '14 Otley Road',
  streetNumber: '14',
  street: 'Otley Road',
  ...fields,
});

describe('postcodeArea', () => {
  it('keeps the UK outward code (postcode district)', () => {
    expect(postcodeArea('SW1A 2AA', 'GB')).toBe('SW1A');
    expect(postcodeArea('ls6 3ab', 'GB')).toBe('LS6');
    expect(postcodeArea('M1 1AE', 'GB')).toBe('M1');
    expect(postcodeArea('EC1A1BB', 'GB')).toBe('EC1A');
    expect(postcodeArea('LS6', 'GB')).toBe('LS6');
  });

  it('keeps the 5-digit ZIP and drops ZIP+4', () => {
    expect(postcodeArea('78701', 'US')).toBe('78701');
    expect(postcodeArea('78701-1234', 'US')).toBe('78701');
  });

  it('keeps the Canadian forward sortation area', () => {
    expect(postcodeArea('M5V 3L9', 'CA')).toBe('M5V');
    expect(postcodeArea('k1a0b1', 'CA')).toBe('K1A');
  });

  it('keeps an Australian postcode, which already covers a suburb', () => {
    expect(postcodeArea('2150', 'AU')).toBe('2150');
  });

  it('elsewhere keeps the first part of a two-part code only', () => {
    expect(postcodeArea('D02 X285', 'IE')).toBe('D02');
    expect(postcodeArea('10115', 'DE')).toBeNull();
  });

  it('drops codes that don’t look right rather than guess', () => {
    expect(postcodeArea('not a code', 'GB')).toBeNull();
    expect(postcodeArea('', 'US')).toBeNull();
    expect(postcodeArea(null, 'US')).toBeNull();
  });
});

describe('areaLabel', () => {
  it('GB: town and postcode district', () => {
    const place = geocoded({ city: 'Leeds', district: 'Headingley', postalCode: 'LS6 3AB', isoCountryCode: 'GB' });
    expect(areaLabel(place, 'GB')).toBe('Leeds LS6');
  });

  it('US: city and 5-digit ZIP', () => {
    const place = geocoded({ city: 'Austin', region: 'TX', postalCode: '78701-4321', isoCountryCode: 'US' });
    expect(areaLabel(place, 'US')).toBe('Austin 78701');
  });

  it('CA: city and forward sortation area', () => {
    const place = geocoded({ city: 'Toronto', region: 'ON', postalCode: 'M5V 3L9', isoCountryCode: 'CA' });
    expect(areaLabel(place, 'CA')).toBe('Toronto M5V');
  });

  it('AU: suburb and postcode', () => {
    const place = geocoded({ city: 'Parramatta', region: 'NSW', postalCode: '2150', isoCountryCode: 'AU' });
    expect(areaLabel(place, 'AU')).toBe('Parramatta 2150');
  });

  it('never contains the street or house number', () => {
    const place = geocoded({ city: 'Leeds', postalCode: 'LS6 3AB', isoCountryCode: 'GB' });
    const label = areaLabel(place, 'GB') ?? '';
    expect(label).not.toMatch(/Otley|14|3AB/);
  });

  it('uses the address’s own country, e.g. across the US–Canada border', () => {
    const place = geocoded({ city: 'Windsor', postalCode: 'N9A 1A1', isoCountryCode: 'CA' });
    expect(areaLabel(place, 'US')).toBe('Windsor N9A');
  });

  it('falls back to the user’s region when the address has no country', () => {
    const place = geocoded({ city: 'Leeds', postalCode: 'LS6 3AB', isoCountryCode: null });
    expect(areaLabel(place, 'GB')).toBe('Leeds LS6');
  });

  it('makes do with what is known', () => {
    expect(areaLabel(geocoded({ city: null, district: 'Headingley', postalCode: null }), 'GB')).toBe('Headingley');
    expect(areaLabel(geocoded({ city: null, postalCode: 'LS6 3AB', isoCountryCode: 'GB' }), 'GB')).toBe('LS6');
    expect(areaLabel(geocoded({ city: null, region: 'West Yorkshire' }), 'GB')).toBe('West Yorkshire');
    expect(areaLabel(geocoded({ city: null }), 'GB')).toBeNull();
    expect(areaLabel(null, 'GB')).toBeNull();
  });
});

describe('labels', () => {
  it('reads "Client visit · area", or just "Client visit"', () => {
    expect(clientVisitLabel('Leeds LS6')).toBe('Client visit · Leeds LS6');
    expect(clientVisitLabel(null)).toBe('Client visit');
    expect(isPrivateLabel('Client visit · Leeds LS6')).toBe(true);
    expect(isPrivateLabel('Client visit')).toBe(true);
    expect(isPrivateLabel('12 High Street, Leeds')).toBe(false);
  });
});

describe('areaFromLabel (tidying up past trips)', () => {
  it('keeps the town of a "street, town" label', () => {
    expect(areaFromLabel('12 High Street, Leeds', 'GB')).toBe('Leeds');
    expect(areaFromLabel('Tesco Extra, Leeds', 'GB')).toBe('Leeds');
  });

  it('keeps the postcode district and town from an Apple Maps address', () => {
    expect(areaFromLabel('10 Downing Street, London, SW1A 2AA, England', 'GB')).toBe('London SW1A');
    expect(areaFromLabel('Flat 3, Leeds LS6 3AB', 'GB')).toBe('Leeds LS6');
    expect(areaFromLabel('Leeds LS6 3AB', 'GB')).toBe('Leeds LS6');
  });

  it('handles US, Canadian and Australian addresses', () => {
    expect(areaFromLabel('1 Infinite Loop, Cupertino, CA 95014, United States', 'US')).toBe('Cupertino 95014');
    expect(areaFromLabel('290 Bremner Blvd, Toronto, ON M5V 3L9', 'CA')).toBe('Toronto M5V');
    expect(areaFromLabel('12 Church St, Parramatta NSW 2150', 'AU')).toBe('Parramatta 2150');
  });

  it('gives up rather than keep something that may name a person or a street', () => {
    expect(areaFromLabel('Mrs Smith', 'GB')).toBeNull();
    expect(areaFromLabel('Mrs Smith, 12 High St', 'GB')).toBeNull();
    expect(areaFromLabel('51.5074, -0.1278', 'GB')).toBeNull();
    expect(areaFromLabel('12345 Main Street', 'US')).toBeNull();
    expect(areaFromLabel('', 'GB')).toBeNull();
  });
});

describe('privateLabel and redactLabel', () => {
  const places = new Set(['home', 'day centre']);

  it('reduces an address to the area', () => {
    expect(privateLabel('12 High Street, Leeds', 'GB')).toBe('Client visit · Leeds');
    expect(privateLabel('Mrs Smith', 'GB')).toBe('Client visit');
  });

  it('leaves an area-only label as it is', () => {
    expect(privateLabel('Client visit · Leeds LS6', 'GB')).toBe('Client visit · Leeds LS6');
  });

  it('keeps the names of places the user saved', () => {
    expect(redactLabel('Home', null, places, 'GB')).toBe('Home');
    expect(redactLabel('Day Centre ', null, places, 'GB')).toBe('Day Centre ');
    expect(redactLabel('Acme HQ', 'place-1', places, 'GB')).toBe('Acme HQ');
    expect(redactLabel('14 Otley Road, Leeds', null, places, 'GB')).toBe('Client visit · Leeds');
  });
});
