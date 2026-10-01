# Hindi (hi): meaning-accuracy review (check 2 of 3)

**Scope.** I back-translated all 662 entries in `src/i18n/locales/hi.ts` into English, then compared each one with its key. For lines with ambiguous wording I checked how the code uses them: `domain/reminders.ts` (which titles go with which bodies), `app/index.tsx` (the "Driving:" chip), `app/milestones.tsx`, `referral/links.ts`, `components/launch-intro.tsx` and `app/settings.tsx` (the delete/remove alerts).

**Result.** I changed 29 lines. After the changes, keys, placeholders, `<b>` tags and plural objects are all unchanged, and `npx jest src/i18n` passes (30/30).

## Main finding: "deduction" changed from टैक्स छूट to टैक्स कटौती

I changed this everywhere it appears (13 lines). टैक्स छूट means exemption, rebate or relief: in everyday reading it means tax you don't have to pay at all. That is a stronger promise than "deduction" (an amount taken off taxable profit), and rule 9 of the brief forbids it. कटौती is the official Hindi term (it's the word used for 80C deductions on Indian tax forms). With "टैक्स" in front of it, it doesn't read as a pay cut.

There's also a clash: छूट is already used all over the file in the sense of "missed" (छूटी ट्रिप, ऐप से छूट गए, मुझसे छूट जाता). Using it for deduction as well would muddle the two meanings.

**For the glossary owner:** `glossary/hi.md` still lists "deduction | टैक्स छूट". I wasn't allowed to edit that file, so it needs updating to टैक्स कटौती. The negative form "can't be deducted" stays as घटाया नहीं जा सकता.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| New to Pro? Your first month is on me: {{url}} | Pro नया है? … | Pro पहली बार ले रहे हैं? … | **Wrong meaning.** The old line asked "Is Pro new?" The English asks whether the reader is new to Pro. |
| Uber Eats, … Uber. Car, van, moped or bike. | …मोपेड या बाइक। | …मोपेड या साइकिल। | In Hindi, बाइक means motorbike. Here "bike" means a bicycle (the notes say the same for "My bike"). |
| Name, e.g. Cargo bike | नाम, जैसे कार्गो बाइक | नाम, जैसे कार्गो साइकिल | Same reason: a cargo bike is a bicycle. |
| My delivery app counted … km (last month / this month / this week) … MileMint logs every mile automatically. (3 lines) | …MileMint हर ट्रिप अपने-आप लॉग करता है। | …MileMint हर किलोमीटर अपने-आप लॉग करता है। | "Every mile" had become "every trip". The km versions now say kilometre, to match the rest of the line. |
| {{distance}} km/miles · a typical month of business driving (2 lines) | आम तौर पर एक महीने की बिज़नेस ड्राइविंग | एक आम महीने की बिज़नेस ड्राइविंग | The old text read as "usually one month's driving". The English means "a typical month". |
| {{distance}} of business driving | {{distance}} बिज़नेस ड्राइविंग | {{distance}} की बिज़नेस ड्राइविंग | "Of" was missing. It now reads naturally under the big number. |
| +{{amount}} since you last looked | पिछली बार से +{{amount}} | पिछली बार देखने के बाद से +{{amount}} | "Looked" was missing. |
| 40 automatic drives a month (a whole shift counts as one), … | (पूरी शिफ्ट एक गिनी जाती है) | (पूरी शिफ्ट एक ट्रिप गिनी जाती है) | Without a noun, "one" what? was unclear. |
| A quick Sunday reminder … Turn it off any time in Settings. | इसे सेटिंग्ज़ में कभी भी बंद करें। | इसे कभी भी सेटिंग्ज़ में बंद कर सकते हैं। | The old text read as an instruction to turn it off. The English means "you can turn it off". |
| Ends {{date}} | खत्म: {{date}} | {{date}} को खत्म | More natural. Reads as "ends on {{date}}". |
| Every trip with date, places, km/miles, purpose and deduction. Opens in Excel … (2 lines) | …टैक्स छूट के साथ। Excel… में खुलती है। | …टैक्स कटौती के साथ। फ़ाइल Excel… में खुलती है। | Deduction term. Also, the subject of "opens" read as "every trip". It now says the file opens. |
| Light on battery | बैटरी कम खर्च | कम बैटरी खर्च | The old word order was ungrammatical. The new version means "low battery use". |
| A ready-to-file report … the deduction at each {{authority}} rate … (2 lines) | टैक्स छूट | टैक्स कटौती | Deduction term. |
| Commute between home and work isn’t deductible. | …टैक्स छूट में नहीं गिना जाता। | …टैक्स कटौती में नहीं गिना जाता। | Deduction term. |
| Deductions found in {{year}} / … tax year (2 lines) | …मिली टैक्स छूट | …मिली टैक्स कटौती | Deduction term. |
| Employees: unreimbursed mileage … a few states still allow a deduction. | …कुछ राज्यों में अब भी इसकी छूट मिलती है। | …कुछ राज्यों में अब भी इसे घटाया जा सकता है। | The old text read as "a few states exempt it". The new version reuses the verb from the first sentence. |
| Files are shared … Deductions are estimates, not tax advice. | टैक्स छूट सिर्फ़ अनुमान है… | टैक्स कटौती के आँकड़े सिर्फ़ अनुमान हैं… | Deduction term, with a plural that agrees. |
| Includes {{amount}} from home ↔ work commutes, which usually aren’t deductible. | …टैक्स छूट में नहीं गिने जाते। | …टैक्स कटौती में नहीं गिने जाते। | Deduction term. |
| Individuals: enter the deduction as Work-related car expenses (D1) … | टैक्स छूट को… | टैक्स कटौती को… | Deduction term. |
| Parking fees and tolls … can be deducted on top of the standard mileage rate. | …टैक्स छूट में जोड़े जा सकते हैं। | …टैक्स कटौती में जोड़े जा सकते हैं। | Deduction term. |
| Self-employed: enter business, commuting … and the deduction on line 9 … | …और टैक्स छूट लाइन 9… | …और टैक्स कटौती लाइन 9… | Deduction term. |
| Sort this week’s drives and bank the deduction. Done in a minute. | …और टैक्स छूट का हिसाब जोड़ लें। | …और टैक्स कटौती पक्की करें। | Deduction term. "Bank" means to secure or lock in, which पक्की करें captures. The old phrase meant "add up the calculation". |
| Worth up to {{amount}} in deductions if they were for business. | …टैक्स छूट में… | …टैक्स कटौती में… | Deduction term. |

