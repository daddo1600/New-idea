# Pro pricing case: what to charge for MileSprout Pro

*Research agent, 3 Oct 2026. A decision paper for the founder. Read the first page (about 5 minutes); the rest is the evidence.*

*Confidence on every figure: **H** = high (primary source or Apple's own API), **M** = medium (search summary of a primary source, or a law firm or trade source), **L** = low (aggregator, or our own assumption). Anything marked **assumption** is a modelling choice, not research. `pricing-simulation.md` and `pro-value-plan.md` §5 are **simulations**; nothing below relies on them as evidence.*

## The answer

- **Pick option A: £3.99 a month or £29.99 a year** (US$3.99 / US$29.99, CA$4.99 / CA$37.99, A$5.99 / A$44.99). It is what `decisions.md` already says, and the evidence below supports keeping it.
- **Don't call it a "launch" or "introductory" price.** In the UK that wording means we must give an end date and then actually raise the price (ASA, CMA). Show it as the price. If you want a hook, the honest one is: "Subscribe in our first year and keep your price for as long as you stay subscribed". Apple supports this, but it is a promise to customers, so it is your call.
- **Keep the free month on the yearly plan; no trial on monthly.** RevenueCat's 2026 data says month-long trials on yearly plans convert far better than short ones (about 45% vs 24%).
- **Review after the UK's 31 Jan 2027 deadline.** If the evidence is good (the gates are in §7), move **new** subscribers to **£4.99 / £39.99** and keep existing ones on their price. Apple makes that simple and no one has to consent.
- **Blocker, unchanged:** App Store Connect still holds £5.99 / £49.99. It must be changed to option A before the website shows any price (`pro-price-display.md`).

### Options side by side

Prices are real App Store price points. Each was checked in Apple's API on 3 Oct 2026 (H). The US and Canadian prices are before sales tax; the UK and Australian prices include VAT and GST.

| | **A (pick)** | C1 | C2 | B (in App Store Connect now) |
|---|---|---|---|---|
| UK | **£3.99 / £29.99** | £4.99 / £34.99 | £4.99 / £39.99 | £5.99 / £49.99 |
| US | **US$3.99 / US$29.99** | US$4.99 / US$34.99 | US$4.99 / US$39.99 | US$5.99 / US$49.99 |
| Canada | **CA$4.99 / CA$37.99**¹ | CA$6.99 / CA$49.99 | CA$6.99 / CA$49.99 | CA$7.99 / CA$69.99 |
| Australia | **A$5.99 / A$44.99**¹ | A$7.99 / A$59.99 | A$7.99 / A$59.99 | A$9.99 / A$79.99 |
| Yearly saving vs 12 × monthly (UK) | 37% | 42% | 33% | 30% |
| What we get per yearly UK sale (after VAT and Apple's 15%) | £21.18 | £24.71 | £28.24 | £35.30 |
| Year-1 revenue per paying user (UK, model in §4) | £17.22 | £20.46 | £22.58 | £27.95 |
| Extra payers A–C need to match B's revenue | +62% | +37% | +24% | — |
| Compared with the closest UK rival (MileClear, unlimited free logging, £4.99 / £44.99) | Below on both | Same monthly, cheaper yearly | Same monthly, cheaper yearly | **Above on both** |
| Compared with MileIQ (UK £9.49 / £94.99) | 42% / 32% of its price | 53% / 37% | 53% / 42% | 63% / 53% |

¹ Apple's own conversion of £29.99 is CA$39.99 and A$49.99. We use CA$37.99 and A$44.99 so that "save over a third with yearly" stays true in every country (`pro-price-display.md` §1.4). C1 and C2 use Apple's conversions as they are.

**Option D, "launch price that rises later", done properly.** Launch at A and raise **new** subscribers' price to C2 on a date we publish on day one, keeping everyone who joined before it on their price. This is lawful if the date is real and we keep it. But it commits us to the raise before we have any data, which is why I recommend A with a review gate instead (§7).

### Why A

1. **Our edge is "free, unlimited, private"; the price shouldn't undercut it.** B charges more than MileClear, which gives the same unlimited free logging, already has ratings and costs £4.99 / £44.99. We would launch with no ratings.
2. **Our users earn modest wages.** UK care workers' median pay is £12.60 an hour (Skills for Care, Dec 2025, M), so B's £49.99 a year is about 4 hours' work and A's £29.99 is about 2⅓. For an employee claiming tax relief on mileage (§5), £49.99 is about a fifth of a typical year's relief, while £29.99 is about an eighth.
3. **The money difference is small at launch scale, and it can be undone.** At 3% paying, A brings in about £517 per 1,000 downloads in year 1, against £838 for B (§4). Apple lets us raise the price for new subscribers later without asking anyone to consent (§7).
4. **Low-priced yearly plans renew better.** RevenueCat's 2026 report puts first-year retention on yearly plans at 36% for low-priced apps, against 26% for mid-priced and 23% for high-priced (M).
5. **It's already signed off.** The website, the waitlist offer and the price-display wording are all built on A. B or C means redoing that work.

### Main risks with A

- **We earn 38% less per payer than with B.** If price barely affects whether people buy, A leaves money on the table. Nobody has measured this for our audience, and RevenueCat's data hints that higher-priced apps can convert *better* (see §3, though that comparison is confounded).
- **It looks like a budget product.** "Cheaper than everyone" can read as lower quality.
- **Raising the price later causes friction.** People will compare the old and new prices in driver groups. Keeping existing subscribers on their price solves most of this.

---

## 1. Price points in detail

Apple's price-point grid and conversions come from the App Store Connect API (GET requests only; nothing was changed), 3 Oct 2026. **H.**

**Apple's conversion of each UK price** (`subscriptionPricePoints/{id}/equalizations`):

| UK price | US | Canada | Australia | What we get in the UK (after VAT and 15%) |
|---|---|---|---|---|
| £3.99 | $3.99 | $4.99 | $5.99 | £2.82 |
| £4.99 | $4.99 | $6.99 | $7.99 | £3.52 |
| £5.99 | $5.99 | $7.99 | $9.99 | £4.23 |
| £29.99 | $29.99 | $39.99 | $49.99 | £21.18 |
| £34.99 | $34.99 | $49.99 | $59.99 | £24.71 |
| £39.99 | $39.99 | $49.99 | $59.99 | £28.24 |
| £49.99 | $49.99 | $69.99 | $79.99 | £35.30 |

**What we get per sale in each storefront.** These are Apple's proceeds figures, after Apple's 15% and after any VAT or GST.

| Price | US$ | CA$ | A$ |
|---|---|---|---|
| 3.99 / 4.99 / 5.99 / 6.99 / 7.99 / 9.99 | 3.39 / 4.24 / 5.09 / 5.94 / 6.79 / — | same as US | 3.08 / 3.86 / 4.63 / 5.40 / 6.17 / 7.72 |
| 29.99 / 37.99 / 44.99 / 49.99 / 59.99 / 69.99 / 79.99 | 25.49 / 32.29 / 38.24 / 42.49 / 50.99 / 59.49 / — | same as US | 23.17 / 29.36 / 34.77 / 38.63 / 46.36 / — / 61.81 |

- Every price used in this paper exists as a point in the USD, CAD and AUD grids (checked: monthly 3.99–7.99 and yearly 29.99–59.99, including 37.99, 42.99, 44.99 and 47.99). **H.**
- **Tax inside the price, worked out from Apple's proceeds** (as in `pro-price-display.md`):
  - UK proceeds are price ÷ 1.2 × 0.85, so **20% VAT is inside the price**.
  - AU proceeds are price ÷ 1.1 × 0.85, so **10% GST is inside**.
  - US and CA proceeds are price × 0.85, so sales tax is added at checkout.
  - **H.**
- **Small Business Program.** In the API, `proceeds` equals `proceedsYear2` on every point, so we already get 85% from day one. That fits enrolment in the Small Business Program, which pays 15% commission to developers under US$1m a year in proceeds ([Apple](https://developer.apple.com/app-store/small-business-program/), H). Without the programme, Apple takes 30% in a subscriber's first paid year and 15% after ([Apple](https://developer.apple.com/app-store/subscriptions/), H). That enrolment explains the matching figures is **M**, an inference: confirm under Agreements in App Store Connect.

## 2. Competitors

All App Store listings were read on **3 Oct 2026** with a fetch tool that summarises the page. A dash means the app is not on that store: the UK page returned 404. "Free plan" is what the listing or the company says. Re-check before quoting any of these publicly, as `website-comparison-sources.md` asks.

| App | UK App Store | US App Store | Free plan | Conf. |
|---|---|---|---|---|
| **MileIQ** ([GB](https://apps.apple.com/gb/app/mileage-tracker-by-mileiq/id578830929), [US](https://apps.apple.com/us/app/mileage-tracker-by-mileiq/id578830929)) | £9.49 / £94.99 (also £4.49 and £89.99 items, not named) | $13.99 a month / $139.99 a year | 40 drives a month (US listing: "40 free drives every month") | H (prices), M (which UK item is which) |
| **Driversnote** ([GB](https://apps.apple.com/gb/app/mileage-tracker-by-driversnote/id924418916), [US](https://apps.apple.com/us/app/mileage-tracker-by-driversnote/id924418916)) | £10.00 / £104.99 (£119.99 with iBeacon) | $14.00 / $150.00 ($167.99 with iBeacon) | A monthly trip limit; the number isn't on the listing (15 or 20, sources conflict, see `website-comparison-sources.md`) | H (prices), L (limit) |
| **Everlance** ([GB](https://apps.apple.com/gb/app/mileage-tracker-by-everlance/id985378916), [US](https://apps.apple.com/us/app/mileage-tracker-by-everlance/id985378916)) | Starter £9.99 / £89.99; Professional £119.99 a year; Premium Plus £19.99 | Starter $10.99 / $89.99; Professional $119.99; Premium Plus $19.99 | 30 automatic trips a month, manual logging, reports; 7-day trial on paid plans | H |
| **TripLog** ([GB](https://apps.apple.com/gb/app/mileage-tracker-app-by-triplog/id585918522), [US](https://apps.apple.com/us/app/mileage-tracker-app-by-triplog/id585918522)) | Only legacy packs listed (£59.99) | Only legacy packs listed ($59.99); the current Premium is sold on the web. Search summaries say $4.99 a month (triplog.net/pricing, not opened) | Unlimited automatic trip detection, classification and basic expenses, plus one free 7-day Premium pass a year for the annual report | H (free plan), L ($4.99) |
| **Stride** ([US](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359)) | — | Free; "an option to pay for a service" (no in-app purchase prices listed) | Mileage logging, expenses and IRS-ready reports, all free. It is funded by health-insurance sales | H |
| **Gridwise** ([US](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382)) | — | Plus $14.99 a month / $107.99 a year (also $5.99, $9.99 and $71.99 items) | Earnings across platforms and manual mileage; automatic mileage is a Plus feature (`website-comparison-sources.md`) | H (prices), M (free limits) |
| **Hurdlr** ([US](https://apps.apple.com/us/app/hurdlr-mileage-expenses-tax/id951737201)) | — | Premium $9.99 a month / $99.99 a year | "Unlimited mileage", expenses and income on free | H |
| **QuickBooks** (Intuit app; [US](https://apps.apple.com/us/app/intuit-quickbooks-for-business/id584606479), [GB](https://apps.apple.com/gb/app/intuit-quickbooks-for-business/id584606479)) | Sole Trader £12.00 a month (other plans £7–£19 a month; Simple Start £199 a year) | Solopreneur $20.00 a month | No free plan; a QuickBooks subscription is needed. QuickBooks Self-Employed left the App Store on 24 Mar 2024 and Solopreneur replaced it ([Intuit](https://quickbooks.intuit.com/learn-support/en-us/help-article/migrate-services/switch-quickbooks-self-employed-quickbooks/L3pEGh1f5_US_en_US)) | H (prices), M (QBSE date) |
| **FreeAgent** ([GB](https://apps.apple.com/gb/app/freeagent-mobile-accounting/id975591071)) | The app is free but needs a FreeAgent account (£12–£39.49 a month or £119.99–£394.99 a year, as summarised from the listing) | — (UK product) | **Free for NatWest, RBS, Ulster Bank and Mettle business customers** ([FreeAgent](https://www.freeagent.com/pricing/free-accounting-software/)). This matters: many UK sole traders already get mileage logging free through their bank | M |
| **Solo** (Solo Technologies; [US](https://apps.apple.com/us/app/-/id1586902173)) | — (UK 404) | Basic $10 a month or $27 a quarter; Pro $20 a month (with offer $15 a month, $36 a quarter, $119.99 a year) | Earnings across gig apps; the free plan's limits aren't on the listing | H (prices), L (free plan) |
| **MileClear** (UK; [GB](https://apps.apple.com/gb/app/mileclear-mileage-tracker-uk/id6759671005)) | Pro £4.99 a month / £44.99 a year | — | Unlimited automatic logging, HMRC rates, Self Assessment wizard, receipt scanning; Pro adds exports and the accountant portal. No trial listed | H |

**Notes on the list:**
- **"Solo (Uber/Deliveroo drivers' app)".** The only "Solo" for gig drivers I found is Solo Technologies' US app, which isn't on the UK store. If you meant a different app (for example something Deliveroo or Uber offer riders), tell me its name and I'll add it. **Flag.**
- **Not checked:** Canadian and Australian App Store prices for these competitors (the brief asked for the UK and US). Earlier notes converted these rather than checking them, so don't quote them.

**What the market says:**
- **Paid plans for capped mileage apps cluster at £9.49–£10 a month and £89.99–£104.99 a year in the UK, and $10.99–$14.99 a month in the US.** All four options are well below them.
- **The apps that log without limits for free charge least, or nothing:**
  - MileClear: £4.99 / £44.99.
  - TripLog: about $4.99, L.
  - Stride: free, funded by insurance.
  - Hurdlr: free logging, $9.99 for Premium.

  That is the group we are in. Within it, A is the cheapest paid plan, and B is the dearest after Hurdlr.

## 3. What our audience can pay

**Benchmarks from RevenueCat's State of Subscription Apps 2026** (115,000+ apps, $16bn revenue). revenuecat.com is blocked from this session, so everything here is from search summaries of [the report](https://www.revenuecat.com/state-of-subscription-apps), [its 10-minute summary](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026) and [the trial-length study](https://www.revenuecat.com/blog/growth/free-trial-length). **All M.**

| Benchmark | Figure | What it means for us |
|---|---|---|
| Median download-to-paid by day 35, all apps | 2.0% (top 10%: over 9.1%) | A realistic middle band for us is 2–3% |
| Freemium vs hard paywall, download-to-paid | 2.1% vs 10.7% | We're freemium with a generous free plan, so expect the freemium figure, not the paywall one |
| Day-35 download-to-paid by price | Higher-priced apps 2.8% vs lower-priced 1.4%. Download-to-trial 8.9% vs 4.3% | **Higher price did not mean fewer buyers across apps.** But this is confounded: pricier apps tend to be hard-paywall and from different categories. It's a warning not to assume A converts much more than B |
| First-year retention on yearly plans | Low-priced 36%, mid 26%, high 23% | Cheaper yearly plans renew better |
| First-year retention on monthly plans | Median 14–26% | Monthly payers mostly leave within the year |
| Common price levels in 2026 | Monthly $7.99–$9.99; yearly $29.99–$39.99 | A and C sit at or below the usual yearly level |
| Revenue mix by plan length | Search summaries conflict (Productivity: 77% or 91% of revenue from monthly plans; Health & Fitness: 59–68% from yearly) | **Conflict, L.** We have no category figure for finance or mileage apps. Our 60/40 yearly/monthly split in §4 is an assumption |

**Pay and price sensitivity among our users:**

| Group | Figure | Source | Conf. |
|---|---|---|---|
| UK care workers (independent sector, England) | Median £12.60 an hour (Dec 2025); 26% within 10p of the minimum wage | Skills for Care, via search summary ([report](https://www.skillsforcare.org.uk/Adult-Social-Care-Workforce-Data/workforceintelligence/resources/Reports/Topics/Pay-in-the-adult-social-care-sector-in-England-as-at-December-2024.pdf) and [Care Home Professional](https://www.carehomeprofessional.com/care-workers-living-wage/)) | M |
| US Uber drivers | Median $21.18 an hour gross trip pay (2025, 500k+ drivers); about $15–$18 an hour after car costs | [Gridwise](https://gridwise.io/blog/how-much-do-uber-drivers-make), which is a competitor with an interest in the numbers | M |
| UK food couriers | Commonly quoted as £7–£12 an hour before costs | Blogs and aggregators only (e.g. [rider.support](https://www.rider.support/blog/how-much-do-uk-delivery-riders-earn)); no primary source found | L |
| Gig workers' willingness to pay for apps | **No survey found.** I searched for gig-worker or sole-trader surveys on app or subscription spending and found only vendor blog posts | — | — |

**What that means in work time:**
- At the care-worker median, £3.99 is 19 minutes' pay, £4.99 is 24 and £5.99 is 29.
- £29.99 a year is about 2.4 hours; £49.99 is about 4.
- This is arithmetic on the figures above, not evidence of willingness to pay.

**Honest gap.** No public data says what price couriers and carers will accept for a mileage app. The best real-world signal is where competitors that log for free price their paid plan (£4.99 / £44.99, about $4.99), and the fact that UK FreeAgent users with NatWest-group banks pay nothing. Our own panels are simulations and only point the same way.

## 4. Unit economics

**Costs per user are close to zero.**
- Trips stay on the phone, so there are no trip servers.
- Known fixed costs:
  - the Apple Developer Program, US$99 a year ([Apple](https://developer.apple.com/programs/), H);
  - Cloudflare Pages and D1 for the site and waitlist (already running).
- **The perks redemption server's cost isn't recorded anywhere in the repo** (`monday-todo.md` item 7 only says the founder is sorting it). If it runs on Cloudflare Workers Paid, the base is **US$5 a month**, including 10m requests and D1 (search summaries of Cloudflare's pricing; developers.cloudflare.com is blocked from here, **M**). That is about 2 yearly UK subscriptions at A, per month, whatever the price.

**What we get per sale:** see §1. Apple's 15% and the VAT or GST are already taken out.

**A simple model per 1,000 downloads, year 1, UK prices.**

Model assumptions, **not research**:
- 60% of payers choose yearly (the paywall leads with yearly and the free month), 40% monthly.
- Monthly payers stay 4 months on average, which fits RevenueCat's 14–26% first-year monthly retention and the tax-time pattern.
- The payment bands are 1.5%, 3% and 5% of downloads paying at some point in year 1, bracketing RevenueCat's freemium median of about 2%.
- The same bands are used for every option, so the table shows the effect of price alone.

| Option | Year-1 revenue per payer | 1.5% pay | 3% pay | 5% pay |
|---|---|---|---|---|
| A £3.99 / £29.99 | £17.22 | £258 | £517 | £861 |
| C1 £4.99 / £34.99 | £20.46 | £307 | £614 | £1,023 |
| C2 £4.99 / £39.99 | £22.58 | £339 | £677 | £1,129 |
| B £5.99 / £49.99 | £27.95 | £419 | £838 | £1,397 |

How to read it:
- **The question is whether a lower price brings in enough extra payers.** A needs 62% more payers than B to earn the same, and C2 needs 24% more. No source tells us the real figure for our users; only a live season will.
- **Year 2.** Yearly renewals add to this. If RevenueCat's tier figures hold (36% renew at low prices vs 23–26% at higher prices), A's renewals close part of the gap. The figures are M and the tier boundaries aren't public, so treat this as a hint, not a number.
- **Perks.** The perks "plus" adds no cost to us, because partners fund it (`decisions.md`). Its effect on conversion is unmeasured; `pro-value-plan.md`'s "1–2 points" is from a simulation.
- **US, Canada and Australia.** On the same mix, A earns about US$20.72, CA$26.16 and A$28.27 per payer in year 1 (computed from Apple's proceeds in §1). I haven't converted these to pounds, because no exchange rate was checked for this paper.

## 5. What Pro is worth to a user

- **The £2,640 is not Pro's value.** It is what 4,800 example miles are worth at HMRC's 55p rate (`website-claims-check.md`, H). That is a **deduction or claim value, not cash**, and the free plan already logs and values every drive. Pro's value is in the *outputs*: the itemised log and report, exports, quarterly figures, tax set-aside and the accountant hand-off. Any comparison should be with that, not with the £2,640.
- **What the £2,640 is roughly worth in tax.**
  - **Self-employed, basic rate:** 20% income tax plus 6% Class 4 National Insurance means a £2,640 deduction cuts tax by about **£686**. The 6% rate for 2026–27 is from secondary sources such as [ByteStart](https://www.bytestart.co.uk/self-employed-tax/national-insurance/); confirm on gov.uk (**M**). A at £29.99 is 4.4% of that; C2 is 5.8%; B is 7.3%.
  - **An employee such as a care worker:** they claim the gap between HMRC's 55p and what their employer pays. Our **assumption:** the employer pays 30p, so 25p × 4,800 miles = £1,200 claimable, worth about **£240** in relief at basic rate. A is 12.5% of that; C2 is 16.7%; B is 20.8%. This is the group where price bites hardest.
- **A fair share.** There's no rule, but the competitor prices and the figures above suggest this:
  - Charge well under a tenth of the tax value for self-employed drivers. All four options manage that.
  - Keep employees' cost to roughly an eighth of their relief or less. Only A manages that.
  - Separately, people compare Pro with the cost of doing it another way: a spreadsheet (free, but time), the accountant's time to tidy a log, or a free FreeAgent account through their bank.
- **Wording.** The tax figures above are for this paper only. In the app and on the site, keep to the approved rules: two separate figures, never added together, and no "pays for itself" (`decisions.md`). Don't advertise "worth £686 in tax", because each person's tax position differs.

## 6. Trial, waitlist and founding testers

**Trial length.** RevenueCat's trial-length study covers 17,000+ apps from Aug 2025 to Jul 2026 (search summaries of [RevenueCat](https://www.revenuecat.com/blog/growth/free-trial-length) and [SaaStr](https://www.saastr.com/what-17000-subscription-apps-tell-us-about-free-trial-length-annual-plans-convert-86-better-with-30-day-trials-monthly-tops-out-at-two-weeks-and-ai-apps-hit-a-wall-at-16-days/); **M**):

| Plan | Trial | Trial-to-paid | First renewal |
|---|---|---|---|
| Yearly | 4 days or less | 24.0% | 18.3% |
| Yearly | **17–32 days** | **44.6%** | **47.5%** |
| Monthly | 10–16 days | 46.6% (the peak) | 72.0% |
| Monthly | 17–32 days | 43.7% | 77.5% |
| All plans | 5–9 days (about a week) | 37.4% median | — |
| Monthly, no trial | — | — | 49.5% |

- **Yearly: keep the free month.** It sits in the best-performing band, and App Store Connect already has it (`ONE_MONTH`, H). A 14-day trial falls in the 10–16-day band, for which the summaries give no yearly figure. 7 days is clearly worse.
- **Monthly: no trial.** The evidence favours about two weeks on monthly plans. But for us, a monthly trial lets someone take a free fortnight around a tax deadline, export, and leave without paying. Apple also allows only **one introductory offer per subscription per territory, and one per customer per subscription group** ([Apple](https://developer.apple.com/app-store/subscriptions/), H). So the free month on yearly is the one most people will use anyway. Revisit if monthly sales are weak.
- **The trial must be shown properly:** its length and what is charged afterwards, at the trial itself (`pro-price-display.md` §2; App Review Guideline 3.1.2).

**Waitlist reward (3 months free, doesn't renew).**
- **Revenue effect:** none during the 3 months. Afterwards, a waitlister must choose to subscribe. With a mid/late October launch (`launch-playbook.md`), their free months cover the 31 Jan Self Assessment deadline, Pro's busiest moment. Some who would have paid in January will have used the free months instead.
- **Size of the cost:** `website-claims-check.md` sized this at a few hundred pounds of delayed revenue at the expected list size. At most, each waitlister who would otherwise have paid during those 3 months costs one payer's year-1 revenue (£17.22 at A, £27.95 at B, from §4). Most cost less, because a yearly buyer is only delayed. It is small whatever the price.
- **Trial:** the decision says the code "can't be combined with the free trial". Whether Apple still offers the free month to someone who has used a code isn't stated on the pages I read (**L**), so we enforce it ourselves. **Test it with a sandbox account before launch.**
- **Price:** it doesn't affect which option to pick. But the email and the paywall must say what it costs afterwards ("then £3.99 a month or £29.99 a year").

**Founding testers (12 months free).** They bring no revenue until about Oct/Nov 2027. They are few (`founding-testers.md`) and they are the reviews and word of mouth we need, so the cost is negligible at any price. Under the Small Business Program, free days make no difference to Apple's commission. (Without it, free trials and free offers don't count towards Apple's "one year of paid service" ([Apple](https://developer.apple.com/app-store/subscriptions/), H).)

## 7. Recommendation, gates and changing price later

**Pick: A, £3.99 / £29.99** (US$3.99 / 29.99, CA$4.99 / 37.99, A$5.99 / 44.99), with a free month on yearly and no trial on monthly. Show it as the plain price, not "launch" or "introductory".

**Before the website shows a price** (owners in brackets):
1. Set A in App Store Connect: the UK as base, then manual CA$37.99 and A$44.99 for yearly. That needs your sign-off, then the release agent does it.
2. Update the demo paywall (`pro.tsx` line 46), the en-US listing and `offer-code-setup.md` to A (coding and app-store agents; details in `pro-price-display.md` §3).
3. Optional, your call: a "keep your price" promise for first-year subscribers. If we make it, every later price rise must keep existing subscribers on their price.

**What to watch, and when to move.** First read on 7 Feb 2027 (after UK Self Assessment); second on 1 Aug 2027 (after Australia's 30 Jun year-end and the US 1040-ES quarter).

| Measure | Benchmark (RevenueCat, M) | If we beat it | If we miss it |
|---|---|---|---|
| Yearly trial-to-paid | about 45% median for month-long trials | Price isn't holding people back. Move new subscribers to **C2, £4.99 / £39.99**, keeping existing ones on their price | If trial starts are high but payment is low, look at the Pro features and the paywall first, not the price |
| Download-to-paid by day 35, and by 31 Jan | 2.0% (freemium 2.1%) | As above | If below 1% at £3.99, a lower price won't fix it. Look at the paywall and the free/Pro line |
| Yearly share of sales | our assumption: 60% | — | If monthly dominates, test a stronger yearly offer before changing the price |
| Refunds and 1–2-star reviews mentioning price | none | — | Any sign that price is a problem: hold, don't raise |
| Waitlist code users who subscribe after 3 months | no benchmark | — | — |
| Australian and Canadian conversion against the UK | — | — | If much weaker, check the local price before cutting the UK price |

- **No native A/B price tests.** App Store Connect has no simple A/B test for subscription prices, and a third-party tool would put purchase data on someone else's servers, which sits badly with our privacy promise. So test **one change at a time, in sequence**, and compare seasons.

**What changing price involves on Apple** ([Manage pricing for auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/), read 3 Oct 2026, **H**):
- **Price decrease:** existing subscribers automatically renew at the lower price. We can't keep anyone on the higher price, and the decrease can't be undone (only followed by a new increase).
- **Price increase:**
  - We can choose **"keep the current price for existing subscribers"**, with no limit on numbers. Lapsed subscribers can rejoin at their kept price within 60 days.
  - If we don't keep it, Apple notifies people itself: an email 27 days before renewal, an in-app message, and a push 7 days before.
  - **Consent is needed only if:**
    - the subscriber's region requires consent for any price change; or
    - the increase is **over 50% and** over about US$5 a period (monthly) or US$50 a year (yearly); or
    - they already had an increase in the last 12 months.
  - A non-consenting subscriber's plan ends at the end of the period.
  - **Moving A to C2** (+£1 a month, +£10 a year) needs no consent. Even **A to B** (+50.1% but only £2 a month; +67% but only £20 a year) stays under the US$5 / US$50 limits. So consent mainly matters for a second rise within 12 months.
- **UK and other law:**
  - The UK's new subscription contract rules (DMCC Act Part 4 Ch 2) are expected in 2027 (`pro-price-display.md`, M). Re-check before any increase.
  - Any "introductory" or "launch price" claim needs a stated end date and a real increase afterwards. Sources: the ASA's advice on introductory offers (search summary of [ASA: Promotional savings claims](https://www.asa.org.uk/advice-online/promotional-savings-claims.html), M); CMA209 covers "after-promotion / introductory prices" as a reference-price type ([CMA209, 13 Feb 2026](https://assets.publishing.service.gov.uk/media/698f4e3e7da91680ad7f4417/CMA209_Unfair_commercial_practices__price_transparency_13.2.26.pdf), M).
  - The US, Canada and Australia have similar rules against misleading future-price comparisons. These were not checked in detail (**L**), so the same advice applies: don't use the label unless we commit to the date.

**Why decreases being easy doesn't favour starting at B.**
- Starting high and cutting later is the simplest Apple path.
- But our one big season (Jan 2027 in the UK) would then run at the higher price, with no ratings, priced above MileClear.
- Starting at A and raising **for new subscribers only** is almost as simple, and nobody's bill goes up.

## Conflicts and flags

- **App Store Connect (£5.99 / £49.99) conflicts with `decisions.md` (£3.99 / £29.99).** It must be changed before any price is shown. Unchanged from `pro-price-display.md`.
- **`pricing-simulation.md`'s local prices** ($4.99 / $37.99, C$6.99 / C$51.99, A$7.99 / A$57.99) are superseded. They ignored the VAT Apple strips out.
- **`uk-competitors-pricing.md`** (1 Oct) suggested £4.99 / £44.99 to match MileClear. This paper keeps A and puts £4.99 / £39.99 as the next step.
- **Trial length:** App Store Connect and the listing say one month, while `pricing-simulation.md` said 14 days. This paper backs one month on yearly.
- **Driversnote's free limit** (15 or 20 trips) is still unconfirmed.
- **The "Solo" app** may not be the one meant (§2).
- **RevenueCat figures** are from search summaries (the site is blocked here). The revenue-mix figures conflict between summaries.
- **The redemption server's cost** isn't recorded anywhere. It's the founder's Monday item.

## Sources (all checked 3 Oct 2026)

- **App Store Connect API**, app 6817748981: price points, equalisations and current prices (GET only). H.
- **Apple:**
  - [Manage pricing for auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/)
  - [Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/)
  - [Small Business Program](https://developer.apple.com/app-store/small-business-program/)
  - [Apple Developer Program](https://developer.apple.com/programs/)

  All H.
- **App Store listings:** linked in §2. H for prices, as summarised by the fetch tool.
- **RevenueCat:** [State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps); [trial length study](https://www.revenuecat.com/blog/growth/free-trial-length); [SaaStr summary](https://www.saastr.com/what-17000-subscription-apps-tell-us-about-free-trial-length-annual-plans-convert-86-better-with-30-day-trials-monthly-tops-out-at-two-weeks-and-ai-apps-hit-a-wall-at-16-days/). M (search summaries only).
- **Pay data:** Skills for Care (M); [Gridwise](https://gridwise.io/blog/how-much-do-uber-drivers-make) (M, competitor source); UK courier pay from aggregators (L).
- **FreeAgent** [free with NatWest group banks](https://www.freeagent.com/pricing/free-accounting-software/) (M). **Intuit** [QBSE to Solopreneur](https://quickbooks.intuit.com/learn-support/en-us/help-article/migrate-services/switch-quickbooks-self-employed-quickbooks/L3pEGh1f5_US_en_US) (M).
- **ASA and CMA** on introductory prices: M (search summaries; asa.org.uk and gov.uk are blocked here).
- **Cloudflare Workers pricing:** M (search summaries).
- **Earlier notes this builds on:** `pro-price-display.md`, `pricing-simulation.md` (simulation), `pro-value-plan.md`, `pro-perks-rules.md`, `decisions.md`, `website-claims-check.md`, `website-comparison-sources.md`, `uk-competitors-pricing.md`.
