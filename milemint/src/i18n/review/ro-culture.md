# Romanian (ro): cultural and UX-copy review (check 3 of 3)

Reviewer profile: native Romanian speaker who has lived in the UK and knows the Romanian driver and courier community.

Scope: all 662 entries in `src/i18n/locales/ro.ts`, each read in context. For the jokes, cheers, greetings and celebrations I checked how they are paired and used in `src/domain/reminders.ts`, `src/domain/cheers.ts`, `src/domain/seasons.ts` and `src/milestones/copy.ts`. For the short labels I checked the layout in `src/app/index.tsx`, `src/app/pro.tsx`, `src/app/settings.tsx`, `src/components/country-options.tsx` and `src/components/tax-countdown.tsx`.

Checks:
1. Offence and sensitivity, including double meanings.
2. Tone.
3. Money and tax honesty.
4. UI fit.
5. Naturalness for a Romanian courier in London.

Result: **19 strings changed.** Keys, placeholders, `<b>` tags and plural objects are untouched, and `npx jest src/i18n` passes (30/30).

## Changes

| English | Before | After | Why |
|---|---|---|---|
| Business drives swipe right, personal swipe left. Easiest date of the week. | …Cea mai **ușoară** întâlnire a săptămânii. | …Cea mai **simplă** întâlnire a săptămânii. | Sensitivity. Next to *întâlnire* (date), *ușoară* can suggest *femeie ușoară* (a "loose" woman). That's a sexual innuendo some readers will notice, so it goes. |
| Free money alert 💸 | Alertă: bani gratis 💸 | Bani uitați pe drum? 💸 | *Bani gratis* is exactly how scam and "get rich" spam reads in Romanian (SMS/Facebook scams). The new title is a light tease with no money promise. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | Mă rog, tehnic vorbind sunt banii tăi. Sortează… ca să-i recuperezi. | Ai muncit pentru ei. Sortează cursele săptămânii ca să nu ratezi nicio deducere. | The twist rewritten to match the new title. It's warm ("you worked for it"). *Recuperezi* implied a refund; a deduction is what's actually on offer. |
| Plot twist: driving pays | Surpriză: condusul aduce bani | Surpriză: condusul contează | *Condusul aduce bani* reads as an earnings pitch ("driving makes money"). The new title keeps the playful twist and makes no money claim. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | …și vezi cât ai recuperat. | …și vezi cât valorează. | *Cât ai recuperat* ("how much you recovered") sounds like cash already refunded. *Cât valorează* matches the app's own "worth" wording elsewhere. |
| Low effort, high reward | Efort mic, câștig mare | Efort mic, folos mare | *Câștig mare* is the language of lotteries and betting ads. *Folos* means benefit and is the same idiom without the gambling or money promise. |
| Swipe right on savings | Glisează la dreapta pentru economii | Glisează la dreapta pentru deduceri | *Economii* promises a saving, which the brief forbids. The dating pun (swipe right) stays. |
| Sort this week’s drives and bank the deduction. Done in a minute. | …și pune deducerea la pușculiță… | …și ține-ți deducerile la zi… | The piggy bank suggests cash in hand (a saving promise), and it reads a bit childish for adult drivers. *Ține la zi* ("keep up to date") is honest and natural. |
| Now spend one minute taking the credit. Sort this week’s drives. | Acum tu culegi roadele, într-un minut. Sortează cursele săptămânii. | Acum culege tu laurii: un minut, și cursele săptămânii sunt sortate. | The old line was awkward word order, and *roadele* (the fruits) hints at a payout. *A culege laurii* is the real Romanian idiom for "taking the credit". It follows the title *Mașina ta a făcut partea grea* well. |
| A few swipes tonight beats a shoebox of receipts at tax time. | Câteva glisări… **bat** o cutie plină de bonuri… | Câteva glisări… **sunt mai bune decât** o cutie plină de bonuri… | *Bat* is a calque of "beats" and can also read as "hit". This version is clearer. |
| They’d like to be sorted before Monday. It takes a minute. | Vor o sortare înainte de luni. | Așteaptă o sortare înainte de luni. | *Vor o sortare* sounds demanding. *Așteaptă* ("they're waiting for") is gentler and still gender-neutral, because this body follows both *milele* and *kilometrii*. |
| Game on! 🎯 | Să înceapă jocul! 🎯 | Hai la treabă! 🎯 | This is a shift-start cheer. *Să înceapă jocul* reads as game-show or gambling and doesn't fit the start of a work shift. *Hai la treabă!* is exactly what Romanian workers say to each other. |
| Happy New Year 🎆 | An Nou fericit! 🎆 | La mulți ani! 🎆 | *La mulți ani!* is what Romanians actually say on 31 Dec to 2 Jan, the dates this greeting shows. *An Nou fericit* is correct but sounds translated. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | Un mesaj (puțin **poznaș**)… | Un mesaj (puțin **glumeț**)… | *Poznaș* is the word for a naughty child, so it reads childish. *Glumeț* (jokey) is the adult register. |
| A quick (slightly cheeky) reminder each Sunday evening… | Un memento rapid (puțin **poznaș**)… | Un memento rapid (puțin **glumeț**)… | Same. |
| Best value | Cel mai avantajos | Mai avantajos | UI fit: the badge was 17 characters against 10 (1.7×). The comparative is correct because there are only two plans (yearly vs monthly). Now 13 characters. |
| Use now | Folosește acum | Folosește | UI fit: a small inline button was 2× the English. The status beside it (*În uz acum*) already gives the "now". |
| UK | Regatul Unit | UK | Half-width tile with `numberOfLines={1}` next to a 30pt flag. At 12 characters it's at risk of truncating on an iPhone SE or with larger text. Romanians in Britain say *UK* every day (*lucrez în UK*). The full name *Regatul Unit* stays for the "United Kingdom" key. |
| Today | Astăzi | Azi | UI fit: this replaces the number in the small countdown box (and is the date chip in Add trip). *Azi* is shorter and is everyday speech, and it pairs with *Ieri* (Yesterday). |

## Checked and left as is

