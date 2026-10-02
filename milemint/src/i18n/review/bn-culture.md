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

## Round 3: logbook, P87, privacy and backup (October 2026)

- **Lines read:** all 201 new entries, as a UK care worker, a UK employee driving their own car and an Australian courier would see them.
- **Checked:**
  - **Glossary terms:** ট্রিপ, ব্যবসায়িক, বাছাই, আয়-বছর, ওডোমিটার, সেভ, এক্সপোর্ট, কর্মচারী/স্বনিযুক্ত, সম্পন্ন.
  - **Restore wording:** "Restore" uses পুনরুদ্ধার, matching "Restore purchases".
  - **Formatting:** Latin digits and the dari.
  - **Address:** আপনি throughout. Clients and patients are তাঁদের (respectful).
  - **Privacy lines:** they sound plain and reassuring for a care worker. They say what's kept (area, distance, purpose) and what's not (address, route). They never suggest hiding anything from the tax office ("ট্যাক্স অফিসের জন্য এলাকা, দূরত্ব আর উদ্দেশ্যই যথেষ্ট").
  - **Backup lines:** they say the backup is encrypted (এনক্রিপ্ট করা), the key is only in the user's iCloud Keychain, and MileMint never sees the trips. Nothing about servers or accounts is added beyond the English.
  - **Money honesty:** P87 amounts are রিলিফ (the relief), and only the tax on it is ট্যাক্স ফেরত, always with প্রায়/আনুমানিক. "Usually" (সাধারণত) and "could claim more" (বেশি দাবি করা যেতে পারে) stay conditional.
  - **Length:** button and label lengths are within about 1.3× in visible glyphs. This covers Keep the address, Area only, End early, Back up now, Restore, Keep them, Replace…, Open, Per mile, Nothing, and the Basic/Higher/Additional/Not sure tax-band segments.
- **Tests:** `npx jest src/i18n/__tests__/completeness.test.ts -t "bn "` passes.

