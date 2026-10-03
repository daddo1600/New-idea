# Tester tour: `milesprout.app/tour`

*Marketing spec and script, 3 Oct 2026. The page is a 90-second voiced tour for recruiting TestFlight testers from Facebook groups. Order of work: research checks the facts (§6), then coding builds it, translator does the 10 languages, then qa, then marketing review, then the preview. The founder signs off at the end.*

## What we chose and why (for the founder)

- **Nine short scenes, about 90 seconds in English.** The order is: the problem, how it works, the money at your rate, privacy, Free and Pro, Perks, why testers matter, what testing involves, and sign up. Each scene is 2 to 4 short sentences, so a viewer who leaves halfway has still heard the core of it.
- **Real app footage only.** Every phone image is an app screen we already have (the website deck, `docs/screens`) or the hero clip `drive-logged`. The only things drawn fresh are the controls: chips, the play button, a swipe card and the badge pill. All of them are built in HTML from the site's own styles.
- **Captions are the script, word for word.** The one difference is how numbers are written: the voice says "fifty-five p" and the caption shows "55p". Captions are always on. "Captions only" turns the voice off and sets each scene's timing by reading speed.
- **The money uses the viewer's country and our existing sums.** The flags default to the country the site already works out. The sums are the site calculator's own: 100 miles or 160 km a week, for 48 weeks. That gives £2,640, US$3,648, about C$5,400 and A$4,550. No new claims.
- **Interactions never block the voice.** Each scene invites one tap (swipe a drive to Work, pick your flag, flip Free and Pro, claim a perk). The scene waits up to 4 seconds for it, then moves on. A viewer who just wants to watch can.
- **The sign-up link keeps the group tag.** `/tour?g=fb-leeds-couriers` sends people to `/testers?g=fb-leeds-couriers-tour`. Sign-ups then show both the group and that they came through the tour, with no change to the server.
- **The link preview is localised.** A small Pages Function swaps the og title, description and image for `?lang=`, so a post in a Polish group shows a Polish card.
- **For you to decide (outward-facing):** `testers.html` says testing is for drivers "in the UK", but the form also takes US, Canada and Australia, and the tour's money scene covers all four. **We recommend opening testing to all four countries.** The app supports all four, and TestFlight works in all four. If you'd rather keep it UK-only for now, the tour uses the fallback line in scene 9 instead.

---

## 1. Scenes

Timings are for English with the iPhone's default voice at rate 1.0 (about 2.8 words a second), plus a 0.3 s gap between sentences and 0.6 s between scenes. Other languages run longer. That's fine, because the timing comes from the voice, not a clock (§3).

**Each sentence has two forms.** `say` is what the voice speaks and `show` is the caption. They are the same words except where a number or symbol is written differently (marked ▸). There is a single English script, with captions in British English, as on the rest of the site. Only the money sentences change by country.

### 0. Start card (before the tour, not timed)

- **Visual:** the hero drive scene from `index.html` (`#scene`, the SVG road with its local and season art from `assets/season.js`). It's parked, with the phone showing `assets/video/drive-logged-saved.webp`. On top is the sprout logo, then the title **"See MileSprout in 90 seconds"** and a big round **play button** (88 px, brand green with a yellow ring). The ring "breathes" slowly (scale 1 → 1.04, 2.4 s), and Reduce Motion turns that off.
- **Under the button:** the language chips (§3.2), and a small switch, **"🔊 Sound on · Captions only"**.
- **Line under that:** "Sound on, or read along. Founding testers wanted · iPhone".
- **No voice yet.** On iPhone the first speech has to come from a tap, and the play button is that tap.

### 1. "Miles add up" (the problem) · ~9 s

- **Visual:** the hero road scene in motion, same code as the home page. The phone shows `assets/video/drive-logged-poster.webp` ("Recording a drive"). As sentence 3 plays, a few faint mile markers drift past and fade to grey: the "missed" ones.
- **Voice and caption:**
  1. Drive for work? Your miles are worth money at tax time.
  2. But writing every drive down is a pain.
  3. Miss a few, and they're hard to prove.
- **Interaction:** none; swipe or tap ▶ to skip.

### 2. "Drive, park, swipe" (how it works) · ~9 s

