# The "On shift?" nudge

*Marketing, 3 October 2026. Code read the same day: `src/app/(tabs)/index.tsx`, `src/components/shift-prompts.tsx`, `src/components/home/shift-bar.tsx`, `src/components/trips/trip-row.tsx`, `src/tracking/background.ts`, `src/tracking/shift-notifications.ts`, `src/live-activity/not-working.ts`, `src/domain/shift-split.ts`, `src/domain/classify-rules.ts`, `src/domain/week-strip.ts`, `src/db/shifts-repo.ts`, `src/db/settings-repo.ts`.*

**The case.** A gig-worker set-up user drove home from a friend's. The app saved the drive and the row asked "Work or personal?". The founder wants a quick check at that moment: if they are working, one swipe on the shift bar sorts this and every later drive as work, so nothing is left to sort. Their words: "just checking you're not on shift, if you are give the [shift bar] a swipe at the top so all is logged as work", and "we just want to make sure all your miles/kilometres are logged".

**What we chose, in one line.** One card, in the slot the shift prompts already use, shown once a day at most when a drive is saved outside a shift or outside work hours, with two taps: **Start shift** (shift from this drive, so it's work) or **Not working** (this drive is personal, nothing more today). The same words go out as a notification when the app is closed, only if notifications are allowed and the new "Shift check-ins" switch is on.

---

## 1. Copy

Tone follows the shift bar ("Every drive until you end your shift counts as work.") and the lock screen ("Not working"). No "tracking". No "money back" or "claim" lines: `decisions.md` rejected "money back at tax time" claims, and `website-claims-check.md` (§3, §1 verdict) says to avoid "claim" words in nudges because an unlogged drive can still be claimed in all four countries; what's true is that every drive logged as work is counted. The money is already on the row ("Worth £3.74 if work"), so the card doesn't repeat it.

Every title and line is under 12 words. New strings are marked **new**; the rest exist.

### Shift mode (`settings.shiftMode`, no shift running)

**Parked card** (Home, under the shift bar):

| | Text | Words |
|---|---|---|
| Title | **On shift?** (new) | 2 |
| Line | **Start it and every drive from now counts as work.** (new) | 10 |
| Button 1 | Start shift (exists) | |
| Button 2 | Not working (exists, from the lock screen) | |

The shift starts from the drive that was just saved (`shiftMode.startFrom`, as "Start shift from 10:40?" does), so that drive is work too, and the bar swipes itself on with its usual cheer. That's how people learn the swipe: they see it happen.

**Notification** (app closed when the drive was saved):

| | Text | Words |
|---|---|---|
| Title | On shift? (same string) | 2 |
| Body | **Drive saved. Start your shift and it counts as work.** (new) | 9 |
| Actions | Start shift · Not working (same strings, as notification buttons) | |

### Set-hours mode (`settings.workHoursEnabled`, drive outside the hours)

Check of what the app offers today: a drive that starts outside the work week is sorted **personal** on save (`classify-rules.ts` "work-hours": inside is business, outside is personal) and the row reads "Auto: outside your work hours · swipe right if it was work". There is no "Working late" or "Start work now" yet; both are planned with the Work day pill (`home-panel.md` §6.1 and §7). So for now the nudge's "yes" sorts this one drive as work. When the pill ships, the same tap should also run its "Working late" (keep today's hours open until an end time), so later drives that evening are work without asking again.

**Parked card:**

| | Text | Words |
|---|---|---|
| Title, after today's hours ended | **Working late?** (new) | 2 |
| Title, before today's hours or on a day off | **Working today?** (new) | 2 |
| Line | **This drive is outside your hours. Count it as work?** (new) | 10 |
| Button 1 | **Yes, it was work** (new) | |
| Button 2 | Not working (exists) | |

**Notification:**

| | Text | Words |
|---|---|---|
| Title | Working late? / Working today? (same strings) | 2 |
| Body | **Drive saved as personal. Tap if it was work.** (new) | 9 |
| Actions | Yes, it was work · Not working | |

### Settings → Notifications

| | Text |
|---|---|
| Switch | **Shift check-ins** (new) |
| Description | **A quick "On shift?" after a drive outside your shift or hours.** (new, 11 words) |

### Lines we're not using, and why

