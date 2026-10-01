import type { CelebrationContent } from '@/components/celebration';
import { HABITS, type HabitId, type Milestone } from '@/domain/milestones';
import { formatMoney, type Region } from '@/domain/regions';

/** A few warm lines, picked by the milestone so the same one always reads the same. */
const MONEY_LINES = [
  'You’ve earned every penny of it.',
  'Hard work, properly rewarded.',
  'That’s real money back at tax time.',
  'Nicely done. Keep it rolling.',
];

const pounds = (region: Region, major: number) =>
  formatMoney(major * 100, region).replace(/[.,]00$/, '');

export function celebrationFor(milestone: Milestone, region: Region): CelebrationContent {
  const unit = region.unit === 'mi' ? 'miles' : 'km';
  if (milestone.kind === 'money') {
    const amount = pounds(region, milestone.threshold);
    const line = MONEY_LINES[Math.round(Math.log10(milestone.threshold) * 3) % MONEY_LINES.length];
    return {
      emoji: '💰',
      title: `${amount} back in your pocket`,
      message: `MileMint has now found ${amount} in business mileage for you. ${line}`,
      share: `I’ve found ${amount} in business mileage with MileMint 🚗💸 Every mile counted, automatically.`,
    };
  }
  if (milestone.kind === 'distance') {
    const distance = new Intl.NumberFormat(region.locale).format(milestone.threshold);
    return {
      emoji: '🛣️',
      title: `${distance} business ${unit}`,
      message: `${distance} ${unit} logged for work, every one counted. That’s a lot of road.`,
      share: `${distance} business ${unit} logged with MileMint 🛣️ Every one counted.`,
    };
  }
  const habit = HABITS[milestone.id as HabitId];
  return {
    emoji: habit.emoji,
    title: habit.title,
    message: habit.message,
    share: `${habit.title} on MileMint ${habit.emoji} The mileage app that counts every mile.`,
  };
}
