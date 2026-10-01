import type { RegionCode } from './regions';
import { SHIFT_END_LABEL, SHIFT_START_LABEL } from './shift-split';

/**
 * Client privacy mode, for care workers, community nurses, home-health aides,
 * NDIS support workers, social workers and anyone else who drives to clients
 * or patients at home and must not keep their addresses on a personal phone.
 *
 * With it on, a stop the user hasn't named themselves is stored as the area
 * only ("Client visit · Leeds LS6"), never the house number or street, and no
 * GPS route is kept. Exports contain only what is stored, so they are
 * area-level too.
 *
 * That is still a valid mileage log. HMRC, the IRS, CRA and the ATO ask for the
 * date, destination, business purpose and distance of each business trip; an
 * area-level destination plus the purpose is the common practice for care and
 * community workers, whose employers and professional bodies tell them not to
 * record client addresses. A non-identifying client reference (initials or a
 * client number) can go in the purpose field, which ties a trip to the
 * employer's own visit records without naming anyone.
 *
 * Pure, so the rules for what is kept are the ones tested here.
 */

/**
 * What the label of an unnamed stop starts with. Stored in English like
 * purposes are, because the labels end up in the reports to the tax office
 * (which stay in English).
 */
export const CLIENT_VISIT = 'Client visit';

/** What an area looks like in each region, for explaining the mode. */
export const AREA_EXAMPLES: Record<RegionCode, string> = {
  GB: 'Leeds LS6',
  US: 'Austin 78701',
  CA: 'Toronto M5V',
  AU: 'Parramatta 2150',
};

/** The parts of a reverse-geocoded address that describe an area (no street or house number). */
export type GeocodedArea = {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
  postalCode?: string | null;
  isoCountryCode?: string | null;
};

const POSTCODES: Record<RegionCode, { full: RegExp; inText: RegExp }> = {
  // Outward code (postcode district), e.g. "SW1A" of "SW1A 2AA": thousands of homes.
  GB: {
    full: /^([A-Z]{1,2}\d[A-Z\d]?)(?:\s*\d[A-Z]{2})?$/,
    inText: /(?:^|\s)([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}(?=$|\s)/i,
  },
  // The 5-digit ZIP, without the ZIP+4 that narrows it to a block or a building.
  US: { full: /^(\d{5})(?:-?\d{4})?$/, inText: /(?:^|\s)(\d{5})(?:-\d{4})?$/ },
  // Forward sortation area, e.g. "M5V" of "M5V 3L9".
  CA: { full: /^([A-Z]\d[A-Z])(?:\s*\d[A-Z]\d)?$/, inText: /(?:^|\s)([A-Z]\d[A-Z])\s*\d[A-Z]\d(?=$|\s)/i },
  // A 4-digit postcode already covers a suburb or several.
  AU: { full: /^(\d{4})$/, inText: /(?:^|\s)(\d{4})$/ },
};

const isRegionCode = (code: string): code is RegionCode => code in POSTCODES;

function countryOf(code: string | null | undefined, fallback: RegionCode | null): string | null {
  const upper = code?.trim().toUpperCase();
  if (upper === 'UK') return 'GB';
  return upper || fallback;
}

/**
 * The area part of a postal code: UK outward code, Canadian FSA, US 5-digit
 * ZIP, Australian postcode. Elsewhere, the first part of a two-part code
 * ("D02" of "D02 X285"), or nothing when the code has only one part.
 */
export function postcodeArea(postalCode: string | null | undefined, country: string | null): string | null {
  const code = postalCode?.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!code) return null;
  if (country && isRegionCode(country)) return POSTCODES[country].full.exec(code)?.[1] ?? null;
  const [first, ...rest] = code.split(/[\s-]/);
  return rest.length > 0 && first ? first : null;
}

/**
 * Area-only label for a reverse-geocoded address: town or suburb plus the
 * area part of the postcode, e.g. "Leeds LS6", "Austin 78701", "Toronto M5V",
 * "Parramatta 2150". Never the street or house number. Null when the address
 * has nothing area-level in it.
 *
 * `region` is the user's country, used when the address doesn't say its own.
 */
