# Punjabi (pa): cultural and UX-copy review (check 3 of 3)

**Scope.** I read all 662 entries in `src/i18n/locales/pa.ts` against the English, the brief, the translator notes, the glossary and the accuracy review. Where a line's meaning depended on where it's shown, I checked the code: `domain/reminders.ts`, `domain/seasons.ts`, `domain/cheers.ts`, `milestones/copy.ts`, `app/welcome.tsx`, `app/compare.tsx`, `app/milestones.tsx`, `app/_layout.tsx`, `components/header-menu.tsx` and `components/purpose-picker.tsx`. I read each line as a Punjabi courier or driver in Surrey BC or Southall would. I checked for offence, tone, money and tax honesty, units, UI fit and naturalness.

**Result.** I changed 68 lines. Keys, placeholders, `<b>` tags and plural objects are unchanged, and `npx jest src/i18n` passes (31/31). I updated `glossary/pa.md` with these terms: employer ਇੰਪਲਾਇਰ, optional ਜ਼ਰੂਰੀ ਨਹੀਂ, start point/destination ਸ਼ੁਰੂਆਤੀ ਪਤਾ / ਮੰਜ਼ਿਲ, value ਕੀਮਤ, Money back ਲੱਭੀ ਰਕਮ. I also added the gender-neutral, country and unit rules, the new cheers and greetings, and closed Unsure items 2–10.

## Main themes

1. **Units.** Eleven lines shown in every country still said ਮੀਲ:
   - the welcome headline and tagline;
   - the summer and autumn greetings, which are shown in Canada and Australia;
   - the money and achievement share texts;
   - "Missed miles check";
   - the km variants of the delivery-app share text, which ended "ਹਰ ਮੀਲ".

   These now say ਟ੍ਰਿਪ, ਦੂਰੀ or ਕਿਲੋਮੀਟਰ. Lines that come in a miles/km pair keep their own unit.
2. **Money honesty.** These phrases read as a cash refund, a guaranteed saving or the WhatsApp "ਪੈਸੇ ਕਮਾਓ" scam hook: ਪੈਸੇ ਵਾਪਸ, ਵਾਪਸ ਤੁਹਾਡੀ ਜੇਬ ਵਿੱਚ, ਮੁਫ਼ਤ ਪੈਸੇ, ਬੱਚਤ, ਪੈਸੇ ਬਣਦੇ, ਵੱਡਾ ਫ਼ਾਇਦਾ and ਆਖ਼ਰੀ ਮੌਕਾ. They're replaced with ਕੀਮਤ (value), ਲੱਭੀ ਰਕਮ (amount found), ਕਟੌਤੀ (deduction) and ਮੀਲ-ਪੱਥਰ (milestone). Where an employer literally repays costs ("reimbursed"), ਪੈਸੇ ਵਾਪਸ is accurate, so I kept it.
3. **Gender.** About 30 lines used masculine forms for the user, such as ਕਰਦੇ ਹੋ, ਸਕਦੇ ਹੋ, ਚਲਾ ਰਹੇ ਹੋ, ਗਏ, ਕਰੋਗੇ and ਨਵੇਂ ਹੋ. Check 2 treated ਕਰੋਗੇ as neutral, but many speakers use the feminine form for a woman, so I reworded all of these. The new wording uses the polite imperative, passive or impersonal forms, noun phrases, or the subjunctive ਸਕੋ / ਹੋਵੋ, which isn't gendered. Two cheers (ਚੱਲ ਪਏ, ਆਹ ਚੱਲੇ) were also masculine or unclear.
4. **Migration sensitivity.** For a diaspora reader, ਤੁਹਾਡਾ ਦੇਸ਼ and ਤੁਹਾਡੇ ਦੇਸ਼ ਦੀ ਕਰੰਸੀ mean India or Pakistan and rupees. The country screen now says ਦੇਸ਼ ਚੁਣੋ, ਚੁਣੇ ਹੋਏ ਦੇਸ਼ ਦੀ and ਐਪ ਦੀ ਕਰੰਸੀ. "Where do you drive?" now asks which country the user drives in, never where they are "from".
5. **Sensitivity and tone.**
   - ਥੋੜ੍ਹਾ ਸ਼ਰਾਰਤੀ ਇਸ਼ਾਰਾ ("a slightly naughty wink") can read as flirtatious when addressed to an adult. It's now ਮਜ਼ਾਕੀਆ ਰਿਮਾਈਂਡਰ.
   - ਚੱਕ ਦਿਓ ਫੱਟੇ is not a political slogan and has no Khalistan or farmer-protest link. But many readers tie it to the "Chak De! India" national-team anthem, and some to martial origin stories. Under zero tolerance for national identity, it's now ਚੱਲੋ, ਕਰ ਦਿਖਾਈਏ!
   - The winter clothing instruction sounded like talking to a child. It's now a warm wish.
