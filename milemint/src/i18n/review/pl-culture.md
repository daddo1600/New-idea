# Polish (pl): cultural and UX-copy review (check 3 of 3)

Reviewer profile: native Polish speaker who has lived in the UK for years and knows the Polish driver, courier and tradesperson community there.

Scope: every entry in `src/i18n/locales/pl.ts`, read in context. For the jokes, cheers, greetings and celebrations I checked how they're used in `src/domain/reminders.ts`, `src/domain/cheers.ts`, `src/domain/seasons.ts` and `src/milestones/copy.ts`. For the units I checked which lines have separate miles and km keys (`welcome.tsx`, `copy.ts`, `compare.tsx`, `seasons.ts`). For the short labels I checked the layout in `src/app/index.tsx`, `src/app/pro.tsx`, `src/app/_layout.tsx`, `src/components/country-options.tsx`, `src/components/tax-countdown.tsx`, `src/components/always-guide.tsx` and `src/components/header-menu.tsx`.

Checks:
1. Offence and sensitivity, including double meanings.
2. Tone.
3. Money and tax honesty.
4. Units.
5. UI fit.
6. iOS wording.

Result: **36 strings changed.** Keys, placeholders, `<b>` tags and plural objects are untouched. `npx jest src/i18n` passes (31/31). The glossary (`glossary/pl.md`) is updated to match.

## Decisions