export function areaLabel(place: GeocodedArea | null | undefined, region: RegionCode | null): string | null {
  if (!place) return null;
  const country = countryOf(place.isoCountryCode, region);
  const postcode = postcodeArea(place.postalCode, country);
  const town = [place.city, place.district, place.subregion]
    .map((part) => part?.trim())
    // A town never has digits; a value with them is more likely part of an address.
    .find((part) => part && !/\d/.test(part));
  const label = [town, postcode].filter(Boolean).join(' ');
  return label || place.region?.trim() || null;
}

/** "Client visit · Leeds LS6", or just "Client visit" when the area isn't known. */
export function clientVisitLabel(area: string | null): string {
  return area ? `${CLIENT_VISIT} · ${area}` : CLIENT_VISIT;
}

/** Already reduced to the area (or nothing), so there's nothing left to remove. */
export function isPrivateLabel(label: string): boolean {
  const text = label.trim();
  return text === CLIENT_VISIT || text.startsWith(`${CLIENT_VISIT} · `);
}

/** Address lines that name the country, e.g. Apple Maps' "London, SW1A 2AA, England". */
const COUNTRY_NAMES = new Set([
  'england',
  'scotland',
  'wales',
  'northern ireland',
  'united kingdom',
  'uk',
  'united states',
  'united states of america',
  'usa',
  'us',
  'canada',
  'australia',
]);

/** Last words that make a part of an address a street rather than a town ("Otley Road", "King St W"). */
const STREET_WORDS = [
  'road', 'rd', 'street', 'st', 'lane', 'ln', 'avenue', 'ave', 'av', 'drive', 'dr', 'close', 'cl', 'grove', 'gr',
  'way', 'court', 'ct', 'crescent', 'cres', 'place', 'pl', 'gardens', 'gdns', 'terrace', 'tce', 'terr', 'hill',
  'row', 'walk', 'square', 'sq', 'mews', 'parade', 'pde', 'rise', 'view', 'green', 'park', 'boulevard', 'blvd',
  'highway', 'hwy', 'parkway', 'pkwy', 'circle', 'cir', 'trail', 'trl', 'loop', 'esplanade', 'esp', 'crest',
  'chase', 'wynd', 'gate', 'fold', 'croft', 'vale', 'approach', 'bank', 'yard', 'alley', 'broadway', 'circuit', 'cct',
].join('|');
const STREET = new RegExp(`(?:^|\\s)(?:${STREET_WORDS})\\.?(?:\\s+(?:n|s|e|w|ne|nw|se|sw|north|south|east|west))?$`, 'i');
/** Streets that lead with their kind: "The Avenue", "Rue de la Paix". */
const STREET_START = /^(?:the\s+(?:avenue|drive|close|crescent|grove|green|parade|mews|square|street|lane|walk)|rue|via|calle|avenida)(?:\s|$)/i;
/** A person's title or a dwelling: "Mrs Smith", "Flat 2", "Rose Cottage", "Patel Residence". */
const PERSONAL =
  /(?:^|\s)(?:mr|mrs|ms|miss|mx|dr|prof|sir|lady|lord|rev|dame|flat|apartment|apt|unit|suite|house|cottage|residence|farm|lodge|barn|bungalow|villa|manor|hall|block|floor|room|home|c\/o)\.?(?=\s|$)/i;

/**
 * Whether a part of an address can stand as the town or locality ("Leeds",
 * "Headingley", "Parramatta"): letters only, not a street, not a name or a
 * building. Without a gazetteer this can only rule things out, so it errs on
 * the side of dropping a real town rather than keeping a street.
 */
