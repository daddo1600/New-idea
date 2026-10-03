> **Superseded in part (3 Oct 2026):** Pro now gets a partner-funded "plus" on top of every free offer. See `decisions.md`.

# Perks simulation: what drivers use and what partners will pay for

*Simulated study, October 2026. There are two parts:*
- *a seeded simulation of 1,000 drivers over three months (`perks-sim/sim.py`, standard-library Python, CSVs saved alongside it);*
- *a hand-written panel of 48 drivers and 10 partners, used for reasons and quotes.*

*The partner list and mechanics come from `rewards-partners.md`, the partner research folder and `milemint/src/perks/`.*

**Every number in this note comes from assumed inputs, not real data.** The simulation is useful for comparing options, such as a 30- versus 60-minute window, caps, ladders and holdouts, and for showing which assumptions matter most. It is not a forecast.

## 1. Top answers

- **Coffee is the habit; tax help is the money.** Coffee, loo plus coffee, fuel and meal deals make up about 90% of redemptions: 157 of 174 per 100 active drivers a month. But in the January–March tax window, tax help alone earns the most: about £38 of £140 per 100 drivers a month, from only 1.3 redemptions.
- **What counts depends on the job more than the country.** Loo plus coffee and meal deals matter to food couriers. Fuel matters to car and van drivers (50 per 100 for ride-hail). Parking is the top non-food perk for care workers (19). Car washes matter only to ride-hail (12). Gym, phone plans and insurance are ignored (under 1 per 100). Offers must be filtered by vehicle and work type on the phone.
- **Showing the offer at the right moment matters most.** Removing the "parked near a partner" card cuts redemptions by 38%. A 60-minute window adds 6% and halves expiries (16% to 8% of claims). A 15-minute window costs 10%. Park to claim costs about 5% of redemptions: keep it, but fix false "driving" for cyclists and add an "I'm a passenger" option. A cap of 2 a week adds 23% more redemptions, but more of the extra ones are visits that would have happened anyway. Start at 1 a week.
- **Perks should appear in four quiet moments only:** parked between jobs, end of shift, the weekly recap and tax time. Notifications are opt-in, at most one a week, and scheduled on the phone. Show "Saved £X with Perks" under the mileage value. Free and Pro get the same perks. The Founding badge gets an early look at new partners, not better deals.
- **Partners can be shown net-new and repeat visits without identities.**
  - About 60% of in-store redemptions come from people who weren't already customers. That rises to about 69% with a new-customer-only first offer, which also raises incremental visits per 100 redemptions from 96 to 107 but cuts redemptions by 20%.
  - A 3rd-visit ladder lifts 30-day repeat from 69% to 75%, but repeat *without a code* stays at about 30%. Ladders buy repeat visits; they don't build habits.
  - A 10% driver holdout is far too noisy (the coffee estimate ranged from 34 to 60 against a true 51). Use on/off weeks by store instead.
- **Partner coverage is the biggest unknown, and it isn't there at launch.** Halving coverage halves redemptions (174 to 92). The modelled £1.40 per driver a month assumes a partner near most drivers. At launch, launch with tax help, MOT/servicing, kit and EV/energy online (Taxfix UK, Pie Tax, BookMyGarage, Kwik Fit, Quad Lock, Nextbase, Octopus), plus one local café pilot for loo plus coffee.

## 2. How the numbers were made (assumptions)

The simulation has 1,000 drivers, five random seeds and 13 weeks from January to March, with 10% of drivers held out with no offers. Ranges in the tables are the lowest and highest across the five seeds.

