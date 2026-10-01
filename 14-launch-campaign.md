# Launch campaign: "Don't leave money on the road"

**The idea in one line:** most people who drive for work under-claim, and every untracked mile is cash left on the road. MileMint picks it up automatically, and every time you open it you see the money it has found.

This builds on [`12-launch-plan.md`](12-launch-plan.md) (who to reach and when) and [`11-growth-ideas.md`](11-growth-ideas.md) (referral and perks). This doc is the **campaign**: the message, the share loop built into the app, the offer and the calendar to go from zero to thousands of users by the 31 January Self Assessment deadline.

> ### ⭐ The product promise: "You'll know if a mile was missed"
>
> Every competitor says "automatic". Real app-store reviews show the angriest drivers are the ones whose app **stopped tracking without telling them** and lost days or months of miles ([`reports/Gig driver mileage app sentiment.md`](reports/Gig%20driver%20mileage%20app%20sentiment.md)). So MileMint's promise is the opposite of silence:
> - **"You'll know if a mile was missed."** MileMint tells you the moment tracking stops (permission changed, app closed, a drive cut short) and helps you add what was missed.
> - Lead every channel with this, not with "automatic". For gig workers, pair it with "Uber only sees Uber" below: the missed-miles check shows the miles the delivery apps didn't count.
> - Only say it once the tracking-health alerts are in the TestFlight build, and test it on real phones first.
> - App Store promotional text (all four countries) now opens with it; see `milemint/store.config.json`.