| English | Before | After | Why |
|---|---|---|---|
| The ATO needs 12 weeks in a row. A logbook ended early can’t be used for the logbook method, so you’d need to start a new one. | আগে শেষ করা লগবুক লগবুক পদ্ধতিতে ব্যবহার করা যায় না | আগেভাগে শেষ করা লগবুক এই পদ্ধতিতে ব্যবহার করা যায় না | "লগবুক লগবুক" back to back reads like a typo. "এই পদ্ধতিতে" refers back clearly, and "আগেভাগে" is the natural word for "early" here. |
| Restore the backup from {{date}} with {{count}} trip(s). The trips, places, vehicles and settings on this iPhone are replaced by the ones in the backup. (one/other) | …সেটিংস সরিয়ে ব্যাকআপেরগুলো বসানো হবে। | …সেটিংসের বদলে ব্যাকআপে থাকা সবকিছু বসবে। | "ব্যাকআপেরগুলো" is awkward spoken slang in a warning alert. The new wording, "everything in the backup goes in their place", is plain and clear. |
| Pick 12 weeks that are typical … you add the reason for each work trip. | প্রতিটি কাজের ট্রিপের কারণ | প্রতিটি ব্যবসায়িক ট্রিপের কারণ | Consistency. The rest of the logbook screen and the glossary use ব্যবসায়িক ট্রিপ for business/work trips, and the warning below asks for a reason for each "ব্যবসায়িক ট্রিপ". |

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | শিফট শেষ করতে উল্টো দিকে সোয়াইপ করুন। | New line. Back-translation: "Swipe the opposite way to end the shift." Mirrors "শিফট শুরু করতে সোয়াইপ করুন" and "শিফট শেষ করুন" (আপনি). Shorter than English on screen. |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}। বোতামটি বাঁয়ে সোয়াইপ করুন, বা দুবার ট্যাপ করুন। | New VoiceOver hint; mirrors the "ডানে" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | পরিমাণ সংখ্যায় লিখুন, যেমন 2400 বা 2,400.50। | (unchanged) | Checked: English-style example with Latin digits, as the glossary says; no dot instruction. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | বন্ধু যোগ দিলে আপনারা দুজনেই মাসে +10টি ফ্রি ট্রিপ পাবেন। | আপনারা (plural polite) for “you both”. |
| Friends joined: {{count}} · … | যোগ দেওয়া বন্ধু: {{count}} জন · মাসে +{{drives}}টি ফ্রি ট্রিপ | Counters: জন for people, টি for trips, as elsewhere. |
| That doesn’t look like a MileMint code… | …আরও 3টি অক্ষর বা সংখ্যা… | Pass 2: “3 more” can be digits. |
| How it works | কীভাবে কাজ করে | Shortened from “এটি কীভাবে কাজ করে” for a link. |
| Redeem | রিডিম করুন | Loanword used by bKash and app stores. |
| Invite friends | বন্ধুদের আমন্ত্রণ জানান | Matches the old “বন্ধুকে আমন্ত্রণ জানান”. 1.6× but a nav title, where it fits. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | কোনো বন্ধুকে আমন্ত্রণ পাঠান। সেটি দিয়ে বন্ধু MileMint-এ যোগ দিলে আপনারা দুজনেই প্রতি মাসে 10টি করে বাড়তি ফ্রি অটোমেটিক ট্রিপ পাবেন। প্রতিটি বন্ধুর জন্য, কোনো সীমা ছাড়াই। | “Send an invitation to a friend. If the friend joins MileMint with it, you both will get 10 extra free automatic trips each every month. For every friend, without any limit.” *আমন্ত্রণ* as in “বন্ধুদের আমন্ত্রণ জানান”. |
| Send an invite | আমন্ত্রণ পাঠান | “Send invitation” Button, short. |
| Every invite has its own code, for one friend. | প্রতিটি আমন্ত্রণের নিজস্ব কোড থাকে, একজন বন্ধুর জন্য। | “Every invitation has its own code, for one friend.” |
| Invites sent: {{count}} | পাঠানো আমন্ত্রণ: {{count}}টি | “Invitations sent: {{count}}” *টি* classifier after the number, as in other counts. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | আমন্ত্রণগুলো iCloud-এর মাধ্যমে নিশ্চিত হয়, যা আসবে পরের কোনো আপডেটে। তার আগে যোগ দেওয়া বন্ধুরা এটি চালু হলেই বাড়তি ট্রিপ পাবেন, আপনিও পাবেন। | “Invitations are confirmed through iCloud, which will come in some next update. Friends who join before that will get extra trips as soon as it’s on, you will too.” No promise of drives today. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | আপনি {{code}} দিয়েছেন। আমন্ত্রণ নিশ্চিত হলেই আপনার 10টি বাড়তি ট্রিপ চলে আসবে। | “You have entered {{code}}. As soon as the invitation is confirmed your 10 extra trips will arrive.” |
| Code {{code}} saved | কোড {{code}} সেভ হয়েছে | “Code {{code}} saved” Mirrors “কোড {{code}} যোগ হয়েছে”. |
| Your 10 extra drives are on their way once the invite is confirmed. | আমন্ত্রণ নিশ্চিত হলেই আপনার 10টি বাড়তি ট্রিপ চলে আসবে। | “As soon as the invitation is confirmed your 10 extra trips will arrive.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | আপনার আমন্ত্রণ কোড {{code}}। MileMint সেট আপ করার সময় এটি দিন, প্রতি মাসে 10টি বাড়তি ফ্রি ট্রিপ পাবেন। | “Your invitation code is {{code}}. Enter it while setting up MileMint, you will get 10 extra free trips every month.” |
| We couldn’t find that invite. Check the code with your friend. | এই আমন্ত্রণটি খুঁজে পাওয়া যায়নি। বন্ধুর সাথে কোডটি মিলিয়ে দেখুন। | “This invitation couldn’t be found. Check the code with your friend.” |
| That invite has already been used. Ask your friend to send you a new one. | এই আমন্ত্রণটি আগেই ব্যবহার করা হয়েছে। বন্ধুকে নতুন একটি পাঠাতে বলুন। | “This invitation has already been used. Ask your friend to send a new one.” |
| That’s one of your own invites. Send it to a friend instead. | এটি আপনার নিজের আমন্ত্রণ। বরং কোনো বন্ধুকে পাঠান। | “This is your own invitation. Send it to a friend instead.” |
| This Apple Account has already joined with a friend’s invite. | এই Apple অ্যাকাউন্ট আগেই একজন বন্ধুর আমন্ত্রণে যোগ দিয়েছে। | “This Apple account has already joined with a friend’s invitation.” *Apple অ্যাকাউন্ট* as in existing lines. |
| 🎉 Your friend’s invite is confirmed | 🎉 আপনার বন্ধুর আমন্ত্রণ নিশ্চিত হয়েছে | “🎉 Your friend’s invitation is confirmed” |
| Your friend’s invite couldn’t be used | আপনার বন্ধুর আমন্ত্রণটি ব্যবহার করা যায়নি | “Your friend’s invitation couldn’t be used” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | সেভ হয়েছে · মূল্য Pro-তে আনলক হবে | “Saved · the value will unlock in Pro.” |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | সেভ হয়েছে। এই মাসের ফ্রি ট্রিপ শেষ, তাই ব্যক্তিগত থেকে আবার ব্যবসায়িক করা ট্রিপের মূল্য Pro-তে দেখা যাবে। যেসব ট্রিপের মূল্য আগে থেকেই দেখা যাচ্ছে, সেগুলো তা রাখবে। | “Saved. This month’s free trips are finished, so a trip made business again from personal will show its value in Pro. Trips whose value already shows will keep it.” |
| {{used}} of {{limit}} free work drives in {{month}} | {{month}}-এ {{limit}}টির মধ্যে {{used}}টি ফ্রি ব্যবসায়িক ট্রিপ | “{{used}} of {{limit}} free business trips in {{month}}”. *টি* classifier as in the old line; Latin digits as elsewhere in the app. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | ফ্রি: মাসে {{count}}টি ব্যবসায়িক ট্রিপ। ব্যক্তিগত ট্রিপ গোনা হয় না, আর একটি শিফট দিনে একবার গোনা হয়। নিজে যোগ করা ট্রিপ সবসময় ফ্রি। Pro: আনলিমিটেড। | “Free: 40 business trips a month. Personal trips aren’t counted, and one shift is counted once a day. Trips you add yourself are always free. Pro: unlimited.” |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | ব্যক্তিগত ট্রিপ গোনা হয় না। একটিকে ব্যক্তিগত বাছাই করলে তার জায়গা পরের ট্রিপ পায়। | “Personal trips aren’t counted. If you sort one as personal, the next trip gets its place.” *বাছাই* (glossary), kept apart from *নির্বাচন*. |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | লিমিটের পরেও কিছু লুকানো হয় না বা হারায় না: প্রতিটি ট্রিপ সেভ হয়, পুরোটা দেখা যায়, বাছাই করা যায় এবং আপনার স্প্রেডশিট এক্সপোর্টে থাকে। শুধু এর মূল্য Pro-র অপেক্ষায় থাকে। | “Even after the limit nothing is hidden or lost: every trip is saved, shows in full, can be sorted and stays in your spreadsheet export. Only its value waits for Pro.” |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | মাসের সবচেয়ে আগের ট্রিপগুলো আগে গোনা হয়, তাই যে ট্রিপের মূল্য দেখা যাচ্ছে, সেটি তা রাখে। প্রতি মাসের 1 তারিখে গোনা আবার শুরু হয়। | “The month’s earliest trips are counted first, so a trip whose value shows keeps it. Counting starts again on the 1st of every month.” |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | one: {{count}}টি ট্রিপ / other: {{count}}টি ট্রিপ | “{{count}} trip(s)” -টি classifier, Western digits as the rest of the file. |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | one: তখন থেকে {{count}}টি ট্রিপ ডেলিভারির মতো লাগছে। এটি ব্যবসায়িক হিসেবে শিফটে যোগ হবে। / other: তখন থেকে {{count}}টি ট্রিপ ডেলিভারির মতো লাগছে। এগুলো ব্যবসায়িক হিসেবে শিফটে যোগ হবে। | “Since then {{count}} trips look like deliveries. They will be added to the shift as business.” |
| {{purpose}} · {{count}} to sort | one: {{purpose}} · {{count}}টি বাছাই বাকি / other: {{purpose}} · {{count}}টি বাছাই বাকি | “{{purpose}} · {{count}} left to sort” |
| After your shift ended · not counted as work unless you say so | শিফট শেষ হওয়ার পরে · আপনি না বাছলে কাজ হিসেবে গোনা হবে না | “After the shift ends · not counted as work unless you choose” *বাছা* ties to *বাছাই* (sort). |
| Deliveries | ডেলিভারি | “Delivery” |
| Did your shift start at {{time}}? | আপনার শিফট কি {{time}}-এ শুরু হয়েছিল? | “Did your shift start at {{time}}?” |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | কোন ট্রিপ কখন শুরু হয়েছে তা দেখে সেটি শিফটে যোগ হয় বা বাদ যায়। শিফট শেষের পরেও চলা ট্রিপ সেখানেই দুই ভাগ করা হয়। | “A trip joins or leaves the shift by when it started. A trip still going after the shift ends is split in two there.” |
| During a pause in your shift · not counted as work unless you say so | শিফটের বিরতির সময় · আপনি না বাছলে কাজ হিসেবে গোনা হবে না | “During the shift’s break · not counted as work unless you choose” |
| End 15 minutes earlier | শেষের সময় 15 মিনিট আগে করুন | “Make the end time 15 minutes earlier” |
| End 15 minutes later | শেষের সময় 15 মিনিট পরে করুন | “Make the end time 15 minutes later” |
| End your shift? | শিফট শেষ করবেন? | “Will you end the shift?” |
| Ended {{time}} | {{time}}-এ শেষ | “Ended at {{time}}” |
| Hide drives ▴ | ট্রিপ লুকান ▴ | “Hide trips ▴” |
| Hides the drives in this shift | এই শিফটের ট্রিপগুলো লুকায় | “Hides this shift’s trips” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | এটি তখনও চালু ছিল, তাই MileMint এটি শেষ করেছে। এখন থেকে ট্রিপগুলো আপনাকেই বাছাই করতে হবে। সময় দেখে নিতে ট্যাপ করুন। | “It was still on, so MileMint ended it. From now on you’ll have to sort the trips yourself. Tap to check the time.” |
| Map of the drives in this shift | এই শিফটের ট্রিপগুলোর ম্যাপ | “Map of this shift’s trips” |
| On shift | শিফটে | “On shift” |
| Pause | বিরতি | “Break” |
| Pause the shift for a personal errand | ব্যক্তিগত কাজের জন্য শিফটে বিরতি দিন | “Take a break in the shift for personal work” |
| Paused · {{elapsed}} | বিরতিতে · {{elapsed}} | “On break · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | বিরতিতে: এখনকার ট্রিপ কাজ হিসেবে গোনা হবে না। ফিরে এসে আবার শুরু করুন। | “On break: current trips won’t be counted as work. Come back and start again.” |
| Resume | আবার শুরু | “Start again” |
| Resume the shift | শিফট আবার শুরু করুন | “Start the shift again” |
| Shift | শিফট | “Shift” |
| Shift ended | শিফট শেষ হয়েছে | “The shift has ended” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | {{date}}-এর শিফট, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | “Shift of {{date}}, …” |
| Show drives ▾ | ট্রিপ দেখুন ▾ | “See trips ▾” |
| Shows the drives in this shift | এই শিফটের ট্রিপগুলো দেখায় | “Shows this shift’s trips” |
| Since {{time}} | {{time}} থেকে | “From {{time}}” |
| Start 15 minutes earlier | শুরুর সময় 15 মিনিট আগে করুন | “Make the start time 15 minutes earlier” |
| Start 15 minutes later | শুরুর সময় 15 মিনিট পরে করুন | “Make the start time 15 minutes later” |
| Start from {{time}} | {{time}} থেকে শুরু | “Start from {{time}}” |
| Start shift from {{time}}? | {{time}} থেকে শিফট শুরু করবেন? | “Will you start the shift from {{time}}?” |
| Started {{time}} | {{time}}-এ শুরু | “Started at {{time}}” |
| Still working | এখনও কাজ করছি | “Still working” |
| Undo | ফিরিয়ে নিন | “Take it back” Shorter than iOS *পূর্বাবস্থায় ফেরান* for a toast link; same meaning. |
| Undo ending the shift | শিফট শেষ করা ফিরিয়ে নিন | “Take back ending the shift” |
| Where your shift ended | যেখানে শিফট শেষ হয়েছে | “Where the shift ended” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | আপনি বেশ কিছুক্ষণ ধরে বাড়িতে পার্ক করে আছেন, আর আপনার শিফট এখনও চালু। শিফট শেষের পরের ট্রিপ কাজ হিসেবে গোনা হয় না। | “You’ve been parked at home for quite a while, and your shift is still on. Trips after the shift ends aren’t counted as work.” |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | আপনি {{time}} থেকে বাড়িতে পার্ক করে আছেন। শিফটের পরের ট্রিপ কাজ হিসেবে গোনা হয় না। | “You’ve been parked at home since {{time}}. Trips after the shift aren’t counted as work.” |
| Your shift ended after 16 hours | আপনার শিফট 16 ঘণ্টা পরে শেষ হয়েছে | “Your shift ended after 16 hours” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “ট্র্যাকিং যাচাই” row and background notifications. 24 new lines. Terms: *ট্রিপ*, *ট্র্যাকিং*, *রেকর্ড*, *বাদ পড়া*, আপনি. iOS wording: *সেটিংস*, *লোকেশন*, *সুনির্দিষ্ট লোকেশন* (see Unsure). Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | সুনির্দিষ্ট লোকেশন বন্ধ আছে | “Precise location is off”. Unsure: Apple’s Bengali toggle name not confirmed. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint শুধু আনুমানিক অবস্থান পাচ্ছে, তাই ট্রিপ মাপা যাচ্ছে না। সেটিংসে লোকেশন-এ ট্যাপ করুন এবং সুনির্দিষ্ট লোকেশন চালু করুন। | “MileMint is only getting an approximate position, so trips can’t be measured. In Settings tap Location and turn on Precise Location.” |
| Tracking has stopped | ট্র্যাকিং থেমে গেছে | “Tracking has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | অটোমেটিক ট্র্যাকিং চলা বন্ধ হয়ে গেছে, তাই নতুন ট্রিপ রেকর্ড হচ্ছে না। | “Automatic tracking has stopped running, so new trips aren’t being recorded.” |
| Tracking may have stopped | ট্র্যাকিং হয়তো থেমে গেছে | “Tracking has perhaps stopped”. |
| No location since {{time}}, in the middle of a drive. | ট্রিপের মাঝখানে {{time}} থেকে কোনো লোকেশন পাওয়া যায়নি। | “In the middle of the trip, no location found since {{time}}.” |
| Turn tracking back on | আবার ট্র্যাকিং চালু করুন | “Turn tracking on again”. Button. |
| Tracking stopped {{from}}–{{to}} | ট্র্যাকিং বন্ধ ছিল {{from}}–{{to}} | “Tracking was off {{from}}–{{to}}”. |
| A drive may have been missed | হয়তো একটি ট্রিপ বাদ পড়েছে | “Perhaps a trip was left out”. *বাদ পড়া* as in “বাদ পড়া ট্রিপ যোগ করুন”. |
| About {{distance}} may be missing. Add the missed trip? | প্রায় {{distance}} বাদ পড়ে থাকতে পারে। বাদ পড়া ট্রিপটি যোগ করবেন? | “About {{distance}} may have been left out. Will you add the left-out trip?” |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | আপনার ফোন {{from}} থেকে {{to}}-এর মধ্যে প্রায় {{distance}} সরেছে, কিন্তু কোনো ট্রিপ রেকর্ড হয়নি। বাদ পড়া ট্রিপটি যোগ করবেন? | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Will you add the left-out trip?” |
| Not a drive | এটা ট্রিপ ছিল না | “This wasn’t a trip”. |
| All good | সব ঠিক আছে | “All is fine”. |
| just now | এইমাত্র | “just now”. |
| {{count}} minutes ago | one: {{count}} মিনিট আগে / other: {{count}} মিনিট আগে | “{{count}} minute(s) ago”. |
| {{count}} hours ago | one: {{count}} ঘণ্টা আগে / other: {{count}} ঘণ্টা আগে | “{{count}} hour(s) ago”. |
| {{count}} days ago | one: {{count}} দিন আগে / other: {{count}} দিন আগে | “{{count}} day(s) ago”. |
| Tracking check | ট্র্যাকিং যাচাই | “Tracking check”. |
| Last location: {{ago}} | শেষ লোকেশন: {{ago}} | “Last location: {{ago}}”. |
| No location yet | এখনও কোনো লোকেশন নেই | “No location yet”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | MileMint-এর লোকেশন অ্যাক্সেস বন্ধ, তাই ট্রিপ রেকর্ড হচ্ছে না। আবার চালু করতে ট্যাপ করুন। | “MileMint’s location access is off, so trips aren’t being recorded. Tap to turn it on again.” |
| Drives can’t be measured from a rough position. Tap to fix it. | আনুমানিক অবস্থান দিয়ে ট্রিপ মাপা যায় না। ঠিক করতে ট্যাপ করুন। | “Trips can’t be measured with an approximate position. Tap to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | নতুন ট্রিপ রেকর্ড হচ্ছে না। আবার ট্র্যাকিং চালু করতে ট্যাপ করুন। | “New trips aren’t being recorded. Tap to turn tracking on again.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | ট্রিপের মাঝখানে {{time}} থেকে কোনো লোকেশন পাওয়া যায়নি। আবার ট্র্যাকিং শুরু করতে MileMint খুলুন। | “In the middle of the trip, no location found since {{time}}. Open MileMint to start tracking again.” |

