# French (fr) cultural and UX-copy review

Third and final check, after translation and the back-translation accuracy review. Reviewer: native Québécois speaker who has also lived in France and the UK and knows courier work.

- **Lines checked:** every key in `src/i18n/locales/fr.ts`, including every plural form, read for offence and double meanings, tone, money/tax honesty, units, UI fit and naturalness for a courier in Montréal or London.
- **Keys changed:** 29. Keys, placeholders, `<b>` tags, plural objects and typography (U+00A0 before ":", U+202F before "?" "!") are unchanged.
- `npx jest src/i18n` passes.
- `src/i18n/glossary/fr.md` updated to the final terms (including the accuracy review's "Meilleure offre" and "lors de mon partage").

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{achievement}} on MileMint {{emoji}} The mileage app that counts every mile. | {{achievement}} sur MileMint {{emoji}} L’app de déplacements qui compte chaque kilomètre. | {{achievement}} sur MileMint {{emoji}} L’app de déplacements qui compte chaque trajet. | Unit: shown in every country, so it must not name km or miles. "Trajet" works everywhere. (Share line from milestones/copy.ts.) |
| {{amount}} back in your pocket | {{amount}} de retour dans vos poches | {{amount}} trouvés pour vous | Money honesty: "de retour dans vos poches" promises cash back for what is only a deduction value. Also a calque. |
| Every business mile, counted. | Chaque kilomètre d’affaires, compté. | Chaque trajet d’affaires, compté. | Unit: shown in every country, so it must not name km or miles. "Trajet" works everywhere. (Welcome screen.) |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | J’ai trouvé {{amount}} en déplacements d’affaires avec MileMint 🚗💸 Chaque kilomètre compté, automatiquement. | J’ai trouvé {{amount}} en déplacements d’affaires avec MileMint 🚗💸 Chaque trajet compté, automatiquement. | Unit: shown in every country, so it must not name km or miles. "Trajet" works everywhere. (Share line.) |
| Never miss a mile. | Ne manquez plus aucun kilomètre. | Ne manquez plus aucun trajet. | Unit: shown in every country, so it must not name km or miles. "Trajet" works everywhere. (Welcome tagline.) |
| MileMint uses your country’s currency, distance unit, tax year and official mileage rate. | MileMint utilise la devise, l’unité de distance, l’année d’imposition et le taux kilométrique officiel de votre pays. | MileMint utilise la devise, l’unité de distance, l’année d’imposition et le taux officiel par mile ou par km de votre pays. | Unit: shown before the country is chosen; "taux kilométrique" names km to UK/US users. |
| Sets your currency, miles or kilometres, tax year and official mileage rate. You can change it later. | Définit votre devise, les miles ou les kilomètres, l’année d’imposition et le taux kilométrique officiel. Vous pourrez le modifier plus tard. | Définit votre devise, les miles ou les kilomètres, l’année d’imposition et le taux officiel applicable aux déplacements. Vous pourrez le modifier plus tard. | Unit: same reason, on the welcome/country step. |
| Money back | Argent récupéré | Déductions trouvées | Money honesty: "Argent récupéré" (section header) reads as a refund already received. Says what it is instead. |
| Your money back and badges | Votre argent récupéré et vos badges | Vos déductions et vos badges | Money honesty: same reason (menu subtitle for Réussites). |
| MileMint has now found {{amount}} in business mileage for you. That’s real money back at tax time. | MileMint a maintenant trouvé {{amount}} en déplacements d’affaires pour vous. C’est de l’argent bien réel qui vous revient au moment des impôts. | MileMint a maintenant trouvé {{amount}} en déplacements d’affaires pour vous. Ça compte vraiment au moment des impôts. | Money honesty: "de l’argent bien réel qui vous revient" promises a payout. The new line says it matters at tax time without a promise. |
| Sort your drives and add any you missed before {{date}}. Every business kilometre is money back. | Classez vos trajets et ajoutez ceux que vous avez oubliés avant le {{date}}. Chaque kilomètre d’affaires, c’est de l’argent qui vous revient. | Classez vos trajets et ajoutez ceux que vous avez oubliés avant le {{date}}. Chaque kilomètre d’affaires compte au moment des impôts. | Money honesty: "c’est de l’argent qui vous revient" promises a refund per km. |
| Sort your drives and add any you missed before {{date}}. Every business mile is money back. | Classez vos trajets et ajoutez ceux que vous avez oubliés avant le {{date}}. Chaque mile d’affaires, c’est de l’argent qui vous revient. | Classez vos trajets et ajoutez ceux que vous avez oubliés avant le {{date}}. Chaque mile d’affaires compte au moment des impôts. | Money honesty: same reason. |
| See what each business drive saves you at tax time. | Voyez ce que chaque trajet d’affaires vous fait économiser au moment des impôts. | Voyez ce que chaque trajet d’affaires peut valoir au moment des impôts. | Money honesty: "vous fait économiser" promises a saving; "peut valoir" keeps the meaning, hedged. |
| Free money alert 💸 | Alerte : argent gratuit 💸 | De l’argent qui dort ? 💸 | Money honesty: "Alerte : argent gratuit" reads like a spam/scam headline in French. "De l’argent qui dort ?" is a familiar, friendly idiom and leads into the body's "techniquement, c’est votre argent". |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | Bon, techniquement, c’est votre argent. Classez les trajets de la semaine pour le récupérer. | Bon, techniquement, c’est votre argent. Classez les trajets de la semaine pour le réclamer. | Money honesty: "récupérer" implies a refund; "réclamer" = claim. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | Balayez les trajets de la semaine, affaires ou personnel, et voyez ce que vous avez récupéré. | Balayez les trajets de la semaine, affaires ou personnel, et voyez ce qu’ils valent. | Money honesty: "ce que vous avez récupéré" implies money already returned. |
| Sort this week’s drives and bank the deduction. Done in a minute. | Classez les trajets de la semaine et empochez la déduction. C’est fait en une minute. | Classez les trajets de la semaine pour ne laisser aucune déduction de côté. C’est fait en une minute. | Money honesty: "empochez la déduction" (pocket the deduction) sounds like cash in hand. |
| Swipe right on savings | Un match avec vos économies | Coup de foudre pour vos déductions | Money honesty: "vos économies" promises savings and also means "your savings account". "Coup de foudre" keeps the dating joke (the body still says "match") and is clear in Québec and France; nothing sexual. |
| Your car did the hard part | Votre voiture a fait le plus dur | Le plus dur est fait | Tone/inclusion: bike and scooter couriers did the hard part themselves; "Le plus dur est fait" works for every vehicle and flows into the body. |
| A few swipes tonight beats a shoebox of receipts at tax time. | Quelques balayages ce soir, c’est mieux qu’une boîte à chaussures pleine de reçus au moment des impôts. | Quelques gestes ce soir valent mieux qu’une boîte à chaussures pleine de reçus au moment des impôts. | Naturalness: "balayages" as a noun reads as sweeping (or hair highlights in Québec). |
| …unless you set your work hours. Until then, a few swipes will do. | …sauf si vous indiquez vos heures de travail. D’ici là, quelques balayages suffiront. | …sauf si vous indiquez vos heures de travail. D’ici là, quelques gestes suffiront. | Naturalness: same reason. |
| The weekend’s nearly over 🛋️ | La fin de semaine tire à sa fin 🛋️ | Déjà dimanche soir 🛋️ | Naturalness: "La fin de semaine tire à sa fin" repeats "fin"; also sidesteps fin de semaine (QC) vs week-end (FR). Sent on Sunday evening, so accurate. |
| Before Monday shows up, give this week’s drives a quick sort. | Avant que lundi n’arrive, classez vite fait les trajets de la semaine. | Avant l’arrivée de lundi, prenez une minute pour classer les trajets de la semaine. | Tone: "vite fait" is France-colloquial and a bit offhand; new line is warm and clear in both regions. |
| Wrap up warm out there ❄️ | Habillez-vous chaudement ❄️ | Couvrez-vous bien ❄️ | Naturalness: "Couvrez-vous bien" is the everyday caring phrase in both regions; "Habillez-vous chaudement" sounds like an instruction. |
| Set it and forget it ⏱️ | Réglez une fois, oubliez ensuite ⏱️ | Réglez-le une fois pour toutes ⏱️ | Naturalness: "Réglez une fois, oubliez ensuite" is a stiff calque. |
| Stay ready | Restez prêt | Prenez de l’avance | Tone/inclusion: "Restez prêt" is masculine-only and a little bossy; "Prenez de l’avance" matches the section text and is gender-neutral. |
| UK | Royaume-Uni | R.-U. | UI fit: half-width tile beside a flag; "Royaume-Uni" is 5.5× the English. VoiceOver still reads the full name. |
| USA | États-Unis | É.-U. | UI fit: same tile; "États-Unis" is 3.7× the English. |
| Car or van | Voiture ou camionnette | Auto ou van | UI fit: the vehicle picker is one line in a third of the screen (numberOfLines=1); "Voiture ou camionnette" (22 chars) would be cut off. "Auto ou van" (11) is everyday in Québec and France. |

