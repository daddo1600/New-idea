import { describe, expect, it } from '@jest/globals';

import { APP_STORE_URL, setShareCode, withInvite } from '../links';

describe('withInvite', () => {
  it('adds the App Store link, and the referral code once there is one', () => {
    setShareCode(null);
    const plain = withInvite('Hi');
    expect(plain).toContain(APP_STORE_URL);
    expect(plain).not.toContain('code');

    setShareCode('TRVB-7K2');
    const coded = withInvite('Hi');
    expect(coded.startsWith('Hi\n')).toBe(true);
    expect(coded).toContain('TRVB-7K2');
    expect(coded).toContain('10 extra free drives a month');
    setShareCode(null);
  });

  it('can be given a code directly', () => {
    expect(withInvite('Hi', 'MNPQ-4X9')).toContain('MNPQ-4X9');
  });
});
