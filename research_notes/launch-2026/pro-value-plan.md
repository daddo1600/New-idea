# Pro value plan: Pro perks, teasers and "value you can see"

*Marketing agent, 3 October 2026. Draft for the founder. Nothing has been sent to partners or users. The panel in §5 is **simulated**, not real research.*

Read with: `pricing-simulation.md`, `perks-simulation.md`, `home-panel.md`, `website-claims-check.md`, `milemint/src/app/pro.tsx`, `milemint/src/domain/plan.ts` and `website/index.html#free-pro`. Anything marked **[rules]** depends on the App Store and consumer-law check the research agent is writing (`pro-perks-rules.md`, not yet in the folder).

## Answers first

- **Recommend (d), a mix, built on one promise: every offer has a free version, and Pro gets a "plus" on top.** Pro gets a better version of selected offers (a second drink a week, a bigger garage or tax-help discount), paid for by the partner, with its own pool. Pro also gets a first look at new partners. **No Pro-only offers at launch.**
- **This partly reverses `perks-simulation.md`** ("Free and Pro get the same perks"). That note was right that a Pro link annoys some drivers and that free logging is the hook. The plus model keeps the free offer whole, so the free user loses nothing. It only works if the partner pays for the plus, because MileSprout can't fund a second drink from £3.99.
- **Teasers live only where the user is already looking at perks:** a quiet second slot on the offer card in the Perks tab, plus at most one other Pro line a week. Never in push notifications, on Home, in the parked-near-a-partner card, the trip log or reports.
- **"Value you can see" is mostly free.** Show the drives' worth at the tax office's rate and the Perks savings as **two separate figures, never added together**: one is a claim value, the other is cash. Pro gets a personal "Pro extras used" tally against what Pro costs.
- **Pro is still sold on reports and money tools.** Perks vary by area, so the plus has to be a bonus, not the reason Pro is worth £3.99. In the simulated panel, perks mostly made people **pay sooner** rather than pay when they wouldn't have. That helps the seasonal-churn problem in the pricing note.

## 1. Pro perks model

| Option | Effect on upgrades | Free users feel second-class? | Partner willingness | Cost to us | Verdict |
|---|---|---|---|---|---|
| (a) Better version for Pro (2 drinks, not 1) | Medium. Visible every week, easy to explain | Low, **if** the free offer is untouched and Pro's extra codes come from a separate pool | Mixed. A second weekly visit is the repeat they want, but the sim shows a cap of 2 adds more "would have come anyway" visits | Nil if partner-funded; not viable if we fund it (see below) | **Yes, on chosen offers** |
| (b) Some offers Pro-only | Highest on paper | **High.** A locked offer in the free tab reads as "this app is a shop with a velvet rope". It breaks the "nothing locked" story in `plan.ts` | Some partners like a premium cohort | Nil | **Not at launch.** Revisit after a season, for business-only offers (accountancy, bookkeeping) |
| (c) Early access for Pro | Low on its own | Low if it's a **first look**, high if Pro can drain a limited pool first | Neutral | Nil | **Yes, as a first look only.** Claiming opens to everyone at the same time |
| (d) Mix of (a) and (c) | Medium–high | Low with the guardrails below | Partner chooses per offer | Nil | **Recommended** |

**Why we can't fund the second drink.** After Apple's 15% (small business rate), £3.99 brings in about £3.39 a month. A second drink a week is about 4.3 drinks a month. At even £1 cost each, that's £4.30, more than Pro earns. So the plus must be partner-funded, or limited to discounts the partner already offers. The partner pays per redemption, as now.