- **Capitalised Twój/Ci:** kept, and it's consistent across the file. Apple's Polish iOS capitalises these pronouns mid-sentence, and so do Polish banks and delivery apps. The app sits next to iOS alerts and quotes them, so matching Apple is the safest choice. It reads polite, not stiff, alongside the informal "Ty".
- **Season greetings:** "Wesołych świąt" (lowercase *świąt*, no religious words) is the standard neutral December greeting. "Wesołego Halloween" only shows from 24 to 31 October, so it never overlaps with All Saints' Day (1 November), which Poles take seriously. Both kept.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| Business drives swipe right, personal swipe left. Easiest date of the week. | …Najłatwiejsza randka w tym tygodniu. | …Najprostsza randka tygodnia. | Sensitivity. Next to *randka* (date), *łatwa* suggests *łatwa dziewczyna* (a "loose" woman). *Najprostsza* has no innuendo. |
| New to Pro? Your first month is on me: {{url}} | Pierwszy raz z Pro? Pierwszy miesiąc… | Jeszcze nie masz Pro? Pierwszy miesiąc… | *Pierwszy raz z…* ("my first time with…") is a well-known sexual innuendo, and this line gets shared in group chats. The new wording is still gender-neutral. |
| First shift done | Pierwsza zmiana zaliczona | Pierwsza zmiana za Tobą | *Zaliczyć* has a sexual slang meaning. It's unlikely here, but the zero-tolerance rule applies, and *za Tobą* ("behind you") is also warmer. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | (Lekko zaczepne) przypomnienie… | Przypomnienie z przymrużeniem oka… | *Zaczepny* means provocative or combative, not playful. *Z przymrużeniem oka* ("with a wink") is the Polish for cheeky-but-kind. |
| A quick (slightly cheeky) reminder each Sunday evening… | Krótkie (lekko zaczepne) przypomnienie… | Krótkie przypomnienie z przymrużeniem oka… | Same. |
| They’d like to be sorted before Monday. It takes a minute. | Chcą zostać oznaczone… | Chciałyby zostać oznaczone… | *Chcą* ("they want") sounds demanding. The conditional is gentler and agrees with both *mile* and *kilometry*. |
| Let’s do this! 💪 | Dasz radę! 💪 | Działamy! 💪 | *Dasz radę* ("you can manage it") can sound like the user needs reassurance before a normal shift. *Działamy!* is the upbeat "let's go" Polish workers use. |
| Free money alert 💸 | Uwaga, darmowe pieniądze 💸 | Odliczenia czekają 💸 | *Darmowe pieniądze* is exactly how scam SMS and Facebook spam reads in Polish. The new title makes no cash promise. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | No, technicznie to Twoje pieniądze. Oznacz…, żeby je odzyskać. | W końcu to efekt Twojej pracy. Oznacz przejazdy z tego tygodnia, żeby żadne odliczenie nie przepadło. | Rewritten to match the new title. *Odzyskać* ("get it back") implies a refund. The new line is warm and honest. |
| Plot twist: driving pays | Zwrot akcji: jazda się opłaca | Zwrot akcji: jazda się liczy | *Jazda się opłaca* reads like a driver-recruitment or earnings ad. "It counts" keeps the twist without a money claim. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | Przesuń przejazdy… i zobacz, ile udało Ci się odzyskać. | Oznacz przejazdy z tego tygodnia jako służbowe lub prywatne i zobacz, ile są warte. | *Odzyskać* implies cash refunded. "How much they're worth" matches the app's own wording. The awkward "przesuń … jako" is fixed with the glossary verb *oznacz*. |
| Low effort, high reward | Mało wysiłku, duża nagroda | Mało wysiłku, duży efekt | *Nagroda* (prize) is lottery and competition language. *Duży efekt* is the natural idiom with no payout promise. |
| Sort this week’s drives and bank the deduction. Done in a minute. | …i zgarnij odliczenie. Minuta i gotowe. | Oznacz przejazdy z tego tygodnia, a odliczenia będą na bieżąco. Minuta i gotowe. | *Zgarnij* is promo-ad language ("zgarnij bonus") and suggests cash in hand. "Your deductions stay up to date" is honest. |
| {{amount}} back in your pocket | {{amount}} wraca do Twojej kieszeni | Już {{amount}} w odliczeniach | The amount is a deduction, not tax saved. Saying it "comes back to your pocket" promises a refund of the whole sum. The celebration still feels like a win. |
| MileMint has now found {{amount}} in business mileage for you. That’s real money back at tax time. | …To realne pieniądze do odzyskania przy rozliczeniu podatkowym. | …To realne pieniądze, które liczą się przy rozliczeniu podatkowym. | *Do odzyskania* ("to get back") promises a refund. "Real money that counts at tax time" keeps the encouragement. |
| Money back | Odzyskane pieniądze | Odliczenia | Honesty (it's the deductions-found section on Milestones) and length (19 → 10 characters; English is 10). |
| Your money back and badges | Odzyskane pieniądze i odznaki | Odliczenia i odznaki | Matches the section title. Same honesty point. |
| Sort your drives and add any you missed before {{date}}. Every business mile is money back. | …Każda służbowa mila to pieniądze z powrotem. | …Każda służbowa mila ma swoją wartość. | "Money back" promises a refund. "Has its value" is true and still motivating. The miles variant keeps "mila". |
| Sort your drives and add any you missed before {{date}}. Every business kilometre is money back. | …Każdy służbowy kilometr to pieniądze z powrotem. | …Każdy służbowy kilometr ma swoją wartość. | Same, km variant. |
| Never miss a mile. | Nie przegap ani jednej mili. | Żaden przejazd nie przepadnie. | Units. This welcome title shows in every country, so it can't say "mile" to Canadian or Australian users. |
| Every business mile, counted. | Każda służbowa mila policzona. | Każdy służbowy przejazd policzony. | Units. This is the first welcome screen in every country. |
| {{achievement}} on MileMint {{emoji}} The mileage app that counts every mile. | …Aplikacja, która liczy każdą przejechaną milę. | …Aplikacja, dla której liczy się każdy przejazd. | Units. It's the share line for habit milestones in every country. The new wording is also a small pun ("counts" / "matters"). |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | …Każda mila policzona automatycznie. | …Każdy przejazd policzony automatycznie. | Units. The money share line has no km variant. |
| Missed miles check | Sprawdź brakujący przebieg | Pominięty przebieg | Length (26 → 18 characters; English is 18) for the menu item and modal title. Unit-neutral, and matches "pominięty przejazd" elsewhere. The menu detail line already says "Porównaj z aplikacją kurierską". |
| UK | Wlk. Brytania | UK | The half-width tile has a flag and one line of text. "UK" is what Poles in Britain say every day ("pracuję w UK"). "Wielka Brytania" stays for "United Kingdom". |
| Best value | Najkorzystniej | Korzystniej | Badge length (14 → 11 characters; English is 10). The comparative is correct because only two plans are shown (yearly vs monthly), and it reads better on a badge than the superlative adverb. |
| Tax dates › | Terminy podatkowe › | Terminy › | A small text link on the tax countdown card, which already names the tax year. The screen and menu titles keep "Terminy podatkowe", because they have room for it. |
| Try again | Spróbuj ponownie | Ponów | Crash-screen button (16 → 5 characters). *Ponów* is iOS's own Polish word for retry. The error messages still say "Spróbuj ponownie." in full. |
| End shift | Zakończ zmianę | Zakończ | Small white pill on the shift card (14 → 7 characters; English is 9). The card already says "Na zmianie · 2 h 05 min", so the context is clear. |
| Tap here | Stuknij tutaj | Stuknij tu | Small badge in the iOS settings mock-up (13 → 10 characters; English is 8). Same meaning. |
| Save and continue | Zapisz i przejdź dalej | Zapisz i dalej | Main onboarding button (22 → 14 characters; English is 17). This is standard Polish UI wording. |
| ALLOW LOCATION ACCESS | POZWÓL NA DOSTĘP DO LOKALIZACJI | POZWALAJ NA DOSTĘP DO LOKALIZACJI | iOS wording. Polish iOS uses the imperfective *Pozwalaj* for standing permission settings ("Pozwalaj na powiadomienia", "Pozwalaj, gdy używana"). *Zezwalaj* isn't Apple's verb here. |
| In Settings, under Allow Location Access, choose Always | W Ustawieniach, w sekcji Pozwól na dostęp do lokalizacji, wybierz Zawsze | …w sekcji Pozwalaj na dostęp do lokalizacji… | Kept consistent with the header above. |
| iOS asks twice. Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>. | …<b>Zmień na Zawsze pozwalaj</b>. | …<b>Zmień na: Zawsze pozwalaj</b>. | iOS wording. Without punctuation, "Zmień na Zawsze pozwalaj" reads as a garbled sentence. The colon form matches Apple's Polish pattern for "Change to X" buttons and makes the quoted option clear. |
| Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>. | …<b>Zmień na Zawsze pozwalaj</b>. | …<b>Zmień na: Zawsze pozwalaj</b>. | Same. |
| Tap “Change to Always Allow” | Stuknij „Zmień na Zawsze pozwalaj” | Stuknij „Zmień na: Zawsze pozwalaj” | Same. |

## Checked and left as is

- **Nationality and stereotypes:** nothing about nationality, migration status or "Polish builder/plumber" tropes. "Fachowcy, handlowcy, opieka, biuro" is neutral.
- **Jokes:** "Puk, puk / Kto tam?", "Twoje mile/kilometry dzwoniły", "Niedzielna chandra? Nie przez podatki", "Twoje przyszłe ja dziękuje", "karton paragonów", "Przesuń w prawo, to może być miłość" all land and stay kind. *Stuknij* is Apple's standard verb and is fine despite its slang sense.
- **Cheers:** Ruszamy! / No to jedziemy! / Czas ruszać! / Do dzieła! / W drogę! are natural.
- **Seasons:** "Przyszła wiosna", "Cześć! Lato w trasie", "Ubierz się ciepło", "Jesienne trasy też się liczą", "Słoneczne dni, służbowe trasy" are unit-neutral and secular.
- **Tax lines:** they stay hedged ("szacunkowo", "To nie jest porada podatkowa", "zwykle", "mogą być warte do", "o wartości ok."). "Ciężka praca, należycie nagrodzona" and "Zasłużone w stu procentach" are praise, not promises.
- **Units:** the compare share lines, the distance celebrations and the weekly titles all have separate miles and km keys, and each keeps its own unit. "Parking fees and tolls…" ("stawką za milę") is US-only.
- **Length, left as is:** "Zapisane, zablokowane" (it wraps at the comma in its table cell; shorter versions lose "kept"), "Jedziemy dalej" (a text link with room), "Śledzenie wł.", "Kup Pro", "Auto lub van", "Skuter lub motocykl", "Plan darmowy".

## Sign-off

**Approved for release.** One non-blocking item remains: when someone next has a Polish-language iPhone to hand, confirm the exact punctuation of "Zmień na: Zawsze pozwalaj" and the header "POZWALAJ NA DOSTĘP DO LOKALIZACJI". Either way, users will still match the screen.

## Round 3: logbook, P87, privacy and backup (October 2026)

Reviewer profile: as before, a native Polish speaker who knows the Polish driver, courier and care-worker community in the UK. For the logbook lines, I also read them as a Polish courier in Australia would.

What I checked, for all 203 new keys:
1. Offence and double meanings: none found. "Okolica" (area) is neutral. "Pacjentów" and "asystencja" are the standard words in Polish care work.
2. Privacy tone for care workers: plain and reassuring. The lines say what is kept ("tylko okolicę i odległość") and that the tax office still gets what it needs ("Dla urzędu skarbowego wystarczą okolica, odległość i cel"). Nothing suggests hiding anything from the tax office.
3. Money honesty: P87 lines say "ulga do rozliczenia" and "ok. … zwrotu podatku", "zwykle" stays on the HMRC line, and logbook comparisons say "może pozwolić odliczyć więcej" and "ok. … więcej". There's no "odzyskaj", "zgarnij" or "pieniądze z powrotem".
4. Backup: the lines say clearly that the backup is encrypted ("Zaszyfrowana kluczem…"), stored in the user's iCloud, and that MileMint never sees the trips.
5. iOS wording: "Ustawienia → Twoje imię i nazwisko → iCloud", "iCloud Drive" and "pęk kluczy iCloud" (Apple's Polish name for iCloud Keychain). See Unsure in the glossary.
6. Gender: everything stays gender-neutral. "Samozatrudnienie" and "Na etacie" are used instead of "Samozatrudniony" and "Pracownik", and the claimed lines use an impersonal form ("Ulga … już rozliczona").
7. Length: I compared every button and label with the English (≤1.3×).

### Changes

| English | Before | After | Why |
|---|---|---|---|
| Keep a logbook for 12 weeks in a row. It gives your car’s business-use percentage… | …Pokazuje on, jaki procent… | …Rejestr pokazuje, jaki procent… | "Pokazuje on" sounds stiff and translated. Repeating the noun is how Polish would say it. |
| Backed up just now | Kopia utworzona przed chwilą | Kopia sprzed chwili | Length (28 → 19 characters; English is 18). It's a small status line in Settings. |
| Backed up {{count}} minutes ago | Ostatnia kopia {{count}} minut(ę/y) temu | Kopia sprzed {{count}} minuty / minut | Shorter, and consistent with "Kopia sprzed chwili". It also avoids the odd "1 minutę temu". |
| Backed up {{count}} hours ago | Ostatnia kopia {{count}} godzin(ę/y) temu | Kopia sprzed {{count}} godziny / godzin | Same. |
| Backed up {{count}} days ago | Ostatnia kopia {{count}} dzień/dni temu | Kopia sprzed {{count}} dnia / dni | Same. |
| Add initials or a client number if you like. Never a name or address. | …Nigdy nie wpisuj imienia i nazwiska ani adresu. | …Bez imienia, nazwiska i adresu. | The imperative "Nigdy nie wpisuj" sounded like a telling-off to a carer. The short form is friendlier and says the same thing. |

### Length, checked and left as is

- "Zakończ wcześniej" (End early, 17 vs 9) is a red text link and alert button. "Zakończ" alone would hide that the logbook becomes unusable, so precision wins for a destructive action. "Zakończony wcześniej" (Ended early) is a card heading with room.
- "Podstawowa" (Basic, 10 vs 5) is one of four equal segments, and the English "Additional" is already 10 characters, so it fits the same width.
- "Tylko okolica" (Area only, 13 vs 9) and "Prywatność klientów" (14 → 19) are an alert button and a section header, both with room. Shorter versions lose meaning.
- "Kopia zapasowa" (Backup) is a section header, in line with the other headers.

**Approved for release**, with the iOS items under Unsure in `glossary/pl.md` to confirm on a Polish iPhone.

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | Przesuń z powrotem, aby zakończyć zmianę. | Przesuń w lewo, aby zakończyć zmianę. | Was 1.41× English. "W lewo" is shorter (1.28×), clearer, and matches the VoiceOver hint and "Przesuń, aby zacząć zmianę". Back-translation: "Swipe left to end the shift." |
| {{hint}}. Swipe the button to the left, or double-tap. | {{hint}}. Przesuń przycisk w lewo albo stuknij dwukrotnie. | (unchanged) | Checked: mirrors the "w prawo" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | Wpisz kwoty jako liczby, z centami po kropce, np. 2400 lub 2400.50. | Wpisz kwoty jako liczby, np. 2400 lub 2400,50. | The parser now accepts a decimal comma: dropped "z centami po kropce" and used the Polish decimal comma. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | Obie strony dostają +10 darmowych przejazdów miesięcznie, gdy dołączy znajomy. | “Oboje/obaj” mark gender; “obie strony” (both sides) is neutral. |
| You joined with {{code}}: … | Kod od znajomego {{code}}: 10 dodatkowych darmowych przejazdów miesięcznie. | “Dołączyłeś/Dołączyłaś” is gendered; rephrased as a noun phrase. Back: “Code from a friend …: 10 extra free drives a month.” |
| Friends joined: {{count}} · +{{drives}} … | Znajomi, którzy dołączyli: {{count}} · +{{drives}} darmowych przejazdów miesięcznie | {{drives}} is always a multiple of 10, so the genitive plural is always right. |
| Your friends get their extra drives… coming in an update. | …gdy MileMint zacznie liczyć znajomych… | “będzie mógł” would give MileMint a gender; “zacznie” avoids it. |
| Redeem | Użyj | Short; Apple’s “Zrealizuj” sounds formal on a small button. |
| Share it · friends get +10 drives | Udostępnij · +10 przejazdów dla znajomych | 41 chars (1.24×). |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | Wyślij znajomemu zaproszenie. Gdy dołączy z nim do MileMint, obie strony dostają 10 dodatkowych darmowych przejazdów automatycznych miesięcznie. Za każdego znajomego, bez limitu. | “Send a friend an invitation. When they join MileMint with it, both sides get 10 extra free automatic trips a month. For every friend, no limit.” *obie strony*, *przejazdy* as in Round 4. |
| Send an invite | Wyślij zaproszenie | “Send invitation” Button, 1.29×. |
| Every invite has its own code, for one friend. | Każde zaproszenie ma własny kod, dla jednego znajomego. | “Each invitation has its own code, for one friend.” |
| Invites sent: {{count}} | Wysłane zaproszenia: {{count}} | “Sent invitations: {{count}}” Label form avoids number agreement; same in all four forms. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | Zaproszenia są potwierdzane przez iCloud, które pojawi się w jednej z kolejnych aktualizacji. Znajomi, którzy dołączą wcześniej, dostaną dodatkowe przejazdy po jego włączeniu – Ty też. | “Invitations are confirmed through iCloud, which will appear in one of the next updates. Friends who join earlier will get extra trips once it’s on – you too.” No promise of drives today. En dash as in Round 4. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | Wpisano kod {{code}}. Twoje 10 dodatkowych przejazdów pojawi się, gdy zaproszenie zostanie potwierdzone. | “Code {{code}} entered. Your 10 extra trips will appear when the invitation is confirmed.” Impersonal *Wpisano* avoids gendered past tense. |
| Code {{code}} saved | Zapisano kod {{code}} | “Code {{code}} saved” Mirrors “Dodano kod {{code}}”. |
| Your 10 extra drives are on their way once the invite is confirmed. | Twoje 10 dodatkowych przejazdów pojawi się, gdy zaproszenie zostanie potwierdzone. | “Your 10 extra trips will appear when the invitation is confirmed.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | Twój kod zaproszenia to {{code}}. Wpisz go przy konfiguracji MileMint, a dostaniesz 10 dodatkowych darmowych przejazdów miesięcznie. | “Your invitation code is {{code}}. Enter it when setting up MileMint and you’ll get 10 extra free trips a month.” Share message: informal *ty*. |
| We couldn’t find that invite. Check the code with your friend. | Nie znaleźliśmy tego zaproszenia. Sprawdź kod ze znajomym. | “We didn’t find this invitation. Check the code with your friend.” |
| That invite has already been used. Ask your friend to send you a new one. | To zaproszenie zostało już użyte. Poproś znajomego o nowe. | “This invitation has already been used. Ask your friend for a new one.” |
| That’s one of your own invites. Send it to a friend instead. | To jedno z Twoich zaproszeń. Lepiej wyślij je znajomemu. | “It’s one of your invitations. Better send it to a friend.” Capital *Twoich* as in the app. |
| This Apple Account has already joined with a friend’s invite. | To Konto Apple dołączyło już z zaproszeniem od znajomego. | “This Apple Account has already joined with an invitation from a friend.” *Konto Apple*: Apple’s Polish name. |
| 🎉 Your friend’s invite is confirmed | 🎉 Zaproszenie od znajomego potwierdzone | “🎉 Invitation from a friend confirmed” Alert title, no verb needed. |
| Your friend’s invite couldn’t be used | Nie można użyć zaproszenia od znajomego | “Can’t use the invitation from a friend” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | Zapisany · wartość odblokujesz z Pro | “Saved · you’ll unlock the value with Pro.” *Zapisany* agrees with *przejazd*. 36 chars. |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | Zapisano. Darmowe przejazdy w tym miesiącu są już wykorzystane, więc przejazd oznaczony z powrotem z prywatnego na służbowy czeka na Pro, by pokazać swoją wartość. Przejazdy, które już pokazują wartość, ją zachowują. | “Saved. Free trips this month are already used, so a trip marked back from private to business waits for Pro to show its value. Trips that already show their value keep it.” *oznaczyć* (glossary), not *sortować*. |
| {{used}} of {{limit}} free work drives in {{month}} | Darmowe przejazdy służbowe ({{month}}): {{used}} z {{limit}} | “Free business trips ({{month}}): {{used}} of {{limit}}”. Month in brackets as in the old line, so no case ending is needed. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | Za darmo: {{count}} przejazdu służbowego miesięcznie. Prywatne przejazdy się nie liczą, a zmiana liczy się raz dziennie. Przejazdy dodane ręcznie są zawsze darmowe. Pro: bez limitu. | Four plural forms: 1 *przejazd służbowy*, 2–4 *przejazdy służbowe*, 5+ *przejazdów służbowych*, fractions *przejazdu służbowego*. Back: “Free: 40 business trips a month. Private trips don’t count, and a shift counts once a day. Trips added by hand are always free. Pro: no limit.” |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | Prywatne przejazdy się nie liczą. Oznacz jeden jako prywatny, a jego miejsce zajmie kolejny przejazd. | “Private trips don’t count. Mark one as private and the next trip takes its place.” |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | Po przekroczeniu limitu nic nie znika ani nie jest ukryte: każdy przejazd jest zapisany, widoczny w całości, można go oznaczyć i jest w eksporcie do arkusza. Na Pro czeka tylko jego wartość. | “After the limit, nothing disappears or is hidden: every trip is saved, visible in full, can be marked and is in the spreadsheet export. Only its value waits for Pro.” |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | Najpierw liczą się najwcześniejsze przejazdy miesiąca, więc przejazd, który pokazuje wartość, ją zachowuje. Licznik startuje od nowa 1. dnia miesiąca. | “The month’s earliest trips count first, so a trip that shows its value keeps it. The counter starts again on the 1st of the month.” |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} przejazd / few: {{count}} przejazdy / many: {{count}} przejazdów / other: {{count}} przejazdu | “{{count}} drive(s)” one/few/many/other. |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: {{count}} przejazd od tamtej pory wygląda na dostawę. Zostanie dodany do zmiany jako służbowy. / few: {{count}} przejazdy od tamtej pory wyglądają na dostawy. Zostaną dodane do zmiany jako służbowe. / many: {{count}} przejazdów od tamtej pory wygląda na dostawy. Zostaną dodane do zmiany jako służbowe. / other: {{count}} przejazdu od tamtej pory wygląda na dostawy. Zostaną dodane do zmiany jako służbowe. | “{{count}} drives since then look like deliveries. They’ll be added to the shift as business.” Verb agreement per form (*wygląda/wyglądają*). |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · do oznaczenia: {{count}} / few: {{purpose}} · do oznaczenia: {{count}} / many: {{purpose}} · do oznaczenia: {{count}} / other: {{purpose}} · do oznaczenia: {{count}} | “{{purpose}} · to mark: {{count}}” Count after a colon so one text fits every form. |
| After your shift ended · not counted as work unless you say so | Po końcu zmiany · nie liczy się jako praca, chyba że zdecydujesz inaczej | “After the end of the shift · doesn’t count as work unless you decide otherwise” |
| Deliveries | Dostawy | “Deliveries” |
| Did your shift start at {{time}}? | Zmiana zaczęła się o {{time}}? | “The shift started at {{time}}?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | Przejazdy trafiają do zmiany albo z niej wypadają według godziny rozpoczęcia. Przejazd trwający dłużej niż zmiana zostaje podzielony w chwili jej końca. | “Drives go into the shift or drop out of it by their start time. A drive lasting past the shift is split at the moment it ends.” |
| During a pause in your shift · not counted as work unless you say so | W przerwie w zmianie · nie liczy się jako praca, chyba że zdecydujesz inaczej | “In a break in the shift · doesn’t count as work unless you decide otherwise” |
| End 15 minutes earlier | Koniec 15 minut wcześniej | “End 15 minutes earlier” |
| End 15 minutes later | Koniec 15 minut później | “End 15 minutes later” |
| End your shift? | Zakończyć zmianę? | “End the shift?” |
| Ended {{time}} | Koniec o {{time}} | “End at {{time}}” |
| Hide drives ▴ | Ukryj przejazdy ▴ | “Hide drives ▴” |
| Hides the drives in this shift | Ukrywa przejazdy z tej zmiany | “Hides the drives from this shift” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | Wciąż trwała, więc MileMint ją zakończył. Kolejne przejazdy zostawiamy Tobie do oznaczenia. Stuknij, aby sprawdzić godziny. | “It was still on, so MileMint ended it. We leave the next drives for you to mark. Tap to check the hours.” *Stuknij*, as elsewhere. |
| Map of the drives in this shift | Mapa przejazdów z tej zmiany | “Map of the drives from this shift” |
| On shift | Na zmianie | “On shift” |
| Pause | Pauza | “Pause” |
| Pause the shift for a personal errand | Wstrzymaj zmianę na prywatną sprawę | “Pause the shift for a private matter” |
| Paused · {{elapsed}} | Pauza · {{elapsed}} | “Pause · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | Pauza: przejazdy teraz nie liczą się jako praca. Wznów, gdy wrócisz. | “Pause: drives now don’t count as work. Resume when you’re back.” |
| Resume | Wznów | “Resume” |
| Resume the shift | Wznów zmianę | “Resume the shift” |
| Shift | Zmiana | “Shift” |
| Shift ended | Zmiana zakończona | “Shift ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | Zmiana {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift {{date}}, …” |
| Show drives ▾ | Pokaż przejazdy ▾ | “Show drives ▾” |
| Shows the drives in this shift | Pokazuje przejazdy z tej zmiany | “Shows the drives from this shift” |
| Since {{time}} | Od {{time}} | “From {{time}}” |
| Start 15 minutes earlier | Początek 15 minut wcześniej | “Start 15 minutes earlier” |
| Start 15 minutes later | Początek 15 minut później | “Start 15 minutes later” |
| Start from {{time}} | Zacznij od {{time}} | “Start from {{time}}” |
| Start shift from {{time}}? | Zacząć zmianę od {{time}}? | “Start the shift from {{time}}?” |
| Started {{time}} | Początek o {{time}} | “Start at {{time}}” |
| Still working | Wciąż pracuję | “Still working” |
| Undo | Cofnij | “Undo” iOS Polish. |
| Undo ending the shift | Cofnij zakończenie zmiany | “Undo ending the shift” |
| Where your shift ended | Miejsce końca zmiany | “Place of the shift’s end” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | Od dłuższego czasu stoisz zaparkowany pod domem, a zmiana wciąż trwa. Przejazdy po jej końcu nie liczą się jako praca. | “You’ve been parked outside your home for a long while and the shift is still on. Drives after it ends don’t count as work.” *pod domem*: what Poles say for parked at home. |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | Stoisz zaparkowany pod domem od {{time}}. Przejazdy po zmianie nie liczą się jako praca. | “You’ve been parked outside your home since {{time}}. Drives after the shift don’t count as work.” |
| Your shift ended after 16 hours | Zmiana zakończyła się po 16 godzinach | “The shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “Stan śledzenia” row and background notifications. 24 new lines. Terms: *przejazd*, *śledzenie*, *zapisywać*, *pominięty*, Ty (capitalised Twój). iOS wording: *Ustawienia*, *Lokalizacja*, *Dokładna lokalizacja*; *Stuknij* as elsewhere. Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | Dokładna lokalizacja jest wyłączona | “Precise location is off”. *Dokładna lokalizacja* is Apple’s Polish toggle. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint dostaje tylko przybliżoną pozycję, więc nie może mierzyć przejazdów. W Ustawieniach stuknij Lokalizacja i włącz Dokładna lokalizacja. | “MileMint only gets an approximate position, so it can’t measure trips. In Settings tap Location and turn on Precise Location.” |
| Tracking has stopped | Śledzenie się zatrzymało | “Tracking has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | Automatyczne śledzenie przestało działać, więc nowe przejazdy nie są zapisywane. | “Automatic tracking stopped working, so new trips aren’t being saved.” |
| Tracking may have stopped | Śledzenie mogło się zatrzymać | “Tracking may have stopped”. |
| No location since {{time}}, in the middle of a drive. | Brak lokalizacji od {{time}}, w trakcie przejazdu. | “No location since {{time}}, during a trip.” |
| Turn tracking back on | Włącz śledzenie ponownie | “Turn tracking on again”. Button, 24 chars (1.14×). |
| Tracking stopped {{from}}–{{to}} | Śledzenie przerwane {{from}}–{{to}} | “Tracking interrupted {{from}}–{{to}}”. |
| A drive may have been missed | Przejazd mógł zostać pominięty | “A trip may have been missed”. |
| About {{distance}} may be missing. Add the missed trip? | Może brakować około {{distance}}. Dodać pominięty przejazd? | “About {{distance}} may be missing. Add the missed trip?” *pominięty przejazd* as in “Dodaj pominięty przejazd”. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | Twój telefon przemieścił się o około {{distance}} między {{from}} a {{to}}, ale żaden przejazd nie został zapisany. Dodać pominięty przejazd? | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was saved. Add the missed trip?” |
| Not a drive | To nie był przejazd | “That wasn’t a trip”. Link, 19 chars; the natural phrasing, room in the row. |
| All good | Wszystko w porządku | “Everything is fine”. |
| just now | przed chwilą | “a moment ago”. |
| {{count}} minutes ago | one: {{count}} minutę temu / few: {{count}} minuty temu / many: {{count}} minut temu / other: {{count}} minuty temu | “{{count}} minute(s) ago”: minutę/minuty/minut, other for fractions. |
| {{count}} hours ago | one: {{count}} godzinę temu / few: {{count}} godziny temu / many: {{count}} godzin temu / other: {{count}} godziny temu | “{{count}} hour(s) ago”: godzinę/godziny/godzin. |
| {{count}} days ago | one: {{count}} dzień temu / few: {{count}} dni temu / many: {{count}} dni temu / other: {{count}} dnia temu | “{{count}} day(s) ago”: dzień/dni/dni, other *dnia*. |
| Tracking check | Stan śledzenia | “Tracking status”. |
| Last location: {{ago}} | Ostatnia lokalizacja: {{ago}} | “Last location: {{ago}}”. |
| No location yet | Brak lokalizacji | “No location”. *jeszcze* dropped: “Brak lokalizacji” is the usual empty-state wording. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | Dostęp MileMint do lokalizacji jest wyłączony, więc przejazdy nie są zapisywane. Stuknij, aby włączyć go ponownie. | “MileMint’s access to location is off, so trips aren’t saved. Tap to turn it on again.” |
| Drives can’t be measured from a rough position. Tap to fix it. | Przejazdów nie da się zmierzyć z przybliżonej pozycji. Stuknij, aby to naprawić. | “Trips can’t be measured from an approximate position. Tap to fix it.” |
| New drives aren’t being logged. Tap to turn tracking back on. | Nowe przejazdy nie są zapisywane. Stuknij, aby ponownie włączyć śledzenie. | “New trips aren’t saved. Tap to turn tracking on again.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | Brak lokalizacji od {{time}}, w trakcie przejazdu. Otwórz MileMint, aby wznowić śledzenie. | “No location since {{time}}, during a trip. Open MileMint to resume tracking.” |

**Sign-off:** approved.


## Round 8: pre-release fixes

| English | pl | Back-translation | Note |
|---|---|---|---|
| Where your shift started | Miejsce początku zmiany | Place where the shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | pl | Back-translation | Note |
|---|---|---|---|
| Opens trip details | Otwiera szczegóły przejazdu | Opens the drive details | Matches the row’s existing hint. |
| Usual purpose · tap to change | Zwykły cel · dotknij, aby zmienić | Usual purpose · tap to change | *Cel* as in “Cel służbowy”. |
| Purpose needed for your tax records | Potrzebny cel do ewidencji podatkowej | Purpose needed for the tax records | *ewidencja* is the usual word for a mileage log (ewidencja przebiegu). |
| Shows only the drives that need a purpose | Pokazuje tylko przejazdy bez celu | Shows only drives without a purpose | Natural, fits its place. |
| {{count}} work drives need a purpose | one: {{count}} przejazd służbowy wymaga celu / few: {{count}} przejazdy służbowe wymagają celu / many: {{count}} przejazdów służbowych wymaga celu / other: {{count}} przejazdu służbowego wymaga celu | {{count}} business drive(s) need(s) a purpose | one/few/many/other. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} wymaga celu każdego przejazdu służbowego. Jedno dotknięcie na przejazd. | {{authority}} requires the purpose of every business drive. One tap per drive. | *wymaga* as in “{{authority}} wymaga celu służbowego”. |
| Add purposes › | Dodaj cele › | Add purposes › | Natural, fits its place. |
| Every work drive has a purpose ✓ | Każdy przejazd służbowy ma cel ✓ | Every business drive has a purpose ✓ | Natural, fits its place. |
| Show all drives | Pokaż wszystkie przejazdy | Show all drives | Natural, fits its place. |
| {{count}} work drives have no purpose | one: {{count}} przejazd służbowy nie ma celu / few: {{count}} przejazdy służbowe nie mają celu / many: {{count}} przejazdów służbowych nie ma celu / other: {{count}} przejazdu służbowego nie ma celu | {{count}} business drive(s) has/have no purpose | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} wymaga celu każdego przejazdu służbowego. Dodać je przed eksportem? | {{authority}} requires the purpose of every business drive. Add them before export? | Infinitive question, the usual iOS-alert form. |
| Export anyway | Eksportuj mimo to | Export anyway | Natural, fits its place. |
| Add purposes | Dodaj cele | Add purposes | Natural, fits its place. |
| Usual business purpose | Zwykły cel służbowy | Usual business purpose | Natural, fits its place. |
| Clear | Wyczyść | Clear | Natural, fits its place. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | Wpisywany w przejazdach służbowych bez celu, żeby ewidencja podatkowa była kompletna. Przejazdy na zmianie mają „Dostawy”, chyba że wybierzesz inny. | Entered on business drives without a purpose, so the tax records are complete. Drives on a shift get “Deliveries” unless you choose another. | *na zmianie* as in “Autom.: na zmianie”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | Wpisywany w przejazdach służbowych bez celu, żeby ewidencja podatkowa była kompletna. Możesz go zmienić w każdym przejeździe. | Entered on business drives without a purpose, so the tax records are complete. You can change it on any drive. | Natural, fits its place. |
| None: ask me each time | Brak: pytaj mnie za każdym razem | None: ask me every time | Natural, fits its place. |
| What are most of your work drives for? | W jakim celu najczęściej jeździsz służbowo? | For what purpose do you most often drive for work? | Rephrased for natural Polish. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | Urząd skarbowy wymaga celu każdego przejazdu służbowego. Wpiszemy go za Ciebie, a zmienisz go w każdym przejeździe. | The tax office requires the purpose of every business drive. We’ll enter it for you, and you can change it on any drive. | *Ciebie* capitalised, as in the file’s direct address. |


