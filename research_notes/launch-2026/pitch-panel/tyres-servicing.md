# Pitch panel: Commercial Director, UK tyre, MOT and servicing chain

> **SIMULATED REVIEW.** The panellist is a made-up persona, not a real person or company. Any figure below marked *(persona assumption)* is this character's working guess, used to show the reasoning. None of them is market data, and none should be quoted as fact.

**Persona:** Commercial Director of a chain of about 150 tyre, MOT and servicing centres. Most of the business comes through our website and Google. Jobs are worth £60 to £600. Fleet and van customers matter a lot to us. I think in cost per acquisition (CPA) and customer lifetime value (LTV). A free tyre check costs us money on its own. It is only worth doing if it leads to a paid job.

**Material reviewed:** the 13 deck slides (cover → pilot), the Perks screenshots (list, claimed QR, redeemed, light and dark), and the 7 iOS App Store screenshots.

---

## 1. First impression: would I take the meeting?

**Yes, a 30-minute call, but not because of this deck.** I'd take it because of the audience. Couriers, private-hire drivers and tradespeople with vans put far more miles on their vehicles than most drivers. They wear out tyres and brakes, they need MOTs, and every day off the road costs them money. They are exactly the people we struggle to reach through Google. A self-employed van driver searching "tyres near me" at 7am is an expensive click, and he usually doesn't come back to us.

But the deck was written for a coffee shop or a fuel forecourt, not for me. The whole model assumes a walk-in, low-cost, buy-it-now offer: "walk in", "at your till", "30 minutes to use it". We don't work like that. Our customers book online, choose a time slot, leave the vehicle with us, and pay after the work is done, sometimes days after they first saw an offer. As shown, the "free tyre check" example on slide `how` would cost us money and prove nothing.

So my reaction is: right audience, wrong mechanism for my category, and no numbers yet. Come back with a booking-based version and a user count, and the meeting gets longer.

---

## 2. Slide-by-slide notes

| Slide | What works | What I'd push on |
|---|---|---|
| `cover` | "Pay only when they … use your offer" is a strong promise for a performance-led buyer. | "Walk in" leaves out every business that takes bookings. Say "visit or book". The footer says "free mileage tracking", but nothing tells me why a driver would open the Perks tab. |
| `audience` | The three groups are right. "Self-employed … own car or van" is my best fleet-adjacent segment. | **`[__ drivers using MileSprout by __]` is blank.** That's the first number I'd look for. Also, Deliveroo and Uber Eats riders are often on bikes or scooters, which is no good to me. I need **vehicle mix**: car / van / bike, and owned / leased / rented. Leased and rented vehicles may get tyres through the leasing company, not from us. |
| `problem` | Clearly put. | This isn't really my problem. I *can* tell which Google click turned into a booking, because our booking system tracks it. My problem is that cost per booking on generic searches is high and loyalty is low. Pitch "a cheaper, more loyal booking than paid search", not "proof of a visit". |
| `how` | Four simple steps. "Typed in online" is the most important phrase in the deck for me, and it's hidden. | "Free tyre check" is the wrong example. Better ones: "£10 off any two tyres", "MOT for £X when booked through MileSprout", "free tyre check + 10% off any tyre fitted". Step 4 says "Only codes used in store count", which contradicts step 3 ("typed in online"). |
| `demo` | The screens are clean, and the "Demo offers" banner is honest. | All three screens show a fuel deal. Show a booking flow: claim → code → enter at checkout → "Booked for Thu 09:30" → "Job completed". **Note: the claimed-QR screen says "7 days left, expires 9 Oct", but the `control` slide says 30 minutes.** That's a direct contradiction I'd spot straight away. Also, the redeemed status comes from the driver tapping "Mark as used". Fine for a demo, but it means you have no real redemption system yet. |
| `pricing` | The structure is clear. | **`[£__]` is blank, and it's the only number that matters.** "Per redeemed visit" at the same flat fee for a £3 coffee and a £400 set of van tyres makes no sense. "Redemption count we both agree" raises the question of who adjudicates when we disagree. |
| `control` | Caps, per-person limits, site/day/hour targeting and pausing are all useful. "Fill your quiet times" is relevant: we do have quiet bays on Tuesday afternoons. | **A 30-minute window is a non-starter for us** (see section 3). "Back in the pool" is fine. The speaker note says site and hour targeting is not yet confirmed, so don't show it as a feature card. |
| `audit` | Single-use codes plus a server-side check is the right answer. | "To build before launch" (speaker note): so it doesn't exist yet. Spot checks where drivers confirm "I used it" are weak evidence. For us, an API or webhook from our booking platform, matched on code and job status, is the real audit. Talk about that. |
| `basket` | "The free coffee is the door, not the sale" is my own thinking. Good. | For us, the basket *is* the job: tyres, alignment, brakes found during an MOT. We'd share job **value bands** for jobs started with a code, not line items. Show an example with service categories, not pastries. |
| `habit` | The "become their stop" idea fits. | Our repeat cycle is MOT once a year, service every 6 to 12 months, tyres every N thousand miles *(persona assumption: it varies a lot by mileage)*. Daily habit doesn't apply. **Mileage-triggered reminders** do, and that's your unique asset (see section 5). |
| `privacy` | Clear table of what we get and what we never get. | "Repeat redemptions per code holder" means you link codes to one person over time, so say how. The store screenshots say **"No account. No ads."** A Perks tab of partner-funded offers will read to drivers as ads, so have an answer ready. |
| `review` | Including "Cost per real visit" is the right instinct. | Every figure is a placeholder. Add *booking value* and *jobs per redeemer over 12 months*. That's the LTV view I report to my board. |
| `pilot` | Three months, capped, stop at any time. Low risk is the right ask. | Sites, caps, fee and contact details are all blank, and the domain isn't live. I can't take a pilot with nothing filled in to my CFO. |

