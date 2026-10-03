# Journey scenes: real work drives in the hero, and a clip that shows the main flow

*Marketing spec, 3 Oct 2026. Drafts only: nothing is built. For the coding agent, then marketing and qa sign-off, then the founder. Builds on `local-scenes-art-direction.md` (style, palette, layers, signs, motion), `local-scenes-research.md` (location, landmarks, signs), `persona-deck.md` (personas, `?for=`, demo seed data) and `scene-calendar.md` (season overlays). Where this spec and an earlier one disagree, this one wins once the founder signs it off.*

**The founder's notes:**
1. On the scenery: "Someone driving in the middle of nowhere. We need to make it a more real scenario. A gig worker would be riding to and from restaurants, a tradie to job sites or residential houses, and care workers to clients' homes."
2. On the clip: "If I've set my work hours, won't all of it be work? Same with a gig worker: swipe to turn on shift, so all are business when selected?"

Both are right. The second matters more, so it comes first.

## What we chose and why (for the founder)

- **The clip changes before the scenery does.** Today's clip shows the exception: a drive asking "Work or personal?", which only happens outside your shift or work hours. The new clip shows the main flow. You're on shift, you park, the drive is already marked as work ("Auto: on shift") with no question, and the total goes up. That's the product, and it's what "logs work drives by itself" means. This is the cheapest and highest-impact change in this spec: about 1 coding session, with no app build.
- **The drive home ("After your shift ended · not counted as work unless you say so") comes out of the hero.** It doesn't fit cleanly. The road parks once per loop, so it would need a second park, or a second 10 s loop that doubles the clip's weight. It moves to the persona deck instead, where the Deliveries Home card already shows it. That's where "it doesn't over-claim" gets told.
- **Each persona gets one clear destination, plus at most one thing passed on the way.** Not three environments. On a phone the scenery is only clearly visible for the first 3.4 s of the loop, before the camera zooms onto the phone, and on the way out at 8.9 to 9.6 s. Two beats read at 390 px; three would blur.
- **The vehicle stays a car (the same cab and mount) for everyone.** The zoom framing, the posters and the clip are all built around it. Riders are acknowledged with a parked moped and a plain top box outside the takeaways, and with the line "delivery riders" under the chips. A handlebar mount would be a new frame and a new camera, so it's a later option, not now.
- **The country picks the street's styling. The persona picks the journey and the clip. The default is Deliveries.** One persona choice drives the hero scene, the hero clip and the deck, from the same `?for=` link. A persona only switches the hero once both its scenery and its clip exist. Until then the hero stays on Deliveries, so the phone and the street never tell different stories.
- **Build first: the new GB Deliveries clip, then a UK Deliveries journey** (a parade of takeaways, then a terraced street, park). It replaces the open-country standard scene for UK visitors, with a country-neutral version for visitors we can't place. About **5 to 6 sessions** for that first phase. The other three personas follow at about 2 to 2.5 sessions each, and the US, Canada and Australia streets after that (sizing in §6).

---

## 1. The clip: re-storyboarded around the main flow

### 1.1 What the app really shows (checked in the code, 3 Oct 2026)

Every string below is the app's own English text, in `milemint/src` today. Nothing here is new UI.

| State | Where | Real text (English) | When it shows |
|---|---|---|---|
| Shift running | `components/home/shift-bar.tsx`, `shift-switch.tsx` | "On shift for {{elapsed}}, {{count}} drives" (e.g. "On shift for 1h 15m, 5 drives") on the orange shift bar (gradient `#D97706` to `#9A3412`) | Shift mode on, shift started |
| Shift not running | same | "Swipe to start shift"; hint "Every drive until you end your shift counts as work" | Shift mode on, no shift |
| A drive under way | `components/home/live-drive-banner.tsx` | "Recording a drive · {{distance}}", "Since {{time}}. It's saved as a trip once you park." | Driving |
| Just parked | same | "Stopped · {{distance}}", "If you've parked, the trip is saved after 5 minutes." | Stopped, not saved yet |
| Work hours, inside them | `components/home/tracking-card.tsx` | Pill "Work hours", chip "🕔 Until {{time}}" (e.g. "Until 14:30"). "Drives now count as work." is in the VoiceOver label only, **not on screen**. | Work hours set, now inside them |
| Work hours, outside them | same | Pill "Counting your miles" (or "Counting your km"), chip "🌙 Outside work hours" | Work hours set, now outside them |
| A drive on shift | `components/trips/trip-row.tsx` | Sorted as Work, with the note "Auto: on shift" beside the Work/Personal control; purpose "Deliveries" | The drive has a `shiftId` |
| A drive in work hours | same | Sorted as Work, note "Auto: in your work hours" | `autoReason: 'work-hours'`, classified as work |
| A drive after the shift | same | "After your shift ended · not counted as work unless you say so", then "Work or personal? Worth {{amount}} if work." and the Work/Personal control | The drive has an `offShiftId` |
| Any drive not sorted | same | "Work or personal? Worth {{amount}} if work." Swipe right is Work, left is Personal. | No shift, outside hours, or "Neither" |

