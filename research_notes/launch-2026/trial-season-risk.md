# The free Pro month: what stops someone taking it at year end for the report, then cancelling?

*Research agent, 3 Oct 2026. For the founder's question about the yearly plan's free month. It builds on `pricing-case.md`, `pro-price-display.md` and `decisions.md` (3 Oct, "Pro price set, with a price promise").*

*Confidence: **H** = primary source (Apple's own pages or API docs); **M** = a search summary of a primary source, or a law-firm or trade source; **L** = an aggregator or a single report. **Assumption** marks a modelling choice, not research. The money figures in §3 are a **model, not research**.*

## Short answer

- **Nothing stops it, once.** Someone can start the free month in January, export the report and cancel the same day. Apple gives each Apple Account **one introductory offer per subscription group, ever** (H). So the free route works once per person, not every year. After that, a one-report user's cheapest honest option is one month at £3.99.
- **The most we can lose is small.** The real alternative for a one-report user is one month of monthly Pro, which earns us £2.82 in the UK. On `pricing-case.md`'s assumptions, closing the loophole would recover about **£4–£28 per 1,000 downloads**. Every fix (a shorter trial, no trial, or a limited trial) costs more than that, unless it loses fewer than about one yearly subscriber per 1,000 downloads.
- **The first season barely exposes us.** We launch in mid/late October 2026, so on 31 Jan 2027 nobody has a 2025–26 log in MileSprout. US and Canadian users will have about 2½ months of 2026. The first real exposure is Australia, Jul–Oct 2027, then the UK in Jan 2028.
- **Recommendation: option 4.** Accept the risk and keep the free month, with four cheap guards (§5). Then measure it in the first real season before changing anything.

| Option | Year-1 revenue per 1,000 downloads (UK prices, 3% pay, model) | Change vs keeping the month | Stops the one-report user? | Apple / legal risk |
|---|---|---|---|---|
| **4. Accept the risk (keep the 1-month trial)** | **£517** | — | No (once per Apple Account) | Low |
| 1a. 14-day trial on yearly | £452 | −£65 | **No**: 14 days is plenty for one export | Low |
| 1b. 7-day trial on yearly | £392 | −£125 | **No** | Low |
| 2. No trial on yearly | £429–£503 | −£14 to −£88 | Yes: they pay £3.99 monthly or leave | Low |
| 3. Limited trial (watermarked report) | £482–£505 | −£11 to −£35 | Mostly | **Medium**: possible App Review and "free trial" wording problems |

*The ranges cover 3 to 20 one-report users per 1,000 downloads, and a mild or a heavy fall in yearly sales. All the inputs are assumptions (§3).*

---

## 1. Apple's rules

### 1.1 Who can get the free month

| Claim | Source | Conf. |
|---|---|---|
| "New and returning customers are only eligible to use one introductory offer per subscription group." Example: someone who used a free trial and upgrades within the group "aren't eligible for the second offer". | [App Store Connect Help: Set up introductory offers](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions) | H |
| "Customers can redeem one introductory offer per subscription group." | [Apple: Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/) | H |
| `Product.SubscriptionInfo.isEligibleForIntroOffer` (iOS 15+) "is true if the customer is eligible for an introductory offer on this auto-renewable subscription, or any auto-renewable subscription in the same subscription group". It "may be true even if you haven't set up an introductory offer". There is also a static `isEligibleForIntroOffer(for: groupID)` (iOS 15+). | [StoreKit docs](https://developer.apple.com/documentation/storekit/product/subscriptioninfo/iseligibleforintrooffer) | H |
| **The app already checks this.** `milemint/src/purchases/store.ts` line 77 calls `isEligibleForIntroOfferIOS(group)`, so the paywall offers the trial only to eligible people and counts "unknown" as eligible. | Repo | H |
| **Offer codes don't use up the free month.** If an offer code is set not to combine with the introductory offer, then: "If they cancel and resubscribe at any point, they're still eligible to redeem an introductory offer." | [App Store Connect Help: Set up offer codes](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-offer-codes) | H |

**What the app can see** (all available on iOS 16.4; no iOS 17-only APIs needed):
- **Whether the current period is a trial:** `Transaction.offerType == .introductory` (iOS 15–17.1, deprecated in 17.2 but still works). Use `Transaction.offer` on iOS 17.2+ behind an availability guard. **H.**
- **Whether they have cancelled:** `RenewalInfo.willAutoRenew` (iOS 15+) is false once auto-renew is off. **H.**
- **Access after cancelling:** cancelling in a third-party app's trial normally keeps access until the trial's end date. Apple's advice is to cancel "at least 24 hours before the trial ends" ([Apple Support 118428](https://support.apple.com/en-us/118428), via a search summary; support.apple.com is blocked here). **M.** In practice, someone who cancels on day 1 still has the whole month.
- **A second Apple Account** would give a second free month. That takes real effort (changing the App Store account on the phone), we can't measure it, and it is negligible.

**Flag: conflicts with `decisions.md`.** The waitlist decision says the code "can't be combined with the free trial". That holds *at the same time*. But after the non-renewing 3 months (or the testers' 12) end, the person **can** still take the yearly free month later, for example in Jan 2028. That is lawful and fair, but it means waitlisters can get 3 + 1 months free and testers 12 + 1. Set the codes to "No" (don't combine), as planned, and test it in sandbox.

**Founding testers' code.** `website-claims-check.md` (line 170) says it is **non-renewing**, like the waitlist code. `decisions.md` says only "testers get 12 months instead". **Tick "no auto-renew" when the 12-month code is created**, because it can't be changed afterwards. If it did renew, California would need a reminder 3–21 days before the 12 free months end (§4.3).

### 1.2 Can the trial limit features?

Guideline text, read from [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) on 3 Oct 2026 (**H**):
- 3.1.2(a): "Auto-renewable subscription apps may offer a free trial period to customers by providing the relevant information set forth in App Store Connect."
- 3.1.2(a): "Apps that attempt to scam users will be removed… This includes apps that attempt to trick users into purchasing a subscription under false pretenses or engage in bait-and-switch and scam practices."
- 3.1.2(c): "Before asking a customer to subscribe, you should clearly describe what the user will get for the price."
- Apple's subscription page: "In the purchase flow for a free trial, clearly indicate how long the free trial lasts and the price billed once the free trial is over." ([Apple](https://developer.apple.com/app-store/subscriptions/), H)
- StoreKit's definition: with a free trial, "new subscribers access content for free for a specified duration" ([Implementing introductory offers](https://developer.apple.com/documentation/storekit/implementing-introductory-offers-in-your-app), H).
- The trial wording the brief quotes is in **3.1.1**, which covers *non-subscription* trials. It requires the app to "clearly identify its duration, the content or services that will no longer be accessible when the trial ends, and any downstream charges". It does not govern our subscription trial.

**What this means:**
- **No guideline text bans a reduced-feature trial.** I found no "a free trial must offer full access" wording. **M**: there is no explicit ban, but this is my reading, not Apple's ruling.
- **But the risk is real.** Apple's own definition says the trial gives access to the content, and 3.1.2(c) and the bait-and-switch rule apply. A paywall saying "1 month free" that then delivers a watermarked report, without saying so first, risks rejection.
- **The same applies under UK, US and Australian consumer law.** Calling it a free trial of Pro while holding back the main Pro feature is misleading unless the limit is stated prominently at the offer.
- **So option 3 is lawful only if it is stated before purchase,** for example "Free month: reports made during it carry a 'Trial' mark". How App Review would treat it is **L**: no Apple statement either way.
- **Apple is strict on trial presentation in 2026.** Since January 2026 it has been rejecting "free trial toggle" paywalls under 3.1.2 as "confusing and misleading" ([Adapty](https://adapty.io/blog/your-toggle-paywall-is-about-to-get-rejected/), [RevenueCat](https://www.revenuecat.com/blog/growth/rip-toggle-paywall); trade sources, **M**). Our paywall has no toggle. Keep it that way.

## 2. What competitors do

Checked 3 Oct 2026. The company sites (mileiq.com, driversnote.com, triplog.net, everlance.com, quickbooks.intuit.com) are blocked from this session, so I used App Store listings (H for what the listing says) and search summaries of help pages (M or L).

| App | Trial | Reports in trial / on free | Cap instead? | Source | Conf. |
|---|---|---|---|---|---|
| **MileIQ** | Listing says "Start with a free trial" with no length. An earlier note (`uk-competitors-pricing.md`) says 7 days. MileIQ for Teams: 30 days | UK listing: download your HMRC-friendly log "as a premium member". Trial users get Premium | **Yes: 40 free drives a month** | [US listing](https://apps.apple.com/us/app/mileage-tracker-by-mileiq/id578830929), [GB listing](https://apps.apple.com/gb/app/mileage-tracker-by-mileiq/id578830929), [Teams trial help](https://support.mileiq.com/hc/en-us/articles/18839544791060-MileIQ-for-Teams-How-do-I-start-a-free-trial) | M (personal trial length unconfirmed) |
| **Driversnote** | No timed trial: "You can trial the app for as long as you need" | Free plan can "create reports for up to 15 trips per month" | **Yes: a report cap** (15/month; earlier notes say 15 or 20, which conflict) | [Help centre](https://driversnote.helpscoutdocs.com/article/492-is-there-a-free-trial-how-long-does-it-last) (search summary) | M |
| **TripLog** | **One free 7-day Premium Pass a year**, refreshing on 1 Jan, "to create and download annual mileage reports" | Basic is unlimited logging. Reports come through the pass or Premium | No drive cap | [TripLog update](https://updates.triplog.net/publications/introducing-triplog-basic-unlimited-automatic-mileage-tracking-is-now-free) (search summary); `uk-competitors-pricing.md` | M |
| **Everlance** | "Starter and Professional both include a free 7-day trial" | **Reports are on the free plan** | **Yes: 30 automatic trips a month** | [US listing](https://apps.apple.com/us/app/mileage-tracker-by-everlance/id985378916) | H |
| **MileClear** (UK) | **None listed** | All exports are Pro (CSV, PDF trip report, Self Assessment PDF) | No: "Tracking is unlimited and free, forever" | [GB listing](https://apps.apple.com/gb/app/mileclear-mileage-tracker-uk/id6759671005) | H |
| **Stride** (US) | No subscription to trial | **Tax report free** (PDF and CSVs); funded by health-insurance sales | No | [US listing](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359) | H |
| **QuickBooks Solopreneur** | 30 days free, or 50% off for 3 months; then $20 a month | Mileage log and tax reports included | No free plan | Search summaries of [Intuit](https://quickbooks.intuit.com/solopreneur/mobile-app/) and [FitSmallBusiness](https://fitsmallbusiness.com/quickbooks-solopreneur-review/) | M |

**What this shows:**
- **Nobody watermarks or limits reports during a timed trial** (none found).
- The capped apps (MileIQ, Driversnote, Everlance) protect revenue with **drive or report caps**, not trial tricks. We ruled caps out: "unlimited, free, private" is our edge.
- **MileClear, our closest model, has no trial at all.** So for it the "one report a year" user simply pays one month (£4.99). That is exactly option 2.
- **TripLog openly gives one free annual report a year.** It treats the year-end report as goodwill, not revenue.

## 3. Model: options 1–4 per 1,000 downloads

**Reused from `pricing-case.md` §4 (all assumptions, L):**
- 1.5%, 3% or 5% of downloads pay in year 1.
- 60% of payers choose yearly and 40% monthly.
- Monthly payers stay 4 months.
- UK proceeds are £21.18 per yearly sale and £2.82 per month.
- At 3% paying, that gives 18 yearly and 12 monthly payers, £517.

**New inputs:**

| Input | Value | Basis |
|---|---|---|
| Yearly trial-to-paid, 1-month trial | 44.6% | RevenueCat, yearly plans with 17–32-day trials (M, from `pricing-case.md` §6). So about **40 trial starts** per 1,000 at 3% paying |
| 14-day trial | 37% | **Assumption.** RevenueCat gives no yearly figure for 10–16 days; 37.4% is its all-plans median for 5–9 days |
| 7-day trial | 30% | **Assumption**, between RevenueCat's 24.0% (4 days or less) and 37.4% |
| One-report users ("G") per 1,000 | **3 in year 1**, about **10 later** (up to 20) | **Assumption.** In year 1 almost nobody has a logged tax year (see seasonality below). Later, about half the ~22 trial starters who don't convert. G can't exceed the non-converters, so G=20 at the 1.5% band is not possible |
| If the free route is closed, how many one-report users pay one month | 50% | **Assumption.** The rest use a spreadsheet, their bank's FreeAgent, or nothing |
| Option 2: yearly sales without a trial | −33% (heavy) or −10% (mild), with half the lost going monthly | **Assumption.** No source found for trial vs no trial on yearly in this category |
| Option 3: trial-to-paid with a watermarked trial | 40% | **Assumption**: friction for genuine triallers |
| Year-2 renewal of yearly subscribers | 36% | RevenueCat, low-priced yearly plans (M, `pricing-case.md`) |

**Results at 3% paying (UK £; "year 2" adds the renewals of year-1 yearly subscribers):**

| Option | G=3 (year 1) | G=10 | G=20 | With year-2 renewals (G=10) |
|---|---|---|---|---|
| 4. Keep the month | £517 | £517 | £517 | £654 |
| 1a. 14-day | £452 | £452 | £452 | £565 |
| 1b. 7-day | £392 | £392 | £392 | £484 |
| 2. No trial, heavy drop | £429 | £438 | £452 | £530 |
| 2. No trial, mild drop | £493 | £503 | £517 | £626 |
| 3. Watermarked trial | £482 | £491 | £505 | £614 |

At 1.5% paying, everything scales to about half; at 5%, about 1.7×. The order stays the same, except that option 2 (mild) and option 3 draw level with option 4 at G=20. Script: the scratchpad `model.py` for this session, not kept.

**The break-even:**
- Closing the loophole recovers at most G × 50% × £2.82: **£4 at G=3, £14 at G=10, £28 at G=20.**
- That equals **0.2, 0.7 and 1.3 yearly subscribers per 1,000 downloads** (0.15, 0.5 and 1.0 once renewals are counted).
- Any fix that costs more yearly sales than that loses money.
- **Shorter trials (1a, 1b) are the worst of both worlds.** They don't stop the one-report user, since a week is enough to export, and they cut genuine yearly sales.

**Seasonality** (dates from `launch-playbook.md`; primary pages: [gov.uk Self Assessment](https://www.gov.uk/self-assessment-tax-returns/deadlines), [IRS](https://www.irs.gov/filing/individuals/when-to-file), [CRA](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deadlines-tax-return-payment.html), [ATO](https://www.ato.gov.au/individuals-and-families/your-tax-return/how-to-lodge-your-tax-return/when-to-lodge-your-tax-return). gov.uk, canada.ca and ato.gov.au are blocked here, so the dates are carried over from that note: **M**):

| Country | Year-end crunch | Log in MileSprout by then (launch mid/late Oct 2026) | One-report exposure |
|---|---|---|---|
| UK | 31 Jan 2027 (2025–26 return) | **None**: the year ended 5 Apr 2026 | ~0 in 2027. **First real season: Jan 2028** |
| UK MTD (over £50k, from Apr 2026) | Quarterly: 7 Nov, 7 Feb, 7 May, 7 Aug | Ongoing | **Low.** Four deadlines a year and one trial per Apple Account, so MTD users need Pro all year |
| US | 15 Jan (Q4 estimate), 15 Apr filing; estimates 15 Apr, 15 Jun, 15 Sep | ~2½ months of 2026 | Small in 2027; real from Jan–Apr 2028. Most W-2 employees can't deduct mileage (`tester-tour.md`, IRS Pub 463), so their report is for employer reimbursement |
| Canada | 30 Apr; self-employed file by 15 Jun (pay by 30 Apr) | ~2½ months of 2026 | Small in 2027; real from 2028 |
| Australia | 31 Oct 2027 (self-lodgers, 2026–27 year) | ~8 of 12 months | **First real exposure: Jul–Oct 2027** |
| Waitlist (3 months, non-renewing) | Runs about Nov 2026–Feb 2027 | — | Covers the UK's 31 Jan and MTD 7 Feb. They can still take the free month later (§1.1) |
| Founding testers (12 months, non-renewing) | Runs about Oct 2026–Oct 2027 | — | Covers US/CA 2027 and AU 2027. Same 12 + 1 point. Only a few people |

## 4. Other levers

### 4.1 Year-round Pro value (reduces cancelling)
- **MTD quarterly figures and tax set-aside** are needed every quarter and every week, so they are the natural reasons to keep Pro after a report.
- **The Pro perks "plus"** is a weekly reason to stay, once the redemption server is live (`decisions.md`).
- Tax set-aside can also be earned by inviting friends (`plan.ts`). That is fine, but it means set-aside alone doesn't hold someone on Pro.

### 4.2 A "your trial ends in 3 days" reminder
- **Already built.** `milemint/src/purchases/trial-reminder.ts` schedules a local notification three days before a free trial ends. It runs only when notifications are already allowed, never asks for permission, and doesn't fire for code purchases. **Keep it.**
- **What Apple does.** Apple's developer pages don't promise a trial-ending email (H, pages read). Apple Community reports conflict (L). So **don't rely on Apple** and don't write "Apple will remind you".
- **What the law requires:**
  - **UK, DMCC Act Part 4 Ch 2:** reminder notices before a free trial ends, then a **14-day cooling-off period after the trial ends** and after 12-month renewals. The start date is **January 2027** ([Bird & Bird](https://www.twobirds.com/en/insights/2026/uk/subscription-contract-changes-to-be-brought-forward-to-january-2027)), against spring 2027 in the government response (`pro-price-display.md`). **M.**
    - Apple is the merchant of record. Whether the duties fall on Apple, on us, or on both isn't settled in anything I read (**L**). **Flag for a legal check before Jan 2027.**
    - The cooling-off period means a UK trialler charged by mistake can still back out. That makes the "trap" revenue even less worth chasing.
  - **California ARL (B&P 17602):** a reminder 3–21 days before the end is needed only for free periods **over 31 days** ([Davis+Gilbert](https://www.dglaw.com/californias-amended-automatic-renewal-law-takes-effect-july-1-2022-what-subscription-based-companies-need-to-know/), M). Our one-month trial is at or under the limit. The 3- and 12-month codes don't renew, so no reminder is needed.
  - **Australia:** the subscription-trap ban starts on 1 Jul 2027 (`pro-price-display.md`, M).

### 4.3 Show £3.99 a month as the honest choice
- After the free month is used (always the case from year 2), a one-report user should see plainly: **"Need one report a year? Pro monthly is £3.99, and you can cancel after."**
- That earns £2.82 per one-report user every year after their trial, honestly. It also fits the "keep your price" promise and RevenueCat's evidence that monthly payers mostly leave within the year anyway.
- **Do not** hide monthly behind "more plans" or pre-select yearly with a toggle.

### 4.4 Ethical and regulatory limits (no dark patterns)

Don't use:
- countdowns or "offer ends" around deadlines;
- "you'll lose your report" scares (free users keep every drive; that is our promise);
- a cancel flow that blocks or delays (Apple runs cancellation, so we just link to it);
- an in-app interstitial when `willAutoRenew` turns false;
- "free report" marketing around deadlines. Year-end pushes should lead with "start your log", not "get your report free".

Sources: ASA subscription guidance and CMA209 (UK), ROSCA and state ARLs (US), ACL (AU), all in `pro-price-display.md`.

### 4.5 Not recommended now: a TripLog-style free annual report
- One free year-end report a year for everyone would remove the motive to game the trial.
- But it gives away Pro's main paid feature **every year**, whereas the trial gives it away **once per account**.
- Revisit only if the 2028 season shows reviews calling the report paywall unfair.

## 5. Recommendation

**Option 4: keep the free month on yearly, no trial on monthly, and add these guards:**
1. Keep the 3-day trial reminder (built) and the existing eligibility check (built).
2. Add the honest "One report a year? Monthly is £3.99" line on the paywall, when the user isn't eligible for the trial or chooses monthly. That needs marketing copy and the 10 languages.
3. Set the waitlist and tester codes to non-renewing and "don't combine". Sandbox-test that the free month is still offered after the code ends.
4. **Measure, then decide.** From Jul 2027 (AU) and Jan 2028 (UK), track:
   - the share of yearly trials cancelled within 7 days of starting, by month;
   - yearly trial-to-paid.

   If season cancellations are over half of all trials **and** trial-to-paid is under 35% (against the ~45% benchmark), test option 2 or a clearly labelled option 3 in one country for one season. Apple's renewal counts in App Store Connect / Sales and Trends show this without any third-party SDK.

**Risks of this recommendation:**
- **The assumptions are unmeasured.** If one-report users far exceed ~20 per 1,000, or yearly sales hardly depend on the trial, option 2 would earn more. The gap is small either way (about £14–£28 per 1,000).
- **Review and driver-group posts.** "Free month, got my report, cancelled" may spread as a tip. That costs at most one £3.99 month per person, once.
- **UK DMCC duties (from Jan 2027)** may land on us as well as Apple. This needs a legal check.
- **Waitlisters and testers get 3 + 1 and 12 + 1 months.** That is small in numbers, but it is a promise-adjacent detail: don't say "can't be combined" in a way that implies they never get the trial.

## Conflicts and flags
- `decisions.md` says the waitlist code "can't be combined with the free trial". It is true at the same time, but not afterwards (§1.1).
- MileIQ's personal trial length (7 days in `uk-competitors-pricing.md`) isn't confirmed by today's listings.
- Driversnote's free report limit: 15 (help centre) vs 20 (earlier note). Unresolved.
- UK subscription-regime start: January 2027 (Bird & Bird) vs spring 2027 (government response). The later announcement wins; confirm on gov.uk.
- The company sites and support.apple.com were blocked here. Rows using them are M.

## Sources (all checked 3 Oct 2026)
- Apple: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/); [Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/); [Set up introductory offers](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions); [Set up offer codes](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-offer-codes); StoreKit [`isEligibleForIntroOffer`](https://developer.apple.com/documentation/storekit/product/subscriptioninfo/iseligibleforintrooffer), [Implementing introductory offers](https://developer.apple.com/documentation/storekit/implementing-introductory-offers-in-your-app), `Transaction.offerType` / `offer`, `RenewalInfo.willAutoRenew` (docs JSON). All H.
- App Store listings: MileIQ (US, GB), Driversnote (US), Everlance (US), MileClear (GB), Stride (US). H for what the listings say.
- Help pages and trade sources: Driversnote help centre, TripLog update, MileIQ support, QuickBooks (search summaries, M); Adapty and RevenueCat on toggle paywalls (M); Bird & Bird on the DMCC start date (M); Davis+Gilbert on the California ARL (M).
- Repo: `pricing-case.md`, `pro-price-display.md`, `decisions.md`, `website-claims-check.md`, `launch-playbook.md`, `milemint/src/purchases/store.ts`, `milemint/src/purchases/trial-reminder.ts`, `milemint/src/domain/plan.ts`.
