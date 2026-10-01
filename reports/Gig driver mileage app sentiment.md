# Drivers forgive price, never lost miles

Across the four markets, the evidence points the same way. Gig and self-employed drivers judge a mileage app first on whether it **captures every work mile**, then on **what it costs**, and only after that on features. Every major competitor (Stride, Gridwise, MileIQ, Everlance, Driversnote, TripLog, Hurdlr, QuickBooks, Solo) has app-store reviews from drivers who lost days or weeks of miles. They describe that loss in money terms: "costs me money on missed mileage deductions". Three more complaints recur:

- **Pricing.** Paywalls feel undisclosed, prices rise, and free features get removed. UK and Australian reviewers balk at about £8–£10 or A$22 a month and threaten to go "back to a spreadsheet".
- **Stop-start delivery work.** Auto-detection built for commuters cuts trips at restaurant waits and traffic lights.
- **US defaults.** Dollar signs, miles and US phone numbers alienate UK and AU users.

No competitor owns the "trust" position. MileMint's missed-miles check, multi-country rates and low Pro price fit these complaints well. But a simulation of MileMint's own detector shows that today it repeats two category failures: it splits trips at stops, and the 40-drive free cap runs out within days. The product should be rebuilt around the **shift as the unit of record**. Marketing should lead with **verifiable completeness** and plain-language country tax help, not "automatic tracking", which every incumbent already claims.

**Read the evidence limits first.** Reddit could not be read from this environment: it returned a "blocked by network security" page, and the proxy refused the other Reddit hosts. YouTube was blocked. The large driver Facebook groups are private. Trustpilot and Whirlpool returned 403 errors. As a result, **this report contains no verbatim Reddit, Facebook, YouTube, Trustpilot or Whirlpool quotes.** The strongest direct evidence comes from three sources fetched and parsed on 1 October 2026: app-store reviews, MoneySavingExpert threads, and two driver blogs. Everything else rests on search-engine summaries and vendor content.

The cross-reference to MileMint's 500-day gig simulation (`16-gig-day-simulation.md`) is **simulated, not real users**. It ran real detection code over synthetic GPS days, with synthetic persona reactions. Read it as directional.

## Evidence strength

The table below grades each source family. Claims in this report carry the label of the source behind them. "Strong" means verbatim text read directly from the page. "Weak" means a paraphrase by a search engine or by a vendor with a commercial stake.

| Source | What was obtained | Strength |
|---|---|---|
| Apple App Store and Google Play reviews (US, GB, AU storefronts) | Verbatim reviews plus ratings and rating counts. Only the stores' "most relevant" or featured reviews, about 3–10 per storefront, so not a random sample | **Strong** for what drivers say; **not representative** of overall sentiment |
| MoneySavingExpert threads (UK) | Verbatim posts, mostly 2017–2022. The search page was blocked, so only threads found by web search could be read | **Strong** but dated |
| The Rideshare Guy and EntreCourier blog reviews | Verbatim text plus affiliate disclosures | **Moderate**; both earn affiliate fees |
| Competitor and aggregator review sites (Timeero, MileageWise, TruMile, Capterra) | Search-summary paraphrases. Several of these sites sell rival apps | **Weak and biased** |
| "What Reddit says" pages | Vendor paraphrases of Reddit (for example trumile.app) | **Weak**; not Reddit itself |
| Facebook and TikTok | Group and page names, discovery-hub titles. No post text | **Contextual only** |
| Government and tax guidance | Search extracts of GOV.UK, IRS and Canada.ca pages, plus accountant blogs | **Moderate** for rules |
| MileMint 500-day simulation | Real detector output on synthetic days, plus synthetic persona reactions | **Simulated**: directional only |

