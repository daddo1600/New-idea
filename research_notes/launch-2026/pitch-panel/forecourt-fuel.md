# Pitch panel feedback: Forecourt fuel and convenience chain

**SIMULATED PERSONA (fictional; not a real person or company):** Head of Marketing & Loyalty, mid-sized UK forecourt fuel and convenience chain, about 60 sites across the Midlands and North. We already run our own loyalty app and pay for fuel-card and app partnerships. All numbers below are **my persona's rough assumptions**, not market data.

Reviewed: all 13 slides (cover, audience, problem, how, demo, pricing, control, audit, basket, habit, privacy, review, pilot), the Perks screenshots (1-perks-list, 2-claimed-qr, 3-redeemed) and the App Store screenshots (01-home to 07-compare).

---

## In character

### 1. First impression in 10 seconds: would I take the meeting?

"Bring working drivers through your door. Pay only when they walk in." Good line, and it's aimed at me. Couriers and private-hire drivers are on my forecourts all day: in for fuel, a coffee, a sausage roll, maybe screenwash. Pay-per-redemption is the right model to put in front of someone who has been burned paying for impressions.

Then I read on and find an empty user count, an empty fee, empty pilot numbers, a domain that isn't live and partners that don't exist. You're asking me to fund offers for an audience you can't size yet, in an app that launches this month.

**I'd take a 30-minute call, not a meeting with my ops and IT people.** I'd come back when you can tell me how many active drivers you have within 5 miles of my sites, and how a cashier redeems a code on my tills.

### 2. Slide by slide

| Slide | What lands | What's weak or confusing | What's missing |
|---|---|---|---|
| **cover** | Clear promise, and pay-per-visit is the right hook. | "Walk in and use your offer". Half my customers pay at the pump. Does that count? | One line on who you are and how many drivers you have (when real). |
| **audience** | The right segments. Couriers and PH drivers are high-frequency forecourt users. | `[__ drivers using MileSprout by __]` is a blank. That is the slide I care about most. | Where the drivers are: region or postcode density. For 60 sites in the Midlands/North, a London-heavy user base is worthless to me. |
| **problem** | Fair. Leaflets and social ads don't prove footfall. | My problem isn't attribution, it's **margin and frequency**. I already know who visits, through loyalty and card data. | Why this beats the loyalty app I already pay for. |
| **how** | Four steps, easy to follow. | Step 1's example is "10p off a litre". On fuel margin that is my whole margin or more (persona assumption: forecourt fuel margin is a few pence per litre after costs). Step 3: "typed in online" means nothing to a forecourt. | Which step my staff do, and how long it takes at the till. |
| **demo** | Clean, believable UI. Claim, show, Redeemed is obvious. | **The screenshots contradict control.** The QR screen says "7 days left, expires 9 Oct", but control says 30 minutes. There's also a driver-facing **"Mark as used"** button. To me that means the driver can redeem it themselves. I know it's a demo label, but it will be the first thing my fraud team asks about. The featured offer is "10p off a litre, up to 40 litres", which is about £4 off a fill (my rough maths). That's a scary first example to show a fuel retailer. | A demo of the **till side**: what the cashier sees. |
| **pricing** | Fee only on redemption, nothing for views or claims. The table is very clear. | `[£__]` is blank. "Invoiced from the redemption count we both agree" is fine, but who wins if the counts disagree? | A worked example: offer cost + fee = cost per visit, against a typical basket. A monthly invoice cap. |
| **control** | The strongest slide: weekly cap, 30-minute window, back to the pool, one per person, site/day/hour targeting, pause any time. It speaks to budget owners. | The speaker note admits site/day/hour targeting may not exist in the pilot. Don't put it on the slide if you can't deliver it. "One per person" only holds if you have a reliable person identifier. How, with no account? | Per-site caps (not only per offer). A hard monthly spend ceiling. |
| **audit** | Single-use codes, server check and monthly reconciliation are the right instincts. | "To build before launch". So the validation service doesn't exist yet. "Checked when scanned" assumes my till can call your API. It can't today. | A plain description of how redemption reaches you: integration, staff portal or batch file. Who carries the cost when staff scan codes without a real sale (collusion)? |
| **basket** | "The free coffee is the door, not the sale" is the right framing for me. Basket is where my profit is. | You're asking me to send transaction data to an early-stage start-up. Every row is a blank. | What you do with it that I can't do myself. I already have basket analytics from EPOS. |
| **habit** | Routes and repeat visits is the real value proposition. | One sentence, no mechanism, no evidence. | How you'd measure a lapsed driver becoming a regular, and whether you'd push them into **my** loyalty scheme. |
| **privacy** | Credible, and it matches the App Store story ("Your trips stay on your phone"). | "Repeat redemptions per code holder" means there is a persistent pseudonymous ID. That's personal data under UK GDPR, even without a name. It sits awkwardly next to "This code has nothing about you in it". | Controller/processor roles, and what you hold server-side. |
| **review** | The right KPIs, especially "cost per real visit". | All blank. | Incremental vs. would-have-come-anyway. A driver who fills up with me every day anyway and now gets a free coffee is a cost, not a win. |
| **pilot** | Three months, capped, paid on results, exit any time. Low-risk framing. | Every number blank. Contact placeholder. | Pilot success criteria agreed up front. What you provide (staff briefing card, signage, till instructions). |

