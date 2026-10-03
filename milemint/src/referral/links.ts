import { FRIEND_OFFER_CODE } from '@/constants/rewards';
import { DEMO_OFFER_CODE } from '@/dev/demo';
import { formatRate, ratePeriodFor, type Region } from '@/domain/regions';
import { toLocalIsoDate } from '@/domain/trip';
import { t } from '@/i18n/i18n';

/** MileSprout on the App Store (live once version 1.0 is released). */
export const APP_ID = '6817748981';
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_ID}`;

/**
 * The friend's 50% off code (constants/rewards), or in the web demo the one
 * given with `&offer=`; empty while none is set, which hides every line
 * about the friend's discount.
 */
export function offerCode(): string {
  return FRIEND_OFFER_CODE || DEMO_OFFER_CODE || '';
}

/** The App Store's own page for redeeming an offer code, with the code filled in. */
export function redeemUrl(code: string): string {
  return `https://apps.apple.com/redeem?ctx=offercodes&id=${APP_ID}&code=${encodeURIComponent(code)}`;
}

/**
 * A message to share, with the download link and a fresh single-use invite
 * code (the ReferralProvider's shareInvite makes one per share). Once the
 * offer code is set, the code line also says it gets the friend 50% off their
 * first year of Pro: the friend enters the invite code when setting up, and
 * the Pro screen offers the discount when they want Pro. `message` should
 * already be translated; the extra lines are translated here, in the current
 * language.
 */
export function withInvite(message: string, code: string | null): string {
  const lines = [message, '', t('Get MileSprout free on the App Store: {{url}}', { url: APP_STORE_URL })];
  if (code) {
    lines.push(
      offerCode()
        ? t('Use my invite code {{code}} when you set up MileSprout and your first year of Pro is 50% off.', { code })
        : t('Use my invite code {{code}} when you set up MileSprout.', { code }),
    );
  }
  return lines.join('\n');
}

/**
 * The "Invite a driver" message in the current language, without the code
 * (withInvite adds it, with the friend's discount): what's free first, so the
 * discount reads as a gift, then the tax office's rate today, e.g. "HMRC
 * allows 55p a mile".
 */
export function inviteText(region: Region, today = new Date()): string {
  const miles = region.unit === 'mi';
  const rate = ratePeriodFor(toLocalIsoDate(today), region)?.tiers[0]?.rate;
  const lines = [
    miles
      ? t('I log my work miles with MileSprout. It logs every drive by itself, free, with no account.')
      : t('I log my work kilometres with MileSprout. It logs every drive by itself, free, with no account.'),
  ];
  if (rate) {
    const params = { authority: region.authority, rate: formatRate(rate, region) };
    lines.push(
      miles
        ? t('{{authority}} allows {{rate}} a mile, so it adds up fast.', params)
        : t('{{authority}} allows {{rate}} a km, so it adds up fast.', params),
    );
  }
  return lines.join(' ');
}
