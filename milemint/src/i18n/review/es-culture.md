# Spanish (es): cultural and UX-copy review (check 3 of 3)

**Scope:** every line in `src/i18n/locales/es.ts` was read for (1) words that are rude or sexual in some Spanish-speaking country, and anything mocking, religious, political or about nationality, ethnicity or migration status; (2) tone; (3) money and tax honesty; (4) units on lines shown in every country; (5) UI fit; (6) whether it sounds natural to a Mexican or Colombian courier in Los Angeles or London. Context was checked in `domain/reminders.ts`, `domain/seasons.ts`, `milestones/copy.ts`, `app/welcome.tsx`, `app/pro.tsx`, `app/index.tsx`, `app/milestones.tsx`, `app/settings.tsx`, `components/header-menu.tsx`, `components/launch-intro.tsx` and `components/tax-countdown.tsx`.

**Result:** 38 strings changed. Keys, placeholders, `<b>` tags and plural objects are unchanged. `npx jest src/i18n` passes (31/31). The glossary has been updated to match.

## What I looked for and found

- **Offence.** The file had no "coger", "pico", "concha", "bicho", "pisar", "chaqueta", "papaya", "polla" or similar. I found and fixed two borderline words: "acaba" (sexual slang in Argentina and Uruguay) and "travieso" (can read as flirty). Nothing in the file touches religion, politics, nationality or migration status. "¿Dónde vives?" was changed to "¿Dónde está tu casa?" so the app asks where the saved place is, not where the person lives.
- **Money honesty.** In Spanish, "dinero de vuelta", "recuperar" and "de vuelta en tu bolsillo" all read as a promised tax refund, and "dinero gratis" is scam wording. These are now "vale dinero", "dinero encontrado", "cuánto suman" and "Hablemos de dinero". Disclaimers ("No es asesoría fiscal", "estimado") are intact.
- **Gender with money.** No adjective or article now has to agree with `{{amount}}` ("encontrados", "unos" removed), so the lines work for dólares and libras alike.
- **Units.** Lines shown in every country now use "viaje" or "kilometraje": the welcome tagline and headline, both milestone share lines, and the "Missed miles check" title. Lines with separate miles/km keys keep their own unit.
- **UI fit.** "Add a missed drive", the modal title and "Free to start" were shortened. Trial price lines no longer repeat the trial name.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{achievement}} on MileMint {{emoji}} The mileage app that counts every mile. | {{achievement}} en MileMint {{emoji}} La app de kilometraje que cuenta cada milla. | {{achievement}} en MileMint {{emoji}} La app de kilometraje que cuenta cada viaje. | Units: share line sent from every country; "milla" was wrong for Canada/Australia. Unit-neutral now. |
| {{amount}} back in your pocket | {{amount}} de vuelta en tu bolsillo | ¡Ya llevas {{amount}}! | Money honesty: "de vuelta en tu bolsillo" promises a refund. Also avoided "a tu favor" ("saldo a favor" = tax refund in Mexico). |
| {{amount}} found | {{amount}} encontrados | Total encontrado: {{amount}} | Gender: "encontrados" clashed with libras (£). "Total encontrado:" needs no agreement. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | Un aviso (un poco travieso) el domingo por la noche para clasificar los viajes de la semana. | Un aviso (con un toque de humor) el domingo por la noche para clasificar los viajes de la semana. | Sensitivity: "travieso" can read as flirty/naughty in parts of Latin America. |
| A quick (slightly cheeky) reminder each Sunday evening to sort the week’s drives, so nothing goes unclaimed. | Un recordatorio rápido (y un poco travieso) cada domingo por la noche para clasificar los viajes de la semana, para que nada se quede sin reclamar. | Un recordatorio rápido (con un toque de humor) cada domingo por la noche para clasificar los viajes de la semana, para que nada se quede sin reclamar. | Same as above. |
| Add a missed drive | Agregar un viaje que faltó | Agregar viaje faltante | UI fit: button was 1.44× English. "faltante" is short and understood everywhere. |
| Add a missed trip | Agregar un viaje que faltó | Agregar un viaje faltante | Consistency with the button and screen title. |
| Add missed trip | Agregar viaje que faltó | Agregar viaje faltante | UI fit (modal title) and consistency. |
| After the {{trial}}, {{price}} per month is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period. | Al terminar el periodo de prueba ({{trial}}), se cobra {{price}} al mes en tu Cuenta de Apple y la suscripción se renueva automáticamente, a menos que la canceles al menos 24 horas antes de que termine el periodo. | {{trial}}. Después, se cobra {{price}} al mes en tu Cuenta de Apple y la suscripción se renueva automáticamente, a menos que la canceles al menos 24 horas antes de que termine el periodo. | Clumsy repetition: rendered "Al terminar el periodo de prueba (Prueba gratis de 30 días)". Now "Prueba gratis de 30 días. Después, se cobra…". |
| After the {{trial}}, {{price}} per year is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period. | Al terminar el periodo de prueba ({{trial}}), se cobra {{price}} al año en tu Cuenta de Apple y la suscripción se renueva automáticamente, a menos que la canceles al menos 24 horas antes de que termine el periodo. | {{trial}}. Después, se cobra {{price}} al año en tu Cuenta de Apple y la suscripción se renueva automáticamente, a menos que la canceles al menos 24 horas antes de que termine el periodo. | Same as above. |
| Every business mile, counted. | Cada milla de trabajo, contada. | Cada viaje de trabajo, contado. | Units: welcome headline shown in every country. |
| found this tax year | encontrados este año fiscal | en deducciones este año fiscal | Gender clash with libras, and "found" money read like a windfall. The amount is the estimated deduction value, so say so. |
| Free money alert 💸 | Alerta de dinero gratis 💸 | Hablemos de dinero 💸 | Money honesty: "dinero gratis" is classic scam/spam wording in Spanish. New title pairs with the body ("Bueno, de tu dinero"). |
| Free to start | Gratis para empezar | Empieza gratis | UI fit (1.46× English) and more natural as a heading. |
| GPS only runs while you drive. Parked, MileMint sleeps. | El GPS solo funciona mientras conduces. Si estás estacionado, MileMint descansa. | El GPS solo funciona mientras conduces. Al estacionarte, MileMint descansa. | Gender: "estacionado" assumed a man; neutral wording. |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | Encontré {{amount}} en kilometraje de trabajo con MileMint 🚗💸 Cada milla, contada automáticamente. | Encontré {{amount}} en kilometraje de trabajo con MileMint 🚗💸 Cada viaje, contado automáticamente. | Units: share line used in every country. |
| MileMint has now found {{amount}} in business mileage for you. That’s real money back at tax time. | MileMint ya encontró {{amount}} en kilometraje de trabajo para ti. Eso es dinero real de vuelta a la hora de declarar impuestos. | MileMint ya encontró {{amount}} en kilometraje de trabajo para ti. Eso cuenta, y mucho, a la hora de declarar impuestos. | Money honesty: "dinero real de vuelta" promises a refund. |
| Missed miles check | Revisión de millas perdidas | Kilometraje no contado | Units: menu item and screen title shown in km countries too. "kilometraje" is the glossary's unit-neutral word. |
| Money back | Dinero de vuelta | Dinero encontrado | Money honesty: "Dinero de vuelta" reads as a refund. |
| Never miss a mile. | No pierdas ni una milla. | No pierdas ni un viaje. | Units: welcome tagline shown in every country. |
| Parking fees and tolls for business trips can be deducted on top of the standard mileage rate. | Los estacionamientos y peajes de los viajes de trabajo se pueden deducir además de la tarifa estándar por milla. | Lo que pagas de estacionamiento y peajes en viajes de trabajo se puede deducir además de la tarifa estándar por milla. | Naturalness: "Los estacionamientos" means car parks, not parking fees. |
| Plot twist: driving pays | Giro inesperado: conducir te deja dinero | Giro inesperado: tus viajes valen dinero | Money honesty: "conducir te deja dinero" sounds like an earnings promise; now matches the app's "Vale dinero". |
| Sort this week’s drives and bank the deduction. Done in a minute. | Clasifica los viajes de esta semana y asegura tu deducción. Listo en un minuto. | Clasifica los viajes de esta semana y deja lista tu deducción. Listo en un minuto. | Money honesty: "asegura tu deducción" guarantees the deduction. |
| Sort your drives and add any you missed before {{date}}. Every business kilometre is money back. | Clasifica tus viajes y agrega los que falten antes del {{date}}. Cada kilómetro de trabajo es dinero de vuelta. | Clasifica tus viajes y agrega los que falten antes del {{date}}. Cada kilómetro de trabajo vale dinero. | Money honesty: "dinero de vuelta" promises a refund; "vale dinero" is accurate. |
| Sort your drives and add any you missed before {{date}}. Every business mile is money back. | Clasifica tus viajes y agrega los que falten antes del {{date}}. Cada milla de trabajo es dinero de vuelta. | Clasifica tus viajes y agrega los que falten antes del {{date}}. Cada milla de trabajo vale dinero. | Same as above. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | Desliza los viajes de esta semana como de trabajo o personales y mira cuánto recuperaste. | Desliza los viajes de esta semana como de trabajo o personales y mira cuánto suman. | Money honesty: "cuánto recuperaste" implies a refund already received. |
| The weekend’s nearly over 🛋️ | El fin de semana casi se acaba 🛋️ | El fin de semana ya casi termina 🛋️ | Offence: "acabar" is sexual slang in Argentina/Uruguay. "terminar" is safe everywhere. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | Bueno, técnicamente es tu dinero. Clasifica los viajes de esta semana para recuperarlo. | Bueno, de tu dinero. Clasifica los viajes de esta semana para reclamar lo que te corresponde. | Follows the new title; "recuperarlo" implied a refund. |
| Where’s home? | ¿Dónde vives? | ¿Dónde está tu casa? | Sensitivity: "¿Dónde vives?" can feel like a personal/status question; this asks for the saved place and matches "¿Dónde están tu casa y tu trabajo?". |
| worth about {{amount}} | vale unos {{amount}} | vale alrededor de {{amount}} | Gender: "unos" clashes with libras (£). |
| Your driving | Al volante | Tus viajes | Settings header also used by bike and moto couriers; "Al volante" (steering wheel) did not fit them. |
| Your money back and badges | Tu dinero recuperado y tus insignias | Tu dinero encontrado y tus insignias | Money honesty: "recuperado" implies a refund; matches "Dinero encontrado". |
| My delivery app counted {{counted}} km last month. MileMint logged {{logged}} business km: that's {{extra}} km (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | Mi app de reparto contó {{counted}} km el mes pasado. MileMint registró {{logged}} km de trabajo: son {{extra}} km (unos {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada kilómetro automáticamente. | Mi app de reparto contó {{counted}} km el mes pasado. MileMint registró {{logged}} km de trabajo: son {{extra}} km (alrededor de {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada kilómetro automáticamente. | Gender: "unos {{amount}}" clashes with libras (£); "alrededor de" needs no agreement. |
| My delivery app counted {{counted}} km this month. MileMint logged {{logged}} business km: that's {{extra}} km (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | Mi app de reparto contó {{counted}} km este mes. MileMint registró {{logged}} km de trabajo: son {{extra}} km (unos {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada kilómetro automáticamente. | Mi app de reparto contó {{counted}} km este mes. MileMint registró {{logged}} km de trabajo: son {{extra}} km (alrededor de {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada kilómetro automáticamente. | Gender: "unos {{amount}}" clashes with libras (£); "alrededor de" needs no agreement. |
| My delivery app counted {{counted}} km this week. MileMint logged {{logged}} business km: that's {{extra}} km (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | Mi app de reparto contó {{counted}} km esta semana. MileMint registró {{logged}} km de trabajo: son {{extra}} km (unos {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada kilómetro automáticamente. | Mi app de reparto contó {{counted}} km esta semana. MileMint registró {{logged}} km de trabajo: son {{extra}} km (alrededor de {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada kilómetro automáticamente. | Gender: "unos {{amount}}" clashes with libras (£); "alrededor de" needs no agreement. |
| My delivery app counted {{counted}} miles last month. MileMint logged {{logged}} business miles: that's {{extra}} miles (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | Mi app de reparto contó {{counted}} millas el mes pasado. MileMint registró {{logged}} millas de trabajo: son {{extra}} millas (unos {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada milla automáticamente. | Mi app de reparto contó {{counted}} millas el mes pasado. MileMint registró {{logged}} millas de trabajo: son {{extra}} millas (alrededor de {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada milla automáticamente. | Gender: "unos {{amount}}" clashes with libras (£); "alrededor de" needs no agreement. |
| My delivery app counted {{counted}} miles this month. MileMint logged {{logged}} business miles: that's {{extra}} miles (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | Mi app de reparto contó {{counted}} millas este mes. MileMint registró {{logged}} millas de trabajo: son {{extra}} millas (unos {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada milla automáticamente. | Mi app de reparto contó {{counted}} millas este mes. MileMint registró {{logged}} millas de trabajo: son {{extra}} millas (alrededor de {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada milla automáticamente. | Gender: "unos {{amount}}" clashes with libras (£); "alrededor de" needs no agreement. |
| My delivery app counted {{counted}} miles this week. MileMint logged {{logged}} business miles: that's {{extra}} miles (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | Mi app de reparto contó {{counted}} millas esta semana. MileMint registró {{logged}} millas de trabajo: son {{extra}} millas (unos {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada milla automáticamente. | Mi app de reparto contó {{counted}} millas esta semana. MileMint registró {{logged}} millas de trabajo: son {{extra}} millas (alrededor de {{amount}}) que no habría reclamado. 🚗💸 MileMint registra cada milla automáticamente. | Gender: "unos {{amount}}" clashes with libras (£); "alrededor de" needs no agreement. |

