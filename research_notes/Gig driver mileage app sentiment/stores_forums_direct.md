# Gig driver mileage app sentiment: app stores, UK/AU forums and blogs, fetched directly

Method: on 2026-10-01 I fetched every page below with curl (browser User-Agent) and parsed it with Python. All quotes are verbatim, copied from the fetched HTML. Long reviews are shortened with "…" and nothing else is changed.

**How to read the store data**
- **Google Play.** The star rating changes with the `gl=` country parameter, but the review count shown is global. The page HTML holds only about 3 "most relevant" reviews per country, not the most recent ones.
- **Apple App Store.** The page HTML (`?see-all=reviews`) holds about 10 featured reviews per storefront, plus that storefront's own rating and rating count.
- **Blocked or unavailable:**
  - Trustpilot (uk.trustpilot.com) returned 403 with an AWS WAF "Verifying Connection" page.
  - forums.whirlpool.net.au returned 403 with a Cloudflare "Just a moment..." page. WebFetch reported the domain blocked by the egress proxy.
  - The MoneySavingExpert *search* page returned 403 (Cloudflare), but individual MSE discussion pages returned 200 and were parsed.
  - itunes.apple.com (RSS and search API) was refused by the proxy.
  - The Apple search page (apps.apple.com/us/search) returned 404, so I found app IDs through WebSearch.

## Q1. App store ratings and verbatim reviews per app

### Takeaway
Overall ratings are high for most apps: 4.5 to 4.9 on US iOS. The written reviews tell a different story. They repeat the same complaints across every app:
- trips missed or truncated by auto-detection (Everlance, MileIQ, TripLog, Driversnote, Gridwise, QBSE, Solo)
- battery drain (Stride, Hurdlr)
- free tiers capped at 15 to 40 trips a month, with paywalls users say were not disclosed (Driversnote, MileIQ)
- free features moved to paid plans, or price rises (Gridwise, MileIQ UK)
- US-centric design that frustrates UK and AU users: "$" on reports, miles instead of km, US-only phone verification (Everlance UK, MileIQ AU, Para AU)

Stride, Gridwise, Solo and Hurdlr returned 404 on the GB and AU App Store slugs. This suggests they are not offered in the UK or AU iOS stores, but country-specific slugs could also cause a 404, so treat it as unconfirmed.

### Cited Findings

**Ratings snapshot (fetched 2026-10-01)**

| App | iOS US | iOS GB | iOS AU | Google Play rating, US / GB / AU (review count is global) |
|---|---|---|---|---|
| Stride (id1041591359; com.stridehealth.drive) | 4.8 (97,332) | 404 | 404 | 3.0 / 3.3 / 4.8 (20.8K) |
| Gridwise (id1215991382; com.gridwise.app) | 4.9 (28,428) | 404 | 404 | 4.5 / 4.3 / 3.9 (12.8K) |
| MileIQ (id578830929; com.mobiledatalabs.mileiq) | 4.8 (113,670) | 4.7 (3,878) | 4.7 (23) | 4.6 / 4.5 / 3.6 (72.9K) |
| Everlance (id985378916; com.everlance) | 4.8 (52,469) | 4.4 (53) | 4.6 (134) | 4.7 / 4.2 / 4.5 (35.8K) |
| Driversnote (id924418916; com.driversnote.driversnote) | 4.8 (38,941) | 4.8 (7,499) | 4.7 (31,533) | 4.7 in all three (38.1K) |
| TripLog (id585918522; com.bizlog.triplog) | 4.5 (4,723) | 4.3 (254) | 4.2 (89) | 4.2 / 4.4 / 4.5 (7.55K) |
| Hurdlr (id951737201; app.hurdlr.com) | 4.7 (21,062) | 404 | 404 | 4.2 US (9.05K); no rating shown for GB/AU |
| Solo (id1586902173) | 4.7 (13,306) | 404 | 404 | not found on Play |
| Para (id1548322258) | 4.3 (6,963) | 4.0 (4) | 2.2 (31) | not found (the `com.para.app` package is an unrelated "Para Transform" app) |
| QuickBooks Self-Employed (id898076976; com.intuit.qbse) | 404 on US slug | 404 | 4.5 (3,373) | 3.4 (33.4K, 5M+ downloads) |

