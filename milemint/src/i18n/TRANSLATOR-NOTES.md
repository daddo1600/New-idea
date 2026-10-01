# Notes for translators

Context for short or ambiguous lines, by the part of the app they come from. Keys are the English text.

## Settings helper

- Mon…Sun: short weekday labels in the work-hours editor; keep short.
- Home, Work, Client, Other: kinds of saved place.
- to: between two times ("09:00 to 17:00").
- Remove: removes a work time slot; also confirm button for removing a vehicle.
- Delete: deletes a saved place.
- Change: link to change country or language.
- Language / Country / Places: Settings section headers.
- Shift mode: setting for delivery/courier drivers that adds a Start shift button.
- Use now: make this vehicle the one being driven now. Driving now: status of current vehicle.
- Saving…: button while saving.
- Add shift: add another work time slot on the same day (will be renamed "Add another time").
- {{day}} shift {{number}} start/end, Remove {{day}} shift {{number}}: screen-reader labels; day = short weekday, number = 1,2…
- Check {{days}}: … : days = comma-separated short weekday names.
- {{rule}}. : rule = the country's mileage rate sentence.
- Name, e.g. Golf / Honda PCX / Cargo bike: vehicle name examples; keep model names. Acme HQ: example business name.
- “I’m here now” and “Save as place” must match those buttons' translations.
- iPhone Settings → Notifications: use iOS's own wording.
- “+ Add a place”, “+ Add a vehicle”: keep the "+".
## Other-screens helper

- Free: name of the free plan (table column), not "no cost". Unlimited / Kept, locked / Unlocked: what each plan does with drives over the limit.
- {{count}} a month: free plan's automatic drive limit. Included / Not included: spoken labels for ✓/– cells. Best value: badge on yearly plan.
- {{price}}/year, {{price}}/month: App Store price string. After the {{trial}}, …: trial = e.g. "30-day free trial".
- Done: closes a screen/calendar. Change: change the date. From / To: start and end address of a drive.
- Business / Personal: trip type toggle. Note / Optional: label/placeholder for a personal trip's note. Save: saves trip edits. Delete: confirm deleting a trip.
- Start is a saved place. / End is a saved place.: start/end point of the drive. Vehicle: which car/bike.
- Preparing…: a CSV/PDF file is being created.
- miles / kilometres, miles your delivery app counted: spoken labels for number fields (lowercase).
- {{distance}} miles / km: distance is a formatted number; count passed too (plural objects allowed).
- of business driving this week: caption under a big distance number. worth about {{amount}}: money value.
- {{remaining}} to go to {{goal}}: money left until next milestone. {{label}}: earned / not yet: spoken badge state.
- {{year}} tax year, Start of {{year}}: year = tax-year label like "2025/26". Your {{year}} {{returnName}} is due: returnName already translated.
- Ends {{date}}: tax year end date. {{authority}} mileage report (PDF) · Pro: keep "Pro".
- Something went wrong / Try again: crash screen. Trip, Reports, Tax dates, Language, Your country: screen titles.
## Home helper

- Business / Personal: trip category; not a company. Not sorted: trip not yet marked.
- Today: shown in a small box instead of a day count. days: unit under the number in a small countdown box; keep very short.
- {{hours}}h {{minutes}}m: shift duration e.g. "2h 05m".
- Select / Cancel: start/stop multi-select of trips. Delete: in "Delete trip?" alert.
- Driving: label before the current vehicle's name. Vehicle / Close / Close menu / Menu: screen-reader labels. Trips: list heading.
- Go Pro: upgrade button ("Pro" is the plan name). Free plan: badge for user's plan. Turn on: enables automatic tracking. Tracking on: status pill.
- Stopped · {{distance}}: a drive being recorded stopped moving. found this tax year: under a money amount. {{amount}} found: screen-reader label.
- Tax dates ›: link. Milestones: achievements screen. Missed miles check: compares logged distance with the delivery app's.
- Share it / Keep going: buttons on the milestone celebration.
- Auto: … notes: why a trip was auto-classified; swipe left/right = gesture direction.
- {{hint}}. Swipe the button to the right, or double-tap.: hint is a full sentence without final period.
- Reports & export / Export report: the mileage report for the tax office.
- worth up to {{amount}}: item in a " · " list on a locked drive.
## Onboarding helper

- Use: applies a purpose the user typed. Other…: opens a box to type your own purpose. Close: backdrop that closes the sheet.
- Start / Finish: start and end time of a work slot. Start earlier/later, Finish earlier/later: −/+ buttons moving a time by 30 minutes.
- Automatic / Private / Worth money / Light on battery: short feature headings.
- Home / Work: saved place names and field labels. {{label}} address: spoken name of the address box.
- Neither: no set hours and no shifts. Set hours: "I work fixed hours" (noun phrase). Shifts & rounds (delivery apps): courier work pattern.
- Car or van / Motorbike / Moped or motorbike / Bicycle: vehicle buttons, must fit a third of the screen width.
- USA / UK / Canada / Australia: short country names in a half-width tile. miles / km: unit after currency symbol "£ · miles".
- ↑ {{step}} OF 2: all caps; arrow points at iOS's pop-up. STEP 2 · TRACKING: all-caps eyebrow. Step 1 · Country etc: shown in capitals; translate in normal case.
- Tap here: badge pointing at the "Always" row. ✓ Found: an address has been located.
- e.g. Quote for Acme Ltd: example business purpose.
**iOS wording** (must match Apple's official translation for the language): Allow While Using App; Change to Always Allow; Open Settings; Location; Always; Never; Ask Next Time Or When I Share; While Using the App; ALLOW LOCATION ACCESS (iOS Settings section header, caps); Allow Once; Keep Only While Using; Settings → Notifications.
## Domain helper

- WEEKLY_MESSAGES are jokes/puns: ADAPT, don't translate literally; short, friendly, about sorting this week's drives. Knock-knock: use a local joke format or rewrite. "Sunday scaries" = Sunday-evening dread. "Swipe right on savings"/"Easiest date of the week" = dating-app pun. Shoebox of receipts = messy paper records. '…unless you set your work hours' continues 'Miles don't sort themselves…'.
- Neutral shift cheers: casual send-offs ("Game on!" = let's start; "Time to roll!" = start driving).
- Season greetings: 'Spring has sprung' idiom; 'G’day!' = casual hello; Fall/Autumn miles add up = same meaning.
- 'You’ve earned every penny of it.': "every penny" = every bit; don't name a currency.
- Tax terms keep as written (gloss in brackets OK): Self Assessment, Making Tax Digital/MTD, Mileage Allowance Relief, Car, van and travel expenses, Schedule C Part IV, Car and truck expenses, Form 1040/1040-ES, T2125, T2200, T777, P87, BAS, PAYG, GST, D1 Work-related car expenses, cents per km method, simplified expenses.
- {{rate}} a mile / a km: rate is a formatted amount like "55p"; "a mile" = per mile.
- {{year}}: tax-year label "2026", "2026/27", "2026–27". {{date}}: formatted date.
- {{achievement}}: milestone title. 'today' stands alone as the countdown value.
- 'My bike' = bicycle (motorbike default is 'My motorbike').
- Single-use invites (Invite friends, Settings, the friend's-code box): every share makes a new invite with its own code, and each code works for one friend. Never say "your code" as if there were one permanent code. "Invites sent: {{count}}" is a counter label. "Your invite code is {{code}}…" goes inside the share message to a friend (informal, like a text). "…on their way once the invite is confirmed": the friend's bonus waits until iCloud confirms the invite, so don't promise it now. "Apple Account" = Apple's own name in your language.
