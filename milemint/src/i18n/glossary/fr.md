# French (fr) glossary

Audience: mainly French-speaking Canada (Québec), plus French speakers in the UK. The text is standard French that reads naturally in Québec: "courriel", "fin de semaine", "travailleur autonome", "odomètre", "acomptes provisionnels". It avoids France-only slang and Québec-only colloquialisms.

## Form of address

The app speaks to the user as **vous** throughout. Two exceptions:
- **"New to Pro? Your first month is on me: {{url}}"** is a message the user sends to a friend, so it uses **tu**.
- The other share messages are in the first person ("J’ai trouvé…", "Mon app de livraison…") or avoid addressing anyone ("MileMint est gratuit sur l’App Store").

## Typography

- No-break space (U+00A0) before ":" and inside « ».
- Narrow no-break space (U+202F) before ; ! ?
- Typographic apostrophe ’ everywhere.
- Times stay as "09:00", and durations read "2 h 05".
- Numbers written out in sentences use French format ("5 000 km", "75 000 $", "73 ¢").
- **Exception:** the input example stays "12.5", because the distance field only accepts a decimal point.

## Terms

| English | French | Why |
|---|---|---|
| drive / trip | trajet | One word for both, so the app reads consistently. |
| business (trip type) | affaires (trajet d’affaires, km d’affaires) | CRA’s French wording ("à des fins d’affaires"), short enough for the toggle. "Pro" is not used for this because it’s the plan name. |
| personal | personnel | Standard term. |
| Not sorted | Non classé | Matches "classer". |
| sort (mark business/personal) | classer | Plain and everyday. |
| swipe | balayer / balayez | Apple French uses "balayer" for swipes. The slide-to-start button uses "faire glisser" / "Glissez", because you drag that button rather than swipe it. |
| mileage (business mileage) | déplacements (déplacements d’affaires) | Works with both miles and km. "Kilométrage" would sound wrong to UK users who count in miles. |
| mileage log | registre des déplacements | "Registre" is the CRA’s term for the logbook. |
| mileage report | rapport de déplacements | Same root, so the two stay consistent. |
| mileage rate | taux kilométrique (generic), "taux par km" / "taux par mile" (specific) | Standard term. |
| shift | quart (de travail) | Standard Québec French, and also understood in France. |
| Start shift / End shift | Commencer le quart / Terminer le quart | Plain wording. |
| tax year | année d’imposition | CRA’s French term. |
| tax return | déclaration de revenus | Standard term. |
| deduction / claim | déduction / déduire, demander (for expenses) | Everyday terms. "Demander" follows CRA usage. |
| commute | trajet domicile-travail | Standard term. |
| report | rapport | Standard term. |
| Pro / MileMint Pro | Pro / MileMint Pro | Kept as the plan name. "Go Pro" / "Upgrade to Pro" both become "Passer à Pro". |
| Free plan / Free (column) | Forfait gratuit / Gratuit | "Forfait" is natural in Québec and in France. |
| Settings (iOS and in-app) | Réglages | Apple’s French name. |
| Location (iOS row) | Position | Apple’s French name. |
| tracking | suivi (automatique) | Plain term. |
| place (saved) | lieu | Plain term. |
| Home / Work | Domicile / Travail | Plain terms. |
| purpose (business) | motif professionnel | Plain term. |
| app | app | Apple French style, as in "l’app". |
| self-employed / sole trader | travailleur autonome | The Québec/CRA term, understood elsewhere. |
| Employees | Employés | Québec usage. |
| odometer | odomètre | Québec/CRA term. |
| weekend | fin de semaine | Québec usage, understood in France. |
| Done | OK | Apple French convention. |
| Best value (plan badge) | Meilleure offre | "Meilleur prix" would mean "lowest price". |
| Money back (milestones section) / Your money back | Déductions trouvées / Vos déductions | Says what the figure is. Avoids "argent récupéré", which sounds like a promised refund. |
| Milestones | Réussites | Avoids "Étape", which is already used for the onboarding steps. |
| Missed miles check | Distance non comptée | Works for both miles and km. |
| Car or van / Motorbike / Moped or motorbike / Bicycle | Auto ou van / Moto / Scooter ou moto / Vélo | Short names that fit a third of the screen width (the vehicle picker shows one line only). "Auto" and "van" are everyday words in Québec and France. In full sentences "van" stays "camionnette". |
| UK / USA (half-width tiles) | R.-U. / É.-U. | Standard French abbreviations, shown beside the flag. The full names (Royaume-Uni / États-Unis) are used everywhere else and are what VoiceOver reads on the tiles. |
| CRA, IRS, ATO, HMRC | kept in English | Following the brief. Fixed sentences use "la CRA", "l’IRS", "l’ATO". |