- **Sensitivity.** The rest of the file has nothing rude, sexual, religious, political, or about nationality or migration status.
  - *Dubă* (van) is what Romanian couriers really call their van (Amazon Flex, DPD). The slang sense "sketchy" only applies as a predicate (*e dubă*), so not here.
  - *Halloween fericit* and *Sărbători fericite* are secular and widely used.
  - *Cioc, cioc / Cine-i acolo?* is a native joke format and works.
- **Money lines that mirror the English.** These are faithful to the source, which the brief allows:
  - *{{amount}} înapoi în buzunar*
  - *Bani adevărați înapoi la vremea taxelor*
  - *Fiecare milă de lucru înseamnă bani înapoi*
  - *Bani înapoi*

  The amounts are labelled "found" or "estimated" elsewhere, and the "Not tax advice" disclaimers are intact. If the product owner wants to soften the English, these should change with it.
- **Tone.** These read naturally and kindly in Romanian:
  - *Tu din viitor îți mulțumește*
  - *Stres de duminică seara? Nu și din cauza taxelor*
  - *Te-au sunat milele/kilometrii*
  - *Weekendul e pe terminate*
  - *Îmbracă-te gros, e frig afară*
  - *A venit primăvara*
  - *Muncă grea, răsplătită cum trebuie*
  - *I-ai meritat pe toți, până la ultimul bănuț*
  - the remaining cheers (*Hai că pornim!*, *Hai să-i dăm drumul!*, *Pornim la drum!*, *La drum!*, *Să mergem!*)
- **UI fit.**
  - *Treci la Pro* (12 characters against "Go Pro", 6) is over 1.3×. It sits in a flexible row next to the free-drive counter, at 13pt, and it's the glossary term used everywhere, so I kept it. There's no natural shorter Romanian call to action (*Ia Pro* sounds abrupt).
  - *Înregistrare pornită* (the "Tracking on" pill) is long but sits in a pill with the secondary text set to flex. It's kept because the short alternatives are ambiguous (*Înregistrează* also reads as an order).
  - Vehicle buttons (*Mașină sau dubă*, *Moped sau motocicletă*), weekday labels, tabs and the remaining badges are all within about 1.3× or shorter.
- **Naturalness.** *La vremea taxelor* (at tax time) is slightly calqued but understood by everyone and used consistently, so I didn't churn it.

## Still to verify on a device (not blocking from a cultural standpoint)

The iOS-quoted strings (*Permite când se folosește aplicația*, *Schimbă la Permite întotdeauna*, *Când se folosește aplicația*, *Întreabă data viitoare sau când partajez*, *PERMITE ACCESUL LA LOCALIZARE*, *Deschide Configurări*) are still unconfirmed against a real iPhone set to Romanian.

Note for that check: Apple's Romanian UI has traditionally used the polite plural imperative (e.g. *Anulați*, *Permiteți*). If the device shows those forms, copy them exactly into every line that quotes iOS. Don't make them match the app's *tu* form.

## Sign-off

**Approved for release** on culture, tone, money honesty, UI fit and naturalness. Before shipping, confirm the iOS-quoted strings on a Romanian-language iPhone, as already flagged in `ro-accuracy.md`.

## Round 3: logbook, P87, privacy and backup (October 2026)

Reviewer profile as above, reading the 201 new lines as a Romanian courier or care worker in the UK (and in Australia for the logbook lines).

Checks:
1. Offence, double meanings and regional words: none found. *Dubă*, *bonuri*, *fluturaș de salariu*, *pence*, *p* are what Romanians in the UK say.
2. Tone: warm and plain, *tu* throughout, *Te rugăm să…* after errors as before.
3. Money honesty: relief = *deducere*, tax back = *impozit înapoi* (always *aprox.* / *estimat* where the English has it); *Nu e consultanță fiscală* kept; nothing promises a refund.
4. Privacy lines: reassuring and plain (*Se salvează doar zona, niciodată adresa lor*; *Niciodată un nume sau o adresă*). Nothing suggests hiding anything from the tax office: *Pentru autoritatea fiscală sunt de ajuns zona, distanța și scopul* says the opposite.
5. Backup lines: say it is encrypted (*Criptat*), the key is in iCloud Keychain (*Portchei iCloud*), it lives in the user's own iCloud, and *MileMint nu vede niciodată cursele tale*. No "we store your data" wording; *Se salvează* rather than *Păstrăm* avoids implying MileMint servers.
6. iOS wording: *Configurări* (iOS Settings), *iCloud Drive*, *Portchei iCloud*, *Configurări → numele tău → iCloud*, *Backup iCloud* follow Apple's Romanian naming.
7. UI fit (≤1.3×): tax-band segments *De bază / Ridicată / Suplimentară / Nu știu*, *Pe cont propriu / Angajat*, *Pe milă / Nimic*, *Doar zona*, *Păstrează adresa*, *Șterge adresele*, *Păstrează-le*, *Începe jurnalul*, *Fă backup acum*, *Începe de la zero*, *Cere pe GOV.UK (P87)* all fit.

Result: **3 strings changed** in this pass.

| English | Before | After | Why |
|---|---|---|---|
| Restore my trips | Restaurează-mi cursele | Restaurează cursele | Main welcome button: 22 chars against 16 (1.4×). Now 19 (1.2×), same meaning. |
| Save costs | Salvează costurile | Salvează | Button: 18 chars against 10 (1.8×). It sits directly under the cost fields, so the object is clear. |
| HMRC usually changes your tax code … They may ask to see your mileage log … | …Pot cere să vadă jurnalul… | …HMRC poate cere să vadă jurnalul… | *Pot* can read as "I can" as well as "they can". Naming HMRC removes the doubt. |

## Checked and left as is (Round 3)