6. **UI fit and polish.** I made the two lines flagged by check 2 natural: "Business errand" is now ਬਿਜ਼ਨਸ ਲਈ ਗੇੜਾ and "Set up auto-logging" is now ਆਟੋਮੈਟਿਕ ਟ੍ਰੈਕਿੰਗ ਸੈੱਟ ਕਰੋ. "Best value" (1.6× English) and the slide-button label were shortened.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| {{achievement}} on MileMint {{emoji}} The mileage app that counts every mile. | MileMint ’ਤੇ {{achievement}} {{emoji}} ਉਹ ਮਾਈਲੇਜ ਐਪ ਜੋ ਹਰ ਮੀਲ ਗਿਣਦੀ ਹੈ। | MileMint ’ਤੇ {{achievement}} {{emoji}} ਉਹ ਮਾਈਲੇਜ ਐਪ ਜਿਸ ਤੋਂ ਕੋਈ ਟ੍ਰਿਪ ਨਹੀਂ ਛੁੱਟਦਾ। | Units: habit-milestone share text is sent from every country. |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | ਮੈਨੂੰ MileMint ਨਾਲ {{amount}} ਦੀ ਬਿਜ਼ਨਸ ਮਾਈਲੇਜ ਲੱਭੀ 🚗💸 ਹਰ ਮੀਲ ਗਿਣਿਆ ਗਿਆ, ਆਪਣੇ-ਆਪ। | ਮੈਨੂੰ MileMint ਨਾਲ {{amount}} ਦੀ ਬਿਜ਼ਨਸ ਮਾਈਲੇਜ ਲੱਭੀ 🚗💸 ਹਰ ਟ੍ਰਿਪ ਗਿਣਿਆ ਗਿਆ, ਆਪਣੇ-ਆਪ। | Units: money-milestone share text, used in km countries too. |
| Every business mile, counted. | ਹਰ ਬਿਜ਼ਨਸ ਮੀਲ, ਗਿਣਿਆ ਹੋਇਆ। | ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦੀ ਪੂਰੀ ਗਿਣਤੀ। | Units: welcome headline is shown before a country is chosen. Also more natural than the participle form. |
| Never miss a mile. | ਕੋਈ ਮੀਲ ਨਾ ਛੁੱਟੇ। | ਕੋਈ ਟ੍ਰਿਪ ਨਾ ਛੁੱਟੇ। | Units: welcome tagline shown in every country. |
| Missed miles check | ਰਹਿ ਗਏ ਮੀਲਾਂ ਦੀ ਜਾਂਚ | ਰਹਿ ਗਈ ਦੂਰੀ ਦੀ ਜਾਂਚ | Units: menu item and screen title in every country (Canada and Australia use km). |
| Autumn miles add up 🍂 | ਪੱਤਝੜ ਦੇ ਮੀਲ ਵੀ ਜੁੜਦੇ ਜਾਂਦੇ ਹਨ 🍂 | ਪੱਤਝੜ ਵਿੱਚ ਵੀ ਟ੍ਰਿਪ ਜੁੜਦੇ ਜਾਂਦੇ ਹਨ 🍂 | Units: the Autumn greeting is shown in Australia (km). |
| Fall miles add up 🍂 | ਪੱਤਝੜ ਦੇ ਮੀਲ ਵੀ ਜੁੜਦੇ ਜਾਂਦੇ ਹਨ 🍂 | ਪੱਤਝੜ ਵਿੱਚ ਵੀ ਟ੍ਰਿਪ ਜੁੜਦੇ ਜਾਂਦੇ ਹਨ 🍂 | Units: the Fall greeting is shown in Canada (km). |
| Sunny days, business miles ☀️ | ਧੁੱਪਾਂ ਵਾਲੇ ਦਿਨ, ਬਿਜ਼ਨਸ ਮੀਲ ☀️ | ਧੁੱਪਾਂ ਵਾਲੇ ਦਿਨ, ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ☀️ | Units: the summer greeting is shown in Canada (km). |
| My delivery app counted {{counted}} km last month. MileMint logged {{logged}} business km: that's {{extra}} km (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | ਮੇਰੀ ਡਿਲੀਵਰੀ ਐਪ ਨੇ ਪਿਛਲੇ ਮਹੀਨੇ {{counted}} ਕਿ.ਮੀ. ਗਿਣੇ। MileMint ਨੇ {{logged}} ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਦਰਜ ਕੀਤੇ: ਯਾਨੀ {{extra}} ਕਿ.ਮੀ. (ਲਗਭਗ {{amount}}) ਜੋ ਕਲੇਮ ਕਰਨੋਂ ਰਹਿ ਜਾਂਦੇ। 🚗💸 MileMint ਹਰ ਮੀਲ ਆਪਣੇ-ਆਪ ਦਰਜ ਕਰਦਾ ਹੈ। | ਮੇਰੀ ਡਿਲੀਵਰੀ ਐਪ ਨੇ ਪਿਛਲੇ ਮਹੀਨੇ {{counted}} ਕਿ.ਮੀ. ਗਿਣੇ। MileMint ਨੇ {{logged}} ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਦਰਜ ਕੀਤੇ: ਯਾਨੀ {{extra}} ਕਿ.ਮੀ. (ਲਗਭਗ {{amount}}) ਜੋ ਕਲੇਮ ਕਰਨੋਂ ਰਹਿ ਜਾਂਦੇ। 🚗💸 MileMint ਹਰ ਕਿਲੋਮੀਟਰ ਆਪਣੇ-ਆਪ ਦਰਜ ਕਰਦਾ ਹੈ। | Units: this is the km variant of the share text, so it should not end with ਮੀਲ. |
| My delivery app counted {{counted}} km this month. MileMint logged {{logged}} business km: that's {{extra}} km (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | ਮੇਰੀ ਡਿਲੀਵਰੀ ਐਪ ਨੇ ਇਸ ਮਹੀਨੇ {{counted}} ਕਿ.ਮੀ. ਗਿਣੇ। MileMint ਨੇ {{logged}} ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਦਰਜ ਕੀਤੇ: ਯਾਨੀ {{extra}} ਕਿ.ਮੀ. (ਲਗਭਗ {{amount}}) ਜੋ ਕਲੇਮ ਕਰਨੋਂ ਰਹਿ ਜਾਂਦੇ। 🚗💸 MileMint ਹਰ ਮੀਲ ਆਪਣੇ-ਆਪ ਦਰਜ ਕਰਦਾ ਹੈ। | ਮੇਰੀ ਡਿਲੀਵਰੀ ਐਪ ਨੇ ਇਸ ਮਹੀਨੇ {{counted}} ਕਿ.ਮੀ. ਗਿਣੇ। MileMint ਨੇ {{logged}} ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਦਰਜ ਕੀਤੇ: ਯਾਨੀ {{extra}} ਕਿ.ਮੀ. (ਲਗਭਗ {{amount}}) ਜੋ ਕਲੇਮ ਕਰਨੋਂ ਰਹਿ ਜਾਂਦੇ। 🚗💸 MileMint ਹਰ ਕਿਲੋਮੀਟਰ ਆਪਣੇ-ਆਪ ਦਰਜ ਕਰਦਾ ਹੈ। | Units: this is the km variant of the share text, so it should not end with ਮੀਲ. |
| My delivery app counted {{counted}} km this week. MileMint logged {{logged}} business km: that's {{extra}} km (about {{amount}}) I'd have missed claiming. 🚗💸 MileMint logs every mile automatically. | ਮੇਰੀ ਡਿਲੀਵਰੀ ਐਪ ਨੇ ਇਸ ਹਫ਼ਤੇ {{counted}} ਕਿ.ਮੀ. ਗਿਣੇ। MileMint ਨੇ {{logged}} ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਦਰਜ ਕੀਤੇ: ਯਾਨੀ {{extra}} ਕਿ.ਮੀ. (ਲਗਭਗ {{amount}}) ਜੋ ਕਲੇਮ ਕਰਨੋਂ ਰਹਿ ਜਾਂਦੇ। 🚗💸 MileMint ਹਰ ਮੀਲ ਆਪਣੇ-ਆਪ ਦਰਜ ਕਰਦਾ ਹੈ। | ਮੇਰੀ ਡਿਲੀਵਰੀ ਐਪ ਨੇ ਇਸ ਹਫ਼ਤੇ {{counted}} ਕਿ.ਮੀ. ਗਿਣੇ। MileMint ਨੇ {{logged}} ਬਿਜ਼ਨਸ ਕਿ.ਮੀ. ਦਰਜ ਕੀਤੇ: ਯਾਨੀ {{extra}} ਕਿ.ਮੀ. (ਲਗਭਗ {{amount}}) ਜੋ ਕਲੇਮ ਕਰਨੋਂ ਰਹਿ ਜਾਂਦੇ। 🚗💸 MileMint ਹਰ ਕਿਲੋਮੀਟਰ ਆਪਣੇ-ਆਪ ਦਰਜ ਕਰਦਾ ਹੈ। | Units: this is the km variant of the share text, so it should not end with ਮੀਲ. |
| {{amount}} back in your pocket | {{amount}} ਵਾਪਸ ਤੁਹਾਡੀ ਜੇਬ ਵਿੱਚ | {{amount}} ਦਾ ਮੀਲ-ਪੱਥਰ ਪਾਰ! | Money: "ਵਾਪਸ ਤੁਹਾਡੀ ਜੇਬ ਵਿੱਚ" promises cash in hand. Now a milestone cheer that matches the Milestones screen (ਮੀਲ-ਪੱਥਰ). |
| Money back | ਪੈਸੇ ਵਾਪਸ | ਲੱਭੀ ਰਕਮ | Money: "ਪੈਸੇ ਵਾਪਸ" reads as a refund. "Amount found" matches "ਹੁਣ ਤੱਕ ਤੁਹਾਡੇ ਲਈ ਲੱਭੇ" on the same screen. |
| Your money back and badges | ਤੁਹਾਡੇ ਵਾਪਸ ਮਿਲੇ ਪੈਸੇ ਅਤੇ ਬੈਜ | ਲੱਭੀ ਰਕਮ ਅਤੇ ਬੈਜ | Money: same as "Money back"; also shorter for the menu. |
| Free money alert 💸 | ਮੁਫ਼ਤ ਪੈਸੇ ਦੀ ਖ਼ਬਰ 💸 | ਤੁਹਾਡੇ ਪੈਸਿਆਂ ਦੀ ਗੱਲ 💸 | Money: "ਮੁਫ਼ਤ ਪੈਸੇ" is the classic scam / "ਪੈਸੇ ਕਮਾਓ" hook in WhatsApp forwards. The body explains it is the user's own money. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | ਵੈਸੇ, ਇਹ ਤੁਹਾਡੇ ਆਪਣੇ ਹੀ ਪੈਸੇ ਹਨ। ਇਸ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਤੇ ਵਾਪਸ ਕਲੇਮ ਕਰੋ। | ਵੈਸੇ ਦੇਖਿਆ ਜਾਵੇ ਤਾਂ ਇਹ ਤੁਹਾਡੀ ਆਪਣੀ ਹੀ ਕਮਾਈ ਹੈ। ਇਸ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਤੇ ਕਲੇਮ ਕਰੋ। | Money: "ਵਾਪਸ ਕਲੇਮ" read as a guaranteed refund. Keeps the wink without a cash promise. |
| Plot twist: driving pays | ਕਹਾਣੀ ’ਚ ਮੋੜ: ਡਰਾਈਵਿੰਗ ਦੇ ਵੀ ਪੈਸੇ ਬਣਦੇ ਹਨ | ਕਹਾਣੀ ਵਿੱਚ ਮੋੜ: ਡਰਾਈਵਿੰਗ ਦੀ ਵੀ ਕੀਮਤ ਹੈ | Money: "ਪੈਸੇ ਬਣਦੇ ਹਨ" sounds like an earn-money pitch. Uses the glossary's ਕੀਮਤ (value). ’ਚ → ਵਿੱਚ for consistency. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | ਇਸ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਬਿਜ਼ਨਸ ਜਾਂ ਨਿੱਜੀ ਵੱਲ ਸਵਾਈਪ ਕਰੋ ਅਤੇ ਦੇਖੋ ਕਿੰਨੇ ਪੈਸੇ ਵਾਪਸ ਬਣੇ। | ਇਸ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਬਿਜ਼ਨਸ ਜਾਂ ਨਿੱਜੀ ਵੱਲ ਸਵਾਈਪ ਕਰੋ ਅਤੇ ਦੇਖੋ ਉਨ੍ਹਾਂ ਦੀ ਕਿੰਨੀ ਕੀਮਤ ਬਣੀ। | Money: "ਕਿੰਨੇ ਪੈਸੇ ਵਾਪਸ ਬਣੇ" implied money returned. |
| MileMint has now found {{amount}} in business mileage for you. That’s real money back at tax time. | MileMint ਨੇ ਹੁਣ ਤੱਕ ਤੁਹਾਡੇ ਲਈ {{amount}} ਦੀ ਬਿਜ਼ਨਸ ਮਾਈਲੇਜ ਲੱਭੀ ਹੈ। ਟੈਕਸ ਵੇਲੇ ਇਹ ਅਸਲੀ ਪੈਸੇ ਵਾਪਸ ਹਨ। | MileMint ਨੇ ਹੁਣ ਤੱਕ ਤੁਹਾਡੇ ਲਈ {{amount}} ਦੀ ਬਿਜ਼ਨਸ ਮਾਈਲੇਜ ਲੱਭੀ ਹੈ। ਟੈਕਸ ਵੇਲੇ ਇਹ ਅਸਲੀ ਪੈਸਿਆਂ ਦੀ ਗੱਲ ਹੈ। | Money: "ਅਸਲੀ ਪੈਸੇ ਵਾਪਸ ਹਨ" states a refund as fact. |
| Sort your drives and add any you missed before {{date}}. Every business kilometre is money back. | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਕਿਲੋਮੀਟਰ ਦਾ ਮਤਲਬ ਹੈ ਪੈਸੇ ਵਾਪਸ। | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਕਿਲੋਮੀਟਰ ਦੀ ਆਪਣੀ ਕੀਮਤ ਹੈ। | Money: promised a refund per km. |
| Sort your drives and add any you missed before {{date}}. Every business mile is money back. | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਮੀਲ ਦਾ ਮਤਲਬ ਹੈ ਪੈਸੇ ਵਾਪਸ। | {{date}} ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੇ ਟ੍ਰਿਪ ਛਾਂਟੋ ਅਤੇ ਰਹਿ ਗਏ ਟ੍ਰਿਪ ਜੋੜੋ। ਹਰ ਬਿਜ਼ਨਸ ਮੀਲ ਦੀ ਆਪਣੀ ਕੀਮਤ ਹੈ। | Money: same as the km line. |
| See what each business drive saves you at tax time. | ਦੇਖੋ ਕਿ ਟੈਕਸ ਵੇਲੇ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਨਾਲ ਤੁਹਾਡੀ ਕਿੰਨੀ ਬੱਚਤ ਹੁੰਦੀ ਹੈ। | ਦੇਖੋ ਕਿ ਟੈਕਸ ਵੇਲੇ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦੀ ਕਿੰਨੀ ਕੀਮਤ ਬਣਦੀ ਹੈ। | Money: "ਤੁਹਾਡੀ ਬੱਚਤ ਹੁੰਦੀ ਹੈ" promises a tax saving (brief rule 9). |
| Worth money | ਪੈਸੇ ਬਣਦੇ | ਹਰ ਟ੍ਰਿਪ ਦੀ ਕੀਮਤ | Money: "ਪੈਸੇ ਬਣਦੇ" (money gets made) is a get-rich phrase. Closes Unsure 8. |
| Swipe right on savings | ਬੱਚਤ ਨੂੰ ਸੱਜੇ ਸਵਾਈਪ ਕਰੋ | ਕਟੌਤੀਆਂ ਨੂੰ ਸੱਜੇ ਸਵਾਈਪ ਕਰੋ | Money: ਬੱਚਤ promises savings. The deduction keeps the dating-app pun honest. |
| Low effort, high reward | ਥੋੜ੍ਹੀ ਮਿਹਨਤ, ਵੱਡਾ ਫ਼ਾਇਦਾ | ਥੋੜ੍ਹੀ ਜਿਹੀ ਮਿਹਨਤ, ਵੱਡਾ ਆਰਾਮ | Money/tone: "ਥੋੜ੍ਹੀ ਮਿਹਨਤ, ਵੱਡਾ ਫ਼ਾਇਦਾ" is the wording of get-rich adverts. The body (a few swipes vs a pile of receipts) is about ease. |
| Best value | ਸਭ ਤੋਂ ਵੱਧ ਫ਼ਾਇਦਾ | ਸਭ ਤੋਂ ਕਿਫ਼ਾਇਤੀ | Money/UI: "most profit" is salesy and 1.6× English on a small badge. ਕਿਫ਼ਾਇਤੀ = best value for money. |
| Last call: make sure every business drive is in MileMint before {{date}}. | ਆਖ਼ਰੀ ਮੌਕਾ: {{date}} ਤੋਂ ਪਹਿਲਾਂ ਪੱਕਾ ਕਰੋ ਕਿ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ MileMint ਵਿੱਚ ਹੈ। | ਆਖ਼ਰੀ ਰਿਮਾਈਂਡਰ: {{date}} ਤੋਂ ਪਹਿਲਾਂ ਪੱਕਾ ਕਰੋ ਕਿ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ MileMint ਵਿੱਚ ਹੈ। | Tone: "ਆਖ਼ਰੀ ਮੌਕਾ" is sale/offer language; this is a deadline reminder. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | ਐਤਵਾਰ ਸ਼ਾਮ ਨੂੰ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟਣ ਲਈ ਇੱਕ (ਥੋੜ੍ਹਾ ਸ਼ਰਾਰਤੀ) ਇਸ਼ਾਰਾ। | ਐਤਵਾਰ ਸ਼ਾਮ ਨੂੰ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟਣ ਲਈ ਇੱਕ (ਥੋੜ੍ਹਾ ਮਜ਼ਾਕੀਆ) ਰਿਮਾਈਂਡਰ। | Sensitivity: ਸ਼ਰਾਰਤੀ ਇਸ਼ਾਰਾ addressed to an adult can read as a flirtatious wink. ਮਜ਼ਾਕੀਆ ਰਿਮਾਈਂਡਰ keeps the playfulness. |
| A quick (slightly cheeky) reminder each Sunday evening to sort the week’s drives, so nothing goes unclaimed. | ਹਰ ਐਤਵਾਰ ਸ਼ਾਮ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟਣ ਲਈ ਇੱਕ ਛੋਟਾ ਜਿਹਾ (ਥੋੜ੍ਹਾ ਸ਼ਰਾਰਤੀ) ਰਿਮਾਈਂਡਰ, ਤਾਂ ਜੋ ਕੁਝ ਵੀ ਕਲੇਮ ਕਰਨੋਂ ਨਾ ਰਹਿ ਜਾਵੇ। | ਹਰ ਐਤਵਾਰ ਸ਼ਾਮ ਹਫ਼ਤੇ ਦੇ ਟ੍ਰਿਪ ਛਾਂਟਣ ਲਈ ਇੱਕ ਛੋਟਾ ਜਿਹਾ (ਥੋੜ੍ਹਾ ਮਜ਼ਾਕੀਆ) ਰਿਮਾਈਂਡਰ, ਤਾਂ ਜੋ ਕੁਝ ਵੀ ਕਲੇਮ ਕਰਨੋਂ ਨਾ ਰਹਿ ਜਾਵੇ। | Sensitivity: same as above. |
| Let’s do this! 💪 | ਚੱਕ ਦਿਓ ਫੱਟੇ! 💪 | ਚੱਲੋ, ਕਰ ਦਿਖਾਈਏ! 💪 | Sensitivity (zero tolerance): the phrase itself is not political, but in the diaspora it is tied to the "Chak De! India" national-team anthem and to martial folk stories about its origin. A shift cheer should carry no national identity. The new line is the same energy, neutral. |
| Here we go! 🙌 | ਆਹ ਚੱਲੇ! 🙌 | ਲਓ ਜੀ, ਸ਼ੁਰੂ! 🙌 | Naturalness: "ਆਹ ਚੱਲੇ" reads as "there they go" (someone else leaving) and can sound sarcastic. "ਲਓ ਜੀ, ਸ਼ੁਰੂ!" is the warm everyday send-off. |
| Off we go! 👋 | ਚੱਲ ਪਏ! 👋 | ਸਫ਼ਰ ਸ਼ੁਰੂ! 👋 | Gender: ਚੱਲ ਪਏ is masculine plural. ਸਫ਼ਰ ਸ਼ੁਰੂ is neutral. |
| Wrap up warm out there ❄️ | ਬਾਹਰ ਗਰਮ ਕੱਪੜੇ ਪਾ ਕੇ ਨਿਕਲਣਾ ❄️ | ਠੰਢ ਹੈ, ਆਪਣਾ ਖ਼ਿਆਲ ਰੱਖਣਾ ❄️ | Tone: the clothing instruction sounds like talking to a child. "ਆਪਣਾ ਖ਼ਿਆਲ ਰੱਖਣਾ" is the warm adult wish. |
| Future you says thanks 🙌 | ਅੱਗੇ ਜਾ ਕੇ ਤੁਸੀਂ ਆਪ ਹੀ ਸ਼ੁਕਰੀਆ ਕਹੋਗੇ 🙌 | ਆਉਣ ਵਾਲਾ ਕੱਲ੍ਹ ਸ਼ੁਕਰੀਆ ਕਹੇਗਾ 🙌 | Gender: ਕਹੋਗੇ is masculine. Keeps the "future thanks you" joke. |
| Your country | ਤੁਹਾਡਾ ਦੇਸ਼ | ਦੇਸ਼ ਚੁਣੋ | Migration: for a diaspora reader "ਤੁਹਾਡਾ ਦੇਸ਼" means India/Pakistan. This screen picks the tax country. |
| MileMint uses your country’s currency, distance unit, tax year and official mileage rate. | MileMint ਤੁਹਾਡੇ ਦੇਸ਼ ਦੀ ਕਰੰਸੀ, ਦੂਰੀ ਦੀ ਇਕਾਈ, ਟੈਕਸ ਸਾਲ ਅਤੇ ਸਰਕਾਰੀ ਮਾਈਲੇਜ ਰੇਟ ਵਰਤਦਾ ਹੈ। | MileMint ਚੁਣੇ ਹੋਏ ਦੇਸ਼ ਦੀ ਕਰੰਸੀ, ਦੂਰੀ ਦੀ ਇਕਾਈ, ਟੈਕਸ ਸਾਲ ਅਤੇ ਸਰਕਾਰੀ ਮਾਈਲੇਜ ਰੇਟ ਵਰਤਦਾ ਹੈ। | Migration: "ਤੁਹਾਡੇ ਦੇਸ਼ ਦੀ ਕਰੰਸੀ" can read as rupees. Now "the chosen country". |
| Where do you drive? | ਤੁਸੀਂ ਕਿੱਥੇ ਗੱਡੀ ਚਲਾਉਂਦੇ ਹੋ? | ਤੁਹਾਡੀ ਡਰਾਈਵਿੰਗ ਕਿਸ ਦੇਸ਼ ਵਿੱਚ ਹੁੰਦੀ ਹੈ? | Migration + gender: asks about the country of driving, never where the user is "from"; ਚਲਾਉਂਦੇ is masculine. |
| Sets your currency, miles or kilometres, tax year and official mileage rate. You can change it later. | ਇਸ ਨਾਲ ਤੁਹਾਡੀ ਕਰੰਸੀ, ਮੀਲ ਜਾਂ ਕਿਲੋਮੀਟਰ, ਟੈਕਸ ਸਾਲ ਅਤੇ ਸਰਕਾਰੀ ਮਾਈਲੇਜ ਰੇਟ ਤੈਅ ਹੁੰਦੇ ਹਨ। ਤੁਸੀਂ ਇਸਨੂੰ ਬਾਅਦ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ। | ਇਸ ਨਾਲ ਐਪ ਦੀ ਕਰੰਸੀ, ਮੀਲ ਜਾਂ ਕਿਲੋਮੀਟਰ, ਟੈਕਸ ਸਾਲ ਅਤੇ ਸਰਕਾਰੀ ਮਾਈਲੇਜ ਰੇਟ ਤੈਅ ਹੁੰਦੇ ਹਨ। ਇਸਨੂੰ ਬਾਅਦ ਵਿੱਚ ਬਦਲਿਆ ਜਾ ਸਕਦਾ ਹੈ। | Migration + gender: "ਤੁਹਾਡੀ ਕਰੰਸੀ" on the country step can read as the home currency; ਸਕਦੇ ਹੋ is masculine. |
| Choose where you drove from and to. | ਚੁਣੋ ਕਿ ਤੁਸੀਂ ਕਿੱਥੋਂ ਕਿੱਥੇ ਗਏ। | ਚੁਣੋ ਕਿ ਟ੍ਰਿਪ ਕਿੱਥੋਂ ਕਿੱਥੇ ਤੱਕ ਸੀ। | Gender: "ਤੁਸੀਂ … ਗਏ" is masculine. |
| Enter where you drove from and to. | ਭਰੋ ਕਿ ਤੁਸੀਂ ਕਿੱਥੋਂ ਕਿੱਥੇ ਗਏ। | ਭਰੋ ਕਿ ਟ੍ਰਿਪ ਕਿੱਥੋਂ ਕਿੱਥੇ ਤੱਕ ਸੀ। | Gender: same as above. |
| The IRS asks for a record made at or near the time of each trip, showing the date, where you went, the business purpose and the miles. | IRS ਹਰ ਟ੍ਰਿਪ ਵੇਲੇ ਜਾਂ ਉਸਦੇ ਨੇੜੇ-ਤੇੜੇ ਬਣਿਆ ਰਿਕਾਰਡ ਮੰਗਦਾ ਹੈ, ਜਿਸ ਵਿੱਚ ਤਾਰੀਖ਼, ਤੁਸੀਂ ਕਿੱਥੇ ਗਏ, ਬਿਜ਼ਨਸ ਮਕਸਦ ਅਤੇ ਮੀਲ ਹੋਣ। | IRS ਹਰ ਟ੍ਰਿਪ ਵੇਲੇ ਜਾਂ ਉਸਦੇ ਨੇੜੇ-ਤੇੜੇ ਬਣਿਆ ਰਿਕਾਰਡ ਮੰਗਦਾ ਹੈ, ਜਿਸ ਵਿੱਚ ਤਾਰੀਖ਼, ਮੰਜ਼ਿਲ, ਬਿਜ਼ਨਸ ਮਕਸਦ ਅਤੇ ਮੀਲ ਹੋਣ। | Gender: "ਤੁਸੀਂ ਕਿੱਥੇ ਗਏ" is masculine; ਮੰਜ਼ਿਲ is the glossary term (matches the CRA line). |
| Driving {{vehicle}}. Change vehicle | {{vehicle}} ਚਲਾ ਰਹੇ ਹੋ। ਗੱਡੀ ਬਦਲੋ | ਗੱਡੀ: {{vehicle}}। ਗੱਡੀ ਬਦਲੋ | Gender: "ਚਲਾ ਰਹੇ ਹੋ" is masculine. Now matches the visible "ਗੱਡੀ:" chip it describes. |
| How do you work? | ਤੁਸੀਂ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹੋ? | ਤੁਹਾਡਾ ਕੰਮ ਕਿਸ ਤਰ੍ਹਾਂ ਦਾ ਹੈ? | Gender: ਕਰਦੇ ਹੋ is masculine. |
| If you’re employed | ਜੇ ਤੁਸੀਂ ਨੌਕਰੀ ਕਰਦੇ ਹੋ | ਜੇ ਤੁਸੀਂ ਮੁਲਾਜ਼ਮ ਹੋ | Gender: ਕਰਦੇ ਹੋ is masculine; ਮੁਲਾਜ਼ਮ matches the "Employees" lines. |
| I’ll swipe each drive myself. | ਤੁਸੀਂ ਹਰ ਟ੍ਰਿਪ ਖ਼ੁਦ ਸਵਾਈਪ ਕਰੋਗੇ। | ਹਰ ਟ੍ਰਿਪ ਖ਼ੁਦ ਸਵਾਈਪ ਕਰਕੇ ਛਾਂਟੋ। | Gender: check 2 treated ਕਰੋਗੇ as neutral, but many speakers say ਕਰੋਗੀਆਂ to a woman, so it reads masculine. The polite imperative is fully neutral. |
| New to Pro? Your first month is on me: {{url}} | Pro ’ਤੇ ਨਵੇਂ ਹੋ? ਤੁਹਾਡਾ ਪਹਿਲਾ ਮਹੀਨਾ ਮੇਰੇ ਵੱਲੋਂ: {{url}} | Pro ਪਹਿਲੀ ਵਾਰ? ਤੁਹਾਡਾ ਪਹਿਲਾ ਮਹੀਨਾ ਮੇਰੇ ਵੱਲੋਂ: {{url}} | Gender: the friend receiving this share can be anyone; ਨਵੇਂ ਹੋ is masculine. |
| Use other vehicles for work too? | ਕੰਮ ਲਈ ਹੋਰ ਗੱਡੀਆਂ ਵੀ ਵਰਤਦੇ ਹੋ? | ਕੰਮ ਲਈ ਹੋਰ ਗੱਡੀਆਂ ਵੀ ਹਨ? | Gender: ਵਰਤਦੇ ਹੋ is masculine. |
| What are you driving? | ਤੁਸੀਂ ਕਿਹੜੀ ਗੱਡੀ ਚਲਾ ਰਹੇ ਹੋ? | ਹੁਣ ਕਿਹੜੀ ਗੱਡੀ ਹੈ? | Gender: ਚਲਾ ਰਹੇ ਹੋ is masculine. |
| What do you drive? | ਤੁਸੀਂ ਕਿਹੜੀ ਗੱਡੀ ਚਲਾਉਂਦੇ ਹੋ? | ਤੁਹਾਡੀ ਗੱਡੀ ਕਿਹੜੀ ਹੈ? | Gender: ਚਲਾਉਂਦੇ ਹੋ is masculine. |
| You’ll choose which one when you start a shift. | ਸ਼ਿਫਟ ਸ਼ੁਰੂ ਕਰਨ ਵੇਲੇ ਤੁਸੀਂ ਚੁਣੋਗੇ ਕਿ ਕਿਹੜੀ। | ਸ਼ਿਫਟ ਸ਼ੁਰੂ ਕਰਨ ਵੇਲੇ ਗੱਡੀ ਚੁਣਨੀ ਹੋਵੇਗੀ। | Gender: ਚੁਣੋਗੇ is masculine. Also names the vehicle, so it reads on its own. |
| …unless you set your work hours. Until then, a few swipes will do. | …ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਆਪਣੇ ਕੰਮ ਦੇ ਘੰਟੇ ਸੈੱਟ ਨਹੀਂ ਕਰਦੇ। ਉਦੋਂ ਤੱਕ ਕੁਝ ਸਵਾਈਪ ਹੀ ਕਾਫ਼ੀ ਹਨ। | …ਜਦੋਂ ਤੱਕ ਕੰਮ ਦੇ ਘੰਟੇ ਸੈੱਟ ਨਾ ਹੋਣ। ਉਦੋਂ ਤੱਕ ਕੁਝ ਸਵਾਈਪ ਹੀ ਕਾਫ਼ੀ ਹਨ। | Gender: ਕਰਦੇ is masculine. |
| {{price}} per month is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period. | {{price}} ਪ੍ਰਤੀ ਮਹੀਨਾ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਹੀਂ ਕਰਦੇ। | {{price}} ਪ੍ਰਤੀ ਮਹੀਨਾ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਾ ਕੀਤਾ ਜਾਵੇ। | Gender: ਕਰਦੇ is masculine. The passive also matches the English "unless cancelled". |
| After the {{trial}}, {{price}} per month is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period. | {{trial}} ਤੋਂ ਬਾਅਦ, {{price}} ਪ੍ਰਤੀ ਮਹੀਨਾ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਹੀਂ ਕਰਦੇ। | {{trial}} ਤੋਂ ਬਾਅਦ, {{price}} ਪ੍ਰਤੀ ਮਹੀਨਾ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਾ ਕੀਤਾ ਜਾਵੇ। | Gender: ਕਰਦੇ is masculine. The passive also matches the English "unless cancelled". |
| {{price}} per year is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period. | {{price}} ਪ੍ਰਤੀ ਸਾਲ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਹੀਂ ਕਰਦੇ। | {{price}} ਪ੍ਰਤੀ ਸਾਲ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਾ ਕੀਤਾ ਜਾਵੇ। | Gender: ਕਰਦੇ is masculine. The passive also matches the English "unless cancelled". |
| After the {{trial}}, {{price}} per year is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period. | {{trial}} ਤੋਂ ਬਾਅਦ, {{price}} ਪ੍ਰਤੀ ਸਾਲ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਹੀਂ ਕਰਦੇ। | {{trial}} ਤੋਂ ਬਾਅਦ, {{price}} ਪ੍ਰਤੀ ਸਾਲ ਤੁਹਾਡੇ Apple ਖਾਤੇ ਤੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਆਪਣੇ-ਆਪ ਰੀਨਿਊ ਹੁੰਦਾ ਹੈ, ਜਦੋਂ ਤੱਕ ਮਿਆਦ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਘੱਟੋ-ਘੱਟ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਰੱਦ ਨਾ ਕੀਤਾ ਜਾਵੇ। | Gender: ਕਰਦੇ is masculine. The passive also matches the English "unless cancelled". |
| Automatic tracking runs on your iPhone. You can still add trips by hand here. | ਆਟੋਮੈਟਿਕ ਟ੍ਰੈਕਿੰਗ ਤੁਹਾਡੇ iPhone ’ਤੇ ਚੱਲਦੀ ਹੈ। ਇੱਥੇ ਤੁਸੀਂ ਫਿਰ ਵੀ ਹੱਥੀਂ ਟ੍ਰਿਪ ਜੋੜ ਸਕਦੇ ਹੋ। | ਆਟੋਮੈਟਿਕ ਟ੍ਰੈਕਿੰਗ ਤੁਹਾਡੇ iPhone ’ਤੇ ਚੱਲਦੀ ਹੈ। ਇੱਥੇ ਫਿਰ ਵੀ ਹੱਥੀਂ ਟ੍ਰਿਪ ਜੋੜੇ ਜਾ ਸਕਦੇ ਹਨ। | Gender: ਸਕਦੇ ਹੋ is masculine. |
| Employees: if your employer pays less than 55p a mile (or nothing), claim the difference with form P87 or on Self Assessment. You can go back 4 tax years. | ਮੁਲਾਜ਼ਮ: ਜੇ ਤੁਹਾਡਾ ਇੰਪਲਾਇਰ ਪ੍ਰਤੀ ਮੀਲ 55p ਤੋਂ ਘੱਟ ਦਿੰਦਾ ਹੈ (ਜਾਂ ਕੁਝ ਨਹੀਂ), ਤਾਂ ਫ਼ਰਕ form P87 ਨਾਲ ਜਾਂ Self Assessment ਵਿੱਚ ਕਲੇਮ ਕਰੋ। ਤੁਸੀਂ 4 ਟੈਕਸ ਸਾਲ ਪਿੱਛੇ ਤੱਕ ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। | ਮੁਲਾਜ਼ਮ: ਜੇ ਤੁਹਾਡਾ ਇੰਪਲਾਇਰ ਪ੍ਰਤੀ ਮੀਲ 55p ਤੋਂ ਘੱਟ ਦਿੰਦਾ ਹੈ (ਜਾਂ ਕੁਝ ਨਹੀਂ), ਤਾਂ ਫ਼ਰਕ form P87 ਨਾਲ ਜਾਂ Self Assessment ਵਿੱਚ ਕਲੇਮ ਕਰੋ। 4 ਟੈਕਸ ਸਾਲ ਪਿੱਛੇ ਤੱਕ ਦਾ ਕਲੇਮ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ। | Gender: ਸਕਦੇ ਹੋ is masculine. |
| Employees: you can claim Mileage Allowance Relief on the difference between this total and any mileage allowance your employer paid you. | ਮੁਲਾਜ਼ਮ: ਇਸ ਕੁੱਲ ਰਕਮ ਅਤੇ ਤੁਹਾਡੇ ਇੰਪਲਾਇਰ ਵੱਲੋਂ ਦਿੱਤੇ ਮਾਈਲੇਜ ਭੱਤੇ ਦੇ ਫ਼ਰਕ ’ਤੇ ਤੁਸੀਂ Mileage Allowance Relief ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। | ਮੁਲਾਜ਼ਮ: ਇਸ ਕੁੱਲ ਰਕਮ ਅਤੇ ਤੁਹਾਡੇ ਇੰਪਲਾਇਰ ਵੱਲੋਂ ਦਿੱਤੇ ਮਾਈਲੇਜ ਭੱਤੇ ਦੇ ਫ਼ਰਕ ’ਤੇ Mileage Allowance Relief ਕਲੇਮ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ। | Gender: ਸਕਦੇ ਹੋ is masculine. |
| MileMint sorts your drives to match. You can always swipe to change a trip. | MileMint ਤੁਹਾਡੇ ਟ੍ਰਿਪ ਉਸੇ ਹਿਸਾਬ ਨਾਲ ਛਾਂਟਦਾ ਹੈ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਟ੍ਰਿਪ ਨੂੰ ਸਵਾਈਪ ਕਰਕੇ ਕਦੇ ਵੀ ਬਦਲ ਸਕਦੇ ਹੋ। | MileMint ਤੁਹਾਡੇ ਟ੍ਰਿਪ ਉਸੇ ਹਿਸਾਬ ਨਾਲ ਛਾਂਟਦਾ ਹੈ। ਕੋਈ ਟ੍ਰਿਪ ਬਦਲਣਾ ਹੋਵੇ, ਤਾਂ ਕਦੇ ਵੀ ਸਵਾਈਪ ਕਰੋ। | Gender: ਸਕਦੇ ਹੋ is masculine. |
| You can claim up to 5,000 business kilometres per car each income year. This report assumes one car. | ਤੁਸੀਂ ਹਰ ਆਮਦਨ ਸਾਲ ਵਿੱਚ ਹਰ ਕਾਰ ਲਈ 5,000 ਬਿਜ਼ਨਸ ਕਿਲੋਮੀਟਰ ਤੱਕ ਕਲੇਮ ਕਰ ਸਕਦੇ ਹੋ। ਇਹ ਰਿਪੋਰਟ ਇੱਕ ਕਾਰ ਮੰਨ ਕੇ ਚੱਲਦੀ ਹੈ। | ਹਰ ਆਮਦਨ ਸਾਲ ਵਿੱਚ ਹਰ ਕਾਰ ਲਈ 5,000 ਬਿਜ਼ਨਸ ਕਿਲੋਮੀਟਰ ਤੱਕ ਕਲੇਮ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ। ਇਹ ਰਿਪੋਰਟ ਇੱਕ ਕਾਰ ਮੰਨ ਕੇ ਚੱਲਦੀ ਹੈ। | Gender: ਸਕਦੇ ਹੋ is masculine. |
| BAS: if you’re registered for GST or pay PAYG instalments, you lodge quarterly by 28 October, 28 February, 28 April and 28 July. Rideshare drivers must register for GST from their first ride; delivery riders only once turnover reaches $75,000. | BAS: ਜੇ ਤੁਸੀਂ GST ਲਈ ਰਜਿਸਟਰਡ ਹੋ ਜਾਂ PAYG ਕਿਸ਼ਤਾਂ ਭਰਦੇ ਹੋ, ਤਾਂ ਤੁਸੀਂ ਹਰ ਤਿਮਾਹੀ 28 ਅਕਤੂਬਰ, 28 ਫ਼ਰਵਰੀ, 28 ਅਪ੍ਰੈਲ ਅਤੇ 28 ਜੁਲਾਈ ਤੱਕ ਭਰਦੇ ਹੋ। ਰਾਈਡਸ਼ੇਅਰ ਡਰਾਈਵਰਾਂ ਨੂੰ ਪਹਿਲੀ ਸਵਾਰੀ ਤੋਂ ਹੀ GST ਲਈ ਰਜਿਸਟਰ ਕਰਨਾ ਪੈਂਦਾ ਹੈ; ਡਿਲੀਵਰੀ ਰਾਈਡਰਾਂ ਨੂੰ ਸਿਰਫ਼ ਉਦੋਂ ਜਦੋਂ ਟਰਨਓਵਰ $75,000 ਤੱਕ ਪਹੁੰਚ ਜਾਵੇ। | BAS: ਜੇ ਤੁਸੀਂ GST ਲਈ ਰਜਿਸਟਰਡ ਹੋ ਜਾਂ ਤੁਹਾਡੀਆਂ PAYG ਕਿਸ਼ਤਾਂ ਬਣਦੀਆਂ ਹਨ, ਤਾਂ ਹਰ ਤਿਮਾਹੀ 28 ਅਕਤੂਬਰ, 28 ਫ਼ਰਵਰੀ, 28 ਅਪ੍ਰੈਲ ਅਤੇ 28 ਜੁਲਾਈ ਤੱਕ BAS ਭਰਨਾ ਹੁੰਦਾ ਹੈ। ਰਾਈਡਸ਼ੇਅਰ ਡਰਾਈਵਰਾਂ ਨੂੰ ਪਹਿਲੀ ਸਵਾਰੀ ਤੋਂ ਹੀ GST ਲਈ ਰਜਿਸਟਰ ਕਰਨਾ ਪੈਂਦਾ ਹੈ; ਡਿਲੀਵਰੀ ਰਾਈਡਰਾਂ ਨੂੰ ਸਿਰਫ਼ ਉਦੋਂ ਜਦੋਂ ਟਰਨਓਵਰ $75,000 ਤੱਕ ਪਹੁੰਚ ਜਾਵੇ। | Gender: "ਭਰਦੇ ਹੋ … ਭਰਦੇ ਹੋ" are masculine. Also names BAS as the thing lodged. |
| Making Tax Digital: if your self-employed and property income is over £50,000 (£30,000 from April 2027, £20,000 from April 2028), you also send quarterly updates through MTD software by 7 August, 7 November, 7 February and 7 May. Your mileage counts towards each update. | Making Tax Digital: ਜੇ ਤੁਹਾਡੀ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਦੀ ਆਮਦਨ £50,000 ਤੋਂ ਵੱਧ ਹੈ (ਅਪ੍ਰੈਲ 2027 ਤੋਂ £30,000, ਅਪ੍ਰੈਲ 2028 ਤੋਂ £20,000), ਤਾਂ ਤੁਸੀਂ MTD ਸਾਫ਼ਟਵੇਅਰ ਰਾਹੀਂ 7 ਅਗਸਤ, 7 ਨਵੰਬਰ, 7 ਫ਼ਰਵਰੀ ਅਤੇ 7 ਮਈ ਤੱਕ ਤਿਮਾਹੀ ਅੱਪਡੇਟ ਵੀ ਭੇਜਦੇ ਹੋ। ਤੁਹਾਡੀ ਮਾਈਲੇਜ ਹਰ ਅੱਪਡੇਟ ਵਿੱਚ ਗਿਣੀ ਜਾਂਦੀ ਹੈ। | Making Tax Digital: ਜੇ ਤੁਹਾਡੀ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਦੀ ਆਮਦਨ £50,000 ਤੋਂ ਵੱਧ ਹੈ (ਅਪ੍ਰੈਲ 2027 ਤੋਂ £30,000, ਅਪ੍ਰੈਲ 2028 ਤੋਂ £20,000), ਤਾਂ MTD ਸਾਫ਼ਟਵੇਅਰ ਰਾਹੀਂ 7 ਅਗਸਤ, 7 ਨਵੰਬਰ, 7 ਫ਼ਰਵਰੀ ਅਤੇ 7 ਮਈ ਤੱਕ ਤਿਮਾਹੀ ਅੱਪਡੇਟ ਵੀ ਭੇਜਣੇ ਹੁੰਦੇ ਹਨ। ਤੁਹਾਡੀ ਮਾਈਲੇਜ ਹਰ ਅੱਪਡੇਟ ਵਿੱਚ ਗਿਣੀ ਜਾਂਦੀ ਹੈ। | Gender: ਭੇਜਦੇ ਹੋ is masculine. |
| MileMint needs location access set to “Always” to notice when you start driving, even when the app is closed. | ਤੁਸੀਂ ਕਦੋਂ ਗੱਡੀ ਚਲਾਉਣੀ ਸ਼ੁਰੂ ਕਰਦੇ ਹੋ, ਇਹ ਪਤਾ ਲਾਉਣ ਲਈ MileMint ਨੂੰ ਟਿਕਾਣੇ ਦੀ ਇਜਾਜ਼ਤ “ਹਮੇਸ਼ਾਂ” ’ਤੇ ਚਾਹੀਦੀ ਹੈ, ਐਪ ਬੰਦ ਹੋਣ ’ਤੇ ਵੀ। | ਡਰਾਈਵਿੰਗ ਕਦੋਂ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ, ਇਹ ਪਤਾ ਲਾਉਣ ਲਈ MileMint ਨੂੰ ਟਿਕਾਣੇ ਦੀ ਇਜਾਜ਼ਤ “ਹਮੇਸ਼ਾਂ” ’ਤੇ ਚਾਹੀਦੀ ਹੈ, ਐਪ ਬੰਦ ਹੋਣ ’ਤੇ ਵੀ। | Gender: ਕਰਦੇ ਹੋ is masculine. |
| Once a year: lodge by 31 October after the income year ends (30 June), or later if you use a registered tax agent and sign up with them before 31 October. | ਸਾਲ ਵਿੱਚ ਇੱਕ ਵਾਰ: ਆਮਦਨ ਸਾਲ ਖ਼ਤਮ ਹੋਣ (30 ਜੂਨ) ਤੋਂ ਬਾਅਦ 31 ਅਕਤੂਬਰ ਤੱਕ ਭਰੋ, ਜਾਂ ਬਾਅਦ ਵਿੱਚ ਜੇ ਤੁਸੀਂ ਕਿਸੇ ਰਜਿਸਟਰਡ ਟੈਕਸ ਏਜੰਟ ਨਾਲ 31 ਅਕਤੂਬਰ ਤੋਂ ਪਹਿਲਾਂ ਜੁੜ ਜਾਂਦੇ ਹੋ। | ਸਾਲ ਵਿੱਚ ਇੱਕ ਵਾਰ: ਆਮਦਨ ਸਾਲ ਖ਼ਤਮ ਹੋਣ (30 ਜੂਨ) ਤੋਂ ਬਾਅਦ 31 ਅਕਤੂਬਰ ਤੱਕ ਭਰੋ, ਜਾਂ ਬਾਅਦ ਵਿੱਚ, ਜੇ 31 ਅਕਤੂਬਰ ਤੋਂ ਪਹਿਲਾਂ ਕਿਸੇ ਰਜਿਸਟਰਡ ਟੈਕਸ ਏਜੰਟ ਨਾਲ ਸਾਈਨ ਅੱਪ ਹੋ ਜਾਵੇ। | Gender: ਜੁੜ ਜਾਂਦੇ ਹੋ is masculine. |
| This is CRA’s reimbursement rate for employees. If you’re self-employed, CRA usually wants your actual car costs, so treat the figure as an estimate. | ਇਹ ਮੁਲਾਜ਼ਮਾਂ ਲਈ CRA ਦਾ ਪੈਸੇ ਵਾਪਸ ਕਰਨ ਵਾਲਾ ਰੇਟ ਹੈ। ਜੇ ਤੁਸੀਂ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਵਾਲੇ ਹੋ, ਤਾਂ CRA ਆਮ ਤੌਰ ’ਤੇ ਤੁਹਾਡੀ ਕਾਰ ਦੇ ਅਸਲ ਖ਼ਰਚੇ ਮੰਗਦਾ ਹੈ, ਇਸ ਲਈ ਇਸ ਅੰਕੜੇ ਨੂੰ ਅੰਦਾਜ਼ਾ ਹੀ ਸਮਝੋ। | ਇਹ ਮੁਲਾਜ਼ਮਾਂ ਲਈ CRA ਦਾ ਪੈਸੇ ਵਾਪਸ ਕਰਨ ਵਾਲਾ ਰੇਟ ਹੈ। ਸਵੈ-ਰੁਜ਼ਗਾਰ ਵਾਲਿਆਂ ਤੋਂ CRA ਆਮ ਤੌਰ ’ਤੇ ਕਾਰ ਦੇ ਅਸਲ ਖ਼ਰਚੇ ਮੰਗਦਾ ਹੈ, ਇਸ ਲਈ ਇਸ ਅੰਕੜੇ ਨੂੰ ਅੰਦਾਜ਼ਾ ਹੀ ਸਮਝੋ। | Gender: "ਤੁਸੀਂ … ਵਾਲੇ ਹੋ" is masculine. |
| Business errand | ਬਿਜ਼ਨਸ ਦਾ ਕੰਮ | ਬਿਜ਼ਨਸ ਲਈ ਗੇੜਾ | Polish (flagged by check 2): "ਬਿਜ਼ਨਸ ਦਾ ਕੰਮ" is just "business work". ਗੇੜਾ is the everyday word for a quick run (ਬੈਂਕ ਦਾ ਗੇੜਾ). |
| Set up auto-logging | ਆਟੋ-ਦਰਜ ਸੈੱਟ ਕਰੋ | ਆਟੋਮੈਟਿਕ ਟ੍ਰੈਕਿੰਗ ਸੈੱਟ ਕਰੋ | Polish (flagged by check 2): "ਆਟੋ-ਦਰਜ" is a coined word nobody says. Uses the glossary term for this feature; full-width button, fits. |
| Swipe to start shift | ਸ਼ਿਫਟ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਵਾਈਪ ਕਰੋ | ਸ਼ਿਫਟ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਵਾਈਪ | UI fit: label inside the slide button, was 1.45× English. |

