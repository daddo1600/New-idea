# Punjabi (pa) accuracy review: second check

Reviewer: independent native Punjabi (Gurmukhi) / English reviewer, doing the meaning-accuracy pass by back-translation.

## Scope

- **Lines checked:** all 662 keys in `src/i18n/locales/pa.ts`, including every plural form. I back-translated each line into English on its own, then compared it with the key. I read the source files for unclear lines (`app/welcome.tsx`, `app/index.tsx`, `app/trip/[id].tsx`, `domain/reminders.ts`, `components/tax-countdown.tsx`).
- **Lines changed:** 36.
- **Placeholders, `<b>` tags and plural objects:** I checked them all. None were wrong. `npx jest src/i18n` passes.
- **Tax wording:** "deduction" is ਕਟੌਤੀ throughout, with no exemption wording such as ਛੋਟ or ਮੁਆਫ਼ੀ. "Estimated" is ਅੰਦਾਜ਼ਨ, and "Not tax advice" is kept wherever the English has it. Two lines promised more than the English, and I toned them down (see the table).
- **Bike:** "My bike" and "Cargo bike" are ਸਾਈਕਲ (correct). The courier-list "bike" had been rendered ਬਾਈਕ, which reads as motorbike. Fixed.

## Main issue types

1. **Meaning drift** (6 lines): "take priority" had become "counted first"; "Drives may be missed" read as "trips can stay"; "by default" read as "already"; "since you last looked" had lost "you looked"; "driven" was missing; "swipe" was dropped from the dating pun.
2. **Stronger money promises** (3 lines): "bank the deduction" read as cash into your account, and "is money back" became "money back is owed".
3. **Wrong word sense** (8 lines): start/end of a trip had been rendered as beginning/ending instead of start point/destination; "bike" had become motorbike; "optional" had become "willingly".
4. **Grammar and person** (5 lines): the federal-return sentence; "Get my report" in mixed persons; the CRA logbook "plus"; the between-orders fragment; ’ਚ normalised to ਵਿੱਚ.
5. **Terminology decisions** (6 lines): employer is now ਇੰਪਲਾਇਰ; the gendered first-person line is now neutral.

## Open choices resolved

