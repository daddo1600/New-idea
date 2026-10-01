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