## Checked and kept

- **Offence/sensitivity:** nothing rude, crude, sexual, religious or political found. No Québec/France language-politics wording. The dating jokes ("match", "coup de foudre") are mild and kind. "Toc toc / Qui est là ?", "Le blues du dimanche", "Votre moi du futur", "Coup de théâtre : conduire, ça rapporte" all land in both regions. "Joyeuse Halloween" (Québec usage) and "Joyeuses fêtes" are secular.
- **Shift cheers** ("C’est parti !", "On y va !", "C’est l’heure de rouler !", "Allons-y !", "En route !", "Et c’est parti !") are neutral and work for bikes too.
- **Address:** vous everywhere; tu only in the friend-to-friend referral line ("Nouveau sur Pro ? Je t’offre ton premier mois").
- **Tax honesty:** "estimation", "Ceci n’est pas un conseil fiscal", "tout ce à quoi vous avez droit" and "Vaut {{amount}} si c’est pour affaires" are faithful and make no promise beyond the English.
- **Length:** "Passer à Pro" (Go Pro pill), "Meilleure offre" (badge beside the plan name) and "Gardés, verrouillés" (84 px table cell that wraps) exceed 1.3× but sit in layouts that have room or wrap; no shorter natural French exists for "Passer à Pro". Weekday, tab and status labels are within limits.
- **Regionalisms kept on purpose:** "Devis" (France; Québec also understands it next to "soumission"), "Rencontre client" (Québec; understood in France), "fin de semaine" in the tax-dates disclaimer.