**Sign-off:** approved, pending an on-device check of *সুনির্দিষ্ট লোকেশন*.


## Round 8: pre-release fixes

| English | bn | Back-translation | Note |
|---|---|---|---|
| Where your shift started | যেখানে শিফট শুরু হয়েছে | Where the shift started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | bn | Back-translation | Note |
|---|---|---|---|
| Opens trip details | ট্রিপের বিস্তারিত খোলে | Opens the trip details | Matches the row’s existing hint. |
| Usual purpose · tap to change | সাধারণ উদ্দেশ্য · বদলাতে ট্যাপ করুন | Usual purpose · tap to change | *উদ্দেশ্য* as in “ব্যবসায়িক উদ্দেশ্য”. |
| Purpose needed for your tax records | ট্যাক্স রেকর্ডের জন্য উদ্দেশ্য দরকার | A purpose is needed for tax records | Natural, fits its place. |
| Shows only the drives that need a purpose | শুধু যেসব ট্রিপে উদ্দেশ্য দরকার সেগুলো দেখায় | Shows only the trips that need a purpose | Natural, fits its place. |
| {{count}} work drives need a purpose | one: {{count}}টি ব্যবসায়িক ট্রিপে উদ্দেশ্য দরকার / other: {{count}}টি ব্যবসায়িক ট্রিপে উদ্দেশ্য দরকার | {{count}} business trip(s) need a purpose | Classifier টি, as in the file. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} প্রতিটি ব্যবসায়িক ট্রিপের উদ্দেশ্য চায়। প্রতিটিতে একটি ট্যাপ। | {{authority}} wants each business trip’s purpose. One tap on each. | Natural, fits its place. |
| Add purposes › | উদ্দেশ্য যোগ করুন › | Add purposes › | Natural, fits its place. |
| Every work drive has a purpose ✓ | প্রতিটি ব্যবসায়িক ট্রিপের উদ্দেশ্য আছে ✓ | Every business trip has a purpose ✓ | Natural, fits its place. |
| Show all drives | সব ট্রিপ দেখান | Show all trips | Natural, fits its place. |
| {{count}} work drives have no purpose | one: {{count}}টি ব্যবসায়িক ট্রিপে কোনো উদ্দেশ্য নেই / other: {{count}}টি ব্যবসায়িক ট্রিপে কোনো উদ্দেশ্য নেই | {{count}} business trip(s) have no purpose | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} প্রতিটি ব্যবসায়িক ট্রিপের উদ্দেশ্য চায়। এক্সপোর্টের আগে যোগ করবেন? | {{authority}} wants each business trip’s purpose. Add them before export? | Natural, fits its place. |
| Export anyway | তবুও এক্সপোর্ট করুন | Export anyway | Natural, fits its place. |
| Add purposes | উদ্দেশ্য যোগ করুন | Add purposes | Natural, fits its place. |
| Usual business purpose | সাধারণ ব্যবসায়িক উদ্দেশ্য | Usual business purpose | Natural, fits its place. |
| Clear | সরান | Remove | “মুছুন” is kept for deleting trips. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | যেসব ব্যবসায়িক ট্রিপে উদ্দেশ্য নেই সেগুলোতে এটি বসানো হয়, যাতে আপনার ট্যাক্স রেকর্ড সম্পূর্ণ থাকে। শিফটের ট্রিপে “ডেলিভারি” থাকে, যদি না আপনি অন্য কিছু বেছে নেন। | It is put on business trips without a purpose, so your tax records stay complete. Shift trips have “Delivery” unless you choose something else. | *শিফট* as in “অটো: শিফটে”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | যেসব ব্যবসায়িক ট্রিপে উদ্দেশ্য নেই সেগুলোতে এটি বসানো হয়, যাতে আপনার ট্যাক্স রেকর্ড সম্পূর্ণ থাকে। আপনি যেকোনো ট্রিপে এটি বদলাতে পারেন। | It is put on business trips without a purpose, so your tax records stay complete. You can change it on any trip. | Natural, fits its place. |
| None: ask me each time | কোনোটি নয়: প্রতিবার জিজ্ঞেস করুন | None: ask every time | Natural, fits its place. |
| What are most of your work drives for? | আপনার বেশিরভাগ ব্যবসায়িক ট্রিপ কীসের জন্য? | What are most of your business trips for? | Natural, fits its place. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | ট্যাক্স কর্তৃপক্ষ প্রতিটি ব্যবসায়িক ট্রিপের উদ্দেশ্য চায়। আমরা এটি আপনার হয়ে বসিয়ে দেব, আর আপনি যেকোনো ট্রিপে এটি বদলাতে পারবেন। | Tax authorities want each business trip’s purpose. We’ll put it in for you, and you can change it on any trip. | Natural, fits its place. |