## Round 8c: work purpose tiles

Back-translations: Choose all that fit. We'll enter the first one chosen for you. / We'll enter it for you / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | pl | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | Bez zakładania konta. Twoje przejazdy zostają na Twoim telefonie. | No account needed. Your trips stay on your phone. | Keeps “Bez zakładania konta”. |
| Is this home? {{place}} | Czy to dom? {{place}} | Is this home? {{place}} | *Dom* as in “Home”. |
| You stopped here for the night. Trips to and from it will read “Home”. | Tu był Twój nocny postój. Przejazdy stąd i do tego miejsca będą opisane jako „Dom”. | This was your overnight stop. Trips from and to this place will be described as “Home”. | Built around a noun (*nocny postój*) to avoid a gendered past-tense verb. |
| Yes, that’s home | Tak, to dom | Yes, it’s home |  |
| No | Nie | No |  |
| Is this work? {{place}} | Czy to praca? {{place}} | Is this work? {{place}} | *Praca* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | W godzinach pracy często tu parkujesz. Przejazdy będą opisane jako „Praca”, a dojazdy między domem a pracą zostaną oznaczone. | You often park here during working hours. Trips will be described as “Work”, and commutes between home and work will be marked. | *dojazdy* as in the old places line. |
| Yes, that’s work | Tak, to praca | Yes, it’s work |  |