**Two things the app does not do, so the clip must not show them:**
- **The year's total doesn't count up.** `SummaryCard` renders the total as plain text. In the clip it **steps up at the hard cut** between the two takes, and the camera's pan to the total (5.8 to 6.35 s) makes the step visible. A count-up would be a nice app change for a later grouped build ("counting numbers" is our own design rule), but the clip mustn't fake one.
- **A trip is saved after parking, not the instant you stop** (up to 5 minutes later, as the banner says). The clip compresses that with a hard cut, as it does today. That's fair for a demo, but don't add any caption saying "instantly".

**Today's clip, for the record:** take B is `?demo=1&clip&region=GB` (no shift, no work hours), with "Meanwood Rd → Home, 2.2 mi" waiting under "Work or personal?" and swiped to Work (+£1.21). In the courier seed data that exact leg is the `after` drive, the one past the end of yesterday's shift. So the hero has been showing the exception.

### 1.2 The new storyboard (same 9.6 s, same beats for the road and the camera)

The road and camera timings in `site.js` stay as they are: drive to 1.8 s, park by 2.7 s, zoom in 2.7 to 3.4 s, frame the row, pan to the total 5.8 to 6.35 s, zoom out 8.9 to 9.6 s. Only what's on the phone changes. Two takes, **hard cuts only, no cross-fades** (`tools/website/clip-framestep.py` must report no blends).

| Clip time | Road and camera | Phone (GB Deliveries) |
|---|---|---|
| 0 to 1.8 s | Driving | **Take A.** The orange shift bar: "On shift for 1h 15m, 5 drives". The banner: "Recording a drive · 1.7 mi", "Since 19:58. It's saved as a trip once you park." The total is as it was before this drive. |
| 1.8 to 2.7 s | Slowing, pulling in | Take A continues. Optional, only if the demo supports it cleanly: the banner turns to "Stopped · 1.8 mi" for the last 0.5 s. That's real UI, and it shows the app noticed the stop. |
| 2.7 s | Parked; the zoom starts | **Hard cut to take B.** The shift bar: "On shift for 1h 2xm, 6 drives". The new row at the top of the list: "Boar Lane, City Centre → Hyde Park · 1.8 mi", purpose "Deliveries", the value (£0.99 at 55p a mile, as the app works it out), sorted as Work, with "Auto: on shift". The total is now up by that drive's value. |
| 3.4 to 5.8 s | Zoomed in, framing the new row (where the swipe used to be) | Take B holds. **No touch indicator: nobody has to do anything. That's the point.** About 2.4 s to read "Auto: on shift". |
| 5.8 to 6.35 s | The camera pans up to the total | The total, already updated. |
| 6.35 to 8.9 s | Holds on the total | Take B holds. |
| 8.9 to 9.6 s | Zooms out, the car sets off | Take B; the loop restarts on take A (a hard cut while zoomed out, as today). |

**Why this leg:** "Boar Lane, City Centre → Hyde Park" is a real leg in the courier seed data (`COURIER_SHIFTS`, yesterday at 20:05, 1.8 mi). It runs from a city-centre pickup to a residential drop, so it matches the scenery in §2: past the takeaways, park on a terraced street. In take B it is replayed as today's leg, inside a running shift.

