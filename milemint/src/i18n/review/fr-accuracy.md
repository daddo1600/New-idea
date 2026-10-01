# French (fr) accuracy review: back-translation

Second of three checks. I back-translated every French value into English without looking at the key, then compared it with the key. Where a line was unclear I checked the notes and the source files listed in `source-keys.json`.

- **Lines checked:** 662 keys, all of them, including every plural form.
- **Keys changed:** 30, listed below. All changes are in `src/i18n/locales/fr.ts`.
- `npx jest src/i18n` passes.
- Placeholders, `<b>` tags, plural objects and typography are unchanged: U+00A0 before ":" and U+202F before "!" and "?".

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{count}} days left in the {{year}} tax year (all forms) | … jour(s) restant(s) à l’année d’imposition {{year}} | … jour(s) restant(s) dans l’année d’imposition {{year}} | "restant à l’année" is not idiomatic French. |
| 1 month left in the {{year}} tax year | Plus qu’un mois à l’année d’imposition {{year}} | Plus qu’un mois avant la fin de l’année d’imposition {{year}} | Back-translated as "one month to the tax year", so it read like a countdown to the start of the year. The new wording makes clear it counts down to the end. |
| 2 months left in the {{year}} tax year ⏳ | Plus que 2 mois à l’année d’imposition… | Plus que 2 mois avant la fin de l’année d’imposition… | Same problem. |
| One week left in the {{year}} tax year 🏁 | Plus qu’une semaine à l’année d’imposition… | Plus qu’une semaine avant la fin de l’année d’imposition… | Same problem. |
| {{distance}} driven · {{percent}}% business | … {{percent}} % pour affaires | … {{percent}} % d’affaires | Glossary term ("d’affaires"), and the line reads more naturally. |
| 24-hour times. A shift like 22:00 to 02:00 runs past midnight. | Un quart comme 22:00 à 02:00… | Un quart de 22:00 à 02:00… | "comme 22:00 à 02:00" is ungrammatical. |
| A quick (slightly cheeky) reminder … so nothing goes unclaimed. | …pour que rien ne vous échappe. | …afin de ne rien oublier de déduire. | Back-translated as "so nothing escapes you". The idea of claiming was lost. |
| I use MileMint … so nothing goes unclaimed. 🚗💸 | …pour que rien ne m’échappe. | …pour que je n’oublie rien à déduire. | Same problem. |
| Auto: business by default · swipe left if personal | balayez à gauche | balayez vers la gauche | Apple’s French gesture wording is "balayer vers la gauche/droite". |
| Auto: outside your work hours · swipe right if it was work | balayez à droite | balayez vers la droite | Same reason. |
| Unless a rule says otherwise … Swipe left on any that were personal… | Balayez à gauche ceux… | Balayez vers la gauche ceux… | Same reason, and now consistent with "Swipe a trip right…". |
| Best value | Meilleur prix | Meilleure offre | "Meilleur prix" means "lowest price", which is a different claim from "best value". "Meilleure offre" is the usual badge wording and is short. This resolves Unsure #14. |
| Deductions found in {{year}} tax year | Déductions trouvées, année d’imposition {{year}} | Déductions trouvées pendant l’année d’imposition {{year}} | The comma version read like a broken label. |
| Employees: you can claim Mileage Allowance Relief on the difference … any mileage allowance your employer paid you. | …et l’allocation de déplacement versée… | …et l’éventuelle allocation de déplacement versée… | "any" was lost. The old wording assumed the employer pays an allowance, but they may pay nothing. |
| Estimated tax: if you expect to owe $1,000 or more… | Impôt estimatif : | Impôt estimé : | "Impôt estimé" is the standard term. "estimatif" is unusual. |
| Every drive of it counted as business. (first-shift milestone) | Chaque trajet du quart compte comme affaires. | Chaque trajet de ce quart a compté comme affaires. | Tense: the shift is over (past tense in the English). |
| Every quarter (some people) | Chaque trimestre (certaines personnes) | Chaque trimestre (pour certains) | The literal version back-translated oddly, as "every quarter (certain persons)". |
| Future you says thanks 🙌 | Le vous du futur vous dit merci | Votre moi du futur vous dit merci | "Le vous du futur" is not idiomatic. "votre moi du futur" is the common French expression. |
| Just drive. Each trip appears here after you park, ready to swipe business or personal. | …prêt à être balayé : affaires ou personnel. | …prêt à être classé d’un balayage : affaires ou personnel. | "prêt à être balayé" back-translates as "ready to be swept (away)". |
| Last day today | C’est le dernier jour | Dernier jour : aujourd’hui | "today" was missing. Shown in the tax-dates countdown. |
| MileMint has now found {{amount}} … That’s real money back at tax time. | C’est de l’argent bien réel au moment des impôts. | C’est de l’argent bien réel qui vous revient au moment des impôts. | "back" was missing. Still no promise beyond the English. |
| New to Pro? Your first month is on me: {{url}} | Ton premier mois est offert par moi | Je t’offre ton premier mois | "offert par moi" is a calque. "Je t’offre" is the natural way to say "it’s on me". |
| Remove {{day}} shift {{number}} | Retirer {{day}}, quart {{number}} | {{day}}, retirer le quart {{number}} | The old wording could be heard as "remove Monday". It now matches the pattern of "{{day}}, début du quart {{number}}". |
| Since {{time}}. It’s saved as a trip once you park. | Il sera enregistré comme trajet dès que vous vous garez. | Le trajet sera enregistré dès que vous vous garerez. | "Il" had no antecedent. Also fixed the tense after "dès que". |
| Stopped · {{distance}} | Arrêté · {{distance}} | À l’arrêt · {{distance}} | The notes say the drive "stopped moving". "Arrêté" can also read as "ended" or "arrested". |
| The IRS standard mileage rate is for cars, vans and pickups… | voitures, fourgonnettes et camionnettes | voitures, camionnettes et pick-up | The glossary uses camionnette = van (as in "Voiture ou camionnette"). Here "camionnettes" was standing in for pickups, which is inconsistent and ambiguous. |
| Time to roll! 🚗 | En voiture ! | C’est l’heure de rouler ! | "En voiture !" means "all aboard / get in the car" and doesn’t suit bike couriers. The new line is a neutral send-off, as the notes ask. |
| When and how to claim with {{authority}} | Quand et comment déduire avec {{authority}} | Quand et comment demander la déduction auprès de {{authority}} | "déduire avec la CRA" is unidiomatic. The new line uses the glossary’s "demander" plus "déduction". |
| worth up to {{amount}} | jusqu’à {{amount}} | vaut jusqu’à {{amount}} | "worth" was dropped, so in the " · " list the line read as just "up to $12". |
| Ask Next Time Or When I Share | Demander la prochaine fois ou lors du partage | Demander la prochaine fois ou lors de mon partage | Apple’s French support page (support.apple.com/fr-*/102647) gives the iOS option as "Demander la prochaine fois ou lors de mon partage". This resolves Unsure #3. |