| Input | Assumed value |
|---|---|
| Country | UK 35%, US 30%, Australia 18%, Canada 17% |
| Work type (vehicle) | Food by car 20%, moped 9%, e-bike 12%, bicycle 5%; parcels by van 16%; ride-hail by car 18%; care by car 10%; trades by van 10% |
| Shift pattern | Food: 60% lunch/dinner peaks, 15% nights, 25% mixed. Parcels: 70% early. Ride-hail: 30% nights. Care and trades: mostly daytime |
| Hours | 5–35% part-time (6–16 hours), depending on job; otherwise 20–60 hours, centred on 40 |
| Other traits | Income: low 35%, mid 45%, high 20%. Urban: 55–90% by job. EV: 7–14% of cars by country. Pro: 6–18% by attitude |
| Diet and coffee | 72% no restriction, 10% vegetarian, 4% vegan, 9% halal. Coffee habit: 25% none, 45% some, 30% heavy |
| Coupon attitude | 20% enthusiast, 45% neutral, 20% sceptic, 15% never redeem. Chance of acting on an offer: 1.0, 0.65, 0.2 and 0.03 respectively |
| Utility per category | Base weight by work type (for example, bicycles 0 for fuel and car wash; ride-hail 0.7 for car wash and 0.8 for fuel; care 0.65 for parking), then modifiers: country (UK loo ×1.3, US fuel ×1.3, Canada tyres ×1.4, Australia parking ×1.2), shift (nights loo ×1.3), income (low ×1.15), coffee habit (none ×0.4, heavy ×1.4) and diet (meal deals: vegan ×0.5, halal ×0.6). Then log-normal noise (σ 0.35), capped at 1 |
| Opportunity | Per shift, a chance of being parked near a partner, by job and category (for example, food courier coffee 0.5, care parking 0.6). Partner coverage (urban/rural): coffee 85%/50%, fuel 60%/40%, loo 70%/35%, parking 30%/10% |
| Seeing the offer | Weekly tab-open chance of 0.75/0.40/0.15/0.05 by attitude (+0.08 for Pro), decaying to 60% of that over about 4 weeks. A contextual card is seen in 30% of moments |
| Mechanics | Expiry chance = how busy the shift is (0.45–0.8) × 0.25 × 30 ÷ window minutes; 30% claim again after an expiry. Park to claim: 10–25% of claims tried while "moving" (cyclists highest); half retry when parked. Cap per partner per week |
| Online offers | Monthly chance of need (kit 6–25%, tyres/servicing 8–10%, insurance and phone 3%); tax help once a year, only in each country's tax season |
| Partner side | Chance a driver is already a customer: coffee 40%, fuel 45%, loo café 20%, meal 30%, tax 15%. Existing customers visit weekly anyway (coffee 45%) and are 1.5× likelier to claim. Net-new customers who redeem return without a code 6–15% a week |
| Income per redemption (£) | Coffee/meal 0.40, loo 0.45, fuel 0.75, car wash 1.25, kit 3, tyres 6, tax 30, insurance/phone 10 |

The three least certain inputs (tab-open rate, partner coverage and prior-customer share) were each run at half and one and a half times their values. See `sensitivity.csv`.

## 3. Driver results

### Ranked categories: redemptions per 100 active drivers a month (simulated)

| Rank | Category | All (seed range) | UK | US | CA | AU | £ per 100 a month |
|---|---|---|---|---|---|---|---|
| 1 | Coffee, food and snacks | 56 (55–57) | 58 | 50 | 59 | 59 | 22 |
| 2 | Loo + coffee | 43 (40–46) | 50 | 39 | 37 | 41 | 19 |
| 3 | Fuel or EV charging | 32 (29–35) | 26 | 35 | 36 | 35 | 24 |
| 4 | Meal deals near hotspots | 26 (24–28) | 27 | 25 | 28 | 24 | 10 |
| 5 | Parking | 8.6 (6–10) | 9 | 8 | 9 | 9 | 4 |
| 6 | Car wash | 3.6 (3.3–4.0) | 3 | 4 | 3 | 4.5 | 5 |
| 7 | Accounting/tax help | 1.3 (1.0–1.4) | 1.6 | 1.6 | 1.4 | 0* | **38** |
| 8 | Tyres, servicing, MOT | 1.2 (0.8–1.5) | 1.3 | 1.2 | 1.3 | 0.8 | 7 |
| 9 | Mounts, chargers, bike gear | 1.1 (0.9–1.3) | 0.9 | 1.0 | 1.7 | 1.1 | 3 |
| 10 | Gym or physio | 0.5 | 0.5 | 0.5 | 0.7 | 0.5 | 1 |
| 11 | Insurance and breakdown | 0.2 | 0.2 | 0.4 | 0.1 | 0.2 | 2 |
| 12 | Phone plans | 0.2 | 0.3 | 0.2 | 0.2 | 0.2 | 2 |

