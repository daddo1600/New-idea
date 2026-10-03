# Local hero scenes: art direction and scene plan

*3 Oct 2026. Marketing (art director). Status: plan for the coding agent; nothing built yet.*

**The founder's brief:** "I want road signs and I want it to feel like the country or area it's being viewed in. In a city make it a city drive, in Australia the outback or town, perhaps the Harbour Bridge and landmarks. This will take longer to build and we want landmarks to look good, not rushed. Big Ben and English/Scottish countryside for instance. If it's incognito, just use a standardised one."

**What this changes:** the hero "driving scene" on the home page (`website-preview`: `index.html` `.scene-road`, `assets/site.js` `ROAD` and `scene()`, `assets/site.css` `.rd-*`). The phone, the mount and the app clip don't change. Only the world behind them changes.

**Built on:** `research_notes/launch-2026/local-scenes-research.md` (research, 3 Oct 2026), which landed while this was being written and has been folded in. Its rulings are used throughout: server-first location with the time zone as a cross-check; the standard scene whenever we can't tell; Big Ben and the Harbour Bridge are safe to draw; the CN Tower only as part of a skyline; the Opera House small and incidental; Quebec signs in French only; Crown copyright signs. Anything still open is marked **[R]**: research to confirm before that scene ships.

**What changed from the brief because of research:**
- **"Incognito → standard" isn't reliably possible, and we shouldn't try** (it needs storage probes, and browsers treat it as a bug to fix). It becomes **"standard whenever we can't tell, or the visitor uses a VPN or privacy tools, or is in the EU"**, which is the honest version of what the founder meant.
- **Toronto's scene is a skyline that happens to include the CN Tower, not a CN Tower picture.**
- **Sydney's landmark is the Harbour Bridge.** The Opera House appears only as a small sail shape beyond it.

---

## 0. What the current scene tells us (constraints the art has to live with)

These come from reading the code and the screenshots (`website/docs/final-hero-390.png`, `final-hero-1440-dark.png`, `final-scene-strip-390.png`). They decide where the art can go.

1. **The phone covers a lot of the picture.** The SVG is `viewBox 0 0 400 300`, `preserveAspectRatio="xMidYMax slice"`, with the horizon at y 150 and the vanishing point at x 200 (it moves ±14 with the desktop pointer "steer").
   - **390 px wide:** the scene is about 1.66:1, so the full width shows and the top is cropped: visible y ≈ 59–300. The phone covers about x 36–132.
   - **1440 px wide:** the scene is about 0.79:1 (taller than wide), so the sides are cropped: visible x ≈ 81–319, full height. The phone covers about x 105–224.
   - **So there's one safe box for the landmark that works at both sizes: x 236–312, y 70–150.** The current sun (cx 292, cy 128) already sits in it, which is why it reads well today. Anything left of x 230 is behind the phone on desktop. Anything right of x 319 is cut off on desktop, but it still shows on phones, so use it for supporting skyline that's nice to have but not essential.
   - The windscreen pillars take the top corners (`.rd-pillar`). The dashboard takes y > 238 (`.rd-board`). The Pause and Replay buttons sit bottom right, over the dashboard.
2. **The car only drives for about 2.7 s of the 9.6 s loop.** `pace()` in `site.js` has it driving until 1.8 s, slowing and pulling in until 2.7 s, parked until 9.0 s, then setting off. So **signs can only pass the car in the first 2.7 s and the last 0.6 s.** For the 6.3 s it's parked, the scene needs something alive that isn't the road (the ambient detail, §4). It's also why **the best place for a readable sign is beside the parked car**, because there it holds still for 6 seconds.
3. **The car pulls in to the left kerb (UK).** That's right for the UK and Australia. **The US and Canada drive on the right:** the road has to be mirrored (the centre line on the left of the car, pulling in to the right kerb), or a North American visitor will see a wrong-side road straight away. One flag in the engine handles it: `side: 'left' | 'right'`.
4. **The phone's screen shows £.** The clip is the UK app ("Meanwood Rd → Home, 2.2 mi", £1.21, £2,266.33). In Sydney or Toronto, a phone showing pounds under the Harbour Bridge or the CN Tower undoes the "it's local" feeling. **Dependency:** record a clip per region (AU in km and $, CA in km and $, US in miles and $), the same 9.6 s and the same beats, so the road timing still fits. Until then, the non-UK scenes still work, but they're 80% of the effect, not 100%.
5. **The seasons artwork is switched off** (`SEASONS_LIVE = false`, "until the seasonal artwork is redrawn"). The team has already judged some hand-coded art not good enough. That's the bar this project has to clear (see §5).
6. **No external scripts or fonts** (`README.md`, `_headers` CSP). Everything ships from our own origin, and sign text can't come from a web font CDN.

---

## 1. The scene set

### 1.1 How a visitor gets a scene (per research §1–2)

