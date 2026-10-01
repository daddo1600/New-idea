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
