# 500 gig workers, one normal day each, through MileMint's real drive detection

**What this is.** 500 simulated gig workers across the UK (140), US (140), Canada (80), Australia (80) and a stress-test group (60). Each had a realistic working day turned into GPS, with restaurant waits, drops, depot loading, shopping, ping waits, breaks, the commute and the drive home, plus phone-specific GPS noise. Every day was run through MileMint's **real** drive detection code. Then each persona reacted to their own logged day. **Simulated, not real users: use it as directional.** Raw data per segment is in the scratchpad `gigday/` folders, kept out of the repo.

UK and US were run on the drive detection as fixed on 1 Oct, commit 24124aa. Canada, Australia and the edge group ran on the code before that fix, so their distance figures are higher than today's.

## Does a delivery take more than 5 minutes?

Often. The 5-minute rule decides where a trip ends.

| Stop | Typical length | Splits the trip |
|---|---|---|
| Food drop-off on its own | 1–4 min (mean 2.5) | almost never (0–20%) |
| Restaurant wait | median 6–8 min, up to 20+ | **61–77%** |
| Drop-off, then waiting for the next order | 8–9 min | **70–87%** |
| Instacart shopping | 20–45 min | ~100% |
| Parcel drop (Flex, Evri, DPD) | 30 s – 3 min (mean 1.7) | 0–2% |
| Flats, signatures, lockers | 5–10 min | ~80% |
| Depot loading, lunch | 15–45 min | ~100% |

**What that does to a day:**
- A food courier gets about **1.7 rows per order**, split at restaurants rather than at customers. For example, "CVS → Starbucks" with the customer hidden in the middle.
- A parcel round becomes **9–13 random chunks** of up to 2 hours.
- None of the rows matches anything the worker recognises: not an order, not a session, not a shift.

## How the days were logged

| | UK | US | Canada* | Australia* | Edge* |
|---|---|---|---|---|---|
| Median rows a day | 12 | 12 | 15 | 18.5 | 15 |
| Stops that split a trip | 25% | 44% | 62% | 51% | 38% |
| Logged vs true distance | **102%** | **101%** | 114% | 110% | 118% |

\* Before the 1 Oct detection fix. On the same days, UK went from 132% to 102% with the fix and US from 117% to 101%, so the distance problem is solved.

### Problems still in the current code
1. **Personal miles tagged as work** (US 27 of 98 shift users, even when the shift was used correctly).
   - The last delivery merges with the drive home or an errand into one trip, and a trip counts as work if it *starts* in the shift.
   - "My last delivery, the drive home and a stop at a friend's place came out as ONE 19-mile trip."
2. **Shift habits lose or misfile about 28% of work miles** (UK).
   - Users start late, forget to start, end early, or leave it on overnight.
   - The overnight case tags the next morning's school run as "Deliveries".
3. **E-bikes and slow scooters lose legs.**
   - A trip must reach 15 mph (6.7 m/s) somewhere to count.
   - UK legal e-bikes cruise at about 12 mph, and NYC's limit is 15 mph. US riders at 9–12 mph had only 10 of 60 legs logged.
4. **Short hops after a split are dropped.**
   - A hop of 0.4–0.7 km right after a long stop goes missing: the phone wakes late, then the 400 m minimum removes what's left.
   - That's about 1% of distance, but it shows as gaps on the map.
5. **Trains, buses and bikes are logged as drives.** There's no recognition of how the person is travelling.
6. **The free plan runs out fast.**
   - Without shifts, the 40 free drives last **3–6 days**.
   - Even with correct shifts, personal drives push a courier to about 60 a month.

## What they want to see

| View | UK | US | CA | AU | Edge | Total |
|---|---|---|---|---|---|---|
| **One row per shift** | 109 | 66 | 43 | 55 | 36 | **309** |
| **With earnings** | 56 | 86 | 34 | 56 | 21 | **253** |
| **Unpaid "dead" miles highlighted** | 54 | 75 | 33 | 26 | 13 | **201** |
| Just a daily total | 53 | 49 | 15 | 29 | 10 | 156 |
| Per app / platform | 29 | 51 | 28 | 19 | 5 | 132 |
| Timeline / map | 23 | 44 | 11 | 14 | 17 | 109 |
| Per order / drop | 7 | 27 | 19 | 13 | 5 | 71 |

