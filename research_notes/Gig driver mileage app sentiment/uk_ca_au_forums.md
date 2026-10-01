# Gig courier / self-employed driver mileage-tracking sentiment — UK, Canada, Australia (Reddit + public forums)

> **READ FIRST — major access limitation (research run 2026-10-01).**
> No verbatim community quotes could be collected in this run. Treat this file as a **source map + secondary-context file, NOT an evidence file of community sentiment.**
> - **Reddit:** WebSearch refuses `reddit.com` as a domain ("The following domains are not accessible to our user agent: ['reddit.com']"). Unfiltered searches that include the word "reddit" return only vendor/SEO pages, never reddit permalinks. A direct Reddit JSON fetch via Bash was denied by the session's permission classifier, and I did not retry it.
> - **Forums:** The organisation's network egress proxy blocked WebFetch to forums.moneysavingexpert.com, forums.whirlpool.net.au, www.theanswerbank.co.uk, uk.trustpilot.com and apps.apple.com (`EGRESS_BLOCKED`). Per proxy policy, these were not retried or routed around.
> - So **every forum item below is a thread title/URL found by search, plus at most the search engine's paraphrased snippet.** None are verbatim quotes. **Do not present any of this as a direct quote from a driver.** Vendor/blog material is labelled [VENDOR] or [SECONDARY] and is marketing, not community sentiment.
> - To finish the objective, someone needs to fetch these from a machine/session where reddit.com, MSE, Whirlpool, RedFlagDeals, Trustpilot and the App Store are allowed (see "Gaps").

## UK — what couriers say about claiming mileage, apps used, dislikes/wants, MTD

### Takeaway
I couldn't get any first-hand UK courier quotes (Reddit and MSE were blocked). Search did turn up several relevant MSE threads that are worth fetching later. Secondary sources agree on the factual frame: the HMRC simplified rate (45p, now reported as 55p from 6 Apr 2026) replaces all other vehicle costs, a contemporaneous log is expected, and Amazon Flex does not report mileage. Several new UK-specific "free" tracker apps (MileClear, PocketReceipt, MileLog, Trippi, KeptMiles) are targeting couriers. That suggests a crowded and fragmenting UK market.