## Round 8f: motion activity

“Pozwól” / “Nie pozwalaj” are iOS’s alert buttons. “Ruch i sprawność” is iOS’s Settings item as best known: Unsure, please check against a Polish iPhone. “Przejazd” as everywhere else. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | Jeszcze jedno, dla dokładności: Ruch i sprawność | One more, for accuracy: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | Pozwala MileMint odróżnić jazdę od chodzenia, więc spacer nigdy nie zostanie zapisany jako przejazd. Zostaje na Twoim telefonie. | Lets MileMint tell driving from walking, so a walk is never saved as a trip. It stays on your phone. | |
| Turn on Motion & Fitness | Włącz Ruch i sprawność | Turn on Motion & Fitness | |
| Allow | Pozwól | Allow | |
| Don’t Allow | Nie pozwalaj | Don’t allow | |
| Motion & Fitness | Ruch i sprawność | Motion & Fitness | |
| On | Włączone | On | |
| Off | Wyłączone | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | Gdy zaczynasz pracę, przesuń, aby zacząć zmianę. Każdy przejazd na zmianie liczy się jako {{purpose}}. | When you start work, swipe to start the shift. Each drive on the shift counts as {{purpose}}. | *Przesuń, aby zacząć zmianę* as on the bar. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | Przejazdy w Twoich godzinach ({{days}} {{from}}–{{to}}) oznaczamy automatycznie jako służbowe. | We mark drives in your hours ({{days}} {{from}}–{{to}}) automatically as business. | Polite capital *Twoich*, as elsewhere. |
| Drives in your work hours are sorted as business for you. | Przejazdy w Twoich godzinach pracy oznaczamy automatycznie jako służbowe. | We mark drives in your work hours automatically as business. | Natural, fits its place. |
| After each drive, swipe right for business or left for personal. | Po każdym przejeździe przesuń w prawo, jeśli służbowy, lub w lewo, jeśli prywatny. | After each drive swipe right if business, or left if private. | Natural, fits its place. |
| {{rate}} a mile · {{vehicle}} · {{country}} | {{rate}} za milę · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | Natural, fits its place. |
| {{rate}} a km · {{vehicle}} · {{country}} | {{rate}} za km · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | Natural, fits its place. |
| PRACTICE RUN | ĆWICZENIE | EXERCISE | Natural, fits its place. |
| This is how a drive shows up after you park. Try sorting it. | Tak wygląda przejazd po zaparkowaniu. Spróbuj go posortować. | This is what a drive looks like after parking. Try sorting it. | Natural, fits its place. |
| Swipe left for personal | Przesuń w lewo, jeśli prywatny | Swipe left if private | Natural, fits its place. |
| Not that way. Try again. | Nie w tę stronę. Spróbuj jeszcze raz. | Not that way. Try once more. | Natural, fits its place. |
| Sorted as personal ✓ | Oznaczono jako prywatny ✓ | Marked as private ✓ | Natural, fits its place. |
| Now a work drive. Work drives are worth money back. | Teraz przejazd służbowy. Służbowe przejazdy to zwrot pieniędzy. | Now a business drive. Business drives mean money back. | Natural, fits its place. |
| Swipe right for business | Przesuń w prawo, jeśli służbowy | Swipe right if business | Natural, fits its place. |
| Sorted as business: worth {{amount}} | Oznaczono jako służbowy: wart {{amount}} | Marked as business: worth {{amount}} | *wart* as in the row. |
| Swipe to start your shift | Przesuń, aby zacząć zmianę | Swipe to start the shift | Same as the bar. |
| Your shift is on ✓ | Zmiana rozpoczęta ✓ | Shift started ✓ | Natural, fits its place. |
| Mark as personal | Oznacz jako prywatny | Mark as private | Natural, fits its place. |
| Mark as business | Oznacz jako służbowy | Mark as business | Natural, fits its place. |
| Practice drive · not saved | Przejazd ćwiczebny · niezapisany | Practice drive · unsaved | Natural, fits its place. |
| Supermarket | Supermarket | Supermarket | Natural, fits its place. |
| Office | Biuro | Office | Natural, fits its place. |
| Customer | Klient | Customer | Natural, fits its place. |
| That’s it. Just drive: trips appear here after you park. | To wszystko. Po prostu jedź: przejazdy pojawią się tutaj po zaparkowaniu. | That’s all. Just drive: drives will appear here after parking. | Natural, fits its place. |
| Start driving | Ruszaj w drogę | Hit the road | Natural, fits its place. |
| Skip | Pomiń | Skip | Natural, fits its place. |
| Skip the practice run | Pomiń ćwiczenie | Skip the exercise | Natural, fits its place. |
| Tutorial | Samouczek | Tutorial | Standard Polish UI word. |
| Replay the tutorial | Powtórz samouczek | Repeat the tutorial | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | Jeszcze raz posortuj dwa przykładowe przejazdy. Nic nie zostanie zapisane. | Sort two sample drives once more. Nothing will be saved. | Natural, fits its place. |
| Replay | Powtórz | Repeat | Natural, fits its place. |

