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