The store data has a known skew. Headline ratings are high, 4.5–4.9 on US iOS for most apps, while the featured written reviews are disproportionately complaints ([stores data: Driversnote AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916); [MileIQ US](https://apps.apple.com/us/app/mileiq-mileage-tracker-log/id578830929)). The complaints show *what* goes wrong, not *how often*.

## Every app is accused of losing miles, and drivers count the cost in dollars

The single most consistent finding is that automatic detection fails often enough that drivers lose sizeable chunks of their work miles. Drivers report this against almost every app, in their own words.

| App | Store | What the reviewer reported |
|---|---|---|
| TripLog | Play US | "I just did a 90-mile route with multiple stops, and it recorded absolutely nothing… Switching to MileIQ immediately" ([TripLog Play](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=US)) |
| TripLog | Play GB | Captured "two of 28 journeys made over a 12 day period", and the reviewer moved to Driversnote ([TripLog Play GB](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=GB)) |
| Stride | Play US | "I lost 179 miles today" ([Stride Play](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=US)) |
| Everlance | iOS US | "missing WEEKS of data", which "cost me A LOT in LOST mileage reimbursement credit on my federal taxes" ([Everlance iOS](https://apps.apple.com/us/app/mileage-tracker-by-everlance/id985378916)) |
| Driversnote | iOS AU | Automatic tracking silently turned itself off, leaving "almost 2 months of untracked trips… (86km per day!)" ([Driversnote iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)) |
| QuickBooks Self-Employed | Play US | "hasn't tracked a single trip since June of last year", despite start-of-drive notifications ([QBSE Play](https://play.google.com/store/apps/details?id=com.intuit.qbse&hl=en_US&gl=US)) |
| MileIQ | iOS GB | Silently logged itself out, so "none of your mileage… whilst logged out is tracked" ([MileIQ iOS GB](https://apps.apple.com/gb/app/mileiq-mileage-tracker-log/id578830929)) |

The one independent driver-tester backs this up. EntreCourier, who discloses affiliate links, graded Solo's mileage tracking **D-**, calling its missed trips "a major (and expensive) problem". He graded Stride **D+** overall, citing its lack of auto-tracking and battery drain ([EntreCourier Solo](https://entrecourier.com/delivery/delivery-strategies/delivery-tools/solo-app-review-mileage-tracking/); [EntreCourier Stride](https://entrecourier.com/delivery/delivery-strategies/delivery-tools/stride-tax-app-review-2021/)).

Two quieter patterns sit behind the headline failures.

**Silent failure is worse than failure.** The worst reviews describe tracking that stopped *without telling the user*: Driversnote switching auto-tracking off, MileIQ logging out, QBSE showing notifications but saving nothing. A Gridwise user put the practical consequence plainly: "if you are like me that check once a week, then you are in trouble" ([Gridwise Play](https://play.google.com/store/apps/details?id=com.gridwise.app&hl=en_US&gl=US)).

**Drivers distrust apps as the only record.** One lost Gridwise user wrote: "All those saved records – gone… It's always best to not be at the mercy of smartphone app when it comes to important business records" (same source).

**Stop-start delivery work breaks commuter-style detection.** Reviewers name each app's failure:

- Everlance closes a trip "while stopped for 2 minutes and start[s] a new one" ([Everlance Play](https://play.google.com/store/apps/details?id=com.everlance&hl=en_US&gl=US)).
- An Australian courier says Driversnote now treats "stop at traffic lights too long" as a new trip, where the older version kept multi-drop runs as one trip ([Driversnote Play AU](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=AU)).
- A vendor summary of Reddit claims Everlance's restaurant-wait splits forced "30-40 trips per day" of manual classification. This is weak evidence: it is vendor-paraphrased and unverified ([trumile.app](https://trumile.app/compare/best-mileage-tracker-reddit/)).

**Phantom trips and the wrong transport mode** draw a second line of complaints. Everlance "dings me with notifications that I'm driving when im sitting still" ([Everlance Play AU](https://play.google.com/store/apps/details?id=com.everlance&hl=en_US&gl=AU)). Driversnote "also tracks you on a train" ([Driversnote Play GB](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=GB)). A UK MileIQ user objects to deleting public-transport journeys "one by one" ([MileIQ iOS GB](https://apps.apple.com/gb/app/mileiq-mileage-tracker-log/id578830929)).

**Battery drain** is the other recurring reliability complaint, aimed mainly at Stride and Hurdlr. One Stride user writes: "It also will not track mileage while Battery Saver is enabled, so I have to choose between preserving my battery and recording my business miles". A Hurdlr user says that with the tracker on, "its dead before 4pm" ([Stride Play AU](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=AU); [Hurdlr Play](https://play.google.com/store/apps/details?id=app.hurdlr.com&hl=en_US&gl=US)).

**The simulation corroborates both the splitting and transport-mode problems inside MileMint itself.** MileMint uses a 5-minute stop rule. Under it:

- restaurant waits split the trip **61–77%** of the time
- drop-then-wait-for-next-order stops split it **70–87%** of the time
- a food courier gets about 1.7 rows per order, and a parcel round becomes 9–13 arbitrary chunks
- trains, buses and bikes are logged as drives

On distance, the simulation is more encouraging. After the 1 October fix, logged distance matched true distance at **102% (UK) and 101% (US)**.

Two problems in the simulation have no real-world analogue in the notes. First, personal miles are tagged as work when the last delivery merges with the drive home (27 of 98 US shift users). Second, e-bike and scooter legs are lost below the 15 mph threshold. No real e-bike evidence was retrieved, so the e-bike finding stands on simulation alone.

## Paywalls that surprise drivers do more damage than high prices

Price is the second axis, and the anger centres on *surprise* and *takeaway* more than on the level itself.

**Undisclosed caps.** Driversnote's free cap draws the sharpest language. A US multi-app courier wrote: "You have to pay a ton of money for it record more than 15 trips a month. I'm someone who juggles 3 delivery jobs. It never said anything about paying and then locked my recorded trips behind a paywall. I need those for Taxes!" Another said: "There is NO indication that you start on a limited plan" ([Driversnote Play US](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=US)). An Australian hit the 15-trip report wall "suddenly" and wrote, "I do not have an extra $22 dollars a month" ([Driversnote iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)).

**Free features moved behind a paywall.** Gridwise moved auto-mileage and earnings sync behind its Plus plan from 18 April 2024, citing doubled data costs ([Gridwise announcement](https://gridwise.io/announcements/details-on-new-plus-and-basic-plans/)). Reviewers still resent it: "now they want to charge a monthly subscription for something that has always been free" ([Gridwise iOS](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382)).

**Price rises.** MileIQ's increases are the most cited. A UK user wrote that "it was at £5.00 per month, but they've just doubled the price to over £10+ per month… I'll be moving to another app now" ([MileIQ Play GB](https://play.google.com/store/apps/details?id=com.mobiledatalabs.mileiq&hl=en_US&gl=GB)). Current UK pricing is £7.91/month billed annually or £9.49/month billed monthly ([MileIQ UK pricing](https://mileiq.com/pricing-uk)).

**Advertised versus charged prices** add to the irritation, especially in the UK where VAT is added at checkout. One TripLog reviewer: "It'd be great if it WAS £3.59 a month which is the cost advertised but that DOES NOT INCLUDE VAT" ([TripLog iOS GB](https://apps.apple.com/gb/app/mileage-tracker-app-by-triplog/id585918522)). A Driversnote reviewer: "it says £8 but actually charges £9.60" ([Driversnote Play GB](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=GB)).

**The real fallback is a spreadsheet, not a rival app.** "8 pounds a month!! I nearly passed away!! Just going to go back to a spreadsheet" (same Driversnote GB page). On MileIQ: "$20 - $30 sure-- but $90+? I'm just going back to my Google sheets" ([MileIQ Play](https://play.google.com/store/apps/details?id=com.mobiledatalabs.mileiq&hl=en_US&gl=GB)). The only UK courier app thread found on MoneySavingExpert is a van driver asking for a free alternative to £8/month Driversnote. Older posters replied by recommending a notebook or a free app (aCar) ([MSE](https://forums.moneysavingexpert.com/discussion/6074301/mileage-tracker-app)).

**In the US, "free" sets the price anchor.** Stride is entirely free, funded by its insurance marketplace, and reviewers praise exactly that: "it's 100% free for all the options that you need" ([Stride iOS](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359)). Stride is the default app name in TikTok's DoorDash mileage discovery hubs ([TikTok](https://www.tiktok.com/discover/how-to-track-mileage-for-doordash-using-stride-app)). TripLog offers unlimited free automatic tracking and charges for reports ([Timeero TripLog](https://timeero.com/reviews/triplog-review)).

**MileMint's free tier copies MileIQ's 40 drives a month**, which The Rideshare Guy notes "most rideshare drivers will go through… very quickly" ([RSG](https://therideshareguy.com/day-5-what-are-the-best-apps-to-track-your-mileage/)). An Australian MileIQ reviewer framed 40 free entries as merely "better than paying" ([MileIQ iOS AU](https://apps.apple.com/au/app/mileiq-mileage-tracker-log/id578830929)).

The simulation lines up closely with these real complaints:

- Without shifts, MileMint's 40 free drives lasted **3–6 days**.
- Even with correct shift use, personal drives pushed couriers to about 60 drives a month.
- Simulated willingness to pay clustered at **£4.49/month UK and about $4.99 US**, below MileMint's planned ~£/$5.99.
- No simulated US persona would pay $7.99 or more, and 32 said they would stay on free Stride or Gridwise unless MileMint showed earnings and paid-versus-unpaid miles.
- Bike and scooter couriers, claiming £6–12 a day, preferred a **tax-season pass** of about £15–25 a year.

The real reviews do not test a specific price point. They do show that UK reviewers object at £8 and above, and US reviewers at $90 or more a year.

## Competitor reputations split between US gig tools and Driversnote abroad

**Driversnote leads outside the US by rating volume.** On the Australian App Store it has **31,533 ratings at 4.7**, against 134 for Everlance, 89 for TripLog and 23 for MileIQ ([Driversnote AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)). Australian reviewers say it was "Recommended by my accountant as being suitable for ATO". They also say the free government alternative, the ATO's myDeductions app, felt "difficult and clunky" (same source).

**The US gig-native apps have little reach outside the US.** Stride, Gridwise, Solo and Hurdlr returned 404 on the GB and AU App Store slugs. That suggests, but does not confirm, that they are US-only on iOS.

**Where US apps do reach UK or Australian users, US defaults draw anger.** A six-year Everlance UK user complained that the "$ symbol" was still on monthly reports while paying "£60 per annum" ([Everlance iOS GB](https://apps.apple.com/gb/app/mileage-tracker-by-everlance/id985378916)). Australian Para users found "Everything is in miles" and the app demanded "an American phone number" ([Para iOS AU](https://apps.apple.com/au/app/para-gig-drivers-earn-more/id1548322258)). An Australian MileIQ user found it "stuck on miles in the reimbursement mode" ([MileIQ iOS AU](https://apps.apple.com/au/app/mileiq-mileage-tracker-log/id578830929)).

The per-competitor picture, with the strength of evidence behind each verdict:

| Competitor | What drivers praise | What drivers attack | Evidence |
|---|---|---|---|
| **Stride** | 100% free; simple; trusted by some | Battery drain, straight-line routes, stops in the background, will not track under battery saver; Play rating 3.0 US / 3.3 GB | Strong (store reviews) |
| **Gridwise** | Free PDF exports (historically); "doesn't slow my phone down"; earnings sync | Auto-mileage moved to paid plan (2024); trial terms disputed; spotty auto-tracking; data loss | Strong |
| **MileIQ** | "Set and forget" habit; UK and US loyalists | Price doubled; phantom and missed drives; logouts; free tier shows no map | Strong |
| **Everlance** | Expense categorisation | Missed weeks; 2-minute stop splits; phantom drives; "$" on UK reports | Strong |
| **Driversnote** | HMRC/ATO fit; accountant-recommended in AU | Undisclosed 15-trip report cap; prices plus VAT; traffic-light splits; silent auto-off; crashes | Strong |
| **TripLog** | Split/merge trips, tags, free unlimited tracking | Huge misses in some UK and US reviews; Bluetooth start unreliable; VAT surprise | Strong |
| **Hurdlr** | Cheaper than QBSE; Bluetooth-triggered start valued | Battery; AI-only support | Strong |
| **QuickBooks SE / Solopreneur** | Bundled accounting | Tracking stopped entirely for months; $20/month price | Strong |
| **Solo** | Classifies trips from linked gig accounts ("brilliant" concept per EntreCourier) | Missed trips (D- grade); paid "guaranteed rate"; only five gig apps linked | Strong / moderate |
| **Para** | Offer screening | Shut down in the US in May 2024 per a quoted user email; unusable in AU | Strong |
| **FreeAgent / Xero** | — | FreeAgent logs mileage manually only; Xero needs add-ons such as Tripcatcher | Weak (vendor and support docs; no driver sentiment found) |
| **Government tools** | ATO myDeductions is free | "difficult and clunky" (one AU review); HMRC has no official app; MSE veterans point to notebooks and spreadsheets | Moderate |

Sources for the table:

- Stride, Gridwise, MileIQ, Everlance, Driversnote, TripLog, Hurdlr, QuickBooks SE, Solo and Para rows: app-store pages cited earlier. The Gridwise trial complaint is at [Gridwise Play](https://play.google.com/store/apps/details?id=com.gridwise.app&hl=en_US&gl=US). Hurdlr is at [Hurdlr iOS](https://apps.apple.com/us/app/hurdlr-mileage-expenses-tax/id951737201). Solo is at [Solo iOS](https://apps.apple.com/us/app/solo-your-gig-business-app/id1586902173).
- QuickBooks pricing: [Merchant Maverick](https://www.merchantmaverick.com/reviews/quickbooks-self-employed-review/).
- FreeAgent: [FreeAgent support](https://support.freeagent.com/hc/en-gb/articles/115001223124-Record-a-new-mileage-claim). Xero: [Tripcatcher on Xero](https://apps.xero.com/uk/app/tripcatcher).

**Discount the blogs.** The Rideshare Guy names MileIQ "OUR TOP PICK", Hurdlr as a personal favourite and Stride as "our favorite mileage tracker" on different pages, all under affiliate disclosure ([RSG roundup](https://therideshareguy.com/day-5-what-are-the-best-apps-to-track-your-mileage/); [RSG Stride](https://therideshareguy.com/stride-tax-app-mileage-tracker/)). Solo runs a creator affiliate programme ([Friends of Solo](https://www.worksolo.com/friends-of-solo)). Drivers have reason to doubt "best app" lists.

**The UK market is crowding with free, courier-targeted HMRC trackers.** MileClear, PocketReceipt and KeptMiles all advertise to Deliveroo, Uber Eats, Just Eat and Amazon Flex couriers. This evidence is vendor pages only ([MileClear](https://mileclear.com/delivery-driver-mileage-tracker); [PocketReceipt](https://pocketreceipt.co.uk/delivery-drivers); [KeptMiles](https://play.google.com/store/apps/details?id=app.keptmiles&hl=en_CA)).

## What drivers want: completeness, the shift, and rules in their own country

Read through the complaints and the forum questions, drivers want five things.

**First, a log they can trust to be complete.** They also want to be warned when it is not.

**Second, one record per working session rather than per stop.** A TripLog convert praised the "ability to split/merge trips" ([TripLog Play](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=US)). A Hurdlr user valued starting on a Bluetooth connection to the car, "instead of movement" ([Hurdlr Play](https://play.google.com/store/apps/details?id=app.hurdlr.com&hl=en_US&gl=US)).

The simulation is emphatic on this point. **309 of 500** simulated workers wanted "one row per shift" as their main view, and **none** wanted today's one-row-per-detected-trip view. Several groups asked for their own units:

- Amazon Flex drivers wanted one row per block.
- Instacart shoppers wanted one row per batch.
- Walmart Spark drivers wanted one row per run.

**Third, help with which miles count.** This is a bigger UK concern than app choice. MoneySavingExpert threads circle the same questions:

- **Depot work.** Is an Amazon Flex driver "depot based", making the drive from home to the depot "ordinary commuting" that cannot be claimed ([MSE](https://forums.moneysavingexpert.com/discussion/comment/74963197/#Comment_74963197))?
- **Uber Eats figures.** The platform's mileage stats count only restaurant-to-customer legs. One poster reported that HMRC webchat told them claimable mileage "starts from first pickup point" ([MSE](https://forums.moneysavingexpert.com/discussion/5951257/uber-eat-hmrc-millage-calculation); [comment](https://forums.moneysavingexpert.com/discussion/comment/75330073/#Comment_75330073)).
- **Universal Credit.** Mileage is allowed at 45p for the first 833 miles a month ([MSE](https://forums.moneysavingexpert.com/discussion/comment/77788854/#Comment_77788854)).

In the US, tax sources genuinely disagree on whether the drive from home to the first pickup is commuting. The conservative view treats it as commuting ([Spark Receipt](https://sparkreceipt.com/blog/self-employed-mileage-deduction/)). Others count it once the driver is logged in ([EntreCourier](https://entrecourier.com/delivery/delivery-contractor-taxes/mileage-and-car-expense/what-miles-can-i-claim-grubhub-postmates-doordash-uber-eat-instacart/)).

**Fourth, correct and current local rates and records.** The rates and record rules differ sharply by country:

| Country | Current rates and rules |
|---|---|
| UK | Simplified rate rose from **45p to 55p** for the first 10,000 miles, backdated to 6 April 2026 (search extract of the official page) ([GOV.UK](https://www.gov.uk/government/publications/increase-to-approved-mileage-allowance-payments-amaps-and-self-employed-simplified-mileage-rates/increasing-mileage-rates)) |
| US | Business rate split mid-year: **72.5¢** to 30 June 2026 and **76¢** from 1 July ([IRS](https://www.irs.gov/forms-pubs/the-standard-mileage-rates-and-maximum-automobile-fair-market-values-have-been-updated-for-2026)) |
| Canada | Self-employed drivers claim **actual costs × business-use %** backed by a trip log, not a per-km rate ([Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses/motor-vehicle-expenses/motor-vehicle-records.html)) |
| Australia | Cents per km capped at 5,000 km (**91c for 2026–27**, which one source calls draft), or a 12-week logbook with odometer readings ([Driversnote AU](https://www.driversnote.com.au/blog/ato-cents-per-km-rate-2026-2027); [L Jack Associates](https://www.ljackassociates.com.au/blog/ato-logbook-requirements-in-2026)) |

In the simulation, Canadian personas asked for the business-use % model, and Australian high-km drivers asked for the logbook.

The legal stakes favour app logs. US courts disallow reconstructed logs. In *Chappell* (2024), the court credited a contemporaneous app log (secondary summary) ([WCG CPAs](https://wcginc.com/blog/mileage-myths-busted-khan-v-commissioner-puts-landlords-and-small-businesses-on-notice/)).

**Fifth, earnings next to miles.** The real evidence for this is moderate. Drivers resented losing Gridwise's earnings sync, and EntreCourier called Solo's job-linked classification "brilliant". The simulation is stronger: **253** of 500 wanted earnings shown, and **201** wanted unpaid "dead" miles highlighted.

**Platform mileage figures undercount real business driving**, according to secondary sources:

- DoorDash counts roughly accept-to-dropoff only ([EntreCourier](https://entrecourier.com/delivery/delivery-contractor-taxes/mileage-and-car-expense/does-doordash-track-miles-mileage-tracker-tax-deduction/)).
- Instacart gives no mileage at all ([MileageWise, vendor](https://www.mileagewise.com/gig-drivers-guide/instacart-mileage-tracker/)).
- Amazon Flex does not track mileage ([TrakMiles, vendor](https://www.trakmiles.com/mileage-tracker-for-amazon-flex.html)).

This cuts both ways for MileMint's missed-miles check. A gap between MileMint and the platform figure is *expected*: it is the unpaid miles, which is a selling point. But the check has nothing to compare against for Flex, Instacart and other parcel work.

What drivers want on privacy, Android versus iPhone, and export quality could not be established. No usable evidence was retrieved on any of them.

## What MileMint should change

The product recommendations follow directly from where real complaints and simulated behaviour agree. Priority reflects how strong the evidence is and how central the issue is to the category.

| Priority | Change | Why (evidence) |
|---|---|---|
| 1 | **Make the shift the unit of record.** One row per shift that expands to its legs. Inside a shift, join stops under about 30–45 minutes. Add block, batch and run views for Flex, Instacart and Spark. | Real: splitting at 2-minute stops and traffic lights is a named complaint against Everlance and Driversnote, and drivers praise split/merge. Simulated: 309 of 500 wanted shift rows; 0 wanted per-trip rows. |
| 2 | **Make silent failure impossible.** Show a visible "tracking healthy" state. Push an alert when location permission, background refresh or Low Power Mode would stop logging. Add an "End shift?" prompt. Notify at auto-end instead of ending silently. | Real: the worst reviews are about months lost without warning (Driversnote AU, MileIQ GB, QBSE). |
| 3 | **Cut the trip at shift end and classify each leg.** The drive home becomes its own "Last delivery → Home" row. Add shift-start recovery ("Start shift from 10:40?"), editing shift times afterwards, and a pause for errands. | Simulated: 27 of 98 US shift users had personal miles tagged as work; about 28% of UK work miles were lost or misfiled through shift habits. Real: the home-trip rules are disputed, so make the policy configurable. |
| 4 | **Fix the free tier before launch.** Count shifts or days, not detected drives. Never lock already-recorded trips or the tax export behind a paywall. Show the limit on day one. | Real: Driversnote's "locked my recorded trips" and "NO indication" reviews; Gridwise's takeaway resentment; RSG on 40 drives running out. Simulated: 40 drives last 3–6 days without shifts. |
| 5 | **Price at £4.49–4.99 / $4.99 per month including VAT, add an annual or tax-season pass, and promise no surprise rises.** | Real: anger at £8–£10 and at VAT added on top. Simulated: willingness to pay clusters at £4.49 / $4.99; bike couriers prefer a £15–25 pass. |
| 6 | **Reframe the missed-miles check as "paid vs unpaid miles"**, with earnings entered or imported where possible. Fall back gracefully for Flex and Instacart, where the platform gives no figure. | Real: platforms undercount; earnings sync is valued. Simulated: unpaid miles are 22–41% of work miles, and US personas would not pay without this. |
| 7 | **Update rates now and show it.** UK 55p/25p backdated to 6 April 2026 with a 10,000-mile counter. US 72.5¢/76¢ split by date. AU 5,000 km cap warning plus a 12-week logbook with odometer readings. CA business-use % with a T2125 summary and no per-km "deduction". | Strong (official sources and extracts). Many apps and articles still say 45p. |
| 8 | **Add transport-mode filtering (train, bus) and a bike/scooter mode** with lower speed thresholds and the HMRC bicycle rate instead of car rates. | Real: train and public-transport complaints (Driversnote, MileIQ). E-bike need is simulation-only. |
| 9 | **Treat data as the driver's.** Automatic backup, a free contemporaneous PDF/CSV export with an edit history, and an accountant share link. | Real: "All those saved records – gone"; courts test contemporaneity. |
| 10 | **Fully localise.** £, km and local date formats on every report; no US-only sign-up steps; French for Quebec; a simple PDF a driver can send to an accountant over WhatsApp. | Real: anger at "$" on UK reports and US phone verification. Simulated: Quebec, Punjabi and Bengali requests. |

**On marketing, stop leading with "automatic"** and lead with **"you'll know if a mile was missed"**. Every incumbent already claims automatic tracking, and the reviews show drivers no longer believe it. MileMint's missed-miles check and shift view are the proof points no competitor was found to offer.

**Country pitches:**

- **UK and Australia:** sell against Driversnote and MileIQ on honest price and local fit: "£ not $", "55p already applied", "ATO logbook in 12 weeks". Present the price VAT-inclusive and quote the reviewers' spreadsheet threat back at them as the real alternative.
- **US:** do not fight free Stride on price. Win on reliability and on paid-versus-unpaid miles. Where a free tier is needed, make it generous enough to survive a full delivery week.

**Channels:**

- Answer the questions drivers actually ask ("does home-to-depot count?", "what does Uber's mileage figure leave out?", "45p or 55p?") in UK, Canadian and Australian content. Creator content in those countries is about earnings, not tax ([Yahoo News UK](https://uk.news.yahoo.com/how-much-delivery-riders-earn-uk-deliveroo-uber-eats-164924654.html)).
- Build a shareable shift card in the earnings-reveal format couriers already post.
- Seed private Facebook groups through members and admins, and stay well clear of the account-rental groups that dominate public Facebook search ([CNN](https://www.cnn.com/2025/04/14/tech/facebook-groups-buy-sell-uber-doordash-deliveroo-accounts)).
- Use transparent, unpaid accuracy tests in the style of EntreCourier's grading, rather than affiliate "best of" lists that drivers already discount.

**Be honest about MileMint's own exposure.** It is iPhone-only in a category where Stride, Gridwise, Driversnote and TripLog all run on Android. It has no review base against incumbents with tens of thousands of ratings. And the simulation shows its detector currently reproduces the splitting complaint drivers most dislike.

## Conclusion

The central insight is that **completeness is the product**. The category already offers distance tracking, tax rates and reports. What it does not offer is a driver's confidence that the record is whole: the reviewers who leave are the ones who discovered gaps weeks later. That changes what MileMint's differentiators are for. The missed-miles check is not a feature to list; it is the trust mechanism the whole category lacks. It should be paired with failure alerts and a shift-based log, so that the app reports its own gaps instead of hiding them.

The second insight is that MileMint's current design copies the two choices drivers punish most: MileIQ's 40-drive cap and commuter-style stop splitting. Because both are still pre-launch decisions, they are cheap to reverse now and expensive after the first wave of reviews.

Several key questions remain open until someone reads Reddit, Whirlpool, Trustpilot and the private Facebook groups directly, from a browser or an authenticated session:

- what drivers say about Android versus iPhone, privacy and export quality
- whether real couriers would pay about £5 rather than about £4.50
- how the simulation's e-bike findings hold up with real riders

Until then, treat the real-world evidence as strong on *what* hurts and weak on *how much*. Treat the simulation as a hypothesis generator, not proof.