- **Signals, in order (per research §1.7):** (1) `?scene=<id>` for previews and screenshots; (2) a tiny Pages Function, `/api/scene`, that reads `cf.country`, `cf.regionCode`, `cf.city` and `cf.timezone` and **returns only a scene key** (`no-store`, no logging, no storage); (3) the key is accepted only if `cf.timezone` agrees with the browser's time zone, at least on the country; (4) if the Function fails or takes more than about 1.5 s, the browser time zone alone (AU states and Canadian provinces still work); (5) **otherwise the standard scene.** Never the browser language, and **never default to GB** (`season.js` `country()` does today, so the scene picker needs its own default of standard).
- **Paint the standard scene first** (it's the inline markup), then cross-fade to the local one when the key arrives. No layout shift, no flash of the wrong country.
- **What each signal can tell us.** The time zone alone is enough to pick the country, and within Australia the state (`Australia/Sydney`, `Melbourne`, `Brisbane`, `Perth`, `Darwin`, `Adelaide`), and within North America the broad region (`America/Vancouver` / `Edmonton` versus `Toronto`; `Los_Angeles` / `Denver` / `Phoenix` versus `New_York` / `Chicago`). **It can't tell London from Leeds or Edinburgh:** the whole UK is `Europe/London`. Scotland, or "countryside versus city" in the UK, needs the server's region and city. Research expects `cf.region` to read "England" or "Scotland" for UK IPs, but coding must hand-check this on `website-preview` first [R]. City-level location is only about 50–80% right, and mobile data puts people in the carrier's gateway city. So "city" will be over-reported and "countryside" under-reported. That's harmless for a picture, but it's another reason the city scenes come first.
- **Incognito.** Don't detect it (research §2). **Show the standard scene when any of these is true:**
  - the country is missing, Tor (`T1`) or not GB/AU/CA/US;
  - the visitor is in the EU (`cf.isEUCountry`);
  - the server and browser time zones disagree (VPN-like);
  - the browser reports `UTC`/`Etc/*` (Firefox's resist-fingerprinting, Tor);
  - the Function fails or is slow;
  - there's no JavaScript;
  - the visitor chose Standard.

  **The standard scene is also the no-JS markup, so it's always the base.**
- **Let people choose (zing, it fixes wrong guesses, and it's the "simple way to object" that research says the UK's appearance exemption needs).** Put a small row of chips under the scene, styled like the calculator's flag chips: **🇬🇧 🇺🇸 🇨🇦 🇦🇺 and a sprout chip for "Standard"**. Tapping one swaps the scene with a short cross-fade. **Don't store the choice** in `localStorage`, `sessionStorage` or a cookie (research §1.3: that would be device storage under PECR). It lasts for the page view, and the privacy policy links to `?scene=standard` for anyone who always wants the standard scene. (Coding: reuse the calculator's radio-group pattern and its focus ring.)
- **Privacy wording:** the page never names the visitor's city and never says "we know where you are". The chip row's label is just "Scenery". The privacy-policy paragraph is research's §1.5 wording (marketing has checked the tone: keep it as is). It must never say "tracking" or "located".

### 1.2 The full catalogue, prioritised

**P1** = launch, **P2** = the next wave, **P3** = later. "Routes from" is which visitors see the scene before its own regional scene exists.

| # | Scene | Pri | Routes from (until its own regional scene exists) |
|---|---|---|---|
| S0 | **Standard: "the brand road", polished** | P1 | Everyone we can't place; no JS; Reduce Motion fallback if a local still is missing |
| UK1 | **London: Westminster approach** | P1 | All UK visitors until UK2–UK4 exist |
| AU1 | **Sydney: Harbour Bridge** | P1 | All Australia until AU2/AU3 |
| CA1 | **Toronto: the Gardiner and the CN Tower** | P1 | All Canada until CA2/CA3 |
| US1 | **American city: freeway into downtown (no named building)** | P1 | All US until US2/US3 |
| UK2 | English countryside lane | P2 | England outside the big metros (server region and city) |
| UK3 | Scotland: Highlands, a loch, a glimpse of Edinburgh | P2 | Scotland (server region; Glasgow and Edinburgh get the Edinburgh-skyline variant) |
| AU2 | Outback highway | P2 | NT, WA outside Perth (server region); `Australia/Darwin`, `Broken_Hill` by time zone |
| CA2 | Rockies or forest highway | P2 | `America/Vancouver`, `Edmonton`, `Regina`, `Winnipeg` |
| US2 | Desert highway | P2 | `America/Phoenix`, `Denver`, `Boise`; `Los_Angeles` inland |
| UK4 | UK market town | P3 | UK towns (Cloudflare city size [R]) |
| AU3 | Coastal town | P3 | `Australia/Brisbane`, `Hobart`, and as an alternate for Sydney |
| CA3 | Montreal | P3 | Quebec (server `regionCode` QC); time zone alone can't tell Quebec from Ontario |
| US3 | Suburban | P3 | US, as an alternate to the city by city size [R] |
| — | Dusk variants for dark mode | P3 | Any scene, when `prefers-color-scheme: dark` |

### 1.3 What each scene contains

Layers, from back to front: **sky → far → mid → near (roadside) → road → signs**. The landmark is always in the far layer, inside the safe box (x 236–312, y 70–150), unless stated.

#### S0 Standard: "the brand road", polished (P1)
- **Sky:** today's green gradient, plus 2–3 soft cream cloud shapes (flat, three overlapping rounded lobes, 20% opacity) drifting slowly.
- **Far:** two hill bands as now, plus a third, paler band near the horizon for depth (mixed 40% toward the sky colour).
- **Mid:** a gentle rolling field edge with one hedge line. One sprout-shaped tree (two leaves on a stem, our mark's shape) far off as a quiet brand easter egg. Never "cute", just there.
- **Near:** the current round trees, with two crown shapes (round and a two-lobe oval) and a darker under-crown shadow ellipse, so they stop looking like lollipops. White marker posts as now.
- **Signs:** brand signs (§3.5), not any one country's style.
- **Light:** the late-afternoon gold sun as now (see §2.4).
- **Ambient:** a pair of birds (two-stroke "v" shapes, wings flapping) crossing the sky while parked.
- **Vehicles:** none.

#### UK1 London: Westminster approach (P1)
- **Sky:** brand gradient, slightly cooler and paler toward the horizon (a London haze). One long flat cloud.
- **Far (the landmark):** **Elizabeth Tower** stands right of centre in the safe box, about x 268–282, with its base on the far bank at y ≈ 146 and the spire tip at y ≈ 74. To its left, the **Palace of Westminster** roofline runs low and long, behind the phone on desktop, so it's supporting only: a flat run of gothic pinnacles, with **Victoria Tower** (square, flat-topped with corner turrets) far off at x ≈ 238. Draw no portcullis, no Parliament crest, no TfL roundel, and don't write "Parliament" anywhere (research §3). **No London Eye:** research didn't clear it, and the tower doesn't need help. Further right (x 300–340, which shows on phones and is cropped on desktop), a few low, generic South Bank blocks in `--sc-far-2`.
- **Mid:** **The Thames** as a flat band just below the horizon (y 146–152): a deep teal-green with two cream glint dashes. The Embankment wall as a thin stone-coloured strip with a row of lamp posts (the dolphin lamp standards, simplified to a post and a globe).
- **Near (roadside):** London plane trees (an irregular, wider crown with 2–3 lobes and a paler mottled patch), black bollards, and a short run of black railings.
- **Road:** a wider urban road with double yellow lines along the kerb (two thin gold lines: on-brand and true to UK parking rules) and white centre dashes. **The UK centre line is white. Gold dashes are a brand liberty we keep only in S0.**
- **Signs:** UK set (§3.1).
- **Vehicles:** a **red double-decker bus** (the ambient detail). It's a modern, generic bus shape, not a branded Routemaster: no TfL, no route number that's real, and the blind reads "Home". A black cab is optional later.
- **Light:** late afternoon. The clock face is lit cream.
- **Details:** pigeons on the railing that lift off when the car parks. No phone box or post box: their designs and the royal cipher are someone else's, and the bus already brings the red.

#### AU1 Sydney: Harbour Bridge (P1)
- **Sky:** brand gradient, warmer and bluer-green at the top. A high, bright sun.
- **Far (the landmark):** **Sydney Harbour Bridge** is the one landmark too wide for the safe box, so it spans x 228–330 at about 1:4 height to span. The arch crown is at y ≈ 116, the deck at y ≈ 136, and the two pylon pairs stand at each end, rising just above the deck. The left pylons can sit behind the phone on desktop, and the arch curve plus one pair of pylons is still unmistakable. **The Opera House, small and incidental only** (research §3: the Trust's guideline allows it in a harbour or skyline scene, under a third of the picture and no more prominent than the bridge or skyline). Draw it as a small cluster of cream sails **beyond and below the bridge's south end**, at x 238–252, on the water line: about 14 units wide, a fifth of the bridge's width, its sails lower than the bridge deck. It must never be altered (no hat, snow or season art), never be alone, and never carry our mark. If marketing review finds it pulling focus, remove it: the bridge carries the scene alone.
- **Mid:** **the harbour** in deep teal with glints, the far shore as a low line of green headland with a few white low-rise blocks, and a strip of Norfolk Island pines (tall, layered, tiered triangles) on the near shore.
- **Near:** eucalypts (an open, airy crown in 3 separate clumps on a pale trunk, with a pale grey-green leaf colour), a sandstone retaining wall, and a bus shelter. No figures on the bridge arch: BridgeClimb is a trade mark (research §3).
- **Road:** **left-hand traffic, like the UK.** White centre dashes. A green guide sign gantry is possible on the approach.
- **Signs:** Australian set (§3.2).
- **Ambient:** a **green-and-gold harbour ferry** crossing the water left to right while parked (a generic ferry shape, not the real Sydney Ferries livery or name). On the alternate loop, a **sulphur-crested cockatoo** lands on the sign.
- **Light:** bright midday-to-afternoon, crisp shadows.

#### CA1 Toronto: the Gardiner and the skyline (P1)
**The CN Tower rule (research §3):** Canada Lands Company gives implied permission only when the tower is **part of the Toronto skyline, unaltered, in good taste and not the focal point.** So this scene is **a Toronto skyline that includes the tower**, and the focal point is the **overhead sign and the streetcar**, not the tower.
- **Sky:** brand gradient, cooler, with one wide cloud.
- **Far (the skyline):** a **downtown cluster** of 10–12 towers across the safe box and right of it (x 236–340), in 3 tones, with a few cream lit windows. **The CN Tower stands within the cluster, off-centre at x ≈ 300** (toward the right edge of the safe box, not its middle), drawn in the same tone as its neighbours, with **no extra highlight, glow or framing**. It rises above the others because it really does: the antenna tip at y ≈ 66. Towers overlap its base, as in the real view from the Gardiner. **It is never altered:** no season art, snow or hats, and nothing of ours on it. No Rogers Centre dome (not cleared; it isn't needed).
- **Mid:** the edge of **Lake Ontario** as a thin blue-green line, and the elevated expressway as a thin grey band with railings.
- **Near:** sugar maples (round crown with 3–4 rounded lobes; in autumn the seasons system turns them red and orange), concrete median barriers, and streetlights.
- **Road:** **right-hand traffic, so mirror it.** **A yellow centre line** (true in North America: yellow divides opposing traffic). The road edge lines are white. Gold is on-brand here and correct, which is a happy accident.
- **Signs:** Canadian set (§3.3). In CA1 the passing gantry sign is the hero moment, like the US scene.
- **Ambient:** a **red streetcar** crossing at a junction on the right while parked (a generic modern tram: no TTC logo, no real route number). On the alternate loop, a Canada goose skein (a V of 5 birds) flies over.
- **Light:** crisp afternoon.

#### US1 American city: freeway into downtown (P1)
- **No named building at launch.** Named skyscrapers' owners often hold image marks [R: research covered the Statue of Liberty and Golden Gate Bridge, which are safe; it didn't cover skyscrapers, so we don't use them]. **The signs and the road furniture do the "this is America" work.** Later regional variants can use the two cleared US landmarks: the **Golden Gate Bridge** (US West, without its name or the District's logo view) and the **Statue of Liberty** (New York area, drawn from the original statue, never the Las Vegas replica).
- **Far:** a **generic downtown skyline** in the safe box: 9–11 towers, with three signature "invented" shapes so it doesn't look like clip-art: a stepped art-deco crown, a slim glass tower with a slanted top, and a water tower on a squat roof (wooden, conical cap, on legs: very American, and owned by nobody).
- **Mid:** an **overpass** crossing high above the road in the distance, with an **overhead green guide sign gantry** (the hero sign moment; see §3.4).
- **Near:** concrete Jersey barriers, tall single-arm streetlights, and a chain-link fence with one palm *or* one deciduous tree. Pick one, not a mix of coasts.
- **Road:** **right-hand traffic, mirrored.** Yellow left edge line, white lane dashes. That's the US freeway rule: yellow on the left edge, white between lanes.
- **Ambient:** a **yellow school bus** *or* a **yellow taxi** passing on the overpass while parked. Gold sits near our brand gold, so it's on-brand.
- **Light:** golden-hour sun low behind the skyline, with long shadows.

#### P2 and P3 scenes (shorter briefs, detailed when they're scheduled)
- **UK2 English countryside:** hedgerows lining both sides (a dense, dark green band with a scalloped top), a dry-stone wall (a grey band with an irregular stone pattern, only in the near layer), a **village church** with a square tower and a pinnacle at each corner in the safe box, patchwork fields on the far hills (alternating greens with one gold rapeseed field), sheep as white ovals with dark heads, and a **white fingerpost sign** (Ambient: sheep turn their heads).
- **UK3 Scotland** (Edinburgh's castle, Scott Monument and Arthur's Seat are cleared by research; no Historic Environment Scotland or castle logos): layered **highland ridges** in purple-green (heather), a **loch** reflecting the sky, a **single-track road with a "Passing Place" sign** (white diamond, black text: true and very Scottish), **bilingual Gaelic/English signs** in the Highlands (e.g. "Inbhir Nis / Inverness": real, [R] the exact layout), and Edinburgh only as a distant silhouette (the Castle on its rock and the Scott Monument spire) in the P3 "Edinburgh approach" variant. Highland cow at the fence as the Ambient detail.
- **AU2 Outback:** **red earth** ground (`#C2562B` to `#8A3A1E`), spinifex tufts, a straight road to the horizon, a ghost gum (white trunk), a **roadhouse** with a fuel canopy and a corrugated roof, a **yellow diamond kangaroo sign**, a road train passing as a long silhouette (Ambient: **a kangaroo hops across the far plain**; reuse and redraw the `season.js` `KANGAROO` path). No Uluru: research didn't cover it, and the Anangu traditional owners ask that it isn't used commercially without permission [R before ever reconsidering].
- **CA2 Rockies:** jagged peaks with snow caps, a pine forest as layered triangle rows, a turquoise lake, and a **yellow diamond moose sign** (Ambient: an elk at the treeline lifts its head).
- **US2 Desert:** mesas and buttes in layered terracotta, saguaro *or* Joshua trees (choose by state; Arizona is saguaro), a long straight two-lane road, heat shimmer, and a diner sign "EAT" (Ambient: tumbleweed).
- **UK4 market town:** a terraced high street with sash windows, a market cross, bunting, and a zebra crossing with Belisha beacons (amber globes flashing: a perfect ambient).
- **AU3 coastal town:** a surf beach, Norfolk pines, a surf lifesaving tower with red and yellow flags [R: Surf Life Saving Australia marks], and a fish-and-chip shop.
- **CA3 Montreal:** **French-only signs in Quebec** (the STOP sign reads **"ARRÊT"**). Correction to the brief, confirmed by research: Montreal's road signs aren't bilingual. Bilingual English/French signs are in New Brunswick and the French-designated parts of Ontario (Ottawa). A bilingual scene would be an Ottawa variant. Mount Royal with its cross [R], spiral outdoor staircases on triplexes, and a Bixi-style bike (no logo).
- **US3 suburban:** lawns, a mailbox, a picket fence, a four-way stop, and a basketball hoop on a garage.

### 1.4 Recommendation: build 5 first

**Launch with S0 + one scene per country (UK1, AU1, CA1, US1): five scenes.** Every visitor in our four markets gets something that is unmistakably theirs, and nobody gets a half-finished regional variant. Each extra regional scene is then an improvement for some visitors, not a gap for others.

Why these five:
- **London and Sydney each carry one instantly readable silhouette** (a clock tower, a coat-hanger arch), and both are cleared by research to draw freely. These are the "oh, that's here" moments the founder described. **Toronto gets its skyline,** where the CN Tower's needle is unmistakable even when it isn't the focal point.
- **The US gets its localness from signs, road markings and a school bus, not a landmark.** That's safer (trademark) and truer, because most US gig drivers aren't in one iconic city.
- The founder's other examples (the countryside, Scotland and the outback) are **P2, built right after launch**. They need either a Cloudflare region (UK) or are best as a second Australian scene. Saying "next" isn't saying "no": they're the first things in the queue.

---

## 2. Visual style guide (one family, not clip-art)

### 2.1 The style in one line
**Flat, layered, geometric vector with soft atmospheric depth: like a screen-printed travel poster in the brand's greens and gold.** Think of the classic 1930s railway posters, simplified to flat shapes: big calm areas, few colours, one confident silhouette. Not cartoonish, no outlines, no gradients on objects (gradients only on the sky and water), no drop shadows except a single flat shadow shape under near objects.

### 2.2 Palette

**Brand core (every scene):**

| Token | Hex | Use |
|---|---|---|
| `--sc-sky-top` | `#0B7A55` | Sky top (brand green) |
| `--sc-sky-mid` | `#3FBF86` | Sky middle |
| `--sc-sky-low` | `#BFF2D6` | Sky at the horizon (mint) |
| `--sc-far` | `#2E9E73` | Far layer: landmarks and skylines are drawn **in this green family, not in their real colours** |
| `--sc-far-2` | `#5CB98F` | The more distant far layer (mixed 40% toward the sky) |
| `--sc-mid` | `#1F8A5B` | Mid layer |
| `--sc-near` | `#0F6B45` | Near layer: trees, hedges |
| `--sc-shade` | `#0A3D2C` | Trunks, shadows |
| `--sc-road` | `#22332C` | Road surface (as now) |
| `--sc-cream` | `#FBF7EE` | Road lines, highlights, clock faces, lit windows |
| `--sc-gold` | `#FACC15` | Sun, the brand sign accent, lit details |
| `--sc-water` | `#0E6E62` → `#2FA38E` | Water, gradient top to bottom, with cream glints |

**Local accents (small areas only: at most 8% of the picture's area per scene):**

| Scene | Accent | Hex | On |
|---|---|---|---|
| UK1 | London bus red | `#D7262E` | The bus, the phone box, the post box |
| UK3 | Heather | `#8E6BA8` | Far ridges, mixed 50% toward `--sc-far` |
| AU1 | Ferry green-and-gold | `#0B7A55` + `#FACC15` | The ferry (it's our palette already) |
| AU2 | Red earth | `#C2562B` / `#8A3A1E` | **The ground replaces green here: the one exception** |
| CA1 | Maple red, streetcar red | `#D0312D` | The streetcar, the maple leaf on a sign |
| US1 | School-bus yellow | `#F7B500` | The bus (it sits next to the brand gold) |
| All | **Sign colours** | Real standards [R] | Signs use their **real** colours (UK motorway blue `#1D5BAA`-ish, green primary `#00703C`-ish and so on; research to give the exact standard values) |

**The rule that keeps it one family:** *the world is green, the signs and one vehicle are real.* Landmarks are drawn in tones of the brand green, with cream and gold for the light on them. A bus or a sign brings the only local colour. This is what stops Elizabeth Tower turning into a sandy-brown clip-art picture.

### 2.3 Depth layers and parallax

| Layer | Contains | Parallax with "steer" (desktop pointer) | Moves forward with the drive? |
|---|---|---|---|
| Sky | gradient, sun, clouds | 0 | Clouds drift +2 units/s, always |
| Far | landmark, skyline, ridges | ×0.15 of the steer offset | Scales 1.00 → 1.015 over the drive phase, then holds (a feeling of approach) |
| Mid | water, far shore, hills, overpass | ×0.4 | Scales 1.00 → 1.04 |
| Near | roadside rows (trees, posts, railings) | perspective (as now) | Yes: the `ROWS` engine, as now |
| Road | surface, lines, dashes | perspective (as now) | Yes |
| Signs | passing and parked signs | perspective | Yes; the parked sign holds still |
| Frame | pillars, dashboard, trim | 0 | No |

Today only `.rd-hills` shifts (−steer×6). Generalise that to a `data-depth` attribute per layer group and one transform per layer per frame. Don't touch individual shapes.

**Atmospheric perspective:** each step back mixes the colour about 25% toward `--sc-sky-low`. A far landmark is never darker than the mid layer in front of it. This single rule does the most to make it look illustrated rather than assembled.

### 2.4 Light and time of day

- **One light for launch: late afternoon, sun low and to the right** (at roughly x 300–330, y 110–135, just off the landmark, never behind it, so it doesn't backlight the silhouette into a blob). It's warm, it's the brand gold, and it says "end of a shift".
- **Light on objects:** every landmark and building gets **one lit edge**: the right-hand face is a 12–18% lighter tone (a flat shape, not a gradient). The left face uses the base tone. That's the whole lighting model.
- **Don't use the visitor's real local time** for day and night at launch. It's extra complexity, and at night the landmarks disappear. Later (P3): **dark mode = dusk** (the sky goes `#053D2E` → `#0B7A55` → a gold glow at the horizon, cream windows switch on, Elizabeth Tower's clock face glows). That's a cheap, lovely variant because the shapes are all reused.

### 2.5 How detailed landmarks are

**A recognisable silhouette, plus 3–5 signature details. Nothing smaller than 2 CSS px at 390 wide.** At 390 the safe box is only about 75 × 80 CSS px, so detail beyond that turns into noise.

**The silhouette test (pass or fail):** fill the landmark one flat colour and show it 40 px tall to someone who hasn't seen it. If they can't name it, the silhouette is wrong. Add no detail until it passes.

**Reference descriptions (proportions from the real structures, simplified):**

**Elizabeth Tower (London).** Total height H = 72 units (y 74 → 146). Real ratio about 8:1.
- **Shaft:** y 146 → 104 (58% of H). Square, width 9 units. Three vertical recessed panels per face (thin, slightly darker strips, 1 unit wide), with a horizontal band every 10 units.
- **Clock stage:** y 104 → 92. It widens to 11 units (it overhangs about 1 unit each side). **The clock face** is a cream circle, r 4, centred on the stage, with two hands at about 10 past 2 (not a real time, just a pleasant one) in `--sc-shade`, and 4 tiny tick marks at 12, 3, 6 and 9. A thin gold rim around the dial (0.6 stroke).
- **Belfry:** y 92 → 84. Width 9. Three pointed-arch openings in `--sc-shade`, each 1.6 wide, with an arched top.
- **The roof and spire:** y 84 → 74. A steep pyramidal roof (the "lantern" spire): a narrow, tall triangle from width 9 to a point, with **a small pinnacle at each top corner of the belfry** (4 tiny thin triangles, height 3), and a short gold finial on the tip (0.8 wide, 2 tall).
- **Light:** the right face is +15% lighter. The rest of the Palace roofline runs left at y 130–146: a long flat block with an evenly spaced row of thin pinnacle triangles (every 3 units, height 2.5).
- **Don't:** draw a crest, a portcullis, a union flag, or any text.

**Sydney Harbour Bridge.** Span x 228 → 330 (102 units).
- **The arch:** two concentric curves (the upper and lower chords) forming a band 3 units thick at the crown and 5 thick at the ends. The upper crown is at y 114, the ends meet the pylons at y 140. Shape: a parabola. In SVG, use one cubic per half, with control points at about 30% and 70% of the half-span, both at the crown height minus 6.
- **Truss:** between the chords, a zigzag of diagonals (about 14 per half), 0.6 stroke, in the same green. **This zigzag is the signature detail.** Without it, it's just an arch.
- **The deck:** a straight horizontal band at y 136–138, from pylon to pylon and continuing off both ends. Hangers: thin verticals (0.5 stroke) from the arch down to the deck, every 4 units, in the middle 70% of the span.
- **Pylons:** two pairs. Each pylon is a slightly tapering block 7 wide × 16 tall (y 124 → 140), standing just outside the arch ends, with a flat top and one horizontal band near the top. The pair stands side by side (the far one 50% toward the sky). They're lighter than the arch (the real ones are granite): use `--sc-far-2` mixed toward cream.
- **Light:** the right half of the arch +12%. Water glints under the span.
- **Opera House (small and incidental, per research):** 4–5 overlapping sail shells, each an asymmetric pointed curve, in `--sc-far-2` mixed toward cream (**not** bright cream, so it doesn't outshine the bridge), sitting on a low flat podium. At most 14 units wide, its top below the bridge deck. Unaltered, in every season.

**CN Tower (Toronto), as one part of the skyline.** Total height 84 units (y 66 → 150), at x ≈ 300. The same tone as its neighbouring towers; the lower third is overlapped by towers in front.
- **Shaft:** a tapering concrete needle from 5 units wide at the base to 2.5 wide at the main pod. **Three-legged base:** at the bottom 8 units, the shaft splits into three flared legs, with the central one facing us (show two side legs flaring out to 10 units wide at ground).
- **Main pod:** at 62% of the height (y ≈ 117). A wide doughnut shape, 13 wide × 5 tall, with a darker band (the windows) across the middle and a thin cream "ring" line (the restaurant lights).
- **SkyPod:** at 81% (y ≈ 79). A small disc, 4 wide × 2 tall.
- **Antenna:** from y 79 to 62. A thin mast (1.2 wide), tapering to 0.6, with 2 thin horizontal ticks.
- **Light:** the same one-lit-edge rule as every building (a thin, lighter line on the right edge of the shaft). No glow, no extra contrast, no framing: it must not become the focal point.
- **Downtown towers around it:** rectangles of varied width and height, flat tops, a few with a stepped top, cream window dots in a sparse grid on just 3 of them (not all).

**Generic American skyline.** 9–11 towers between x 236 and 320, tallest at y ≈ 82, with three signature shapes (described in US1). Windows as gold and cream dashes on the sunny side only. A water tower on a front roof: a cylinder 5 × 4 on 4 thin legs, with a conical cap.

**Signs** are drawn to their real standards (§3), so they're the most "real" things in the picture. That's intentional: they're where the detail and the readability live.

### 2.6 Trees, people, animals: the parts where clip-art creeps in
- **Trees:** never a circle on a stick (except in S0's far rows, where they're dots). Each scene has **2–3 tree types** built from 3–5 overlapping blobs with one darker shadow blob underneath. The species carries the place (a plane tree, a eucalyptus, a maple, a pine, a palm).
- **Animals:** **side-on silhouette only, one flat colour plus one detail** (a highlight on the back, an eye dot). A kangaroo, a moose, a sheep and a highland cow are all instantly readable side-on. No faces looking at us.
- **People:** none at launch. People are where flat vector art looks cheapest, and the phone is the "person" in this scene.

### 2.7 Seasons (`season.js`) overlay, later
The scene system must expose **season hooks**. Don't bake seasonal art in.
- **Sky:** a tint per season (winter cooler, autumn warmer); the existing `ambient()` falling pieces (snow, leaves, petals) are confined to the sky and far layers of the scene SVG.
- **Trees:** a `palette` per tree type and season (maples go red and orange in autumn; deciduous trees go bare in winter as a trunk plus branch strokes; gums and pines don't change).
- **Landmarks:** a **snow cap layer** for winter (a thin white shape along the top edges) on the generic skylines, hills and Elizabeth Tower only. **Never on the CN Tower or the Opera House:** research's rules say they mustn't be altered.
- **Signs:** seasonal sign swaps reuse `SEASON_PLACES` (festive gifts, Halloween) as a "small plate" under the passing sign. Don't replace the real signs.
- **Hemisphere:** already handled (`southern` for AU). Sydney in December is summer: no snow, and the sun goes higher.
- The seasons stay off (`SEASONS_LIVE = false`) until each scene's season art passes the same review as the scene.

---

## 3. Road signs

**The rules for every sign:**
1. **Real format, real colours, real typeface style** for the country, **simplified and decorative** (research §4). UK sign designs are Crown copyright and free to reproduce when they're accurate and not misleading: add "Road sign designs: Crown copyright" to the site credits. US MUTCD designs are public domain. For AU and CA, draw generic signs: not the Ontario crown shield or the Trans-Canada maple-leaf marker exactly. **Typeface:** UK *Transport* (free versions exist at roads.org.uk; check the licence [R]); US/CA/AU a *Highway Gothic*-style face (the open-licence *Overpass* is based on it). The few sign words are converted to **SVG paths at build time**: no web font, so the CSP stays clean.
2. **Everything written on a sign is true.** Rates come from the calculator's `RATES` table in `site.js` (one source, so the signs and calculator never disagree). Anything about tax needs a research source.
3. **Readable:** the text must be at least **9 CSS px cap height at 390 wide** at the moment it's meant to be read: that's the parked sign, or a passing sign at its nearest. At most **4 words a line, 2 lines.**
4. **On-brand and witty, never cute.** Never "tracking", never "we keep" or "we see", never a claim we can't prove, and no "money back".
5. **Language.** Research treats sign text as part of the drawing (the SVG is `aria-hidden`; place names aren't translated). But **our own lines on signs ("Every work mile adds up", "Drive logged") are marketing copy, and the founder's rule is every visible string in all 10 languages.** So: place names, units and real sign words (STOP, ARRÊT, Passing Place) stay local and untranslated; our lines go through the translator and follow the page's language. Keep them to 2–4 words so they fit a sign in every language (check Polish, Bengali and Hindi widths in review). The scene's `role="img"` label describes the signs in words for screen readers, translated like the rest.
6. **Regulatory and warning signs (STOP, speed limits, the kangaroo and moose) are drawn true and are never jokes.** Our words go only on guide and information signs. Research: UK sign images must not be shown in a misleading context, so a speed-limit roundel with "45p" in it (an earlier idea) is out. **No real speed limit on a real named road.**

**How signs work in the loop:**
- **One passing sign per loop**, rotating through the country's set loop by loop (`loopIndex = floor(elapsed / 9.6)`), so a visitor who keeps watching sees a new one each time.
- **One parked sign:** the hero sign, standing beside where the car stops, on the **visible** side of the road. **For UK and AU (left kerb), the left verge is behind the phone, so put the parked sign across the road on the right verge, or as an overhead gantry.** For US and CA (right kerb), it's on the near side, right where you'd expect.
- **A distance sign counting the trip:** the clip's trip is 2.2 miles. The passing distance sign reads "Home 2¼" (UK) as you drive, and then the parked sign is the arrival. In km countries, "Home 3.5" km (2.2 mi ≈ 3.5 km) until the regional clip exists [R: match the regional clip's distance].

### 3.1 UK (Transport typeface, the UK sign colours) [R: exact sign specs]
| Sign | Type and colours | Text | When |
|---|---|---|---|
| **Primary route direction** | Green background, white text, **yellow** route number, white border | "**Home** 2¼" with an ahead arrow; second line "**Every work mile** ↑" | Passing (loop 1) |
| **The tax road sign** | Green primary | "**Tax return** ↑ **31 Jan**" [R: confirm Self Assessment online deadline] | Passing (loop 2) |
| **The rate sign** | Green primary | "**45p a work mile** ↑"; small second line "**first 10,000**" | Passing (loop 3). The HMRC rate is 45p for the first 10,000 business miles in a tax year, then 25p: take it from the calculator's `RATES` so the two never disagree [R: source line in `website-claims-check.md`]. |
| **Brown tourist sign** (London) | Brown, white text and symbol | "**Westminster**" with the white pictogram for a tourist attraction | Passing |
| **Parked: the parking sign** | Blue square, white "P" | "**P**"; plate: "**Drive logged**" | Parked (right verge) |
| UK2 fingerpost | White, black text, arrow-shaped arms | "**Home** 2¼" / "**Village** ½" | Passing |
| UK3 Passing Place | White diamond, black text | "**Passing Place**" (the real sign, no joke) | Passing |
| UK3 bilingual | Green primary, Gaelic in **yellow italic** above English [R: exact styling] | "**Inbhir Nis / Inverness** 12" | Passing |

### 3.2 Australia (AS 1742 style) [R]
| Sign | Type and colours | Text | When |
|---|---|---|---|
| **Guide sign** | Green, white text, a white border | "**Home** 3.5 km" / "**Every work km adds up**" | Passing |
| **The rate sign** | Green, white text | "**91c a km** ↑ up to 5,000 km" — from the calculator's ATO rate, which `site.js` has as 91c for 2026–27 [R: confirm] | Passing |
| **Tourist sign** | Brown, white text | "**Harbour Bridge**" | Passing (AU1) |
| **Parked** | Blue "P" | "**P**" / plate "**Drive logged**" | Parked |
| AU2 kangaroo | Yellow diamond, black kangaroo (the real warning sign, no joke) | Plate: "**next 12 km**" | Passing |
| AU2 roadhouse | Blue service sign with fuel and food symbols | "**Roadhouse 2 km**" | Passing |

### 3.3 Canada (MUTCDC) [R]
| Sign | Type and colours | Text | When |
|---|---|---|---|
| **Guide sign** | Green, white text | "**Home** 3.5 km" / "**Every work km adds up**" | Passing |
| **Rate sign** | Green, white | The CRA rate from the calculator, "**73c a km** ↑ first 5,000 km" (`site.js` `RATES`: 0.73, then 0.67; same source as the calculator) | Passing |
| **Parked** | Blue "P" (or Toronto's green "P" [R]) | "**P**" / plate "**Drive logged**" | Parked |
| CA2 moose | Yellow diamond, black moose (real, no joke) | Plate: "**Night danger**" only if it's the real wording [R] | Passing |
| CA3 Quebec | **French only** | "**ARRÊT**" (a real stop, no joke); guide: "**Maison** 3,5 km" (the French decimal comma) | Passing |

### 3.4 United States (MUTCD) [R]
| Sign | Type and colours | Text | When |
|---|---|---|---|
| **Overhead gantry** (the hero sign) | Green, white Highway Gothic, an exit tab on top | Tab: "**EXIT 22**"; main: "**Home**" ↗ "**2 mi**" | Passing under it (the big moment) |
| **Rate sign** | Green, white | The IRS rate from the calculator "**76¢ a mile**" (`site.js` `RATES`: 0.76; same source as the calculator) | Passing |
| **Parked** | White rectangle, green "P" (US parking style) | "**P**" / "**Drive logged**" | Parked |
| **Interstate shield: simplified only** (research: AASHTO Reg. 835,635). If used at all, a plain red-cap, blue-body shield with **just a number** and no word "INTERSTATE", decorative, never near our logo. Simpler still: a white US-route shield. | | | |
| US2 | Yellow diamond "**Gusty winds**" plate (real) and a diner "**EAT**" sign | | Passing |

### 3.5 The standard scene's brand signs (S0)
These aren't any country's style, so they can be fully ours: **rounded green rectangles (`#0B7A55`), cream text, a gold top rule and a small sprout mark.**
- "**Every work mile adds up** ↑" (passing, loop 1)
- "**Logged by itself** ↑" (loop 2): true, and it's the core promise in four words
- "**Stays on your phone**" (loop 3): true, says privacy without saying "tracking"
- Parked: the existing round white badges (fuel, shop, café: the app's own signs from `season.js` `GLYPHS`), reused so the intro and the hero match.

---

## 4. Motion

**The loop is 9.6 s, driven by the clip's clock** (`video.currentTime % 9.6`), as now. **Everything time-based reads from that clock,** so the clip and the world never drift apart, and the pause button pauses everything.

| Phase (clip time) | Road | Signs | Ambient detail |
|---|---|---|---|
| 0–1.8 s cruising | Dashes and roadside rows stream as now | The loop's passing sign comes from the horizon and goes by on the right | Idle |
| 1.8–2.7 s slowing, pulling in | Slows to a stop | The parked sign slides in and settles, readable | Starts |
| 2.7–9.0 s parked | Still | The parked sign holds | **Plays (the one thing alive outside the phone)** |
| 9.0–9.6 s setting off | Starts moving | The parked sign leaves | Finishes its pass out of frame |

- **One ambient detail per scene, crossing once per loop during the parked phase,** finishing off-frame by 9.6 s so the loop is seamless: London's bus (right to left along the Embankment, 4.5 s), Sydney's ferry (left to right across the harbour, 5.5 s), Toronto's streetcar (4 s), the US school bus on the overpass (3.5 s), the outback's kangaroo (3 hops across the far plain, 3 s), birds in S0. An **alternate** detail every other loop (a cockatoo, a goose skein, pigeons lifting) keeps it fresh for anyone who stays.
- **Always moving, very slowly:** clouds (+2 units/s) and water glints (a gentle opacity shimmer, 3 s). Nothing else idles.
- **Parallax:** the steer offset per layer (§2.3) on desktop with a fine pointer only, as now. On phones, nothing tilts (no device motion: it needs a permission and isn't worth it).
- **Easing:** everything uses the same `smooth()` easing the road uses. No bounces except on the parked sign settling (one small overshoot, 0.2 s), echoing the intro's sign pop.
- **Performance budget:** 60 fps on an iPhone 12-class phone. At most **one transform per layer per frame**, plus the existing road rows. The ambient detail is one `<g>` with a transform. **SVG node budget: ≤ 600 per scene.** **Weight: ≤ 35 KB gzipped per scene file,** loaded only for the chosen scene. The standard scene stays inline in `index.html` (no-JS fallback).
- **Reduce Motion:** a **still of each scene, parked**, with the parked sign readable and the ambient detail placed at its best pose in frame (the bus beside Elizabeth Tower; the ferry under the bridge). No parallax, no clouds drifting, no glints. Same as today's rule: the saved-state poster on the phone.
- **Changing scene with the flag chips:** a cross-fade, 300 ms. With Reduce Motion, an instant swap.

---

## 5. Quality bar and process

### 5.1 How coding builds it
1. **Engine first, with the standard scene, before any landmark.** The scene registry, layers with `data-depth`, the sign component (one function: `sign(spec)` draws any country's sign from a spec of colour, shape, lines and arrow), left and right traffic, the loop index, `?scene=`, the chips. **Marketing reviews S0 in the engine before anything local starts.**
2. **One scene at a time.** No scene starts until the previous one has passed review.
3. **Each scene is built in this order, with a screenshot checkpoint after each step:** (a) the landmark silhouette alone, flat colour, at 40 px tall: **the silhouette test**; (b) the layers blocked in, flat colours, no detail; (c) details and light; (d) signs; (e) motion; (f) Reduce Motion still.
4. **Screenshots for every review:** 390 × 844 and 1440 × 900, light and dark, at clip times 0.6 s, 2.2 s, 5.0 s and 9.3 s, the Reduce Motion still, and **a family strip:** the new scene side by side with every finished scene at the same size. If it doesn't sit with the others, it isn't done.
5. **Marketing review against this guide.** Pass or fail on: the silhouette test; the safe box (landmark visible at both sizes, not behind the phone); palette (the world in brand greens, local colour ≤ 8%); atmospheric perspective; sign text readable and true; nothing smaller than 2 px; no logos or crests; it "feels like a poster, not clip-art"; and zing. Then **qa** on performance, loop seams, Reduce Motion, no JS and keyboard. Then the founder sees screenshots.
6. **Expect 2 rounds of iteration per landmark scene.** Plan for it, don't treat it as failure.

### 5.2 Honest view: can hand-coded SVG reach this bar?

**Partly.** By element:

| Element | Coded SVG by the coding agent | Why |
|---|---|---|
| Road, lines, perspective, parallax, motion | **Yes, well** | Geometry and timing; it's already good |
| Road signs | **Yes, very well** | They're specified standards: exact shapes, colours and type. Code is the best tool here. |
| Harbour Bridge, CN Tower, generic skylines, overpasses | **Yes, with care** | Geometric structures; the reference descriptions above are enough |
| Elizabeth Tower | **Borderline** | Gothic detail at tiny sizes needs an illustrator's judgement about what to leave out. Achievable, with likely 2–3 rounds |
| Trees, hills, water, clouds | **Borderline** | Coded organic shapes tend to look mechanical (identical blobs, perfect curves). It needs deliberate irregularity |
| Animals, vehicles with character (a kangaroo, a moose, a bus) | **Risky** | This is where coded art looks most like clip-art. The current seasons art is switched off for this exact reason. |

**Recommendation: hybrid, and decide after a quality gate.**
1. **Coding builds the engine, the road, all the signs and S0 now.** Those are code's strengths, and they're needed whatever happens.
2. **Coding draws London (UK1) as the test** (1–2 sessions). It's the hardest landmark and the founder's own example. If it passes the marketing review at round 2, carry on in-house for Sydney, Toronto and the US.
3. **If London doesn't pass at round 2, or the vehicles and animals don't, commission an illustrator for the far and mid layers and the ambient characters.** They deliver **layered SVGs drawn to this guide** (the palette, the safe box, the layer split, flat shapes, named groups). Coding then integrates, animates and adds the signs. **Ask the founder to approve this spend before anything is bought** (it's money, so it's the founder's call).

**The alternatives, compared** [R: check current prices before quoting to the founder]:

| Option | Rough cost | Rough time | Quality | Notes |
|---|---|---|---|---|
| **Commissioned illustrator** (freelance, flat vector, travel-poster style) | **£150–£400 per scene** mid-market; **£500–£900** for an experienced poster illustrator. **The launch 4 local scenes: about £800–£3,000.** | 2–3 weeks including 2 revision rounds | **Best, and one coherent hand** | Contract must give us full commercial rights, editable SVG source and layered files. **Recommended if the in-house gate fails.** |
| **Licensed vector pack** (e.g. a stock travel or landmark set) | £10–£50 a month subscription, or £10–£60 per asset | Days | **Generic.** Landmarks look like stock, and the styles won't match each other | Fine for parts (a bus, animal silhouettes) restyled to our palette; not for the hero landmarks. Check the licence allows web use and modification. |
| **AI-generated, then cleaned** (a vector-output generator, cleaned and simplified by hand) | £10–£30 a month in tools, plus 1 extra session per scene to clean up | Fast to draft, slow to clean | **Variable.** Good for organic parts, unreliable for the exact structure of a landmark | The copyright status of AI output is weak (it may not be protectable), and generators sometimes copy other people's art. **Use it for exploration and moodboards only, and for organic fills, not as the final landmark art.** |

My view as art director: **the bridge and the tower can be coded. Elizabeth Tower and the characters probably want an illustrator's hand.** Getting quotes in parallel with the engine work costs nothing, and means no time is lost if the London gate fails.

---

## 6. Build order and effort

One "session" is one focused coding run plus its marketing review round.

| Step | What | Sessions | Waits on |
|---|---|---|---|
| 0 | Research note (detection, privacy, trademarks, sign standards) | **Done** (`local-scenes-research.md`) | Open: the UK `cf.region` hand-check; re-check the Opera House and CN Tower pages before launch; the Transport font licence; rate sources for the signs |
| 1 | **Engine:** scene registry and lazy loading, depth layers, parallax per layer, `side: left/right` (road mirroring), sign component, loop index, ambient slot, `?scene=`, scenery chips (including Standard), Reduce Motion stills, `/api/scene` Pages Function (scene key only, `no-store`, no logs) with the time-zone cross-check and fallback; the privacy-policy paragraph (research §1.5) to the translator | **2–2.5** | — |
| 2 | **S0 standard polished** (clouds, 3 hill bands, better trees, brand signs, birds) | **1** | 1 |
| 3 | **UK1 London** (the quality gate) | **2–3** | 1 |
| — | *Gate: in-house or illustrator? Founder decides spend if needed* | — | 3 |
| 4 | **AU1 Sydney** | **2** | gate; the Opera House re-check |
| 5 | **CA1 Toronto** | **2** | gate; the CN Tower re-check |
| 6 | **US1 American city** | **1.5–2** | gate |
| 7 | Sign strings to the translator (10 languages); qa pass (performance, seams, a11y, no JS); founder screenshots | **1** | 2–6 |
| | **Launch set total** | **≈ 12–13.5 sessions** | |
| 8 | Regional clips for AU, CA, US (the phone in $ and km) | **1–2** (app-store or coding) | Separate, but it matters for the effect |
| 9 | **P2:** UK2 countryside, UK3 Scotland, AU2 outback, CA2 Rockies, US2 desert | **≈ 1.5–2 each, ≈ 8–10** | The UK `cf.region` hand-check, for UK2/UK3 |
| 10 | **P3:** UK4 town, AU3 coast, CA3 Montreal, US3 suburban, dark-mode dusk | **≈ 6–8** | |

**With an illustrator,** coding drops to about **1 session per scene** (integrate, animate, sign), plus the 3 engine and standard sessions: **about 8 sessions for the launch set**, plus 2–3 weeks of the illustrator's time running alongside.

**Usage:** this is a big piece of work by the founder's own measure. The engine plus the standard scene (steps 1–2, 3 sessions) is worth doing on its own, because it improves the hero for everyone. Then **London is the decision point** before committing the rest.