## Round 8c: work purpose tiles

Back-translations: Choose all that fit. We'll set the first one for you. / Will be set for you / Usual. "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | bn | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | কোনো অ্যাকাউন্ট লাগে না। আপনার ট্রিপ আপনার ফোনেই থাকে। | No account needed. Your trips stay on your phone. | Keeps “কোনো অ্যাকাউন্ট লাগে না”. |
| Is this home? {{place}} | এটা কি বাড়ি? {{place}} | Is this home? {{place}} | *বাড়ি* as in “Home”. |
| You stopped here for the night. Trips to and from it will read “Home”. | আপনি রাতটা এখানেই কাটিয়েছেন। এখান থেকে যাওয়া-আসার ট্রিপে “বাড়ি” লেখা থাকবে। | You spent the night here. Trips to and from here will say “Home”. |  |
| Yes, that’s home | হ্যাঁ, এটা বাড়ি | Yes, this is home |  |
| No | না | No |  |
| Is this work? {{place}} | এটা কি কর্মস্থল? {{place}} | Is this the workplace? {{place}} | *কর্মস্থল* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | কাজের সময়ে আপনি প্রায়ই এখানে পার্ক করেন। ট্রিপে “কর্মস্থল” লেখা থাকবে, আর বাড়ি-কর্মস্থল যাতায়াত চিহ্নিত হবে। | In work hours you often park here. Trips will say “Workplace”, and home-workplace travel will be marked. | *যাতায়াত* as in the old places line. |
| Yes, that’s work | হ্যাঁ, এটা কর্মস্থল | Yes, this is the workplace |  |


