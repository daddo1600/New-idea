# Pitch panel: Head of CRM & Partnerships, national UK coffee and food-to-go chain

> **Simulated persona.** This is a fictional panellist, not a real person or company. Every number below is the persona's rough working assumption, labelled *(assumption)*. None of them is market data.
>
> **Persona:** runs CRM and partnerships for a chain of about 400 shops, including motorway services and drive-thrus. Has an existing loyalty app. Has run offers through telcos' rewards apps and through gig-platform rider perks. Measured on incremental visits and margin. Very protective of barista time at the till.

Reviewed: 13 slides (cover, audience, problem, how, demo, pricing, control, audit, basket, habit, privacy, review, pilot), the Perks screenshots (`docs/screenshots/perks/`) and the iOS store screenshots (`assets/store/ios/`).

---

## 1. First impression (10 seconds)

"Pay only on redemption, capped, use within 30 minutes. OK, that's a sensible shape and it's more honest than most of what lands in my inbox. But I can't see an audience number, a price or any proof that a single driver would come in who wasn't coming anyway. Every number that matters is a `[__]`."

**Would I take the meeting?** Yes, a 30-minute call with someone from my team, not with me. That's because the risk is low and drivers are a real daypart for us (early mornings, late nights, motorway and drive-thru). I wouldn't put it on my roadmap until there are live users and a working till integration. Right now it's a nice mock-up on TestFlight with codes that "won't work in shops yet".

---

## 2. Slide by slide

| Slide | What lands | Weak or confusing | Missing |
|---|---|---|---|
| **cover** | "Pay only when they walk in." That's the right hook for someone like me. | It's generic. Every affiliate network says this now. | Why drivers, why now, and one proof point. |
| **audience** | The segments are clear. "Same places on the same routes" is the true insight. | It names Deliveroo, Uber Eats, Amazon Flex and others. I've run rider perks *with* some of those platforms, and my legal team will ask whether this suggests an affiliation. The user count is blank. | Size, a launch-curve forecast, a regional split. Do these drivers pass my motorway and drive-thru sites, or are they all city-centre? |
| **problem** | Short. | It's the wrong problem for me. I'm not buying leaflets. I already have a loyalty app with first-party data. My problem is *reaching people who aren't in my app yet*, and *not subsidising people who are*. | Frame it as "lapsed and non-member working drivers on routes past your sites". |
| **how** | Four steps, very clear. | "**or typed in online**". We're a till business. What does "online" mean for a coffee shop? Delete it or explain it. "10p off a litre" is a fuel example, so the deck reads as a fuel pitch with coffee bolted on. | Who scans, with what kit, and how long it takes at the till. |
| **demo** | The screens are clean and the "Redeemed" stamp is a nice moment. | Speaker note: "tap **Mark as used**." The customer marking their own code as used is the opposite of what I need. The screenshot shows "**7 days left, expires 9 Oct**", which contradicts the 30-minute window on the control slide. The claimed and redeemed screens show different codes (`2JDW-50` vs `D8FN-15`). All the demo partners are fictional. | A barista-side screen. That's the screen I care about. |
| **pricing** | Pay per visit, nothing for claims or views. Good. "Redemption count we both agree" is grown-up. | `[£__]`, so I can't judge anything. | A suggested range, a minimum or maximum term, and who covers the cost of the free item (yes, it says I do, but say what that means for a free hot drink). |
| **control** | This is the strongest slide. Caps, the window, back to the pool, one per person, dayparts and pause are all things I'd ask for. | "One per person" in an app with **no account** (store screenshot 06) is enforced how? Reinstall, second phone, or a mate's phone? The note admits site, day and hour targeting may not be in the pilot. | How you stop people farming codes, and a time-of-day example such as "14:00–17:00 only". |
| **audit** | Single-use codes checked at scan time is the right architecture. | Speaker note: the "MileSprout service (to build before launch)". So it doesn't exist yet. "Drivers can confirm 'I used it'" isn't an audit signal I'd pay against. | Integration path: POS API, voucher-code import, or a handheld scanner. What happens offline, when 4G drops at a motorway site? |
| **basket** | "The coffee is the door, not the sale" is the right instinct. | Asking me for transaction-level basket data on slide 9 of a first meeting is a big ask. That's the slide my DPO and finance director will stop on. | Let me report aggregates. Don't ask for a feed. |
| **habit** | The route insight again. Good. | "Repeat redemptions" measures how often someone uses a *perk*. It doesn't measure habit. A driver who redeems free coffee every week is a cost, not a regular. | Repeat *paid* visits after the perk stops, or a decay curve. |
| **privacy** | Credible and different from telco data brokers. I like that you sell no location data. | It directly limits the incrementality proof I need. "Repeat redemptions per code holder" means there *is* a persistent ID. Say what it is. | How you'll prove incrementality without personal data (see section 3). |
| **review** | One page a month. Yes. "Cost per real visit" is the right metric. | Cost per visit isn't cost per *incremental* visit. | Holdout or control results, member overlap, net margin. |
| **pilot** | Three months, capped, stop any time. That's the right shape. | Everything is blank, the domain isn't live and the founder's name is blank. | Proposed sites, success criteria agreed up front, and what happens at the end (renew, scale, kill). |

