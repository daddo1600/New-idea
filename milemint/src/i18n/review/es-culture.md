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

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | Guardado · el valor llega con Pro | Row label. First draft *el valor se desbloquea con Pro* (41 chars, 1.37×) shortened to *llega* (“arrives”), 33 chars. |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | Guardado. Ya usaste los viajes gratis de este mes, así que un viaje que vuelves a clasificar de personal a trabajo espera a Pro para mostrar su valor. Los viajes que ya muestran su valor lo conservan. | “Saved. You already used this month’s free trips, so a trip you re-sort from personal to work waits for Pro to show its value. Trips that already show their value keep it.” *vuelves a clasificar* keeps the glossary verb. |
| {{used}} of {{limit}} free work drives in {{month}} | {{used}} de {{limit}} viajes de trabajo gratis en {{month}} | “{{used}} of {{limit}} free work trips in {{month}}”. *de trabajo* = the glossary’s business term. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | Gratis: {{count}} viajes de trabajo al mes. Los viajes personales no cuentan y un turno cuenta una vez al día. Los viajes que agregas a mano siempre son gratis. Pro: ilimitados. | “Free: 40 work trips a month. Personal trips don’t count and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited.” tú (*agregas*), es-419. |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | Los viajes personales no cuentan. Clasifica uno como personal y el siguiente viaje ocupa su lugar. | “Personal trips don’t count. Sort one as personal and the next trip takes its place.” |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | Pasado el límite no se oculta ni se pierde nada: cada viaje se guarda, se ve completo, se puede clasificar y está en tu exportación a hoja de cálculo. Solo su valor espera a Pro. | “Past the limit nothing is hidden or lost: each trip is saved, shown complete, can be sorted and is in your spreadsheet export. Only its value waits for Pro.” *hoja de cálculo* is the everyday word. |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | Los primeros viajes del mes van primero, así que un viaje que muestra su valor lo conserva. La cuenta vuelve a empezar el día 1. | “The month’s first trips go first, so a trip that shows its value keeps it. The count starts again on day 1.” |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} viaje / many: {{count}} viajes / other: {{count}} viajes | “{{count}} trip(s)” Plural one/many/other; *viaje* as everywhere. |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: {{count}} viaje desde entonces parece una entrega. Se agregará al turno como de trabajo. / many: {{count}} viajes desde entonces parecen entregas. Se agregarán al turno como de trabajo. / other: {{count}} viajes desde entonces parecen entregas. Se agregarán al turno como de trabajo. | “{{count}} trips since then look like deliveries. They’ll be added to the shift as work.” *de trabajo* is this app’s word for business. |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}} por clasificar / many: {{purpose}} · {{count}} por clasificar / other: {{purpose}} · {{count}} por clasificar | “{{purpose}} · {{count}} to classify” Same text for every count. |
| After your shift ended · not counted as work unless you say so | Después de terminar tu turno · no cuenta como trabajo salvo que tú lo marques | “After ending your shift · doesn’t count as work unless you mark it” Honest: it is left to the user. |
| Deliveries | Entregas | “Deliveries” Purpose shown for shift drives. |
| Did your shift start at {{time}}? | ¿Tu turno empezó a las {{time}}? | “Did your shift start at {{time}}?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | Los viajes entran o salen del turno según la hora en que empezaron. Un viaje que sigue después del final se corta ahí. | “Trips enter or leave the shift by the time they started. A trip that carries on after the end is cut there.” |
| During a pause in your shift · not counted as work unless you say so | Durante una pausa del turno · no cuenta como trabajo salvo que tú lo marques | “During a pause of the shift · doesn’t count as work unless you mark it” |
| End 15 minutes earlier | Adelantar el final 15 minutos | “Bring the end forward 15 minutes” VoiceOver only; *adelantar/atrasar* are the everyday es-419 verbs. |
| End 15 minutes later | Atrasar el final 15 minutos | “Push the end back 15 minutes” |
| End your shift? | ¿Terminar tu turno? | “End your shift?” Matches *Terminar turno*. |
| Ended {{time}} | Terminó a las {{time}} | “Ended at {{time}}” |
| Hide drives ▴ | Ocultar viajes ▴ | “Hide trips ▴” 1.2×. |
| Hides the drives in this shift | Oculta los viajes de este turno | “Hides the trips of this shift” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | Seguía activo, así que MileMint lo terminó. Los viajes de ahora en adelante quedan para que tú los clasifiques. Toca para revisar los horarios. | “It was still on, so MileMint ended it. Trips from now on are left for you to classify. Tap to check the times.” Notification body. |
| Map of the drives in this shift | Mapa de los viajes de este turno | “Map of the trips of this shift” |
| On shift | En turno | “On shift” Badge, as the shift bar. |
| Pause | Pausar | “Pause” Button, 1.2×. |
| Pause the shift for a personal errand | Pausar el turno para un asunto personal | “Pause the shift for a personal matter” *asunto personal*: neutral, not “errand” (*mandado* is regional). |
| Paused · {{elapsed}} | En pausa · {{elapsed}} | “Paused · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | En pausa: los viajes de ahora no cuentan como trabajo. Reanuda cuando vuelvas. | “Paused: trips now don’t count as work. Resume when you get back.” |
| Resume | Reanudar | “Resume” |
| Resume the shift | Reanudar el turno | “Resume the shift” |
| Shift | Turno | “Shift” Badge. |
| Shift ended | Turno terminado | “Shift ended” Toast. |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | Turno del {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift of {{date}}, …” VoiceOver label for the whole row. |
| Show drives ▾ | Ver viajes ▾ | “See trips ▾” 0.9×. |
| Shows the drives in this shift | Muestra los viajes de este turno | “Shows the trips of this shift” |
| Since {{time}} | Desde las {{time}} | “Since {{time}}” As the live-drive banner. |
| Start 15 minutes earlier | Adelantar el inicio 15 minutos | “Bring the start forward 15 minutes” |
| Start 15 minutes later | Atrasar el inicio 15 minutos | “Push the start back 15 minutes” |
| Start from {{time}} | Iniciar a las {{time}} | “Start at {{time}}” Button, 1.3×. |
| Start shift from {{time}}? | ¿Iniciar turno desde las {{time}}? | “Start shift from {{time}}?” *Iniciar turno* as the swipe. |
| Started {{time}} | Empezó a las {{time}} | “Started at {{time}}” |
| Still working | Sigo trabajando | “I’m still working” First person: the user’s answer. |
| Undo | Deshacer | “Undo” Apple’s es-419 wording. |
| Undo ending the shift | Deshacer el fin del turno | “Undo the end of the shift” |
| Where your shift ended | Donde terminó tu turno | “Where your shift ended” Stored as a place name, shown translated. |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | Llevas un rato estacionado en casa y tu turno sigue activo. Los viajes después de terminarlo no cuentan como trabajo. | “You’ve been parked at home for a while and your shift is still on. Trips after ending it don’t count as work.” *estacionado* (es-419). |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | Estás estacionado en casa desde las {{time}}. Los viajes después del turno no cuentan como trabajo. | “You’re parked at home since {{time}}. Trips after the shift don’t count as work.” |
| Your shift ended after 16 hours | Tu turno terminó tras 16 horas | “Your shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

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


## Round 8: pre-release fixes

| English | es | Back-translation | Note |
|---|---|---|---|
| Where your shift started | Donde empezó tu turno | Where your shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | es | Back-translation | Note |
|---|---|---|---|
| Opens trip details | Abre los detalles del viaje | Opens the trip details | Accessibility hint; matches “Abre los detalles del viaje. Mantén presionado…”. |
| Usual purpose · tap to change | Motivo habitual · toca para cambiarlo | Usual reason · tap to change it | Quiet note under the row; *motivo* as in “Motivo de trabajo”. |
| Purpose needed for your tax records | Falta el motivo para tus registros fiscales | The reason for your tax records is missing | “Falta…” reads as a gentle alert in es-419; 43 chars, wraps once in the amber box. |
| Shows only the drives that need a purpose | Muestra solo los viajes que necesitan un motivo | Shows only the trips that need a reason | Accessibility hint. |
| {{count}} work drives need a purpose | one: {{count}} viaje de trabajo necesita un motivo / many: {{count}} viajes de trabajo necesitan un motivo / other: {{count}} viajes de trabajo necesitan un motivo | {{count}} work trip(s) need(s) a reason | one/many/other. *Viaje de trabajo* as in the free-plan line. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} pide un motivo para cada viaje de trabajo. Un toque cada uno. | {{authority}} asks for a reason for each work trip. One tap each. | *pide* as in “{{authority}} pide un motivo de trabajo”. |
| Add purposes › | Agregar motivos › | Add reasons › | *Agregar* as in “Agregar motivo de trabajo” (es-419). |
| Every work drive has a purpose ✓ | Todos los viajes de trabajo tienen motivo ✓ | All work trips have a reason ✓ | Natural, fits its place. |
| Show all drives | Ver todos los viajes | See all trips | Link in the bar; short. |
| {{count}} work drives have no purpose | one: {{count}} viaje de trabajo no tiene motivo / many: {{count}} viajes de trabajo no tienen motivo / other: {{count}} viajes de trabajo no tienen motivo | {{count}} work trip(s) has/have no reason | Report warning and alert title. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} pide un motivo para cada viaje de trabajo. ¿Los agregas antes de exportar? | {{authority}} asks for a reason for each work trip. Will you add them before exporting? | Friendly *¿Los agregas…?* offer, as in other es-419 prompts. |
| Export anyway | Exportar de todos modos | Export anyway | Alert button. |
| Add purposes | Agregar motivos | Add reasons | Alert button. |
| Usual business purpose | Motivo de trabajo habitual | Usual work reason | Settings row title. |
| Clear | Borrar | Erase | Clears the setting; *Eliminar* is kept for deleting trips. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | Se completa en los viajes de trabajo que no lo tengan, para que tus registros fiscales estén completos. Los viajes de un turno usan “Entregas” salvo que elijas otro. | It’s filled in on work trips that don’t have one, so your tax records are complete. Trips in a shift use “Deliveries” unless you choose another. | *turno* as in “Automático: en turno”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | Se completa en los viajes de trabajo que no lo tengan, para que tus registros fiscales estén completos. Puedes cambiarlo en cualquier viaje. | It’s filled in on work trips that don’t have one, so your tax records are complete. You can change it on any trip. | Natural, fits its place. |
| None: ask me each time | Ninguno: preguntarme cada vez | None: ask me each time | Placeholder in the picker field. |
| What are most of your work drives for? | ¿Para qué son la mayoría de tus viajes de trabajo? | What are most of your work trips for? | Onboarding title; natural question form. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | Las autoridades fiscales piden un motivo para cada viaje de trabajo. Lo completaremos por ti y podrás cambiarlo en cualquier viaje. | Tax authorities ask for a reason for every work trip. We’ll fill it in for you and you can change it on any trip. | Generic “autoridades fiscales”: no country named before the region is known in every case. |