- *Confidențialitate clienți* ("Client privacy", 25 chars against 14): a full-width section header and a switch's spoken label, not a button. *Discreție* is shorter but sounds like secrecy; *confidențialitate* is the word care agencies use.
- *Ridicată* for "Higher" (rate band) instead of the more formal *Superioară*, to keep the four-way segment short.
- *Vizitez clienți sau pacienți la domiciliu (îngrijire, asistență medicală, sprijin)*: standard Romanian care-sector words.

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | Glisează înapoi ca să închei tura. | New line. Back-translation: "Swipe back to end the shift." Mirrors "Glisează ca să începi tura" and "Încheie tura" (tu). 1.17× English. |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}. Glisează butonul spre stânga sau atinge de două ori. | New VoiceOver hint; mirrors the "spre dreapta" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | Introdu sumele ca numere, cu punct la zecimale, de ex. 2400 sau 2,400.50. | Introdu sumele ca numere, de ex. 2400 sau 2400,50. | The parser now accepts a decimal comma: dropped "cu punct la zecimale" and used the Romanian decimal comma. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | Primiți amândoi +10 curse gratuite pe lună când un prieten se alătură. | Back: “You both receive +10 free rides a month when a friend joins.” ✓ |
| Friends joined: {{count}} · +{{drives}} free drives a month | Prieteni care s-au alăturat: {{count}} · Curse gratuite în plus pe lună: +{{drives}} | Noun moved before the number: 10 needs “curse”, 20+ needs “de curse”, and the plural form follows {{count}}, not {{drives}}. |
| Your free plan: {{count}} automatic drives a month. | one/few/other … {{count}} (de) curse automate pe lună. | “de” only in the other form (20+), as in the existing free-plan line. |
| That’s your own code… | Acesta e chiar codul tău. Mai bine trimite-l prietenilor. | Pass 2 added *chiar* (“your very own”): without it the line lost “own”. |
| Redeem | Aplică | Common for promo codes in Romanian shops; short. |
| Share it · friends get +10 drives | Distribuie · +10 curse pentru prieteni | 38 chars (1.15×). |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | Trimite-i unui prieten o invitație. Când se alătură MileMint cu ea, primiți amândoi 10 curse automate gratuite în plus pe lună. Pentru fiecare prieten, fără limită. | “Send a friend an invitation. When they join MileMint with it, you both get 10 more free automatic trips a month. For every friend, no limit.” *curse*, *primiți amândoi* as in Round 4. |
| Send an invite | Trimite invitație | “Send invitation” Button; “Trimite o invitație” was 1.36×, now 1.21×. |
| Every invite has its own code, for one friend. | Fiecare invitație are codul ei, pentru un singur prieten. | “Each invitation has its own code, for a single friend.” |
| Invites sent: {{count}} | Invitații trimise: {{count}} | “Invitations sent: {{count}}” Counter label: no noun agreement with the number needed. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | Invitațiile se confirmă prin iCloud, care vine într-o actualizare viitoare. Prietenii care se alătură până atunci primesc cursele în plus când e activat, iar tu la fel. | “Invitations are confirmed through iCloud, which comes in a future update. Friends who join until then get the extra trips when it’s turned on, and you too.” No promise of drives today. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | Ai introdus {{code}}. Cele 10 curse în plus vin imediat ce invitația e confirmată. | “You entered {{code}}. The 10 extra trips come as soon as the invitation is confirmed.” |
| Code {{code}} saved | Codul {{code}} a fost salvat | “Code {{code}} was saved” Mirrors “Codul {{code}} a fost adăugat”. |
| Your 10 extra drives are on their way once the invite is confirmed. | Cele 10 curse în plus vin imediat ce invitația e confirmată. | “The 10 extra trips come as soon as the invitation is confirmed.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | Codul tău de invitație este {{code}}. Introdu-l când configurezi MileMint și primești 10 curse gratuite în plus pe lună. | “Your invitation code is {{code}}. Enter it when you set up MileMint and you get 10 more free trips a month.” Share message, tu. |
| We couldn’t find that invite. Check the code with your friend. | Nu am găsit invitația. Verifică codul cu prietenul tău. | “We didn’t find the invitation. Check the code with your friend.” |
| That invite has already been used. Ask your friend to send you a new one. | Invitația a fost deja folosită. Roagă-ți prietenul să-ți trimită una nouă. | “The invitation has already been used. Ask your friend to send you a new one.” |
| That’s one of your own invites. Send it to a friend instead. | Aceasta e una dintre invitațiile tale. Mai bine trimite-o unui prieten. | “This is one of your invitations. Better send it to a friend.” |
| This Apple Account has already joined with a friend’s invite. | Acest cont Apple s-a alăturat deja cu invitația unui prieten. | “This Apple account has already joined with a friend’s invitation.” *cont Apple* as in existing lines. |
| 🎉 Your friend’s invite is confirmed | 🎉 Invitația prietenului tău e confirmată | “🎉 Your friend’s invitation is confirmed” |
| Your friend’s invite couldn’t be used | Invitația prietenului tău nu a putut fi folosită | “Your friend’s invitation couldn’t be used” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | Salvată · valoarea vine cu Pro | Row label, shortened in pass 3 from *se deblochează* (40 chars) to *vine cu Pro* (“comes with Pro”), 30 chars. *Salvată* agrees with *cursă* (f.). |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | Salvată. Cursele gratuite din luna asta s-au terminat, așa că o cursă mutată înapoi de la personală la de lucru așteaptă Pro ca să-și arate valoarea. Cursele care își arată deja valoarea o păstrează. | “Saved. The free trips for this month are used up, so a trip moved back from personal to work waits for Pro to show its value. Trips already showing their value keep it.” |
| {{used}} of {{limit}} free work drives in {{month}} | Curse de lucru gratuite în {{month}}: {{used}} din {{limit}} | “Free work trips in {{month}}: {{used}} of {{limit}}”. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | Gratuit: {{count}} de curse de lucru pe lună. Cursele personale nu contează, iar o tură contează o dată pe zi. Cursele adăugate manual sunt mereu gratuite. Pro: nelimitat. | “Free: 40 work trips a month. Personal trips don’t count, and a shift counts once a day. Trips added manually are always free. Pro: unlimited.” *de curse* for 20+ (other form), as in earlier rounds. |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | Cursele personale nu contează. Sortează una ca personală și următoarea cursă îi ia locul. | “Personal trips don’t count. Sort one as personal and the next trip takes its place.” *a sorta* (glossary). |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | Peste limită nu se ascunde și nu se pierde nimic: fiecare cursă e salvată, afișată complet, poate fi sortată și apare în exportul în foaia de calcul. Doar valoarea ei așteaptă Pro. | “Past the limit nothing is hidden or lost: each trip is saved, shown in full, can be sorted and appears in the spreadsheet export. Only its value waits for Pro.” |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | Primele curse din lună au prioritate, așa că o cursă care își arată valoarea o păstrează. Numărătoarea o ia de la capăt pe 1 ale lunii. | “The month’s first trips have priority, so a trip that shows its value keeps it. The count starts over on the 1st of the month.” |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} cursă / few: {{count}} curse / other: {{count}} de curse | “{{count}} trip(s)” one/few/other with *de* for 20+. |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: {{count}} cursă de atunci pare o livrare. Va fi adăugată la tură ca de lucru. / few: {{count}} curse de atunci par livrări. Vor fi adăugate la tură ca de lucru. / other: {{count}} de curse de atunci par livrări. Vor fi adăugate la tură ca de lucru. | “{{count}} trips since then look like deliveries. They’ll be added to the shift as work.” |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}} de sortat / few: {{purpose}} · {{count}} de sortat / other: {{purpose}} · {{count}} de sortat | “{{purpose}} · {{count}} to sort” |
| After your shift ended · not counted as work unless you say so | După încheierea turei · nu contează ca muncă decât dacă alegi tu | “After the shift ended · doesn’t count as work unless you choose” |
| Deliveries | Livrări | “Deliveries” |
| Did your shift start at {{time}}? | Tura ta a început la {{time}}? | “Your shift started at {{time}}?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | Cursele intră în tură sau ies din ea după ora la care au început. O cursă care continuă după final e tăiată acolo. | “Trips come into the shift or leave it by the hour they started. A trip that continues after the end is cut there.” |
| During a pause in your shift · not counted as work unless you say so | În timpul unei pauze din tură · nu contează ca muncă decât dacă alegi tu | “During a pause in the shift · doesn’t count as work unless you choose” |
| End 15 minutes earlier | Mută finalul cu 15 minute mai devreme | “Move the end 15 minutes earlier” |
| End 15 minutes later | Mută finalul cu 15 minute mai târziu | “Move the end 15 minutes later” |
| End your shift? | Închei tura? | “End the shift?” As *Încheie tura*. |
| Ended {{time}} | Încheiată la {{time}} | “Ended at {{time}}” Feminine, agrees with *tura*. |
| Hide drives ▴ | Ascunde cursele ▴ | “Hide the trips ▴” |
| Hides the drives in this shift | Ascunde cursele din această tură | “Hides the trips in this shift” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | Era încă pornită, așa că MileMint a încheiat-o. Cursele de acum încolo rămân să le sortezi tu. Atinge ca să verifici orele. | “It was still on, so MileMint ended it. Trips from now on are left for you to sort. Tap to check the hours.” *Atinge*, as elsewhere. |
| Map of the drives in this shift | Harta curselor din această tură | “Map of the trips in this shift” |
| On shift | În tură | “On shift” |
| Pause | Pauză | “Pause” |
| Pause the shift for a personal errand | Pune tura pe pauză pentru o treabă personală | “Put the shift on pause for a personal thing” *treabă personală*: everyday. |
| Paused · {{elapsed}} | Pauză · {{elapsed}} | “Pause · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | Pauză: cursele de acum nu contează ca muncă. Reia când te întorci. | “Pause: trips now don’t count as work. Resume when you’re back.” |
| Resume | Reia | “Resume” |
| Resume the shift | Reia tura | “Resume the shift” |
| Shift | Tură | “Shift” |
| Shift ended | Tura s-a încheiat | “The shift has ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | Tura din {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “The shift of {{date}}, …” |
| Show drives ▾ | Vezi cursele ▾ | “See the trips ▾” |
| Shows the drives in this shift | Arată cursele din această tură | “Shows the trips in this shift” |
| Since {{time}} | De la {{time}} | “Since {{time}}” |
| Start 15 minutes earlier | Mută începutul cu 15 minute mai devreme | “Move the start 15 minutes earlier” |
| Start 15 minutes later | Mută începutul cu 15 minute mai târziu | “Move the start 15 minutes later” |
| Start from {{time}} | Începe de la {{time}} | “Start from {{time}}” |
| Start shift from {{time}}? | Începi tura de la {{time}}? | “Start the shift from {{time}}?” |
| Started {{time}} | Începută la {{time}} | “Started at {{time}}” |
| Still working | Încă lucrez | “Still working” |
| Undo | Anulează | “Undo” *Anulează* is iOS Romanian for Undo. |
| Undo ending the shift | Anulează încheierea turei | “Undo ending the shift” |
| Where your shift ended | Unde s-a încheiat tura | “Where the shift ended” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | Ești parcat acasă de ceva vreme și tura e încă pornită. Cursele de după încheierea ei nu contează ca muncă. | “You’ve been parked at home for some time and the shift is still on. Trips after it ends don’t count as work.” |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | Ești parcat acasă de la {{time}}. Cursele de după tură nu contează ca muncă. | “You’ve been parked at home since {{time}}. Trips after the shift don’t count as work.” |
| Your shift ended after 16 hours | Tura s-a încheiat după 16 ore | “The shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “Starea înregistrării” row and background notifications. 24 new lines. Terms: *cursă*, *înregistrare (automată)* for tracking (never *urmărire*), *ratată*, tu. iOS wording: *Configurări*, *Localizare*, *Localizare precisă*. Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | Localizarea precisă e dezactivată | “Precise location is deactivated”. *Localizare precisă* is my reading of Apple’s ro toggle: listed under Unsure. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint primește doar o poziție aproximativă, așa că nu poate măsura cursele. În Configurări, atinge Localizare și activează Localizare precisă. | “MileMint only gets an approximate position, so it can’t measure the trips. In Settings, touch Location and turn on Precise Location.” |
| Tracking has stopped | Înregistrarea s-a oprit | “Recording has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | Înregistrarea automată nu mai funcționează, așa că cursele noi nu se înregistrează. | “Automatic recording no longer works, so new trips aren’t recorded.” |
| Tracking may have stopped | Poate că înregistrarea s-a oprit | “Maybe recording has stopped”. |
| No location since {{time}}, in the middle of a drive. | Nicio localizare de la {{time}}, în mijlocul unei curse. | “No location since {{time}}, in the middle of a trip.” |
| Turn tracking back on | Repornește înregistrarea | “Restart recording”. Button, 24 chars (1.14×). |
| Tracking stopped {{from}}–{{to}} | Înregistrare oprită {{from}}–{{to}} | “Recording stopped {{from}}–{{to}}”. |
| A drive may have been missed | Poate că o cursă a fost ratată | “Maybe a trip was missed”. Passive: no blame on the driver. |
| About {{distance}} may be missing. Add the missed trip? | Pot lipsi cam {{distance}}. Adaugi cursa ratată? | “About {{distance}} may be missing. Add the missed trip?” *cursa ratată* as in “Adaugă o cursă ratată”. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | Telefonul tău s-a deplasat cam {{distance}} între {{from}} și {{to}}, dar nu s-a înregistrat nicio cursă. Adaugi cursa ratată? | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Add the missed trip?” |
| Not a drive | Nu a fost o cursă | “It wasn’t a trip”. Link, 17 chars; room in the row. |
| All good | Totul e în regulă | “Everything is fine”. |
| just now | chiar acum | “right now / just now”. |
| {{count}} minutes ago | one: acum {{count}} minut / few: acum {{count}} minute / other: acum {{count}} de minute | “{{count}} minute(s) ago”. one/few/other with *de* from 20, as in the backup lines. |
| {{count}} hours ago | one: acum {{count}} oră / few: acum {{count}} ore / other: acum {{count}} de ore | “{{count}} hour(s) ago”. |
| {{count}} days ago | one: acum {{count}} zi / few: acum {{count}} zile / other: acum {{count}} de zile | “{{count}} day(s) ago”. |
| Tracking check | Starea înregistrării | “Recording status”. |
| Last location: {{ago}} | Ultima localizare: {{ago}} | “Last location: {{ago}}”. |
| No location yet | Încă nicio localizare | “No location yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | Accesul MileMint la localizare e oprit, așa că nu se înregistrează nicio cursă. Atinge ca să-l pornești din nou. | “MileMint’s access to location is off, so no trip is recorded. Touch to turn it on again.” |
| Drives can’t be measured from a rough position. Tap to fix it. | Cu o poziție aproximativă, cursele nu pot fi măsurate. Atinge ca să rezolvi. | “With an approximate position, trips can’t be measured. Touch to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | Cursele noi nu se înregistrează. Atinge ca să repornești înregistrarea. | “New trips aren’t recorded. Touch to restart recording.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | Nicio localizare de la {{time}}, în mijlocul unei curse. Deschide MileMint ca să reia înregistrarea. | “No location since {{time}}, in the middle of a trip. Open MileMint so it resumes recording.” |

**Sign-off:** approved, pending an on-device check of *Localizare precisă*.


## Round 8: pre-release fixes

| English | ro | Back-translation | Note |
|---|---|---|---|
| Where your shift started | Unde a început tura | Where the shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | ro | Back-translation | Note |
|---|---|---|---|
| Opens trip details | Deschide detaliile cursei | Opens the drive’s details | Matches the row’s existing hint. |
| Usual purpose · tap to change | Scop obișnuit · atinge ca să-l schimbi | Usual purpose · tap to change it | *Scop* as in “Scopul cursei”. |
| Purpose needed for your tax records | Lipsește scopul pentru evidența fiscală | The purpose for the tax records is missing | *evidența fiscală* is the usual phrase for tax records. |
| Shows only the drives that need a purpose | Arată doar cursele care au nevoie de un scop | Shows only the drives that need a purpose | Natural, fits its place. |
| {{count}} work drives need a purpose | one: {{count}} cursă de lucru are nevoie de un scop / few: {{count}} curse de lucru au nevoie de un scop / other: {{count}} de curse de lucru au nevoie de un scop | {{count}} work drive(s) need(s) a purpose | one/few/other with “de” for 20+, as in the file. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} cere un scop pentru fiecare cursă de lucru. O atingere pentru fiecare. | {{authority}} asks for a purpose for each work drive. One tap for each. | *cere* as in “{{authority}} cere un scop de lucru”. |
| Add purposes › | Adaugă scopurile › | Add the purposes › | Natural, fits its place. |
| Every work drive has a purpose ✓ | Toate cursele de lucru au scop ✓ | All work drives have a purpose ✓ | Natural, fits its place. |
| Show all drives | Arată toate cursele | Show all drives | Natural, fits its place. |
| {{count}} work drives have no purpose | one: {{count}} cursă de lucru nu are scop / few: {{count}} curse de lucru nu au scop / other: {{count}} de curse de lucru nu au scop | {{count}} work drive(s) has/have no purpose | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} cere un scop pentru fiecare cursă de lucru. Le adaugi înainte de export? | {{authority}} asks for a purpose for each work drive. Will you add them before export? | Informal *tu*, as in the rest of the app. |
| Export anyway | Exportă oricum | Export anyway | Natural, fits its place. |
| Add purposes | Adaugă scopurile | Add the purposes | Natural, fits its place. |
| Usual business purpose | Scopul obișnuit al curselor de lucru | The usual purpose of work drives | Settings row title. |
| Clear | Golește | Empty it | *Șterge* is kept for deleting trips. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | Se completează la cursele de lucru care nu au unul, ca evidența fiscală să fie completă. Cursele din tură folosesc „Livrări”, dacă nu alegi altul. | It’s filled in on work drives that don’t have one, so the tax records are complete. Drives in a shift use “Deliveries” unless you choose another. | *tură* as in “Auto: în tură”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | Se completează la cursele de lucru care nu au unul, ca evidența fiscală să fie completă. Îl poți schimba la orice cursă. | It’s filled in on work drives that don’t have one, so the tax records are complete. You can change it on any drive. | Natural, fits its place. |
| None: ask me each time | Niciunul: întreabă-mă de fiecare dată | None: ask me every time | Natural, fits its place. |
| What are most of your work drives for? | Pentru ce sunt majoritatea curselor tale de lucru? | What are most of your work drives for? | Natural, fits its place. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | Autoritățile fiscale cer un scop pentru fiecare cursă de lucru. Îl completăm noi, iar tu îl poți schimba la orice cursă. | Tax authorities ask for a purpose for each work drive. We fill it in, and you can change it on any drive. | Natural, fits its place. |