**Beat 2 (the drive home after the shift): dropped from the hero.** It needs the car to park a second time. Inside one 9.6 s loop with one park, that would mean the car parks once while the phone shows two drives, which is exactly the kind of mismatch we're fixing. The alternatives are worse. Alternating two loops (work drop, then drive home) means a 19.2 s clip at about twice today's weight (about 1 MB rather than 0.5 MB), plus a second "arrive home" scene. A split-screen would be invented UI. So: **the Deliveries Home card in the persona deck shows it** (`persona-deck.md` §2a already has the drive to sort, "Meanwood Rd → Home", on that screen, and with its `offShiftId` the row reads "After your shift ended · not counted as work unless you say so"). Its caption carries the message, for example: "Off shift, it asks. It never counts a drive home as work by itself." (Translator: 10 languages. Marketing re-checks the wording with the deck captions.)

### 1.3 Per persona: what the clip shows, and what the demo can do today

| Persona | App set-up | Take A (driving) | Take B (parked, logged) | Demo support today (`milemint/src/dev/demo.ts`) | What coding adds (no new app strings) |
|---|---|---|---|---|---|
| **Deliveries & rides** (default) | Shift mode | Shift bar "On shift for …", "Recording a drive · …" | "Boar Lane, City Centre → Hyde Park", "Deliveries", "Auto: on shift", total up | **Partly.** `?demo=courier` turns on shift mode and seeds past shifts whose drives show "Auto: on shift". But **no shift is running today** (today's two drops are unfiled, so that the "Start shift from …?" offer shows). `?demo=driving` has a live drive, but it isn't tied to a shift. | A demo flag (e.g. `&onshift`): a shift running since about 75 minutes ago, today's drops filed into it, and with `&clip` the leg above, live in take A and saved in take B. Hide the "Start shift from …?" offer in this mode. |
| **Care visits** | Set hours Mon to Fri 07:30 to 14:30, client privacy on | Pill "Work hours", chip "🕔 Until 14:30", "Recording a drive · …" | "Client visit · Leeds LS7 → Client visit · Leeds LS8 · 2.4 mi", purpose "Client visit", "Auto: in your work hours", total up | **No.** `?demo=care` is planned in `persona-deck.md` §2b but not built. Work hours only exist in the demo with `?demo=empty&hours` or `?demo=places`. | `?demo=care` as the deck specifies. **The demo uses the real clock**, so the recording must happen inside the work hours. Either the demo sets the work week around "now" in clip mode, or coding records at a matching time. The "Until 14:30" chip only shows inside the hours. |
| **Trade jobs** | Set hours Mon to Fri 07:30 to 16:30 | Pill "Work hours", "Until 16:30", "Recording a drive · …" | "Builders' merchant, Kirkstall → Kitchen refit, Roundhay · 6.8 mi", "Site visit", "Auto: in your work hours", total up | **No.** `?demo=trades` is planned in `persona-deck.md` §2c, not built. | `?demo=trades` as the deck specifies, with the same clock caveat. We chose the merchant-to-site leg, not "Home → Kitchen refit", so the clip makes no claim about home-to-site travel. |
| **My own business** | "Neither" (no hours, no shift) | "Counting your miles", "Recording a drive · …" | A drive to a client, under "Work or personal? Worth £x if work.", **swiped right to Work** by the touch indicator; total up | **Yes, mostly.** It's today's clip mechanism (`?demo=1&clip`). Only the drive changes: it's "Meanwood Rd → Home" with the purpose "Deliveries" today. | With `&clip` in the business set: "Office, Wellington St → Client office, Bradford" (the GB business places in `persona-deck.md` §2d), with no purpose filled in. Pick a drive that isn't on a learned route (a learned route would sort itself as "Auto"). Distance and value come from the seed; don't type them in. |

**Here the swipe is the honest main flow.** With no hours and no shift, the app asks about every drive. Own business is the only persona whose clip keeps the swipe, and the fact that it does tells its own true story: you sort each drive in a second.

**Countries:** the GB clips come first. The US, Canada and Australia clips (the same legs with their local names from `persona-deck.md` §2, in $ and km) come with those countries' streets (§6, phase 3). Until then, non-GB visitors see the GB clip, as they do today.

### 1.4 Recording checklist (coding, then qa)

1. `clip-record.js`: two takes per persona (A driving, B parked), at 2x (780 × 1688 frames), as now. Swipe touch events only in the business take B.
2. `clip-encode.py`: the same 9.6 s, cut at 2.7 s. Files: `drive-logged-{persona}.mp4/.webm`, plus a `-poster` (take A) and a `-saved` (take B) still for each persona (`deliveries` replaces today's files).
3. `clip-framestep.py`: no blends. For the three no-swipe clips, the "changed frames expected" window (3.9 to 5.6 s) should be empty. **Any change after the 2.7 s cut is a bug**, apart from the business swipe.
4. `site.js`: the camera's framing of "the new row" uses take B's measured row position (it moved: the shift bar sits above the total in shift mode).
5. **qa checks every state against the running app** (the web preview with the same demo flags) and against the string table in §1.1. Anything on screen that isn't in that table fails.
6. Reduce Motion and no-JS: the persona's `-saved` still (the logged drive) on the phone, the road parked.

---

## 2. Journeys: one per persona, inside the 9.6 s loop

### 2.1 What the loop allows (from the code)

- **On a phone (390 px), the scenery is clearly visible only from 0 to 3.4 s, and from 8.9 to 9.6 s.** From 3.4 s the camera zooms until the app's screen fills about 95% of the viewport width. So **the journey has to read in the first 3.4 s**: a passing beat from 0 to 1.8 s, the arrival from 1.8 to 3.4 s.
- **On desktop**, the scene stays visible around the phone all the way through, which is where the ambient detail lives (§4 of the art direction).
- **Where things can be seen.** At 390 the phone covers about x 36 to 132; at 1440 it covers x 105 to 224, and x 81 to 319 is all that's visible. So the **destination goes on the right**: x 236 to 318, from the horizon down to the dashboard (y 96 to 236). In the UK and Australia the car pulls in to the left kerb, so the destination is the house **across the road**, framed on the right, the same trick as the parked sign. In the US and Canada the car pulls in on the right, so the destination is right beside it.
- **So each journey is "one thing you pass, then one place you arrive".** Two environments, never three.

### 2.2 The four journeys

| Persona | 0 to 1.8 s: passing | 1.8 to 3.4 s: arriving (the destination, framed right) | Ambient while parked (desktop mostly) | What says "this is the job" at 40 px |
|---|---|---|---|---|
| **Deliveries & rides** | A parade of takeaways on the right: 3 shopfront modules with fascias that carry **pictograms only** (a pizza slice, a noodle bowl, a burger), lit windows, awnings, and **a parked moped with a plain top box** at the kerb | A terraced street. One front door across the road, its **porch light on** (gold), a doorstep. The terrace continues on both sides. | A cat walking along a front-garden wall; pigeons lifting off a roof every other loop | The lit takeaways, then a single lit doorway |
| **Care visits** | A short row of homes and trees (no shops) | A quiet street of bungalows with front gardens, low hedges and a gate. One bungalow's door is lit. | A robin on the gate, or leaves (autumn overlay) | Calm: homes only, nothing else on the street |
| **Trade jobs** | Houses, then a **builders' merchant yard** passing on the right: stacked timber, a forklift silhouette and a plain sign board with no words, just a brick and plank pictogram | A semi-detached house with **scaffolding** on one side and a **skip** on the drive (UK); a dumpster (US/CA) or a skip bin (AU) | A cement mixer turning slowly; a plank carried up the scaffold is out (no people) | Scaffold plus skip: instantly "a job on" |
| **My own business** | Mixed street, then a low business-park sign board (blank or sprout-mark only) | A low-rise office or workshop with a glass entrance, a roller door and a **"Visitors" parking bay** (painted bay, blue P sign) | Automatic doors sliding open and shut once; a flag-less flagpole is out | Glass frontage plus visitor bay |

**The arrival sign, per persona** (the parked sign the art direction already has; it holds still for 6 s, so it's the most readable thing in the scene). It goes through the translator, and is 2 to 4 words.
- Deliveries: a UK blue "P" with the plate "Loading only" is out: the timed bay plates are real regulatory signs, and we'd be using them for a joke. Use the **brand plate on a lamp post**: "Drive logged" (as the London scene does).
- Care: no sign. A sign would be clutter on a quiet street, and the calm is the message.
- Trades: no sign; the skip and scaffold say it.
- Own business: the blue "P" with a "Visitors" plate (a private car park sign, not a TSRGD regulatory sign).

**Dashboard props (optional, cheap, nice):** the dashboard (y > 238) is visible before the zoom. A tape measure and a pencil for Trades; a takeaway coffee cup for Own business; nothing for Care; nothing for Deliveries (the clip's shift bar carries it). Flat shapes, two colours each.

### 2.3 The vehicle

**The car stays for all four personas.** The windscreen pillars, dashboard, mount and zoom geometry are shared, and the founder approved that framing. What we lose: riders on mopeds and bikes don't see themselves in the cab. What we do about it: the parked moped with a plain top box outside the takeaways (no logo, no rider; people stay out of the art per art direction §2.6), and "delivery riders" in the self-label line under the chips. **Later, if the founder wants it:** a handlebar-mount variant for Deliveries (a new frame, a new camera, a new clip at a different crop): about 3 to 4 sessions. Not in this plan.

---

## 3. Persona and country together

### 3.1 Who decides what

| | Country (from `/api/scene`, as now) | Persona (from `?for=`, the deck chips, default Deliveries) |
|---|---|---|
| Decides | The street's **skin**: house types, shopfronts, road markings, signs, traffic side, the far skyline or landmark | The **journey** (§2.2), the **clip** (§1.3) and the parked sign |
| Examples | UK terraces, double yellows by the takeaways, red post box, Transport signs. US: a strip mall, then single-family homes with lawns, driveways and mailboxes (no numbers). Australia: Queenslanders (stilts, verandas, tin roofs; a federation brick cottage later for Sydney). Canada: Toronto bay-and-gable semis with porches, hydro poles and maples. Unknown: the **neutral skin** (§3.3). | Deliveries, Care, Trades, Own business |

**City scenes (decision of 3 Oct 2026 in `decisions.md`):** every major city gets its own styling over time, UK first. That slots in as the skin: **city skin, else the country skin, else the neutral skin**. A city skin is the country skin plus that city's far-layer skyline or landmark and any street details that are truly local (Glasgow tenements, Leeds back-to-backs). The persona journeys are shared by every city, so each new city costs roughly a skyline, not four new streets.

A scene is now **`{city or country skin} × {persona journey}`**: for example `uk:deliveries`, `standard:care`. The skin's styling follows the art direction (the world in brand greens, cream windows, gold light; local colour only on the signs and one detail, at most 8% of the picture). **Houses are drawn in the green family like everything else**, with the brick texture suggested by one darker tone, not by red brick.

### 3.2 One choice, three places that agree

- **One resolver**, shared by the deck and the hero: `?for=` (slugs and aliases as in `persona-deck.md` §3), then the visitor's choice on this page, then **Deliveries**.
- **A chip tap anywhere switches all three:** the deck, the hero's journey and the hero's clip (one `ms-persona` event, like today's `ms-scene`). The deck sits below the hero, so the hero usually swaps while it's off screen. If the hero is on screen, use a 300 ms cross-fade, an instant swap under Reduce Motion, and wait for the loop's 9.6 s seam, so the clip and the road never fall out of step.
- **No new chip row in the hero.** The deck's "I drive for…" chips are the single control; the hero's flag chips stay for scenery. Two rows of chips in the hero would crowd it.
- **A persona switches the hero only when its journey and its clip both exist** for that country skin (or for the neutral skin with the GB clip). Otherwise the hero stays on Deliveries, and only the deck switches. A care visitor never sees a care street with a takeaway drive on the phone.
- **`?for=` links for community posts** then open the right deck, scenery and clip in one go: for example `milesprout.app/?for=care` for a carers' group, `?for=tradies` for an Australian trades group.
- **This supersedes `persona-deck.md` §3's line "The persona doesn't change the hero scene or the hero clip in this round".** Founder sign-off covers both.
- **Open question for research before coding (not the founder):** the deck spec remembers the persona in `localStorage`, but `local-scenes-art-direction.md` §1.1 rules out storing the scenery choice, citing PECR (research §1.3). Research to say whether remembering the persona is fine under PECR's storage rules (a visitor's own interface choice) or whether it should last only for the page view, like the scenery. Until research answers, coding follows the stricter rule: page view only, with `?for=` for links.

### 3.3 The neutral skin (for visitors we can't place)

The founder's "middle of nowhere" is the standard scene that everyone we can't place sees: EU visitors, VPNs, privacy tools, no JavaScript. Research said **never default to GB** for them, so they don't get double yellows and Transport signs. They get the same journey geometry in a **neutral skin**: two-storey gabled houses and a shopfront parade that could be anywhere, plain kerbs, no country road markings, and **brand signs** (art direction §3.5) instead of any country's signs. The traffic side stays left, as the standard scene is today. The no-JS inline markup becomes the neutral Deliveries street, parked.

### 3.4 London

London is approved and live (the Westminster approach). Phase 1 leaves it alone. In phase 2, London visitors get `uk:{persona}` with **Elizabeth Tower small on the far skyline** above the rooftops (the existing `tower()` reused, in the safe box), and the Embankment scene stays available as `?scene=uk-london`.

---

## 4. Rules

1. **No real brands, chain shopfronts or logos.** Takeaway fascias carry pictograms only, no words or names. That also avoids look-alikes of real chains and keeps every visible string out of the translation load. No delivery-platform colours (no teal-and-white or red-and-white top boxes), and no colour pairings that suggest a real delivery app; the top box is plain cream or green. No merchant or builders' merchant names. No vehicle makes.
2. **No identifiable homes, house numbers or people.**
   - Houses are built from modules, not traced from any photo (research §3: never trace a stock photo).
   - No numbers on doors, gates, mailboxes or wheelie bins. No street-name plates for real streets.
   - No people at all (art direction §2.6).
   - The demo's place names appear only on the phone, as the app shows them.
3. **Care: nothing that implies a client's health.** No ramps, grab rails, key safes, walking frames, mobility scooters, medical bags, uniforms, pharmacy or first-aid crosses, ambulances, "H" signs, care-home boards, or blue badge bays. A bungalow is a home, nothing more. That's the same principle as the app's client privacy mode: the area, never the person.
4. **Wording.**
   - Never "tracking". Use "logged", "Drive logged" or "Counting your miles".
   - Never imply we see or keep data.
   - The scene's `role="img"` label is new marketing copy per persona, and goes through the translator in all 10 languages. For example (Deliveries): "On shift: the car parks on a terraced street, and the drive is logged as work by itself." No "tracking", no "instantly".
5. **Signs.** The art direction §3 rules stand: real formats, true text, rates from the calculator's `RATES`, and regulatory signs never used for jokes (hence no "Loading only" plate).
6. **The quality bar.** The founder has called the art low quality before. The art direction §5 process stands:
   - a silhouette test for each destination at 40 px (does the takeaway parade read as takeaways? does the scaffold-plus-skip read as building work?);
   - blocked in flat, then details;
   - screenshots at 390 × 844 and 1440 × 900, at 0.6, 2.2, 3.0 and 9.3 s;
   - a family strip beside the finished scenes;
   - **two review rounds expected**;
   - marketing signs off on brand and zing, qa on function, then the founder sees screenshots.

   Houses and shopfronts are geometric, which coded SVG does well (art direction §5.2). The animal and moped details are the risky part, so keep them small and side-on, as the art direction says.
7. **Keep the zoom framing.** Nothing in the journeys changes the camera, the phone's position, the mount or the 9.6 s timings. The destination is framed by §2.1's right-hand box.
8. **Reduce Motion stills:** each journey parked at its best pose (the porch light on, the cat on the wall, the skip and scaffold in view), with the persona's `-saved` clip still on the phone.
9. **Lightweight SVG:**
   - ≤ 600 nodes per scene;
   - ≤ 35 KB gzipped per scene file;
   - modules reused across journeys (the terrace and bungalow modules share doors, windows and gardens);
   - each scene file loads only for the chosen skin and persona;
   - the neutral Deliveries street stays inline as the no-JS base.

   One clip per visitor (about 0.5 MB, as now).

---

## 5. What the engine needs (for sizing; coding decides how)

- **Segments along the road:** a roadside row gets a distance window, so the takeaway parade passes during 0 to 1.8 s and the terrace sits at the parked position. Today the rows repeat evenly along the whole road.
- **A destination group:** placed at the parked spot, on the visible side (across the road for left-kerb countries), held still while parked. It works like the parked sign.
- **Scene id = skin + persona,** with fallbacks: skin missing → neutral skin; persona journey or clip missing → Deliveries.
- **Clip per persona:** `video` sources and posters swapped by the persona, with the same loop clock.
- **The shared persona resolver and the `ms-persona` event,** whether or not the deck's chips exist yet. Until the chips ship, `?for=` alone works.

---

## 6. Build order and honest sizing

One session is one focused coding run plus its marketing review round. qa passes are included in the totals. **Nothing here needs an app build:** the demo flags only run in the web preview used for recording.

| Phase | What | Sessions | Why in this order |
|---|---|---|---|
| **1a** | **The GB Deliveries clip, re-storyboarded** (§1.2): the `&onshift` demo flag, two takes, encode, framestep, re-framing the camera onto the new row, the deck caption for the drive home. Ships on today's scenery. | **1** | The founder's main confusion. Biggest effect for the least work. Ships on its own. |
| **1b** | **Engine bits** (§5): segments, the destination group, skin × persona ids, the persona resolver, clip swap by persona | **1** | Needed by every journey |
| **1c** | **UK Deliveries journey** (takeaway parade, terrace, porch light, moped, cat; double yellows and UK signs reused) plus the **neutral skin** of it, replacing the open-country standard scene for UK (not London) and unknown visitors. Inline no-JS markup and Reduce Motion stills. | **2.5 to 3.5** (with 2 review rounds) | The default persona, most visitors, the founder's exact complaint |
| | **Phase 1 total** | **≈ 4.5 to 5.5** | |
| 2 | **Care**: bungalow street (reuses the terrace kit) + `?demo=care` + its clip | 1.5 to 2 | Cheapest after Deliveries; shares `?demo=care` with the deck work |
| 2 | **Trades**: merchant yard, semi with scaffold and skip + `?demo=trades` + clip | 2 to 2.5 | New props (scaffold, skip, timber) |
| 2 | **Own business**: office or workshop with a visitor bay + the business clip (existing swipe take, new drive) | 1.5 to 2 | Its clip is nearly free |
| 2 | London: Elizabeth Tower on the UK journeys' skyline | 0.5 | Reuses `tower()` |
| | **Phase 2 total** | **≈ 5.5 to 7** | |
| 3 | **US, Canada and Australia skins** (houses, shopfronts, street furniture, right-hand traffic for US and CA) × the four journeys | ≈ 2 per country, **≈ 6** | Each skin reuses the journey geometry |
| 3 | Regional clips (12: three countries × four personas, local names, $ and km) | 1 to 2 | Mostly scripted once 1a and 2 exist |
| | **Phase 3 total** | **≈ 7 to 8** | |

**All in: about 17 to 20 sessions.** That's large by the founder's own measure, so **only phase 1 is proposed now** (about 5 sessions), with **1a able to ship alone in 1 session** if the founder wants the clip fixed first. Phase 2 and 3 wait for the founder's go after they've seen phase 1's screenshots.

**How this fits the other scene work:**
- The art direction's P1 landmark scenes (Sydney, Toronto, US city) and this plan overlap. A US, Canadian or Australian skin plus its skyline in the far layer gives both "it's local" and "it's a real job". The recommendation is to **fold the P1 landmark scenes into phase 3 as far-layer skylines over the journey streets**, rather than building open-road landmark scenes and then streets on top. This saves about 4 sessions against doing both.
- **City scenes** (`decisions.md`, 3 Oct): Leeds is on the city list, and the GB demo data is set in Leeds, so a Leeds skin is the natural second UK city after London. It matches the place names on the phone.
- The season overlays (`scene-calendar.md`) attach to the sky and far layers, so they're unaffected.

## Open items

- [ ] Founder: sign off the clip storyboard (§1.2, beat 2 moved to the deck), the journeys, and phase 1 (or 1a alone first).
- [ ] Research: is remembering the persona in `localStorage` acceptable under PECR, or page-view only (§3.2)? Until then, page view only.
- [ ] Coding: confirm in the web preview that, in shift mode, Home lists the new drive as its own row with "Auto: on shift" (not folded into a shift group). If it's folded, re-plan take B's framing with marketing, using only what Home really shows.
- [ ] Coding: the demo clock for care and trades (record inside the work hours, or set the hours around "now" in clip mode).
- [ ] Translator: the four `role="img"` labels, the "Drive logged" and "Visitors" plates, and the deck caption on the drive home (10 languages).
- [ ] Marketing: review the deck's Deliveries Home caption so it carries the "it asks off shift" message (§1.2).
- [ ] Later, optional (app, grouped build): a count-up on Home's total when a drive lands. Only then can a clip show the total climbing rather than stepping.
