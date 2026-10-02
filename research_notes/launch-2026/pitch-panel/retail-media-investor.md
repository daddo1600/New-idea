# Pitch panel: retail-media / loyalty investor view of "MileSprout Perks"

> **Simulated panellist.** This is a made-up persona, not a real person: a UK retail-media and loyalty executive who became an angel investor, and who used to lead commercial work at a telco rewards programme (weekly treats, short redemption windows). Every number below is **the persona's own working assumption** for discussion. None of it is market data. Reviewed 2 Oct 2026.
>
> **What I reviewed:** all 13 slides in `scratchpad/deck/project/slides/` (cover → pilot), the Perks screenshots in `milemint/docs/screenshots/perks/`, the store shots in `milemint/assets/store/ios/`, and `reports/Rewards partners for MileSprout.md`.

---

## 0. First reaction (in character)

"Right. I've sat through a lot of these. Most 'rewards marketplace' decks die in one of two places. Either the founder can't say who funds the first month of offers, or the partner's finance team asks 'how do I know these redemptions are real?' and gets a hand-wave. Yours is better than most on the second question. It doesn't hide from it, and the pay-on-redemption framing is clean. On the first question it says nothing.

Two other things you need to know before anyone else spots them:

1. **Your own screenshots contradict your deck.** The claimed-code screen says *'7 days left — Expires 9 Oct at 18:15'*. Your control slide sells a *30-minute window*. A partner will notice that. An investor certainly will.
2. **Your demo redeems on the driver's thumb.** The 'Mark as used' button is the driver tapping their own phone. The caption explains it, but the audit slide says *'The scan checks the code with MileSprout'*, and the speaker notes admit that service is 'to build before launch'. So the core trust mechanism doesn't exist yet. Say so and show the plan, or don't claim it.

Also be clear who this deck is for. As written it's a **partner sales deck**: the ask is a pilot from a café or forecourt. That's fine. But if you're showing it to investors to argue that 'partner revenue replaces subscriptions', it has none of the slides an investor needs: model, unit economics, traction, team, use of funds. Pick one audience per deck."

---

## 1. Is the story right?

**The flow is mostly right but put together in the wrong order.** The bones are good: problem → how → demo → pricing → control → trust → insight → review → ask. The app's own three-step strip (Claim a deal → Show the code at the till → The partner pays only when it's used) is the best piece of storytelling in the whole package. It's better than the `how` slide, which has four steps.

Problems:

- **The `how` and `demo` slides tell the same story twice.** `how` has four abstract steps. `demo` shows the real thing in three. Merge them and use the app's three steps as the headline: *Claim → Show → Redeemed*. Step "1. You set the offer" belongs on `control`.
- **Price comes before risk.** The partner sees "[£__] per visit" before learning about caps, windows and pausing. Reverse it: first show they can't lose control, then show the price, then the pilot. That's the order I'd use to close a deal.
- **There's no staff-side moment.** The story follows the driver's phone and skips the person who matters to the partner: the 17-year-old on the till at 7am with a queue. "Scanned at your till" is the most important *and* least-shown step. Add a slide that shows what the staff member sees.
- **The ending is spread thin.** `basket`, `habit`, `privacy` and `review` are four soft slides between the trust slide and the ask. Energy drops just when you need it to rise. Three of them have empty placeholders, so the deck ends on a run of "[__]".
- **The ask itself is good:** a three-month, capped, stop-any-time pilot. Keep it, but fill in real numbers.

Suggested partner-deck order (10 slides):

| # | Slide | Source |
|---|---|---|
| 1 | Cover (with logo) | `cover` |
| 2 | Problem: you pay for attention, you want footfall | `problem` |
| 3 | Who you reach, **with a real number or a local density proof**, and why they trust the app (one privacy line) | `audience` + 1 line of `privacy` |
| 4 | Claim → Show → Redeemed (three screenshots, matching the deck) | `how` + `demo` merged |
| 5 | **NEW: At your till.** What staff do, in 10 seconds | new |
| 6 | You stay in control | `control` (fixed) |
| 7 | Counts both sides trust + what you never get | `audit` + `privacy` table |
| 8 | What it costs (a real number) | `pricing` |
| 9 | What you'll learn each month (claims, redemptions, repeats, optional basket) | `review` + `habit` + `basket` merged |
| 10 | The pilot ask | `pilot` |

