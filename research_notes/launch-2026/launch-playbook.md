# MileMint launch playbook (evidence-based, small budget)

*Researched 1 Oct 2026. Limits: my web-search budget ran out partway through, and the proxy blocked most third-party sites (RevenueCat, Adapty, AppTweak, SplitMetrics, Mobile Action, AppFollow, itunes.apple.com). I could open apple.com and apps.apple.com pages directly. Everything else comes from search-result summaries of those reports. Items marked **(unverified)** are industry claims or my own judgement that I couldn't check against a primary source.*

---

## 0. Five findings that change the existing plan (12-launch-plan.md / 14-launch-campaign.md)

1. **The 31 January 2027 deadline is for the 2025–26 tax year, which ended on 5 April 2026.** A new user can't use MileMint to produce last year's figures. The same applies to Australia's 31 Oct 2026 deadline (2025–26 year), the US Jan–Apr 2027 season (calendar 2026) and Canada's 2027 deadlines (calendar 2026).
   - **What follows:** the deadline is the *pain moment*, but what you're selling is "never do this again next year". Messaging needs to say "Start your 2026–27 log now. You're already 6 months in." Manual and back-filled trips plus the planned CSV import become important.
   - Trial users who need a PDF for a return MileMint has no data for won't pay for that reason.
2. **There is a direct UK gig competitor at a lower price: MileClear.**
   - Subtitle "HMRC Tax & Gig Driver Expenses", 4.9★ from 55 ratings, version 1.3.11, £4.99/mo or £44.99/yr.
   - It names Uber, Deliveroo, Just Eat, Amazon Flex, Stuart, DPD and Evri in its listing, and offers **automatic trip detection with "no monthly caps" for free**.
   - DriveLog gives **50 free trips a month** at £4.99/£44.99. TripLog gives **unlimited automatic detection free**.
   - MileMint's 40 drives a month is the least generous free tier among the cheap UK apps, and couriers use up 40 drives in 2–3 shifts. The "a shift counts as one drive" fix in the plan is essential, not optional.
3. **New UK hook: Making Tax Digital (MTD) for Income Tax.**
   - It started on 6 Apr 2026 for sole traders and landlords with gross income over £50k.
   - Quarterly updates are cumulative. The next one is due **7 Nov 2026** (covering 6 Apr–5 Oct), then 7 Feb, 7 May and 7 Aug.
   - The threshold reportedly drops to £30k from April 2027 **(unverified this session)**. That would bring many full-time couriers and trades into MTD and make **6 April 2027** your second big UK moment.
4. **Your CAC targets are based on gross prices.**
   - £49.99/yr ÷ 1.2 VAT × 0.85 (Small Business Program commission) ≈ **£35.40 net**.
   - £5.99/mo ≈ **£4.24 net per month**.
   - The plan's "cost per paying user < £18 (3 months of Pro)" is really about **£12.70 net**. Set the paid-acquisition ceiling at about £12–15 per payer, or about £30 if most payers choose annual.