## Translator’s Unsure list

| # | Item | Outcome |
|---|---|---|
| 1 | Change to Always Allow, rendered "Passer à Toujours autoriser" | **Kept.** This matches the iOS French prompt as far as I can tell, and the search snippets I found pair it with "Autoriser lorsque l’app est active". I could not open Apple’s pages to confirm it, so it still needs a check on a French iPhone. |
| 2 | Allow While Using App, rendered "Autoriser lorsque l’app est active" | **Confirmed.** Apple French support uses this wording, alongside "Autoriser une fois" and "Refuser". |
| 3 | Ask Next Time Or When I Share | **Fixed** to "…lors de mon partage" (see the table above). |
| 4 | ALLOW LOCATION ACCESS, rendered "AUTORISER L’ACCÈS À LA POSITION" | **Kept.** It matches the "Position" row naming and is consistent with Apple French. Not verified verbatim. |
| 5 | Open Settings, rendered "Ouvrir Réglages" | **Kept.** This is MileMint’s own button (`welcome.tsx`, `setup-tracking.tsx`), not an iOS string. Apple French treats "Réglages" as a name without an article, so the wording is fine. |
| 6 | Unit-neutral lines use "kilomètre" ("Chaque kilomètre d’affaires, compté.", "Ne manquez plus aucun kilomètre.", share lines) | **Kept, still open.** These lines appear on `welcome.tsx` and in `milestones/copy.ts` for every region. "Kilomètre" suits the main Québec audience, but UK users will see km. This is a product decision. |
| 7 | "taux kilométrique" used for per-mile rates | **Kept.** It is generic, and it is the standard French term even where the unit is miles. |
| 8 | Milestones as "Réussites"; Missed miles check as "Distance non comptée" | **Kept.** Both are accurate in context. |
| 9 | Driving: as "Véhicule :" | **Kept.** "Véhicule :" before the vehicle name is accurate and covers bikes. |
| 10 | Use now as "Utiliser" | **Kept.** It sits next to "En service", so the meaning is clear. |
| 11 | Referral line in "tu" | **Kept "tu"**, because the user is sending it to a friend. The wording is reworded as above. |
| 12 | Royaume-Uni / États-Unis in half-width tiles | **Open.** This is a layout check for the third reviewer or QA. |
| 13 | returnIsDue as "Date limite de votre déclaration … {{year}}" | **Kept.** It works in both uses. |
| 14 | Best value | **Fixed** to "Meilleure offre". |
| 15 | Shifts & rounds | **Kept.** "Quarts et tournées (apps de livraison)" is accurate. |