| Question | Decision | Reason |
|---|---|---|
| ਬਿਜ਼ਨਸ vs ਕੰਮ ਦਾ for "business" | **Keep ਬਿਜ਼ਨਸ** everywhere | It is short, consistent and matches the English tax forms, and ਕੰਮ is already taken by "Work" (the place) and "work hours". The one ਕੰਮ ਦਾ ("swipe right if it was work") follows the English word "work" and is correct. |
| ਮਾਲਕ for "employer" | **Changed to ਇੰਪਲਾਇਰ** (5 lines) | ਮਾਲਕ also means owner or master. It is ambiguous next to "a car you own" and sounds servile. ਇੰਪਲਾਇਰ is what Punjabi-speaking workers in Canada, the UK and Australia actually say. The glossary row (employee / employer = ਮੁਲਾਜ਼ਮ / ਮਾਲਕ) should be updated to ਇੰਪਲਾਇਰ by whoever owns the glossary; I was not permitted to edit it. |
| "I’ll swipe each drive myself." (gendered) | **ਤੁਸੀਂ ਹਰ ਟ੍ਰਿਪ ਖ਼ੁਦ ਸਵਾਈਪ ਕਰੋਗੇ।** | It is the detail text of the "Neither" option, and the sibling options are descriptive. The polite ਕਰੋਗੇ is gender-neutral. |
| Unsure 3 (ਬਿਜ਼ਨਸ) | Resolved as above. | |
| Unsure 4 (ਮਾਲਕ) | Resolved as above. | |
| Unsure 5 (Halloween / holidays) | **Keep** | ਹੈਲੋਵੀਨ ਮੁਬਾਰਕ and ਛੁੱਟੀਆਂ ਮੁਬਾਰਕ are secular, everyday greetings in the diaspora. |
| Unsure 6 (ਕੱਲ੍ਹ = Yesterday) | **Keep** | It sits next to ਅੱਜ in a date picker of past dates, so it is unambiguous. |
| Unsure 7 (ਘੰ / ਮਿੰ) | **Keep** | These are understood abbreviations. |
| Unsure 8 (ਪੈਸੇ ਬਣਦੇ, ਪ੍ਰਾਈਵੇਟ) | **Keep** | They are acceptable short headings. |
| Unsure 9 ("to" = ਤੋਂ) | **Keep** | "09:00 ਤੋਂ 17:00" is natural enough without ਤੱਕ. |
| Unsure 10 (Trades = ਟਰੇਡ) | **Keep** | The loanword is common in Canadian Punjabi ("ਟਰੇਡ ਵਾਲਾ ਕੰਮ"). ਮਿਸਤਰੀ is too narrow (masons and mechanics). It also sits naturally with ਸੇਲਜ਼ and ਕੇਅਰ. |

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{distance}} driven · {{percent}}% business | ਕੁੱਲ {{distance}} · {{percent}}% ਬਿਜ਼ਨਸ | ਕੁੱਲ {{distance}} ਡਰਾਈਵਿੰਗ · {{percent}}% ਬਿਜ਼ਨਸ | "ਕੁੱਲ {{distance}}" back-translated as "Total X" and left out "driven". Added ਡਰਾਈਵਿੰਗ. |
| +{{amount}} since you last looked | ਪਿਛਲੀ ਵਾਰ ਤੋਂ ਬਾਅਦ +{{amount}} | ਪਿਛਲੀ ਵਾਰ ਦੇਖਣ ਤੋਂ ਬਾਅਦ +{{amount}} | "since last time" dropped "you looked". Restored it. |
| Auto: business by default · swipe left if personal | ਆਟੋ: ਪਹਿਲਾਂ ਤੋਂ ਬਿਜ਼ਨਸ · ਨਿੱਜੀ ਹੋਵੇ ਤਾਂ ਖੱਬੇ ਸਵਾਈਪ ਕਰੋ | ਆਟੋ: ਡਿਫ਼ਾਲਟ ਤੌਰ ’ਤੇ ਬਿਜ਼ਨਸ · ਨਿੱਜੀ ਹੋਵੇ ਤਾਂ ਖੱਬੇ ਸਵਾਈਪ ਕਰੋ | ਪਹਿਲਾਂ ਤੋਂ reads as "already / previously", not "by default". |
| Business drives swipe right, personal swipe left. Easiest date of the week. | ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਸੱਜੇ, ਨਿੱਜੀ ਖੱਬੇ। ਹਫ਼ਤੇ ਦਾ ਸਭ ਤੋਂ ਸੌਖਾ ਮੈਚ। | ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਸੱਜੇ ਸਵਾਈਪ, ਨਿੱਜੀ ਖੱਬੇ। ਹਫ਼ਤੇ ਦਾ ਸਭ ਤੋਂ ਸੌਖਾ ਮੈਚ। | The verb "swipe" was missing, and the dating-app pun depends on it. "Swipe" is also a glossary concept. |
| Business or personal? Worth {{amount}} if business. | ਬਿਜ਼ਨਸ ਜਾਂ ਨਿੱਜੀ? ਬਿਜ਼ਨਸ ਹੋਵੇ ਤਾਂ {{amount}} ਦਾ। | ਬਿਜ਼ਨਸ ਜਾਂ ਨਿੱਜੀ? ਬਿਜ਼ਨਸ ਹੋਵੇ ਤਾਂ {{amount}} ਦੀ ਕੀਮਤ। | "{{amount}} ਦਾ" was a dangling fragment ("of £X"). Now matches "worth about {{amount}}" = ਦੀ ਕੀਮਤ. |
| CRA asks for a logbook showing the date, destination, purpose and kilometres of each business trip, plus your odometer readings at the start and end of the year. | CRA ਇੱਕ ਲੌਗਬੁੱਕ ਮੰਗਦਾ ਹੈ ਜਿਸ ਵਿੱਚ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦੀ ਤਾਰੀਖ਼, ਮੰਜ਼ਿਲ, ਮਕਸਦ ਅਤੇ ਕਿਲੋਮੀਟਰ ਹੋਣ, ਨਾਲ ਸਾਲ ਦੀ ਸ਼ੁਰੂਆਤ ਅਤੇ ਅੰਤ ’ਤੇ ਤੁਹਾਡੀ ਓਡੋਮੀਟਰ ਰੀਡਿੰਗ। | CRA ਇੱਕ ਲੌਗਬੁੱਕ ਮੰਗਦਾ ਹੈ ਜਿਸ ਵਿੱਚ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦੀ ਤਾਰੀਖ਼, ਮੰਜ਼ਿਲ, ਮਕਸਦ ਅਤੇ ਕਿਲੋਮੀਟਰ ਹੋਣ, ਨਾਲ ਹੀ ਸਾਲ ਦੀ ਸ਼ੁਰੂਆਤ ਅਤੇ ਅੰਤ ’ਤੇ ਤੁਹਾਡੀ ਓਡੋਮੀਟਰ ਰੀਡਿੰਗ। | Grammar: a bare ਨਾਲ read as "with", not "plus". Changed to ਨਾਲ ਹੀ. |
| Delivery apps only count km with an order on board. The drive to the pickup, between orders and home again are business km too, and MileMint logs them all. | ਡਿਲੀਵਰੀ ਐਪਾਂ ਸਿਰਫ਼ ਉਹ ਕਿ.ਮੀ. ਗਿਣਦੀਆਂ ਹਨ ਜਦੋਂ ਆਰਡਰ ਗੱਡੀ ਵਿੱਚ ਹੋਵੇ। ਪਿਕਅੱਪ ਤੱਕ ਜਾਣਾ, ਆਰਡਰਾਂ ਵਿਚਕਾਰ ਅਤੇ ਵਾਪਸ ਘਰ ਆਉਣਾ ਵੀ ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਹਨ, ਅਤੇ MileMint ਇਹ ਸਾਰੇ ਦਰਜ ਕਰਦਾ ਹੈ। | ਡਿਲੀਵਰੀ ਐਪਾਂ ਸਿਰਫ਼ ਉਹ ਕਿ.ਮੀ. ਗਿਣਦੀਆਂ ਹਨ ਜਦੋਂ ਆਰਡਰ ਨਾਲ ਹੋਵੇ। ਪਿਕਅੱਪ ਤੱਕ ਜਾਣਾ, ਇੱਕ ਆਰਡਰ ਤੋਂ ਦੂਜੇ ਤੱਕ ਜਾਣਾ ਅਤੇ ਵਾਪਸ ਘਰ ਆਉਣਾ ਵੀ ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਹਨ, ਅਤੇ MileMint ਇਹ ਸਾਰੇ ਦਰਜ ਕਰਦਾ ਹੈ। | "ਆਰਡਰਾਂ ਵਿਚਕਾਰ" had no verb ("between orders" read as a fragment). ਗੱਡੀ ਵਿੱਚ (in the car) is wrong for bicycle couriers, so it is now ਨਾਲ. |
| Delivery apps only count miles with an order on board. The drive to the pickup, between orders and home again are business miles too, and MileMint logs them all. | ਡਿਲੀਵਰੀ ਐਪਾਂ ਸਿਰਫ਼ ਉਹ ਮੀਲ ਗਿਣਦੀਆਂ ਹਨ ਜਦੋਂ ਆਰਡਰ ਗੱਡੀ ਵਿੱਚ ਹੋਵੇ। ਪਿਕਅੱਪ ਤੱਕ ਜਾਣਾ, ਆਰਡਰਾਂ ਵਿਚਕਾਰ ਅਤੇ ਵਾਪਸ ਘਰ ਆਉਣਾ ਵੀ ਬਿਜ਼ਨਸ ਮੀਲ ਹਨ, ਅਤੇ MileMint ਇਹ ਸਾਰੇ ਦਰਜ ਕਰਦਾ ਹੈ। | ਡਿਲੀਵਰੀ ਐਪਾਂ ਸਿਰਫ਼ ਉਹ ਮੀਲ ਗਿਣਦੀਆਂ ਹਨ ਜਦੋਂ ਆਰਡਰ ਨਾਲ ਹੋਵੇ। ਪਿਕਅੱਪ ਤੱਕ ਜਾਣਾ, ਇੱਕ ਆਰਡਰ ਤੋਂ ਦੂਜੇ ਤੱਕ ਜਾਣਾ ਅਤੇ ਵਾਪਸ ਘਰ ਆਉਣਾ ਵੀ ਬਿਜ਼ਨਸ ਮੀਲ ਹਨ, ਅਤੇ MileMint ਇਹ ਸਾਰੇ ਦਰਜ ਕਰਦਾ ਹੈ। | Same as the km line. |
| Drives may be missed | ਟ੍ਰਿਪ ਰਹਿ ਸਕਦੇ ਹਨ | ਟ੍ਰਿਪ ਛੁੱਟ ਸਕਦੇ ਹਨ | "ਰਹਿ ਸਕਦੇ ਹਨ" without ਜਾ reads as "trips can stay". ਛੁੱਟ ਸਕਦੇ ਹਨ = may be missed. |
| Drives that start during your hours are marked business, others personal. Your usual routes and commutes take priority. | ਤੁਹਾਡੇ ਘੰਟਿਆਂ ਵਿੱਚ ਸ਼ੁਰੂ ਹੋਣ ਵਾਲੇ ਟ੍ਰਿਪ ਬਿਜ਼ਨਸ ਮੰਨੇ ਜਾਂਦੇ ਹਨ, ਬਾਕੀ ਨਿੱਜੀ। ਤੁਹਾਡੇ ਆਮ ਰਸਤੇ ਅਤੇ ਘਰ-ਕੰਮ ਆਉਣ-ਜਾਣ ਪਹਿਲਾਂ ਗਿਣੇ ਜਾਂਦੇ ਹਨ। | ਤੁਹਾਡੇ ਕੰਮ ਦੇ ਘੰਟਿਆਂ ਵਿੱਚ ਸ਼ੁਰੂ ਹੋਣ ਵਾਲੇ ਟ੍ਰਿਪ ਬਿਜ਼ਨਸ ਮੰਨੇ ਜਾਂਦੇ ਹਨ, ਬਾਕੀ ਨਿੱਜੀ। ਤੁਹਾਡੇ ਆਮ ਰਸਤਿਆਂ ਅਤੇ ਘਰ-ਕੰਮ ਆਉਣ-ਜਾਣ ਨੂੰ ਪਹਿਲ ਮਿਲਦੀ ਹੈ। | "ਪਹਿਲਾਂ ਗਿਣੇ ਜਾਂਦੇ ਹਨ" = "are counted first". This was a meaning drift; the source means precedence (ਪਹਿਲ ਮਿਲਦੀ ਹੈ). "your hours" is now explicitly work hours. |
| Employees reimbursed at CRA’s per-km rate: the figure above is what your employer can pay you tax-free. | CRA ਦੇ ਪ੍ਰਤੀ ਕਿ.ਮੀ. ਰੇਟ ’ਤੇ ਪੈਸੇ ਵਾਪਸ ਲੈਣ ਵਾਲੇ ਮੁਲਾਜ਼ਮ: ਉੱਪਰ ਦਿੱਤੀ ਰਕਮ ਤੁਹਾਡਾ ਮਾਲਕ ਤੁਹਾਨੂੰ ਟੈਕਸ-ਮੁਕਤ ਦੇ ਸਕਦਾ ਹੈ। | CRA ਦੇ ਪ੍ਰਤੀ ਕਿ.ਮੀ. ਰੇਟ ’ਤੇ ਪੈਸੇ ਵਾਪਸ ਲੈਣ ਵਾਲੇ ਮੁਲਾਜ਼ਮ: ਉੱਪਰ ਦਿੱਤੀ ਰਕਮ ਤੁਹਾਡਾ ਇੰਪਲਾਇਰ ਤੁਹਾਨੂੰ ਟੈਕਸ-ਮੁਕਤ ਦੇ ਸਕਦਾ ਹੈ। | Employer term resolved: ਮਾਲਕ is also "owner/master", which is ambiguous near vehicle ownership and sounds feudal. ਇੰਪਲਾਇਰ is the everyday diaspora word and is used in Canadian Punjabi media. |
| Employees: if your employer pays less than 55p a mile (or nothing), claim the difference with form P87 or on Self Assessment. You can go back 4 tax years. | ਮੁਲਾਜ਼ਮ: ਜੇ ਤੁਹਾਡਾ ਮਾਲਕ ਪ੍ਰਤੀ ਮੀਲ 55p ਤੋਂ ਘੱਟ ਦਿੰਦਾ ਹੈ (ਜਾਂ ਕੁਝ ਨਹੀਂ), ਤਾਂ ਫ਼ਰਕ form P87 ਨਾਲ ਜਾਂ Self Assessment ਵਿੱਚ ਕਲੇਮ ਕਰੋ। ਤੁਸੀਂ 4 ਟੈਕਸ ਸਾਲ ਪਿੱਛੇ ਤੱਕ ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। | ਮੁਲਾਜ਼ਮ: ਜੇ ਤੁਹਾਡਾ ਇੰਪਲਾਇਰ ਪ੍ਰਤੀ ਮੀਲ 55p ਤੋਂ ਘੱਟ ਦਿੰਦਾ ਹੈ (ਜਾਂ ਕੁਝ ਨਹੀਂ), ਤਾਂ ਫ਼ਰਕ form P87 ਨਾਲ ਜਾਂ Self Assessment ਵਿੱਚ ਕਲੇਮ ਕਰੋ। ਤੁਸੀਂ 4 ਟੈਕਸ ਸਾਲ ਪਿੱਛੇ ਤੱਕ ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। | Employer → ਇੰਪਲਾਇਰ. |
| Employees: unreimbursed mileage can’t be deducted on your federal return. Use your log to get paid back by your employer; a few states still allow a deduction. | ਮੁਲਾਜ਼ਮ: ਜਿਸ ਮਾਈਲੇਜ ਦੇ ਪੈਸੇ ਵਾਪਸ ਨਹੀਂ ਮਿਲੇ, ਉਹ federal ਰਿਟਰਨ ਵਿੱਚ ਕਟੌਤੀ ਨਹੀਂ ਹੋ ਸਕਦੀ। ਆਪਣੇ ਲੌਗ ਨਾਲ ਆਪਣੇ ਮਾਲਕ ਤੋਂ ਪੈਸੇ ਵਾਪਸ ਲਓ; ਕੁਝ ਸਟੇਟਾਂ ਹਾਲੇ ਵੀ ਕਟੌਤੀ ਦਿੰਦੀਆਂ ਹਨ। | ਮੁਲਾਜ਼ਮ: ਜਿਸ ਮਾਈਲੇਜ ਦੇ ਪੈਸੇ ਵਾਪਸ ਨਹੀਂ ਮਿਲੇ, ਉਸਦੀ ਕਟੌਤੀ ਫ਼ੈਡਰਲ ਰਿਟਰਨ ਵਿੱਚ ਨਹੀਂ ਲਈ ਜਾ ਸਕਦੀ। ਆਪਣੇ ਲੌਗ ਨਾਲ ਆਪਣੇ ਇੰਪਲਾਇਰ ਤੋਂ ਪੈਸੇ ਵਾਪਸ ਲਓ; ਕੁਝ ਸਟੇਟਾਂ ਹਾਲੇ ਵੀ ਕਟੌਤੀ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦੀਆਂ ਹਨ। | "federal" was left in Latin script (it's not a form name). "ਉਹ … ਕਟੌਤੀ ਨਹੀਂ ਹੋ ਸਕਦੀ" was ungrammatical. "ਕਟੌਤੀ ਦਿੰਦੀਆਂ" (give a deduction) is now "allow". Employer → ਇੰਪਲਾਇਰ. |
| Employees: with a signed T2200 from your employer, claim vehicle expenses on form T777. Otherwise, use your log to get reimbursed at the per-km rate. | ਮੁਲਾਜ਼ਮ: ਜੇ ਤੁਹਾਡੇ ਮਾਲਕ ਨੇ T2200 ’ਤੇ ਦਸਤਖ਼ਤ ਕੀਤੇ ਹਨ, ਤਾਂ form T777 ’ਤੇ ਗੱਡੀ ਦੇ ਖ਼ਰਚੇ ਕਲੇਮ ਕਰੋ। ਨਹੀਂ ਤਾਂ, ਆਪਣੇ ਲੌਗ ਨਾਲ ਪ੍ਰਤੀ ਕਿ.ਮੀ. ਰੇਟ ’ਤੇ ਪੈਸੇ ਵਾਪਸ ਲਓ। | ਮੁਲਾਜ਼ਮ: ਜੇ ਤੁਹਾਡੇ ਇੰਪਲਾਇਰ ਨੇ T2200 ’ਤੇ ਦਸਤਖ਼ਤ ਕਰਕੇ ਦਿੱਤਾ ਹੈ, ਤਾਂ form T777 ’ਤੇ ਗੱਡੀ ਦੇ ਖ਼ਰਚੇ ਕਲੇਮ ਕਰੋ। ਨਹੀਂ ਤਾਂ, ਆਪਣੇ ਲੌਗ ਨਾਲ ਪ੍ਰਤੀ ਕਿ.ਮੀ. ਰੇਟ ’ਤੇ ਪੈਸੇ ਵਾਪਸ ਲਓ। | Now "signed and given" (you hold the form). Employer → ਇੰਪਲਾਇਰ. |
| Employees: you can claim Mileage Allowance Relief on the difference between this total and any mileage allowance your employer paid you. | ਮੁਲਾਜ਼ਮ: ਇਸ ਕੁੱਲ ਰਕਮ ਅਤੇ ਤੁਹਾਡੇ ਮਾਲਕ ਵੱਲੋਂ ਦਿੱਤੇ ਮਾਈਲੇਜ ਭੱਤੇ ਦੇ ਫ਼ਰਕ ’ਤੇ ਤੁਸੀਂ Mileage Allowance Relief ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। | ਮੁਲਾਜ਼ਮ: ਇਸ ਕੁੱਲ ਰਕਮ ਅਤੇ ਤੁਹਾਡੇ ਇੰਪਲਾਇਰ ਵੱਲੋਂ ਦਿੱਤੇ ਮਾਈਲੇਜ ਭੱਤੇ ਦੇ ਫ਼ਰਕ ’ਤੇ ਤੁਸੀਂ Mileage Allowance Relief ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। | Employer → ਇੰਪਲਾਇਰ. |
| End is a saved place. | ਅੰਤ ਇੱਕ ਸੇਵ ਕੀਤੀ ਥਾਂ ਹੈ। | ਮੰਜ਼ਿਲ ਇੱਕ ਸੇਵ ਕੀਤੀ ਥਾਂ ਹੈ। | ਅੰਤ = "the ending", not an end point/location. ਮੰਜ਼ਿਲ = destination. |
| Start is a saved place. | ਸ਼ੁਰੂਆਤ ਇੱਕ ਸੇਵ ਕੀਤੀ ਥਾਂ ਹੈ। | ਸ਼ੁਰੂਆਤੀ ਪਤਾ ਇੱਕ ਸੇਵ ਕੀਤੀ ਥਾਂ ਹੈ। | ਸ਼ੁਰੂਆਤ = "the beginning", not a location. Now matches the Save-start button. |
| Save end as a place | ਅੰਤ ਨੂੰ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ | ਮੰਜ਼ਿਲ ਨੂੰ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ | Same start/end-point fix. |
| Save end as a place: {{name}} | ਅੰਤ ਨੂੰ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ: {{name}} | ਮੰਜ਼ਿਲ ਨੂੰ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ: {{name}} | Same start/end-point fix. |
| Save start as a place | ਸ਼ੁਰੂਆਤ ਨੂੰ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ | ਸ਼ੁਰੂਆਤੀ ਪਤਾ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ | Same start/end-point fix. |
| Save start as a place: {{name}} | ਸ਼ੁਰੂਆਤ ਨੂੰ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ: {{name}} | ਸ਼ੁਰੂਆਤੀ ਪਤਾ ਥਾਂ ਵਜੋਂ ਸੇਵ ਕਰੋ: {{name}} | Same start/end-point fix. |
| Finish later | ਬਾਅਦ ’ਚ ਖ਼ਤਮ ਕਰੋ | ਬਾਅਦ ਵਿੱਚ ਖ਼ਤਮ ਕਰੋ | Consistency: ’ਚ contraction → ਵਿੱਚ, as used everywhere else. |
| Start later | ਬਾਅਦ ’ਚ ਸ਼ੁਰੂ ਕਰੋ | ਬਾਅਦ ਵਿੱਚ ਸ਼ੁਰੂ ਕਰੋ | Consistency: ’ਚ → ਵਿੱਚ. |
| Get my report | ਮੇਰੀ ਰਿਪੋਰਟ ਲਓ | ਆਪਣੀ ਰਿਪੋਰਟ ਲਓ | "ਮੇਰੀ ਰਿਪੋਰਟ ਲਓ" mixed persons: it told the user to "take my report". |
| I’ll swipe each drive myself. | ਮੈਂ ਹਰ ਟ੍ਰਿਪ ਖ਼ੁਦ ਸਵਾਈਪ ਕਰਾਂਗਾ/ਕਰਾਂਗੀ। | ਤੁਸੀਂ ਹਰ ਟ੍ਰਿਪ ਖ਼ੁਦ ਸਵਾਈਪ ਕਰੋਗੇ। | Gendered ਕਰਾਂਗਾ/ਕਰਾਂਗੀ removed. The other work-style option details are descriptive, so this one is too, in second person (ਕਰੋਗੇ is gender-neutral). |
| Note (optional) | ਨੋਟ (ਮਰਜ਼ੀ ਨਾਲ) | ਨੋਟ (ਜ਼ਰੂਰੀ ਨਹੀਂ) | ਮਰਜ਼ੀ ਨਾਲ = "willingly / at will", not "optional". ਜ਼ਰੂਰੀ ਨਹੀਂ (= not required) is the clear everyday form. |
| Number plate (optional) | ਨੰਬਰ ਪਲੇਟ (ਮਰਜ਼ੀ ਨਾਲ) | ਨੰਬਰ ਪਲੇਟ (ਜ਼ਰੂਰੀ ਨਹੀਂ) | Optional → ਜ਼ਰੂਰੀ ਨਹੀਂ. |
| Optional | ਮਰਜ਼ੀ ਨਾਲ | ਜ਼ਰੂਰੀ ਨਹੀਂ | Optional → ਜ਼ਰੂਰੀ ਨਹੀਂ. |
| Optional. Shows your total driving and the business share on the report. | ਮਰਜ਼ੀ ਨਾਲ। ਰਿਪੋਰਟ ’ਤੇ ਤੁਹਾਡੀ ਕੁੱਲ ਡਰਾਈਵਿੰਗ ਅਤੇ ਬਿਜ਼ਨਸ ਹਿੱਸਾ ਦਿਖਾਉਂਦਾ ਹੈ। | ਜ਼ਰੂਰੀ ਨਹੀਂ। ਰਿਪੋਰਟ ’ਤੇ ਤੁਹਾਡੀ ਕੁੱਲ ਡਰਾਈਵਿੰਗ ਅਤੇ ਬਿਜ਼ਨਸ ਹਿੱਸਾ ਦਿਖਾਉਂਦਾ ਹੈ। | Optional → ਜ਼ਰੂਰੀ ਨਹੀਂ. |
| So trips read “Home → …” instead of a street name. Optional. | ਤਾਂ ਜੋ ਟ੍ਰਿਪਾਂ ’ਤੇ ਗਲੀ ਦੇ ਨਾਂ ਦੀ ਥਾਂ “ਘਰ → …” ਲਿਖਿਆ ਆਵੇ। ਮਰਜ਼ੀ ਨਾਲ। | ਤਾਂ ਜੋ ਟ੍ਰਿਪਾਂ ’ਤੇ ਗਲੀ ਦੇ ਨਾਂ ਦੀ ਥਾਂ “ਘਰ → …” ਲਿਖਿਆ ਆਵੇ। ਜ਼ਰੂਰੀ ਨਹੀਂ। | Optional → ਜ਼ਰੂਰੀ ਨਹੀਂ. |
| Trips then read “Home → Work” instead of street names, and commutes are flagged for you. Both are optional. | ਫਿਰ ਟ੍ਰਿਪਾਂ ’ਤੇ ਗਲੀਆਂ ਦੇ ਨਾਂ ਦੀ ਥਾਂ “ਘਰ → ਕੰਮ” ਲਿਖਿਆ ਆਉਂਦਾ ਹੈ, ਅਤੇ ਘਰ-ਕੰਮ ਆਉਣ-ਜਾਣ ਆਪਣੇ-ਆਪ ਪਛਾਣਿਆ ਜਾਂਦਾ ਹੈ। ਦੋਵੇਂ ਮਰਜ਼ੀ ਨਾਲ। | ਫਿਰ ਟ੍ਰਿਪਾਂ ’ਤੇ ਗਲੀਆਂ ਦੇ ਨਾਂ ਦੀ ਥਾਂ “ਘਰ → ਕੰਮ” ਲਿਖਿਆ ਆਉਂਦਾ ਹੈ, ਅਤੇ ਘਰ-ਕੰਮ ਆਉਣ-ਜਾਣ ਆਪਣੇ-ਆਪ ਪਛਾਣਿਆ ਜਾਂਦਾ ਹੈ। ਦੋਵੇਂ ਜ਼ਰੂਰੀ ਨਹੀਂ। | Optional → ਜ਼ਰੂਰੀ ਨਹੀਂ. |
| Sort this week’s drives and bank the deduction. Done in a minute. | ਇਸ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਕਟੌਤੀ ਆਪਣੇ ਖਾਤੇ ਪਾਓ। ਇੱਕ ਮਿੰਟ ਦਾ ਕੰਮ। | ਇਸ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਕਟੌਤੀ ਪੱਕੀ ਕਰੋ। ਇੱਕ ਮਿੰਟ ਦਾ ਕੰਮ। | "ਕਟੌਤੀ ਆਪਣੇ ਖਾਤੇ ਪਾਓ" back-translates as "put the deduction in your (bank) account". That is a cash promise stronger than the idiom. ਪੱਕੀ ਕਰੋ = secure / lock in. |
| Sort your drives and add any you missed before {{date}}. Every business kilometre is money back. | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਕਿਲੋਮੀਟਰ ਦੇ ਪੈਸੇ ਵਾਪਸ ਬਣਦੇ ਹਨ। | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਕਿਲੋਮੀਟਰ ਦਾ ਮਤਲਬ ਹੈ ਪੈਸੇ ਵਾਪਸ। | "ਪੈਸੇ ਵਾਪਸ ਬਣਦੇ ਹਨ" = "money back is owed", which states an entitlement and is stronger than the English. Now mirrors "is money back". |
| Sort your drives and add any you missed before {{date}}. Every business mile is money back. | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਮੀਲ ਦੇ ਪੈਸੇ ਵਾਪਸ ਬਣਦੇ ਹਨ। | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਮੀਲ ਦਾ ਮਤਲਬ ਹੈ ਪੈਸੇ ਵਾਪਸ। | Same as the km line. |
| Trades, sales, care, office. Drives in your hours are business. | ਟਰੇਡ, ਸੇਲਜ਼, ਕੇਅਰ, ਦਫ਼ਤਰ। ਤੁਹਾਡੇ ਘੰਟਿਆਂ ਵਿੱਚ ਟ੍ਰਿਪ ਬਿਜ਼ਨਸ ਹਨ। | ਟਰੇਡ, ਸੇਲਜ਼, ਕੇਅਰ, ਦਫ਼ਤਰ। ਤੁਹਾਡੇ ਕੰਮ ਦੇ ਘੰਟਿਆਂ ਵਿੱਚ ਹੋਏ ਟ੍ਰਿਪ ਬਿਜ਼ਨਸ ਹਨ। | "your hours" is now "your work hours" (bare ਤੁਹਾਡੇ ਘੰਟਿਆਂ was vague). ਹੋਏ added for grammar. |
| Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber. Car, van, moped or bike. | Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber। ਕਾਰ, ਵੈਨ, ਮੋਪੇਡ ਜਾਂ ਬਾਈਕ। | Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber। ਕਾਰ, ਵੈਨ, ਮੋਪੇਡ ਜਾਂ ਸਾਈਕਲ। | "bike" here is a bicycle: the vehicle choices in welcome.tsx are car/motorbike/bicycle, and the moped already covers motorbikes. In Punjabi, ਬਾਈਕ normally means a motorbike. |

## Unresolved / for the third check

1. **Apple's official Punjabi iOS strings: not verified.** I cannot confirm from memory exactly what an iPhone set to ਪੰਜਾਬੀ shows. Nothing is changed, and the translator's forms remain:
   - ਹਮੇਸ਼ਾਂ (Always): I kept the tippi spelling. It is the standard (Punjabi University) spelling and the one Google's Punjabi UI uses. If Apple ships ਹਮੇਸ਼ਾ, change it in all 9 places.
   - ਟਿਕਾਣਾ (Location), ਸੈਟਿੰਗਾਂ (Settings), ਸੂਚਨਾਵਾਂ (Notifications): these are standard and the most likely forms.
   - "Allow While Using App" (ਐਪ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਸਮੇਂ ਇਜਾਜ਼ਤ ਦਿਓ) and "Change to Always Allow" (ਹਮੇਸ਼ਾਂ ਇਜਾਜ਼ਤ ਦੇਣ ’ਤੇ ਬਦਲੋ): Apple might use ਆਗਿਆ instead of ਇਜਾਜ਼ਤ (Android's Punjabi does). "Never" might be ਕਦੇ ਵੀ ਨਹੀਂ.
   - **Action:** someone with an iPhone set to Punjabi should check these lines against the location-permission pop-up and Settings → Privacy → Location: ALLOW LOCATION ACCESS, Always, Never, While Using the App, Ask Next Time Or When I Share, Open Settings, Settings → Notifications.
2. **The glossary is now out of date on two points:** employer (ਮਾਲਕ → ਇੰਪਲਾਇਰ) and "optional" (ਜ਼ਰੂਰੀ ਨਹੀਂ, a term not listed). Unsure items 2–4 can now be closed. I did not edit `glossary/pa.md` because my brief limits me to `pa.ts` and this report.
3. **Plural `one` covers 0 in pa.** For example, "0 ਟ੍ਰਿਪ ਲੌਕ ਹੈ" uses the singular verb. That is grammatical in Punjabi, so nothing changed.
4. **Minor wording left as is:** "Business errand" = ਬਿਜ਼ਨਸ ਦਾ ਕੰਮ and "Set up auto-logging" = ਆਟੋ-ਦਰਜ ਸੈੱਟ ਕਰੋ are both understandable. The third check could polish them.
