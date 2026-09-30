# Growth ideas (to review later for marketing)

Two ideas to grow MileMint and keep drivers coming back. Neither is started. Both need the same foundation as Teams (a domain and a small server, see [`10-roadmap-teams.md`](10-roadmap-teams.md)), so they can share the work.

---

## 1. Referral scheme

**Rewards only for real paying customers:**

| Your referral | You get | They get |
|---|---|---|
| A friend **subscribes to Pro** (monthly or yearly) | **1 month of Pro free** per friend | 1 month of Pro free |
| A business **signs up to MileMint Teams** | **A year of Pro free** | Their first month of Teams free (or a launch discount) |

Rewards stack: three friends subscribing earns three free months. Paying referrals can't be faked, so there's no need to police free installs.

**Sharing:**
- "Invite friends" in the logo menu, with a live tally ("2 friends subscribed · 2 free months earned").
- Prompts at happy moments: first £100 / $100 found, after exporting a report, after a fully sorted Sunday check-in.
- The share sheet covers WhatsApp, iMessage and email, with a ready-made message, the code and a link with a branded preview (`milemint.app/r/MINT-7K2P`).
- A second option, "Get your company on MileMint", shares the Teams page with the same code.

**How rewards are delivered (Apple-friendly):**
- Each referral reward is an Apple **one-time offer code**: 1 month free, or 1 year free for a Teams referral. We create them in App Store Connect; the app gets them from our server and opens Apple's redeem sheet in one tap.
- **Free user:** Pro starts free for the month or year, then renews at the normal price unless cancelled. This must be stated clearly before redeeming.
- **Paying subscriber:** the free period applies from their next renewal.
- **Tracking who subscribed through whose code** uses Apple's App Store Server Notifications, which confirm a real purchase. Teams sign-ups are confirmed by the first paid invoice. Codes are anonymous, and no accounts are needed.

**Phases:**
1. **At launch, no server:** one shared Apple offer code ("a friend's first month free") behind an "Invite a friend" button. Friends benefit and the app grows, but the sharer isn't rewarded yet. Offer codes only work once the app is live on the App Store.
2. **With a server** (shared with Teams): personal codes, confirmation that the friend paid, and automatic rewards of 1 month per paying friend and 1 year per Teams customer.

---

## 2. Partner perks: "a free coffee on your route"

**Idea:** local partners (coffee shops, service stations, bakeries, car washes) give MileMint drivers a weekly perk, like a free coffee. Drivers choose their stop over a competitor's; the partner gains a regular, high-value customer who usually buys something else too.

### Tie the perk to using MileMint

**"Sort your week, get your coffee."** When the Sunday check-in shows every drive sorted, next week's perk unlocks. The perk rewards exactly the habit that makes MileMint valuable (sorted drives means money claimed), and it gives the Sunday reminder a reason to be opened.

- **Free plan:** 1 perk a month. **Pro:** 1 a week. That's another reason to upgrade.
- Perks are regional: each area shows the partners that actually operate there.

### What each side gets

| Partner | Driver | MileMint |
|---|---|---|
| New regular customers who pass by anyway, plus add-on sales (pastry, fuel, car wash) | A free coffee every week for a habit they want anyway | Retention, word of mouth, a reason to upgrade, and later revenue from partners |

A coffee costs a café roughly **£0.30–0.60 / $0.40–0.80** in ingredients. It's one of the cheapest ways for them to win a regular.

### Who to approach, in order

1. **Independents and small local chains on commuter and trade routes:** coffee shops, farm shops, bakeries, independent forecourts. The owner decides on the spot. Start with **one area** (your own, e.g. Tring / Hemel / Dunstable) as a pilot.
2. **Regional chains**, once the pilot has numbers:
   - **UK:** forecourt groups (MFG, Rontec, Applegreen), regional coffee chains, garden centres with cafés;
   - **US:** Wawa, Sheetz, QuikTrip, Casey's, Kwik Trip, Buc-ee's, regional coffee chains;
   - **Canada:** regional coffee chains, independent gas bars;
   - **Australia:** regional fuel brands (OTR, Puma, Ampol franchisees), local café groups.
3. **National brands (Costa, Starbucks, Shell, BP)** last. They have their own loyalty schemes and need scale and proof, so approach them with a regional case study.

### The pitch (one minute)

> "MileMint is a mileage app for people who drive for work: tradespeople, reps, delivery and care workers. **[N] of our drivers are within [X] miles of you** and pass this way most weeks. Give them one free coffee a week and we'll send them your way. You only pay for what they redeem, and most people buy something with it. Let's try it for 8 weeks."

Bring a one-page leaflet with the counter-top QR, what staff do at the till (glance at the screen and tap "Redeemed"), and the pilot terms.

### How it works in the app (privacy first)

- The app downloads the perks for the user's **country and area** and picks the nearby ones **on the phone itself**. Nobody's location is sent to partners or to MileMint, which keeps the "your trips never leave your iPhone" promise.
- Perks tab: nearby partners on a small map, "3 min off your usual route", this week's perk and its expiry.
- **Redeeming at the till:** a full-screen coupon with a live animated element (so a screenshot can't be reused), the partner's logo and a code. Staff tap "Redeemed" or enter the code. Larger chains can supply their own till codes instead.
- Partners see redemptions per week in a simple report (a spreadsheet during the pilot, a small partner dashboard later).

### Money, later

- **Pilot:** free for partners (they supply the coffee); we measure redemptions and footfall.
- **After the pilot:** partners pay **per redemption** (e.g. £0.50–£1 / $0.75–$1.50), or a flat monthly regional fee for a featured slot.
- Only ever aggregated, anonymous numbers go to partners. No selling user data, which is consistent with the promise we already make.

### Rules to respect

- Apple: perks are physical goods redeemed in the real world, so there's no in-app purchase issue.
- Privacy: location stays on the device, so there's no "tracking" under Apple's rules and no App Tracking Transparency prompt. The perks feature still needs its own line in the privacy policy.
- Promotions: simple written terms per offer (one per person per week, while stocks last, partner can end with notice) and a short partner agreement.

### Pilot plan

1. Sign 3–5 independents in one area.
2. Run for 8 weeks and track perks unlocked, redemptions, repeat visits and upgrades to Pro.
3. With those numbers, approach one regional chain.
