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