---

## 2. Slide-by-slide notes

| Slide id | Verdict | Notes |
|---|---|---|
| `cover` | **Keep, tweak** | "Bring working drivers through your door" is a strong line. "Pay only when they walk in… Not for clicks, not for views" is the right promise. Add the sprout logo; the cover is the one slide that needs the brand. The footer line ("free mileage tracking… UK launch October 2026") is good context. Today is 2 Oct 2026, so the launch is now; say "Live in the UK from October 2026" once that's true. |
| `audience` | **Keep, fix** | The three segment cards are fine. The bold placeholder "[__ drivers using MileSprout by __]" is the hole in the whole deck. Naming Deliveroo/Uber Eats/Amazon Flex etc. suggests a relationship you don't have; say "drivers on apps like…" or drop the brands. Replace the national framing with **local density**: "[N] active drivers within 2 miles of your site each week". A café doesn't care about the UK total. |
| `problem` | **Keep** | Short, true, partner-centred. Could add one line: "and you can't cap what you spend." |
| `how` | **Merge into `demo`** | Four steps where the app has three. Move "You set the offer" to `control`. "Typed in online" adds an online-redemption path that nothing else in the deck covers. Either explain it or cut it. |
| `demo` | **Keep, re-shoot** | The best slide. But the screenshots must match the deck: show a **30-minute countdown**, not "7 days left / expires 9 Oct", and show redemption by a **staff scan**, not "Mark as used". "Made on the phone" worries a fraud-minded partner: if the phone makes the code, how does the server know it's valid? Say "issued by MileSprout, works offline" instead. Keep the "Example partners" disclaimer. It's honest and builds credibility. |
| `pricing` | **Move after control/audit; fill in** | The table logic (shown/claimed/expired = £0) is excellent and easy to follow. "[£__] per visit" with no number reads as "we haven't decided". Put in a pilot number or a range, plus any minimum or cap. "Invoiced monthly from the redemption count we both agree" sounds like a future billing dispute. Say "from MileSprout's validation log, shared with you live". |
| `control` | **Keep, fix copy** | Strongest operational slide. Fixes: (a) "so it's claimed at your till" should read "so it's used on the visit, not saved for later". (b) **Add a safety line: claiming only works when the car is parked.** Phone use while driving is a legal and reputational landmine for a driver app, and a short window pushes drivers to claim on the move. (c) The notes say site/day/hour targeting isn't confirmed. Mark it "coming in pilot" or cut it. Don't sell what you can't switch on. (d) "Live codes are honoured" after a pause is right. Keep it. |
| `audit` | **Rewrite to match reality** | "Checked when scanned" is stated as fact, but the service isn't built. Commit to one mechanism (see §4) and describe it plainly. "Drivers can confirm 'I used it'" is a weak signal that can be gamed. Leave it in the notes, not on the slide. The monthly match-up is good. Add "codes are worthless after the window, so screenshots can't be shared around". |
| `basket` | **Merge into review, downgrade** | Asking a small partner to "share what else was in the same transaction" is the wrong first ask. Most independents can't link a voucher to a basket without POS work, and chains won't hand over basket data to a pre-launch app. Make it optional: "If your till can tag the transaction, we'll show you the uplift." An all-placeholder table looks empty. Cut it. |
| `habit` | **Merge into review** | "Drivers run the same routes every day. Become their stop." is a great line. Use it as the headline of the merged "what you'll learn" slide. Careful: "we track repeat redemptions per partner" sits awkwardly next to "privacy is the point". Explain that it's a pseudonymous token per partner, never a person. |
| `privacy` | **Merge into audience/audit** | The "You get / You never get" table is good and partners do like it. But "Repeat redemptions per code holder" in the *You get* column contradicts the app's "This code has nothing about you in it". Reword it as "how many redemptions were repeat visits (counts only)". |
| `review` | **Keep as merged slide** | Six "[__]" tiles look like an empty dashboard. Before the pilot, show **one** illustrative example clearly labelled "illustrative", or show the template smaller. "Cost per real visit" is the killer metric. Lead with it. |
| `pilot` | **Keep, fill in** | Right shape. Fill in: sites, weekly cap, fee, start date, what MileSprout provides (staff card, validation page, monthly one-pager). Contact details and domain are placeholders. Don't present until both are live. |