---

## 3. Top 5 objections and what would satisfy me

### 1. "Your redemption model doesn't fit a booked service."
A driver sees the offer on Monday, books online for Thursday, and the job is done and paid for on Thursday afternoon. A 30-minute window kills this completely. Even "7 days" (what the screenshot shows) is tight for an MOT.

**What would satisfy me is a second offer type, "Book online":**
- **Booking code**, not a till scan. The driver enters a unique code (e.g. `MS-TYR-XXXX`) at checkout on our website, or the app deep-links to our booking page with the code already filled in.
- **Claim window 7 to 30 days, set per offer**, with a separate **"booking must be for a slot within N days"** rule. Short windows suit coffee. Booked services need longer ones.
- **Redemption = job completed and paid**, confirmed by our booking or POS system through an API or webhook (or a daily CSV during the pilot). Not "code scanned", and definitely not "driver tapped Mark as used".
- **Cancellations and no-shows don't count.** A booking that's cancelled within our normal policy goes back to the pool.
- Keep the in-centre QR as a fallback for walk-ins, e.g. a "drive-in tyre check this afternoon" offer. That's the one case where a short window makes sense.

### 2. "What do I pay, and how does it compare to my Google CPA?"
A blank `[£__]` means I can't model anything. My test is whether cost per completed booking from MileSprout, including the discount I fund, comes in under what I pay to acquire the same type of customer through paid search.

**What would satisfy me:** an indicative fee range by category, and a worked example such as "£10 discount + £X fee = £Y all-in per completed £Z job". Show it against a benchmark *I* supply. Don't invent one.

### 3. "How many of your users are actually my customer?"
I need to know how many drivers there are in total, how many have a van or a car they own (not bikes, not leased), and where they are relative to our ~150 centres. National reach that doesn't match our map is no use to me.

**What would satisfy me:** user count, vehicle mix and coarse region, all **self-declared** in-app, given as aggregate counts only, and matched to our centre postcodes at outward-code level (the first half of the postcode). Even an opt-in survey of the first cohort would do.

### 4. "Who decides when a redemption counts, and what stops fraud?"
Codes can be screenshotted and shared, and drivers can open several accounts on different devices. The app has "no account", so how is "one per person" enforced?

**What would satisfy me:** codes that only count once validated against our booking (job completed in our system). Then sharing doesn't matter: a completed job is a completed job, and I'm happy to pay for it whoever booked it. Add a dispute window (e.g. 30 days) and a clear rule that **our system of record wins** for booking-based offers.

### 5. "Why would a driver open Perks when they need tyres?"
Tyre and MOT purchases are driven by need, not by impulse. A coffee deal works because drivers are hungry every day. Nobody wants tyres every day.

**What would satisfy me:** need-based prompts the driver chooses to turn on. For example: "You've done 9,000 miles since you marked new tyres, so get a free tyre check near you" or "Your MOT is due next month" (based on a date the driver enters). These must be calculated on the phone, consistent with the privacy promise, and we never see the trigger. **This is the most valuable thing in your product for my category, and the deck doesn't mention it.**

---

## 4. Commercial terms I'd expect, and deal-breakers

**My preferred structure:**
- **CPA on completed jobs, with fees tiered by job value**, e.g. a lower fee for an MOT-only booking and a higher fee for a tyre job over £X. A flat per-visit fee across coffee and tyres means you undercharge us or overcharge the café. I'd accept **a percentage of invoice value with a cap**, or **2 to 3 fixed bands**. *(Persona assumption: anything that lands well below what we pay per booking on paid search is interesting. I won't state that figure in a pitch.)*
- **We fund the discount, you take the fee.** Fine, as the deck says. But the fee should be on **net invoice value after the discount**, if it's a percentage.
- **No fee for no-shows, cancellations, warranty work or refunds** within 30 days.
- **Monthly invoice, based on our record of completed jobs**, with your validation log as the cross-check.
- **Fleet angle:** small fleets of 2 to 20 vans are our sweet spot, and self-employed van drivers often grow into them. I'd pay a **higher one-off fee for a new business/fleet account** that books a second vehicle within 90 days. That's an LTV deal, not a per-visit deal. In the pilot, give drivers an optional "I run more than one vehicle" flag that turns on a fleet-enquiry offer.
- **Pilot terms:** 3 months, 10 to 20 centres in 2 to 3 regions where you have users, a weekly cap per centre, a fee cap for the whole pilot, and either side can stop at 30 days. The pilot is in good faith, with no exclusivity on our side. **Category exclusivity for you (no other tyre/MOT chain in Perks during the pilot) would be a nice-to-have.**

