# How We Beat the Competition: US Mileage Tracker

**Market decision:** **US first** (much bigger market). UK added later: it's a territory toggle in App Store Connect plus HMRC rules (45p/25p per mile, tax year starting 6 April).

## 1. The market in numbers

| Fact | Figure | Source |
|---|---|---|
| Self-employed Americans | ~16.6M (Dec 2025), about 10% of employment | Carry |
| Broader independent workers | ~59–73M (freelance + part-time gig) | MBO Partners via Octagon / Digital Applied |
| IRS 2026 business rate | 72.5¢/mi Jan–Jun, **76¢/mi from 1 July 2026** (mid-year rise, reported by Driversnote and Bradyware; confirm on irs.gov before shipping) | IRS / Driversnote |
| Value per driver | 20,000 business miles ≈ **$14.5K+ deduction ≈ $3.7–4.5K actual tax saved** | TruMile |
| Penalty for bad records | Deduction disallowed + back taxes + 20% accuracy penalty | Pub 463 summaries |
| Leader's scale | Everlance: ~40K downloads and ~$100K revenue/month (Sensor Tower estimate, down from ~$200K in 2022) | Sensor Tower |

**What this means:** the value to users is huge (thousands of dollars each), while the leading app earns about $1.2M/yr and is shrinking. The category is under-served, not saturated.

## 2. Competitor map

| App | Price | Free tier | Strength | Weakness users complain about |
|---|---|---|---|---|
| **MileIQ** | $13.99/mo (was $5.99 in 2025) | 40 drives/mo | Brand, Microsoft-era trust | **Misses trips** ("misses at least 20% of my miles"), battery drain, price hikes |
| **Everlance** | $8.99/mo | 30 drives/mo | 4.8★, expenses + bank sync | Battery drain, **false "you're driving" alerts at home** |
| **Driversnote** | $8.99/mo (reported up to $17–20) | 15 drives/mo | Compliance focus, iBeacon hardware | **15–20% daily battery**, phone heats up, price |
| **Stride** | Free | – | Free, 2.6M users | ~3.0★ reliability; **insurance upsell**; no receipt scanning |
| **Gridwise** | Free / cheap annual | – | Links to gig apps, earnings compare | Gig-only; mileage is secondary |
| **Hurdlr** | $10/mo | – | Real-time tax-owed estimate | Complex; mileage isn't the focus |
| **TripLog** | Varies | – | Good support | Dated UX |

**The pattern:** every competitor fails on at least one of the three things users care about most: **accuracy, battery, and fair price**. Nobody wins all three.

## 3. Our strategy: seven ways we win

### ① "Never miss a mile": layered trip detection (fixes the #1 complaint)
Instead of guessing from GPS, stack cheap signals and switch GPS on only while driving:
1. **Motion coprocessor** (CoreMotion `automotive` activity): costs almost no battery and is always on.
2. **Car Bluetooth / CarPlay connect**: instant, precise start and stop.
3. **Visits + significant-location change** as a backstop.
4. **GPS only between trip start and end.**

On top of that, a **Missed-Trip Recovery** check: if the phone was at place A and later at place B far away with no trip logged, we ask "Looks like you drove A → B at 2:14pm. Add it?"

### ② Battery we can prove
Target **under 3% battery per day** and publish the test results on the App Store page and website. Competitors are known for 15–20%.

### ③ A "detection health" screen
Many missed trips are caused by permission or settings problems: location set to "While Using", Background App Refresh off, Low Power Mode. We show a green/amber/red health check and fix-it buttons. Nobody else does this well.

### ④ Records that stand up to an audit
- Captures every IRS Publication 463 field (date, start/end, purpose, miles) plus **odometer readings at the start and end of the year**.
- **Contemporaneous timestamps** plus a **tamper-evident edit history**, so it's clear that auto-logged trips weren't reconstructed later.
- **Split-rate years handled automatically** (the 2026 rate changed mid-year). Rates are delivered as remotely updated data.
- A **Weekly Review** prompt: Publication 463 treats a weekly log as timely, so the retention habit doubles as compliance.

### ⑤ Fair, simple pricing, with no insurance or ad upsells
| | Us | MileIQ | Everlance | Driversnote |
|---|---|---|---|---|
| Monthly | **$5.99** | $13.99 | $8.99 | $8.99+ |
| Annual | **$49.99** (30-day trial) | – | – | – |
| Lifetime | **$129.99** (tests well against subscription fatigue) | – | – | – |
| Free tier | **40 auto drives/mo + unlimited manual + free CSV export** | 40 | 30 | 15 |