## Checked and kept

- **iOS strings.** I kept the translator's versions: ऐप का उपयोग करते समय अनुमति दें; हमेशा अनुमति दें में बदलें; ऐप का उपयोग करते समय; हमेशा; कभी नहीं; स्थान; सेटिंग्ज़ / सेटिंग्ज़ खोलें; सूचनाएँ; Apple खाता. These match Apple's Hindi wording as I know it. Apple spells Settings सेटिंग्ज़ (with the nukta), and uses सूचनाएँ, स्थान and Apple खाता. They are also used the same way in every line that quotes them (for example "Tap “Location”" and "Choose “Always”").
- **"Driving:"** (चला रहे हैं:). This is the label in front of the vehicle chip ("चला रहे हैं: 🚗 Golf ▾"). It's clear and short.
- **Reminder pairs.** "Your miles called" with "…कह रहे थे" (miles is masculine, so the agreement is right), and "Every business mile counts" with "सच में, हमने गिन भी लिए हैं" both read correctly as pairs.
- **Softened money lines.** "Plot twist: driving pays", "See what each business drive saves you…" (कितनी कीमत है) and "That’s real money back" (असली पैसों की बात) are a little softer than the English. That's acceptable under rule 9, so I kept them.
- **Translator's Unsure list, items 4–9** ("Best value" सबसे किफ़ायती, पैसों की बात, जोड़ें / अभी चुनें, अभी इस्तेमाल में, कारीगर). All are acceptable, so I kept them.
- **Item 2, टैक्स वर्ष.** I kept it. It's used consistently.

## Unresolved

1. **iOS Hindi strings couldn't be checked against a device or Apple's sites.** The network proxy blocks support.apple.com, apple.com and applelocalization.com. The least certain are:
   - "Ask Next Time Or When I Share" (अगली बार या जब मैं शेयर करूँ तब पूछें). Apple may order the words differently, for example अगली बार पूछें या जब मैं शेयर करूँ.
   - The "ALLOW LOCATION ACCESS" section header (स्थान ऐक्सेस की अनुमति दें).
   - "Change to Always Allow". Apple may put quote marks around हमेशा अनुमति दें.

   The third reviewer should check these on an iPhone set to Hindi.
2. **Glossary.** `glossary/hi.md` still says "deduction → टैक्स छूट". It needs updating to टैक्स कटौती.
3. **"I’ll swipe each drive myself."** The translation, हर ट्रिप मुझे खुद स्वाइप करनी है, says "have to" rather than "will". The translator chose it to keep the line gender-neutral. A gender-neutral "will" form isn't possible without rewording, so I left it.

