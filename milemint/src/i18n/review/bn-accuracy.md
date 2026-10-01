# Bengali (bn): accuracy review (check 2 of 3)

Reviewer: independent Bengali↔English reviewer. Method: each line was back-translated into English on its own, then compared with the key. Where a line was unclear, I checked the source file listed in `source-keys.json`.

## Scope

- **Lines checked:** all 662 entries in `src/i18n/locales/bn.ts`, including every form of each plural object.
- **Lines changed:** 31 (15 distinct fixes; the "Always" fix and the delivery-app share fix each cover several lines).
- **Tests:** `npx jest src/i18n` passes. Placeholders, `<b>` tags and plural objects are unchanged.

Overall the translation is accurate and natural. No placeholder, number or unit errors were found. Tax and money lines keep "estimated" (আনুমানিক) and "Not tax advice" (ট্যাক্স পরামর্শ নয়). The main issue types were:

- iOS wording: "Always" and "Notifications".
- One ambiguous pronoun.
- Wrong word senses: digit vs number, and "missed" vs "forgot".
- One slightly stronger money promise.
- Small grammar and label-form fixes.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| Always (and the 11 other lines that quote “Always” or “Change to Always Allow”: Choose “Always”; Continue without “Always”; In Settings, under Allow Location Access, choose Always; iOS asks twice…; iOS only offers “Always”…; Location is set to “While Using”…; MileMint needs location access set to “Always”…; Set location to “Always”…; Tap “Change to Always Allow”; Tap <b>Allow While Using App</b>…; Without “Always”…) | সর্বদা | সবসময় | Apple's Bengali UI writes in plain, everyday register (it uses লোকেশন and নোটিফিকেশন). সবসময় is the everyday word, and it's what Bengali Android shows (সবসময় অনুমতি দিন). সর্বদা is literary and above reading age 12. It also matches "Always free" (সবসময় ফ্রি) elsewhere in the app. I couldn't see the exact iOS string (see Unresolved). |
| Notifications are off for MileMint. Turn them on in iPhone Settings → Notifications. | …বিজ্ঞপ্তি বন্ধ আছে। iPhone-এর সেটিংস → বিজ্ঞপ্তি-তে… | …নোটিফিকেশন বন্ধ আছে। iPhone-এর সেটিংস → নোটিফিকেশন-এ… | Apple's own Bengali iPhone User Guide uses "নোটিফিকেশন" (for example the page titled "iPhone-এ একটি ফোকাসের জন্য নোটিফিকেশন আসার অনুমতি দিন"), so the on-screen menu name should match. |
| Tell MileMint your work hours once and it sorts most drives for you. Takes 30 seconds. | …বেশিরভাগ ট্রিপ ও নিজেই বাছাই করে দেবে। | …বেশিরভাগ ট্রিপ MileMint নিজেই বাছাই করে দেবে। | After "ট্রিপ", the "ও" (meant as "it") reads as "also": "most trips also sort themselves". I named the subject instead. |
| {{distance}} is more than one trip should be. Check for an extra digit. | কোনো বাড়তি সংখ্যা আছে কি না দেখুন। | কোনো অঙ্ক বেশি পড়ে গেছে কি না দেখুন। | সংখ্যা means "number", so the old line read "check for an extra number". The meaning is an extra *digit* typed by mistake (অঙ্ক বেশি পড়া). |
| My delivery app counted … that's {{extra}} km/miles (about {{amount}}) I'd have missed claiming. … (6 lines: km/miles × week/month/last month) | …দাবি করতে আমি ভুলেই যেতাম। | …যা দাবি থেকে আমার বাদ পড়ে যেত। | The old line back-translated as "I would have forgotten to claim". The point is that the delivery app never counted those miles, not that the user forgot. The new line says "which would have been left out of my claim". |
| Sort this week’s drives and bank the deduction. Done in a minute. | …ট্যাক্স ছাড় নিশ্চিত করুন। | …ট্যাক্স ছাড়ের হিসাব পাকা করে রাখুন। | "নিশ্চিত করুন" reads as "guarantee the deduction", which is a stronger promise than the brief allows. The new wording is "lock in your deduction figures". |
| A quick (slightly cheeky) reminder each Sunday evening … so nothing goes unclaimed. | যাতে কিছুই দাবি করা বাকি না থাকে। | যাতে দাবি করতে কিছুই বাদ না পড়ে। | The old wording was ambiguous: it could mean "so nothing remains to be claimed". The new one says "so nothing is left out of your claim". |
| Every drive is logged and unlocked. Thanks for supporting MileMint. | প্রতিটি ট্রিপ রেকর্ড আর আনলক করা। | প্রতিটি ট্রিপ রেকর্ড হয় আর আনলক থাকে। | Grammar. "রেকর্ড আর আনলক করা" reads as the noun "record" plus a participle. |
| Individuals: enter the deduction as Work-related car expenses (D1)… | ব্যক্তি: … | ব্যক্তি করদাতা (individual): … | "ব্যক্তি:" on its own reads as "Person:". It's now an individual taxpayer, the counterpart of "একক ব্যবসায়ী (sole trader)" in the same line. |
| Making Tax Digital: if your self-employed and property income is over £50,000… | আপনার স্বনিযুক্ত (self-employed) আর প্রপার্টি থেকে আয় | স্বনিযুক্ত (self-employed) কাজ আর প্রপার্টি থেকে আপনার আয় | Grammar. "স্বনিযুক্ত" is an adjective for a person, so the old line read "your self-employed and income from property". |
| Trips already logged in it keep it in their record. | এতে আগে রেকর্ড হওয়া ট্রিপের রেকর্ডে এটি থেকে যাবে। | এটি দিয়ে আগে রেকর্ড হওয়া ট্রিপগুলোর রেকর্ডে এর নাম থেকে যাবে। | This is the "Remove vehicle?" alert (settings.tsx). "এতে" means "in this", which is odd for a vehicle. Changed to "with this vehicle", and the line now says what stays: its name. |
| Start of {{year}} | {{year}}-এর শুরুতে | {{year}}-এর শুরু | A field label above the odometer input (report.tsx), so a noun ("Start of 2025/26") fits, not "at the start of". |
| End of {{year}} | {{year}}-এর শেষে | {{year}}-এর শেষ | Same reason as "Start of {{year}}". |
| Free to start | ফ্রিতে শুরু করুন | ফ্রিতে শুরু | A heading over a plan description (welcome.tsx), not a button. The imperative "Start for free" read like a call to action. |
| {{hours}}h {{minutes}}m | {{hours}}ঘ {{minutes}}মি | {{hours}} ঘ. {{minutes}} মি. | A bare "ঘ" isn't a recognised abbreviation. "ঘ." and "মি." with abbreviation dots are the standard short forms, and they stay short enough for the shift pill. |

