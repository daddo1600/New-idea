import type { CelebrationContent } from '@/components/celebration';
import { HABITS, type HabitId, type Milestone } from '@/domain/milestones';
import { formatMoney, type Region } from '@/domain/regions';
import { msg, t } from '@/i18n/i18n';

/** A few warm messages, picked by the milestone so the same one always reads the same. */
const MONEY_MESSAGES = [
  msg('MileSprout has now found {{amount}} in business mileage for you. You earned all of it.'),
  msg('MileSprout has now found {{amount}} in business mileage for you. That’s your hard work, counted.'),
  msg('MileSprout has now found {{amount}} in business mileage for you. It all counts at tax time.'),
  msg('MileSprout has now found {{amount}} in business mileage for you. Well done. Keep going.'),
];

const pounds = (region: Region, major: number) => formatMoney(major * 100, region).replace(/[.,]00$/, '');

/**
 * The celebration for a milestone, in the current language. `employee`: a UK
 * employee, whose mileage isn't money back by itself (they claim relief on
 * what the employer didn't pay), so the money milestones talk about mileage
 * logged. `share` is the brag line alone: the celebration adds the App Store
 * link and a fresh single-use invite code when Share is tapped.
 */
export function celebrationFor(milestone: Milestone, region: Region, employee = false): CelebrationContent {
  if (milestone.kind === 'money' && employee) {
    const amount = pounds(region, milestone.threshold);
    return {
      emoji: '💰',
      title: t('{{amount}} of business mileage logged', { amount }),
      message: t(
        'MileSprout has now logged {{amount}} of business mileage at {{authority}} rates, ready for your expense and relief claims.',
        { amount, authority: region.authority },
      ),
      share: t('I’ve logged {{amount}} of business mileage with MileSprout 🚗 Every mile counted, automatically.', {
        amount,
      }),
    };
  }
  if (milestone.kind === 'money') {
    const amount = pounds(region, milestone.threshold);
    const message = MONEY_MESSAGES[Math.round(Math.log10(milestone.threshold) * 3) % MONEY_MESSAGES.length];
    return {
      emoji: '💰',
      title: t('{{amount}} found for you', { amount }),
      message: t(message, { amount }),
      share: t('I’ve found {{amount}} in business mileage with MileSprout 🚗💸 Every mile counted, automatically.', {
        amount,
      }),
    };
  }
  if (milestone.kind === 'distance') {
    // `count` lets a language pick a plural form; `distance` is the formatted number shown.
    const params = {
      distance: new Intl.NumberFormat(region.locale).format(milestone.threshold),
      count: milestone.threshold,
    };
    const mi = region.unit === 'mi';
    return {
      emoji: '🛣️',
      title: mi ? t('{{distance}} business miles', params) : t('{{distance}} business km', params),
      message: mi
        ? t('{{distance}} miles logged for work, every one counted. That’s a lot of road.', params)
        : t('{{distance}} km logged for work, every one counted. That’s a lot of road.', params),
      share: mi
        ? t('{{distance}} business miles logged with MileSprout 🛣️ Every one counted.', params)
        : t('{{distance}} business km logged with MileSprout 🛣️ Every one counted.', params),
    };
  }
  const habit = HABITS[milestone.id as HabitId];
  const title = t(habit.title);
  return {
    emoji: habit.emoji,
    title,
    message: t(habit.message),
    share: t('{{achievement}} on MileSprout {{emoji}} The mileage app that counts every mile.', {
      achievement: title,
      emoji: habit.emoji,
    }),
  };
}