## Still open (not cultural)

- iOS strings "Passer à Toujours autoriser" and "AUTORISER L’ACCÈS À LA POSITION" still need a check on a device set to French (carried over from the accuracy review).

## Sign-off

**Approved for release** for culture, tone, money honesty, units and UI fit. The only remaining item is the device check of the two iOS strings above, which is a verification task, not a cultural blocker.

## Round 3: logbook, P87, privacy and backup (October 2026)

- **Lines checked:** all 201 new keys, read as a French-speaking courier or home-care worker in Montréal, London or Sydney: tone, regional words, money honesty, privacy reassurance, iOS wording and button/label length (≤1.3× English).
- **Keys changed:** 4 (table below). `npx jest src/i18n/__tests__/completeness.test.ts -t "fr "` passes.

| English | Before | After | Why |
|---|---|---|---|
| 🔒 Client privacy | 🔒 Confidentialité client | 🔒 Confidentiel | UI fit: badge on the trip screen, was 1.6× the English. "Confidentiel" is short, plain and reassuring. The Settings heading keeps "Confidentialité client". |
| I’ve claimed this year | J’ai fait la demande pour cette année | Demande faite pour cette année | UI fit: label beside a switch, was 1.7× the English. |
| See how to claim › | Voir comment faire la demande › | Voir comment demander › | UI fit: link on the home card (now 1.2×). |
| How to claim | Comment faire la demande | Comment demander | UI fit and consistency with the two links above and "Comment demander la Mileage Allowance Relief ›". |

Checked and kept:
- **Privacy lines** ("Je me rends chez des clients ou des patients (aide à domicile, soins infirmiers, accompagnement)", "Nous ne garderons que le secteur, jamais leur adresse.") are plain and reassuring. The explanation says the area, distance and purpose are enough "pour l’administration fiscale"; nothing suggests hiding anything from the tax office.
- **Money honesty:** "tax back" is "impôt récupéré" and always comes with "Environ" or "estimé"; the relief is "allègement fiscal" / "allègement à demander", never a refund of the whole amount. The disclaimer says the tax recovered depends on income and tax rate. Comparisons use "semble plus avantageuse" and "pourrait permettre de demander plus".
- **Backup lines** say "chiffrée", "dans iCloud", "MileMint ne voit jamais vos trajets", and use Apple French wording: Réglages, Connectez-vous à iCloud, iCloud Drive, trousseau iCloud, "Réglages → votre nom → iCloud".
- **Regional words:** "fiche de paie" (understood in Québec and France), "conseiller fiscal" (neutral; avoids France-only "expert-comptable" and Québec-only "fiscaliste"), "Repartir de zéro", "Carburant", "Immatriculation" all work in both regions.
- **Length kept over 1.3× where there is room:** "Terminer plus tôt" (End early: a red text link and an alert button, both wrap), "Sauvegarde en cours…" (Backing up…: "Sauvegarde…" alone would read as the noun), "Confidentialité client" (Settings heading/toggle row, full width), "Ne sais pas" (Not sure, 1.4×: shortest natural gender-neutral option in the 4-way tax-rate picker).
- **Gender:** "Employé, avec votre propre véhicule ?" and "Employé" (segmented option) use the masculine generic, as in the existing glossary ("Employés", "travailleur autonome"). "Self-employed" became "Autonome", which is short and gender-neutral.

## Sign-off (round 3)