## Unresolved

- **iOS strings:** "Passer à Toujours autoriser" and "AUTORISER L’ACCÈS À LA POSITION" still need a check on a device set to French. Network access to Apple’s pages was blocked, so I relied on search snippets.
- **Generic "mile" lines:** these are rendered with "kilomètre" for all regions (Unsure #6). The product team needs to decide.
- **Tile width** for "Royaume-Uni" and "États-Unis".
- **Glossary out of date:** `glossary/fr.md` still lists "lors du partage" and "Meilleur prix" (Unsure #3 and #14). I did not edit it, as instructed.

## Round 3: logbook, P87, privacy and backup (October 2026)

- **Lines checked:** all 201 new keys (ATO 12-week logbook, P87 Mileage Allowance Relief helper, client privacy mode, encrypted iCloud backup), including every plural form (one / many / other). Each French line was back-translated to English cold, then compared with the key; short lines were checked against `app/logbook.tsx`, `app/claim-relief.tsx`, `app/settings.tsx`, `app/welcome.tsx`, `app/add-trip.tsx`, `domain/privacy.ts` and `backup/copy.ts`.
- **Checked specifically:** every "estimated" / "about" kept (Environ, estimé, estimation); no line promises a refund beyond "tax back" on the relief; P87 route, 4-year limit, PAYE/P60/National Insurance details; ATO "12 weeks in a row", 5-year validity and odometer at start and end; backup lines say encrypted, in the user’s own iCloud, MileMint never sees the trips; placeholders and their order.
- **Keys changed:** 4 (table below). `npx jest src/i18n/__tests__/completeness.test.ts -t "fr "` passes.

| English | Before | After | Why |
|---|---|---|---|
| Worked out from the km MileMint logged. Add both odometer readings so any driving MileMint missed is counted too. | …pour que les trajets manqués par MileMint soient aussi comptés. | …pour que toute distance non enregistrée par MileMint soit aussi comptée. | Back-translated as "trips MileMint missed". The English means any distance, not only whole trips. |
| Optional. Add what the car costs to run this income year… | Ajoutez ce que la voiture coûte à utiliser pendant cette année d’imposition… | Ajoutez les frais d’utilisation de la voiture pour cette année d’imposition… | "coûte à utiliser" is clumsy; now matches "frais d’utilisation" in the logbook explanation. |
| Backs up by itself when something changes, at most once a day, and keeps the last four backups. | Se sauvegarde automatiquement quand quelque chose change… et conserve les quatre dernières sauvegardes. | Sauvegarde automatique dès que quelque chose change, au plus une fois par jour. Les quatre dernières sauvegardes sont conservées. | "Se sauvegarde" had no subject (the card heading is "Sauvegarde iCloud"), so it back-translated as "saves itself". |
| No route or address was kept for this drive, only the area and the distance: {{distance}}. | Aucun itinéraire ni aucune adresse n’a été conservé… | Ni itinéraire ni adresse n’ont été conservés… | Agreement: "conservé" did not agree with "adresse". |

Checked and kept:
- **"Area" = "secteur"** throughout privacy lines. The stored label stays English ("Client visit · Leeds LS6", per `domain/privacy.ts`, because it goes into the reports for the tax office), so the add-trip line quotes it as « Client visit · secteur » to match what the user will see.
- **"Replace what’s on this iPhone?"** is « Remplacer les données MileMint de cet iPhone ? ». It adds "MileMint" so nobody thinks the whole phone is wiped; the body text says the same.
- **"Enter amounts as numbers, e.g. 2400 or 2,400.50."** is "p. ex. 2400 ou 2400.50": the "2,400.50" example was dropped because in French the comma is the decimal mark, and the parser (`parseNumber` in `app/logbook.tsx`) strips commas, so "2400,50" typed by a French user becomes 240050. The example now shows only forms that parse correctly. **Code issue for the dev team**, not fixed here (only the four French files were editable).
- **"Claim mileage relief"** (menu / screen title) is "Demander l’allègement fiscal". "mileage" is not named, to keep the title short; the menu subtitle ("Employés : P87 ou Self Assessment") and the screen heading (Mileage Allowance Relief) give the context.
- "income year" (ATO) uses "année d’imposition", the glossary term for tax year.