## Round 8h: Pro screen

Plain trial terms. All four plural forms for days and months. “Ustawienia” is the iPhone Settings app, as in “Otwórz Ustawienia”. {{date}} is genitive “1 listopada”, so “kończy się {{date}}”. The trial pill and lengths are plurals, so “1 month” / “2 months” read right.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| {{count}} days free | {{count}} dzień za darmo / {{count}} dni za darmo / {{count}} dni za darmo / {{count}} dnia za darmo | {{count}} day(s) for free |  |
| {{count}} months free | {{count}} miesiąc za darmo / {{count}} miesiące za darmo / {{count}} miesięcy za darmo / {{count}} miesiąca za darmo | {{count}} month(s) for free |  |
| {{count}} months | {{count}} miesiąc / {{count}} miesiące / {{count}} miesięcy / {{count}} miesiąca | {{count}} month(s) |  |
| {{price}} a month | {{price}} miesięcznie | {{price}} monthly | Under the yearly price: the yearly price ÷ 12. |
| Most popular | Najpopularniejszy | The most popular | Badge on the yearly plan. |
| We’ll remind you 3 days before it ends. | Przypomnimy Ci 3 dni przed końcem. | We’ll remind you 3 days before the end. |  |
| {{trial}} free, then {{price}} a year. Cancel any time in Settings. | {{trial}} za darmo, potem {{price}} rocznie. Anuluj w każdej chwili w Ustawieniach. | {{trial}} for free, then {{price}} yearly. Cancel at any moment in Settings. |  |
| {{trial}} free, then {{price}} a month. Cancel any time in Settings. | {{trial}} za darmo, potem {{price}} miesięcznie. Anuluj w każdej chwili w Ustawieniach. | {{trial}} for free, then {{price}} monthly. Cancel at any moment in Settings. |  |
| Free trial, then {{price}} a year. Cancel any time in Settings. | Darmowy okres próbny, potem {{price}} rocznie. Anuluj w każdej chwili w Ustawieniach. | Free trial period, then {{price}} yearly. Cancel at any moment in Settings. |  |
| Free trial, then {{price}} a month. Cancel any time in Settings. | Darmowy okres próbny, potem {{price}} miesięcznie. Anuluj w każdej chwili w Ustawieniach. | Free trial period, then {{price}} monthly. Cancel at any moment in Settings. |  |
| {{price}} a year. Cancel any time in Settings. | {{price}} rocznie. Anuluj w każdej chwili w Ustawieniach. | {{price}} yearly. Cancel at any moment in Settings. |  |
| {{price}} a month. Cancel any time in Settings. | {{price}} miesięcznie. Anuluj w każdej chwili w Ustawieniach. | {{price}} monthly. Cancel at any moment in Settings. |  |
| Your free month ends on {{date}} | Twój darmowy miesiąc kończy się {{date}} | Your free month ends {{date}} | Notification title, 3 days before a one-month trial ends. |
| Your free trial ends on {{date}} | Twój darmowy okres próbny kończy się {{date}} | Your free trial period ends {{date}} | For other trial lengths. |
| Keep Pro for {{price}} a year, or cancel in Settings. Nothing to do if you’re staying. | Zostań z Pro za {{price}} rocznie albo anuluj w Ustawieniach. Jeśli zostajesz, nic nie musisz robić. | Stay with Pro for {{price}} yearly or cancel in Settings. If you’re staying, you don’t need to do anything. | Notification body. |
| Keep Pro for {{price}} a month, or cancel in Settings. Nothing to do if you’re staying. | Zostań z Pro za {{price}} miesięcznie albo anuluj w Ustawieniach. Jeśli zostajesz, nic nie musisz robić. | Stay with Pro for {{price}} monthly or cancel in Settings. If you’re staying, you don’t need to do anything. |  |

