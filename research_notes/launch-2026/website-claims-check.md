# Website and app claims check

*Checked 3 October 2026 by the research agent. The claims come from `milemint/src/domain/regions.ts`, `milemint/src/components/launch-intro.tsx` (the "typical month" demo and the "left unclaimed" line) and the waitlist reward idea.*

**How it was checked:** gov.uk, irs.gov, canada.ca, ato.gov.au, gridwise.io and fwc.gov.au all refused direct page fetches from this environment (egress blocked). Each tax figure below was confirmed from the primary site's own text as returned by a web search restricted to that domain, and matched against the earlier notes in `research_notes/Gig driver mileage app sentiment/tax_requirements.md`. developer.apple.com pages were fetched directly. Confidence is marked on each line.

## Answers first

- **UK 55p: TRUE.** HMRC cars and vans go from 45p to 55p for the first 10,000 business miles, then 25p, retrospective from 6 April 2026 (announced 21 May 2026). It covers employee AMAPs and self-employed simplified mileage. Motorbike 24p and bicycle 20p are unchanged. The app is right and there is no bug.
- **US 72.5¢ then 76¢ from 1 July 2026: TRUE.** The IRS really did make a mid-year increase, published in IRB 2026-29 (13 July 2026). 2025 was 70¢ and 2024 was 67¢.
- **Canada 73¢ / 67¢ for 2026: TRUE** for the provinces; the territories are 77¢ / 71¢. 2025 was 72¢ / 66¢ and 2024 was 70¢ / 64¢. Remember this is the employer allowance limit, not a self-employed rate; the app already says so.
- **Australia: TRUE.** The rate is 91c a km from 1 July 2026 (an 89c base plus a one-off 2c uplift for 2026–27 only). It was 88c for 2024–25 and 2025–26, and 85c for 2023–24. The 5,000 km cap per car is unchanged.
- **"Typical month" of 400 miles / 650 km: defensible as a modest part-time example, but nothing shows it is "typical".** Full-time drivers do far more (roughly 1,000 to 2,400+ miles a month), while the average platform worker does far less (around 250 miles a month or under). Keep 400 / 650, but call it an example month, not a typical one (see §2).
- **"£2,640 a year left unclaimed": UNVERIFIED.** The arithmetic is right (4,800 mi × 55p), but I found no HMRC, IRS or survey data on how much self-employed drivers fail to claim. The "£800m unclaimed mileage relief" figure that circulates comes from a tax-refund firm (RIFT) and is about employees, not the self-employed. Reword it as what a year of driving is worth, not what goes unclaimed (see §3).
- **"Join the waitlist, get 3 months of Pro free": allowed, with conditions.** A free 3-month offer code is a standard App Store option. Codes can only be redeemed once the app is "Ready for Sale", and each code expires at most 6 months after it's created, so the promise needs a redemption window and plain terms (see §4).

## 1. Mileage rates in `regions.ts`