- "Just checking you're not on shift…" (founder's draft): right idea, too long for a card; "On shift?" carries it.
- "…so you can claim it all back": a "claim/money back" line, ruled out above.
- "Count every mile" / "every kilometre": needs a km version per language and repeats the row's money line. Dropped.
- "Swipe the bar above…": the card's button does the same thing and works for VoiceOver; the bar animating on teaches the swipe better than telling.

---

## 2. Rules

### When it shows

A drive has just been saved after parking (the background save in `tracking/background.ts`; the live banner already says "If you've parked, the trip is saved after 5 minutes"), and **all** of these hold:

1. The drive was logged automatically (`source === 'auto'`), is not a commute (`reason !== 'commute'`), and the lock screen's "Not working" wasn't tapped during it (`notWorkingDriveAt`).
2. **Shift mode:** `shiftMode` on, no shift running, and the drive isn't cut off a shift (`offShiftId === null`: the drive home in the 10-minute grace after "End shift" is left to the row, as now). The drive is `unclassified`.
   **Set-hours mode:** `workHoursEnabled` on and the drive was sorted personal with `autoReason === 'work-hours'` (outside the week). It is never shown inside the hours, because a drive inside them is already work.
3. Not shown yet today (local date, `shiftNudgeShownOn`), and today isn't muted (`shiftNudgeMutedOn`, set by "Not working").
4. **Not in the night window, 22:00–06:00 local by the drive's end time, unless they usually work then.** "Usual" comes from the only data the app has:
   - set-hours mode: the work week (`settings.workWeek`), the same per-weekday spans `week-strip.ts` uses for `isWorkDay`. Usual = a span on that weekday that covers the hour, or ends/starts within 2 hours of it (the "working late" case);
   - shift mode: `listShifts` history. Usual = at least 2 shifts in the last 28 days that were on at that time of day.
   There is no other "usual" data (the week strip only carries distance and money per day).
5. Nothing else is in the prompt slot. "Start shift from {{time}}?" (`backdateStart`, needs 2 or more drives in a chain) wins when it applies; "End your shift?" can't coincide (a shift is running). Home's rule stands: one coaching card at a time, tax-critical first (`home-panel.md` §6.7).

### Quiet rules

- At most **once a day**, card or notification, whichever came first. Opening the app after the notification shows the same card; answering either clears both.
- **"Not working"** sorts the drive personal (shift mode; in hours mode it's already personal) and mutes nudges until local midnight.
- After **three days running** of "Not working" with no shift started, no nudges for 14 days: the set-up probably doesn't fit how they work, and the Sunday reminder covers the sorting.
- Dismissing by sorting the row directly (swipe or the Work/Personal buttons) counts as an answer.
- No streaks, no counting of ignored nudges, nothing red.

### One-tap actions

| Tap | Shift mode | Set-hours mode |
|---|---|---|
| **Start shift** / **Yes, it was work** | `shiftMode.startFrom(drive.startedAt)`: shift on from the drive's start, the drive gets the `shiftId`, purpose "Deliveries" or the usual one, the Live Activity starts, the bar swipes on with its cheer. | `setClassification(business)` with the usual purpose. Later: also the pill's "Working late" with an end time. |
| **Not working** | `setClassification(personal)`, mute today. | Dismiss (already personal), mute today. |

### Where it sits: one element, not two

- **The card** is a `PromptCard` (`components/shift-prompts.tsx`), rendered in `index.tsx`'s header **directly under the `ShiftBar`**, in the same place and order as `BackdateOffer` and `EndShiftPrompt`: it is the third of those, and only one of the three shows. The shift bar is right above it, so "Start shift" and the bar read as one thing.
- **The row.** The drive sits first in Home's unsorted list, and its row's accent line ("Work or personal? Worth £3.74 if work.") would be a second prompt. While the card is up for that drive, the row keeps its Work/Personal buttons (needed for VoiceOver and anyone who ignores the card) but **drops the accent line**; in set-hours mode the note shortens to "Auto: outside your work hours" (the "· swipe right if it was work" half is what the card now asks). Once the card is answered or gone, the row is back to normal.
- There is no separate "parked" or "just saved" card in the app today; "when they've parked" is the save moment, and this slot is where the app already talks to the user about it.
- **The notification** is a local one, scheduled on the phone like "End your shift?" (`shift-notifications.ts`), fired straight away at save time when the app is in the background. Its two actions are notification buttons (an expo-notifications category) so it's one tap from the lock screen; tapping the body opens Home with the card (`data: { url: '/' }`). Only if `getPermissionsAsync().granted` and the "Shift check-ins" switch is on. That switch should also cover "End your shift?", which today has no switch of its own. It respects the quiet rules above, and iOS Focus and Do Not Disturb apply as normal (ordinary interruption level, not time-sensitive). Never on the web demo (`REMINDERS_SUPPORTED`).

---

## 3. Apple and legal

- **Guideline 4.5.4** (quoted and checked 3 Oct 2026 in `brand-review-setup.md`, "Apple 4.5.4"): push notifications must not be used for promotions or direct marketing without explicit opt-in and an in-app opt-out. This nudge is neither: it is a local notification about a drive the user just made, asking a question the app would otherwise ask on screen, with no mention of Pro, perks or partners (and `decisions.md` already bars Pro teasers from notifications and the parked card). It qualifies as a useful, functional notification. We still give it an opt-out (the "Shift check-ins" switch) and it only fires when iOS notifications are allowed, which is more than 4.5.4 asks of it.
- Nothing is sent anywhere: the notification is scheduled on the phone, and the drive stays on the phone.
- No tax claim is made in the copy, so nothing here needs a tax source. "Counts as work" means what the app does with the drive, not what a tax office will allow.
- Review note: `brand-review-setup.md` says "Usually one a week" is the honest count of routine notifications. This one is occasional (at most daily, only on days with an out-of-hours drive, muted after three "Not working"s), so that line still holds; if the founder wants it word-perfect, "usually one a week, plus the odd shift check-in".

---

## 4. Hand-off

### Coding

1. New pure helper, say `src/domain/shift-nudge.ts`: `shouldNudge({ trip, settings, shift, shifts, now })` with the five conditions in §2 and the night-window "usual" check; unit-tested (the founder's case, night, usual night, muted, once a day, backdate chain wins, grace-period drive, commute, hours-mode inside/outside, day off).
2. Settings keys: `shiftNudgeShownOn`, `shiftNudgeMutedOn` (local dates), `shiftNudgeNotWorkingRun` (count), `shiftCheckIns` (bool, default true). Migration as usual.
3. `index.tsx`: the card after `EndShiftPrompt` in the prompt slot; the row's accent line and the hours note shortened while the card is up for that trip; "Start shift" → `startFrom`, "Yes, it was work" → business with usual purpose, "Not working" → personal and mute.
4. `tracking/background.ts`: after the save, if the app isn't active, schedule the notification; `shift-notifications.ts`: `scheduleShiftNudge`, `cancelShiftNudge`, a notification category with the two actions; the response handler runs the same two actions and cancels the card's trigger. Cancel on app open once answered.
5. Settings → Notifications: the "Shift check-ins" switch, wired to both this and "End your shift?".
6. Reduce Motion: the card enters like the other prompts (no new motion); the bar's cheer already respects it.
7. Worklets: none needed. iOS 16.4: notification categories and actions are fine.

### Translator

**10 new strings**, in all 9 other languages (es, pt-BR, fr, ro, pl, hi, pa, bn, zh-Hans); "Start shift" and "Not working" exist already:

1. On shift?
2. Start it and every drive from now counts as work.
3. Drive saved. Start your shift and it counts as work.
4. Working late?
5. Working today?
6. This drive is outside your hours. Count it as work?
7. Drive saved as personal. Tap if it was work.
8. Yes, it was work
9. Shift check-ins
10. A quick "On shift?" after a drive outside your shift or hours.

Notes: "work" as in the Work/Personal buttons (`work-wording.md`: drive type, not the place). "Shift" as in "Start shift". Keep titles to two or three words; they're also notification titles.

### QA

1. **Home from a friend's (shift mode, no shift).** Evening drive ends at 20:30. One card under the shift bar, row shows the drive without "Work or personal?" line. Tap **Not working**: row reads Personal, card gone, no card or notification for the rest of the day even after a second drive. Next morning a new drive shows it again.
2. Same case, tap **Start shift**: bar swipes on with the cheer, drive reads "Auto: on shift" with purpose Deliveries, Live Activity shows, no "Start shift from…" offer appears afterwards.
3. Same drive while the app is closed: notification arrives with two buttons; **Not working** from the lock screen sorts it personal without opening the app; tapping the body opens Home with the card; answering one clears the other.
4. Second drive within 45 minutes before answering: "Start shift from {{time}}?" shows instead, never both.
5. Drive within 10 minutes after "End shift": no nudge (the row's "After your shift ended" note as today).
6. Night: drive ends 23:30, no night shifts in the last 28 days → nothing. With 2 night shifts in the last 28 days → card shows.
7. Set-hours Mon–Fri 9–17: drive at 18:10 Tuesday → "Working late?"; Saturday 10:00 → "Working today?"; 14:00 Tuesday → nothing. **Yes, it was work** → Work with the usual purpose; **Not working** → stays personal, muted today.
8. Three days of "Not working": nothing for 14 days; the Sunday reminder still comes.
9. Notifications off in iOS, or "Shift check-ins" off: card only, never a notification. Switch off also silences "End your shift?".
10. Commute (Home ↔ Work with both places set): no nudge.
11. VoiceOver: card title, line and both buttons read; the row's Work/Personal buttons still reachable. Large text: card wraps, nothing cut. Reduce Motion: no new motion.
12. All 10 languages: titles fit a notification title on an iPhone SE.