**Overall:** the deck is well ordered and readable. But it's a pitch for a mechanism, not for a result, and it's built around fuel.

---

## 3. My top 5 objections in the room, and what would satisfy me

1. **"How many of these drivers are already my customers, or already in my loyalty app?"** (cannibalisation)
   - My worry: drivers are early-morning, high-frequency coffee buyers. I'd guess a good share already use us *(assumption: I'd budget for a third to a half of redeemers being existing visitors)*. Free coffee for them is pure margin loss, and it also teaches my members to come through you instead of my app.
   - **What would satisfy me:** a match-back at redemption. The barista scans the MileSprout code, the customer scans their loyalty card if they have one, and we report the share of redemptions from known members versus non-members at aggregate level only. Or the offer is non-member only and needs a fresh loyalty sign-up to unlock. That second option turns you into a member-acquisition channel, which I'd pay more for.

2. **"Prove incrementality, not redemptions."**
   - **What would satisfy me:** a holdout design, agreed before launch. Matched site pairs (offer live vs. not), or a randomised holdout of app users who see no offer. You'd report visits from both arms. Since you hold no identity, matched sites plus my own till-level footfall by daypart is the realistic approach. Even a rough lift figure beats any redemption count.

3. **"What does the barista actually do, and how long does it take?"**
   - If it adds more than about 5 seconds at peak *(assumption)*, or needs a separate device, it's dead. Typing a 12-character code is a non-starter at a busy drive-thru window. Scanning the customer's phone at a drive-thru is awkward at best.
   - **What would satisfy me:** codes that work through our existing POS voucher or promo-barcode path. That might mean a pre-loaded batch of single-use codes (or a format our scanners already read) validated by our own POS, with redemptions sent to you by a nightly file or API. Not a new tablet on the counter.

