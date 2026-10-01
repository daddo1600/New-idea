import { describe, expect, it } from '@jest/globals';

import { APP_STORE_URL, inviteText, withInvite } from '../links';

describe('withInvite', () => {
  it('adds the App Store link, and the invite code when there is one', () => {
    const plain = withInvite('Hi', null);
    expect(plain).toContain(APP_STORE_URL);
    expect(plain).not.toContain('code');

    const coded = withInvite('Hi', 'TRVB-7K2');
    expect(coded.startsWith('Hi\n')).toBe(true);
    expect(coded).toContain('TRVB-7K2');
    expect(coded).toContain('10 extra free drives a month');
  });

  it('carries the code it is given, so each share has its own', () => {
    expect(withInvite(inviteText(), 'MNPQ-4X9')).toContain('MNPQ-4X9');
    expect(withInvite(inviteText(), 'BCDF-234')).not.toContain('MNPQ-4X9');
  });
});
