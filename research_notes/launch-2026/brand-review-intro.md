# Brand and zing review: website first-landing intro (branch `intro-money`, 37f1ffc)

Reviewer: marketing agent. Date: 3 Oct 2026.
Founder's ask: "When you first land on the site and the sprout grows it doesn't replicate what the app does. I want to get them excited with the money climbing up and the season/celebration to match."

## Verdict: PASS with fixes (fixes 1 to 4 must be in before publish; 5 and 6 can follow)

This is the right idea, done well. It now tells the app's story in under three seconds: a road grows into a sprout, the month's money climbs, then a year of it lands in gold. The redrawn autumn is a big step up from the art we pulled. Two things stop it from being a clean pass: the payoff (£2,640) is on screen for about a third of a second, and the tree line along the bottom has candy-pink trees that read as cherry blossom, not autumn.

## What I checked

- The branch screenshots in `website/docs/` (GB autumn at 390 and 1280, US Halloween, AU jacaranda, the three Reduce Motion stills).
- My own frames: a real-time capture at 390 px with a London time zone, polling the page every ~160 ms, plus a 3x close-up of the autumn ground.
- The copy against the app's `milemint/src/components/launch-intro.tsx`.

Measured timing (real time, 390 px, GB):

| Time | What's on screen |
|---|---|
| 0.7 s | figures fade in, counting from £0 / 0 miles |
| ~1.45 s | month lands: £220, 400 miles |
| 1.3 to 1.93 s | year counts £0 to £2,640, gold pop at ~1.93 s |
| 2.2 s | sprout starts flying to the header logo; figures fading |
| 2.35 s | figures at 88% |
| 2.5 s | figures gone |
| 2.8 s | intro finished |

So the final £2,640 is fully visible for about 0.3 s.

## 1. Does it excite?

Mostly yes.
- **Money climbing:** works. The £ figure climbs smoothly with the road, and the boxes are sized to the final value, so nothing jiggles. The month copy under it is gold, which ties it to the dot.
- **Timing:** the weak point. The year starts counting (1.3 s) before the month has landed (1.45 s), so two numbers move at once and neither gets its moment. Then the year lands and is gone almost straight away. Visitors will see a number spin, not read "£2,640".
- **Gold pop:** too small to register. The £2,640 is set at body-text size (about 1 rem), while £220 is the big number. The year figure is the claim the hero repeats, so it should be the bigger moment.
- **Sprout to logo:** lovely. It shrinks and lands on the header mark cleanly at 390 and 1280, and the green lifts away to the hero. Keep it.

## 2. The redrawn autumn: strict review

Good:
- The falling leaves are the best thing in it: real maple, oak and beech shapes with veins, gradient fills, three depths, a gentle flip. They feel crafted, not clip-art.
- The orange-gold leaves on the sprout and the soft sun with its glow make the scene warm and give it a sense of place.
- Layered hills with mist between them give depth.

Not good enough yet:
- **Pink trees.** The near row uses `#FCA5A5` as the sunlit top of the red trees. In the close-up these read as candy floss or cherry blossom. Pink is spring. That's the one note that would make the founder say "low quality".
- **The back row is grey-beige** at 60% opacity over green, so it looks muddy, not hazy. Acceptable as distance, but it adds to a "busy strip" feel at 1280, where the band becomes a long, even border of bobbles.
- **Leaves cross the figures.** Near leaves (26 to 36 px, with shadows) drift over "part-time work driving" and the £ figures (see `intro-gb-autumn-1280.png`, frame 3). In the Reduce Motion still a far leaf sits on "HMRC's" (`intro-gb-autumn-390-reduced.png`).
- The **Skip intro** pill sits on the busy tree line on phones, so it's harder to read.

With fixes 3 and 4 below, I'd call it clearly beautiful and on-brand at phone size, which is where most of our visitors land.

## 3. Copy

Word for word from the app: "{distance} miles · an example month of part-time work driving" and "A year of this is worth {amount} at {authority}’s rate." (with "about … allowance rate" for Canada), from `launch-intro.tsx`. The figures match the research check (£2,640 / US $3,648 / CA about $5,526 / AU $4,550). Nothing says "tracking", and nothing implies we keep data. The greetings ("Autumn is here", "Fall is here" for US/CA) are short and warm. Pass.

## 4. Jacaranda

**Keep it off.** The tree canopies are rich, but the falling florets read as purple pins or tadpoles at small sizes, and the heavy dark trunks cropped at the screen edges feel like a frame rather than a scene. It isn't due until 25 Oct (NSW), so there's time to redraw the florets as soft five-petal bells and revisit then. Halloween also stays off as planned: the pumpkin and witch hat are fun, but they weren't in scope.

## Fixes (precise; for the coding agent)

1. **Give the payoff time** (`website/assets/site.js`, intro timings). Change `T_YEAR = 1300` to `1500`, so the year counts only after the month lands at 1.45 s. Change `T_MORPH = 2200` to `3000` and `END = 2750` to `3550`. The year then lands at ~2.13 s and holds for ~0.9 s before the flight. The never-get-stuck timeout uses `END + 2000`, so it follows automatically. The Reduce Motion path is unaffected.
2. **Make £2,640 the moment** (`site.css`). Set `.ic-year strong { font-size: 1.55em; vertical-align: -0.08em; }` and raise the `ic-land` 40% keyframe to `scale(1.22)` with `text-shadow: 0 0 22px rgba(250,204,21,.95)`. Keep the boxes sized to the final value so nothing shifts.
3. **No pink in autumn** (`website/assets/season.js`).
   - In `NEAR`, replace `['#FCA5A5', '#EF4444', '#991B1B']` with `['#F87171', '#DC2626', '#7F1D1D']` (crimson, not pink).
   - In `AUTUMN` (falling leaves), replace `['#FCA5A5', '#DC2626']` with `['#F87171', '#B91C1C']`.
   - In the back-row `trees(back, …)` colours, warm the beiges to `['#F2C27A', '#E0A25A', '#C0823F']` and `['#EDA37A', '#D9844F', '#B4653A']`, so distance reads as golden haze, not grey.
4. **Keep leaves off the figures** (`site.css`). Add `.intro-stage { z-index: 1; }` so every leaf layer passes behind the sprout and the copy. This also fixes the leaf on "HMRC's" in the Reduce Motion still.
5. *(Can follow.)* Skip pill: give `.intro-skip` `background: rgba(4, 56, 42, .55); backdrop-filter: blur(6px);` so it stays readable over the trees.
6. *(Can follow; preview only.)* `?country=GB` changes the figures but not the season greeting: a US-time-zone preview shows "Fall is here" next to £220. In `season.js` `country()`, honour `?country=` first, as `site.js visitorCountry()` does. Real visitors aren't affected (time zone drives both).

Once 1 to 4 are in, please send fresh 390 and 1280 frames of GB autumn (including the held £2,640 and the Reduce Motion still) back to marketing for a quick look. That doesn't need another full review. QA then signs off on function.
