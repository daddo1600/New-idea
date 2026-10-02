# Translation brief

MileMint is an iPhone app that logs work drives automatically and works out what they're worth at tax time. Its users drive for work in the UK, US, Canada and Australia:
- delivery couriers (Uber Eats, Deliveroo, Amazon Flex, Evri, DPD);
- tradespeople, carers and sales reps.

Many of them speak your language at home and use English at work. Write the way a friendly, competent local app would talk to them.

## What to translate

- **Source:** `src/i18n/source-keys.json` lists every English line (`key`) with the files that use it. Look in those files when a line is unclear. `src/i18n/TRANSLATOR-NOTES.md` explains short or ambiguous lines.
- **Output:** `src/i18n/locales/<code>.ts`, a `Dictionary` (see `src/i18n/i18n.ts`) mapping **every** key to its translation. Keep the file's existing `import type` and `export default` shape.
  - Write it with a small Node script from a JSON object so the quoting is always right.
  - Keep the dictionary keys exactly as in `source-keys.json`, including curly quotes ’ “ ” and emoji.

## Rules

1. **Meaning first.** Natural, plain, everyday language at about a reading age of 12. No word-for-word translation and no machine-translation tone.
2. **Placeholders** like `{{count}}`, `{{amount}}` and `{{year}}` must appear in the translation exactly as in the key: same names, same braces, none added or dropped. Move them wherever your grammar needs them.
3. **`<b>…</b>` tags** must stay, around the matching words.
4. **Plurals:**
   - Give a plural object for every key that contains `{{count}}`, and for keys whose notes say a `count` is passed (for example `{{distance}} miles`), using your language's CLDR categories: `{ one: '…', few: '…', many: '…', other: '…' }` (only the categories your language has; `other` is always required).
   - Check the categories with `new Intl.PluralRules('<code>').resolvedOptions().pluralCategories`.
   - Every form keeps the same placeholders.
5. **Keep in English** (a short gloss in brackets is fine where it helps):
   - names: MileMint, MileMint Pro, "Pro" (the plan name);
   - tax offices: HMRC, IRS, CRA, ATO;
   - official form and scheme names: Self Assessment, Making Tax Digital/MTD, Schedule C, Form 1040, 1040-ES, T2125, T2200, T777, P87, BAS, PAYG, GST, D1, "simplified expenses", "cents per km method";
   - delivery apps (Uber Eats, Deliveroo, Amazon Flex, Evri, DPD, Uber) and car models in examples (Golf, Honda PCX).
6. **iOS's own wording.** Lines that quote iOS buttons or Settings must use Apple's official wording in your language, as an iPhone set to it shows them, so the words match what's on screen. These include "Allow While Using App", "Change to Always Allow", "Allow Once", "Keep Only While Using", "Always", "While Using the App", "Never", "Ask Next Time Or When I Share", "Location", "Open Settings", "ALLOW LOCATION ACCESS" and "Settings → Notifications". If you aren't sure of Apple's wording, give your best translation and list it under **Unsure** in your glossary file.
7. **Length.** Button labels, tabs, badges and small labels must stay about as short as the English. Keep them about 1.3× the English length or less, and shorter where the notes say "keep short".
8. **Tone.** Warm, light and encouraging, never childish.
   - Jokes and puns (the weekly reminders, cheers and season greetings) must be **adapted** into something that works in your language and culture. A different joke with the same feeling is better than a literal one that falls flat.
   - Nothing rude, sexual, religious, political, or about national or ethnic identity.
   - No slang that could offend or that only one region understands.
9. **Money and tax.** Say "estimated" where the English does, and never promise a tax saving. Translate "deduction", "claim" and "business mileage" with the standard everyday terms people in your language would understand.
10. **Consistency.** Choose one term for each key concept and use it everywhere: drive/trip, work (the drive type; "business" only for tax terms, see TRANSLATOR-NOTES.md), personal, shift, tax year, mileage rate, report, Pro, free plan, "sort" (mark a trip work or personal), "swipe".

## Also write

`src/i18n/glossary/<code>.md` with:
- your term choices, as a table of English, your term and why;
- the form of address you used;
- an **Unsure** list: lines you weren't confident about, for the reviewers.

## Check before finishing

- `npx jest src/i18n` must pass for your language. It checks every key is present, placeholders match, and nothing is empty.
- Then re-read every line once more against the English.