### Cited Findings
- **MSE threads to fetch (titles/URLs only; contents not retrieved):**
  - "Courier mileage allowance - help!" — [MSE](https://forums.moneysavingexpert.com/discussion/5750665/courier-mileage-allowance-help)
  - "Uber Eats delivery drivers and tax". The search snippet paraphrase says Uber Eats drivers "can claim expenses for mileage at 45p per mile, along with the essential extra car insurance, the delivery bag and the DBS fee" (paraphrase by the search engine, not a verbatim quote; date unknown) — [MSE](https://forums.moneysavingexpert.com/discussion/6624959/uber-eats-delivery-drivers-and-tax)
  - "Universal Credit and Flat rate Mileage". Snippet paraphrase: under UC, own-car business use is claimed "at 45p per mile for the first 833 miles per month, and 25p per mile after that". This points to a UC-specific monthly reporting pain point for gig drivers (UC uses monthly self-employed reporting) — [MSE](https://forums.moneysavingexpert.com/discussion/6406555/universal-credit-and-flat-rate-mileage)
  - "Just Eat and Universal Credit" — [MSE](https://forums.moneysavingexpert.com/discussion/6216006/just-eat-and-universal-credit)
  - "Amazon flex driver rip off" — [MSE](https://forums.moneysavingexpert.com/discussion/6023224/amazon-flex-driver-rip-off)
  - "Paid Mileage for Self-Assessment tax return" — [MSE](https://forums.moneysavingexpert.com/discussion/6497672/paid-mileage-for-self-assessment-tax-return)
  - "Mileage/ Petrol receipt for Newbie Self Employed" (older) — [MSE](https://forums.moneysavingexpert.com/discussion/3303600/mileage-petrol-receipt-for-newbie-self-employed)
  - "Reasonable mileage rate for delivery?" (old) — [MSE](https://forums.moneysavingexpert.com/discussion/96146/reasonable-mileage-rate-for-delivery)
  - "Amazon Flex Mileage Claim" (AnswerBank Q&A) — [AnswerBank](https://www.theanswerbank.co.uk/Business-and-Finance/Question1766104.html)
- **Search summary of the MSE threads:** the 45p rate "is intended to cover all vehicle-related costs", so drivers using it can't also claim MOT, insurance or road tax. This is a recurring point of confusion in those threads (search-engine paraphrase) — [MSE search results](https://forums.moneysavingexpert.com/discussion/6624959/uber-eats-delivery-drivers-and-tax)
- **Rate change [SECONDARY/VENDOR, unverified against gov.uk in this run]:** several 2026 UK pages state the first-10,000-mile rate rose from 45p to 55p from 6 April 2026, with 25p thereafter — [MileClear](https://mileclear.com/delivery-driver-mileage-tracker); [Amazon Flex page, MileClear](https://mileclear.com/amazon-flex-mileage-tracker). *Verify on gov.uk before relying on it. If true, it's a 2026 talking point that should show up in community threads.*
- **Amazon Flex doesn't track mileage [SECONDARY]:** "Amazon Flex does not track mileage for drivers. Drivers must track their own mileage" (search summary of vendor pages) — [MileageWise](https://www.mileagewise.com/gig-drivers-guide/amazon-flex-mileage-tracker/); [MileLog](https://www.milelog.app/en/blog/best-amazon-flex-mileage-tracker-uk)
- **UK competitor landscape (vendor pages found, all positioning at UK couriers):** MileClear ("Free, Every Platform", naming Uber Eats, Deliveroo, Just Eat, Amazon Flex, DPD, Evri, Stuart, Gophr) — [MileClear](https://mileclear.com/delivery-driver-mileage-tracker); PocketReceipt "Free App" for delivery drivers — [PocketReceipt](https://pocketreceipt.co.uk/delivery-drivers); Trippi comparison vs MileIQ/Driversnote — [Trippi](https://trippi.co.uk/blog/trippi-vs-mileiq-vs-driversnote); KeptMiles — [KeptMiles](https://keptmiles.app/blog/best-mileage-tracker-apps-uk.html); Startup Edit roundup for sole traders — [Startup Edit](https://www.startupedit.co.uk/guides/mileage-tracker-apps/); UK gig-tax content sites — [UgoTax](https://ugotax.com/2025/02/08/amazon-flex-tax-guide-for-self-employed-delivery-drivers/), [UKGigTax](https://www.ukgigtax.com/blog/amazon-flex-tax-guide-uk-2026)
- **Driversnote/MileIQ complaint themes [SECONDARY, review sites summarising app-store reviews; not verbatim]:** MileIQ reportedly misses trips under ~1 mile and ends a trip after a 15-minute pause (a problem for multi-drop couriers who wait at restaurants), needs connectivity at trip start, and is "super buggy" per some users. Driversnote reviews show a "recurring theme… of unreliability in automatic tracking", though a 2026 retest says those issues weren't reproduced. Battery drain is attributed more to MileIQ than to Driversnote — [Timeero MileIQ review](https://timeero.com/reviews/mileiq-review); [Timeero Driversnote review](https://timeero.com/reviews/driversnote-review); [MileageWise Driversnote review](https://www.mileagewise.com/mileiq-alternative/driversnote-review/). *These come from competitors (Timeero, MileageWise), so they're biased.*

### Inferences
- The UK has two distinctive pain points worth probing in real threads: (1) **Universal Credit monthly reporting** for gig drivers (the 833-miles-per-month framing), and (2) **Amazon Flex / parcel couriers getting no platform mileage data**. Both suggest demand for monthly, per-platform mileage summaries.
- The multi-drop, long-wait pattern of food couriers clashes with auto-trip logic like MileIQ's 15-minute pause cutoff. This is a plausible source of "missed miles" complaints, but it needs verbatim confirmation.
- The 45p→55p change (if confirmed) means old rate calculators and spreadsheets will be wrong for 2026/27, which is likely to cause confusion.

### Gaps
- **No verbatim quotes or permalinks** from r/deliveroos, r/Deliveroo, r/UberEatsUK, r/couriersofreddit, r/AmazonFlexDrivers, r/UKPersonalFinance, r/uktax or r/smallbusinessuk. Reddit was not accessible to the search tool or to fetch.
- I couldn't read MSE thread contents (egress-blocked), so there are no post dates, usernames or quotes.
- Nothing found on scooters/e-bikes (24p/20p rates), vans (simplified vs actual), Evri/DPD owner-drivers, FreeAgent/Xero/QuickBooks/HMRC tools, or **Making Tax Digital** sentiment among couriers. These weren't researched beyond the failed attempts.

## Canada — SkipTheDishes/DoorDash/Uber Eats/Instacart drivers on CRA logbook, business-use %, apps, Punjabi communities, winter/battery

### Takeaway
I found no community content (Reddit and RedFlagDeals searches returned only US/vendor pages). Secondary Canadian sources consistently describe the regime as T2125 actual expenses × business-use %, backed by a trip log. They claim CRA accepts app logs (MileIQ, QuickBooks Self-Employed). Driversnote runs Canada-specific gig guides (driversnote.ca). There's a Brampton-focused rideshare tax service, but no Punjabi-language driver discussion turned up.

### Cited Findings
- **CRA framing [SECONDARY]:** drivers report on Form T2125. The CRA log needs date, start, destination, purpose and km, and "Without a log, CRA will disallow vehicle deductions entirely on audit". "The CRA completely accepts digital mileage logs from apps like MileIQ or QuickBooks Self-Employed" (search summary of these pages) — [WealthNorth](https://wealthnorth.ca/taxes/self-employed/uber-driver-tax-guide-canada/); [BookZero](https://www.bookzero.ai/blog/uber-driver-tax-deductions-canada); [Instaccountant 2025 CRA changes](https://instaccountant.com/2025-cra-tax-changes-uber-ubereats-doordash-canada/); [LawyerInfo CRA audits of rideshare drivers](https://lawyerinfo.ca/guides/money-taxes-ip/cra-tax-disputes/cra-tax-audits-for-uber-and-rideshare-drivers-in-canada/)
- **Driversnote's Canadian content [VENDOR]:** [Uber Eats guide](https://www.driversnote.ca/gig-driving-guide-canada/uber-eats-driver-taxes-canada); [Uber driver guide](https://www.driversnote.ca/gig-driving-guide-canada/uber-driver-taxes-canada)
- **Spreadsheet competitor [VENDOR]:** a "2025 Canadian Gig Worker Tax Template" sold on Gumroad, with an automatic mileage calculator for business vs personal km and business-use % — [Gumroad](https://mnawaz.gumroad.com/l/gig-work-tax-tracker). This shows some drivers are offered or buy spreadsheets instead of apps.
- **Brampton-area service [VENDOR]:** a rideshare/Uber tax filing service targeting Brampton (a large Punjabi-Canadian driver community). It has no language-specific content in the search snippet — [Tax Filing Canada](https://taxfilingcanada.ca/expert-tax-services-for-uber-lyft-rideshare-drivers/)

### Inferences
- In Canada the usual method is actual costs × business-use %, not a per-km rate (CRA's per-km rates are for employer reimbursements). So drivers need total km plus business km, not just business trips. That's a different product requirement from the UK and AU.
- Accountants and filing services in Brampton/Surrey may be the real channel for Punjabi-speaking drivers. This is unverified.

### Gaps
- No quotes from r/PersonalFinanceCanada, r/cantax, r/SkipTheDishes, r/doordash_drivers (Canadian posts) or RedFlagDeals.
- Nothing on winter battery/GPS issues, Punjabi-language communities (Facebook/WhatsApp groups are likely but not public or searchable here), or Instacart-specific sentiment.

## Australia — Uber Eats/DoorDash/Menulog/Amazon Flex on cents-per-km 5,000 km cap vs logbook, GST/ABN, apps

### Takeaway
Whirlpool threads were found but couldn't be fetched, and Reddit was inaccessible. Secondary AU sources frame the decision as a choice between cents-per-km (capped at 5,000 km: 88c → $4,400 in 2025-26, reportedly 91c → $4,550 from 1 July 2026) and a 12-week logbook. They say the logbook typically yields far more for full-time delivery drivers. Driversnote and QuickBooks are the apps these guides name.

### Cited Findings
- **Whirlpool threads to fetch (titles/URLs only):** "Is the logbook method best? - Tax" — [Whirlpool](https://forums.whirlpool.net.au/archive/2427799); "profit from uber - Finance" — [Whirlpool](https://forums.whirlpool.net.au/archive/2675062); "Cents per KM reimbursement - Automotive" (employer-focused) — [Whirlpool](https://forums.whirlpool.net.au/archive/2306799)
- **Rates and comparison [SECONDARY]:** "For 2025-26, the rate is 88 cents per km, allowing for a maximum claim of $4,400… From 1 July 2026, the rate rises to 91 cents per km, lifting the maximum claim to $4,550." "A driver doing 15,000 work km earns ~$4,400 at cents per km, but typically $8,000-12,000 with logbook" (quoted in the search summary of these pages) — [AusTaxAI](https://austaxai.com.au/guides/uber-eats-driver-tax-deduction-australia); [TaxBNE](https://www.taxbne.com.au/blog-posts/uber-driver-tax-deductions); [Richify](https://www.richify.ai/au/guides/uber-eats-driver-tax); [AWTS](https://awts.net.au/blog/uber-delivery-driver-tax-deductions/); [DriveTax](https://drivetax.com.au/tax-deductions-for-uber-drivers/). *Verify the 91c 2026-27 figure on ato.gov.au.*
- **Apps named [VENDOR/SECONDARY]:** "An app like Driversnote or Quickbooks Self-Employed can be used to log kilometres and receipts" — [QuickBooks AU blog](https://quickbooks.intuit.com/au/blog/taxes/tax-deductions-delivery-drivers/)
- **Platform-reported km:** Uber AU publishes a guide to its tax summary terms. Whether its "online km" figures are trusted for logbooks wasn't fetched — [Uber AU](https://www.uber.com/en-AU/blog/delivery-understanding-your-tax-summary-terms-and-definitions)

### Inferences
- The 5,000 km cap makes cents-per-km a poor fit for full-time couriers. The real need is a 12-week ATO-compliant logbook plus odometer readings, which an app can automate. Expect community discussion to centre on "is the logbook worth the hassle".
- Uber's AU tax summary includes km data. Comparing it with app-tracked km is a likely trust and accuracy theme, but this is unverified.

### Gaps
- No quotes from r/AusFinance, r/UberEatsAU, r/ubereats (AU posts), r/tax or Whirlpool (fetch blocked).
- Not researched in this run: GST/ABN (rideshare passenger drivers must register for GST, but food delivery has a $75k threshold), Menulog (reportedly winding down; an Uber newsroom URL about redirecting Menulog users surfaced but wasn't fetched — [Uber AU newsroom](https://www.uber.com/en-AU/newsroom/menulog-redirect-users-and-merchants)), and Amazon Flex AU.

## Cross-cutting — trust in app vs platform miles, battery, accuracy, price, privacy, Android vs iPhone, language

### Takeaway
The only cross-cutting evidence obtainable was second-hand review summaries from competitor sites. They point to missed short trips and pause-cutoffs (MileIQ), auto-tracking unreliability (Driversnote, possibly fixed by 2026), and battery drain as the dominant complaint themes. A wave of "free" UK-specific trackers suggests price sensitivity. There's no community evidence on privacy, Android vs iPhone, or language.

### Cited Findings
- MileIQ: under-1-mile trips missed, 15-minute pause ends a trip, battery drain, offline inconsistency; Driversnote: "recurring theme… unreliability in automatic tracking", lower battery use, 2026 retest improved [SECONDARY, competitor-authored] — [Timeero MileIQ](https://timeero.com/reviews/mileiq-review); [Timeero Driversnote](https://timeero.com/reviews/driversnote-review); [Timeero Driversnote alternatives](https://timeero.com/post/driversnote-alternatives); [Timeero MileIQ alternatives](https://timeero.com/post/mileiq-alternatives)
- "Free" as a positioning lever in the UK courier niche: [MileClear](https://mileclear.com/mileage-tracker-uk); [PocketReceipt](https://pocketreceipt.co.uk/delivery-drivers)

### Inferences
- Price (free vs subscription) and auto-detect reliability for stop-start multi-drop driving are likely the main competitive axes outside the US. Real community quotes are needed to confirm this.

### Gaps
- Nothing on trust in app-tracked vs platform-reported miles, privacy, Android vs iPhone or non-English-language support. These need Reddit/forum/app-store access.
- **Recommended follow-up (needs a session where these hosts are allowed):** fetch the MSE and Whirlpool URLs listed above. Search Reddit directly for: `site:reddit.com/r/deliveroos mileage`, `r/UberEatsUK 45p`, `r/AmazonFlexDrivers HMRC miles`, `r/uktax delivery mileage app`, `r/cantax doordash logbook`, `r/PersonalFinanceCanada uber eats kilometres`, `r/AusFinance uber eats logbook`, `r/UberEatsAU driversnote`. Also check RedFlagDeals and the UK/CA/AU App Store and Google Play reviews for Driversnote and MileIQ.
