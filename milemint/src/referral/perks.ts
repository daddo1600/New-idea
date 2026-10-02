import type { Perk } from '@/domain/plan';
import { msg } from '@/i18n/i18n';

/** Each invite perk's name, marked for translation (show with t()). */
export const PERK_NAMES: Record<Perk, string> = {
  'tax-set-aside': msg('Tax set-aside'),
  'platform-earnings': msg('Earnings by platform'),
  'founding-badge': msg('Founding driver badge'),
};

/** What each perk gives, in one line. */
export const PERK_DETAILS: Record<Perk, string> = {
  'tax-set-aside': msg('A pot that shows what to put aside for tax. Yours for good, even without Pro.'),
  'platform-earnings': msg('See what each delivery app pays you, plus gold leaves on your sprout.'),
  'founding-badge': msg('A Founding driver badge in Settings, for helping MileSprout grow.'),
};
