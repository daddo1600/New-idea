# 500-person simulated panel: would they download, keep and pay?

**What this is:** 500 AI-simulated personas across eight segments in the UK, US, Canada and Australia. Each one was briefed on MileMint as it is today (features, prices, competitors, honest unknowns) and told to be a tough critic. It is **directional, not real data.** Stated willingness to pay always overstates real conversion, so treat the pay figures as a ceiling. Use the reasons more than the percentages, and check them with real TestFlight users and a landing-page test.

The raw data (one JSON record per persona) and each segment's write-up are in [`research/persona-panel-2026-10/`](research/persona-panel-2026-10/).

---

## The headline

| | All 500 | iPhone users only (309) |
|---|---|---|
| **Can't install (Android)** | **38%** | – |
| Would download (yes) | – | **49%** (86% yes + maybe) |
| Still using after 2 weeks (of those who'd try) | – | 41% |
| Would pay | 26% | **41%** (78% of payers prefer yearly) |
| Median monthly price ceiling (payers) | ~£4–5 / $5 / C$6 / A$7 | |
| Net Promoter Score | −77 | −63 (mean 5.4/10; only 8 promoters) |

**In one sentence:** the idea is right and parts of it impress (the missed-miles check, the languages, no account), but **iPhone-only, no backup, and gaps for anyone not on the simple per-mile rate** stop most people. The few who would pay want it cheaper monthly or yearly.

### By segment

| Segment | n | On Android | iPhone: download yes | Keep after 2 wks | Would pay | Median ceiling/mo | NPS |
|---|---|---|---|---|---|---|---|
| UK couriers | 70 | 49% | 61% | 52% | 23% | £4 | −74 |
| UK self-employed and trades | 70 | 43% | 58% | 49% | 26% | £4.17 | −76 |
| UK employees (own car) | 60 | 43% | 38% | 30% | 13% | £3 | −87 |
| US gig drivers | 70 | 33% | 43% | 40% | 20% | $4.99 | −76 |
| US self-employed and field workers | 60 | 38% | 38% | 34% | 27% | $6 | −75 |
| Canada | 55 | 44% | 55% | 39% | 36% | C$6 | −82 |
| Australia | 55 | 35% | 39% | 43% | 20% | A$7 | −78 |
| Sceptics and edge cases | 60 | 20% | 56% | 39% | 42% | ~5 local | −70 |

**How they track mileage today:**

| Method | People |
|---|---|
| Nothing at all | 109 |
| Paper log | 72 |
| Spreadsheet | 66 |
| Accountant's estimate | 59 |
| The delivery app's own miles | 56 |
| Employer expense system | 41 |
| Another app | about 95 (Stride 23, MileIQ 19, Driversnote 15, Gridwise 12, Everlance 12, others) |

**The biggest opportunity is the 109 doing nothing and the 130 on paper or spreadsheets, not converts from other apps.**

---

## What already works (lead the marketing with these)

1. **The missed-miles check.** It was the most-praised feature: 43 people called it the best thing. The quotes show why:
   - "It showed me £40 of miles Uber never counted in a fortnight." (Uber Eats driver)
   - "Uber said 9 thousand miles, the app found almost 14 thousand." (US gig driver)
   - "This showed me thousands of extra kilometres I was leaving on the table." (Canada)
2. **The languages.** 52 people named them, especially Punjabi, Spanish, Portuguese and Hindi speakers. No competitor does this.
3. **No account, data stays on the phone.** This wins privacy-minded people.
4. **Price against MileIQ and Everlance.** "If this catches them at a third of the price, I'm in."
5. **First-time claimers get a shock.** "I've never claimed a single mile and it found me £600 in my first month, which made me feel a bit sick." Lead with the money left unclaimed.

## What kills it (in order of how many it costs)

1. **iPhone only.** 112 people named it as their biggest concern and 117 asked for Android. It's worst among couriers, Punjabi drivers in Canada and migrant riders: "Half the lads on site are on Samsungs", "Almost every driver I know in Brampton has a Samsung". It also **breaks the WhatsApp referral loop**, because a courier's friends can't install it. 44 Android users said they'd pay once it exists.
2. **The figure isn't always the claim.** These people use a different method:
   - **Company vans and actual-cost claimers** (39 concerns): "Once you claim capital allowances on the van you can't switch to mileage."
   - **Canada:** the self-employed claim actual costs × business-use %. "The 73 cents number is nice but it doesn't go on my return."
   - **Australia:** the 5,000 km cap. High-km drivers need the 12-week logbook method: "I do 45,000 k's a year mate."
   - **"£X found" reads as cash.** People assume it's money they get back.
3. **Privacy and "Always" location for a new app** (49 concerns). Care workers don't want patients' addresses on a personal phone. Sceptics want to know when tracking silently stops.
4. **Price and the free plan:**
   - **Price:** monthly is too high for most. The median ceiling is £4 / $5, while the list price is £5.99 / $5.99 (A$9.99 especially).
   - **The free cap:** 40 drives last a tradesperson only 5–8 days.
   - **Shift mode leaves nothing to pay for.** A whole shift counts as one drive, so full-time couriers never hit the cap. The segment that loves the app most has no reason to pay.
5. **Accounting and accountants** (43 requests). People want exports to Xero, QuickBooks and FreeAgent, Making Tax Digital quarterly summaries, and a way to share with their accountant. "QuickBooks already tracks my miles and puts them where my bookkeeper looks." Only 2 of 8 accountants would recommend it today: "rates right, workflow wrong".
6. **No backup and no track record.** "If my phone goes in a lake I lose a year of evidence." Accountants want a locked edit history.
7. **Battery on long shifts** (24). People want published battery figures.
8. **Earnings and expense tracking** (29 requests, mostly US gig drivers): "Stride's free and estimates my taxes; you're charging six bucks for less."
9. **Teams.** Small business owners want to see their staff's drives (it's on the roadmap in `10-roadmap-teams.md`).
10. **Accessibility.** Swipe-to-sort is unusable with VoiceOver or a hand tremor.

