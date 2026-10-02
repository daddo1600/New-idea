# Plain-copy audit: words gig drivers understand

October 2026. Branch `plain-copy` (based on `claude/ios-app-ideas-market-of84qv` at 94fd9b1).

**The founder's ask:** "When it comes to gig workers and swiping please use terms they are familiar with in their culture and language. Tally ho might mean nothing to them."

**Who reads the app:** couriers and rideshare drivers in the UK, US, Canada and Australia. Many of them read English as a second language: Romanian, Polish, Brazilian Portuguese, Bengali/Sylheti, Punjabi/Hindi/Urdu, Spanish and Chinese speakers.

**What was checked:** all 1,118 user-facing strings:
- `t()` and `msg()` calls;
- shift cheers, Sunday reminders, health and shift notifications;
- milestones, seasons, celebrations, empty states and share messages;
- settings, onboarding, the tutorial and the shift bar.

**Rules for the new English:**
- No idioms, slang, puns or culture-bound references.
- Swipe and shift hints say "work" and name the jobs couriers actually do.
- The tone stays friendly.
- The regional cheer lists keep only local words that anyone living in that country knows.

## 1. English: before → after

### Shift cheers (`src/domain/cheers.ts`, English regional lists)

| Region | Removed | Now |
|---|---|---|
| UK | Tally ho! · Right, let’s crack on! · Off we pop! · Chocks away! · Game on! · Wheels on, cuppa later | Off you go! 🚗 · Have a good shift! · Right, let’s go! · Drive safely! · Let’s go! · Here we go! · Off we go! · Cheers, have a good shift! ☕ |
| US | Pedal to the metal! · Showtime! · Game time! · Let’s get this bread! | Let’s roll! · Let’s go! · Let’s do this! · Have a good shift! · Drive safely! · Go get those orders! 📦 · Here we go! |
| Canada | Giv’er! · Beauty, let’s go! · Off to the races! · Game on! | Let’s go, eh! · Let’s go! · Have a good shift! · Drive safely! · Go get those orders! · Let’s do this! · Here we go! |
| Australia | Righto · Let’s get cracking! · Giddy up! · Too easy! · She’ll be right! | No worries, let’s go! · G’day! Have a good shift · Right, let’s go! · Off we go! · Drive safely! · Let’s do this! · Here we go! |

**Translated (neutral) list:** "Time to roll! 🚗" and "Game on! 🎯" are replaced by "Have a good shift! 👋" and "Drive safely! 🚗".

### Sunday reminders (`src/domain/reminders.ts`)

| Before (title / body) | After (title / body) |
|---|---|
| Your miles called 📞 (+ km) / They’d like to be sorted before Monday. It takes a minute. | Your drives are waiting 📋 / Sort them before Monday. It takes a minute. |
| Plot twist: driving pays / Swipe this week’s trips business or personal and see what you’ve earned back. | What did you drive for work? / Sort this week’s drives and see what they’re worth. |
| Free money alert 💸 / Well, technically it’s your money. Sort this week’s drives to claim it back. | Count every work drive 🚗 / Sort this week’s drives so none are left out. |
| Your car did the hard part / Now spend one minute taking the credit. Sort this week’s drives. | Your car did the hard part / Now take one minute to sort this week’s drives. |
| Knock knock 🚪 / Who’s there? This week’s drives. They’d like to know if they were business. | A quick question 🙋 / Were this week’s drives for work or personal? Swipe to sort them. |
| Low effort, high reward / A few swipes tonight beats a shoebox of receipts at tax time. | It only takes a minute ⏱️ / A few swipes tonight saves you a lot of work at tax time. |
| Sunday scaries? Not for your taxes / Sort this week’s drives and bank the deduction. Done in a minute. | Sunday check-in 🗓️ / Sort this week’s drives and keep your records up to date. |
| Future you says thanks 🙌 / (body unchanged) | Make tax time easy 🙌 / (body unchanged) |
| Every business mile counts / Literally. We counted them. Come and sort this week’s. | Every business mile counts / Take a minute to sort this week’s drives. |
| The weekend’s nearly over 🛋️ / Before Monday shows up, give this week’s drives a quick sort. | The weekend’s nearly over 🛋️ / Sort this week’s drives before the new week starts. |
| Swipe right on savings / Business drives swipe right, personal swipe left. Easiest date of the week. | Swipe right for work 👉 / Swipe left for personal. This week’s drives are ready to sort. |
| Miles don’t sort themselves… / …unless you set your work hours. Until then, a few swipes will do. | Miles don’t sort themselves… / …unless you set your work hours. Until then, it only takes a few swipes. |
| Set it and forget it ⏱️ (work-hours nudge) | Let MileSprout sort for you ⏱️ |

