# Persona deck: the app as each kind of driver sees it

*Marketing spec, 3 Oct 2026. For the fanned phone deck in "What MileSprout does" on `website/index.html` (8 cards today, re-shot in d7af719). Founder signs off at the end; then coding, qa, marketing review, preview.*

## What we chose and why (for the founder)

- **Four personas, picked with chips above the deck:** "I drive for… 🛵 Deliveries & rides · 🩺 Care visits · 🔧 Trade jobs · 💼 My own business". These four match the three ways of working the app offers at setup ("Shifts or blocks", "Set hours", "Neither") and its client privacy mode. We didn't make a nurse persona of its own. The app treats nurses and carers the same (client privacy mode), so community and visiting nurses are named under Care visits.
- **The chip says the job; the line under it uses the visitor's own word** for themselves in their country, such as "tradies" in Australia, "PSWs" in Canada and "caregivers" in the US. The site already works out the country for its scene and calculator, and the deck uses the same answer.
- **The default is Deliveries & rides in all four countries.** It's our launch audience (founding testers, the community lists) and matches the hero clip. We'll revisit when we have real sign-up numbers. `?for=care` and the other links let each community post open on its own persona.
- **Each persona gets 4 screens of its own, then 3 shared ones** (Privacy, Perks, Your code), so 7 cards instead of 8. Every screen is a real app screen shot from the demo. Nothing is invented.
- **Captions are British English everywhere.** The site is English-only (`lang="en-GB"`) and doesn't change spelling by country, so this follows the rest of the page. Only the self-label words, money and units change by country.

## 1. Personas: what the app really does for each

| Persona (chip) | App set-up it maps to | Real features the deck shows |
|---|---|---|
| **Deliveries & rides** 🛵 | "Shifts or blocks" (shift mode) | Swipe to start or end a shift; every drive on shift counts as work ("Auto: on shift"); one row per shift; shift live on the Lock Screen; usual purpose "Deliveries"; Money tab set-aside from weekly earnings |
| **Care visits** 🩺 | "Set hours" + the "Care worker" tick (client privacy) | Stops saved as "Client visit · area" (no street, no house number, no route); drives in work hours sorted as work ("Auto: in your work hours"); one-tap purpose "Client visit"; UK employees: Mileage Allowance Relief screen (HMRC rate minus what the employer pays); other countries: "Expense claim" export |
| **Trade jobs** 🔧 | "Set hours" | Drives in work hours sorted as work; purposes "Site visit", "Buying supplies", "Client meeting"; route map; parking and tolls on a trip; Xero, QuickBooks, FreeAgent (UK) and HMRC/IRS/CRA/ATO reports (Pro) |
| **My own business** 💼 | "Set hours" or "Neither" | Learned routes ("Auto" on a usual route); home to office flagged as a commute; client meetings; airport parking; reports and exports |

Ride-hail is part of Deliveries & rides, because shift mode works the same for any app. The demo shows deliveries only, since its usual purpose is "Deliveries". A rideshare driver types their own usual purpose. We don't show a passenger-trips screen, because the app has no ride-specific feature.

### Self-labels: the line under the chips, per country

| | UK | US | Canada | Australia |
|---|---|---|---|---|
| Deliveries & rides | couriers, delivery riders and private hire drivers | delivery drivers, gig drivers and rideshare drivers | delivery drivers, couriers and rideshare drivers | delivery riders, couriers and rideshare drivers |
| Care visits | carers, care workers and community nurses | caregivers, home health aides and visiting nurses | PSWs, home care workers and visiting nurses | support workers, aged care workers and community nurses |
| Trade jobs | tradespeople: builders, electricians, plumbers and more | contractors: builders, electricians, plumbers and more | the trades: contractors, electricians, plumbers and more | tradies: builders, sparkies, plumbers and more |
| My own business | the self-employed and sole traders | the self-employed and freelancers | the self-employed and freelancers | sole traders and the self-employed |