---

## What to do

### Before App Store launch: quick wins in the app

| Change | Why | Effort |
|---|---|---|
| **Encrypted iCloud backup** (still no account) | Fixes "phone in a lake". The biggest trust gap for every segment and for accountants. | Medium |
| **Alert when location permission is lost** or tracking stops | Sceptics' top quiet fear, and stops missed miles. | Small |
| **Show "≈ tax saved" next to "deduction found"** (switchable) | Stops "£X found" reading as cash, and is honest. | Small |
| **Accounting-ready CSVs:** Xero, QuickBooks, FreeAgent formats, plus an "expense claim" layout (date, from/to postcodes, purpose, miles, cost centre) | Accountants and employees, cheaply, before full integrations. | Small–medium |
| **VoiceOver actions and tap buttons for business/personal** | Accessibility, and anyone with gloves or a tremor. | Small |
| **Privacy mode:** store only the area or postcode, not exact addresses | Care workers and privacy sceptics. | Small–medium |
| **Import from MileIQ, Driversnote and Stride exports** | Lowers the cost of switching. | Medium |

### Pricing (fix before launch)

- **Lower the monthly price and lean on yearly.** For example £3.99 / $4.99 a month, and £34.99 / $39.99 a year as a "Founding 1,000" price with the 30-day trial. Most payers stop at about £4–5 a month, and 78% prefer yearly.
- **Make Pro worth it for couriers without making the free plan worse.** Put the things couriers asked for in Pro:
  - backup;
  - PDF and accounting exports;
  - the missed-miles history and yearly report;
  - more shifts — for example free = 40 drives **or** 12 shifts a month, Pro unlimited;
  - earnings tracking later.
- **A$9.99 is the outlier.** Bring Australia in line, at about A$6.99 a month or A$54.99 a year.

### Next big build: Android

38% of the panel can't install the app, and it's the top request in every segment. MileMint is built with Expo, so the code is largely shared and Android costs far less than a rewrite. Expect work on background location, battery tuning and Play Store review. **Do it before scaled courier marketing**, otherwise the WhatsApp loop stalls.

### Then, by market

- **UK:** Making Tax Digital quarterly summary; an actual-costs mode for vans or just honest guidance; a P87 helper for employees.
- **Australia:** the 12-week logbook method (Driversnote's moat); a GST/BAS summary for rideshare drivers.
- **Canada:** business-use % and actual-costs mode; the CRA logbook sample period; Revenu Québec wording.
- **US:** a quarterly estimated tax (1040-ES) figure; earnings and expenses tracking against Stride and Gridwise.

### Marketing implications

- **Target first:** iPhone-using **car and Amazon Flex couriers**, and **first-time claimers** (people on paper or nothing).
- **Lead with the missed-miles check and the languages.** Don't lead with features competitors also have.
- **Don't target yet:**
  - company-van owners and actual-cost claimers;
  - Australian high-km drivers, until the logbook method exists;
  - employees already paid 45p+ through an expense system.
- **Accountants are a channel only once** backup, the audit trail and accounting exports exist.

---

## Caveats

- These are simulated people built from public knowledge of these markets. They can share blind spots and tend to be harsher on a brand-new product than real users who've actually seen it work.
- The **real test** is TestFlight retention (do testers still open it after two weeks?), real trial-to-paid conversion, and a landing page with an Android waitlist button to measure demand.
