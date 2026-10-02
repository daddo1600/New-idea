/**
 * Invite rewards, set by hand when App Store Connect is ready
 * (research_notes/launch-2026/offer-code-setup.md).
 */

/**
 * The App Store custom offer code that gives an invited friend 50% off their
 * first year of Pro (yearly plan, new subscribers only). Empty until it has
 * been created in App Store Connect: while it's empty, every line about the
 * friend's discount is hidden and invites offer the inviter's perks alone.
 */
export const FRIEND_OFFER_CODE = '';

/** How long after entering a friend's code the Pro screen offers the friend's gift. */
export const FRIEND_GIFT_MONTHS = 12;

/**
 * The founding boost: until the end of this day (the user's local date),
 * perks unlock at 1, 2 and 3 friends instead of 1, 3 and 5.
 */
export const FOUNDING_BOOST_ENDS = '2027-01-31';