**Approved** for culture, tone, privacy reassurance, money honesty and UI fit, with the device checks listed in the glossary’s Unsure list (Apple wording for iCloud Keychain, tax-rate picker width).

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | Glissez à gauche pour terminer le quart. | New line. Back-translation: "Slide left to end the shift." Uses "Glissez" (slide button, as "Glissez pour commencer le quart") and "terminer le quart". 1.38× English: kept, because "en arrière" is longer and "finir" would break the glossary term; the caption has no line limit and wraps. |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}. Faites glisser le bouton vers la gauche ou touchez deux fois. | New VoiceOver hint; mirrors the "vers la droite" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | Entrez les montants en chiffres, p. ex. 2400 ou 2400.50. | Entrez les montants en chiffres, p. ex. 2400 ou 2400,50. | The parser now accepts a decimal comma, so the example uses the French decimal comma. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | Vous recevez chacun +10 trajets gratuits par mois quand un ami vous rejoint. | “Vous … chacun” = you and the friend, each. Vous, as elsewhere in the app. |
| Enter my code {{code}} when you set up MileMint… | Entre mon code {{code}} en configurant MileMint pour avoir 10 trajets gratuits de plus par mois. | A message to a friend, so **tu**, like “Je t’offre ton premier mois”. |
| Share it · friends get +10 drives | Partager · +10 trajets pour vos amis | 36 chars (1.09×). |
| Friends joined: {{count}} · … | Amis qui vous ont rejoint : {{count}} · … | “inscrits” was dropped in pass 2: it implies an account, and MileMint has none. |
| Redeem | Valider | Short, and what French apps say for a promo code; Apple’s “Utiliser” reads oddly alone on a button. |
| Got a code from a friend? | Un ami vous a donné un code ? | Narrow no-break space before “?” and no-break space before “:”, as in the rest of the file. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | Envoyez une invitation à un ami. Quand il rejoint MileMint grâce à elle, vous recevez chacun 10 trajets automatiques gratuits de plus par mois. Pour chaque ami, sans limite. | “Send an invitation to a friend. When they join MileMint thanks to it, you each get 10 more free automatic trips a month. For every friend, no limit.” *grâce à elle* reads more naturally than *avec elle*. |
| Send an invite | Inviter un ami | “Invite a friend” Button: “Envoyer une invitation” was 1.57×; this is 1.0× and says the same thing. |
| Every invite has its own code, for one friend. | Chaque invitation a son propre code, valable pour un seul ami. | “Each invitation has its own code, valid for a single friend.” |
| Invites sent: {{count}} | Invitations envoyées : {{count}} | “Invitations sent: {{count}}” No-break space before the colon, as elsewhere in fr.ts. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | Les invitations sont confirmées via iCloud, qui arrive dans une prochaine mise à jour. Les amis qui vous rejoignent d’ici là recevront leurs trajets en plus dès son activation, et vous aussi. | “Invitations are confirmed via iCloud, which arrives in a coming update. Friends who join you by then will receive their extra trips as soon as it’s activated, and so will you.” No promise of drives today. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | Vous avez saisi {{code}}. Vos 10 trajets en plus arriveront dès que l’invitation sera confirmée. | “You entered {{code}}. Your 10 extra trips will arrive as soon as the invitation is confirmed.” *saisi*: standard verb for typing a code. |
| Code {{code}} saved | Code {{code}} enregistré | “Code {{code}} saved” Mirrors “Code {{code}} ajouté”. |
| Your 10 extra drives are on their way once the invite is confirmed. | Vos 10 trajets en plus arriveront dès que l’invitation sera confirmée. | “Your 10 extra trips will arrive as soon as the invitation is confirmed.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | Ton code d’invitation : {{code}}. Saisis-le en configurant MileMint pour avoir 10 trajets gratuits de plus par mois. | “Your invitation code: {{code}}. Enter it while setting up MileMint to get 10 more free trips a month.” Share message to a friend: *tu*, like the old “Entre mon code” line. |
| We couldn’t find that invite. Check the code with your friend. | Invitation introuvable. Vérifiez le code avec votre ami. | “Invitation not found. Check the code with your friend.” Short, neutral. |
| That invite has already been used. Ask your friend to send you a new one. | Cette invitation a déjà été utilisée. Demandez à votre ami de vous en envoyer une nouvelle. | “This invitation has already been used. Ask your friend to send you a new one.” |
| That’s one of your own invites. Send it to a friend instead. | C’est l’une de vos propres invitations. Envoyez-la plutôt à un ami. | “It’s one of your own invitations. Send it to a friend instead.” |
| This Apple Account has already joined with a friend’s invite. | Ce compte Apple a déjà rejoint MileMint avec l’invitation d’un ami. | “This Apple account has already joined MileMint with a friend’s invitation.” *compte Apple* as in the existing Pro lines. |
| 🎉 Your friend’s invite is confirmed | 🎉 L’invitation de votre ami est confirmée | “🎉 Your friend’s invitation is confirmed” |
| Your friend’s invite couldn’t be used | L’invitation de votre ami n’a pas pu être utilisée | “Your friend’s invitation couldn’t be used” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | Enregistré · valeur débloquée avec Pro | “Saved · value unlocked with Pro.” 38 chars; it’s a full-width line, not a button. |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | Enregistré. Les trajets gratuits de ce mois sont utilisés, donc un trajet reclassé de personnel à affaires attend Pro pour afficher sa valeur. Les trajets qui affichent déjà leur valeur la gardent. | “Saved. This month’s free trips are used, so a trip reclassified from personal to business waits for Pro to show its value. Trips already showing their value keep it.” vous throughout. |
| {{used}} of {{limit}} free work drives in {{month}} | Trajets d’affaires gratuits en {{month}} : {{used}} sur {{limit}} | “Free business trips in {{month}}: {{used}} of {{limit}}”. Same word order as the old meter line, so the number lands at the end. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | Gratuit : {{count}} trajets d’affaires par mois. Les trajets personnels ne comptent pas, et un quart compte une fois par jour. Les trajets ajoutés à la main sont toujours gratuits. Pro : illimité. | “Free: 40 business trips a month. Personal trips don’t count, and a shift counts once a day. Trips added by hand are always free. Pro: unlimited.” *quart* (glossary). |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | Les trajets personnels ne comptent pas. Classez-en un en personnel et le trajet suivant prend sa place. | “Personal trips don’t count. Classify one as personal and the next trip takes its place.” |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | Au-delà de la limite, rien n’est caché ni perdu : chaque trajet est enregistré, affiché en entier, peut être classé et figure dans votre export en tableur. Seule sa valeur attend Pro. | “Beyond the limit, nothing is hidden or lost: each trip is saved, shown in full, can be classified and is in your spreadsheet export. Only its value waits for Pro.” *tableur* works in Québec and France. |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | Les premiers trajets du mois passent en premier, donc un trajet qui affiche sa valeur la garde. Le compte repart à zéro le 1er du mois. | “The month’s first trips go first, so a trip that shows its value keeps it. The count starts from zero on the 1st of the month.” |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} trajet / many: {{count}} trajets / other: {{count}} trajets | “{{count}} trip(s)” |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: {{count}} trajet depuis cette heure-là ressemble à une livraison. Il sera ajouté au quart comme affaires. / many: {{count}} trajets depuis cette heure-là ressemblent à des livraisons. Ils seront ajoutés au quart comme affaires. / other: {{count}} trajets depuis cette heure-là ressemblent à des livraisons. Ils seront ajoutés au quart comme affaires. | “{{count}} trips since that time look like deliveries. They’ll be added to the shift as business.” *depuis cette heure-là*: plain *depuis* alone dangles. |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}} à classer / many: {{purpose}} · {{count}} à classer / other: {{purpose}} · {{count}} à classer | “{{purpose}} · {{count}} to sort” *classer* as “Classer {{count}} trajets”. |
| After your shift ended · not counted as work unless you say so | Après la fin de votre quart · ne compte pas comme travail, sauf si vous le choisissez | “After the end of your shift · doesn’t count as work unless you choose so” |
| Deliveries | Livraisons | “Deliveries” |
| Did your shift start at {{time}}? | Votre quart a commencé à {{time}} ? | “Your shift started at {{time}}?” Narrow no-break space before ?, as the rest of the file. |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | Un trajet entre dans le quart ou en sort selon son heure de départ. Un trajet qui dépasse la fin du quart est coupé à ce moment-là. | “A trip goes into the shift or out of it by its start time. A trip that goes past the end of the shift is cut at that moment.” |
| During a pause in your shift · not counted as work unless you say so | Pendant une pause de votre quart · ne compte pas comme travail, sauf si vous le choisissez | “During a pause in your shift · doesn’t count as work unless you choose so” |
| End 15 minutes earlier | Avancer la fin de 15 minutes | “Bring the end forward 15 minutes” VoiceOver. |
| End 15 minutes later | Retarder la fin de 15 minutes | “Delay the end 15 minutes” |
| End your shift? | Terminer votre quart ? | “End your shift?” |
| Ended {{time}} | Fin à {{time}} | “End at {{time}}” |
| Hide drives ▴ | Masquer les trajets ▴ | “Hide the trips ▴” 1.5×; fits beside the purpose line. |
| Hides the drives in this shift | Masque les trajets de ce quart | “Hides this shift’s trips” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | Il était encore en cours, alors MileMint l’a terminé. Les trajets suivants sont à classer par vous. Touchez pour vérifier les heures. | “It was still going, so MileMint ended it. The next trips are for you to sort. Tap to check the times.” *Touchez*, as elsewhere. |
| Map of the drives in this shift | Carte des trajets de ce quart | “Map of this shift’s trips” |
| On shift | En quart | “On shift” |
| Pause | Pause | “Pause” |
| Pause the shift for a personal errand | Mettre le quart en pause pour une sortie personnelle | “Put the shift on pause for a personal outing” Not *course* (also a delivery run) nor *affaire* (clashes with *affaires* = business). |
| Paused · {{elapsed}} | En pause · {{elapsed}} | “On pause · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | En pause : les trajets ne comptent pas comme travail. Reprenez à votre retour. | “On pause: trips don’t count as work. Resume when you’re back.” |
| Resume | Reprendre | “Resume” |
| Resume the shift | Reprendre le quart | “Resume the shift” |
| Shift | Quart | “Shift” |
| Shift ended | Quart terminé | “Shift ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | Quart du {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift of the {{date}}, …” |
| Show drives ▾ | Voir les trajets ▾ | “See the trips ▾” 1.4×; fits. |
| Shows the drives in this shift | Affiche les trajets de ce quart | “Shows this shift’s trips” |
| Since {{time}} | Depuis {{time}} | “Since {{time}}” |
| Start 15 minutes earlier | Avancer le début de 15 minutes | “Bring the start forward 15 minutes” |
| Start 15 minutes later | Retarder le début de 15 minutes | “Delay the start 15 minutes” |
| Start from {{time}} | Commencer à {{time}} | “Start at {{time}}” |
| Start shift from {{time}}? | Commencer le quart à partir de {{time}} ? | “Start the shift from {{time}}?” |
| Started {{time}} | Début à {{time}} | “Start at {{time}}” Noun style, pairs with *Fin à*. |
| Still working | Je travaille encore | “I’m still working” |
| Undo | Annuler | “Undo” *Annuler* is iOS French for Undo. |
| Undo ending the shift | Annuler la fin du quart | “Undo the end of the shift” |
| Where your shift ended | Lieu de fin du quart | “Place where the shift ended” Short place-name style. |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | Vous êtes garé à votre domicile depuis un moment et votre quart est toujours en cours. Les trajets après sa fin ne comptent pas comme travail. | “You’ve been parked at home for a while and your shift is still going. Trips after it ends don’t count as work.” *domicile*, the app’s word for Home. |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | Vous êtes garé à votre domicile depuis {{time}}. Les trajets après le quart ne comptent pas comme travail. | “You’ve been parked at home since {{time}}. Trips after the shift don’t count as work.” |
| Your shift ended after 16 hours | Votre quart s’est terminé après 16 heures | “Your shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “État du suivi” row and background notifications. 24 new lines. Terms: *trajet*, *suivi*, *enregistrer*, *trajet oublié* (as in “Ajouter un trajet oublié”), vous. iOS wording: *Réglages*, *Position*, *Position exacte*. Narrow no-break space before “?” and “:”, as elsewhere. Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | Position exacte désactivée | “Precise Position deactivated”. *Position exacte* is Apple’s French toggle. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint ne reçoit qu’une position approximative et ne peut donc pas mesurer les trajets. Dans Réglages, touchez Position et activez Position exacte. | “MileMint only receives an approximate position and so can’t measure trips. In Settings, touch Position and turn on Precise Position.” |
| Tracking has stopped | Le suivi s’est arrêté | “Tracking has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | Le suivi automatique s’est arrêté, les nouveaux trajets ne sont donc pas enregistrés. | “Automatic tracking has stopped, so new trips aren’t recorded.” |
| Tracking may have stopped | Le suivi s’est peut-être arrêté | “Tracking has perhaps stopped”. |
| No location since {{time}}, in the middle of a drive. | Aucune position depuis {{time}}, en plein trajet. | “No position since {{time}}, mid-trip.” |
| Turn tracking back on | Réactiver le suivi | “Reactivate tracking”. Button, 18 chars. |
| Tracking stopped {{from}}–{{to}} | Suivi interrompu de {{from}} à {{to}} | “Tracking interrupted from {{from}} to {{to}}”. *de … à …* reads better than a dash in French. |
| A drive may have been missed | Un trajet a peut-être été manqué | “A trip was perhaps missed”. |
| About {{distance}} may be missing. Add the missed trip? | Il manque peut-être environ {{distance}}. Ajouter le trajet oublié ? | “About {{distance}} may be missing. Add the forgotten trip?” *trajet oublié* matches the existing button; *oublié* is used app-wide for missed trips without blaming anyone. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | Votre téléphone s’est déplacé d’environ {{distance}} entre {{from}} et {{to}}, mais aucun trajet n’a été enregistré. Ajouter le trajet oublié ? | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Add the forgotten trip?” |
| Not a drive | Pas un trajet | “Not a trip”. Link, 13 chars. |
| All good | Tout va bien | “All is well”. |
| just now | à l’instant | “just now”. |
| {{count}} minutes ago | one: il y a {{count}} minute / many: il y a {{count}} minutes / other: il y a {{count}} minutes | “{{count}} minute(s) ago”. one/many/other. |
| {{count}} hours ago | one: il y a {{count}} heure / many: il y a {{count}} heures / other: il y a {{count}} heures | “{{count}} hour(s) ago”. |
| {{count}} days ago | one: il y a {{count}} jour / many: il y a {{count}} jours / other: il y a {{count}} jours | “{{count}} day(s) ago”. |
| Tracking check | État du suivi | “Tracking status”. Section header. |
| Last location: {{ago}} | Dernière position : {{ago}} | “Last position: {{ago}}”. |
| No location yet | Aucune position pour l’instant | “No position yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | L’accès à la position est désactivé pour MileMint, les trajets ne sont donc pas enregistrés. Touchez pour le réactiver. | “Position access is off for MileMint, so trips aren’t recorded. Touch to turn it back on.” |
| Drives can’t be measured from a rough position. Tap to fix it. | Impossible de mesurer les trajets avec une position approximative. Touchez pour corriger. | “Impossible to measure trips with an approximate position. Touch to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | Les nouveaux trajets ne sont pas enregistrés. Touchez pour réactiver le suivi. | “New trips aren’t recorded. Touch to reactivate tracking.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | Aucune position depuis {{time}}, en plein trajet. Ouvrez MileMint pour reprendre le suivi. | “No position since {{time}}, mid-trip. Open MileMint to resume tracking.” |

**Sign-off:** approved.


## Round 8: pre-release fixes

| English | fr | Back-translation | Note |
|---|---|---|---|
| Where your shift started | Lieu de début du quart | Place where the shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | fr | Back-translation | Note |
|---|---|---|---|
| Opens trip details | Ouvre les détails du trajet | Opens the trip details | Matches the row’s existing hint. |
| Usual purpose · tap to change | Motif habituel · touchez pour changer | Usual reason · tap to change | *Motif* as in “Motif professionnel”. |
| Purpose needed for your tax records | Motif requis pour vos dossiers fiscaux | Reason required for your tax records | Amber box title; *requis* is clear without being alarming. |
| Shows only the drives that need a purpose | Affiche seulement les trajets sans motif | Shows only the trips without a reason | Natural, fits its place. |
| {{count}} work drives need a purpose | one: {{count}} trajet d’affaires a besoin d’un motif / many: {{count}} trajets d’affaires ont besoin d’un motif / other: {{count}} trajets d’affaires ont besoin d’un motif | {{count}} business trip(s) need(s) a reason | *trajet d’affaires* as in the free-plan line. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} exige un motif pour chaque trajet d’affaires. Une touche suffit. | {{authority}} requires a reason for each business trip. One tap is enough. | “Une touche suffit” is more natural than “une touche chacun”. |
| Add purposes › | Ajouter les motifs › | Add the reasons › | Natural, fits its place. |
| Every work drive has a purpose ✓ | Chaque trajet d’affaires a son motif ✓ | Each business trip has its reason ✓ | Natural, fits its place. |
| Show all drives | Voir tous les trajets | See all trips | Natural, fits its place. |
| {{count}} work drives have no purpose | one: {{count}} trajet d’affaires n’a pas de motif / many: {{count}} trajets d’affaires n’ont pas de motif / other: {{count}} trajets d’affaires n’ont pas de motif | {{count}} business trip(s) has/have no reason | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} exige un motif pour chaque trajet d’affaires. Les ajouter avant d’exporter ? | {{authority}} requires a reason for each business trip. Add them before exporting? | Narrow space before “?” per French typography, as elsewhere in the file. |
| Export anyway | Exporter quand même | Export anyway | Natural, fits its place. |
| Add purposes | Ajouter les motifs | Add the reasons | Natural, fits its place. |
| Usual business purpose | Motif professionnel habituel | Usual business reason | Natural, fits its place. |
| Clear | Effacer | Erase | Natural, fits its place. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | Ajouté aux trajets d’affaires qui n’en ont pas, pour des dossiers fiscaux complets. Les trajets pendant un quart utilisent « Livraisons », sauf si vous en choisissez un. | Added to business trips that have none, for complete tax records. Trips during a shift use “Deliveries” unless you choose one. | *quart* as in “Auto : pendant un quart” (Canadian usage too). |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | Ajouté aux trajets d’affaires qui n’en ont pas, pour des dossiers fiscaux complets. Modifiable sur chaque trajet. | Added to business trips that have none, for complete tax records. Can be changed on each trip. | Natural, fits its place. |
| None: ask me each time | Aucun : me demander à chaque fois | None: ask me each time | Natural, fits its place. |
| What are most of your work drives for? | À quoi servent la plupart de vos trajets d’affaires ? | What do most of your business trips serve? | Idiomatic “À quoi servent…”. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | Le fisc exige un motif pour chaque trajet d’affaires. Nous le remplirons pour vous, et vous pourrez le changer sur n’importe quel trajet. | The tax office requires a reason for each business trip. We’ll fill it in for you, and you can change it on any trip. | *Le fisc* is the everyday term in France and Quebec. |