## Round 8c: work purpose tiles

Back-translations: Choose all that apply. The first you choose is filled in for you. / Filled in for you / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | es | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | Sin cuenta. Tus viajes se quedan en tu teléfono. | No account. Your trips stay on your phone. | Replaces “Sin cuenta… cifrados en tu iPhone”; *teléfono* since the line no longer names the device. |
| Is this home? {{place}} | ¿Es tu casa? {{place}} | Is it your home? {{place}} | *Casa* as in “Home”. |
| You stopped here for the night. Trips to and from it will read “Home”. | Aquí pasaste la noche. Los viajes que salgan o lleguen aquí dirán “Casa”. | You spent the night here. Trips leaving or arriving here will say “Home”. | *Casa* in quotes matches the saved place name. |
| Yes, that’s home | Sí, es mi casa | Yes, it’s my home | Short button. |
| No | No | No |  |
| Is this work? {{place}} | ¿Es tu trabajo? {{place}} | Is it your work? {{place}} | *Trabajo* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | Sueles estacionar aquí en tu horario de trabajo. Los viajes dirán “Trabajo”, y los trayectos casa-trabajo se marcarán. | You usually park here in your work hours. Trips will say “Work”, and home-work journeys will be marked. | *estacionar* as in the end-shift prompt (es-419); *casa-trabajo* as in “Automático: casa-trabajo”. |
| Yes, that’s work | Sí, es mi trabajo | Yes, it’s my work | Short button. |