## Reviewed and kept

- **Jokes:** "Toc, toc / ¿Quién es?", "Haz match con tus deducciones / La cita más fácil de la semana", "¿Domingo de nervios?", "Tu yo del futuro te lo agradece", "Tus millas/kilómetros te llamaron", "Te lo ganaste a pulso", "¡Manos a la obra!", "¡A rodar!", "Abrígate bien", "Llegó la primavera" and "Feliz Halloween". All are clean in every country and kind in tone. "match" is a widely used dating-app loanword.
- **"Hazte Pro"** (9 characters against 6). It sits in a pill that grows with its text, so it is kept as natural CTA wording.
- **"Seguimiento activo"** ("Tracking on", 1.6×). The status pill sits beside a flexible text column, so it has room. The shorter options ("Rastreo", "GPS activo") break the glossary or change the meaning.
- **"Reino Unido"** in the half-width tile. It is the same width class as "Australia".
- **"Guardados, bloqueados"** ("Kept, locked"). It is a comparison-table cell that can wrap to two lines.
- **"Auto o camioneta".** The chip wraps. "van" and "furgoneta" are too regional.
- **iOS wording** ("Permitir al usar la app", "Localización", "PERMITIR ACCESO A LA UBICACIÓN"). This is outside this check. Check 2's note still applies: confirm it on an iPhone set to Español (Latinoamérica).

