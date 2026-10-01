import { REGIONS, regionFromLocale, type RegionCode } from './regions';

/** Time zones that place a phone in a supported country, for when the Region setting is missing. */
const ZONE_PREFIXES: [prefix: string, region: RegionCode][] = [
  ['Europe/London', 'GB'],
  ['Europe/Belfast', 'GB'],
  ['Australia/', 'AU'],
  ['America/Toronto', 'CA'],
  ['America/Vancouver', 'CA'],
  ['America/Edmonton', 'CA'],
  ['America/Winnipeg', 'CA'],
  ['America/Regina', 'CA'],
  ['America/Halifax', 'CA'],
  ['America/St_Johns', 'CA'],
  ['America/Moncton', 'CA'],
  ['America/Whitehorse', 'CA'],
  ['America/Yellowknife', 'CA'],
  ['America/Iqaluit', 'CA'],
  ['America/New_York', 'US'],
  ['America/Chicago', 'US'],
  ['America/Denver', 'US'],
  ['America/Phoenix', 'US'],
  ['America/Los_Angeles', 'US'],
  ['America/Anchorage', 'US'],
  ['America/Detroit', 'US'],
  ['America/Boise', 'US'],
  ['America/Indiana/', 'US'],
  ['America/Kentucky/', 'US'],
  ['Pacific/Honolulu', 'US'],
];

/**
 * Where the phone is set up for, without asking for location: the iPhone's
 * Region setting first (what iOS itself uses for currency), then its time
 * zone, then the language's country ("en-GB"). Null when none is supported.
 */
export function detectRegion(signals: {
  regionCode?: string | null;
  timeZone?: string | null;
  locale?: string | null;
}): RegionCode | null {
  const region = signals.regionCode?.toUpperCase();
  if (region === 'UK') return 'GB';
  if (region && region in REGIONS) return region as RegionCode;
  const zone = signals.timeZone ?? '';
  const match = ZONE_PREFIXES.find(([prefix]) => zone === prefix || (prefix.endsWith('/') && zone.startsWith(prefix)));
  if (match) return match[1];
  return regionFromLocale(signals.locale ?? undefined);
}
