# Recommendation: Build the Auto Mileage + Receipt Tax Tracker

**Working title:** *TripLedger* (placeholder, still to be checked for trademark and App Store availability)
**Status:** Pre-design. This report needs your sign-off before any design work starts.

## The pitch

> "Drive, snap, done. TripLedger automatically logs every business drive and receipt, sorts them with private on-device AI, and gives you an accountant-ready tax report. Most users find more in deductions in their first week than the app costs for a year."

## Why it beats the other 9

| Factor | Mileage tracker | Nearest rival (GLP-1 companion) |
|---|---|---|
| **The app pays for itself** | Yes. 100 business miles ≈ $70 in deductions (IRS) or £45 (HMRC). The paywall can show *your* dollar figure. | No. Value is emotional, not measurable. |
| **Incumbents vulnerable** | MileIQ raised its price to $13.99/mo; Stride is around 3.0★ with reliability complaints | Big players (MyFitnessPal + Cal AI) are moving in |
| **Retention** | Legal record-keeping need that lasts all year, every year. Annual plans renew because the tax deadline comes back. | High at first; drops if the user stops the medication |
| **Unit economics** | Nearly zero marginal cost. On-device location, OCR and Foundation Models; CloudKit sync. | Similar |
| **App Review / regulatory risk** | Moderate (background location needs a clear justification) | Higher (medical claims, health data) |
| **Category conversion** | Business is the purest subscription category (about 76.5%) with long-term intent | Health & Fitness has high ARPU but more churn |
| **Built for native iOS** | Visit monitoring, CarPlay/Bluetooth car detection, Live Activities, Watch, widgets, App Intents | Fewer platform hooks |
| **Weakness** | Slower to first $1K MRR (business-app median is 113 days); tax-season peaks | — |

The runner-up, the **GLP-1 companion**, is the better choice only if you would rather have faster, social-media-driven growth and can accept higher regulatory and competitive risk.

## Target users

1. **Gig drivers** (rideshare, delivery): high mileage, price-sensitive, found through ASO and Reddit.
2. **Self-employed tradespeople and field workers** (plumbers, cleaners, carers, estate agents/realtors): moderate mileage plus receipts, **highest willingness to pay**.
3. **Employees who get mileage reimbursement**: need clean reports for their employer. A good free-tier feeder.

## Product scope (v1, around 8–10 weeks for a solo developer)

**Free:**
- 30 auto-detected drives per month, unlimited manual trips
- Swipe left for personal, right for business
- Running "deductions found" counter (the moment users see the value)

**Pro ($7.99/mo · $49.99/yr with a 30-day trial · undercuts MileIQ by about 70%):**
- Unlimited auto-detection, including car Bluetooth/CarPlay triggers so trips start reliably
- **Smart rules**: on-device AI learns "weekday 8–6 near client addresses = business"
- **Receipt capture**: VisionKit scan, then Foundation Models pull out merchant, amount and category
- IRS-/HMRC-compliant PDF and CSV reports, plus a Schedule C / SA103 summary
- Multiple vehicles, custom rates, and a mode for employer reimbursement
- Home-screen and Lock Screen widgets, and a Live Activity during a drive

**Deliberately not in v1:** bank-feed integration, accountant web portal, Android, team/fleet plans. These come in v2 and would be revenue expansions.

## How it stands out

1. **Privacy.** Location history never leaves the device except through the user's own iCloud. Competitors upload it. This is a strong message in App Store copy.
2. **Reliability.** Trip detection triggered by the car's Bluetooth or CarPlay connection, rather than GPS guesswork, fixes the #1 complaint about Stride and MileIQ.
3. **Free AI.** Categorisation runs on-device, so there are no token bills and the margin stays around 85% after Apple's 15% Small Business cut.

## Revenue model and rough projections (assumptions, not guarantees)

Net per annual subscriber is about **$42.50** ($49.99 minus Apple's 15% Small Business Program cut).

| Scenario | Year-1 installs | Download → paid | Paying subs | Approx. Year-1 net |
|---|---|---|---|---|
| Conservative (median, 2.8%) | 30,000 | 2.8% | 840 | **~$36K** |
| Solid (top-quartile, 6%) | 60,000 | 6% | 3,600 | **~$150K** |
| Breakout (ASO + creator partnerships) | 150,000 | 6% | 9,000 | **~$380K** |

In the solid scenario, renewals plus new users in year 2 put a $15–30K MRR business within reach. The key levers are ASO for "mileage tracker" and "mileage log" keywords, creator partnerships with gig-economy YouTubers, and a January–April tax-season push.

## Top risks and how to handle them

| Risk | Mitigation |
|---|---|
| Battery drain complaints | Use visit/significant-change monitoring plus Bluetooth triggers, with GPS only while driving. Publish a battery figure. |
| App Review rejects background location | Clear purpose strings, an in-app explainer, and "Always" permission requested only after the user sees the value. |
| Tax-rule accuracy | Rates stored as data that can be updated remotely, a disclaimer, and a yearly review. Launch US-only or UK-only first. |
| Seasonality | Annual plans; monthly "deductions found" summary notifications keep users engaged all year. |
| Everlance (4.8★) is strong | Compete on price, privacy and native polish, and avoid its bank-linking complexity. |

## Decisions I need from you before design

1. **Launch market:** US first (bigger market, IRS) or UK first (less competition, HMRC 45p rule, Making Tax Digital from 2026)?
2. **Name:** keep *TripLedger* as a placeholder, or brainstorm names now?
3. **Build route:** native Swift/SwiftUI (recommended) or cross-platform (Expo/React Native) to get Android as well?
4. **Budget:** any paid-acquisition budget (Apple Search Ads), or organic only?
5. **Hardware:** do you have a Mac with Xcode and an Apple Developer account ($99/yr)? The iOS build step needs macOS. This cloud session runs on Linux.