Against the free apps (Stride, Gridwise): we win on reliability, no upsells and privacy. The free tier stays generous so we compete on quality, not price.

### ⑥ More than mileage, still simple (Pro)
- **"Tax set-aside" meter:** a running estimate of deductions and the tax they save, plus **quarterly estimated-tax reminders** (Apr 15 / Jun 15 / Sep 15 / Jan 15). This borrows Hurdlr's best idea without its complexity.
- **Receipt scan** for tolls, parking, fuel and phone, sorted by on-device AI.
- **Shift mode:** one tap for multi-app gig drivers (Uber + DoorDash + Instacart). Everything logged in a shift counts as business.
- **Exports** in a Schedule C–friendly layout (PDF for accountants, CSV for TurboTax / H&R Block).

### ⑦ Make switching easy
- **Import** existing MileIQ, Everlance and Stride exports (CSV), so people don't lose their year's history.
- **Privacy:** location data stays on the phone and in the user's own iCloud. No ad or insurance data sharing. This is a headline selling point.

## 4. Getting users (US)

| Channel | Tactic |
|---|---|
| **App Store search (ASO)** | Target "mileage tracker", "mileage log", "doordash mileage", "uber driver tax", "1099 deductions", "gig tax". Screenshots lead with "Never miss a mile" and "<3% battery". |
| **Timing: launch before 1 Jan 2027** | People start fresh logs for the new tax year, and Jan–Apr is peak search. Aim for TestFlight in early December and App Store launch in late December. |
| **Reddit** | Genuine, helpful participation in r/doordash_drivers, r/uberdrivers, r/couriersofreddit and r/tax. Show the battery test data. |
| **YouTube / TikTok gig creators** | Affiliate deal (e.g. 30% of first-year revenue). Gig-worker creators like The Rideshare Guy review these apps every year. |
| **Comparison pages (SEO)** | Competitors all run "X vs Y" blog posts. We publish honest ones: "MileIQ alternative", "Everlance vs [us]". |
| **Apple Search Ads** | Small budget on competitor brand terms during Jan–Apr only. |
| **Reviews** | Ask for a rating right after the "You've found your first $100 in deductions" moment. |

## 5. Scope impact on v1

Adds to the v1 scope in `03-recommendation.md`: detection health screen, Missed-Trip Recovery, odometer prompts, edit history, split-rate support, CSV import from competitors, shift mode, tax set-aside meter. Bank sync, earnings import and an accountant portal stay in v2.

## Sources

- [IRS: 2026 business standard mileage rate](https://www.irs.gov/newsroom/irs-sets-2026-business-standard-mileage-rate-at-725-cents-per-mile-up-25-cents)
- [Driversnote: IRS rate increase to 76¢](https://www.driversnote.com/blog/irs-mileage-rate-2026)
- [Bradyware: mid-year rate change](https://bradyware.com/irs-raises-business-mileage-rate/)
- [TruMile: best mileage tracker according to Reddit](https://trumile.app/compare/best-mileage-tracker-reddit/)
- [Trendifacts: battery tests](https://trendifacts.com/best-mileage-tracker-apps-drivers/)
- [Gridwise: 2026 comparison](https://gridwise.io/blog/best-mileage-tracker-app)
- [SparkReceipt: best mileage trackers](https://sparkreceipt.com/blog/best-mileage-tracker-apps/)
- [Magica: MileIQ 2026 pricing](https://magica-app.com/best-mileiq-alternatives-2026/)
- [Sensor Tower: Everlance](https://app.sensortower.com/overview/985378916?country=US)
- [Carry: self-employed Americans](https://carry.com/learn/self-employed-americans)
- [Octagon: gig economy statistics](https://octagonpeople.com/gig-economy-statistics-freelance-workforce/)
- [Driversnote: IRS log requirements](https://www.driversnote.com/irs-mileage-guide/mileage-log-requirements)
- [Gigodo: what Pub 463 requires](https://gigodo.app/blog/mileage/mileage-log-irs-audit)
- [Apple Energy Guide: location best practices](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/EnergyGuide-iOS/LocationBestPractices.html)
- [Apple: manage app availability by country](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store/)