### Swipe hints, tutorial, shift bar

| Where | Before | After |
|---|---|---|
| Tutorial bubble | Swipe right for business | Swipe right if it was for work |
| Tutorial bubble | Swipe left for personal | Swipe left if it was personal |
| Tutorial headline (courier) | Now a work drive. Work drives are worth money back. | Now a delivery. Deliveries and pickups are work drives, and they count at tax time. |
| Tutorial headline (others) | (same) | Now a work drive. Work drives count at tax time. |
| Tutorial and shift bar | Every drive until you end it counts as business(.) | Every drive until you end your shift counts as work(.) |
| Shift bar | Every drive counts as business | Every drive counts as work |
| Shift bar | Swipe back to end your shift. A personal errand? Swipe that drive left afterwards. | Swipe back to end your shift. Stopped for something personal? Swipe that drive left afterwards. |
| Home, before the first drive | After each drive, swipe right for business or left for personal. | After each drive, swipe right if it was for work (deliveries, pickups), left if it was personal. |
| Home, shift workers | Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | When you start work, swipe to start your shift. Every drive in it counts as {{purpose}}. |
| Home header | Ready when you are | Ready for your first drive |
| Shift row help | Drives join or leave the shift by when they started. A drive past the end is cut there. | A drive is part of the shift if it started during the shift. If it goes past the end, it’s cut there. |
| Pro table | Swipe to sort business trips | Swipe to sort your trips |

### Onboarding, settings, milestones, seasons and other lines

| Before | After |
|---|---|
| Shifts & rounds (delivery apps) | Shifts or blocks (delivery and ride apps) |
| For delivery and courier work (…, DPD and the like): … Every drive in a shift is business. | For delivery and ride app work (…, DPD, Uber and others): … Every drive in a shift counts as work. |
| Delivery or collection (purpose chip, shown text) | Delivery or pickup. The saved key is unchanged; `en.ts` shows the new text, so old trips still match. |
| Nice one! | Great! |
| Never miss a mile. | Never miss a drive. (Also reads right in km countries.) |
| Light on battery | Uses little battery |
| Want a Sunday nudge? | Want a reminder on Sundays? |
| A quick (slightly cheeky) reminder each Sunday evening to sort the week’s drives, so nothing goes unclaimed. | A short reminder each Sunday evening to sort the week’s drives, so you don’t miss anything you can claim. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | A short reminder on Sunday evening to sort the week’s drives. |
| …MileSprout carries on by itself when you come back. | …MileSprout continues by itself when you come back. |
| …your figures are ready whenever a deadline comes round. … | …your figures are ready for every deadline. … |
| Have to hand: your employer’s name… | You’ll need: your employer’s name… |
| …Export it now so the figures are to hand. | …Export it now so you have the figures ready. |
| Last call: make sure every business drive is in MileSprout before {{date}}. | Last chance: … |
| A pot that shows what to put aside for tax. Yours for good, even without Pro. | Shows how much to save for tax. Yours to keep, even without Pro. |
| Tracking stays free for good: … | Tracking is always free: … |
| {{amount}} back in your pocket | {{amount}} found for you |
| …You’ve earned every penny of it. | …You earned all of it. |
| …Hard work, properly rewarded. | …That’s your hard work, counted. |
| …That’s real money back at tax time. | …It all counts at tax time. |
| …Nicely done. Keep it rolling. | …Well done. Keep going. |
| MileSprout is on the job. Just drive. | MileSprout logs your drives for you. Just drive. |
| Every drive of it counted as business. (first shift) | Every drive in it counted as work. |
| G’day! Summer on the road ☀️ | Summer on the road ☀️ |
| Sunny days, business miles ☀️ (shown in km countries too) | Summer is here ☀️ |
| Spring has sprung 🌸 | Spring is here 🌸 |
| Wrap up warm out there ❄️ | Stay warm and drive safely ❄️ |
| Autumn miles add up 🍂 / Fall miles add up 🍂 (shown in km countries too) | Autumn is here 🍂 / Fall is here 🍂 |