## iOS wording used

| English | French |
|---|---|
| Allow While Using App | Autoriser lorsque l’app est active |
| Change to Always Allow | Passer à Toujours autoriser |
| While Using the App / “While Using” | Lorsque l’app est active |
| Always | Toujours |
| Never | Jamais |
| Ask Next Time Or When I Share | Demander la prochaine fois ou lors de mon partage |
| Location | Position |
| ALLOW LOCATION ACCESS | AUTORISER L’ACCÈS À LA POSITION |
| Open Settings | Ouvrir Réglages |
| Settings → Notifications | Réglages → Notifications |

## Adapted jokes

- "Knock knock" works as "Toc toc / Qui est là ?".
- "Sunday scaries" became "Le blues du dimanche".
- "Swipe right on savings" became "Coup de foudre pour vos déductions"; the body keeps the dating-app "match". "Économies" was dropped so nothing promises a saving.
- "Free money alert" became "De l’argent qui dort ?" ("argent gratuit" read like spam).
- "Your car did the hard part" became "Le plus dur est fait", which also suits bike couriers.
- "The weekend’s nearly over" became "Déjà dimanche soir" (no "fin de semaine" / "week-end" split, no "fin… fin" repetition).
- "Set it and forget it" became "Réglez-le une fois pour toutes".
- "Wrap up warm out there" became "Couvrez-vous bien".
- "A few swipes" (as a noun) became "quelques gestes"; "balayages" reads oddly as a noun.
- "Future you says thanks" became "Le vous du futur vous dit merci".
- "Spring has sprung" became "Le printemps est arrivé".
- "G’day!" became "Salut ! Bel été sur la route".
- "Fall" and "Autumn" both became "Les trajets d’automne s’additionnent", which doesn’t name a unit.
- "Every penny" became "jusqu’au dernier sou".

## Unit-neutral lines

Lines that say "mile" in English but are shown in every country use **trajet** instead of a unit: "Ne manquez plus aucun trajet.", "Chaque trajet d’affaires, compté.", "L’app de déplacements qui compte chaque trajet.", "Chaque trajet compté, automatiquement." Lines with separate miles and km versions keep their own unit. "Taux kilométrique" is not used on the country-choice screens, which say "taux officiel par mile ou par km" / "taux officiel applicable aux déplacements".

## Money wording

Nothing says money comes "back" or is "saved": amounts are "trouvés", lines say what drives "valent" or that they "comptent au moment des impôts".

## Unsure

1. **"Change to Always Allow"**: I used "Passer à Toujours autoriser". Apple’s exact French string for this iOS 13+ prompt button may be "Changer pour « Toujours autoriser »" or similar. Please check on a French-language iPhone.
2. **"Allow While Using App"**: I used "Autoriser lorsque l’app est active". I’m fairly confident, but this should be checked against the current iOS.
3. ~~"Ask Next Time Or When I Share"~~: **resolved** in the accuracy review: "Demander la prochaine fois ou lors de mon partage" (Apple French support wording).
4. **"ALLOW LOCATION ACCESS"**: I used "AUTORISER L’ACCÈS À LA POSITION". Please check against iOS.
5. **"Open Settings"**: I used "Ouvrir Réglages". "Ouvrir les réglages" is also common.
6. ~~Unit-neutral lines~~: **resolved** in the cultural review; they now say "trajet" (see above).
7. **"taux kilométrique"**: this is used generically even for the UK and US, where the rate is per mile.
8. **"Missed miles check" as "Distance non comptée"** and **"Milestones" as "Réussites"**: these are free renderings.
9. **"Driving:" (label before the vehicle name) as "Véhicule :"**: I used "Véhicule" because "Au volant" doesn’t fit bikes.
10. **"Use now" as "Utiliser"**: this is the same as "Use" in the purpose picker, kept short.
11. **Referral line in "tu"**: "Nouveau sur Pro ? Ton premier mois est offert par moi". This could change to vous if the team prefers.
12. ~~UK/USA half-width tiles~~: **resolved**: "R.-U." / "É.-U.".
13. **"Self Assessment return is due" (returnIsDue)**: rendered as "Date limite de votre déclaration … {{year}}", so it works both as a heading above a date and before ": aujourd’hui" or ": encore N jours".
14. ~~"Best value"~~: **resolved**: "Meilleure offre".
15. **"Shifts & rounds (delivery apps)"**: rendered as "Quarts et tournées (apps de livraison)".
