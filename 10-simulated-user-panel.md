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

---

# Round 2: same 500 personas, latest build (1 Oct 2026)

Same personas, re-scored after seeing the full setup flow, shift mode, export, Pro paywall, milestones, tax dates and missed-miles check. Still **simulated**. Raw data: `data/user-panel/v2/`.

| | Round 1 | Round 2 |
|---|---|---|
| First impression | 5.8 | 6.5 |
| Easy to understand | 6.7 | **7.2** |
| Looks | 6.7 | **7.3** |
| Trust/privacy | 7.0 | 7.1 |
| Would download | 5.3 | 6.0 |
| Would pay $69.99/yr | 52 of 500 | 70 of 500 |
| Net Promoter Score | −79 | −71 |

| Segment | Download | Ease | Would pay |
|---|---|---|---|
| Gig | 4.8 → **6.2** | 6.7 → **7.6** | 6 → 5 |
| Trades | 6.0 → 6.4 | 7.0 → 7.4 | 17 → **27** |
| Sales, real estate | 5.6 → 5.8 | 6.8 → 7.2 | 20 → 21 |
| Employees | 5.1 → 5.6 | 6.5 → 6.9 | 2 → 4 |
| Switchers | 5.3 → 5.8 | 6.6 → 7.0 | 7 → 13 |

**What moved scores up:** export (CSV free, PDF in Pro) and shift mode, where a whole shift counts as one drive.

**What's still holding scores down:**
1. **The 40-drive free cap.** Route trades and home health hit it in days, and the dollar value shown on locked drives reads as "ransom". "I left MileIQ's 40-drive cap and you built a 40-drive cap."
2. **The commute contradiction.** A trip is marked Business, flagged in red, and still counted in the total. There's no setting for a home-based business.
3. **"Deductions found" and "Money back" badges** for employees, who can't deduct mileage. The Milestones badges made the refund confusion worse.
4. **No cloud backup.** 35 professionals and 30 trades want it.
5. **US screens show UK wording:** Deliveroo, Evri, DPD, "postcode", "Petrol". Lyft, DoorDash, Instacart and Spark are missing from the gig app list.
6. **No auto-end for a forgotten shift**, ISO dates, 24-hour times, and no larger text option.
7. **Pricing mismatch.** The paywall shows $49.99/yr while the plan is $69.99/yr.