## Round 8f: motion activity

Unsure: “অনুমতি দিন” / “অনুমতি দেবেন না” and “মোশন ও ফিটনেস” are believed to be iOS’s Bengali wording, but please check against a Bengali iPhone. “ট্রিপ” as everywhere else. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | নির্ভুলতার জন্য আরও একটি: মোশন ও ফিটনেস | One more for accuracy: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | এতে MileMint গাড়ি চালানো আর হাঁটার পার্থক্য বুঝতে পারে, তাই হাঁটাহাঁটি কখনও ট্রিপ হিসেবে লগ হয় না। এটি আপনার ফোনেই থাকে। | With this MileMint can tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | |
| Turn on Motion & Fitness | মোশন ও ফিটনেস চালু করুন | Turn on Motion & Fitness | |
| Allow | অনুমতি দিন | Give permission | |
| Don’t Allow | অনুমতি দেবেন না | Don’t give permission | |
| Motion & Fitness | মোশন ও ফিটনেস | Motion & Fitness | |
| On | চালু | On | |
| Off | বন্ধ | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | কাজ শুরু করার সময় সোয়াইপ করে শিফট শুরু করুন। শিফটের প্রতিটি ট্রিপ {{purpose}} হিসেবে গোনা হবে। | When starting work, swipe to start the shift. Every trip in the shift will be counted as {{purpose}}. | *গোনা হবে* as in the shift hint. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | আপনার সময়ের ({{days}} {{from}}–{{to}}) ট্রিপগুলো আপনাআপনি ব্যবসায়িক হিসেবে সাজানো হয়। | Trips in your hours ({{days}} {{from}}–{{to}}) are sorted as business automatically. | Natural, fits its place. |
| Drives in your work hours are sorted as business for you. | আপনার কাজের সময়ের ট্রিপগুলো আপনাআপনি ব্যবসায়িক হিসেবে সাজানো হয়। | Trips in your work hours are sorted as business automatically. | *কাজের সময়* as in Settings. |
| After each drive, swipe right for business or left for personal. | প্রতিটি ট্রিপের পর, ব্যবসায়িক হলে ডানে বা ব্যক্তিগত হলে বাঁয়ে সোয়াইপ করুন। | After each trip, swipe right if business or left if personal. | Natural, fits its place. |
| {{rate}} a mile · {{vehicle}} · {{country}} | {{rate}} প্রতি মাইল · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | Natural, fits its place. |
| {{rate}} a km · {{vehicle}} · {{country}} | {{rate}} প্রতি কিমি · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | Natural, fits its place. |
| PRACTICE RUN | অনুশীলন | PRACTICE | Natural, fits its place. |
| This is how a drive shows up after you park. Try sorting it. | পার্ক করার পর ট্রিপ এভাবে দেখা যায়। এটি সাজিয়ে দেখুন। | After parking a trip looks like this. Try sorting it. | Natural, fits its place. |
| Swipe left for personal | ব্যক্তিগত হলে বাঁয়ে সোয়াইপ করুন | Swipe left if personal | As in the auto note. |
| Not that way. Try again. | ওদিকে নয়। আবার চেষ্টা করুন। | Not that way. Try again. | Natural, fits its place. |
| Sorted as personal ✓ | ব্যক্তিগত হিসেবে সাজানো হলো ✓ | Sorted as personal ✓ | Natural, fits its place. |
| Now a work drive. Work drives are worth money back. | এবার একটি কাজের ট্রিপ। কাজের ট্রিপে টাকা ফেরত পাওয়া যায়। | Now a work trip. Work trips get money back. | Natural, fits its place. |
| Swipe right for business | ব্যবসায়িক হলে ডানে সোয়াইপ করুন | Swipe right if business | Natural, fits its place. |
| Sorted as business: worth {{amount}} | ব্যবসায়িক হিসেবে সাজানো হলো: মূল্য {{amount}} | Sorted as business: worth {{amount}} | *মূল্য* as in the row. |
| Swipe to start your shift | আপনার শিফট শুরু করতে সোয়াইপ করুন | Swipe to start your shift | Natural, fits its place. |
| Your shift is on ✓ | আপনার শিফট শুরু হয়েছে ✓ | Your shift has started ✓ | Natural, fits its place. |
| Mark as personal | ব্যক্তিগত হিসেবে চিহ্নিত করুন | Mark as personal | As in the row buttons. |
| Mark as business | ব্যবসায়িক হিসেবে চিহ্নিত করুন | Mark as business | Natural, fits its place. |
| Practice drive · not saved | অনুশীলনের ট্রিপ · সেভ হবে না | Practice trip · won’t be saved | Natural, fits its place. |
| Supermarket | সুপারমার্কেট | Supermarket | Natural, fits its place. |
| Office | অফিস | Office | Natural, fits its place. |
| Customer | গ্রাহক | Customer | Natural, fits its place. |
| That’s it. Just drive: trips appear here after you park. | এটুকুই। শুধু ড্রাইভ করুন: পার্ক করার পর ট্রিপ এখানে দেখা যাবে। | That’s all. Just drive: trips will show here after parking. | *শুধু ড্রাইভ করুন* as in the old empty state. |
| Start driving | ড্রাইভ শুরু করুন | Start driving | Natural, fits its place. |
| Skip | বাদ দিন | Skip | Natural, fits its place. |
| Skip the practice run | অনুশীলন বাদ দিন | Skip practice | Natural, fits its place. |
| Tutorial | টিউটোরিয়াল | Tutorial | Natural, fits its place. |
| Replay the tutorial | টিউটোরিয়াল আবার দেখুন | See the tutorial again | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | দুটি নমুনা ট্রিপ আবার সাজিয়ে দেখুন। কিছুই সেভ হয় না। | Try sorting two sample trips again. Nothing is saved. | Natural, fits its place. |
| Replay | আবার দেখুন | See again | Natural, fits its place. |

