# Spanish (es) — accuracy review (check 2 of 3: back-translation)

**Scope:** all 662 keys in `src/i18n/locales/es.ts` were back-translated into English on their own and compared with the English key (plural objects: every form checked). Context was checked in the source files for weekly messages (`domain/reminders.ts`), the deadline lines (`domain/deadlines.ts`, `components/tax-countdown.tsx`), trial/price strings (`app/pro.tsx`), country tiles (`components/country-options.tsx`) and settings labels (`app/settings.tsx`).

**Result:** 24 lines changed (27 strings counting duplicates). `npx jest src/i18n` passes. Placeholders, `<b>` tags, keys and plural objects are unchanged.

Main issue types:
1. **Deadline wording.** The English says "by 15 April" (on or before). "antes del 15 de abril" can be read as "no later than the 14th". These lines now say "a más tardar el …", which is also the IRS's own Spanish wording. Lines whose English says "before" keep "antes del".
2. **Apple wording (es-419).** Apple's Latin American Spanish support pages (support.apple.com/es-lamr) use "Permitir al usar la app", "Al usar la app", "Preguntar la próxima vez o al compartirla" and "Localización", not "Mientras se usa la app" or "Ubicación".
3. **Wrong reference.** In "hasta que lo termines", "lo" pointed back at *viaje*, but the English "it" is the shift.
4. Grammar, plus a few small drifts in meaning or claim strength.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| BAS: … you lodge quarterly by 28 October, 28 February, 28 April and 28 July. … | …presentas cada trimestre antes del 28 de octubre, 28 de febrero, … | …presentas cada trimestre, a más tardar el 28 de octubre, el 28 de febrero, el 28 de abril y el 28 de julio. … | "by" means on or before; "antes del" shifts the deadline a day earlier. |
| Estimated tax: … pay quarterly with Form 1040-ES by April 15, June 15, … | …antes del 15 de abril, 15 de junio, … | …a más tardar el 15 de abril, el 15 de junio, el 15 de septiembre y el 15 de enero. … | Same deadline issue. |
| Instalments: … CRA asks for quarterly payments by March 15, … | …antes del 15 de marzo, … | …a más tardar el 15 de marzo, el 15 de junio, … | Same deadline issue. |
| Making Tax Digital: … by 7 August, 7 November, 7 February and 7 May. … | …antes del 7 de agosto, … | …a más tardar el 7 de agosto, el 7 de noviembre, … | Same deadline issue. |
| Once a year: by April 30, or June 15 if you’re self-employed … | Una vez al año: antes del 30 de abril, o del 15 de junio … | Una vez al año: a más tardar el 30 de abril, o el 15 de junio … | Same deadline issue. |
| Once a year: lodge by 31 October after the income year ends (30 June), or later if you use a registered tax agent and sign up with them before 31 October. | …presenta antes del 31 de octubre, después de que termine el año fiscal (30 de junio), … y te das de alta con él … | …presenta tu declaración a más tardar el 31 de octubre siguiente al cierre del año fiscal (30 de junio), o más tarde si usas un agente fiscal registrado (registered tax agent) y te inscribes con él antes del 31 de octubre. | Fixes the deadline. The comma made "after the year ends" read as a second instruction. "darse de alta" is mainly used in Spain. |
| Self-employed: once a year on Form 1040 with Schedule C, due April 15 (…) | …con el Schedule C, antes del 15 de abril (15 de octubre con prórroga, …) | …con el Schedule C; vence el 15 de abril (el 15 de octubre con prórroga, …) | "due April 15" means the deadline is that day. |
| Self-employed: once a year, online by 31 January after the tax year ends (5 April). … | …en línea antes del 31 de enero, después de que termine el año fiscal (5 de abril). | …en línea, a más tardar el 31 de enero siguiente al cierre del año fiscal (5 de abril). | Same deadline issue and the same ambiguous comma. |
| Best value | Mejor precio | Mejor oferta | "Best price" says something different. The yearly plan is not the cheapest price, it is the better deal. |
| Delivery apps only count km with an order on board. The drive to the pickup, between orders and home again are business km too, … | El trayecto … también son km de trabajo | Los trayectos … también son km de trabajo | Singular subject with a plural verb. |
| (miles version of the line above) | El trayecto … también son millas de trabajo | Los trayectos … también son millas de trabajo | Same agreement error. |
| Every drive until you end it counts as business | …hasta que lo termines | …hasta que termines el turno | "lo" pointed back at *viaje*, but "it" is the shift. |
| Every drive until you end it counts as business. | …hasta que lo termines. | …hasta que termines el turno. | Same as above. |
| Tap “Start shift” when you start work. Every drive until you end it is business. | Cada viaje hasta que lo termines es de trabajo. | Cada viaje hasta que termines el turno es de trabajo. | Same as above. |
| Get your miles up to date before {{date}} … {{amount}} found so far. | …Hasta ahora llevas {{amount}}. | …Hasta ahora, MileMint encontró {{amount}}. | "found" had been lost. "llevas {{amount}}" is vague. |
| Get your kilometres up to date before {{date}} … {{amount}} found so far. | (same) | (same fix) | Same. |
| MileMint needs location access set to “Always” to notice when you start driving, … | …para notar cuando empiezas a conducir… | …para detectar cuándo empiezas a conducir… | An indirect question needs "cuándo". "detectar" is the natural verb. |
| The ATO cents per km method is for cars only. Motorbike and bicycle trips are logged for your records; … | …se registran para tus archivos; … | …se guardan en tu registro; … | "archivos" means files. "for your records" means kept in your log. |
| The CRA per-km rate is for cars. Motorbike and bicycle trips are logged for your records; … | (same) | (same fix) | Same. |
| The IRS standard mileage rate is for cars, vans and pickups. Motorbike and bicycle trips are logged for your records; … | (same) | (same fix) | Same. |
| You don’t need a logbook for this method, but the ATO may ask … This trip log shows that. | Este registro de viajes lo demuestra. | Este registro de viajes lo muestra. | "demuestra" (proves) is a stronger claim to the tax office than "shows". |
| iOS asks twice. Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>. | <b>Permitir mientras se usa la app</b> | <b>Permitir al usar la app</b> | Apple es-419 wording, as used on Apple es-lamr support pages. |
| Tap <b>Allow While Using App</b>, then <b>Change to Always Allow</b>. | (same) | (same fix) | Same. |
| Tap “Allow While Using App” | Toca “Permitir mientras se usa la app” | Toca “Permitir al usar la app” | Same. |
| While Using the App | Mientras se usa la app | Al usar la app | Apple es-419 name of this option in Settings. |
| Location is set to “While Using”. Switch it to “Always” … | …está en “Mientras se usa la app”… | …está en “Al usar la app”… | Matches the row above and the iPhone screen. |
| Ask Next Time Or When I Share | Preguntar la próxima vez o al compartir | Preguntar la próxima vez o al compartirla | Apple es-419 wording. |
| Tap “Location” | Toca “Ubicación” | Toca “Localización” | Apple's Spanish iOS calls the row and the feature "Localización". |

