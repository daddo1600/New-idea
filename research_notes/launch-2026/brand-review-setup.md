# Brand and zing review: the set-up flow (build 61)

Reviewed 3 October 2026 by the marketing agent, after the founder said "Missing zing on these pages at setup".
Scope: `milemint/src/app/welcome.tsx` and the components it uses (`motion-ask`, `permission-preview`, `work-style-card`, `celebration-overlay`, `backup-check`, `redeem-code`, `step-header`, `gold-sparkle`), the cheers in `domain/setup-cheers.ts`, and the notification ask in `finish()`.
No code was changed. This is a spec for the coding agent.

Screenshots were taken from the web preview at 390×844 (`/welcome?demo=setup|motion|empty`, `&region=GB|US`). They're in `milemint/docs/screens/setup-review-*.png`:

| File | Screen |
|---|---|
| `0-welcome` | Welcome |
| `1-country`, `1b-cheer-thumbs` | Step 1, Country, and the "Great!" cheer |
| `2-location`, `2b-location-on` | Step 2, location prime (not asked yet / already on) |
| `2c-motion`, `2e-motion-coach` | Step 2, Motion & Fitness prime, and the coach shown behind iOS's alert |
| `2d-cheer-tracking` | "Drive logging's set up" cheer (mid-animation) |
| `3-work-menu`, `3b-work-hours`, `3d-work-shifts` | Step 3, How do you work? |
| `3c-cheer-almost`, `4-purpose` | "ALMOST DONE!" cheer, then the usual purpose |
| `5a-cheer-done`, `5-done`, `5b-done-code`, `5c-done-us-shifts` | "YOU DID IT!" overlay, then "You're all set." |

Limits of the web preview: it can't show iOS's real alerts, and the iCloud "Backups are on" row isn't shown (iCloud isn't available on the web). Both were judged from the code.

---

## 1. Scores