## Round 8i: parking & tolls

Parking and tolls on a drive: the “+ Parking or tolls” fields when adding a trip and on the trip screen, the line on a business trip’s row and under home’s total, the report screen, and each country’s line on what counts. Tax terms stay in English as elsewhere (Mileage Allowance Relief, Car, van and travel expenses, T2125, D2, cents per km, Congestion Charge, ULEZ). The “recorded” lines are for Canada and UK employees, where they aren’t added to the total.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Kept with the drive, but only counted on business drives. | Zapisane przy przejeździe, ale liczone tylko przy przejazdach służbowych. | Saved with the trip, but counted only on business trips. | Add trip / trip details: note under the fields on a personal drive. |
| + Parking or tolls | + Parking lub opłaty drogowe | + Parking or road charges | Add trip: the link that opens the two fields. Keep the "+". |
| incl. {{amount}} parking & tolls | w tym {{amount}} za parkingi i opłaty drogowe | including {{amount}} for parking and road charges | Home hero card, under the total; lower-case start as it continues the figure. |
| Parking & tolls: {{amount}} (recorded) | Parkingi i opłaty drogowe: {{amount}} (zapisane) | Parking and road charges: {{amount}} (saved) | Home hero card where they aren’t added (Canada, UK employees). |
| +{{amount}} parking & tolls | +{{amount}} za parking i opłaty drogowe | +{{amount}} for parking and road charges | Trip row detail on a business drive. |
| A claim line for every business trip (date, from, to, purpose, distance, rate, amount, parking and tolls) for your employer’s expense system. | Osobna pozycja zwrotu kosztów dla każdego przejazdu służbowego (data, skąd, dokąd, cel, odległość, stawka, kwota, parking i opłaty drogowe) do systemu rozliczania kosztów Twojego pracodawcy. | A separate reimbursement item for each business trip (date, from, to, purpose, distance, rate, amount, parking and road charges) for your employer’s expense system. | Report screen: expense-claim export description (was without parking and tolls). |
| Mileage at {{authority}} rates | Przebieg według stawek {{authority}} | Mileage at {{authority}} rates | Report screen: the mileage part of the total. |
| Parking | Parking | Parking | Field label and report line. |
| Tolls | Opłaty drogowe | Road charges | Field label and report line (bridge and road tolls, Congestion Charge, ULEZ). |
| Included in the total above. {{note}} | Wliczone w sumę powyżej. {{note}} | Counted in the total above. {{note}} | Report screen; note = the country’s line below. |
| Recorded, not included in the total above. {{note}} | Zapisane, ale niewliczone w sumę powyżej. {{note}} | Saved, but not counted in the total above. {{note}} | Report screen (Canada, UK employees); note = the country’s line below. |
| Enter parking as an amount, e.g. 3.50. | Wpisz parking jako kwotę, np. 3,50. | Enter parking as an amount, e.g. 3,50. | Error under the fields. |
| Enter tolls as an amount, e.g. 3.50. | Wpisz opłaty drogowe jako kwotę, np. 3,50. | Enter road charges as an amount, e.g. 3,50. | Error under the fields. |
| Parking or tolls over {{max}} for one drive? Check the amount. | Ponad {{max}} za parking lub opłaty drogowe w jednym przejeździe? Sprawdź kwotę. | Over {{max}} for parking or road charges on one trip? Check the amount. | Error; max = £1,000.00 / $1,000.00. |
| {{what}}, in {{currency}} | {{what}}, w {{currency}} | {{what}}, in {{currency}} | VoiceOver label of a money box, e.g. "Parking, in GBP". |
| Business parking and tolls are deductible on top of the mileage rate. Parking at your regular workplace isn’t, and fines never are. | Służbowe parkingi i opłaty drogowe odliczasz dodatkowo, poza stawką za milę. Parkingu przy stałym miejscu pracy nie, a mandatów nigdy. | You deduct business parking and road charges additionally, beyond the per-mile rate. Not parking at your permanent workplace, and never fines. | US note under the fields. |
| Parking at your regular place of work and tolls on your commute are not deductible. | Parking przy stałym miejscu pracy i opłaty drogowe na dojazdach do pracy nie podlegają odliczeniu. | Parking at your permanent workplace and road charges on commutes aren’t deductible. | US report guidance (PDF stays English). |
| Self-employed: business parking, tolls and Congestion Charge or ULEZ charges are claimed on top of the mileage rate. Parking and traffic fines never are. | Samozatrudnieni: parkingi, opłaty drogowe oraz Congestion Charge lub ULEZ w przejazdach służbowych rozlicza się dodatkowo, poza stawką za milę. Mandatów za parkowanie i wykroczenia drogowe nigdy. | Self-employed: parking, road charges and Congestion Charge or ULEZ on business trips are claimed additionally, beyond the per-mile rate. Parking and traffic fines never. | UK self-employed note under the fields. |
| Parking and tolls aren’t part of Mileage Allowance Relief. Claim them from your employer, or as a separate employment expense if they don’t repay them. Fines never count. | Parkingi i opłaty drogowe nie wchodzą w Mileage Allowance Relief. Poproś pracodawcę o ich zwrot, a jeśli ich nie zwraca, rozlicz je jako osobny wydatek związany z pracą. Mandaty nigdy się nie liczą. | Parking and road charges aren’t part of Mileage Allowance Relief. Ask your employer to repay them, and if they don’t, claim them as a separate work expense. Fines never count. | UK employee note under the fields. |
| Self-employed: parking, tolls and Congestion Charge or ULEZ charges on business journeys are added on top of the mileage figure, in the same Car, van and travel expenses box. Parking and traffic fines are never allowable. | Samozatrudnieni: parkingi, opłaty drogowe oraz Congestion Charge lub ULEZ w przejazdach służbowych dolicza się do kwoty za przebieg, w tej samej rubryce Car, van and travel expenses. Mandatów za parkowanie i wykroczenia drogowe nigdy nie można odliczyć. | Self-employed: parking, road charges and Congestion Charge or ULEZ on business trips are added to the mileage amount, in the same Car, van and travel expenses box. Parking and traffic fines can never be deducted. | UK report guidance (PDF stays English). |
| Employees: parking and tolls are not part of Mileage Allowance Relief. They are listed separately, to claim from your employer or as a separate employment expense. | Pracownicy: parkingi i opłaty drogowe nie wchodzą w Mileage Allowance Relief. Są wykazane osobno, do zwrotu przez pracodawcę albo do rozliczenia jako osobny wydatek związany z pracą. | Employees: parking and road charges aren’t part of Mileage Allowance Relief. They’re listed separately, for the employer to repay or to claim as a separate work expense. | UK report guidance (PDF stays English). |
| Recorded apart from the per-km figure. Self-employed: business parking is usually claimed in full. Ask your accountant about tolls. | Zapisane osobno, poza kwotą za km. Samozatrudnieni: służbowy parking zwykle odlicza się w całości. O opłaty drogowe zapytaj księgowego. | Saved separately, outside the per-km amount. Self-employed: business parking is usually deducted in full. Ask your accountant about road charges. | Canada note under the fields. |
| Parking and tolls are listed separately and not added to the per-km figure. Self-employed: business parking fees are deducted in full on T2125, not reduced to your business-use share. Ask your accountant whether your tolls can be claimed. | Parkingi i opłaty drogowe są wykazane osobno i nie są doliczane do kwoty za km. Samozatrudnieni: służbowe opłaty parkingowe odlicza się w całości w T2125, bez pomniejszania o udział jazdy służbowej. Zapytaj księgowego, czy możesz odliczyć opłaty drogowe. | Parking and road charges are listed separately and not added to the per-km amount. Self-employed: business parking fees are deducted in full in T2125, without reducing them by the business-driving share. Ask your accountant whether you can deduct road charges. | Canada report guidance (PDF stays English). |
| Work parking and tolls aren’t covered by cents per km, so they’re claimed separately. Not parking at your regular workplace, or tolls on the way there. | Cents per km nie obejmuje służbowych parkingów i opłat drogowych, więc rozlicza się je osobno. Poza parkingiem przy stałym miejscu pracy i opłatami w drodze do niego. | Cents per km doesn’t cover business parking and road charges, so they’re claimed separately. Except parking at your permanent workplace and charges on the way to it. | Australia note under the fields. |
| Parking fees and tolls for work trips aren’t covered by the cents per km rate. Claim them separately: individuals as Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace, or tolls between home and work. | Cents per km nie obejmuje parkingów i opłat drogowych w przejazdach służbowych. Rozlicz je osobno: osoby fizyczne jako Work-related travel expenses (D2), jednoosobowe firmy (sole traders) w kosztach firmy. Poza parkingiem przy stałym miejscu pracy i opłatami między domem a pracą. | Cents per km doesn’t cover parking and road charges on business trips. Claim them separately: individuals as Work-related travel expenses (D2), sole traders in business costs. Except parking at your permanent workplace and charges between home and work. | Australia report guidance (PDF stays English). |

