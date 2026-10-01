import { describe, expect, it } from '@jest/globals';

import {
  areaFromLabel,
  areaLabel,
  clientVisitLabel,
  isAreaOnly,
  isNamedPlace,
  isPrivateLabel,
  looksLikeTown,
  placeNameSet,
  postcodeArea,
  privateLabel,
  redactLabel,
  type GeocodedArea,
} from '../privacy';
import type { RegionCode } from '../regions';

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
    expect(redactLabel('Home', places, 'GB')).toBe('Home');
    expect(redactLabel('Day Centre ', places, 'GB')).toBe('Day Centre ');
    expect(redactLabel('14 Otley Road, Leeds', places, 'GB')).toBe('Client visit · Leeds');
  });

  it('reduces an address even when the trip is linked to a saved place', () => {
    // The label was edited after linking, or a typed address landed on a saved place: the text is what's kept.
    expect(redactLabel('3 Kirkstall Lane, Leeds LS5 3BB', places, 'GB')).toBe('Client visit · Leeds LS5');
    expect(isNamedPlace('3 Kirkstall Lane, Leeds LS5 3BB', places)).toBe(false);
  });
});

describe('isAreaOnly', () => {
  const places = placeNameSet([{ name: 'Home' }, { name: ' Day centre' }]);

  it('is true for saved place names and area-only labels', () => {
    expect(isAreaOnly('home', places)).toBe(true);
    expect(isAreaOnly('Day Centre', places)).toBe(true);
    expect(isAreaOnly('Client visit · Leeds LS6', places)).toBe(true);
    expect(isAreaOnly('Client visit', places)).toBe(true);
  });

  it('is false for anything that may still be an address', () => {
    expect(isAreaOnly('14 Otley Road, Leeds', places)).toBe(false);
    expect(isAreaOnly('Mrs Smith', places)).toBe(false);
  });
});

describe('areaFromLabel never keeps a street or a name', () => {
  it.each([
    ['Mrs Smith, Otley Road', 'GB', null],
    ['Elm Grove LS6 2AA', 'GB', 'LS6'],
    ['9 Elm Grove', 'GB', null],
    ['Otley Road, Leeds', 'GB', 'Leeds'],
    ['14 Otley Road, Leeds, LS6 3AA, England', 'GB', 'Leeds LS6'],
    ['Flat 2, 9 Elm Grove, Headingley, Leeds LS6 2AA', 'GB', 'Leeds LS6'],
    ['Rose Cottage, Church Lane, Bramhope, LS16 9AA', 'GB', 'Bramhope LS16'],
    ['Rose Cottage, Church Lane, LS16 9AA', 'GB', 'LS16'],
    ['Patel Residence, 22 Cardigan Rd, Leeds', 'GB', 'Leeds'],
    ['John Smith, 4 The Avenue, Leeds', 'GB', 'Leeds'],
    ['Apartment 4B, Marlborough House, Leeds', 'GB', 'Leeds'],
    ['Mr Patel, Mrs Patel', 'GB', null],
    ['Acme Ltd, Mrs Patel LS6 2AA', 'GB', 'LS6'],
    ['22B Baker Street, London NW1 6XE', 'GB', 'London NW1'],
    ['Smith, Hyde Park', 'GB', null],
    ['Smith, Kirkstall Lane', 'GB', null],
    ['Smith, The Avenue', 'GB', null],
    ['Smith, Dr Jones', 'GB', null],
    ['123 Main St, Apt 4, Austin, TX 78701-1234', 'US', 'Austin 78701'],
    ['Jane Doe, 500 Oak Ave, Springfield, IL 62704', 'US', 'Springfield 62704'],
    ['Jane Doe, Oak Ave 62704', 'US', '62704'],
    ['100 King St W, Toronto, ON M5X 1A9', 'CA', 'Toronto M5X'],
    ['Jane Doe, King St W M5X 1A9', 'CA', 'M5X'],
    ['12 Smith St, Parramatta NSW 2150', 'AU', 'Parramatta 2150'],
    ['Unit 3/45 George St, Parramatta, NSW 2150, Australia', 'AU', 'Parramatta 2150'],
    ['Jane Doe, George St NSW 2150', 'AU', '2150'],
  ] satisfies [string, RegionCode, string | null][])('%s (%s) → %s', (label, region, area) => {
    expect(areaFromLabel(label, region)).toBe(area);
  });

  it('only lets through a part that could be a town', () => {
    expect(looksLikeTown('Leeds')).toBe(true);
    expect(looksLikeTown('Headingley')).toBe(true);
    expect(looksLikeTown('Saint-Laurent')).toBe(true);
    expect(looksLikeTown('Otley Road')).toBe(false);
    expect(looksLikeTown('King St W')).toBe(false);
    expect(looksLikeTown('Mrs Smith')).toBe(false);
    expect(looksLikeTown('Rose Cottage')).toBe(false);
    expect(looksLikeTown('Flat 2')).toBe(false);
    expect(looksLikeTown('')).toBe(false);
  });
});
