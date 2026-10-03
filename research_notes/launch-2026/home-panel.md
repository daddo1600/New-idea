# Home screen additions: simulated user panel

October 2026. Four proposed additions to Home for set-hours users, tested on 24 simulated users and three reviewers. This is a simulation, not research with real people (see Caveats).

Home today (`src/app/(tabs)/index.tsx`): summary card, tracking card, any nudges, the "All drives sorted" row and the drive list. Gig users also get the swipe-to-start shift bar.

## 1. Top answers

- **Build the "This week" strip first.** It was the clear favourite (67% yes, 4.2/5). It answers the question people actually have, "is this thing working, and what is it worth?", without them doing anything.
- **The Work day pill is worth building, but not with fixed hours only.** Set-hours workers on regular hours liked it (46% yes, 38% maybe). Every rota, shift and self-employed user said it would be wrong half the week. It needs per-day hours, overnight hours and a "Start work now" button.
- **Use "Work hours", not "On the clock" or "At work".** "On the clock" sounded like hourly pay to self-employed and UK users. "At work" sounded like a place. Keep "Day off today" and "Working late", but each needs a clear result and an undo.
- **Cut the growing sprout from Home.** It split the panel (29% yes, 38% no, 2.6/5), and $10 felt patronising to most earners over about $40k. Keep milestones where they already live (celebrations and the Milestones screen). At most, add one quiet "Next milestone" line under the summary card.
- **The tip of the week is cheap and liked (54% yes), with conditions.** It must be checked for each country's tax rules, shown at most once a week, easy to dismiss, and never stacked on top of other nudges.
- **Calm, not sparkly.** Reviewers and older, low-vision and sceptical users all asked for no animated gold on the set-hours pill. Respect Reduce Motion, give VoiceOver one clear sentence per element, and fold "Tracking on" into the Work day pill so Home gains information without gaining a card.

## 2. Scorecard per feature

| Feature | Yes / Maybe / No | Typical use | Avg rating | Top like | Top complaint |
|---|---|---|---|---|---|
| Work day pill | 46% / 38% / 17% | Glanced daily; tapped 1–3 times a month | 3.8 / 5 | "I can see the app knows I'm working" | Fixed 9–5 hours don't fit rotas, nights or self-employed days |
| This week strip | 67% / 25% / 8% | Daily for frequent openers; weekly for others | 4.2 / 5 | Seeing each day's money add up | Too dense at large text sizes; Monday start felt odd to some US users |
| Growing sprout | 29% / 33% / 38% | Noticed for the first week or two, then ignored | 2.6 / 5 | A quick early win for new and lower-income users | "$10 is patronising"; childish; duplicates the total |
| Tip of the week | 54% / 38% / 8% | Read weekly, if short | 3.5 / 5 | Learning the commute rule in plain words | Fear of wrong or US-centric advice; "another banner" |

## 3. Per-user table

P = Work day pill, W = This week, S = Sprout, T = Tip. Y = yes, M = maybe, N = no.

