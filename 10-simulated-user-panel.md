# Simulated User Panel: 500 Personas Review MileMint

**Date:** 1 October 2026 · **Build reviewed:** 1.0 (5), before the quick tour and shift mode

> **This is simulated research, not real users.** Five AI reviewers each role-played 100 distinct US personas, after looking at every app screen and the icon. It is useful for spotting confusing screens and missing features early. It is **not** a reliable predictor of real download or purchase rates. Treat the numbers as directional, and confirm the findings with real TestFlight testers.

Raw data: `data/user-panel/seg_*.csv` (500 rows, 19 columns).

## Scores by segment

| Segment (100 each) | First impression | Easy to understand | Looks | Trust/privacy | Would download | Would pay $69.99/yr |
|---|---|---|---|---|---|---|
| Gig drivers | 5.1 | 6.7 | 6.9 | 6.5 | 4.8 | 6% |
| Trades and field workers | 6.0 | 7.0 | 6.7 | 7.1 | **6.0** | 17% |
| Sales, real estate, consultants | **6.2** | 6.8 | 5.8 | 6.8 | 5.6 | **20%** |
| Reimbursed employees | 5.9 | 6.5 | **7.2** | **7.8** | 5.1 | 2% |
| Switchers, skeptics, accountants | 6.0 | 6.6 | 6.8 | 6.9 | 5.3 | 7% |
| **All 500** | **5.8** | **6.7** | **6.7** | **7.0** | **5.3** | **10%** |

Scores are out of 10. Net Promoter Score is about **−79**, so almost nobody would recommend the app *in its current state*.

**Ease drops with age and tech comfort:**
- Tech comfort 1/5 averages 4.7 on ease; 5/5 averages 8.2.
- Under-35s average 7.3; over-55s average 5.9.

## What people said (counts are mentions)

| Theme | Mentions | Who |
|---|---|---|
| **No PDF/CSV export for the accountant, employer or taxes** | ~167 | Everyone; a dealbreaker for accountants and employees |
| **No shift mode** for gig work | ~50 | Gig drivers (29 of 100) |
| Work hours assume Mon–Fri 9–5 in 24-hour time | ~51 | Gig, trades, nurses, on-call |
| **Red commute warning** confusing or wrong (home-based trades, Business button + red text) | ~61 | Trades, professionals, employees |
| "Deductions found" read as **cash back**; wrong for employees, who can't deduct mileage | ~41 | Employees, switchers, professionals |
| Swipe not discoverable, or unclear which button is selected | ~52 | Older and low-tech users |
| Unclear labels: "Auto: usual route", "1 to review", ISO dates (2026-09-30) | ~37 | Older users |
| No cloud backup ("if I drop my phone, I lose the year") | ~34 | Trades, professionals, heavy drivers |
| Multiple vehicles | ~41 | Trades, business owners |
| 5-minute stop merging hides short visits (showings, blood draws) | ~10 | Realtors, nurses |

## Representative quotes (simulated)

- "I do 40 dashes a day. I am not tapping Business on every one of them. Give me a Go Online button and leave me alone." (gig driver)
- "Looks clean, but if I can't hand my accountant a report in January it's just a nice number on a screen." (tradesperson)
- "Teachers can't deduct mileage anymore. Telling me I found $4,500 in deductions is just misleading." (employee)
- "Everlance wanted my bank login. This wants nothing. That alone gets my 70 bucks once there's a PDF." (switcher)
- "Why's the date backward? And what's 17:00, I'm not in the army." (part-time realtor, 71)

## Status against the current branch

The panel reviewed build 1.0 (5). Since then, work on this branch has added several of the most-wanted items:

| Panel ask | Status |
|---|---|
| PDF/CSV export | ✅ Built (Report screen) |
| Shift mode for gig drivers | ✅ Built (swipe to start shift, chosen during setup) |
| Setup tailored to how you work (hours / shifts / neither) | ✅ Built, with "Good to know" tips at the end |
| Multiple vehicles | ✅ Built |
| Weekly reminder to sort trips | ✅ Built |
| Gig tips: "leave it on; it only records while you're moving; short stops stay one trip" | ❌ Open: the setup tip only says "Tap Start shift" (and the control is now a swipe) |
| Total worded for reimbursed employees ("Deductions found" is wrong for W-2 workers) | ❌ Open |
| Commute warning: clearer wording, and off for a home-based business | ❌ Open |
| Readable dates ("Thu, Oct 1") instead of 2026-10-01 | ❌ Open in places (trip list and report) |
| 12-hour AM/PM work-hours entry and presets | ❌ Open |
| One-time swipe hint on the first trip | ❌ Open |
| Shorter stop merging for client visits and home health | ❌ Open |
| Larger text (Dynamic Type) and contrast check | ❌ Open |

New wording needs to go through the translation process in `milemint/src/i18n/` (9 languages, three checks) before release.

**Pricing signal:** willingness to pay was highest among realtors and sales (20%) and trades (17%), and lowest among gig drivers (6%), who compare against free Stride and Gridwise. That supports keeping automatic tracking **free and unlimited**, putting export in Pro, and aiming paid marketing at trades and professionals rather than gig drivers.
