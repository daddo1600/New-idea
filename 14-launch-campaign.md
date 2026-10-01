# Launch campaign: "Don't leave money on the road"

**The idea in one line:** most people who drive for work under-claim, and every untracked mile is cash left on the road. MileMint picks it up automatically, and every time you open it you see the money it has found.

This builds on [`12-launch-plan.md`](12-launch-plan.md) (who to reach and when) and [`11-growth-ideas.md`](11-growth-ideas.md) (referral and perks). This doc is the **campaign**: the message, the share loop built into the app, the offer and the calendar to go from zero to thousands of users by the 31 January Self Assessment deadline.

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
| **Milestone reached** (£50, £100, £250… / 100, 500, 1,000 miles) | Confetti, a gold badge, **Share it · friends get +10 drives** | "MileMint has found me £250 in mileage this year 💰" + App Store link + your code |
| **Missed miles** (couriers) | "+38 miles your delivery app missed, worth about £20" | The comparison + link. Couriers love proving the apps short-change them |
| **Invite friends** (logo menu, Settings) | Your code, Share my code, friends joined | "Tracks your business mileage automatically… free to start" + link + "Enter my code TRVB-7K2… for 10 extra free drives a month" |
| **Every app opening** | Their real total counting up | Nothing, but it keeps "this app makes me money" front of mind, so they stay and share later |

**The maths that matters:** if each user brings in **0.3 new users** within their first two months, every 1,000 users you win yourself become ~1,400. Get it to **0.5** and they become ~2,000. Track it every week (section 6). Push it up by making the shareable moments more frequent and the message more brag-worthy, not by nagging.

### What makes a share go off
- **A real number, in their currency.** "£412" beats "lots of money".
- **A little bit of outrage.** "My delivery app missed 38 miles this week" gets replies.
- **WhatsApp first.** Trades and couriers live in WhatsApp groups (crew groups, zone groups, family). One share in a 200-person courier group beats ten Instagram posts.
- **Nothing to sign up for.** The link goes straight to the App Store.

---

## 2. The offer: more free drives for every friend

Simple enough to say in one breath: **"Use my code and we both get 10 more free drives a month. Every friend, no limit."** It's Dropbox's "more space for every friend", in drives.

| Who | Gets | When |
|---|---|---|
| **Friend** (new user) | **+10 free automatic drives a month** (50 instead of 40) | At once, when they enter the code in the welcome or in Settings (first 30 days) |
| **You** (the sharer) | **+10 free automatic drives a month per friend** | When the friend has joined and made 3 real automatic drives |
| Five friends | +50 a month, for good | Uncapped |

Why drives: they cost nothing, can't be cashed in, and every friend makes the free plan visibly bigger, so heavy free users have a reason to share before they pay. Pro stays the answer for unlimited. Full design: [`11-growth-ideas.md`](11-growth-ideas.md) §1.

### How it's built

**Ready now (no server):**
- Every user has a personal code (e.g. `TRVB-7K2`) on the **Invite friends** screen (logo menu and Settings) with a **Share my code** button.
- Every share (invite, milestone celebrations) carries the App Store link **and the code**. Celebrations say "Share it · friends get +10 drives" and "You both get +10 free drives a month when a friend joins".
- New users enter a friend's code on the welcome's last step ("Got a code from a friend?") or in Settings for 30 days; `milemint://invite/CODE` links fill it in.
- The friend's +10 works immediately. The home counter shows the real allowance ("2 of 50 free drives in October").

**Switches on with CloudKit (sharer's reward):**
- No server: the friend's app writes an anonymous record for the code to CloudKit's public database, and the sharer's app counts the distinct iCloud accounts that did. Design: `milemint/modules/referral-cloud/README.md`.
- To switch on: set up the container `iCloud.com.milemint.app` with CloudKit in the Apple Developer portal, deploy the `Referral` schema, add the small Swift module, and turn on `extra.icloudBackup` in `app.json` (shared with iCloud backup). Then "Friends joined: N · +X free drives a month" appears, and friends who joined earlier are credited.
- Until then, say it honestly: the friend's bonus is instant, the sharer's comes "when a friend joins". For the first few hundred users, thank the best sharers **by hand** too.

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
| **January** "Deadline month" | "31 January: don't leave money on the road". Accountant January push. Referral push: "Give a mate 10 free drives a month, get 10 back". Sharer credit live if CloudKit is switched on | 2,500+ installs, 150 paying |
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
| **Referral factor** (new users from shares ÷ active users) | Referral codes redeemed (CloudKit `Referral` records) + "how did you hear?" | 0.3+, aiming for 0.5 |
| Paying users | App Store Connect | 5%+ of installs |
| Ratings | App Store | 4.7★+ |
| Cost per paying user | Spend ÷ new paying | Under £18 (3 months of Pro) |

**Rule:** two weeks without a paying user from a channel → stop it, and double whatever's working.

---

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

0. **Must do at launch:** lead every gig-worker channel with "Uber only sees Uber" (see the box at the top), using real TestFlight couriers' missed-miles numbers, collected with permission.
1. Submit 1.0 for App Store review (needs a contact phone number in App Store Connect).
2. On approval: create the "1 month Pro free" offer code and set `FRIEND_OFFER_CODE` in `milemint/src/referral/links.ts`.
3. One-page site with the Founding 1,000 counter.
4. Record the three videos from the latest TestFlight build.
5. Book three accountant conversations and plan courier week.
6. Set up the iCloud container with CloudKit in the Apple Developer portal, add the referral-cloud module and turn on `extra.icloudBackup`, so sharers are credited (+10 drives a month per friend) by January. See `milemint/modules/referral-cloud/README.md`.