The line reads "For {label}." Chip text is the same everywhere, except Australia's trades chip, which reads **"Tradie jobs"**. No brand names (no "Dashers" or "Uber drivers"). *(research, 3 Oct)* Labels checked, all pass: "tradies" and "sparkies" are everyday Australian words for tradespeople and electricians ([Wikipedia: Sparky](https://en.wikipedia.org/wiki/Sparky), [ANU ANDC](https://history.cass.anu.edu.au/centres/andc/dunny-diver)); "caregivers" and "home health aides" are the US terms, used by the BLS ([BLS OOH: Home health and personal care aides](https://www.bls.gov/ooh/healthcare/home-health-aides-and-personal-care-aides.htm)); "community nurses" is the NHS's own term, alongside "district nurses" ([HEE: Community and district nursing](https://www.hee.nhs.uk/our-work/community-district-nursing-0)). "PSWs" is mainly an Ontario title (BC says health care assistant, Alberta and Manitoba health care aide), so it fits Toronto and the biggest province, and "home care workers" in the same line covers the rest ([CDI College](https://www.cdicollege.ca/study-on-campus/manitoba/community/news/health-care-aide-vs-personal-support-worker-what-s-the-difference-in-manitoba/), [CBC](https://www.cbc.ca/news/canada/sudbury/gas-prices-difficult-workers-paid-mileage-1.6345498)). Keep the line as it is.

## 2. Screens and demo data per persona

The deck follows the visitor's country (`MSSeason.country()`, `?country=` to force). Each persona is shot in all four regions, in one city per country. These cities match the app's own area examples (`domain/privacy.ts`): **Leeds, Austin, Toronto, Parramatta**. Distances are given in miles. For CA and AU the shot uses km, with each leg converted (×1.609, to 0.1 km). Values use `domain/regions.ts`: **GB 55p/mi, US 76¢/mi (from 1 Jul 2026), CA 73¢/km (first 5,000), AU 91¢/km (to 5,000)**. Year-to-date totals on Home and Money are whatever the app works out from the seeded history. Don't type them in by hand.

*(research, 3 Oct)* **Watch the distance bands, or the per-day figures below will be wrong on screen.** The app values a drive at the rate for the band it falls in. Canada's tax year starts 1 Jan and drops to 67¢ after 5,000 km; Australia's starts 1 Jul and pays nothing after 5,000 km; the UK drops to 25p after 10,000 miles. The current seeders start history on 1 Jan: the business demo comes to about 6,200 mi (10,000 km) by 3 Oct, and a care history at 14–20 mi a weekday comes to about 5,400 km. So in Canada, **keep each persona's seeded work distance for the year under 4,800 km before yesterday** (start the CA history later, or thin it). Otherwise yesterday shows at 67¢: deliveries $16.62, care $18.16, trades $23.45, business $10.79 (or $4.56 with the fix in 2d). Australia (from 1 Jul, about 2,400–3,500 km) and the UK are inside their bands. Rates rechecked against `regions.ts` and the sources in `website-claims-check.md` (HMRC, IRS, Finance Canada, ATO, all checked 3 Oct).

The Home status line is the app's own: **"Counting your miles"** (or "Counting your km") or **"On shift · 1h 15m"**, never "Tracking on". The 9:41 status bar stays.

### 2a. Deliveries & rides: Home · Drives · Trip · Money

This persona already exists: `?demo=courier&region=GB` (Leeds, the current deck). Keep it.

- **Home:** on shift, the swipe-to-end shift bar, the year's total, the drive to sort (Meanwood Rd → Home, 2.2 mi, £1.21 if work).
- **Drives:** yesterday's evening shift as one row: 17:30–21:49, 8 drives, 15.4 mi, **£8.47**. Below it, the night shift past midnight.
- **Trip:** one leg with its route on the street map.
- **Money:** quarterly figures with due dates, and this week's set-aside (courier earnings £398–£488 a week).

**New seed data:** the same shifts with local street names for US/CA/AU. The legs and minutes stay the same; only the names change.

| Leeds (now) | Austin | Toronto | Parramatta |
|---|---|---|---|
| Kirkstall Rd | S Lamar Blvd | Queen St W | Church St |
| Burley Rd | Zilker | Liberty Village | Harris Park |
| Otley Rd, Headingley | Guadalupe St | Spadina Ave | Victoria Rd, Rydalmere |
| Cardigan Rd | Hyde Park | The Annex | North Parramatta |
| Boar Lane, City Centre | Congress Ave, Downtown | King St W, Downtown | Macquarie St, CBD |
| Hyde Park | Clarksville | Kensington Market | Westmead |
| The Headrow, City Centre | E 6th St, Downtown | Yonge St, Downtown | George St, CBD |
| Meanwood Rd | Mueller | Leslieville | Granville |

Yesterday's shift is worth **£8.47 (15.4 mi) · $11.70 (US, 15.4 mi) · $18.10 CAD (24.8 km) · $22.57 AUD (24.8 km)**.

### 2b. Care visits: Home · Drives · Trip · Relief (UK) / Reports (US, CA, AU)

**New: `?demo=care`.** Settings: set hours Mon–Fri 07:30–14:30, `clientPrivacy: true`, usual purpose "Client visit". In GB: `employment: 'employee'`, employer pays 25p a mile. Elsewhere: employee, employer rate left empty.

The visits are **yesterday** (so Home at 9:41 makes sense). Every stop is area only and no route is kept, exactly as client privacy saves it:

| Time | From → to | mi | Sorted |
|---|---|---|---|
| 07:40 | Home → Client visit · Leeds LS7 | 3.1 | Auto: in your work hours |
| 08:35 | Client visit · Leeds LS7 → Client visit · Leeds LS8 | 2.4 | Auto: in your work hours |
| 09:50 | … LS8 → Client visit · Leeds LS17 | 3.8 | Auto: in your work hours |
| 11:05 | … LS17 → Client visit · Leeds LS16 | 4.6 | Auto: in your work hours |
| 12:20 | … LS16 → Client visit · Leeds LS6 | 2.9 | Auto: in your work hours |
| 15:10 | Client visit · Leeds LS6 → Home | 1.8 | **To sort:** "Auto: outside your work hours · swipe right if it was work" |

Purposes: "Client visit". The Trip-screen drive (09:50) has a typed reference: **"Client visit, no. 3"**. No names, initials or conditions anywhere.

The areas in other countries are **Austin 78751 / 78752 / 78757 / 78756 / 78705**, **Toronto M6G / M6H / M6P / M6R / M5S**, and **Harris Park 2150 / North Parramatta 2151 / Westmead 2145 / Merrylands 2160 / Granville 2142**.

The day's work driving (16.8 mi / 27.1 km) is worth **£9.24 · $12.77 · $19.78 CAD · $24.66 AUD**.

History for the year: weekdays, 5 to 6 visits, 14 to 20 mi a day, same areas. For the GB relief screen, seed **only from 6 Apr 2026** (2,480 work miles). The screen sums every open tax year, and earlier years at 45p would muddy the headline. That gives (55p − 25p) × 2,480 = **£744.00 relief, about £148.80 tax back at 20%**. *(research, 3 Oct)* Checked: HMRC's rate for 2026/27 is 55p for the first 10,000 business miles, then 25p, backdated to 6 Apr 2026 ([GOV.UK: Increasing mileage rates](https://www.gov.uk/government/publications/increase-to-approved-mileage-allowance-payments-amaps-and-self-employed-simplified-mileage-rates/increasing-mileage-rates)), and `regions.ts` matches (550/250 tenths of a penny, 10,000-mile tier, from 2026-04-06). Relief cuts taxable pay, so the tax back is the relief × the person's top rate: £148.80 only for basic-rate (20%) taxpayers, £297.60 at 40% ([GOV.UK: Claim tax relief for your job expenses](https://www.gov.uk/tax-relief-for-employees): relief is given at the rate you pay tax, e.g. 20% of a £6 weekly expense = £1.20. GOV.UK couldn't be fetched from the research sandbox on 3 Oct; the rule is long-standing and matches `mar.ts`. High confidence). The app's hero says "About £148.80 tax back at 20%" (the "Not sure" band also uses 20%), so the caption must name the 20% too. Seed the GB care demo with the band left at "Not sure" or "Basic".

- **Home:** "Counting your miles", the year's total, and the 15:10 drive home waiting to be sorted.
- **Drives:** yesterday's row of "Client visit · area" drives, each marked "Auto: in your work hours".
- **Trip:** no map (that's the point): the areas, 3.8 mi, purpose "Client visit, no. 3", and the app's note that client privacy keeps no route.
- **Relief (GB):** `app/claim-relief.tsx` showing £744.00 and "Your employer pays 25p a mile. HMRC's rate is 55p…".
- **Reports (US/CA/AU):** the report screen with **Expense claim** chosen. In the US we don't mention tax deductions for employees, because unreimbursed employee mileage isn't deductible federally. The report is for the employer. *(research, 3 Oct)* Checked, true. The TCJA suspended miscellaneous itemized deductions (where unreimbursed employee expenses sat) for 2018–2025, and the 2025 budget law (P.L. 119-21, s70110) made that permanent from 2026 by striking the sunset in IRC s67(g) ([Public Law 119-21](https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf); [CRS R48611](https://www.congress.gov/crs_external_products/R/PDF/R48611/R48611.2.pdf)). Only reservists, qualified performing artists, fee-basis officials and impairment-related expenses can still use Form 2106 ([IRS Form 2106 instructions](https://www.irs.gov/pub/irs-pdf/i2106.pdf)). "Expense claim, ready for your employer" is the right framing. State notes, not for the caption: California, Illinois and Massachusetts require employers to repay work driving (Cal. Labor Code 2802, 820 ILCS 115/9.5, 454 CMR 27.04), and a few states (including New York, California, Minnesota, Alabama, Arkansas and Hawaii) still allow some unreimbursed employee expenses on the state return ([Driversnote](https://www.driversnote.com/blog/mandatory-mileage-reimbursement-states), secondary; check each state before saying it anywhere). Canada and Australia differ: employees there can claim on their own return (CRA T777 with a T2200; ATO cents per km if the employer doesn't repay per km), so the caption shouldn't say the employer is the only route, and it doesn't.

### 2c. Trade jobs: Home · Drives · Trip · Reports

**New: `?demo=trades`.** Settings: set hours Mon–Fri 07:30–16:30, self-employed, saved places "Home" and the job.

**Today** (shot at 9:41: the first two drives done) and **yesterday** (the full day for Drives):

| Day | Time | From → to | mi | Purpose |
|---|---|---|---|---|
| yesterday | 07:35 | Home → Kitchen refit, Roundhay | 6.2 | Site visit |
| yesterday | 10:10 | Kitchen refit, Roundhay → Builders' merchant, Kirkstall | 6.8 | Buying supplies |
| yesterday | 10:55 | Builders' merchant, Kirkstall → Kitchen refit, Roundhay | 6.8 | Site visit |
| yesterday | 15:40 | Kitchen refit, Roundhay → Quote, Chapel Allerton | 2.0 | Client meeting (parking £2.40) |
| yesterday | 16:45 | Quote, Chapel Allerton → Home | 5.1 | **To sort** (outside hours) |
| today | 07:35 | Home → Kitchen refit, Roundhay | 6.2 | Site visit |

Local names:
- **Austin:** Kitchen remodel, Allandale · Lumber yard, N Lamar · Estimate, Crestview.
- **Toronto:** Kitchen reno, Leslieville · Building supply, Eastern Ave · Quote, Riverdale.
- **Parramatta:** Kitchen reno, Baulkham Hills · Trade supplies, Seven Hills · Quote, Winston Hills.

No real merchant brands. Yesterday's work driving (21.8 mi / 35.0 km) is worth **£11.99 · $16.57 · $25.55 CAD · $31.85 AUD**.

- **Home:** "Counting your miles", the year's total, the 16:45 drive to sort (5.1 mi, £2.81 if work).
- **Drives:** yesterday with purposes and "Auto: in your work hours".
- **Trip:** the quote drive with its route map, purpose "Client meeting", parking £2.40.
- **Reports:** export choices (Xero, QuickBooks, FreeAgent in the UK) and the tax office report.

### 2d. My own business: Home · Drives · Trip · Reports

This persona exists now: the default `?demo` (San Jose: client meetings, learned routes, the "Office → Home" commute, the airport). For US visitors, keep San Jose, or move to Austin for consistency (coding's call; San Jose is already finished).

**New:** place sets for GB/CA/AU, in the same shape:
- **Leeds:** Office, Wellington St · Client office, Bradford · Leeds Bradford Airport.
- **Toronto:** Office, King St W · Client office, Mississauga · Pearson Airport.
- **Parramatta:** Office, Smith St · Client office, Norwest · Sydney Airport.

~~Today's two work drives (10.0 mi / 16.1 km) are worth £5.50 · $7.60 · $11.75 CAD · $14.65 AUD.~~

*(research, 3 Oct)* **Fix the morning drive.** One of today's two "work" drives is Home → Office, 7.9 mi, marked business ("Picked up samples"). That is ordinary commuting in all four countries, and carrying things doesn't change that (IRS Pub 463: "hauling tools or instruments in your car while commuting doesn't make your car expenses deductible", [IRS Pub 463](https://www.irs.gov/publications/p463); HMRC 490; CRA; ATO). It also contradicts the Drives caption ("Home to the office is flagged as a commute"). For the new GB/CA/AU sets (and San Jose if coding touches it), mark the morning Home → Office as personal, a commute, and add the return Client office → Office (2.1 mi). Today's work driving is then **4.2 mi / 6.8 km: £2.31 · $3.19 · $4.96 CAD · $6.19 AUD**.

- **Home:** "Counting your miles", the total, the drive to sort.
- **Drives:** learned-route drives sorted for you, and the evening drive home marked personal as a commute.
- **Trip:** the airport drive with parking.
- **Reports:** exports and the report.

### Seed data summary (coding)

1. In `milemint/src/dev/demo.ts`, add `?demo=care` and `?demo=trades`, and make every persona region-aware (Leeds / Austin / Toronto / Parramatta sets above), keyed by `DEMO_REGION`.
2. Add no new app strings. Every word on these screens already exists in all 10 languages. Check that nothing added to the demo is visible text other than place names and typed purposes.
3. Extend `milemint/assets/store/capture.js` to loop personas × regions × 4 screens: 64 shots at 640×1490, the same framing as d7af719. Save them as `website/assets/img/screens/{persona}/{region}/{screen}.webp`, with `?v=` for the cache.

## 3. The persona switch

**Layout:** a row of chips above the deck, with a lead-in "I drive for…" and the self-label line beneath ("For carers, care workers and community nurses."). On phones the chips wrap to two rows, with no horizontal scroll.

**Zing, calm:**
- Each chip has an inline SVG line icon (scooter, house with heart, wrench, briefcase) in the site's style. The chosen chip fills brand green, and its icon gives a small hop (scale 1 → 1.15 → 1, 220 ms).
- The deck folds away: the cards slide down and fade, 40 ms apart. The new persona's cards deal in with the deck's existing deal-in motion (`site.js`, "deal the cards in").
- The first caption's figure **counts up** ("£9.24 for yesterday's visits"). The self-label line cross-fades.
- **Reduce Motion:** a 150 ms cross-fade, no hop, no count-up.

**Accessibility:** the chips are a `role="radiogroup"` with arrow keys. `#deck-live` announces "Showing care visits, 7 screens". Card `aria-label`s and image `alt`s change with the persona. The dots and the "1 / 7" counter are rebuilt from data. Without JavaScript the chips are hidden and the Deliveries deck shows, as today.

**Which persona shows:**
1. `?for=` in the URL. The slugs are `deliveries`, `care`, `trades` and `business`. Aliases: `couriers`, `riders`, `rideshare`, `gig` → deliveries; `carers`, `caregivers`, `nurses`, `psw`, `support` → care; `tradies`, `tradespeople`, `contractors` → trades; `self-employed`, `freelancers` → business.
2. Otherwise, the visitor's last choice from `localStorage`, wrapped in try/catch.
3. Otherwise, **Deliveries & rides**.

A chip tap updates the URL with `history.replaceState` (no new history entries), so the link the visitor copies opens the same persona. It never sends the choice anywhere.

**Country and scene:** the deck's screens and numbers follow the country the site already detects. The persona doesn't change the hero scene or the hero clip in this round. Possible later: a van or ute in the scene for Trade jobs, if the scenes work has room.

**Loading:** preload a persona's first card when its chip gets hover or focus, and lazy-load the rest. A visitor only downloads their own country's set (about 45 KB a card).

## 4. Captions (the feature panel beside each card)

Each of the four persona cards swaps its panel (tag, heading, line, bullets). The three shared cards keep today's panels. One change: on Perks, "a coffee between drops" becomes **"a coffee between stops"**, which fits every persona. £ figures change to the visitor's currency and units, as the calculator does.

### Deliveries & rides (today's panels, tightened)
1. **Home** · *Free* · **Your shift at a glance.** Swipe to start your shift. Every drive until you end it counts as work.
   - How long you've been on, and what your miles have found this tax year.
   - A drive to sort? It's right there, with what it's worth.
2. **Drives** · *Free* · **One row per shift.** Miles, time and drives for each shift, logged by themselves. Yesterday's evening: 15.4 miles, **£8.47**.
   - Your shift shows on the Lock Screen while you're on.
   - Missed one? Add it by hand.
3. **Trip** · *Free* · **Every drop on the map.** See the route, then sort it with a tap or a swipe.
   - Add parking and tolls when you need them.
4. **Money** · *Money tab* · **Know what to put aside for tax.** Add your weekly earnings from all your apps. MileSprout shows what to put aside, and your quarterly figures with their dates. *(Pro)*

### Care visits
1. **Home** · *Free* · **Back-to-back visits, counted.** Set your hours once. Every drive in them is sorted as work for you.
   - The drive home after hours waits for a swipe.
   - Thank you for all you do. 💚
2. **Drives** · *Free* · **Only the area. Never the address.** Each visit is saved as "Client visit · Leeds LS7", on your phone. No street, no house number.
   - Yesterday: 5 visits, 16.8 miles, **£9.24** of work driving.
3. **Trip** · *Free* · **No route kept, still a proper log.** Date, area, distance and purpose for every drive. *(research, 3 Oct: was "what the tax office asks for". The IRS and HMRC ask for where you went; a postcode area may not be enough for every claim, so we don't promise it is.)*
   - Add your own visit reference, like "no. 3". No names.
4. **Relief (UK)** · *Free* · **Paid 25p a mile? Claim relief on the rest.** Your employer pays less than HMRC's 55p, so you can claim tax relief on the gap. MileSprout shows the figure and how to claim. Example: **£744 to claim**, about £148.80 tax back if you pay tax at 20%. *(research, 3 Oct: "Claim the rest" read as if the 30p comes back as money; it's relief, worth 20p or 40p in the pound. "Back" now names the 20%, as the app's Relief screen does.)*
   **Reports (US, CA, AU)** · *Pro* · **Your mileage claim, done.** An expense claim with every visit by area, ready for your employer.

### Trade jobs
1. **Home** · *Free* · **On the tools, not the paperwork.** Set your hours. Drives to jobs, the merchant and quotes are sorted as work for you.
   - The drive home waits for one swipe.
2. **Drives** · *Free* · **Every job, every supplies run.** Site visit, Buying supplies, Client meeting: one tap each. Yesterday: 21.8 miles, **£11.99**.
3. **Trip** · *Free* · **Parking at the quote? Add it.** The route on a map, the purpose, and parking or tolls kept with the drive.
4. **Reports** · *Pro* · **Hand your accountant a clean log.** PDF report, spreadsheet, Xero and QuickBooks, plus FreeAgent in the UK. *(research, 3 Oct: the app offers FreeAgent only in the UK; show "FreeAgent" only to UK visitors.)*

### My own business
1. **Home** · *Free* · **Drive as normal. It's counted.** What your work miles are worth this tax year, at a glance.
2. **Drives** · *Free* · **It learns your usual routes.** Regular client runs are sorted for you. Home to the office is flagged as a commute, so it isn't claimed by mistake.
3. **Trip** · *Free* · **Airport parking? Kept with the drive.** Purpose, parking and tolls, all on one trip.
4. **Reports** · *Pro* · **Ready when your tax return is.** An itemised report and exports for your accounting software.

*All wording rules checked: no "tracking", nothing that says we keep or see data, "we" for the company. Figures are from `regions.ts`; the relief example is (55p − 25p) × 2,480 mi. Research to check the MAR line and the US employee note before go-live.*

*(research, 3 Oct) Checked: labels, the 2026/27 rates and bands, every per-day figure (all correct at first-band rates), the MAR example, the US employee note, and every caption for claims and wording rules. No "tracking", nothing that says we keep or see data. Changes are marked above.*

## Order of work

research (the labels in §1, the MAR and US-employee lines) → coding (seed data, capture, deck switch on `website-preview`) → marketing (zing and copy review on screenshots) → qa → founder "publish".
