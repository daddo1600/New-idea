# MileMint vs Competitors: Feature Gap Analysis

**Rule:** a feature goes in only if it (a) fixes a real complaint, (b) saves the user time every week, or (c) makes the record stand up to an audit. Anything else waits.

## Where we stand today (honest)

The current build is a **manual logbook**. Every competitor already auto-tracks drives, which is their core feature, so **today they're all ahead of us**. The comparison below is against the *planned* v1 (`03` and `06`), to find what's missing from the plan.

## Feature-by-feature

| Feature | Who has it | In our plan? | Verdict | Why |
|---|---|---|---|---|
| Automatic trip detection | All | ✅ Planned (layered: motion + car Bluetooth/CarPlay + GPS) | **Must** | It's the product. #1 complaint is missed trips. |
| **Work-hours / shift auto-classify** | MileIQ, Driversnote, TripLog | ⚠️ Vague ("smart rules") | **ADD, v1** | Drivers complain about classifying 30–40 trips a day. Set hours once and trips sort themselves. |
| **Frequent-route auto-classify** | MileIQ | ⚠️ Vague | **ADD, v1** | Classify "Home → Acme" twice and it's automatic from then on. Big weekly time saver. |
| **Named places** ("Home", "Acme HQ") | MileIQ | ❌ | **ADD, v1** | Makes logs readable for the IRS and auto-fills the business purpose. Cheap to build. |
| **Swipe to classify** | MileIQ (its signature habit) | ❌ (we use buttons) | **ADD, v1** | Fastest way to clear a backlog. Keep the buttons for accessibility. |
| **Merge short stops into one trip** | Gridwise (complaint about others) | ❌ | **ADD, v1** | Delivery drivers wait at restaurants, and other apps split one shift into dozens of trips. |
| Bulk classify | MileIQ (web) | ❌ | **ADD, v1 (in-app)** | Select a week and mark it all business. |
| Map of each trip | Most | ❌ | **ADD, v1** | Builds trust ("did it catch my route?") and is useful evidence. Uses the phone's built-in maps, no cost. |
| Odometer readings | TripLog, Driversnote | ✅ Planned | **Keep, add photo** | The IRS expects total annual miles. A photo of the odometer on 1 Jan / 31 Dec is strong proof. |
| Multiple vehicles | Most | ✅ Planned | **Keep** | Common for trades; small effort. |
| Receipt photo capture | TripLog, Everlance | ✅ Planned | **Keep** | Tolls, parking and fuel are real deductions. |
| PDF/CSV reports | All | ✅ Planned | **Keep** | Required for accountants. |
| Import from MileIQ etc. | TripLog | ✅ Planned | **Keep** | Lowers switching cost mid-year. |
| **Simple income log** | Gridwise, Solo, Everlance | ❌ | **ADD, lightweight v1** | Without income we can't give the "tax set-aside" estimate. Manual weekly entry only; no gig-platform connections. |
| Quarterly tax estimate | Hurdlr, Gridwise (via partner) | ✅ Planned | **Keep** | Needs the income log above. |
| **Commute warning** | None found | ❌ | **ADD, v1 (differentiator)** | Home → regular workplace is not deductible under IRS rules. A gentle flag prevents the most common audit mistake. |
| Web dashboard | MileIQ, Everlance | ❌ | **Skip for now** | Solo users live on the phone. Costs a server and conflicts with local-first. Revisit with sync. |
| Bank/card sync + deduction finder | Everlance, Stride | ❌ | **Skip for now** | Expensive (bank-data fees), privacy-heavy, and a different product. Revisit in v2 if users ask. |
| Tax filing inside the app | Everlance (TaxSlayer) | ❌ | **Skip** | A partnership play for later. Clean exports cover it for now. |
| $1M audit protection | Everlance ($99.99/yr plan) | ❌ | **Skip (maybe partner later)** | An insurance product, not a feature. Our audit-ready log is the honest version. |
| Bluetooth beacon hardware | Driversnote, TripLog | ❌ | **Skip** | Car Bluetooth/CarPlay does the same job free. |
| Earnings heatmaps ("where to drive") | Gridwise | ❌ | **Skip** | Different product (earnings optimisation), crowded. |
| Teams / employer reimbursement admin | MileIQ, Everlance, TripLog | ❌ | **Skip (v2 revenue expansion)** | B2B needs admin tools and sales, not our launch audience. |
| Manual trip by picking addresses (auto distance) | TripLog | ❌ | **v1.1** | Nice for forgotten trips; needs a routing service. Missed-Trip Recovery covers most cases. |

## Net change to v1 scope

**Adding (8):**
1. Work-hours/shift rules
2. Frequent-route learning
3. Named places
4. Swipe to classify
5. Stop merging
6. Bulk classify
7. Trip map
8. Commute warning

Plus two small extras: an odometer photo and a lightweight income log.

**Deliberately not building:** web dashboard, bank sync, in-app tax filing, audit insurance, hardware beacon, earnings heatmaps, team admin.

**Principle check:** every addition either cuts weekly effort (the top 6), or protects the deduction (map, odometer photo, commute warning). Nothing is there just to fill a comparison chart.

## Sources

- [MileIQ: work hours and shifts](https://support.mileiq.com/hc/en-us/articles/203798899-How-to-set-Work-Hours-and-Work-Shifts)
- [MileIQ: frequent drives](https://support.mileiq.com/hc/en-us/articles/211261803-How-to-auto-classify-Frequent-Drives)
- [MileIQ: what you can do](https://support.mileiq.com/hc/en-us/articles/218138823-What-can-I-do-with-MileIQ)
- [MileIQ: reports](https://support.mileiq.com/hc/en-us/articles/115000410626-The-Reports-view-US)
- [Everlance: expense management](https://www.everlance.com/expense-management)
- [Everlance: audit protection](https://www.everlance.com/tax-audit-protection)
- [Everlance + TaxSlayer](https://www.everlance.com/blog/the-self-employed-workers-secret-weapon-everlance-mileage-tracking-meets-taxslayer-filing)
- [Timeero: TripLog review](https://timeero.com/reviews/triplog-review)
- [Driversnote: classifying](https://www.driversnote.com/classifying)
- [Gridwise vs Everlance vs Stride](https://gridwise.io/blog/gridwise-vs-everlance-vs-stride)
- [TruMile: Reddit roundup](https://trumile.app/compare/best-mileage-tracker-reddit/)
- [TripLog: importing MileIQ trips](https://help.triplog.net/en/articles/10562054-importing-mileiq-trips)