**Deal-breakers:**
1. Paying for claims, views or scans that don't turn into a completed job.
2. A use window that doesn't fit how bookings work (30 minutes as the only option).
3. Any requirement to share customer-level data such as names, registrations or invoices.
4. Your count overriding ours for booking-based offers, with no dispute process.
5. Long minimum terms or upfront platform fees before there is any user base.
6. Anything that looks like we're paying to be "advertised" in an app that tells drivers it has "no ads", without clear disclosure. That's brand risk for us too.

---

## 5. How realistic is the data sharing?

- **Basket-level data:** realistic only in a very reduced form. We could share **job category and value band** (e.g. "MOT only", "MOT + tyres", "£100–£250") for jobs started with a code, aggregated monthly. We would **not** share registrations, line items, customer details or anything tied to an identifiable driver. Our customer data is ours, and our data protection team would not sign anything that sends it to a third-party app.
- **Integration:** a code field already exists on our online checkout, because we take promo codes. Validating against your API in real time is a small IT project, not a quick yes. **For the pilot, a daily CSV of `code, centre, job status, value band` is the realistic option.** Say so on the `audit` slide. Don't promise a till scan for us.
- **What we would value from you:** aggregate, opt-in, self-declared signals such as "x% of redeemers drive a van", "average annual business miles of redeemers: band" or "region split". All of it computed without exposing trips. The privacy slide suggests you can't share mileage at all. You can if it's banded, aggregated and opted into. Make that clear, because mileage is the best predictor of when someone needs tyres.
- **Repeat tracking:** "repeat redemptions per code holder" needs some stable ID per user. Explain it (e.g. a random per-app ID, never shared) or drop it. Our own systems will show repeats anyway, through the customer's registration.

---

## 6. Brand and visual credibility

- **Good:** the deck and app look consistent and modern. The green and yellow palette is clean, the type is bold and readable, the iOS screenshots look professional, and the "Demo offers, these partners are examples" banner is honest. That honesty helps.
- **Undermines credibility:**
  - Too many placeholders: user count, fee, pilot sites, all six review numbers, all basket numbers, founder name, email. Plus a domain that isn't live. It reads as a template.
  - The 30-minute window on slide `control` contradicts the 7-day expiry in the demo screenshot.
  - The demo partners are all coffee and fuel. Nothing shows a booking or service business, so I'm left to imagine it myself.
  - The speaker notes admit the audit service and targeting are "to build" or "to confirm". If I ask, the founder must be upfront. Better still, mark them "Pilot roadmap" on the slide.
  - "No account. No ads." in the store versus a partner-funded Perks tab: driver trust is your main asset, so don't give it away to a sharp-eyed partner like me.
  - The project folder is named "milemint" while the brand is MileSprout. Make sure every external asset is consistent.

---

## 7. Scores and pilot decision

| Dimension | Score (1–10) | Why |
|---|---|---|
| Clarity | **7** | The mechanism is easy to follow, but it's written for coffee/fuel and contradicts itself on the window. |
| Credibility | **4** | No users, no price, no live partners, and the audit isn't built. Honest, but not yet proven. |
| Commercial appeal (for my category) | **5** | The audience is very attractive. As designed, the mechanism doesn't fit booked services. With booking codes and value-tiered CPA it would be a 7. |

**Would I pilot?** **Not on the current terms. Yes, conditionally,** if MileSprout comes back with: (a) a booking-code offer type with a 14 to 30 day window, (b) a fee per completed job set against job value, (c) a CSV-based validation process for the pilot, (d) a real driver count with vehicle mix in at least 2 of our regions. I'd start with 10 to 20 centres, a capped budget, and a 30-day break clause.

---

## 8. The 5 highest-impact deck changes

1. **Add a "Book online" offer type** (new slide after `how`, or split `control` in two): unique code at online checkout, a 7 to 30 day window set per offer, payment only on a *completed* job, and no-shows don't count. Keep "30 minutes" as one option for walk-in offers, not the headline. Fix the 7-day/30-minute contradiction.
2. **Fill in, or give ranges for, the three key numbers:** driver count (`audience`), fee (`pricing`, `pilot`), and pilot size. If launch figures aren't ready, show targets clearly labelled as targets, plus a worked unit-economics example per category.
3. **Make pricing depend on value.** Show 2 to 3 fee bands (e.g. low-value walk-in / mid-value / high-value booked job) and a "your all-in cost per completed job" calculation the partner can fill in with their own CPA.
4. **Put mileage-triggered prompts on the `habit` slide:** opt-in and calculated on the phone, e.g. "tyre check due" or "MOT due". This is what no other channel can offer me. Pair it with a fleet/van flag to show the LTV opportunity.
5. **Make `audit` and `privacy` work for integrated partners and match the store promises:** online code validation through API/CSV, "partner system of record wins for booked jobs", how one-per-person works without accounts, and how Perks fits the "No ads" message.