Sources for the table: [Stride iOS](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359), [Stride Play](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=US), [Gridwise iOS](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382), [Gridwise Play](https://play.google.com/store/apps/details?id=com.gridwise.app&hl=en_US&gl=US), [MileIQ iOS US](https://apps.apple.com/us/app/mileiq-mileage-tracker-log/id578830929), [MileIQ iOS GB](https://apps.apple.com/gb/app/mileiq-mileage-tracker-log/id578830929), [MileIQ Play](https://play.google.com/store/apps/details?id=com.mobiledatalabs.mileiq&hl=en_US&gl=GB), [Everlance iOS](https://apps.apple.com/us/app/mileage-tracker-by-everlance/id985378916), [Everlance Play](https://play.google.com/store/apps/details?id=com.everlance&hl=en_US&gl=US), [Driversnote iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916), [Driversnote Play](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=GB), [TripLog iOS](https://apps.apple.com/us/app/mileage-tracker-app-by-triplog/id585918522), [TripLog Play](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=US), [Hurdlr iOS](https://apps.apple.com/us/app/hurdlr-mileage-expenses-tax/id951737201), [Hurdlr Play](https://play.google.com/store/apps/details?id=app.hurdlr.com&hl=en_US&gl=US), [Solo iOS](https://apps.apple.com/us/app/solo-your-gig-business-app/id1586902173), [Para iOS AU](https://apps.apple.com/au/app/para-gig-drivers-earn-more/id1548322258), [QBSE iOS AU](https://apps.apple.com/au/app/quickbooks-self-employed/id898076976), [QBSE Play](https://play.google.com/store/apps/details?id=com.intuit.qbse&hl=en_US&gl=US)

**Stride**
- Play US, 2 stars, 2024-02-28, Briana Sassoon (22 helpful): "It doesn't track my drive. Just shows my starting point and straight line to my destination which cuts corners/ not accurate whatsoever. Now i have to manually add my miles." [Play](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=US)
- Play US, 1 star, 2024-04-05, Russell Rothstein (22 helpful): "I lost 179 miles today and a couple hundred more over the past week. Now, it seems that if you're not on this app, it no longer keeps track of mileage." [Play](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=US)
- Play AU/GB listing, 2 stars, 2026-08-26, Latisha Harrell: "Severe Battery Drain… It also will not track mileage while Battery Saver is enabled, so I have to choose between preserving my battery and recording my business miles… the excessive battery usage has forced me to switch to another app." [Play](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=AU)
- Play AU listing, 5 stars, 2026-08-22, Alex Stillions: "I love using this app to track my Taxable requirements for DoorDash… Best part of this all? IT'S 100% FREE!!!" [Play](https://play.google.com/store/apps/details?id=com.stridehealth.drive&hl=en_US&gl=AU)
- iOS US, 4 stars, 2026-08-07, Arcaios: "It is a very good mileage tracker but their recent change on the tax estimator makes that part literally garbage… I will go to using a spreadsheet, stride was good because its free…" [iOS](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359)
- iOS US, 4 stars, 2024-10-04, Idleketchup: "you do need to switch between it frequently if you want to make sure it hasn't stopped or crashed causing it to not track your miles… Every update is a step backwards" [iOS](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359)
- iOS US, 5 stars, 2026-04-03, jgrizzly91: "I'm an Uber eats delivery driver… First of all, it's 100% free for all the options that you need to track everything." [iOS](https://apps.apple.com/us/app/stride-mileage-tax-tracker/id1041591359)

**Gridwise**
- Play US, 4 stars, 2026-09-05, G B: "the only issue and has been forever is that auto track sometimes , just don't track… if you are like me that check once a week, then you are in trouble" [Play](https://play.google.com/store/apps/details?id=com.gridwise.app&hl=en_US&gl=US)
- Play US, 1 star, 2026-07-09, Nathan Whye (12 helpful): "The app is advertised as giving 14 days premium access, and then costing for $9.99 paid monthly. However, it actually gives 0 DAYS of premium… It and then states that the trail lasts 7 days before costing $14.99 monthly paid annually." [Play](https://play.google.com/store/apps/details?id=com.gridwise.app&hl=en_US&gl=US)
- Play US, 1 star, 2026-06-07, Michael Scalisi (12 helpful): "Worked for about a month, then kicked the bucket. All those saved records – gone… It's always best to not be at the mercy of smartphone app when it comes to important business records" [Play](https://play.google.com/store/apps/details?id=com.gridwise.app&hl=en_US&gl=US)
- iOS US, 3 stars, 2024-04-28, crspens: "I have only ever use it to track my mileage and income… now they want to charge a monthly subscription for something that has always been free… I don't live near an airport, I don't live near a place that has a lot of events. So all the extra things are useless for me." [iOS](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382)
- iOS US, 2 stars, 2024-07-15, Ronney D: "it started tracking me when I was sitting at home in my bedroom going nowhere and is now leaving out and not tracking hours of trips at a time." [iOS](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382)
- iOS US, 5 stars, 2023-10-20, ViVi Rae1: "being able to export PDF files for FREE of your income, mileage, and expenses… This is the ONLY app whose mileage tracker DOESN'T slow my phone down!!" [iOS](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382)

**MileIQ**
- Play GB listing, 2 stars, 2026-07-16, Karl Scott: "Good, but expensive!!… it was at £5.00 per month, but they've just doubled the price to over £10+ per month… I'll be moving to another app now." [Play GB](https://play.google.com/store/apps/details?id=com.mobiledatalabs.mileiq&hl=en_US&gl=GB)
- Play GB/US, 2 stars, 2025-01-15, Marge (109 helpful): "sometimes it looks drives that never happened… And on top of all that the price point is a little insane to me. $20 - $30 sure-- but $90+? I'm just going back to my Google sheets" [Play](https://play.google.com/store/apps/details?id=com.mobiledatalabs.mileiq&hl=en_US&gl=GB)
- Play US, 2 stars, 2026-09-11, Frank Poirier: "after a transition from iPhone to Google Pixel… The app refuses to log in… I paid for an annual subscription, that I cannot use." [Play](https://play.google.com/store/apps/details?id=com.mobiledatalabs.mileiq&hl=en_US&gl=US)
- iOS AU, 3 stars, 2026-08-05, Leeroy BK: "They all want our money to be any good. On free mode, this one won't show you a map or even store your frequent destinations. It's also stuck on miles in the reimbursement mode - stupid. Still 40 per month inputs for free vs paying for 'DriversNote' is better than paying I guess" [iOS AU](https://apps.apple.com/au/app/mileiq-mileage-tracker-log/id578830929)
- iOS GB, 2 stars, 2019-11-14, kookygirl: "this app keeps having phases where it logs itself out and if you don't notice and log back in none of your mileage that you have done whilst logged out is tracked." [iOS GB](https://apps.apple.com/gb/app/mileiq-mileage-tracker-log/id578830929)
- iOS GB, 4 stars, 2025-07-29, Kevin159: "I use public transport a lot, and it's a bit of a pain having to manually go in and delete or categorise those journeys one by one." [iOS GB](https://apps.apple.com/gb/app/mileiq-mileage-tracker-log/id578830929)
- iOS US, 1 star, 2017-09-06, Lazy Is Expensive: "Missing several trips every day… Not sure how many thousands of dollars I lost last year on taxes. Go back to pen and paper." [iOS](https://apps.apple.com/us/app/mileiq-mileage-tracker-log/id578830929)

**Everlance**
- Play AU/GB/US listing, 4 stars, 2026-02-11, Nate B. (57 helpful): "this app tracks my location while im at home and constantly dings me with notifications that I'm driving when im sitting still." [Play](https://play.google.com/store/apps/details?id=com.everlance&hl=en_US&gl=AU)
- Play, 3 stars, 2025-01-25, Dylan Musgrave (48 helpful): "sometimes it doesn't automatically track in the background so I always have to make sure I start it before I leave… lately it will preemptively close my trip while stopped for 2 minutes and start a new one" [Play](https://play.google.com/store/apps/details?id=com.everlance&hl=en_US&gl=US)
- iOS GB, 1 star, 2025-03-24, Piele met n W: "After 6 years of using and asking on several occasions for the app support to update the app to remove the $ symbol of monthly reports nothing has happened… paying £60 per annum for an app that is marketed in the UK" [iOS GB](https://apps.apple.com/gb/app/mileage-tracker-by-everlance/id985378916)
- iOS US, 1 star, 2022-10-02, LilBiT1689: "I even swore by it and also put so many people on to it if they were doing any kind of delivery service… Hours of my mileage not tracked at all… What's the point of paying for an app that works 50% of the time?" [iOS](https://apps.apple.com/us/app/mileage-tracker-by-everlance/id985378916)
- iOS US, 4 stars, 2025-01-01, WelcomeHomeSW: "I was missing WEEKS of data here and there (!)… and cost me A LOT in LOST mileage reimbursement credit on my federal taxes… overall they've improved the reliability." [iOS](https://apps.apple.com/us/app/mileage-tracker-by-everlance/id985378916)
- iOS AU, 2 stars, 2019-01-28, Herbbutter: "Upgraded to premium so it constantly tracks my kms… missed 3 days just last week." [iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-everlance/id985378916)

**Driversnote**
- Play US, 1 star, 2026-09-10, "Hi Hi": "You have to pay a ton of money for it record more than 15 trips a month. I'm someone who juggles 3 delivery jobs. It never said anything about paying and then locked my recorded trips behind a paywall. I need those for Taxes!" [Play US](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=US)
- Play US, 1 star, 2025-07-26, paddypods (54 helpful): "There is NO indication that you start on a limited plan: it does NOT tell you upfront you must pay to access full reports for filing taxes" [Play US](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=US)
- Play AU, 1 star, 2025-08-04, Paul Kaczmarek (10 helpful): "older version would keep trips running as 1 when stopping and dropping deliveries of along your travels, now it feels like if you stop at traffic lights too long 1trip." [Play AU](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=AU)
- Play AU, 1 star, 2026-09-13, Adeel Aslam: "last month it crashed on me and i lost a whole work day of tracking. AI support suggested i should buy monthly subscription… driving around 300+ kms multiple stops… the App is Not even opening." [Play AU](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=AU)
- Play GB, 1 star, 2025-12-10, Gadrillion: "barely records any journeys… Price for the app is also misleading, it says £8 but actually charges £9.60." [Play GB](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=GB)
- Play GB, 3 stars, 2022-10-05, Lea: "8 pounds a month!! I nearly passed away!! Just going to go back to a spreadsheet" [Play GB](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=GB)
- Play GB, 2 stars, 2026-07-01, Anthony Calnan: "it also tracks you on a train" [Play GB](https://play.google.com/store/apps/details?id=com.driversnote.driversnote&hl=en_US&gl=GB)
- iOS AU, 2 stars, 2025-03-12, chachabeatboi: "Only to find out suddenly 'Oh no, on your current plan we can only report 15 trips a month.'… I do not have an extra $22 dollars a month to be paying for this." [iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)
- iOS AU, 4 stars, 2025-02-08, Nomfitz: "I use this in Australia every day… need to claim kilometres for my vehicle… I tried using the free ATO one, but found it difficult and clunky." [iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)
- iOS AU, 5 stars, 2023-11-03, kodjal: "Recommended by my accountant as being suitable for ATO, it is so much easier than filling out a log book." [iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)
- iOS AU, 3 stars, 2026-06-17, sx81xm: "the app for some reason sometimes turns automatic tracking off… almost 2 months of untracked trips that I habe to enter manually now… (86km per day!)" [iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916)
- iOS US, 1 star, 2026-02-01, brentgrab: "They're doing this to force people to go pay $10/m for an app to simply log trip miles… you could use Google sheets or another app that is cheaper." [iOS](https://apps.apple.com/us/app/mileage-tracker-by-driversnote/id924418916)

**TripLog**
- Play US, 1 star, 2026-09-11, Denis Gordeev: "drops tracking in the background and literally costs me money on missed mileage deductions. I just did a 90-mile route with multiple stops, and it recorded absolutely nothing… Switching to MileIQ immediately." [Play](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=US)
- Play US, 5 stars, 2026-09-14, Travis Hanson: "TripLog has been a major improvement over Everlance… I like the ability to split/merge trips, use saved locations, tags…" [Play](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=US)
- Play GB, 1 star, 2025-07-30, Mark Hutton: "TripLog captured two of 28 journeys made over a 12 day period… DriversNote was far more intuitive, and captured more drives." [Play GB](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=GB)
- Play AU, 2 stars, 2026-02-25, Kent Martin: "I have tried everything to get Bluetooth start to work but it is very hit and miss." [Play AU](https://play.google.com/store/apps/details?id=com.bizlog.triplog&hl=en_US&gl=AU)
- iOS GB, 1 star, 2022-11-06, RCSMS: "It is my backup to the main one that I have (Mile IQ – which is much better)… I have constantly missed trips on the system." [iOS GB](https://apps.apple.com/gb/app/mileage-tracker-app-by-triplog/id585918522)
- iOS GB, 3 stars, 2021-12-12, Lawlalaw: "It'd be great if it WAS £3.59 a month which is the cost advertised but that DOES NOT INCLUDE VAT and IS NOT AVAILABLE IF YOU PAY MONTHLY" [iOS GB](https://apps.apple.com/gb/app/mileage-tracker-app-by-triplog/id585918522)
- iOS US, 5 stars, 2025-09-10, lil baby liza: "As a full-time independent contractor doing deliveries, I can tell you that tracking mileage is the single most important—and annoying—part of the job. Forgetting to log a few trips a week can cost you hundreds, even thousands, of dollars in deductions" [iOS](https://apps.apple.com/us/app/mileage-tracker-app-by-triplog/id585918522)
- iOS US, 5 stars, 2023-09-25, JaneGun88 (switched from QBSE): "Unless there was any mediocre cell service, it wouldn't record… eventually it stopped recording completely no matter what I tried… So… I downloaded TripLog's app." [iOS](https://apps.apple.com/us/app/mileage-tracker-app-by-triplog/id585918522)

**Hurdlr**
- Play US, 2 stars, 2025-04-30, Don Wurm: "It starts tracking at BT connection to the vehicle… recent updates have caused it to not fill in the default vehicle… I haven't found another app that will start tracking from a BT connection instead of movement or I'd try it." [Play](https://play.google.com/store/apps/details?id=app.hurdlr.com&hl=en_US&gl=US)
- Play US, 3 stars, 2026-02-11, Katie Jandeska: "with the mileage tracker it absolutely destroys my battery… with the tracker its dead before 4pm." [Play](https://play.google.com/store/apps/details?id=app.hurdlr.com&hl=en_US&gl=US)
- iOS US, 5 stars, 2026-04-13, Lexiy2k: "After quick books self employed started becoming an awful application and not auto tracking correctly… I was paying for QBSE $25/Month… This is about $8/month after the free trial!" [iOS](https://apps.apple.com/us/app/hurdlr-mileage-expenses-tax/id951737201)
- iOS US, 2 stars, 2025-12-09, aaronljc255: "I can't get help with an actual person like I used to. I get the very useless AI bot" [iOS](https://apps.apple.com/us/app/hurdlr-mileage-expenses-tax/id951737201)
- iOS US, 5 stars, 2018-06-27, DreamLvrNY: "This is the the only App I found that allows you unlimited mileage in the free version!" [iOS](https://apps.apple.com/us/app/hurdlr-mileage-expenses-tax/id951737201)

**Solo**
- iOS US, 1 star, 2025-03-02, Lala1139: "It promises a 'guaranteed rate'… you will have to not only pay to use the app, but pay to schedule the 'guaranteed rate'. The apps tracking system is completely unreliable" [iOS](https://apps.apple.com/us/app/solo-your-gig-business-app/id1586902173)
- iOS US, 1 star, 2025-01-15, Kodiakman#1: "Solo now only links with five gig apps… Uber, Uber eats, Lyft, DoorDash and Grubhub… There is no spark, there is no Instacart" [iOS](https://apps.apple.com/us/app/solo-your-gig-business-app/id1586902173)
- iOS US, 1 star, 2024-10-24, robond8: "if you 'guarantee' any hour on solo, you have to have an active job(s) taking place in one of the apps that entire hour" [iOS](https://apps.apple.com/us/app/solo-your-gig-business-app/id1586902173)
- iOS US, 5 stars, 2023-06-24, Wellpooty: "Solo is fantastic. What's more, it's 11 pm on a Friday night… these guys were emailing back and forth with me to get it resolved." [iOS](https://apps.apple.com/us/app/solo-your-gig-business-app/id1586902173)

**Para**
- iOS US, 5 stars, 2024-05-12, Natnatjf, quoting an email from Para: "the Para app will be shutting down on May 1, 2024… We felt we were no longer offering a unique experience to our users." [iOS](https://apps.apple.com/us/app/para-gig-drivers-earn-more/id1548322258)
- iOS AU, 1 star, 2023-11-21, Vance Warren: "Everything is in miles. I wish there was an option to change to kilometres… it keeps asking for an American phone number." [iOS AU](https://apps.apple.com/au/app/para-gig-drivers-earn-more/id1548322258)
- iOS AU, 1 star, 2023-11-09, Goncyjn: "Worked amazingly & gave it 5 stars previously as helped deciphering Uber delivery addresses… since introducing phone verification it will not work in Australia" [iOS AU](https://apps.apple.com/au/app/para-gig-drivers-earn-more/id1548322258)
- iOS GB, 3 stars, 2023-07-06, Misfit island: "This application in the United Kingdom does not seem to offer anything other then to reject orders under a certain value" [iOS GB](https://apps.apple.com/gb/app/para-gig-drivers-earn-more/id1548322258)

**QuickBooks Self-Employed (mileage)**
- Play US, 1 star, 2025-02-08, Julie Barajas (31 helpful): "regardless of the notifications I received every time I started driving, the app hasn't tracked a single trip since June of last year… I use over others because of the trip tracking feature. Waste of money." [Play](https://play.google.com/store/apps/details?id=com.intuit.qbse&hl=en_US&gl=US)
- Play US, 1 star, 2024-10-17, Sean E (76 helpful): "A week ago it has completely stopped tracking my millage and I have to use my trip meter and input everything by hand." [Play](https://play.google.com/store/apps/details?id=com.intuit.qbse&hl=en_US&gl=US)
- Play US, 1 star, 2026-08-09, jose lopez: "I'm paying for this app so I don't have to be spending time recording transactions and trips on my own and still have to do it myself" [Play](https://play.google.com/store/apps/details?id=com.intuit.qbse&hl=en_US&gl=US)
- iOS AU, 2 stars, 2019-07-05, Djspete: "even that doesn't track the whole trip in one hit" [iOS AU](https://apps.apple.com/au/app/quickbooks-self-employed/id898076976)

### Inferences
- The main pain point is reliability. Missed or split trips appear in negative reviews for almost every app, and reviewers frame them in money terms ("costs me money on missed mileage deductions", "LOST mileage reimbursement").
- Multi-drop delivery work is poorly served. Auto-detection ends a trip at short stops (Everlance at 2 to 10 minutes, Driversnote at "traffic lights", MileIQ "stopped in traffic"). Couriers then have to merge trips by hand.
- Pricing complaints are strongest in the UK and AU. Reviewers say "£8", "£9.60", "£10+" or "$22" a month is too much, and several say they are going "back to a spreadsheet" or "Google sheets".
- The gig-specific apps (Stride, Gridwise, Solo, Hurdlr, Para) appear to be US-only on iOS. Where they do reach UK or AU users (Para AU, Everlance GB, MileIQ AU), the reviews complain about US defaults: miles, "$", US phone numbers.
- Some users rely on QBSE for mileage and report that its tracker stopped working, which pushes them to TripLog or Hurdlr.

### Gaps
- No Solo Google Play listing was found, so there are no Android ratings for Solo.
- The QBSE US App Store slug returned 404. Its US iOS status (whether it was removed or renamed) is unconfirmed.
- The Play GB and AU pages for Gridwise, Hurdlr and MileIQ AU showed no review count, so the regional figures are incomplete.
- The reviews I sampled are the stores' "most relevant" or featured ones, not a random or most-recent sample. I could not get more because the itunes.apple.com RSS feed was blocked.
- Trustpilot was blocked (403), so I have no Trustpilot quotes.

## Q2. What UK couriers on MoneySavingExpert say about claiming mileage, and which apps they use

### Takeaway
In the MSE threads I fetched, UK posters mostly discuss *rules* rather than apps. The recurring questions are:
- the 45p and 25p HMRC rates
- whether to use simplified expenses or actual costs
- what counts as commuting: home to depot (Amazon Flex) versus multi-restaurant work (Uber Eats)
- how Universal Credit treats mileage: 45p for the first 833 miles a month

Few apps are named. Driversnote comes up with its free-tier trip cap and the £8/month price, MileIQ as "a bit of a life saver", and aCar by Fuelly as a free alternative. Veteran posters often point people back to a notebook, a diary or a Google spreadsheet.

### Cited Findings
- **Gav501, 2019-11-24, "Mileage tracker app" thread:** "Last night I downloaded driversnote mileage tracker app and i must say it seems really good. I'm self employed and have my own van… The problem i have is its only free if you do less than 20 trips a month which i will obviously do more. I was going to subscribe tor £8 a month but thought i would ask here first if there is any free alternatives." [MSE](https://forums.moneysavingexpert.com/discussion/6074301/mileage-tracker-app)
- **00ec25, 2019-11-24, same thread:** "in the olden days 'we' used to keep a notebook and pencil in our cars and write down the details of each trip so we had what HMRC require you to keep ... a mileage log". Gav501 replied: "I was going to just take note but the app is so easy." [MSE comment 76531069](https://forums.moneysavingexpert.com/discussion/comment/76531069/#Comment_76531069); [comment 76531145](https://forums.moneysavingexpert.com/discussion/comment/76531145/#Comment_76531145)
- **laticsforlife, 2019-11-25:** "I use aCar by Fuelly to keep track of my lease car costs, but it also has a trip rec option so should do what you need. Totally free" [MSE comment 76533464](https://forums.moneysavingexpert.com/discussion/comment/76533464/#Comment_76533464)
- **Poster now shown as [Deleted User] (quoted by others as "deannatrois"), 2017-10-09, sole-trader van business:** "We are now preparing mileage reports through an App called MileIQ. If you enter postcodes for where you went each day (have to do return journeys as well), it calculates the 45p a mile… Once we get current, the app will pick up his journeys automatically but a bit of a life saver at the moment lol." [MSE comment 73235725](https://forums.moneysavingexpert.com/discussion/comment/73235725/#Comment_73235725)
- **daddy_bro, 2017-10-08, contractor "doing lots of miles in a van":** "For now I'm using a Google spreadsheet which I have shared with my accountant… My accountant advised me to keep a diary of my mileage but not to record every journey on the spreadsheet." [MSE comment 73233349](https://forums.moneysavingexpert.com/discussion/comment/73233349/#Comment_73233349)
- **Amazon Flex, 00ec25, 2018-10-25:** "You collect stuff from the depot and deliver it to the end customer therefore you are 'depot based' and your journey from home to depot is ordinary commuting and cannot be claimed at all as business mileage" [MSE comment 74963197](https://forums.moneysavingexpert.com/discussion/comment/74963197/#Comment_74963197)
- **Uber Eats, mailsmsi, 2019-01-16:** "After every delivery Uber give millage statistics. Its only distance between restaurant to customer. It does not counted the millage when you drive to restaurant." On 2019-01-17 they added: "I make online webchat with HMRC . They told me it starts from first pickup point and end with last customer home address." [MSE thread](https://forums.moneysavingexpert.com/discussion/5951257/uber-eat-hmrc-millage-calculation); [comment 75330073](https://forums.moneysavingexpert.com/discussion/comment/75330073/#Comment_75330073)
- **silvercar, 2019-01-16:** "You can claim mileage costs for going to the restaurant and delivering and then going to the next restaurant. Basically all the miles that are wholly and exclusively for your work as an Uber Eat driver." [MSE comment 75324089](https://forums.moneysavingexpert.com/discussion/comment/75324089/#Comment_75324089)
- **Universal Credit, NedS, 2020-11-17, Just Eat thread:** "The system allows you 45p per mile, for the first 833 miles per month, and 25p per mile after that. You can not claim any other vehicle related expenses, so no MOT, insurance, Road Tax, repairs etc." [MSE comment 77788854](https://forums.moneysavingexpert.com/discussion/comment/77788854/#Comment_77788854)
- **TheCyclingProgrammer, 2017-11-26, "Courier mileage allowance - help!":** "Mileage allowance is to designed to cover more than fuel costs… Note that you cannot switch between using a flat rate and claiming actual costs for the same vehicle" [MSE thread](https://forums.moneysavingexpert.com/discussion/5750665/courier-mileage-allowance-help)
- **BoGoF, 2019-07-09, "Amazon flex driver rip off":** "The rates are 45p for the first 10,000 miles and 25p thereafter but claiming mileage won't get you anything 'back' when self employed." [MSE comment 76019345](https://forums.moneysavingexpert.com/discussion/comment/76019345/#Comment_76019345)
- **M_anonymous, 2022-10-05, Deliveroo thread:** "It amounts to around 75-80% profit after mileage, insurance, any other expenses" [MSE comment 79533230](https://forums.moneysavingexpert.com/discussion/comment/79533230/#Comment_79533230)
- **Boleyn19, 2025-08-21, "Uber Eats delivery drivers and tax":** the thread is about registering for self-assessment once income passes £1k; LITRG replied with gig-economy guidance. No app was named. [MSE](https://forums.moneysavingexpert.com/discussion/6624959/uber-eats-delivery-drivers-and-tax)

### Inferences
- UK couriers' main confusion is *which miles count*: depot-based versus itinerant, and how platform-reported miles relate to HMRC rules. Tracking itself is a secondary question. The Uber Eats poster notes that the platform's own mileage stats cover only restaurant-to-customer legs.
- Price sensitivity is clear. The only courier-specific app thread is someone asking for a free alternative to £8/month Driversnote.
- Most of the MSE threads I found are from 2017 to 2022. Recent, app-specific courier discussion on MSE looks thin.

### Gaps
- The MSE search page was blocked by Cloudflare, so I could only read threads found through WebSearch. Threads from 2023 to 2026 naming specific apps may exist but were not found.
- Several posts from deleted users show as "[Deleted User]", so I could not attribute them.

## Q3. What Australian drivers on Whirlpool say

### Takeaway
Whirlpool was fully blocked: curl got a Cloudflare 403 on every page, including /archive/ threads, and WebFetch reported the domain blocked by the egress proxy. I have no verbatim Whirlpool quotes. The AU driver sentiment I could get comes from AU App Store reviews instead (Driversnote, Para, Everlance, TripLog in Q1).

### Cited Findings
- Whirlpool thread titles surfaced by WebSearch, which I could not open: "Uber ATO Report - Tax", "Small Business Software for Uber", "Car Log Book app - Apps", "Log book? - Automotive", "Where is the log book? How do I log book?" — [archive/35pnvmj7](https://forums.whirlpool.net.au/archive/35pnvmj7), [archive/2438423](https://forums.whirlpool.net.au/archive/2438423), [archive/1570101](https://forums.whirlpool.net.au/archive/1570101), [archive/2754846](https://forums.whirlpool.net.au/archive/2754846), [archive/2629296](https://forums.whirlpool.net.au/archive/2629296)
- AU App Store proxy evidence:
  - Driversnote is "Recommended by my accountant as being suitable for ATO" (kodjal, 2023-11-03).
  - "I tried using the free ATO one, but found it difficult and clunky" (Nomfitz, 2025-02-08).
  - Para AU reviewers say the app is unusable without a US phone number (Nov 2023).
  - "Everything is in miles" (Vance Warren, 2023-11-21).
  - Source for all four: [Driversnote iOS AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916); [Para iOS AU](https://apps.apple.com/au/app/para-gig-drivers-earn-more/id1548322258)
- Driversnote dominates AU iOS by volume: 31,533 ratings at 4.7, against 134 for Everlance, 89 for TripLog and 23 for MileIQ in the AU store. [Driversnote AU](https://apps.apple.com/au/app/mileage-tracker-by-driversnote/id924418916); [Everlance AU](https://apps.apple.com/au/app/mileage-tracker-by-everlance/id985378916); [TripLog AU](https://apps.apple.com/au/app/mileage-tracker-app-by-triplog/id585918522); [MileIQ AU](https://apps.apple.com/au/app/mileiq-mileage-tracker-log/id578830929)

### Inferences
- By rating volume, Driversnote is the de facto AU logbook app on iOS. The US gig-tax apps are either absent from the AU store or poorly localised.
- AU users compare apps against the free ATO app (myDeductions).

### Gaps
- No Whirlpool post content could be fetched. These threads need a manual browser visit.

## Q4. Blog reviews (The Rideshare Guy, EntreCourier) and their affiliate disclosures

### Takeaway
Both blogs carry affiliate disclosures, and their verdicts conflict:
- **The Rideshare Guy:**
  - Its main mileage-app roundup was updated 2026-06-15. It names MileIQ "OUR TOP PICK" and says "If I had to pick a favorite, it'd probably be Hurdlr".
  - Its older Stride page says "Stride is our favorite mileage tracker" and uses an affiliate download link.
- **EntreCourier** (an independent delivery driver, also an affiliate) gave:
  - Stride a D+, mainly for no auto-tracking, battery drain and weak expense categories
  - Solo a C, with a D- for mileage tracking: missed trips and a non-IRS-compliant log

### Cited Findings
- **The Rideshare Guy, "What are the best apps to track your mileage"** (Harry Campbell; published 2021-03-26, modified 2026-06-15). [RSG](https://therideshareguy.com/day-5-what-are-the-best-apps-to-track-your-mileage/)
  - Disclosure: "some or all of the products featured below are from partners who may compensate us for your click."
  - Top pick: "OUR TOP PICK: MileIQ automatically detects every drive and tracks your routes with superior accuracy – especially in stop-and-go traffic"
  - MileIQ pricing: "MileIQ allows you to track up to 40 trips for free per month. After that, you'll pay $8.99 per month or $90 per year… Most rideshare drivers will go through those 40 trips very quickly"
  - QBSE: "QuickBooks Self-Employed… has a built-in automatic mileage tracker that is very good… It also beat every app on accuracy and mobile data usage."
  - Hurdlr: "If I had to pick a favorite, it'd probably be Hurdlr… free semi-auto tracking (meaning the app records and classifies all trips as 'business,' so you have to go back in and re-classify each one manually)"
  - TripLog: "TripLog's free version gives you unlimited, automatic mileage tracking… Plug-N-Go is actually my favorite option"
- **The Rideshare Guy, Stride page** (Chonce Maddox Rhea; published 2021-01-05, modified 2024-09-03): "Stride is our favorite mileage tracker" and "Download Stride Tax here for FREE using our affiliate link." It also says: "The downside is that you do have to manually input to track your miles." [RSG](https://therideshareguy.com/stride-tax-app-mileage-tracker/)
- **The Rideshare Guy, TripLog review** (modified 2025-04-23): "TripLog's Premium plan starts at $4.99 per month… Plug-N-Go… The only possible issue is that you have to remember to plug in your phone." [RSG](https://therideshareguy.com/triplog-review/)
- **EntreCourier, Stride review** (published 2021-10-29, modified 2023-01-25). [EntreCourier](https://entrecourier.com/delivery/delivery-strategies/delivery-tools/stride-tax-app-review-2021/)
  - Disclosure: "As an Amazon Associate and an affiliate for other programs, I earn from qualifying purchases."
  - Verdict: "Stride Tax scored a D+ in our report card."
  - On tracking: "Stride does not offer automatic mileage tracking… Forgetting to do so means you don't capture your miles for the day."
  - On battery: "Stride is a really bad battery hog… consistently at the top. This has created problems on longer delivery shifts."
  - Business model: "it's really all about creating a sales funnel for their insurance business."
- **EntreCourier, Solo review** (2022-11-21). [EntreCourier](https://entrecourier.com/delivery/delivery-strategies/delivery-tools/solo-app-review-mileage-tracking/)
  - Disclosure: "I am an affiliate of the Solo app… Solo is offering a bonus of $10 if you download the app and link your driver accounts using my affiliate link."
  - Mileage grade: "Final Grade for Mileage Tracking: D- (0.5 points)"
  - On missed trips: "The missed trips on Solo is a major (and expensive) problem."
  - On the log: "Solo does not provide an IRS-compliant mileage log."
  - On the concept: "Their concept of using driver app data to classify trips automatically is brilliant. The only app that is anywhere close to them in that regard is Triplog"
  - Overall grade: "Solo: Grade C (2.06) | Stride Tax: Grade D+ (1.33)"
- **EntreCourier, Hurdlr vs Stride** (published 2020-11-16, modified 2022-07-07): "Neither Stride nor the free version of Hurdlr have automatic tracking available… *I may be paid for purchases through affiliate links." [EntreCourier](https://entrecourier.com/delivery/delivery-strategies/delivery-tools/compare-hurdlr-vs-stride-tax-which-free-mileage-app-is-best-for-delivery/)

### Inferences
- The blog recommendations are affiliate-influenced and inconsistent. RSG names MileIQ as top pick, Hurdlr as favourite and Stride as favourite on different pages. Treat them as weak evidence.
- EntreCourier's driver-tested grades match the app-store complaints: missed trips, battery drain, and logs that don't fit tax categories.
- Both blogs are US-focused (IRS, Schedule C). Neither covers HMRC or ATO needs.

### Gaps
- therideshareguy.com/best-mileage-tracker-apps/ returned 404, so I used the "day-5" roundup instead.
- I found no RSG or EntreCourier reviews of Gridwise or Driversnote in this pass.