## Round 8h: Pro screen

Plain trial terms. “সেটিংস” is the iPhone Settings app, as in “সেটিংস খুলুন”. Price after “বছরে / মাসে” reads naturally (“বছরে £49.99”). The trial pill and lengths are plurals, so “1 month” / “2 months” read right.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| {{count}} days free | {{count}} দিন ফ্রি / {{count}} দিন ফ্রি | {{count}} day(s) free |  |
| {{count}} months free | {{count}} মাস ফ্রি / {{count}} মাস ফ্রি | {{count}} month(s) free |  |
| {{count}} months | {{count}} মাস / {{count}} মাস | {{count}} month(s) |  |
| {{price}} a month | মাসে {{price}} | {{price}} a month | Under the yearly price: the yearly price ÷ 12. |
| Most popular | সবচেয়ে জনপ্রিয় | Most popular | Badge on the yearly plan. |
| We’ll remind you 3 days before it ends. | শেষ হওয়ার 3 দিন আগে আমরা আপনাকে মনে করিয়ে দেব। | We’ll remind you 3 days before it ends. |  |
| {{trial}} free, then {{price}} a year. Cancel any time in Settings. | {{trial}} ফ্রি, তারপর বছরে {{price}}। সেটিংসে যেকোনো সময় বাতিল করুন। | {{trial}} free, then {{price}} a year. Cancel any time in Settings. |  |
| {{trial}} free, then {{price}} a month. Cancel any time in Settings. | {{trial}} ফ্রি, তারপর মাসে {{price}}। সেটিংসে যেকোনো সময় বাতিল করুন। | {{trial}} free, then {{price}} a month. Cancel any time in Settings. |  |
| Free trial, then {{price}} a year. Cancel any time in Settings. | ফ্রি ট্রায়াল, তারপর বছরে {{price}}। সেটিংসে যেকোনো সময় বাতিল করুন। | Free trial, then {{price}} a year. Cancel any time in Settings. |  |
| Free trial, then {{price}} a month. Cancel any time in Settings. | ফ্রি ট্রায়াল, তারপর মাসে {{price}}। সেটিংসে যেকোনো সময় বাতিল করুন। | Free trial, then {{price}} a month. Cancel any time in Settings. |  |
| {{price}} a year. Cancel any time in Settings. | বছরে {{price}}। সেটিংসে যেকোনো সময় বাতিল করুন। | {{price}} a year. Cancel any time in Settings. |  |
| {{price}} a month. Cancel any time in Settings. | মাসে {{price}}। সেটিংসে যেকোনো সময় বাতিল করুন। | {{price}} a month. Cancel any time in Settings. |  |
| Your free month ends on {{date}} | আপনার ফ্রি মাস শেষ হবে {{date}} | Your free month will end {{date}} | Notification title, 3 days before a one-month trial ends. |
| Your free trial ends on {{date}} | আপনার ফ্রি ট্রায়াল শেষ হবে {{date}} | Your free trial will end {{date}} | For other trial lengths. |
| Keep Pro for {{price}} a year, or cancel in Settings. Nothing to do if you’re staying. | বছরে {{price}}-এ Pro রাখুন, অথবা সেটিংসে বাতিল করুন। থাকতে চাইলে কিছুই করতে হবে না। | Keep Pro at {{price}} a year, or cancel in Settings. If you want to stay, nothing needs doing. | Notification body. |
| Keep Pro for {{price}} a month, or cancel in Settings. Nothing to do if you’re staying. | মাসে {{price}}-এ Pro রাখুন, অথবা সেটিংসে বাতিল করুন। থাকতে চাইলে কিছুই করতে হবে না। | Keep Pro at {{price}} a month, or cancel in Settings. If you want to stay, nothing needs doing. |  |

## Round 8i: parking & tolls

