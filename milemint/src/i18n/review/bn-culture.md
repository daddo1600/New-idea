# Bengali (bn): cultural and UX-copy review (check 3 of 3)

Reviewer: native Bangla speaker from the UK Bangladeshi community, also familiar with Indian (West Bengal) Bengali and with London courier and minicab drivers.

## Scope

- **Lines read:** all 662 entries in `src/i18n/locales/bn.ts`. I also checked the source files for the lines whose context matters: `domain/reminders.ts`, `domain/seasons.ts`, `milestones/copy.ts`, `app/welcome.tsx`, `app/milestones.tsx`, `app/index.tsx`, `app/settings.tsx`, `components/purpose-picker.tsx` and `components/header-menu.tsx`.
- **Lines changed:** 30 entries. Keys, placeholders, `<b>` tags and plural objects are unchanged.
- **Tests:** `npx jest src/i18n` passes (31/31).
- **Glossary:** `src/i18n/glossary/bn.md` now matches the final terms: সবসময়, নোটিফিকেশন, the short button forms, the money wording, the unit-neutral rule and the rewritten jokes.

## Changes

| English | Before | After | Why |
|---|---|---|---|
| Never miss a mile. | একটি মাইলও বাদ যাবে না। | একটা ট্রিপও বাদ যাবে না। | Units. Onboarding headline shown in every country, so it shouldn't name miles to Canadian or Australian users. |
| Every business mile, counted. | প্রতিটি ব্যবসায়িক মাইলের হিসাব। | প্রতিটি ব্যবসায়িক ট্রিপের হিসাব। | Units. Welcome-screen tagline shown in every country. |
| {{achievement}} on MileMint {{emoji}} The mileage app that counts every mile. | …প্রতিটি মাইল গোনে এমন মাইলেজ অ্যাপ। | …প্রতিটি ট্রিপের হিসাব রাখে এমন মাইলেজ অ্যাপ। | Units. Habit-milestone share text, used in every country. |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | …প্রতিটি মাইল গোনা, অটোমেটিক। | …প্রতিটি ট্রিপের হিসাব, অটোমেটিক। | Units. Money-milestone share text, used in every country. |
| Sunny days, business miles ☀️ | রোদেলা দিন, ব্যবসায়িক মাইল ☀️ | রোদেলা দিন, ব্যবসায়িক ট্রিপ ☀️ | Units. The summer greeting is also shown in Canada (km). |
| Autumn miles add up 🍂 | শরতের মাইল জমে উঠছে 🍂 | শরতে ট্রিপের হিসাব জমছে 🍂 | Units. Australia gets this line, and Australia uses km. Also, "জমে উঠছে" means "getting lively", not "adding up"; "হিসাব জমছে" says the total is growing. |
| Fall miles add up 🍂 | শরতের মাইল জমে উঠছে 🍂 | শরতে ট্রিপের হিসাব জমছে 🍂 | Units. Canada gets this line, and Canada uses km. Same wording fix as Autumn. |
| Missed miles check | বাদ পড়া মাইল যাচাই | বাদ পড়া দূরত্ব যাচাই | Units. Screen title and menu item in every country. দূরত্ব (distance) is neutral. |
| {{amount}} back in your pocket | {{amount}} আপনার পকেটে ফিরল | {{amount}} এখন আপনার পাওনার খাতায় | Money honesty. "পকেটে ফিরল" says the cash has already been returned. The amount is an estimated deduction value, not money paid out. The new line, "now in your what-you're-owed ledger", is still celebratory. |
| MileMint has now found {{amount}} … That’s real money back at tax time. | …ট্যাক্সের সময় এটা সত্যিকারের টাকা ফেরত। | …ট্যাক্সের সময় এর সত্যিকারের দাম আছে। | Money honesty. "টাকা ফেরত" reads as "a refund of {{amount}}", but a deduction lowers taxable profit and isn't refunded in full. New: "it has real value at tax time". |
| Sort your drives … before {{date}}. Every business mile is money back. | …প্রতিটি ব্যবসায়িক মাইল মানেই টাকা ফেরত। | …প্রতিটি ব্যবসায়িক মাইলেরই দাম আছে। | Money honesty. Same refund implication as the line above. "Every business mile has value." This is the miles variant of a pair, so মাইল stays. |
| Sort your drives … before {{date}}. Every business kilometre is money back. | …প্রতিটি ব্যবসায়িক কিলোমিটার মানেই টাকা ফেরত। | …প্রতিটি ব্যবসায়িক কিলোমিটারেরই দাম আছে। | Same as above, km variant. |
| Money back | টাকা ফেরত | টাকার হিসাব | Money honesty. Milestones section header. "টাকা ফেরত" is the word for a refund. "টাকার হিসাব" (money tally) is accurate and short. |
| Your money back and badges | আপনার টাকা ফেরত আর ব্যাজ | আপনার টাকার হিসাব আর ব্যাজ | Matches the section header above. |
| Free money alert 💸 | ফ্রি টাকার খবর 💸 | টাকা ফেলে রাখবেন না 💸 | Scam tone. "ফ্রি টাকা" is exactly how scam SMS and WhatsApp messages in the community start, and a notification with this title could be mistaken for one. "Don't leave money lying around" keeps the joke, and the body line ("well, it's your money anyway") still lands. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | …ফেরত পেতে এই সপ্তাহের ট্রিপ বাছাই করুন। | …দাবি করতে এই সপ্তাহের ট্রিপ বাছাই করুন। | Money honesty. "ফেরত পেতে" (to get it back) promises a result. "দাবি করতে" (to claim it) matches the English "claim". |
| Plot twist: driving pays | চমক: ড্রাইভিংয়েও টাকা আসে | চমক: ড্রাইভিংয়েরও দাম আছে | Money honesty and tone. "Money comes in from driving" sounds like an earnings or side-hustle ad, and couriers already get paid to drive. "Your driving has value too" keeps the twist. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | …আর দেখুন কত টাকা ফেরত পেলেন। | …আর দেখুন কত টাকা দাবি করার মতো জমল। | Money honesty. This is one of the two lines check 2 suggested softening. "How much money you got back" states money as already received. New: "how much has built up to claim". |
| Employees reimbursed at CRA’s per-km rate: the figure above is what your employer can pay you tax-free. | যেসব কর্মচারী CRA-র প্রতি-কিমি রেটে টাকা ফেরত পান: ওপরের অঙ্কটি আপনার নিয়োগকর্তা আপনাকে … | আপনি কর্মচারী হলে এবং CRA-র প্রতি-কিমি রেটে টাকা ফেরত পেলে: ওপরের অঙ্কটি আপনার নিয়োগকর্তা আপনাকে … | The second line check 2 suggested softening. The old line switched from third person to আপনি in mid-sentence. It now addresses the user throughout. |
| Swipe right on savings | টাকা বাঁচাতে ডানে সোয়াইপ | ডানে সোয়াইপ, হিসাব সহজ | Money honesty and joke fit. "Swipe right to save money" promises savings. The dating-app pun doesn't carry over for much of this audience, and some readers find dating references inappropriate. "Swipe right, sums made easy" is rhythmic and safe. The body line's "সপ্তাহের সবচেয়ে সহজ ম্যাচ" stays, because ম্যাচ also reads as a cricket match. |
| Game on! 🎯 | খেলা শুরু! 🎯 | শুরু হয়ে যাক! 🎯 | Political sensitivity. "খেলা হবে" was a party election slogan in West Bengal (2021) and is used in Bangladeshi politics too. "খেলা শুরু!" is close enough to call it to mind. "শুরু হয়ে যাক!" (let's get going) has no such association. I also avoided "মিশন", which can suggest a religious mission in Bengal. |
| A (slightly cheeky) nudge on Sunday evening to sort the week’s drives. | …একটা (একটু দুষ্টু) তাগাদা। | …একটা (একটু মজার) তাগাদা। | Tone. "দুষ্টু" is what you call a naughty child, and in some contexts it's flirtatious. "মজার" (playful, fun) is safe in both countries. |
| A quick (slightly cheeky) reminder each Sunday evening … | …ছোট্ট (একটু দুষ্টু) রিমাইন্ডার… | …ছোট্ট (একটু মজার) রিমাইন্ডার… | Same as above. |
| Future you says thanks 🙌 | ভবিষ্যতের আপনি ধন্যবাদ দেবেন 🙌 | পরে নিজেই নিজেকে ধন্যবাদ দেবেন 🙌 | Naturalness. "The future you will thank" is a literal calque that reads oddly. "You'll thank yourself later" is how people actually say it. |
| Use | ব্যবহার করুন | নিন | UI fit. Small button beside the purpose text box, and the old label was 2.7× the English. "নিন" (take it) is clear next to the typed text. |
| Use now | এখন ব্যবহার করুন | বেছে নিন | UI fit. Small link on a vehicle row, opposite "এখন চালাচ্ছেন". The old label was 1.7×. "বেছে নিন" matches the glossary's "choose". |
| Save | সেভ করুন | সেভ | UI fit. Header-bar button (trip, country). The bare form matches বাতিল and সম্পন্ন in the same bar. Longer buttons such as "ট্রিপ সেভ করুন" keep করুন. |
| Trips | ট্রিপগুলো | ট্রিপ | UI fit. Small list heading that shares a row with the Select actions. |
| Tap here | এখানে ট্যাপ করুন | এখানে ট্যাপ | UI fit. Badge pointing at the "Always" row in the iOS guide. |
| Select {{count}} unsorted (one/other) | বাছাই না হওয়া {{count}}টি নির্বাচন করুন | বাছাই-বাকি {{count}}টি নির্বাচন | UI fit. Small link that shares the "Trips" row with Cancel. It's now about 30% shorter, and "বাছাই-বাকি" ("still to sort") keeps the meaning. |

## Checked and kept

- **Country tiles** (USA যুক্তরাষ্ট্র, UK যুক্তরাজ্য): measured in visible glyph clusters, these are 4 each, no wider than "অস্ট্রেলিয়া" in the tile next to them. They're also the neutral, official names. I didn't use "বিলাত" (dated and colonial) or "আমেরিকা" (colloquial).
- **Season and celebration greetings:**
  - Happy holidays: ছুটির শুভেচ্ছা.
  - Happy New Year: নতুন বছরের শুভেচ্ছা. The translator rightly avoided শুভ নববর্ষ, which suggests পহেলা বৈশাখ.
  - Halloween: হ্যাপি হ্যালোইন.
  - Spring: বসন্ত এসে গেছে.
  - G’day: হ্যালো.
  - All of these are secular and warm. There are no religious greetings or blessings anywhere (no সালাম, খোদা হাফেজ, ঈশ্বর or ভগবান).
- **Jokes:**
  - The knock-knock adaptation (দরজায় টোকা / কে? এই সপ্তাহের ট্রিপগুলো!) works.
  - "আপনার মাইলগুলো ফোন করেছিল" is a miles/km pair and works.
  - "রবিবারের মন খারাপ?" lands for UK users, for whom Sunday is the end of the weekend.
  - "কম খাটুনি, বেশি লাভ" is fine, because লাভ here reads as "benefit".
  - "চলুন, চাকা ঘুরুক!" is fine.
  - "কঠিন কাজটা আপনার গাড়িই করেছে" teases the car, not the driver, so it isn't condescending.
- **Address:** আপনি is used throughout, and there's no তুমি/তুই. Trips are personified as ওরা, which is fine.
- **Regional words:** বাড়ি (not বাসা), বাঁয়ে/ডানে, সাইকেল, টাকা and পয়সা (generic, and names no currency) all read naturally in both Bangladesh and West Bengal. There are no slurs, crude words or regionalisms that only one side would understand.
- **Tax lines:** they keep আনুমানিক and "ট্যাক্স পরামর্শ নয়", and "Worth up to … হতে পারে" stays conditional. The reviewer's reworded "ট্যাক্স ছাড়ের হিসাব পাকা করে রাখুন" is fine.
- **Pairs with separate miles and km keys:** each keeps its own unit. The km variants of the delivery-app share line already say "প্রতিটি কিলোমিটার".

## Still open (not blocking)

Check 2 asked for a check against a Bengali iPhone. The exact iOS 18 Bengali strings for Always, Allow While Using App, Change to Always Allow, Never, Ask Next Time Or When I Share and ALLOW LOCATION ACCESS are still unverified. I couldn't verify them either. The current wording is natural and clearly points to the right options, so a mismatch would cost polish, not comprehension. Screenshot a Bengali-language iPhone's location prompt and the Settings → MileMint → Location screen at the next update, and align the quoted lines.

## Sign-off

**Approved for release.**