## Round 8f: motion activity

iOS’s own names: “Movimiento y forma física” is the Settings item; “Permitir” / “No permitir” are iOS’s alert buttons. “Viaje” as everywhere else. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | Una más, para más precisión: Movimiento y forma física | One more, for more accuracy: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | Permite que MileMint distinga entre conducir y caminar, para que un paseo nunca se registre como viaje. Se queda en tu teléfono. | Lets MileMint tell driving from walking, so a walk is never logged as a trip. It stays on your phone. | |
| Turn on Motion & Fitness | Activar Movimiento y forma física | Turn on Motion & Fitness | |
| Allow | Permitir | Allow | |
| Don’t Allow | No permitir | Don’t allow | |
| Motion & Fitness | Movimiento y forma física | Motion & Fitness | |
| On | Activado | On | |
| Off | Desactivado | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | Desliza para iniciar tu turno cuando empieces a trabajar. Cada viaje del turno cuenta como {{purpose}}. | Swipe to start your shift when you begin working. Each trip in the shift counts as {{purpose}}. | Empty home, shift workers. *Desliza para iniciar turno* as on the shift bar. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | Los viajes en tu horario ({{days}} {{from}}–{{to}}) se clasifican como de trabajo automáticamente. | Trips in your schedule ({{days}} {{from}}–{{to}}) are classified as work automatically. | *horario* as in “Horario de trabajo”; days and times come formatted for es. |
| Drives in your work hours are sorted as business for you. | Los viajes en tu horario de trabajo se clasifican como de trabajo automáticamente. | Trips in your work schedule are classified as work automatically. | When the hours differ by day. |
| After each drive, swipe right for business or left for personal. | Después de cada viaje, desliza a la derecha si es de trabajo o a la izquierda si es personal. | After each trip, swipe right if it’s work or left if it’s personal. | Same pattern as “desliza a la izquierda si es personal”. |
| {{rate}} a mile · {{vehicle}} · {{country}} | {{rate}} por milla · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | *por milla* as in the HMRC rate line. |
| {{rate}} a km · {{vehicle}} · {{country}} | {{rate}} por km · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | Natural, fits its place. |
| PRACTICE RUN | PRÁCTICA | PRACTICE | Eyebrow in capitals, like “PASO {{step}} DE 2”. |
| This is how a drive shows up after you park. Try sorting it. | Así aparece un viaje cuando te estacionas. Intenta clasificarlo. | This is how a trip appears when you park. Try classifying it. | *te estacionas* (es-419), as in “Los viajes se registran cuando te estacionas”. |
| Swipe left for personal | Desliza a la izquierda si es personal | Swipe left if it’s personal | Tooltip; reuses the auto note’s wording. |
| Not that way. Try again. | Hacia el otro lado. Inténtalo de nuevo. | The other way. Try again. | Friendlier than a literal “Not that way”. |
| Sorted as personal ✓ | Marcado como personal ✓ | Marked as personal ✓ | *Marcar* as in the row buttons. |
| Now a work drive. Work drives are worth money back. | Ahora un viaje de trabajo. Los viajes de trabajo te devuelven dinero. | Now a work trip. Work trips give you money back. | Natural, fits its place. |
| Swipe right for business | Desliza a la derecha si es de trabajo | Swipe right if it’s work | Natural, fits its place. |
| Sorted as business: worth {{amount}} | Marcado como de trabajo: vale {{amount}} | Marked as work: worth {{amount}} | *vale* as in “Vale {{amount}} si es de trabajo”. |
| Swipe to start your shift | Desliza para iniciar tu turno | Swipe to start your shift | Natural, fits its place. |
| Your shift is on ✓ | Tu turno está en marcha ✓ | Your shift is under way ✓ | Natural, fits its place. |
| Mark as personal | Marcar como personal | Mark as personal | VoiceOver button. |
| Mark as business | Marcar como de trabajo | Mark as work | VoiceOver button. |
| Practice drive · not saved | Viaje de práctica · no se guarda | Practice trip · not saved | Natural, fits its place. |
| Supermarket | Supermercado | Supermarket | Sample place name. |
| Office | Oficina | Office | Sample place name. |
| Customer | Cliente | Customer | Sample drop-off for couriers. |
| That’s it. Just drive: trips appear here after you park. | Eso es todo. Solo conduce: los viajes aparecen aquí cuando te estacionas. | That’s all. Just drive: trips appear here when you park. | *Solo conduce* as in the welcome line. |
| Start driving | A conducir | Let’s drive | Button; short and upbeat. |
| Skip | Saltar | Skip | Natural, fits its place. |
| Skip the practice run | Saltar la práctica | Skip the practice | Accessibility label. |
| Tutorial | Tutorial | Tutorial | Settings heading; common in es-419. |
| Replay the tutorial | Repetir el tutorial | Repeat the tutorial | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | Vuelve a clasificar dos viajes de ejemplo. No se guarda nada. | Classify two sample trips again. Nothing is saved. | Natural, fits its place. |
| Replay | Repetir | Repeat | Natural, fits its place. |