## Round 8c: work purpose tiles

Back-translations: Choose everything that fits. We fill in the first one chosen. / We fill it in / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | ro | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | Fără cont. Cursele tale rămân pe telefon. | No account. Your trips stay on the phone. | Keeps “Fără cont” from the old line. |
| Is this home? {{place}} | Aici e acasă? {{place}} | Is this home? {{place}} | *Acasă* as in “Home”. |
| You stopped here for the night. Trips to and from it will read “Home”. | Ai rămas aici peste noapte. Cursele care pleacă sau ajung aici vor arăta „Acasă”. | You stayed here overnight. Trips leaving or arriving here will show “Home”. | „ ” quotes as elsewhere. |
| Yes, that’s home | Da, e acasă | Yes, it’s home |  |
| No | Nu | No |  |
| Is this work? {{place}} | Aici e serviciul? {{place}} | Is this the job? {{place}} | *Serviciu* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | Parchezi des aici în orele de lucru. Cursele vor arăta „Serviciu”, iar navetele dintre acasă și serviciu vor fi marcate. | You often park here in working hours. Trips will show “Job”, and commutes between home and job will be marked. | *navete* as in the old places line. |
| Yes, that’s work | Da, e serviciul | Yes, it’s the job |  |


## Round 8f: motion activity

