# UK mileage apps: how they charge, and what MileMint should change

*Checked on the UK App Store listings, 1 Oct 2026. MileIQ and Driversnote figures are from the launch playbook (same day).*

| App | Free | Pro price | What makes people pay | Ratings | Privacy (App Store label) | Languages |
|---|---|---|---|---|---|---|
| **MileClear** (Soyo Studios Ltd) | **Unlimited automatic tracking, "no drive cap, ever"**, HMRC rates, earnings logging, fuel prices, tax-readiness card (tax + NI estimate, weekly set-aside, 31 Jan countdown), benchmarking, MOT/tax reminders, 2 saved places | £4.99/mo, £44.99/yr | **Getting your records out**: CSV/PDF exports, Self Assessment (SA103) wizard, signed record cover sheet, accountant portal, receipt scanning, earnings CSV import, bank-feed inbox, unlimited places. "Pro never gates the tracker itself." | 4.9★ (55) | Linked to you: precise location, financial info, name, email, purchases. Trips sync to UK servers | English |
| **DriveLog** (F2House Pty, Australia) | 50 trips a month, all features | £4.99/mo, £44.99/yr | More than 50 trips | 5.0★ (8) | Linked to you: location, device ID, usage, crash data (analytics) | English |
| **Mileage Logbook** (Hus Software Ltd) | Manual logging only | £3.99/mo, £19.99/6 mo, £34.99/yr | Automatic tracking (GPS, Bluetooth, CarPlay), reports | 4.4★ (38) | Linked to you: location, name, email, content | English, Dutch, German |
| **TripLog** (US) | Unlimited automatic tracking + classification; one free 7-day Premium pass a year for the annual report | Premium (price not in listing; legacy packs £59.99) | Reports (PDF/CSV) the rest of the year, web dashboard, receipts OCR, bank feeds, QuickBooks | 4.3★ (254) | Not linked: device ID, usage, crash data | English, French, Spanish |
| **Tripcatcher** (UK) | App is free but needs a paid web account | Web subscription | Everything (it's a companion to the web app); Xero, Dext, Crunch publishing; VAT on expenses | 4.7★ (199) | Data not collected | English |
| **MileIQ** (Bending Spoons) | 40 drives a month | £9.49/mo, £94.99/yr, 7-day trial | More than 40 drives | 4.7★ (3.9k) | Tracking: usage data; linked: financial, location, contact, identifiers, content, usage, diagnostics | English |
| **Driversnote** | 20 trips a month | £10/mo, £104.99/yr | More than 20 trips | 4.8★ (7.5k) | — | — |
| **MileMint (today)** | 40 *work* drives a month (personal drives don't count; a shift day counts as one); drives past that are kept but their value waits | £5.99/mo, £49.99/yr (1-month trial on yearly) | Value of drives past 40 | — | **Data not collected; no account** | **10 languages** |

## What the market has moved to

The cheap UK apps no longer charge for tracking. **MileClear and TripLog track without limits for free and charge for getting your records out** (reports, exports, the tax-return helper, the accountant). DriveLog's 50 and MileIQ's 40 are the old model. Couriers do 40 drives in 2–3 shifts, so a cap is the first thing they'll compare, and MileClear's listing names MileIQ, TripLog and Driversnote's caps directly.

## Recommended tweaks

1. **Free plan: unlimited tracking, sorting and totals; Pro for the outputs.** Pro would be:
   - exports in every format (spreadsheet, Xero, QuickBooks, FreeAgent) and the PDF report
   - Send to my accountant
   - a Self Assessment summary (which boxes the figures go in)
   - import from another app
   - parking & tolls and (later) receipts
   - more than one vehicle
   - the ATO logbook

   Keep it honest:
   - **one free tax-year report a year**, like TripLog's annual pass, so nobody's records are held hostage at deadline time;
   - **free users can always see and delete their own data.**

   This replaces the "value waits for Pro" lock, which is confusing and is the part couriers would hit first.
2. **Price: consider £4.99/£44.99 for the UK.** MileClear and DriveLog sit there, and our courier simulation landed on about £4.49. Keep the 1-month free trial: it's 4× MileIQ's and nobody cheap offers one. (US/CA/AU prices are set separately and can stay.)
3. **Features they have that couriers ask for** (in rough order of value):
   - **earnings by platform and profit after costs** (our 500-driver simulation's second most wanted view);
   - a **tax set-aside estimate** ("put £X aside this week");
   - **lock-screen / Dynamic Island** controls for the shift (Live Activity);
   - **receipt scanning** for fuel and parking (on-device);
   - **MOT and road-tax reminders**;
   - **CarPlay/Bluetooth auto-start** (Mileage Logbook).

   MileClear also has a pickup-wait timer and fuel prices: nice, not core.
4. **What we lead with, since "no cap" is now table stakes:**
   - **Privacy**: no account and nothing collected, versus MileClear syncing named, located data to servers and MileIQ's tracking label.
   - **Ten languages**: everyone else is English-only, or adds 1–2 European languages.
   - **"You'll know if a mile was missed"**: tracking-gap warnings, which nobody else lists.
   - **One row per shift**, with the drive home split off.
   - **Four countries** with each tax office's rules.
5. **Store listing:** MileClear names its competitors in its description. Apple calls competitor names grounds for rejection, so we don't copy that (see launch-playbook.md §0.5).

## Decisions needed

- Switch to unlimited free tracking with Pro for outputs? (Changes `src/domain/plan.ts`, the Pro screen and the free-plan copy; best done with the tab build.)
- UK price: keep £5.99/£49.99, or match £4.99/£44.99?
