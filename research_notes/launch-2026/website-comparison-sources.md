# Sources for the comparison table on milesprout.app

The home page (`website/index.html`, section "How MileSprout compares") compares MileSprout with MileIQ, Driversnote, Everlance and Gridwise. UK advertising rules (CAP Code 3.33–3.44, comparative advertising) say comparisons must be accurate, verifiable and not misleading, and must compare like with like. Every cell in the table comes from a source below. **Check them again before each big push and whenever a competitor changes its listing.** Update the "Checked" date in the table caption when you do.

Checked on **2 October 2026**. The App Store pages were read through a fetch tool that summarises the page. The competitors' own websites (mileiq.com, driversnote.co.uk, driversnote.com, everlance.com, gridwise.io, help.gridwise.io, driversnote.helpscoutdocs.com) were **blocked by this environment's network proxy**, so web-search summaries of those pages were used where noted. Before you rely on a row, open the pages yourself in a browser.

## MileSprout (our own app, from the codebase)

| Row | Value | Source |
|---|---|---|
| Automatic tracking on the free plan | Yes, no monthly limit | `milemint/src/domain/plan.ts` (header comment: "unlimited automatic tracking (no monthly cap…)") |
| Location collected by the app maker | No. Trips stay on the phone, no account | `website/privacy.html` §1 and §7; app privacy label to be set as "Data Not Collected" in App Store Connect |
| Data used to track you | None | same |
| Languages | 10: English, Español, Português (Brasil), Français, Română, Polski, हिन्दी, ਪੰਜਾਬੀ, বাংলা, 简体中文 | `milemint/src/i18n/i18n.ts` (`LANGUAGES`), `milemint/src/i18n/locales/` |
| Paid plan | "Free; Pro optional". The price isn't in the code: it comes from the App Store at run time (`milemint/src/purchases/store.ts`, `displayPrice`), so the site doesn't state one | — |

## MileIQ (seller MileIQ Inc.; Bending Spoons)

- UK App Store listing: https://apps.apple.com/gb/app/mileage-tracker-by-mileiq/id578830929 (2 Oct 2026)
  - In-app purchases: £4.49, £9.49, £89.99, £94.99. The table shows **£9.49 a month, £94.99 a year**, as recorded in `launch-playbook.md` and `uk-competitors-pricing.md` (1 Oct 2026). What the £4.49 and £89.99 items are isn't shown on the listing.
  - Languages: English.
  - App privacy. Data used to track you: Usage Data. Data linked to you: Financial Info, Location, Contact Info, User Content, Identifiers, Usage Data, Diagnostics.
- Free plan of **40 drives a month**:
  - `research_notes/launch-2026/uk-competitors-pricing.md` (1 Oct 2026, from the listing and the launch playbook);
  - a web search on 2 Oct 2026 that summarised MileIQ's own page, https://mileiq.com/blog/how-much-does-mileiq-cost ("free for 40 drives a month").
  - The listing itself doesn't state the number.

## Driversnote (seller Driversnote ApS)

- UK App Store listing: https://apps.apple.com/gb/app/mileage-tracker-by-driversnote/id924418916 (2 Oct 2026)
  - In-app purchases: Monthly subscription £10.00, Yearly subscription £104.99, Yearly with free iBeacon £119.99.
  - Languages: English, Czech, Danish, Dutch, Finnish, French, German, Italian, Norwegian Bokmål, Polish, Swedish (11).
  - App privacy. No "Data used to track you" section. Data linked to you: Health & Fitness, Location (precise), Contact Info (email, name), Identifiers (user ID, device ID), Usage Data, Diagnostics. Data not linked to you: Crash Data.
- Free plan: **limited number of trips a month**. The exact number isn't confirmed:
  - a web search on 2 Oct 2026 summarised Driversnote's help centre (https://driversnote.helpscoutdocs.com/article/492-is-there-a-free-trial-how-long-does-it-last) as "reports for up to 15 trips per month";
  - our 1 Oct note recorded 20.
  - The table says "Limited: a monthly trip limit" with a footnote, and no number.

## Everlance (seller Everlance Inc.)

- UK App Store listing: https://apps.apple.com/gb/app/mileage-tracker-by-everlance/id985378916 (2 Oct 2026)
  - Description: "Basic (free): manual mileage recording, 30 automatic trips per month"; "Starter: unlimited automatic mileage recording".
  - In-app purchases: Everlance Premium / Starter £9.99 (monthly), £89.99 (yearly); Professional (Yearly) £119.99; Premium Plus £19.99.
  - Languages: English, French, Spanish.
  - App privacy. Data used to track you: Contact Info, Identifiers, Usage Data. Data linked to you: Health & Fitness, Financial Info, Location, Contact Info, User Content, Identifiers, Usage Data, Diagnostics, Other Data.

## Gridwise (seller Gridwise, Inc.)

- US App Store listing: https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382 (2 Oct 2026)
  - "Gridwise Plus subscription. Join Plus for just $14.99/month or $107.99/year". In-app purchases from $5.99 to $107.99.
  - Languages: English and Spanish.
  - App privacy. No "Data used to track you" section. Data linked to you: Health & Fitness, Location (precise and coarse), Contact Info, Identifiers, Usage Data, Diagnostics. Uses include Third-Party Advertising (usage data).
- UK App Store: https://apps.apple.com/gb/app/gridwise-gig-driver-assistant/id1215991382 returned **404** on 2 Oct 2026, so the table says it isn't on the UK App Store.
- Automatic tracking is a **Plus** feature; manual tracking is free. Source: the title of Gridwise's help article, "How to Use Automatic Mileage and Time Tracking (Plus)" (https://help.gridwise.io/hc/en-us/articles/22402142412439-How-to-Use-Automatic-Mileage-and-Time-Tracking-Plus), and a web-search summary of gridwise.io, both on 2 Oct 2026. The page itself was blocked here: **open it and confirm before publishing.**

## Left out on purpose

- **"Account required"**: likely true for all four (their labels link contact info and user IDs to you), but no listing says so in words, so there's no row.
- **"Sells your data"**: not claimed for anyone. (`rewards-partners.md` cites Gridwise's privacy policy on anonymised data sales, but the table sticks to App Store labels.)
- **Shift mode**: MileIQ and Driversnote list "work hours" auto-classification, and Gridwise has one-tap start/stop of miles and hours. That's not the same thing as MileSprout's shifts, and a fair row would need hands-on testing.
- **Tax rules per country**: not verified for each competitor.
- **MileClear, DriveLog, TripLog**: cheaper UK apps with unlimited free tracking (see `uk-competitors-pricing.md`). The founder asked for the four best-known names. Leaving out the cheapest rivals is allowed as long as the table doesn't claim MileSprout is "the only" free unlimited tracker or "the cheapest", and it doesn't.