\*Australia's tax season (July–October) falls outside the January–March window. Canada's winter-tyre swaps (October/November and April) also fall outside it, which is why the 48-driver panel valued tyres more highly than the simulation shows.

**By work type** (`categories_by_worktype.csv`):
- Food couriers redeem 56–78 coffee, 59–68 loo and 47–51 meal deals per 100.
- Ride-hail leads on fuel (50) and car wash (12).
- Care workers lead on parking (19).
- Trades lead on tax help (2.5).
- E-bike and bicycle riders lead on kit (4).

**Reach.** 58% of active drivers redeem at least once a month (seed range 57–60). By attitude: enthusiasts 86%, neutral 73%, sceptics 38%, never-redeemers 8%.

### Killer, nice to have, ignored

- **Killer:** loo plus coffee (food couriers, UK), fuel (car and van drivers, US/CA/AU), and tax help in tax season (by income, not volume).
- **Nice to have:** meal deals (food couriers only, and only with vegetarian and halal options), parking (care, trades), car washes (ride-hail), MOT/servicing/tyres, and kit for riders.
- **Ignored:** gym, phone plans, insurance and breakdown cover.

### Qualitative panel: 48 drivers

The panel supplies the reasons behind the numbers. Twelve representative drivers are shown; all 48, with their rankings and quotes, are in `perks-sim/panel_48.csv`. Key: Cof = coffee/food/snacks; Fuel = fuel or EV charging; Wash = car wash; Loo = toilets/rest stops; Gear = mounts/chargers/bike gear; Tyre = tyres/servicing/MOT; Ins = insurance/breakdown; Tax = accounting/tax help; Gym = gym/physio; Park = parking; Meal = meal deals.

| # | Driver | Work and pattern | Top 3 | Quote |
|---|---|---|---|---|
| U1 | Priya, London | Deliveroo, car, peaks | Loo, Cof, Fuel | "A free loo in Zone 1 is worth more than the coffee." |
| U2 | Kwame, Manchester | Uber Eats, e-bike, low income | Gear, Meal, Loo | "I need brake pads every month. Do that and I'm in." |
| U4 | Sarah, Leeds | Care worker, split shifts | Park, Cof, Loo | "Parking fines eat my mileage allowance." |
| U8 | Mick, Glasgow | Evri van, **sceptic** | Fuel | "Coupon apps want your email. If this doesn't, maybe." |
| U11 | Jo, Norwich | Weekend DPD, **never redeems** | — | "Show me a total and I might." |
| S1 | Marcus, Atlanta | DoorDash, car | Fuel, Meal, Cof | "Gas is the only perk that moves my number." |
| S3 | Carlos, LA | Uber/Lyft, nights | Wash, Fuel, Loo | "At 2am I need a bathroom without buying gum." |
| S7 | Kim, New York | Grubhub, e-bike | Gear, Loo, Meal | "Battery repair is my gas." |
| S8 | Ray, Chicago | Uber, **sceptic** | — | "Every deal app ends up selling my data." |
| C1 | Arjun, Toronto | Uber | Tyre, Wash, Fuel | "Winter tyre swaps twice a year: that's the big one." |
| C10 | Fatima, Mississauga | DoorDash lunches, halal | Meal, Cof, Loo | "A halal meal deal by the plaza, I'd go weekly." |
| A3 | Liam, Brisbane | Menulog, e-bike | Loo, Gear, Cof | "A cold drink and a toilet at 3pm in January." |

Six of the 10 sceptics and never-redeemers said a running "saved so far" total or a fuel perk might win them over. The simulation agrees that this group barely moves: 8–38% redeem in a month.

## 4. Mechanics feedback