## Sign-off

**Approved for release**, provided the iOS strings check 2 flagged ("ALLOW LOCATION ACCESS" header, "Localización") get a quick on-device confirmation. That is a wording-match item, not a cultural or tone blocker.

## Round 3: logbook, P87, privacy and backup (October 2026)

**Scope:** the 201 new keys, read as a Spanish-speaking courier or care worker in the UK, US, Canada or Australia. Checked: regional or offensive words; tone; money honesty (P87 relief is tax relief on the shortfall, not a refund of the whole amount); privacy lines reassuring and never suggesting anything is hidden from the tax office; backup lines precise (encrypted, in the user's own iCloud, no MileMint account or servers); Apple es-419 wording ("Configuración", "Llavero de iCloud", "respaldo/respaldar", "Respaldar ahora", "Inicia sesión", "cifrado"); glossary consistency (viaje, de trabajo, año fiscal, reclamar, motivo, registro de kilometraje, Configuración, agregar, auto); and length of buttons/labels against the 1.3× guide.

**Found:** no rude, regional-slang, religious or political words; "llantas" (regional) avoided in favour of "neumáticos"; "manejar" avoided ("conducir"/"viajes de trabajo" per glossary). Money lines keep "alrededor de"/"estimado" and conditional "recuperarías"; "relief" is "beneficio fiscal", never "reembolso" or "dinero de vuelta". Privacy lines ("Guardaremos solo la zona, nunca su dirección", "Para la oficina de impuestos bastan la zona, la distancia y el motivo") are plain and honest.

**Result:** 4 lines changed.

| English | Before | After | Why |
|---|---|---|---|
| Claim mileage relief | Reclamar beneficio por kilometraje | Reclamar por kilometraje | Menu item at 1.7× English; now 1.2×. The subtitle ("Para empleados: P87 o Self Assessment") gives the context. |
| Keep the address | Conservar la dirección | Conservar dirección | Alert button over 1.3×. |
| Ended early | Terminada antes | Terminada antes de tiempo | "Terminada antes" reads as unfinished ("ended before…?"). It is a status line with room, not a button. |
| Employed, in your own vehicle? | ¿Eres empleado y usas tu propio vehículo? | ¿Trabajas para un empleador con tu propio vehículo? | Gender-neutral: many care workers are women, and "empleado" assumed a man. |

**Reviewed and kept:**
- **"Empleado"** as the Settings segment label (next to "Por cuenta propia"). A neutral option ("Con empleador") is 1.6× English; kept as a form-style category label, matching the existing "Si eres empleado". Listed under Unsure.
- **"bitácora"** for the ATO logbook. Common in Latin America for vehicle logbooks; understood (if nautical-sounding) in Spain. First mention glossed "(logbook method)".
- **"Respaldar ahora"** (1.36×) is Apple es-419's own button text for iCloud Backup, so it matches what users see in iOS.
- **"Privacidad de clientes"** (1.57×) is a section header/toggle title that wraps; shorter options lose "clients".
- **"Client visit · zona"** in the add-trip alert keeps "Client visit" in English because the saved label (`domain/privacy.ts`) is English for the tax-office reports, so that is what the user will see on the trip.
- Cost categories ("Combustible y aceite", "Intereses del préstamo", …) are longer than English but sit in a full-width form list.

**Sign-off:** approved, pending an on-device check of the Unsure items in the glossary.

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | Desliza atrás para terminar el turno. | New line. Back-translation: "Swipe back to end the shift." Uses Desliza (tú) and "terminar turno" as in "Terminar turno". 1.28× English. |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}. Desliza el botón hacia la izquierda o toca dos veces. | New VoiceOver hint; mirrors the "hacia la derecha" line word for word. Back-translation: "Slide the button to the left or tap twice." |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | Escribe los montos como números, p. ej., 2400 o 2,400.50. | (unchanged) | Checked: no dot instruction; the English-style example matches the glossary (numbers keep English format) and Latin American usage. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | Los dos reciben +10 viajes gratis al mes cuando un amigo se une. | “The two of you receive…”. es-419 *reciben* (ustedes), as the glossary targets Latin America. |
| Share it · friends get +10 drives | Compartir · +10 viajes para tus amigos | Pill button: 38 chars (1.15×). Reordered so the verb stays first, like “Compartir”. |
| That doesn’t look like a MileMint code… | Eso no parece un código de MileMint. Son 4 letras, un guion y 3 caracteres más… | “3 more” made explicit as *caracteres*: the last three can be digits. |
| A friend’s code can only be entered in the first 30 days… | …solo se puede ingresar en los primeros 30 días… | *ingresar* is the es-419 verb for typing a code (Apple uses it). |
| Redeem | Canjear | Apple es-419 wording for codes and gift cards. |
| Enter my code {{code}} when you set up MileMint… | Usa mi código {{code}} al configurar MileMint y recibe 10 viajes gratis más al mes. | Sent to a friend: tú, first person. Back: “Use my code … and get 10 more free trips a month.” |
| Friends count once they’ve logged a few drives. | Tus amigos cuentan una vez que registren algunos viajes. | Subjunctive keeps it neutral and future-facing. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | Envía una invitación a un amigo. Cuando se una a MileMint con ella, los dos reciben 10 viajes automáticos gratis más al mes. Por cada amigo, sin límite. | “Send an invitation to a friend. When they join MileMint with it, you both receive 10 more free automatic trips a month. For each friend, no limit.” *viajes*, *Los dos reciben* as in Round 4 (es-419 ustedes). |
| Send an invite | Enviar invitación | “Send invitation” Hero pill button, 1.21×. |
| Every invite has its own code, for one friend. | Cada invitación tiene su propio código y sirve para un solo amigo. | “Each invitation has its own code and works for just one friend.” “sirve para un solo amigo” makes the single use explicit. |
| Invites sent: {{count}} | Invitaciones enviadas: {{count}} | “Invitations sent: {{count}}” Counter label; same text for one/many/other. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | Las invitaciones se confirman a través de iCloud, que llegará en una próxima actualización. Los amigos que se unan antes recibirán sus viajes extra cuando se active, y tú también. | “Invitations are confirmed through iCloud, which will arrive in a coming update. Friends who join before will get their extra trips when it’s turned on, and you too.” Honest: nobody is promised drives today. Same “próxima actualización” as before. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | Ingresaste {{code}}. Tus 10 viajes extra llegarán en cuanto se confirme la invitación. | “You entered {{code}}. Your 10 extra trips will arrive as soon as the invitation is confirmed.” *Ingresaste*: es-419 verb for typing a code. |
| Code {{code}} saved | Código {{code}} guardado | “Code {{code}} saved” Mirrors “Código {{code}} agregado”. |
| Your 10 extra drives are on their way once the invite is confirmed. | Tus 10 viajes extra llegarán en cuanto se confirme la invitación. | “Your 10 extra trips will arrive as soon as the invitation is confirmed.” Future tense keeps it a promise on confirmation only. |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | Tu código de invitación es {{code}}. Ingrésalo al configurar MileMint y recibe 10 viajes gratis más al mes. | “Your invitation code is {{code}}. Enter it when setting up MileMint and get 10 more free trips a month.” Sent to a friend: tú, like the old line. |
| We couldn’t find that invite. Check the code with your friend. | No encontramos esa invitación. Revisa el código con tu amigo. | “We didn’t find that invitation. Check the code with your friend.” Neutral, no blame. |
| That invite has already been used. Ask your friend to send you a new one. | Esa invitación ya se usó. Pídele a tu amigo que te envíe una nueva. | “That invitation was already used. Ask your friend to send you a new one.” *Pídele* (tú). |
| That’s one of your own invites. Send it to a friend instead. | Esa es una de tus propias invitaciones. Mejor envíasela a un amigo. | “That’s one of your own invitations. Better send it to a friend.” Keeps the light “Mejor…” from Round 4. |
| This Apple Account has already joined with a friend’s invite. | Esta Cuenta de Apple ya se unió con la invitación de un amigo. | “This Apple Account already joined with a friend’s invitation.” *Cuenta de Apple*: Apple’s es-419 name (glossary). |
| 🎉 Your friend’s invite is confirmed | 🎉 Se confirmó la invitación de tu amigo | “🎉 Your friend’s invitation was confirmed” Alert title. |
| Your friend’s invite couldn’t be used | No se pudo usar la invitación de tu amigo | “Your friend’s invitation couldn’t be used” Alert title; impersonal *No se pudo*. |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 7: tracking health

