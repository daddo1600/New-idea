# Brand and zing review: website-preview at ffd766b

Checked 3 October 2026 by the marketing agent, against `CLAUDE.md`, `brand-review-website.md` (our panel spec) and `local-scenes-art-direction.md` (our scene rules). I looked at the frames in `website/docs/` and rendered fresh ones with Playwright at 390 px (London, every ~0.3 s across the 9.6 s loop; the hero; deck panel 1). I also seeked the clip itself (`assets/video/drive-logged.webm`) frame by frame.

## Verdict: PASS with exact fixes

The brand is right and the page has real zing now. But **fixes 1 and 2 must land before publish**: one is a visible glitch on the money figure every loop, and the other is the "Drive logged" sign, which nobody can read. Fixes 3 to 5 are small and should go in the same pass. **The zoom size gets a separate sign-off** on the coding agent's new head (founder: "This needs to get bigger so the demo is clearly seen"). Here I've judged only the zoom's timing and how it fits with the scene.

| Area | Brand | Zing | Ruling |
|---|---|---|---|
| Zoom when parked, touch indicator | 5 | 4 | Yes. It's what the founder asked for, and the touch dot makes the swipe readable. Size to be judged on the new head. |
| Deck screens re-shot | 5 | 4 | Pass. "Counting your miles", "Automatic logging" and "Turn on automatic logging" are all in. No "tracking", no "our servers". |
| Feature panels | 5 | 4 | Pass. Built to spec: cards, mint/gold badges, a count-up stat, tick tiles, the PDF, padlock and receipt visuals, and a gold finish on 8/8. No longer boring. |
| Standard scene | 4 | 4 | Pass. The "Every work mile adds up" brand sign is a nice touch. |
| London scene | 4 | 4 | Pass after fixes 2, 3 and 5. Elizabeth Tower reads instantly, it's in brand greens, and the "55p a work mile" sign is the best idea on the page. |
| Intro (approved, merged) | 5 | 5 | No change. |

## Fixes, in order

### 1. Must fix: ghosting on the phone screen (the clip has two cross-dissolves)

The recorded clip dissolves between two different layouts at **about 2.3 to 2.7 s** (the "Recording a drive" banner into the saved drive) and at the **loop seam, about 9.1 to 9.6 s** (the end state back into the start). For those frames the phone shows two screens on top of each other: "£2,267.54" printed over "£2,266.33", and "Recording a drive" over "Counting your miles". It's in the coding agent's own strips too (the last frame of `zoom-strip-390.png` and `zoom-strip-1280.png`). The seam lands on the zoom-out, so the glitch is magnified, and it'll be bigger still on the new, larger zoom. It looks broken, and it sits on our money number.

- Re-cut `drive-logged.mp4` and `.webm` with **no blended frames**. Use a hard cut at about 2.5 s (still before the zoom starts at 2.7 s), and at the loop seam hold the end frame until 9.6 s, then cut hard to frame 0.
- Acceptance: seek the clip in 0.04 s steps from 2.0 to 3.0 s and from 8.8 to 9.6 s. No frame may show two states at once. Then refresh `drive-logged-poster.webp` if frame 0 changed.

### 2. Must fix: the "Drive logged" P sign can't be read

`uk-london.js` draws "logged" at size 7 under the P. At 390 that's a cap height of about 3 CSS px, so it reads as a blue smudge. This sign is the payoff for the whole drive.

- Make the plate **one line, "Drive logged"**, at **at least 9 CSS px cap height at 390**. The P panel grows to match, about 2.5 times its current size.
- Move the sign into the **near (roadside) layer, on the kerb the car pulls in to**, so it's big and still for the 2.4 to 2.7 s before the zoom, and again during the zoom-out.
- Check it in the Reduce Motion still too (`scene-uk-london-390-still.png`).

### 3. The zoom covers London while parked: my ruling

**Keep the zoom.** The founder has asked for it three times, and the demo is the product. Don't hold the zoom back for the scenery. But don't waste London's two local moments either. Show them while the camera is wide:

- **P sign:** shown as in fix 2, from 1.8 s (it slides in as the car slows) to 2.7 s, and again from 8.9 s as the camera pulls back.
- **Red bus:** move its pass from the parked window to **8.6 s through about 1.2 s of the next loop**. It enters as the zoom-out starts and crosses in front of Elizabeth Tower while the car sets off and drives. It shouldn't move during the zoom-in, because that's where we want the eye on the phone.
- **Reduce Motion still:** no change. It already shows the bus by the tower and the P sign.

### 4. Passing signs at 7 to 8 px: not acceptable for the main line

Our own rule (art direction §3, "Readable") is **at least 9 CSS px cap height at 390**, at the sign's nearest frame.

- **First line of every sign: at least 9 px** at its nearest frame. "55p" already gets there. Scale the Westminster and Home direction sign and the brown Westminster sign up about 20%.
- **Second lines** ("first 10,000", "2¼"): at least 6 px is fine. They're texture, not the message.
- Still at most 4 words a line and 2 lines.

### 5. London: don't park on double yellow lines

The car pulls in by a kerb painted with double yellows, next to our "Drive logged" P sign. UK couriers know double yellows mean no waiting (many have the parking tickets to prove it). It's a small detail, but it's exactly the kind they'd notice. This corrects our own art direction §2, which asked for double yellows "along the kerb".

- **End the double yellows a little before the P sign.** Where the car stops, draw a **dashed white bay line** (a marked parking bay), then start the double yellows again past it.

## The calculator at the top: my call