**Add:**
- `till`: "At your till". One photo or mock-up of the staff validation screen and the steps: open page → scan or type code → green tick → give the deal. Say "No integration, no new hardware."
- `proof` (once you have it): live numbers: active drivers in the pilot area, Perks tab opens per week, claim→redeem rate from MileSprout-funded test offers.
- **Investor version only:** model and revenue mix, unit economics, traction, team and use of funds. Don't put these in the partner deck.

---

## 3. Cold start: the answer the deck must give

The question every partner and investor will ask: **"Why would I go first when you have no users yet, and why would drivers open Perks when there are no offers?"**

What I'd want the founder to say:

1. **Users come first, and the mileage tracker is the reason they come.** Perks is a feature in an app people already open every shift for tax savings, not a marketplace someone has to choose to visit. That's the real cold-start advantage, so **say it on the audience slide.** (The store shot "Every work mile adds up" is the hook. Use it.)
2. **Fill the Perks tab on day one without local partners:**
   - *Online offers with affiliate pay-outs* (tax software, business accounts, dashcams, MOT bookings, all in the partner report) need no till and pay per conversion. They make the tab useful and bring in some revenue from launch. Watch the report's Apple 3.1.4 warning: Perks must unlock nothing.
   - *MileSprout-funded seed perks.* Buy the coffees yourself at retail through a friendly independent for 4–6 weeks. The persona's assumed budget is a few hundred pounds. It proves claim→redeem rates with real drivers and gives you a case study before you ask anyone to pay.