### Checked and left as they are

These are already plain or are standard terms:
- Let’s go! · Here we go! · Off we go! · Let’s do this!
- Happy Halloween / New Year / holidays
- Good start · Keep going · YOU DID IT! · ALMOST DONE!
- Your car did the hard part
- the share messages
- the health-alert notifications
- "Business or personal?"
- "Auto: … swipe right if it was work"

## 2. Translations

**How the translations were written:**
- 61 new or changed English lines got fresh translations in all nine languages, following each glossary (`src/i18n/glossary/*.md`).
- Puns were not carried over.
- Where a hint names courier work, it uses each language's everyday gig words.
- Placeholders are intact. No changed line has `{{count}}`, so no plural forms changed.
- French uses the file's spacing (a no-break space before ":", a narrow one before "?" and "!").

### Decisions in the review notes that I kept

| Language | Kept | Why |
|---|---|---|
| All | The labels for the "Business" toggle | They are core labels (see section 3). |
| pt-BR | *trajeto*, not *corrida*, for a drive | *Corrida* is the platform's job count. *Corridas* is used only as a courier example ("entregas, corridas"). |
| pl | *przejazd*, not *kurs* | *Kurs* sounds like a taxi ride. |
| fr | *quart* for a shift | Québec French. |
| zh-Hans | No 开车 or 上路 in headings | Double meanings. 出车 and 一路平安 are used instead. |

### Key changes by language

**Polish (pl)**
- Hints use *zlecenia, dostawy*.
- New cheers: "Udanej zmiany!", "Szerokiej drogi!".
- Fixed "Spróbuj go posortować" to "…oznaczyć" in the tutorial. The glossary bans *sortować*.
- Fixed the stiff "Przejazd ćwiczebny · niezapisany" to "Przejazd próbny · nie zostanie zapisany".
- Settings line now reads "Dla kurierów i kierowców z aplikacji…".
- Shift options: "Zmiany lub bloki".

**Romanian (ro)**
- Hints use *comenzi, livrări, curse*.
- Cheers: "Spor la lucru!", "Drum bun!". Both are the natural send-offs. *Ușoară* is avoided, as its review asks.
- Fixed ungrammatical hints such as "Glisează la dreapta pentru de lucru", now "…dacă a fost de lucru".
- Fixed "Trecută ca…", now "Marcată ca…".
- Fixed the off-glossary "de serviciu" in settings and in "Business errand", now "Drum pentru lucru".
- Fixed "{{amount}} înapoi în buzunar", a literal "back in your pocket".

**Brazilian Portuguese (pt-BR)**
- Hints use *entregas, corridas, coletas* and "a trabalho".
- Cheers: "Bom trabalho!", "Dirija com cuidado!".
- Fixed "Um compromisso pessoal?" in the shift bar, which used *viagem* against the glossary.
- "Leve na bateria" is now "Gasta pouca bateria".

**Spanish (es)**
- Hints use *pedidos, entregas, viajes*.
- Cheers: "¡Buen turno!", "¡Conduce con cuidado!".
- The settings line now uses the real button name "Iniciar turno". It used to say "Empezar turno".
- *Acabar* is avoided, as its review asks.

**French (fr)**
- Hints say "pour le travail (livraisons, courses)" rather than the stiff "pour affaires".
- Cheers: "Bon courage !", "Prudence sur la route !".
- "Une course perso ?" in the shift bar is now "Un arrêt personnel ?". *Course* also means a delivery run.
- "Livraison ou collecte" is now "Livraison ou récupération".