## Round 9: tabs

The app now opens on four tabs (Home, Drives, Money, Settings) instead of one long home screen with a menu. The menu’s lines (Menu, Close menu, Free plan, ★ Pro · unlimited drives, Work hours, places and reminders) are gone. “Start” is short and common for the first tab in Polish apps; “Dom” stays for the place.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Home (tab) | Start | Start | Tab bar label for the first tab. Key is "Home (tab)" so it isn’t the place “Home” (English shows “Home”). Short: under an icon. |
| Drives | Przejazdy | Journeys | Tab bar label: every drive, by month. Same word as the app’s “drives”. |
| Money | Pieniądze | Money | Tab bar label: the tax year’s money back, month by month, Pro and the tax screens. One short word. |
| Opens the Money tab | Otwiera kartę Pieniądze | Opens the Money tab | VoiceOver hint on home’s green card, which opens the Money tab. |
| To sort | Do oznaczenia | To mark | Home: heading over the drives still to sort as business or personal. |
| All drives sorted ✓ | Wszystkie przejazdy oznaczone ✓ | All journeys marked ✓ | Home, when nothing is left to sort; the row opens the Drives tab. |
| See all drives › | Pokaż wszystkie przejazdy › | Show all journeys › | Home, next to the line above: opens the Drives tab. Keep the “›”. |
| By month | Według miesięcy | By month | Money tab: heading over this tax year’s months. |
| Earlier tax years | Wcześniejsze lata podatkowe | Earlier tax years | Money tab: heading over the years before this one. |
| Tracking | Śledzenie | Tracking | Settings group heading, small capitals: the tracking check, work hours and places. |
| Driving & tax | Jazda i podatki | Driving and taxes | Settings group heading: country, vehicles, how drives start, mileage pay, client privacy. |
| Pro & friends | Pro i znajomi | Pro and friends | Settings group heading: the Pro plan and inviting friends. |
| Backup & data | Kopia i dane | Backup and data | Settings group heading: iCloud backup and restore. |
| Notifications | Powiadomienia | Notifications | Settings group heading: the Sunday reminder. |
| About & support | O aplikacji i pomoc | About the app and help | Settings group heading: language, the tutorial, help and feedback. |