## Round 8c: work purpose tiles

Back-translations: Choose everything that applies. The first chosen is filled in for you. / Filled in for you / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | fr | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | Aucun compte. Vos trajets restent sur votre téléphone. | No account. Your trips stay on your phone. | Keeps “Aucun compte” from the old line. |
| Is this home? {{place}} | Est-ce votre domicile ? {{place}} | Is this your home? {{place}} | *Domicile* as in “Home”; space before “?” per French typography. |
| You stopped here for the night. Trips to and from it will read “Home”. | Vous avez passé la nuit ici. Les trajets qui partent d’ici ou y arrivent afficheront « Domicile ». | You spent the night here. Trips leaving from or arriving here will show “Home”. | « » quotes as elsewhere in this file. |
| Yes, that’s home | Oui, c’est mon domicile | Yes, it’s my home |  |
| No | Non | No |  |
| Is this work? {{place}} | Est-ce votre lieu de travail ? {{place}} | Is this your workplace? {{place}} | *lieu de travail* reads better in a question than bare *Travail*. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | Vous êtes souvent garé ici pendant vos heures de travail. Les trajets afficheront « Travail », et les trajets domicile-travail seront signalés. | You’re often parked here during your working hours. Trips will show “Work”, and home-work trips will be flagged. | *garé* as in the end-shift prompt; *domicile-travail* as before. |
| Yes, that’s work | Oui, c’est mon travail | Yes, it’s my work |  |