| # | Screen | Zing (1–5) | What's flat |
|---|---|---|---|
| 0 | Welcome | **4** | The sprout is big and on brand, and the language pill sparkles. But the top third is empty and the sprout sits still once it's drawn. |
| 1 | Country | **4** | The flag tiles and green header card are good. But the rate line ("HMRC mileage rate: 55p a mile…") is small grey text, and the most motivating fact on the screen doesn't move or stand out. |
| 2 | Location prime | **3** | It has motion (it flips 1 of 2 / 2 of 2 and the button pulses). But the alert is a small greyed mock, the yellow warning shouts, there are three blocks of text, and the lock line is long. There's no picture of the benefit. |
| 2 | **Motion & Fitness prime** | **2** | A 56pt icon tile, a grey alert with four grey bars, and about 280pt of empty green above the buttons. The title is a label ("One more for accuracy:") rather than a benefit. The only motion is the "Allow" pulse. Nothing shows walking versus driving, which is the whole point. |
| 2 | Motion coach (behind iOS's alert) | **3** | It does its job: a gold arrow, a sparkling pill, and correct placement. Fine as it is. |
| 3 | How do you work? (menu) | **3.5** | The cards and the focus spring are good. But there's empty space below three plain grey cards, and the CTA is a greyed-out "Choose one to continue". |
| 3 | How do you work? (chosen) | **4** | Day chips, steppers, and the care-worker thank-you. Lively enough. |
| 3 | Usual purpose | **4** | The tiles pop and get a Default badge. But the header card takes almost half the screen, so the tiles fall below the fold, and at first the only button is "Skip for now". |
| – | Cheers between steps | **4.5** | Thumbs-up, growing sprout, almost-done ring and confetti. This is the best zing in the flow. Keep them. |
| 5 | **You're all set** | **2** | A 72pt sprout in the corner, two lines, a glass "Got a code from a friend?" box, then about 900pt of empty green, then a plain white button. The finish feels less special than the overlay before it, so the arrival falls flat. |
| 5→ | **Notification ask** (founder's 2nd screenshot) | **1** | iOS's "Would Like to Send You Notifications" pops up cold the moment they tap "Start using MileSprout". There's no explanation first, and it lands on top of the finish. |

Flow average: about 3.3. The two screens the founder named, and the notification ask, are the three lowest scores.

---

## 2. One rule for every step

Each step has **one hero visual, one big benefit line and one gentle motion**. Reduce Motion shows the hero's final frame as a still. Everything else on the screen supports these three.

| Step | Hero visual | Benefit line (big) | Motion |
|---|---|---|---|
| Welcome | LeafMark 132 (as now) | "Every work mile, counted." | Sprout plays GrowingSprout once on first open (emerge + drive), then a slow 2° sway |
| Country | Flag tiles | "Where do you drive?" | The picked tile's rate chip pops in and counts up to "55p a mile" |
| Location | Larger live alert preview (below) | "Never miss a drive." | Existing 1/2 ↔ 2/2 flip, plus a tap ripple on the button |
| Motion & Fitness | **Walk vs drive scene (new)** | "Walks stay walks." | The scene loops |
| How you work | The three cards | "How do you work?" | Existing focus spring |
| Purpose | Tiles | (shorter header) | Existing pop |
| **Reminders (new step)** | **A live notification banner** | "A nudge when it counts." | The banner slides down and stacks |
| All set | **Big growing sprout + road** | "You're all set." | Sprout grows, the road draws, ticks pop in |

---

## 3. Spec: Motion & Fitness (`components/motion-ask.tsx`, `MotionStep`)

### Layout, top to bottom (390×844)
1. Eyebrow (keep): `STEP 2 · YOUR DRIVES`.
2. **Title, new:** **"Walks stay walks."** (34/40, 800, white).
3. **Body, new:** "Motion & Fitness lets MileSprout tell a drive from a walk. It stays on your phone." (17/24, #D1FAE5). This keeps the words "Motion & Fitness" so the screen matches iOS's alert.
4. **Hero: `WalkOrDrive` scene**, full content width × 210pt, on a glass card (`rgba(255,255,255,0.10)`, radius 20, hairline border `rgba(255,255,255,0.18)`). It replaces the 56pt icon tile and fills the empty green.
5. **"Then" row:** a small line, then a sparkling Allow pill: `Tap “Allow”` (existing string `Tap “{{button}}”` + `Allow`), with the existing `GoldSparkle` around a white pill holding "Allow" in iOS blue #0A84FF. This replaces the large grey alert mock (see "The alert preview" below).
6. Buttons (keep): **"Turn on Motion & Fitness"** (white primary) / "Not now".

Remove the 56pt `StepIcon glyph="motion"` tile. The scene is the icon now.

### The `WalkOrDrive` scene (new component, Reanimated + react-native-svg, no new libraries)
There are two lanes, one above the other, inside the card.

- **Top lane, a footpath:** a dotted pale line (`#D1FAE5` at 50%).
  - A walker (an SVG stick figure in #FBF7EE, or the 🚶 emoji at 34pt if simpler) moves left to right across 60% of the lane in 2.4s, with a 2px bob every 300ms.
  - At the end, a chip pops in with a spring (damping 12): **"Not a drive"**. It's a cream chip (#FBF7EE, text #064E3B) with a small ✕.
  - The walker fades to 60%. Nothing grows.
- **Bottom lane, a road:** the sprout's own road (dark #064E3B band with white lane dashes, the same as GrowingSprout's `Road`).
  - The gold car dot (#FACC15, as in the logo) drives left to right in 1.4s (`Easing.inOut(cubic)`), laying the dashes behind it. Reuse the "dashes appear behind the car" idea from GrowingSprout.
  - When it stops, a **LeafMark size 40** springs up at the end of the road, the "logged" moment. A gold chip pops beside it: **"Drive ✓"**.
- **Timing:** the walk plays first, then the drive starts 300ms after the walk's chip lands. Everything holds for 1.6s, fades for 300ms and loops. The loop is about 6s. **Stop after 3 loops** and hold the final frame, so it doesn't distract.
- **Reduce Motion:** the final frame only. The walker sits at the end with "Not a drive" and the car at the end with the leaf and "Drive ✓". No loop.
- **VoiceOver:** the card is one element, `accessible`, labelled **"A walk is marked Not a drive. A drive is logged."** No motion is announced.
- **Contrast:** the chips are dark text on cream (#064E3B on #FBF7EE, about 10:1) and dark on gold (#064E3B on #FACC15, about 7:1). Don't put white text on the card.

### The alert preview
The founder saw the grey placeholder bars as "static placeholders". Two options:
- **Recommended:** drop the 250×150 grey mock on this step. The scene is the hero, and the "Then: Tap “Allow”" sparkle pill tells them what to tap. The coach behind the real alert (`MotionCoach`) already points at Allow. This is less on screen and gives one clear picture.
- If the founder wants the alert kept, make it **feel real**:
  - Put a 28pt LeafMark app icon at the top of the card, with the word **MileSprout** (a brand name, so it doesn't need translating).
  - Keep the body as two bars (iOS writes that text).
  - Lose the "Don't Allow" grey and render it in iOS blue at 45%.
  - Every 1.6s a tap ripple (a gold ring, scale 0.6→1.4, fading) plays on "Allow". Then "Allow" fills blue for 200ms, and a tick lands.
  - Same Reduce Motion rule: a still with a gold ring.

### New strings (Motion step)
`Walks stay walks.` · `Motion & Fitness lets MileSprout tell a drive from a walk. It stays on your phone.` · `Not a drive` · `Drive ✓` (the tick can be outside the string), plus the VoiceOver line `A walk is marked Not a drive. A drive is logged.` That's 5 in all, retiring 2 (`One more for accuracy: Motion & Fitness` and the old body).

---

## 4. Spec: "You're all set." (`welcome.tsx`, `step === DONE`)

The "YOU DID IT!" overlay is the burst. The screen underneath should then feel like **arriving somewhere**, not an empty page. The choreography starts **when the overlay closes** (its `onClose`; at once if Reduce Motion is on or the overlay was already shown).

### Layout, top to bottom
1. **Hero sprout, centred, 150pt.** It replaces `LeafMark size={72}`.
   - Use `GrowingSprout` (size 150, palette as LeafMark's, `car`) with `emerge` set to 1 and `drive` going 0→1 over 1100ms (`inOut(cubic)`). The road draws itself, the car climbs it and the leaves open.
   - This hands over from the overlay's sprout, so the sprout goes from small to big.
   - A soft gold glow ring (Ring, 6px, the same as the overlay's) plays once behind it.
   - Reduce Motion: `LeafMark size={150}` still.
2. **Title, centred:** "You’re all set." (keep the string; 34/40).
3. **Line (keep the status-based strings):** "Just drive. Each trip appears after you park." etc.
4. **"Set up" tiles: a 2-column grid of glass tiles.** Each is about 64pt tall with a gold tick badge in its top-right corner.
   - They **pop in one by one**: `ZoomIn.springify().damping(14)` with a 90ms stagger, starting 600ms after the sprout begins. Each tick lands 120ms after its tile.
   - A light haptic plays on the last tile only.
   - Only true facts are shown:

   | Tile | Shows | Copy |
   |---|---|---|
   | Country & rate | Flag + rate | e.g. 🇬🇧 **55p a mile** / 🇺🇸 **$0.70 a mile**. Use the region's rate formatter, the same figure as step 1's rule. String: `{{rate}} a mile` (and `{{rate}} a km`) |
   | How you work | Emoji + choice | 🗓️ **Set hours** / 📦 **Shifts or blocks** / ✋ **Neither**. These reuse the existing WORK_STYLE_TEXT titles |
   | Logging | 📍 | **Drive logging’s set up** (existing string) when `status === 'on'`. Otherwise this tile shows a gold "!" instead of a tick, with **Location is off for now.** (existing) |
   | Backups | ☁️ | **Backups on** (new). Hidden when iCloud isn't supported. With iCloud Drive off: a gold "!" and **Turn on iCloud Drive** (new), and tapping the tile shows the existing ICLOUD_OFF_STEPS text |
   | Reminders | 🔔 | **Sunday recap on** (new). Only if they allowed notifications on the new Reminders step (section 5) |

   If there's an odd number of tiles, the last one spans both columns.
   - `BackupCheck`'s long sentence moves out of the screen. "Backups on" is enough here, and the long text stays in Settings.
5. **"What happens next": a mini timeline.**
   - Heading: **What happens next** (new, 13pt, 800, #FDE68A, letter-spacing 1.2, upper-cased in code).
   - Four nodes in a row on a road: the same dark road band with white dashes, drawn left to right with `strokeDashoffset` over 900ms once the tiles have landed. The gold car dot then rolls along it once.
   - Each node is a 44pt glass circle with a label under it (13pt, #D1FAE5, max 2 lines):
     1. 🚗 **Drive**
     2. 🅿️ **Park**
     3. ✨ **It appears**
     4. 👉 **Swipe “Work”**
   - Each node pops (scale 0.8→1) as the car passes it.
   - Reduce Motion: the road and nodes are drawn, with no car.
   - VoiceOver: one element, **"What happens next: drive, park, the trip appears, swipe it to Work."**
   - Shift workers see the same 4 nodes; the 4th still holds, since personal drives get swiped.
   - If logging isn't on, **hide the timeline**. The line above already says how to turn it on.
6. **Friend's code:** keep `RedeemCode` but **drop the glass box** when closed. It becomes a plain gold text link, centred, under the timeline. It's optional, so it shouldn't be the biggest thing on the finish.
7. **CTA: "Start using MileSprout"** with `GoldSparkle` around it.
   - GoldSparkle assumes a pill. Give the DONE primary `borderRadius: 999`, or add a `radius` prop to GoldSparkle.
   - The sparkle starts after the timeline finishes (about 2.6s after the overlay closes), so the eye ends on the button.
   - Reduce Motion: a still gold border (GoldSparkle already does this).

### Fit
At 390×844 this fills the screen with no empty block: hero 150 + title + line + 3 rows of tiles (about 220) + timeline (about 110) + link. On small phones (SE, 667pt) it scrolls. The CTA stays pinned as now.

### New strings (All set): about 10 short ones
`{{rate}} a mile` · `{{rate}} a km` · `Backups on` · `Turn on iCloud Drive` · `Sunday recap on` · `What happens next` · `Drive` · `Park` · `It appears` · `Swipe “Work”` · VoiceOver line. These are short words, so they're cheap in 10 languages. (Check whether `Drive`/`Park` already exist as keys before adding.)

---

## 5. Spec: priming the notification ask (new)

### What triggers it today
`finish()` in `welcome.tsx` (the "Start using MileSprout" tap) calls `enableWeeklyReminder(picked.unit)` → `reminders/weekly.ts` `allowed(true)` → `Notifications.requestPermissionsAsync()`.
- iOS's alert appears cold, over "You're all set.", with nothing before it to say why.
- On a quick finish it can also land while the "YOU DID IT!" cheer is fading.
- `scheduleWorkHoursNudge()` doesn't ask (it uses `allowed(false)`), so it's not the cause.

### What MileSprout actually sends (checked in code, so the prime only promises these)
- **Sunday 6pm recap**, one a week: "Your drives are waiting 📋 / Sort them before Monday. It takes a minute." (`domain/reminders.ts` WEEKLY_MESSAGES).
- **Logging problems**, only when something's wrong: "Automatic logging is off", "Logging has stopped", "Precise Location is off" (`tracking/health-alerts.ts`).
- **Tax deadlines**, about 5 a year: "2 months left in the … tax year ⏳" … "One week left …" and return-due (`domain/deadlines.ts`).
- Shift workers: "End your shift?" when parked at home with a shift on (`tracking/shift-notifications.ts`).
- Turned on later and separately: the Pro set-aside (Monday) and the trial reminder.
- **Backup problems: no notification exists today.** Don't list it in the prime until the coding agent adds one (e.g. "Backups have stopped" when the last iCloud backup is over 7 days old). That would be worth building. Once it's built, add it to the "If something stops" tile; no new tile is needed.
- **Perks near you: doesn't exist.** It must never be part of this ask (see Apple 4.5.4 below).

### Where it sits: its own short step, after Purpose and before "All set"
- A new constant in `domain/setup-cheers.ts`: `REMINDERS = 5`, `DONE = 6`.
- Flow: `… → PURPOSE (or HOURS for shift workers) → REMINDERS → DONE`. A restored backup goes `TRACKING → REMINDERS → DONE`.
- **Skip the step** when `Notifications.getPermissionsAsync()` is not `undetermined` (already answered), or on the web or Android-without-ask.
- Dots: keep 5. REMINDERS shares the last dot with DONE, so the flow still reads as 5 steps, and "ALMOST DONE!" stays honest.
- Cheers: `setupCheer` gives `done` on entering DONE as now. Entering REMINDERS gives none (the "almost" cheer has just played).
- So **iOS's alert is answered before the celebration**, and it never pops over it.
- `finish()` must **stop asking**. It schedules the Sunday recap only if permission is already granted (`enableWeeklyReminder` → a new non-asking path, or call `refreshWeeklyReminder`), and sets `reminderAsked` only if the step actually asked.

### Screen (green brand background, like Location and Motion)
1. Eyebrow: **ONE LAST THING**
2. Title (34/40): **A nudge when it counts.**
3. Benefit line (17/24, #D1FAE5): **Usually one a week. Never ads.**
4. **Hero: a live iOS-style notification banner** in a glass card, 100% width.
   - The banner: a white card at 92%, radius 18, with a 28pt LeafMark icon, "MileSprout" + "now" (`now` is grey, and new: use `Intl.RelativeTimeFormat` to avoid a string).
   - Title **Your drives are waiting 📋**, body **Sort them before Monday. It takes a minute.** Both are existing strings, so they're already in 10 languages, and it's a real notification the app sends.
   - Motion: it slides down from -40pt with a spring (damping 16), and a soft haptic plays on iPhone. After 1.8s a second banner stacks behind it, 92% scale and 60% opacity: **One week left in the {{year}} tax year 🏁** (existing string, with this tax year filled in). It plays once, with no loop.
   - Reduce Motion: both banners shown still.
   - VoiceOver: "Example notification: Your drives are waiting. Sort them before Monday."
5. **Three small "what you'll get" rows** (an icon in a 32pt glass circle, then a 15pt label). They fade in one after another, 80ms apart:
   - 📋 **Sunday recap: drives to sort**
   - ⚠️ **If logging or backups stop**. Until a backup notification exists, use **If logging stops**.
   - ⏳ **Tax deadlines**
6. Small footnote (13pt, #D1FAE5): **Change them any time in Settings.**
7. Buttons:
   - Primary (white, with `GoldSparkle` while idle): **Turn on notifications**. Tapping it calls `requestPermissionsAsync()`. While iOS's alert is up, show the existing bottom coach pill (the location style, `styles.coach`), with the existing string `Tap “Allow”`. iOS may show "Allow / Allow in Scheduled Summary / Don't Allow" stacked, so don't use the Motion coach's side arrow. A bottom pill is safe for both layouts.
   - Then, allowed or not, schedule what's allowed and go to DONE.
   - Secondary: **Not now** (existing) → DONE. Nothing is asked. Home or Settings can offer it again later.

**New strings (Reminders): 7.** `ONE LAST THING` (or `One last thing`, upper-cased in code) · `A nudge when it counts.` · `Usually one a week. Never ads.` · `Sunday recap: drives to sort` · `If logging stops` (later `If logging or backups stop`) · `Tax deadlines` · `Turn on notifications` · `Change them any time in Settings.`. Plus the VoiceOver line.

Honesty check:
- "Usually one a week" is true. Sunday is the only routine one. Problems, deadlines (about 5 a year) and shift prompts are occasional. Set-aside is opt-in elsewhere.
- "Never ads" holds as long as perks stay a separate opt-in (below).
- Notifications are scheduled on the phone (local). Don't claim "nothing is sent", because no notification text claims that and we don't need to.

### Apple 4.5.4: promotional notifications need their own opt-in
Guideline 4.5.4, checked 3 October 2026 at developer.apple.com/app-store/review/guidelines/:
> "Push Notifications should not be used for promotions or direct marketing purposes unless customers have explicitly opted in to receive them via consent language displayed in your app's UI, and you provide a method in your app for a user to opt out from receiving such messages."

What MileSprout's notifications are today:
- They are local, not push. Apple still reviews this way, and the brand promise ("Never ads") goes further anyway.
- Perk or partner notifications, if ever built, must be **a separate switch, off by default**. It belongs in the Perks tab and in Settings → Notifications, **never** on this set-up step and never bundled into "Turn on notifications".
- Suggested consent copy for that later switch: **"Perk alerts: tell me about new partner offers. Off unless you turn it on."**
- It needs its own setting (`perkAlerts: false`), and a Settings toggle to turn it off.

---

## 6. Smaller changes for the other steps (lower priority)

1. **Location prime (score 3 → 4):**
   - Make the alert preview larger (280 wide) with a LeafMark app icon in place of the top bar.
   - Add a gold tap ripple on the highlighted button each time it flips.
   - Tone the yellow warning down to `#FDE68A` at 15pt, or fold it into the body. One shout per screen.
   - Shorten the lock line to the welcome's existing **🔒 No account. Your trips stay on your phone.** That's one string fewer, and it's the same promise.
2. **Country:** under the vehicle picker, show the rate as a gold chip that **counts up** (0 → 55p) when a country or vehicle is picked. The long rule text stays below it, smaller. This is "counting numbers" from CLAUDE.md, on the most motivating fact.
3. **How do you work (menu):** replace the greyed-out "Choose one to continue" CTA with nothing until one is chosen, plus a one-line hint above the cards. Or keep it, but give the cards a gentle staggered entrance (FadeInDown, 70ms) on first open.
4. **Purpose:** on this step only, shrink the StepHeader body text to one line (`Tax offices want a purpose for every work drive.`; the existing string can be split), so the first row of tiles is fully above the fold.
5. **Welcome:** play `GrowingSprout` once on first open in place of the static LeafMark. Reduce Motion: static.

---

## 7. Accessibility and contrast notes
- The brand gradient runs #0E9F6E → #053D2E. At the **top-left**, where eyebrows and body text sit, the contrast is weak:
  - #D1FAE5 on #0E9F6E is about **3.0:1**, which fails AA for 15–17pt body text;
  - the gold eyebrow #FACC15 on #0E9F6E is about **2.2:1** at 12pt.
- Options:
  - start the set-up gradient at #0B7A55 (which gives #D1FAE5 about 4.7:1);
  - or use the eyebrow in #FDE68A at 13pt.
- Measure on device in light and dark.
- White titles (34pt, 800) pass at about 3.4:1 as large text.
- Every new animated hero is one `accessible` element with a plain-sentence label. Ticks and chips aren't announced one by one.
- Reduce Motion is covered in each spec: final frames as stills, with no loops.
- No new libraries: Reanimated, react-native-svg, GrowingSprout, LeafMark, Burst, Confetti and GoldSparkle cover everything.

## 8. Priority for the coding agent
1. **The notification step** (section 5). This fixes a cold iOS alert over the finish and is the biggest polish and trust issue.
2. **The "You're all set." arrival** (section 4).
3. **The Motion & Fitness walk-vs-drive scene** (section 3).
4. The smaller items in section 6.

New strings in total: about 22 short ones, a few of them single words. Reused existing strings are marked "existing" above.
Then marketing will sign off on brand and zing, from fresh screenshots, before QA and the founder.