Parking and tolls on a drive: the “+ Parking or tolls” fields when adding a trip and on the trip screen, the line on a business trip’s row and under home’s total, the report screen, and each country’s line on what counts. Tax terms stay in English as elsewhere (Mileage Allowance Relief, Car, van and travel expenses, T2125, D2, cents per km, Congestion Charge, ULEZ). The “recorded” lines are for Canada and UK employees, where they aren’t added to the total.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Kept with the drive, but only counted on business drives. | ট্রিপের সঙ্গে সেভ থাকে, কিন্তু শুধু ব্যবসায়িক ট্রিপে গোনা হয়। | Stays saved with the trip, but is counted only on business trips. | Add trip / trip details: note under the fields on a personal drive. |
| + Parking or tolls | + পার্কিং বা টোল | + Parking or toll | Add trip: the link that opens the two fields. Keep the "+". |
| incl. {{amount}} parking & tolls | এর মধ্যে {{amount}} পার্কিং আর টোল | of which {{amount}} parking and tolls | Home hero card, under the total; lower-case start as it continues the figure. |
| Parking & tolls: {{amount}} (recorded) | পার্কিং আর টোল: {{amount}} (লিখে রাখা) | Parking and tolls: {{amount}} (noted down) | Home hero card where they aren’t added (Canada, UK employees). |
| +{{amount}} parking & tolls | +{{amount}} পার্কিং আর টোল | +{{amount}} parking and tolls | Trip row detail on a business drive. |
| A claim line for every business trip (date, from, to, purpose, distance, rate, amount, parking and tolls) for your employer’s expense system. | প্রতিটি ব্যবসায়িক ট্রিপের জন্য একটি দাবির লাইন (তারিখ, কোথা থেকে, কোথায়, উদ্দেশ্য, দূরত্ব, রেট, পরিমাণ, পার্কিং আর টোল), আপনার নিয়োগকর্তার খরচের সিস্টেমের জন্য। | One claim line for each business trip (date, from where, to where, purpose, distance, rate, amount, parking and tolls), for your employer’s expense system. | Report screen: expense-claim export description (was without parking and tolls). |
| Mileage at {{authority}} rates | {{authority}} রেটে মাইলেজ | Mileage at {{authority}} rate | Report screen: the mileage part of the total. |
| Parking | পার্কিং | Parking | Field label and report line. |
| Tolls | টোল | Toll | Field label and report line (bridge and road tolls, Congestion Charge, ULEZ). |
| Included in the total above. {{note}} | ওপরের মোটে ধরা আছে। {{note}} | Counted in the total above. {{note}} | Report screen; note = the country’s line below. |
| Recorded, not included in the total above. {{note}} | লিখে রাখা আছে, তবে ওপরের মোটে ধরা নেই। {{note}} | Noted down, but not counted in the total above. {{note}} | Report screen (Canada, UK employees); note = the country’s line below. |
| Enter parking as an amount, e.g. 3.50. | পার্কিংয়ের টাকার অঙ্ক লিখুন, যেমন 3.50। | Write the parking amount, e.g. 3.50. | Error under the fields. |
| Enter tolls as an amount, e.g. 3.50. | টোলের টাকার অঙ্ক লিখুন, যেমন 3.50। | Write the toll amount, e.g. 3.50. | Error under the fields. |
| Parking or tolls over {{max}} for one drive? Check the amount. | এক ট্রিপে পার্কিং বা টোল {{max}}-এর বেশি? অঙ্কটা আবার দেখুন। | Parking or toll over {{max}} on one trip? Look at the amount again. | Error; max = £1,000.00 / $1,000.00. |
| {{what}}, in {{currency}} | {{what}}, {{currency}}-এ | {{what}}, in {{currency}} | VoiceOver label of a money box, e.g. "Parking, in GBP". |
| Business parking and tolls are deductible on top of the mileage rate. Parking at your regular workplace isn’t, and fines never are. | ব্যবসায়িক পার্কিং আর টোল মাইলেজ রেটের ওপরে আলাদাভাবে ছাড় পাওয়া যায়। আপনার নিয়মিত কর্মস্থলের পার্কিং নয়, আর জরিমানা কখনোই নয়। | Business parking and tolls get a deduction separately on top of the mileage rate. Not parking at your regular workplace, and never fines. | US note under the fields. |
| Parking at your regular place of work and tolls on your commute are not deductible. | আপনার নিয়মিত কর্মস্থলের পার্কিং আর বাড়ি-কর্মস্থল যাতায়াতের টোলে ছাড় পাওয়া যায় না। | Parking at your regular workplace and tolls on home-workplace travel get no deduction. | US report guidance (PDF stays English). |
| Self-employed: business parking, tolls and Congestion Charge or ULEZ charges are claimed on top of the mileage rate. Parking and traffic fines never are. | স্বনিযুক্ত: ব্যবসায়িক পার্কিং, টোল আর Congestion Charge বা ULEZ চার্জ মাইলেজ রেটের ওপরে আলাদাভাবে দাবি করা যায়। পার্কিং আর ট্রাফিক জরিমানা কখনোই নয়। | Self-employed: business parking, tolls and Congestion Charge or ULEZ charges can be claimed separately on top of the mileage rate. Parking and traffic fines never. | UK self-employed note under the fields. |
| Parking and tolls aren’t part of Mileage Allowance Relief. Claim them from your employer, or as a separate employment expense if they don’t repay them. Fines never count. | পার্কিং আর টোল Mileage Allowance Relief-এর অংশ নয়। এগুলো আপনার নিয়োগকর্তার কাছ থেকে নিন, বা তাঁরা ফেরত না দিলে আলাদা চাকরির খরচ হিসেবে দাবি করুন। জরিমানা কখনোই ধরা হয় না। | Parking and tolls aren’t part of Mileage Allowance Relief. Get them from your employer, or if they don’t pay back, claim them as a separate job expense. Fines are never counted. | UK employee note under the fields. |
| Self-employed: parking, tolls and Congestion Charge or ULEZ charges on business journeys are added on top of the mileage figure, in the same Car, van and travel expenses box. Parking and traffic fines are never allowable. | স্বনিযুক্ত: ব্যবসায়িক ট্রিপের পার্কিং, টোল আর Congestion Charge বা ULEZ চার্জ মাইলেজের অঙ্কের ওপরে যোগ হয়, একই Car, van and travel expenses ঘরে। পার্কিং আর ট্রাফিক জরিমানায় কখনোই ছাড় মেলে না। | Self-employed: business-trip parking, tolls and Congestion Charge or ULEZ charges are added on top of the mileage amount, in the same Car, van and travel expenses box. Parking and traffic fines never get a deduction. | UK report guidance (PDF stays English). |
| Employees: parking and tolls are not part of Mileage Allowance Relief. They are listed separately, to claim from your employer or as a separate employment expense. | কর্মচারী: পার্কিং আর টোল Mileage Allowance Relief-এর অংশ নয়। এগুলো আলাদা করে দেখানো আছে, নিয়োগকর্তার কাছ থেকে নেওয়ার জন্য বা আলাদা চাকরির খরচ হিসেবে দাবি করার জন্য। | Employees: parking and tolls aren’t part of Mileage Allowance Relief. They’re shown separately, to get from the employer or to claim as a separate job expense. | UK report guidance (PDF stays English). |
| Recorded apart from the per-km figure. Self-employed: business parking is usually claimed in full. Ask your accountant about tolls. | প্রতি km-এর অঙ্ক থেকে আলাদা করে লিখে রাখা। স্বনিযুক্ত: ব্যবসায়িক পার্কিং সাধারণত পুরোটাই দাবি করা যায়। টোলের ব্যাপারে আপনার অ্যাকাউন্ট্যান্টকে জিজ্ঞেস করুন। | Noted down apart from the per-km amount. Self-employed: business parking can usually be claimed in full. Ask your accountant about tolls. | Canada note under the fields. |
| Parking and tolls are listed separately and not added to the per-km figure. Self-employed: business parking fees are deducted in full on T2125, not reduced to your business-use share. Ask your accountant whether your tolls can be claimed. | পার্কিং আর টোল আলাদা করে দেখানো আছে, প্রতি km-এর অঙ্কে যোগ করা হয়নি। স্বনিযুক্ত: ব্যবসায়িক পার্কিং ফি T2125-এ পুরোটাই বাদ যায়, ব্যবসায়িক ব্যবহারের অংশ অনুযায়ী কমানো হয় না। টোল দাবি করা যায় কি না, আপনার অ্যাকাউন্ট্যান্টকে জিজ্ঞেস করুন। | Parking and tolls are shown separately, not added to the per-km amount. Self-employed: business parking fees are deducted in full on T2125, not reduced by the business-use share. Ask your accountant whether tolls can be claimed. | Canada report guidance (PDF stays English). |
| Work parking and tolls aren’t covered by cents per km, so they’re claimed separately. Not parking at your regular workplace, or tolls on the way there. | কাজের পার্কিং আর টোল cents per km-এর মধ্যে পড়ে না, তাই এগুলো আলাদা করে দাবি করা হয়। আপনার নিয়মিত কর্মস্থলের পার্কিং বা সেখানে যাওয়ার টোল নয়। | Work parking and tolls don’t fall within cents per km, so they’re claimed separately. Not parking at your regular workplace or tolls going there. | Australia note under the fields. |
| Parking fees and tolls for work trips aren’t covered by the cents per km rate. Claim them separately: individuals as Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace, or tolls between home and work. | কাজের ট্রিপের পার্কিং ফি আর টোল cents per km রেটের মধ্যে পড়ে না। এগুলো আলাদা করে দাবি করুন: ব্যক্তি করদাতা Work-related travel expenses (D2)-এ, sole traders ব্যবসার খরচের সঙ্গে। আপনার নিয়মিত কর্মস্থলের পার্কিং বা বাড়ি আর কর্মস্থলের মধ্যে টোল নয়। | Work-trip parking fees and tolls don’t fall within the cents per km rate. Claim them separately: individual taxpayers in Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace or tolls between home and workplace. | Australia report guidance (PDF stays English). |