## Unsure list: resolutions

| # | Item | Resolution |
|---|---|---|
| 1 | Allow While Using App = অ্যাপ ব্যবহার করার সময় অনুমতি দিন | **Kept.** This is the natural wording and parallels Android's. The exact iOS string couldn't be verified. |
| 2 | Change to Always Allow | **Now "সবসময় অনুমতি দিন-এ পরিবর্তন করুন".** The structure is kept, and সবসময় replaces সর্বদা. Still unverified against a device. |
| 3 | Always: সর্বদা vs সবসময় | **Changed to সবসময়** everywhere, for the reasons in the table. Unverified. |
| 4 | While Using the App | **Kept** (অ্যাপ ব্যবহার করার সময়). |
| 5 | Never = কখনও না | **Kept.** It's natural. Apple may write "কখনই না", so this needs a check on a device. |
| 6 | Ask Next Time Or When I Share | **Kept.** |
| 7 | ALLOW LOCATION ACCESS | **Kept** (লোকেশন অ্যাক্সেসের অনুমতি দিন). |
| 8 | Location: অবস্থান vs লোকেশন | **Resolved: লোকেশন.** Apple's Bengali iPhone User Guide uses লোকেশন in its page titles, for example "iPhone-এ লোকেশন অনুযায়ী ছবি এবং ভিডিও ব্রাউজ করা". |
| 9 | Open Settings = সেটিংস খুলুন | **Kept.** Apple's Bengali guide uses "সেটিংস". |
| 10 | Settings → Notifications | **Resolved: সেটিংস → নোটিফিকেশন**, based on Apple's Bengali guide page titles. |
| 11 | Done = সম্পন্ন, Back = পিছনে | **Kept.** Both are clear and short. Unverified against iOS. |
| 12 | Private = গোপনীয়, Worth money = আর্থিক মূল্য | **Kept.** Both are accurate as short headings, and the body text under each makes them concrete. |
| 13 | {{hours}}h {{minutes}}m | **Changed** (see the table). |
| 14 | কেয়ার | **Kept.** It's understood in UK usage, and the line also says "Drives in your hours are business", which adds context. |
| 15 | শরৎ for autumn | **Kept.** |
| 16 | বৃহঃ | **Kept.** It's the standard calendar abbreviation. |

