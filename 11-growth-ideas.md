# Growth ideas (to review later for marketing)

Two ideas to grow MileMint and keep drivers coming back. The referral scheme (single-use invites) is built and needs no server; confirming invites and crediting sharers waits for CloudKit. Partner perks aren't started and need the same foundation as Teams (a domain and a small server, see [`10-roadmap-teams.md`](10-roadmap-teams.md)).

---

## 1. Referral scheme: "more for every friend you bring" (built)

Dropbox style, and **uncapped**: every friend who joins with one of your invites earns you both more free automatic drives, for good. Each invite is **single-use**: every share makes a new code, and a code works for one friend.

The founder's two rules:
- "Make each referral a unique code each time, and it's reset once used."
- "Prevent people from getting a referral code and deleting and starting over."

The first is met by a new code per share, published in iCloud and claimable once. The second is met by one claim per **Apple Account**, ever, checked in iCloud, so it holds across reinstalls and new iPhones.

| Who | Gets | When |
|---|---|---|
| **Friend** (new user) | **+10 free automatic drives a month** | When iCloud confirms the invite they entered (in the welcome's last step, or in Settings / Invite friends, for 30 days after installing). Until then it shows as pending: "Your 10 extra drives are on their way once the invite is confirmed." |
| **You** (the sharer) | **+10 free automatic drives a month per friend** | When the friend joins: they claimed one of your invites and made 3 real automatic drives |
| Ten friends | +100 a month | No cap. Pro stays unlimited anyway |

Free plan allowance = **40 + 10 × (friend's invite confirmed ? 1 : 0) + 10 × friends joined** (`referralAllowance` in `milemint/src/referral/invites.ts`, which uses `monthlyAllowance` in `milemint/src/domain/plan.ts`). A pending code adds nothing. The allowance drives the home counter ("2 of 50 free drives in October"), which drives lock, and the paywall's free column.

Why drives, not free months: drives cost nothing to give, can't be turned into money, and make the free plan visibly better the more you share, which is the loop that made Dropbox grow. Pro (unlimited) is still the upgrade.

**In the app (built):**
- **Invite codes**: short and readable, e.g. `TRVB-7K2`: 4 consonants, a dash, then 3 letters or digits. There are no vowels, so no words, and none of the look-alikes 0/O, 1/I/L, 5/S. A **new code for every share**:
  - kept in settings as an invite sent, with the date (so it's in the iCloud backup);
  - published in iCloud as the sharer's, so it's unique across all users.
- **Invite friends** screen (logo menu, Settings): **Send an invite**, "Every invite has its own code, for one friend.", "Invites sent: N", and "Friends joined: N · +X free drives a month" once iCloud can count them. There's no permanent "your code" anywhere.
- **Redeeming**: optional "Got a code from a friend?" on the welcome's last step and in Settings for 30 days after install.
  - The phone checks the format, refuses the user's own invites, and allows one code per iPhone. The keychain keeps that, and the install date, through a reinstall.
  - Then iCloud checks the invite. **Confirmed** gives +10 at once. **Can't check yet** saves it as **pending** with no bonus, and it's confirmed automatically later. **Turned down** says why: "We couldn't find that invite…", "That invite has already been used…", "That's one of your own invites…" or "This Apple Account has already joined with a friend's invite."
  - When a pending code is turned down later, it's cleared with the same message and the box opens again inside the 30 days. When it's confirmed, a small 🎉 alert appears.
- **Invite links**: `milemint://invite/TRVB-7K2` opens the app with the code filled in.
- **Every share makes a fresh invite**: Send an invite, Settings → Share, milestone celebrations ("Share it · friends get +10 drives") and the compare-your-miles share. The message says "Your invite code is TRVB-7K2. Enter it when you set up MileMint for 10 extra free drives a month." Closing the share sheet without sending doesn't count as an invite sent.

**Confirming invites and crediting the sharer without a server: CloudKit (designed, switched off).**
- Three record types in CloudKit's **public** database:
  - `Invite`: the record name is the code, and the owner is the sharer's iCloud account.
  - `claim-<code>`: one per invite, so it can be used once.
  - `claimer-<iCloud user id>`: one per Apple Account, ever.

  Everyone can read them, only their creator can write them, and no one can change or delete someone else's.
- The friend's app marks its claim **qualified** after 3 real automatic drives. The sharer's app counts the qualified claims on the invites it published.
- The JS side is ready in `milemint/src/referral/cloud.ts` and `invites.ts` (unit-tested with a fake CloudKit). The native design is in `milemint/modules/referral-cloud/README.md`.
- **It switches on when**:
  - the iCloud container `iCloud.com.milemint.app` is set up in the Apple Developer portal, with CloudKit;
  - the schema is deployed in the CloudKit Dashboard;
  - the small Swift module is written;
  - `extra.icloudBackup` in `app.json` is turned on (the same switch as iCloud backup).

  Until then, invites wait on the sharer's phone to be published and friends' codes stay pending, so **nobody gets referral drives yet**. The screen says so honestly. On the first build with CloudKit, everything waiting is published and confirmed, and both sides get their drives.

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