## Resolved from the translator's Unsure list

- **1. iOS wording.** Corrected as shown in the table. These stay as the translator had them: "Cambiar a Permitir siempre", "Siempre", "Nunca", "Abrir Configuración", and "Configuración → Notificaciones" (Apple es-419 uses "Configuración"; "Ajustes" is used in Spain). If "Allow Once" and "Keep Only While Using" are added later, the Apple style would be "Permitir una vez" and "Mantener solo al usar la app".
- **2. "kilometraje" for "mileage".** Kept. It works for both units and reads naturally.
- **3. "Hazte Pro".** Kept. It is idiomatic and only slightly long.
- **4. "UK" shown as "Reino Unido".** Kept. At 11 characters it fits the half-width tile ("Australia" uses the same tile). "EE. UU." is fine.
- **5. "Best value".** Changed to "Mejor oferta".
- **6, 7, 8, 10, 11.** Kept as written. Each back-translates correctly.
- **9. Date format.** "antes del {{date}}" and "Vence el {{date}}" still assume the date is formatted like "5 de abril". Developers should confirm the date formatter uses the es locale.

## Unresolved / for check 3

- **"ALLOW LOCATION ACCESS"**, written as "PERMITIR ACCESO A LA UBICACIÓN" (also used in "In Settings, under Allow Location Access…"). I could not confirm the header on a device. Because Apple names the feature "Localización", the iPhone may show "PERMITIR ACCESO A LA LOCALIZACIÓN". Check on an iPhone set to Español (Latinoamérica).
- **"Change to Always Allow"**, written as "Cambiar a Permitir siempre". This matches Apple's style but I have not confirmed it on a device.
- **Gender with money amounts.** "{{amount}} found" ("encontrados") and "found this tax year" ("encontrados este año fiscal") use the masculine plural. That fits dólares but not libras (£). It is minor and acceptable, but a neutral wording would be better if one fits.
- **"After the {{trial}}, …"**, written as "Al terminar el periodo de prueba ({{trial}}), …". Because {{trial}} is "Prueba gratis de 30 días", the result is accurate but repetitive. I kept it as the safest grammar.
- **"Your {{year}} … return is due"**, written as "… vence". It reads as a heading and works with ": faltan N días". Elsewhere the sentence ends a little abruptly. Acceptable.