## Round 8h: Pro screen

Plain trial terms on the paywall, no “£0.00 hoy”. “Configuración” is the iPhone Settings app, as in “Abrir Configuración”. “Cancelar” for cancelling a subscription, as Apple’s Spanish App Store says. {{date}} is a long date (“1 de noviembre”), so “termina el {{date}}”. The trial pill and lengths are plurals, so “1 month” / “2 months” read right.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| {{count}} days free | {{count}} día gratis / {{count}} días gratis / {{count}} días gratis | {{count}} day(s) free |  |
| {{count}} months free | {{count}} mes gratis / {{count}} meses gratis / {{count}} meses gratis | {{count}} month(s) free |  |
| {{count}} months | {{count}} mes / {{count}} meses / {{count}} meses | {{count}} month(s) |  |
| {{price}} a month | {{price}} al mes | {{price}} per month | Under the yearly price: the yearly price ÷ 12. |
| Most popular | El más popular | The most popular | Badge on the yearly plan. |
| We’ll remind you 3 days before it ends. | Te lo recordaremos 3 días antes de que termine. | We’ll remind you 3 days before it ends. |  |
| {{trial}} free, then {{price}} a year. Cancel any time in Settings. | {{trial}} gratis, luego {{price}} al año. Cancela cuando quieras en Configuración. | {{trial}} free, then {{price}} a year. Cancel whenever you like in Settings. |  |
| {{trial}} free, then {{price}} a month. Cancel any time in Settings. | {{trial}} gratis, luego {{price}} al mes. Cancela cuando quieras en Configuración. | {{trial}} free, then {{price}} a month. Cancel whenever you like in Settings. |  |
| Free trial, then {{price}} a year. Cancel any time in Settings. | Prueba gratis, luego {{price}} al año. Cancela cuando quieras en Configuración. | Free trial, then {{price}} a year. Cancel whenever you like in Settings. |  |
| Free trial, then {{price}} a month. Cancel any time in Settings. | Prueba gratis, luego {{price}} al mes. Cancela cuando quieras en Configuración. | Free trial, then {{price}} a month. Cancel whenever you like in Settings. |  |
| {{price}} a year. Cancel any time in Settings. | {{price}} al año. Cancela cuando quieras en Configuración. | {{price}} a year. Cancel whenever you like in Settings. |  |
| {{price}} a month. Cancel any time in Settings. | {{price}} al mes. Cancela cuando quieras en Configuración. | {{price}} a month. Cancel whenever you like in Settings. |  |
| Your free month ends on {{date}} | Tu mes gratis termina el {{date}} | Your free month ends on {{date}} | Notification title, 3 days before a one-month trial ends. |
| Your free trial ends on {{date}} | Tu prueba gratis termina el {{date}} | Your free trial ends on {{date}} | For other trial lengths. |
| Keep Pro for {{price}} a year, or cancel in Settings. Nothing to do if you’re staying. | Sigue con Pro por {{price}} al año o cancela en Configuración. Si te quedas, no tienes que hacer nada. | Carry on with Pro for {{price}} a year or cancel in Settings. If you stay, you don’t have to do anything. | Notification body. |
| Keep Pro for {{price}} a month, or cancel in Settings. Nothing to do if you’re staying. | Sigue con Pro por {{price}} al mes o cancela en Configuración. Si te quedas, no tienes que hacer nada. | Carry on with Pro for {{price}} a month or cancel in Settings. If you stay, you don’t have to do anything. |  |