“Permite” / “Nu permite” are iOS’s alert buttons. “Mișcare și fitness” is iOS’s Settings item as best known: Unsure, please check against a Romanian iPhone. “Cursă” as everywhere else. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | Încă una, pentru precizie: Mișcare și fitness | One more, for accuracy: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | Permite MileMint să deosebească mersul cu mașina de mersul pe jos, ca o plimbare să nu fie niciodată înregistrată drept cursă. Rămâne pe telefonul tău. | Lets MileMint tell driving from walking, so a walk is never recorded as a trip. It stays on your phone. | |
| Turn on Motion & Fitness | Pornește Mișcare și fitness | Turn on Motion & Fitness | |
| Allow | Permite | Allow | |
| Don’t Allow | Nu permite | Don’t allow | |
| Motion & Fitness | Mișcare și fitness | Motion & Fitness | |
| On | Activat | On | |
| Off | Dezactivat | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | Glisează ca să începi tura când te apuci de lucru. Toate cursele din tură contează ca {{purpose}}. | Swipe to start the shift when you get to work. All trips in the shift count as {{purpose}}. | *Glisează ca să începi tura* as on the shift bar. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | Cursele din orele tale ({{days}} {{from}}–{{to}}) sunt trecute automat ca de lucru. | Trips in your hours ({{days}} {{from}}–{{to}}) are put down automatically as work. | Natural, fits its place. |
| Drives in your work hours are sorted as business for you. | Cursele din orele tale de lucru sunt trecute automat ca de lucru. | Trips in your work hours are put down automatically as work. | Natural, fits its place. |
| After each drive, swipe right for business or left for personal. | După fiecare cursă, glisează la dreapta pentru de lucru sau la stânga pentru personală. | After each trip, swipe right for work or left for personal. | Natural, fits its place. |
| {{rate}} a mile · {{vehicle}} · {{country}} | {{rate}} pe milă · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | *pe milă* as in the HMRC line. |
| {{rate}} a km · {{vehicle}} · {{country}} | {{rate}} pe km · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | Natural, fits its place. |
| PRACTICE RUN | EXERCIȚIU | EXERCISE | Eyebrow. |
| This is how a drive shows up after you park. Try sorting it. | Așa apare o cursă după ce parchezi. Încearcă s-o sortezi. | This is how a trip appears after you park. Try sorting it. | Natural, fits its place. |
| Swipe left for personal | Glisează la stânga pentru personală | Swipe left for personal | Natural, fits its place. |
| Not that way. Try again. | Nu în direcția asta. Mai încearcă. | Not in this direction. Try again. | Natural, fits its place. |
| Sorted as personal ✓ | Trecută ca personală ✓ | Put down as personal ✓ | Feminine, agreeing with *cursă*. |
| Now a work drive. Work drives are worth money back. | Acum o cursă de lucru. Cursele de lucru îți aduc bani înapoi. | Now a work trip. Work trips bring you money back. | Natural, fits its place. |
| Swipe right for business | Glisează la dreapta pentru de lucru | Swipe right for work | Natural, fits its place. |
| Sorted as business: worth {{amount}} | Trecută ca de lucru: valorează {{amount}} | Put down as work: worth {{amount}} | *valorează* as in the row. |
| Swipe to start your shift | Glisează ca să începi tura | Swipe to start the shift | Same as the bar. |
| Your shift is on ✓ | Tura a început ✓ | The shift has started ✓ | Natural, fits its place. |
| Mark as personal | Marchează ca personală | Mark as personal | Natural, fits its place. |
| Mark as business | Marchează ca de lucru | Mark as work | Natural, fits its place. |
| Practice drive · not saved | Cursă de probă · nu se salvează | Trial trip · not saved | Natural, fits its place. |
| Supermarket | Supermarket | Supermarket | Natural, fits its place. |
| Office | Birou | Office | Natural, fits its place. |
| Customer | Client | Customer | Natural, fits its place. |
| That’s it. Just drive: trips appear here after you park. | Asta e tot. Doar condu: cursele apar aici după ce parchezi. | That’s all. Just drive: trips appear here after you park. | *Doar condu* as in the old empty state. |
| Start driving | Pornește la drum | Set off | Natural, fits its place. |
| Skip | Sari peste | Skip | Natural, fits its place. |
| Skip the practice run | Sari peste exercițiu | Skip the exercise | Natural, fits its place. |
| Tutorial | Tutorial | Tutorial | Natural, fits its place. |
| Replay the tutorial | Reia tutorialul | Replay the tutorial | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | Sortează din nou două curse de probă. Nu se salvează nimic. | Sort two trial trips again. Nothing is saved. | Natural, fits its place. |
| Replay | Reia | Replay | Natural, fits its place. |