### 3. My top 5 objections and what would satisfy me

1. **"How many of your drivers are near my sites?"** Satisfy me with real active-user counts (weekly actives, not downloads) by region or postcode district, matched against my site list. If you have fewer than a few hundred actives in my catchment (persona threshold), I'd wait.
2. **"How does my cashier redeem this?"** Most of my tills scan barcodes for promotions. I don't know that every site can read a phone QR, and the tills won't call your API. Show me a workable route that doesn't touch EPOS for the pilot, then a path to proper integration. (See section 4.)
3. **"Is this incremental, or am I subsidising regulars?"** Satisfy me with a test/control design: offer sites vs. matched non-offer sites, and new vs. returning drivers (by code-holder ID, aggregated). I want an incremental cost per *new* visit.
4. **"What stops abuse?"** Staff scanning codes without a sale, screenshotted QRs, multiple devices per person, the "Mark as used" button. Satisfy me with server-side single-use checks, a per-device or per-account limit, the till/site stamped on each redemption, a dispute process, and no fee for redemptions that don't match a till transaction.
5. **"Why not just put these drivers in my own loyalty app?"** Satisfy me with a role for you as an **acquisition channel into my scheme**, e.g. the first perk carries a "join our app" link or code, rather than a rival scheme sitting next to mine. Also: exclusivity, or will my competitor down the road be next to me in the same list?

### 4. Commercial terms I'd expect

- **Offer type.** Shop only for the pilot: hot drink, food-to-go meal deal, car wash or screenwash discount. **No fuel pence-per-litre offers.** If fuel is ever on the table, a small cap (1–2p/litre, a low litre limit) funded with a fuel supplier.
- **Fee per redemption.** For a pilot, **free, or nominal at roughly £0.20–£0.50 per redeemed code** (persona assumption). At scale, I'd consider **£0.50–£1.00** if you can show incremental basket uplift. A flat fee is fine, but I'd rather pay a **share of the incremental basket** (e.g. a % of spend above the offer) than a fixed fee on every free coffee.
- **Caps.** Per site per week (e.g. 20–50 codes a site, persona guess), a hard monthly invoice ceiling, and the right to pause per site immediately, in practice same day.
- **Pilot.** **8–12 weeks, 5–10 sites** in one region where you can prove driver density, plus matched control sites. Kill switch at any time with 7 days' notice.
- **How scanning would actually work at my sites, in order of preference for a pilot:**
  1. **Staff web portal on a tablet or back-office PC.** The cashier types or scans the code on a cheap handheld/tablet, sees "Valid: free hot drink", and rings it through as a manual promo/discount key on the EPOS. Zero EPOS integration, works next week. Weakness: there's no link to the actual till transaction, so basket data is manual.
  2. **Barcode, not just QR, plus a promo key.** Show a 1D barcode (or a QR the existing scanner can read) mapped to a single "MileSprout perk" promo, and validate single-use against your service in a nightly batch reconciliation file from our EPOS provider. Needs our EPOS vendor's involvement. That's months, not weeks, and it costs money.
  3. **Full EPOS/loyalty-platform integration** with a real-time API check. Only after a successful pilot, and only through our existing EPOS/loyalty vendors.
  - Pay-at-pump customers can't redeem. Fine for shop offers, but say so.