## Round 9: tabs

The app now opens on four tabs (Home, Drives, Money, Settings) instead of one long home screen with a menu. The menu’s lines (Menu, Close menu, Free plan, ★ Pro · unlimited drives, Work hours, places and reminders) are gone. “হোম” as in other apps; “বাড়ি” stays for the place.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Home (tab) | হোম | Home | Tab bar label for the first tab. Key is "Home (tab)" so it isn’t the place “Home” (English shows “Home”). Short: under an icon. |
| Drives | ট্রিপ | Trips | Tab bar label: every drive, by month. Same word as the app’s “drives”. |
| Money | টাকা | Money | Tab bar label: the tax year’s money back, month by month, Pro and the tax screens. One short word. |
| Opens the Money tab | টাকা ট্যাব খোলে | Opens the Money tab | VoiceOver hint on home’s green card, which opens the Money tab. |
| To sort | বাছাই বাকি | Sorting left | Home: heading over the drives still to sort as business or personal. |
| All drives sorted ✓ | সব ট্রিপ বাছাই হয়েছে ✓ | All trips sorted ✓ | Home, when nothing is left to sort; the row opens the Drives tab. |
| See all drives › | সব ট্রিপ দেখান › | Show all trips › | Home, next to the line above: opens the Drives tab. Keep the “›”. |
| By month | মাস অনুযায়ী | By month | Money tab: heading over this tax year’s months. |
| Earlier tax years | আগের ট্যাক্স বছর | Previous tax years | Money tab: heading over the years before this one. |
| Tracking | ট্র্যাকিং | Tracking | Settings group heading, small capitals: the tracking check, work hours and places. |
| Driving & tax | ড্রাইভিং ও ট্যাক্স | Driving and tax | Settings group heading: country, vehicles, how drives start, mileage pay, client privacy. |
| Pro & friends | Pro ও বন্ধুরা | Pro and friends | Settings group heading: the Pro plan and inviting friends. |
| Backup & data | ব্যাকআপ ও ডেটা | Backup and data | Settings group heading: iCloud backup and restore. |
| Notifications | নোটিফিকেশন | Notifications | Settings group heading: the Sunday reminder. |
| About & support | অ্যাপ সম্পর্কে ও সাহায্য | About the app and help | Settings group heading: language, the tutorial, help and feedback. |
| Automatic tracking runs on your iPhone. Add a trip from the Drives tab to try the app here. | অটোমেটিক ট্র্যাকিং আপনার iPhone-এ চলে। এখানে অ্যাপটি চেষ্টা করতে ট্রিপ ট্যাব থেকে একটি ট্রিপ যোগ করুন। | Automatic tracking runs on your iPhone. To try the app here, add a trip from the Trips tab. | Web preview only (no tracking there): the + moved from home to the Drives tab. Name the tab as its label is translated. |
| Add a drive you missed | বাদ পড়া ট্রিপ যোগ করুন | Add a missed trip | Drives tab: dashed row under the list, opens Add missed trip. A backup for drives tracking missed. |
| Varies by day | দিন অনুযায়ী আলাদা | Different by day | Settings → Work hours heading, on the right, when the days have different hours (otherwise e.g. "Mon–Fri 09:00–17:00", or Off). |
| Free · {{used}} of {{limit}} | ফ্রি · {{limit}}টির মধ্যে {{used}}টি | Free · {{used}} of {{limit}} | Settings → MileMint Pro heading, on the right: this month’s free work drives used, e.g. "Free · 3 of 40". Short. |
