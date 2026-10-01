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
| **Milestone reached** (£50, £100, £250… / 100, 500, 1,000 miles) | Confetti, a gold badge, **Share it** | "MileMint has found me £250 in mileage this year 💰" + App Store link |
| **Missed miles** (couriers) | "+38 miles your delivery app missed, worth about £20" | The comparison + link. Couriers love proving the apps short-change them |
| **Invite a friend** (logo menu) | Ready-made message | "Tracks your business mileage automatically… free to start" + link |
| **Every app opening** | Their real total counting up | Nothing, but it keeps "this app makes me money" front of mind, so they stay and share later |

**The maths that matters:** if each user brings in **0.3 new users** within their first two months, every 1,000 users you win yourself become ~1,400. Get it to **0.5** and they become ~2,000. Track it every week (section 6). Push it up by making the shareable moments more frequent and the message more brag-worthy, not by nagging.

### What makes a share go off
- **A real number, in their currency.** "£412" beats "lots of money".
- **A little bit of outrage.** "My delivery app missed 38 miles this week" gets replies.
- **WhatsApp first.** Trades and couriers live in WhatsApp groups (crew groups, zone groups, family). One share in a 200-person courier group beats ten Instagram posts.
- **Nothing to sign up for.** The link goes straight to the App Store.

---

## 2. The offer: give a month, get a month

Simple enough to say in one breath: **"Give a mate a free month of Pro. When they stay, you get a free month too."**

| Who | Gets | When |
|---|---|---|
| **Friend** (new user) | **1 month of Pro free** | Straight away, via an Apple offer code from the invite link |
| **You** (the sharer) | **1 month of Pro free** | When the friend's free month rolls into their **first paid month** |
| Five friends who stay | Five free months | Stacks, no cap for the first year |

Why reward only on the first paid month: it can't be gamed with fake installs, it costs nothing until it has earned money, and Apple confirms the payment, so there's no policing.

### How it's built, in two phases

**Phase 1: at App Store launch (no server, ready now)**
- Invite links and every celebration share already carry the App Store link.
- Once the app is live, create one Apple **offer code** for "1 month Pro free" in App Store Connect and put it in `src/referral/links.ts` (`FRIEND_OFFER_CODE`). Every share then includes a one-tap "redeem your free month" link. (Apple only allows offer codes after the app is on the store.)
- The sharer isn't rewarded automatically yet. For the first few hundred users, reward the best sharers **by hand**: people tell you, you send them a code. It's personal and it creates fans.

**Phase 2: with the small server (shared with Teams, [`10-roadmap-teams.md`](10-roadmap-teams.md))**
- Each user gets a personal link (`milemint.app/r/MINT-7K2P`) with a nice preview card for WhatsApp and iMessage.
- Apple's **App Store Server Notifications** tell the server when the friend's subscription renews into its first paid month. The server issues the sharer a one-month code, and the app shows it: "Dan stayed on Pro, here's your free month 🎉".
- An "Invite friends" screen with a live tally: "3 friends joined · 2 free months earned".

**Apple rules to respect:** never reward ratings or reviews, always say clearly that Pro renews at the normal price after the free month, and only reward on real purchases.

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
| **January** "Deadline month" | "31 January: don't leave money on the road". Accountant January push. Referral banner in the app: "Give a mate a free month". Phase 2 referral live if the server is ready | 2,500+ installs, 150 paying |
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
| **Referral factor** (new users from shares ÷ active users) | Offer code redemptions + "how did you hear?" | 0.3+, aiming for 0.5 |
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
| Free months given away | £0 cash: costs only the month's revenue, and only for people who stay |
| **Total** | **~£0–1,000 a month**, peaking in December and January |

---

## 8. To do next (in order)

0. **Must do at launch:** lead every gig-worker channel with "Uber only sees Uber" (see the box at the top), using real TestFlight couriers' missed-miles numbers, collected with permission.
1. Submit 1.0 for App Store review (needs a contact phone number in App Store Connect).
2. On approval: create the "1 month Pro free" offer code and set `FRIEND_OFFER_CODE` in `milemint/src/referral/links.ts`.
3. One-page site with the Founding 1,000 counter.
4. Record the three videos from the latest TestFlight build.
5. Book three accountant conversations and plan courier week.
6. Decide on the server ([`10-roadmap-teams.md`](10-roadmap-teams.md)) so phase 2 referral (automatic rewards for the sharer) is live for January.