## Checked and kept

- **Religion.** No line has a religious word, greeting or blessing.
  - "G’day!" is ਹੈਲੋ ਜੀ!, not ਸਤ ਸ੍ਰੀ ਅਕਾਲ.
  - Spring is ਬਹਾਰ, not ਬਸੰਤ.
  - "Unlimited" is ਅਨਲਿਮਟਿਡ, not ਬੇਅੰਤ.
  - ਹੈਲੋਵੀਨ ਮੁਬਾਰਕ, ਛੁੱਟੀਆਂ ਮੁਬਾਰਕ and ਨਵਾਂ ਸਾਲ ਮੁਬਾਰਕ are secular. ਮੁਬਾਰਕ is the everyday "congratulations" used by every Punjabi community. The Christmas period is "holidays", not Christmas.
- **Politics.** Nothing echoes Punjab, India/Pakistan, Khalistan or the farmer protests. The only phrase near that line, ਚੱਕ ਦਿਓ ਫੱਟੇ, was replaced (see above).
- **Caste and trades.** ਟਰੇਡ (Trades), ਸਵੈ-ਰੁਜ਼ਗਾਰ ਵਾਲੇ (self-employed, used as a category label) and ਮੁਲਾਜ਼ਮ have no caste or status shading. ਮਾਲਕ, which also means "master", was already replaced by ਇੰਪਲਾਇਰ in check 2.
- **Weekly jokes.** These all land and are kind, with no double meanings:
  - ਤੁਹਾਡੇ ਮੀਲਾਂ ਦਾ ਫ਼ੋਨ ਆਇਆ / ਕਹਿੰਦੇ ਸੋਮਵਾਰ ਤੋਂ ਪਹਿਲਾਂ ਛਾਂਟ ਦਿਓ;
  - ਦਰਵਾਜ਼ੇ ’ਤੇ ਕੌਣ ਹੈ?;
  - ਐਤਵਾਰ ਸ਼ਾਮ ਦੀ ਟੈਂਸ਼ਨ;
  - ਰਸੀਦਾਂ ਦਾ ਥੱਬਾ;
  - ਔਖਾ ਕੰਮ ਤਾਂ ਗੱਡੀ ਨੇ ਕਰ ਦਿੱਤਾ / ਸਿਹਰਾ ਆਪਣੇ ਨਾਂ ਕਰੋ (ਸਿਹਰਾ = credit, the standard idiom);
  - the dating-app pun with ਮੈਚ. ਮੈਚ is also a cricket match, so it stays light even for older readers.
