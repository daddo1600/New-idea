# Brand and zing sign-off: set-up v2 and the home status row

Reviewed 3 October 2026 by the marketing agent, on branch `claude/ios-app-ideas-market-of84qv` at 86a3029.
Covers the set-up redesign (219ed3d, translations 3016475), built from `brand-review-setup.md`, and the home status row (86a3029).
Judged from `milemint/docs/screens/setup-v2-*.png` and `home-status-{before,after}-*.png` (web preview, 390×844), plus the code where a screenshot couldn't show it. No code was changed.

## Verdicts

| Change | Verdict |
|---|---|
| Set-up v2 (Reminders step, "You're all set" arrival, Walks stay walks, contrast) | **PASS with fixes**: 4 required, 4 optional (below) |
| Home status row | **PASS**, no fixes |

Set-up scores against the first review: Motion & Fitness **2 → 4**, You're all set **2 → 4.5**, notification ask **1 → 4.5**. All three were the lowest scores in the flow, and they are now among the best.

---

## 1. Reminders step ("A nudge when it counts."): matches the spec

- It has everything the spec asked for: the eyebrow, title, the honest "Usually one a week. Never ads." line, a real notification as the hero (the existing Sunday recap string), three rows of what we send, the Settings footnote, a sparkling "Turn on notifications" button and "Not now".
- iOS's question now comes only from that button, with the bottom "Tap “Allow”" coach (2b), so it no longer pops up cold over the celebration. That was the biggest trust fix in the review.
- There are no perk alerts on this step, which keeps us within Apple 4.5.4.
- **Deviation, a solid banner** (#F4F7F5, not white at 92%): **accepted.** It's more legible on the gradient, and iOS's light banners look near-opaque anyway.

## 2. "You're all set.": the arrival works

- The sprout hands over from the "YOU DID IT!" overlay to a big GrowingSprout. The ticked tiles pop in, then the "What happens next" road and car, then the sparkle on the button. It now feels like arriving somewhere, as the spec wanted.
- The tiles show only true facts. Logging off shows a gold "!" with "Location is off for now." and hides the timeline (3c, US), as specified.
- The friend's code is now a gold text link, the right weight for an optional extra.
- The rate tiles reuse `domain/regions.ts` (the same figures as step 1), so they add no new claim.

## 3. Motion & Fitness ("Walks stay walks."): right idea, lands well

- The walk-vs-drive scene shows the point at a glance: "✕ Not a drive" on cream, then the car, the sprout and "Drive ✓" on gold. The grey alert mock is gone, replaced by a sparkling "Tap [Allow]" pill.
- Reduce Motion (1r) shows the correct final frame.
- The walker is flipped (`scaleX: -1`), so Apple's left-facing 🚶 walks the right way on iPhone.

## 4. Contrast: the gradient deviation is accepted

- The spec suggested starting at #0B7A55. The coding agent used **#0A7350**, which is slightly deeper. I re-measured it:
  - #D1FAE5 body text: **5.17:1** (it was 2.99:1 on #0E9F6E);
  - #FDE68A eyebrow: **4.71:1** (it was 2.72:1);
  - white title: 5.86:1.
- All pass AA. It still reads as our green, and it applies only where `from` is passed (set-up), so the rest of the app keeps #0E9F6E.

---

## Required fixes (coding agent)

1. **The "✋ Neither" tile makes no sense on its own** (3, 3b, 3r). Out of its question, "Neither" means nothing. Show the existing detail string **"I’ll swipe each drive myself."** in that tile instead, for the `neither` style only. It's already in 10 languages, so there are no new strings. It wraps to 2 lines, as "Shifts or blocks" already does.
2. **The button changes shape when the sparkle starts.** On "You're all set." the primary button is a rounded rectangle (radius 12) while the arrival plays (3b), then becomes a pill when the sparkle starts (3). Give the DONE primary `borderRadius: 999` from its first frame, as the spec said, so only the sparkle arrives and the shape doesn't jump. The Reminders button is a pill already, so this also makes the two match.
3. **The timeline road stops short.** In the final frame (3, 3r) the dark road band ends just after "It appears". The white dashes run on to "Swipe “Work”" with no road under them, which looks unfinished. The band should run from the first stop's centre to the last stop's centre.
4. **Motion step: about 230pt of empty green is still left** between the "Tap [Allow]" pill and the buttons at 390×844. That empty space was half the original complaint. Either:
   - make the scene card taller (about 280pt, with the two lanes spaced further apart, which also gives the chips room); or
   - centre the scene and pill block vertically in the space between the body text and the buttons.

   Check on iPhone SE (667pt) that the buttons stay pinned and nothing clips.

## Optional (nice to have, not blocking)

5. The walker at 60% opacity is muddy on the green (1, 1a). Hold it at about 80%, or put a faint cream disc behind it.
6. Reminders: the stacked second banner peeks out as a blank grey-green strip (2), which could read as a "placeholder bar", something the founder disliked before. Let about 10pt more show with a hint of its title, or tint it white at 60%.
7. Reminders and "All set" have 150 to 170pt free above the button. On iPhone the backups and Sunday-recap tiles fill part of that on "All set". If it still looks empty on device, centre the content block vertically.
8. `setup-v2-0-welcome.png` captured a loading spinner. Recapture it for the founder's screenshot pack (Welcome wasn't changed).

---

## 5. Home status row: PASS

- **Before:** a pill plus a two-line grey sentence beside it ("Every work drive adds to what you can claim."), which wrapped and looked cluttered.
- **After:** one row:
  - logging on: the pulsing "Counting your miles" pill, plus one small chip only when it's worth knowing ("🕔 Until 17:00" during a shift, "🌙 Outside work hours");
  - logging off: an amber "Drives may be missed" pill and a solid green "Turn on ›" chip.
- It's calmer, the problem state is clearer and quicker to fix, and nobody says "tracking".
- The longer explanation moved to the VoiceOver hint, which is good for accessibility.

**The 3 new strings** (not yet reviewed by the translator), sense-checked:

| String | Spanish | French | Polish | pt-BR | zh-Hans | Hindi |
|---|---|---|---|---|---|---|
| Until {{time}} | Hasta las {{time}} ✓ | Jusqu’à {{time}} ✓ | Do {{time}} ✓ | Até {{time}} ✓ | 到 {{time}} ✓ | {{time}} तक ✓ |
| Outside work hours | Fuera del horario laboral ✓ | Hors horaires de travail ✓ | Poza godzinami pracy ✓ | Fora do horário de trabalho ✓ | 工作时间之外 ✓ | काम के घंटों के बाहर ✓ |
| Drives are saved when you park. | Los trayectos se guardan al estacionar. ✓ | Les trajets sont enregistrés quand vous vous garez. ✓ | Przejazdy zapisują się, gdy zaparkujesz. ✓ | Os trajetos são salvos quando você estaciona. ✓ | 停车后行程会自动保存。 ✓ | पार्क करते ही ड्राइव्स सेव होती हैं। ✓ |

- All of these make sense and fit a small chip.
- "Hasta las" matches the app's other Spanish time strings.
- pt-BR "trajetos" is the app's usual word (273 uses, against 28 for "viagens").
- For the translator's pass: zh "到 {{time}}" is fine; "至 {{time}}" would be slightly more polished. Not blocking.

---

## Next

The coding agent makes fixes 1 to 4 and recaptures `setup-v2-1`, `-3`, `-3b` and `-3r`. Marketing will re-check those four screenshots only. QA then reviews the build, and the work goes to the founder with screenshots.