3. **Go dense, not wide.** One city or one cluster of delivery hubs, one or two categories (hot drinks and car wash/valet). A partner buys local density, not national reach.
4. **Pitch timing (the persona's thresholds, assumptions only):**
   - **Pre-launch / now:** pitch only for a **free or fee-waived pilot** with 1–3 independents near a driver cluster. Frame it as a "launch partner" with first-mover visibility and no fee. Don't show the "[£__]" deck.
   - **When you have roughly 300–500 weekly-active drivers within a few miles of a site** *(assumption)*: paid local pilots with independents and small chains, using real seed-perk redemption rates.
   - **When you have roughly 5k+ weekly-active drivers in an area, plus three months of redemption data** *(assumption)*: regional chains and forecourt groups, minimums and committed budgets.
   - **Investors:** after launch, with 8–12 weeks of retention data on the tracker and one seed-perk case study. Before that, the Perks story is a slide of intentions.
5. **Traction proof to show, in order:** weekly active drivers (in the pilot area), Perks tab opens/week per active driver, claim rate, claim→redeem rate, repeat redemptions at the same site, staff validation time (seconds), and disputed vs. agreed counts.

---

## 4. Redemption tech: how a QR gets validated at a till with no integration

From the screenshots, today the code shows on the phone and the driver taps "Mark as used". Nothing validates it. Options:

| Option | How it works | Pros | Cons | Fit |
|---|---|---|---|---|
| **A. Staff validation web page** | Partner gets a link (or PWA) on a shop phone/tablet. Staff scan the QR with the device camera or type the short code (`MS-KRB-2JDW-50` is a good length) and get a big green tick / red cross. The code is burned on the server. | No integration, no app install, works on any device. MileSprout holds the authoritative log, which *is* the "independent check". Easy to build. | Staff must do one extra step. Needs signal at the till. Adoption depends on training (persona's assumption: expect staff to skip it some of the time in busy periods). | **Pilot default. Promise this.** |
| **B. Partner app / scanner** | Partner staff use a MileSprout Partner app. | Nicer UX, offline queueing. | One more app to install and maintain. Little gain over A for a pilot. | Later, if A proves sticky. |
| **C. Unique code list uploaded to POS** | MileSprout pre-generates a batch of single-use codes. The partner loads them into their POS voucher/promo system. The phone shows the next code from the batch. Monthly, the partner exports used codes. | Uses existing chain tooling. The till does the validation and the discount maths. | Needs a POS that supports unique voucher lists; many independents' tills don't *(assumption)*. Reconciliation is after the fact, and the count is the partner's, not independent. | Chains and forecourts after the pilot. |
| **D. Honour system + audit** | Staff eyeball the code/QR and give the deal. Driver or staff taps "used". Monthly spot checks. | Zero friction. | No defensible count, so it's a billing dispute waiting to happen. Screenshots can be reused. | **Only** for fee-free seed perks you fund yourself. |
| *E. Card-linked offers* | Redemption detected from card transactions. | Invisible to staff. | Needs bank/card-network partners and personal financial data. Breaks the privacy story. | Not for this product. |

**Technical must-haves whatever you choose:**
- The code must be **issued and signed by the server at claim time** (so caps and one-per-person work), stored, and **displayable offline**, because car parks have bad signal. Validation happens on the staff side.
- A countdown visible to staff (or a rotating/animated element) to stop screenshot sharing within the window.
- **Fix the screenshot mismatch:** the code screen must show the 30-min countdown.
- Claiming must be blocked while the car is moving. You already have motion detection from the tracker.

**What the deck should promise:** "Staff scan or type the code on a MileSprout validation page on any phone. Green tick means it's valid and counted. No integration, no new hardware. Both sides see the same live log." Then, in small print: "POS voucher upload available for chains." Don't promise "scanned at your till" in a way that implies the existing POS scanner reads it. That's integration, and you haven't done it.

---

## 5. Pricing sanity

The persona's assumptions throughout. Validate in the pilot.

- **Per-redemption fee (the current model)** is the right *story* for small partners, because it's risk-free. It's a weak *business* early on: fees are small, volumes are small, and the partner is *also* paying for the discount. On a fuel discount like "10p off a litre, up to 40 litres" (up to £4 of discount), plus your fee, on thin forecourt margins, most fuel retailers will say no. **Lead with coffee/food/car wash, where the free item costs the partner pennies to a pound or so** *(assumption)*.
- **Ranges I'd test** *(assumptions)*:
  - Hot drink / snack: £0.25–£0.75 per redemption.
  - Car wash / valet / tyre check: £1–£3 per redemption.
  - Online CPA (account sign-ups, tax software): use the affiliate rates from the partner report, which are unverified there.
- **Flat sponsorship** (e.g. "featured partner of the week" in a city) is simpler to sell to brands that want awareness, and predictable for you. Add it later, once you have audience numbers.
- **Minimums:** none for launch partners. After the pilot, either a small monthly platform minimum or a **prepaid redemption bundle** ("200 redemptions for £X, rolls over once"). Prepaid bundles also fix the "partner refuses to pay the invoice" problem I've seen kill marketplaces.
- **Will partner revenue replace subscriptions?** Not in year one, in my view. Illustrative arithmetic *(assumption, not a forecast)*: 10,000 active drivers × 2 redemptions/month × £0.50 = £10,000/month, and that needs a lot of local partners signed and serviced. Affiliate CPAs will probably be most of Perks revenue early on. Present Perks as "funds free Pro" (the compliant model in the report), not "replaces subscriptions", until the data says otherwise.

**A realistic first deal:**
> An independent café/bakery with 2–4 sites near a delivery hub or retail park. Offer: a free hot drink, 25–50 per site per week, one per driver per week, 30-min window, weekday 6–10am and 2–5pm (quiet times). **Three months, fee waived** (or a token £0.25 after month one), staff validation page, laminated staff card. In return: a named case study, permission to quote the cost-per-visit, and optional basket uplift if their till can tag it. Second deal: a hand car wash or valet, which is high-margin, has idle capacity, and drivers need it.

Fuel is a phase-2 partner. Supermarkets and coffee chains are phase-3: they'll want integration, data and minimums you can't offer yet.

---

## 6. Brand and visual credibility

- **Palette match is good.** Deck greens (#0E9F6E → #053D2E) and yellow accent match the store shots' green gradient. Rubik/Nunito Sans reads close to the app's type. It looks like one company.
- **The logo is missing.** The sprout mark appears in the app header but nowhere in the deck. Put it on the cover and the ask. Not needed elsewhere.
- **Branding on every slide:** the "MileSprout Perks · N" footer is fine as a page number, but it's redundant. Change it to just the page number, or drop it on full-bleed slides. You don't need branding on every slide; a consistent look does that job.
- **Screenshots:** the Perks screens are plain, unframed and grey-on-grey next to the polished store shots. Put them in the same device frame as the store set, and **re-shoot so they show the 30-min countdown and a staff-validated "Redeemed"**. The "Demo offers — these partners are examples" banner is honest. Keep it in the live demo, but crop it out of the slide shots and put a caption under them instead.
- **Placeholders:** "[__]" on six slides is the biggest credibility drain. Never show a partner a deck with blanks. Make a fill-in version per partner.
- **Tone:** plain English, partner-centred, no hype. The copy is better than most I see.

---

## 7. Scores (1–10)

| Dimension | Score | Why |
|---|---|---|
| **Clarity** | **7** | Pay-on-redemption is crystal clear. The app's three steps are excellent. Points off for the duplicated how/demo, four soft slides before the ask, and no staff-side view. |
| **Credibility** | **4** | Screenshots contradict the 30-min window, redemption is self-marked, the validation service isn't built, there's no traction number, and there are placeholders throughout. Fixable in a week; most of it is honesty and re-shooting. |
| **Investability / commercial appeal** | **4** (as a partner offer: **5**) | The partner proposition is low-risk and well-controlled. As an investment, no cold-start plan, no unit economics and an unproven "partners replace subs" thesis. A tracker with real retention plus one seed-perk case study would move this to 6–7. |

---

## 8. The 7 highest-impact changes, in priority order

1. **Make the screenshots and the deck tell the same story.** Re-shoot the claimed code with a 30-min countdown, and show "Redeemed" as the result of a staff scan, not "Mark as used". Right now your evidence undermines your claims.
2. **Add an "At your till" slide and commit to the staff validation web page** (option A) as the pilot mechanism. Rewrite `audit` to describe that real, server-logged count, and drop "checked when scanned" until it's built.
3. **Answer cold start on the audience slide.** Real (or local-density) driver numbers, the "drivers already open the app every shift" point, and the seed-perk / online-offer plan. Pitch only fee-waived launch-partner pilots until you have local actives.
4. **Merge `how` into `demo`** using the app's Claim → Show → Redeemed strip, and **move `pricing` after `control`/`audit`**.
5. **Put a real number on pricing and the pilot.** Fee (or "waived for launch partners"), weekly cap, sites, minimum or prepaid option, and billing from MileSprout's live log rather than "a count we both agree".
6. **Collapse `basket`, `habit` and `review` into one "What you'll learn" slide.** Headline it "Become their stop" and make basket data optional. No slide should be mostly "[__]".
7. **Tighten trust copy:** add "claims only work when parked" to `control`, fix "per code holder" on `privacy`, mark targeting as "coming" unless the pilot supports it, add the logo to the cover and ask, and turn the per-slide brand footers into plain page numbers.

---

### Practical summary

- It's a strong partner sales story with a weak trust and proof layer. Fix the screenshot contradictions and the unbuilt validation claim first.
- Promise a staff validation web page (no integration). Use POS code-list upload for chains later. Use the honour system only for self-funded seed perks.
- Solve cold start with the tracker's own daily use, online affiliate offers, and self-funded seed perks in one dense area. Pitch paid local deals after there are real local actives (persona's threshold: a few hundred weekly-active drivers near the site).
- First deal: an independent café or car wash, free item, capped, fee waived for three months, in exchange for a case study.
- Keep per-redemption pricing for local partners and use prepaid bundles to avoid unpaid invoices. Expect affiliate CPAs to provide most early revenue. Don't claim Perks replaces subscriptions yet.
- Make an investor deck separately. This deck is for partners.