## Round 8h: Pro screen

Plain trial terms. “Configurări” is the iPhone Settings app, as in “Deschide Configurări”. “Gratis” is invariable, so it follows any length. {{date}} is “1 noiembrie”, so “pe {{date}}”. The trial pill and lengths are plurals, so “1 month” / “2 months” read right.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| {{count}} days free | {{count}} zi gratis / {{count}} zile gratis / {{count}} de zile gratis | {{count}} day(s) free |  |
| {{count}} months free | {{count}} lună gratis / {{count}} luni gratis / {{count}} de luni gratis | {{count}} month(s) free |  |
| {{count}} months | {{count}} lună / {{count}} luni / {{count}} de luni | {{count}} month(s) |  |
| {{price}} a month | {{price}} pe lună | {{price}} per month | Under the yearly price: the yearly price ÷ 12. |
| Most popular | Cel mai popular | The most popular | Badge on the yearly plan. |
| We’ll remind you 3 days before it ends. | Îți amintim cu 3 zile înainte să se încheie. | We’ll remind you 3 days before it ends. |  |
| {{trial}} free, then {{price}} a year. Cancel any time in Settings. | {{trial}} gratis, apoi {{price}} pe an. Anulează oricând din Configurări. | {{trial}} free, then {{price}} per year. Cancel any time from Settings. |  |
| {{trial}} free, then {{price}} a month. Cancel any time in Settings. | {{trial}} gratis, apoi {{price}} pe lună. Anulează oricând din Configurări. | {{trial}} free, then {{price}} per month. Cancel any time from Settings. |  |
| Free trial, then {{price}} a year. Cancel any time in Settings. | Probă gratuită, apoi {{price}} pe an. Anulează oricând din Configurări. | Free trial, then {{price}} per year. Cancel any time from Settings. |  |
| Free trial, then {{price}} a month. Cancel any time in Settings. | Probă gratuită, apoi {{price}} pe lună. Anulează oricând din Configurări. | Free trial, then {{price}} per month. Cancel any time from Settings. |  |
| {{price}} a year. Cancel any time in Settings. | {{price}} pe an. Anulează oricând din Configurări. | {{price}} per year. Cancel any time from Settings. |  |
| {{price}} a month. Cancel any time in Settings. | {{price}} pe lună. Anulează oricând din Configurări. | {{price}} per month. Cancel any time from Settings. |  |
| Your free month ends on {{date}} | Luna ta gratuită se încheie pe {{date}} | Your free month ends on {{date}} | Notification title, 3 days before a one-month trial ends. |
| Your free trial ends on {{date}} | Perioada ta de probă gratuită se încheie pe {{date}} | Your free trial period ends on {{date}} | For other trial lengths. |
| Keep Pro for {{price}} a year, or cancel in Settings. Nothing to do if you’re staying. | Păstrează Pro pentru {{price}} pe an sau anulează din Configurări. Dacă rămâi, nu trebuie să faci nimic. | Keep Pro for {{price}} per year or cancel from Settings. If you stay, you don’t have to do anything. | Notification body. |
| Keep Pro for {{price}} a month, or cancel in Settings. Nothing to do if you’re staying. | Păstrează Pro pentru {{price}} pe lună sau anulează din Configurări. Dacă rămâi, nu trebuie să faci nimic. | Keep Pro for {{price}} per month or cancel from Settings. If you stay, you don’t have to do anything. |  |