| # | User | Opens | P | W | S | T | Key point | Quote |
|---|---|---|---|---|---|---|---|---|
| 1 | Aisha, 34, UK home-care worker, 12 short visits a day | Daily | Y | Y | M | Y | Wants each visit to add up; $10 hit on day one | "Show me the twelve drives turning into money." |
| 2 | Gary, 52, UK district nurse | Weekly | Y | Y | N | Y | Pill reassures; sprout "for kids" | "Just tell me it's counting." |
| 3 | Dean, 41, UK self-employed plumber | Few times a week | M | Y | M | Y | Hours change daily; emergency call-outs at night | "I'm never off the clock, mate." |
| 4 | Mia, 29, AU electrician | Daily | M | Y | Y | M | Likes the sprout; pill needs 7:00 starts and Saturdays | "Cute, but my hours aren't anyone's 9 to 5." |
| 5 | Priya, 31, UK estate agent, works Saturdays | Daily | Y | Y | M | M | "Working late" for evening viewings is perfect | "Late viewings are half my driving." |
| 6 | Jordan, 45, US field sales rep, $95k | Daily | Y | Y | N | M | $10 goal is insulting; wants weekly total | "Ten bucks is my lunch." |
| 7 | Claire, 38, CA teacher across two schools | Weekly | M | M | N | Y | Only the mid-day drive counts; the tip about this sold her | "Finally someone said it plainly." |
| 8 | Tom, 27, UK office worker, occasional client visits | Monthly | N | M | N | M | Most days aren't driving days; pill would mislead | "Most days I'm at a desk, not 'on the clock'." |
| 9 | Luis, 23, US pharmacy delivery, fixed hours | Daily | Y | Y | Y | M | Loves the growing columns | "Seeing Tuesday grow is weirdly satisfying." |
| 10 | Fiona, 44, UK social worker | Weekly | Y | Y | M | Y | "Day off today" useful for training days | "Day off: one tap. Good." |
| 11 | Rosa, 36, US self-employed cleaner, Spanish-first | Daily | Y | Y | Y | Y | Short words help; wants money first | "The dollars, big, first." |
| 12 | Ben, 26, AU dog walker | Daily | M | Y | Y | M | Walks spread 6:00–19:00 with a gap | "My day has a hole in the middle." |
| 13 | Kemi, 30, UK care assistant, nights and weekends rota | Daily | N | Y | M | M | Night shifts cross midnight; rota changes weekly | "I'd use it if I could put my rota in." |
| 14 | Ryan, 33, CA office job plus weekend delivery | Daily | Y | Y | M | M | Needs pill on weekdays and Start shift at weekends | "Which button am I supposed to press on Saturday?" |
| 15 | Helen, 48, UK self-employed surveyor, hates gamification | Weekly | M | M | N | N | Wants the sprout and tips switched off | "I'm not a Tamagotchi. Give me the numbers." |
| 16 | Margaret, 67, UK mobile hairdresser, less techy | Weekly | M | M | Y | Y | Small text and seven columns confuse her | "Lovely little plant. What are all these bars?" |
| 17 | David, 55, US insurance adjuster, low vision, VoiceOver | Daily | Y | N | M | Y | Strip unusable if each bar is a separate unlabelled element | "Read me the week in one sentence." |
| 18 | Sarah, 40, AU community nurse, rotating shifts | Weekly | N | Y | N | Y | Fixed hours wrong two weeks in three | "My roster is a PDF that changes every fortnight." |
| 19 | Hamish, 58, AU rural vet, long drives | At tax time | M | M | N | Y | Will rarely see Home; likes accurate tips | "Tell me the ATO rule, not a pep talk." |
| 20 | Jenna, 32, US home health aide | Daily | Y | Y | Y | Y | Sprout motivates on low pay | "Ten dollars matters to me, honestly." |
| 21 | Raj, 37, CA IT field technician | Monthly | M | M | N | N | Wants less on Home, not more | "Every app wants to be my friend now." |
| 22 | Chloe, 21, UK student nurse, placement plus bank shifts | Several times a day | M | Y | Y | Y | Bank shifts booked at short notice | "Let me tap 'working now' when the agency rings." |
| 23 | Mark, 58, US self-employed landscaper | At tax time | N | N | N | M | Won't see any of it until April | "I open it once a year. Make that once count." |
| 24 | Anne, 46, AU disability support worker | Daily | Y | Y | M | Y | Back-to-back clients; tip about between-client drives helpful | "That tip would've saved me hundreds last year." |

## 4. Wording verdicts

**"On the clock" vs "At work" vs "Work hours".**
- "On the clock": liked by US and Canadian employees (Jordan, Luis). Disliked by the self-employed (Dean, Helen, Rosa) and by UK users, who hear "paid by the hour". It also translates badly.
- "At work": misread as a location ("I'm in the van, not at work"). It also clashes with the saved place called "Work".
- "Work hours": understood by all 24, neutral for employed and self-employed, and it matches the setup copy "Drives in your hours count as work".
- **Verdict: "Work hours".**

