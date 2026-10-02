import { msg } from '@/i18n/i18n';

/**
 * DEMO ONLY: the partner offers shown on the Perks tab. Every brand here is
 * made up, so the demo never looks like a real company's deal; the tab says
 * so in a banner. When real partners sign up, these come from a server
 * instead (with the live weekly numbers).
 *
 * Perks are only deals: they never unlock anything in MileSprout (App Store
 * guideline 3.1.4). Brand names stay in English; the rest is marked for
 * translation (show with t()).
 */

/** In store: show the QR code at the till. Online: type the code in at checkout. */
export type OfferKind = 'in-store' | 'online';

export type PerkOffer = {
  id: string;
  /** Fictional brand, never translated. */
  partner: string;
  /** Three letters in each code ("MS-KRB-…"), so staff can see whose code it is. */
  codePrefix: string;
  /** The emblem: initials on a coloured circle (no logos). */
  initials: string;
  /**
   * The partner's brand colour: the emblem, and the band on its card and code
   * screen. Dark enough for white initials (4.5:1 or more).
   */
  color: string;
  category: string;
  headline: string;
  terms: string;
  kind: OfferKind;
  /** Codes the partner pays for each week (Monday to Sunday). */
  weeklyCap: number;
  /** Demo value: codes other drivers have already claimed this week. */
  claimedByOthers: number;
  /**
   * Minutes a code works for once claimed, set by the partner: short in store
   * (claim it at the till), longer online. Not used in time, it goes back
   * into the week's pool.
   */
  useWithinMinutes: number;
  /** How often one person can have a code, set by the partner. */
  perPerson: PerPersonLimit;
};

export type LimitPeriod = 'day' | 'week' | 'month';

/** E.g. one a day. Used and still-live codes count; a code left to run out doesn't. */
export type PerPersonLimit = { count: number; period: LimitPeriod };

export const DEMO_OFFERS: readonly PerkOffer[] = [
  {
    id: 'kerbside-fuel',
    partner: 'Kerbside Fuel',
    codePrefix: 'KRB',
    initials: 'KF',
    color: '#C2461F',
    category: msg('Fuel'),
    headline: msg('10p off a litre of fuel'),
    terms: msg('Up to 40 litres. One fill-up per code.'),
    kind: 'in-store',
    weeklyCap: 50,
    claimedByOthers: 16,
    useWithinMinutes: 30,
    perPerson: { count: 1, period: 'day' },
  },
  {
    id: 'daybreak-coffee',
    partner: 'Daybreak Coffee',
    codePrefix: 'DBK',
    initials: 'DC',
    color: '#8B5E3C',
    category: msg('Coffee'),
    headline: msg('A free hot drink'),
    terms: msg('Any size. In store only.'),
    kind: 'in-store',
    weeklyCap: 120,
    claimedByOthers: 71,
    useWithinMinutes: 30,
    perPerson: { count: 1, period: 'day' },
  },
  {
    id: 'treadright-tyres',
    partner: 'TreadRight Tyres',
    codePrefix: 'TRD',
    initials: 'TR',
    color: '#2F4858',
    category: msg('Tyres & servicing'),
    headline: msg('Free tyre check + 15% off tyres'),
    terms: msg('Fitting included. Walk in or book ahead.'),
    kind: 'in-store',
    weeklyCap: 30,
    claimedByOthers: 9,
    useWithinMinutes: 60,
    perPerson: { count: 1, period: 'month' },
  },
  {
    id: 'sparkle-car-wash',
    partner: 'Sparkle Hand Car Wash',
    codePrefix: 'SPK',
    initials: 'SW',
    color: '#1679B8',
    category: msg('Car wash'),
    headline: msg('£3 off any wash'),
    terms: msg('Valets too. Not with other offers.'),
    kind: 'in-store',
    weeklyCap: 40,
    claimedByOthers: 27,
    useWithinMinutes: 30,
    perPerson: { count: 1, period: 'week' },
  },
  {
    id: 'spokes-chains',
    partner: 'Spokes & Chains',
    codePrefix: 'SNC',
    initials: 'SC',
    color: '#4A7A22',
    category: msg('Bike repairs'),
    headline: msg('Free bike safety check'),
    terms: msg('Bikes and e-bikes. In store only.'),
    kind: 'in-store',
    weeklyCap: 25,
    claimedByOthers: 22,
    useWithinMinutes: 30,
    perPerson: { count: 1, period: 'month' },
  },
  {
    id: 'gripmount',
    partner: 'GripMount',
    codePrefix: 'GRP',
    initials: 'GM',
    color: '#7B2CBF',
    category: msg('Phone mounts'),
    headline: msg('20% off a phone mount'),
    terms: msg('Online code. Type it in at checkout.'),
    kind: 'online',
    weeklyCap: 60,
    claimedByOthers: 18,
    useWithinMinutes: 24 * 60,
    perPerson: { count: 1, period: 'month' },
  },
  {
    id: 'ledgerlite-tax',
    partner: 'LedgerLite Tax',
    codePrefix: 'LDG',
    initials: 'LL',
    color: '#C0392B',
    category: msg('Tax help'),
    headline: msg('£20 off your Self Assessment'),
    terms: msg('Online code. For your first tax return with them.'),
    kind: 'online',
    weeklyCap: 20,
    claimedByOthers: 6,
    useWithinMinutes: 24 * 60,
    perPerson: { count: 1, period: 'month' },
  },
];

export function findOffer(id: string): PerkOffer | undefined {
  return DEMO_OFFERS.find((offer) => offer.id === id);
}