export function looksLikeTown(part: string): boolean {
  const text = part.trim();
  if (!text || text.length > 40 || !/^\p{L}[\p{L}\s'’.-]*$/u.test(text)) return false;
  return !STREET.test(text) && !STREET_START.test(text) && !PERSONAL.test(text);
}

/**
 * The area of a label already saved as text, e.g. "12 High Street, Leeds" →
 * "Leeds", "1 Infinite Loop, Cupertino, CA 95014" → "Cupertino 95014",
 * "Elm Grove LS6 2AA" → "LS6", for tidying up past trips without looking
 * anything up again. Only ever the postcode district (UK outward code, US
 * 5-digit ZIP, Canadian FSA, Australian postcode) and the town or suburb
 * beside it, never a street, a building or a name. Careful rather than
 * clever: when it can't tell a town from a name or a street, the town is left
 * out, and with nothing left it returns null (the label becomes "Client visit").
 *
 * The first part of a label with several parts is never used: it's the street,
 * the building or the client's name.
 */
export function areaFromLabel(label: string, region: RegionCode | null): string | null {
  const parts = label
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !COUNTRY_NAMES.has(part.toLowerCase()));
  if (parts.length === 0) return null;
  const single = parts.length === 1;
  const candidates = single ? parts : parts.slice(1);
  // The label's own postcode style tells the country; numeric ones only count in the user's region.
  const styles: RegionCode[] = region ? [region, ...(['GB', 'CA'] as const).filter((c) => c !== region)] : ['GB', 'CA'];

  // The postcode nearest the end, and what's left of its part once it's taken out.
  let postcode: string | null = null;
  let postcodePart = -1;
  let rest = '';
  for (let i = candidates.length - 1; i >= 0 && postcode === null; i--) {
    for (const style of styles) {
      const found = POSTCODES[style].inText.exec(candidates[i]);
      if (!found) continue;
      postcode = found[1].toUpperCase();
      postcodePart = i;
      rest = (candidates[i].slice(0, found.index) + candidates[i].slice(found.index + found[0].length)).trim();
      break;
    }
  }
  // One part and no postcode: "Mrs Smith" or "Acme Ltd" can't be told from a town.
  if (single && postcode === null) return null;

  // A state or province code beside the postcode ("CA 95014", "NSW 2150") isn't the town.
  const withoutState = (text: string | undefined) => (text ?? '').replace(/(?:^|\s)[A-Z]{2,3}$/, '').trim();
  // The town is beside the postcode ("Leeds LS6 3AB", "Leeds, LS6 3AB"), or the last part when there's none.
  const beside =
    postcode === null
      ? candidates[candidates.length - 1]
      : withoutState(rest) || candidates[postcodePart - 1];
  const town = withoutState(beside);
  const area = [looksLikeTown(town) ? town : null, postcode].filter(Boolean).join(' ');
  return area || null;
}

/** What a label becomes in privacy mode: kept if it's already area-only, else "Client visit · area". */
export function privateLabel(label: string, region: RegionCode | null): string {
  return isPrivateLabel(label) ? label.trim() : clientVisitLabel(areaFromLabel(label, region));
}

/** The names of the places the user saved, trimmed and lower-cased, for comparing labels. */
export function placeNameSet(places: readonly { name: string }[]): Set<string> {
  return new Set(places.map((place) => place.name.trim().toLowerCase()));
}

/**
 * Whether a label is one the user chose: the name of a place they saved
 * themselves (Home, Work, "Day centre") keeps its name in privacy mode.
 *
 * Only the text counts, not the trip's link to a place: the two can disagree
 * (a label edited after the trip was linked, or a typed address linked to a
 * saved place nearby), and then the label is an address.
 */
export function isNamedPlace(label: string, placeNames: ReadonlySet<string>): boolean {
  return placeNames.has(label.trim().toLowerCase());
}

/** Whether privacy mode would keep a label as it is: a saved place's name, or the area only. */
export function isAreaOnly(label: string, placeNames: ReadonlySet<string>): boolean {
  return isPrivateLabel(label) || isNamedPlace(label, placeNames);
}

/** A label as privacy mode stores it: the saved place's name, or the area only. */
export function redactLabel(label: string, placeNames: ReadonlySet<string>, region: RegionCode | null): string {
  return isNamedPlace(label, placeNames) ? label : privateLabel(label, region);
}

/**
 * A place label as shown in the app: "Client visit" in the app's language.
 * It's saved in English (it goes into reports for the tax office), but on
 * screen it should read like the rest of the app.
 */
export function shownLabel(label: string, translate: (key: string) => string): string {
  // Where a drive was cut at the end of a shift, when the spot wasn't looked up.
  if (label === SHIFT_END_LABEL) return translate(SHIFT_END_LABEL);
  if (label === SHIFT_START_LABEL) return translate(SHIFT_START_LABEL);
  if (label === CLIENT_VISIT || label.startsWith(`${CLIENT_VISIT} · `)) {
    return translate(CLIENT_VISIT) + label.slice(CLIENT_VISIT.length);
  }
  return label;
}