Simulated effects, as means over five seeds (`mechanics.csv`):

| Variant | Redemptions per 100 a month | % redeeming monthly | In-store net-new % | Incremental visits per 100 redemptions | £ per 100 a month |
|---|---|---|---|---|---|
| Baseline: 30 min, cap 1/week, park to claim, cards on | 174 | 58 | 60 | 96 | 140 |
| 60-minute window | 184 | 60 | 60 | 97 | 150 |
| 15-minute window | 157 | 56 | 60 | 100 | 135 |
| Cap 2/week | 214 | 58 | 59 | 98 | 160 |
| Loyalty ladder (3rd-visit bonus) | 188 | 60 | 60 | 97 | 148 |
| New-customer-only first offer | 139 | 54 | 69 | 107 | 132 |
| Ladder + new-customer-only | 150 | 56 | 68 | 107 | 129 |
| Park to claim off | 183 | 60 | 61 | 97 | 147 |
| Contextual cards off (tab only) | 108 | 42 | 61 | 103 | 104 |

**The 30-minute window.** 16% of claims expire at 30 minutes, 8% at 60 and 32% at 15. Expiries cluster in the lunch and dinner peaks, when a new order arrives after the driver has claimed. In the panel, 39 of 48 drivers would use an in-store perk mid-shift *if* they claim at the counter. Recommendations:
- label the button "Claim at the till";
- show a countdown;
- add "Give it back";
- let partners choose 30–60 minutes, with 60 for fuel and car washes;
- make the code work offline (it's made on the phone).

**Park to claim.** It blocks about 14% of claims and loses about 7%, because half of those drivers retry once parked. Overall it costs about 5% of redemptions. 36 of 48 panel drivers liked it as a safety signal. Fixes:
- treat 30 seconds stationary as parked, so cyclists at lights aren't read as driving;
- add "I'm a passenger";
- allow browsing while moving, but claiming only when parked.

**Caps.** 2 a week adds 23% more redemptions. The model also understates the cannibalisation this adds, because it caps "would have visited anyway" at one visit a week. Panel views on fairness:
- coffee: 1 a day, or 1 per peak;
- fuel: 1 a week;
- car wash: 1 a week or fortnight;
- kit and servicing: 1 a month;
- tax help: 1 a year.

Start partners at 1 a week and let each raise it.

**Trust, weekly opens and uninstalls.**
- Trust comes from having no account, an "Ad" label and a plain "How MileSprout earns" line.
- The biggest trust breaker is a code refused at the till.
- Drivers would open the tab weekly for new local offers on Mondays, a "saved so far" total and offers that match their vehicle.
- Drivers would uninstall or ignore Perks over offer push notifications, irrelevant offers (car washes for cyclists), sign-up forms, or any link to Pro.

## 5. In-app placement plan

| Moment | What appears | Rule |
|---|---|---|
| Parked between jobs | One card: "Near you: free loo + coffee" | On shift, stationary 5+ minutes, at most once per shift; matches the vehicle |
| End of shift | One line in the shift summary | Only if a relevant offer is nearby |
| Weekly recap | "Mileage worth £142 · Saved £6.40 with Perks" | Mileage figure larger; hidden at £0 |
| Tax time | Tax-help card | UK December–January; US/Canada February–April; Australia July–October |
| Mileage milestones | Service/MOT/tyre card | For example every 5,000 miles; never for bicycles |

Perks never appears in the trip log, reports, export or Pro screens. The simulation shows these cards drive over a third of redemptions, so they should be well judged, not frequent.

**Notifications.**
- Off by default. Opt-in is offered once, inside the Perks tab.
- At most one a week, plus at most one tax-time reminder a year.
- Never while driving or in quiet hours.
- Scheduled as local notifications on the phone, so no server learns where anyone is.

**Savings line.** Count only codes actually used. The phone can ask the server whether its own code was used, by the code alone.

**Free versus Pro.** Perks is identical for free and Pro users and never unlocks, discounts or trials Pro (guidelines 3.1.1 and 3.1.4). The story is "Free tracks your miles. Pro sorts your money. Perks saves you a bit along the way." Don't say "Perks pays for Pro".

**Founding badge and invites.** Neither should give better discounts. Partners pay the same per redemption, tiered deals for inviting people look like paid marketing, and other drivers would feel second-class. Founding drivers get a 48-hour early look at new partners and a vote on which local partners to approach next.

## 6. Partner panel

| Partner | Needs to see before paying | Fears | Price per redemption | Verdict |
|---|---|---|---|---|
| National coffee chain | Net-new share; a simple till check | Cannibalising regulars; already funds a Deliveroo rider perk | £0.30–£0.40 | Later, at 10,000+ users |
| Independent café near a hotspot | More visits from 2 to 5pm | Riders hogging tables; abuse | £0.50, off-peak only | **Pilot now** |
| Fuel/forecourt chain | Litres sold up at test sites | Thin margin; its own loyalty app | 1p a litre, or £0.75 a fill | Conditional on a site test |
| Car wash chain | Weekday fill-in | Discounting full-price Saturdays | £1–£1.50 | Pilot, weekdays only |
| Tyre/servicing chain | Completed bookings via its network | Low-value bookings | 3–6% or £5–£10 a booking | **Yes, via Impact/Awin** |
| Breakdown/insurance brand | A regulated route | Financial promotion rules | £10–£20 | Phase 2 |
| Accounting software firm | Paid sign-ups at tax time | Free-trial churn | £25–£50 per paying customer | **Yes, strongest fit** |
| Bike/e-bike shop | Repeat service visits | Riders expecting cheap parts forever | £2 a visit + 5% of parts | Pilot with one shop |
| Gym chain | Memberships | Day-pass abuse; low uptake | £10 per membership | No for now |
| Regional fast-food franchisee | 3–5pm orders | Staff confusion; franchisor rules | £0.40 | Conditional |

**Verdicts.** The online partners (accounting, tyres and servicing) say yes now, because their affiliate networks already confirm new paying customers. Local businesses with quiet hours will pilot off-peak offers. The chains want scale. Insurance waits for the regulated route. The gym doesn't fit; the simulation agrees, at 0.5 redemptions per 100.

Every partner raised abuse. Per-person limits live only on the phone (`perk_claims` in `claims.ts`), so a reinstall resets them. The redemption server that checks a code is used once, runs the weekly pool and bills the partner isn't built yet (`code.ts` has a placeholder address).

**Simulated partner outcomes** (`partner_side.csv`, plain offer):

| Category | Net-new % | Cannibalised % | 30-day repeat (any / without a code) | Repeat with ladder (any / without a code) | Net-new %, new-customer-only offer |
|---|---|---|---|---|---|
| Coffee | 54 | 26 | 72 / 30 | 80 / 33 | 62 |
| Fuel | 49 | 31 | 78 / 42 | 83 / 42 | 59 |
| Loo + coffee | 75 | 14 | 71 / 26 | 78 / 27 | 81 |
| Meal deals | 59 | 16 | 65 / 26 | 69 / 26 | 69 |
| Parking | 62 | 15 | 57 / 22 | 63 / 24 | 70 |
| Car wash | 74 | 6 | 48 / 23 | 46 / 15 | 85 |
| Online (tax, tyres, kit) | 80–89 | n/a | n/a | n/a | n/a |

Car wash and gym repeat figures rest on small numbers and swing between seeds. Under the sensitivity runs, in-store net-new ranges from 43% to 78% and cannibalisation from 15% to 26%, depending on the assumed prior-customer share.

## 7. Net-new and repeat playbook

The redemption server sees only the code, partner, code type (first visit / repeat / stamp), store and the hour it was used. Codes are random. Every report figure covers at least 10 redemptions.

| Mechanic | How it's measured without tracking people | Simulated effect | App Review |
|---|---|---|---|
| First-visit offer (phone remembers "visited before") | Count of first-visit codes against all codes | Net-new 60% → 69%; −20% redemptions | Fine |
| New-customer check at the till | Partner's own records; networks confirm new customers online | Staff refuse 70% of existing customers (assumed) | Fine |
| New versus returning values | Code type marks it; returning ÷ first = repeat rate | Returning-value uptake −30% (assumed) | Fine |
| Stamp card on the phone (3rd-visit bonus) | Stamp codes per first-visit code | Repeat 69% → 75%; without a code, no change | Fine |
| Aggregate reports | Server totals, minimum of 10 per figure, no device ID | — | May query the privacy label: declare usage data "not linked to you" |
| Abuse control | Server-side weekly pool, plus Apple DeviceCheck (2 bits per device, held by Apple) | — | May ask why; answer "fraud prevention" |
| On/off weeks by store | Partner compares till counts for on and off cells | A 10% driver holdout is too noisy (coffee 34–60 against a true 51; parking −10 to +8) | Fine; needs no driver data |
| Off-peak offers | Partner's hourly till counts against its usual pattern | Not modelled | Fine |
| Area offers near hotspots | Whole list downloaded; filtered by distance on the phone | Coverage is the biggest driver (×0.5 → 92; ×1.5 → 232) | **Likely query:** state that perks are filtered on the phone; no background location just for Perks |

Online partners already get new-customer confirmation through Awin, Impact and Partnerize. Links must carry only the network's click ID: no user identifier and no third-party SDK.

## 8. Recommended launch set

| # | Perk type | Pilot partners (from the research list unless noted) | Offer structure |
|---|---|---|---|
| 1 | Tax help | Taxfix UK (£25 to MileSprout, 10% off for the user), Pie Tax (£50 + £50), GoSimpleTax. Later: FreeTaxUSA, Wealthsimple Tax, Xero AU | Online, 30-day code, 1 a year; tax-time card plus the mileage report |
| 2 | MOT, servicing and tyres | BookMyGarage (£3 an MOT, £10 a service), Kwik Fit | Online, 30-day code, 1 a month; milestone and MOT-month cards |
| 3 | Mounts and dashcams | Quad Lock (10% off, 5% to MileSprout), Nextbase (8%) | Online, 14-day code, 1 a month, matched to vehicle |
| 4 | EV and energy | Octopus Energy (£50 + £50 credit); later van fuel cards (Radius, The Fuel Store) and Upside in the US | Online, 30-day code; EV and van drivers only |
| 5 | Loo + coffee, local | **New:** one independent café near a delivery hotspot (find it on foot); later Caffè Nero, a proven Deliveroo-perk buyer | In store; 30–60-minute window; 1 a week to start; first visit free filter coffee + toilet; returning 20% off; 3rd-visit stamp; extra value 2–5pm; pool of 100 a week; £0.50 per redemption; on/off weeks to measure |

The sixth slot, when there's capacity, is Zoomo or a local e-bike shop. Leave insurance, breakdown cover and credit for phase 2.

Before launch:
- build the redemption server;
- extend the demo's 24-hour online codes to the planned 7–30 days;
- give café staff a one-page "how to check a code" card.

## 9. Caveats

- **This is a simulation.** The drivers, partners, quotes, distributions and prices are assumptions, and the payout figures come from unverified desk research. Use the results to compare options and find the inputs that matter, not as forecasts.
- **Coverage drives everything.** The modelled reach (58% a month) and income (about £1.40 per driver a month) assume a partner near most drivers. At launch there will be one café, so expect income to be mostly online affiliate fees, in line with the earlier estimate of about $0.12 per user.
- **Seasonality is partly missed.** The January–March window includes the UK and US/Canada tax seasons but not Australia's, nor Canada's tyre swaps.
- **Simplifications.** Baseline visits are capped at one a week, so cannibalisation is understated for frequent visitors and at 2-a-week caps. There is no weekly pool limit and one partner per category. Drivers don't talk to each other.
- **Next steps.** Validate the ranking and the mechanics with the founding testers: a short survey, plus a week with demo perks. Then run one café pilot and one bike-shop pilot with on/off weeks before approaching chains.
- This is not legal advice. Check App Store privacy labels and each country's advertising disclosure rules before launch.