- **Kept cheers.** ਚੱਲੋ, ਸ਼ੁਰੂ ਕਰੀਏ!, ਚੱਲੋ ਚੱਲੀਏ! and ਗੱਡੀ ਤੋਰਨ ਦਾ ਵੇਲਾ! are casual, respectful and neutral.
- **Money lines softened in check 2.** ਕਟੌਤੀ ਪੱਕੀ ਕਰੋ, ਮਿਹਨਤ ਦਾ ਪੂਰਾ ਮੁੱਲ and ਤੁਹਾਡੀ ਮਿਹਨਤ ਦੀ ਕਮਾਈ follow the English "earned every penny" without naming a currency. Every estimate line still says ਅੰਦਾਜ਼ਨ / ਇਹ ਟੈਕਸ ਸਲਾਹ ਨਹੀਂ ਹੈ.
- **ਮੀਲ-ਪੱਥਰ (Milestones)** is the ordinary Punjabi word for milestone, not a unit, so it stays in km countries too.
- **UI fit.** These all fit: the country tiles (ਅਮਰੀਕਾ, ਯੂ.ਕੇ., ਕੈਨੇਡਾ, ਆਸਟ੍ਰੇਲੀਆ), the vehicle buttons, the badges (ਸਭ ਤੋਂ ਕਿਫ਼ਾਇਤੀ, ਮੁਫ਼ਤ ਪਲਾਨ, ਟ੍ਰੈਕਿੰਗ ਚਾਲੂ, ਹੁਣ ਵਰਤੋਂ ਵਿੱਚ), "Pro ਲਓ", the tabs and the weekday labels. Gurmukhi with vowel signs renders narrower than its character count.
- **Gender-neutral forms left on purpose.**
  - Subjunctive ਕਲੇਮ ਕਰ ਸਕੋ / ਤਿਆਰ ਹੋਵੋ.
  - Participles that agree with an object, as in ਗੱਡੀ ਪਾਰਕ ਕਰ ਦਿੱਤੀ ਹੈ and ਕਿਲੋਮੀਟਰ ਕਿਵੇਂ ਕੱਢੇ.
  - The invariant adverb in ਇੱਕ ਕਦਮ ਹੋਰ ਨੇੜੇ ਹੋ.
  - Fixed imperatives ਲੱਗੇ ਰਹੋ / ਚੱਲਦੇ ਰਹੋ.