## Round 8f: motion activity

iOS’s own names: “Mouvements et forme physique” (Réglages), “Autoriser” / “Ne pas autoriser” (alert). No-break space before the colon, as elsewhere in this file. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | Une de plus, pour la précision : Mouvements et forme physique | One more, for accuracy: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | Permet à MileMint de distinguer la conduite de la marche, pour qu’une balade ne soit jamais enregistrée comme un trajet. Tout reste sur votre téléphone. | Lets MileMint tell driving from walking, so a stroll is never recorded as a trip. Everything stays on your phone. | |
| Turn on Motion & Fitness | Activer Mouvements et forme physique | Turn on Motion & Fitness | |
| Allow | Autoriser | Allow | |
| Don’t Allow | Ne pas autoriser | Don’t allow | |
| Motion & Fitness | Mouvements et forme physique | Motion & Fitness | |
| On | Activé | On | |
| Off | Désactivé | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | Au début du travail, glissez pour commencer votre quart. Chaque trajet du quart compte comme {{purpose}}. | When work starts, swipe to start your shift. Each trip in the shift counts as {{purpose}}. | *Glissez pour commencer le quart* as on the shift bar. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | Les trajets pendant vos heures ({{days}} {{from}}–{{to}}) sont classés affaires pour vous. | Trips during your hours ({{days}} {{from}}–{{to}}) are classed as business for you. | *classer* as in the row buttons. |
| Drives in your work hours are sorted as business for you. | Les trajets pendant vos heures de travail sont classés affaires pour vous. | Trips during your work hours are classed as business for you. | Natural, fits its place. |
| After each drive, swipe right for business or left for personal. | Après chaque trajet, balayez vers la droite pour affaires ou vers la gauche pour personnel. | After each trip, swipe right for business or left for personal. | *balayez* as in the auto notes. |
| {{rate}} a mile · {{vehicle}} · {{country}} | {{rate}} par mile · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | Natural, fits its place. |
| {{rate}} a km · {{vehicle}} · {{country}} | {{rate}} par km · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | Natural, fits its place. |
| PRACTICE RUN | ENTRAÎNEMENT | PRACTICE | Eyebrow. |
| This is how a drive shows up after you park. Try sorting it. | Voici comment un trajet apparaît quand vous vous garez. Essayez de le classer. | Here is how a trip appears when you park. Try classing it. | Natural, fits its place. |
| Swipe left for personal | Balayez vers la gauche pour personnel | Swipe left for personal | Natural, fits its place. |
| Not that way. Try again. | Pas dans ce sens. Réessayez. | Not that way. Try again. | Natural, fits its place. |
| Sorted as personal ✓ | Classé personnel ✓ | Classed personal ✓ | Natural, fits its place. |
| Now a work drive. Work drives are worth money back. | Maintenant, un trajet d’affaires. Ces trajets vous rapportent de l’argent. | Now a business trip. These trips bring you money. | Natural, fits its place. |
| Swipe right for business | Balayez vers la droite pour affaires | Swipe right for business | Natural, fits its place. |
| Sorted as business: worth {{amount}} | Classé affaires : vaut {{amount}} | Classed business: worth {{amount}} | Space before the colon, as elsewhere in fr. |
| Swipe to start your shift | Glissez pour commencer votre quart | Swipe to start your shift | Natural, fits its place. |
| Your shift is on ✓ | Votre quart a commencé ✓ | Your shift has started ✓ | Natural, fits its place. |
| Mark as personal | Classer comme personnel | Class as personal | Natural, fits its place. |
| Mark as business | Classer comme affaires | Class as business | Natural, fits its place. |
| Practice drive · not saved | Trajet d’entraînement · non enregistré | Practice trip · not saved | Natural, fits its place. |
| Supermarket | Supermarché | Supermarket | Natural, fits its place. |
| Office | Bureau | Office | Natural, fits its place. |
| Customer | Client | Customer | Natural, fits its place. |
| That’s it. Just drive: trips appear here after you park. | C’est tout. Conduisez : les trajets apparaissent ici quand vous vous garez. | That’s all. Drive: trips appear here when you park. | Natural, fits its place. |
| Start driving | Prendre la route | Hit the road | Button. |
| Skip | Passer | Skip | Natural, fits its place. |
| Skip the practice run | Passer l’entraînement | Skip the practice | Natural, fits its place. |
| Tutorial | Tutoriel | Tutorial | Natural, fits its place. |
| Replay the tutorial | Revoir le tutoriel | See the tutorial again | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | Classez à nouveau deux trajets d’exemple. Rien n’est enregistré. | Class two sample trips again. Nothing is saved. | Natural, fits its place. |
| Replay | Revoir | See again | Natural, fits its place. |