**Recommended pill copy** (times in the device's format, so 9:00–17:00 in the UK and Australia, 9 AM–5 PM in the US):
- In hours: **"Work hours · 9:00–17:00"**, second line **"Drives now count as work"**.
- Out of hours: **"Outside work hours · next: tomorrow 9:00"**. Users preferred "next:" to "back at", which read as a promise from the app rather than the start of their hours.
- Before a weekend or day off: **"Outside work hours · next: Monday 9:00"**.
- Day off set: **"Day off · drives today are personal"**, with **"Undo"**.
- Working late set: **"Work hours · until 19:00 today"**.
- Rota user with nothing set today: **"No work hours today"**, with button **"Start work now"**.
- Started manually: **"Working now · since 14:05"**, with button **"Stop work"**.

**"Day off today".** Understood by 22 of 24. Two worried that tapping it at 16:00 would wipe out the morning's work drives.
- **Keep "Day off today".** Confirm with: **"Make today's drives personal? 3 drives so far will change."** Buttons: **"Make personal"** and **"Cancel"**.
- After tapping: a toast **"Today's drives are personal · Undo"**.

**"Working late".** Liked by Priya, Fiona and Luis. Dean and Ben asked "until when?", and Mia asked about starting early.
- **Keep "Working late".** It opens a short choice: **"Until 18:00 · 19:00 · 20:00 · Until I stop"**.
- Add **"Started early"** only if testers ask for it. Otherwise "Start work now" covers early starts.

**Sprout goal amount.**
- $10 felt patronising to 13 of 24, mostly earners over $40k and professionals. It felt fine to new, younger and lower-paid users (Jenna, Rosa, Luis).
- A home-care worker hits $10 on day one, so the first celebration means little.
- **Verdict:** if milestones stay, start at **25 in local currency** (£25, $25, C$25, A$25), then 100, 250, 500 and 1,000, then "your best month". Copy: **"Next milestone: £100 · £41 so far"**. Never say "only £x to go!".

**Tip of the week.** The proposed line is good but too absolute for every country. In the UK, for example, travel to a temporary workplace can count.
- Label it **"Worth knowing"**, not "Tip of the week". "Tip" read as salesy to Helen and Raj.
- Example (UK): **"Drives between two jobs count. Your usual drive to your regular workplace doesn't."** Add a **"More"** link to a short explainer, and a **"Hide tips"** option.

**This week strip.**
- Title: **"This week · £23.10"**.
- Day columns show money only. Distance appears on tap: **"Tue · 14.2 mi · £6.39"**.
- The week starts on the locale's first day: Monday in the UK, Australia and most of Canada; Sunday is acceptable in the US.
- Day one: **"Your week starts here"**, not a row of £0.00s, which three users read as "broken".

## 5. Debate: three reviewers

**Product designer:** Set-hours users get nothing that shows the app is alive; gig workers get a big live control. The pill gives the same reassurance, and the strip shows the value daily. I'd keep the sprout. The name is MileSprout.

**Accessibility specialist:** The brand doesn't need to animate. Gold on pale green fails contrast if it carries text. Seven tiny bars must become a list at large text sizes, with a one-sentence VoiceOver summary and one element per day. The pill's actions should be VoiceOver custom actions, and shaded days can't rely on colour alone.

**Founder-advisor (sceptic):** Home already shows up to eight cards when things go wrong. What comes off when this goes on, and what moves a metric? The strip is the one I believe drives retention: a reason to open the app on Friday. The pill cuts errors and builds trust, which is slower retention. None of these sells Pro alone; the honest link is "Export this week" beside the strip's total. The sprout duplicates the summary total and existing celebrations. Cut it.

**Designer, conceding:** Fine. Fold "Tracking on" into the pill so we add one row, not two. The sprout can live as the Milestones screen illustration.

**Agreed:** build the pill and the strip, ship the tip as an experiment, and keep the sprout off Home.

## 6. Must-change list before building

1. **Irregular hours support in the Work day pill.**
   - Per-day hours in a weekly pattern, including days with no hours.
   - Overnight hours that cross midnight (22:00–07:00).
   - Split days (6:00–10:00 and 15:00–19:00).
   - Tap a day in the week strip to set or change that day's hours ("Thu: 14:00–22:00").
   - "Start work now" / "Stop work" for bank, agency and call-out work.
   - A fortnightly or rota pattern can wait for v2.
2. **Shift and hours together.** Users with a job plus gig work need one rule: if a shift is running, it wins and the pill hides. Let set-hours users "Start a shift" from the pill's menu. Never show both controls at once.
3. **Day off and Working late must be reversible.** Confirm before changing past drives, offer undo, and log changes so the report stays defensible.
4. **No sparkle animation on the set-hours pill.** Use a static leaf or dot. If any motion stays, turn it off under Reduce Motion, along with growing columns and celebration motion.
5. **VoiceOver labels.**
   - Pill: "Work hours, 9 AM to 5 PM. Drives now count as work. Actions available: Day off today, Working late."
   - Strip summary: "This week, £23.10 for work, 51 miles."
   - Each day: "Tuesday, today, £6.39, 14.2 miles for work" or "Saturday, day off, no work drives".
6. **Large text.** At accessibility sizes, the strip becomes a vertical list of days and the pill wraps to two lines. No truncation of times or money.
7. **Don't nag.**
   - None of these features sends notifications.
   - The tip appears at most once a week and can be dismissed.
   - Days off are empty, never red.
   - No streaks.
   - Only one coaching line (tip or nudge) is visible at a time; tax-critical nudges win.
8. **Goal amounts.** If milestones appear on Home at all, start at 25 in local currency. Use the region's currency and units, and offer a way to hide them.
9. **Tips reviewed per country.** Write separate UK, US, Canada and Australia versions and check them against HMRC, IRS, CRA and ATO guidance. For US employees, say plainly that work mileage is usually for reimbursement, not a deduction.
10. **Correct "next" times.** Account for weekends, days off and the overnight case ("next: Monday 9:00", not "tomorrow").
11. **Tax-time openers.** Let the strip swipe back to earlier weeks; the summary card stays first.

## 7. Recommended build order, cuts and layout

**Build order**
1. **This week strip**, with day-one state, VoiceOver summary, large-text list and tap-to-see-a-day.
2. **Work day pill**, with weekly per-day hours, overnight hours, Start work now, Day off today (with undo), Working late (with an end time) and "Tracking on" folded in.
3. **Worth knowing tip**, country-checked, weekly and dismissable. Run it as a four-week experiment and keep it only if dismiss rates stay low.
4. **Tap a day in the strip to set its hours.** This joins features 1 and 2 for rota workers.

**Cut**
- The growing sprout card on Home.
- The animated gold sparkle for set-hours users.
- The "$10" first goal.
- Optional later: one quiet "Next milestone" line under the summary card.

**Home layout, top to bottom (set-hours user)**
1. Work day pill. It takes the shift bar's place and includes a small "Tracking on" dot. The full tracking card appears only when there is a problem.
2. Summary card ("Deductions found…", Export report).
3. This week strip.
4. Any urgent nudges: tracking problem, backup, purpose needed, relief unclaimed.
5. "Worth knowing" tip, only when no nudge is showing.
6. "All drives sorted ✓ / See all drives".
7. Drive list.

## 8. Caveats

- **This is a simulation.** The 24 users and three reviewers are invented personas based on general knowledge, not real people. The percentages and ratings show direction, not measurement.
- **No web research was done.** Tax-rule wording in the tips must be checked against each tax office's current guidance before shipping.
- **Validate with the founding testers** using mock-ups of the pill and the strip. Include rota workers, a VoiceOver user, someone over 65 and a tax-time-only user, then check whether opens rise after the strip ships.
- **Tax-time-only users** will barely see any of this; the report and summary card matter more to them.