## Not blocking

- **iOS Punjabi system strings** (carried over from checks 1 and 2). These are still unverified on a device: ਹਮੇਸ਼ਾਂ vs ਹਮੇਸ਼ਾ, ਇਜਾਜ਼ਤ vs ਆਗਿਆ, ਟਿਕਾਣਾ, ਸੈਟਿੰਗਾਂ → ਸੂਚਨਾਵਾਂ, and "Ask Next Time Or When I Share". They're understandable either way. Whoever does device QA should compare them with an iPhone set to ਪੰਜਾਬੀ. This is a risk that the words won't match the screen, not a cultural one.

## Sign-off

**Approved for release.** Nothing left in the file is offensive, sexual, religious, political, about origin or nationality, gendered for the user, or a promise of refunds or savings. Lines shown in every country no longer name a unit. The only open item is the iOS-wording device check above, and it doesn't block release.

## Round 3: logbook, P87, privacy and backup (October 2026)

**Scope.** All 203 lines added this round (201 feature lines plus 2 shift-switch lines). I read each one as a Punjabi courier in Southall or Surrey BC, a care worker in Birmingham or Brampton, and an Uber driver in Melbourne. I checked tone, gender-neutral address, money honesty, privacy reassurance, backup precision, the glossary terms and button length (≤1.3× English).

**What I checked.**
- **Gender.** No gendered verb for the user. The lines use polite imperatives, the passive (ਕਲੇਮ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ, ਰੱਖਿਆ ਜਾਵੇਗਾ), the subjunctive (ਵਰਤੋ, ਜੋੜੋ, ਹੋਵੋ) or noun phrases. The care-worker toggle is first person, so it's worded as ਮੇਰਾ ਕੰਮ … ਜਾਣ ਦਾ ਹੈ, not ਜਾਂਦਾ/ਜਾਂਦੀ ਹਾਂ. The claimed switch is ਇਸ ਸਾਲ ਦਾ ਕਲੇਮ ਕਰ ਦਿੱਤਾ ਹੈ, where the verb agrees with ਕਲੇਮ. "We’ll keep only the area" is passive, so the app doesn't speak as a masculine ਅਸੀਂ.
- **Country.** The logbook's wrong-country line says ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਦੇਸ਼ ਬਦਲੋ, never ਤੁਹਾਡਾ ਦੇਸ਼.
- **Money.** "Relief" (ਰਾਹਤ) is never presented as cash. "Tax back" (ਟੈਕਸ ਵਾਪਸੀ) always has ਲਗਭਗ or ਅੰਦਾਜ਼ਨ. HMRC "refunds earlier years" is ਪਿਛਲੇ ਸਾਲਾਂ ਦਾ ਬਣਦਾ ਟੈਕਸ, meaning only what is due. None of ਪੈਸੇ ਵਾਪਸ, ਬੱਚਤ, ਮੁਫ਼ਤ is used.
- **Privacy.** The lines are plain and calm: ਸਿਰਫ਼ ਇਲਾਕਾ ਰੱਖਿਆ ਜਾਵੇਗਾ, ਉਨ੍ਹਾਂ ਦਾ ਪਤਾ ਕਦੇ ਨਹੀਂ. The settings text says the area, distance and purpose are enough *for the tax office* (ਟੈਕਸ ਦਫ਼ਤਰ ਲਈ … ਕਾਫ਼ੀ ਹਨ). Nothing suggests hiding anything from it. Patients are ਮਰੀਜ਼, a neutral word.
- **Backup.** The lines say it is encrypted, with a key only in the user's iCloud Keychain, and that MileMint never sees the trips. The restore warning says exactly what is replaced.
- **Units.** Logbook lines are Australia-only and use ਕਿ.ਮੀ.; P87 lines are UK-only and use ਮੀਲ. The new employee share text ("Every mile counted") follows its existing sibling and says ਹਰ ਟ੍ਰਿਪ.

**Changes.**

| English | Before | After | Why |
|---|---|---|---|
| Ended early | ਸਮੇਂ ਤੋਂ ਪਹਿਲਾਂ ਖ਼ਤਮ | ਵਿਚਾਲੇ ਖ਼ਤਮ | Status label was almost 2× the English. ਵਿਚਾਲੇ ਖ਼ਤਮ ("ended midway") is short and everyday. |
| Start fresh instead | ਇਸ ਦੀ ਥਾਂ ਨਵੇਂ ਸਿਰਿਓਂ ਸ਼ੁਰੂ ਕਰੋ | ਨਵੇਂ ਸਿਰਿਓਂ ਸ਼ੁਰੂ ਕਰੋ | Button was too long. It sits under "Restore my trips", so "instead" is already clear. |
| See how to claim › | ਕਲੇਮ ਕਿਵੇਂ ਕਰੀਏ, ਦੇਖੋ › | ਕਲੇਮ ਦਾ ਤਰੀਕਾ ਦੇਖੋ › | The comma construction was awkward for a link. |
| Add initials or a client number if you like. Never a name or address. | …ਕਲਾਇੰਟ ਨੰਬਰ ਜੋੜੋ। ਨਾਂ ਜਾਂ ਪਤਾ ਕਦੇ ਨਹੀਂ। | …ਕਲਾਇੰਟ ਨੰਬਰ ਜੋੜੋ, ਪਰ ਨਾਂ ਜਾਂ ਪਤਾ ਕਦੇ ਨਹੀਂ। | The bare fragment read as abrupt. With ਪਰ it reads as friendly guidance. |
| Encrypted with a key only your iCloud Keychain holds. MileMint never sees your trips. | ਬੈਕਅੱਪ ਇੱਕ ਅਜਿਹੀ ਕੁੰਜੀ ਨਾਲ ਇਨਕ੍ਰਿਪਟ ਹੁੰਦਾ ਹੈ… | ਬੈਕਅੱਪ ਇਨਕ੍ਰਿਪਟ (ਤਾਲਾਬੰਦ) ਹੁੰਦਾ ਹੈ, ਇੱਕ ਅਜਿਹੀ ਕੁੰਜੀ ਨਾਲ… | Not every user knows ਇਨਕ੍ਰਿਪਟ. The gloss ਤਾਲਾਬੰਦ ("locked") keeps it precise and reassuring. |

**Checked and kept.** ਬੇਸਿਕ / ਹਾਇਰ / ਐਡੀਸ਼ਨਲ match the words on HMRC letters. ਇੰਸ਼ੋਰੈਂਸ, ਰਜਿਸਟ੍ਰੇਸ਼ਨ, ਸਰਵਿਸ ਅਤੇ ਮੁਰੰਮਤ and ਲੋਨ ਦਾ ਵਿਆਜ are what drivers say. ਡੈਪ੍ਰੀਸੀਏਸ਼ਨ keeps a gloss (ਕੀਮਤ ਵਿੱਚ ਕਮੀ); it is a list label, not a button, so the length is fine. "Scottish rates" = ਸਕਾਟਲੈਂਡ ਦੀਆਂ ਦਰਾਂ, a plain tax fact.