- **Visual:** `assets/video/drive-logged.mp4` / `.webm` (9.6 s) in the phone frame on the road scene, with the road clock locked to the video as on the home page. The clip goes: driving → parked → the new drive appears on Home → swiped to Work → the total goes up.
  - For non-UK viewers, a small tag shows on the phone: "Shown in pounds. Yours uses your money and rate." (The clip has £1.21 in it.)
- **Voice and caption:**
  1. MileSprout logs your drives by itself.
  2. When you park, the drive is already there.
  3. Swipe it to Work, and watch it add up.
- **Interaction: "Try it".** When the clip ends, a drive card slides up over the phone with a **Work ⟶** swipe handle (the same card the app has; built in HTML).
  - The card shows the viewer's own country:
    - UK: *Meanwood Rd → Home · 2.2 mi · £1.21*
    - US: *Mueller → Home · 2.2 mi · $1.67*
    - CA: *Leslieville → Home · 3.5 km · $2.56*
    - AU: *Granville → Home · 3.5 km · $3.19*

    The street names are the persona deck's city equivalents.
  - When the viewer swipes, the card turns green, a burst of sprout leaves pops, and **"+£1.21"** counts up into a little total.
  - If they don't swipe, nothing happens, and the scene moves on after the 4 s wait.
  - Reduce Motion: no burst; the card simply turns green.

### 3. "At your rate" (the money) · ~13 s