## Round 3: logbook, P87, privacy and backup (October 2026)

**Scope.** I back-translated all 201 new lines (12 of them plural objects with `one`/`other`) into English without looking at the source, then compared each one with its key. For short or unclear lines I checked the code: `app/claim-relief.tsx` (hero card, per-year rows), `app/index.tsx` (employee hero card and unclaimed-relief nudge), `app/logbook.tsx` (status badge, "End early" alert and link), `app/settings.tsx` (backup, privacy and mileage-pay sections), `app/welcome.tsx`, `domain/privacy.ts` and `backup/copy.ts`.

**What I checked on every line:**
- Placeholders, `{{count}}` plural objects and numbers (10,000 miles, 5,000 km, 12 weeks, 4 tax years, 5 years, four backups) are all present and unchanged.
- P87 money honesty: "relief" (राहत, the shortfall) and "tax back" (टैक्स वापस / टैक्स वापसी, the 20%/40% of it) stay two different things everywhere; every "about"/"estimated" is kept (लगभग / अनुमानित / अनुमान); "Not tax advice" is kept.
- Kept in English: ATO, HMRC, P87, PAYE, P60, Self Assessment, GOV.UK, Government Gateway, National Insurance, iCloud, iCloud Drive, iCloud Keychain, "cents per km method", and the new "logbook method" (same treatment as cents per km method, see glossary).
- The privacy label “Client visit · area” stays English in the add-trip line, because `domain/privacy.ts` saves the label in English (“Client visit · Leeds LS6”), so that is what the user will see on the trip.
- Lines about the user stay gender-neutral (e.g. "I visit clients…" → मेरे काम में … घर जाना होता है; "You drive your own vehicle…" → अपनी गाड़ी से ड्राइविंग).

**Result.** 7 lines changed. `npx jest src/i18n/__tests__/completeness.test.ts -t "hi "` passes (3/3).

| English | Before | After | Why |
|---|---|---|---|
| End the logbook early? | लॉगबुक पहले ही खत्म करें? | लॉगबुक समय से पहले खत्म करें? | पहले ही back-translates as "end it already?". समय से पहले is "before its time" = early. |
| The ATO needs 12 weeks in a row. A logbook ended early can’t be used… | पहले खत्म की गई लॉगबुक … | समय से पहले खत्म की गई लॉगबुक … | Same ambiguity: पहले खत्म की गई can read "ended earlier/previously". |
| End early | पहले खत्म करें | अभी खत्म करें | Button in the alert and a link on the logbook card. पहले खत्म करें can read "end it first". अभी खत्म करें ("end it now") is unambiguous and the alert explains the consequence. |
| Ended early | पहले खत्म हुई | समय से पहले खत्म | Status badge; same ambiguity ("ended before"). |
| Optional. Add what the car costs to run … (your best estimate is fine for now) … | (अभी के लिए अंदाज़ा भी चलेगा) | (अभी के लिए आपका सबसे अच्छा अंदाज़ा भी चलेगा) | अंदाज़ा alone reads as "a guess"; the English asks for the best estimate. |
| Restore the backup from {{date}} with {{count}} trip(s). … replaced by the ones in the backup. | … बैकअप वाली से बदल जाएँगी। | … बैकअप वाली चीज़ों से बदल जाएँगी। | बैकअप वाली with no noun back-translated as "by the backup one" (singular, feminine). चीज़ों covers trips, places, vehicles and settings. |
| This backup is locked with a key from your iCloud Keychain … wait a minute, then try again. | एक मिनट रुकें, फिर से कोशिश करें। | एक मिनट रुकें, और फिर से कोशिश करें। | The "then" (sequence) was lost; the steps read as alternatives. |

**Checked and kept**
- "Mileage Allowance Relief you can claim" / "Relief to claim" → क्लेम करने लायक …: "claimable", no refund promise; the amount below it is the relief, not money back.
- "HMRC … refunds earlier years" → पिछले सालों के लिए टैक्स रिफ़ंड देता है: names the tax, so it doesn't read as refunding the whole relief.
- "Your employer paid {{amount}} more … taxable pay" → टैक्स लगने वाली तनख्वाह: correct.
- "{{amount}} of business mileage logged" (milestone): {{amount}} is money, so {{amount}} का बिज़नेस माइलेज ("business mileage worth {{amount}}") is right.
- The share text says हर ट्रिप गिनी गई instead of "every mile", per the glossary rule for lines shown in every country.