4. **"How do you stop gaming?"**
   - No account means one-per-person is device-level. Reinstalls, multiple phones and code sharing are all possible. The 30-minute window helps with sharing a little. The "Mark as used" button in the demo worries me.
   - **What would satisfy me:** device attestation (App Attest or DeviceCheck) plus server-side limits, codes valid only at the claimed site or region, a redeemed status written only by the till, and a fraud cap in the contract (we don't pay above X% anomaly rate).

5. **"Will working drivers actually pass my shops, and how many?"**
   - With no live user base I can't size this. Being in a pilot with a pre-launch app means my team does integration work for maybe a handful of redemptions per site per week *(assumption)*.
   - **What would satisfy me:** live MAU, a heatmap of where drivers park or shift (aggregate, coarse cells, opt-in), and a commitment like "we'll promote your offer to N drivers within 2 miles of your pilot sites".

**Also on my list:** brand safety (no implied endorsement by the gig platforms), what happens if a driver gets a bad experience ("barista didn't know about it"), and liability for the free item.

---

## 4. Commercial terms I'd expect, and deal-breakers

**Fee:** a flat fee per *redeemed* visit, below the cost of the free item. *My rough assumption:* tens of pence per redemption, with an incentive kicker only for **verified new or lapsed** customers (for example, a higher fee when the redeemer isn't a known loyalty member). I won't pay a flat fee that's the same for my regulars as for new people.

**Offer design (mine, not yours):** not "any size, free hot drink". More like "free regular filter or americano with any food item" or "£1 off before 10:00". The aim is to fund an attach, not give away the whole basket. The deck should show offers that look like this.

**Caps:** per site per week, a hard monthly budget ceiling across the whole pilot, and per-device limits. I'd want daypart targeting for the pilot itself, not "to confirm".

**Pilot shape:**
- 10 to 20 sites *(assumption)*: a mix of motorway, drive-thru and urban high street near courier hubs, plus matched control sites.
- 8 to 12 weeks, and success criteria signed off before go-live: incremental visits, the member versus non-member share, attach rate, barista time and fraud rate.
- MileSprout carries the integration cost. No fee for the first month, or fees credited against the build.

**Barista redemption, my preference in order:**
1. **Scan through the existing POS voucher scanner** (a code format our POS already accepts; codes pre-issued in batches from MileSprout to our promo engine). Best option. Zero new kit.
2. **Barista enters a short numeric code into the POS promo screen.** It has to be 6 to 8 digits, not `MS-KRB-2JDW-50`. Acceptable off-peak, but I'd ban it at the drive-thru.
3. **Show-screen only** (the barista looks at the phone and presses a button). That's a deal-breaker. It can't be audited and it invites fraud.

**Deal-breakers:**
- Any new hardware or a separate app for staff.
- Redemption status that the customer can set ("Mark as used").
- An obligation to feed transaction-level or personal data.
- Any implied association with Deliveroo, Uber or anyone else we partner with.
- Exclusivity, or a minimum spend, before the pilot proves anything.
- No ability to stop immediately.

---

## 5. Data and basket sharing, realistically

**What I'd share:**
- **Monthly aggregates per pilot site:** redemptions counted by our POS, attach rate (% of redeemed transactions with food or a second item), average basket value of redeemed transactions versus that site's daypart average, and the member versus non-member share if we do the loyalty match.
- Maybe a weekly redemption count file (code ID, site, timestamp) so we can reconcile. The code ID is MileSprout's pseudonymous token, so it's still personal data in GDPR terms if you can link it to a device. That needs a data processing or sharing agreement.

**What I wouldn't share:** line-level baskets, loyalty IDs, payment data, or anything that lets either side build a profile of one person. Even "totals only" per transaction, linked to a code that's linked to a device, is personal data under UK GDPR. My DPO would want a DPIA, a clear controller/processor split (we're probably separate controllers for our own till data), lawful-basis wording in your privacy notice, and retention limits.

**What would help:** make the basket slide an *output we produce and show you*, not a feed we send you. "You report three aggregate numbers monthly" gets through legal. "Share what was in the same transaction" doesn't.

---

## 6. Brand, visual credibility and match to the app

- **Strong.** The deck and app clearly come from the same brand: green gradient, Rubik/Nunito typography, the sprout mark, the amber accent. The store screenshots look polished and trustworthy ("Every work mile adds up", "Your trips stay on your phone"). This doesn't look like a two-person side project, which helps.
- **The Perks UI is clean but plainer** than the store screenshots. It's system-default looking, with grey cards and letter avatars. It's fine for a demo. Partners will ask how *their* brand appears: logo, colours, offer imagery. Show a branded partner card.
- **Tension.** Store screenshot 06 says "**No account. No ads.**" A Perks tab with sponsored offers is, to a sceptical driver, ads. You need a line for drivers ("offers, never ads; no tracking") and one for me ("drivers trust it, so they redeem").
- **Inconsistency risks credibility:** 7-day expiry on screen vs. a 30-minute window in the deck, "Mark as used" in the demo, and different codes on the claimed and redeemed screens. A partnerships person will spot these.
- The fictional "Daybreak Coffee" is fine, but put a coffee-shop example front and centre when pitching to me, not Kerbside Fuel.

---

## 7. Scores

| | Score /10 | Why |
|---|---|---|
| Clarity | **8** | The mechanism is simple and well told. Lose points for "typed in online" and the expiry contradiction. |
| Credibility | **4** | No users, no price, no live redemption, no integration, audit service "to build". Brand polish props it up. |
| Commercial appeal | **5** | Pay-per-redemption plus caps is attractive. With no incrementality or cannibalisation answer, it's a margin risk. |

**Would I pilot?** **Not yet. A conditional yes** for a small pilot in roughly 6 months *(assumption about timing)*, if they come back with live users near my sites, a POS-compatible code path (no new kit), a holdout design and a loyalty-member match or non-member-only offer. I'd happily let them run a no-integration "paper" test first: a few sites, staff key in a short numeric code as a manual promo, capped at a small number of codes a week.

---

## 8. The 5 highest-impact changes to the deck

1. **Add an incrementality slide** (between review and pilot). Show the holdout or matched-site design, the success metric (cost per *incremental* visit) and how existing loyalty members are excluded or identified. This is the slide that gets a CRM lead to yes.
2. **Replace "scan or typed in online" with a staff-side redemption slide.** Show the POS integration options ranked (existing scanner or voucher path, then short numeric code), seconds per transaction, offline behaviour, and that **only the till sets "Redeemed"**. Remove "Mark as used" from the demo, or label it clearly as a demo stand-in.
3. **Fill in or bracket the numbers.** A fee range, the pilot shape (sites, weeks, codes a week), and either live users or an honest "pre-launch: we'll be at N by date, or the pilot doesn't start". Blanks on pricing and pilot read as "not ready".
4. **Rewrite basket as an aggregate output, not a data request.** Three monthly numbers the partner reports, a GDPR line (DPIA, separate controllers, no personal data), and say what the "code holder" ID is and how one-per-person works without accounts.
5. **Tailor by vertical and fix the inconsistencies.** For food-to-go, lead with an attach-funded coffee offer ("free filter with any breakfast item, 06:00–09:00"), show a branded partner card, drop the gig-platform brand names or add "not affiliated", and make the in-app expiry match the 30-minute window.

---

### Out of character: practical summary

- The mechanism (pay on redemption, caps, a short window, back to the pool) is the right shape and the deck tells it clearly. The gaps are **proof** and **ops**, not story.
- A CRM buyer at a chain with its own loyalty app cares about two things this deck doesn't address: **incrementality** and **cannibalisation of existing members**. Add a holdout design and a member-match or non-member-only option.
- **Redemption must run through the partner's existing POS**, written by the till, never by the driver. The demo's "Mark as used", the 7-day expiry on screen, and "typed in online" all undermine trust today.
- **Basket data:** ask for aggregates the partner reports, not transaction feeds. Pre-empt GDPR (DPIA, controllers, what the pseudonymous ID is).
- The brand is polished and consistent between the deck and the app. The "No ads" store claim needs a reconciled line now that there's a Perks tab.
- The realistic next step with a chain like this: a low-integration test at a handful of sites with short numeric codes, *after* there are live users near those sites.