## Unresolved

- **The exact iOS 18.4+ Bengali strings** for Always, Allow While Using App, Change to Always Allow, Never, Ask Next Time Or When I Share, ALLOW LOCATION ACCESS, Done and Back. I couldn't reach Apple's localisation strings from this environment: support.apple.com and applelocalization.com were blocked, and search only returned page titles. "লোকেশন" and "নোটিফিকেশন" are confirmed from Apple Bengali guide titles; the rest are best guesses. **Check 3 should screenshot a Bengali iPhone's location prompt and the Settings → MileMint → Location screen**, then align the 12 "Always" lines and the two bold-tagged prompt lines.
- **Optional wording, not changed:**
  - "Swipe this week’s trips … see what you’ve earned back" (দেখুন কত টাকা ফেরত পেলেন) states the money as already received. That's close to the English "earned back", so I left it.
  - "Employees reimbursed at CRA’s per-km rate: …" mixes third person and আপনি. It's accurate but slightly stiff.

## Round 3: logbook, P87, privacy and backup (October 2026)

- **Lines added:** 201 new keys in `src/i18n/locales/bn.ts` (189 plain lines, 12 plural objects with `one`/`other`).
- **Method:** each new line was back-translated into English cold, then compared with the key. Short or unclear lines were checked in their source files (`app/claim-relief.tsx`, `app/logbook.tsx`, `app/settings.tsx`, `app/welcome.tsx`, `app/index.tsx`, `domain/privacy.ts`, `milestones/copy.ts`, `backup/copy.ts`).
- **Checked:** placeholders (including `{{employerRate}}`, `{{limit}}`, `{{first}}`/`{{last}}`, `{{week}}`/`{{weeks}}`), numbers and units (10,000 miles, 5,000 km, 12 weeks, 4 earlier years, 5 years, 20%/40% bands via `{{percent}}`), caveats (প্রায়/আনুমানিক and "ট্যাক্স পরামর্শ নয়" kept wherever the English has them), and that P87 "relief" is never presented as a refund of the whole amount. Only the tax on it is "ফেরত", and always with প্রায়/আনুমানিক.
- **Kept in English:** ATO, HMRC, P87, P60, PAYE, Self Assessment, National Insurance, GOV.UK, Government Gateway, iCloud, iCloud Drive, iCloud Keychain, Mileage Allowance Relief, cents per km method, and the stored trip label “Client visit · …” (it's saved and exported in English, so the quote in the add-trip alert matches what the user sees).
- **Tests:** `npx jest src/i18n/__tests__/completeness.test.ts -t "bn "` passes (3/3).

| English | Before | After | Why |
|---|---|---|---|
| Paid by your employer | নিয়োগকর্তা দিয়েছেন | নিয়োগকর্তার দেওয়া | It's a row label above an amount in the P87 summary. The first draft was a full clause ("the employer gave"). The noun phrase ("paid by the employer") reads as a label. |
| Keep a logbook for 12 weeks in a row. … One logbook lasts 5 years. | একটি লগবুক 5 বছর চলে। | একটি লগবুক 5 বছর কাজে লাগে। | "চলে" can be read as "the logbook runs for 5 years", which contradicts the 12 weeks in the same paragraph. "কাজে লাগে" ("is usable for") is the intended meaning. |
