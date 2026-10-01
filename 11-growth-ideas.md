# Growth ideas (to review later for marketing)

Two ideas to grow MileMint and keep drivers coming back. The referral scheme is built and needs no server (the sharer's credit waits for CloudKit). Partner perks aren't started and need the same foundation as Teams (a domain and a small server, see [`10-roadmap-teams.md`](10-roadmap-teams.md)).

---

## 1. Referral scheme: "more for every friend you bring" (built)

Dropbox style, and **uncapped**: every friend who joins with your code earns you both more free automatic drives, for good.

| Who | Gets | When |
|---|---|---|
| **Friend** (new user) | **+10 free automatic drives a month** | At once, when they enter your code (in the welcome's last step, or in Settings / Invite friends for 30 days after installing) |
| **You** (the sharer) | **+10 free automatic drives a month per friend** | When the friend joins: they've redeemed your code and made 3 real automatic drives |
| Ten friends | +100 a month | No cap. Pro stays unlimited anyway |

Free plan allowance = **40 + 10 × (joined with a code ? 1 : 0) + 10 × friends joined** (`monthlyAllowance` in `milemint/src/domain/plan.ts`). It drives the home counter ("2 of 50 free drives in October"), which drives lock, and the paywall's free column.

Why drives, not free months: drives cost nothing to give, can't be turned into money, and make the free plan visibly better the more you share, which is the loop that made Dropbox grow. Pro (unlimited) is still the upgrade.

**In the app (built):**
- **Your code**: short and readable, e.g. `TRVB-7K2` (4 consonants, a dash, 3 letters or digits; no vowels so no words, no look-alikes 0/O, 1/I/L, 5/S). Made once, kept in settings (so it's in the iCloud backup) and in the iPhone keychain (same code after a reinstall).
- **Invite friends** screen (logo menu, Settings): the code, **Share my code**, and "Friends joined: N · +X free drives a month" once friends can be counted.
- **Redeeming**: optional "Got a code from a friend?" on the welcome's last step and in Settings for 30 days after install. Checks the format, refuses your own code, once per iPhone (a keychain flag survives reinstalling).
- **Invite links**: `milemint://invite/TRVB-7K2` opens the app with the code filled in.
- **Every share carries the code**: milestone celebrations ("Share it · friends get +10 drives", "You both get +10 free drives a month when a friend joins") and the invite message ("Enter my code TRVB-7K2 when you set up MileMint for 10 extra free drives a month").

**Crediting the sharer without a server: CloudKit (designed, switched off).**
- The friend's app saves one anonymous `Referral` record (`code`, `createdAt`) in CloudKit's **public** database once they have 3 real automatic drives. The sharer's app counts the **distinct iCloud accounts** (`creatorUserRecordID`) that saved one for their code.
- JS side ready in `milemint/src/referral/cloud.ts`; the native design is in `milemint/modules/referral-cloud/README.md`.
- **It switches on when** the iCloud container `iCloud.com.milemint.app` is set up in the Apple Developer portal (with CloudKit), the `Referral` schema is deployed in the CloudKit Dashboard, the small Swift module is written, and `extra.icloudBackup` in `app.json` is turned on (the same switch as iCloud backup). Until then friends still get their +10 straight away and the sharer's counter is hidden; friends who joined before are recorded and credited on the first build with CloudKit.

**Later, with a server (Teams):** keep the drives scheme, and add a reward for a **business that signs up to MileMint Teams** (a year of Pro free for the referrer), confirmed by the first paid invoice. A branded link (`milemint.app/r/TRVB-7K2`) with a WhatsApp preview card can replace the plain App Store link.

---|---|---|
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

---

## 3. Something to do while waiting (couriers): future idea

Couriers spend a lot of time parked, waiting for the next order. A light, quick game could keep MileMint open in those moments and make it the app they *like*, not just the one that logs miles.

- **Short and pausable:** one-thumb, under a minute, drops instantly when an order pings. Never anything that could tempt use while driving: only playable when the tracker says the car is parked.
- **On brand:** e.g. "Mint Run", where the yellow car dot drives the leaf's road collecting coins, and the best scores of the week go on a city leaderboard of Founding Riders.
- **Tied to the real thing:** bonus lives for a fully sorted week, or a weekly perk (see Partner perks) for a top-ten finish.
- **Later, not now:** build once couriers are using MileMint regularly; check it doesn't slow the app or drain the battery.