**Not blocking.** iOS and iCloud wording is unverified on a Punjabi iPhone; see the glossary's Unsure list.

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | ਸ਼ਿਫਟ ਖ਼ਤਮ ਕਰਨ ਲਈ ਵਾਪਸ ਸਵਾਈਪ ਕਰੋ। | (unchanged) | Checked. Back-translation: "Swipe back to end the shift." Matches "ਸ਼ਿਫਟ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਵਾਈਪ" and "ਸ਼ਿਫਟ ਖ਼ਤਮ ਕਰੋ" (ਤੁਸੀਂ). Shorter than English on screen. |
| {{hint}}. Swipe the button to the left, or double-tap. | {{hint}}। ਬਟਨ ਨੂੰ ਖੱਬੇ ਪਾਸੇ ਸਵਾਈਪ ਕਰੋ, ਜਾਂ ਦੋ ਵਾਰ ਟੈਪ ਕਰੋ। | (unchanged) | Checked: mirrors the "ਸੱਜੇ ਪਾਸੇ" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | ਰਕਮਾਂ ਅੰਕਾਂ ਵਿੱਚ ਭਰੋ, ਜਿਵੇਂ 2400 ਜਾਂ 2,400.50। | (unchanged) | Checked: English-style example is what Punjabi speakers use; no dot instruction. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | ਦੋਸਤ ਦੇ ਜੁੜਨ ’ਤੇ ਤੁਹਾਨੂੰ ਦੋਵਾਂ ਨੂੰ ਹਰ ਮਹੀਨੇ +10 ਮੁਫ਼ਤ ਟ੍ਰਿਪ ਮਿਲਦੇ ਹਨ। | Verb agrees with ਟ੍ਰਿਪ (m.), not the user, per the gender-neutral rule. |
| You joined with {{code}}: … | ਕੋਡ {{code}} ਨਾਲ ਜੁੜਨ ਦਾ ਫ਼ਾਇਦਾ: ਹਰ ਮਹੀਨੇ 10 ਵਾਧੂ ਮੁਫ਼ਤ ਟ੍ਰਿਪ। | “ਤੁਸੀਂ ਜੁੜੇ” is gendered; noun phrase instead. |
| That doesn’t look like a MileMint code… | …4 ਅੱਖਰ, ਇੱਕ ਡੈਸ਼ ਅਤੇ 3 ਹੋਰ ਅੱਖਰ ਜਾਂ ਅੰਕ… | Pass 2: “3 more” could be digits, so “letters or digits”. |
| Invite friends | ਦੋਸਤਾਂ ਨੂੰ ਸੱਦੋ | Same verb as the old “ਕਿਸੇ ਦੋਸਤ ਨੂੰ ਸੱਦੋ”. |
| Redeem | ਰਿਡੀਮ ਕਰੋ | Loanword, as in payment apps. |
| Share it · friends get +10 drives | ਸਾਂਝਾ ਕਰੋ · ਦੋਸਤਾਂ ਨੂੰ +10 ਟ੍ਰਿਪ | Short; fits the pill. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | ਕਿਸੇ ਦੋਸਤ ਨੂੰ ਸੱਦਾ ਭੇਜੋ। ਜਦੋਂ ਉਹ ਇਸ ਰਾਹੀਂ MileMint ’ਤੇ ਆਵੇਗਾ, ਤਾਂ ਤੁਹਾਨੂੰ ਦੋਵਾਂ ਨੂੰ ਹਰ ਮਹੀਨੇ 10 ਵਾਧੂ ਮੁਫ਼ਤ ਆਟੋਮੈਟਿਕ ਟ੍ਰਿਪ ਮਿਲਣਗੇ। ਹਰ ਦੋਸਤ ਲਈ, ਬਿਨਾਂ ਕਿਸੇ ਹੱਦ ਦੇ। | “Send an invitation to a friend. When they come to MileMint through it, you both will get 10 extra free automatic trips every month. For every friend, without any limit.” *ਸੱਦਾ* as in “ਦੋਸਤਾਂ ਨੂੰ ਸੱਦੋ”. |
| Send an invite | ਸੱਦਾ ਭੇਜੋ | “Send invitation” Button, short. |
| Every invite has its own code, for one friend. | ਹਰ ਸੱਦੇ ਦਾ ਆਪਣਾ ਕੋਡ ਹੁੰਦਾ ਹੈ, ਇੱਕ ਦੋਸਤ ਲਈ। | “Every invitation has its own code, for one friend.” |
| Invites sent: {{count}} | ਭੇਜੇ ਸੱਦੇ: {{count}} | “Invitations sent: {{count}}” Counter label. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | ਸੱਦੇ iCloud ਰਾਹੀਂ ਪੱਕੇ ਹੁੰਦੇ ਹਨ, ਜੋ ਆਉਣ ਵਾਲੇ ਕਿਸੇ ਅੱਪਡੇਟ ਵਿੱਚ ਆਵੇਗਾ। ਉਸ ਤੋਂ ਪਹਿਲਾਂ ਜੁੜਨ ਵਾਲੇ ਦੋਸਤਾਂ ਨੂੰ ਇਸ ਦੇ ਚਾਲੂ ਹੁੰਦੇ ਹੀ ਵਾਧੂ ਟ੍ਰਿਪ ਮਿਲਣਗੇ, ਅਤੇ ਤੁਹਾਨੂੰ ਵੀ। | “Invitations are confirmed through iCloud, which will come in some upcoming update. Friends who join before that will get extra trips as soon as it’s on, and you too.” *ਪੱਕੇ* (made firm/confirmed) is the everyday word. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | ਤੁਸੀਂ {{code}} ਭਰਿਆ ਹੈ। ਸੱਦਾ ਪੱਕਾ ਹੁੰਦੇ ਹੀ ਤੁਹਾਡੇ 10 ਵਾਧੂ ਟ੍ਰਿਪ ਮਿਲ ਜਾਣਗੇ। | “You have entered {{code}}. As soon as the invitation is confirmed you will get your 10 extra trips.” |
| Code {{code}} saved | ਕੋਡ {{code}} ਸੇਵ ਹੋ ਗਿਆ | “Code {{code}} saved” Mirrors “ਕੋਡ {{code}} ਜੁੜ ਗਿਆ”. |
| Your 10 extra drives are on their way once the invite is confirmed. | ਸੱਦਾ ਪੱਕਾ ਹੁੰਦੇ ਹੀ ਤੁਹਾਡੇ 10 ਵਾਧੂ ਟ੍ਰਿਪ ਮਿਲ ਜਾਣਗੇ। | “As soon as the invitation is confirmed you will get your 10 extra trips.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | ਤੁਹਾਡਾ ਸੱਦਾ ਕੋਡ {{code}} ਹੈ। MileMint ਸੈੱਟ ਕਰਦੇ ਸਮੇਂ ਇਸ ਨੂੰ ਭਰੋ ਅਤੇ ਹਰ ਮਹੀਨੇ 10 ਵਾਧੂ ਮੁਫ਼ਤ ਟ੍ਰਿਪ ਪਾਓ। | “Your invitation code is {{code}}. Enter it while setting up MileMint and get 10 extra free trips every month.” |
| We couldn’t find that invite. Check the code with your friend. | ਇਹ ਸੱਦਾ ਨਹੀਂ ਮਿਲਿਆ। ਆਪਣੇ ਦੋਸਤ ਨਾਲ ਕੋਡ ਮਿਲਾ ਕੇ ਦੇਖੋ। | “This invitation wasn’t found. Match the code with your friend.” |
| That invite has already been used. Ask your friend to send you a new one. | ਇਹ ਸੱਦਾ ਪਹਿਲਾਂ ਹੀ ਵਰਤਿਆ ਜਾ ਚੁੱਕਾ ਹੈ। ਆਪਣੇ ਦੋਸਤ ਨੂੰ ਨਵਾਂ ਸੱਦਾ ਭੇਜਣ ਲਈ ਕਹੋ। | “This invitation has already been used. Ask your friend to send a new invitation.” |
| That’s one of your own invites. Send it to a friend instead. | ਇਹ ਤੁਹਾਡਾ ਆਪਣਾ ਸੱਦਾ ਹੈ। ਇਸ ਨੂੰ ਕਿਸੇ ਦੋਸਤ ਨੂੰ ਭੇਜੋ। | “This is your own invitation. Send it to a friend.” |
| This Apple Account has already joined with a friend’s invite. | ਇਹ Apple ਖਾਤਾ ਪਹਿਲਾਂ ਹੀ ਕਿਸੇ ਦੋਸਤ ਦੇ ਸੱਦੇ ਨਾਲ ਜੁੜ ਚੁੱਕਾ ਹੈ। | “This Apple account has already joined with a friend’s invitation.” *Apple ਖਾਤਾ* as in existing lines. |
| 🎉 Your friend’s invite is confirmed | 🎉 ਤੁਹਾਡੇ ਦੋਸਤ ਦਾ ਸੱਦਾ ਪੱਕਾ ਹੋ ਗਿਆ | “🎉 Your friend’s invitation is confirmed” |
| Your friend’s invite couldn’t be used | ਤੁਹਾਡੇ ਦੋਸਤ ਦਾ ਸੱਦਾ ਵਰਤਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ | “Your friend’s invitation couldn’t be used” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | ਸੇਵ ਹੈ · ਕੀਮਤ Pro ਨਾਲ ਅਨਲੌਕ ਹੋਵੇਗੀ | “Saved · the value will unlock with Pro.” *ਕੀਮਤ* per the glossary (never “money back”). |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | ਸੇਵ ਹੋ ਗਿਆ। ਇਸ ਮਹੀਨੇ ਦੇ ਮੁਫ਼ਤ ਟ੍ਰਿਪ ਵਰਤੇ ਜਾ ਚੁੱਕੇ ਹਨ, ਇਸ ਲਈ ਨਿੱਜੀ ਤੋਂ ਵਾਪਸ ਬਿਜ਼ਨਸ ਕੀਤੇ ਟ੍ਰਿਪ ਦੀ ਕੀਮਤ Pro ਨਾਲ ਦਿਸੇਗੀ। ਜਿਨ੍ਹਾਂ ਟ੍ਰਿਪਾਂ ਦੀ ਕੀਮਤ ਪਹਿਲਾਂ ਹੀ ਦਿਸਦੀ ਹੈ, ਉਹ ਬਣੀ ਰਹੇਗੀ। | “Saved. This month’s free trips are used, so a trip made business again from personal will show its value with Pro. Trips whose value already shows keep it.” *ਸੇਵ ਹੋ ਗਿਆ* agrees with *ਟ੍ਰਿਪ* (m.). |
| {{used}} of {{limit}} free work drives in {{month}} | {{month}} ਵਿੱਚ {{limit}} ਮੁਫ਼ਤ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪਾਂ ਵਿੱਚੋਂ {{used}} | “In {{month}}, {{used}} of {{limit}} free business trips”. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | ਮੁਫ਼ਤ: ਮਹੀਨੇ ਵਿੱਚ {{count}} ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ। ਨਿੱਜੀ ਟ੍ਰਿਪ ਨਹੀਂ ਗਿਣੇ ਜਾਂਦੇ, ਅਤੇ ਸ਼ਿਫਟ ਦਿਨ ਵਿੱਚ ਇੱਕ ਵਾਰ ਗਿਣੀ ਜਾਂਦੀ ਹੈ। ਹੱਥੀਂ ਜੋੜੇ ਟ੍ਰਿਪ ਹਮੇਸ਼ਾਂ ਮੁਫ਼ਤ ਹਨ। Pro: ਅਨਲਿਮਟਿਡ। | “Free: 40 business trips a month. Personal trips aren’t counted, and a shift is counted once a day. Trips added by hand are always free. Pro: unlimited.” |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | ਨਿੱਜੀ ਟ੍ਰਿਪ ਨਹੀਂ ਗਿਣੇ ਜਾਂਦੇ। ਕਿਸੇ ਟ੍ਰਿਪ ਨੂੰ ਨਿੱਜੀ ਛਾਂਟੋ, ਤਾਂ ਉਸ ਦੀ ਥਾਂ ਅਗਲੇ ਟ੍ਰਿਪ ਨੂੰ ਮਿਲ ਜਾਂਦੀ ਹੈ। | “Personal trips aren’t counted. Sort a trip as personal and the next trip gets its place.” *ਛਾਂਟੋ* (glossary). |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | ਲਿਮਿਟ ਤੋਂ ਬਾਅਦ ਵੀ ਕੁਝ ਲੁਕਦਾ ਜਾਂ ਗੁਆਚਦਾ ਨਹੀਂ: ਹਰ ਟ੍ਰਿਪ ਸੇਵ ਹੁੰਦਾ ਹੈ, ਪੂਰਾ ਦਿਸਦਾ ਹੈ, ਛਾਂਟਿਆ ਜਾ ਸਕਦਾ ਹੈ ਅਤੇ ਤੁਹਾਡੇ ਸਪ੍ਰੈਡਸ਼ੀਟ ਐਕਸਪੋਰਟ ਵਿੱਚ ਹੁੰਦਾ ਹੈ। ਸਿਰਫ਼ ਉਸ ਦੀ ਕੀਮਤ Pro ਦੀ ਉਡੀਕ ਕਰਦੀ ਹੈ। | “Even after the limit nothing hides or gets lost: every trip is saved, shows in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro.” |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | ਮਹੀਨੇ ਦੇ ਸਭ ਤੋਂ ਪਹਿਲੇ ਟ੍ਰਿਪ ਪਹਿਲਾਂ ਗਿਣੇ ਜਾਂਦੇ ਹਨ, ਇਸ ਲਈ ਜਿਸ ਟ੍ਰਿਪ ਦੀ ਕੀਮਤ ਦਿਸਦੀ ਹੈ, ਉਹ ਬਣੀ ਰਹਿੰਦੀ ਹੈ। ਗਿਣਤੀ ਹਰ ਮਹੀਨੇ ਦੀ 1 ਤਾਰੀਖ਼ ਨੂੰ ਮੁੜ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ। | “The month’s very first trips are counted first, so a trip whose value shows keeps it. Counting starts again on the 1st of every month.” “Got it” is *ਠੀਕ ਹੈ*. |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}} ਟ੍ਰਿਪ / other: {{count}} ਟ੍ਰਿਪ | “{{count}} trip(s)” |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: ਉਦੋਂ ਤੋਂ {{count}} ਟ੍ਰਿਪ ਡਿਲੀਵਰੀ ਵਰਗਾ ਲੱਗਦਾ ਹੈ। ਇਸਨੂੰ ਬਿਜ਼ਨਸ ਵਜੋਂ ਸ਼ਿਫਟ ਵਿੱਚ ਜੋੜ ਦਿੱਤਾ ਜਾਵੇਗਾ। / other: ਉਦੋਂ ਤੋਂ {{count}} ਟ੍ਰਿਪ ਡਿਲੀਵਰੀਆਂ ਵਰਗੇ ਲੱਗਦੇ ਹਨ। ਇਨ੍ਹਾਂ ਨੂੰ ਬਿਜ਼ਨਸ ਵਜੋਂ ਸ਼ਿਫਟ ਵਿੱਚ ਜੋੜ ਦਿੱਤਾ ਜਾਵੇਗਾ। | “Since then {{count}} trips seem like deliveries. They will be added to the shift as business.” ਟ੍ਰਿਪ masculine, as elsewhere. |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}} ਛਾਂਟਣਾ ਬਾਕੀ / other: {{purpose}} · {{count}} ਛਾਂਟਣੇ ਬਾਕੀ | “{{purpose}} · {{count}} left to sort” Singular/plural infinitive agreement. |
| After your shift ended · not counted as work unless you say so | ਸ਼ਿਫਟ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਬਾਅਦ · ਜਦ ਤੱਕ ਤੁਸੀਂ ਨਾ ਚੁਣੋ, ਕੰਮ ਵਿੱਚ ਨਹੀਂ ਗਿਣਿਆ ਜਾਂਦਾ | “After the shift ends · not counted as work unless you choose” |
| Deliveries | ਡਿਲੀਵਰੀਆਂ | “Deliveries” |
| Did your shift start at {{time}}? | ਕੀ ਤੁਹਾਡੀ ਸ਼ਿਫਟ {{time}} ਵਜੇ ਸ਼ੁਰੂ ਹੋਈ ਸੀ? | “Did your shift start at {{time}} o’clock?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | ਟ੍ਰਿਪ ਆਪਣੇ ਸ਼ੁਰੂ ਹੋਣ ਦੇ ਸਮੇਂ ਮੁਤਾਬਕ ਸ਼ਿਫਟ ਵਿੱਚ ਜੁੜਦੇ ਜਾਂ ਹਟਦੇ ਹਨ। ਸ਼ਿਫਟ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਬਾਅਦ ਵੀ ਚੱਲਦਾ ਟ੍ਰਿਪ ਉੱਥੋਂ ਦੋ ਹਿੱਸਿਆਂ ਵਿੱਚ ਵੰਡ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ। | “Trips join or leave the shift by their start time. A trip still running after the shift ends is divided into two parts there.” |
| During a pause in your shift · not counted as work unless you say so | ਸ਼ਿਫਟ ਦੀ ਬ੍ਰੇਕ ਦੌਰਾਨ · ਜਦ ਤੱਕ ਤੁਸੀਂ ਨਾ ਚੁਣੋ, ਕੰਮ ਵਿੱਚ ਨਹੀਂ ਗਿਣਿਆ ਜਾਂਦਾ | “During the shift’s break · not counted as work unless you choose” |
| End 15 minutes earlier | ਖ਼ਤਮ ਹੋਣ ਦਾ ਸਮਾਂ 15 ਮਿੰਟ ਪਹਿਲਾਂ ਕਰੋ | “Make the end time 15 minutes earlier” |
| End 15 minutes later | ਖ਼ਤਮ ਹੋਣ ਦਾ ਸਮਾਂ 15 ਮਿੰਟ ਬਾਅਦ ਕਰੋ | “Make the end time 15 minutes later” |
| End your shift? | ਸ਼ਿਫਟ ਖ਼ਤਮ ਕਰਨੀ ਹੈ? | “Want to end the shift?” |
| Ended {{time}} | {{time}} ਵਜੇ ਖ਼ਤਮ | “Ended at {{time}}” |
| Hide drives ▴ | ਟ੍ਰਿਪ ਲੁਕਾਓ ▴ | “Hide trips ▴” |
| Hides the drives in this shift | ਇਸ ਸ਼ਿਫਟ ਦੇ ਟ੍ਰਿਪ ਲੁਕਾਉਂਦਾ ਹੈ | “Hides this shift’s trips” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | ਇਹ ਅਜੇ ਵੀ ਚੱਲ ਰਹੀ ਸੀ, ਇਸ ਲਈ MileMint ਨੇ ਇਸਨੂੰ ਖ਼ਤਮ ਕਰ ਦਿੱਤਾ। ਹੁਣ ਤੋਂ ਦੇ ਟ੍ਰਿਪ ਤੁਸੀਂ ਆਪ ਛਾਂਟਣੇ ਹਨ। ਸਮਾਂ ਚੈੱਕ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ। | “It was still running, so MileMint ended it. Trips from now you have to sort yourself. Tap to check the time.” |
| Map of the drives in this shift | ਇਸ ਸ਼ਿਫਟ ਦੇ ਟ੍ਰਿਪਾਂ ਦਾ ਨਕਸ਼ਾ | “Map of this shift’s trips” |
| On shift | ਸ਼ਿਫਟ ’ਤੇ | “On shift” |
| Pause | ਬ੍ਰੇਕ | “Break” |
| Pause the shift for a personal errand | ਨਿੱਜੀ ਕੰਮ ਲਈ ਸ਼ਿਫਟ ’ਤੇ ਬ੍ਰੇਕ ਲਓ | “Take a break in the shift for personal work” |
| Paused · {{elapsed}} | ਬ੍ਰੇਕ ’ਤੇ · {{elapsed}} | “On break · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | ਬ੍ਰੇਕ ’ਤੇ: ਹੁਣ ਦੇ ਟ੍ਰਿਪ ਕੰਮ ਵਿੱਚ ਨਹੀਂ ਗਿਣੇ ਜਾਂਦੇ। ਵਾਪਸ ਆ ਕੇ ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ। | “On break: trips now aren’t counted as work. Come back and start again.” |
| Resume | ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ | “Start again” |
| Resume the shift | ਸ਼ਿਫਟ ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ | “Start the shift again” |
| Shift | ਸ਼ਿਫਟ | “Shift” |
| Shift ended | ਸ਼ਿਫਟ ਖ਼ਤਮ ਹੋਈ | “Shift ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | {{date}} ਦੀ ਸ਼ਿਫਟ, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift of {{date}}, …” |
| Show drives ▾ | ਟ੍ਰਿਪ ਦਿਖਾਓ ▾ | “Show trips ▾” |
| Shows the drives in this shift | ਇਸ ਸ਼ਿਫਟ ਦੇ ਟ੍ਰਿਪ ਦਿਖਾਉਂਦਾ ਹੈ | “Shows this shift’s trips” |
| Since {{time}} | {{time}} ਤੋਂ | “From {{time}}” |
| Start 15 minutes earlier | ਸ਼ੁਰੂ ਹੋਣ ਦਾ ਸਮਾਂ 15 ਮਿੰਟ ਪਹਿਲਾਂ ਕਰੋ | “Make the start time 15 minutes earlier” |
| Start 15 minutes later | ਸ਼ੁਰੂ ਹੋਣ ਦਾ ਸਮਾਂ 15 ਮਿੰਟ ਬਾਅਦ ਕਰੋ | “Make the start time 15 minutes later” |
| Start from {{time}} | {{time}} ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ | “Start from {{time}}” |
| Start shift from {{time}}? | ਸ਼ਿਫਟ {{time}} ਤੋਂ ਸ਼ੁਰੂ ਕਰਨੀ ਹੈ? | “Want to start the shift from {{time}}?” |
| Started {{time}} | {{time}} ਵਜੇ ਸ਼ੁਰੂ | “Started at {{time}}” |
| Still working | ਅਜੇ ਕੰਮ ’ਤੇ ਹਾਂ | “Still at work” |
| Undo | ਵਾਪਸ ਲਓ | “Take back” iOS has no Punjabi UI; plain everyday words. |
| Undo ending the shift | ਸ਼ਿਫਟ ਖ਼ਤਮ ਕਰਨਾ ਵਾਪਸ ਲਓ | “Take back ending the shift” |
| Where your shift ended | ਜਿੱਥੇ ਸ਼ਿਫਟ ਖ਼ਤਮ ਹੋਈ | “Where the shift ended” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | ਤੁਸੀਂ ਕਾਫ਼ੀ ਦੇਰ ਤੋਂ ਘਰ ਪਾਰਕ ਹੋ ਅਤੇ ਤੁਹਾਡੀ ਸ਼ਿਫਟ ਅਜੇ ਵੀ ਚੱਲ ਰਹੀ ਹੈ। ਸ਼ਿਫਟ ਖ਼ਤਮ ਹੋਣ ਤੋਂ ਬਾਅਦ ਦੇ ਟ੍ਰਿਪ ਕੰਮ ਵਿੱਚ ਨਹੀਂ ਗਿਣੇ ਜਾਂਦੇ। | “You’ve been parked at home for quite a while and your shift is still running. Trips after the shift ends aren’t counted as work.” |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | ਤੁਸੀਂ {{time}} ਵਜੇ ਤੋਂ ਘਰ ਪਾਰਕ ਹੋ। ਸ਼ਿਫਟ ਤੋਂ ਬਾਅਦ ਦੇ ਟ੍ਰਿਪ ਕੰਮ ਵਿੱਚ ਨਹੀਂ ਗਿਣੇ ਜਾਂਦੇ। | “You’ve been parked at home since {{time}}. Trips after the shift aren’t counted as work.” |
| Your shift ended after 16 hours | ਤੁਹਾਡੀ ਸ਼ਿਫਟ 16 ਘੰਟਿਆਂ ਬਾਅਦ ਖ਼ਤਮ ਹੋ ਗਈ | “Your shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “ਟ੍ਰੈਕਿੰਗ ਦੀ ਜਾਂਚ” row and background notifications. 24 new lines. Terms: *ਟ੍ਰਿਪ* (m.), *ਟ੍ਰੈਕਿੰਗ*, *ਦਰਜ*, *ਰਹਿ ਗਿਆ*, ਤੁਸੀਂ. iOS wording: *ਸੈਟਿੰਗਾਂ*, *ਟਿਕਾਣਾ*, *ਸਹੀ ਟਿਕਾਣਾ* (best guess, as iOS may show English here: see Unsure). Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | ਸਹੀ ਟਿਕਾਣਾ ਬੰਦ ਹੈ | “Precise location is off”. Unsure: Apple’s Punjabi toggle name not confirmed. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint ਨੂੰ ਸਿਰਫ਼ ਅੰਦਾਜ਼ਨ ਟਿਕਾਣਾ ਮਿਲ ਰਿਹਾ ਹੈ, ਇਸ ਲਈ ਟ੍ਰਿਪ ਮਾਪੇ ਨਹੀਂ ਜਾ ਸਕਦੇ। ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਟਿਕਾਣਾ ’ਤੇ ਟੈਪ ਕਰੋ ਅਤੇ ਸਹੀ ਟਿਕਾਣਾ ਚਾਲੂ ਕਰੋ। | “MileMint is only getting a rough location, so trips can’t be measured. In Settings tap Location and turn on Precise Location.” |
| Tracking has stopped | ਟ੍ਰੈਕਿੰਗ ਰੁਕ ਗਈ ਹੈ | “Tracking has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | ਆਟੋਮੈਟਿਕ ਟ੍ਰੈਕਿੰਗ ਚੱਲਣੀ ਬੰਦ ਹੋ ਗਈ ਹੈ, ਇਸ ਲਈ ਨਵੇਂ ਟ੍ਰਿਪ ਦਰਜ ਨਹੀਂ ਹੋ ਰਹੇ। | “Automatic tracking has stopped running, so new trips aren’t being recorded.” |
| Tracking may have stopped | ਹੋ ਸਕਦਾ ਹੈ ਟ੍ਰੈਕਿੰਗ ਰੁਕ ਗਈ ਹੋਵੇ | “It may be that tracking has stopped”. |
| No location since {{time}}, in the middle of a drive. | ਟ੍ਰਿਪ ਦੇ ਵਿਚਕਾਰ {{time}} ਤੋਂ ਕੋਈ ਟਿਕਾਣਾ ਨਹੀਂ ਮਿਲਿਆ। | “In the middle of the trip, no location since {{time}}.” |
| Turn tracking back on | ਟ੍ਰੈਕਿੰਗ ਮੁੜ ਚਾਲੂ ਕਰੋ | “Turn tracking on again”. |
| Tracking stopped {{from}}–{{to}} | ਟ੍ਰੈਕਿੰਗ {{from}}–{{to}} ਰੁਕੀ ਰਹੀ | “Tracking stayed stopped {{from}}–{{to}}”. |
| A drive may have been missed | ਹੋ ਸਕਦਾ ਹੈ ਇੱਕ ਟ੍ਰਿਪ ਰਹਿ ਗਿਆ ਹੋਵੇ | “It may be that one trip was left”. *ਰਹਿ ਗਿਆ* as in “ਰਹਿ ਗਿਆ ਟ੍ਰਿਪ ਜੋੜੋ”. |
| About {{distance}} may be missing. Add the missed trip? | ਲਗਭਗ {{distance}} ਰਹਿ ਗਏ ਹੋ ਸਕਦੇ ਹਨ। ਰਹਿ ਗਿਆ ਟ੍ਰਿਪ ਜੋੜਨਾ ਹੈ? | “About {{distance}} may have been left. Add the left-out trip?” |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | ਤੁਹਾਡਾ ਫ਼ੋਨ {{from}} ਤੋਂ {{to}} ਵਿਚਕਾਰ ਲਗਭਗ {{distance}} ਅੱਗੇ ਗਿਆ, ਪਰ ਕੋਈ ਟ੍ਰਿਪ ਦਰਜ ਨਹੀਂ ਹੋਇਆ। ਰਹਿ ਗਿਆ ਟ੍ਰਿਪ ਜੋੜਨਾ ਹੈ? | “Your phone went about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Add the left-out trip?” |
| Not a drive | ਇਹ ਟ੍ਰਿਪ ਨਹੀਂ ਸੀ | “This wasn’t a trip”. |
| All good | ਸਭ ਠੀਕ ਹੈ | “All is fine”. |
| just now | ਹੁਣੇ-ਹੁਣੇ | “just now”. |
| {{count}} minutes ago | one: {{count}} ਮਿੰਟ ਪਹਿਲਾਂ / other: {{count}} ਮਿੰਟ ਪਹਿਲਾਂ | “{{count}} minute(s) ago”. |
| {{count}} hours ago | one: {{count}} ਘੰਟਾ ਪਹਿਲਾਂ / other: {{count}} ਘੰਟੇ ਪਹਿਲਾਂ | “{{count}} hour(s) ago”: ਘੰਟਾ/ਘੰਟੇ. |
| {{count}} days ago | one: {{count}} ਦਿਨ ਪਹਿਲਾਂ / other: {{count}} ਦਿਨ ਪਹਿਲਾਂ | “{{count}} day(s) ago”. |
| Tracking check | ਟ੍ਰੈਕਿੰਗ ਦੀ ਜਾਂਚ | “Tracking check”. |
| Last location: {{ago}} | ਆਖ਼ਰੀ ਟਿਕਾਣਾ: {{ago}} | “Last location: {{ago}}”. |
| No location yet | ਹਾਲੇ ਕੋਈ ਟਿਕਾਣਾ ਨਹੀਂ | “No location yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | MileMint ਲਈ ਟਿਕਾਣੇ ਦੀ ਇਜਾਜ਼ਤ ਬੰਦ ਹੈ, ਇਸ ਲਈ ਟ੍ਰਿਪ ਦਰਜ ਨਹੀਂ ਹੋ ਰਹੇ। ਮੁੜ ਚਾਲੂ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ। | “Location permission for MileMint is off, so trips aren’t being recorded. Tap to turn it on again.” |
| Drives can’t be measured from a rough position. Tap to fix it. | ਅੰਦਾਜ਼ਨ ਟਿਕਾਣੇ ਨਾਲ ਟ੍ਰਿਪ ਮਾਪੇ ਨਹੀਂ ਜਾ ਸਕਦੇ। ਠੀਕ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ। | “With a rough location trips can’t be measured. Tap to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | ਨਵੇਂ ਟ੍ਰਿਪ ਦਰਜ ਨਹੀਂ ਹੋ ਰਹੇ। ਟ੍ਰੈਕਿੰਗ ਮੁੜ ਚਾਲੂ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ। | “New trips aren’t being recorded. Tap to turn tracking on again.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | ਟ੍ਰਿਪ ਦੇ ਵਿਚਕਾਰ {{time}} ਤੋਂ ਕੋਈ ਟਿਕਾਣਾ ਨਹੀਂ ਮਿਲਿਆ। ਟ੍ਰੈਕਿੰਗ ਮੁੜ ਸ਼ੁਰੂ ਕਰਨ ਲਈ MileMint ਖੋਲ੍ਹੋ। | “In the middle of the trip, no location since {{time}}. Open MileMint to start tracking again.” |