- **Visual:** the calculator's **flag chips** (the same SVG flags as `#calc` on `index.html`), above a big **counting number** in the site's money style. Under it are the distance chips **50 · 100 · 200 · 400 miles a week** (km: **80 · 160 · 320 · 640**). The 100 / 160 chip starts selected. In the background, faint, is `milemint/docs/screens/setup-review-1-country.png` (the app's own "Where do you drive?" screen), as a phone at 30% opacity, to show it's the same choice as in the app.
- **Voice and caption (UK):**
  1. Pick your country.
  2. In the UK, HMRC's rate is fifty-five p a mile for cars and vans. ▸ show: "In the UK, HMRC's rate is 55p a mile for cars and vans."
  3. An example year of part-time work driving is worth two thousand, six hundred and forty pounds. ▸ show: "…is worth £2,640."
- **US** (replaces sentences 2 and 3):
  - In the US, the IRS rate is seventy-six cents a mile. ▸ "76¢ a mile"
  - An example year of part-time work driving is worth three thousand, six hundred and forty-eight dollars. ▸ "$3,648"
- **Canada** (replaces 2 and 3, and adds a fourth):
  - In Canada, the CRA's allowance rate is seventy-three cents a kilometre. ▸ "73¢ a km"
  - An example year of part-time work driving is worth about five thousand, four hundred dollars. ▸ "about C$5,400"
  - If you're self-employed, treat that as a guide.
- **Australia** (replaces 2 and 3):
  - In Australia, the ATO rate is ninety-one cents a kilometre, up to five thousand a year. ▸ "91c a km, up to 5,000 km a year"
  - An example year of part-time work driving is worth four thousand, five hundred and fifty dollars. ▸ "A$4,550"
- **Small print, always on screen (not spoken):** "Example: 100 miles (160 km) a week for 48 weeks, at {authority}'s 2026 rate. A guide, not tax advice. Source ↗". It uses each country's `note` and `source` from the `RATES` object in `site.js`, with "Motorbikes and bicycles have their own rates" added for the UK.
- **Interaction:**
  - **Tap a flag.** The number counts to the new country's sum (0.8 s, ease-out), and the voice stops and re-speaks sentences 2 and 3 for that country.
  - **Tap a distance chip.** The number re-counts, using `yearWorth()` from `site.js` (shared, not copied). The voice doesn't re-speak, and the caption keeps the example.
  - **Celebration:** the first time the number lands, a tiny coin-leaf pops beside it.
  - Reduce Motion: the number appears without counting, and there's no pop.

### 4. "Stays on your phone" (privacy) · ~7 s

- **Visual:** `assets/img/screens/privacy.webp` in the phone. A padlock badge settles onto the phone's corner, and three ticks appear one per sentence: "No account", "Encrypted on your iPhone", "We never see your trips".
- **Voice and caption:**
  1. There's no account to make.
  2. Your trips stay on your phone, encrypted.
  3. We never see where you go.
- **Interaction:** none.

### 5. "Free and Pro" (honestly) · ~9 s

- **Visual:** two phones side by side, slightly fanned like the home-page deck:
  - **Free:** `screens/home.webp` in front, `screens/drives.webp` behind;
  - **Pro:** `screens/export.webp` in front, `screens/money.webp` behind.

  A chip toggle above them reads **Free · Pro**. Free is lit during sentence 1 and Pro during sentences 2 and 3.
- **Voice and caption:**
  1. Logging is free for good, with no monthly limit.
  2. Pro is the paid part, for tax time.
  3. It adds reports, exports and money tools.
- **Interaction:** tapping Free or Pro brings that phone to the front, and the chip slides across. It doesn't affect the voice.
- **No price is shown.** Pro's price isn't final, and the site says "prices shown in the app".

### 6. "Perks" · ~7 s

- **Visual:** `screens/perks.webp` in the phone. During sentence 2, a "Claim" pulse ring appears on the first offer.
- **Voice and caption:**
  1. There's a Perks tab too, with deals for drivers, like fuel and coffee.
  2. While we're testing, the offers are a demo.
- **Interaction: tap Claim.** The phone flips to `screens/perks-code.webp` (the QR and short code) with a small "Demo" tag. Reduce Motion: a crossfade instead of the flip.

### 7. "Why we need you" (testers matter, what they get) · ~13 s

- **Visual:** the sprout and confetti from `milemint/docs/screens/setup-review-5a-cheer-done.png`, cropped to the sprout in its ring, without the "YOU DID IT!" text. On top:
  - a big **"12"** that counts up from 0 with "months of Pro" under it;
  - below that, the **Founding driver** badge pill, built in HTML with the same look as `components/invite.tsx` `badgeText`, which pops in on sentence 3.
- **Voice and caption:**
  1. Before we launch, we want drivers on real shifts to try to break it.
  2. Founding testers get twelve months of Pro free when we launch. ▸ show: "12 months"
  3. It doesn't renew. And you get the Founding driver badge.
- **Small print:** the terms line from `testers.html`, linked: "Code emailed within 3 days of launch; redeem within 60 days. One per person and per Apple Account. Doesn't renew. Terms ↗".
- **Interaction:** none; the counting 12 and the badge pop are the moment. Reduce Motion: "12" and the badge simply appear.

### 8. "What testing involves" · ~11 s

- **Visual:** three step cards, each ticking off as its sentence plays, beside a phone showing `milemint/docs/screens/home-week.png`:
  - ① **TestFlight**, drawn as a plain sprout-green icon. We don't use Apple's TestFlight artwork.
  - ② **2 weeks of shifts**. The card's small line reads "Allow location: Always, so drives log when the app is closed".
  - ③ **Screenshot → send**.
- **Voice and caption:**
  1. Get the app through TestFlight, Apple's app for early versions.
  2. Use it on your normal shifts for two weeks. ▸ show: "2 weeks"
  3. Something wrong? Screenshot it and send it to us.
  4. Then answer five quick questions. ▸ show: "5 quick questions"
- **Interaction:** tapping a step card opens its one-line detail (the matching answer in the testers page FAQ). The voice keeps going.

### 9. "Join us" (call to action) · ~8 s

- **Visual:** the hero road scene again, now parked at the kerb, with the sprout logo growing (the site's intro sprout, `intro-gate.js`, at its end frame) and a big **"Become a founding tester"** button. The button is brand green, full width on phones, with a gentle shine sweep every 4 s (off under Reduce Motion). Below it: **↻ Watch again** and **Share this tour** (Web Share API; it copies the link where that's missing).
- **Voice and caption:**
  1. It's iPhone only for now, and places are limited to a hundred. ▸ show: "limited to 100"
  2. Tap below to sign up. It takes a minute.
  3. Thanks for watching.
- **Fallback line 1, if the founder keeps testing UK-only:** "Testing starts in the UK, on iPhone, with a hundred places." For a non-UK viewer, the button then reads "Join the waitlist" (`/#early-access`), with "We'll tell you when testing opens near you." That line is extra copy and would need its own translation.
- **On Android or desktop**, the button still goes to `/testers` (people often watch on one device and sign up on another). A line under it says: "Testing needs an iPhone. Not on one? Join the waitlist for 3 months of Pro free at launch." It links to `/#early-access`, and the wording is the website's existing offer.
- **Link:** `/testers?g={g}-tour`, where `{g}` is the cleaned `?g=` from the tour URL, or `tour` if there isn't one. `cleanGroup()` in `functions/api/waitlist.js` already accepts this.

### Running time (English, UK)

| Scene | Words | Est. seconds |
|---|---|---|
| 1 Miles add up | 27 | 10.8 |
| 2 Drive, park, swipe | 23 | 9.4 |
| 3 At your rate (UK) | 32 | 13.0 |
| 4 Stays on your phone | 18 | 7.6 |
| 5 Free and Pro | 24 | 9.8 |
| 6 Perks | 21 | 8.4 |
| 7 Why we need you | 35 | 13.7 |
| 8 What testing involves | 33 | 13.3 |
| 9 Join us | 24 | 9.8 |
| **Total** | **237** | **about 95 s** |

The estimate is words ÷ 2.8, plus the gaps. iPhone voices at rate 1.0 usually speak a little faster than that, so expect about 90 s. The "Try it" wait can add up to 4 s. The US version runs about the same as the UK, and Canada about 3 s longer. Every sentence is 16 words or fewer.

---

## 2. Voice script rules (for coding and the translator)

- **Every sentence is under 20 words.** The longest is 16. Keep that in translation, and split a sentence rather than let it run on.
- **The `say` form has no symbols or numerals.** Numbers are written out in words in each language: "fifty-five p", "seventy-six cents", "twelve months", "a hundred". No £, $, ¢, %, &, slashes or brackets.
- **If a voice mispronounces a name, fix it in `say` only.** For example, a phonetic spelling of "MileSprout" or "TestFlight" for one language. `show` always keeps the real spelling.
- **Wording rules:** never "tracking"; never "we keep" or "our servers"; "we" for the company; plain, short British English in captions.
- **Script file:** `website/assets/tour/{lang}.json`. Each sentence has an `id` (`s3.2.UK`), `say` and `show`, and country variants sit under `UK`, `US`, `CA` and `AU` keys. All UI strings live in the same file (§3.7).

## 3. Interaction design

### 3.1 Player

- **Layout.** The stage fills the viewport (`100svh`), and on desktop it's capped at 480 px wide and centred on the scene backdrop. From top to bottom:
  - **chapter dots**: 9 dots, with the current one stretched into a pill that fills as the scene plays;
  - **the visual**;
  - **the caption bar**: 20 px, at most 2 lines, on a frosted panel;
  - **controls**: ⏯ pause / play, ↺ replay scene, 🔊 / 💬 voice or captions only, 🌐 language.
- **Moving between scenes:** swipe left or right, tap the right or left third of the visual, tap a dot, or use the ← → keys. Space pauses.
  - The transition is a horizontal slide with a little parallax on the phone (300 ms).
  - Reduce Motion: a 150 ms crossfade.
- **Auto-advance:** after the scene's last sentence ends, plus 0.6 s, or after the "Try it" wait.
- **Pause:** iOS `speechSynthesis.pause()` is unreliable, so pause is `cancel()`, and play restarts the current sentence from its start. Replay restarts the scene.
- **Leaving the page** (`visibilitychange` to hidden) pauses. Coming back shows a big ▶ "Carry on".
- **The end card** keeps everything tappable. Nothing auto-plays again.

### 3.2 Language chips

- **One chip per language, each in its own name:** English · Español · Português (Brasil) · Français · Română · Polski · हिन्दी · ਪੰਜਾਬੀ · বাংলা · 简体中文.
  - They sit in a wrapping row on the start card, and in a sheet from the 🌐 control during play.
  - These are the same names, in the same order, as the home page's "In your language".
- **The default comes from `?lang=`,** then a saved choice (`localStorage`, wrapped in try/catch), then `navigator.languages`:
  - `pt*` → `pt-BR`;
  - `zh*` → `zh-Hans`;
  - `hi`, `pa`, `bn`, `es`, `fr`, `ro`, `pl` → themselves;
  - anything else → `en`.
- **Changing language mid-tour** restarts the current scene in the new language. The page's `lang` attribute and the og-free UI strings change with it.

### 3.3 The voice (Web Speech API)

- **Start on the play button's tap.** The first `speechSynthesis.speak()` must be called synchronously inside the click handler, with no `await` before it. That's what unlocks speech on iPhone. Use one utterance per sentence, so captions stay in step and iOS never cuts off a long utterance.
- **Choosing a voice:**
  - wait for `voiceschanged`, with a 1 s timeout;
  - then pick the voice whose `lang` matches the language and the viewer's country best: `en-GB`, `en-US`, `en-CA` or `en-AU`; `fr-CA` for Canadian viewers, otherwise `fr-FR`; `es-US` for US viewers, otherwise `es-ES` or `es-MX`; `pt-BR`; `ro-RO`; `pl-PL`; `hi-IN`; `pa-IN`; `bn-IN` or `bn-BD`; `zh-CN`;
  - prefer `localService` voices and names with "Enhanced" or "Premium";
  - rate 1.0, pitch 1.0.
- **No voice for the language** (likely for Punjabi or Bengali on some iPhones, and in some in-app browsers): don't read the text in another language's voice. Switch to Captions only, and show the note "Your phone doesn't have a {language} voice, so it's captions only."
- **Captions only:** each sentence stays on screen for its reading time, at least 1.8 s:
  - Latin scripts: characters ÷ 15 per second;
  - Devanagari, Gurmukhi and Bengali: characters ÷ 12;
  - Chinese: characters ÷ 5.
- **Captions and screen readers:** the caption region is `aria-live="off"` while the voice is on, so VoiceOver doesn't read over the voice, and `"polite"` in Captions only.
- **"Read the whole script":** a `<details>` under the player has the full transcript in the current language. It's the no-JS view too.
- **Keep the screen awake:** call `navigator.wakeLock.request('screen')` on play (Safari 16.4+). If that isn't there, the muted `drive-logged` video loops off-screen while the tour plays. Otherwise iPhone Auto-Lock (as short as 30 s) would stop the voice mid-tour.

### 3.4 iPhone Safari and the Facebook in-app browser

- **Most people will open the tour inside Facebook's in-app browser.** QA must test it there on a real iPhone, not only in Safari.
- If `speechSynthesis` is missing or returns no voices there, the tour runs in Captions only, with a one-line tip: "For the voice, open this page in Safari." The tip shows once.
- Video: muted `playsinline`, started from the same tap. If `play()` is refused (Low Power Mode), use the posters as stills, as the home page already does.
- Media weight: under 1.2 MB before the first scene plays.
  - The clip is 266 KB as mp4.
  - The screens are about 40 KB each in webp. The `docs/screens` PNGs are converted to webp at 640 px wide.
  - Images are preloaded one scene ahead.

### 3.5 Reduce Motion and accessibility

`prefers-reduced-motion: reduce` turns off:
- the road movement and video autoplay (the posters show as stills: driving, then saved);
- counting numbers (the final figure just appears);
- bursts and confetti, the play button's breathing and the CTA shine;
- slides, which become crossfades.

The voice and auto-advance still work, because they aren't motion. Everything else:
- **Keyboard:** every control is a real button.
- **Focus:** visible focus rings.
- **Chapter dots:** each is labelled "Scene 3 of 9: At your rate".
- **Tap targets:** at least 44 px.
- **Contrast:** captions meet WCAG AA on the frosted panel in light and dark.

### 3.6 Link preview (og)

- **`og:title`:** "Drive for work? See MileSprout in 90 seconds"
- **`og:description`:** "The free iPhone app that logs your work drives by itself. Founding testers get 12 months of Pro free."
- **`og:image`:** `/assets/img/og-tour-{lang}.jpg`, 1200 × 630, built from existing assets:
  - the hero road scene, with no season art, so it doesn't date;
  - the phone in its car mount, showing `drive-logged-saved.webp`;
  - a big brand-green play button, with a yellow ring and a "1:30" pill, over the left third;
  - the headline "See MileSprout in 90 seconds" in the site's display font, translated per language.

  Render it with the same Playwright screenshot set-up the site's docs images use. The text is kept short, so it reads at Facebook's feed size, about 500 px wide.
- **Per language:** `functions/tour.js` is a Pages Function that uses HTMLRewriter to swap `og:title`, `og:description`, `og:image`, `og:locale` and `<html lang>` based on `?lang=`. Without `?lang=`, the page serves English.
- After publishing, the founder runs each language's URL through Facebook's Sharing Debugger once, so the cards refresh. That needs their Facebook login.

### 3.7 UI strings (all 10 languages, from the translator)

- "See MileSprout in 90 seconds"
- "Sound on, or read along."
- "Founding testers wanted · iPhone"
- "Play" / "Pause" / "Carry on" / "Replay this scene" / "Watch again" / "Share this tour" / "Link copied"
- "Sound on" / "Captions only"
- "Language"
- "Scene {n} of {total}: {name}", with the nine scene names: Miles add up · Drive, park, swipe · At your rate · Stays on your phone · Free and Pro · Perks · Why we need you · What testing involves · Join us
- "Try it: swipe to Work" / "Work"
- "Shown in pounds. Yours uses your money and rate."
- "miles a week" / "km a week"
- the small print in §1 scene 3, per country
- "Demo"
- "months of Pro" / "Founding driver"
- the three step cards and their details
- "Become a founding tester"
- "Testing needs an iPhone. Not on one? Join the waitlist for 3 months of Pro free at launch."
- "Your phone doesn't have a {language} voice, so it's captions only."
- "For the voice, open this page in Safari."
- "Read the whole script"
- og title and description

### 3.8 Files

| File | What |
|---|---|
| `website/tour.html` | The page (Pages serves it at `/tour`). It reuses `site.css`, `season.js` and the scene and calculator code from `site.js`, which are pulled out into shared functions rather than copied. |
| `website/assets/tour.js`, `tour.css` | The player. |
| `website/assets/tour/{lang}.json` | The script and UI strings (§2). |
| `website/assets/img/tour/*.webp` | `setup-review-1-country`, `setup-review-5a-cheer-done` (cropped) and `home-week`, converted from `milemint/docs/screens/`. |
| `website/assets/img/og-tour-{lang}.jpg` | Link previews. |
| `functions/tour.js` | The og swap. |
| `website/testers.html` | Adds a "▶ Watch the 90-second tour" link under the hero button. |

### Assets used (all existing)

- `website/assets/video/drive-logged.mp4`, `drive-logged.webm`, `drive-logged-poster.webp`, `drive-logged-saved.webp`
- `website/assets/img/screens/home.webp`, `drives.webp`, `money.webp`, `export.webp`, `privacy.webp`, `perks.webp`, `perks-code.webp` (`trip.webp` is spare)
- the hero drive scene and road from `website/index.html` `#scene` + `assets/site.js`, with the local and season art from `assets/season.js`
- the calculator's flag chips and `RATES` / `yearWorth()` from `index.html` `#calc` + `site.js`
- the sprout logo and intro from `index.html` and `assets/intro-gate.js`
- `milemint/docs/screens/setup-review-1-country.png`, `setup-review-5a-cheer-done.png`, `home-week.png`
- the Founding driver badge look, from `milemint/src/components/invite.tsx`

---

## 4. Facebook post (English; the translator does the rest)

Post this only after the group's admin says yes. The DM to admins is in `founding-testers.md`. Swap `GROUPNAME` for each group, and use `&lang=xx` in groups that speak another language.

> **Drive for work? We're looking for iPhone drivers to test our app before launch** 🚗
>
> Hi all, I'm Travis, the founder of MileSprout. It logs your work drives by itself: you swipe each one to Work or Personal, and it shows what they're worth at the tax office's rate. No account, and your trips stay on your phone.
>
> Rather than a long post, we made a 90-second tour. Sound on, or read the captions, in 10 languages:
> 👉 milesprout.app/tour?g=GROUPNAME
>
> Founding testers use it on real shifts for 2 weeks and tell us what breaks. In return you get 12 months of Pro free when we launch, and it doesn't renew.
>
> iPhone only for now, and the first 100 places. Ask me anything in the comments.

---

## 5. Checks before it ships

- **QA:**
  - test in the Facebook app's in-app browser on an iPhone (iOS 16.4 and the latest), in Safari, and in Chrome on Android;
  - test with Auto-Lock at 30 s, the ringer switch on silent, Low Power Mode, Reduce Motion, VoiceOver, all 10 languages, and a language with no voice installed;
  - every link keeps `g`, and a sign-up through the tour lands in D1 as `testers:{g}-tour`.
- **Marketing:** screenshots of every scene at 390 px in light and dark, the og cards, and a screen recording with sound for the founder.

---

## 6. Notes for research: every factual line to check

None of these is new: each comes from `website-claims-check.md`, `decisions.md`, `testers.html` or the home page. They still need confirming as worded here.

| # | Line (as spoken or shown) | Where it comes from | Check |
|---|---|---|---|
| 1 | "Your miles are worth money at tax time." | Brand line; mileage rates are deductions or allowances in all four countries | That it's fair for UK employees (Mileage Allowance Relief), US employees (mostly no deduction, per `website-claims-check.md` "Decisions, 3 Oct 2026" §1) and Canada (an allowance rate, not a self-employed rate). Suggest a softer line if needed. |
| 2 | "Miss a few, and they're hard to prove." | Approved line: "missed miles are hard to prove" | Same as the approved wording. Confirm. |
| 3 | "MileSprout logs your drives by itself. When you park, the drive is already there." | Home page; the app needs location "Always" | That it holds with "Always" on (scene 8's card says so). |
| 4 | UK: "55p a mile for cars and vans" | `regions.ts`, claims check §1 | It's 55p for the first 10,000 business miles; the small print says "then 25p". |
| 5 | UK: "An example year of part-time work driving is worth £2,640" | 100 mi × 48 weeks × 55p (`site.js`) | The approved wording is "an example year of part-time work driving is worth £2,640 at HMRC's 55p rate". |
| 6 | US: "the IRS rate is 76¢ a mile"; "$3,648" | `regions.ts`; 4,800 × 76¢ | The rate is from 1 Jul 2026 (72.5¢ before). Is saying 76¢ without "from July" OK, given the small print has the date? |
| 7 | CA: "the CRA's allowance rate is 73¢ a km"; "about C$5,400"; "If you're self-employed, treat that as a guide." | `site.js`: 7,680 km → 5,000 × 73¢ + 2,680 × 67¢ = C$5,446, rounded down and spoken as "about five thousand, four hundred" | The rounding, and whether the caveat is enough. The claims check used 7,800 km (C$5,526), but the site uses 160 km a week × 48. |
| 8 | AU: "91c a km, up to 5,000 a year"; "A$4,550" | `regions.ts`; the 5,000 km cap | It's 91c for 2026–27 only, so it needs a June 2027 check. The cap is per car. |
| 9 | Swipe card amounts: £1.21 (2.2 mi), $1.67 (2.2 mi), C$2.56 (3.5 km), A$3.19 (3.5 km) | The hero clip (£1.21); the others are the shown distance × rate | The arithmetic, and that it's fine to show them as examples. Coding: work in whole tenths of a cent so 2.555 rounds to 2.56, not 2.55. |
| 10 | "There's no account to make. Your trips stay on your phone, encrypted. We never see where you go." | Home page privacy card; `testers.html` FAQ | The app has no account and stores trips encrypted on the phone. iCloud backups are encrypted on the phone first. TestFlight crash reports are shared only if the user allows them. |
| 11 | "Logging is free for good, with no monthly limit." | Home page "Free, for good" | Same promise as the site. |
| 12 | "Pro … adds reports, exports and money tools." | Home page Pro list | Matches the site. |
| 13 | "Deals for drivers, like fuel and coffee. While we're testing, the offers are a demo." | Home page Perks card | That Perks will still be a demo through testing. If real partners go live during testing, change the line. |
| 14 | "Founding testers get 12 months of Pro free when we launch. It doesn't renew." | `decisions.md` (3 Oct), `testers.html` | The terms are in the small print: within 3 days, a 60-day window, one per Apple Account. |
| 15 | "you get the Founding driver badge" | `testers.html` promise; the badge is in `invite.tsx` and is earned through invites | **How does a tester actually get the badge in the app?** Today it's earned at the top of the invite ladder. Coding needs a way to award it to testers, or the line comes out (here and on `testers.html`). |
| 16 | "TestFlight, Apple's app for early versions" | `testers.html` FAQ | Fair description. |
| 17 | "Use it on your normal shifts for two weeks." "Then answer five quick questions." | `testers.html` | Matches the page. |
| 18 | "Something wrong? Screenshot it and send it to us." | `testers.html` ("TestFlight has a button for this") | That TestFlight's screenshot feedback works on iOS 16.4+ (take a screenshot, then Share Beta Feedback). Settings → Help & feedback in the app also emails us. |
| 19 | "It's iPhone only for now, and places are limited to a hundred." | `testers.html` "First 100 places" | That the public TestFlight link's tester limit will be raised from 10 (`founding-testers.md`). |
| 20 | "It takes a minute." | `testers.html` ("It takes a minute") | Matches the page. |
| 21 | og: "The free iPhone app that logs your work drives by itself." | Home og | Matches the page. |
| 22 | Voices: which iPhone languages have built-in voices | Platform fact | Check whether iOS 16.4+ ships Punjabi, Bengali, Romanian and Hindi voices, and whether the Facebook in-app browser exposes `speechSynthesis`. This decides how often the captions-only fallback shows. |
