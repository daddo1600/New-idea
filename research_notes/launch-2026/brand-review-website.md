# Brand and zing review: milesprout.app home page (`website-preview`)

Marketing sign-off review, 3 October 2026. Branch `website-preview` at `d58ccb1` ("calculator with flags to tap and an amount that counts").
Looked at with Playwright at 390×844 (iPhone) and 1440×900, intro skipped, light mode. The browser's locale was en-US, so the hero line and calculator show the US figures ($3,648 at the IRS's rate); UK visitors get £2,640.

Screenshots: `website/docs/brand-m-*.png` (phone) and `website/docs/brand-d-*.png` (desktop): `hero`, `hero-scene-later`, `deck-1` to `deck-8`, `calc`, `signup`, `freepro`, `countries`, `langs`, `compare`, `cta`, `footer`.

**Verdict: not signed off.** Three sections are below 3 for zing (feature panels, languages, footer), and the screens deck has wording breaches baked into the app screenshots (see "Blockers").

---

## Blockers (wording rules, before any publish)

These break the founder's rules and are visible on the page now.

| Where | What it says | Rule broken | Fix |
|---|---|---|---|
| Deck card 1, `assets/img/screens/home.webp` | Status pill "**Tracking on**" | Never "tracking" | Re-shoot from a build whose pill reads "Counting your miles" (the hero video already shows this). If the app still says "Tracking on", that's an app string to fix too. |
| Deck card 6, `assets/img/screens/privacy.webp` | Nav title "**Automatic tracking**", button "**Turn on automatic tracking**" | Never "tracking" | Re-shoot with "Automatic logging" / "Turn on automatic logging". |
| Deck card 6, same image | "stored encrypted on your phone, **not on our servers**" | Never imply MileSprout has servers holding data | App copy: "Your trips are stored encrypted on your phone. They're never sent to us." Re-shoot. |
| `<title>` and `<meta name="description">` | "free automatic mileage **tracker**", "automatic mileage **tracking**" | Never "tracking" | Founder decision: these are SEO keywords people search for. Recommended: `MileSprout: the free mileage log that fills itself in` / description "Free, automatic mileage logging for couriers, delivery riders and self-employed drivers…". If the founder wants the keyword, it needs a written exception. |
| Compare footnote 2 | "automatic mileage and time tracking… Manual tracking is free" | Never "tracking" (it's paraphrasing Gridwise) | "Gridwise's help centre lists automatic mileage logging as a Plus feature. Logging by hand is free." |
| Feature panel 6, bullet 2 | "no trackers" | Borderline | "No account to make. No ads, no analytics." |

The labels "Data used to track you" in the comparison table quote Apple's privacy-label wording, in quote marks in note 3. Keep that.

---

## Scores (page order)

Brand fit = colours, sprout-and-road motif, warm money-first voice, privacy. Zing = motion, counting, celebration, nothing default-looking. 1 to 5.

| # | Section | Brand | Zing | What makes it boring or off-brand (one line) |
|---|---|---|---|---|
| 1 | Hero and scene | 5 | 4 | Strong: green gradient, gold, a living road scene; but the gold money figure (£2,640) just sits there, while the calculator below counts. |
| 2 | Screens deck (fanned phones) | 3 | 4 | The fan, fly-off and dots are lively, but two of the eight screenshots say "tracking" and "our servers" (blockers above). |
| 3 | Deck feature panels (all 8) | 2 | 1 | A grey "Pro"/"Free" pill, a grey paragraph, default black bullets and a big empty gap under short panels: it looks like a default CMS text block, with no money, colour or motion. |
| 4 | Calculator | 5 | 4 | Flag chips, a gold slider and a rolling gold amount with a shimmer: on brand; Australia orphans onto its own row on a phone, and the US chip's label sits a pixel high. |
| 5 | Sign-up (early access) | 4 | 3 | Gold button, sparkles and gold ticks work; but the 9-line terms paragraph dominates the phone view and the success state is only text. |
| 6 | Free & Pro | 4 | 3 | The Pro card is great (gradient, gold ticks, sparkle badge); the Free card is a plain white list with black ticks that floats mid-height on desktop. |
| 7 | Countries | 3 | 2 | Four tall white text cards on a phone (2,000px of scroll); the flags are nice but there's no rate, no money and nothing to tap. |
| 8 | Languages | 3 | 2 | Ten grey static pills that look tappable but do nothing. |
| 9 | Comparison | 4 | 2 | The mint MileSprout column is good; the rest is a plain grey-text table with no ticks or crosses, and the floating "Get early access" pill covers the "Paid plan" cells. |
| 10 | Closing CTA | 3 | 2 | Pale mint on off-white, plain heading and paragraph; it doesn't feel like the finish line: no sprout, no money, no green. |
| 11 | Footer | 2 | 1 | No logo, white background, a row of plain underlined links; it could be any site. |

---

## Redesigns for every section under 4

All of these: no new libraries; inline SVG and CSS only; reuse the existing tokens (`--brand #0B7A55`, `--mint`, `--gold`, `--road`), the existing `.sparkles`, the calculator's `roll()` count-up (520ms ease-out) and `still()` (Reduce Motion). Every animation gets a `prefers-reduced-motion: reduce` path that shows the final state with no movement. Text contrast is 4.5:1 or better in light and dark. Keep the copy rules: no "tracking", no "money back", "worth … at the tax office's rate" (honest value wording, "a guide, not tax advice" kept where amounts appear).

### 3. Deck feature panels (brand 2, zing 1): full spec

**Why it's empty:** `.feats` stacks all 8 panels in one grid cell (`grid-area: 1/1`), so its height is the tallest panel's (Privacy: 4 bullets plus a link). Every shorter panel, like Reports with 3 short bullets, leaves a gap of 200 to 300px under it on a phone.

**New panel anatomy** (same `<article class="feat">`, same `h3` ids, so the aria-live announcement keeps working):

```
┌──────────────────────────────────────────┐
│ [🌱 PRO] gold badge         (or FREE mint)│
│ Your mileage log, ready for HMRC          │  h3
│ ┌──────────────┐  ┌────────────────────┐  │
│ │  1 PDF       │  │  mini PDF preview  │  │  stat + micro-visual
│ │ every trip,  │  │  (Reports only)    │  │
│ │ ready to file│  └────────────────────┘  │
│ └──────────────┘                          │
│ [✓] Itemised PDF with totals and trips    │  tick tiles (max 3)
│ [✓] CSV, Xero, QuickBooks, FreeAgent      │
│ [✓] Send it straight to your accountant   │
└──────────────────────────────────────────┘
```

1. **Card, not loose text.** `.feat` becomes a card: `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: var(--radius)`, `padding: 22px 22px 18px`, `box-shadow: var(--shadow)`, and a 4px road-green accent bar on the left: `border-left: 4px solid; border-image: linear-gradient(#0E9F6E, #053D2E) 1` (or a `::before` bar if border-image clashes with the radius). Dark mode uses the existing `--surface`/`--border` tokens.
2. **Tags become brand badges.**
   - `Pro`: gold pill, same style as `.pro-badge` in the plans (`background: var(--gold); color: #713F12`; uppercase, 800 weight, letter-spacing .08em), with a 14px inline sprout-and-road SVG (the logo path, simplified, `#064E3B`) before the word, wrapped in `.pro-badge-wrap` with the existing `.sparkles`.
   - `Free`: mint pill, `background: var(--mint); color: #065F46`, with a small tick.
   - `Money tab`: mint pill with a "£" glyph (swap to "$" via `COUNTRY` like the money line). Text: "Free, more with Pro".
   - `Perks`: mint pill with a small gift SVG.
   - Dark mode: Free/Perks pills `background: rgba(110,231,183,.14); color: #6EE7B7`.
3. **One big stat per screen.** `<p class="feat-stat"><b data-count="1754.40">£1,754.40</b><span>label</span></p>`. The number is 2.25rem/800, `color: var(--brand)` (5.3:1 on white; `#6EE7B7` in dark). The label is .9rem, `var(--text)`. When the panel becomes `.on`, the number counts up from 0 using the same easing as the calculator (520ms); the label doesn't move. Reduce Motion: it shows the final value. Stats are honest and match what's on the card:

   | # | Stat | Label |
   |---|---|---|
   | 1 Home | £1,754.40 | Example: found this tax year, shown on Home |
   | 2 Drives | Free | Automatic logging, no monthly limit |
   | 3 Trip | 1 tap | Work or Personal. Only Work miles count. |
   | 4 Money | 55p | a mile at HMRC's rate, for your first 10,000 work miles. Use `RATES[COUNTRY]` so US shows "76¢ a mile at the IRS's rate", and so on. |
   | 5 Reports | 1 PDF | Every trip and your totals, ready to file |
   | 6 Privacy | 0 | trips ever sent to us |
   | 7 Perks | 10p off | a litre of fuel (demo offer, Perks is in early testing) |
   | 8 Your code | ~30 min | then the code expires. No name, no trips, no location in it. |

4. **Tick tiles instead of bullets.** `ul` gets `list-style: none; padding: 0; display: grid; gap: 8px`. Each `li` is `display: grid; grid-template-columns: 28px 1fr; gap: 10px; align-items: start`, with `::before` a 28×28 rounded square (radius 8px), `background: var(--mint)`, and a green tick drawn with the same border trick as `.plan li::before`, in `#0B7A55`. On Pro panels the tile is `#FEF9C3` with a `#A16207` tick, to echo the gold badge. Max **3 tiles per panel** (copy below), each one line on desktop and at most two on a phone.
5. **Micro-visuals for 3 panels** (pure CSS/inline SVG, `aria-hidden="true"`, about 120×150px, beside the stat on desktop and to its right on a phone when there's room (≥360px), otherwise hidden):
   - **Reports: mini PDF preview.** A white page with a folded corner (`clip-path`), a green header strip reading "Mileage log 2026/27", 4 grey line bars, a totals row "£2,640.00" in green, and a gold sprout seal (the logo's gold dot and leaves) in the bottom corner. On `.on` it slides up 8px and the seal pops (scale .8→1, 300ms). Reduce Motion: static.
   - **Privacy: padlock on a phone outline**, mint, with a dashed road line that stops at the phone (data goes nowhere).
   - **Your code: mini receipt** with a zig-zag bottom edge (CSS `mask` or `clip-path`), a 5×5 SVG QR-ish grid and a countdown "29:59" that ticks once a second while the panel is on. Reduce Motion: static "30:00".
6. **Get rid of the empty space.**
   - Trim every panel to: badge, h3, stat, at most 3 tiles, optional single link. The tallest and shortest panels then differ by about one tile.
   - Phone (<900px): keep the stacked grid, but give `.feats` `align-items: start` and put the panel **directly under the deck nav with 16px gap** (now ~40px). Animate the container's height between panels (`transition: height .25s ease`, set from JS as `feats.style.height = active.offsetHeight + 'px'`), so short panels pull the next section up instead of leaving a hole. Reduce Motion: no height transition.
   - Desktop (≥900px): `.feats` vertically centred against the phone, as now. The card treatment fills the column, so it stops reading as a floating paragraph.
7. **Content animates in sync with the card.** When `layout()` toggles `.on`: the badge and h3 fade/slide in (existing 300ms), then the stat counts up, then tiles stagger in (each `transition-delay: calc(var(--i) * 60ms)`, translateY 8px→0, opacity 0→1), and the micro-visual pops. Direction-aware: when swiping forward, content comes from the right 12px; when going back, from the left (set `data-dir` on `.feats` in `next()`/`prev()`). Reduce Motion: plain crossfade, as now.
8. **Small celebration on the last card.** When a visitor reaches 8/8, the dots row's active pill fills gold and the hint changes to "You've seen it all. Get early access ↓" (link to `#early-access`). Reduce Motion: text change only.
9. **Accessibility.** Badges keep real text ("Pro", "Free"). The stat is real text, and the count-up only changes `textContent` with the final value set at the end; the deck's `aria-live` keeps announcing the h3 only, not the counting. Micro-visuals are `aria-hidden`. Keyboard focus order is unchanged. Without JS (the `<noscript>` rules) all 8 cards are listed, so the cards need `margin-bottom` there.

**Panel copy (replaces the paragraphs and bullets; the intro paragraph is dropped, because the stat label does its job):**

1. **Free · Your shift at a glance.** Stat: £1,754.40 (Example: found this tax year, shown on Home). Tiles: "Swipe to start or end a shift" · "Drives to sort, with what each is worth as Work" · "Your total for the tax year, always up to date"
2. **Free · Drives log themselves.** Stat: Free (Automatic logging, no monthly limit). Tiles: "Saved when you park. Nothing to start or stop" · "GPS only runs while you drive, easy on your battery" · "Time and miles on your Lock Screen while on shift"
3. **Free · Work or Personal? One tap.** Stat: 1 tap (Work or Personal. Only Work miles count). Tiles: "Every route on a map" · "Learns your usual routes and sorts many for you" · "Client privacy mode keeps only the area, never the street"
4. **Free, more with Pro · Know what to put aside for tax.** Stat: 55p (a mile at HMRC's rate, first 10,000 work miles; localised). Tiles: "What your work miles are worth this tax year, free" · "Pro: quarterly figures for Making Tax Digital, with due dates" · "Pro: what to put aside each week"
5. **Pro · Your mileage log, ready for HMRC.** Stat: 1 PDF (every trip and your totals, ready to file). Micro-visual: mini PDF. Tiles: "Itemised PDF report with every trip" · "Spreadsheet, CSV, Xero, QuickBooks, FreeAgent" · "Send it straight to your accountant". (US: "ready for the IRS"; drive "HMRC" from `RATES[COUNTRY]` like the calculator.)
6. **Free · Your trips stay on your phone.** Stat: 0 (trips ever sent to us). Micro-visual: padlock. Tiles: "Stored encrypted on your iPhone" · "No account, no ads, no analytics" · "Backups go to your own iCloud, encrypted first". Link: "Read the privacy policy".
7. **Perks · Deals for the places you stop.** Stat: 10p off (a litre of fuel: a demo offer while Perks is in testing). Tiles: "Fuel, a coffee between drops, tyres" · "Claim at the till; the code lasts about 30 minutes" · "Deals only. They never unlock anything in MileSprout"
8. **Perks · A code with nothing about you in it.** Stat: ~30 min (then it expires). Micro-visual: mini receipt. Tiles: "Made on your phone, at random" · "Works once. No name, trips or location" · "Claimed codes stay on your phone". Link: "Run a business drivers stop at? Become a partner".

Every visible string goes into all 10 languages if the website is localised later; it's English-only today.

### 5. Sign-up (brand 4, zing 3)
- Collapse the terms: keep the bold line visible ("Doesn't renew: after 3 months Pro simply stops, and you're never charged unless you choose to subscribe."), and put the rest in a `<details>` labelled "Full terms" (the `#offer-terms` anchor goes on the `<details>`, and the links that point to it open it from JS). The phone view gets about 200px shorter.
- Gold "3 months of Pro free" becomes a gold badge with the sprout, like the Pro badge.
- Success state: the sprout logo grows (stem draws via `stroke-dashoffset`, leaves scale in, gold dot pops), the sparkles burst once, and the text reads "You're on the list. We'll email you once at launch with your code for 3 months of Pro free." Reduce Motion: static sprout and text.

### 6. Free & Pro (brand 4, zing 3)
- Free card: `align-self: stretch` on desktop so the two cards are the same height; mint 4px top border; ticks in `#0B7A55` inside mint tile circles (like the panel tiles); add a gold line at the bottom: "Free, for good: no monthly limit, no card."
- Add a money line under the heading: "Your log is free. Pro turns it into the report your tax office wants." (Keep it honest: no "pays for itself".)

### 7. Countries (brand 3, zing 2)
- Turn the cards into **tappable flag tiles** in a 2×2 grid on phones (not 4 tall cards): flag, country name, and a big rate chip, e.g. **55p a mile** (UK), **76¢ a mile** (US), **73¢ a km** (CA, allowance rate), **91c a km** (AU). Take the numbers from `RATES` in `site.js` so they always match the calculator. The descriptive line goes underneath in .9rem.
- Tapping a tile (a `<button>`) selects that country in the calculator, scrolls to `#calc` and the amount rolls. Visitor's own country (from `COUNTRY`) gets a gold ring and "You're here" mini label.
- Heading: "Your country's rate, built in". Intro unchanged.

### 8. Languages (brand 3, zing 2)
- Make the pills `<button>`s. Tapping one swaps a large line above them to that language's version of "Every work mile adds up." in a crossfade (strings from the app's own translations in `milemint`, so they're the reviewed ones; don't invent them), and sets `lang` on that line. The selected pill turns green with white text; the default follows the browser language.
- Auto-play: while the section is in view, cycle through the 10 every 2.5s until the visitor taps one. Reduce Motion: no auto-cycle.
- Section background: a mint-to-off-white gradient with the faint leaf mark (as the hero) so it isn't grey.

### 9. Comparison (brand 4, zing 2)
- Add a green tick tile before every MileSprout answer, and a muted grey cross or amber "Limited" chip for the others (text stays, the icon is `aria-hidden`).
- MileSprout header cell: the small sprout logo above the name, gold underline.
- Row reveal: rows slide in 40ms apart when the table enters the viewport (once). Reduce Motion: off.
- Hide the floating "Get early access" pill while `.compare-scroll` is on screen (IntersectionObserver), because it covers the "Paid plan" row on phones.

### 10. Closing CTA (brand 3, zing 2)
- Background: the hero gradient (`#0E9F6E → #053D2E`) with the road from the logo as a dashed gold line (`stroke-dasharray`) curving up through the section to a large sprout on the right, drawn as you scroll in (once). Reduce Motion: drawn.
- Copy: h2 "Every work mile adds up. Start counting from day one." Sub: "Join the list and we'll email you a code for 3 months of Pro free when MileSprout is in the App Store. One email, never shared." Keep the terms link.
- A counting line above the button: "That's about **£2,640** a year at HMRC's rate" (the visitor's last calculator value if they used it, else the default; it counts up when visible).
- Gold button with `.sparkles`; tester link in mint.

### 11. Footer (brand 2, zing 1)
- Dark road-green background (`#053D2E`), the full sprout logo plus wordmark (mint "Mile", white "Sprout" for contrast), the tagline "Every work mile adds up.", links in `#D1FAE5` with no underline until hover/focus (focus ring stays), and a thin dashed road line across the top edge (the logo's centre-line dashes, gold).
- Add one privacy line: "Your trips stay on your phone. We never see them."

### Small fixes (sections that scored 4+)
- Hero: count the money line up from £0 to £2,640 once when the page settles (reuse `roll()`, 900ms), then a single gold shimmer, the same as the calculator's milestone. Reduce Motion: static.
- Hero on a phone: Pause/Replay are large outlined pills sitting on the road; make them 36px icon buttons (pause/replay glyphs, `aria-label` kept) in the corner.
- Hero for US/CA/AU visitors: the money line switches currency but the scene's phone shows £; fine for now, but note it.
- Calculator: on a phone, make the four flag chips a 2×2 grid so Australia doesn't sit alone; align the US chip label baseline.

---

## Top 5: biggest lift for the least work

1. **Feature panels redesign** (cards, gold/mint badges, stat callout with count-up, tick tiles, max 3 per panel, height animation on phones). This is what the founder called boring, and it shows 8 times. CSS plus markup, and about 40 lines of JS reusing `roll()`. About half a day. The mini PDF can follow as 1b.
2. **Fix the wording blockers**: re-shoot `home.webp` and `privacy.webp` without "tracking"/"our servers", fix `<title>`/meta and compare note 2. Small, and required before anything goes live.
3. **Hero money line counts up** to £2,640 with one gold shimmer. About 10 lines; the code already exists in the calculator. Biggest "alive" moment for the least work.
4. **Closing CTA and footer brand pass**: green gradient, gold dashed road, sprout, counting money line, dark footer with the logo. Pure CSS/SVG and copy, about 2 hours; it makes the page end on brand instead of fading out.
5. **Country tiles with rate chips that set the calculator**: a 2×2 grid on phones (saves about 1,000px of scroll), a big rate per country, and tap to see your amount roll. Reuses `RATES` and the calculator's radio buttons.

Next after these: languages pills that say the slogan, comparison ticks plus hiding the floating pill, sign-up terms in `<details>` plus the sprout success.

Re-review needed after the coding agent builds these: send screenshots at 390×844 and 1440×900, light and dark, plus one with Reduce Motion on.