**Sign-off:** approved, pending an on-device check of the iOS wording.


## Round 8: pre-release fixes

| English | pa | Back-translation | Note |
|---|---|---|---|
| Where your shift started | ਜਿੱਥੇ ਸ਼ਿਫਟ ਸ਼ੁਰੂ ਹੋਈ | Where the shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | pa | Back-translation | Note |
|---|---|---|---|
| Opens trip details | ਟ੍ਰਿਪ ਦਾ ਵੇਰਵਾ ਖੋਲ੍ਹਦਾ ਹੈ | Opens the trip details | Matches the row’s existing hint. |
| Usual purpose · tap to change | ਆਮ ਮਕਸਦ · ਬਦਲਣ ਲਈ ਟੈਪ ਕਰੋ | Usual purpose · tap to change | *ਮਕਸਦ* as in “ਬਿਜ਼ਨਸ ਮਕਸਦ”. |
| Purpose needed for your tax records | ਟੈਕਸ ਰਿਕਾਰਡ ਲਈ ਮਕਸਦ ਲੋੜੀਂਦਾ ਹੈ | A purpose is required for tax records | Natural, fits its place. |
| Shows only the drives that need a purpose | ਸਿਰਫ਼ ਉਹ ਟ੍ਰਿਪ ਦਿਖਾਉਂਦਾ ਹੈ ਜਿਨ੍ਹਾਂ ਨੂੰ ਮਕਸਦ ਚਾਹੀਦਾ ਹੈ | Shows only the trips that need a purpose | Natural, fits its place. |
| {{count}} work drives need a purpose | one: {{count}} ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਨੂੰ ਮਕਸਦ ਚਾਹੀਦਾ ਹੈ / other: {{count}} ਬਿਜ਼ਨਸ ਟ੍ਰਿਪਾਂ ਨੂੰ ਮਕਸਦ ਚਾਹੀਦਾ ਹੈ | {{count}} business trip(s) need a purpose | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦਾ ਮਕਸਦ ਮੰਗਦਾ ਹੈ। ਹਰ ਇੱਕ ਲਈ ਬੱਸ ਇੱਕ ਟੈਪ। | {{authority}} asks for every business trip’s purpose. Just one tap for each. | Natural, fits its place. |
| Add purposes › | ਮਕਸਦ ਜੋੜੋ › | Add purposes › | Natural, fits its place. |
| Every work drive has a purpose ✓ | ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦਾ ਮਕਸਦ ਹੈ ✓ | Every business trip has a purpose ✓ | Natural, fits its place. |
| Show all drives | ਸਾਰੇ ਟ੍ਰਿਪ ਦਿਖਾਓ | Show all trips | Natural, fits its place. |
| {{count}} work drives have no purpose | one: {{count}} ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦਾ ਕੋਈ ਮਕਸਦ ਨਹੀਂ / other: {{count}} ਬਿਜ਼ਨਸ ਟ੍ਰਿਪਾਂ ਦਾ ਕੋਈ ਮਕਸਦ ਨਹੀਂ | {{count}} business trip(s) have no purpose | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦਾ ਮਕਸਦ ਮੰਗਦਾ ਹੈ। ਐਕਸਪੋਰਟ ਤੋਂ ਪਹਿਲਾਂ ਜੋੜਨੇ ਹਨ? | {{authority}} asks for every business trip’s purpose. Add them before export? | Natural, fits its place. |
| Export anyway | ਫਿਰ ਵੀ ਐਕਸਪੋਰਟ ਕਰੋ | Export anyway | Natural, fits its place. |
| Add purposes | ਮਕਸਦ ਜੋੜੋ | Add purposes | Natural, fits its place. |
| Usual business purpose | ਆਮ ਬਿਜ਼ਨਸ ਮਕਸਦ | Usual business purpose | Natural, fits its place. |
| Clear | ਹਟਾਓ | Remove | “ਮਿਟਾਓ” is kept for deleting trips. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | ਜਿਨ੍ਹਾਂ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪਾਂ ਦਾ ਮਕਸਦ ਨਹੀਂ, ਉਨ੍ਹਾਂ ਵਿੱਚ ਇਹ ਭਰਿਆ ਜਾਂਦਾ ਹੈ, ਤਾਂ ਜੋ ਤੁਹਾਡੇ ਟੈਕਸ ਰਿਕਾਰਡ ਪੂਰੇ ਰਹਿਣ। ਸ਼ਿਫਟ ਦੇ ਟ੍ਰਿਪ “ਡਿਲੀਵਰੀਆਂ” ਵਰਤਦੇ ਹਨ, ਜਦ ਤੱਕ ਤੁਸੀਂ ਕੋਈ ਹੋਰ ਨਾ ਚੁਣੋ। | It is filled into business trips without a purpose, so your tax records stay complete. Shift trips use “Deliveries” unless you choose another. | *ਸ਼ਿਫਟ* as in “ਆਟੋ: ਸ਼ਿਫਟ ’ਤੇ”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | ਜਿਨ੍ਹਾਂ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪਾਂ ਦਾ ਮਕਸਦ ਨਹੀਂ, ਉਨ੍ਹਾਂ ਵਿੱਚ ਇਹ ਭਰਿਆ ਜਾਂਦਾ ਹੈ, ਤਾਂ ਜੋ ਤੁਹਾਡੇ ਟੈਕਸ ਰਿਕਾਰਡ ਪੂਰੇ ਰਹਿਣ। ਤੁਸੀਂ ਇਸਨੂੰ ਕਿਸੇ ਵੀ ਟ੍ਰਿਪ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ। | It is filled into business trips without a purpose, so your tax records stay complete. You can change it in any trip. | Natural, fits its place. |
| None: ask me each time | ਕੋਈ ਨਹੀਂ: ਹਰ ਵਾਰ ਪੁੱਛੋ | None: ask every time | Natural, fits its place. |
| What are most of your work drives for? | ਤੁਹਾਡੇ ਜ਼ਿਆਦਾਤਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਕਿਸ ਕੰਮ ਲਈ ਹੁੰਦੇ ਹਨ? | What work are most of your business trips for? | Natural, fits its place. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | ਟੈਕਸ ਵਿਭਾਗ ਹਰ ਬਿਜ਼ਨਸ ਟ੍ਰਿਪ ਦਾ ਮਕਸਦ ਮੰਗਦਾ ਹੈ। ਅਸੀਂ ਇਹ ਤੁਹਾਡੇ ਲਈ ਭਰ ਦੇਵਾਂਗੇ, ਅਤੇ ਤੁਸੀਂ ਇਸਨੂੰ ਕਿਸੇ ਵੀ ਟ੍ਰਿਪ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ। | The tax department asks for every business trip’s purpose. We’ll fill it in for you, and you can change it in any trip. | Natural, fits its place. |


