import { describe, expect, it, jest } from '@jest/globals';

import { REGIONS } from '@/domain/regions';

import { APP_STORE_URL, inviteText, offerCode, redeemUrl, withInvite } from '../links';

describe('withInvite', () => {
  it('adds the App Store link, and the invite code when there is one', () => {
    const plain = withInvite('Hi', null);
    expect(plain).toContain(APP_STORE_URL);
    expect(plain).not.toContain('code');

    const coded = withInvite('Hi', 'TRVB-7K2');
    expect(coded.startsWith('Hi\n')).toBe(true);
    expect(coded).toContain('TRVB-7K2');
  });

  it('says nothing about a discount while no offer code is set', () => {
    expect(offerCode()).toBe('');
    expect(withInvite(inviteText(REGIONS.GB), 'TRVB-7K2')).not.toMatch(/50%|half price/);
  });

  it('carries the code it is given, so each share has its own', () => {
    expect(withInvite(inviteText(REGIONS.US), 'MNPQ-4X9')).toContain('MNPQ-4X9');
    expect(withInvite(inviteText(REGIONS.US), 'BCDF-234')).not.toContain('MNPQ-4X9');
  });
});

describe('inviteText', () => {
  const today = new Date('2026-10-02T12:00:00');

  it('leads with what’s free, then the rate in the country’s own money and units', () => {
    const uk = inviteText(REGIONS.GB, today);
    expect(uk).toMatch(/^I log my work miles with MileSprout/);
    expect(uk).toContain('HMRC allows 55p a mile');
    expect(inviteText(REGIONS.US, today)).toContain('IRS allows 76¢ a mile');
    expect(inviteText(REGIONS.CA, today)).toContain('CRA allows 73¢ a km');
    expect(inviteText(REGIONS.AU, today)).toContain('ATO allows 91c a km');
  });
});

describe('with an offer code', () => {
  it('offers the friend 50% off their first year', () => {
    jest.isolateModules(() => {
      jest.doMock('@/constants/rewards', () => ({
        FRIEND_OFFER_CODE: 'SPROUTFRIEND',
        FRIEND_GIFT_MONTHS: 12,
        FOUNDING_BOOST_ENDS: '2027-01-31',
      }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const links = require('../links') as typeof import('../links');
      expect(links.offerCode()).toBe('SPROUTFRIEND');
      expect(links.withInvite('Hi', 'TRVB-7K2')).toContain('your first year of Pro is 50% off');
    });
  });

  it('links to the App Store’s redeem page with the code filled in', () => {
    expect(redeemUrl('SPROUT FRIEND')).toBe(
      'https://apps.apple.com/redeem?ctx=offercodes&id=6817748981&code=SPROUT%20FRIEND',
    );
  });
});