**Hindi (hi)**
- Uses the loanwords drivers say: डिलीवरी, पिकअप, शिफ्ट, सॉर्ट.
- Fixed the off-glossary छाँटकर in the tutorial, now सॉर्ट करके.
- "खेल शुरू!" (Game on) is gone.

**Punjabi (pa)**
- Uses ਡਿਲੀਵਰੀ, ਪਿਕਅੱਪ, ਸ਼ਿਫਟ.
- The formal ਅਭਿਆਸ (practice) is now the loanword ਪ੍ਰੈਕਟਿਸ in the tutorial.

**Bengali (bn)**
- Hints use the plain কাজের ("for work") and ডেলিভারি, পিকআপ.
- The formal অনুশীলন (practice) is now প্র্যাকটিস.
- কর্মস্থল is now কাজের জায়গা.
- "ডেলিভারি বা কালেকশন" is now "ডেলিভারি বা পিকআপ".
- The tutorial's off-glossary সাজানো (arrange) is now বাছাই (sort).

**Chinese (zh-Hans)**
- Uses 跑单 in the shift options ("跑单班次（外卖、快递、网约车 App）") and in the settings line ("适合跑单的骑手和司机").
- Uses 送单 and 取货 in the swipe hint.
- Cheers: 开工顺利, 一路平安.
- Fixed the awkward "往返工作地点之间", now "在工作地点之间".

## 3. Recommended, not changed

1. **Rename the "Business" label to "Work" across the app.**
   - The hints now say "work", and couriers think of "work drives", not "business drives".
   - The label still reads "Business", in the trip toggle, the swipe action, "Mark as business" and the "Auto: business by default" line.
   - The stiffest translations of that label are bn ব্যবসায়িক (formal; বিজনেস or কাজের would be natural), fr *Affaires* and pt-BR *Profissional*.
   - It's a core, app-wide concept, so it's left for a deliberate decision.
   - Tax wording ("business mileage", "business miles" in reports) should stay as the tax offices write it.
2. **"Business errand" purpose chip.**
   - "Errand" is a word many learners don't know.
   - It's a saved key, so it can be shown differently through `en.ts`, as was done for "Delivery or pickup". For example, "Other work task".
3. **Brand and offer words:**
   - "perks", "Go Pro", "Founding boost", "Tax set-aside", "Your sprout garden", "gold leaves on your sprout" and "Redeem";
   - they are understood in context, but each is a little idiomatic;
   - they are worth a pass with the marketing copy.
4. **App Store listing (`store.config.json`):**
   - It is not part of the app, but it still uses idioms: "Free for good", "The catch?", "Records you can stand behind", "Easy on your battery".
   - It also still says "MileMint".
5. **French in France and in Québec.**
   - *Quart* is right for Québec. Couriers in France say *créneau* or "shift".
   - If France becomes a market, consider a `fr-FR` variant.
6. **Chinese "Deliveries" chip.**
   - It is 送货, which is clear.
   - 送单 would match food couriers' speech but fits parcel couriers less well. Ask native couriers.
7. **"trip" and "drive" in English.** Both are used for the same thing. One word would be easier for learners.
8. **Native-speaker read-through.**
   - The new lines haven't had the three-pass review the earlier rounds had: translate, back-translate, culture check.
   - Run checks 2 and 3 on the 61 lines before marketing in each language.
   - Get the list from `npx tsx scripts/i18n-keys.ts` and the git diff.

## 4. Checks

- `npx tsx scripts/i18n-keys.ts`: 1,118 strings.
- `npx tsx scripts/i18n-missing.ts <lang>` for bn, es, fr, hi, pa, pl, pt-BR, ro and zh-Hans: 0 missing and 0 stale in each.
- `npx tsc --noEmit`: clean.
- `npx expo lint`: no errors or warnings.
- `npx jest`: 64 suites, 851 tests, all pass.
  - The cheers test now checks the new first cheers.
  - It also checks that none of the removed slang comes back.
