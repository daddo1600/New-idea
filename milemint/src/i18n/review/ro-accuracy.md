# Romanian (ro): accuracy review (check 2 of 3)

Scope: every entry in `src/i18n/locales/ro.ts` (662 keys, including all plural objects and each of their forms). Each line was back-translated on its own and then compared with the English key. Ambiguous lines were checked against the notes and the source files listed in `source-keys.json`: `app/milestones.tsx`, `app/add-trip.tsx`, `app/pro.tsx`, `app/settings.tsx`, `app/index.tsx`, `domain/deadlines.ts` and `domain/format.ts`.

Also checked:
- Placeholders and `<b>` tags (the jest suite passes).
- Plural categories one/few/other, and "de" from 20.
- Diacritics: no cedilla ş/ţ found; all are comma-below ș/ț.
- Glossary consistency: cursă, de lucru, sortează, glisează, tură, an fiscal, Treci la Pro, Configurări vs Setări.
- Money and tax wording.

Result: **18 replacements across 25 strings** (one wording fix applied to 10 strings). `npx jest src/i18n` passes.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| …unless you set your work hours. Until then, a few swipes will do. | …câteva glisări rezolvă tot. | …câteva glisări sunt de ajuns. | "rezolvă tot" (solve everything) overstated "will do". |
| {{distance}} business km logged with MileMint 🛣️ Every one counted. (one) | …km de lucru înregistrați… Fiecare a fost numărat. | …km de lucru înregistrat… Numărat cu grijă. | The singular form used plural agreement ("1 km înregistrați"). Now matches the miles version. |
| {{distance}} km logged for work, every one counted. That’s a lot of road. (one) | …km înregistrați pentru lucru, fiecare numărat. E drum lung! | …km înregistrat pentru lucru, numărat. E un început! | Same agreement error. Now matches the miles version. |
| {{distance}} of business driving; of business driving this week / this month / last month; {{distance}} km/miles · a typical month of business driving (all forms) — 10 strings | de condus **la** lucru | de condus **pentru** lucru | "condus la lucru" reads as "driving *to* work", which is commuting, the opposite of business mileage. |
| 40 automatic drives a month (…) / 40 automatic drives a month, plus… (2 strings) | Treci la Pro oricând pentru nelimitat. | Treci oricând la Pro pentru curse nelimitate. | "pentru nelimitat" was ungrammatical. |
| Best value | Cel mai bun preț | Cel mai avantajos | "Best price" ≠ "best value"; same length. |
| Every drive counts as business | Toate cursele sunt de lucru | Toate cursele contează ca de lucru | Keeps the softer "counts as" (tax nuance). |
| Every drive until you end it counts as business (with and without period) | …sunt de lucru | …contează ca de lucru | Same. |
| Every drive sorted. Tax time just got easier. | Taxele tocmai au devenit mai simple. | Vremea taxelor tocmai a devenit mai ușoară. | Back-translated as "taxes became simpler", which was a meaning drift. |
| Individuals: … Sole traders: include it with… | Sole traders: include-o… | Cei pe cont propriu (sole traders): include-o… | "Sole traders" isn't on the keep-in-English list; now translated, with the English term kept as a gloss. |
| Literally. We counted them. Come and sort this week’s. | La propriu. Le-am numărat. Hai să le sortezi pe cele din săptămâna asta. | La propriu. Am verificat. Hai să sortezi cursele din săptămâna asta. | Also follows "Kilometrii nu se sortează singuri…". Feminine "le/cele" clashed with masculine *kilometri*; now neutral. |
| Set location to “Always” and MileMint logs every drive, even when it’s closed. | …chiar și când e închisă. | …chiar și când aplicația e închisă. | Feminine "închisă" had no feminine noun to refer to. |
| Sets your currency, … You can change it later. | Poți schimba mai târziu. | Poți schimba asta mai târziu. | The object was missing. |
| Sort this week’s drives now and tax time becomes a two-minute job. | …și taxele devin o treabă de două minute. | …și pregătirea pentru taxe devine o treabă de două minute. | "Taxes become a 2-minute job" was a drift (paying tax isn't the job). |
| Unless a rule says otherwise (…). …only business drives should be claimed. | doar cursele de lucru trebuie deduse | doar cursele de lucru se pot deduce | "trebuie deduse" reads as "must be deducted", an obligation. The English means only these may be claimed. |
| Where’s home? | Unde e casa? | Unde locuiești? | Unnatural ("Where is the house?"). |
| {{label}}: earned | {{label}}: obținută | {{label}}: realizare obținută | `label` can be a money amount ("£100"), a distance ("100 miles") or a habit title (app/milestones.tsx), so bare feminine agreement was often wrong. The added noun fixes agreement for all three. Screen-reader only, so length isn't a concern. |

## Checked and left as is

- `Enter the miles/kilometres driven, e.g. 12,5.`: the decimal comma is fine, because `parseMiles` (domain/format.ts) accepts a comma.
- `{{count}} selected` with *selectate* for the other form (no "de"): accepted as a natural UI counter.
- `Business errand` = *Drum de serviciu*: fine as a purpose label, and better than *Comision*, which also means a fee.
- `Neither` = *Niciuna*, `Set hours` = *Program fix*: correct.
- `found this tax year` = *suma găsită în acest an fiscal*: correct, and it avoids agreement problems.
- `UK` = *Regatul Unit*: the standard name. Use *UK* only if the tile overflows in testing.
- `Shifts & rounds (delivery apps)` = *Ture și livrări (…)*: acceptable.
- Shift cheers: good adaptations.
- Money and tax: "estimated/estimate" is kept wherever the English has it, and no line promises a saving. The P87 line ("Poți merge înapoi până la 4 ani fiscali") matches the English.
- Glossary terms are used consistently. iOS Settings is *Configurări* and MileMint's own Settings is *Setări*; I checked each occurrence.

## Unresolved (for check 3 / on-device verification)

I couldn't confirm Apple's exact Romanian iOS strings: apple.com and applelocalization.com are blocked from this environment. Apple's Romanian support pages (titles seen in search) do use **Configurări** and **Servicii de localizare**, which supports *Configurări* and *Localizare*. *Întotdeauna* and *Niciodată* are standard. The following are still the translator's best guess and must be checked on an iPhone set to Romanian:
- Allow While Using App: *Permite când se folosește aplicația*
- Change to Always Allow: *Schimbă la Permite întotdeauna*
- While Using the App: *Când se folosește aplicația* (also used in "Location is set to “While Using”…")
- Ask Next Time Or When I Share: *Întreabă data viitoare sau când partajez*
- ALLOW LOCATION ACCESS / "Allow Location Access": *PERMITE ACCESUL LA LOCALIZARE*. Apple may use a different form; one third-party page paraphrases it as "Permite accesul la localizare".
- Apple may label the Privacy section *Intimitate* in older iOS. That doesn't affect any string here.

If the on-device wording differs, update every line that quotes it: the standalone iOS keys, the `Tap “…”` lines, both `<b>` lines, "In Settings, under Allow Location Access…" and "Location is set to “While Using”…".