## Round 8c: work purpose tiles

Back-translations: Choose all that apply. Whichever you choose first, we'll fill in for you. / Will be filled in for you / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | pa | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | ਕੋਈ ਖਾਤਾ ਨਹੀਂ। ਤੁਹਾਡੇ ਟ੍ਰਿਪ ਤੁਹਾਡੇ ਫ਼ੋਨ ’ਤੇ ਹੀ ਰਹਿੰਦੇ ਹਨ। | No account. Your trips stay on your phone only. | *ਫ਼ੋਨ* instead of iPhone; otherwise as the old line. |
| Is this home? {{place}} | ਕੀ ਇਹ ਘਰ ਹੈ? {{place}} | Is this home? {{place}} | *ਘਰ* as in “Home”. |
| You stopped here for the night. Trips to and from it will read “Home”. | ਤੁਸੀਂ ਰਾਤ ਇੱਥੇ ਹੀ ਕੱਟੀ। ਇੱਥੋਂ ਆਉਣ-ਜਾਣ ਵਾਲੇ ਟ੍ਰਿਪਾਂ ’ਤੇ “ਘਰ” ਲਿਖਿਆ ਆਵੇਗਾ। | You spent the night right here. Trips coming and going from here will say “Home”. | *ਰਾਤ ਕੱਟੀ* is the everyday “spent the night”. |
| Yes, that’s home | ਹਾਂ, ਇਹ ਘਰ ਹੈ | Yes, this is home |  |
| No | ਨਹੀਂ | No |  |
| Is this work? {{place}} | ਕੀ ਇਹ ਕੰਮ ਦੀ ਥਾਂ ਹੈ? {{place}} | Is this the place of work? {{place}} | *ਕੰਮ ਦੀ ਥਾਂ* in the question; the saved place reads *ਕੰਮ* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | ਕੰਮ ਦੇ ਘੰਟਿਆਂ ਵਿੱਚ ਤੁਹਾਡੀ ਗੱਡੀ ਅਕਸਰ ਇੱਥੇ ਖੜ੍ਹੀ ਹੁੰਦੀ ਹੈ। ਟ੍ਰਿਪਾਂ ’ਤੇ “ਕੰਮ” ਲਿਖਿਆ ਆਵੇਗਾ, ਅਤੇ ਘਰ-ਕੰਮ ਆਉਣ-ਜਾਣ ਵੱਖਰਾ ਪਛਾਣਿਆ ਜਾਵੇਗਾ। | In work hours your vehicle is often parked here. Trips will say “Work”, and home-work travel will be recognised separately. | *ਘਰ-ਕੰਮ ਆਉਣ-ਜਾਣ* as in the old places line. |
| Yes, that’s work | ਹਾਂ, ਇਹ ਕੰਮ ਦੀ ਥਾਂ ਹੈ | Yes, this is the place of work |  |