> ### ⭐ Must do at App Store launch: "Uber only sees Uber"
>
> **The lead message for every gig-worker channel** (couriers, multi-app drivers, US gig drivers):
>
> **"Uber only sees Uber."** Someone running Uber Eats, Deliveroo and Amazon Flex has three partial mileage records and no total. Miles driven with no app on, between apps, and home at the end of a shift may not be in any of them, and those miles are often claimable (depending on the country's rules). MileMint logs every mile, whichever app you're on.
>
> - **Lines to use:** "Uber only sees Uber. MileMint sees every mile." · "Three apps, three half-records. One total." · "Keep using your apps. See what they aren't counting."
> - **The proof is the missed-miles check.** Every post, video and QR card ends with it: "Enter the miles your apps show. After a week, see what they missed." Its share card is the main creative.
> - **Use real numbers only.** The panel's favourite quote ("Uber said 9 thousand miles, the app found almost 14 thousand") came from a *simulated* persona ([`15-persona-panel.md`](15-persona-panel.md)), so it must never appear in marketing as a real user's words. Before launch, collect real before-and-after figures from TestFlight couriers, with their permission, and use those.
> - **Stay honest:** say "may not be counted" and "often claimable", never "Uber gets it wrong" or a promised refund. Name the delivery apps in text only, with no logos and no implied partnership.
> - **Where:** App Store subtitle/promo text and the courier screenshot, the one-page site's courier section, courier WhatsApp and Facebook groups, QR cards at pickup spots, TikTok "day in the life" videos, and the ambassador kit ([`13-courier-week-1.md`](13-courier-week-1.md)).

---

## 1. The engine: growth built into the app

Ads stop when the money stops. Growth that comes from people using the app keeps going. MileMint already has the pieces:

| Moment in the app | What the user sees | What gets shared |
|---|---|---|
| **Milestone reached** (£50, £100, £250… / 100, 500, 1,000 miles) | Confetti, a gold badge, **Share it · friends get +10 drives** | "MileMint has found me £250 in mileage this year 💰" + App Store link + a fresh invite code |
| **Missed miles** (couriers) | "+38 miles your delivery app missed, worth about £20" | The comparison + link + a fresh invite code. Couriers love proving the apps short-change them |
| **Invite friends** (logo menu, Settings) | Send an invite, invites sent, friends joined | "Tracks your business mileage automatically… free to start" + link + "Your invite code is TRVB-7K2. Enter it when you set up MileMint for 10 extra free drives a month." |
| **Every app opening** | Their real total counting up | Nothing, but it keeps "this app makes me money" front of mind, so they stay and share later |

**The maths that matters:** if each user brings in **0.3 new users** within their first two months, every 1,000 users you win yourself become ~1,400. Get it to **0.5** and they become ~2,000. Track it every week (section 6). Push it up by making the shareable moments more frequent and the message more brag-worthy, not by nagging.

### What makes a share go off
- **A real number, in their currency.** "£412" beats "lots of money".
- **A little bit of outrage.** "My delivery app missed 38 miles this week" gets replies.
- **WhatsApp first.** Trades and couriers live in WhatsApp groups (crew groups, zone groups, family). One share in a 200-person courier group beats ten Instagram posts.
- **Nothing to sign up for.** The link goes straight to the App Store.

---

## 2. The offer: more free drives for every friend

Simple enough to say in one breath: **"Use my invite and we both get 10 more free drives a month. Every friend, no limit."** It's Dropbox's "more space for every friend", in drives. Each invite is single-use: every share makes a new code for one friend, and each Apple Account can join with one invite, ever, so deleting the app and starting over earns nothing.

| Who | Gets | When |
|---|---|---|
| **Friend** (new user) | **+10 free automatic drives a month** (50 instead of 40) | When iCloud confirms the invite they entered in the welcome or in Settings (first 30 days). Pending until then |
| **You** (the sharer) | **+10 free automatic drives a month per friend** | When the friend has claimed your invite and made 3 real automatic drives |
| Five friends | +50 a month, for good | Uncapped |

Why drives: they cost nothing, can't be cashed in, and every friend makes the free plan visibly bigger, so heavy free users have a reason to share before they pay. Pro stays the answer for unlimited. Full design: [`11-growth-ideas.md`](11-growth-ideas.md) §1.

### How it's built

**Ready now (no server):**
- The **Invite friends** screen (logo menu and Settings) has a **Send an invite** button, "Every invite has its own code, for one friend." and "Invites sent: N".
- Every share makes a **new single-use code** and carries it with the App Store link: Send an invite, Settings → Share, milestone celebrations ("Share it · friends get +10 drives") and the missed-miles share.
- New users enter a friend's code on the welcome's last step ("Got a code from a friend?") or in Settings for 30 days. `milemint://invite/CODE` links fill it in.
- The phone refuses your own invites and allows one code per iPhone. The keychain keeps that, and the 30-day window, through a reinstall.
- The home counter shows the real allowance ("2 of 50 free drives in October").

**Switches on with CloudKit (both sides' rewards):**
- No server. CloudKit's public database holds:
  - an `Invite` record named by each code, owned by the sharer;
  - a `claim-<code>` record, so each invite is used once;
  - a `claimer-<iCloud user id>` record, so each Apple Account claims once, across reinstalls and new phones.

  The friend's app marks its claim qualified after 3 real drives, and the sharer's app counts qualified claims. Design: `milemint/modules/referral-cloud/README.md`.
- To switch on:
  - set up the container `iCloud.com.milemint.app` with CloudKit in the Apple Developer portal;
  - deploy the `Invite`/`Claim`/`Claimer` schema;
  - add the small Swift module;
  - turn on `extra.icloudBackup` in `app.json` (shared with iCloud backup).

  Then pending codes are confirmed (+10 for the friend, with a small 🎉) and "Friends joined: N · +X free drives a month" appears.
- **Until then nobody gets referral drives.** A friend's code is saved as pending ("Your 10 extra drives are on their way once the invite is confirmed."), and the Invite friends screen says invites are confirmed through iCloud, coming in an update. Plan the referral push for **after** the CloudKit build ships. For the first few hundred users, thank the best sharers **by hand** too.

**Also, once the app is live:** create one Apple **offer code** for "1 month Pro free" in App Store Connect and put it in `src/referral/links.ts` (`FRIEND_OFFER_CODE`). Shares then also carry a one-tap "redeem your free month" link for friends who want Pro. (Apple only allows offer codes after the app is on the store.)

**Apple rules to respect:** never reward ratings or reviews; keep referral rewards inside the app (free drives, never cash or gift cards); and wherever a free Pro month is offered, say clearly that Pro renews at the normal price after it.

---

## 3. Founding 1,000

Scarcity and belonging, at no cost.

- **The first 1,000 drivers** get a **"Founding driver" badge** on their Milestones screen and a **price lock**: Pro stays at the launch price for as long as they subscribe.
- A live counter on the website and in posts: "**612 of 1,000 founding spots taken**". Post it every time it jumps.
- Founding drivers get a WhatsApp community (or a channel) with the founder: early features, a vote on what's next, direct line for bugs. These are your first reviewers, testimonials and ambassadors.

---

## 4. Audiences and the message for each

| Audience | Hook | Where |
|---|---|---|
| **Couriers and multi-app drivers** (Uber Eats, Deliveroo, Just Eat, Amazon Flex, Evri, DPD) | **Lead: "Uber only sees Uber. MileMint sees every mile."** (see the must-do above). Backup: "Your app only counts miles with an order on. The drive to the pickup is yours to claim too." The **missed miles** screen is the proof | Zone and depot WhatsApp groups, courier Facebook groups, TikTok, the restaurant pickup queue ([`13-courier-week-1.md`](13-courier-week-1.md)) |
| **Tradespeople** (sparkies, plumbers, builders, cleaners, carers) | "55p a mile. A plumber doing 12,000 business miles can claim over £5,000. Are you logging yours?" | Trade counters, trades Facebook groups, local groups, accountants |
| **Employees who use their own car** (sales reps, nurses, estate agents) | "Your employer owes you for every mile. Stop guessing on the expense form." | LinkedIn, workplace WhatsApp groups, later Teams |
| **Accountants and bookkeepers** | "Clients turn up in January with no mileage log. Send them this." | Direct approach, free Pro for the accountant plus a client code |

Always say **"estimated"** and **"based on HMRC rates"**; never promise a tax saving.

---

## 5. The calendar (UK first)

| When | Push | Goal |
|---|---|---|
| **October** (now → App Store approval) | Submit 1.0. Founding 50 on TestFlight. Record the three 30-second videos (opening count-up, a milestone celebration, missed miles). Build the one-page site with the Founding 1,000 counter | Live on the App Store, 30 testers giving feedback |
| **Launch week** | Personal WhatsApp messages to everyone you know who drives for work. Founder post on LinkedIn and Facebook. Courier week ([`13-courier-week-1.md`](13-courier-week-1.md)). Create the friend offer code on day one | 150 installs, the first 10 ratings |
| **November** "Founding 1,000" | Local Facebook groups, trade counters, the first 3 accountant partners, the first 3 courier ambassadors (free Pro for life for an active one who brings in 25 drivers) | 500 installs, a share rate above 10% of users |
| **December** "What are your miles worth?" | Short videos with real numbers. 5–10 micro-creators paid per video plus per paying user. Apple Search Ads at £5–10 a day | 1,000 installs, Founding 1,000 sold out |
| **January** "Deadline month" | "31 January: don't leave money on the road". Accountant January push. Referral push: "Give a mate 10 free drives a month, get 10 back", only once the CloudKit build is out (before it, invites stay pending for both sides) | 2,500+ installs, 150 paying |
| **February on** | Keep what worked and drop what didn't. Turn to the US tax season ([`09-social-campaigns.md`](09-social-campaigns.md)) and Teams | |

### Stunts worth trying (cheap, memorable)
- **"The £100 challenge"**: drivers post a screenshot of their first £100 milestone; one random poster each week gets £100 (fuel card). Cost: £400 a month, and every entry is an ad.
- **"Missed miles" weekly league** (couriers): share your missed miles, and the highest of the week gets a free year. Feeds the outrage loop.
- **Fake parking ticket flyer** on windscreens at retail parks and depots: "PENALTY: you've left £1,240 on the road this year. Pay nothing, claim it back." QR code to the App Store. Check local rules first.

---

## 6. Measure it every Monday

| Number | Where from | Healthy |
|---|---|---|
| Installs | App Store Connect | Up week on week |
| Day-7 still tracking | App analytics (later) / App Store Connect retention | 40%+ |
| **Share rate** (users who shared at least once) | Share button taps (add simple counting) | 10%+ |
| **Referral factor** (new users from shares ÷ active users) | Invites claimed (CloudKit `Claim` records; qualified ones = friends joined) ÷ invites sent, + "how did you hear?" | 0.3+, aiming for 0.5 |
| Paying users | App Store Connect | 5%+ of installs |
| Ratings | App Store | 4.7★+ |
| Cost per paying user | Spend ÷ new paying | Under £18 (3 months of Pro) |

**Rule:** two weeks without a paying user from a channel → stop it, and double whatever's working.

---

## 6a. Know where every download came from (no survey screen)

We don't ask "How did you hear about us?" in set-up: it's another screen before the app works, and the answers are unreliable. Instead:

**Campaign links.** App Store Connect counts downloads per campaign when the store link carries a provider token and a campaign name. Use one link per place we post, so the Monday numbers show which post worked:

| Where | Campaign name (`ct=`) |
|---|---|
| Facebook courier groups (UK) | `fb-couriers-uk` |
| Reddit r/UberEATS, r/deliveroo, r/AmazonFlexDrivers | `reddit-<sub>` |
| Courier forums / Discords | `forum-<name>` |
| Flyers and counter cards (QR) | `flyer-<place>` (e.g. `flyer-mcd-leeds`) |
| Accountants and bookkeepers | `acct-<name>` |
| TikTok / YouTube creators | `creator-<handle>` |
| Switch-from-MileIQ page | `switch-mileiq` |
| Friend invites | already counted by invite codes |

Format: `https://apps.apple.com/app/apple-store/id6817748981?pt=<provider token>&ct=<campaign>&mt=8`. The provider token is on App Store Connect → Analytics → Campaigns (it's per developer account, not secret). Results: Analytics → Acquisition → Campaigns (from 5 downloads up; Apple hides smaller numbers).

**Custom product pages.** Apple allows up to 35 versions of the store page, each with its own screenshots, promo text and link. Start with three:

| Page | Lead screenshot | For |
|---|---|---|
| Couriers | "Every delivery app. One mileage log." + shift rows | gig groups, flyers, creators |
| Trades & self-employed | "HMRC-ready report in one tap" + work hours | accountants, trade forums |
| Switching from MileIQ | "Bring your MileIQ log. Carry on for less." | switch campaign (below) |

Each page gets its own campaign link, so App Store Connect shows which audience converts best.

**Later, if store data isn't enough:** one optional card on home after a week of use ("How did you find MileMint?", one tap, dismissable). Never in set-up.

## 6b. The switch campaign: "Bring your miles with you"

**Idea.** People stay with an old mileage app because their history is in it. Remove that reason: export your log from the old app, open it in MileMint, and your whole year carries on, with your totals, purposes and business/personal choices intact.

**Needs in the app (next build after the tab bar):** "Import drives" in Settings that reads the CSV exports of MileIQ, Driversnote, Everlance, TripLog and a plain spreadsheet (auto-detected columns, a preview before saving, duplicates skipped, every imported drive marked "Imported" in the edit log so the audit trail stays honest). No account, nothing uploaded: the file is read on the phone.

**The message (all channels except the App Store page):**
- "Bring your miles with you. Import last year's log in a minute, then just drive."
- "Same automatic tracking. Shifts, every delivery app, missed-drive warnings. No account."
- Price, stated as facts with a date, never as an attack: "MileMint Pro: £5.99 a month or £49.99 a year (1 month free). Prices checked [date]."

**Where:** a `/switch` page on the site with a 3-step how-to (screenshots of the old app's export screen), the switching product page above, courier groups, and replies when people complain about price rises.

**Founding switchers:** first 500 who import a log get the first year of Pro at a lower founding price (an App Store introductory offer, set in App Store Connect, no code needed).

### Naming competitors: the rules we follow

- **App Store page: never name a competitor.** Apple's guideline 2.3.7 bars other apps' names in metadata and screenshots, and naming them is the quickest way to a rejection or a complaint. The store page says "Switching from another mileage app? Bring your log." instead.
- **Website, social, ads (UK):** comparative advertising is legal in the UK if it compares like with like, is accurate and verifiable, is dated, doesn't denigrate, and doesn't use their logo or make us look affiliated (CAP Code section 3 / Business Protection from Misleading Marketing Regulations 2008). So: "MileMint Pro £49.99/year vs MileIQ Unlimited £94.99/year (UK App Store prices, checked 1 Oct 2026)" is fine; "MileIQ rips you off" is not. Keep a dated screenshot of their price as evidence, and update or remove the line when their price changes.
- **US:** truthful comparative ads are allowed (FTC); the risk is a false-advertising claim if a comparison is wrong or out of date, so the same "accurate, dated, evidenced" rule covers it.
- Use their name as plain text only; no logos, colours or their app icon.
- Before spending money on a comparison ad, a one-off check with a solicitor (about an hour of their time) is worth it. This section is a working rule, not legal advice.

## 6c. Partner rewards: a free coffee for drivers (to pitch at launch)

**Idea.** A forecourt or coffee brand pays to reach drivers: MileMint users get a free hot drink each month (free plan) or each week (Pro).

**Why a brand would pay:** a daily-driving audience, precisely targeted (couriers and self-employed drivers), measurable redemptions, and a reason to choose their forecourt on a route drivers already take. Candidates: Costa Express (Shell), Wild Bean Café (BP), Greggs, Moto / Welcome Break / Roadchef services, EG On the Move, independent forecourt groups.

**Earning it (so people can't just download for coffee):** a reward unlocks only after real automatic drives, e.g. 10 drives logged by the app this month (not typed in), on a phone that has used MileMint for 2+ weeks. Pro users: weekly.

**How codes work without giving away privacy:** the partner supplies a pool of single-use codes (or a QR their tills accept); the app shows one when the user qualifies. The partner gets redemption counts per month, never names, locations or trips. Each code is shown once per phone per period; it needs the iCloud/CloudKit piece (as for referrals) to stop reinstall farming.

**Money models to pitch:** a monthly sponsorship fee, a fee per code redeemed (e.g. 30–60p on top of the drink's cost), or the drink at the partner's cost in exchange for "Partner of MileMint" placement. Start with a small paid pilot in one region (e.g. Leeds) with a fixed budget.

**Deck (when ready to launch):** the audience and their weekly miles, how qualifying works, privacy promise, the pilot proposal, pricing options, and early numbers (downloads, weekly active drivers, drives per week). Built as a branded slide deck.

## 7. Budget

| Item | Per month |
|---|---|
| Site, domain, email | ~£5 |
| Flyers, counter cards, the parking-ticket flyer (one-off) | ~£60 |
| £100 challenge | £400 (from November, only if shares are flowing) |
| Micro-creators (Dec–Jan) | £150–300 |
| Apple Search Ads (Dec–Jan) | £150–300 |
| Free drives given away (referrals) | £0 cash: costs nothing to run, and only delays the upgrade for the heaviest free users |
| **Total** | **~£0–1,000 a month**, peaking in December and January |

---

## 8. To do next (in order)

0a. Set up campaign links and the three custom product pages (section 6a).
0b. Build "Import drives" for the switch campaign (section 6b), after the tab bar.
0c. **US partners to follow through at launch (from research_notes/launch-2026/communities-us.md):**
   - **The Rideshare Guy** (therideshareguy.com, Harry Campbell; blog, newsletter, YouTube ~99k, podcast, Spanish channel). Its "11 Best Mileage Tracker Apps of 2026" article (updated 15 Jun 2026) still quotes the old 67¢ IRS rate in its FAQ; the 2026 rate is 72.5¢ (Jan–Jun) and 76¢ (Jul–Dec). Step 1: send a friendly correction via the contact form, no pitch. Step 2 (after the US listing is live and has a few ratings): ask to be considered for the list, and ask about their affiliate/advertising terms (they run affiliate deals for MileIQ, Solo, Stride, TripLog).
   - **EntreCourier** (entrecourier.com, Ron Walter; courier since 2018, quoted by NYT/CNN; podcast "Deliver on Your Business"). Grades mileage trackers with letter-grade report cards (mileage and expenses count double). Step: once the app is stable in the US, offer a review copy (free Pro offer code) via entrecourier.com/contact, with a short note on what's different (shift rows, missed-drive warnings, no account).
0. **Must do at launch:** lead every gig-worker channel with "Uber only sees Uber" (see the box at the top), using real TestFlight couriers' missed-miles numbers, collected with permission.
1. Submit 1.0 for App Store review (needs a contact phone number in App Store Connect).
2. On approval: create the "1 month Pro free" offer code and set `FRIEND_OFFER_CODE` in `milemint/src/referral/links.ts`.
3. One-page site with the Founding 1,000 counter.
4. Record the three videos from the latest TestFlight build.
5. Book three accountant conversations and plan courier week.
6. Set up the iCloud container with CloudKit in the Apple Developer portal, deploy the `Invite`/`Claim`/`Claimer` schema, add the referral-cloud module and turn on `extra.icloudBackup`, so invites are confirmed (+10 for the friend) and sharers credited (+10 drives a month per friend) by January. Until it ships, no one gets referral drives. See `milemint/modules/referral-cloud/README.md`.
