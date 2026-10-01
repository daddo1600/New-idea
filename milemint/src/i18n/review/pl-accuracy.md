# Polish (pl) — accuracy review (check 2 of 3)

Reviewer: independent PL→EN back-translation check.
Scope: all **662 entries** in `src/i18n/locales/pl.ts` (including every form of every plural object). I back-translated each one and compared it with its English key. Where a line was ambiguous I checked the notes and the files in `source-keys.json`.
`npx jest src/i18n` passes after the changes (30/30).

## Overall

The translation is accurate and consistent. The glossary terms (przejazd, służbowy/prywatny, oznaczyć, przesuń, zmiana, rok podatkowy, przebieg, raport, odliczenie, szacunkowy, Pro, plan darmowy) are used the same way throughout. Plural objects use the right forms for one/few/many/other: `other` is the fraction form ("12,5 mili", "1,5 dnia"), which is correct because `{{distance}}` can be a decimal. Placeholders and `<b>` tags are intact. The tax lines stay hedged ("szacunkowo", "To nie jest porada podatkowa", "zwykle", "mogą być warte do").

I made 16 changes (13 keys plus 3 share messages that had the same plural problem).

## Changes

| English | Before | After | Why |
|---|---|---|---|
| `{{rule}}. Petrol, diesel, hybrid or electric: same rate for a car or van you own.` | …dla Twojego auta lub vana. | …dla **własnego** auta lub vana. | "You own" means your own car, as opposed to a company car. "Twojego" lost that meaning. |
| `Employees: if your employer pays less than 55p a mile (or nothing), claim the difference with form P87…` | **odzyskaj różnicę** przez formularz P87… Możesz **cofnąć się do 4 lat podatkowych wstecz**. | **rozlicz różnicę** na formularzu P87… Możesz **to zrobić do 4 lat podatkowych wstecz**. | "Odzyskaj różnicę" reads as "get the difference back", which promises the whole amount in cash. In fact the relief is tax on the difference. "Cofnąć się … wstecz" is a pleonasm. |
| `Enter the kilometres driven, e.g. 12.5.` | np. 12.5. | np. 12,5. | `parseMiles` now accepts a decimal comma, and a Polish keypad types a comma. This resolves Unsure #2. |
| `Enter the miles driven, e.g. 12.5.` | np. 12.5. | np. 12,5. | Same as above. |
| `I use MileMint … so nothing goes unclaimed. 🚗💸` | więc nic mi nie umyka | więc żadne odliczenie mi nie przepada | "Nothing escapes me" had lost the claiming/deduction meaning. |
| `I’ve found {{amount}} in business mileage with MileMint 🚗💸…` | Dzięki MileMint **mam już** {{amount}} z przebiegu służbowego | MileMint **znalazł mi już** {{amount}} w przebiegu służbowym | "Mam już" ("I already have the money") is stronger than "found". The new wording is still gender-neutral. |
| `New to Pro? Your first month is on me: {{url}}` | Pierwszy miesiąc ode mnie | Pierwszy miesiąc masz ode mnie w prezencie | "On me" means "my treat". The bare "ode mnie" ("from me") was unclear. |
| `No drives yet` | Brak przejazdów | Na razie brak przejazdów | "Yet" was missing. |
| `No trips in {{year}} yet.` | Brak przejazdów w roku {{year}}. | Na razie brak przejazdów w roku {{year}}. | "Yet" was missing. |
| `Past trips keep their names.` | Wcześniejsze przejazdy zachowają swoje nazwy. | Wcześniejsze przejazdy zachowają nazwy miejsc. | This is shown when deleting a **place** (`settings.tsx`). Trips don't have names; they keep the place's name. |
| `Trips then read “Home → Work” …, and commutes are flagged for you.` | dojazdy do pracy zostaną dla Ciebie **oznaczone** | dojazdy do pracy będą **rozpoznawane automatycznie** | "Oznaczyć" is the glossary verb for *sort* (business/personal), so this read as "commutes will be sorted for you". The meaning here is flagged/recognised as commutes. |
| `Work-related car use (cents per km method)` | Wydatki na samochód w pracy | Służbowe użytkowanie samochodu | It said "expenses", but the English says "use". |
| `CRA asks for a logbook … plus your odometer readings at the start and end of the year.` | ze stanem licznika | ze stanami licznika | "Readings" is plural (start and end). |
| `My delivery app counted {{counted}} miles this week. …` (also the **this month** and **last month** versions) | …naliczyła w tym tygodniu {{counted}} mil. MileMint zapisał {{logged}} mil służbowych: to {{extra}} mil… | Mile naliczone w tym tygodniu przez moją aplikację kurierską: {{counted}}. Mile służbowe zapisane przez MileMint: {{logged}}. Różnica: {{extra}} (ok. {{amount}}), czyli tyle przepadłoby mi przy odliczeniach. … | These keys have no plural object, so a fixed "mil" was wrong for 2–4 and 22–24 ("mile") and for decimals ("mili"). The numbers are user-typed and can be decimals. The label-colon pattern needs no agreement (Unsure #3). The km versions are fine, because "km" doesn't change. |

## Unsure list: resolutions

1. **iOS wording.** I couldn't reach Apple's pages from this environment (support.apple.com and Polish tech blogs are blocked by the proxy), so these are based on my knowledge and on search-index snippets:
   - **"Podczas używania aplikacji"** (While Using the App): **kept**. A search restricted to support.apple.com/pl-pl matches this exact phrase alongside "Zawsze" and "Nigdy". "Gdy używam aplikacji" appears only on third-party blogs.
   - **"Zapytaj następnym razem lub gdy udostępniam"**: **kept**. This matches Apple's Polish wording as I know it.
   - **"Pozwalaj, gdy używana"** (Allow While Using App): **kept**. This is the iOS 13+ alert button (the related buttons are "Pozwól raz" and "Nie pozwalaj").
   - **"Otwórz Ustawienia"**: **resolved**. "Open Settings" is MileMint's own button, not an iOS alert, so it only has to match the app's key ("Tap “Open Settings” below" uses the same text).
   - **"Zawsze", "Nigdy", "Lokalizacja", "Ustawienia → Powiadomienia"**: **kept**; I'm confident of these.
   - **Still unverified:** "Zmień na Zawsze pozwalaj" (iOS may punctuate it as „Zmień na: Zawsze pozwalaj”) and the Settings section header "POZWÓL NA DOSTĘP DO LOKALIZACJI" (vs "ZEZWALAJ…"). Both are plausible, and I left them unchanged. **Check 3 should confirm them on a Polish-language iPhone (iOS 17/18).** If the header changes, also update "In Settings, under Allow Location Access, choose Always".
2. **Decimal comma:** resolved (see table).
3. **"{{counted}} mil" agreement:** resolved for the mile share messages (see table).
4. **"Kept, locked" / "Best value"**: the meaning is right. "Najkorzystniej" is an adverb, a little unusual on a badge, but it reads as "best deal". Length is for check 3.
5. **"Wlk. Brytania"**: the meaning is right. Length/tile fit is left to check 3 ("UK" would also be understood).
6. **"Autom.:"**: agree. It avoids the confusion with "auto" meaning car.
7. **"Kup Pro"**: acceptable for the "Go Pro" button.
8. **Length**: not assessed here (check 3).
9. **"{{label}}: zdobyte / jeszcze nie"**: fine. "Zdobyte" agrees with the implied neuter "osiągnięcie", so it doesn't need to match each title's gender.
10. **Capitalised Twój/Ci**: style only; no meaning impact.

## Other observations (not changed)

- "{{distance}} km/miles logged for work…" uses "przejechane" (driven) rather than "zapisane" (logged). The meaning still holds in context.
- "Autumn/Fall miles add up" → "Jesienne trasy też się liczą" ("count too") is an acceptable adaptation, though "add up" has a sense of accumulating money.
- "Happy holidays" → "Wesołych świąt" is the standard secular-enough Polish seasonal greeting.
