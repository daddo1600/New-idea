import type { CelebrationContent } from "@/components/celebration";
import { HABITS, type HabitId, type Milestone } from "@/domain/milestones";
import { formatMoney, type Region } from "@/domain/regions";
import { msg, t } from "@/i18n/i18n";
import { withInvite } from "@/referral/links";

/** A few warm messages, picked by the milestone so the same one always reads the same. */
const MONEY_MESSAGES = [
  msg(
    "MileMint has now found {{amount}} in business mileage for you. You’ve earned every penny of it.",
  ),
  msg(
    "MileMint has now found {{amount}} in business mileage for you. Hard work, properly rewarded.",
  ),
  msg(
    "MileMint has now found {{amount}} in business mileage for you. That’s real money back at tax time.",
  ),
  msg(
    "MileMint has now found {{amount}} in business mileage for you. Nicely done. Keep it rolling.",
  ),
];

const pounds = (region: Region, major: number) =>
  formatMoney(major * 100, region).replace(/[.,]00$/, "");

/** The celebration for a milestone, in the current language. */
export function celebrationFor(
  milestone: Milestone,
  region: Region,
): CelebrationContent {
  if (milestone.kind === "money") {
    const amount = pounds(region, milestone.threshold);
    const message =
      MONEY_MESSAGES[
        Math.round(Math.log10(milestone.threshold) * 3) % MONEY_MESSAGES.length
      ];
    return {
      emoji: "💰",
      title: t("{{amount}} back in your pocket", { amount }),
      message: t(message, { amount }),
      share: withInvite(
        t(
          "I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically.",
          { amount },
        ),
      ),
    };
  }
  if (milestone.kind === "distance") {
    // `count` lets a language pick a plural form; `distance` is the formatted number shown.
    const params = {
      distance: new Intl.NumberFormat(region.locale).format(
        milestone.threshold,
      ),
      count: milestone.threshold,
    };
    const mi = region.unit === "mi";
    return {
      emoji: "🛣️",
      title: mi
        ? t("{{distance}} business miles", params)
        : t("{{distance}} business km", params),
      message: mi
        ? t(
            "{{distance}} miles logged for work, every one counted. That’s a lot of road.",
            params,
          )
        : t(
            "{{distance}} km logged for work, every one counted. That’s a lot of road.",
            params,
          ),
      share: withInvite(
        mi
          ? t(
              "{{distance}} business miles logged with MileMint 🛣️ Every one counted.",
              params,
            )
          : t(
              "{{distance}} business km logged with MileMint 🛣️ Every one counted.",
              params,
            ),
      ),
    };
  }
  const habit = HABITS[milestone.id as HabitId];
  const title = t(habit.title);
  return {
    emoji: habit.emoji,
    title,
    message: t(habit.message),
    share: withInvite(
      t(
        "{{achievement}} on MileMint {{emoji}} The mileage app that counts every mile.",
        {
          achievement: title,
          emoji: habit.emoji,
        },
      ),
    ),
  };
}
