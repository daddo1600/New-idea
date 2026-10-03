# Signed-off decisions

The founder signs these off; the team builds from them. The newest decision wins where two disagree.

## 3 Oct 2026: Waitlist reward (approved)
- Anyone who joins the website waitlist before launch day gets **3 months of Pro free**.
- It's a one-time App Store offer code, emailed within 3 days of launch, to be redeemed within 60 days. One per person and per Apple Account, for new Pro subscribers. It can't be combined with the free trial.
- **It doesn't renew:** Pro stops after 3 months, and no one is charged unless they choose to subscribe.
- Founding testers get 12 months instead, not both. The offer comes off the site on launch day.
- There's no cap on numbers; Apple's code limits are being checked (`website-claims-check.md`, "Offer code limits").
- Sign-ups are protected by Cloudflare Turnstile (loaded once a full email is typed), a per-IP rate limit and the honeypot.

## 3 Oct 2026: Pro perks, the "plus" model (approved)
- **Every offer keeps a free version.** Free users never lose an offer because Pro exists.
- **Pro gets a partner-funded "plus" on selected offers,** e.g. a second drink a week. It comes from its own weekly pool, often in quiet hours, so it never uses up free users' codes. Pro also gets a first look at new partners, but claiming opens to everyone at once. **No Pro-only offers at launch.**
- **Apple rules** (`pro-perks-rules.md`): perks are never sold or stored as credit through IAP, and are always free to claim. Pro is sold on its software features, with perks as a bonus.
- **Wording:** the Pro plus is "included with Pro", never "free". Teasers show the conditions on the teaser itself: Pro's price and that it auto-renews, "up to 2 a week", which stores and area, and that offers can change. Partner offers are labelled "Partner offer · we may earn a commission".
- **Teasers to free users:**
  - only where a partner is near and the offer is live;
  - at most one Pro line a week;
  - never in notifications, on Home, on the parked card or at the till;
  - a "Don't show Pro tips" switch;
  - the button says "See what Pro includes".
- **Value shown:** the drives' value at the tax office's rate and the Perks savings are two figures, never added together; no "Pro pays for itself" claims.
- **Copy:** `pro-value-plan.md`. **Partner pitch:** "Give MileSprout Pro drivers a second visit a week, in your quiet hours, from a pool you set. You pay only when a code is used at your till."
- This **replaces** "same perks for Free and Pro" in `perks-simulation.md`, and "perks unlock nothing" in `rewards-partners.md`.
- It needs the redemption server (Monday) before the plus can be claimed for real.
- **Apple's code limits (checked 3 Oct 2026):** 1 million codes a quarter, made in batches of up to 25,000. No cap is needed. Codes can only be generated once the app is live, so they're made on launch day. The launch-day plan is in `website-claims-check.md`, under "Offer code limits". **Tick "no auto-renew" when creating the offer**: it can't be changed afterwards.

## 3 Oct 2026: Local scenes on the website (approved, "go")
- The hero drive scene matches the visitor's country or area: city, countryside, landmarks and local road signs. A standard scene is used for incognito, EU visitors, unknown locations and anything uncertain (`local-scenes-research.md`, `local-scenes-art-direction.md`).
- **Seasons and celebration dates** per country or region change the scene too, e.g. July 4th (a day) or Easter weekend (a weekend).
- **Keep building** new scenes and dates as research finds more.
- **Publishing:** a scene or seasonal artwork goes live once it passes **marketing and QA**. It doesn't need a separate "publish" from the founder. Changes to the rest of the site still wait for "publish".
- **Priority by date:** whatever comes up soonest goes first. A celebration more than 3 months away is not a priority. Start each one with enough lead time for it to look great and be live before its date or season, and skip a date that's too close to do well.

## 3 Oct 2026: Pro price, testers and badge (approved)
- **Show the Pro price on the website:** £3.99 a month or £29.99 a year, with local prices in $ for US, Canadian and Australian visitors. This is the launch price.
  - It appears in a gold chip on the Pro card, and in our row of the comparison table.
  - The heading becomes clearer, e.g. "Logging is free. Pro is a paid upgrade."
  - On phones the Free card comes first, and the Pro card carries a "Paid upgrade" label.
  - Research must confirm the App Store price tiers for USD, CAD and AUD before go-live.
- **Testing is open to the UK, US, Canada and Australia.**
- **The Founding driver badge goes to testers (2a):** a TestFlight install before launch day earns `founding-badge`, which is kept for good. The method is in `tester-tour.md` §6.1, line 15.

## 3 Oct 2026: Pro price set, with a price promise (approved)
- **Option A** from `pricing-case.md`:

  | Country | Monthly | Yearly |
  |---|---|---|
  | UK | £3.99 | £29.99 |
  | US | US$3.99 | US$29.99 |
  | Canada | CA$4.99 | CA$37.99 |
  | Australia | A$5.99 | A$44.99 |

- **Trial:** the yearly plan keeps its free month; monthly has no trial. Show it as the plain price, not as "launch" or "introductory" pricing.
- **Price promise:** "Subscribe in our first year and keep your price for as long as you stay subscribed."
  - **What it means in practice:** when the price rises for new subscribers, existing subscribers stay on their price, which Apple allows.
  - **Who it covers:** anyone who subscribes during the first 12 months after launch.
  - **The exact wording:** the conditions (what counts as "staying", and what happens after a lapse) need marketing's copy and research's legal check before it goes anywhere public.
- **Next steps:**
  - App Store Connect prices change to option A.
  - Then the website price chip, the comparison table, the app's demo paywall, the App Store listing and the friend offer code (half of yearly) all follow.
- This replaces the £5.99 / £49.99 set in App Store Connect.

## 3 Oct 2026: Price promise for founding testers; no launch date yet (approved)
- **Founding testers get the price promise.** When their 12 free months end and they start paying the full price, they keep the launch price (option A) for as long as they stay subscribed.
- **There is no launch date yet.** `{LAUNCH_DATE}` and `{PROMISE_END}` stay as placeholders.
- **Before launch,** the website words the window relative to launch ("within 12 months of launch day"), not with calendar dates. The dated wording replaces it once launch is set.
- The testers' badge cut-off (`FOUNDING_TESTER_ENDS`) also waits for the date.