**Guardrails (all needed):**
1. **Free offer never shrinks.** If a partner wants to offer a plus, the free version must be the same as it would have been without Pro.
2. **Separate pools.** Pro plus codes come from their own weekly pool. Pro never uses up free codes, and the free pool is never cut to fund Pro.
3. **Plus is optional for the partner** and shown only where it exists. Expect it on a minority of offers at first.
4. **Off-peak where possible** (for example 2–5pm), so the partner's extra cost lands in quiet hours.
5. **The plus never unlocks anything in the app,** and Perks never unlocks or discounts Pro (guidelines 3.1.1 and 3.1.4, as in the perks note). The waitlist and tester Pro codes count as Pro, so partners need to know those users get the plus too.
6. **The code type tells the partner it's a plus** ("first visit", "repeat", "stamp", now also "Pro plus"). No identity and no device ID go to the server, the same as now. Pro status is checked on the phone with StoreKit.

**Where the plus earns most** (from the perks simulation's categories): coffee or loo plus coffee (food couriers), fuel (car and van drivers; 1p a litre more), car washes (ride-hail), parking (care workers), garage and MOT bookings (bigger discount), and tax help (bigger discount at tax time). Gym, phone and insurance plans aren't worth it.

**[rules] to confirm in `pro-perks-rules.md`:**
- Whether putting a real-world benefit inside an in-app subscription raises guideline 3.1.3(e) (physical goods and services bought outside the app) or 3.1.2(a) (ongoing value). Our position: Pro is priced and described for its in-app features, and the plus is a partner's extra that we don't sell.
- **"Free" wording.** A drink you only get because you pay for Pro may not be "free" under CAP Code rules (section 3, "free"), FTC 16 CFR 251 or the ACL. Copy below says **"included with Pro"** or "second drink", not "2 free drinks". The free user's first drink can be called free.
- **Changes mid-subscription.** Partners will come and go. Don't list named partner perks in the App Store subscription description or as a promised Pro feature. Say "Pro extras from partners near you, where available".
- **Limited stock.** "While this week's codes last" must be true and visible next to the offer, not only in terms.

## 2. Teasers to free users that don't nag

**Where and how often**

| Place | What a free user sees | Frequency rule |
|---|---|---|
| Offer card, Perks tab | A second slot under the free one, greyed, labelled for Pro | Only on offers with a plus. Static: no animation, no badge, no red dot |
| After a code is used (the "Enjoy" screen, not the code screen at the till) | One "Did you know?" line | At most once a month, never in the first 14 days, never on the same partner twice in a row |
| Weekly recap (short, free) | One line, only if they claimed a plus-eligible offer that week | At most once every 4 weeks |
| Tax time (Pro's own season) | Already handled by the Pro prompts in the pricing note. No perks line here | — |
| **Never** | Push notifications, Home, the parked-near-a-partner card, the trip log, reports, the code screen at the till, while moving | — |

**Overall cap:** besides the static second slot, at most **one** Pro line a week across all places. **"Don't show Pro tips"** in Settings hides them all for good (the second slot shrinks to a one-line "Pro: 2nd drink" note with no button).

**Copy** (UK; swap the currency and "drink" for the offer)

- **Locked slot label:** **"2nd drink this week · with Pro"**
  - Line under it: **"Weekdays 2–5pm, while this week's codes last."**
  - VoiceOver: "Second drink this week, included with Pro. Weekdays 2 to 5pm, while this week's codes last."
  - Use a small "Pro" tag, not a padlock. Simulated older users read a padlock as "broken".
- **Upgrade button (on the slot and in the lines below):** **"See what Pro includes"**. It opens the Pro screen with reports first and Pro extras last.
- **"Did you know?" line (after a code is used):** **"Did you know? Pro members get a second drink here each week, while this week's codes last."**
  - Dismiss: **"Not now"** (hides it for 30 days).
- **Weekly recap line:** **"You used 1 code at Bean & Co this week. With Pro, you'd have had a second (while codes last)."**
- **Pro screen extras row** (add to `COMPARISON` in `pro.tsx` and the website's "Smart extras"): **"Partner extras near you, such as a second drink a week (where available)"**.
- **When the Pro pool runs out (Pro user):** **"This week's Pro codes here have gone. Your usual code is still available."** Never show a free user "Pro codes gone".

**Words to avoid:** "free" for anything that needs Pro; "unlock"; "don't miss out"; "only Pro members…"; countdowns; "Upgrade now".

## 3. Value you can see

**Principle:** two honest numbers, side by side, never added. The drives' figure is what they're **worth at the tax office's rate** (a claim value, not cash and not tax saved). Perks savings are cash. Adding them would overstate it, and `website-claims-check.md` already moved us away from "money back" and "unclaimed".

| Feature | Free or Pro | Exists? | Copy |
|---|---|---|---|
| Year-to-date worth | **Free** | Partly: the money total and tax-year totals exist | **"Your work drives this tax year: £1,284 at HMRC's 55p rate."** CA: "about C$… at CRA's allowance rate" |
| Perks savings | **Free** | No. It needs the redemption server to confirm the code was used | **"Saved with Perks this year: £18.40"** (codes used only). Hidden at £0 |
| Combined headline (Money tab, top) | **Free** | No | **"MileSprout this year: £1,284 of work drives logged · £18.40 saved with Perks"** |
| Drives logged for you | **Free** | The count exists in the data | **"212 drives logged for you this year, without writing a thing."** |
| Time saved logging | **Free, in-app only, with the assumption shown** | No | **"At a minute a drive to write down, that's about 3½ hours this year."** Never "saved you 3½ hours", and never in ads. No source backs a per-drive time |
| Monthly recap (short) | **Free** | The weekly recap exists (short free, full Pro) | **"September: 1,140 work miles, worth £627 at HMRC's rate. 96 drives logged for you. Perks saved you £6.80."** |
| Monthly recap (full) | **Pro** | Built on `recap.ts` | Adds: **"Set aside £140 this month for tax. Best day: Friday, £38 of drives. Deliveroo: £1.12 earned a mile."** |
| Pro extras tally | **Pro** | No | Below |

**Pro extras tally** (Pro settings, and once a month in the full recap):
- Always: **"Pro extras used this year: £14.80 (second drinks and partner discounts). Pro costs you £29.99 a year."**
- When extras pass the cost: **"Your Pro extras this year (£34.20) are more than Pro costs (£29.99)."**
- Counts only plus codes actually used, at the value the partner states. It does not count reports, exports or tax set-aside: those can't be priced honestly.
- "Costs you" is the price the user actually pays (from StoreKit), shown as a year.
- **Don't use the founder's line "Pro has saved you £Y more than it costs".** "Saved" overstates a discount on something they might not have bought. Don't say "Pro pays for itself" in ads either; for most users it won't, through perks alone.

Everything here is worked out on the phone from the drives and the user's own codes. The redemption server only answers "was this code used?", as in the perks note.

## 4. More Pro value beyond perks

Ranked by care × ease. "Care" is from the simulated panels (pricing, perks and §5); "ease" is a rough build guess.

| Rank | Idea | Who cares most | Care | Ease | Status |
|---|---|---|---|---|---|
| 1 | Itemised log, PDF report, exports (CSV, Xero, QuickBooks, FreeAgent, ATO logbook, P87 summary, expense claim) | Everyone at tax time; trades; care | High | — | **Exists** |
| 2 | Tax set-aside each week | Gig, US estimated tax | High | — | **Exists** |
| 3 | Quarterly figures (MTD, 1040-ES, instalments, BAS) | Trades, full-time gig | High | — | **Exists** |
| 4 | Earnings by platform from screenshots | Multi-app gig | High | — | **Exists** |
| 5 | **Earnings a mile and an hour, by platform** ("Uber Eats paid £1.12 a mile this week; Deliveroo £0.94") | Gig, ride-hail | High | Easy: built on #4 and the drives | New |
| 6 | **Receipts and costs**: photo of a parking, toll or fuel receipt, read on the phone, attached to the drive | Care, trades, ride-hail | High | Medium: parking and tolls per drive exist, and screenshot reading exists | Partly exists |
| 7 | **Per-client or per-job totals** (care visits, trade jobs) for rebilling and rota disputes | Care, trades | Medium–high | Medium | New |
| 8 | **Employer claim gap**: what your employer pays against HMRC's rate, and the P87 figure | UK care workers, employees | High (UK) | — | **Exists** (`mar.ts`, claim relief). Market it more |
| 9 | Partner extras (this plan) | Food couriers, ride-hail | Medium | Medium: redemption server needed | New |
| 10 | Import a log from another app | Switchers from MileIQ and others | Medium | — | **Exists** (not on the website: add it) |
| 11 | Full weekly recap and Ask MileSprout; Siri & Shortcuts | Daily users | Medium | — | **Exists** |
| 12 | Return-ready pack: one tap for the report, totals and a checklist each tax deadline | Everyone, seasonally | Medium | Easy: `deadlines.ts` and the reports exist | New wrapper |
| 13 | Priority help (email answered within one working day) | Trades, older users | Low–medium | Easy | New |
| 14 | Direct MTD submission to HMRC | UK trades over £50k (£30k from April 2027) | High for few | Hard: HMRC recognition, legal | Later |

**Recommendation:** build #5 and #12 next (easy and they show money), then #6. They'll do more for Pro than perks will.

## 5. Simulated panel: 30 drivers react

**Simulated.** 30 personas (UK 9, US 8, Canada 6, Australia 7; food, parcels, ride-hail, care, trades). 8 already intended to buy Pro for reports; 22 were free. Each saw the plus model, the locked slot, the "Did you know?" line, the free value lines and the Pro tally. Y = would upgrade, M = maybe, N = no.

| # | Driver | Work | Now | Upgrade | Annoyed by | Quote |
|---|---|---|---|---|---|---|
| 1 | Priya, London | Deliveroo, car | Free | **Y (perks tipped it)** | — | "I was going to pay in January. Two coffees a week, I'll pay in October." |
| 2 | Kwame, Manchester | Uber Eats, e-bike | Free | N | The slot on every card | "One coffee's fine. Don't show me the one I can't have every time." |
| 3 | Sian, Swansea | Care worker | Pro intent | Y (reports) | — | "I'm paying for a log the office accepts. The drink's a bonus." |
| 4 | Gary, Leeds | Plumber | Pro intent | Y (reports) | Perks near exports | "Keep coffee off my accountant screen." |
| 5 | Sarah, Leeds | Care, split shifts | Free | M | — | "A second parking code would do it. A second latte wouldn't." |
| 6 | Mick, Glasgow | Evri van, sceptic | Free | N | Frequency | "More than once a month and I switch it off." |
| 7 | Aisha, Birmingham | Just Eat, moped, halal | Free | M | Non-halal offers | "A second meal deal I'd pay for." |
| 8 | Jo, Norwich | Weekend DPD | Free | N | — | "The £ my drives are worth: that I'd look at." |
| 9 | Tom, Bristol | Uber | Free | **Y (perks tipped it)** | Pool running out | "If the Pro codes are gone, tell me straight." |
| 10 | Marcus, Atlanta | DoorDash | Pro intent | Y (set-aside) | — | "Gas is the only perk that moves my number." |
| 11 | Jenna, US | Student, weekends | Free | N | — | "I'll take my one free drink, thanks." |
| 12 | Luis, Phoenix | Uber/Lyft | Free | **Y (perks tipped it)** | — | "Car wash twice a month with Pro? That's the five bucks." |
| 13 | Carol, Ohio | Home health aide | Free | N | Padlock icon | "I thought the lock meant it was broken." |
| 14 | Ray, Chicago | Uber, sceptic | Free | N | Any Pro link in Perks | "Now the coffee app wants a subscription. Classic." |
| 15 | Kim, New York | Grubhub, e-bike | Free | M | — | "Bigger battery-service discount, maybe." |
| 16 | Destiny, Houston | Instacart, car | Free | **Y (perks tipped it)** | — | "A monthly 'saved with Perks', I'd screenshot that." |
| 17 | Dale, Denver | HVAC contractor | Pro intent | Y (reports) | — | "Receipts on the drive. Build that." |
| 18 | Arjun, Toronto | Uber | Free | M | — | "Pro tyre-swap discount in October and I'm in." |
| 19 | Fatima, Mississauga | DoorDash, halal | Free | M | — | "Show me the halal place first." |
| 20 | Élodie, Montréal | Electrician | Pro intent | Y (QuickBooks) | French copy quality | "Le café, je m'en fiche. QuickBooks, oui." |
| 21 | Dave, Calgary | Owner-operator, sceptic | Free | N | — | "The value line's honest. Still not paying for coffee." |
| 22 | Hannah, Halifax | Part-time Uber | Free | N | — | "One free drink a week is already great." |
| 23 | Amrit, Brampton | Skip, Punjabi | Free | M | — | "If 'Did you know' is short and in Punjabi, OK." |
| 24 | Liam, Brisbane | Menulog, e-bike | Free | M | — | "A second cold drink in January? Tempting." |
| 25 | Bec, Brisbane | Disability support | Pro intent | Y (tax time) | — | "The year's total in July gets me over the line." |
| 26 | Tom, Sydney | UE + DoorDash | Free | N | Price | "A$7.99 for a second coffee? Nah." |
| 27 | Nguyen, Melbourne | Uber | Pro intent | Y (reports) | — | "4c a litre more with Pro, I'd notice." |
| 28 | Steve, Perth | Carpenter | Pro intent | Y (after trial) | — | "Coffee's not why. Xero is." |
| 29 | Mei, Adelaide | NDIS support | Free | M | — | "I like that it's only in the Perks tab." |
| 30 | Josh, Gold Coast | DoorDash + Uber | Free | **Y (perks tipped it)** | — | "A tally saying Pro's covered its cost, I'd post that in the group." |

**Tallies (stated, not real):** 13 Y, 8 M, 9 N. Of the 13 Ys, **5 were tipped by perks** (all free users: food couriers and ride-hail); 8 would buy for reports anyway. 5 of the 8 maybes would move for a plus in **their** category (parking, meal deals, kit, tyres, cold drinks), not coffee. Using the pricing note's rule of thumb (1 in 5 stated "yes" becomes a purchase), the plus adds roughly **1–2 points** of conversion among food and ride-hail drivers. Its bigger effect is **timing**: Priya, Tom and Josh would pay months before tax time.

**Annoyances:** 4 of 30 were put off by how Pro shows up (Kwame, Mick, Carol, Ray). Their fixes are in §2: a static slot only on plus offers, a "Pro" tag instead of a padlock, a monthly cap and the "Don't show Pro tips" switch. Nobody said they'd uninstall. Ray would ignore Perks, which matches the perks note's sceptics. Free value lines were liked across the board (24 of 30 positive), including by people who'll never pay.

## 6. Partner pitch line

**"Give MileSprout Pro drivers a second visit a week, in your quiet hours, from a pool you set. You pay only when a code is used at your till."**

Supporting line for the deck: "Pro drivers are our heaviest-mileage drivers. They're on the road every day and already in your area. Your free offer brings them in; the Pro second visit is the repeat."

*(The "heaviest-mileage" claim is true by design of who buys Pro in the pricing panel, but confirm it with real Pro data before the deck goes out.)*

## Next steps

1. Founder decides on (d) and on the "included with Pro" wording.
2. Wait for `pro-perks-rules.md` on 3.1.3(e), 3.1.2(a), "free" and limited-stock wording, then update §2's copy.
3. Coding agent: second slot and code type "Pro plus" (needs the redemption server); value lines (free); Pro tally; "Don't show Pro tips" setting.
4. Ask the café pilot partner whether they'd fund a 2–5pm second drink for Pro, on on/off weeks.
5. Test the teasers with the founding testers before launch: dismiss rates, and whether free users feel left out.