**Nobody wanted today's view, one row per detected trip, as their main view.**

Other requests, by group:
- **Amazon Flex drivers** want one row per block.
- **Instacart shoppers** want one row per batch.
- **Walmart Spark drivers** want one row per run.
- **US drivers (48):** split the drive home off the last delivery.
- **Shift recovery:** "Start shift from 10:40?", editing shift times afterwards, and pausing a shift for a personal errand.
- **Canada:** business-use % with odometer readings on 1 Jan and 31 Dec. The self-employed claim actual costs × business %, not 73¢/km.
- **Australia:**
  - **Students on visas** want a fortnightly hours tracker for their 48-hour limit.
  - **High-km drivers** want the logbook method.
  - **Scooters and e-bikes** shouldn't be shown the car rate.
- **Bikes:** hours and £/hour instead of mileage value.
- **Languages:** French for Quebec, and Punjabi and Bengali drivers want a simple daily total plus a PDF to send to their accountant on WhatsApp.

## Trust and paying

| | UK | US | CA | AU | Edge |
|---|---|---|---|---|---|
| Trust (out of 5) | 3.6 | 3 | 3.5 | 2.6 | ~3 |
| Would pay | 30 | 24 | 17 | 5 | 8 |
| Maybe | 49 | 57 | 41 | 44 | 41 |
| Price they'd pay | £4.49/mo | ~$4.99 | C$7.99 (C$3.99 for "maybe") | A$9.99 only with the logbook | — |

- **Payers are van, Flex and parcel drivers, and full-time car couriers.** Their claim is worth £23–34 a day.
- **Bike and scooter couriers mostly won't pay monthly.** Their claim is £6–12 a day. Many would buy a **tax-season pass** instead (about £15–25 a year).
- **US:** nobody would pay $7.99 or more. 32 would rather use free Stride or Gridwise unless MileMint adds earnings and paid-versus-unpaid miles.

## Recommendations, in order

1. **Make the shift the row.**
   - One row per shift: time, hours, distance, stops, value, and earnings if entered. It expands to the legs and a map.
   - Inside a shift, join drives separated by gaps under about 30–45 minutes instead of cutting at 5-minute stops.
   - Use a block view for Flex, a batch view for Instacart and a run view for Spark.
   - This matches the free plan, which already counts a shift as one drive.
2. **Cut the trip at the end of the shift.** The drive home becomes its own row, "Last delivery → Home", which the user sorts. Classify each leg rather than the whole trip by its start time.
3. **Make shifts forgiving.**
   - **Start:** ask "Start shift from 10:40?" when drives look like deliveries.
   - **Fix afterwards:** let users edit shift times later, and add a **pause** for personal errands.
   - **End:** ask "End shift?" after more than 45–60 minutes parked at home. Notify at the 16-hour auto-end instead of ending silently.
   - **Swipe safety:** add an undo after swiping the shift off.
4. **Show earnings and paid versus unpaid miles per app, and make that the reason to buy Pro.**
   - The miles log alone has free competitors.
   - Unpaid miles are 22–41% of work miles, depending on the platform.
5. **Add a bike and scooter mode.**
   - Lower the speed thresholds.
   - Show hours and £/hour, and use the bicycle rate where one exists (HMRC 20p). Don't show car rates.
   - Add recognition of how the person is travelling, to drop train and bus rides.
6. **Recover short hops after a stop.** Count the distance before the phone wakes toward the 400 m minimum, or drop the minimum inside a shift.
7. **Country fixes:**
   - **Canada:** a business-use % model with a T2125 summary, and French in the interface.
   - **Australia:** car rates for cars only, a warning near the 5,000 km cap, the logbook method (built), and a visa hours tracker.
8. **Pricing:**
   - Keep the monthly price around £4.49–4.99 / $4.99.
   - Add an annual or tax-season pass for bikes and part-timers.
   - Stop personal drives eating the free 40, or count drives by day.