**Keep the drive scene first.** The hero's job is to show MileSprout working, and the zoom the founder asked for does that. A calculator asks for effort before the visitor believes the product. The money already leads, because "£2,640" is in the first line under the headline. The manager's recommendation is right, with one change: make it a single visible link, not two.

**Exact copy and behaviour:**

- Leave the money line as it is: "An example year of part-time work driving is worth **£2,640** at HMRC's rate." (US, Canada and Australia use their own lines, as now.)
- Directly under it, as its own short line, add a gold underlined link: **`Work out yours ↓`** (the same words in all four countries). It links to `#calc`.
- Also make the gold amount ("£2,640", "$3,648", "$5,446", "$4,550") tappable to `#calc`, with a dotted gold underline. Give that link `tabindex="-1"` and `aria-hidden="true"` so screen readers and the keyboard meet one link, not two.
- On arrival, move focus to the calculator heading ("What are your work miles worth?", `tabindex="-1"`). The slider thumb gives **one gold pulse** (600 ms). Reduce Motion: a plain jump, no pulse.
- Don't add a third button to the hero's CTA row. "See how it works" and "Get early access" stay as they are.

## Smaller notes (optional, not blocking)

- Panel 2's stat "Free" is the weakest of the eight, because a word isn't a number. If we revisit it: "£0", with the label "Automatic logging, no monthly limit".
- Carried over from live, not new in this preview: the `<title>` says "mileage tracker" and the meta description says "mileage tracking". That breaks the "never tracking" rule, and `decisions.md` has no exception for it. It's an SEO and brand decision, so it's the founder's to make (see `brand-review-website.md`, Blockers row 3). Recommended: "MileSprout: the free mileage log that fills itself in" and "Free, automatic mileage logging for couriers…".

## Before the founder sees it

1. Coding makes fixes 1 to 5 and the calculator link, and shares the new zoom head.
2. Marketing re-checks the new zoom size and fixes 1 to 4 from fresh 390 and 1280 strips, including a frame-by-frame check of the clip seams.
3. QA signs off. Then the founder gets screenshots and decides on "publish".

---

## Re-check: website-preview at 442f1c3 (3 October 2026)

I looked at the coding agent's frames (`zoom-strip-390/1280`, `zoom-peak-390`, `london-uk-london-390/1280` and the stills, `calc-link-390`). I also rendered my own London loops with Playwright, at 390 and 1280, every ~0.3 s across the whole loop, including the loop seam.

### Verdict: PASS with 2 exact fixes (London only)

Everything except the London scene is signed off for publish. London needs the two fixes below, both small. I re-check them on screenshots, not a full review. **If the founder wants to publish before then,** the fallback is to publish with UK visitors on the standard scene until London passes. That's the founder's call.

| Item | Ruling |
|---|---|
| Bigger zoom | **Pass.** At 390 the app screen fills the frame, and "Work or personal? Worth £1.21 if work." can be read at a glance. The touch dot and its ripple read as a real thumb. At 1280 it's about 1.9x and clear. It's what the founder asked for. |
| Clip, hard cuts | **Pass.** No double image in any frame I rendered, including the zoom-out and the loop seam: "£2,267.54" switches cleanly to "£2,266.33". |
| Passing signs, main line at 9.2 px | **Pass.** "55p a work mile" and "Westminster" read at their nearest frame. |
| London bay | **Pass.** The double yellows stop and there's a white bay where the car pulls in. |
| "Work out yours ↓" | **Pass.** The gold link sits under the money line. The amount links to `#calc` with `aria-hidden`/`tabindex="-1"`, and there's a screen-reader copy of the figure. It works in all four countries. |
| Panel 2 "£0" | **Pass.** |
| **Bus in front of the signs** | **Fix A.** |
| **P sign floating in the sky** | **Fix B.** |

### Fix A: the bus is drawn on top of the signs

At 1280 (around 0.3–0.8 s, and again at 9.1–9.4 s), the red bus crosses *in front of* the "55p a work mile / first 10,000" sign and covers "first 10,000". At 9.1–9.4 s it also covers the "Drive logged" plate. The coding agent's own `london-uk-london-390.png` has it covering "Home" on the Westminster sign, in frame 1. The signs are nearer to us than the bus, so this is a layering error, and it hides our best sign.

- Draw the bus in the **mid layer, behind every sign and post** (and behind the near trees and bollards).
- Acceptance: at 390 and 1280, no frame in the loop has the bus over any sign face.

### Fix B: ground the P sign, and make it a little smaller

At 390 the P panel now grows to about 45 CSS px, at the very top of the frame. It has no post and sits over the road and the Palace roofline. It reads as a badge pasted on the sky, not a sign by the kerb, and it outshouts Elizabeth Tower. At 1280 its top is cut off by the frame during the zoom-out. The 2.5x was my number; it overshot once the sign moved closer.

- **Give it a post:** a grey pole (the same as the other sign posts) from the bottom of the plate down to the **left kerb, at the far end of the bay**. It should stand on the ground, beside where the car stops.
- **Scale it down to about 1.7x the original P panel** (about 30 CSS px at 390, at rest). Keep the "Drive logged" plate text at **≥9 CSS px cap height**, the rule that matters. The plate may be wider than the P panel.
- **The whole sign stays inside the frame**, at 390 and 1280, at rest and throughout the zoom-in and zoom-out. Its top stays below the top of Elizabeth Tower's clock face, so the tower stays the hero.
- **Reduce Motion stills:** the same sign, grounded, in the same place.

### Next

Coding makes fixes A and B and sends 390 and 1280 London strips and stills. Marketing signs off on those images only, then QA, then the founder decides on "publish".
