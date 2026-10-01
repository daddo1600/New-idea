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