| Region | App value | Verdict | Source (checked 3 Oct 2026) | Confidence |
|---|---|---|---|---|
| GB cars/vans | 45p/25p from 2011-04-06; 55p/25p from 2026-04-06 | TRUE | [GOV.UK: Increasing mileage rates](https://www.gov.uk/government/publications/increase-to-approved-mileage-allowance-payments-amaps-and-self-employed-simplified-mileage-rates/increasing-mileage-rates): "increased from 45 pence per mile to 55 pence per mile… over 10,000 miles… remain at 25 pence… retrospective taking effect from 6 April 2026". It covers AMAPs and self-employed simplified mileage; the NIC RME disregard also goes to 55p. Also [ICAEW, May 2026](https://www.icaew.com/insights/tax-news/2026/may-2026/approved-mileage-rate-increased-for-first-time-in-15-years) and [Commons Library CBP-9742, 18 Aug 2026](https://commonslibrary.parliament.uk/research-briefings/cbp-9742/) | High |
| GB motorbike | 24p | TRUE (unchanged) | [GOV.UK: Travel — mileage and fuel rates](https://www.gov.uk/government/publications/rates-and-allowances-travel-mileage-and-fuel-allowances/travel-mileage-and-fuel-rates-and-allowances) (updated 21 May 2026) | High |
| GB bicycle | 20p | TRUE (unchanged) | same page | High |
| US | 67¢ (2024), 70¢ (2025), 72.5¢ (from 1 Jan 2026), 76¢ (from 1 Jul 2026) | TRUE | [IRS: rates updated for 2026](https://www.irs.gov/forms-pubs/the-standard-mileage-rates-and-maximum-automobile-fair-market-values-have-been-updated-for-2026): 76¢ for business on or after 1 Jul 2026, due to higher fuel prices; medical/moving 23.5¢; charity 14¢. [IRB 2026-29 (13 Jul 2026)](https://www.irs.gov/irb/2026-29_irb); [Notice 2026-10](https://www.irs.gov/pub/irs-drop/n-26-10.pdf) (72.5¢); [IRS standard mileage rates table](https://www.irs.gov/tax-professionals/standard-mileage-rates) | High |
| CA (provinces) | 70/64 (2024), 72/66 (2025), 73/67 (2026) ¢/km, first 5,000 km / after | TRUE | [Finance Canada, Jan 2026: 2026 automobile deduction limits](https://www.canada.ca/en/department-finance/news/2026/01/government-announces-the-2026-automobile-deduction-limits-and-expense-benefit-rates-for-businesses.html) (73¢/67¢; territories 77¢/71¢); [2025 release](https://www.canada.ca/en/department-finance/news/2024/12/government-announces-the-2025-automobile-deduction-limits-and-expense-benefit-rates-for-businesses.html) (72¢/66¢); [2024 release](https://www.canada.ca/en/department-finance/news/2023/12/government-of-canada-announces-2024-automobile-deduction-limits-and-expense-benefit-rates-for-businesses.html) (70¢/64¢) | High |
| AU | 85c (from 2023-07-01), 88c (from 2024-07-01, so 2024–25 and 2025–26), 91c (from 2026-07-01); cap 5,000 km per car | TRUE | [ATO: Cents per kilometre method](https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/work-related-deductions/cars-transport-and-travel/motor-vehicle-and-car-expenses/expenses-for-a-car-you-own-or-lease/cents-per-kilometre-method) (91c for 2026–27; 88c for 2024–25 and 2025–26; 85c for 2023–24; max 5,000 km per car). [Legislative instrument F2026L00785, made 23 Jun 2026](https://www.legislation.gov.au/F2026L00785/asmade/2026-06-23/text/original/pdf) (89c base + 2c one-off uplift for 2026–27). [ATO software developers: 2026 Determination](https://softwaredevelopers.ato.gov.au/CentsperKilometreDeductionRateforCarExpenses) | High |

Notes:
- The earlier note that 91c might be a "draft" (DriveLog) is resolved: the instrument was made on 23 Jun 2026 and the ATO page states 91c.
- **The 91c includes a one-off 2c uplift for 2026–27 only.** When the 2027–28 rate comes out, it will be indexed from the 89c base, so it may come out below 91c. Don't assume the rate only goes up, and add a reminder to check in June 2027.
- The UK NIC side is now legislated through the Taxation (Energy and Vehicles) Bill ([Commons Library CBP-10913](https://commonslibrary.parliament.uk/research-briefings/cbp-10913/)). The app only deals with income tax figures, so this doesn't affect it.
- The code comments in `regions.ts` say "checked Sep 2026". That is still accurate as of 3 Oct 2026.

## 2. Is "400 miles (650 km) a month" a fair typical month?

**What the data says** (no source publishes "miles per month" for the average gig driver directly; the ones marked *derived* are my arithmetic on published figures, not published numbers):

| Source | Figure | Miles a month | Notes |
|---|---|---|---|
| [Gridwise, How much do Uber drivers make in 2026](https://gridwise.io/blog/how-much-do-uber-drivers-make) (2026 Annual Gig Mobility Report, 2025 data, US) | Average Uber driver: 21.2 active hrs/wk, $522/wk gross, $0.94 per work mile | *derived* ≈ 555 mi/wk ≈ **2,400 mi/month** | Gridwise users skew towards committed drivers. Idle miles were 30% of total |
| [Gridwise, Uber Eats vs DoorDash pay 2026](https://gridwise.io/blog/uber-eats-vs-doordash-pay-how-much-are-drivers-earning) (US) | DoorDash: $247/wk, 18.8 hrs, $0.94/mi. Uber Eats: $198/wk, 11.5 hrs, $1.27/mi | *derived* DoorDash ≈ 263 mi/wk ≈ **1,140/month**; Uber Eats ≈ 156 mi/wk ≈ **675/month** | Same caveat. Roughly 14 work miles per hour for DoorDash |
| [DoorDash, "Behind the Dash"](https://about.doordash.com/en-us/news/insights-into-the-flexibility-and-freedom-of-dashing) (2023, US) | The average Dasher delivers **under 4 hrs/wk**; 90% under 10 hrs | *derived* at ~14 mi/hr: **≈ 240 mi/month** or less | Platform-wide average, so it includes very casual Dashers |
| [Uber written evidence WOW0096, UK Parliament](https://committees.parliament.uk/writtenevidence/76431/pdf/) (UK, c. 2017) | Median about 30 hrs/wk logged in; 23% ≤10 hrs, 25% ≥40 hrs | none published | Old, and hours logged in rather than miles. Full-time London private hire is far above 400 mi/month |
| [QUT, Digital Platform Work in Australia (2019)](https://eprints.qut.edu.au/203119/19/Report_of_Survey_Findings_2020_002_doi.pdf) | Average **10.0 hrs/wk** on the main platform, across all platform types; 47% under 5 hrs | none published | About half did food or goods delivery and 30% transport |
| [Statistics Canada, Daily 10 Jan 2025](https://www150.statcan.gc.ca/n1/daily-quotidien/250110/cg-a005-eng.htm) / [measuring the gig economy (2024)](https://www150.statcan.gc.ca/n1/pub/75-004-m/75-004-m2024001-eng.htm) | 262,600 people did delivery and 151,200 personal transport in 2024. Lower-engagement gig workers: 55% work under 15 hrs/wk | none published | No mileage data |
| UK multi-drop couriers | "100–140 miles a day" full time | ≈ 2,000–3,000/month | Secondary trade blogs only (e.g. [eLogii](https://elogii.com/blog/how-much-to-charge-per-mile-for-delivery)); low confidence |

**Verdict.** 400 mi a month is about 93 miles a week, or roughly 6–7 hours of delivery driving a week at Gridwise's DoorDash ratio. That is:
- **conservative** for anyone who drives most days (full-time couriers and rideshare drivers do 3–6×);
- **above** the platform-wide average, because most people signed up to the apps barely drive (DoorDash: under 4 hrs/wk).

**Recommendation.** Keep **400 miles / 650 km**. It's a fair, cautious example for a part-time driver, and lowering it would undersell the product for the drivers who are our real market. But:
- Call it an **example**, not "typical". Change "a typical month of work driving" to **"an example month: 400 miles of part-time work driving (about 100 a week)"**. No source supports "typical", and the ASA/CAP Code, FTC and ACCC all expect claims like that to be backed by evidence.
- If you want a source next to it: "Full-time gig drivers often do 1,000+ miles a month (Gridwise 2026 data)". Present that as Gridwise's figure, and say ours is the smaller, cautious example.
- 650 km is 404 miles, which is fine.

## 3. "£2,640 a year left unclaimed"

- **Arithmetic: correct.** 12 × 400 mi = 4,800 mi × 55p = £2,640. That's below the 10,000-mile threshold, so the 25p rate doesn't come in. At today's rates, `typicalYearOf` gives: US 4,800 × 76¢ = **$3,648**; CA 7,800 km → 5,000 × 73¢ + 2,800 × 67¢ = **$5,526**; AU 7,800 km capped at 5,000 × 91c = **$4,550**.
- **"Unclaimed": UNVERIFIED.** I searched for HMRC, IRS, CRA and ATO statistics and for survey data on how much self-employed drivers leave unclaimed in mileage, or what share keep no log. I found nothing from a primary source:
  - "Over £800 million in mileage tax relief goes unclaimed each year" comes from RIFT Refunds ([riftrefunds.co.uk](https://www.riftrefunds.co.uk/blogs/hmrc-mileage-refund-explained/)), a commercial claims firm, with no published method. It concerns **employees'** Mileage Allowance Relief, not self-employed drivers. Don't use it.
  - The "most freelancers don't track mileage" lines (e.g. [KDA Inc.](https://kdainc.com/mileage-for-self-employment-taxes-the-7000-deduction-most-freelancers-miss/)) are marketing assertions with no data behind them.
  - A driver who doesn't keep a log can still claim an estimate. It just may not stand up if HMRC asks for records. So "unclaimed if your drives aren't logged" overstates the case: they are *at risk* rather than necessarily unclaimed.
- **Honest wording** (this also fits the "example" change in §2):
  - UK: **"An example year of part-time work driving (4,800 miles) is worth £2,640 at HMRC's 55p rate. Log every drive so you can back up your claim."**
  - Generic, for the in-app string at `launch-intro.tsx:480`: **"A year of this is worth {{amount}} at the {{authority}} rate."** Optionally add a second line: "Keep a log so you can back it up."
  - Canada needs its own caveat, because 73¢/67¢ is the employer allowance rate. Use "worth about {{amount}} at CRA's allowance rate", or leave Canada out of the money line.

## 4. Waitlist reward: "3 months of Pro free"

**App Store** ([Set up offer codes](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-subscription-offer-codes/), [Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/), [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), fetched 3 Oct 2026):
- A **free offer code** for 3 months is a standard option (free durations: 3 days, 1 week, 2 weeks, 1 month, 2, 3 or 6 months, or 1 year). You can choose whether it renews at full price or ends without renewing.
- Codes **only work once the app is "Ready for Sale"**. Each code **expires at most 6 months after it's created**. Each Apple Account can redeem an offer once. The limit is 1m redemptions per app per quarter. Eligibility can be limited to new subscribers.
- Codes may be sent by email and other marketing channels (Apple explicitly allows this).
- Guideline 3.1.2: before a free period starts, the app must make clear how long it lasts, what stops when it ends and what it will cost afterwards. Bait-and-switch gets an app removed.
- An offer code is separate from the introductory free month. A new subscriber who redeems the code uses it instead of the trial, as `offer-code-setup.md` already explains.

**Consumer law (short):**
- **UK:** Under the CAP Code, a "free" claim must really be free, and a promotion must state its significant conditions and closing date (who qualifies, when the code arrives, how long it can be redeemed, renewal price). The DMCC Act subscription rules, including reminders before a free period turns into a paid one, are now expected in **spring 2027** ([Taylor Wessing, Apr 2026](https://www.taylorwessing.com/en/insights-and-events/insights/2026/04/subscription-contracts)), but it's sensible to follow them now.
- **US:** The FTC's "click to cancel" rule was vacated in July 2025 and is being rewritten. ROSCA and FTC Act s5 still apply: state the renewal terms clearly and get consent ([Gibson Dunn](https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/)). The FTC Guide on "free" (16 CFR 251) also applies.
- **Canada:** The Competition Act bans misleading representations, so the terms must be stated as above.
- **Australia:** Under the ACL, it's illegal to offer a gift or prize without intending to provide it as offered. The ACCC lists subscription traps as a 2026–27 priority, and the unfair trading practices ban starts on **1 July 2027**.
- **What this means for us:**
  - Only promise what you can definitely deliver. "3 months of Pro free" is fine if every waitlist sign-up actually gets a code once the app is live.
  - Say: "Code sent by email at launch; redeem within [X] weeks; renews at the normal price unless you cancel (or: doesn't renew)."
  - Set "doesn't renew" in App Store Connect if you want no billing risk at all.
  - Same issue elsewhere: `website/testers.html` promises **12 months** of Pro free. A 1-year free offer code is allowed, but the 6-month code expiry and "Ready for Sale" rules apply in the same way.

## Changes needed

No figure in `regions.ts` is wrong. The only change is to wording:
1. `milemint/src/components/launch-intro.tsx` lines 333/337 and 465/466: "a typical month of work driving" → "an example month of part-time work driving". Also update the comment at line 96 and the strings in the i18n catalogue.
2. `milemint/src/components/launch-intro.tsx:480`: "That's {{amount}} a year left unclaimed if your drives aren't logged." → "A year of this is worth {{amount}} at the {{authority}} rate." Update the comments at lines 104 and 474, and add the CRA allowance caveat for Canada.
3. Any website copy with "£2,640 … unclaimed" (I didn't find it in `website/` or `site/` at the time of checking) → "worth £2,640 at HMRC's 55p rate".
4. Waitlist reward copy: add the redemption window, the renewal terms and "after launch".