- **Deal-breakers:**
  - Fuel-price discounts as the headline mechanic.
  - Anything that requires EPOS changes before the pilot proves value.
  - Paying for redemptions I can't match to a till transaction.
  - Exclusivity demanded from me with none offered to me (a competitor's forecourt shown as a rival offer in the same list).
  - Any sharing of my transaction data with other partners, or any onward use of it.
  - Auto-renewing contracts or minimum spend.

### 5. Data and basket sharing

**What I'd realistically share:**
- Monthly, **aggregated per site**: count of redeemed transactions, average basket value of those transactions, and category mix (hot drinks, food-to-go, car care, fuel yes/no), only where a category has enough transactions to avoid identifying anyone (e.g. suppress cells under ~10).
- Not line-item data, not card tokens, not timestamps to the minute, not loyalty IDs.

**Legal/GDPR concerns:**
- If redemptions carry a persistent code-holder ID, plus site plus timestamp, they are **pseudonymous personal data**. Combined with our CCTV, card payment or loyalty records, they could identify someone. We would need a **data sharing agreement / DPA**, clear controller roles (I suspect we're **independent controllers**), and a **DPIA** on your side.
- Your privacy notice must tell drivers that redemption events (not trips) are shared with partners in aggregate.
- Our legal team will ask where your servers are (UK/EU), retention periods, your security posture (Cyber Essentials as a minimum) and breach notification terms.
- Any marketing consent (e.g. joining our loyalty app) must be collected by **us**, opt-in, not passed across by you.
- I'd frame basket insight as **our analysis, shared back to you in aggregate**, not raw data flowing to you.

### 6. Brand and visual

- The deck and app look like one product: same greens, the same clean, friendly type, and the sprout motif. The App Store set ("Every work mile adds up", "Your trips stay on your phone") is polished and consumer-grade. It feels more trustworthy than most start-up apps that pitch me.
- The Perks UI is simple: "33 of 50 left this week" and the Redeemed stamp are easy to explain to a store manager.
- Credibility gaps are **content, not design**: a deck full of `[__]`, a not-live domain, and the 7-day vs. 30-minute inconsistency. Visually it's ready. Substantively it reads like a template.
- Small things:
  - The "Kerbside Fuel" demo partner with a fuel discount sends the wrong message to my category.
  - The "Mark as used" button should not be in the screenshots you show a retailer, even with the demo caption.

### 7. Scores and pilot verdict

| | Score /10 |
|---|---|
| Clarity | **8**. The mechanism is understood in one pass. |
| Credibility | **4**. No users, no fee, no till integration, and a screenshot that contradicts the controls. |
| Commercial appeal | **5**. The pay-per-redemption risk profile is attractive, but the audience isn't proven and incrementality is unanswered. |

**Would I pilot? Maybe.** Yes to a small, shop-only pilot (5–10 sites, 8–12 weeks, staff-portal redemption, nominal fee, hard cap), **if** you can show real active-driver density near those sites and a redemption flow my cashiers can do in under 10 seconds without EPOS changes. Without those two, no. Not because the idea is bad, but because I'd be paying my team's time to beta-test your launch.

---

## Out of character: practical summary

### The 5 highest-impact changes to the deck

1. **Fix the demo contradiction.** Regenerate the claimed-QR screenshot to show the 30-minute window (e.g. "28 min left"), and remove or hide "Mark as used" in partner-facing screenshots. Swap the featured fuel offer for a shop offer (free hot drink with any purchase). A fuel-pence offer alarms margin-focused retailers.
2. **Add a "How it works at your till" slide.** Lead with a no-integration staff-portal option (tablet/phone validates the code, cashier applies an existing promo key), then a batch-reconciliation route, then full EPOS integration later. Show the cashier screen. Replace "typed in online" on how and the API assumption on audit.
3. **Replace blanks with a credible stance.** Where real numbers don't exist, say how they'll be produced and when: "Pilot sites chosen where we have ≥N weekly active drivers within 3 miles; we'll show you the density map before you commit." Put a proposed fee or range on pricing/pilot (or "free for pilot partners") instead of `[£__]`.
4. **Add incrementality and a worked unit-economics example.** Add a test/control design to review and pilot, and a cost-per-visit worked example (offer cost + fee vs. basket margin), clearly labelled illustrative. Position Perks as an **acquisition feed into the partner's own loyalty scheme**, not a competitor to it (habit slide).
5. **Tighten privacy/data to match the GDPR reality.** Acknowledge that redemption events with a pseudonymous ID are personal data, state controller roles, DPA/DPIA, UK hosting and aggregation thresholds. Reframe basket: the partner analyses its own data and shares aggregates back. Drop un-built features (site/day/hour targeting) from control, or mark them "on request".

### Other notes
- Have answers ready on fraud (staff collusion, multi-device), pay-at-pump, exclusivity, and per-site caps.
- A fuel/convenience chain will move slowly on EPOS changes. The pilot must work with zero integration.
