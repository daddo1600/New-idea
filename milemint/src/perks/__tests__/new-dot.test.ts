import { describe, expect, it } from '@jest/globals';

import {
  dotEligibleIds,
  nextDotMemory,
  perksDotVisible,
  PERKS_NEW_DOT_ENABLED,
  type DotContext,
  type DotMemory,
  type DotOffer,
} from '../new-dot';
import { DEMO_OFFERS } from '../offers';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-05T12:00:00.000Z');
const offer = (id: string, extra: Partial<DotOffer> = {}): DotOffer => ({
  id,
  demo: false,
  proOnly: false,
  regions: [],
  vehicles: [],
  endsAt: null,
  ...extra,
});
const EMPTY: DotMemory = { seenIds: [], lastShownAt: null, showing: false };
const context = (extra: Partial<DotContext> = {}): DotContext => ({
  enabled: true,
  offers: [offer('fuel')],
  region: 'GB',
  vehicle: 'car',
  perksFocused: false,
  now: NOW,
  ...extra,
});

describe('Perks new dot', () => {
  it('ships switched off, so nothing shows until a real partner is live', () => {
    expect(PERKS_NEW_DOT_ENABLED).toBe(false);
    expect(perksDotVisible(EMPTY, context({ enabled: false }))).toBe(false);
    expect(nextDotMemory({ ...EMPTY, showing: true }, context({ enabled: false })).showing).toBe(false);
  });

  it('shows for a real offer not yet seen', () => {
    expect(perksDotVisible(EMPTY, context())).toBe(true);
    const next = nextDotMemory(EMPTY, context());
    expect(next).toEqual({ seenIds: [], lastShownAt: NOW.toISOString(), showing: true });
  });

  it('never counts demo offers', () => {
    const demos = DEMO_OFFERS.map((o) => offer(o.id, { demo: true }));
    expect(perksDotVisible(EMPTY, context({ offers: demos }))).toBe(false);
  });

  it('never counts Pro-only offers (no Pro teasers), the same for every user', () => {
    expect(perksDotVisible(EMPTY, context({ offers: [offer('pro', { proOnly: true })] }))).toBe(false);
  });

  it('counts only offers for the region and vehicle, and not ended', () => {
    const offers = [
      offer('us-only', { regions: ['US'] }),
      offer('bikes', { vehicles: ['bicycle'] }),
      offer('ended', { endsAt: new Date(NOW.getTime() - 1).toISOString() }),
      offer('gb-car', { regions: ['GB'], vehicles: ['car'], endsAt: new Date(NOW.getTime() + DAY).toISOString() }),
    ];
    expect(dotEligibleIds(offers, 'GB', 'car', NOW)).toEqual(['gb-car']);
  });

  it('is hidden while Perks is open, and opening Perks marks every offer seen', () => {
    const showing = nextDotMemory(EMPTY, context());
    expect(perksDotVisible(showing, context({ perksFocused: true }))).toBe(false);
    const opened = nextDotMemory(showing, context({ perksFocused: true }));
    expect(opened.seenIds).toEqual(['fuel']);
    expect(opened.showing).toBe(false);
    expect(perksDotVisible(opened, context())).toBe(false);
  });

  it('stays up until Perks is opened', () => {
    const showing = nextDotMemory(EMPTY, context());
    const later = context({ now: new Date(NOW.getTime() + 10 * DAY) });
    expect(nextDotMemory(showing, later)).toBe(showing);
    expect(perksDotVisible(showing, later)).toBe(true);
  });

  it('shows at most once a week, even when more offers arrive', () => {
    const opened = nextDotMemory(nextDotMemory(EMPTY, context()), context({ perksFocused: true }));
    const more = [offer('fuel'), offer('coffee')];
    const sixDays = context({ offers: more, now: new Date(NOW.getTime() + 6 * DAY) });
    expect(perksDotVisible(opened, sixDays)).toBe(false);
    const sevenDays = context({ offers: more, now: new Date(NOW.getTime() + 7 * DAY) });
    expect(perksDotVisible(opened, sevenDays)).toBe(true);
  });

  it('goes down if the new offer is withdrawn before Perks is opened', () => {
    const showing = nextDotMemory(EMPTY, context());
    expect(nextDotMemory(showing, context({ offers: [] })).showing).toBe(false);
  });
});
