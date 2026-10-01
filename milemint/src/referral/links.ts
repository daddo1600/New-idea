import { t } from '@/i18n/i18n';

/** MileMint on the App Store (live once version 1.0 is released). */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6817748981';
const APP_ID = '6817748981';

/**
 * Apple offer code giving a friend their first month of Pro free. Set once it
 * has been created in App Store Connect (Subscriptions → Offer codes), which
 * Apple only allows when the app is live. Until then shares carry the plain
 * App Store link.
 */
export const FRIEND_OFFER_CODE: string | null = null;

const redeemUrl = (code: string) => `https://apps.apple.com/redeem?ctx=offercodes&id=${APP_ID}&code=${code}`;

/**
 * A message to share, with the download link and (when live) the friend's
 * free month. `message` should already be translated; the link lines are
 * translated here, in the current language.
 */
export function withInvite(message: string): string {
  const lines = [message, '', t('Get MileMint free on the App Store: {{url}}', { url: APP_STORE_URL })];
  if (FRIEND_OFFER_CODE) {
    lines.push(t('New to Pro? Your first month is on me: {{url}}', { url: redeemUrl(FRIEND_OFFER_CODE) }));
  }
  return lines.join('\n');
}

/** The "Invite a friend" message, in the current language. Call it when sharing. */
export function inviteMessage(): string {
  return withInvite(
    t(
      'I use MileMint to log my business mileage automatically. It works out what every drive is worth at tax time, so nothing goes unclaimed. 🚗💸',
    ),
  );
}

/** The invite in the language the app opened in. Prefer `inviteMessage()`, which follows language changes. */
export const INVITE_MESSAGE = inviteMessage();