## Round 8i: parking & tolls

Parking and tolls on a drive: the “+ Parking or tolls” fields when adding a trip and on the trip screen, the line on a business trip’s row and under home’s total, the report screen, and each country’s line on what counts. Tax terms stay in English as elsewhere (Mileage Allowance Relief, Car, van and travel expenses, T2125, D2, cents per km, Congestion Charge, ULEZ). The “recorded” lines are for Canada and UK employees, where they aren’t added to the total.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Kept with the drive, but only counted on business drives. | Rămâne la cursă, dar contează doar la cursele de lucru. | Stays with the trip, but only counts on work trips. | Add trip / trip details: note under the fields on a personal drive. |
| + Parking or tolls | + Parcare sau taxe de drum | + Parking or road tolls | Add trip: the link that opens the two fields. Keep the "+". |
| incl. {{amount}} parking & tolls | incl. {{amount}} parcare și taxe de drum | incl. {{amount}} parking and road tolls | Home hero card, under the total; lower-case start as it continues the figure. |
| Parking & tolls: {{amount}} (recorded) | Parcare și taxe de drum: {{amount}} (înregistrate) | Parking and road tolls: {{amount}} (recorded) | Home hero card where they aren’t added (Canada, UK employees). |
| +{{amount}} parking & tolls | +{{amount}} parcare și taxe de drum | +{{amount}} parking and road tolls | Trip row detail on a business drive. |
| A claim line for every business trip (date, from, to, purpose, distance, rate, amount, parking and tolls) for your employer’s expense system. | Câte o linie de decont pentru fiecare cursă de lucru (dată, de la, până la, scop, distanță, tarif, sumă, parcare și taxe de drum) pentru sistemul de deconturi al angajatorului tău. | One expense line for each work trip (date, from, to, purpose, distance, rate, amount, parking and road tolls) for your employer’s expense system. | Report screen: expense-claim export description (was without parking and tolls). |
| Mileage at {{authority}} rates | Kilometraj la tarifele {{authority}} | Mileage at {{authority}} rates | Report screen: the mileage part of the total. |
| Parking | Parcare | Parking | Field label and report line. |
| Tolls | Taxe de drum | Road tolls | Field label and report line (bridge and road tolls, Congestion Charge, ULEZ). |
| Included in the total above. {{note}} | Inclus în totalul de mai sus. {{note}} | Included in the total above. {{note}} | Report screen; note = the country’s line below. |
| Recorded, not included in the total above. {{note}} | Înregistrat, dar neinclus în totalul de mai sus. {{note}} | Recorded, but not included in the total above. {{note}} | Report screen (Canada, UK employees); note = the country’s line below. |
| Enter parking as an amount, e.g. 3.50. | Introdu parcarea ca sumă, de ex. 3,50. | Enter the parking as an amount, e.g. 3,50. | Error under the fields. |
| Enter tolls as an amount, e.g. 3.50. | Introdu taxele de drum ca sumă, de ex. 3,50. | Enter the road tolls as an amount, e.g. 3,50. | Error under the fields. |
| Parking or tolls over {{max}} for one drive? Check the amount. | Peste {{max}} parcare sau taxe de drum la o singură cursă? Verifică suma. | Over {{max}} parking or road tolls on a single trip? Check the amount. | Error; max = £1,000.00 / $1,000.00. |
| {{what}}, in {{currency}} | {{what}}, în {{currency}} | {{what}}, in {{currency}} | VoiceOver label of a money box, e.g. "Parking, in GBP". |
| Business parking and tolls are deductible on top of the mileage rate. Parking at your regular workplace isn’t, and fines never are. | Parcarea și taxele de drum de lucru se deduc pe lângă tariful pe milă. Parcarea la locul tău obișnuit de muncă nu, iar amenzile niciodată. | Work parking and road tolls are deducted besides the per-mile rate. Parking at your usual workplace isn’t, and fines never. | US note under the fields. |
| Parking at your regular place of work and tolls on your commute are not deductible. | Parcarea la locul tău obișnuit de muncă și taxele de drum pe naveta ta nu sunt deductibile. | Parking at your usual workplace and road tolls on your commute aren’t deductible. | US report guidance (PDF stays English). |
| Self-employed: business parking, tolls and Congestion Charge or ULEZ charges are claimed on top of the mileage rate. Parking and traffic fines never are. | Pe cont propriu: parcarea, taxele de drum și Congestion Charge sau ULEZ de la cursele de lucru se cer pe lângă tariful pe milă. Amenzile de parcare și de circulație niciodată. | Self-employed: parking, road tolls and Congestion Charge or ULEZ from work trips are claimed besides the per-mile rate. Parking and traffic fines never. | UK self-employed note under the fields. |
| Parking and tolls aren’t part of Mileage Allowance Relief. Claim them from your employer, or as a separate employment expense if they don’t repay them. Fines never count. | Parcarea și taxele de drum nu fac parte din Mileage Allowance Relief. Cere-le de la angajator sau, dacă nu ți le dă înapoi, cere-le ca o cheltuială de muncă separată. Amenzile nu contează niciodată. | Parking and road tolls aren’t part of Mileage Allowance Relief. Ask your employer for them or, if they don’t pay you back, claim them as a separate work expense. Fines never count. | UK employee note under the fields. |
| Self-employed: parking, tolls and Congestion Charge or ULEZ charges on business journeys are added on top of the mileage figure, in the same Car, van and travel expenses box. Parking and traffic fines are never allowable. | Pe cont propriu: parcarea, taxele de drum și Congestion Charge sau ULEZ de la cursele de lucru se adaugă peste suma pentru mile, la aceeași rubrică Car, van and travel expenses. Amenzile de parcare și de circulație nu sunt niciodată deductibile. | Self-employed: parking, road tolls and Congestion Charge or ULEZ from work trips are added on top of the miles amount, in the same Car, van and travel expenses box. Parking and traffic fines are never deductible. | UK report guidance (PDF stays English). |
| Employees: parking and tolls are not part of Mileage Allowance Relief. They are listed separately, to claim from your employer or as a separate employment expense. | Angajați: parcarea și taxele de drum nu fac parte din Mileage Allowance Relief. Sunt trecute separat, ca să le ceri de la angajator sau ca o cheltuială de muncă separată. | Employees: parking and road tolls aren’t part of Mileage Allowance Relief. They’re listed separately, to ask your employer for or claim as a separate work expense. | UK report guidance (PDF stays English). |
| Recorded apart from the per-km figure. Self-employed: business parking is usually claimed in full. Ask your accountant about tolls. | Înregistrate separat de suma pe km. Pe cont propriu: parcarea de lucru se deduce de obicei integral. Despre taxele de drum, întreabă-ți contabilul. | Recorded separately from the per-km amount. Self-employed: work parking is usually deducted in full. About road tolls, ask your accountant. | Canada note under the fields. |
| Parking and tolls are listed separately and not added to the per-km figure. Self-employed: business parking fees are deducted in full on T2125, not reduced to your business-use share. Ask your accountant whether your tolls can be claimed. | Parcarea și taxele de drum sunt trecute separat și nu se adaugă la suma pe km. Pe cont propriu: taxele de parcare de lucru se deduc integral în T2125, fără să fie reduse la partea de folosire pentru lucru. Întreabă-ți contabilul dacă taxele de drum se pot deduce. | Parking and road tolls are listed separately and aren’t added to the per-km amount. Self-employed: work parking fees are deducted in full in T2125, without being reduced to the work-use share. Ask your accountant whether road tolls can be deducted. | Canada report guidance (PDF stays English). |
| Work parking and tolls aren’t covered by cents per km, so they’re claimed separately. Not parking at your regular workplace, or tolls on the way there. | Cents per km nu acoperă parcarea și taxele de drum de lucru, așa că se cer separat. Nu și parcarea la locul tău obișnuit de muncă sau taxele de drum până acolo. | Cents per km doesn’t cover work parking and road tolls, so they’re claimed separately. Not parking at your usual workplace or road tolls to get there. | Australia note under the fields. |
| Parking fees and tolls for work trips aren’t covered by the cents per km rate. Claim them separately: individuals as Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace, or tolls between home and work. | Cents per km nu acoperă parcarea și taxele de drum ale curselor de lucru. Cere-le separat: persoanele fizice la Work-related travel expenses (D2), cei pe cont propriu (sole traders) la cheltuielile afacerii. Nu și parcarea la locul tău obișnuit de muncă sau taxele de drum între casă și serviciu. | Cents per km doesn’t cover parking and road tolls on work trips. Claim them separately: individuals at Work-related travel expenses (D2), self-employed (sole traders) with business expenses. Not parking at your usual workplace or road tolls between home and work. | Australia report guidance (PDF stays English). |