Tracking health: the home card that says when tracking stopped (and offers to add a missed trip), the Settings “Estado del seguimiento” row and the background notifications. 24 new lines. Terms as before: *viaje*, *seguimiento*, *registrar*, *faltante*, tú. iOS wording: *Configuración*, *Ubicación*, *Ubicación exacta* (Apple es-419). Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | Ubicación exacta desactivada | “Precise location off”. *Ubicación exacta* is Apple’s toggle name; card title, 28 chars. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint solo recibe una ubicación aproximada, así que no puede medir los viajes. En Configuración, toca Ubicación y activa Ubicación exacta. | “MileMint only receives an approximate location, so it can’t measure trips. In Settings, tap Location and turn on Precise Location.” Matches the iOS path word for word. |
| Tracking has stopped | El seguimiento se detuvo | “Tracking stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | El seguimiento automático dejó de funcionar, así que los viajes nuevos no se están registrando. | “Automatic tracking stopped working, so new trips aren’t being recorded.” |
| Tracking may have stopped | Es posible que el seguimiento se haya detenido | “Tracking may have stopped”. Subjunctive, no blame. |
| No location since {{time}}, in the middle of a drive. | Sin ubicación desde {{time}}, a mitad de un viaje. | “No location since {{time}}, midway through a trip.” *desde {{time}}* works for “14:10” and “mar 14:10”. |
| Turn tracking back on | Reactivar el seguimiento | “Reactivate tracking”. Button, 1.14×. |
| Tracking stopped {{from}}–{{to}} | Seguimiento detenido: {{from}}–{{to}} | “Tracking stopped: {{from}}–{{to}}”. Card title. |
| A drive may have been missed | Es posible que falte un viaje | “A trip may be missing”. |
| About {{distance}} may be missing. Add the missed trip? | Podrían faltar unos {{distance}}. ¿Agregas el viaje faltante? | “About {{distance}} could be missing. Add the missing trip?” *¿Agregas…?* is the friendly es-419 offer; reuses *viaje faltante* from “Agregar viaje faltante”. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | Tu teléfono se movió unos {{distance}} entre {{from}} y {{to}}, pero no se registró ningún viaje. ¿Agregas el viaje faltante? | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Add the missing trip?” |
| Not a drive | No fue un viaje | “It wasn’t a trip”. Text link next to the button: 15 chars (1.36×), room in the row. |
| All good | Todo bien | “All good”. |
| just now | hace un momento | “a moment ago”. Lower case: follows “Última ubicación:”. |
| {{count}} minutes ago | one: hace {{count}} minuto / many: hace {{count}} minutos / other: hace {{count}} minutos | “{{count}} minute(s) ago”. one/many/other. |
| {{count}} hours ago | one: hace {{count}} hora / many: hace {{count}} horas / other: hace {{count}} horas | “{{count}} hour(s) ago”. |
| {{count}} days ago | one: hace {{count}} día / many: hace {{count}} días / other: hace {{count}} días | “{{count}} day(s) ago”. |
| Tracking check | Estado del seguimiento | “Tracking status”. *Revisión* sounded like a car service; *Estado* is what a status row says. |
| Last location: {{ago}} | Última ubicación: {{ago}} | “Last location: {{ago}}”. |
| No location yet | Aún sin ubicación | “No location yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | El acceso a la ubicación de MileMint está desactivado, así que los viajes no se están registrando. Toca para volver a activarlo. | “MileMint’s location access is off, so trips aren’t being recorded. Tap to turn it back on.” Notification. |
| Drives can’t be measured from a rough position. Tap to fix it. | Con una ubicación aproximada no se pueden medir los viajes. Toca para corregirlo. | “With an approximate location trips can’t be measured. Tap to fix it.” Notification. |
| New drives aren’t being logged. Tap to turn tracking back on. | Los viajes nuevos no se están registrando. Toca para reactivar el seguimiento. | “New trips aren’t being recorded. Tap to reactivate tracking.” Notification. |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | Sin ubicación desde {{time}}, a mitad de un viaje. Abre MileMint para retomarlo. | “No location since {{time}}, midway through a trip. Open MileMint to pick it back up.” Notification. |

**Sign-off:** approved, pending an on-device check that the iOS toggle reads *Ubicación exacta* on es-419.