5. **Apple says competitor names in metadata are "grounds for rejection"** (Apple's search page, and guideline 2.3.7 "popular app names"). The current listing complies. Unauthorised trademarks (Uber, Deliveroo, DoorDash) are also listed as grounds for rejection in the **keyword field**, so keep platform names out of keywords and screenshots. Names in the description text are a grey area; MileClear uses them, but don't copy that.

---

## 1. App Store Optimisation

### How App Store search ranks (what Apple itself says)
- **Text relevance:** title, subtitle, keyword field and primary category. **User behaviour:** downloads, ratings and reviews, engagement. Apple now also shows **LLM-generated "app tags"** built from your metadata in search. (Apple, App Store search page)
- **Keyword field rules (Apple):**
  - 100 characters, commas with no spaces.
  - No plurals of words you already have (they count as duplicates).
  - No "app", no filler words.
  - Don't repeat words already in the name, subtitle or category.
  - Competitor names, unauthorised trademarks and irrelevant terms are grounds for rejection.
- **Weights (industry consensus, unverified):** title > subtitle ≈ keyword field. The description is **not indexed** on iOS. Apple combines words across title, subtitle and keywords into phrases, so "mileage" (title) + "log" (subtitle) can rank you for "mileage log".
- **Reported for 2025 (unverified):** Apple may OCR screenshot captions as a ranking signal, so put "HMRC mileage log" style captions on the first three screenshots.
- **Behaviour signals (unverified, but widely reported):** recent download velocity matters more than total downloads, and conversion rate on the search results page and product page feeds relevance. Apps above 4.5★ convert and hold rank better. Ratings count per country, so each storefront starts at zero.
- **Cross-localisation (sources conflict, check with a tool):**
  - Several ASO sources say the **UK storefront indexes en-GB plus en-AU**, and **Australia indexes en-AU plus en-GB**.
  - Canada indexes en-CA plus fr-CA. The US indexes en-US plus es-MX and others.
  - **What follows:** don't repeat the same words across en-GB and en-AU. Each locale's keyword field adds coverage in the other country. A fr-CA keyword field is free extra space in Canada.
- **In-App Events** are indexed in search, appear on the product page, and can be picked for Today, Apps or Games (details in §4).

### What competitors target (from their live UK/US/AU/CA listings)

| App | Title (UK unless stated) | Subtitle | Ratings | Price |
|---|---|---|---|---|
| MileIQ (Bending Spoons) | Mileage Tracker by MileIQ | Track Miles & HMRC Expenses | 4.7★ / 3.9k | up to £94.99 |
| Driversnote | Mileage Tracker by Driversnote | Auto-Track Miles & Log Trips | 4.8★ / 7.5k | £10/mo, £104.99/yr |
| Everlance | Mileage Tracker by Everlance | HMRC Driving & Expense Logbook | 4.4★ / 53 | £9.99/mo, £89.99/yr |
| TripLog | Mileage Tracker App by TripLog | Mileage & expense tracking | 4.3★ / 254 | free unlimited auto; premium £2.29–59.99 |
| **MileClear** | MileClear: Mileage Tracker UK | HMRC Tax & Gig Driver Expenses | 4.9★ / 55 | £4.99/mo, £44.99/yr |
| DriveLog | AI Mileage Tracker - DriveLog | Trip Mileage & Drive Tracking | 5.0★ / 8 | £4.99/mo, £44.99/yr, 50 free trips |
| Mileage Logbook | Mileage Logbook | Tax Compliant Mileage Tracker | 4.4★ / 38 | £3.99/mo, £34.99/yr |
| US: MileIQ | MileIQ: Mileage Tracker & Log | Track Driving Miles & Expenses | — | $13.99/mo, $139.99/yr |
| US: Everlance | Mileage Tracker by Everlance | Mile, Expense & Tax Deductions | 4.8★ / 52k | $10.99/mo, $89.99/yr |
| US: Stride | Stride: Mileage & Tax Tracker | Expense & income tracking | 4.8★ / 97k | free |
| US: Gridwise | Gridwise: Gig Driver Assistant | Boost Rideshare & Delivery Pay | 4.9★ / 28k | $9.99–107.99 |
| US: Hurdlr | Hurdlr Mileage, Expenses & Tax | Business Expense Tracker | 4.7★ / 21k | $9.99/mo, $99.99/yr |
| AU: Driversnote | **Vehicle Logbook** by Driversnote | ATO-Compliant Mileage Tracker | 4.7★ / **32k** | A$22/mo, A$234.99/yr |
| CA: Driversnote | Mileage Tracker by Driversnote | **Automatic CRA vehicle logbook** | 4.7★ / 13k | C$19/mo, C$204.99/yr |

**What this shows:**
- **Everyone has "Mileage Tracker" in the title.** It is the head term and you need it too. You won't outrank 3.9k–7.5k-rating apps on it quickly; your realistic wins are long-tail terms like "hmrc mileage log", "courier mileage", "gig driver", "self assessment mileage", "sole trader", "cents per km".
- **The UK subtitles cluster on "HMRC". Only MileClear goes after "gig driver".**
- **Australia searches for "logbook" and "vehicle logbook".** Driversnote holds 32k ratings there.
- **Our current en-CA subtitle, "Automatic CRA Vehicle Logbook", is almost word for word Driversnote's Canadian subtitle.** Change it so it doesn't look copied and so it covers different words.
- I couldn't get real keyword popularity scores (the paid tools were blocked). **Free way to get them:** open an Apple Ads **Advanced** account and use its keyword recommendations, which show Apple's popularity score (5–100) per country. Check every proposed term there before you submit.

### Proposed metadata (all lengths checked; keyword strings joined with commas and no spaces)

Rules applied: no word repeated within a locale, singular forms only, no competitor or platform names. Words already in the title (MileMint, mileage, tracker) and the category word "business" (primary category is BUSINESS) are left out of the keyword field.

**en-GB (UK)**
- Title: `MileMint: Mileage Tracker` (25). Keep it.
- Subtitle: `HMRC Log for Couriers & Trades` (30). Replaces "Automatic HMRC Mileage Log": it drops the repeated "mileage" and covers "hmrc mileage log", "courier" and "trades".
- Keywords (98): `self assessment,sole trader,delivery,driver,expenses,claim,journey,van,car,trip,gig,tax,auto,miles`
- Removed from the current set:
  - `hmrc`: already in the subtitle.
  - `mileage allowance` / `business miles`: repeat title and category words; "allowance" adds little.
  - `55p`: low search volume (unverified).
  - `logbook`: moves to en-AU, which the UK reportedly also indexes.

**en-US**
- Title: `MileMint: Mileage Tracker` (25).
- Subtitle: `Auto IRS Log for Gig Drivers` (28). Replaces "Log Every Mile, Cut Your Taxes", whose words (every, cut, your) are low-value search terms.
- Keywords (98): `deduction,1099,rideshare,delivery,self employed,writeoff,schedule c,trip,miles,expense,tax,courier`
- Optional later: an es-MX keyword field adds more US coverage (cross-localisation, unverified).

**en-CA**
- Title: `MileMint: Mileage Tracker` (25).
- Subtitle: `CRA Vehicle Logbook, Auto Km` (28).
- Keywords (98): `kilometre,t2125,self employed,delivery,driver,gig,trip,car,expense,tax,deduction,rideshare,courier`
- Also add a **fr-CA** localisation later: it gives you a free second keyword field in Canada.

**en-AU**
- Title: `MileMint: Mileage Tracker` (25).
- Subtitle: `ATO Car Log, Km & Tax Claims` (28).
- Keywords (100): `cents per km,logbook,deduction,return,sole trader,rideshare,delivery,driver,gig,trip,expense,abn,ute`
- ⚠️ **Only use "logbook" in Australia if MileMint can produce an ATO logbook-method log** (12 continuous weeks, odometer readings, business-use %). The current AU copy says MileMint uses the cents-per-km method. If it can't, swap `logbook` for `car expenses,work car` so the metadata stays accurate (guideline 2.3.1).

**Other listing changes:**
- In `store.config.json`, set `"automaticRelease": false` for 1.0 so you choose launch day.
- The promo text says it "shows the miles your delivery apps didn't count". Only ship that line if the missed-miles feature is in the reviewed build.
- Category: competitors sit in **Finance**, which is crowded with banks. MileMint has **Business** as primary. My judgement (unverified) is to keep Business primary for an easier top-chart climb, and review after 8 weeks of data.
- Custom product pages (couriers / trades / switchers) are already planned. Industry sources say custom pages can now be assigned keywords for organic search (unverified). Check this in App Store Connect.

---

## 2. Ratings

**Apple's rules and guidance:**
- The rating prompt shows at most **3 times per 365 days**. Ask "when users are most likely to feel satisfaction… don't interrupt their activity."
- Make support contact easy to find.
- Reply concisely and personally, with no marketing, putting low ratings and bug reports first.
- Ratings are **per country** and can be reset on a new version, which Apple advises using "sparingly".
- Guideline 3.2.2: apps must not *force* rating to access features.
- Apple's guidelines (5.6.1, my recollection; unverified this session) also require using the system API and disallow custom review prompts. **No incentives for ratings, ever:** no free drives, no prize draws.

**When MileMint should call `requestReview` (best practice from Apple and developer guides):**
- Only after the app has been installed for at least 3–7 days **and** at least 5 automatic drives have been sorted. At most once per version. At least 2 weeks between calls.
- Fire it at a happy moment:
  1. The first £50 or £100 milestone celebration, after the confetti has finished.
  2. A successful PDF or CSV export.
  3. Finishing the weekly sort with zero drives left to sort.
- **Never** fire it after a tracking-gap alert, in the first session, or during set-up.
- You can't detect whether the dialog actually appeared, so count *calls*, not *shows*.
- Add a user-initiated "Rate MileMint" row in Settings that opens the write-review page (`…?action=write-review`). That's allowed because the user chose it.

**Early ratings, within the rules:**
- TestFlight builds can't be rated. When 1.0 goes live, message the Founding 50 personally: "It's live. Please install the App Store version, and if it's useful an honest rating helps a one-person app a lot." Asking is fine; rewarding is not.
- Put ratings ask-backs into accountant and ambassador kits ("if it helped your clients…"), never with a reward attached.
- Don't add a "do you like the app?" screen that only sends happy users to the store. Rely on timing instead.

**Replies (evidence):**
- Academic and industry studies (mostly on Google Play data) found reviewers are about 3–6× more likely to raise their rating after a developer reply. Hassan et al.: 4.4% vs 0.7%.
- The effect fades if you reply more than about 72 hours after a negative review (industry blog, unverified).
- **Rule for MileMint:** reply to every review within 24 hours in launch month. On 1–3★ reviews, say what you fixed and the version number.

**Targets:** 10 ratings in launch week and 25 by the end of month 1 (as in the plan), at 4.7★ or higher. Under about 10 ratings the stars read as "no rating" in many places, so the first 10 matter most for conversion.

---

## 3. Launch timing by country

| Country | Deadlines | Which year a log started now helps | Recommendation |
|---|---|---|---|
| **UK** | SA 31 Jan (2025–26 return); MTD quarterly 7 Nov, 7 Feb, 7 May, 7 Aug; new tax year 6 Apr | 2026–27 (6 Apr 2026–5 Apr 2027), already half over | **Launch mid/late October 2026: yes.** Oct–Nov builds ratings and ranking before the January search peak (unverified but standard for this category). Lead with "start your 2026–27 log now" and the MTD 7 Nov hook for over-£50k sole traders. Push hard in Jan with "never again next January". Run a **second launch on 6 April 2027**: new tax year plus the MTD threshold reportedly dropping to £30k (unverified) |
| **US** | Q4 estimated tax 15 Jan; filing 15 Apr; quarterly estimates 15 Apr, 15 Jun, 15 Sep | Calendar 2026 (Q4 only); mostly 2027 | Go live in the US now for free organic ranking (no spend). Push from **1 Jan 2027**: "new year, new log" plus season interest. Spend only if the UK funnel shows trial-to-paid above about 35% |
| **Canada** | Filing 30 Apr; self-employed 15 Jun (payment due 30 Apr) | Calendar 2026 / 2027 | Go live now, no push. Light push Jan and Apr–Jun 2027. Add fr-CA |
| **Australia** | Self-lodgers 31 Oct (2025–26); tax time Jul–Oct; agents later | 2026–27 (1 Jul 2026–30 Jun 2027) | **Don't push for 31 Oct 2026**: the app can't create 2025–26 records. Go live now so it builds index and ratings history, then do a real launch late **June / July 2027** ("start your 2027–28 log on 1 July") |

**Day of week (unverified judgement):**
- Release Tuesday–Wednesday so you have working days to fix problems and reply to reviews before the weekend, and avoid Fridays.
- Couriers are busiest on Friday–Sunday evenings, which is good for showing up in their WhatsApp groups but bad for support load.
- Expect Apple's review to slow down over Christmas (late Dec, unverified). Ship the "January build" by about 15 Dec.

---

## 4. Apple featuring

- **How:** App Store Connect → your app → **Featuring Nominations**. You can nominate a new app launch, a major update, In-App Events or developer stories. Roles needed: Account Holder, Admin, App Manager or Marketing.
- **Lead time:** at least 2 weeks; up to 3 months ahead for wider consideration (Apple).
- **What Apple scores:** user experience, UI design, innovation, uniqueness ("a fresh approach to a familiar category"), accessibility, localisation, and product page quality (screenshots, previews, ratings).
- **Writing the pitch (industry advice):** open with the founder story and *why now*, then the regions targeted. Don't send a feature list.
- **MileMint's best angle:** privacy-first (no account, encrypted on-device location), honest "you'll know if a mile was missed" tracking alerts, accessibility (Dynamic Type and VoiceOver on the trip list), and proper UK/CA/AU localisation (HMRC/CRA/ATO rules, km). A solo UK founder story suits a UK regional editorial piece.

**In-App Events (Apple rules):**
- Badges: Challenge / Competition / Live Event / Major Update / New Season / Premiere / Special Event.
- Up to **31 days** long, promoted up to **14 days** before the start, **10 live at once**.
- Not allowed: price promotions, general awareness campaigns, or ongoing features.
- They show in search and on the product page even if Apple never features them, so they're worth doing anyway.

**Events to create:**
1. **"Self Assessment Countdown" (Challenge, 2–31 Jan 2027).** Sort every drive, set up your 2026–27 log and export your summary. Nominate it by **mid-November**.
2. **"Log every mile in November" (Challenge, Nov 2026).** Only if a real in-app challenge exists, such as a streak or badge.
3. **"New tax year, new log" (Challenge or Major Update, 6 Apr 2027),** paired with the import feature.
4. Australia: **"New income year" (1 Jul 2027).**

**Today tab stories** are Apple's editorial choice. You can only nominate and hope.

**Realistic odds (unverified judgement):** low. For a new indie finance/utility app with few ratings, expect under 5–10% chance of any featuring in the first 6 months. A regional "apps for the self-employed" collection or an In-App Event pickup in the UK is the most plausible route. Nominate every quarter regardless; it's free. Don't put featuring in the forecast.

---

## 5. Apple Ads (formerly Apple Search Ads)

**Basic vs Advanced** (both still live in 2026 per industry sources; Apple's own page was blocked):
- **Basic:** you pay per install (CPI), Apple chooses keywords, monthly budget cap up to $10k per app, and you see little data.
- **Advanced:** you pay per tap (CPT), you choose keywords and match types, there's no published minimum, and you get keyword popularity data.
- **Use Advanced.** At £150–300 a month you need exact-match control and the free keyword research.

**Benchmarks (2025 data, via search summaries):**
- UK across all categories: **CPT about $1.31–1.35, CPA about $2.02, tap-to-install about 65%** (Adapty, 2025 data from 8,000+ apps).
- Finance category, all countries: **CPT $6.06, CPA $13.28** (SplitMetrics 2025). Finance search-results median CPT about $3.55 (secondary source).
- Productivity CPT about $1.50–3.50.
- **Expect mileage terms in the UK at about £1–3 CPT and £1.50–5 per install (unverified estimate).** They are niche long-tail terms and cheaper than banking/crypto terms, which drive up the Finance average.

**£150–300 a month test plan (UK):**

| Campaign | Keywords (exact) | Daily cap | Notes |
|---|---|---|---|
| Brand defence | milemint | £1 | Cheap; stops competitors taking your name |
| Generic core | mileage tracker, mileage log, mileage app, hmrc mileage, mileage tracker uk | £4–6 | Start the bid near the suggested CPT; cut keywords whose CPA is over £5 after 15 taps |
| Gig / courier | courier mileage, delivery driver tax, gig driver, self employed mileage, sole trader expenses | £2–3 | Point it at the **courier custom product page** |
| Discovery | Search Match on, broad on 3 seeds, low bid | £1 | Move converting search terms into exact; add negatives |
| Competitor names | mileiq, driversnote, everlance | **Hold** | Apple Ads has generally allowed competitor-term bidding but acts on trademark complaints (unverified; couldn't load the policy). Test small, only from December |

**Schedule and rules:**
- Run a **2-week learning burst in mid-November at about £5/day (≈£70)** to get real CPT and conversion figures, then pause.
- Run **£8–10/day from 26 Dec to 31 Jan** (≈£300), and again 25 Mar–20 Apr for the new tax year.
- **Kill rule:** cost per trial start over £10, or cost per paying user over about £15 after 30 days. (A 30-day trial delays the payer signal by a month, so judge Nov–Dec on trial starts.)

---

## 6. What worked for other indie apps, and conversion benchmarks

**Channels (limited evidence; mostly judgement, unverified):**
- **Reddit:** one indie's Reddit launch gave 750+ iOS installs, with day one bigger than months of TestFlight (Parsnip). Another indie reached 10k installs and about $1k MRR from TestFlight and Reddit communities, with 1,500 installs in 3 days from one thread (Growth Snippets).
  - For MileMint: genuine "I built this, roast it" posts in r/UberEATS, r/deliveroo, r/AmazonFlexDrivers, r/ukpersonalfinance (rules permitting) and r/smallbusinessuk. Use the `ct=` campaign links.
- **Short video:** 4 of 8 verified iOS success stories (all bootstrapped, all subscriptions) credited TikTok or creator content as the growth engine (getappniche).
  - "What my delivery app didn't count" missed-miles videos fit well. Pay creators per paying user plus a small fixed fee.
- **Product Hunt:** the audience is tech and makers, not couriers or tradespeople (unverified). At most a low-effort afternoon for backlinks and credibility; don't plan around it.
- **Accountants / bookkeepers:** the highest-leverage B2B2C channel for this category (judgement; no data found). Keep it top of the list.
- **Referral loops:** the Dropbox-style "+10 drives" design is sound. As the plan says, hold the push until CloudKit confirmation ships.
- **Price comparison (UK):** you are cheaper than MileIQ, Driversnote and Everlance but **dearer than MileClear and DriveLog**. Dated comparisons that only name MileIQ, Driversnote and Everlance are honest but incomplete. Lead on trust and accuracy ("you'll know if a mile was missed", no account, on-device privacy) rather than price.

**Conversion benchmarks:**

| Metric | Benchmark | Source |
|---|---|---|
| Install → trial start | median **6.2%**, top 10% **20.3%** | RevenueCat SOSA 2025 |
| Install → trial (all) | **10.9%** | Adapty 2025 |
| Trial → paid, 17–32-day trials | median **42.5%** (top quartile 59.4%) | RevenueCat 2026 |
| Trial → paid, ≤4-day trials | **25.5%** | RevenueCat |
| Trial → paid (all, Adapty) | 25.6% overall; **Productivity 29.5%** | Adapty 2025 |
| Download → paid by day 35 | high price **2.8%** (top quartile 6.1%); mid **2.0%** (4.4%); low 1.4% | RevenueCat 2026 |
| Hard paywall vs freemium, day-35 paid | **10.7% vs 2.1%** | RevenueCat 2025 (reported) |
| Trial cancellations on day 0 | **55%** | RevenueCat 2025 |
| Apple Ads tap → install | about 62–66% | Adapty / SplitMetrics |

**What this means for the plan:** MileMint is freemium, so the realistic download-to-paid rate is about **2–3%**; top quartile is 4–6%.
- **"60 paying from 1,000 installs" (6%) is a top-quartile result.** Plan on 25–35 payers and treat 60 as a stretch goal.
- The plan's "trials → paying 25%+" is too low a bar for a 30-day annual trial. Target **40%**.

---

## 7. Pricing check

**Trial length (RevenueCat, 17,000+ apps):**
- Annual plans: 24% (≤4 days) → 33% (5–9 days) → **44.6% (17–32 days)**.
- Monthly plans: best at **10–16 days (46.6%)**.
- First renewal: **72%** on 10–16-day trials vs 54% on ≤4-day trials.
- **So the 1-month trial on the annual plan is backed by the data. Keep it.** A mileage app also needs weeks of real drives before its value shows.
- If you ever add a trial to the monthly plan, use about 14 days, not 30.

**Price level:**
- UK: £5.99/£49.99 sits below MileIQ (≤£94.99), Driversnote (£10/£104.99) and Everlance (£9.99/£89.99), and above MileClear and DriveLog (£4.99/£44.99) and Mileage Logbook (£3.99/£34.99).
- The annual price is 30% off 12× monthly. Most apps use 30–50% off (unverified norm).
- **Recommendation:** keep the prices; they're credible and not the cheapest. Spend the competitive effort on the **free tier** instead:
  - Count a shift as one drive, or
  - Raise couriers' free allowance to about 60, or
  - Gate on *reports and history* rather than *tracking*. That last option takes away the angriest reason to switch ("tracking stopped at my limit").
- Keep the "drives over the limit are kept, not lost" behaviour. It's a strong honesty signal.

**Annual vs monthly:**
- RevenueCat reports monthly plans make up most revenue overall, with annual dominant in Health & Fitness, Education and Travel.
- No Finance/Business split was found (unverified).
- Expect a 40–60% annual share if the paywall leads with annual + trial.
- In December–January, show the annual price as "£4.17 a month, 1 month free".

**Deadline cancellation risk:** people who start a trial in January to get a "report" and then cancel on day 0. Because MileMint can't produce a 2025–26 report anyway, most January trialists are really testing it for next year. Use the trial to build the habit: a weekly sort reminder, and a "your 2026–27 claim so far: £X" push around day 21.

**Founding price lock:** if you keep it, implement it with Apple's tools (keep founders on the launch price when you later raise prices for new subscribers). Don't make an unenforceable promise.

---

## 8. Six-week plan (5 Oct – 15 Nov 2026)

| Week | Founder actions | Spend | Watch |
|---|---|---|---|
| **W1 (5–11 Oct), prepare** | Update metadata as in §1. Set `automaticRelease:false`. Submit 1.0. Founding 50 on TestFlight. Collect real missed-miles numbers with permission. Open an Apple Ads Advanced account and check keyword popularity for every proposed term. Check "logbook" accuracy for AU. Build the one-page site and campaign links | £5 domain | TestFlight crash-free %, tracking-gap alerts per tester |
| **W2 (12–18 Oct), approved** | Create 3 custom product pages, the offer code and `FRIEND_OFFER_CODE`. Record the 3 videos. Line up 5 accountants and 3 courier admins. Draft the featuring nomination for the January "Self Assessment Countdown" event (submit ≥8 weeks ahead) | £30–60 counter cards | Review time; pages approved |
| **W3 (19–25 Oct), LAUNCH (Tue 20 Oct)** | Manual release in UK/US/CA/AU, but **marketing UK only**. About 100 personal WhatsApp messages. Ask the Founding 50 to install the live app and rate it honestly. Founder LinkedIn/Facebook post. Courier week in 2 cities. Reply to every review within 24h | £0 | Installs by `ct=` link; product page conversion rate; **10 ratings**; install→trial ≥6% |
| **W4 (26 Oct–1 Nov)** | Reddit posts (2 subs, rules first). Local Facebook groups. 2 trade counters. Fix the top 3 issues and ship 1.0.1 (the rating prompt resets per version) | £0–30 | D1/D7 still tracking (target 40%+); day-0 trial cancellations; crash-free sessions |
| **W5 (2–8 Nov), MTD week** | "MTD update due 7 Nov: is your mileage in?" content for over-£50k sole traders and accountants. **Apple Ads learning burst starts at £5/day** (exact match, UK). Nominate the January in-app event | ~£35 | CPT, tap→install, cost per trial; keyword ranks checked by hand weekly on a UK iPhone |
| **W6 (9–15 Nov), decide** | Ads burst ends (~£70 in total). Monday review: keep or kill channels. Book 5–10 creators for December. Submit the "Self Assessment Countdown" in-app event. Plan the CloudKit referral release for early December | ~£35 | Installs (target 300–500), ratings 25+ at ≥4.7★, trial starts, first organic keyword ranks (top 10 for at least 3 long-tail terms), cost per trial |

**Total for weeks 1–6:** about **£150–250**. The rest of the £150–300 a month goes into December–January Apple Ads and creators, as planned.

**Weekly dashboard** (App Store Connect for store metrics, your own opt-in counters for usage):
- Impressions → product page views → installs (conversion %)
- Install → trial
- Trial → paid (from week 9 onwards because of the 30-day trial)
- D7 still tracking
- Ratings count and average
- Share rate
- Cost per trial and cost per payer, judged against **about £12–15 net** (see §0.4)

---

## Unverified / to check
- Exact keyword popularity scores (check in Apple Ads Advanced).
- Which locales the UK indexes (en-GB plus en-AU per some sources).
- Whether Apple uses screenshot OCR as a ranking signal.
- Whether custom product pages can be assigned keywords for organic search.
- Apple Ads policy on competitor-keyword bidding.
- MTD threshold dropping to £30k from April 2027.
- Featuring odds.
- The January search peak for this category.
- Day-of-week launch effects.
- Annual/monthly mix for finance apps.
- Apple's custom-review-prompt ban (guideline 5.6.1 from memory).
- UK CPT estimate for mileage terms.

## Sources
- Apple – App Store search: https://developer.apple.com/app-store/search/
- Apple – App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple – Ratings and reviews: https://developer.apple.com/app-store/ratings-and-reviews/
- Apple – Getting featured: https://developer.apple.com/app-store/getting-featured
- Apple – In-App Events: https://developer.apple.com/app-store/in-app-events/
- 9to5Mac on featuring nominations: https://9to5mac.com/2024/11/13/developers-featured-app-store/
- TechCrunch on featuring nominations: https://techcrunch.com/2024/06/13/apple-gives-developers-a-way-to-nominate-their-apps-for-editorial-consideration-on-the-app-store
- App Store listings:
  - MileIQ UK: https://apps.apple.com/gb/app/mileage-tracker-by-mileiq/id578830929
  - MileIQ US: https://apps.apple.com/us/app/mileage-tracker-by-mileiq/id578830929
  - MileIQ AU: https://apps.apple.com/au/app/mileage-tracker-by-mileiq/id578830929
  - Driversnote UK: https://apps.apple.com/gb/app/mileage-tracker-by-driversnote/id924418916
  - Driversnote AU: https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916
  - Driversnote CA: https://apps.apple.com/ca/app/mileage-tracker-by-driversnote/id924418916
  - Everlance UK: https://apps.apple.com/gb/app/mileage-tracker-by-everlance/id985378916
  - Everlance US: https://apps.apple.com/us/app/everlance-mile-expense-log/id985378916
  - TripLog UK: https://apps.apple.com/gb/app/triplog-car-mileage-tracker/id585918522
  - MileClear: https://apps.apple.com/gb/app/mileclear-mileage-tracker-uk/id6759671005
  - DriveLog: https://apps.apple.com/gb/app/ai-mileage-tracker-drivelog/id6496865522
  - Mileage Logbook: https://apps.apple.com/gb/app/mileage-logbook/id1465874921
  - Tripcatcher: https://apps.apple.com/gb/app/tripcatcherapp/id1547595380
  - Stride: https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359
  - Gridwise: https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382
  - Hurdlr: https://apps.apple.com/us/app/hurdlr-expense-mile-tracker/id951737201
- RevenueCat State of Subscription Apps 2025: https://www.revenuecat.com/state-of-subscription-apps-2025
- RevenueCat State of Subscription Apps 2026: https://www.revenuecat.com/state-of-subscription-apps
- RevenueCat 2026 trends summary: https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026
- RevenueCat trial-length study: https://www.revenuecat.com/blog/growth/free-trial-length
- SaaStr summary of the trial-length study: https://www.saastr.com/what-17000-subscription-apps-tell-us-about-free-trial-length-annual-plans-convert-86-better-with-30-day-trials-monthly-tops-out-at-two-weeks-and-ai-apps-hit-a-wall-at-16-days/
- RocketShip HQ summary of RevenueCat 2025: https://www.rocketshiphq.com/revenuecat-state-of-subscription-apps-2025-summary/
- Adapty State of In-App Subscriptions 2025: https://adapty.io/blog/state-of-in-app-subscriptions-2025-in-10-minutes/
- Adapty Apple Ads benchmarks 2026: https://adapty.io/blog/apple-ads-benchmarks-2026/
- SplitMetrics Apple Ads benchmarks 2025: https://splitmetrics.com/apple-ads-search-results-benchmarks-2025/
- SplitMetrics on Apple Ads cost: https://splitmetrics.com/blog/apple-search-ads-cost/
- Business of Apps, Apple Search Ads costs: https://www.businessofapps.com/marketplace/apple-search-ads/research/apple-search-ads-costs/
- MB Adv, Apple Ads cost guide: https://www.mbadv.agency/apple-ads/how-much-do-apple-ads-cost
- Mobile Action, Basic vs Advanced: https://www.mobileaction.co/blog/apple-search-ads-basic-vs-advanced-which-solution-is-right-for-your-app/
- Mobile Action, cross-localisation: https://www.mobileaction.co/blog/app-store-cross-localization/
- AppTweak, cross-localisation: https://www.apptweak.com/en/aso-blog/how-to-benefit-from-cross-localization-on-the-app-store
- AppRadar, App Store ranking factors: https://appradar.com/academy/app-store-ranking-factors
- AppFollow, ASO ranking factors: https://appfollow.io/blog/aso-ranking-factors
- SplitMetrics, App Store ranking factors: https://splitmetrics.com/blog/apple-app-store-ranking-factors/
- App Screenshot Studio, indexed fields: https://appscreenshotstudio.com/tools/app-store-indexed-fields
- Mobile Action, In-App Events guide: https://www.mobileaction.co/guide/in-app-events-promotional-content-guide/
- SwiftLee on SKStoreReviewController: https://www.avanderlee.com/swift/skstorereviewcontroller-app-ratings/
- Critical Moments, SKStoreReviewController guide: https://criticalmoments.io/blog/skstorereviewcontroller_guide_with_examples
- ACM study on developer responses: https://dl.acm.org/doi/fullHtml/10.1145/3463274.3463311
- Replient on replying to reviews: https://replient.ai/en/blog/respond-to-app-store-reviews
- HMRC MTD quarterly updates: https://makingtaxdigital.campaign.gov.uk/quarterly-updates/
- Cherry Money, 7 Nov 2026 MTD update: https://cherrymoney.co.uk/insights/making-tax-digital-second-quarterly-update-7-november-2026
- Coconut, MTD deadlines: https://www.getcoconut.com/knowledge-hub/making-tax-digital-income-tax-deadlines
- getappniche, iOS success stories: https://getappniche.com/guides/ios-app-success-stories
- Parsnip launch stats: https://parsnip.substack.com/p/app-store-launch-stats
- Growth Snippets, first 10,000 users: https://growthsnippets.substack.com/p/20-steps-to-get-your-first-10000

Local files reviewed (no changes made): /home/user/New-idea/12-launch-plan.md, /home/user/New-idea/14-launch-campaign.md, /home/user/New-idea/milemint/store.config.json